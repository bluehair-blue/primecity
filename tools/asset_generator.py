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
import io
import json
import logging
import os
import random
import sys
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from PIL import Image
except ImportError:
    print("pip install requests pillow 필요")
    sys.exit(1)

sys.stdout.reconfigure(encoding="utf-8")

# ── Constants ──
NAI_API_URL = "https://image.novelai.net/ai/generate-image"
TOOLS_DIR = Path(__file__).parent
CONFIG_PATH = TOOLS_DIR / "asset_config.json"
STATE_PATH = TOOLS_DIR / "generation_state.json"
LOG_PATH = TOOLS_DIR / "generation.log"

# Output base: 프로젝트 내부 char_img/ (CDN 구조와 동일)
PROJECT_ROOT = TOOLS_DIR.parent                          # 연예계/
OUTPUT_BASE = PROJECT_ROOT / "char_img"                  # 연예계/char_img/

# ── Timing ──
DELAY_NORMAL = 12       # 정상 생성 간 대기 (초, 최소 1초 필수)
DELAY_COOLDOWN = 30     # 10장마다 추가 쿨다운
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


# ═══════════════════════════════════════════════════════
#  Config & State
# ═══════════════════════════════════════════════════════

def load_config() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_state() -> dict:
    if STATE_PATH.exists():
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            state = json.load(f)
        # Migrate failed: list → dict{str_key: reason}
        for code, val in state.get("failed", {}).items():
            if isinstance(val, list):
                state["failed"][code] = {str(s): "unknown (migrated)" for s in val}
        return state
    return {"completed": {}, "failed": {}, "started_at": None, "last_updated": None}


def save_state(state: dict) -> None:
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


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


def build_prompt(config: dict, char_code: str, scene_num: int) -> tuple[str, str, str, int, int]:
    """Build prompts with proper NAI V4 char_captions separation.

    Returns (base_prompt, female_caption, male_caption, width, height).
    - base_prompt:    global artists + quality → v4_prompt.base_caption
    - female_caption: character appearance + Female Part → char_captions[0]
    - male_caption:   Male Part (if any) → char_captions[1]
    """
    base = config["base"]["base_prompt"]
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
    remove_tags = overrides.get("remove_tags", [])
    for tag in remove_tags:
        female_scene = female_scene.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")
        male_caption = male_caption.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")

    female_caption = f"{cleaned_char}, {female_scene}" if female_scene else cleaned_char

    return base, female_caption, male_caption, scene["width"], scene["height"]


# ═══════════════════════════════════════════════════════
#  NAI API Call
# ═══════════════════════════════════════════════════════

def call_nai_api(token: str, base_prompt: str, female_caption: str, male_caption: str,
                 negative: str, width: int, height: int) -> "Image.Image":
    """Call NAI image generation API. Returns PIL Image or raises.

    NAI V4 prompt structure:
    - base_caption:      global (artists + quality) → base_prompt
    - char_captions[0]:  female character appearance + Female Part actions → female_caption
    - char_captions[1]:  Male Part (if present) → male_caption
    """
    seed = random.randint(0, 2**32 - 1)

    # Build char_captions: female always present, male only when needed
    char_captions = []
    if female_caption:
        char_captions.append({
            "char_caption": female_caption,
            "centers": [{"x": 0.5, "y": 0.5}],
        })
    if male_caption:
        char_captions.append({
            "char_caption": male_caption,
            "centers": [{"x": 0.5, "y": 0.5}],
        })

    payload = {
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
                    "char_captions": [],
                },
                "use_coords": False,
                "use_order": False,
                "legacy_uc": False,
            },
            "request_type": "PromptGenerateRequest",
        },
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/x-zip-compressed",
    }

    resp = requests.post(NAI_API_URL, json=payload, headers=headers, timeout=120)

    if resp.status_code == 429:
        raise RateLimitError("429 Too Many Requests")
    elif resp.status_code == 403:
        raise AccountBannedError("403 Forbidden — 계정 영구 제한 위험. 즉시 중단.")
    elif resp.status_code == 401:
        raise AuthError("401 Unauthorized — 토큰이 만료되었거나 잘못되었습니다.")
    elif resp.status_code != 200:
        raise APIError(f"HTTP {resp.status_code}: {resp.text[:200]}")

    # Response is a ZIP containing the image
    try:
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            names = zf.namelist()
            if not names:
                raise APIError("API returned an empty ZIP archive")
            img_data = zf.read(names[0])
            return Image.open(io.BytesIO(img_data))
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


# ═══════════════════════════════════════════════════════
#  Image Saving
# ═══════════════════════════════════════════════════════

