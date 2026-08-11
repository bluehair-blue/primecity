#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyperclip", "pyautogui"]
# ///
"""
edenchat_clipboard.py — 에덴챗 로어북 삽입 자동화
===================================================
에덴챗 UI의 Tab 네비게이션에 맞춘 키보드 시뮬레이션.

현재 운영 구조:
  - EdenChat 로어북 박스를 삽입 대상보다 넉넉히 미리 생성한다.
  - 각 박스는 펼쳐둔다.
  - 첫 박스의 제목 입력 필드에 포커스를 둔 상태에서 시작한다.

Tab 순서 (2026-06 현재 Whale/EdenChat 관찰 기준):
  [제목 입력] → Tab×3 → [본문] → Tab×1 → [키워드 입력]
  키워드 입력: 키워드 붙여넣기 → Enter 반복
  새 박스 생성: Tab×2 → [로어북 추가] → Enter
  방금 만든 박스 제목 진입: Shift+Tab×5 → [수정] → Enter → [제목 입력]

기존 사전 생성 박스 방식:
  `--advance-mode precreated`를 쓰면 키워드 입력 뒤 Tab×3으로 다음 박스
  수정 버튼에 진입한다. 이 모드는 로어북 박스를 미리 충분히 만들고 펼친
  경우에만 사용한다.

버튼에 Tab 포커스가 닿으면 하얀 테두리가 보인다. `--focus-cue-delay`
옵션은 다음 박스 수정 버튼 위에서 잠시 멈춰 운영자가 포커스가 맞는지
눈으로 확인하고, 틀렸으면 pyautogui FAILSAFE(마우스 좌상단)로 중단할 수
있게 만든다.

워크플로우:
  1. 에덴챗 편집 페이지에서 필요한 수보다 많은 로어북 박스를 미리 생성
  2. 모든 박스를 펼침
  3. 첫 로어북 제목 입력 필드에 포커스가 있는 상태에서 스크립트 시작
  3. 스크립트가 5초 카운트다운 후 자동 입력 시작

사용법:
  python edenchat_clipboard.py                 # 통합본 우선 하이브리드 전체 순차
  python edenchat_clipboard.py --install-profile dual  # 원본+경량+통합 309개 전체 설치
  python edenchat_clipboard.py --from 15       # 15번째부터 재개
  python edenchat_clipboard.py --limit 1       # 1개만 테스트 입력
  python edenchat_clipboard.py --list          # 목록만 출력
  python edenchat_clipboard.py --mix paired    # 통합 전 원본/경량 트리 검증용
  python edenchat_clipboard.py --delay 0.3     # 입력 간 딜레이 조절 (초)
  python edenchat_clipboard.py --advance-mode add-button  # 새 박스 자동 생성
  python edenchat_clipboard.py --advance-mode precreated  # 기존 사전 생성 박스 방식
  python edenchat_clipboard.py --focus-cue-delay 0.7  # 다음 수정 버튼에서 확인 지연
  python edenchat_clipboard.py --no-advance-after-last # 마지막에 다음 박스 진입 생략
  python edenchat_clipboard.py --pause-each    # 매 로어북마다 일시정지
"""

from __future__ import annotations

import io
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

# Windows CP949 → UTF-8 강제
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

pyperclip = None
pyautogui = None


def ensure_gui_dependencies() -> None:
    """Load clipboard/GUI packages only for automation actions."""
    global pyperclip, pyautogui

    if pyperclip is None:
        try:
            import pyperclip as _pyperclip
        except ImportError:
            print("pip install pyperclip 필요")
            sys.exit(1)
        pyperclip = _pyperclip

    if pyautogui is None:
        try:
            import pyautogui as _pyautogui
        except ImportError:
            print("pip install pyautogui 필요")
            sys.exit(1)
        _pyautogui.PAUSE = 0.05  # 기본 동작 간 최소 딜레이
        _pyautogui.FAILSAFE = True  # 마우스를 좌상단으로 → 긴급 중단
        pyautogui = _pyautogui


