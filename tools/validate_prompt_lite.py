#!/usr/bin/env python3
"""Validate EdenChat prompt lite tree against source prompts and manifest."""

from __future__ import annotations

import argparse
import json
import statistics
import sys
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
    load_prompt,
    parse_keywords,
    sha256_file,
)

VALID_STATUS = {"planned", "generated", "validated", "ambiguous_reported", "blocked"}
VALID_MAIN_LITE = {"not_applicable", "accepted_existing_lite_diff", "must_restore_literal", "ambiguous_reported", "blocked"}
VALID_TRIGGER = {"same", "clear_refinement", "ambiguous_reported", "blocked"}
VALID_LITERAL = {"preserved", "accepted_existing_lite_diff", "must_restore_literal", "ambiguous_reported", "blocked"}
EXPECTED_MANIFEST_ENTRIES = 207
EXPECTED_CLIPBOARD_ENTRIES = 208


class Validation:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def ok(self) -> bool:
        return not self.errors


def load_manifest(v: Validation) -> dict[str, Any]:
    if not MANIFEST_PATH.exists():
        v.error(f"missing manifest: {MANIFEST_PATH}")
        return {"entries": []}
    try:
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        v.error(f"manifest JSON parse failed: {exc}")
        return {"entries": []}


def entry_paths(entry: dict[str, Any]) -> tuple[Path, Path]:
    return SOURCE_ROOT / entry["id"], LITE_ROOT / entry["id"]


def check_manifest(v: Validation, manifest: dict[str, Any]) -> None:
    entries = manifest.get("entries")
    if not isinstance(entries, list):
        v.error("manifest.entries must be a list")
        return
    if len(entries) != EXPECTED_MANIFEST_ENTRIES:
        v.error(f"manifest entry count must be {EXPECTED_MANIFEST_ENTRIES}, got {len(entries)}")
    seen_indexes = set()
    for row, entry in enumerate(entries, 1):
        prefix = f"entry[{row}] {entry.get('id', '<missing>')}"
        required = {
            "id",
            "source_path",
            "lite_path",
            "category",
            "display_name",
            "index",
            "target",
            "status",
            "main_lite_status",
            "trigger_delta",
            "protected_literals",
            "compression",
            "notes",
        }
        missing = required - set(entry)
        if missing:
            v.error(f"{prefix}: missing fields {sorted(missing)}")
            continue
        if entry["index"] in seen_indexes:
            v.error(f"{prefix}: duplicate index {entry['index']}")
        seen_indexes.add(entry["index"])
        if entry["status"] not in VALID_STATUS:
            v.error(f"{prefix}: invalid status {entry['status']}")
        if entry["main_lite_status"] not in VALID_MAIN_LITE:
            v.error(f"{prefix}: invalid main_lite_status {entry['main_lite_status']}")
        if entry["trigger_delta"] not in VALID_TRIGGER:
            v.error(f"{prefix}: invalid trigger_delta {entry['trigger_delta']}")
        if entry["status"] == "blocked":
            v.error(f"{prefix}: blocked status")
        if entry["trigger_delta"] == "blocked":
            v.error(f"{prefix}: blocked trigger_delta")
        if entry["main_lite_status"] == "blocked":
            v.error(f"{prefix}: blocked main_lite_status")
        if entry["status"] in {"ambiguous_reported", "blocked"} and not entry["notes"].strip():
            v.error(f"{prefix}: exception status requires notes")
        for literal in entry["protected_literals"]:
            if literal.get("status") not in VALID_LITERAL:
                v.error(f"{prefix}: invalid protected literal status {literal.get('status')}")
            if literal.get("status") == "blocked":
                v.error(f"{prefix}: blocked protected literal {literal.get('json_pointer')}")
            if literal.get("status") in {"accepted_existing_lite_diff", "must_restore_literal", "ambiguous_reported", "blocked"} and not literal.get("notes", "").strip():
                v.error(f"{prefix}: protected literal exception requires notes {literal.get('json_pointer')}")
        compression = entry["compression"]
        for key in ("source_chars", "lite_chars", "reduction_ratio"):
            if key not in compression:
                v.error(f"{prefix}: compression missing {key}")
        for flat in ("compression_status", "trigger_delta_status", "format_status"):
            if flat in entry:
                v.error(f"{prefix}: flat field {flat} is not canonical")


