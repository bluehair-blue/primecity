#!/usr/bin/env python3
"""Validate EdenChat lorebook keyword organicity and routing health."""

from __future__ import annotations

import io
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

import edenchat_clipboard
from classify_lorebook_routes import keyword_type

if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")


PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROMPTS_ROOT = PROJECT_ROOT / "docs" / "prompts"
REPORTS_ROOT = PROMPTS_ROOT / "reports"
REPORT_JSON = PROMPTS_ROOT / "lorebook_organicity_report.json"
REPORT_MD = REPORTS_ROOT / "lorebook-organicity.md"

COMMON_SESSION_WORDS = {
    "뉴스",
    "기사",
    "보도",
    "댓글",
    "반응",
    "일정",
    "스케줄",
    "무대",
    "방송",
    "라이브",
    "오디션",
    "연습생",
    "대표",
    "매니저",
    "작곡가",
    "팬",
    "위기",
    "사고",
    "논란",
    "루머",
    "해명",
    "관계",
    "질투",
    "언니",
    "동생",
    "도움",
    "괜찮아요",
    "혼자",
    "스튜디오",
    "녹음실",
}

SCENARIOS = {
    "audition_opening": (
        "{{user}}가 PPP 브리핑 태블릿을 받고 오디션장에 입장한다. "
        "한소리가 본선 라운드와 연습생 평가 일정을 설명하고, 강하람은 무대 뒤에서 긴장한다."
    ),
    "character_relation": (
        "시아와 노아가 함께 대기실에 있다. {{user}}가 노아를 칭찬하자 시아가 장난스럽게 질투하고, "
        "둘의 헤어클립 한 쌍 이야기가 나온다."
    ),
    "scandal_media": (
        "서윤의 열애설 루머가 CITY BOARD 게시글과 SIGNAL 트윗으로 퍼지고 PRIME NEWS 속보 기사까지 보도된다. "
        "소속사는 입장문과 해명을 준비한다."
    ),
    "stage_accident": (
        "생방송 무대에서 MR 끊김과 인이어 장비 고장이 겹친다. 관객 반응과 라이브 채팅이 폭발하고, "
        "멤버는 애드립으로 위기를 넘기려 한다."
    ),
    "manager_schedule": (
        "매니저모드에서 오늘 일정과 내일 스케줄을 정리한다. 연습실, 녹음실, 팬미팅, 방송 출연 동선이 겹쳐 조율이 필요하다."
    ),
}


@dataclass
class Entry:
    uid: str
    profile: str
    variant: str
    route_scope: str
    index: int
    name: str
    file: str
    source_file: str
    category: str
    route_class: str
    keywords: list[str]
    body: str
    body_text: str
    size: int


@dataclass
class KeywordRecord:
    keyword: str
    normalized: str
    kind: str
    owners: list[str] = field(default_factory=list)
    owner_files: list[str] = field(default_factory=list)
    body_hits: set[str] = field(default_factory=set)
    self_body_hits: set[str] = field(default_factory=set)
    substring_of: set[str] = field(default_factory=set)


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFKC", value).casefold()


def normalize_keyword(value: str) -> str:
    normalized = normalize_text(value)
    normalized = re.sub(r"\s+", "", normalized)
    normalized = re.sub(r"[\[\]{}()（）【】<>,，.。:：;；'\"`~]", "", normalized)
    return normalized


def is_always_active(keyword: str) -> bool:
    return keyword.startswith("(") and keyword.endswith(")")


def keyword_matches(keyword: str, text: str) -> bool:
    if is_always_active(keyword):
        return False
    key = normalize_text(keyword).strip()
    if not key:
        return False
    haystack = normalize_text(text)
    if key in haystack:
        return True
    compact_key = normalize_keyword(keyword)
    if len(compact_key) >= 3 and compact_key in normalize_keyword(text):
        return True
    return False


def build_profile(variant: str, route_scope: str) -> list[dict[str, Any]]:
    root = edenchat_clipboard.resolve_prompts_dir(variant)
    entries = edenchat_clipboard.collect_lorebooks(root, mix="unified")
    return edenchat_clipboard.filter_entries_by_route_scope(entries, route_scope)


def parse_body_text(body: str) -> str:
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return body
    return json.dumps(data, ensure_ascii=False, separators=(" ", " "))


