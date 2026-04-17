#!/usr/bin/env python3
"""r2_fullsync.py — char_img/ 전체를 R2 prime/ent/ 로 강제 재업로드.

기존 `.r2_uploaded.json` 트래커 무시 (검열본/수정본 반영용).
JGR/93.webp 는 의도적으로 비워둔 슬롯이므로 항상 제외.
실행 중 트래커는 50장마다 flush 하여 interrupt 방어.

사용:
  py tools/r2_fullsync.py                 # 기본 8 workers
  py tools/r2_fullsync.py --workers 12    # 병렬 수 증가
  py tools/r2_fullsync.py --dry-run       # 대상만 출력
  py tools/r2_fullsync.py --only-failed   # 직전 실행의 실패분만 재시도
"""
from __future__ import annotations

import argparse
import io
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

# ─── Windows UTF-8 강제 ───────────────────────────────────────
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
CHAR_IMG = ROOT / "char_img"
TRACKER = TOOLS / ".r2_uploaded.json"
FAILED_PATH = TOOLS / ".r2_fullsync_failed.json"

BUCKET = "prime"
R2_PREFIX = "ent"


def find_wrangler() -> str:
    for p in [
        ROOT / "node_modules" / ".bin" / "wrangler.cmd",
        ROOT / "node_modules" / ".bin" / "wrangler",
    ]:
        if p.exists():
            return str(p)
    fb = shutil.which("wrangler") or shutil.which("wrangler.cmd")
    if fb:
        return fb
    print("ERROR: wrangler 미발견. npm install 필요.", file=sys.stderr)
    sys.exit(1)


WRANGLER = find_wrangler()


def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def tracker_key(rel: str) -> str:
    """char_img 내 상대경로 → 트래커 키 (`.webp` 제거)."""
    return rel[:-5] if rel.endswith(".webp") else rel


def collect_files() -> list[Path]:
    out: list[Path] = []
    for char_dir in sorted(CHAR_IMG.iterdir()):
        if not char_dir.is_dir():
            continue
        for f in sorted(char_dir.rglob("*.webp")):
            rel = f.relative_to(CHAR_IMG).as_posix()
            if char_dir.name == "JGR" and rel.endswith("/93.webp"):
                continue
            out.append(f)
    return out


def upload_one(f: Path) -> tuple[str, bool, str]:
    rel = f.relative_to(CHAR_IMG).as_posix()
    key = f"{BUCKET}/{R2_PREFIX}/{rel}"
    cmd = [
        WRANGLER, "r2", "object", "put", key,
        "--file", str(f),
        "--content-type", "image/webp",
        "--remote",
    ]
    try:
        p = subprocess.run(
            cmd, capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=180,
        )
    except subprocess.TimeoutExpired:
        return rel, False, "timeout (180s)"
    except FileNotFoundError:
        return rel, False, f"wrangler not found: {WRANGLER}"
    if p.returncode == 0:
        return rel, True, ""
    out = (p.stdout or "") + (p.stderr or "")
    last = out.strip().splitlines()[-1] if out.strip() else f"exit {p.returncode}"
    return rel, False, last[:160]


def save_tracker(uploaded: set[str]) -> None:
    TRACKER.write_text(
        json.dumps(
            {"uploaded": sorted(uploaded),
             "last_updated": datetime.now().isoformat(timespec="seconds")},
            ensure_ascii=False, indent=2,
        ),
        encoding="utf-8",
    )


def save_failed(failures: list[tuple[str, str]]) -> None:
    FAILED_PATH.write_text(
        json.dumps(
            {"failed": [{"path": r, "error": m} for r, m in failures],
             "last_updated": datetime.now().isoformat(timespec="seconds")},
            ensure_ascii=False, indent=2,
        ),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only-failed", action="store_true",
                        help=".r2_fullsync_failed.json 에 기록된 실패분만 재시도")
    args = parser.parse_args()

    if args.only_failed:
        if not FAILED_PATH.exists():
            log("실패 기록 없음 — 재시도할 게 없음")
            return
        data = json.loads(FAILED_PATH.read_text(encoding="utf-8"))
        files = [CHAR_IMG / item["path"] for item in data.get("failed", [])]
        files = [f for f in files if f.exists()]
        log(f"재시도 대상: {len(files)}장")
    else:
        files = collect_files()
        log(f"전수 재업로드 대상: {len(files)}장 (JGR/93 제외)")

    log(f"workers={args.workers}  R2={BUCKET}/{R2_PREFIX}/")
    log(f"wrangler: {WRANGLER}")

    if args.dry_run:
        for f in files[:20]:
            print("DRY", f.relative_to(CHAR_IMG).as_posix())
        if len(files) > 20:
            print(f"... (+{len(files) - 20}장)")
        return

    # ── 트래커 초기화 (전체 재업로드) ─────────────────────────
    if not args.only_failed:
        save_tracker(set())
        log("트래커 초기화 완료")
        uploaded: set[str] = set()
    else:
        prev = json.loads(TRACKER.read_text(encoding="utf-8")) if TRACKER.exists() else {"uploaded": []}
        uploaded = set(prev.get("uploaded", []))

    lock = threading.Lock()
    ok = 0
    fail = 0
    failures: list[tuple[str, str]] = []
    total = len(files)
    start = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = {pool.submit(upload_one, f): f for f in files}
        done = 0
        for fut in as_completed(futs):
            rel, success, msg = fut.result()
            done += 1
            with lock:
                if success:
                    ok += 1
                    uploaded.add(tracker_key(rel))
                else:
                    fail += 1
                    failures.append((rel, msg))
                    log(f"  FAIL {rel} -- {msg}")
                if done % 50 == 0:
                    save_tracker(uploaded)
                    elapsed = time.time() - start
                    rate = done / elapsed if elapsed > 0 else 0
                    eta_min = (total - done) / rate / 60 if rate > 0 else 0
                    log(f"진행 {done}/{total} ({100*done/total:.1f}%) "
                        f"ok={ok} fail={fail} rate={rate:.1f}/s ETA {eta_min:.1f}min")

    save_tracker(uploaded)
    save_failed(failures)
    elapsed = time.time() - start
    log("=== 완료 ===")
    log(f"총 {total} | ok={ok} | fail={fail} | elapsed={elapsed/60:.1f}min")
    if failures:
        log(f"실패 {len(failures)}건 — .r2_fullsync_failed.json 에 기록됨")
        log("재시도: py tools/r2_fullsync.py --only-failed")


if __name__ == "__main__":
    main()
