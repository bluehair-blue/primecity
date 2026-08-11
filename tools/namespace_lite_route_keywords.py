#!/usr/bin/env python3
"""Namespace lite branchable lorebook triggers away from original triggers.

This script keeps the original prompt tree untouched. It updates only
`docs/prompts/json_lite` plus lite manifest metadata so EdenChat can install
original and lite branchable lorebooks side by side without exact trigger
collisions.
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
    PROJECT_ROOT,
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
REPORT_PATH = PROMPTS_DIR / "reports" / "lite-route-namespace.md"
BACKUP_ROOT = PROMPTS_DIR / "backups"
ROUTEABLE_CLASSES = {"03_routeable_fixed_command", "04_routeable_state_keyword"}

COMMAND_RE = re.compile(r"^([!！/])(\S+)(.*)$")
HEART_RE = re.compile(r"❤️(?!L)")
EMOJI_RE = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u27BF]")
TOKEN_RE = re.compile(r"^[가-힣A-Za-z0-9_.-]+$")
SPECIAL_ROUTE_SYMBOLS = {"▷", "∂", "◐", "✿"}

MAIN_ROUTE_GUIDE = (
    "lite_route=경량 분리 운용: user 명령은 !오디션경량/!매니저경량처럼 경량형만 인식. "
    "status 🔧의 모드·라운드 표식은 원본 표식 뒤 L을 붙인다(예:🎤L,📋L,▷L,🎙️1L). "
    "호감도 행은 [이름]: ❤️L숫자 형태로 쓴다."
)


def load_routing_rows() -> list[dict[str, Any]]:
    data = json.loads(ROUTING_MANIFEST.read_text(encoding="utf-8"))
    return [
        row
        for row in data["entries"]
        if row["variant"] == "lite" and row["route_class"] in ROUTEABLE_CLASSES
    ]


def command_to_lite(keyword: str) -> str:
    match = COMMAND_RE.match(keyword)
    if not match:
        raise ValueError(keyword)
    prefix, core, suffix = match.groups()
    if core.endswith("모드"):
        core = core[:-2]
    return f"{prefix}{core}경량{suffix}"


def keyword_to_lite(keyword: str) -> str:
    value = keyword.strip()
    if not value:
        return value
    if COMMAND_RE.match(value):
        return command_to_lite(value)
    if "❤️" in value:
        return HEART_RE.sub("❤️L", value)
    if EMOJI_RE.search(value) or any(symbol in value for symbol in SPECIAL_ROUTE_SYMBOLS):
        return value if value.endswith("L") else f"{value}L"
    if value.endswith("모드"):
        return f"{value[:-2]}경량"
    if TOKEN_RE.fullmatch(value):
        return f"{value}경량"
    return f"{value} 경량"


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


def ensure_main_route_guide(changed_files: set[str]) -> None:
    main_path = LITE_ROOT / "메인_프롬프트_EN.json"
    data, _, footer = load_prompt(main_path)
    lite_text = data.get("lite")
    if not isinstance(lite_text, str):
        raise RuntimeError("lite main prompt has no string `lite` field")
    if MAIN_ROUTE_GUIDE not in lite_text:
        data["lite"] = f"{lite_text};{MAIN_ROUTE_GUIDE}"
        write_prompt(main_path, data, footer)
        changed_files.add("메인_프롬프트_EN.json")


def write_prompt(path: Path, data: Any, footer: str) -> None:
    text = dump_prompt_body(data)
    if footer:
        text = f"{text}\n\n{footer}\n"
    else:
        text = f"{text}\n"
    path.write_text(text, encoding="utf-8")


def make_backup() -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BACKUP_ROOT / f"lite-route-namespace-before-{timestamp}"
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copytree(LITE_ROOT, backup / "json_lite")
    shutil.copy2(MANIFEST_PATH, backup / "lite_manifest.json")
    if ROUTING_MANIFEST.exists():
        shutil.copy2(ROUTING_MANIFEST, backup / "routing_manifest.json")
    return backup


def update_manifest(changed_files: set[str]) -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    note = "2026-06-23 lite route namespace split for original/lite parallel EdenChat install."
    for entry in manifest["entries"]:
        file_id = entry["id"]
        if file_id not in changed_files:
            continue
        source_path = SOURCE_ROOT / file_id
        lite_path = LITE_ROOT / file_id
        _, source_body, source_footer = load_prompt(source_path)
        _, lite_body, lite_footer = load_prompt(lite_path)
        source_keywords = parse_keywords(source_footer)
        lite_keywords = parse_keywords(lite_footer)
        entry["lite_sha256"] = sha256_file(lite_path)
        entry["source_trigger_sha256"] = sha256_text("\n".join(source_keywords))
        entry["lite_trigger_sha256"] = sha256_text("\n".join(lite_keywords))
        entry["compression"]["lite_chars"] = len(lite_body)
        entry["compression"]["reduction_ratio"] = round(
            1 - (len(lite_body) / max(1, len(source_body))),
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
    file_rows = {row["file"]: row for row in rows}
    global_body_replacements: dict[str, str] = {}
    per_file_mapping: dict[str, list[tuple[str, str]]] = {}

    for row in rows:
        mappings: list[tuple[str, str]] = []
        for keyword in row["keywords"]:
            namespaced = keyword_to_lite(keyword)
            mappings.append((keyword, namespaced))
            if needs_body_replacement(keyword):
                global_body_replacements[keyword] = namespaced
        per_file_mapping[row["file"]] = mappings

    changed_files: set[str] = set()
    backup = make_backup() if apply else None

    for file_id, mappings in per_file_mapping.items():
        path = LITE_ROOT / file_id
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
        "routeable_files": len(file_rows),
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
        "# Lite Route Namespace Split",
        "",
        "경량 branchable 로어북이 원본 branchable 로어북과 동시에 설치되어도 같은 trigger를 공유하지 않도록 분리했다.",
        "",
        f"- backup: `{backup}`",
        f"- routeable files scanned: {len(rows)}",
        f"- changed lite files: {len(changed_files)}",
        "- original prompt tree: untouched",
        "- lite command style: `!오디션경량`, `!매니저경량`, `!배우경량 APEX`",
        "- lite status style: `🎤L`, `📋L`, `▷L`, `🎙️1L`, `[이름]: ❤️L1`",
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
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- 자연어 이벤트 trigger도 경량 suffix를 붙여 exact collision을 제거했다.",
            "- 자연어 본문 자체는 대량 치환하지 않았다. `열애설`, `방송`, `오디션` 같은 일반어는 다음 broad-keyword pass에서 원본/경량 공통으로 좁혀야 한다.",
            "- STATUS 출력 양식 문자열은 보존하고, 경량 메인 프롬프트의 비보호 지침에 L 네임스페이스 규칙만 추가했다.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Namespace lite routeable lorebook keywords")
    parser.add_argument("--apply", action="store_true", help="write changes and backup first")
    args = parser.parse_args()
    result = run(apply=args.apply)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
