#!/usr/bin/env python3
"""
r2_sync_loop.py — char_img/ → R2 (prime/ent/) 동시 동기화 루프

asset_generator.py 가 만들어내는 webp 파일을 polling 으로 감지하여
wrangler r2 object put 으로 R2 에 즉시 업로드.

Race condition 안전성:
  asset_generator 는 (1) 디스크 저장 → (2) state.json 갱신 순서이므로,
  state.completed 에 (char, num) 이 등장하는 시점에는 디스크 파일이 이미
  완전히 쓰여진 상태. 본 스크립트는 state.json 만 polling 하므로 partial
  read 위험 없음.

운영 모드:
  --baseline   처음 1회: 현재 state.completed 전체를 "이미 업로드됨"으로
                 마킹. 이 시점 이후에 새로 추가되는 scene 만 업로드.
                 (과거 sync 가 R2 에 이미 올린 자산을 재업로드 하지 않음)
  --full-sync  state.completed 전체를 강제 재업로드. 처음 셋업 시 또는
                 R2 가 빈 상태에서 사용.
  (옵션 없음)  델타 모드. .r2_uploaded.json 트래커 기준으로 신규만 업로드.

사용법:
  python tools/r2_sync_loop.py --baseline   # 한 번만, 트래커 초기화
  python tools/r2_sync_loop.py               # 이후 일반 실행 (백그라운드 추천)
  python tools/r2_sync_loop.py --once        # 1 사이클만 돌고 종료

종료:
  Ctrl+C 또는 SIGINT — 트래커 저장 후 정상 종료.

배경 실행 (Git Bash):
  nohup python tools/r2_sync_loop.py > tools/r2_sync.log 2>&1 &
  echo $! > tools/r2_sync.pid
"""
from __future__ import annotations

import argparse
import io
import json
import os
import shutil
import signal
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Windows CP949 → UTF-8 강제 (프로젝트 경로에 한자 포함)
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

# ─── 경로 ─────────────────────────────────────────────────────
TOOLS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TOOLS_DIR.parent
CHAR_IMG = PROJECT_ROOT / "char_img"
STATE_PATH = TOOLS_DIR / "generation_state.json"
TRACKER_PATH = TOOLS_DIR / ".r2_uploaded.json"

# ─── ALL_CHARS 필터 (utils.py 와 단일 진실 공급원 공유) ──────
sys.path.insert(0, str(TOOLS_DIR))
from utils import ALL_CHARS  # noqa: E402
ALLOWED_CHARS: frozenset[str] = frozenset(ALL_CHARS)
CONFIG_PATH = TOOLS_DIR / "asset_config.json"

# ─── 특수씬 output_path 매핑 (asset_config.json 에서 로드) ────
def _load_special_paths() -> dict[int, str]:
    """900+ 씬의 output_path 매핑을 asset_config.json 에서 로드."""
    try:
        cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        mapping: dict[int, str] = {}
        for sid, s in cfg.get("scenes", {}).items():
            op = s.get("output_path")
            if op:
                mapping[int(sid)] = op
        return mapping
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

SPECIAL_OUTPUT_PATHS: dict[int, str] = _load_special_paths()

# ─── R2 ──────────────────────────────────────────────────────
BUCKET = "prime"
R2_PREFIX = "ent"
POLL_INTERVAL = 30  # 초
NOTIFY_EVERY = 30   # 누적 N장 업로드마다 강조 알림 출력

