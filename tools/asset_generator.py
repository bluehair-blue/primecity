"""
Prime City Asset Generator
===========================
NAI API를 사용하여 캐릭터별 장면 이미지를 자동 생성합니다.

사전 준비:
  1. python tools/extract_config.py  (config 생성)
  2. tools/asset_config.json 검토
  3. NAI API 토큰 준비

사용법:
  # 전체 생성 (15명 × 74장)
  python tools/asset_generator.py --token YOUR_TOKEN

  # 특정 캐릭터만
  python tools/asset_generator.py --token YOUR_TOKEN --chars SY,NHR

  # 특정 장면 범위만
  python tools/asset_generator.py --token YOUR_TOKEN --chars SY --scenes 1-8

  # 드라이런 (API 호출 없이 프롬프트만 출력)
  python tools/asset_generator.py --dry-run --chars SY --scenes 1-3

  # 진행 상황 확인
  python tools/asset_generator.py --status

  # 실패한 것만 재시도
  python tools/asset_generator.py --token YOUR_TOKEN --retry-failed
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import logging
import os
import random
import re
import shutil
import sys
import time
import zipfile
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from PIL import Image
except ImportError:
    print("pip install requests pillow 필요")
    sys.exit(1)

try:
    from image_metadata_release import save_sanitized_webp
except ImportError:  # imported as tools.asset_generator
    from tools.image_metadata_release import save_sanitized_webp

sys.stdout.reconfigure(encoding="utf-8")

# ── Constants ──
NAI_API_URL = "https://image.novelai.net/ai/generate-image"
TOOLS_DIR = Path(__file__).parent
CONFIG_PATH = TOOLS_DIR / "asset_config.json"
POSE_OVERRIDES_PATH = TOOLS_DIR / "character_pose_overrides.json"
STATE_PATH = TOOLS_DIR / "generation_state.json"
LOG_PATH = TOOLS_DIR / "generation.log"

# Output base: 프로젝트 내부 char_img/ (CDN 구조와 동일)
PROJECT_ROOT = TOOLS_DIR.parent                          # 연예계/
OUTPUT_BASE = PROJECT_ROOT / "char_img"                  # project-root/char_img/
METADATA_BASE = PROJECT_ROOT / "char_img_metadata"       # project-root/char_img_metadata/
METADATA_SCHEMA = "prime-city-asset-prompt-metadata/v1"

# R2 defaults follow AGENTS.md / existing r2_sync scripts.
DEFAULT_R2_BUCKET = "prime"
DEFAULT_R2_IMAGE_PREFIX = "ent"
DEFAULT_R2_METADATA_BUCKET = "prime-metadata"
DEFAULT_R2_METADATA_PREFIX = "ent"
DEFAULT_CLEAN_BLUR_RADIUS = 0.5

# ── Timing ──
DELAY_NORMAL = 1        # 정상 생성 간 대기 (초) — 사용자 요청 2→1
DELAY_COOLDOWN = 1      # 10장마다 추가 쿨다운 — 사용자 요청 10→1
DELAY_429_BASE = 60     # 429 에러 시 기본 대기
DELAY_429_MAX = 300     # 429 최대 대기
MAX_RETRIES = 3         # 일반 에러 재시도 횟수
COOLDOWN_EVERY = 10     # N장마다 쿨다운

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("asset_gen")


@dataclass(frozen=True)
class NaiGenerationResult:
    """Decoded NAI result plus the exact request payload used for sidecar JSON."""

    image: "Image.Image"
    request_payload: dict
    response_files: list[str]
    source_image_sha256: str
    source_image_bytes: int
    source_image_info: dict


@dataclass(frozen=True)
class OutputOptions:
    """Controls final asset materialization and optional R2 upload."""

    clean_blur_radius: float = DEFAULT_CLEAN_BLUR_RADIUS
    r2_upload: bool = False
    r2_dry_run: bool = False
    r2_bucket: str = DEFAULT_R2_BUCKET
    r2_prefix: str = DEFAULT_R2_IMAGE_PREFIX
    r2_metadata_bucket: str = DEFAULT_R2_METADATA_BUCKET
    r2_metadata_prefix: str = DEFAULT_R2_METADATA_PREFIX
    r2_upload_metadata: bool = True


# ═══════════════════════════════════════════════════════
#  Config & State
# ═══════════════════════════════════════════════════════

def load_config() -> dict:
    with CONFIG_PATH.open(encoding="utf-8") as f:
        return json.load(f)


_pose_overrides_cache: dict | None = None


def load_pose_overrides() -> dict:
    """character_pose_overrides.json 로드 (모듈 레벨 캐시). 없으면 빈 dict."""
    global _pose_overrides_cache
    if _pose_overrides_cache is not None:
        return _pose_overrides_cache
    if not POSE_OVERRIDES_PATH.exists():
        _pose_overrides_cache = {}
        return _pose_overrides_cache
    with POSE_OVERRIDES_PATH.open(encoding="utf-8") as f:
        _pose_overrides_cache = json.load(f)
    return _pose_overrides_cache


def resolve_pose_tags(pose_ovr: dict, char_code: str, scene_num: int) -> list[str]:
    """캐릭터 × 씬에 대한 포즈 오버라이드 태그 리스트 해결.

    우선순위:
      1. _scene_to_pose[scene_num] → pose category
      2. _character_archetype[char] → archetype
      3. _archetypes[archetype].poses[pose] → base tags
      4. _character_overrides[char][pose] → char-specific tags (base 뒤에 append)
    """
    if not pose_ovr:
        return []

    pose = pose_ovr.get("_scene_to_pose", {}).get(str(scene_num))
    if not pose:
        return []

    archetype = pose_ovr.get("_character_archetype", {}).get(char_code)
    base_tags: list[str] = []
    if archetype:
        arch_poses = pose_ovr.get("_archetypes", {}).get(archetype, {}).get("poses", {})
        base_tags = list(arch_poses.get(pose, []))

    char_tags = pose_ovr.get("_character_overrides", {}).get(char_code, {}).get(pose, [])
    # _note 같은 메타 키는 리스트가 아니므로 자동 스킵
    if isinstance(char_tags, list):
        base_tags.extend(char_tags)

    return base_tags


def load_state() -> dict:
    if STATE_PATH.exists():
        with STATE_PATH.open(encoding="utf-8") as f:
            state = json.load(f)
        # Migrate failed: list → dict{str_key: reason}
        for code, val in state.get("failed", {}).items():
            if isinstance(val, list):
                state["failed"][code] = {str(s): "unknown (migrated)" for s in val}
        return state
    return {"completed": {}, "failed": {}, "started_at": None, "last_updated": None}


def save_state(state: dict) -> None:
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    tmp = STATE_PATH.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    tmp.replace(STATE_PATH)  # atomic rename (POSIX/NTFS same-filesystem)


def mark_completed(state: dict, char_code: str, scene_num: int) -> None:
    state.setdefault("completed", {}).setdefault(char_code, [])
    if scene_num not in state["completed"][char_code]:
        state["completed"][char_code].append(scene_num)
    # Remove from failed (str key)
    if char_code in state.get("failed", {}):
        state["failed"][char_code].pop(str(scene_num), None)
        if not state["failed"][char_code]:
            del state["failed"][char_code]
    save_state(state)


def mark_failed(state: dict, char_code: str, scene_num: int, reason: str) -> None:
    state.setdefault("failed", {}).setdefault(char_code, {})
    state["failed"][char_code][str(scene_num)] = reason
    save_state(state)


def is_done(state: dict, char_code: str, scene_num: int) -> bool:
    return scene_num in state.get("completed", {}).get(char_code, [])


# ═══════════════════════════════════════════════════════
#  Prompt Construction
# ═══════════════════════════════════════════════════════

def clean_char_prompt(raw: str) -> str:
    """Strip #comments and clean whitespace from character prompt."""
    return ", ".join(
        line.strip()
        for line in raw.replace("\n", ",").split(",")
        if line.strip() and not line.strip().startswith("#")
    )