PROJECT_ROOT = Path(__file__).resolve().parent.parent
BASE_PROMPTS_DIR = PROJECT_ROOT / "docs" / "prompts" / "json"
LITE_PROMPTS_DIR = PROJECT_ROOT / "docs" / "prompts" / "json_lite"
UNIFIED_PROMPTS_DIR = PROJECT_ROOT / "docs" / "prompts" / "json_unified"
COMMON_PROMPTS_DIR = PROJECT_ROOT / "docs" / "prompts" / "common"
ROUTING_MANIFEST_PATH = PROJECT_ROOT / "docs" / "prompts" / "routing_classified" / "manifest.json"
PROMPTS_DIR = BASE_PROMPTS_DIR
UNIFIED_ROUTE_CLASSES = {
    "02_media_format",
    "05_dynamic_character_core",
    "06_dynamic_character_trigger",
    "07_dynamic_deep_context",
    "08_dynamic_world_event",
    "09_ambiguous_review",
}
ROUTEABLE_CLASSES = {
    "03_routeable_fixed_command",
    "04_routeable_state_keyword",
}
DEFAULT_TITLE_TO_BODY_TABS = 3
DEFAULT_BODY_TO_KEYWORD_TABS = 1
DEFAULT_KEYWORD_TO_NEXT_EDIT_TABS = 3
DEFAULT_KEYWORD_TO_LOREBOOK_ADD_TABS = 2
DEFAULT_NEW_CARD_ADD_TO_EDIT_SHIFT_TABS = 5
_UNIFIED_ROUTE_MAP: dict[str, str] | None = None
_ROUTE_CLASS_MAP: dict[str, str] | None = None


def resolve_prompts_dir(variant: str) -> Path:
    """Return the prompt root for the requested paste variant.

    The original directory remains the default and source of truth. Lite files
    live in a separate tree so the EdenChat paste path can switch variants
    without touching the originals.
    """
    if variant == "original":
        return BASE_PROMPTS_DIR
    if variant == "lite":
        return LITE_PROMPTS_DIR
    raise ValueError(f"unknown prompt variant: {variant}")


def normalize_file_id(file_id: str) -> str:
    """Normalize Windows/Posix separators for route-manifest lookups."""
    return file_id.replace("\\", "/")


def load_route_class_map() -> dict[str, str]:
    """Return logical file ids mapped to routing classes from the classifier."""
    global _ROUTE_CLASS_MAP
    if _ROUTE_CLASS_MAP is not None:
        return _ROUTE_CLASS_MAP
    if not ROUTING_MANIFEST_PATH.exists():
        raise FileNotFoundError(f"missing routing manifest: {ROUTING_MANIFEST_PATH}")
    manifest = json.loads(ROUTING_MANIFEST_PATH.read_text(encoding="utf-8"))
    route_map: dict[str, str] = {}
    for row in manifest.get("entries", []):
        if row.get("variant") != "original":
            continue
        route_map[normalize_file_id(row["file"])] = row.get("route_class", "")
    _ROUTE_CLASS_MAP = route_map
    return route_map


def load_unified_route_map() -> dict[str, str]:
    """Return file ids that should resolve to json_unified in hybrid pastes."""
    global _UNIFIED_ROUTE_MAP
    if _UNIFIED_ROUTE_MAP is not None:
        return _UNIFIED_ROUTE_MAP
    route_map = {
        file_id: route_class
        for file_id, route_class in load_route_class_map().items()
        if route_class in UNIFIED_ROUTE_CLASSES
    }
    _UNIFIED_ROUTE_MAP = route_map
    return route_map


def file_id_for(filepath: Path, prompts_dir: Path) -> str:
    try:
        return str(filepath.relative_to(prompts_dir))
    except ValueError:
        return str(filepath.relative_to(PROJECT_ROOT))


def resolve_lorebook_source(filepath: Path, prompts_dir: Path, mix: str) -> tuple[Path, str]:
    """Resolve the physical file to paste while preserving the logical file id."""
    logical_id = file_id_for(filepath, prompts_dir)
    if mix != "unified":
        return filepath, logical_id
    route_map = load_unified_route_map()
    normalized = normalize_file_id(logical_id)
    if normalized not in route_map:
        return filepath, logical_id
    unified = UNIFIED_PROMPTS_DIR / Path(normalized)
    if not unified.exists():
        raise FileNotFoundError(f"missing unified lorebook for {logical_id}: {unified}")
    return unified, logical_id


# ═══════════════════════════════════════════════════════════════
#  캐릭터 파일 분류 규칙
# ═══════════════════════════════════════════════════════════════

# {이름}_{suffix}_EN.json → 카테고리 매핑
CHAR_VARIANT_CATEGORY = {
    "트리거": "캐릭터 트리거",
    "초기": "캐릭터 초기",
    "심화": "캐릭터 심화",
    "nsfw": "캐릭터 NSFW",
    "과거": "캐릭터 특수",
    "위기": "캐릭터 특수",
    "가족": "캐릭터 특수",
    "재회": "캐릭터 특수",
    "오디션": "캐릭터 특수",
}