def load_entries() -> list[Entry]:
    profile_specs = [
        ("shared", "original", "shared"),
        ("original_branchable", "original", "branchable"),
        ("lite_branchable", "lite", "branchable"),
    ]
    loaded: list[Entry] = []
    for profile, variant, route_scope in profile_specs:
        for index, raw in enumerate(build_profile(variant, route_scope), 1):
            loaded.append(
                Entry(
                    uid=f"{profile}:{raw['file']}",
                    profile=profile,
                    variant=variant,
                    route_scope=route_scope,
                    index=index,
                    name=raw["name"],
                    file=raw["file"],
                    source_file=raw.get("source_file", raw["file"]),
                    category=raw["category"],
                    route_class=raw.get("route_class", ""),
                    keywords=raw["keywords"],
                    body=raw["body"],
                    body_text=parse_body_text(raw["body"]),
                    size=raw["size"],
                )
            )
    return loaded


def collect_keywords(entries: list[Entry]) -> dict[str, KeywordRecord]:
    records: dict[str, KeywordRecord] = {}
    for entry in entries:
        for keyword in entry.keywords:
            normalized = normalize_keyword(keyword)
            if not normalized:
                normalized = normalize_text(keyword)
            record = records.setdefault(
                normalized,
                KeywordRecord(keyword=keyword, normalized=normalized, kind=keyword_type(keyword)),
            )
            record.owners.append(entry.uid)
            record.owner_files.append(entry.file)
    for record in records.values():
        record.owner_files = sorted(set(record.owner_files))
    return records


def analyze_body_hits(entries: list[Entry], records: dict[str, KeywordRecord]) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    entry_by_uid = {entry.uid: entry for entry in entries}
    for source in entries:
        for record in records.values():
            if is_always_active(record.keyword):
                continue
            if not keyword_matches(record.keyword, source.body_text):
                continue
            record.body_hits.add(source.uid)
            for owner in record.owners:
                if owner == source.uid:
                    record.self_body_hits.add(source.uid)
                    continue
                target = entry_by_uid.get(owner)
                if not target:
                    continue
                edges.append(
                    {
                        "source": source.uid,
                        "source_name": source.name,
                        "target": owner,
                        "target_name": target.name,
                        "keyword": record.keyword,
                        "source_route_class": source.route_class,
                        "target_route_class": target.route_class,
                    }
                )
    return edges


def analyze_substrings(records: dict[str, KeywordRecord]) -> None:
    ordered = list(records.values())
    for left in ordered:
        if len(left.normalized) < 2:
            continue
        for right in ordered:
            if left.normalized == right.normalized:
                continue
            if len(right.normalized) <= len(left.normalized):
                continue
            if left.normalized in right.normalized:
                left.substring_of.add(right.keyword)


def keyword_risk(record: KeywordRecord) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []
    owner_count = len(set(record.owners))
    body_hit_count = len(record.body_hits)
    normalized = record.normalized
    if owner_count > 1:
        score += 4
        reasons.append(f"same keyword owned by {owner_count} entries")
    if record.kind in {"short_name", "natural_phrase", "lexical_phrase"} and len(normalized) <= 2:
        score += 3
        reasons.append("very short dynamic keyword")
    elif record.kind in {"short_name", "natural_phrase", "lexical_phrase"} and len(normalized) <= 4:
        score += 1
        reasons.append("short dynamic keyword")
    if record.keyword in COMMON_SESSION_WORDS or normalized in {normalize_keyword(word) for word in COMMON_SESSION_WORDS}:
        score += 2
        reasons.append("common session word")
    if body_hit_count >= 20:
        score += 4
        reasons.append(f"appears in {body_hit_count} lorebook bodies")
    elif body_hit_count >= 8:
        score += 2
        reasons.append(f"appears in {body_hit_count} lorebook bodies")
    elif body_hit_count >= 3:
        score += 1
        reasons.append(f"appears in {body_hit_count} lorebook bodies")
    if record.substring_of:
        score += 1
        reasons.append(f"substring of {min(len(record.substring_of), 5)} other keywords")
    return score, reasons


