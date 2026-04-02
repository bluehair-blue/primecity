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

import argparse
import base64
import io
import json
import logging
import os
import random
import sys
import time
import zipfile
from datetime import datetime
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

# Output base: 캐릭터 이미지 폴더 (CDN 구조와 동일)
OUTPUT_BASE = TOOLS_DIR.parent / "캐릭터 이미지"

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

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_state():
    if STATE_PATH.exists():
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed": {}, "failed": {}, "started_at": None, "last_updated": None}


def save_state(state):
    state["last_updated"] = datetime.now().isoformat()
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def mark_completed(state, char_code, scene_num):
    state.setdefault("completed", {}).setdefault(char_code, [])
    if scene_num not in state["completed"][char_code]:
        state["completed"][char_code].append(scene_num)
    # Remove from failed if present
    if char_code in state.get("failed", {}) and scene_num in state["failed"][char_code]:
        state["failed"][char_code].remove(scene_num)
    save_state(state)


def mark_failed(state, char_code, scene_num, reason):
    state.setdefault("failed", {}).setdefault(char_code, [])
    if scene_num not in state["failed"][char_code]:
        state["failed"][char_code].append(scene_num)
    save_state(state)


def is_done(state, char_code, scene_num):
    return scene_num in state.get("completed", {}).get(char_code, [])


# ═══════════════════════════════════════════════════════
#  Prompt Construction
# ═══════════════════════════════════════════════════════

def clean_char_prompt(raw):
    """Strip #comments and clean whitespace from character prompt."""
    return ", ".join(
        line.strip()
        for line in raw.replace("\n", ",").split(",")
        if line.strip() and not line.strip().startswith("#")
    )


def build_prompt(config, char_code, scene_num):
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

    # Apply per-character overrides (e.g., remove "double v" for NHR/JSH)
    overrides = config.get("character_scene_overrides", {}).get(char_code, {})
    remove_tags = overrides.get("remove_tags", [])
    for tag in remove_tags:
        female_scene = female_scene.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")
        male_caption = male_caption.replace(f", {tag},", ",").replace(f", {tag}", "").replace(f"{tag}, ", "")

    female_caption = f"{cleaned_char}, {female_scene}" if female_scene else cleaned_char

    return base, female_caption, male_caption, scene["width"], scene["height"]


# ═══════════════════════════════════════════════════════
#  NAI API Call
# ═══════════════════════════════════════════════════════

def call_nai_api(token, base_prompt, female_caption, male_caption, negative, width, height):
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
            img_name = zf.namelist()[0]
            img_data = zf.read(img_name)
            return Image.open(io.BytesIO(img_data))
    except Exception as e:
        raise APIError(f"Failed to decode image: {e}")


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

def save_image(img, char_code, scene_num, config=None):
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


def save_image_png(img, char_code, scene_num):
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

def generate_batch(token, config, state, char_codes, scene_nums, dry_run=False, delay=DELAY_NORMAL):
    """Main generation loop with retry & rate limit handling."""
    negative = config["base"]["negative_prompt"]
    total = len(char_codes) * len(scene_nums)
    done = 0
    consecutive_429 = 0

    if not state.get("started_at"):
        state["started_at"] = datetime.now().isoformat()
        save_state(state)

    log.info(f"═══ Generation Start: {len(char_codes)} chars × {len(scene_nums)} scenes = {total} images ═══")

    for char_code in char_codes:
        if char_code not in config["characters"]:
            log.error(f"Character {char_code} not found in config, skipping")
            continue

        char_name = config["characters"][char_code]["name"]
        log.info(f"\n── {char_code} ({char_name}) ──")

        for scene_num in scene_nums:
            scene_key = str(scene_num)
            if scene_key not in config["scenes"]:
                log.warning(f"  Scene {scene_num} not in config, skipping")
                continue

            if is_done(state, char_code, scene_num):
                done += 1
                log.info(f"  [{done}/{total}] Scene {scene_num} already done, skipping")
                continue

            scene_name = config["scenes"][scene_key]["name"]
            base_prompt, female_cap, male_cap, w, h = build_prompt(config, char_code, scene_num)

            if dry_run:
                done += 1
                log.info(f"  [{done}/{total}] DRY-RUN {char_code}/{scene_num} ({scene_name}) {w}×{h}")
                log.info(f"    base:    {base_prompt[:80]}...")
                log.info(f"    female:  {female_cap[:80]}...")
                log.info(f"    male:    {male_cap or '(none)'}")
                continue

            # ── Retry loop ──
            success = False
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    done += 1
                    log.info(f"  [{done}/{total}] Generating {char_code}/{scene_num}.webp ({scene_name}) {w}×{h}")

                    img = call_nai_api(token, base_prompt, female_cap, male_cap, negative, w, h)
                    save_image(img, char_code, scene_num, config)
                    mark_completed(state, char_code, scene_num)
                    consecutive_429 = 0
                    success = True
                    break

                except RateLimitError:
                    consecutive_429 += 1
                    wait = min(DELAY_429_BASE * (2 ** (consecutive_429 - 1)), DELAY_429_MAX)
                    log.warning(f"  ⚠ 429 Rate Limit (연속 {consecutive_429}회). {wait}초 대기...")
                    time.sleep(wait)
                    done -= 1  # Don't count as done

                except AccountBannedError as e:
                    log.critical(f"  ✖ {e}")
                    log.critical("  즉시 중단합니다. NAI 계정을 확인하세요.")
                    mark_failed(state, char_code, scene_num, str(e))
                    save_state(state)
                    return  # HARD STOP

                except AuthError as e:
                    log.error(f"  ✖ {e}")
                    log.error("  토큰을 갱신한 뒤 --retry-failed로 재실행하세요.")
                    mark_failed(state, char_code, scene_num, str(e))
                    save_state(state)
                    return  # HARD STOP

                except (APIError, requests.RequestException) as e:
                    log.error(f"  ✖ Attempt {attempt}/{MAX_RETRIES}: {e}")
                    if attempt < MAX_RETRIES:
                        time.sleep(30)
                    else:
                        mark_failed(state, char_code, scene_num, str(e))

                except KeyboardInterrupt:
                    log.info("\n  사용자 중단 (Ctrl+C). 진행 상태가 저장되었습니다.")
                    save_state(state)
                    return

            if not success and not dry_run:
                log.error(f"  ✖ {char_code}/{scene_num} failed after {MAX_RETRIES} retries")

            # ── Delay ──
            if not dry_run and success:
                if done % COOLDOWN_EVERY == 0:
                    log.info(f"  ⏳ {COOLDOWN_EVERY}장 완료, {DELAY_COOLDOWN}초 쿨다운...")
                    time.sleep(DELAY_COOLDOWN)
                else:
                    time.sleep(delay)

    # ── Summary ──
    completed_total = sum(len(v) for v in state.get("completed", {}).values())
    failed_total = sum(len(v) for v in state.get("failed", {}).values())
    log.info(f"\n═══ 완료: {completed_total}장 성공, {failed_total}장 실패 ═══")


