#!/usr/bin/env python3
"""r2_fullsync.py — 검증된 char_img release를 공개/비공개 R2로 재업로드.

이미지는 prime/ent, 민감한 JSON sidecar는 private prime-metadata/ent에 저장한다.
after manifest의 로컬 해시가 일치하는 파일만 업로드한다.

사용:
  py tools/r2_fullsync.py                 # 기본 8 workers
  py tools/r2_fullsync.py --workers 12    # 병렬 수 증가
  py tools/r2_fullsync.py --dry-run       # 대상만 출력
  py tools/r2_fullsync.py --only-failed   # 직전 실행의 실패분만 재시도
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
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
CHAR_METADATA = ROOT / "char_img_metadata"
TRACKER = TOOLS / ".r2_uploaded.json"
FAILED_PATH = TOOLS / ".r2_fullsync_failed.json"
DEFAULT_MANIFEST = CHAR_METADATA / "_manifest.after.json"

BUCKET = "prime"
R2_PREFIX = "ent"
METADATA_BUCKET = "prime-metadata"
R2_METADATA_PREFIX = "ent"
CDN_BASE = "https://img.bluehair.blue/ent"


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


def load_manifest(path: Path) -> tuple[dict, dict[str, dict]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("kind") != "after" or data.get("count") != len(data.get("entries", [])):
        raise ValueError(f"invalid after manifest: {path}")
    entries = {item["path"]: item for item in data["entries"]}
    if len(entries) != data["count"]:
        raise ValueError("manifest contains duplicate paths")
    return data, entries


def collect_files(entries: dict[str, dict]) -> list[Path]:
    files = [CHAR_IMG / Path(rel) for rel in sorted(entries)]
    missing = [str(path) for path in files if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"manifest files missing: {missing[:3]}")
    return files


def file_digest(path: Path, algorithm: str) -> str:
    value = hashlib.new(algorithm)
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def _run_wrangler_put(src: Path, key: str, content_type: str,
                      timeout: int = 180) -> tuple[bool, str]:
    cmd = [
        WRANGLER, "r2", "object", "put", key,
        "--file", str(src),
        "--content-type", content_type,
        "--remote",
    ]
    try:
        p = subprocess.run(
            cmd, capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return False, f"timeout ({timeout}s)"
    except FileNotFoundError:
        return False, f"wrangler not found: {WRANGLER}"
    if p.returncode == 0:
        return True, ""
    out = (p.stdout or "") + (p.stderr or "")
    last = out.strip().splitlines()[-1] if out.strip() else f"exit {p.returncode}"
    return False, last[:160]


def _run_wrangler_get(key: str, expected_sha256: str, timeout: int = 180) -> tuple[bool, str]:
    with tempfile.TemporaryDirectory(prefix="prime-r2-verify-") as temp:
        destination = Path(temp) / "object"
        cmd = [
            WRANGLER, "r2", "object", "get", key,
            "--file", str(destination), "--remote",
        ]
        try:
            proc = subprocess.run(
                cmd, capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return False, f"get timeout ({timeout}s)"
        if proc.returncode != 0:
            output = (proc.stdout or "") + (proc.stderr or "")
            last = output.strip().splitlines()[-1] if output.strip() else f"exit {proc.returncode}"
            return False, last[:160]
        if not destination.exists():
            return False, "get succeeded without output file"
        actual = file_digest(destination, "sha256")
        return (actual == expected_sha256, "" if actual == expected_sha256 else "download SHA-256 mismatch")


def verify_public_image(src: Path, rel: str, asset_version: int) -> tuple[bool, str]:
    encoded = urllib.parse.quote(rel, safe="/")
    url = f"{CDN_BASE}/{encoded}?v={asset_version}"
    expected_size = src.stat().st_size
    expected_md5 = file_digest(src, "md5")
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, method="HEAD", headers={
                "Cache-Control": "no-cache",
                "User-Agent": "Mozilla/5.0 (compatible; PrimeCity-R2-Verify/1.0)",
                "Accept": "image/webp,*/*;q=0.8",
            })
            with urllib.request.urlopen(request, timeout=30) as response:
                size = int(response.headers.get("Content-Length", "-1"))
                etag = response.headers.get("ETag", "").strip('"').lower()
            if size == expected_size and etag == expected_md5:
                return True, ""
            message = f"HEAD mismatch size={size}/{expected_size} etag={etag}/{expected_md5}"
        except (OSError, urllib.error.URLError, ValueError) as error:
            message = f"HEAD failed: {error}"
        if attempt < 2:
            time.sleep(2 ** attempt)
    return False, message


def upload_one(f: Path, entry: dict, verify_public: bool, asset_version: int,
               verify_private: bool) -> tuple[str, bool, str]:
    rel = f.relative_to(CHAR_IMG).as_posix()
    if file_digest(f, "sha256") != entry["sha256"]:
        return rel, False, "local image SHA-256 differs from manifest"
    key = f"{BUCKET}/{R2_PREFIX}/{rel}"
    success, msg = _run_wrangler_put(f, key, "image/webp")
    if not success:
        return rel, False, msg
    if verify_public:
        success, msg = verify_public_image(f, rel, asset_version)
        if not success:
            return rel, False, f"public verification failed: {msg}"

    meta_src = CHAR_METADATA / Path(rel).with_suffix(".json")
    if not meta_src.exists():
        return rel, False, "metadata sidecar missing"
    if file_digest(meta_src, "sha256") != entry["metadata_sha256"]:
        return rel, False, "local metadata SHA-256 differs from manifest"
    meta_rel = meta_src.relative_to(CHAR_METADATA).as_posix()
    meta_key = f"{METADATA_BUCKET}/{R2_METADATA_PREFIX}/{meta_rel}"
    success, msg = _run_wrangler_put(meta_src, meta_key, "application/json")
    if not success:
        return rel, False, f"metadata upload failed: {msg}"
    if verify_private:
        success, msg = _run_wrangler_get(meta_key, entry["metadata_sha256"])
        if not success:
            return rel, False, f"private metadata verification failed: {msg}"
    return rel, True, ""


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


def upload_release_manifests(after_manifest: Path, verify_private: bool) -> tuple[bool, str]:
    for source in (after_manifest.with_name("_manifest.before.json"), after_manifest):
        if not source.exists():
            return False, f"release manifest missing: {source}"
        key = f"{METADATA_BUCKET}/{R2_METADATA_PREFIX}/{source.name}"
        success, message = _run_wrangler_put(source, key, "application/json")
        if not success:
            return False, f"{source.name}: {message}"
        if verify_private:
            success, message = _run_wrangler_get(key, file_digest(source, "sha256"))
            if not success:
                return False, f"{source.name} verification: {message}"
    return True, ""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--asset-version", type=int, default=29,
                        help="public CDN verification query version")
    parser.add_argument("--no-public-verify", action="store_true",
                        help="skip per-image public CDN HEAD size/ETag verification")
    parser.add_argument("--verify-private", action="store_true",
                        help="download every private sidecar after upload and compare SHA-256")
    parser.add_argument("--only-failed", action="store_true",
                        help=".r2_fullsync_failed.json 에 기록된 실패분만 재시도")
    args = parser.parse_args()

    manifest_path = args.manifest.resolve()
    manifest, entries = load_manifest(manifest_path)

    if args.only_failed:
        if not FAILED_PATH.exists():
            log("실패 기록 없음 — 재시도할 게 없음")
            return
        data = json.loads(FAILED_PATH.read_text(encoding="utf-8"))
        files = [CHAR_IMG / item["path"] for item in data.get("failed", [])]
        files = [f for f in files if f.exists() and f.relative_to(CHAR_IMG).as_posix() in entries]
        log(f"재시도 대상: {len(files)}장")
    else:
        files = collect_files(entries)
        log(f"전수 재업로드 대상: {len(files)}장")

    log(f"workers={args.workers}  R2={BUCKET}/{R2_PREFIX}/")
    log(f"private metadata={METADATA_BUCKET}/{R2_METADATA_PREFIX}/")
    log(f"manifest release={manifest.get('release_version')} count={manifest.get('count')}")
    log(f"wrangler: {WRANGLER}")

    if args.dry_run:
        for f in files[:20]:
            rel = f.relative_to(CHAR_IMG).as_posix()
            print("DRY", rel)
            meta_src = CHAR_METADATA / Path(rel).with_suffix(".json")
            if meta_src.exists():
                print("DRY metadata", f"{METADATA_BUCKET}/{R2_METADATA_PREFIX}/{meta_src.relative_to(CHAR_METADATA).as_posix()}")
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
        futs = {}
        for f in files:
            rel = f.relative_to(CHAR_IMG).as_posix()
            futs[pool.submit(
                upload_one,
                f,
                entries[rel],
                not args.no_public_verify,
                args.asset_version,
                args.verify_private,
            )] = f
        done = 0
        for fut in as_completed(futs):
            try:
                rel, success, msg = fut.result()
            except Exception as error:
                rel = futs[fut].relative_to(CHAR_IMG).as_posix()
                success, msg = False, str(error)
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
    if not failures:
        success, message = upload_release_manifests(manifest_path, args.verify_private)
        if not success:
            failures.append(("_manifests", message))
            fail += 1
    save_failed(failures)
    elapsed = time.time() - start
    log("=== 완료 ===")
    log(f"총 {total} | ok={ok} | fail={fail} | elapsed={elapsed/60:.1f}min")
    if failures:
        log(f"실패 {len(failures)}건 — .r2_fullsync_failed.json 에 기록됨")
        log("재시도: py tools/r2_fullsync.py --only-failed")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