def route_pair_collision(records: dict[str, KeywordRecord], entries: list[Entry]) -> list[dict[str, Any]]:
    by_uid = {entry.uid: entry for entry in entries}
    collisions: list[dict[str, Any]] = []
    for record in records.values():
        owners = [by_uid[uid] for uid in set(record.owners) if uid in by_uid]
        profiles = {owner.profile for owner in owners}
        if {"original_branchable", "lite_branchable"} <= profiles:
            route_classes = sorted({owner.route_class for owner in owners})
            collisions.append(
                {
                    "keyword": record.keyword,
                    "kind": record.kind,
                    "owners": sorted(owner.uid for owner in owners),
                    "files": sorted({owner.file for owner in owners}),
                    "route_classes": route_classes,
                    "severity": "P0" if route_classes and set(route_classes) <= edenchat_clipboard.ROUTEABLE_CLASSES else "P1",
                    "reason": "original/lite branchable sets share the same trigger keyword",
                }
            )
    return sorted(collisions, key=lambda row: (row["severity"], row["keyword"]))


def activation_score(entry: Entry) -> tuple[int, list[str]]:
    text = normalize_text(entry.body_text)
    keys: set[str] = set()
    try:
        data = json.loads(entry.body)
    except json.JSONDecodeError:
        data = {}

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                keys.add(str(key))
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    score = 30
    reasons: list[str] = []
    if entry.size >= 1000:
        score += 12
    elif entry.size >= 450:
        score += 7
    else:
        score -= 10
        reasons.append("short body")
    if any(key in keys for key in {"inner", "in", "overview", "ov", "baseline", "dynamic"}):
        score += 10
    elif re.search(r"(inner|in|overview|ov|baseline|dynamic|scope|ctx)[:=]", text):
        score += 10
    if any(key in keys for key in {"voice", "v"}):
        score += 10
    elif re.search(r"(voice|v\.[가-힣a-z0-9_]+:|말투|대사|\*\*\|\*\*)", text):
        score += 10
    if any(key in keys for key in {"condition", "trigger", "trigger_context", "ctx"}):
        score += 10
    elif re.search(r"(condition|cond|trigger|ctx|등장 중|해당 시|활성|때 참조|경우)", text):
        score += 10
    if any(key in keys for key in {"reaction", "response_patterns", "dynamics", "dyn"}):
        score += 10
    elif re.search(r"(reaction|response|dyn|반응|행동|도발|거부|챙긴|벽을|여파|대응)", text):
        score += 10
    if any(key in keys for key in {"rel", "relationship", "characters", "chars"}):
        score += 8
    elif re.search(r"(rel:|relationship|관계|[가-힣]{2,}=)", text):
        score += 8
    if any(key in keys for key in {"keep", "format", "fmt", "prompt", "url_rules"}):
        score += 10
    elif re.search(r"(keep|format|fmt|prompt|url|https://|!\[\]\(|양식|출력)", text):
        score += 10
    if entry.route_class in edenchat_clipboard.ROUTEABLE_CLASSES:
        if any(keyword.startswith(("!", "！", "/")) for keyword in entry.keywords):
            score += 8
        if any(re.search(r"(❤️|🔞|호감도|라운드|등급|퇴장|R[_\\-]?)", keyword) for keyword in entry.keywords):
            score += 8
    if re.search(r"(if|when|때|조건|경우|활성|참조)", text):
        score += 5
    else:
        reasons.append("weak conditional cue")
    if re.search(r"(reaction|반응|tone|voice|말투|행동|선택|분기|여파|결과)", text):
        score += 5
    else:
        reasons.append("weak creative parameter cue")
    if len(entry.keywords) == 0:
        score -= 15
        reasons.append("no trigger keyword")
    elif len(entry.keywords) > 12 and entry.route_class not in {"02_media_format", "08_dynamic_world_event"}:
        score -= 4
        reasons.append("many broad triggers")
    score = max(0, min(100, score))
    if score < 55 and not reasons:
        reasons.append("low prompt activation density")
    return score, reasons


def replay_activation(entries: list[Entry], seed: str, max_depth: int = 3) -> list[dict[str, Any]]:
    seen: set[str] = set()
    frontier = seed
    steps: list[dict[str, Any]] = []
    for depth in range(max_depth):
        matched: list[dict[str, Any]] = []
        next_text_parts: list[str] = []
        for entry in entries:
            if entry.uid in seen:
                continue
            hits = [keyword for keyword in entry.keywords if keyword_matches(keyword, frontier)]
            if not hits:
                continue
            seen.add(entry.uid)
            matched.append(
                {
                    "uid": entry.uid,
                    "name": entry.name,
                    "category": entry.category,
                    "route_class": entry.route_class,
                    "keywords": hits[:8],
                }
            )
            next_text_parts.append(entry.body_text)
        steps.append({"depth": depth, "matched_count": len(matched), "matches": matched[:40]})
        if not next_text_parts:
            break
        frontier = " ".join(next_text_parts)
    return steps