def _find_wrangler() -> str:
    """프로젝트 로컬 (node_modules/.bin) 우선, fallback 으로 PATH 검색.

    글로벌 wrangler 가 deprecated 1.x 일 가능성이 있어 (r2 object 미지원),
    package.json 에 명시된 4.x 로컬 설치를 우선 사용한다.
    """
    local_dir = PROJECT_ROOT / "node_modules" / ".bin"
    candidates = [
        local_dir / "wrangler.cmd",  # Windows
        local_dir / "wrangler",      # Unix
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    fallback = shutil.which("wrangler") or shutil.which("wrangler.cmd")
    if fallback:
        print(f"⚠ 프로젝트 로컬 wrangler 미발견, 글로벌 사용: {fallback}", file=sys.stderr)
        print("   글로벌이 wrangler 1.x (deprecated) 면 r2 object 명령이 실패합니다.",
              file=sys.stderr)
        return fallback
    print("ERROR: wrangler 를 찾을 수 없습니다. 프로젝트 루트에서 `npm install` 실행.",
          file=sys.stderr)
    sys.exit(1)


WRANGLER_BIN = _find_wrangler()


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def load_state() -> dict:
    """state.json 안전 read — 동시 write 중일 때 JSONDecodeError retry."""
    for attempt in range(3):
        try:
            return json.loads(STATE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, FileNotFoundError):
            if attempt == 2:
                return {"completed": {}}
            time.sleep(0.5)
    return {"completed": {}}


def load_tracker() -> set[str]:
    if TRACKER_PATH.exists():
        try:
            data = json.loads(TRACKER_PATH.read_text(encoding="utf-8"))
            return set(data.get("uploaded", []))
        except json.JSONDecodeError:
            log(f"⚠ {TRACKER_PATH.name} 손상 — 빈 set으로 시작")
    return set()


def save_tracker(uploaded: set[str]) -> None:
    payload = {
        "uploaded": sorted(uploaded),
        "last_updated": datetime.now().isoformat(timespec="seconds"),
    }
    TRACKER_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def collect_completed_keys(state: dict) -> list[tuple[str, int]]:
    """state.completed → [(char, num), ...] — ALL_CHARS 화이트리스트만."""
    out: list[tuple[str, int]] = []
    for char, scenes in state.get("completed", {}).items():
        if char not in ALLOWED_CHARS:
            continue  # JSH 등 ALL_CHARS 에서 제외된 캐릭은 sync 안 함
        for num in scenes:
            out.append((char, int(num)))
    return out


def upload_one(char: str, num: int) -> tuple[bool, str]:
    """wrangler r2 object put. (success, msg).

    특수씬(900+)은 asset_config.json 의 output_path 를 참조하여
    로컬 파일 경로와 R2 키를 결정한다.
    예: scene 911 → output_path="thumbnail.webp" → {char}/thumbnail.webp
    """
    custom = SPECIAL_OUTPUT_PATHS.get(num)
    if custom:
        resolved = custom.replace("{code}", char)
        src = CHAR_IMG / char / resolved
        r2_rel = f"{char}/{resolved}"
    else:
        src = CHAR_IMG / char / f"{num}.webp"
        r2_rel = f"{char}/{num}.webp"
    if not src.exists():
        return False, f"missing local file: {src}"
    key = f"{BUCKET}/{R2_PREFIX}/{r2_rel}"
    cmd = [
        WRANGLER_BIN, "r2", "object", "put", key,
        "--file", str(src),
        "--content-type", "image/webp",
        "--remote",
    ]
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",     # Windows cp949 회피 — wrangler 는 UTF-8 출력
            errors="replace",
            timeout=60,
        )
    except subprocess.TimeoutExpired:
        return False, "wrangler timeout (60s)"
    except FileNotFoundError:
        return False, f"binary not found: {WRANGLER_BIN}"

    # 성공 판정은 returncode 만 신뢰. wrangler 는 성공 시 0, 실패 시 0 이 아닌 코드를 반환.
    if proc.returncode == 0:
        return True, "ok"
    out = (proc.stdout or "") + (proc.stderr or "")
    last_line = out.strip().splitlines()[-1] if out.strip() else f"exit {proc.returncode}"
    return False, last_line