# ═══════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════

def parse_scene_range(s):
    """Parse '1-8' or '1,2,3' or '1-8,20-42' into a list of ints."""
    nums = []
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-", 1)
            nums.extend(range(int(a), int(b) + 1))
        else:
            nums.append(int(part))
    return sorted(set(nums))


ALL_SCENES = [
    *range(1, 10),      # 감정 + neutral
    *range(10, 19),      # 일상
    *range(20, 43),      # NSFW 비삽입
    *range(50, 68),      # NSFW 삽입
    *range(70, 79),      # 착의 침실
    *range(80, 87),      # 착의 화장실
]

SPECIAL_SCENES = [901, 902, 903, 904, 910, 911]  # SVG assets + key visual + thumbnail

ALL_CHARS = ["SY", "NHR", "JSH", "ERK", "LSH", "HSR", "KHR",
             "JGR", "MIL", "ELA", "MMR", "HSE", "NIA", "RAY", "LPS"]


def show_status():
    state = load_state()
    config = load_config()
    total_possible = len(ALL_CHARS) * len(ALL_SCENES)
    completed_total = sum(len(v) for v in state.get("completed", {}).values())
    failed_total = sum(len(v) for v in state.get("failed", {}).values())

    print(f"\n{'═' * 50}")
    print(f"  Asset Generation Status")
    print(f"{'═' * 50}")
    print(f"  Started:   {state.get('started_at', 'N/A')}")
    print(f"  Updated:   {state.get('last_updated', 'N/A')}")
    print(f"  Progress:  {completed_total}/{total_possible} ({completed_total*100//total_possible}%)")
    print(f"  Failed:    {failed_total}")
    print()

    for code in ALL_CHARS:
        done = len(state.get("completed", {}).get(code, []))
        fail = len(state.get("failed", {}).get(code, []))
        bar_len = 20
        filled = done * bar_len // len(ALL_SCENES)
        bar = "█" * filled + "░" * (bar_len - filled)
        name = config["characters"].get(code, {}).get("name", "?")
        status = f"  {code:4} {name:8} [{bar}] {done:2}/{len(ALL_SCENES)}"
        if fail:
            status += f" ({fail} failed)"
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

    # Determine scenes
    if args.retry_failed:
        # Build list from failed items
        scene_nums = ALL_SCENES
        log.info("Retrying failed items only")
    elif args.scenes:
        scene_nums = parse_scene_range(args.scenes)
    else:
        scene_nums = ALL_SCENES

    # Get token
    token = args.token
    if not token and args.token_file:
        with open(args.token_file, "r") as f:
            token = f.read().strip()
    if not token and not args.dry_run:
        print("ERROR: --token or --token-file required (or use --dry-run)")
        return

    delay = max(1.0, args.delay)  # Minimum 1 second (NAI rate limit)
    generate_batch(token, config, state, char_codes, scene_nums, dry_run=args.dry_run, delay=delay)


if __name__ == "__main__":
    main()