def graph_summary(entries: list[Entry], edges: list[dict[str, Any]]) -> dict[str, Any]:
    in_degree: Counter[str] = Counter()
    out_degree: Counter[str] = Counter()
    edge_keywords: Counter[str] = Counter()
    for edge in edges:
        out_degree[edge["source"]] += 1
        in_degree[edge["target"]] += 1
        edge_keywords[edge["keyword"]] += 1
    entry_ids = {entry.uid for entry in entries}
    isolated = sorted(
        uid for uid in entry_ids
        if in_degree[uid] == 0 and out_degree[uid] == 0 and ":메인_프롬프트_EN.json" not in uid
    )
    return {
        "edge_count": len(edges),
        "isolated_count": len(isolated),
        "isolated": isolated[:80],
        "top_sources": out_degree.most_common(30),
        "top_targets": in_degree.most_common(30),
        "top_edge_keywords": edge_keywords.most_common(40),
    }


def build_report() -> dict[str, Any]:
    entries = load_entries()
    records = collect_keywords(entries)
    edges = analyze_body_hits(entries, records)
    analyze_substrings(records)
    keyword_rows = []
    for record in records.values():
        risk, reasons = keyword_risk(record)
        keyword_rows.append(
            {
                "keyword": record.keyword,
                "normalized": record.normalized,
                "kind": record.kind,
                "risk": risk,
                "reasons": reasons,
                "owner_count": len(set(record.owners)),
                "owners": sorted(set(record.owners)),
                "body_hit_count": len(record.body_hits),
                "body_hits": sorted(record.body_hits)[:40],
                "substring_of": sorted(record.substring_of)[:20],
            }
        )
    keyword_rows.sort(key=lambda row: (row["risk"], row["owner_count"], row["body_hit_count"]), reverse=True)
    route_collisions = route_pair_collision(records, entries)
    activation_rows = []
    for entry in entries:
        score, reasons = activation_score(entry)
        activation_rows.append(
            {
                "uid": entry.uid,
                "profile": entry.profile,
                "name": entry.name,
                "file": entry.file,
                "category": entry.category,
                "route_class": entry.route_class,
                "score": score,
                "reasons": reasons,
                "size": entry.size,
                "keyword_count": len(entry.keywords),
            }
        )
    activation_rows.sort(key=lambda row: row["score"])
    replay_entries = entries
    replays = {name: replay_activation(replay_entries, seed) for name, seed in SCENARIOS.items()}
    summary = {
        "entries": len(entries),
        "keywords": sum(len(entry.keywords) for entry in entries),
        "unique_normalized_keywords": len(records),
        "route_pair_collision_count": len(route_collisions),
        "high_risk_keyword_count": sum(1 for row in keyword_rows if row["risk"] >= 6),
        "low_activation_count": sum(1 for row in activation_rows if row["score"] < 55),
    }
    profile_counts = Counter(entry.profile for entry in entries)
    profile_keyword_counts = Counter()
    for entry in entries:
        profile_keyword_counts[entry.profile] += len(entry.keywords)
    return {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scope": {
            "profiles": ["shared", "original_branchable", "lite_branchable"],
            "note": "This models the planned dual EdenChat installation: shared unified lorebooks once, plus original/lite branchable sets.",
            "installation_profiles": {
                "dual": "shared + original_branchable + lite_branchable",
                "single_original": "shared + original_branchable",
                "single_lite": "shared + lite_branchable",
            },
            "thresholds": {
                "high_risk_keyword": "risk >= 6",
                "low_activation_lorebook": "activation score < 55",
                "replay_cascade_watch": "depth-1 matched_count >= 40",
            },
            "limitations": [
                "Static body-hit and replay checks are recall-oriented and can overcount if EdenChat does not rescan inserted lorebook text.",
                "Substring matches are useful for finding broad Korean trigger risk but must be manually reviewed before keyword deletion.",
                "Original/lite route-pair collisions are P0 only for simultaneous dual installation; they are deployment-profile issues for single-variant installs.",
            ],
        },
        "summary": summary,
        "profile_counts": dict(profile_counts),
        "profile_keyword_counts": dict(profile_keyword_counts),
        "route_pair_collisions": route_collisions,
        "keyword_risks": keyword_rows,
        "graph": graph_summary(entries, edges),
        "activation_scores": activation_rows,
        "replays": replays,
    }


