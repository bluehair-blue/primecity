#!/usr/bin/env python3
"""Namespace original branchable lorebook triggers for parallel EdenChat use.

Lite branchable lorebooks use `경량`/`L`. This script moves original
branchable lorebooks to `원본`/`O` so substring-based keyword matching cannot
activate both variants from a lite route token such as `!오디션경량`.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from prompt_lite_utils import (  # noqa: E402
    LITE_ROOT,
    MANIFEST_PATH,
    PROMPTS_DIR,
    SOURCE_ROOT,
    TRIGGER_MARKER,
    dump_prompt_body,
    load_prompt,
    parse_keywords,
    protected_kind,
    sha256_file,
    sha256_text,
    split_prompt_text,
)

ROUTING_MANIFEST = PROMPTS_DIR / "routing_classified" / "manifest.json"
REPORT_PATH = PROMPTS_DIR / "reports" / "original-route-namespace.md"
BACKUP_ROOT = PROMPTS_DIR / "backups"
ROUTEABLE_CLASSES = {"03_routeable_fixed_command", "04_routeable_state_keyword"}

COMMAND_RE = re.compile(r"^([!！/])(\S+)(.*)$")
HEART_RE = re.compile(r"❤️(?!O)")
EMOJI_RE = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u27BF]")
TOKEN_RE = re.compile(r"^[가-힣A-Za-z0-9_.-]+$")
SPECIAL_ROUTE_SYMBOLS = {"▷", "∂", "◐", "✿"}

MAIN_ROUTE_GUIDE = (
    "원본/경량 병렬 운용: user 명령은 !오디션원본/!매니저원본처럼 원본형만 인식. "
    "status 🔧의 모드·라운드 표식은 원본 표식 뒤 O를 붙인다(예:🎤O,📋O,▷O,🎙️1O). "
    "호감도 행은 [이름]: ❤️O숫자 형태로 쓴다."
)


def load_routing_rows() -> list[dict[str, Any]]:
    data = json.loads(ROUTING_MANIFEST.read_text(encoding="utf-8"))
    return [
        row
        for row in data["entries"]
        if row["variant"] == "original" and row["route_class"] in ROUTEABLE_CLASSES
    ]


def command_to_original(keyword: str) -> str:
    match = COMMAND_RE.match(keyword)
    if not match:
        raise ValueError(keyword)
    prefix, core, suffix = match.groups()
    if core.endswith("모드"):
        core = core[:-2]
    return f"{prefix}{core}원본{suffix}"


def keyword_to_original(keyword: str) -> str:
    value = keyword.strip()
    if not value:
        return value
    if COMMAND_RE.match(value):
        return command_to_original(value)
    if "❤️" in value:
        return HEART_RE.sub("❤️O", value)
    if EMOJI_RE.search(value) or any(symbol in value for symbol in SPECIAL_ROUTE_SYMBOLS):
        return value if value.endswith("O") else f"{value}O"
    if value.endswith("모드"):
        return f"{value[:-2]}원본"
    if TOKEN_RE.fullmatch(value):
        return f"{value}원본"
    return f"{value} 원본"


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result


def build_footer(keywords: list[str]) -> str:
    lines = [TRIGGER_MARKER]
    for index in range(0, len(keywords), 8):
        lines.append("// " + ", ".join(keywords[index : index + 8]))
    return "\n".join(lines)


def needs_body_replacement(keyword: str) -> bool:
    return bool(
        "❤️" in keyword
        or EMOJI_RE.search(keyword)
        or any(symbol in keyword for symbol in SPECIAL_ROUTE_SYMBOLS)
    )


def replace_body_route_tokens(
    data: Any,
    replacements: dict[str, str],
    parts: tuple[str | int, ...] = (),
) -> Any:
    if isinstance(data, dict):
        return {
            key: replace_body_route_tokens(value, replacements, (*parts, key))
            for key, value in data.items()
        }
    if isinstance(data, list):
        return [
            replace_body_route_tokens(value, replacements, (*parts, index))
            for index, value in enumerate(data)
        ]
    if not isinstance(data, str):
        return data
    if "keep" in {str(part) for part in parts}:
        return data
    if protected_kind(parts, data):
        return data
    text = data
    for old, new in sorted(replacements.items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(old, new)
    return text


def write_prompt(path: Path, data: Any, footer: str) -> None:
    text = dump_prompt_body(data)
    if footer:
        text = f"{text}\n\n{footer}\n"
    else:
        text = f"{text}\n"
    path.write_text(text, encoding="utf-8")


def make_backup() -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BACKUP_ROOT / f"original-route-namespace-before-{timestamp}"
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copytree(SOURCE_ROOT, backup / "json")
    shutil.copy2(MANIFEST_PATH, backup / "lite_manifest.json")
    if ROUTING_MANIFEST.exists():
        shutil.copy2(ROUTING_MANIFEST, backup / "routing_manifest.json")
    return backup


def ensure_main_route_guide(changed_files: set[str]) -> None:
    main_path = SOURCE_ROOT / "메인_프롬프트_EN.json"
    data, _, footer = load_prompt(main_path)
    if data.get("route_namespace") != MAIN_ROUTE_GUIDE:
        data["route_namespace"] = MAIN_ROUTE_GUIDE
        footer = build_footer(["(원본 메인 프롬프트 — 항상 활성)"])
        write_prompt(main_path, data, footer)
        changed_files.add("메인_프롬프트_EN.json")


def update_manifest(changed_files: set[str]) -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    note = "2026-06-23 original route namespace split for original/lite parallel EdenChat install."
    for entry in manifest["entries"]:
        file_id = entry["id"]
        if file_id not in changed_files:
            continue
        source_path = SOURCE_ROOT / file_id
        lite_path = LITE_ROOT / file_id
        _, source_body, source_footer = load_prompt(source_path)
        _, _, lite_footer = load_prompt(lite_path)
        source_keywords = parse_keywords(source_footer)
        lite_keywords = parse_keywords(lite_footer)
        entry["source_sha256"] = sha256_file(source_path)
        entry["source_trigger_sha256"] = sha256_text("\n".join(source_keywords))
        entry["lite_trigger_sha256"] = sha256_text("\n".join(lite_keywords))
        entry["compression"]["source_chars"] = len(source_body)
        entry["compression"]["reduction_ratio"] = round(
            1 - (int(entry["compression"]["lite_chars"]) / max(1, len(source_body))),
            4,
        )
        if source_keywords != lite_keywords:
            entry["trigger_delta"] = "clear_refinement"
        notes = entry.get("notes", "")
        if note not in notes:
            entry["notes"] = f"{notes} {note}".strip()
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run(apply: bool) -> dict[str, Any]:
    rows = load_routing_rows()
    global_body_replacements: dict[str, str] = {}
    per_file_mapping: dict[str, list[tuple[str, str]]] = {}
    for row in rows:
        mappings: list[tuple[str, str]] = []
        for keyword in row["keywords"]:
            namespaced = keyword_to_original(keyword)
            mappings.append((keyword, namespaced))
            if needs_body_replacement(keyword):
                global_body_replacements[keyword] = namespaced
        per_file_mapping[row["file"]] = mappings

    changed_files: set[str] = set()
    backup = make_backup() if apply else None
    for file_id, mappings in per_file_mapping.items():
        path = SOURCE_ROOT / file_id
        raw = path.read_text(encoding="utf-8")
        body_text, footer = split_prompt_text(raw)
        data = json.loads(body_text)
        new_keywords = dedupe([new for _, new in mappings])
        new_footer = build_footer(new_keywords) if footer else ""
        new_data = replace_body_route_tokens(data, global_body_replacements)
        new_body = dump_prompt_body(new_data)
        new_text = f"{new_body}\n\n{new_footer}\n" if new_footer else f"{new_body}\n"
        if new_text != raw:
            changed_files.add(file_id)
            if apply:
                path.write_text(new_text, encoding="utf-8")

    if apply:
        ensure_main_route_guide(changed_files)
        update_manifest(changed_files)
        write_report(rows, per_file_mapping, changed_files, backup)

    return {
        "backup": str(backup) if backup else None,
        "routeable_files": len(rows),
        "changed_files": len(changed_files),
        "keyword_mappings": sum(len(items) for items in per_file_mapping.values()),
        "deduped_keywords": sum(
            len(dedupe([new for _, new in items])) for items in per_file_mapping.values()
        ),
    }


def write_report(
    rows: list[dict[str, Any]],
    mapping: dict[str, list[tuple[str, str]]],
    changed_files: set[str],
    backup: Path | None,
) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Original Route Namespace Split",
        "",
        "원본 branchable 로어북도 `원본`/`O` 네임스페이스로 이동해 경량 route token의 부분 문자열 충돌을 막았다.",
        "",
        f"- backup: `{backup}`",
        f"- routeable files scanned: {len(rows)}",
        f"- changed original files: {len(changed_files)}",
        "- lite prompt tree: untouched by this pass",
        "- original command style: `!오디션원본`, `!매니저원본`, `!배우원본 APEX`",
        "- original status style: `🎤O`, `📋O`, `▷O`, `🎙️1O`, `[이름]: ❤️O1`",
        "",
        "## Sample Mapping",
        "",
        "| file | old | new |",
        "|---|---|---|",
    ]
    sample_count = 0
    for row in rows:
        file_id = row["file"]
        for old, new in mapping[file_id]:
            if old == new:
                continue
            lines.append(f"| `{file_id}` | `{old}` | `{new}` |")
            sample_count += 1
            if sample_count >= 80:
                break
        if sample_count >= 80:
            break
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Namespace original routeable lorebook keywords")
    parser.add_argument("--apply", action="store_true", help="write changes and backup first")
    args = parser.parse_args()
    print(json.dumps(run(apply=args.apply), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