# {이름A}_{이름B}_{관계}_EN.json 의 관계 suffix
CHAR_RELATION_SUFFIXES = {"자매", "라이벌", "짠꿉공", "작품"}


def classify_char_file(filepath: Path) -> str:
    """캐릭터 폴더 내 파일의 카테고리 판정.

    규칙:
      {이름}_EN.json                  → 캐릭터 본체
      {이름}_{variant}_EN.json        → CHAR_VARIANT_CATEGORY 매핑
      {이름A}_{이름B}_{관계}_EN.json → 캐릭터 관계
      그 외 (특수 씬)                → 캐릭터 씬
    """
    stem = filepath.stem  # "아피리아_EN" 같은 형태
    parts = stem.split("_")
    if parts[-1] != "EN":
        return "캐릭터 씬"
    core = parts[:-1]

    if len(core) == 1:
        return "캐릭터 본체"

    last = core[-1]
    if last in CHAR_VARIANT_CATEGORY:
        return CHAR_VARIANT_CATEGORY[last]
    if last in CHAR_RELATION_SUFFIXES:
        return "캐릭터 관계"

    # 캐릭터명_씬명_EN (예: 아피리아_영화관소매_EN)
    return "캐릭터 씬"


# ═══════════════════════════════════════════════════════════════
#  키보드 시뮬레이션 헬퍼
# ═══════════════════════════════════════════════════════════════

def paste(text: str, delay: float = 0.1):
    """클립보드에 복사 후 Ctrl+V."""
    pyperclip.copy(text)
    time.sleep(delay)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(delay)


def tab(n: int = 1, delay: float = 0.1):
    """Tab 키 N회."""
    for _ in range(n):
        pyautogui.press("tab")
        time.sleep(delay)


def shift_tab(n: int = 1, delay: float = 0.1):
    """Shift+Tab 키 N회."""
    for _ in range(n):
        pyautogui.hotkey("shift", "tab")
        time.sleep(delay)


def enter(delay: float = 0.1):
    """Enter 키."""
    pyautogui.press("enter")
    time.sleep(delay)


def select_all_and_paste(text: str, delay: float = 0.1):
    """Ctrl+A → 클립보드 복사 → Ctrl+V (기존 텍스트 덮어쓰기)."""
    pyautogui.hotkey("ctrl", "a")
    time.sleep(delay)
    paste(text, delay)


# ═══════════════════════════════════════════════════════════════
#  로어북 파일 수집 및 파싱
# ═══════════════════════════════════════════════════════════════

