#!/usr/bin/env python3
"""char_img/ 실제 파일 기반 업로드 범위 측정."""
from __future__ import annotations
import io, json, os, sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
CHAR_IMG = ROOT / "char_img"
TRACKER = TOOLS / ".r2_uploaded.json"

tracker_data = json.loads(TRACKER.read_text(encoding="utf-8")) if TRACKER.exists() else {"uploaded": []}
uploaded: set[str] = set(tracker_data.get("uploaded", []))

total = 0
skip_tracker = 0
pending: list[str] = []
by_char: dict[str, dict[str, int]] = {}
non_scene: list[str] = []  # thumbnail/key/sign/profile 같은 특수 파일

for char_dir in sorted(CHAR_IMG.iterdir()):
    if not char_dir.is_dir():
        continue
    c = char_dir.name
    by_char[c] = {"total": 0, "pending": 0, "special": 0}
    for f in sorted(char_dir.rglob("*.webp")):
        rel = f.relative_to(CHAR_IMG).as_posix()
        total += 1
        by_char[c]["total"] += 1
        # 트래커 키는 확장자 없는 형태 (r2_sync_loop.py 관례)
        key = rel[:-len(".webp")]
        # 특수 파일 (thumbnail/key/sign/profile/svg/*) 은 tracker 관례와 다를 수 있음
        stem = f.stem
        if not stem.isdigit():
            by_char[c]["special"] += 1
            non_scene.append(rel)
        if key in uploaded:
            skip_tracker += 1
            continue
        pending.append(rel)
        by_char[c]["pending"] += 1

print(f"총 .webp 파일: {total}")
print(f"트래커 기록 기업로드: {skip_tracker}")
print(f"업로드 대상: {len(pending)}")
print(f"특수 파일 (thumb/key/sign/profile/svg 등): {len(non_scene)}")
print()
print("캐릭터별:")
for c, s in by_char.items():
    mark = "*" if s["pending"] else " "
    print(f"  {mark} {c}: total={s['total']:3d}  pending={s['pending']:3d}  special={s['special']}")

if non_scene:
    print()
    print("특수 파일 샘플 (최대 20개):")
    for p in non_scene[:20]:
        print(f"  {p}")
