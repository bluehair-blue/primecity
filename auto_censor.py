#!/usr/bin/env python3
"""
auto_censor.py — 수평 라인 밀도 기반 성기 검열
================================================
NAI 애니메이션 이미지에서 성기(pussy/penis/pubic hair)만 검출하여
바 검열을 적용합니다. 유두/가슴은 검열하지 않습니다.

원리:
  1. 이미지 하단 60%만 스캔 (성기는 상단에 없음)
  2. 각 수평 라인의 핑크(S≥80) 밀도 계산
  3. 밀도 피크 클러스터 = 성기 위치
  4. 해당 Y범위 + X범위에 바 검열

사용법:
  python auto_censor.py SY/51.webp                    # 단일, 미리보기
  python auto_censor.py SY/51.webp --threshold 8      # 임계값 조정
  python auto_censor.py --batch SY                     # 캐릭터 NSFW 전체
  python auto_censor.py --batch-all                    # 15명 전체
  python auto_censor.py --batch SY --preview           # 미리보기 포함
  python auto_censor.py --batch-all --workers 8        # 병렬 처리
"""

import argparse
import logging
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

try:
    from PIL import Image as PILImage
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# ═══════════════════════════════════════════════════════════════
#  Logging
# ═══════════════════════════════════════════════════════════════

LOG_PATH = Path(__file__).parent / "censor.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("censor")

# ═══════════════════════════════════════════════════════════════
#  Constants
# ═══════════════════════════════════════════════════════════════

BASE_DIR = Path(__file__).parent / "캐릭터 이미지"

NSFW_SCENES = list(range(20, 43)) + list(range(50, 68)) + list(range(70, 79)) + list(range(80, 87))

ALL_CHARS = ["SY", "NHR", "JSH", "ERK", "LSH", "HSR", "KHR",
             "JGR", "MIL", "ELA", "MMR", "HSE", "NIA", "RAY", "LPS"]

# Pink/Red HSV range (S>=80 eliminates blush/lips, keeps genital highlight)
HSV_LOWER_1 = np.array([0, 80, 100])
HSV_UPPER_1 = np.array([10, 255, 255])
HSV_LOWER_2 = np.array([170, 80, 100])
HSV_UPPER_2 = np.array([179, 255, 255])


# ═══════════════════════════════════════════════════════════════
#  Image I/O
# ═══════════════════════════════════════════════════════════════

def load_image(path):
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None and HAS_PIL:
        pil = PILImage.open(str(path)).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return img


def save_image(img, path):
    path = str(path)
    if path.lower().endswith(".webp") and HAS_PIL:
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        PILImage.fromarray(rgb).save(path, "WEBP", quality=92)
    else:
        cv2.imwrite(path, img)


# ═══════════════════════════════════════════════════════════════
#  Core: Line Density Scan → Bar Censor
# ═══════════════════════════════════════════════════════════════

