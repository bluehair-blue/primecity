#!/usr/bin/env python3
"""Deep-clean char_img WebP assets, preserve source metadata, and add rights XMP."""
from __future__ import annotations

import argparse
import base64
import gzip
import hashlib
import html
import io
import json
import math
import os
import shutil
import sys
import zlib
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageCms, ImageFilter, _webp


SCHEMA = "prime-city-image-release/v2"
RELEASE_VERSION = "2026-08-11.1"
RIGHTS_EFFECTIVE_DATE = "2026-08-11"
RIGHTS_HOLDER = "bluehair.blue"
COPYRIGHT_NOTICE = "Copyright © 2026 bluehair.blue. All rights reserved."
USAGE_TERMS_EN = (
    "No part of this image may be reproduced, redistributed, copied, modified, "
    "published, transmitted, or otherwise used, in whole or in part, in any form "
    "or by any means, without prior written permission from bluehair.blue."
)
USAGE_TERMS_KO = (
    "이 이미지는 bluehair.blue의 사전 서면 허가 없이 어떠한 경우에도 전부 또는 "
    "일부를 무단 전재, 복제, 배포, 수정, 게시, 전송하거나 기타 방식으로 사용할 수 없습니다."
)

QUALITY = 99
METHOD = 6
BLUR_RADIUS = 0.5
PUBLIC_BUCKET = "prime"
PUBLIC_PREFIX = "ent"
PRIVATE_METADATA_BUCKET = "prime-metadata"
PRIVATE_METADATA_PREFIX = "ent"
CDN_BASE = "https://img.bluehair.blue/ent"

CORE_CHUNKS = {b"VP8 ", b"VP8L", b"VP8X", b"ALPH", b"ANIM", b"ANMF"}
SOURCE_METADATA_CHUNKS = {b"EXIF", b"XMP ", b"ICCP"}
KNOWN_CHUNKS = CORE_CHUNKS | SOURCE_METADATA_CHUNKS
STEALTH_SIGNATURES = {
    b"stealth_pnginfo": False,
    b"stealth_pngcomp": True,
}
KST = timezone(timedelta(hours=9))


class ReleaseError(RuntimeError):
    pass


def now_iso() -> str:
    return datetime.now(KST).isoformat(timespec="seconds")


def digest(data: bytes, algorithm: str = "sha256") -> str:
    return hashlib.new(algorithm, data).hexdigest()


def file_digest(path: Path, algorithm: str = "sha256") -> str:
    h = hashlib.new(algorithm)
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    temp.write_bytes(data)
    os.replace(temp, path)