def save_image(img: "Image.Image", char_code: str, scene_num: int, config: dict | None = None) -> Path:
    """Save as WebP in the CDN-matching folder structure.

    Special assets (900+) use custom output_path from config.
    """
    # Check for custom output path (SVG assets, key visual, thumbnail)
    custom_path = None
    if config and str(scene_num) in config.get("scenes", {}):
        custom_path = config["scenes"][str(scene_num)].get("output_path")

    if custom_path:
        # e.g. "svg/avatar.webp" → {char}/svg/avatar.webp
        #      "{code}.webp"     → {char}/{code}.webp (key visual/thumbnail)
        resolved = custom_path.replace("{code}", char_code)
        out_path = OUTPUT_BASE / char_code / resolved
    else:
        out_path = OUTPUT_BASE / char_code / f"{scene_num}.webp"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "WEBP", quality=92)
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
                  char_code: str, scene_num: int, negative: str) -> bool:
    """Single image generation with retry. Returns True on success.

    AccountBannedError/AuthError/KeyboardInterrupt propagate to caller.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            scene_name = config["scenes"][str(scene_num)]["name"]
            result = build_prompt(config, char_code, scene_num)
            if result is None:
                log.info(f"  Skipped {char_code}/{scene_num} (override _skip)")
                mark_completed(state, char_code, scene_num)
                return True
            base_prompt, female_cap, male_cap, w, h = result
            log.info(f"  Generating {char_code}/{scene_num}.webp ({scene_name}) (attempt {attempt})")

            img = call_nai_api(token, base_prompt, female_cap, male_cap, negative, w, h)
            save_image(img, char_code, scene_num, config)
            mark_completed(state, char_code, scene_num)
            return True

        except RateLimitError:
            wait = min(DELAY_429_BASE * (2 ** (attempt - 1)), DELAY_429_MAX)
            log.warning(f"  ⚠ 429 Rate Limit. {wait}초 대기...")
            time.sleep(wait)

        except (APIError, requests.RequestException) as e:
            log.error(f"  ✖ Attempt {attempt}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(30)
            else:
                mark_failed(state, char_code, scene_num, str(e))
                return False
    return False


def generate_batch(token, config, state, char_codes=None, scene_nums=None,
                   retry_tasks=None, dry_run=False, delay=DELAY_NORMAL):
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
            base_prompt, female_cap, male_cap, w, h = result
            log.info(f"  [{done}/{total}] DRY-RUN {char_code}/{scene_num} ({scene_name}) {w}×{h}")
            log.info(f"    base:    {base_prompt[:80]}...")
            log.info(f"    female:  {female_cap[:80]}...")
            log.info(f"    male:    {male_cap or '(none)'}")
            continue

        log.info(f"  [{done}/{total}]")
        try:
            success = _generate_one(token, config, state, char_code, scene_num, negative)
        except AccountBannedError as e:
            log.critical(f"  ✖ {e}")
            log.critical("  즉시 중단합니다. NAI 계정을 확인하세요.")
            mark_failed(state, char_code, scene_num, str(e))
            save_state(state)
            return
        except AuthError as e:
            log.error(f"  ✖ {e}")
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


# ═══════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════

from utils import ALL_CHARS, ALL_SCENES, SPECIAL_SCENES, parse_scene_range


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
        len([k for k in v.keys() if int(k) in all_scenes_set])
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
    print(f"  Asset Generation Status")
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
            len([k for k in failed_items.keys() if int(k) in all_scenes_set])
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
    parser.add_argument("--delay", type=float, default=DELAY_NORMAL, help=f"Delay between generations in seconds (default: {DELAY_NORMAL}s, min: 1s)")
    args = parser.parse_args()

    if args.status:
        show_status()
        return

    config = load_config()
    state = load_state()

    # Determine characters
    if args.chars:
        char_codes = [c.strip().upper() for c in args.chars.split(",")]
    else:
        char_codes = ALL_CHARS

    # Get token (priority: --token > --token-file > NAI_TOKEN env)
    token = args.token
    if not token and args.token_file:
        token = Path(args.token_file).read_text().strip()
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
        generate_batch(token, config, state, retry_tasks=retry_tasks,
                       dry_run=args.dry_run, delay=delay)
    else:
        if args.scenes:
            scene_nums = parse_scene_range(args.scenes)
        else:
            scene_nums = ALL_SCENES

        if not token and not args.dry_run:
            print("ERROR: --token, --token-file, or NAI_TOKEN env required (or use --dry-run)")
            return

        generate_batch(token, config, state, char_codes=char_codes,
                       scene_nums=scene_nums, dry_run=args.dry_run, delay=delay)


if __name__ == "__main__":
    main()
