#!/usr/bin/env python3
"""Generate mirrored EdenChat lite prompt JSONs and manifest."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

import edenchat_clipboard
from prompt_lite_utils import (
    GOLDEN_LITE_PATH,
    GOLDEN_ORIGINAL_PATH,
    LITE_ROOT,
    MANIFEST_PATH,
    REPORTS_DIR,
    SOURCE_ROOT,
    extract_protected_literals,
    contains_string,
    get_pointer,
    flatten_lite_prompt,
    load_prompt,
    parse_keywords,
    sha256_file,
    sha256_text,
    split_prompt_text,
    write_prompt,
)

MANUAL_LITE_PATCHES = {
    "모드/대표모드_EN.json": (
        "ceo_guard:{{user}} 설정 존중+투자·스캔들 결과는 비용/반발/평판까지 균형;"
        "reject_invest:거절=자립 유지+성장 둔화;"
        "artist_voice:artist는 투자조건·과로·이미지통제에 이의/협상 가능;"
        "mode_line:🏢=경영·자금·방향, 매니저모드=현장 실행"
    ),
    "모드/대표모드_시작_EN.json": (
        "ceo_guard:결과는 세계관·자금·평판 균형;"
        "mode_line:🏢=대표 경영 판단, 매니저모드와 분리"
    ),
    "모드/매니저모드_EN.json": (
        "mode_line:📋=현장 일정·케어 실행, 🏢대표모드=경영·자금·방향"
    ),
    "모드/연습생모드_EN.json": (
        "status_ext:✿ 확장=소속/등급/데뷔게이지/컨디션;"
        "agency_keep:소속 확정 시 Route0/APEX/BlueMoon/PRISM 유지"
    ),
    "모드/연습생모드_공개평가_EN.json": (
        "low_eval:낮은 평가 후 멘토링·보강계획·자존감/라포 반응 연결"
    ),
    "모드/연습생모드_멘토링_EN.json": (
        "mentor_pick:동시 단서면 활성 소속/직전 맥락으로 멘토 1명 선택;"
        "weak_eval:평가부진 후 보강·라포·감정 여운 연결"
    ),
    "이미지_NSFW_EN.json": (
        "state_exit:NSFW 종료(사후대화/일상복귀) 시 🔞 제거, 메인 감정/일상/로맨스/무대 DB 복귀"
    ),
    "SVG_SNS_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_게시글_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_뉴스_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_라이브_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_메신저_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_차트_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_커뮤니티_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_태블릿_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
    "SVG_트윗_EN.json": (
        "spa_svg:사피아(SPA)는 main image code 기준; SVG char 자동매핑 미확인 시 avatar/image 직접 지정"
    ),
}


def apply_manual_lite_patches(relative_file: str, lite_data: dict[str, Any]) -> bool:
    """Add targeted guardrails found by roleplay simulation review.

    These patches are intentionally tiny and apply only to lite artifacts. They
    preserve the source tree while making the compressed prompt less brittle for
    small models in multi-lorebook scenes.
    """
    patch = MANUAL_LITE_PATCHES.get(relative_file.replace("\\", "/"))
    if not patch:
        return False
    lite_data["lite"] = f"{lite_data.get('lite', '')};{patch}".strip(";")
    return True


def compare_literals(source_data: Any, lite_data: Any, literals: list[dict[str, str]]) -> list[dict[str, str]]:
    compared = []
    for literal in literals:
        item = dict(literal)
        ptr = item["json_pointer"]
        try:
            source_value = get_pointer(source_data, ptr)
            lite_value = get_pointer(lite_data, ptr)
        except (KeyError, IndexError, ValueError, TypeError):
            source_value = get_pointer(source_data, ptr)
            if contains_string(lite_data, source_value):
                item["status"] = "preserved"
                item["notes"] = "protected literal preserved at aliased path"
            else:
                item["status"] = "blocked"
                item["notes"] = "protected literal pointer missing in lite file"
        else:
            if source_value == lite_value:
                item["status"] = "preserved"
                item["notes"] = ""
            elif contains_string(lite_data, source_value):
                item["status"] = "preserved"
                item["notes"] = "protected literal preserved at aliased path"
            else:
                item["status"] = "must_restore_literal"
                item["notes"] = "protected literal differs from source"
        compared.append(item)
    return compared


def restore_protected_literals(source_data: Any, lite_data: Any) -> Any:
    """Regenerate lite from source and rely on flattening preserving literals.

    This function exists as a named step so future manual main-lite compatibility
    handling has a single place to insert explicit pointer restoration.
    """
    return flatten_lite_prompt(source_data)


def write_snapshot(entries: list[dict[str, Any]], variant: str, path: Path) -> None:
    edenchat_clipboard.write_snapshot(entries, variant, path)


def build_main_lite_report() -> str:
    source_path = SOURCE_ROOT / "메인_프롬프트_EN.json"
    existing_lite_path = SOURCE_ROOT / "메인_프롬프트_lite_EN.json"
    if not existing_lite_path.exists():
        return "# Main Lite Compatibility\n\nExisting main lite file not found.\n"
    source_data, _, _ = load_prompt(source_path)
    lite_data, _, _ = load_prompt(existing_lite_path)
    rows = []
    for literal in extract_protected_literals(source_data):
        ptr = literal["json_pointer"]
        try:
            source_value = get_pointer(source_data, ptr)
            lite_value = get_pointer(lite_data, ptr)
        except Exception:
            rows.append((ptr, literal["kind"], "missing_in_existing_lite"))
            continue
        if source_value != lite_value:
            rows.append((ptr, literal["kind"], "differs_in_existing_lite"))
    lines = [
        "# Main Lite Compatibility",
        "",
        "Existing `docs/prompts/json/메인_프롬프트_lite_EN.json` is audit-only.",
        "Generated `docs/prompts/json_lite/메인_프롬프트_EN.json` is rebuilt from source with protected literals preserved.",
        "",
        "| json_pointer | kind | status |",
        "|---|---|---|",
    ]
    if rows:
        for ptr, kind, status in rows:
            lines.append(f"| `{ptr}` | {kind} | {status} |")
    else:
        lines.append("| - | - | no protected literal diff |")
    lines.append("")
    return "\n".join(lines)


def generate() -> dict[str, Any]:
    source_entries = edenchat_clipboard.collect_lorebooks(SOURCE_ROOT, include_common=False)
    if len(source_entries) != 207:
        raise RuntimeError(f"expected 207 source entries, got {len(source_entries)}")

    manifest_entries = []
    LITE_ROOT.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    for index, entry in enumerate(source_entries, 1):
        source_path = SOURCE_ROOT / entry["file"]
        lite_path = LITE_ROOT / entry["file"]
        source_data, source_body, source_footer = load_prompt(source_path)
        lite_data = restore_protected_literals(source_data, flatten_lite_prompt(source_data))
        patched = apply_manual_lite_patches(entry["file"], lite_data)
        write_prompt(lite_path, lite_data, source_footer)

        _, lite_body, lite_footer = load_prompt(lite_path)
        source_keywords = parse_keywords(source_footer)
        lite_keywords = parse_keywords(lite_footer)
        literals = compare_literals(source_data, lite_data, extract_protected_literals(source_data))
        blocked_literals = [item for item in literals if item["status"] == "blocked"]
        diff_literals = [item for item in literals if item["status"] == "must_restore_literal"]
        reduction_ratio = 1 - (len(lite_body) / len(source_body)) if source_body else 0.0
        trigger_delta = "same" if source_keywords == lite_keywords else "ambiguous_reported"
        notes = []
        if entry["file"] == "메인_프롬프트_EN.json":
            notes.append("main lite coverage generated from source; existing main lite audited separately")
        if patched:
            notes.append("roleplay simulation guardrail patch applied")
        if diff_literals:
            notes.append("protected literal differences require restoration")
        if blocked_literals:
            notes.append("protected literal pointers missing")

        manifest_entries.append(
            {
                "id": entry["file"],
                "source_path": str(source_path.relative_to(SOURCE_ROOT.parent.parent.parent)),
                "lite_path": str(lite_path.relative_to(SOURCE_ROOT.parent.parent.parent)),
                "category": entry["category"],
                "display_name": entry["name"],
                "index": index,
                "target": True,
                "status": "blocked" if blocked_literals else "generated",
                "main_lite_status": "not_applicable",
                "trigger_delta": trigger_delta,
                "source_sha256": sha256_file(source_path),
                "lite_sha256": sha256_file(lite_path),
                "source_trigger_sha256": sha256_text("\n".join(source_keywords)),
                "lite_trigger_sha256": sha256_text("\n".join(lite_keywords)),
                "protected_literals": literals,
                "compression": {
                    "source_chars": len(source_body),
                    "lite_chars": len(lite_body),
                    "reduction_ratio": round(reduction_ratio, 4),
                    "exception_reason": None if reduction_ratio >= 0.35 else "low mechanical compression; requires manual prompt-engineering pass",
                },
                "notes": " ".join(notes),
            }
        )

    original_snapshot_entries = edenchat_clipboard.collect_lorebooks(SOURCE_ROOT)
    lite_entries = edenchat_clipboard.collect_lorebooks(LITE_ROOT)
    write_snapshot(original_snapshot_entries, "original", GOLDEN_ORIGINAL_PATH)
    write_snapshot(lite_entries, "lite", GOLDEN_LITE_PATH)

    manifest = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_root": "docs/prompts/json",
        "lite_root": "docs/prompts/json_lite",
        "compression_policy": {
            "target_total_reduction": 0.45,
            "target_category_median_reduction": 0.35,
            "guidance_style": "prefer positive guidance; keep negative constraints only for safety, format, user agency, and boundary rules",
            "category_exceptions": {
                "SVG": "output URL templates, encoding rules, and examples are exact protected literals",
                "이미지": "image URL templates, situation-code DB, and examples are exact protected literals",
            },
        },
        "backup_note": "Original prompt directory was copied before implementation; see docs/prompts/backups/json-original-*.",
        "entries": manifest_entries,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS_DIR / "main-lite-compatibility.md").write_text(build_main_lite_report(), encoding="utf-8")
    return manifest


def main() -> None:
    manifest = generate()
    total_source = sum(entry["compression"]["source_chars"] for entry in manifest["entries"])
    total_lite = sum(entry["compression"]["lite_chars"] for entry in manifest["entries"])
    reduction = 1 - (total_lite / total_source)
    print(f"generated {len(manifest['entries'])} lite entries")
    print(f"source chars={total_source:,} lite chars={total_lite:,} reduction={reduction:.1%}")
    print(f"manifest={MANIFEST_PATH}")


if __name__ == "__main__":
    main()