def collect_lorebooks(
    prompts_dir: Path | None = None,
    include_common: bool = True,
    mix: str = "paired",
) -> list[dict[str, Any]]:
    """모든 로어북 JSON을 삽입 우선순위 순으로 수집.

    mix:
      paired  - 원본/경량 트리를 그대로 사용.
      unified - 분기 가능 로어북은 variant 트리, 비분기 로어북은 json_unified 사용.

    우선순위 설계 (에덴챗에서는 먼저 삽입된 블록이 상단 노출):
      1. 메인 프롬프트        (상시 로드)
      2. 공통 출력 규칙       (원본/경량 공용)
      3. 캐릭터 본체          (정체성 기반)
      4. 나하린 심리·냉각·분기 (루트의 특수 분기)
      5. 캐릭터 트리거        (상황 활성화)
      6. 캐릭터 초기          (❤️1-3)
      7. 캐릭터 심화          (❤️6-9)
      8. 캐릭터 NSFW          (❤️7+ 친밀)
      9. 캐릭터 관계          (복수 등장)
     10. 캐릭터 특수          (과거/위기/가족/재회/오디션)
     11. 캐릭터 씬            (영화관소매 등 핀포인트 씬)
     12. 오디션 / 프리플레이 / 모드 / 구역 / 이벤트 / SVG / 이미지
    """
    if mix not in {"paired", "unified"}:
        raise ValueError(f"unknown lorebook mix: {mix}")
    prompts_dir = prompts_dir or PROMPTS_DIR
    entries: list[dict[str, Any]] = []
    freeplay_mode_files = {
        "프리플레이_시작_EN.json",
        "프리플레이_유지_EN.json",
    }

    # 캐릭터 폴더 파일을 규칙 기반으로 버킷 분류
    char_dir = prompts_dir / "캐릭터"
    char_buckets: dict[str, list[Path]] = {
        "캐릭터 본체": [],
        "캐릭터 트리거": [],
        "캐릭터 초기": [],
        "캐릭터 심화": [],
        "캐릭터 NSFW": [],
        "캐릭터 관계": [],
        "캐릭터 특수": [],
        "캐릭터 씬": [],
    }
    if char_dir.exists():
        for f in sorted(char_dir.glob("*_EN.json"), key=lambda p: p.name):
            cat = classify_char_file(f)
            char_buckets.setdefault(cat, []).append(f)

    order = [
        ("메인", [prompts_dir / "메인_프롬프트_EN.json"]),
        ("캐릭터 본체", char_buckets["캐릭터 본체"]),
        ("나하린", sorted(prompts_dir.glob("나하린*_EN.json"), key=lambda p: p.name)),
        ("캐릭터 트리거", char_buckets["캐릭터 트리거"]),
        ("캐릭터 초기", char_buckets["캐릭터 초기"]),
        ("캐릭터 심화", char_buckets["캐릭터 심화"]),
        ("캐릭터 NSFW", char_buckets["캐릭터 NSFW"]),
        ("캐릭터 관계", char_buckets["캐릭터 관계"]),
        ("캐릭터 특수", char_buckets["캐릭터 특수"]),
        ("캐릭터 씬", char_buckets["캐릭터 씬"]),
        ("오디션", sorted((prompts_dir / "오디션").glob("*_EN.json"), key=lambda p: p.name)
            if (prompts_dir / "오디션").exists() else []),
        ("프리플레이", [
            prompts_dir / "모드" / "프리플레이_시작_EN.json",
            prompts_dir / "모드" / "프리플레이_유지_EN.json",
        ]),
        ("모드", sorted(
            [p for p in (prompts_dir / "모드").glob("*_EN.json") if p.name not in freeplay_mode_files],
            key=lambda p: p.name)
            if (prompts_dir / "모드").exists() else []),
        ("구역", sorted(prompts_dir.glob("구역_*_EN.json"), key=lambda p: p.name)),
        ("세계관", sorted(prompts_dir.glob("세계관*_EN.json"), key=lambda p: p.name)),
        ("이벤트", sorted(prompts_dir.glob("이벤트_*_EN.json"), key=lambda p: p.name)),
        ("SVG", sorted(prompts_dir.glob("SVG_*_EN.json"), key=lambda p: p.name)),
        ("이미지", [prompts_dir / "이미지_NSFW_EN.json"]),
    ]
    if include_common:
        order.insert(1, ("공통", [COMMON_PROMPTS_DIR / "이미지_출력_EN.json"]))

    for category, files in order:
        for f in files:
            if not f.exists():
                continue
            source_file, logical_id = resolve_lorebook_source(f, prompts_dir, mix)
            source_root = UNIFIED_PROMPTS_DIR if source_file != f else prompts_dir
            parsed = parse_lorebook(source_file, source_root)
            if parsed:
                parsed["category"] = category
                parsed["file"] = logical_id
                parsed["source_file"] = str(source_file.relative_to(PROJECT_ROOT))
                parsed["mix"] = mix
                parsed["route_class"] = load_route_class_map().get(normalize_file_id(logical_id), "")
                entries.append(parsed)

    return entries


def parse_lorebook(filepath: Path, prompts_dir: Path | None = None) -> dict[str, Any] | None:
    """JSON 파일에서 이름, 본문, 트리거 키워드 리스트를 파싱."""
    prompts_dir = prompts_dir or PROMPTS_DIR
    raw = filepath.read_text(encoding="utf-8")

    parts = raw.rsplit("// --- TRIGGER ---", 1)
    json_text = parts[0].strip()
    keywords: list[str] = []

    if len(parts) > 1:
        for line in parts[1].strip().split("\n"):
            line = line.lstrip("/ ").strip()
            if not line or line.startswith("---"):
                continue
            # 콤마로 구분된 키워드를 개별 분리
            for kw in line.split(","):
                kw = kw.strip()
                if kw:
                    keywords.append(kw)

    try:
        json.loads(json_text)
    except json.JSONDecodeError:
        return None

    name = filepath.stem.replace("_EN", "")

    try:
        file_id = str(filepath.relative_to(prompts_dir))
    except ValueError:
        file_id = str(filepath.relative_to(PROJECT_ROOT))

    return {
        "name": name,
        "file": file_id,
        "keywords": keywords,
        "body": json_text,
        "size": len(json_text),
    }


# ═══════════════════════════════════════════════════════════════
#  자동 입력 파이프라인
# ═══════════════════════════════════════════════════════════════