def atomic_json(path: Path, payload: Any) -> None:
    atomic_write(
        path,
        (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8"),
    )


def iter_webps(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*.webp") if path.is_file())


def parse_riff(data: bytes) -> list[tuple[bytes, bytes]]:
    if len(data) < 12 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ReleaseError("not a WebP RIFF container")
    declared = int.from_bytes(data[4:8], "little")
    if declared != len(data) - 8:
        raise ReleaseError(f"RIFF length mismatch: declared={declared}, actual={len(data) - 8}")

    chunks: list[tuple[bytes, bytes]] = []
    offset = 12
    while offset < len(data):
        if offset + 8 > len(data):
            raise ReleaseError("truncated RIFF chunk header")
        fourcc = data[offset:offset + 4]
        size = int.from_bytes(data[offset + 4:offset + 8], "little")
        start = offset + 8
        end = start + size
        padded_end = end + (size & 1)
        if padded_end > len(data):
            raise ReleaseError(f"truncated {fourcc!r} chunk")
        chunks.append((fourcc, data[start:end]))
        offset = padded_end
    if offset != len(data):
        raise ReleaseError("unexpected trailing RIFF bytes")
    return chunks


def pack_riff(chunks: list[tuple[bytes, bytes]]) -> bytes:
    body = bytearray(b"WEBP")
    for fourcc, payload in chunks:
        if len(fourcc) != 4:
            raise ReleaseError(f"invalid FourCC: {fourcc!r}")
        body.extend(fourcc)
        body.extend(len(payload).to_bytes(4, "little"))
        body.extend(payload)
        if len(payload) & 1:
            body.append(0)
    return b"RIFF" + len(body).to_bytes(4, "little") + bytes(body)


def mux_rights_xmp(data: bytes, xmp: bytes, width: int, height: int) -> bytes:
    chunks = parse_riff(data)
    kept: list[tuple[bytes, bytes]] = []
    vp8x_seen = False
    for fourcc, payload in chunks:
        if fourcc in SOURCE_METADATA_CHUNKS:
            continue
        if fourcc == b"VP8X":
            if len(payload) != 10:
                raise ReleaseError("invalid VP8X payload length")
            flags = (payload[0] & ~(0x20 | 0x08 | 0x04)) | 0x04
            payload = bytes([flags]) + payload[1:]
            vp8x_seen = True
        kept.append((fourcc, payload))

    if not vp8x_seen:
        if not (1 <= width <= 0x1000000 and 1 <= height <= 0x1000000):
            raise ReleaseError(f"invalid WebP canvas: {width}x{height}")
        vp8x = (
            bytes([0x04, 0, 0, 0])
            + (width - 1).to_bytes(3, "little")
            + (height - 1).to_bytes(3, "little")
        )
        kept.insert(0, (b"VP8X", vp8x))
    kept.append((b"XMP ", xmp))
    return pack_riff(kept)


def build_rights_xmp(metadata_date: str, effective_date: str = RIGHTS_EFFECTIVE_DATE) -> bytes:
    esc = lambda value: html.escape(value, quote=True)
    xml = f'''<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about=""
 xmlns:xmp="http://ns.adobe.com/xap/1.0/"
 xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/"
 xmp:MetadataDate="{esc(metadata_date)}"
 xmpRights:Marked="True"
 plus:LicenseStartDate="{esc(effective_date)}">
<xmpRights:Owner><rdf:Bag><rdf:li>{esc(RIGHTS_HOLDER)}</rdf:li></rdf:Bag></xmpRights:Owner>
<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">{esc(COPYRIGHT_NOTICE)}</rdf:li><rdf:li xml:lang="en-US">{esc(COPYRIGHT_NOTICE)}</rdf:li></rdf:Alt></dc:rights>
<xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">{esc(USAGE_TERMS_EN)}</rdf:li><rdf:li xml:lang="en-US">{esc(USAGE_TERMS_EN)}</rdf:li><rdf:li xml:lang="ko-KR">{esc(USAGE_TERMS_KO)}</rdf:li></rdf:Alt></xmpRights:UsageTerms>
</rdf:Description>
</rdf:RDF>
</x:xmpmeta>'''
    return xml.encode("utf-8")


def riff_summary(chunks: list[tuple[bytes, bytes]], preserve_metadata: bool) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for fourcc, payload in chunks:
        item: dict[str, Any] = {
            "fourcc": fourcc.decode("ascii", errors="replace"),
            "bytes": len(payload),
            "sha256": digest(payload),
        }
        if preserve_metadata and fourcc in SOURCE_METADATA_CHUNKS:
            item["raw_base64"] = base64.b64encode(payload).decode("ascii")
            try:
                item["utf8_text"] = payload.decode("utf-8")
            except UnicodeDecodeError:
                pass
        out.append(item)
    return out


def json_safe_info(info: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in info.items():
        if isinstance(value, bytes):
            result[key] = {"type": "bytes", "bytes": len(value), "sha256": digest(value)}
        elif isinstance(value, (str, int, float, bool)) or value is None:
            result[key] = value
        elif isinstance(value, tuple):
            result[key] = list(value)
        else:
            result[key] = repr(value)
    return result


def read_lsb_bytes(rgba: Image.Image, channel: int, bit_offset: int, byte_count: int,
                   raw: bytes | None = None) -> bytes:
    width, height = rgba.size
    capacity = width * height
    needed = byte_count * 8
    if bit_offset < 0 or bit_offset + needed > capacity:
        raise ReleaseError("stealth payload exceeds pixel capacity")
    raw = raw if raw is not None else rgba.tobytes()
    out = bytearray(byte_count)
    for bit_index in range(needed):
        pixel_index = bit_offset + bit_index
        x, y = divmod(pixel_index, height)
        source_index = (y * width + x) * 4 + channel
        out[bit_index // 8] |= (raw[source_index] & 1) << (7 - (bit_index & 7))
    return bytes(out)


def extract_stealth(frame: Image.Image, frame_index: int) -> list[dict[str, Any]]:
    rgba = frame.convert("RGBA")
    raw = rgba.tobytes()
    channel_indices = {"A": 3, "R": 0, "G": 1, "B": 2}
    hits: list[dict[str, Any]] = []
    for channel_name, channel_index in channel_indices.items():
        if rgba.width * rgba.height < 152:
            continue
        signature = read_lsb_bytes(rgba, channel_index, 0, 15, raw)
        if signature not in STEALTH_SIGNATURES:
            continue
        bit_length = int.from_bytes(read_lsb_bytes(rgba, channel_index, 120, 4, raw), "big")
        if bit_length <= 0 or bit_length % 8:
            raise ReleaseError(f"invalid stealth bit length {bit_length}")
        payload = read_lsb_bytes(rgba, channel_index, 152, bit_length // 8, raw)
        record: dict[str, Any] = {
            "frame": frame_index,
            "channel": channel_name,
            "signature": signature.decode("ascii"),
            "compressed": STEALTH_SIGNATURES[signature],
            "bit_length": bit_length,
            "payload_bytes": len(payload),
            "payload_sha256": digest(payload),
            "payload_base64": base64.b64encode(payload).decode("ascii"),
        }
        try:
            decoded = gzip.decompress(payload) if STEALTH_SIGNATURES[signature] else payload
            text = decoded.decode("utf-8")
            parsed = json.loads(text)
            record.update({
                "decode_status": "ok",
                "decoded_bytes": len(decoded),
                "decoded_sha256": digest(decoded),
                "decoded_text": text,
                "parsed_json": parsed,
            })
        except (gzip.BadGzipFile, OSError, zlib.error, UnicodeDecodeError, json.JSONDecodeError) as error:
            # Exact raw payload is still recoverable even when legacy embedded data is corrupt.
            record.update({
                "decode_status": "error",
                "decode_error": f"{type(error).__name__}: {error}",
            })
        hits.append(record)
    return hits


def audit_bytes(data: bytes) -> dict[str, Any]:
    chunks = parse_riff(data)
    unknown = sorted({fourcc.decode("ascii", errors="replace") for fourcc, _ in chunks if fourcc not in KNOWN_CHUNKS})
    if unknown:
        raise ReleaseError(f"unknown WebP chunks: {unknown}")

    with Image.open(io.BytesIO(data)) as image:
        root_info = json_safe_info(image.info)
        frame_count = getattr(image, "n_frames", 1)
        durations: list[int] = []
        stealth: list[dict[str, Any]] = []
        meaningful_alpha = False
        alpha_extrema: list[list[int]] = []
        alpha_below_254: list[int] = []
        modes: list[str] = []
        for index in range(frame_count):
            image.seek(index)
            image.load()
            modes.append(image.mode)
            durations.append(int(image.info.get("duration", 0) or 0))
            rgba = image.convert("RGBA")
            alpha = rgba.getchannel("A")
            extrema = alpha.getextrema()
            histogram = alpha.histogram()
            below_254 = sum(histogram[:254])
            alpha_extrema.append([int(extrema[0]), int(extrema[1])])
            alpha_below_254.append(below_254)
            if extrema[0] <= 32 or below_254 / (image.width * image.height) >= 0.01:
                meaningful_alpha = True
            stealth.extend(extract_stealth(rgba, index))
        return {
            "format": image.format,
            "width": image.width,
            "height": image.height,
            "mode": modes[0],
            "frame_modes": modes,
            "frames": frame_count,
            "durations_ms": durations,
            "total_duration_ms": sum(durations),
            "loop": int(image.info.get("loop", 0) or 0),
            "background": list(image.info.get("background", (0, 0, 0, 0))),
            "meaningful_alpha": meaningful_alpha or frame_count > 1,
            "alpha_extrema": alpha_extrema,
            "alpha_pixels_below_254": alpha_below_254,
            "pil_info": root_info,
            "riff_chunks": riff_summary(chunks, preserve_metadata=True),
            "stealth": stealth,
        }


def convert_icc(image: Image.Image, icc_profile: bytes | None) -> Image.Image:
    if not icc_profile:
        return image.copy()
    alpha = image.convert("RGBA").getchannel("A") if "A" in image.getbands() else None
    source = ImageCms.ImageCmsProfile(io.BytesIO(icc_profile))
    target = ImageCms.createProfile("sRGB")
    converted = ImageCms.profileToProfile(image.convert("RGB"), source, target, outputMode="RGB")
    if alpha is not None:
        converted.putalpha(alpha)
    return converted


def sanitize_frame(image: Image.Image, meaningful_alpha: bool, icc_profile: bytes | None,
                   blur_radius: float = BLUR_RADIUS) -> Image.Image:
    converted = convert_icc(image, icc_profile)
    if meaningful_alpha:
        rgba = converted.convert("RGBA")
        alpha = rgba.getchannel("A")
        rgb = rgba.convert("RGB")
        transparent_mask = alpha.point([255 if value == 0 else 0 for value in range(256)])
        rgb.paste((0, 0, 0), mask=transparent_mask)
        if blur_radius > 0:
            rgb = rgb.filter(ImageFilter.GaussianBlur(blur_radius))
        alpha_table = [value & 0xFE for value in range(256)]
        clean = rgb.convert("RGBA")
        clean.putalpha(alpha.point(alpha_table))
        return clean

    if "A" in converted.getbands():
        rgba = converted.convert("RGBA")
        background = Image.new("RGBA", rgba.size, (0, 0, 0, 255))
        background.alpha_composite(rgba)
        clean = background.convert("RGB")
    else:
        clean = converted.convert("RGB")
    if blur_radius > 0:
        clean = clean.filter(ImageFilter.GaussianBlur(blur_radius))
    return clean


def encode_still(data: bytes, audit: dict[str, Any], xmp: bytes,
                 blur_radius: float = BLUR_RADIUS) -> tuple[bytes, str]:
    with Image.open(io.BytesIO(data)) as source:
        source.load()
        clean = sanitize_frame(
            source,
            bool(audit["meaningful_alpha"]),
            source.info.get("icc_profile"),
            blur_radius,
        )
        buffer = io.BytesIO()
        clean.save(buffer, "WEBP", quality=QUALITY, method=METHOD, exact=True)
        encoded = mux_rights_xmp(buffer.getvalue(), xmp, clean.width, clean.height)
    strategy = "transparent-reencode" if audit["meaningful_alpha"] else "opaque-reencode"
    return encoded, strategy


def _packed_background(background: list[int]) -> int:
    if len(background) != 4 or not all(0 <= value <= 255 for value in background):
        raise ReleaseError(f"invalid animation background: {background}")
    red, green, blue, alpha = background
    return (alpha << 24) | (red << 16) | (green << 8) | blue


def encode_animation(data: bytes, audit: dict[str, Any], xmp: bytes,
                     blur_radius: float = BLUR_RADIUS) -> tuple[bytes, str]:
    width, height = int(audit["width"]), int(audit["height"])
    encoder = _webp.WebPAnimEncoder(
        (width, height),
        _packed_background(audit["background"]),
        int(audit["loop"]),
        False,
        3,
        5,
        False,
        False,
    )
    timestamp = 0
    with Image.open(io.BytesIO(data)) as source:
        icc_profile = source.info.get("icc_profile")
        for index in range(int(audit["frames"])):
            source.seek(index)
            source.load()
            duration = int(source.info.get("duration", 0) or 0)
            clean = sanitize_frame(source, True, icc_profile, blur_radius)
            encoder.add(clean.getim(), timestamp, False, QUALITY, 100, METHOD)
            timestamp += duration
            del clean
    encoder.add(None, timestamp, False, QUALITY, 100, 0)
    assembled = encoder.assemble("", "", "")
    if assembled is None:
        raise ReleaseError("WebP animation encoder returned no data")
    return mux_rights_xmp(bytes(assembled), xmp, width, height), "animation-reencode"


def old_sidecar_proves_prior_clean(previous: Any, audit: dict[str, Any]) -> bool:
    if not isinstance(previous, dict) or previous.get("schema") != "prime-city-asset-prompt-metadata/v1":
        return False
    image = previous.get("image", {})
    mitigation = image.get("stealth_pnginfo_mitigation", {})
    source_metadata = any(
        chunk["fourcc"] in {"EXIF", "XMP ", "ICCP"}
        for chunk in audit["riff_chunks"]
    )
    return (
        image.get("metadata_stripped") is True
        and float(mitigation.get("gaussian_blur_radius", -1)) == BLUR_RADIUS
        and not audit["stealth"]
        and not source_metadata
        and audit["frames"] == 1
        and audit["mode"] == "RGB"
    )


def visual_psnr(source_data: bytes, output_data: bytes, source_audit: dict[str, Any],
                blur_radius: float, frames: list[int] | None = None) -> float | None:
    frame_indices = frames or [0]
    scores: list[float] = []
    with Image.open(io.BytesIO(source_data)) as source, Image.open(io.BytesIO(output_data)) as output:
        icc_profile = source.info.get("icc_profile")
        for index in frame_indices:
            source.seek(index)
            source.load()
            target = sanitize_frame(source, bool(source_audit["meaningful_alpha"]), icc_profile, blur_radius)
            output.seek(index)
            output.load()
            if target.mode == "RGBA":
                target_rgb = Image.new("RGB", target.size, (0, 0, 0))
                target_rgb.paste(target.convert("RGB"), mask=target.getchannel("A"))
                out_rgba = output.convert("RGBA")
                output_rgb = Image.new("RGB", output.size, (0, 0, 0))
                output_rgb.paste(out_rgba.convert("RGB"), mask=out_rgba.getchannel("A"))
            else:
                target_rgb = target.convert("RGB")
                output_rgb = output.convert("RGB")
            histogram = ImageChops.difference(target_rgb, output_rgb).histogram()
            squared = sum((value % 256) ** 2 * count for value, count in enumerate(histogram))
            rms = math.sqrt(squared / (target.width * target.height * 3))
            scores.append(float("inf") if rms == 0 else 20 * math.log10(255 / rms))
    return min(scores) if scores else None


def validate_output(source_data: bytes, output_data: bytes, source_audit: dict[str, Any],
                    xmp: bytes, strategy: str, blur_radius: float) -> dict[str, Any]:
    chunks = parse_riff(output_data)
    unknown = [fourcc for fourcc, _ in chunks if fourcc not in KNOWN_CHUNKS]
    if unknown:
        raise ReleaseError(f"output contains unknown chunks: {unknown}")
    xmp_chunks = [payload for fourcc, payload in chunks if fourcc == b"XMP "]
    if xmp_chunks != [xmp]:
        raise ReleaseError("output does not contain exactly one canonical rights XMP chunk")
    forbidden = [fourcc for fourcc, _ in chunks if fourcc in {b"EXIF", b"ICCP"}]
    if forbidden:
        raise ReleaseError(f"output contains forbidden metadata: {forbidden}")

    output_audit = audit_bytes(output_data)
    if output_audit["stealth"]:
        raise ReleaseError("stealth payload survived output encoding")
    for key in ("width", "height", "frames", "durations_ms", "total_duration_ms", "loop"):
        if output_audit[key] != source_audit[key]:
            raise ReleaseError(f"output {key} changed: {source_audit[key]!r} -> {output_audit[key]!r}")
    if source_audit["meaningful_alpha"] and not output_audit["meaningful_alpha"]:
        raise ReleaseError("meaningful transparency was lost")

    if strategy == "metadata-remux-only":
        psnr = float("inf")
    else:
        sample_frames = [0]
        if source_audit["frames"] > 1:
            sample_frames = sorted({0, source_audit["frames"] // 2, source_audit["frames"] - 1})
        psnr = visual_psnr(source_data, output_data, source_audit, blur_radius, sample_frames)
        if psnr is not None and psnr < 30:
            raise ReleaseError(f"visual PSNR below threshold: {psnr:.2f} dB")

    return {
        "decode_ok": True,
        "stealth_hits": 0,
        "forbidden_metadata_chunks": 0,
        "canonical_xmp_chunks": 1,
        "visual_psnr_db_min": "Infinity" if math.isinf(psnr or 0) else round(psnr or 0, 3),
        "pillow": output_audit,
        "riff_chunks": riff_summary(chunks, preserve_metadata=False),
    }


def rights_record(metadata_date: str, xmp: bytes, effective_date: str) -> dict[str, Any]:
    return {
        "marked": True,
        "owner": RIGHTS_HOLDER,
        "copyright_notice": COPYRIGHT_NOTICE,
        "usage_terms": {"en-US": USAGE_TERMS_EN, "ko-KR": USAGE_TERMS_KO},
        "license_start_date": effective_date,
        "metadata_date": metadata_date,
        "xmp_sha256": digest(xmp),
    }


def release_file(job: tuple[str, str, str, str, str, float]) -> dict[str, Any]:
    backup_path_s, canonical_path_s, staged_path_s, sidecar_path_s, relative_path, blur_radius = job
    backup_path = Path(backup_path_s)
    canonical_path = Path(canonical_path_s)
    staged_path = Path(staged_path_s)
    sidecar_path = Path(sidecar_path_s)
    source_data = backup_path.read_bytes()
    source_audit = audit_bytes(source_data)

    previous_sidecar: Any = None
    if sidecar_path.exists():
        try:
            previous_sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ReleaseError(f"invalid existing sidecar {sidecar_path}: {error}") from error

    preserved_previous = previous_sidecar
    if isinstance(previous_sidecar, dict) and previous_sidecar.get("schema") == SCHEMA:
        preserved_previous = previous_sidecar.get("previous_sidecar")

    metadata_date = now_iso()
    xmp = build_rights_xmp(metadata_date)
    if old_sidecar_proves_prior_clean(preserved_previous, source_audit):
        output_data = mux_rights_xmp(
            source_data, xmp, int(source_audit["width"]), int(source_audit["height"])
        )
        strategy = "metadata-remux-only"
    elif source_audit["frames"] > 1:
        output_data, strategy = encode_animation(source_data, source_audit, xmp, blur_radius)
    else:
        output_data, strategy = encode_still(source_data, source_audit, xmp, blur_radius)

    validation = validate_output(
        source_data, output_data, source_audit, xmp, strategy, blur_radius
    )
    atomic_write(staged_path, output_data)

    source_stat = backup_path.stat()
    metadata_relative = str(Path(relative_path).with_suffix(".json")).replace("\\", "/")
    sidecar = {
        "schema": SCHEMA,
        "release_version": RELEASE_VERSION,
        "created_at": metadata_date,
        "source": {
            "relative_path": relative_path,
            "canonical_path": str(canonical_path),
            "backup_path": str(backup_path),
            "bytes": len(source_data),
            "sha256": digest(source_data),
            "md5": digest(source_data, "md5"),
            "mtime_ns": source_stat.st_mtime_ns,
            "pillow": {key: value for key, value in source_audit.items() if key not in {"riff_chunks", "stealth"}},
            "riff_chunks": source_audit["riff_chunks"],
            "stealth_payloads": source_audit["stealth"],
        },
        "processing": {
            "strategy": strategy,
            "gaussian_blur_radius": blur_radius,
            "webp_quality": QUALITY,
            "webp_method": METHOD,
            "color_management": "embedded ICC converted to sRGB before ICC removal",
            "transparent_pixel_rgb": "zeroed where alpha=0",
            "alpha_lsb": "all values normalized to even numbers; 255 becomes 254",
        },
        "rights": rights_record(metadata_date, xmp, RIGHTS_EFFECTIVE_DATE),
        "output": {
            "relative_path": relative_path,
            "bytes": len(output_data),
            "sha256": digest(output_data),
            "md5": digest(output_data, "md5"),
            "pillow": validation["pillow"],
            "riff_chunks": validation["riff_chunks"],
        },
        "sidecar": {
            "relative_path": metadata_relative,
            "local_path": str(sidecar_path),
        },
        "r2": {
            "image": {
                "bucket": PUBLIC_BUCKET,
                "key": f"{PUBLIC_PREFIX}/{relative_path}",
                "cdn_url": f"{CDN_BASE}/{relative_path}",
            },
            "metadata": {
                "bucket": PRIVATE_METADATA_BUCKET,
                "key": f"{PRIVATE_METADATA_PREFIX}/{metadata_relative}",
                "public": False,
            },
        },
        "validation": {key: value for key, value in validation.items() if key not in {"pillow", "riff_chunks"}},
    }
    if isinstance(preserved_previous, dict):
        sidecar["previous_sidecar"] = preserved_previous
    atomic_json(sidecar_path, sidecar)
    return {
        "path": relative_path,
        "source_sha256": sidecar["source"]["sha256"],
        "source_md5": sidecar["source"]["md5"],
        "source_bytes": sidecar["source"]["bytes"],
        "output_sha256": sidecar["output"]["sha256"],
        "output_md5": sidecar["output"]["md5"],
        "output_bytes": sidecar["output"]["bytes"],
        "metadata_path": metadata_relative,
        "metadata_sha256": file_digest(sidecar_path),
        "frames": source_audit["frames"],
        "width": source_audit["width"],
        "height": source_audit["height"],
        "strategy": strategy,
        "source_stealth_hits": len(source_audit["stealth"]),
    }


def save_sanitized_webp(image: Image.Image, output_path: Path,
                        blur_radius: float = BLUR_RADIUS,
                        effective_date: str = RIGHTS_EFFECTIVE_DATE) -> None:
    """Shared future-generation path used by asset_generator.py."""
    if getattr(image, "n_frames", 1) != 1:
        raise ReleaseError("save_sanitized_webp only accepts still images")
    source = io.BytesIO()
    source_metadata = {
        key: image.info[key]
        for key in ("icc_profile", "exif", "xmp")
        if image.info.get(key)
    }
    image.save(source, "WEBP", lossless=True, exact=True, **source_metadata)
    source_data = source.getvalue()
    audit = audit_bytes(source_data)
    metadata_date = now_iso()
    xmp = build_rights_xmp(metadata_date, effective_date)
    output_data, _ = encode_still(source_data, audit, xmp, blur_radius)
    validate_output(source_data, output_data, audit, xmp, "transparent-reencode" if audit["meaningful_alpha"] else "opaque-reencode", blur_radius)
    atomic_write(output_path, output_data)


def manifest_payload(kind: str, root: Path, entries: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema": "prime-city-image-release-manifest/v1",
        "release_version": RELEASE_VERSION,
        "kind": kind,
        "created_at": now_iso(),
        "root": str(root),
        "count": len(entries),
        "entries": sorted(entries, key=lambda item: item["path"]),
    }


def _complete_release(root: Path, metadata_root: Path, files: list[Path]) -> bool:
    for path in files:
        rel = path.relative_to(root).as_posix()
        sidecar_path = metadata_root / Path(rel).with_suffix(".json")
        if not sidecar_path.exists():
            return False
        try:
            sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return False
        if sidecar.get("schema") != SCHEMA or sidecar.get("release_version") != RELEASE_VERSION:
            return False
        if sidecar.get("output", {}).get("sha256") != file_digest(path):
            return False
    return True


def release_command(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    metadata_root = Path(args.metadata_root).resolve()
    backup_root = Path(args.backup).resolve()
    stage_root = Path(args.stage).resolve()
    files = iter_webps(root)
    if not files:
        raise ReleaseError(f"no WebP files under {root}")
    print(f"release target: {len(files)} WebP files", flush=True)

    if _complete_release(root, metadata_root, files):
        print("release already complete; current hashes match v2 sidecars", flush=True)
        return verify_command(args)

    if not backup_root.exists():
        print(f"creating immutable backup: {backup_root}", flush=True)
        shutil.copytree(root, backup_root, copy_function=shutil.copy2)
    backup_files = iter_webps(backup_root)
    rels = [path.relative_to(root).as_posix() for path in files]
    backup_rels = [path.relative_to(backup_root).as_posix() for path in backup_files]
    if rels != backup_rels:
        raise ReleaseError("backup WebP paths do not match canonical char_img")

    marker = stage_root / ".prime-city-image-release-staging.json"
    if stage_root.exists():
        if not marker.exists():
            raise ReleaseError(f"refusing to remove unrecognized stage directory: {stage_root}")
        shutil.rmtree(stage_root)
    stage_root.mkdir(parents=True)
    atomic_json(marker, {"release_version": RELEASE_VERSION, "created_at": now_iso()})

    jobs = []
    for rel in rels:
        jobs.append((
            str(backup_root / Path(rel)),
            str(root / Path(rel)),
            str(stage_root / Path(rel)),
            str(metadata_root / Path(rel).with_suffix(".json")),
            rel,
            float(args.blur_radius),
        ))

    results: list[dict[str, Any]] = []
    errors: list[str] = []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(release_file, job): job[4] for job in jobs}
        for completed, future in enumerate(as_completed(futures), start=1):
            rel = futures[future]
            try:
                results.append(future.result())
            except Exception as error:  # worker traceback is attached to the exception
                errors.append(f"{rel}: {error}")
                print(f"FAIL {rel}: {error}", flush=True)
            if completed % 25 == 0 or completed == len(futures):
                print(f"processed {completed}/{len(futures)}; failures={len(errors)}", flush=True)
    if errors:
        atomic_json(metadata_root / "_release.errors.json", {"errors": errors, "created_at": now_iso()})
        raise ReleaseError(f"release blocked by {len(errors)} file errors; canonical images unchanged")

    before_entries = [{
        "path": item["path"],
        "sha256": item["source_sha256"],
        "md5": item["source_md5"],
        "bytes": item["source_bytes"],
        "width": item["width"],
        "height": item["height"],
        "frames": item["frames"],
        "stealth_hits": item["source_stealth_hits"],
    } for item in results]
    after_entries = [{
        "path": item["path"],
        "sha256": item["output_sha256"],
        "md5": item["output_md5"],
        "bytes": item["output_bytes"],
        "metadata_path": item["metadata_path"],
        "metadata_sha256": item["metadata_sha256"],
        "width": item["width"],
        "height": item["height"],
        "frames": item["frames"],
        "strategy": item["strategy"],
    } for item in results]
    atomic_json(metadata_root / "_manifest.before.json", manifest_payload("before", backup_root, before_entries))
    atomic_json(metadata_root / "_manifest.after.json", manifest_payload("after", root, after_entries))

    result_by_path = {item["path"]: item for item in results}
    for rel in rels:
        current = root / Path(rel)
        expected_source = result_by_path[rel]["source_sha256"]
        if file_digest(current) != expected_source:
            raise ReleaseError(f"canonical file changed during staging: {rel}")
    print("all staged outputs validated; committing atomic replacements", flush=True)
    for rel in rels:
        os.replace(stage_root / Path(rel), root / Path(rel))
    shutil.rmtree(stage_root)
    print("local release committed", flush=True)
    return verify_command(args)


def verify_one(job: tuple[str, str]) -> tuple[str, str | None]:
    path_s, sidecar_s = job
    path = Path(path_s)
    sidecar_path = Path(sidecar_s)
    try:
        sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
        data = path.read_bytes()
        if sidecar.get("schema") != SCHEMA:
            raise ReleaseError("wrong sidecar schema")
        if digest(data) != sidecar["output"]["sha256"]:
            raise ReleaseError("output SHA-256 mismatch")
        chunks = parse_riff(data)
        xmp = [payload for fourcc, payload in chunks if fourcc == b"XMP "]
        if len(xmp) != 1 or digest(xmp[0]) != sidecar["rights"]["xmp_sha256"]:
            raise ReleaseError("rights XMP mismatch")
        if any(fourcc in {b"EXIF", b"ICCP"} for fourcc, _ in chunks):
            raise ReleaseError("forbidden source metadata remains")
        audit = audit_bytes(data)
        if audit["stealth"]:
            raise ReleaseError("stealth payload remains")
        expected = sidecar["output"]["pillow"]
        for key in ("width", "height", "frames", "durations_ms", "loop"):
            if audit[key] != expected[key]:
                raise ReleaseError(f"{key} mismatch")
        return path.name, None
    except Exception as error:
        return path_s, str(error)


def verify_command(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    metadata_root = Path(args.metadata_root).resolve()
    files = iter_webps(root)
    jobs = []
    for path in files:
        rel = path.relative_to(root)
        jobs.append((str(path), str(metadata_root / rel.with_suffix(".json"))))
    errors: list[str] = []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(verify_one, job) for job in jobs]
        for completed, future in enumerate(as_completed(futures), start=1):
            path, error = future.result()
            if error:
                errors.append(f"{path}: {error}")
            if completed % 50 == 0 or completed == len(futures):
                print(f"verified {completed}/{len(futures)}; failures={len(errors)}", flush=True)
    if errors:
        for error in errors[:20]:
            print(f"FAIL {error}", file=sys.stderr)
        raise ReleaseError(f"verification failed for {len(errors)} files")
    print(f"verification PASS: {len(files)} files", flush=True)
    return 0


def audit_one(path_s: str) -> dict[str, Any]:
    path = Path(path_s)
    data = path.read_bytes()
    audit = audit_bytes(data)
    return {
        "path": path_s,
        "bytes": len(data),
        "sha256": digest(data),
        "frames": audit["frames"],
        "meaningful_alpha": audit["meaningful_alpha"],
        "stealth_hits": len(audit["stealth"]),
        "chunks": [item["fourcc"] for item in audit["riff_chunks"]],
    }


def audit_command(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    files = iter_webps(root)
    entries: list[dict[str, Any]] = []
    errors: list[str] = []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(audit_one, str(path)): path for path in files}
        for completed, future in enumerate(as_completed(futures), start=1):
            path = futures[future]
            try:
                item = future.result()
                item["path"] = path.relative_to(root).as_posix()
                entries.append(item)
            except Exception as error:
                errors.append(f"{path}: {error}")
            if completed % 50 == 0 or completed == len(futures):
                print(f"audited {completed}/{len(futures)}; failures={len(errors)}", flush=True)
    counts: dict[str, int] = {}
    for entry in entries:
        for chunk in entry["chunks"]:
            counts[chunk] = counts.get(chunk, 0) + 1
    report = {
        "schema": "prime-city-image-audit/v1",
        "created_at": now_iso(),
        "root": str(root),
        "count": len(entries),
        "errors": errors,
        "stealth_files": sum(bool(entry["stealth_hits"]) for entry in entries),
        "meaningful_alpha_files": sum(bool(entry["meaningful_alpha"]) for entry in entries),
        "animated_files": sum(entry["frames"] > 1 for entry in entries),
        "chunk_file_counts": dict(sorted(counts.items())),
        "entries": sorted(entries, key=lambda item: item["path"]),
    }
    output = Path(args.output).resolve()
    atomic_json(output, report)
    print(json.dumps({key: report[key] for key in (
        "count", "stealth_files", "meaningful_alpha_files", "animated_files", "chunk_file_counts"
    )}, ensure_ascii=False, indent=2), flush=True)
    if errors:
        raise ReleaseError(f"audit failed for {len(errors)} files")
    return 0


def build_parser() -> argparse.ArgumentParser:
    project_root = Path(__file__).resolve().parent.parent
    run_stamp = datetime.now(KST).strftime("%Y%m%d_%H%M%S")
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    audit_parser = subparsers.add_parser("audit", help="read-only full-tree metadata audit")
    audit_parser.add_argument("--root", default=str(project_root / "char_img"))
    audit_parser.add_argument("--output", default=str(project_root / "char_img_metadata" / "_audit.json"))
    audit_parser.add_argument("--workers", type=int, default=4)
    audit_parser.set_defaults(handler=audit_command)

    for name, handler in (("release", release_command), ("verify", verify_command)):
        command_parser = subparsers.add_parser(name)
        command_parser.add_argument("--root", default=str(project_root / "char_img"))
        command_parser.add_argument("--metadata-root", default=str(project_root / "char_img_metadata"))
        command_parser.add_argument(
            "--backup",
            default=str(project_root / f"char_img_bak_{run_stamp}_metadata"),
        )
        command_parser.add_argument(
            "--stage",
            default=str(project_root / f"char_img_release_staging_{run_stamp}"),
        )
        command_parser.add_argument("--workers", type=int, default=4)
        command_parser.add_argument("--blur-radius", type=float, default=BLUR_RADIUS)
        command_parser.set_defaults(handler=handler)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if getattr(args, "workers", 1) < 1:
        raise ReleaseError("workers must be at least 1")
    try:
        return int(args.handler(args) or 0)
    except ReleaseError as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
