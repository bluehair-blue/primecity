"""
Extract character/scene prompts from NAIS2 backup + preset JSONs
into a clean asset_config.json for the asset generator.

Usage:
  python extract_config.py
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(BASE_DIR, "docs")
OUT = os.path.join(BASE_DIR, "tools", "asset_config.json")

# ── Character code mapping ──
CODE_MAP = {
    "서윤": ("SY", "clothed"), "서윤 탈의": ("SY", "nude"),
    "나하린": ("NHR", "clothed"), "나하린 탈의": ("NHR", "nude"),
    "진시혁": ("JSH", "clothed"),
    "에리카": ("ERK", "clothed"), "에리카 탈의": ("ERK", "nude"),
    "이서하": ("LSH", "clothed"), "이서하 탈의": ("LSH", "nude"),
    "한소리": ("HSR", "clothed"), "한소리 탈의": ("HSR", "nude"),
    "강하람": ("KHR", "clothed"), "강하람 탈의": ("KHR", "nude"),
    "장그루(평소)": ("JGR", "clothed"), "장그루 탈의": ("JGR", "nude"),
    "밀라": ("MIL", "clothed"), "밀라 탈의": ("MIL", "nude"),
    "미모리": ("MMR", "clothed"), "미모리 탈의": ("MMR", "nude"),
    "엘라": ("ELA", "clothed"), "엘라 탈의": ("ELA", "nude"),
    "하시은": ("HSE", "clothed"), "하시은 탈의": ("HSE", "nude"),
    "니아": ("NIA", "clothed"), "니아 탈의": ("NIA", "nude"),
    "레이": ("RAY", "clothed"), "레이 탈의": ("RAY", "nude"),
    "한파란/라피스": ("LPS", "clothed"), "한파란/라피스 탈의": ("LPS", "nude"),
}

# ── Scene number → prompt variant (clothed or nude) ──
SCENE_VARIANT = {}
for n in [1,2,3,4,5,6,7,8,9]:          SCENE_VARIANT[n] = "clothed"   # 감정
for n in range(10, 18):                  SCENE_VARIANT[n] = "clothed"   # 일상 (대부분 착의)
SCENE_VARIANT[18] = "nude"                                              # pregnant
for n in range(20, 43):                  SCENE_VARIANT[n] = "nude"      # NSFW 비삽입
for n in range(50, 68):                  SCENE_VARIANT[n] = "nude"      # NSFW 삽입
for n in range(70, 79):                  SCENE_VARIANT[n] = "clothed"   # 착의 침실
for n in range(80, 87):                  SCENE_VARIANT[n] = "clothed"   # 착의 화장실

# ── Scene number → name mapping ──
SCENE_NAMES = {
    1: "angry", 2: "contempt", 3: "happy", 4: "sad", 5: "shy",
    6: "smirk", 7: "surprised", 8: "troubled", 9: "neutral",
    10: "normal-chat", 11: "undressing-seduction", 12: "drinking",
    13: "dining-chat", 14: "cafe-chat", 15: "cinema-chat",
    16: "christmas-date", 17: "wedding", 18: "pregnant",
    20: "cunnilingus", 21: "kiss", 22: "nude-kiss", 23: "breast-grope",
    24: "breast-sucking", 25: "fingering", 26: "fingering-climax",
    27: "ass-spanking", 28: "ass-grabbing", 29: "paizuri", 30: "paizuri-cum",
    31: "fellatio-pov", 32: "fellatio-climax-pov", 33: "fellatio-3rd",
    34: "fellatio-climax-3rd", 35: "deepthroat", 36: "deepthroat-climax",
    37: "handjob", 38: "handjob-cum", 39: "rimjob", 40: "rimjob-cum",
    41: "footjob", 42: "footjob-cum",
    50: "nude-conversation", 51: "missionary-sex", 52: "missionary-climax",
    53: "doggystyle-sex", 54: "doggystyle-climax", 55: "cowgirl-sex",
    56: "cowgirl-climax", 57: "spooning-sex", 58: "spooning-climax",
    59: "full-nelson", 60: "full-nelson-climax", 61: "anal-sex",
    62: "anal-sex-cum", 63: "after-sex", 64: "facial-cum",
    65: "pregnant-sex", 66: "pregnant-sex-cum", 67: "pregnant-after-sex",
    70: "clothed-missionary-bedroom", 71: "clothed-missionary-climax-bedroom",
    72: "clothed-fullnelson-bedroom", 73: "clothed-fullnelson-climax-bedroom",
    74: "clothed-cowgirl", 75: "clothed-cowgirl-climax",
    76: "clothed-fellatio-bedroom", 77: "clothed-fellatio-climax-bedroom",
    78: "clothed-after-bedroom",
    80: "clothed-doggystyle-toilet", 81: "clothed-doggystyle-climax-toilet",
    82: "clothed-fullnelson-toilet", 83: "clothed-fullnelson-climax-toilet",
    84: "clothed-fellatio-toilet", 85: "clothed-fellatio-climax-toilet",
    86: "clothed-after-toilet",
}


def extract_characters(backup):
    chars = backup["nais2-character-prompts"]["state"]["characters"]
    result = {}
    for c in chars:
        name = c.get("name", "")
        if name in CODE_MAP:
            code, variant = CODE_MAP[name]
            if code not in result:
                clean_name = name.replace(" 탈의", "").replace("(평소)", "")
                result[code] = {"name": clean_name, "clothed": "", "nude": ""}
            result[code][variant] = c.get("prompt", "")
    return result


def extract_scenes(docs_dir):
    preset_files = [
        os.path.join(docs_dir, "NAIS_Preset_감정2_generated.json"),
        os.path.join(docs_dir, "NAIS_Preset_일상_generated.json"),
        os.path.join(docs_dir, "NAIS_Preset_상황_generated.json"),
        os.path.join(docs_dir, "NAIS_Preset_착의_generated.json"),
    ]

    # Build exact name→number map (case-insensitive, hyphen-normalized)
    def norm(s):
        return s.lower().replace("_", "-").strip()

    name_to_num = {}
    for num, name in SCENE_NAMES.items():
        name_to_num[norm(name)] = num
    # Additional aliases for matching preset names
    name_to_num["fellatio-pov"] = 31
    name_to_num["fellatio-climax-pov"] = 32
    name_to_num["fellatio-3rd-person"] = 33
    name_to_num["fellatio-climax-3rd-person"] = 34
    name_to_num["clothed-missionary-sex-bedroom"] = 70
    name_to_num["clothed-missionary-climax-bedroom"] = 71
    name_to_num["clothed-full-nelson-bedroom"] = 72
    name_to_num["clothed-full-nelson-climax-bedroom"] = 73
    name_to_num["clothed-cowgirl-sex"] = 74
    name_to_num["clothed-cowgirl-climax"] = 75
    name_to_num["clothed-fellatio-bedroom"] = 76
    name_to_num["clothed-fellatio-climax-bedroom"] = 77
    name_to_num["clothed-after-sex-bedroom"] = 78
    name_to_num["clothed-doggystyle-sex-toilet"] = 80
    name_to_num["clothed-doggystyle-climax-toilet"] = 81
    name_to_num["clothed-full-nelson-toilet"] = 82
    name_to_num["clothed-full-nelson-climax-toilet"] = 83
    name_to_num["clothed-fellatio-toilet"] = 84
    name_to_num["clothed-fellatio-climax-toilet"] = 85
    name_to_num["clothed-after-sex-toilet"] = 86

    scenes = {}
    for path in preset_files:
        if not os.path.exists(path):
            print(f"  WARNING: {path} not found, skipping")
            continue
        with open(path, "r", encoding="utf-8") as f:
            preset = json.load(f)
        for scene in preset.get("scenes", []):
            sname = norm(scene["name"])
            prompt = scene["scenePrompt"]
            w = scene.get("width", 1216)
            h = scene.get("height", 832)

            matched_num = name_to_num.get(sname)
            if matched_num:
                scenes[matched_num] = {
                    "name": SCENE_NAMES[matched_num],
                    "prompt": prompt,
                    "width": w,
                    "height": h,
                }

    return scenes


def extract_base(backup):
    state = backup["nais2-generation"]["state"]
    return {
        "base_prompt": state.get("basePrompt", ""),
        "negative_prompt": state.get("negativePrompt", ""),
        "model": state.get("model", "nai-diffusion-4-5-full"),
        "steps": state.get("steps", 28),
        "cfg_scale": state.get("cfgScale", 7.2),
        "cfg_rescale": state.get("cfgRescale", 0.1),
        "sampler": state.get("sampler", "k_euler"),
        "scheduler": state.get("scheduler", "karras"),
        "smea": state.get("smea", False),
        "variety": state.get("variety", True),
    }


def main():
    backup_path = os.path.join(DOCS, "nais2-backup-2026-03-22.json")
    if not os.path.exists(backup_path):
        print(f"ERROR: {backup_path} not found")
        return

    print("Loading NAIS2 backup...")
    with open(backup_path, "r", encoding="utf-8") as f:
        backup = json.load(f)

    print("Extracting base generation settings...")
    base = extract_base(backup)

    print("Extracting character prompts...")
    characters = extract_characters(backup)
    print(f"  {len(characters)} characters extracted")

    print("Extracting scene prompts...")
    scenes = extract_scenes(DOCS)
    print(f"  {len(scenes)} scenes extracted")

    # Check missing scenes
    all_nums = sorted(SCENE_VARIANT.keys())
    missing = [n for n in all_nums if n not in scenes]
    if missing:
        print(f"  WARNING: {len(missing)} scenes not matched from presets: {missing}")
        print("  These will need manual prompt entry in asset_config.json")
        for n in missing:
            scenes[n] = {
                "name": SCENE_NAMES.get(n, f"scene-{n}"),
                "prompt": "TODO",
                "width": 1216,
                "height": 832,
            }

    config = {
        "_comment": "Auto-extracted from NAIS2 backup. Edit as needed.",
        "base": base,
        "scene_variant_map": {str(k): v for k, v in SCENE_VARIANT.items()},
        "characters": characters,
        "scenes": {str(k): v for k, v in sorted(scenes.items())},
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to {OUT}")
    print(f"Characters: {len(characters)}, Scenes: {len(scenes)}")
    print("Review the file and fill in any TODO prompts before running the generator.")


if __name__ == "__main__":
    main()
