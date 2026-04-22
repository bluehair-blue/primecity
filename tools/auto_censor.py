#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "opencv-python-headless",
#     "numpy",
#     "pillow",
#     "ultralytics",
# ]
# ///
"""
auto_censor.py — YOLO 세그멘테이션 + 형태 복원 기반 성기 검열
==============================================================
ntd11 v5 (YOLOv11s-seg) 모델로 pussy/penis/anus를 감지한 뒤,
ROI 제한 → closing → flood fill → best component → contour fill
파이프라인으로 깔끔한 검열 마스크를 생성합니다.

원칙:
  - pussy/penis/anus만 검열. nipples/testicles 무시.
  - 성기 미감지 → 원본 유지 (재저장 안 함 = 품질 열화 0)
  - edge-driven 확장 대신 "이미 찾은 마스크를 복원"하는 접근

사용법:
  python auto_censor.py KHR/64.webp --preview
  python auto_censor.py --batch-all
  python auto_censor.py --batch SY --style mosaic
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import tempfile
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

try:
    from PIL import Image as PILImage, UnidentifiedImageError as PILUnidentifiedImageError
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    PILUnidentifiedImageError = OSError  # fallback: treat as OSError when PIL absent

try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

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

_TOOLS_DIR = Path(__file__).resolve().parent                   # 연예계/tools/
_PROJECT_ROOT = _TOOLS_DIR.parent                              # 연예계/
BASE_DIR = _PROJECT_ROOT / "char_img"                          # 연예계/char_img/ (이미지 원본)
MODEL_PATH = _PROJECT_ROOT / "models" / "ntd11_v5.pt"         # 연예계/models/ntd11_v5.pt
from utils import ALL_CHARS, parse_scene_range as _parse_scene_range  # noqa: E402

TARGET_CLASSES = {"pussy", "penis", "anus"}


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
#  Mask Refinement Helpers
# ═══════════════════════════════════════════════════════════════

def expand_bbox(x1: int, y1: int, x2: int, y2: int, w: int, h: int, pad_ratio: float = 0.04):
    """Expand bbox by pad_ratio of its larger dimension."""
    bw = x2 - x1
    bh = y2 - y1
    pad = int(max(bw, bh) * pad_ratio)
    return max(0, x1 - pad), max(0, y1 - pad), min(w, x2 + pad), min(h, y2 + pad)


def flood_fill_holes(mask: np.ndarray) -> np.ndarray:
    """Fill internal holes of a binary mask using flood fill from corner."""
    if mask is None or mask.size == 0:
        return mask
    work = mask.copy()
    h, w = work.shape
    flood_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    cv2.floodFill(work, flood_mask, (0, 0), 255)
    holes = cv2.bitwise_not(work)
    return cv2.bitwise_or(mask, holes)


def keep_best_component(mask: np.ndarray, target_center: Optional[tuple] = None, min_area: int = 0) -> np.ndarray:
    """Keep the most relevant connected component (area - distance penalty)."""
    binary = (mask > 0).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)

    if n <= 1:
        return (binary * 255).astype(np.uint8)

    best_label = None
    best_score = -1e18

    for label in range(1, n):
        area = int(stats[label, cv2.CC_STAT_AREA])
        if area < min_area:
            continue
        score = float(area)
        if target_center is not None:
            cx, cy = centroids[label]
            dist = ((cx - target_center[0]) ** 2 + (cy - target_center[1]) ** 2) ** 0.5
            score -= dist * 2.0
        if score > best_score:
            best_score = score
            best_label = label

    if best_label is None:
        return np.zeros_like(mask)
    return np.where(labels == best_label, 255, 0).astype(np.uint8)


def fill_from_contour(mask: np.ndarray, use_hull: bool = True) -> np.ndarray:
    """Rebuild clean outer contour and fill it solid."""
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return np.zeros_like(mask)
    cnt = max(cnts, key=cv2.contourArea)
    canvas = np.zeros_like(mask)
    outer = cv2.convexHull(cnt) if use_hull else cnt
    cv2.drawContours(canvas, [outer], -1, 255, cv2.FILLED)
    return canvas


def refine_segmentation_mask(
    seg_mask: np.ndarray,
    image_shape: tuple,
    bbox_xyxy: list,
    cls_name: str,
    seg_thr: float = 0.5,
) -> np.ndarray:
    """
    Refine one YOLO segmentation mask into stable censorship mask.

    Pipeline:
      1. Threshold seg mask
      2. Limit to expanded ROI around bbox
      3. Force crop if exceeds class-specific max size
      4. Close gaps
      5. Fill internal holes (flood fill)
      6. Keep best connected component near bbox center
      7. Rebuild contour (convex hull) and fill solid
      8. Light opening for small spikes
      9. Final flood fill after opening
    """
    h, w = image_shape[:2]
    x1, y1, x2, y2 = map(int, bbox_xyxy)
    base_dim = max(h, w)

    # 1. Threshold
    seg_resized = cv2.resize(seg_mask, (w, h), interpolation=cv2.INTER_LINEAR)
    temp = np.zeros((h, w), dtype=np.uint8)
    temp[seg_resized > seg_thr] = 255

    if not np.any(temp):
        return temp

    # 2. ROI restriction (preserve roi_mask for later re-clamp)
    rx1, ry1, rx2, ry2 = expand_bbox(x1, y1, x2, y2, w, h, pad_ratio=0.05)
    roi_mask = np.zeros_like(temp)
    roi_mask[ry1:ry2, rx1:rx2] = 255
    temp = cv2.bitwise_and(temp, roi_mask)

    # 3. Force crop if model merged too much (preserve crop_mask for later re-clamp)
    expected = {
        "penis": (int(w * 0.18), int(h * 0.58)),
        "pussy": (int(w * 0.12), int(h * 0.16)),
        "anus":  (int(w * 0.08), int(h * 0.12)),
    }
    max_cw, max_ch = expected.get(cls_name, (int(w * 0.18), int(h * 0.58)))
    bw, bh = x2 - x1, y2 - y1
    crop_w = min(max(bw, 1), max_cw)
    crop_h = min(max(bh, 1), max_ch)
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    cx1 = max(0, cx - crop_w // 2)
    cy1 = max(0, cy - crop_h // 2)
    cx2 = min(w, cx1 + crop_w)
    cy2 = min(h, cy1 + crop_h)
    crop_mask = np.zeros_like(temp)
    crop_mask[cy1:cy2, cx1:cx2] = 255
    temp = cv2.bitwise_and(temp, crop_mask)

    if not np.any(temp):
        return temp

    # Dynamic kernel sizes
    close_sz = max(3, int(base_dim * 0.008)) | 1
    open_sz = max(3, int(base_dim * 0.004)) | 1
    k_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_sz, close_sz))
    k_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (open_sz, open_sz))

    # 4. Close boundary gaps
    temp = cv2.morphologyEx(temp, cv2.MORPH_CLOSE, k_close, iterations=1)

    # 5. Fill internal holes
    temp = flood_fill_holes(temp)

    # 6. Keep best component near bbox center
    temp = keep_best_component(
        temp,
        target_center=((x1 + x2) / 2.0, (y1 + y2) / 2.0),
        min_area=max(8, int(bw * bh * 0.01)),
    )

    if not np.any(temp):
        return temp

    # 7. Rebuild solid outer contour (convex hull)
    temp = fill_from_contour(temp, use_hull=True)

    # 8. Light opening for tiny spikes
    temp = cv2.morphologyEx(temp, cv2.MORPH_OPEN, k_open, iterations=1)

    # 8.5 Safety dilation — compensate net shrinkage from opening
    safety_sz = max(3, int(base_dim * 0.002)) | 1  # ~2px for 1024
    k_safety = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (safety_sz, safety_sz))
    temp = cv2.dilate(temp, k_safety, iterations=1)

    # 8.6 Re-clamp to ROI + crop limits (prevent dilation bleeding beyond bbox)
    temp = cv2.bitwise_and(temp, roi_mask)
    temp = cv2.bitwise_and(temp, crop_mask)

    # 9. Final fill after opening
    return flood_fill_holes(temp)


# ═══════════════════════════════════════════════════════════════
#  YOLO Detection
# ═══════════════════════════════════════════════════════════════

_model_cache = {}

def get_model() -> Optional["YOLO"]:
    if not HAS_YOLO or not MODEL_PATH.exists():
        return None
    if "m" not in _model_cache:
        _model_cache["m"] = YOLO(str(MODEL_PATH))
    return _model_cache["m"]


def yolo_detect(image: np.ndarray, conf: float = 0.5) -> tuple[np.ndarray, list[dict], str]:
    """YOLO genital detection with robust mask refinement.

    Returns (mask, detections, status) where status is:
      "ok"       — inference ran successfully
      "no_model" — model unavailable (path error or missing)
    """
    model = get_model()
    if model is None:
        return np.zeros(image.shape[:2], dtype=np.uint8), [], "no_model"

    h, w = image.shape[:2]

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tf:
        tmp = Path(tf.name)
    try:
        PILImage.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB)).save(str(tmp), "JPEG", quality=95)
        results = model(str(tmp), verbose=False, conf=conf, imgsz=1024)
    finally:
        tmp.unlink(missing_ok=True)

    r = results[0]
    final_mask = np.zeros((h, w), dtype=np.uint8)
    detections = []

    if r.boxes is None or len(r.boxes) == 0:
        return final_mask, detections, "ok"

    for i, box in enumerate(r.boxes):
        cls_name = model.names[int(box.cls[0])]
        conf_val = float(box.conf[0])

        if cls_name not in TARGET_CLASSES:
            continue

        detections.append({"class": cls_name, "conf": conf_val})

        if r.masks is not None and i < len(r.masks):
            seg = r.masks[i].data[0].cpu().numpy()
            refined = refine_segmentation_mask(
                seg_mask=seg,
                image_shape=image.shape,
                bbox_xyxy=box.xyxy[0].tolist(),
                cls_name=cls_name,
                seg_thr=0.5,
            )
            final_mask = cv2.bitwise_or(final_mask, refined)
        else:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            rx1, ry1, rx2, ry2 = expand_bbox(x1, y1, x2, y2, w, h, pad_ratio=0.03)
            cv2.rectangle(final_mask, (rx1, ry1), (rx2, ry2), 255, cv2.FILLED)

    return final_mask, detections, "ok"


# ═══════════════════════════════════════════════════════════════
#  Apply Censor
# ═══════════════════════════════════════════════════════════════

def apply_censor(
    image: np.ndarray,
    mask: np.ndarray,
    style: str = "solid",
    color: tuple[int, int, int] = (255, 255, 255),
    edge_blur: int = 0,
) -> np.ndarray:
    """Apply censorship with optional edge anti-aliasing.

    Args:
        edge_blur: Gaussian blur kernel size for mask edges (0=off, odd number).
                   Typical values: 5~15. Creates smooth alpha blend at boundary.
    """
    result = image.copy()
    h, w = image.shape[:2]

    # Build censor layer
    if style == "mosaic":
        ratio = 0.04
        small = cv2.resize(result, (0, 0), fx=ratio, fy=ratio, interpolation=cv2.INTER_LINEAR)
        censor_layer = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
    else:
        censor_layer = np.full_like(image, color)

    if edge_blur > 0:
        # Anti-aliased edge: blur the binary mask → alpha blend
        blur_k = edge_blur | 1  # ensure odd
        alpha = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (blur_k, blur_k), 0)
        alpha_3ch = alpha[:, :, None]
        result = (censor_layer * alpha_3ch + result * (1.0 - alpha_3ch)).astype(np.uint8)
    else:
        # Hard edge (original behavior)
        np.copyto(result, censor_layer, where=(mask[:, :, None] > 0))

    return result


# ═══════════════════════════════════════════════════════════════
#  Processing
# ═══════════════════════════════════════════════════════════════

def process_single(
    input_path: str,
    output_path: Optional[str] = None,
    yolo_conf: float = 0.5,
    style: str = "solid",
    color: tuple[int, int, int] = (255, 255, 255),
    edge_blur: int = 0,
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

    mask, detections, status = yolo_detect(image, conf=yolo_conf)

    if status == "no_model":
        log.warning(f"  {Path(input_path).name} → MODEL UNAVAILABLE (not censored!)")
        return {"path": input_path, "success": False, "reason": "no_model"}

    total_px = int(np.sum(mask > 0))

    if total_px == 0:
        if verbose:
            log.info(f"  {Path(input_path).name} → clean (skip)")
        return {"path": input_path, "success": True, "detected": False}

    result = apply_censor(image, mask, style, color, edge_blur)

    # Atomic write when input == output (prevent data loss on write failure)
    out = Path(output_path)
    if Path(input_path).resolve() == out.resolve():
        tmp_out = out.with_suffix(".tmp" + out.suffix)
        save_image(result, str(tmp_out))
        tmp_out.replace(out)
    else:
        save_image(result, output_path)

    det_str = ", ".join(f"{d['class']}({d['conf']:.2f})" for d in detections)
    if verbose:
        log.info(f"  {Path(input_path).name} → {total_px:,}px² [{det_str}] ({style})")

    if preview:
        pp = str(Path(output_path).parent / f"{Path(output_path).stem}_preview.jpg")
        prev = image.copy()
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(prev, contours, -1, (0, 255, 0), 2)
        for d in detections:
            cv2.putText(prev, f"{d['class']}:{d['conf']:.2f}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.imwrite(pp, prev)
        if verbose:
            log.info(f"    preview → {Path(pp).name}")

    return {"path": input_path, "success": True, "detected": True, "pixels": total_px}


def _worker(args: tuple) -> dict:
    path, out, conf, style, color, eblur = args
    try:
        return process_single(path, out, conf, style, color, edge_blur=eblur, verbose=False)
    except (cv2.error, OSError, ValueError, RuntimeError, PILUnidentifiedImageError) as e:
        log.exception(f"Worker failed: {path}")
        return {"path": path, "success": False, "error": str(e)}


def process_batch(char_codes, scene_nums, yolo_conf=0.5, style="solid", color=(255,255,255),
                  edge_blur=0, preview_first=0, verbose=True):
    # Path validation — only when actual I/O is needed
    if not BASE_DIR.exists():
        log.error(f"Image directory not found: {BASE_DIR.resolve()}")
        sys.exit(1)

    tasks = []
    for code in char_codes:
        for num in scene_nums:
            src = BASE_DIR / code / f"{num}.webp"
            if src.exists():
                tasks.append((str(src), str(src), yolo_conf, style, color, edge_blur))

    if verbose:
        log.info(f"{len(tasks)} images, conf={yolo_conf}, style={style}, edge_blur={edge_blur}")

    if preview_first > 0:
        for t in tasks[:preview_first]:
            process_single(t[0], t[1], yolo_conf, style, color, edge_blur=edge_blur, preview=True)
        log.info(f"Previewed {min(preview_first, len(tasks))}.")
        return

    results = [_worker(t) for t in tasks]

    detected = sum(1 for r in results if r.get("detected"))
    skipped = sum(1 for r in results if r.get("success") and not r.get("detected"))
    failed = sum(1 for r in results if not r.get("success"))
    no_model = sum(1 for r in results if r.get("reason") == "no_model")
    if verbose:
        log.info(f"Done. {detected} censored, {skipped} clean, {failed} failed")
        if no_model:
            log.error(f"⚠ {no_model} images skipped: model unavailable!")


def run_coverage_test(input_dir: str | Path, result_dir: str | Path, yolo_conf: float = 0.5) -> None:
    """Coverage test: read-only on originals, all output to result_dir."""
    input_dir = Path(input_dir)
    result_dir = Path(result_dir)
    result_dir.mkdir(parents=True, exist_ok=True)
    manifest = []

    sources = sorted(input_dir.glob("*.webp"))
    if not sources:
        log.warning(f"No .webp files found in {input_dir}")
        return

    for src in sources:
        image = load_image(str(src))
        if image is None:
            log.error(f"  Cannot load: {src.name}")
            manifest.append({"file": src.name, "detected": False, "mask_area_px": 0, "status": "load_error"})
            continue

        mask, detections, status = yolo_detect(image, conf=yolo_conf)
        area = int(np.sum(mask > 0))
        stem = src.stem

        # Preview: mask contour overlay (green)
        preview = image.copy()
        if area > 0:
            cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(preview, cnts, -1, (0, 255, 0), 2)
        cv2.imwrite(str(result_dir / f"{stem}_preview.jpg"), preview)

        # Mask: binary
        cv2.imwrite(str(result_dir / f"{stem}_mask.png"), mask)

        manifest.append({
            "file": src.name,
            "detected": bool(detections),
            "mask_area_px": area,
            "detections": [{"class": d["class"], "conf": round(d["conf"], 3)} for d in detections],
            "status": status,
        })
        det_str = ", ".join(f"{d['class']}({d['conf']:.2f})" for d in detections) if detections else "none"
        log.info(f"  {src.name} → {area:,}px² [{det_str}] ({status})")

    # Stats manifest (per-folder aggregate)
    (result_dir / "stats.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    log.info(f"Coverage test: {len(manifest)} images → {result_dir}")


parse_scene_range = _parse_scene_range


def main():
    parser = argparse.ArgumentParser(description="YOLO 세그멘테이션 + 형태 복원 기반 성기 검열")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("input", nargs="?")
    group.add_argument("--batch", metavar="CHARS")
    group.add_argument("--batch-all", action="store_true")
    group.add_argument("--coverage-test", metavar="INPUT_DIR",
                       help="Run coverage test on input dir (read-only), output to --result-dir")

    parser.add_argument("--result-dir", metavar="DIR",
                        help="Output directory for --coverage-test results")
    parser.add_argument("--scenes", default="20-42,50-67,70-78,80-86")
    parser.add_argument("--yolo-conf", type=float, default=0.5)
    parser.add_argument("--style", choices=["solid", "mosaic"], default="solid")
    parser.add_argument("--color", nargs=3, type=int, default=[255,255,255], metavar=("B","G","R"))
    parser.add_argument("--edge-blur", type=int, default=9,
                        help="Edge anti-aliasing blur kernel size (0=off, odd, default: 9)")
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--preview-first", type=int, default=0)
    parser.add_argument("-o", "--output")

    args = parser.parse_args()
    color = tuple(args.color)

    eblur = args.edge_blur

    if args.coverage_test:
        result_dir = args.result_dir or str(Path(args.coverage_test).parent / "results")
        run_coverage_test(args.coverage_test, result_dir, args.yolo_conf)
    elif args.batch_all:
        process_batch(ALL_CHARS, parse_scene_range(args.scenes), args.yolo_conf, args.style, color, eblur, args.preview_first)
    elif args.batch:
        chars = [c.strip().upper() for c in args.batch.split(",")]
        process_batch(chars, parse_scene_range(args.scenes), args.yolo_conf, args.style, color, eblur, args.preview_first)
    elif args.input:
        process_single(args.input, args.output, args.yolo_conf, args.style, color, edge_blur=eblur, preview=args.preview)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