def is_nsfw_scene(config: dict, scene_num: int) -> bool:
    """Return True if scene is NSFW and should receive the nsfw_suffix.

    Rule:
      - variant == "nude"  (explicit)
      - OR clothed 삽입씬 70~86 (옷은 입었지만 성기 노출/삽입)
    """
    variant = config["scene_variant_map"].get(str(scene_num), "clothed")
    if variant == "nude":
        return True
    return 70 <= scene_num <= 86


def _dedupe_prompt(prompt: str) -> str:
    """콤마로 구분된 프롬프트에서 중복 태그 제거. NAI weight syntax 보존.

    ──────────────────────────────────────────────────────────
    역할: 캐릭터 프롬프트 + 씬 프롬프트 + pose 오버라이드를 순차 조합할 때
    발생하는 중복 태그를 제거하여 토큰 예산을 확보한다.

    왜 필요한가:
      - `cleaned_char` + `female_scene` 단순 문자열 결합 시 중복 체크 없음
      - 캐릭터 프롬프트에 `light smile`이 이미 있는데 씬/오버라이드에서
        또 `light smile`이 나오면 토큰만 낭비되고 가중치만 2배가 됨

    매칭 규칙:
      - weight prefix/suffix 제거 후 소문자로 비교
        → "2::light smile::" == "light smile" == "LIGHT SMILE"
      - 첫 등장 순서 유지 (선등장 우선, 가중치 보존)
      - 캐릭터 프롬프트 → 씬 프롬프트 → pose 순으로 우선됨

    연계: build_prompt() 에서 female_caption / male_caption 최종 조합 시 호출
    ──────────────────────────────────────────────────────────
    """
    if not prompt:
        return prompt
    seen: set[str] = set()
    out: list[str] = []
    for raw in prompt.split(","):
        tag = raw.strip()
        if not tag:
            continue
        # 닫는 :: 토큰 (예: "3::tag1, tag2, ::" 에서 분리된 " ::")
        # 이전 태그에 재연결하여 NAI 가중치 그룹 구조 보존
        if tag == "::":
            if out:
                out[-1] = out[-1] + ", ::"
            continue
        # weight prefix 제거: "2::", "0.6::", "-3::"
        key = re.sub(r"^-?\d+\.?\d*::", "", tag)
        # weight suffix 제거: 끝의 "::"
        key = re.sub(r"::$", "", key).strip().lower()
        if not key:
            continue
        if key in seen:
            continue
        seen.add(key)
        out.append(tag)
    return ", ".join(out)


