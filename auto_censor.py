#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "opencv-python-headless",
#     "numpy",
#     "pillow",
# ]
# ///
"""
auto_censor.py — 개별 contour 형태 맞춤 성기 검열
====================================================
NAI 애니메이션 이미지에서 성기(pussy/penis)만 검출하여
형태에 맞는 자연스러운 검열을 적용합니다.

원리:
  1. 이미지 하단 60%만 스캔
  2. 핑크/레드(S≥80) 마스크 생성
  3. 모폴로지로 인접 영역 병합 (close → dilate)
  4. 각 contour의 면적/위치로 성기 여부 판별
  5. 해당 contour 형태 그대로 검은색 채우기

사용법:
  python auto_censor.py SY/51.webp --preview          # 단일 + 미리보기
  python auto_censor.py SY/51.webp --mode bbox         # 직사각형 모드
  python auto_censor.py --batch SY                     # 캐릭터 NSFW 전체
  python auto_censor.py --batch-all                    # 15명 전체
  python auto_censor.py --batch-all --min-area 300     # 최소 면적 조정
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

# Pink/Red HSV (S>=80 eliminates blush)
# S>=100 eliminates blush/lips/ears completely while keeping genital pink
HSV_LOWER_1 = np.array([0, 100, 100])
HSV_UPPER_1 = np.array([10, 255, 255])
HSV_LOWER_2 = np.array([170, 100, 100])
HSV_UPPER_2 = np.array([179, 255, 255])


# ═══════════════════════════════════════════════════════════════
#  Image I/O
# ═══════════════════════════════════════════════════════════════

def load_image(path: str) -> Optional[np.ndarray]:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None and HAS_PIL:
        pil = PILImage.open(str(path)).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return img


def save_image(img: np.ndarray, path: str) -> None:
    path = str(path)
    if path.lower().endswith(".webp") and HAS_PIL:
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        PILImage.fromarray(rgb).save(path, "WEBP", quality=92)
    else:
        cv2.imwrite(path, img)


# ═══════════════════════════════════════════════════════════════
#  Core: Contour-Based Genital Detection
# ═══════════════════════════════════════════════════════════════

def find_genital_contours(
    image: np.ndarray,
    scan_top_ratio: float = 0.5,
    min_area: int = 500,
    close_kernel: int = 15,
    dilate_kernel: int = 11,
    dilate_iter: int = 1,
) -> tuple[list, int]:
    """
    하단 영역에서 핑크 밀집 contour들을 개별 검출합니다.

    Returns:
        (contours_absolute, start_y) — 원본 좌표계 contour 목록 + 스캔 시작 Y
    """
    h, w = image.shape[:2]
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Pink mask
    m1 = cv2.inRange(hsv, HSV_LOWER_1, HSV_UPPER_1)
    m2 = cv2.inRange(hsv, HSV_LOWER_2, HSV_UPPER_2)
    mask = cv2.bitwise_or(m1, m2)

    # Crop to bottom portion only
    start_y = int(h * scan_top_ratio)
    bottom = mask[start_y:, :]

    # Morphology: close gaps between nearby pink pixels, then dilate slightly
    k_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_kernel, close_kernel))
    k_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate_kernel, dilate_kernel))

    refined = cv2.morphologyEx(bottom, cv2.MORPH_CLOSE, k_close, iterations=2)
    refined = cv2.dilate(refined, k_dilate, iterations=dilate_iter)

    # Find contours
    contours, _ = cv2.findContours(refined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter by area and offset to absolute coordinates
    valid = []
    for cnt in contours:
        if cv2.contourArea(cnt) >= min_area:
            # Offset Y to absolute image coordinates
            cnt_abs = cnt.copy()
            cnt_abs[:, :, 1] += start_y
            valid.append(cnt_abs)

    return valid, start_y


def apply_contour_censor(
    image: np.ndarray,
    contours: list,
    mode: str = "fill",
    color: tuple[int, int, int] = (0, 0, 0),
    pad: int = 5,
) -> np.ndarray:
    """
    검출된 contour에 검열 적용.

    mode:
      "fill"  — contour 형태 그대로 채우기 (자연스러운 검열)
      "bbox"  — contour별 직사각형 바
    """
    result = image.copy()

    if mode == "fill":
        # Dilate contours slightly for coverage margin
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        cv2.drawContours(mask, contours, -1, 255, cv2.FILLED)
        if pad > 0:
            k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (pad * 2 + 1, pad * 2 + 1))
            mask = cv2.dilate(mask, k, iterations=1)
        result[mask > 0] = color

    elif mode == "bbox":
        for cnt in contours:
            x, y, bw, bh = cv2.boundingRect(cnt)
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(image.shape[1], x + bw + pad)
            y2 = min(image.shape[0], y + bh + pad)
            cv2.rectangle(result, (x1, y1), (x2, y2), color, cv2.FILLED)

    return result


def save_preview(
    image: np.ndarray,
    contours: list,
    start_y: int,
    path: str,
) -> None:
    """디버그 미리보기: 원본 + contour 윤곽선 + bbox."""
    preview = image.copy()

    # Scan boundary
    cv2.line(preview, (0, start_y), (image.shape[1], start_y), (0, 255, 255), 1)
    cv2.putText(preview, "scan start", (5, start_y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)

    # Contour outlines (green) + bbox (red)
    cv2.drawContours(preview, contours, -1, (0, 255, 0), 2)
    for cnt in contours:
        x, y, bw, bh = cv2.boundingRect(cnt)
        area = cv2.contourArea(cnt)
        cv2.rectangle(preview, (x, y), (x + bw, y + bh), (0, 0, 255), 1)
        cv2.putText(preview, f"{area:.0f}px", (x, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)

    cv2.imwrite(str(path), preview)


# ═══════════════════════════════════════════════════════════════
#  Processing
# ═══════════════════════════════════════════════════════════════

def process_single(
    input_path: str,
    output_path: Optional[str] = None,
    mode: str = "fill",
    min_area: int = 500,
    color: tuple[int, int, int] = (0, 0, 0),
    preview: bool = False,
    verbose: bool = True,
) -> dict:
    input_path = str(input_path)
    image = load_image(input_path)
    if image is None:
        log.error(f"Cannot load: {input_path}")
        return {"path": input_path, "success": False}

    if output_path is None:
        p = Path(input_path)
        output_path = str(p.parent / f"{p.stem}_censored{p.suffix}")

    contours, start_y = find_genital_contours(image, min_area=min_area)

    if contours:
        result = apply_contour_censor(image, contours, mode=mode, color=color)
        save_image(result, output_path)
        total_area = sum(cv2.contourArea(c) for c in contours)
        if verbose:
            log.info(f"  {Path(input_path).name} → {len(contours)} regions, {total_area:.0f}px² ({mode})")
    else:
        save_image(image, output_path)
        if verbose:
            log.info(f"  {Path(input_path).name} → no detection")

    if preview:
        preview_path = str(Path(output_path).parent / f"{Path(output_path).stem}_preview.jpg")
        save_preview(image, contours, start_y, preview_path)
        if verbose:
            log.info(f"    preview → {Path(preview_path).name}")

    return {"path": input_path, "success": True, "detected": len(contours) > 0, "regions": len(contours)}


def _worker(args: tuple) -> dict:
    path, out, mode, min_area, color = args
    try:
        return process_single(path, out, mode, min_area, color, preview=False, verbose=False)
    except Exception as e:
        log.error(f"Worker failed: {path} — {e}")
        return {"path": path, "success": False, "error": str(e)}


def process_batch(
    char_codes: list,
    scene_nums: list,
    mode: str = "fill",
    min_area: int = 500,
    color: tuple[int, int, int] = (0, 0, 0),
    workers: int = 4,
    preview_first: int = 0,
    verbose: bool = True,
):
    tasks = []
    for code in char_codes:
        for num in scene_nums:
            src = BASE_DIR / code / f"{num}.webp"
            if src.exists():
                tasks.append((str(src), str(src), mode, min_area, color))

    if verbose:
        log.info(f"{len(tasks)} images ({len(char_codes)} chars), mode={mode}")

    if preview_first > 0:
        log.info(f"Previewing first {min(preview_first, len(tasks))}...")
        for t in tasks[:preview_first]:
            process_single(t[0], t[1], mode, min_area, color, preview=True, verbose=True)
        log.info("Check preview files before running full batch.")
        return

    results = []
    if workers > 1 and len(tasks) > 4:
        with ProcessPoolExecutor(max_workers=workers) as pool:
            results = list(pool.map(_worker, tasks))
    else:
        for t in tasks:
            results.append(_worker(t))

    detected = sum(1 for r in results if r.get("detected"))
    failed = sum(1 for r in results if not r.get("success"))
    if verbose:
        log.info(f"Done. {len(results)} processed, {detected} censored, {failed} failed")

    return results


# ═══════════════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════════════

def parse_scene_range(s: str) -> list:
    nums = []
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-", 1)
            nums.extend(range(int(a), int(b) + 1))
        else:
            nums.append(int(part))
    return sorted(set(nums))


def main():
    parser = argparse.ArgumentParser(description="Contour 형태 맞춤 성기 검열 (NAI 애니메이션)")

    group = parser.add_mutually_exclusive_group()
    group.add_argument("input", nargs="?", help="단일 이미지")
    group.add_argument("--batch", metavar="CHARS", help="캐릭터 코드 (예: SY 또는 SY,NHR)")
    group.add_argument("--batch-all", action="store_true", help="전체 15명")

    parser.add_argument("--scenes", default="20-42,50-67,70-78,80-86")
    parser.add_argument("--mode", choices=["fill", "bbox"], default="fill", help="fill=형태 맞춤, bbox=직사각형")
    parser.add_argument("--min-area", type=int, default=500, help="최소 검출 면적 px²")
    parser.add_argument("--color", nargs=3, type=int, default=[0, 0, 0], metavar=("B", "G", "R"))
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--preview-first", type=int, default=0)
    parser.add_argument("-o", "--output")

    args = parser.parse_args()
    color = tuple(args.color)

    if args.batch_all:
        process_batch(ALL_CHARS, parse_scene_range(args.scenes), args.mode, args.min_area, color, args.workers, args.preview_first)
    elif args.batch:
        chars = [c.strip().upper() for c in args.batch.split(",")]
        process_batch(chars, parse_scene_range(args.scenes), args.mode, args.min_area, color, args.workers, args.preview_first)
    elif args.input:
        process_single(args.input, args.output, args.mode, args.min_area, color, args.preview)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