def hold_focus_cue(label: str, seconds: float) -> None:
    """Pause while a Tab-focused EdenChat button shows its white outline."""
    if seconds <= 0:
        return
    print(f"    focus cue: {label} ({seconds:.1f}s)")
    time.sleep(seconds)


def run_pipeline(
    entries: list[dict[str, Any]],
    start_from: int = 1,
    delay: float = 0.15,
    pause_each: bool = False,
    limit: int | None = None,
    countdown: int = 5,
    tabs_title_to_body: int = DEFAULT_TITLE_TO_BODY_TABS,
    tabs_body_to_keywords: int = DEFAULT_BODY_TO_KEYWORD_TABS,
    tabs_keywords_to_next_edit: int = DEFAULT_KEYWORD_TO_NEXT_EDIT_TABS,
    tabs_keywords_to_lorebook_add: int = DEFAULT_KEYWORD_TO_LOREBOOK_ADD_TABS,
    shift_tabs_add_to_new_edit: int = DEFAULT_NEW_CARD_ADD_TO_EDIT_SHIFT_TABS,
    advance_mode: str = "add-button",
    focus_cue_delay: float = 0.0,
    advance_after_last: bool = True,
):
    ensure_gui_dependencies()
    total = len(entries)
    if start_from < 1:
        raise ValueError("--from must be >= 1")
    if limit is not None and limit < 1:
        raise ValueError("--limit must be >= 1")
    if advance_mode not in {"add-button", "precreated"}:
        raise ValueError("advance_mode must be add-button or precreated")

    run_items = [(i, entry) for i, entry in enumerate(entries, 1) if i >= start_from]
    if limit is not None:
        run_items = run_items[:limit]
    run_total = len(run_items)
    if run_total == 0:
        print("입력할 로어북이 없습니다.")
        return

    print(f"\n{'=' * 60}")
    print("  에덴챗 로어북 자동 입력")
    print(f"  전체 {total}개 | 실행 {run_total}개 | {start_from}번부터 | 딜레이 {delay}s")
    print(f"{'=' * 60}")
    print()
    print("  [!] 긴급 중단: 마우스를 화면 좌상단(0,0)으로 이동")
    if advance_mode == "add-button":
        print("  [!] 시작 전 첫 로어북 제목 필드에 포커스. 다음 박스는 '로어북 추가'로 자동 생성")
        print("  [!] Tab으로 하얀 테두리가 생긴 '로어북 추가'/'수정' 버튼에서 Enter")
    else:
        print("  [!] 시작 전 로어북 박스를 넉넉히 만들고 모두 펼친 뒤, 첫 제목 필드에 포커스")
        print("  [!] 다음 박스 진입은 Tab으로 하얀 테두리가 생긴 '수정' 버튼에서 Enter")
    print(
        "  [tab] 제목→본문 "
        f"{tabs_title_to_body} | 본문→키워드 {tabs_body_to_keywords} | "
        f"진행모드 {advance_mode}"
    )
    if advance_mode == "add-button":
        print(
            "  [tab] 키워드→로어북 추가 "
            f"{tabs_keywords_to_lorebook_add} | 로어북 추가→새 수정 Shift+Tab {shift_tabs_add_to_new_edit}"
        )
    else:
        print(f"  [tab] 키워드→다음 수정 {tabs_keywords_to_next_edit}")
    print()

    # 카운트다운
    for sec in range(countdown, 0, -1):
        print(f"  {sec}초 후 시작...", end="\r")
        time.sleep(1)
    print("  시작!            ")
    print()

    for run_index, (i, entry) in enumerate(run_items, 1):
        name = entry["name"]
        body = entry["body"]
        keywords = entry["keywords"]
        cat = entry["category"]
        is_last_run_item = run_index == run_total

        print(f"  [{i}/{total}] {cat} | {name} ({len(keywords)} keywords, {entry['size']:,} chars)")

        if pause_each and i > start_from:
            answer = input("    → Enter로 계속 (q=중단): ").strip().lower()
            if answer == "q":
                pyperclip.copy("")  # 민감 내용 클립보드에서 제거
                print(f"\n  중단. 재개: --from {i}")
                sys.exit(0)

        # ── 1. 로어북 제목 ──
        select_all_and_paste(name, delay)

        # ── 2. 제목 → 본문 필드 ──
        tab(tabs_title_to_body, delay)

        # ── 3. 본문 붙여넣기 (Ctrl+A → 기존 내용 덮어쓰기) ──
        select_all_and_paste(body, delay)

        # ── 4. 본문 → 키워드 필드 ──
        tab(tabs_body_to_keywords, delay)

        # ── 5. 키워드 하나씩 입력 + Enter ──
        for kw in keywords:
            paste(kw, delay)
            enter(delay)

        should_advance = advance_after_last or not is_last_run_item
        if should_advance:
            if advance_mode == "precreated":
                # ── 6A. 키워드 필드 → 미리 만들어 둔 다음 박스의 수정 버튼 ──
                tab(tabs_keywords_to_next_edit, delay)
                hold_focus_cue("다음 로어북 '수정' 버튼", focus_cue_delay)
                enter(delay)
                time.sleep(delay * 3)
            else:
                # ── 6B. 키워드 필드 → 로어북 추가 버튼 ──
                tab(tabs_keywords_to_lorebook_add, delay)
                hold_focus_cue("'로어북 추가' 버튼", focus_cue_delay)
                enter(delay)
                time.sleep(delay * 3)

                # 방금 생성된 새 박스는 '로어북 추가' 버튼 바로 위에 생긴다.
                # Shift+Tab으로 새 박스의 수정 버튼까지 되돌아간 뒤 Enter로 제목 입력을 연다.
                shift_tab(shift_tabs_add_to_new_edit, delay)
                hold_focus_cue("새 로어북 '수정' 버튼", focus_cue_delay)
                enter(delay)
                time.sleep(delay * 3)
        else:
            print("    -> 마지막 항목: 다음 박스 진입 생략")

        print("    -> 완료")

    pyperclip.copy("")  # 민감 내용 클립보드에서 제거
    print(f"\n{'=' * 60}")
    print(f"  전체 {total}개 로어북 입력 완료!")
    print(f"{'=' * 60}")


