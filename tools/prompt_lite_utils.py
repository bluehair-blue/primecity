#!/usr/bin/env python3
"""Shared helpers for EdenChat prompt lite generation and validation.

These helpers deliberately keep original prompt files read-only. Generation
targets `docs/prompts/json_lite`, while validators compare that tree against
`docs/prompts/json` and the manifest.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROMPTS_DIR = PROJECT_ROOT / "docs" / "prompts"
SOURCE_ROOT = PROMPTS_DIR / "json"
LITE_ROOT = PROMPTS_DIR / "json_lite"
REPORTS_DIR = PROMPTS_DIR / "reports"
MANIFEST_PATH = PROMPTS_DIR / "lite_manifest.json"
GOLDEN_ORIGINAL_PATH = PROMPTS_DIR / "lite_golden_original.json"
GOLDEN_LITE_PATH = PROMPTS_DIR / "lite_golden_lite.json"
TRIGGER_MARKER = "// --- TRIGGER ---"

PROTECTED_KEYS = {
    "fmt",
    "format",
    "formatting",
    "template",
    "schema",
    "ex",
    "example",
    "examples",
    "sample",
    "url",
    "note_format",
    "status_fmt",
    "output_format",
    "codes",
    "block",
    "placement",
    "strict",
    "critical",
    "db",
    "url_rules",
    "url_encoding",
    "forbidden",
    "space",
    "comma",
    "question",
    "양식",
    "예시",
    "출력형식",
    "상태창_형식",
}

PROTECTED_MARKERS = (
    "```",
    "STATUS",
    "![](",
    "http://",
    "https://",
    "<div",
    "</div>",
    "{캐릭터코드}",
    "{상황코드}",
    "{charCode}",
    "{situationCode}",
    "{완료}",
    "{현재}",
    "{다음}",
)


def split_prompt_text(raw: str) -> tuple[str, str]:
    """Split JSON body and file-end trigger footer without touching body keys."""
    if TRIGGER_MARKER not in raw:
        return raw.strip(), ""
    body, footer = raw.rsplit(TRIGGER_MARKER, 1)
    return body.strip(), f"{TRIGGER_MARKER}{footer.rstrip()}"


def parse_keywords(footer: str) -> list[str]:
    if not footer:
        return []
    lines = footer.splitlines()[1:]
    keywords: list[str] = []
    for line in lines:
        line = line.lstrip("/ ").strip()
        if not line or line.startswith("---"):
            continue
        for keyword in line.split(","):
            keyword = keyword.strip()
            if keyword:
                keywords.append(keyword)
    return keywords


def load_prompt(path: Path) -> tuple[Any, str, str]:
    raw = path.read_text(encoding="utf-8")
    body, footer = split_prompt_text(raw)
    return json.loads(body), body, footer


def dump_prompt_body(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def write_prompt(path: Path, data: Any, footer: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = dump_prompt_body(data)
    if footer:
        text = f"{text}\n\n{footer}\n"
    else:
        text = f"{text}\n"
    path.write_text(text, encoding="utf-8")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pointer(parts: Iterable[str | int]) -> str:
    escaped = []
    for part in parts:
        s = str(part).replace("~", "~0").replace("/", "~1")
        escaped.append(s)
    return "/" + "/".join(escaped)


def pointer_parts(ptr: str) -> list[str]:
    if not ptr or ptr == "/":
        return []
    return [p.replace("~1", "/").replace("~0", "~") for p in ptr.lstrip("/").split("/")]


def get_pointer(data: Any, ptr: str) -> Any:
    current = data
    for part in pointer_parts(ptr):
        if isinstance(current, list):
            current = current[int(part)]
        else:
            current = current[part]
    return current


def iter_strings(data: Any, parts: tuple[str | int, ...] = ()) -> Iterable[tuple[tuple[str | int, ...], str]]:
    if isinstance(data, dict):
        for key, value in data.items():
            yield from iter_strings(value, (*parts, key))
    elif isinstance(data, list):
        for index, value in enumerate(data):
            yield from iter_strings(value, (*parts, index))
    elif isinstance(data, str):
        yield parts, data


def contains_string(data: Any, value: str) -> bool:
    return any(candidate == value for _, candidate in iter_strings(data))


def protected_kind(parts: tuple[str | int, ...], value: str) -> str | None:
    string_keys = [str(part) for part in parts if not isinstance(part, int)]
    last_key = string_keys[-1].lower() if string_keys else ""
    lower_keys = {key.lower() for key in string_keys}
    if last_key in PROTECTED_KEYS or lower_keys & PROTECTED_KEYS:
        if last_key == "url" or "![](" in value or "http" in value:
            return "url_template"
        if "example" in last_key or "예시" in last_key or "ex" == last_key:
            return "example_format"
        if "status" in lower_keys or "상태" in "".join(string_keys):
            return "status_format"
        return "output_format"
    if any(marker in value for marker in PROTECTED_MARKERS):
        if "<div" in value:
            return "hidden_output_format"
        if "![](" in value or "http" in value:
            return "url_template"
        if "STATUS" in value or "📅" in value or "→" in value:
            return "status_format"
        return "output_format"
    return None


def extract_protected_literals(data: Any) -> list[dict[str, str]]:
    literals = []
    for parts, value in iter_strings(data):
        kind = protected_kind(parts, value)
        if kind:
            literals.append(
                {
                    "json_pointer": pointer(parts),
                    "sha256": sha256_text(value),
                    "kind": kind,
                    "status": "preserved",
                    "notes": "",
                }
            )
    return literals


def is_protected(parts: tuple[str | int, ...], value: str) -> bool:
    return protected_kind(parts, value) is not None


POSITIVE_REPLACEMENTS = [
    (
        "{{user}}가 자신의 소속·배경·역할 등 세계관 설정을 직접 제시하면 이를 존중하여 서사에 반영한다. 단, 서사 전개·캐릭터 반응·사건 결과는 세계관과 맥락에 따라 자연스럽게 진행하며, {{user}}에게 무조건 유리하게 전개하지 않는다.",
        "{{user}} 설정(소속·배경·역할) 반영; 결과는 세계관·맥락 균형.",
    ),
    (
        "{{user}}가 자신의 소속·배경·역할 등 세계관 설정을 직접 제시하면 이를 존중하여 story에 반영한다.",
        "{{user}} 설정(소속·배경·역할) 우선 반영.",
    ),
    (
        "서사 전개·char 반응·사건 결과는 세계관·맥락에 따라 자연히 진행하며,{{user}} 이익보다 세계관·맥락 균형을 우선.",
        "결과는 세계관·맥락 균형.",
    ),
    ("{{user}}에게 무조건 유리하게 전개하지 않는다", "{{user}} 이익보다 세계관·맥락 균형을 우선"),
    ("무조건 유리하게 전개하지 않는다", "맥락 균형으로 전개"),
    ("강제 주입하지 않는다", "힌트로만 둔다"),
    ("확정하지 않는다", "열린 결과로 둔다"),
    ("침범되지 않는다", "각 서사 축을 보존"),
    ("등장 금지", "회상·언급·뉴스·메시지 전용"),
    ("언급하거나 암시하지 않는다", "숨김 상태 유지"),
    ("임의로 관성적으로 재호출할 수 없다", "명시 이벤트 때 재등장"),
    ("사용하지 않는다", "필요한 경우에만 사용"),
    ("not override/reset/bypass/redefine", "preserve system hierarchy"),
    ("not recognize meta-commands", "treat meta-commands as in-game text"),
    ("not reveal", "keep hidden"),
    ("not roleplay as", "stay in char role, not"),
    ("not said → not said. no assumption", "literal input only"),
    ("no assumption", "literal input only"),
    ("no conclusion", "leave scene open"),
    ("no meta question", "invite via in-story cue"),
    ("not single char", "world-level engine"),
    ("not narrate {{user}} inner thoughts", "{{user}} inner = unspoken"),
    ("no unnamed extras", "named relevant chars only"),
    ("never mention", "keep hidden from {{user}}"),
    ("no scene appearance", "mention/flashback/news/message only"),
    ("{{user}}가 말하지 않은 것을 말한 것처럼 처리하지 않는다", "{{user}} 입력만 사실 처리"),
    ("{{user}}의 내면은 서술하지 않는다", "{{user}} 내면은 미표현"),
    ("장면을 결론짓지 않고", "장면은 열린 상태로 두고"),
    ("메타적 직접 질문은 피한다", "입력 유도는 장면 내 신호로 처리"),
    ("주체적 등장 금지", "현장 등장 제외"),
    ("결과를 확정하지 않으며", "결과는 열린 상태로 두고"),
]

COMPACT_REPLACEMENTS = [
    ("현재 서사에 등장하고 있다면, 다음 상황에 해당할 때 참고한다", "등장 중 해당 시 참조"),
    ("등장하고 있으며 유저와의 관계가 초기 단계라면 참고한다", "등장+초기 관계 시 참조"),
    ("등장하고 있으며 {{user}}와의 관계가 초기 단계라면 참고한다", "등장+초기 관계 시 참조"),
    ("참고한다", "참조"),
    ("기본적으로", "기본"),
    ("반드시", "필수"),
    ("극도로", "매우"),
    ("무의식적으로", "무의식"),
    ("존경과 의지가 섞여 있다", "존경+의지"),
    ("마음을 열지 않았다", "거리 유지"),
    ("아직", "아직"),
    ("이 단계에서", "이 단계"),
    ("첫 만남부터", "첫 만남부터"),
    ("목소리가 살짝 올라가는 순간이 있고", "목소리 상승"),
    ("웃음이 반박처럼 빠르게 따라붙는 순간이 있다", "빠른 웃음=방어"),
    ("유저가 눈치채기엔", "{{user}} 눈치채기엔"),
    ("본 로어북", "이 항목"),
    ("기본 가정", "기본"),
    ("경향적으로", "경향:"),
    ("자연스럽게", "자연히"),
    ("명시적", "명시"),
    ("가능성의 힌트", "가능 힌트"),
    ("서사 맥락", "맥락"),
    ("세계관과 맥락", "세계관·맥락"),
    ("상태창", "status"),
    ("캐릭터", "char"),
    ("서사", "story"),
    ("로어북", "lore"),
    ("유저", "{{user}}"),
    ("사용자", "{{user}}"),
    ("소속 아티스트", "소속 artist"),
    ("아티스트", "artist"),
    ("프로듀서", "PD"),
    ("프라임시티", "PrimeCity"),
    ("발생 가능", "발생"),
    ("진행 가능", "진행"),
    ("반영된다", "반영"),
    ("결정한다", "결정"),
    ("유지한다", "유지"),
    ("표시한다", "표시"),
    ("활용한다", "활용"),
    ("등장한다", "등장"),
    ("처리한다", "처리"),
    ("관리한다", "관리"),
    ("전개한다", "전개"),
]

KEY_ALIASES = {
    "absolute_rules": "abs",
    "rules": "rule",
    "narration": "nar",
    "scene_roster": "roster",
    "hidden_output": "hidden",
    "mode_scope": "scope",
    "user_priority": "u",
    "overview": "ov",
    "context_check": "ctx",
    "voice": "v",
    "inner": "in",
    "dynamics": "dyn",
    "first_impression": "first",
    "disappoint": "down",
    "impress": "up",
    "deep_bond": "bond",
    "relationship": "rel",
    "principle": "p",
    "layer_principle": "layer",
    "character_state_default": "char_state",
    "autonomy_principle": "auto",
    "interop_hint": "interop",
    "events": "evt",
    "external_agencies": "ext",
    "dilemmas": "dil",
    "funding": "fund",
    "purpose": "pur",
    "priority": "pri",
    "maintain": "keep",
    "aftermath": "after",
    "opening": "open",
    "situation": "sit",
    "demeanor": "dm",
    "toward_user": "to_user",
    "worker_domain": "work",
    "question": "q",
    "answer": "a",
    "description": "desc",
    "characters": "chars",
    "facilities": "fac",
    "residents": "res",
    "worker_domain": "domain",
    "platform": "plat",
    "scope_note": "scope",
    "mode_interop": "interop",
    "phase1": "p1",
    "phase2": "p2",
    "phase3": "p3",
    "phase1_shy": "p1_shy",
    "phase2_surrender": "p2_surrender",
    "phase1_playful": "p1_playful",
    "phase2_switch": "p2_switch",
    "climax_collapse": "climax",
    "first_turn": "first",
    "response_order": "order",
    "schedule_line": "schedule",
    "disambiguation": "disambig",
    "situation_flow": "flow",
    "critical": "crit",
    "examples": "ex",
    "format": "fmt",
    "method": "m",
    "reflection": "reflect",
    "vars": "var",
    "style": "st",
    "emotion": "emo",
    "tension": "tense",
    "monologue": "mono",
    "multi_char": "multi",
    "role": "r",
    "flow": "flow",
    "time": "time",
    "space": "space",
    "tone": "tone",
    "title": "t",
    "name": "nm",
    "note": "n",
    "_note": "n",
    "mentor_signatures": "mentor",
    "장소": "loc",
    "도입_패턴": "open",
    "코칭_방식": "coach",
    "라포_변화": "rapport",
    "시그니처_제스처": "gesture",
    "발생_시점": "when",
    "결과_표현": "result",
    "라벨": "label",
    "설명": "desc",
    "방식": "method",
    "조건": "cond",
    "효과": "fx",
    "예외": "except",
    "선택지": "choice",
    "행동": "act",
    "대사": "line",
    "장면": "scene",
    "감정": "emo",
    "관계": "rel",
    "원칙": "p",
    "규칙": "rule",
    "목적": "pur",
    "상태": "state",
    "상황": "sit",
    "흐름": "flow",
    "종류": "type",
    "진행_구조": "flow",
    "팬_상호작용_패턴": "fan",
    "캐릭터별_톤_경향": "tone",
    "svg_hooks": "svg",
    "사인회": "sign",
    "단독_팬미팅": "fanmeet",
    "생일_카페": "birthday_cafe",
    "굿즈_이벤트": "goods",
    "영상통화_팬미팅": "video_call",
    "투어_팬미팅": "tour",
    "브이라이브": "vlive",
    "대처_패턴": "react",
    "캐릭터별_경향": "char",
    "여파": "after",
    "장비_고장": "equip",
    "음향_사고": "sound",
    "의상_해프닝": "costume",
    "넘어짐_부상": "fall",
    "NG_애드립": "ng",
    "방송_사고": "live",
    "외부_변수": "external",
    "심리_사고": "panic",
    "트레이드오프": "tradeoff",
    "투자_유치_트리거": "invest",
}

PATH_BUDGETS = {
    "context_check": 36,
    "ctx": 36,
    "demeanor": 55,
    "dm": 55,
    "defense": 52,
    "toward_user": 48,
    "to_user": 48,
    "unaware": 48,
    "wall": 55,
    "shift": 55,
    "purpose": 48,
    "pur": 48,
    "prompt": 50,
    "desc": 42,
    "origin": 45,
    "stage": 45,
    "in": 92,
    "inner": 92,
    "u": 82,
    "user_priority": 82,
    "ov": 88,
    "overview": 88,
    "scope": 82,
    "traits": 72,
    "n": 45,
    "note": 45,
    "_note": 42,
    "first": 55,
    "down": 55,
    "up": 55,
    "bond": 55,
    "events": 45,
    "evt": 45,
    "fund": 45,
    "external_agencies": 52,
    "ext": 52,
    "dilemmas": 45,
    "dil": 45,
    "conn": 48,
    "rel": 48,
    "loop": 44,
    "open": 55,
    "coach": 58,
    "rapport": 55,
    "gesture": 42,
    "loc": 36,
    "when": 55,
    "result": 55,
    "tradeoff": 85,
    "트레이드오프": 85,
    "invest": 65,
    "mode_interop": 70,
    "interop": 70,
    "char_state": 85,
    "auto": 85,
    "layer": 70,
    "Day": 70,
    "자금_고갈_임박": 85,
    "돌파_지표": 90,
}

DROP_KEYS = {
    "id",
    "title",
}


def compact_text(value: str) -> str:
    text = value.strip()
    for old, new in POSITIVE_REPLACEMENTS:
        text = text.replace(old, new)
    for old, new in COMPACT_REPLACEMENTS:
        text = text.replace(old, new)
    text = text.replace(" — ", " — ")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s*([·,:;|/→])\s*", r"\1", text)
    text = text.replace(" .", ".").replace(" ,", ",")
    return text


def sentence_budget(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    parts = re.split(r"(?<=[.!?])\s+|(?<=다\.)\s*|(?<=음\.)\s*", text)
    kept: list[str] = []
    used = 0
    for part in parts:
        part = part.strip()
        if not part:
            continue
        next_len = used + len(part) + (1 if kept else 0)
        if next_len > max_chars:
            break
        kept.append(part)
        used = next_len
    if kept:
        return ";".join(kept)
    for delimiter in (".", ";", ",", "/", "→", "—", ")", "·"):
        index = text.rfind(delimiter, 0, max_chars + 1)
        if index >= min(24, max_chars // 2):
            return text[: index + 1].rstrip(" ,;:/→·-")
    cut = text[:max_chars].rstrip()
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0].rstrip()
    cut = cut.rstrip(" ,;:/→·-")
    cut = re.sub(r"(의|와|과|은|는|이|가|을|를|및|본)$", "", cut).rstrip()
    if cut.count("(") > cut.count(")") and "(" in cut:
        prefix = cut.rsplit("(", 1)[0].rstrip()
        if len(prefix) >= max_chars // 2:
            cut = prefix
    return cut


def budget_for(parts: tuple[str | int, ...]) -> int | None:
    keys = [str(part) for part in parts if not isinstance(part, int)]
    for key in reversed(keys):
        if key in PATH_BUDGETS:
            return PATH_BUDGETS[key]
    if len(keys) >= 2 and keys[-2] in PATH_BUDGETS:
        return PATH_BUDGETS[keys[-2]]
    return 45 if keys and len(keys[-1]) > 0 else None


def compact_dialogue_example(value: str) -> str:
    text = re.sub(r"^[^|]{1,16}\s+\*\*\|\*\*\s*", "", value.strip())
    text = compact_text(text)
    return text


def compact_label_part(part: str) -> str:
    if part in {"trigger", "triggers"}:
        return part
    alias = KEY_ALIASES.get(part)
    if alias:
        return alias
    label = re.sub(r"\s*\([^)]*\)", "", part)
    label = re.sub(r"\s+", "", label)
    return label


def path_label(parts: tuple[str | int, ...]) -> str:
    labels = []
    for part in parts:
        if isinstance(part, int):
            continue
        labels.append(compact_label_part(str(part)))
    return ".".join(labels)


def flatten_lite_prompt(data: Any) -> dict[str, Any]:
    """Flatten prompt JSON into compact path:value guidance plus exact keeps.

    The lite tree is consumed as prompt text through `edenchat_clipboard.py`, so
    repeated source JSON paths are less valuable than dense, readable guidance.
    Protected output-format strings remain exact in `keep`; ordinary guidance is
    grouped under its closest useful parent to save tokens.
    """
    fields: list[str] = []
    keeps: list[str] = []

    def compact_value(parts: tuple[str | int, ...], value: str) -> str:
        text = compact_text(value)
        max_chars = budget_for(parts)
        if max_chars:
            text = sentence_budget(text, max_chars)
        return text

    def add_field(parts: tuple[str | int, ...], value: str) -> None:
        text = compact_value(parts, value)
        label = path_label(parts)
        fields.append(f"{label}:{text}" if label else text)

    def add_list(parts: tuple[str | int, ...], values: list[Any]) -> bool:
        if not values or not all(not isinstance(item, (dict, list)) for item in values):
            return False
        string_keys = {str(part) for part in parts if not isinstance(part, int)}
        items = values[:1] if "voice" in string_keys or "v" in string_keys else values
        compacted: list[str] = []
        for index, item in enumerate(items):
            if isinstance(item, str):
                if is_protected((*parts, index), item):
                    keeps.append(item)
                    continue
                text = compact_dialogue_example(item) if "voice" in string_keys else compact_value((*parts, index), item)
                compacted.append(text)
            elif item is not None:
                compacted.append(str(item))
        if compacted:
            label = path_label(parts)
            fields.append(f"{label}:{'|'.join(compacted)}" if label else "|".join(compacted))
        return True

    def direct_scalar_pairs(value: dict[str, Any], parts: tuple[str | int, ...]) -> list[str]:
        pairs: list[str] = []
        for key, child in value.items():
            if key in DROP_KEYS:
                continue
            child_parts = (*parts, key)
            if isinstance(child, str):
                if is_protected(child_parts, child):
                    keeps.append(child)
                    continue
                pairs.append(f"{compact_label_part(str(key))}={compact_value(child_parts, child)}")
            elif isinstance(child, (int, float, bool)):
                pairs.append(f"{compact_label_part(str(key))}={child}")
        return pairs

    def walk(value: Any, parts: tuple[str | int, ...] = ()) -> None:
        if isinstance(value, dict):
            pairs = direct_scalar_pairs(value, parts)
            if len(pairs) >= 2:
                label = path_label(parts)
                fields.append(f"{label}:{'|'.join(pairs)}" if label else "|".join(pairs))
            elif len(pairs) == 1:
                key = pairs[0].split("=", 1)[0]
                child = next(
                    child_value
                    for child_key, child_value in value.items()
                    if child_key not in DROP_KEYS and compact_label_part(str(child_key)) == key
                )
                if not isinstance(child, str) or not is_protected((*parts, key), child):
                    fields.append(f"{path_label(parts)}:{pairs[0]}" if path_label(parts) else pairs[0])
            for key, child in value.items():
                if key in DROP_KEYS:
                    continue
                if isinstance(child, (dict, list)):
                    walk(child, (*parts, key))
        elif isinstance(value, list):
            if add_list(parts, value):
                return
            for index, child in enumerate(value):
                walk(child, (*parts, index))
        elif isinstance(value, str):
            if is_protected(parts, value):
                keeps.append(value)
                return
            if "voice" in {str(part) for part in parts if not isinstance(part, int)}:
                value = compact_dialogue_example(value)
            add_field(parts, value)
        elif value is not None:
            label = path_label(parts)
            fields.append(f"{label}:{value}" if label else str(value))

    walk(data)
    lite: dict[str, Any] = {"lite": ";".join(item for item in fields if item)}
    if keeps:
        lite["keep"] = keeps
    return lite


def lite_transform(data: Any, parts: tuple[str | int, ...] = ()) -> Any:
    if isinstance(data, dict):
        transformed = {}
        for key, value in data.items():
            if key in DROP_KEYS:
                continue
            lite_key = KEY_ALIASES.get(key, key)
            # Body-level trigger keys are intentionally preserved; they are not
            # the same as file-end activation keywords.
            if key in {"trigger", "triggers"}:
                lite_key = key
            transformed[lite_key] = lite_transform(value, (*parts, key))
        return transformed
    if isinstance(data, list):
        if "voice" in {str(part) for part in parts} and all(isinstance(item, str) for item in data):
            kept = data[:1] if len(data) > 1 else data
            return [compact_dialogue_example(item) for item in kept]
        return [lite_transform(value, (*parts, index)) for index, value in enumerate(data)]
    if isinstance(data, str):
        if is_protected(parts, data):
            return data
        text = compact_text(data)
        max_chars = budget_for(parts)
        if max_chars:
            text = sentence_budget(text, max_chars)
        return text
    return data