def sync_once(uploaded: set[str], dry_run: bool = False,
              session_state: dict | None = None) -> tuple[int, int]:
    """Returns (newly_uploaded, failed).

    session_state: {'cumulative': int, 'milestone': int} — 30장 단위 알림용.
    호출자가 dict를 전달하면 sync_once 내부에서 누적 카운터를 갱신하고,
    매 NOTIFY_EVERY 장마다 강조 로그를 출력한다.
    """
    state = load_state()
    pending = []
    for char, num in collect_completed_keys(state):
        key = f"{char}/{num}"
        if key not in uploaded:
            pending.append((char, num, key))

    if not pending:
        return 0, 0

    log(f"📤 {len(pending)}개 신규 업로드 시작...")
    ok = 0
    fail = 0
    for char, num, key in pending:
        if dry_run:
            log(f"  DRY {key}")
            ok += 1
            continue
        success, msg = upload_one(char, num)
        if success:
            uploaded.add(key)
            ok += 1
            if ok % 10 == 0:
                save_tracker(uploaded)  # 10장마다 트래커 저장 (interrupt 방어)
            # ── 30장 누적마다 강조 알림 ──
            # session_state 가 전달된 경우에만 동작 (지속 실행 모드)
            if session_state is not None:
                session_state["cumulative"] += 1
                if session_state["cumulative"] >= session_state["milestone"]:
                    log(f"🎯 ━━━━━━ 누적 {session_state['cumulative']}장 업로드 완료 ━━━━━━")
                    session_state["milestone"] += NOTIFY_EVERY
        else:
            fail += 1
            log(f"  ✖ {key} — {msg[:80]}")
    save_tracker(uploaded)
    log(f"  ✓ {ok}장 업로드 / ✖ {fail}장 실패")
    return ok, fail


def baseline_mode() -> None:
    state = load_state()
    keys = {f"{c}/{n}" for c, n in collect_completed_keys(state)}
    save_tracker(keys)
    log(f"✓ baseline: {len(keys)}개 키를 '이미 업로드됨'으로 마킹")
    log(f"  ({TRACKER_PATH})")
    log("  이제 옵션 없이 실행하면 이 시점 이후 신규분만 업로드됩니다.")


def main() -> None:
    parser = argparse.ArgumentParser(description="char_img → R2 concurrent sync loop")
    parser.add_argument("--baseline", action="store_true",
                        help="현재 state.completed 전체를 'uploaded' 트래커에 마킹하고 종료")
    parser.add_argument("--full-sync", action="store_true",
                        help="트래커 무시하고 state.completed 전체를 재업로드")
    parser.add_argument("--once", action="store_true",
                        help="1 사이클만 돌고 종료 (테스트용)")
    parser.add_argument("--dry-run", action="store_true",
                        help="실제 wrangler 호출 없이 대상만 출력")
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL,
                        help=f"polling 주기 초 (default: {POLL_INTERVAL})")
    args = parser.parse_args()

    if args.baseline:
        baseline_mode()
        return

    if args.full_sync:
        log("⚠ --full-sync: 트래커 초기화")
        uploaded: set[str] = set()
    else:
        uploaded = load_tracker()
        log(f"트래커 로드: {len(uploaded)}개 기존 업로드 기록")

    log(f"polling interval: {args.interval}s")
    log(f"watching: {STATE_PATH}")
    log(f"local source: {CHAR_IMG}")
    log(f"R2 target: {BUCKET}/{R2_PREFIX}/")
    if args.dry_run:
        log("⚠ DRY RUN — wrangler 호출 안 함")

    # ─── Signal handler ───
    def graceful_exit(signum, frame):
        log("📥 종료 신호 수신 — 트래커 저장 후 종료")
        save_tracker(uploaded)
        sys.exit(0)

    signal.signal(signal.SIGINT, graceful_exit)
    signal.signal(signal.SIGTERM, graceful_exit)

    # 30장 누적 알림용 세션 상태 — sync_once 가 카운터를 증가시키며
    # milestone 도달 시 강조 로그를 출력하고 다음 milestone 으로 전진
    session_state = {"cumulative": 0, "milestone": NOTIFY_EVERY}

    cycles = 0
    while True:
        cycles += 1
        try:
            ok, fail = sync_once(uploaded, dry_run=args.dry_run,
                                 session_state=session_state)
            if ok == 0 and fail == 0 and cycles % 10 == 0:
                log(f"  [cycle {cycles}] no new files (uploaded total: {len(uploaded)})")
        except Exception as e:
            log(f"⚠ sync_once exception: {e}")

        if args.once:
            log("--once 모드: 1 사이클 완료, 종료")
            return

        time.sleep(args.interval)


if __name__ == "__main__":
    main()