def build_prompt(config: dict, char_code: str, scene_num: int) -> tuple[str, str, str, str, str, int, int] | None:
    """Build prompts with proper NAI V4 char_captions separation.

    Returns (base_prompt, female_caption, male_caption, female_negative, male_negative, width, height).
    - base_prompt:      global artists + quality → v4_prompt.base_caption
    - female_caption:   character appearance + Female Part → char_captions[0]
    - male_caption:     Male Part (if any) → char_captions[1]
    - female_negative:  character-specific negative → v4_negative_prompt.char_captions[0]
    - male_negative:    currently always empty string (no male-specific negative yet)

    NSFW scenes get base.nsfw_suffix appended to base_prompt.
    """
    base = config["base"]["base_prompt"]
    # NSFW 씬이면 검열 태그 suffix를 base_prompt 최하단에 append
    if is_nsfw_scene(config, scene_num):
        nsfw_suffix = config["base"].get("nsfw_suffix", "")
        if nsfw_suffix:
            base = f"{base.rstrip(', ')}, {nsfw_suffix}"

    char = config["characters"][char_code]
    scene = config["scenes"][str(scene_num)]
    variant_map = config["scene_variant_map"]

    # Determine clothed or nude character prompt
    variant = variant_map.get(str(scene_num), "clothed")
    raw_char = char.get(variant, "") or char.get("clothed", "")
    if variant == "nude" and not char.get("nude"):
        raw_char = char.get("clothed", "")
        log.warning(f"{char_code} has no nude prompt, using clothed for scene {scene_num}")

    cleaned_char = clean_char_prompt(raw_char)

    # Female Part = character appearance + scene-specific female actions
    female_scene = scene.get("female_prompt", "")
    male_caption = scene.get("male_prompt", "")

    # Apply per-character overrides
    overrides = config.get("character_scene_overrides", {}).get(char_code, {})

    # Per-scene override: replace entire female_prompt for this character+scene
    scene_ovr = overrides.get(str(scene_num), {})
    if scene_ovr.get("_skip"):
        return None  # Signal caller to skip this scene
    if scene_ovr.get("female_prompt"):
        female_scene = scene_ovr["female_prompt"]
    if scene_ovr.get("male_prompt") is not None and str(scene_num) in overrides:
        male_caption = scene_ovr.get("male_prompt", male_caption)

    # Global remove_tags (e.g., remove "double v" for NHR/JSH)
    remove_tags = [t for t in overrides.get("remove_tags", []) if t.strip()]
    for tag in remove_tags:
        female_scene = female_scene.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")
        male_caption = male_caption.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")

    # Per-scene append (tags appended AFTER any full override, BEFORE pose tags)
    if scene_ovr.get("append_female"):
        extra = scene_ovr["append_female"]
        female_scene = f"{female_scene.rstrip(', ')}, {extra}" if female_scene else extra
    if scene_ovr.get("append_male"):
        extra = scene_ovr["append_male"]
        male_caption = f"{male_caption.rstrip(', ')}, {extra}" if male_caption else extra

    # Character × pose overrides (archetype base + character-specific)
    # 씬 female_prompt 끝에 append하여 체위 본질 태그 뒤에 성격/포즈 디테일이 오도록 함
    pose_ovr = load_pose_overrides()
    pose_tags = resolve_pose_tags(pose_ovr, char_code, scene_num)
    if pose_tags:
        # 씬에 이미 있는 토큰은 중복 제거
        existing = {t.strip() for t in female_scene.split(",")}
        new_tags = [t for t in pose_tags if t.strip() not in existing]
        if new_tags:
            if female_scene:
                female_scene = f"{female_scene.rstrip(', ')}, " + ", ".join(new_tags)
            else:
                female_scene = ", ".join(new_tags)

    female_caption = f"{cleaned_char}, {female_scene}" if female_scene else cleaned_char

    # Scene-level remove_tags (씬 단위 blacklist — pose 태그 적용 이후 적용됨)
    # 예: scene 80/81 에서 'face in pillow' 제거 (toilet 문맥 부조화 방지)
    scene_remove = [t for t in scene.get("remove_tags", []) if t.strip()]
    for tag in scene_remove:
        female_caption = female_caption.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")
        male_caption = male_caption.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")

    # 최종 중복 제거 — 캐릭터/씬/오버라이드/pose 조합 후 동일 태그 병합
    # (선등장 우선, 가중치 있는 버전이 나중에 나와도 첫 등장 유지)
    female_caption = _dedupe_prompt(female_caption)
    if male_caption:
        male_caption = _dedupe_prompt(male_caption)

    # 캐릭터별 네거티브 (NAI v4 char_captions 네거티브 슬롯)
    female_negative = char.get("negative", "") or ""
    male_negative = ""  # male은 현재 별도 캐릭터 엔트리가 없어 전역 네거티브에 의존

    return base, female_caption, male_caption, female_negative, male_negative, scene["width"], scene["height"]


# ═══════════════════════════════════════════════════════
#  NAI API Call
# ═══════════════════════════════════════════════════════

def build_nai_payload(base_prompt: str, female_caption: str, male_caption: str,
                      negative: str, female_negative: str, male_negative: str,
                      width: int, height: int, seed: int | None) -> dict:
    """Build the exact NAI v4 request payload.

    NAI V4 prompt structure:
    - base_caption:                global (artists + quality) → base_prompt
    - char_captions[0]:            female character appearance + Female Part → female_caption
    - char_captions[1]:            Male Part (if present) → male_caption
    - neg base_caption:            global negative
    - neg char_captions[0]:        female character-specific negative → female_negative
    - neg char_captions[1]:        male character-specific negative → male_negative

    centers 는 use_coords=False 여도 각 char_caption 에 포함한다.
    """
    # NAID4/4.5 expects centers on each char_caption even when use_coords is
    # false. Omitting it returns HTTP 500 from the image API.
    default_center = [{"x": 0.5, "y": 0.5}]
    char_captions = []
    neg_char_captions = []
    if female_caption:
        char_captions.append({"char_caption": female_caption, "centers": default_center})
        neg_char_captions.append({"char_caption": female_negative, "centers": default_center})
    if male_caption:
        char_captions.append({"char_caption": male_caption, "centers": default_center})
        neg_char_captions.append({"char_caption": male_negative, "centers": default_center})

    return {
        "input": base_prompt,
        "model": "nai-diffusion-4-5-full",
        "action": "generate",
        "parameters": {
            # ── Fixed generation settings (from parameters.json) ──
            "width": width,
            "height": height,
            "n_samples": 1,
            "steps": 28,
            "scale": 7.2,                       # CFG scale (parameters.json)
            "uncond_scale": 0.0,
            "cfg_rescale": 0.1,                  # user setting
            "sampler": "k_euler",                # parameters.json
            "noise_schedule": "karras",          # parameters.json scheduler
            # ── Seed (random each time, never fixed) ──
            "seed": seed,
            "extra_noise_seed": seed,
            # ── Prompts ──
            "negative_prompt": negative,
            # ── Model behavior flags (from NAI metadata, locked) ──
            "params_version": 3,
            "legacy": False,
            "legacy_v3_extend": False,
            "add_original_image": True,
            "prefer_brownian": True,
            "deliberate_euler_ancestral_bug": True,
            "dynamic_thresholding": False,
            "dynamic_thresholding_percentile": 0.999,
            "dynamic_thresholding_mimic_scale": 10.0,
            "sm": False,                         # SMEA off
            "sm_dyn": False,                     # DYN off
            "skip_cfg_above_sigma": 58.0,        # VAR+ enabled
            "skip_cfg_below_sigma": 0.0,
            "ucPreset": 0,
            "use_coords": False,
            "cfg_sched_eligibility": "enable_for_post_summer_samplers",
            "explike_fine_detail": False,
            "minimize_sigma_inf": False,
            "uncond_per_vibe": True,
            "wonky_vibe_correlation": True,
            # ── Unused features (null/empty, locked) ──
            "controlnet_strength": None,
            "controlnet_model": None,
            "lora_unet_weights": None,
            "lora_clip_weights": None,
            "reference_information_extracted_multiple": [],
            "reference_strength_multiple": [],
            # ── V4 prompt structure ──
            # base_caption = global (artists + quality + scene)
            # char_captions = character appearance (separate slot)
            "v4_prompt": {
                "caption": {
                    "base_caption": base_prompt,
                    "char_captions": char_captions,
                },
                "use_coords": False,
                "use_order": True,
                "legacy_uc": False,
            },
            "v4_negative_prompt": {
                "caption": {
                    "base_caption": negative,
                    "char_captions": neg_char_captions,
                },
                "use_coords": False,
                "use_order": False,
                "legacy_uc": False,
            },
            "request_type": "PromptGenerateRequest",
        },
    }