def check_tree(v: Validation, manifest: dict[str, Any]) -> None:
    for entry in manifest.get("entries", []):
        source_path, lite_path = entry_paths(entry)
        if not source_path.exists():
            v.error(f"missing source file: {source_path}")
        if not lite_path.exists():
            v.error(f"missing lite file: {lite_path}")
        if source_path.exists() and entry.get("source_sha256") and sha256_file(source_path) != entry["source_sha256"]:
            v.error(f"source hash changed after manifest: {entry['id']}")


def check_json(v: Validation, manifest: dict[str, Any]) -> None:
    for entry in manifest.get("entries", []):
        source_path, lite_path = entry_paths(entry)
        for label, path in (("source", source_path), ("lite", lite_path)):
            if not path.exists():
                continue
            try:
                load_prompt(path)
            except Exception as exc:
                v.error(f"{entry['id']}: {label} JSON body parse failed: {exc}")


def check_triggers(v: Validation, manifest: dict[str, Any]) -> None:
    for entry in manifest.get("entries", []):
        source_path, lite_path = entry_paths(entry)
        if not source_path.exists() or not lite_path.exists():
            continue
        _, _, source_footer = load_prompt(source_path)
        _, _, lite_footer = load_prompt(lite_path)
        source_keywords = parse_keywords(source_footer)
        lite_keywords = parse_keywords(lite_footer)
        expected = "same" if source_keywords == lite_keywords else entry.get("trigger_delta")
        if source_keywords != lite_keywords and entry.get("trigger_delta") == "same":
            v.error(f"{entry['id']}: trigger changed but manifest says same")
        if entry.get("trigger_delta") == "clear_refinement" and not entry.get("notes", "").strip():
            v.error(f"{entry['id']}: clear_refinement requires notes")
        if expected not in VALID_TRIGGER:
            v.error(f"{entry['id']}: invalid trigger classification {expected}")


def check_protected(v: Validation, manifest: dict[str, Any]) -> None:
    for entry in manifest.get("entries", []):
        source_path, lite_path = entry_paths(entry)
        if not source_path.exists() or not lite_path.exists():
            continue
        source_data, _, _ = load_prompt(source_path)
        lite_data, _, _ = load_prompt(lite_path)
        actual_literals = extract_protected_literals(source_data)
        manifest_literals = {item.get("json_pointer"): item for item in entry.get("protected_literals", [])}
        for literal in actual_literals:
            ptr = literal["json_pointer"]
            if ptr not in manifest_literals:
                v.error(f"{entry['id']}: protected literal missing from manifest {ptr}")
                continue
            try:
                source_value = get_pointer(source_data, ptr)
                lite_value = get_pointer(lite_data, ptr)
            except Exception as exc:
                source_value = get_pointer(source_data, ptr)
                if not contains_string(lite_data, source_value):
                    v.error(f"{entry['id']}: protected literal pointer missing {ptr}: {exc}")
                continue
            if source_value != lite_value:
                if not contains_string(lite_data, source_value):
                    v.error(f"{entry['id']}: protected literal differs {ptr}")


def current_snapshot(variant: str, root: Path) -> dict[str, Any]:
    entries = edenchat_clipboard.collect_lorebooks(root)
    return edenchat_clipboard.snapshot_entries(entries, variant)


def check_clipboard_snapshot(v: Validation) -> None:
    original = current_snapshot("original", SOURCE_ROOT)
    lite = current_snapshot("lite", LITE_ROOT)
    if original["count"] != EXPECTED_CLIPBOARD_ENTRIES:
        v.error(f"original snapshot count must be {EXPECTED_CLIPBOARD_ENTRIES}, got {original['count']}")
    if lite["count"] != EXPECTED_CLIPBOARD_ENTRIES:
        v.error(f"lite snapshot count must be {EXPECTED_CLIPBOARD_ENTRIES}, got {lite['count']}")
    for left, right in zip(original["entries"], lite["entries"]):
        for key in ("index", "category", "display_name"):
            if left[key] != right[key]:
                v.error(f"snapshot mismatch at {left['index']} {key}: {left[key]} != {right[key]}")
    GOLDEN_ORIGINAL_PATH.write_text(json.dumps(original, ensure_ascii=False, indent=2), encoding="utf-8")
    GOLDEN_LITE_PATH.write_text(json.dumps(lite, ensure_ascii=False, indent=2), encoding="utf-8")


