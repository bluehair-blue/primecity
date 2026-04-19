"""tools/ 공유 상수 및 유틸리티."""
from __future__ import annotations

import argparse

# ALL_CHARS: 기본 sweep 대상 캐릭터 코드.
# JSH (진시혁) 는 유일한 남성 캐릭이며 NAI 에셋 생성 계획에 포함되지 않으므로
# 이 목록에서 제외함. 필요 시 --chars JSH 로 명시 호출 가능.
ALL_CHARS: list[str] = [
    "SY", "NHR", "ERK", "LSH", "HSR", "KHR",
    "JGR", "MIL", "ELA", "MMR", "HSE", "NIA", "RAY", "LPS",
    "SIA", "NOA", "ERP", "APR",
]

# ALL_SCENES: 모든 일반 씬 번호 (asset_config.json 의 1-98 범위 전체).
# 과거에는 카테고리별 range() 의 union 으로 75개만 정의했으나, asset_config.json
# 이 1-96 전 범위로 확장된 후에도 이 목록이 따라가지 못해 5개 캐릭(SY/NHR/LSH/
# HSR/KHR)이 19, 43-49, 68-69, 79, 87-96 총 21장씩 누락된 채로 생성됨.
# 2026-04-18: 97(smata) · 98(after-handjob) 신규 체위 씬 추가로 1-98 로 확장.
ALL_SCENES: list[int] = list(range(1, 99))  # total: 98

# 카테고리 분류 (참조용 — 코드 흐름에는 사용하지 않음)
SCENE_CATEGORIES: dict[str, range] = {
    "emotion":          range(1, 10),    # 1-9 (감정 + neutral)
    "daily":            range(10, 19),   # 10-18 (일상)
    "extra_buffer_1":   range(19, 20),   # 19 (확장 슬롯)
    "nsfw_noninsert":   range(20, 43),   # 20-42 (비삽입)
    "extra_buffer_2":   range(43, 50),   # 43-49 (확장 슬롯)
    "nsfw_insert":      range(50, 68),   # 50-67 (삽입)
    "extra_buffer_3":   range(68, 70),   # 68-69 (확장 슬롯)
    "clothed_bedroom":  range(70, 79),   # 70-78 (착의 침실)
    "extra_buffer_4":   range(79, 80),   # 79 (확장 슬롯)
    "clothed_toilet":   range(80, 87),   # 80-86 (착의 화장실)
    "extension":        range(87, 97),   # 87-96 (확장 카테고리)
    "nsfw_extra":       range(97, 99),   # 97 smata · 98 after-handjob
}

# SPECIAL_SCENES: 901+ 시리즈. 일반 sweep 에 포함되지 않으며,
# generator 의 --include-special 플래그로 옵트인 시에만 큐에 추가됨.
SPECIAL_SCENES: list[int] = [901, 902, 903, 904, 910, 911]

NSFW_SCENES: list[int] = (
    list(range(20, 43)) + list(range(50, 68))
    + list(range(70, 79)) + list(range(80, 87))
    + [97, 98]  # smata · after-handjob
)


def parse_scene_range(s: str) -> list[int]:
    """Parse '1-8' or '1,2,3' or '1-8,20-42' into sorted unique ints."""
    try:
        nums: list[int] = []
        for part in s.split(","):
            if "-" in part:
                a, b = part.split("-", 1)
                nums.extend(range(int(a), int(b) + 1))
            else:
                nums.append(int(part))
        return sorted(set(nums))
    except ValueError as e:
        raise argparse.ArgumentTypeError(f"Invalid scene range '{s}': {e}") from e