def find_genital_region(
    image: np.ndarray,
    scan_top_ratio: float = 0.4,
    density_threshold: float = 5.0,
    gap_tolerance: int = 20,
    pad_y: int = 15,
    pad_x: int = 30,
) -> Optional[tuple[int, int, int, int]]:
    """
    하단 영역에서 핑크 밀도가 높은 수평 라인 클러스터를 찾아
    성기 영역의 (x1, y1, x2, y2)를 반환합니다.

    Returns:
        (x1, y1, x2, y2) or None if no region found
    """
    h, w = image.shape[:2]
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Pink mask
    m1 = cv2.inRange(hsv, HSV_LOWER_1, HSV_UPPER_1)
    m2 = cv2.inRange(hsv, HSV_LOWER_2, HSV_UPPER_2)
    mask = cv2.bitwise_or(m1, m2)

    # Only scan bottom portion
    start_y = int(h * scan_top_ratio)
    bottom = mask[start_y:, :]

    # Row-wise density (percentage of pink pixels per row)
    row_density = np.mean(bottom > 0, axis=1) * 100

    # Find rows above threshold
    peak_rows = np.where(row_density > density_threshold)[0]
    if len(peak_rows) == 0:
        return None

    # Cluster contiguous rows (allow small gaps)
    clusters: list[list[int]] = []
    current = [peak_rows[0]]
    for i in range(1, len(peak_rows)):
        if peak_rows[i] - peak_rows[i - 1] <= gap_tolerance:
            current.append(peak_rows[i])
        else:
            clusters.append(current)
            current = [peak_rows[i]]
    clusters.append(current)

    # Pick the cluster with highest total density
    best = max(clusters, key=lambda c: float(np.sum(row_density[c])))

    # Y range (absolute coordinates)
    y1 = max(0, best[0] + start_y - pad_y)
    y2 = min(h, best[-1] + start_y + pad_y)

    # X range: contour-based bounding box (tighter than min/max columns)
    region_mask = mask[y1:y2, :]
    contours, _ = cv2.findContours(region_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        # Pick largest contour by area
        largest = max(contours, key=cv2.contourArea)
        rx, ry, rw, rh = cv2.boundingRect(largest)
        x1 = max(0, rx - pad_x)
        x2 = min(w, rx + rw + pad_x)
    else:
        # Fallback: column-wise scan
        col_has_pink = np.any(region_mask > 0, axis=0)
        pink_cols = np.where(col_has_pink)[0]
        if len(pink_cols) > 0:
            x1 = max(0, pink_cols[0] - pad_x)
            x2 = min(w, pink_cols[-1] + pad_x)
        else:
            x1, x2 = 0, w

    return (x1, y1, x2, y2)


def apply_bar_censor(
    image: np.ndarray,
    region: tuple[int, int, int, int],
    color: tuple[int, int, int] = (0, 0, 0),
) -> np.ndarray:
    """바운딩 영역에 단색 바 검열 적용."""
    result = image.copy()
    x1, y1, x2, y2 = region
    cv2.rectangle(result, (x1, y1), (x2, y2), color, cv2.FILLED)
    return result


def save_preview(
    image: np.ndarray,
    mask_info: Optional[tuple[int, int, int, int]],
    path: str,
) -> None:
    """디버그 미리보기: 원본 + 검출 영역 표시."""
    preview = image.copy()
    if mask_info:
        x1, y1, x2, y2 = mask_info
        cv2.rectangle(preview, (x1, y1), (x2, y2), (0, 0, 255), 2)
        label = f"CENSOR {x2-x1}x{y2-y1}"
        cv2.putText(preview, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
    h = image.shape[0]
    scan_y = int(h * 0.4)
    cv2.line(preview, (0, scan_y), (image.shape[1], scan_y), (0, 255, 255), 1)
    cv2.putText(preview, "scan start", (5, scan_y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)
    cv2.imwrite(str(path), preview)


# ═══════════════════════════════════════════════════════════════
#  Single & Batch Processing
# ═══════════════════════════════════════════════════════════════

def process_single(
    input_path: str,
    output_path: Optional[str] = None,
    threshold: float = 5.0,
    color: tuple[int, int, int] = (0, 0, 0),
    preview: bool = False,
    verbose: bool = True,
) -> dict:
    """단일 이미지 처리."""
    input_path = str(input_path)
    image = load_image(input_path)
    if image is None:
        log.error(f"Cannot load: {input_path}")
        return {"path": input_path, "success": False}

    if output_path is None:
        p = Path(input_path)
        output_path = str(p.parent / f"{p.stem}_censored{p.suffix}")

    region = find_genital_region(image, density_threshold=threshold)

    if region:
        x1, y1, x2, y2 = region
        result = apply_bar_censor(image, region, color)
        save_image(result, output_path)
        if verbose:
            log.info(f"  {Path(input_path).name} → bar {x2-x1}x{y2-y1} at y={y1}-{y2}")
    else:
        save_image(image, output_path)
        if verbose:
            log.info(f"  {Path(input_path).name} → no detection")

    if preview:
        preview_path = str(Path(output_path).parent / f"{Path(output_path).stem}_preview.jpg")
        save_preview(image, region, preview_path)
        if verbose:
            log.info(f"    preview → {Path(preview_path).name}")

    return {"path": input_path, "success": True, "detected": region is not None}


def _worker(args: tuple) -> dict:
    path, out, threshold, color = args
    try:
        return process_single(path, out, threshold, color, preview=False, verbose=False)
    except Exception as e:
        log.error(f"Worker failed: {path} — {e}")
        return {"path": path, "success": False, "error": str(e)}


def process_batch(char_codes, scene_nums, threshold=5.0, color=(0, 0, 0),
                  workers=4, preview_first=0, verbose=True):
    """다중 캐릭터 배치 처리."""
    tasks = []
    for code in char_codes:
        for num in scene_nums:
            src = BASE_DIR / code / f"{num}.webp"
            if src.exists():
                tasks.append((str(src), str(src), threshold, color))

    if verbose:
        log.info(f"{len(tasks)} images ({len(char_codes)} chars)")

    # Preview first N for visual check
    if preview_first > 0:
        log.info(f"Previewing first {min(preview_first, len(tasks))} images...")
        for t in tasks[:preview_first]:
            process_single(t[0], t[1], threshold, color, preview=True, verbose=True)
        log.info("Check preview files. Continue with full batch? (remaining will overwrite originals)")
        return

    results = []
    if workers > 1 and len(tasks) > 4:
        with ProcessPoolExecutor(max_workers=workers) as pool:
            results = list(pool.map(_worker, tasks))
    else:
        for t in tasks:
            r = _worker(t)
            results.append(r)

    detected = sum(1 for r in results if r.get("detected"))
    failed = sum(1 for r in results if not r.get("success"))
    if verbose:
        log.info(f"Done. {len(results)} processed, {detected} censored, {failed} failed")


# ═══════════════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════════════

def parse_scene_range(s):
    nums = []
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-", 1)
            nums.extend(range(int(a), int(b) + 1))
        else:
            nums.append(int(part))
    return sorted(set(nums))


def main():
    parser = argparse.ArgumentParser(description="수평 라인 밀도 기반 성기 바 검열 (NAI 애니메이션)")

    group = parser.add_mutually_exclusive_group()
    group.add_argument("input", nargs="?", help="단일 이미지")
    group.add_argument("--batch", metavar="CHARS", help="캐릭터 코드 (예: SY 또는 SY,NHR)")
    group.add_argument("--batch-all", action="store_true", help="전체 15명")

    parser.add_argument("--scenes", default="20-42,50-67,70-78,80-86", help="장면 범위")
    parser.add_argument("--threshold", type=float, default=5.0, help="행 밀도 임계값 %% (기본: 5)")
    parser.add_argument("--color", nargs=3, type=int, default=[0, 0, 0], metavar=("B", "G", "R"))
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--preview", action="store_true", help="미리보기 저장")
    parser.add_argument("--preview-first", type=int, default=0, help="배치에서 처음 N장만 미리보기")
    parser.add_argument("-o", "--output", help="출력 경로 (단일)")

    args = parser.parse_args()

    color = tuple(args.color)

    if args.batch_all:
        scenes = parse_scene_range(args.scenes)
        process_batch(ALL_CHARS, scenes, args.threshold, color, args.workers, args.preview_first)

    elif args.batch:
        chars = [c.strip().upper() for c in args.batch.split(",")]
        scenes = parse_scene_range(args.scenes)
        process_batch(chars, scenes, args.threshold, color, args.workers, args.preview_first)

    elif args.input:
        process_single(args.input, args.output, args.threshold, color, args.preview)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
