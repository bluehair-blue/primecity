"""
extract_char_prompts.py
=======================
[레거시 1회용 스크립트]
백업 이미지의 NAI EXIF 메타데이터에서 캐릭터 외형 프롬프트(char_caption)를 추출하고,
asset_config.json의 characters.{CODE}.clothed / nude 필드를 재생성한다.

소스 (레거시 폴더 — 2026-04-23 rename됨):
  C:\\Users\\User\\OneDrive\\图片\\챗봇 제작\\_OLD_DO_NOT_USE_캐릭터이미지_use_char_img\\_backup_20260331_212520\\

전략:
  1. clothed 프롬프트: {CODE}/profile.png 의 char_captions[0]
     - 구도/배경 태그 자동 제거
  2. nude 프롬프트:
     - nude 테스트 파일(예: 21_test.png, 51_test.png)이 있는 캐릭터는 직접 추출 + 씬 태그 제거
     - 없는 캐릭터는 clothed에서 의상 태그 자동 필터링
  3. normal quality 태그 제거 (전역)
  4. JSH는 nude 제외
  5. RAY nude에 `2::single prosthetic leg::` 주입

사용:
  python tools/extract_char_prompts.py --dry-run     # 결과만 출력
  python tools/extract_char_prompts.py --apply       # asset_config.json에 반영
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

TOOLS_DIR = Path(__file__).parent
CONFIG_PATH = TOOLS_DIR / "asset_config.json"
BACKUP_DIR = TOOLS_DIR.parent.parent / "_OLD_DO_NOT_USE_캐릭터이미지_use_char_img" / "_backup_20260331_212520"

CHARS = [
    "SY", "NHR", "JSH", "ERK", "LSH", "HSR", "KHR",
    "JGR", "MIL", "ELA", "MMR", "HSE", "NIA", "RAY", "LPS",
]

# --- 태그 필터 규칙 ---

# 구도/배경 (clothed/nude 공통 제거 — 씬에서 제공)
COMPOSITION_TAGS = {
    "standing", "sitting", "upper_body", "upper body",
    "full body", "full_body", "cowboy shot", "portrait",
    "white background", "simple background", "solid background",
    "blank background", "gradient background",
    "straight on", "from front", "from side", "from above", "from below", "from behind",
    "masterpiece", "very aesthetic", "best quality", "normal quality",
    "official_art", "game_cg",
    # 한국어 섹션 제목 (원본 주석 마커 파편)
    "구도", "인상", "머리", "눈", "얼굴", "체형", "의상", "소품", "악세서리",
    "눈/시선", "얼굴/분위기", "체형/인상", "분위기",
    "솜", "태도",
}

# 의상 관련 키워드 (부분 일치) — nude에서 제거
CLOTHING_KEYWORDS = [
    "clothes", "coat", "dress", "shirt", "blouse", "skirt", "pants", "trousers",
    "jacket", "cardigan", "sweater", "hoodie", "jumper",
    "sleeve", "sleeves", "collar", "button", "hem", "cuff",
    "layered", "belt", "strap", "suspenders", "drawstring",
    "pantyhose", "stockings", "tights", "thighhighs",
    "gloves", "mittens",
    "fashion", "celebrity", "high fashion", "oversized", "harajuku",
    "school uniform", "uniform", "suit", "blazer",
    "vest", "waistcoat", "kimono", "yukata", "hanbok",
    "shoes", "boots", "heels", "sneakers", "sandals", "shoelaces",
    "bra", "panties", "underwear", "lingerie",
    "apron", "cape", "cloak", "robe",
    "necktie", "tie",
    "unzipped", "zipped", "tucked",
    "crop top", "cropped", "turtleneck", "midriff",
    "glasses", "eyewear",  # 악세서리 (캐릭터성 중요하면 수동 복원)
    "baseball cap", "cap",
    "platform", "mary jane",
    "badges", "pins", "keychains",
    "long pants", "long skirt", "pleated", "lace trim",
    "pockets", "hands in pockets",
    "rolled up",
    "brooch",
    "pendant", "necklace",  # 목걸이류 (choker는 유지)
    # 주의: "fitted", "loose", "wrinkled", "tucked" 같은 의상 수식어는
    # "loose waves"(머리카락) 등 다른 토큰에 부분 매칭될 수 있어 제외.
    # 이 수식어들은 거의 항상 명사(shirt, vest 등)와 함께 나오므로
    # 명사만 제거하면 같이 제거된다.
]

# 의상 필터 예외 (캐릭터 시그니처 악세서리 — 유지)
CLOTHING_EXCEPTIONS = {
    "choker", "gold choker", "gold earrings", "scrunchie", "wrist scrunchie",
    "wrist light pink scrunchie", "silver hair clip", "colorful hair clips",
    "star hair clip", "hair clip", "headphones",
}

# 씬 관련 태그 (nude 테스트 파일에서 제거) — asset_config 씬 프롬프트 어휘 기반
SCENE_KEYWORDS = {
    "bedroom", "bathroom", "shower", "toilet", "bathroom stall",
    "kiss", "mutual# kiss", "fellatio", "cunnilingus", "deepthroat", "paizuri",
    "naizuri", "anilingus", "rimjob", "handjob", "footjob", "titjob",
    "sex", "anal sex", "missionary", "doggystyle", "cowgirl", "spooning",
    "from behind", "from above", "from side",
    "wet body", "wet hair", "saliva", "saliva trail",
    "cum", "cum in pussy", "cum on face", "cum on body", "overflow",
    "trembling", "blush", "open mouth", "tongue out", "ahegao",
    "heart-shaped pupils", "pussy juice",
    "close-up", "face focus", "female focus",
    "pov", "pov crotch",
    "69", "sitting on penis", "imminent penetration",
    "steam", "soap", "wet",
    # 성기 관련 — nude 캐릭터 프롬프트에서 제거 (씬이 제공)
    "penis", "large penis", "huge penis", "pussy",
}


def normalize_tag(tag: str) -> str:
    return tag.strip()


def extract_char_caption(png_path: Path) -> str | None:
    """PIL로 NAI Comment 메타데이터 추출 → char_captions[0].char_caption."""
    try:
        img = Image.open(png_path)
        comment = img.info.get("Comment", "")
        if not comment:
            return None
        data = json.loads(comment)
        chars = data.get("v4_prompt", {}).get("caption", {}).get("char_captions", [])
        if not chars:
            return None
        return chars[0].get("char_caption", "")
    except (OSError, json.JSONDecodeError, KeyError):
        return None


def tokenize(caption: str) -> list[str]:
    """char_caption을 쉼표 기준 토큰화. 주석(#...) 섹션 마커는 제거."""
    # 줄바꿈을 쉼표로 평탄화
    flat = caption.replace("\n", ",")
    tokens = [t.strip() for t in flat.split(",")]
    # 빈 토큰, 주석 섹션(#...) 제거
    cleaned = []
    for t in tokens:
        if not t:
            continue
        if t.startswith("#"):
            continue
        cleaned.append(t)
    return cleaned


def filter_composition(tokens: list[str]) -> list[str]:
    """구도/배경 태그 제거."""
    return [t for t in tokens if t.lower() not in {c.lower() for c in COMPOSITION_TAGS}]


def filter_clothing(tokens: list[str]) -> list[str]:
    """의상 관련 태그 제거 (부분 일치). 시그니처 악세서리는 예외로 유지."""
    result = []
    exception_lower = {e.lower() for e in CLOTHING_EXCEPTIONS}
    for t in tokens:
        tl = t.lower()
        # 예외 우선
        if tl in exception_lower:
            result.append(t)
            continue
        if any(kw in tl for kw in CLOTHING_KEYWORDS):
            continue
        result.append(t)
    return result


def filter_scene(tokens: list[str]) -> list[str]:
    """씬 관련 태그 제거 (nude 테스트 파일의 씬 태그 정리)."""
    result = []
    for t in tokens:
        # weight 구문 제거 후 매칭 (1.5::foo:: → foo)
        core = re.sub(r"^\d*\.?\d*::", "", t).removesuffix("::").strip()
        if core.lower() in {s.lower() for s in SCENE_KEYWORDS}:
            continue
        result.append(t)
    return result


def dedupe(tokens: list[str]) -> list[str]:
    seen = set()
    result = []
    for t in tokens:
        if t not in seen:
            seen.add(t)
            result.append(t)
    return result


def find_nude_test_file(char_dir: Path) -> Path | None:
    """nude 씬 테스트 파일을 찾는다 (20~67, 70~86 번호의 *_test.png)."""
    nude_scenes = [str(n) for n in (20, 21, 22, 23, 24, 25, 31, 41, 51, 52, 53)]
    for sid in nude_scenes:
        p = char_dir / f"{sid}_test.png"
        if p.exists():
            return p
    return None


def extract_clothed_prompt(code: str) -> str | None:
    """profile.png에서 clothed 프롬프트 추출."""
    char_dir = BACKUP_DIR / code
    profile = char_dir / "profile.png"
    if not profile.exists():
        return None
    caption = extract_char_caption(profile)
    if not caption:
        return None
    tokens = tokenize(caption)
    tokens = filter_composition(tokens)
    tokens = dedupe(tokens)
    return ", ".join(tokens)


def extract_nude_prompt(code: str, clothed_tokens: list[str]) -> str:
    """nude 프롬프트 생성.

    1. nude 테스트 파일이 있으면 직접 추출 (씬 태그 제거)
    2. 없으면 clothed에서 의상 태그 필터링
    """
    char_dir = BACKUP_DIR / code

    nude_file = find_nude_test_file(char_dir)
    if nude_file:
        caption = extract_char_caption(nude_file)
        if caption:
            tokens = tokenize(caption)
            tokens = filter_composition(tokens)
            tokens = filter_scene(tokens)
            tokens = filter_clothing(tokens)  # nude 테스트 파일에도 잔존 의상 태그 필터
            # nude 태그가 없으면 추가
            if "nude" not in [t.lower() for t in tokens]:
                tokens.insert(0, "nude")
            tokens = dedupe(tokens)
            return ", ".join(tokens)

    # fallback: clothed에서 의상 태그 필터링
    tokens = list(clothed_tokens)
    tokens = filter_clothing(tokens)
    if "nude" not in [t.lower() for t in tokens]:
        tokens.insert(0, "nude")
    tokens = dedupe(tokens)
    return ", ".join(tokens)


def apply_special_rules(code: str, clothed: str, nude: str | None) -> tuple[str, str | None]:
    """캐릭터별 특수 규칙 적용."""
    # JSH: nude 제거
    if code == "JSH":
        return clothed, None

    # RAY: nude에 single prosthetic leg 주입
    if code == "RAY" and nude and "prosthetic" not in nude.lower():
        nude = f"{nude}, 2::single prosthetic leg::"

    return clothed, nude


def main() -> None:
    parser = argparse.ArgumentParser(description="캐릭터 외형 프롬프트 재추출")
    parser.add_argument("--dry-run", action="store_true", help="결과만 출력, 파일 미변경")
    parser.add_argument("--apply", action="store_true", help="asset_config.json에 반영")
    parser.add_argument("--chars", help="특정 캐릭터만 (쉼표 구분)")
    parser.add_argument("--output", help="결과 JSON 저장 경로", default=None)
    parser.add_argument("--allow-legacy", action="store_true", help="레거시 백업 이미지 경로 사용을 명시적으로 허용")
    args = parser.parse_args()

    if not args.allow_legacy:
        print("[BLOCKED] 이 스크립트는 레거시 백업 이미지 경로를 읽는 1회용 도구입니다.")
        print("현재 원본 이미지는 연예계/char_img/만 사용합니다.")
        print("정말 레거시 추출이 필요하면 --allow-legacy 를 함께 지정하세요.")
        sys.exit(2)

    global Image
    try:
        from PIL import Image
    except ImportError:
        print("pip install pillow 필요")
        sys.exit(1)

    if not args.dry_run and not args.apply:
        print("--dry-run 또는 --apply 중 하나 필수")
        sys.exit(1)

    target_chars = CHARS
    if args.chars:
        target_chars = [c.strip().upper() for c in args.chars.split(",")]

    results: dict[str, dict[str, str | None]] = {}

    for code in target_chars:
        char_dir = BACKUP_DIR / code
        if not char_dir.exists():
            print(f"[SKIP] {code}: backup dir not found")
            continue

        clothed = extract_clothed_prompt(code)
        if clothed is None:
            print(f"[WARN] {code}: clothed 추출 실패")
            continue

        clothed_tokens = tokenize(clothed)
        nude = extract_nude_prompt(code, clothed_tokens)
        clothed, nude = apply_special_rules(code, clothed, nude)

        results[code] = {"clothed": clothed, "nude": nude}
        print(f"\n=== {code} ===")
        print(f"CLOTHED: {clothed[:300]}")
        if nude:
            print(f"NUDE:    {nude[:300]}")
        else:
            print("NUDE:    (제외)")

    if args.output:
        Path(args.output).write_text(
            json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\n결과 저장: {args.output}")

    if args.apply:
        cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        for code, prompts in results.items():
            if code not in cfg["characters"]:
                continue
            cfg["characters"][code]["clothed"] = prompts["clothed"]
            if prompts["nude"] is not None:
                cfg["characters"][code]["nude"] = prompts["nude"]
            elif code == "JSH" and "nude" in cfg["characters"][code]:
                cfg["characters"][code]["nude"] = ""  # 명시적 빈값
        tmp = CONFIG_PATH.with_suffix(".tmp")
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
        tmp.replace(CONFIG_PATH)
        print("\n[OK] asset_config.json 업데이트 완료")


if __name__ == "__main__":
    main()
