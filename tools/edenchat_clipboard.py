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

try:
    import pyperclip
except ImportError:
    print("pip install pyperclip 필요")
    sys.exit(1)

try:
    import pyautogui
    pyautogui.PAUSE = 0.05  # 기본 동작 간 최소 딜레이
    pyautogui.FAILSAFE = True  # 마우스를 좌상단으로 → 긴급 중단
except ImportError:
    print("pip install pyautogui 필요")
    sys.exit(1)


PROMPTS_DIR = Path(__file__).resolve().parent.parent / "docs" / "prompts" / "json"


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
    """모든 로어북 JSON을 삽입 우선순위 순으로 수집."""
    entries: list[dict[str, Any]] = []
    freeplay_mode_files = {
        "프리플레이_시작_EN.json",
        "프리플레이_유지_EN.json",
    }

    order = [
        ("메인", [PROMPTS_DIR / "메인_프롬프트_EN.json"]),
        ("캐릭터 본체", sorted(PROMPTS_DIR.glob("캐릭터/*_EN.json"), key=lambda p: p.name)
            if (PROMPTS_DIR / "캐릭터").exists() else []),
        ("나하린", sorted(PROMPTS_DIR.glob("나하린*_EN.json"), key=lambda p: p.name)),
        ("캐릭터 트리거", sorted(PROMPTS_DIR.glob("캐릭터/*_트리거_EN.json"), key=lambda p: p.name)
            if (PROMPTS_DIR / "캐릭터").exists() else []),
        ("캐릭터 초기", sorted(PROMPTS_DIR.glob("캐릭터/*_초기_EN.json"), key=lambda p: p.name)
            if (PROMPTS_DIR / "캐릭터").exists() else []),
        ("캐릭터 심화", sorted(PROMPTS_DIR.glob("캐릭터/*_심화_EN.json"), key=lambda p: p.name)
            if (PROMPTS_DIR / "캐릭터").exists() else []),
        ("캐릭터 특수", sorted(
            list(PROMPTS_DIR.glob("캐릭터/*_과거_EN.json")) +
            list(PROMPTS_DIR.glob("캐릭터/*_위기_EN.json")) +
            list(PROMPTS_DIR.glob("캐릭터/*_가족_EN.json")) +
            list(PROMPTS_DIR.glob("캐릭터/*_재회_EN.json")),
            key=lambda p: p.name)
            if (PROMPTS_DIR / "캐릭터").exists() else []),
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
        ("SVG", sorted(PROMPTS_DIR.glob("SVG_*_EN.json"), key=lambda p: p.name)),
        ("이미지", [PROMPTS_DIR / "이미지_NSFW_EN.json"]),
    ]

    for category, files in order:
        for f in files:
            if not f.exists():
                continue
            if category == "캐릭터 본체":
                skip = ["_트리거_EN.json", "_초기_EN.json", "_심화_EN.json",
                        "_과거_EN.json", "_위기_EN.json", "_가족_EN.json", "_재회_EN.json"]
                if any(f.name.endswith(s) for s in skip):
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
        if i == start_from:
            # 첫 항목: 빈 필드에 직접 붙여넣기
            paste(name, delay)
        else:
            # 후속 항목: 기존 텍스트 덮어쓰기
            select_all_and_paste(name, delay)

        # ── 2. Tab×3 → 본문 필드 ──
        tab(3, delay)

        # ── 3. 본문 붙여넣기 ──
        paste(body, delay)

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
    print(f"\n  총 {len(entries)}개 lorebook, {sum(e['size'] for e in entries):,} chars, {total_kw} keywords")


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