def call_nai_api(token: str, base_prompt: str, female_caption: str, male_caption: str,
                 negative: str, female_negative: str, male_negative: str,
                 width: int, height: int) -> NaiGenerationResult:
    """Call NAI image generation API. Returns decoded image and request metadata."""
    seed = random.randint(0, 2**32 - 1)  # noqa: S311  (image seed, not crypto)
    payload = build_nai_payload(
        base_prompt, female_caption, male_caption, negative,
        female_negative, male_negative, width, height, seed,
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/x-zip-compressed",
    }

    resp = requests.post(NAI_API_URL, json=payload, headers=headers, timeout=120)

    if resp.status_code == 429:
        raise RateLimitError("429 Too Many Requests")
    if resp.status_code == 403:
        raise AccountBannedError("403 Forbidden — 계정 영구 제한 위험. 즉시 중단.")
    if resp.status_code == 401:
        raise AuthError("401 Unauthorized — 토큰이 만료되었거나 잘못되었습니다.")
    if resp.status_code != 200:
        raise APIError(f"HTTP {resp.status_code}: {resp.text[:200]}")

    # Response is a ZIP containing the image
    try:
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            names = zf.namelist()
            if not names:
                raise APIError("API returned an empty ZIP archive")
            img_data = zf.read(names[0])
            img = Image.open(io.BytesIO(img_data))
            img.load()
            return NaiGenerationResult(
                image=img,
                request_payload=payload,
                response_files=names,
                source_image_sha256=hashlib.sha256(img_data).hexdigest(),
                source_image_bytes=len(img_data),
                source_image_info=summarize_pil_info(img.info),
            )
    except (zipfile.BadZipFile, KeyError, OSError) as e:
        raise APIError(f"Failed to decode image: {e}") from e


class RateLimitError(Exception):
    pass

class AccountBannedError(Exception):
    pass

class AuthError(Exception):
    pass

class APIError(Exception):
    pass

class R2UploadError(Exception):
    pass


# ═══════════════════════════════════════════════════════
#  Output Pipeline: clean image, sidecar metadata, optional R2 upload
# ═══════════════════════════════════════════════════════

def resolve_output_path(char_code: str, scene_num: int, config: dict | None = None) -> Path:
    """Resolve the local CDN-style image path for normal and special scenes."""
    custom_path = None
    if config and str(scene_num) in config.get("scenes", {}):
        custom_path = config["scenes"][str(scene_num)].get("output_path")

    if custom_path:
        resolved = custom_path.replace("{code}", char_code)
        return OUTPUT_BASE / char_code / resolved
    return OUTPUT_BASE / char_code / f"{scene_num}.webp"


def resolve_metadata_path(image_path: Path) -> Path:
    """Map char_img/{rel}.webp to char_img_metadata/{rel}.json."""
    rel = image_path.relative_to(OUTPUT_BASE)
    return METADATA_BASE / rel.with_suffix(".json")


def _r2_prefix(prefix: str) -> str:
    return prefix.strip("/")


def r2_object_key(prefix: str, rel_path: str) -> str:
    prefix = _r2_prefix(prefix)
    rel_path = rel_path.replace("\\", "/").lstrip("/")
    return f"{prefix}/{rel_path}" if prefix else rel_path


def summarize_pil_info(info: dict) -> dict:
    """JSON-safe summary of source image info without embedding binary chunks."""
    out = {}
    for key, value in info.items():
        if isinstance(value, bytes):
            out[key] = {
                "type": "bytes",
                "length": len(value),
                "sha256": hashlib.sha256(value).hexdigest(),
            }
        elif isinstance(value, (str, int, float, bool)) or value is None:
            out[key] = value
        else:
            out[key] = repr(value)
    return out


def save_release_webp(img: "Image.Image", out_path: Path, blur_radius: float) -> None:
    """Write a deep-cleaned WebP with the canonical bluehair.blue rights XMP."""
    save_sanitized_webp(img, out_path, blur_radius)