# ═══════════════════════════════════════════════════════════════
#  목록 출력
# ═══════════════════════════════════════════════════════════════

def filter_entries_by_route_scope(entries: list[dict[str, Any]], route_scope: str) -> list[dict[str, Any]]:
    """Select paste subsets for final EdenChat routing installation."""
    if route_scope == "all":
        return entries
    if route_scope == "branchable":
        keep = {"00_main_toggle", *ROUTEABLE_CLASSES}
        return [entry for entry in entries if entry.get("route_class") in keep]
    if route_scope == "shared":
        keep = {"01_common_shared", *UNIFIED_ROUTE_CLASSES}
        return [entry for entry in entries if entry.get("route_class") in keep]
    raise ValueError(f"unknown route scope: {route_scope}")


def mark_install_batch(
    entries: list[dict[str, Any]],
    install_batch: str,
    variant: str,
    category_prefix: str,
) -> list[dict[str, Any]]:
    """Tag entries so a 309-item dual install remains auditable in --list/snapshot."""
    tagged: list[dict[str, Any]] = []
    for entry in entries:
        item = dict(entry)
        item["install_batch"] = install_batch
        item["variant"] = variant
        item["category"] = f"{category_prefix} / {entry['category']}"
        tagged.append(item)
    return tagged


def collect_dual_install_lorebooks() -> list[dict[str, Any]]:
    """Build the full EdenChat install queue: shared unified + both branchable variants."""
    original_entries = collect_lorebooks(resolve_prompts_dir("original"), mix="unified")
    lite_entries = collect_lorebooks(resolve_prompts_dir("lite"), mix="unified")

    return [
        *mark_install_batch(
            filter_entries_by_route_scope(original_entries, "shared"),
            "shared_unified",
            "original",
            "통합 공유",
        ),
        *mark_install_batch(
            filter_entries_by_route_scope(original_entries, "branchable"),
            "original_branchable",
            "original",
            "원본 분기",
        ),
        *mark_install_batch(
            filter_entries_by_route_scope(lite_entries, "branchable"),
            "lite_branchable",
            "lite",
            "경량 분기",
        ),
    ]


def batch_summary(entries: list[dict[str, Any]]) -> str:
    counts: dict[str, int] = {}
    for entry in entries:
        batch = entry.get("install_batch")
        if not batch:
            continue
        counts[batch] = counts.get(batch, 0) + 1
    return ", ".join(f"{batch}:{count}" for batch, count in counts.items())