def compression_stats(manifest: dict[str, Any]) -> tuple[float, dict[str, list[float]]]:
    total_source = 0
    total_lite = 0
    by_category: dict[str, list[float]] = {}
    for entry in manifest.get("entries", []):
        comp = entry.get("compression", {})
        source = int(comp.get("source_chars", 0))
        lite = int(comp.get("lite_chars", 0))
        total_source += source
        total_lite += lite
        ratio = float(comp.get("reduction_ratio", 0))
        by_category.setdefault(entry.get("category", "unknown"), []).append(ratio)
    total_reduction = 1 - (total_lite / total_source) if total_source else 0.0
    return total_reduction, by_category


def check_compression(v: Validation, manifest: dict[str, Any], write_report: bool) -> None:
    total_reduction, by_category = compression_stats(manifest)
    exceptions = manifest.get("compression_policy", {}).get("category_exceptions", {})
    if total_reduction < 0.45:
        v.warn(f"total compression below target 45%: {total_reduction:.1%}")
    rows = ["# Prompt Lite Compression", "", "| category | entries | median reduction | exception |", "|---|---:|---:|---|"]
    for category, ratios in sorted(by_category.items()):
        median = statistics.median(ratios)
        exception = exceptions.get(category, "")
        if median < 0.35 and not exception:
            v.warn(f"{category} median compression below target 35%: {median:.1%}")
        rows.append(f"| {category} | {len(ratios)} | {median:.1%} | {exception or '-'} |")
    rows.append("")
    rows.append(f"Total reduction: {total_reduction:.1%}")
    if write_report:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        (REPORTS_DIR / "compression.md").write_text("\n".join(rows) + "\n", encoding="utf-8")


def run_checks(check: str, write_reports: bool) -> Validation:
    v = Validation()
    manifest = load_manifest(v)
    selected = {check} if check != "all" else {"manifest", "tree", "json", "triggers", "protected-literals", "clipboard-snapshot", "compression"}
    if "manifest" in selected:
        check_manifest(v, manifest)
    if "tree" in selected:
        check_tree(v, manifest)
    if "json" in selected:
        check_json(v, manifest)
    if "triggers" in selected:
        check_triggers(v, manifest)
    if "protected-literals" in selected:
        check_protected(v, manifest)
    if "clipboard-snapshot" in selected:
        check_clipboard_snapshot(v)
    if "compression" in selected:
        check_compression(v, manifest, write_reports)
    if check == "final":
        check_manifest(v, manifest)
        check_tree(v, manifest)
        check_json(v, manifest)
        check_triggers(v, manifest)
        check_protected(v, manifest)
        check_clipboard_snapshot(v)
        check_compression(v, manifest, write_reports)
        if v.warnings:
            v.error("final check has unresolved warnings")
    return v


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate EdenChat prompt lite artifacts")
    parser.add_argument(
        "--check",
        default="all",
        choices=["all", "manifest", "tree", "json", "triggers", "protected-literals", "clipboard-snapshot", "compression", "final"],
    )
    parser.add_argument("--write-reports", action="store_true")
    args = parser.parse_args()

    result = run_checks(args.check, args.write_reports)
    for warning in result.warnings:
        print(f"WARN: {warning}")
    for error in result.errors:
        print(f"ERROR: {error}")
    if result.ok():
        print(f"PASS: {args.check}")
    else:
        print(f"FAIL: {args.check} ({len(result.errors)} errors, {len(result.warnings)} warnings)")
        sys.exit(1)


if __name__ == "__main__":
    main()