def build_generation_metadata(config: dict, char_code: str, scene_num: int,
                              prompt_parts: tuple[str, str, str, str, str, int, int],
                              output_options: OutputOptions, image_path: Path,
                              metadata_path: Path, request_payload: dict,
                              source: str,
                              result: NaiGenerationResult | None = None) -> dict:
    """Create a sidecar JSON payload containing prompts and generation settings."""
    base_prompt, female_cap, male_cap, female_neg, male_neg, width, height = prompt_parts
    scene = config["scenes"][str(scene_num)]
    char = config["characters"][char_code]
    variant = config.get("scene_variant_map", {}).get(str(scene_num), "clothed")
    image_rel = image_path.relative_to(OUTPUT_BASE).as_posix()
    metadata_rel = metadata_path.relative_to(METADATA_BASE).as_posix()
    image_key = r2_object_key(output_options.r2_prefix, image_rel)
    metadata_key = r2_object_key(output_options.r2_metadata_prefix, metadata_rel)

    metadata = {
        "schema": METADATA_SCHEMA,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "character": {"code": char_code, "name": char.get("name")},
        "scene": {
            "number": scene_num,
            "name": scene.get("name"),
            "variant": variant,
            "width": width,
            "height": height,
            "output_path": scene.get("output_path"),
        },
        "image": {
            "relative_path": image_rel,
            "local_path": str(image_path),
            "format": "image/webp",
            "metadata_stripped": True,
            "stealth_pnginfo_mitigation": {
                "alpha_background": "#000000",
                "gaussian_blur_radius": output_options.clean_blur_radius,
            },
        },
        "sidecar": {
            "relative_path": metadata_rel,
            "local_path": str(metadata_path),
        },
        "r2": {
            "image_bucket": output_options.r2_bucket,
            "metadata_bucket": output_options.r2_metadata_bucket,
            "image_key": image_key,
            "metadata_key": metadata_key,
            "image_target": f"{output_options.r2_bucket}/{image_key}",
            "metadata_target": f"{output_options.r2_metadata_bucket}/{metadata_key}",
            "metadata_public": False,
        },
        "prompts": {
            "base_prompt": base_prompt,
            "female_caption": female_cap,
            "male_caption": male_cap,
            "negative_prompt": config["base"]["negative_prompt"],
            "female_negative": female_neg,
            "male_negative": male_neg,
            "char_caption_centers": [{"x": 0.5, "y": 0.5}],
        },
        "nai_request_payload": request_payload,
    }
    if result is not None:
        metadata["source_image"] = {
            "response_files": result.response_files,
            "bytes": result.source_image_bytes,
            "sha256": result.source_image_sha256,
            "pil_info": result.source_image_info,
        }
    else:
        metadata["source_image"] = {
            "reconstructed_from_config": True,
            "note": "Original random seed and original response bytes are unavailable for pre-existing local images.",
        }
    return metadata


def save_generation_metadata(metadata_path: Path, metadata: dict) -> None:
    metadata_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = metadata_path.with_name(f"{metadata_path.stem}.tmp{metadata_path.suffix}")
    tmp.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(metadata_path)


_WRANGLER_BIN: str | None = None


def find_wrangler() -> str:
    """Find project-local wrangler first, matching existing R2 sync scripts."""
    global _WRANGLER_BIN
    if _WRANGLER_BIN:
        return _WRANGLER_BIN
    local_dir = PROJECT_ROOT / "node_modules" / ".bin"
    for candidate in [local_dir / "wrangler.cmd", local_dir / "wrangler"]:
        if candidate.exists():
            _WRANGLER_BIN = str(candidate)
            return _WRANGLER_BIN
    fallback = shutil.which("wrangler") or shutil.which("wrangler.cmd")
    if fallback:
        _WRANGLER_BIN = fallback
        return _WRANGLER_BIN
    raise R2UploadError("wrangler not found. Run npm install in the project root or install wrangler.")


def upload_file_to_r2(local_path: Path, bucket: str, object_key: str,
                      content_type: str, dry_run: bool = False) -> None:
    target = f"{bucket}/{object_key}"
    if dry_run:
        log.info(f"  DRY R2: {target} ← {local_path}")
        return
    cmd = [
        find_wrangler(), "r2", "object", "put", target,
        "--file", str(local_path),
        "--content-type", content_type,
        "--remote",
    ]
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=180,
    )
    if proc.returncode != 0:
        out = (proc.stdout or "") + (proc.stderr or "")
        last = out.strip().splitlines()[-1] if out.strip() else f"exit {proc.returncode}"
        raise R2UploadError(f"{target}: {last}")
    log.info(f"  Uploaded R2: {target}")


def upload_asset_bundle(image_path: Path, metadata_path: Path,
                        output_options: OutputOptions) -> None:
    image_rel = image_path.relative_to(OUTPUT_BASE).as_posix()
    metadata_rel = metadata_path.relative_to(METADATA_BASE).as_posix()
    image_key = r2_object_key(output_options.r2_prefix, image_rel)
    metadata_key = r2_object_key(output_options.r2_metadata_prefix, metadata_rel)
    upload_file_to_r2(
        image_path, output_options.r2_bucket, image_key,
        "image/webp", output_options.r2_dry_run,
    )
    if output_options.r2_upload_metadata:
        upload_file_to_r2(
            metadata_path, output_options.r2_metadata_bucket, metadata_key,
            "application/json", output_options.r2_dry_run,
        )

def save_image(img: "Image.Image", char_code: str, scene_num: int,
               config: dict | None = None,
               blur_radius: float = DEFAULT_CLEAN_BLUR_RADIUS) -> Path:
    """Save as WebP in the CDN-matching folder structure.

    Special assets (900+) use custom output_path from config.
    Final files are flattened/re-encoded and stripped before publication.
    """
    out_path = resolve_output_path(char_code, scene_num, config)
    save_release_webp(img, out_path, blur_radius)
    log.info(f"  Saved: {out_path.relative_to(OUTPUT_BASE)}")
    return out_path


def save_image_png(img: "Image.Image", char_code: str, scene_num: int) -> Path:
    """Save as PNG for metadata comparison."""
    out_dir = OUTPUT_BASE / char_code
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{scene_num}_test.png"
    img.save(out_path, "PNG")
    log.info(f"  Saved PNG: {out_path.relative_to(OUTPUT_BASE)}")
    return out_path


# ═══════════════════════════════════════════════════════
#  Generation Loop
# ═══════════════════════════════════════════════════════

