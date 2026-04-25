#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyperclip", "pyautogui"]
# ///
"""
edenchat_clipboard.py — 에덴챗 로어북 삽입 자동화
===================================================
에덴챗 UI의 Tab 네비게이션에 맞춘 키보드 시뮬레이션.

UI 구조 (Tab 순서):
  [로어북 제목] → Tab×3 → [본문] → Tab×1 → [트리거 입력]
  트리거: 키워드 입력 → Enter → 다음 키워드 → Enter → ...
  트리거 완료 후: Tab×3 → Enter(저장) → 다음 로어북 시작

워크플로우:
  1. 에덴챗 편집 페이지에서 "로어북 추가" 클릭
  2. 로어북 제목 입력 필드에 포커스가 있는 상태에서 스크립트 시작
  3. 스크립트가 5초 카운트다운 후 자동 입력 시작

사용법:
  python edenchat_clipboard.py                 # 전체 순차
  python edenchat_clipboard.py --from 15       # 15번째부터 재개
  python edenchat_clipboard.py --list          # 목록만 출력
  python edenchat_clipboard.py --delay 0.3     # 입력 간 딜레이 조절 (초)
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


PROMPTS_DIR = Path(__file__).resolve().parent.parent / "docs" / "prompts" / "json"


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

def collect_lorebooks() -> list[dict[str, Any]]:
    """모든 로어북 JSON을 삽입 우선순위 순으로 수집.

    우선순위 설계 (에덴챗에서는 먼저 삽입된 블록이 상단 노출):
      1. 메인 프롬프트        (상시 로드)
      2. 캐릭터 본체          (정체성 기반)
      3. 나하린 심리·냉각·분기 (루트의 특수 분기)
      4. 캐릭터 트리거        (상황 활성화)
      5. 캐릭터 초기          (❤️1-3)
      6. 캐릭터 심화          (❤️6-9)
      7. 캐릭터 NSFW          (❤️7+ 친밀)
      8. 캐릭터 관계          (복수 등장)
      9. 캐릭터 특수          (과거/위기/가족/재회/오디션)
     10. 캐릭터 씬            (영화관소매 등 핀포인트 씬)
     11. 오디션 / 프리플레이 / 모드 / 구역 / 이벤트 / SVG / 이미지
    """
    entries: list[dict[str, Any]] = []
    freeplay_mode_files = {
        "프리플레이_시작_EN.json",
        "프리플레이_유지_EN.json",
    }

    # 캐릭터 폴더 파일을 규칙 기반으로 버킷 분류
    char_dir = PROMPTS_DIR / "캐릭터"
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
        ("메인", [PROMPTS_DIR / "메인_프롬프트_EN.json"]),
        ("캐릭터 본체", char_buckets["캐릭터 본체"]),
        ("나하린", sorted(PROMPTS_DIR.glob("나하린*_EN.json"), key=lambda p: p.name)),
        ("캐릭터 트리거", char_buckets["캐릭터 트리거"]),
        ("캐릭터 초기", char_buckets["캐릭터 초기"]),
        ("캐릭터 심화", char_buckets["캐릭터 심화"]),
        ("캐릭터 NSFW", char_buckets["캐릭터 NSFW"]),
        ("캐릭터 관계", char_buckets["캐릭터 관계"]),
        ("캐릭터 특수", char_buckets["캐릭터 특수"]),
        ("캐릭터 씬", char_buckets["캐릭터 씬"]),
        ("오디션", sorted((PROMPTS_DIR / "오디션").glob("*_EN.json"), key=lambda p: p.name)
            if (PROMPTS_DIR / "오디션").exists() else []),
        ("프리플레이", [
            PROMPTS_DIR / "모드" / "프리플레이_시작_EN.json",
            PROMPTS_DIR / "모드" / "프리플레이_유지_EN.json",
        ]),
        ("모드", sorted(
            [p for p in (PROMPTS_DIR / "모드").glob("*_EN.json") if p.name not in freeplay_mode_files],
            key=lambda p: p.name)
            if (PROMPTS_DIR / "모드").exists() else []),
        ("구역", sorted(PROMPTS_DIR.glob("구역_*_EN.json"), key=lambda p: p.name)),
        ("세계관", sorted(PROMPTS_DIR.glob("세계관*_EN.json"), key=lambda p: p.name)),
        ("이벤트", sorted(PROMPTS_DIR.glob("이벤트_*_EN.json"), key=lambda p: p.name)),
        ("SVG", sorted(PROMPTS_DIR.glob("SVG_*_EN.json"), key=lambda p: p.name)),
        ("이미지", [PROMPTS_DIR / "이미지_NSFW_EN.json"]),
    ]

    for category, files in order:
        for f in files:
            if not f.exists():
                continue
            parsed = parse_lorebook(f)
            if parsed:
                parsed["category"] = category
                entries.append(parsed)

    return entries


def parse_lorebook(filepath: Path) -> dict[str, Any] | None:
    """JSON 파일에서 이름, 본문, 트리거 키워드 리스트를 파싱."""
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

    return {
        "name": name,
        "file": str(filepath.relative_to(PROMPTS_DIR)),
        "keywords": keywords,
        "body": json_text,
        "size": len(json_text),
    }


# ═══════════════════════════════════════════════════════════════
#  자동 입력 파이프라인
# ═══════════════════════════════════════════════════════════════

def run_pipeline(entries: list[dict[str, Any]], start_from: int = 1, delay: float = 0.15, pause_each: bool = False):
    ensure_gui_dependencies()
    total = len(entries)

    print(f"\n{'=' * 60}")
    print("  에덴챗 로어북 자동 입력")
    print(f"  총 {total}개 | {start_from}번부터 | 딜레이 {delay}s")
    print(f"{'=' * 60}")
    print()
    print("  [!] 긴급 중단: 마우스를 화면 좌상단(0,0)으로 이동")
    print("  [!] 시작 전 에덴챗에서 '로어북 추가' 클릭 → 제목 필드에 포커스")
    print()

    # 카운트다운
    for sec in range(5, 0, -1):
        print(f"  {sec}초 후 시작...", end="\r")
        time.sleep(1)
    print("  시작!            ")
    print()

    for i, entry in enumerate(entries, 1):
        if i < start_from:
            continue

        name = entry["name"]
        body = entry["body"]
        keywords = entry["keywords"]
        cat = entry["category"]

        print(f"  [{i}/{total}] {cat} | {name} ({len(keywords)} keywords, {entry['size']:,} chars)")

        if pause_each and i > start_from:
            answer = input("    → Enter로 계속 (q=중단): ").strip().lower()
            if answer == "q":
                pyperclip.copy("")  # 민감 내용 클립보드에서 제거
                print(f"\n  중단. 재개: --from {i}")
                sys.exit(0)

        # ── 1. 로어북 제목 ──
        select_all_and_paste(name, delay)

        # ── 2. Tab×3 → 본문 필드 ──
        tab(3, delay)

        # ── 3. 본문 붙여넣기 (Ctrl+A → 기존 내용 덮어쓰기) ──
        select_all_and_paste(body, delay)

        # ── 4. Tab×1 → 트리거 필드 ──
        tab(1, delay)

        # ── 5. 키워드 하나씩 입력 + Enter ──
        for kw in keywords:
            paste(kw, delay)
            enter(delay)

        # ── 6. Tab×3 → 저장 버튼 ──
        tab(3, delay)

        # ── 7. Enter → 저장 ──
        enter(delay)

        # 저장 후 UI 로딩 대기
        time.sleep(delay * 3)

        print("    -> 완료")

    pyperclip.copy("")  # 민감 내용 클립보드에서 제거
    print(f"\n{'=' * 60}")
    print(f"  전체 {total}개 로어북 입력 완료!")
    print(f"{'=' * 60}")


# ═══════════════════════════════════════════════════════════════
#  목록 출력
# ═══════════════════════════════════════════════════════════════

def print_list(entries: list[dict[str, Any]]):
    print(f"\n{'=' * 70}")
    print(f"  에덴챗 로어북 삽입 순서 ({len(entries)}개)")
    print(f"{'=' * 70}")

    current_cat = ""
    for i, e in enumerate(entries, 1):
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
    parser.add_argument("--pause-each", action="store_true", help="매 로어북마다 일시정지")
    parser.add_argument("--category", help="특정 분류만")
    args = parser.parse_args()

    entries = collect_lorebooks()

    if args.category:
        entries = [e for e in entries if args.category in e["category"]]

    if not entries:
        print("로어북 파일을 찾을 수 없습니다.")
        sys.exit(1)

    if args.list:
        print_list(entries)
    else:
        run_pipeline(entries, args.start_from, args.delay, args.pause_each)


if __name__ == "__main__":
    main()