def severity_counts(collisions: list[dict[str, Any]]) -> Counter[str]:
    return Counter(row.get("severity", "P?") for row in collisions)


def write_markdown(report: dict[str, Any]) -> None:
    REPORTS_ROOT.mkdir(parents=True, exist_ok=True)
    summary = report["summary"]
    sev = severity_counts(report["route_pair_collisions"])
    graph = report["graph"]
    collision_routes = Counter(
        ",".join(row.get("route_classes", [])) or "unknown"
        for row in report["route_pair_collisions"]
    )
    low_activation_profiles = Counter(
        row["profile"] for row in report["activation_scores"] if row["score"] < 55
    )
    replay_counts = {
        name: [step["matched_count"] for step in steps]
        for name, steps in report["replays"].items()
    }
    lines = [
        "# Lorebook Organicity Validation",
        "",
        "검증 범위는 실제 이중 운영 삽입안 기준이다: 공유 통합본 1회 + 원본 분기본 + 경량 분기본.",
        "",
        "이 보고서는 정적 사전검증이다. 실제 EdenChat 매칭이 삽입된 로어북 본문을 다시 trigger 대상으로 삼지 않는다면 replay cascade 수치는 과대평가될 수 있다.",
        "",
        "## Summary",
        "",
        f"- entries: {summary['entries']}",
        f"- trigger keywords: {summary['keywords']}",
        f"- unique normalized keywords: {summary['unique_normalized_keywords']}",
        f"- original/lite branch trigger collisions: {summary['route_pair_collision_count']} (P0={sev.get('P0', 0)}, P1={sev.get('P1', 0)})",
        f"- high-risk keywords: {summary['high_risk_keyword_count']}",
        f"- low activation lorebooks: {summary['low_activation_count']}",
        f"- internal keyword graph edges: {graph['edge_count']}",
        f"- graph-isolated lorebooks: {graph['isolated_count']}",
        "",
        "## Scope And Thresholds",
        "",
        "| item | value |",
        "|---|---|",
        "| dual install | shared + original_branchable + lite_branchable |",
        "| single original | shared + original_branchable |",
        "| single lite | shared + lite_branchable |",
        "| high-risk keyword | risk >= 6 |",
        "| low activation lorebook | activation score < 55 |",
        "| replay cascade watch | depth-1 matched_count >= 40 |",
        "",
        "## False Positive Notes",
        "",
        "- `body_hit_count`, `substring_of`, graph edge, replay cascade는 recall 우선 지표다. 삭제/수정 전 수동 샘플 확인이 필요하다.",
        "- 원본/경량 동일 trigger 충돌은 두 branchable 세트를 동시에 설치할 때 P0다. 단일 variant 설치라면 배포 구성 리스크로 낮아진다.",
        "- 짧은 본문 감점은 보강 후보를 찾는 용도다. 출력 양식 전용 로어북이나 명령어 로어북은 낮은 점수가 곧 실패를 뜻하지 않는다.",
        "",
        "## Recommended Fix Order",
        "",
        "1. 원본/경량 분기본의 동일 trigger를 먼저 분리한다. 이 문제가 남아 있으면 이후의 경량화/통합 효과가 실제 EdenChat 호출 단계에서 상쇄된다.",
        "2. `방송`, `라이브`, `오디션`, `시아`, `노아`, `반응`, `위기`, `PR`처럼 본문 hit가 많은 짧은 키워드를 장면 고유 키워드로 교체한다.",
        "3. 리플레이 depth 1에서 40개 이상으로 폭증하는 샘플은 키워드 연쇄가 아니라 과호출 잡음으로 본다. 이 샘플의 seed keyword부터 좁힌다.",
        "4. activation score가 낮은 분기본은 키워드보다 본문 보강 대상이다. 조건, 반응, 갈등/대가, 출력 목표 중 부족한 축을 한 줄씩 추가한다.",
        "",
        "## Distribution",
        "",
        "### Route Collision Classes",
        "",
        "| route classes | collisions |",
        "|---|---:|",
    ]
    for route_class, count in collision_routes.most_common():
        lines.append(f"| {route_class} | {count} |")
    lines.extend(
        [
            "",
            "### Low Activation By Profile",
            "",
            "| profile | count |",
            "|---|---:|",
        ]
    )
    for profile, count in low_activation_profiles.most_common():
        lines.append(f"| {profile} | {count} |")
    lines.extend(
        [
            "",
            "### Replay Cascade Counts",
            "",
            "| scenario | depth counts |",
            "|---|---|",
        ]
    )
    for scenario, counts in replay_counts.items():
        lines.append(f"| {scenario} | {' -> '.join(str(count) for count in counts)} |")
    lines.extend(
        [
            "",
        "## Critical Findings",
        "",
        ]
    )
    if report["route_pair_collisions"]:
        lines.append("### P0/P1 Original-Lite Route Collisions")
        lines.append("")
        lines.append("분기 가능 로어북의 원본/경량 키워드가 아직 동일하게 겹친다. 두 세트를 같은 작품에 모두 넣으면 같은 세션 텍스트가 원본과 경량을 동시에 호출한다.")
        lines.append("")
        lines.append("| severity | keyword | files |")
        lines.append("|---|---|---|")
        for row in report["route_pair_collisions"][:40]:
            files = "<br>".join(row["files"][:4])
            lines.append(f"| {row['severity']} | `{row['keyword']}` | {files} |")
        lines.append("")
    lines.extend(
        [
            "### Highest-Risk Dynamic Keywords",
            "",
            "| risk | keyword | kind | owners | body hits | reasons |",
            "|---:|---|---|---:|---:|---|",
        ]
    )
    for row in report["keyword_risks"][:50]:
        reasons = "; ".join(row["reasons"])
        lines.append(
            f"| {row['risk']} | `{row['keyword']}` | {row['kind']} | {row['owner_count']} | {row['body_hit_count']} | {reasons} |"
        )
    lines.extend(
        [
            "",
            "### Weak Prompt Activation Candidates",
            "",
            "| score | profile | name | category | route class | reasons |",
            "|---:|---|---|---|---|---|",
        ]
    )
    for row in report["activation_scores"][:40]:
        lines.append(
            f"| {row['score']} | {row['profile']} | {row['name']} | {row['category']} | {row['route_class']} | {'; '.join(row['reasons'])} |"
        )
    lines.extend(
        [
            "",
            "## Replay Samples",
            "",
            "각 샘플은 seed 텍스트 → 호출 로어북 본문에서 다시 발견되는 trigger → 추가 호출을 3-depth까지 정적으로 재현한 것이다.",
            "",
        ]
    )
    for scenario, steps in report["replays"].items():
        lines.append(f"### {scenario}")
        lines.append("")
        for step in steps:
            names = ", ".join(match["name"] for match in step["matches"][:16])
            lines.append(f"- depth {step['depth']}: {step['matched_count']} matches — {names}")
        lines.append("")
    lines.extend(
        [
            "## Interpretation",
            "",
            "- `P0` 원본/경량 분기 충돌은 라우팅 설계상 먼저 해결할 대상이다.",
            "- 본문 hit가 많은 짧은 자연어 키워드는 챗봇이 세션 중 자연스럽게 내뱉을 가능성이 높아 과호출 위험이 있다.",
            "- edge가 너무 많은 키워드는 유기적 연결이 아니라 잡음 연결일 가능성이 높다.",
            "- activation score가 낮은 항목은 조건, 반응, 갈등, 결과, 말투 같은 창작 파라미터를 더 명시해야 한다.",
            "",
        ]
    )
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    report = build_report()
    REPORTS_ROOT.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(report)
    summary = report["summary"]
    print(f"entries={summary['entries']} keywords={summary['keywords']}")
    print(f"route collisions={summary['route_pair_collision_count']}")
    print(f"high-risk keywords={summary['high_risk_keyword_count']}")
    print(f"low activation={summary['low_activation_count']}")
    print(f"report={REPORT_MD}")


if __name__ == "__main__":
    main()