def _generate_one(token: str, config: dict, state: dict,
                  char_code: str, scene_num: int, negative: str,
                  output_options: OutputOptions) -> bool:
    """Single image generation with retry. Returns True on success.

    AccountBannedError/AuthError/KeyboardInterrupt propagate to caller.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            scene_name = config["scenes"][str(scene_num)]["name"]
            prompt_parts = build_prompt(config, char_code, scene_num)
            if prompt_parts is None:
                log.info(f"  Skipped {char_code}/{scene_num} (override _skip)")
                mark_completed(state, char_code, scene_num)
                return True
            base_prompt, female_cap, male_cap, female_neg, male_neg, w, h = prompt_parts
            log.info(f"  Generating {char_code}/{scene_num}.webp ({scene_name}) (attempt {attempt})")

            nai_result = call_nai_api(token, base_prompt, female_cap, male_cap, negative,
                                      female_neg, male_neg, w, h)
            image_path = save_image(nai_result.image, char_code, scene_num, config,
                                    output_options.clean_blur_radius)
            metadata_path = resolve_metadata_path(image_path)
            metadata = build_generation_metadata(
                config, char_code, scene_num, prompt_parts, output_options,
                image_path, metadata_path, nai_result.request_payload,
                source="generated", result=nai_result,
            )
            save_generation_metadata(metadata_path, metadata)
            log.info(f"  Saved metadata: {metadata_path.relative_to(METADATA_BASE)}")
            if output_options.r2_upload:
                upload_asset_bundle(image_path, metadata_path, output_options)
            mark_completed(state, char_code, scene_num)
            return True

        except RateLimitError:
            wait = min(DELAY_429_BASE * (2 ** (attempt - 1)), DELAY_429_MAX)
            log.warning(f"  ⚠ 429 Rate Limit. {wait}초 대기...")
            time.sleep(wait)

        except (APIError, R2UploadError, requests.RequestException) as e:
            log.exception(f"  ✖ Attempt {attempt}/{MAX_RETRIES}")
            if attempt < MAX_RETRIES:
                time.sleep(30)
            else:
                mark_failed(state, char_code, scene_num, str(e))
                return False
    return False


def generate_batch(token, config, state, char_codes=None, scene_nums=None,
                   retry_tasks=None, dry_run=False, delay=DELAY_NORMAL,
                   output_options: OutputOptions | None = None):
    """Main generation loop.

    Args:
        retry_tasks: list of (char_code, scene_num) tuples for explicit retry.
                     If given, char_codes/scene_nums are ignored.
    """
    # Path validation — only when actual I/O is needed
    if not dry_run and not OUTPUT_BASE.exists():
        log.error(f"Image directory not found: {OUTPUT_BASE.resolve()}")
        sys.exit(1)

    negative = config["base"]["negative_prompt"]
    output_options = output_options or OutputOptions()

    # Build task list
    if retry_tasks:
        tasks = retry_tasks
    else:
        tasks = [(c, s) for c in (char_codes or []) for s in (scene_nums or [])]
    total = len(tasks)
    done = 0
    api_calls_since_cooldown = 0

    if not state.get("started_at"):
        state["started_at"] = datetime.now(timezone.utc).isoformat()
        save_state(state)

    log.info(f"═══ Generation Start: {total} tasks ═══")

    for char_code, scene_num in tasks:
        if char_code not in config["characters"]:
            log.error(f"Character {char_code} not found in config, skipping")
            continue

        scene_key = str(scene_num)
        if scene_key not in config["scenes"]:
            log.warning(f"  Scene {scene_num} not in config, skipping")
            continue

        done += 1

        if is_done(state, char_code, scene_num):
            log.info(f"  [{done}/{total}] Scene {scene_num} already done, skipping")
            continue

        if dry_run:
            scene_name = config["scenes"][scene_key]["name"]
            result = build_prompt(config, char_code, scene_num)
            if result is None:
                log.info(f"  [{done}/{total}] DRY-RUN {char_code}/{scene_num} — SKIPPED (override)")
                continue
            base_prompt, female_cap, male_cap, female_neg, male_neg, w, h = result
            log.info(f"  [{done}/{total}] DRY-RUN {char_code}/{scene_num} ({scene_name}) {w}×{h}")
            log.info(f"    base:    {base_prompt[:80]}...")
            log.info(f"    female:  {female_cap[:80]}...")
            log.info(f"    male:    {male_cap or '(none)'}")
            log.info(f"    f_neg:   {female_neg or '(none)'}")
            continue

        log.info(f"  [{done}/{total}]")
        try:
            success = _generate_one(token, config, state, char_code, scene_num,
                                    negative, output_options)
        except AccountBannedError as e:
            log.critical(f"  ✖ {e}")
            log.critical("  즉시 중단합니다. NAI 계정을 확인하세요.")
            mark_failed(state, char_code, scene_num, str(e))
            save_state(state)
            return
        except AuthError as e:
            log.exception("  ✖ AuthError")
            log.error("  토큰을 갱신한 뒤 --retry-failed로 재실행하세요.")
            mark_failed(state, char_code, scene_num, str(e))
            save_state(state)
            return
        except KeyboardInterrupt:
            log.info("\n  사용자 중단 (Ctrl+C). 진행 상태가 저장되었습니다.")
            save_state(state)
            return

        if not success:
            log.error(f"  ✖ {char_code}/{scene_num} failed after {MAX_RETRIES} retries")
            continue

        # ── Delay (API 호출 성공 기준 쿨다운) ──
        api_calls_since_cooldown += 1
        if api_calls_since_cooldown >= COOLDOWN_EVERY:
            log.info(f"  ⏳ {COOLDOWN_EVERY}장 API 호출, {DELAY_COOLDOWN}초 쿨다운...")
            time.sleep(DELAY_COOLDOWN)
            api_calls_since_cooldown = 0
        else:
            time.sleep(delay)

    # ── Summary ──
    completed_total = sum(len(v) for v in state.get("completed", {}).values())
    failed_total = sum(len(v) for v in state.get("failed", {}).values())
    log.info(f"\n═══ 완료: {completed_total}장 성공, {failed_total}장 실패 ═══")


def _publish_existing_one(config: dict, char_code: str, scene_num: int,
                          negative: str, output_options: OutputOptions) -> bool:
    """Clean an existing local asset, write sidecar JSON, and optionally upload."""
    prompt_parts = build_prompt(config, char_code, scene_num)
    if prompt_parts is None:
        log.info(f"  Skipped {char_code}/{scene_num} (override _skip)")
        return True

    base_prompt, female_cap, male_cap, female_neg, male_neg, width, height = prompt_parts
    image_path = resolve_output_path(char_code, scene_num, config)
    if not image_path.exists():
        log.error(f"  ✖ Missing local image: {image_path}")
        return False

    request_payload = build_nai_payload(
        base_prompt, female_cap, male_cap, negative,
        female_neg, male_neg, width, height, seed=None,
    )

    with Image.open(image_path) as src_img:
        src_img.load()
        img = src_img.copy()
    save_image(img, char_code, scene_num, config, output_options.clean_blur_radius)

    metadata_path = resolve_metadata_path(image_path)
    metadata = build_generation_metadata(
        config, char_code, scene_num, prompt_parts, output_options,
        image_path, metadata_path, request_payload,
        source="reconstructed_existing", result=None,
    )
    save_generation_metadata(metadata_path, metadata)
    log.info(f"  Saved metadata: {metadata_path.relative_to(METADATA_BASE)}")
    if output_options.r2_upload:
        upload_asset_bundle(image_path, metadata_path, output_options)
    return True


def publish_existing_batch(config: dict, state: dict, char_codes=None, scene_nums=None,
                           retry_tasks=None, dry_run=False,
                           output_options: OutputOptions | None = None) -> None:
    """Post-process already completed local assets without calling NAI."""
    if not dry_run and not OUTPUT_BASE.exists():
        log.error(f"Image directory not found: {OUTPUT_BASE.resolve()}")
        sys.exit(1)

    negative = config["base"]["negative_prompt"]
    output_options = output_options or OutputOptions()

    if retry_tasks:
        tasks = retry_tasks
    else:
        tasks = [(c, s) for c in (char_codes or []) for s in (scene_nums or [])]

    total = len(tasks)
    ok = 0
    fail = 0
    log.info(f"═══ Publish Existing Start: {total} tasks ═══")
    for idx, (char_code, scene_num) in enumerate(tasks, start=1):
        if char_code not in config["characters"]:
            log.error(f"Character {char_code} not found in config, skipping")
            fail += 1
            continue
        if str(scene_num) not in config["scenes"]:
            log.warning(f"  Scene {scene_num} not in config, skipping")
            continue
        if not is_done(state, char_code, scene_num):
            log.info(f"  [{idx}/{total}] {char_code}/{scene_num} not completed in state, skipping")
            continue

        image_path = resolve_output_path(char_code, scene_num, config)
        metadata_path = resolve_metadata_path(image_path)
        if dry_run:
            image_rel = image_path.relative_to(OUTPUT_BASE).as_posix()
            meta_rel = metadata_path.relative_to(METADATA_BASE).as_posix()
            log.info(
                f"  [{idx}/{total}] DRY publish {char_code}/{scene_num} "
                f"image={image_rel} metadata={meta_rel}"
            )
            if output_options.r2_upload:
                log.info(f"    DRY R2 image: {output_options.r2_bucket}/{r2_object_key(output_options.r2_prefix, image_rel)}")
                if output_options.r2_upload_metadata:
                    log.info(f"    DRY R2 metadata: {output_options.r2_metadata_bucket}/{r2_object_key(output_options.r2_metadata_prefix, meta_rel)}")
            ok += 1
            continue

        log.info(f"  [{idx}/{total}] Publishing {char_code}/{scene_num}")
        try:
            if _publish_existing_one(config, char_code, scene_num, negative, output_options):
                ok += 1
            else:
                fail += 1
        except (OSError, R2UploadError) as e:
            fail += 1
            log.exception(f"  ✖ Publish failed: {char_code}/{scene_num} — {e}")

    log.info(f"\n═══ publish-existing 완료: {ok}장 처리, {fail}장 실패 ═══")


# ═══════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════

from utils import ALL_CHARS, ALL_SCENES, SPECIAL_SCENES, parse_scene_range  # noqa: E402


def show_status():
    state = load_state()
    config = load_config()
    all_scenes_set = set(ALL_SCENES)
    total_possible = len(ALL_CHARS) * len(ALL_SCENES)

    # Count only ALL_SCENES range (exclude special scenes like 901+)
    completed_total = sum(
        len([s for s in v if s in all_scenes_set])
        for v in state.get("completed", {}).values()
    )
    failed_total = sum(
        len([k for k in v if int(k) in all_scenes_set])
        if isinstance(v, dict)
        else len([s for s in v if s in all_scenes_set])
        for v in state.get("failed", {}).values()
    )
    special_total = sum(
        len([s for s in v if s not in all_scenes_set])
        for v in state.get("completed", {}).values()
    )
    pct = completed_total * 100 // total_possible if total_possible else 0

    print(f"\n{'═' * 50}")
    print("  Asset Generation Status")
    print(f"{'═' * 50}")
    print(f"  Started:   {state.get('started_at', 'N/A')}")
    print(f"  Updated:   {state.get('last_updated', 'N/A')}")
    print(f"  Progress:  {completed_total}/{total_possible} ({pct}%)")
    print(f"  Failed:    {failed_total}")
    if special_total:
        print(f"  Special:   {special_total} (SVG/key visual/thumbnail)")
    print()

    for code in ALL_CHARS:
        completed = state.get("completed", {}).get(code, [])
        failed_items = state.get("failed", {}).get(code, {})
        done_count = len([s for s in completed if s in all_scenes_set])
        fail_count = (
            len([k for k in failed_items if int(k) in all_scenes_set])
            if isinstance(failed_items, dict)
            else len([s for s in failed_items if s in all_scenes_set])
        )
        bar_len = 20
        filled = done_count * bar_len // len(ALL_SCENES) if ALL_SCENES else 0
        bar = "█" * filled + "░" * (bar_len - filled)
        name = config["characters"].get(code, {}).get("name", "?")
        status = f"  {code:4} {name:8} [{bar}] {done_count:2}/{len(ALL_SCENES)}"
        if fail_count:
            status += f" ({fail_count} failed)"
        print(status)

    print()


def main():
    parser = argparse.ArgumentParser(description="Prime City Asset Generator")
    parser.add_argument("--token", help="NAI API Bearer token")
    parser.add_argument("--token-file", help="File containing NAI token")
    parser.add_argument("--chars", help="Comma-separated char codes (default: all)", default=None)
    parser.add_argument("--scenes", help="Scene range, e.g. '1-8' or '1-8,20-42'", default=None)
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without API calls")
    parser.add_argument("--status", action="store_true", help="Show generation progress")
    parser.add_argument("--retry-failed", action="store_true", help="Retry only failed items")
    parser.add_argument("--publish-existing", action="store_true",
                        help="Legacy pre-release path; use image_metadata_release.py after a v2 manifest exists")
    parser.add_argument("--include-special", action="store_true",
                        help=f"Also queue SPECIAL_SCENES ({SPECIAL_SCENES}) — opt-in for the 901+ series.")
    parser.add_argument("--delay", type=float, default=DELAY_NORMAL, help=f"Delay between generations in seconds (default: {DELAY_NORMAL}s, min: 1s)")
    parser.add_argument("--clean-blur-radius", type=float, default=DEFAULT_CLEAN_BLUR_RADIUS,
                        help=f"Gaussian blur radius for stealth pnginfo mitigation (default: {DEFAULT_CLEAN_BLUR_RADIUS}; 0 disables blur)")
    parser.add_argument("--r2-upload", action="store_true",
                        help="Upload cleaned image and prompt metadata JSON to Cloudflare R2 after save")
    parser.add_argument("--r2-dry-run", action="store_true",
                        help="Print R2 upload targets without executing wrangler; implies --r2-upload")
    parser.add_argument("--r2-bucket", default=DEFAULT_R2_BUCKET,
                        help=f"Cloudflare R2 bucket name (default: {DEFAULT_R2_BUCKET})")
    parser.add_argument("--r2-prefix", default=DEFAULT_R2_IMAGE_PREFIX,
                        help=f"R2 image key prefix (default: {DEFAULT_R2_IMAGE_PREFIX})")
    parser.add_argument("--r2-metadata-bucket", default=DEFAULT_R2_METADATA_BUCKET,
                        help=f"Private R2 metadata bucket (default: {DEFAULT_R2_METADATA_BUCKET})")
    parser.add_argument("--r2-metadata-prefix", default=DEFAULT_R2_METADATA_PREFIX,
                        help=f"R2 prompt metadata JSON key prefix (default: {DEFAULT_R2_METADATA_PREFIX})")
    parser.add_argument("--no-r2-metadata", action="store_true",
                        help="When uploading images to R2, do not upload prompt metadata JSON sidecars")
    args = parser.parse_args()

    if (args.publish_existing and not args.dry_run
            and (METADATA_BASE / "_manifest.after.json").exists()):
        parser.error(
            "--publish-existing is disabled after a v2 release to prevent cumulative blur; "
            "use `py tools/image_metadata_release.py release` instead"
        )

    if args.status:
        show_status()
        return

    config = load_config()
    state = load_state()
    output_options = OutputOptions(
        clean_blur_radius=max(0.0, args.clean_blur_radius),
        r2_upload=bool(args.r2_upload or args.r2_dry_run),
        r2_dry_run=bool(args.r2_dry_run),
        r2_bucket=args.r2_bucket,
        r2_prefix=args.r2_prefix,
        r2_metadata_bucket=args.r2_metadata_bucket,
        r2_metadata_prefix=args.r2_metadata_prefix,
        r2_upload_metadata=not args.no_r2_metadata,
    )

    # Determine characters
    if args.chars:
        char_codes = [c.strip().upper() for c in args.chars.split(",")]
    else:
        char_codes = ALL_CHARS

    # Get token (priority: --token > --token-file > NAI_TOKEN env)
    token = args.token
    if not token and args.token_file:
        token = Path(args.token_file).read_text(encoding="utf-8-sig").strip()
    if not token:
        token = os.environ.get("NAI_TOKEN")

    delay = max(1.0, args.delay)  # Minimum 1 second (NAI rate limit)

    # Determine scenes & dispatch
    if args.retry_failed:
        failed = state.get("failed", {})
        retry_tasks = []
        for fc, scenes in failed.items():
            if args.chars and fc not in char_codes:
                continue
            scene_keys = scenes if isinstance(scenes, list) else scenes.keys()
            for sk in scene_keys:
                retry_tasks.append((fc, int(sk)))
        if not retry_tasks:
            log.info("No failed items to retry. All clear!")
            return
        log.info(f"Retrying {len(retry_tasks)} failed tasks")
        if args.publish_existing:
            publish_existing_batch(config, state, retry_tasks=retry_tasks,
                                   dry_run=args.dry_run, output_options=output_options)
        else:
            generate_batch(token, config, state, retry_tasks=retry_tasks,
                           dry_run=args.dry_run, delay=delay,
                           output_options=output_options)
    else:
        if args.scenes:
            scene_nums = parse_scene_range(args.scenes)
        else:
            scene_nums = list(ALL_SCENES)
            if args.include_special:
                scene_nums = scene_nums + list(SPECIAL_SCENES)

        if args.publish_existing:
            publish_existing_batch(config, state, char_codes=char_codes,
                                   scene_nums=scene_nums, dry_run=args.dry_run,
                                   output_options=output_options)
            return

        if not token and not args.dry_run:
            print("ERROR: --token, --token-file, or NAI_TOKEN env required (or use --dry-run)")
            return

        generate_batch(token, config, state, char_codes=char_codes,
                       scene_nums=scene_nums, dry_run=args.dry_run, delay=delay,
                       output_options=output_options)


if __name__ == "__main__":
    main()
