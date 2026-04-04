"""tools/ 공유 상수 및 유틸리티."""
from __future__ import annotations

import argparse

ALL_CHARS: list[str] = [
    "SY", "NHR", "JSH", "ERK", "LSH", "HSR", "KHR",
    "JGR", "MIL", "ELA", "MMR", "HSE", "NIA", "RAY", "LPS",
]

ALL_SCENES: list[int] = [
    *range(1, 10),       # 감정 + neutral (9)
    *range(10, 19),      # 일상 (9)
    *range(20, 43),      # NSFW 비삽입 (23)
    *range(50, 68),      # NSFW 삽입 (18)
    *range(70, 79),      # 착의 침실 (9)
    *range(80, 87),      # 착의 화장실 (7)
]  # total: 75

SPECIAL_SCENES: list[int] = [901, 902, 903, 904, 910, 911]

NSFW_SCENES: list[int] = (
    list(range(20, 43)) + list(range(50, 68))
    + list(range(70, 79)) + list(range(80, 87))
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