def snapshot_entries(entries: list[dict[str, Any]], variant: str, mix: str = "paired", route_scope: str = "all") -> dict[str, Any]:
    """Build a machine-readable snapshot of the current insertion order."""
    rows: list[dict[str, Any]] = []
    for i, e in enumerate(entries, 1):
        row = {
            "index": i,
            "category": e["category"],
            "display_name": e["name"],
            "file": e["file"],
            "source_file": e.get("source_file", e["file"]),
            "mix": e.get("mix", mix),
            "route_class": e.get("route_class", ""),
            "size": e["size"],
            "keyword_count": len(e["keywords"]),
            "keywords": e["keywords"],
        }
        if "install_batch" in e:
            row["install_batch"] = e["install_batch"]
        if "variant" in e:
            row["entry_variant"] = e["variant"]
        rows.append(row)

    return {
        "variant": variant,
        "mix": mix,
        "route_scope": route_scope,
        "count": len(entries),
        "entries": rows,
    }


def write_snapshot(
    entries: list[dict[str, Any]],
    variant: str,
    snapshot_path: Path,
    mix: str = "paired",
    route_scope: str = "all",
) -> None:
    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot_path.write_text(
        json.dumps(snapshot_entries(entries, variant, mix, route_scope), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def print_list(entries: list[dict[str, Any]]):
    print(f"\n{'=' * 70}")
    print(f"  에덴챗 로어북 삽입 순서 ({len(entries)}개)")
    print(f"{'=' * 70}")

    current_batch = ""
    current_cat = ""
    for i, e in enumerate(entries, 1):
        batch = e.get("install_batch", "")
        if batch and batch != current_batch:
            current_batch = batch
            current_cat = ""
            print(f"\n  == {current_batch} ==")
        if e["category"] != current_cat:
            current_cat = e["category"]
            print(f"\n  -- {current_cat} --")
        kw_count = len(e["keywords"])
        kw_preview = ", ".join(e["keywords"][:3]) + ("..." if kw_count > 3 else "")
        print(f"  {i:3d}. {e['name']:<30s} {e['size']:>6,}ch  {kw_count:2d}kw  | {kw_preview}")

    total_kw = sum(len(e["keywords"]) for e in entries)
    print(f"\n  총 {len(entries)}개 lorebook ({len(entries)} non-combined), {sum(e['size'] for e in entries):,} chars, {total_kw} keywords")


# ═══════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════

def main():
    import argparse
    parser = argparse.ArgumentParser(description="에덴챗 로어북 자동 입력")
    parser.add_argument("--from", type=int, default=1, dest="start_from", help="N번째부터 시작")
    parser.add_argument("--list", action="store_true", help="전체 목록만 출력")
    parser.add_argument("--delay", type=float, default=0.15, help="입력 간 딜레이 (초, 기본 0.15)")
    parser.add_argument("--countdown", type=int, default=5, help="자동 입력 전 카운트다운 초")
    parser.add_argument("--limit", type=int, help="실제 입력할 최대 로어북 수. 1개 테스트에 유용")
    parser.add_argument("--pause-each", action="store_true", help="매 로어북마다 일시정지")
    parser.add_argument("--category", help="특정 분류만")
    parser.add_argument(
        "--advance-mode",
        choices=["add-button", "precreated"],
        default="add-button",
        help="add-button=로어북 추가 버튼으로 다음 박스 생성, precreated=미리 만든 다음 박스 수정 버튼으로 이동",
    )
    parser.add_argument("--variant", choices=["original", "lite"], default="original", help="삽입할 프롬프트 변형")
    parser.add_argument(
        "--mix",
        choices=["paired", "unified"],
        default="unified",
        help="unified=비분기 로어북은 통합본 사용(기본), paired=원본/경량 트리 그대로",
    )
    parser.add_argument(
        "--route-scope",
        choices=["all", "branchable", "shared"],
        default="all",
        help="all=전체, branchable=메인+분기 가능 로어북, shared=공통+통합 비분기 로어북",
    )
    parser.add_argument(
        "--install-profile",
        choices=["single", "dual"],
        default="single",
        help="single=선택 variant 1세트, dual=통합 공유+원본 분기+경량 분기 309개 전체 설치",
    )
    parser.add_argument("--snapshot", type=Path, help="--list 결과를 JSON snapshot으로 저장")
    parser.add_argument("--dry-run", action="store_true", help="GUI/clipboard 없이 삽입 대상만 검증")
    parser.add_argument(
        "--focus-cue-delay",
        type=float,
        default=0.0,
        help="다음 로어북 수정 버튼에 Tab 포커스가 닿은 뒤 대기할 초. 하얀 테두리 확인용",
    )
    parser.add_argument(
        "--no-advance-after-last",
        action="store_true",
        help="마지막 입력 후 다음 빈 박스의 수정 버튼을 열지 않음",
    )
    parser.add_argument(
        "--tabs-title-to-body",
        type=int,
        default=DEFAULT_TITLE_TO_BODY_TABS,
        help="제목 입력 필드에서 본문 textarea까지 Tab 횟수",
    )
    parser.add_argument(
        "--tabs-body-to-keywords",
        type=int,
        default=DEFAULT_BODY_TO_KEYWORD_TABS,
        help="본문 textarea에서 키워드 입력칸까지 Tab 횟수",
    )
    parser.add_argument(
        "--tabs-keywords-to-next-edit",
        type=int,
        default=DEFAULT_KEYWORD_TO_NEXT_EDIT_TABS,
        help="precreated 모드: 키워드 입력칸에서 다음 로어북 수정 버튼까지 Tab 횟수",
    )
    parser.add_argument(
        "--tabs-keywords-to-lorebook-add",
        type=int,
        default=DEFAULT_KEYWORD_TO_LOREBOOK_ADD_TABS,
        help="add-button 모드: 키워드 입력칸에서 로어북 추가 버튼까지 Tab 횟수",
    )
    parser.add_argument(
        "--shift-tabs-add-to-new-edit",
        type=int,
        default=DEFAULT_NEW_CARD_ADD_TO_EDIT_SHIFT_TABS,
        help="add-button 모드: 로어북 추가 후 새 로어북 수정 버튼까지 Shift+Tab 횟수",
    )
    args = parser.parse_args()

    if args.start_from < 1:
        parser.error("--from must be >= 1")
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be >= 1")
    if args.delay < 0 or args.countdown < 0 or args.focus_cue_delay < 0:
        parser.error("--delay, --countdown, and --focus-cue-delay must be >= 0")
    if min(
        args.tabs_title_to_body,
        args.tabs_body_to_keywords,
        args.tabs_keywords_to_next_edit,
        args.tabs_keywords_to_lorebook_add,
        args.shift_tabs_add_to_new_edit,
    ) < 0:
        parser.error("tab counts must be >= 0")

    snapshot_variant = args.variant
    snapshot_route_scope = args.route_scope
    if args.install_profile == "dual":
        if args.mix != "unified":
            parser.error("--install-profile dual requires --mix unified")
        if args.variant != "original":
            parser.error("--install-profile dual includes both variants; leave --variant as original")
        if args.route_scope != "all":
            parser.error("--install-profile dual builds shared+branchable scopes; leave --route-scope as all")
        entries = collect_dual_install_lorebooks()
        snapshot_variant = "dual"
        snapshot_route_scope = "dual"
    else:
        prompts_dir = resolve_prompts_dir(args.variant)
        entries = collect_lorebooks(prompts_dir, mix=args.mix)
        entries = filter_entries_by_route_scope(entries, args.route_scope)

    if args.category:
        entries = [e for e in entries if args.category in e["category"]]

    if not entries:
        print("로어북 파일을 찾을 수 없습니다.")
        sys.exit(1)

    if args.snapshot:
        write_snapshot(entries, snapshot_variant, args.snapshot, args.mix, snapshot_route_scope)
        print(f"snapshot saved: {args.snapshot}")

    if args.list:
        print_list(entries)
    elif args.dry_run:
        run_entries = entries[args.start_from - 1:]
        if args.limit is not None:
            run_entries = run_entries[:args.limit]
        print(
            f"dry-run ok: install_profile={args.install_profile}, "
            f"variant={snapshot_variant}, mix={args.mix}, route_scope={snapshot_route_scope}, "
            f"advance_mode={args.advance_mode}, "
            f"entries={len(entries)}, run_entries={len(run_entries)}, "
            f"chars={sum(e['size'] for e in entries):,}, "
            f"run_chars={sum(e['size'] for e in run_entries):,}"
        )
        batches = batch_summary(entries)
        if batches:
            print(f"batches: {batches}")
    else:
        run_pipeline(
            entries,
            start_from=args.start_from,
            delay=args.delay,
            pause_each=args.pause_each,
            limit=args.limit,
            countdown=args.countdown,
            tabs_title_to_body=args.tabs_title_to_body,
            tabs_body_to_keywords=args.tabs_body_to_keywords,
            tabs_keywords_to_next_edit=args.tabs_keywords_to_next_edit,
            tabs_keywords_to_lorebook_add=args.tabs_keywords_to_lorebook_add,
            shift_tabs_add_to_new_edit=args.shift_tabs_add_to_new_edit,
            advance_mode=args.advance_mode,
            focus_cue_delay=args.focus_cue_delay,
            advance_after_last=not args.no_advance_after_last,
        )


if __name__ == "__main__":
    main()
