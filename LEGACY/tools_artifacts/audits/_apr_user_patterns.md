# APR User Manual Prompt Pattern Analysis

- 분석 소스: `nais2-backup-2026-04-19.json`
- APR 관련 character 엔트리: **18개**
- 공통 캐릭터 토큰: **1개**

## 🎨 NAI UI 글로벌 설정 (사용자 수동)

### basePrompt (첫 300자)

```text
0.6::artist:ebifurya::, 0.4::artist:ixy::, artist:dsmile, artist:fuzichoco, 0.8::artist:pako (pakosun) ::, 2::artist:kurono mitsuki::, artist:wanke, 1.2::airtst:chigusa minori::, 0.8::artist:freng::, 0.8::artist:pro-p::, 0.6::artist:ratatatat74, artist:yutokamizu, artist:mx2j, artist:doremi (doremi4...
```

### detailPrompt (⭐️ 핵심 — 사용자 추가 detail 영역)

```text
rating:explicit, very aesthetic, anime style, no text, 3::year 2024 ::, 3::year 2025 ::, -6::artist collaboration ::, -2::multiple views ::, masterpiece, best quality, best illustration, ultra-detailed, official art, soft colors, 1.8::soft shadows ::, -2::high saturation ::, -3::production art ::, -3::reference sheet ::, -1::halo (blue archive) ::, 
```

### negativePrompt (첫 400자)

```text
yellow light, purple, green, cyan, cat ears, animal ears, no nipples, pubic hair, mosaic censoring, bar censor, artistic error, jpeg artifacts, logo, text, watermark, too many watermarks, blank page, reference, username, signature, artist:xinzoruo, artist:milkpanda, artist collaboration, variant set, large variant set, 4koma, 2koma, toon (style), oekaki, chibi, turnaround, film grain, monochrome, ...
```


## 👗 APR 공통 캐릭터 토큰 (모든 엔트리 교집합)

- `high chroma blue hair`

## 🖼️ APR 씬부 토큰 빈도 (TOP 40 — 사용자가 각 씬에 넣은 패턴)

| 태그 | 등장 수 |
| --- | ---: |
| `royal blue hair` | 17 |
| `mature female` | 14 |
| `seductive smile` | 14 |
| `huge breasts` | 14 |
| `thick thighs` | 14 |
| `wide hips` | 14 |
| `lapis lazuli colored hair` | 14 |
| `navy hair` | 14 |
| `indigo hair` | 14 |
| `colored inner hair` | 14 |
| `two-tone hair` | 14 |
| `very long hair` | 14 |
| `long sidelocks` | 14 |
| `curtained bangs` | 14 |
| `hair over one eye` | 14 |
| `messy hair` | 14 |
| `white eyes` | 14 |
| `half-closed eyes` | 14 |
| `silver choker` | 14 |
| `girl` | 13 |
| `oversized clothing` | 10 |
| `loose clothes` | 10 |
| `white shirt` | 10 |
| `shirt tucked in` | 10 |
| `white long blazer` | 10 |
| `long white tie` | 10 |
| `sleeves past fingers` | 10 |
| `white short shorts` | 10 |
| `cleavage` | 10 |
| `unbuttoned shirt` | 10 |
| `white censored pussy` | 9 |
| `on bed` | 6 |
| `long hair` | 5 |
| `cum in pussy` | 5 |
| `light blue hair` | 5 |
| `lapis lazuli color hair` | 4 |
| `low ponytail` | 4 |
| `1girl` | 4 |
| `naked` | 4 |
| `pussy juice` | 4 |

## 🚫 APR 캐릭터 네거티브 빈도

| 태그 | 등장 수 |
| --- | ---: |
| `cyan hair` | 11 |
| `purple hair` | 11 |
| `hair intakes` | 11 |
| `hair flaps` | 11 |
| `two-tone hair` | 9 |
| `colored inner hair` | 7 |
| `light blue hair` | 7 |
| `navy hair` | 2 |
| `indigo hair` | 2 |

## 🔎 asset_config 대비 delta (핵심)

- 사용자는 있는데 asset_config에 없음: **0개**
- asset_config에는 있는데 사용자가 뺀 것: **31개**
  - `cleavage`
  - `colored inner hair`
  - `curtained bangs`
  - `girl`
  - `hair over one eye`
  - `half-closed eyes`
  - `huge breasts`
  - `indigo hair`
  - `lapis lazuli colored hair`
  - `light blue hair`
  - `long sidelocks`
  - `long white tie`
  - `loose clothes`
  - `mature female`
  - `messy hair`
  - `navy hair`
  - `oversized clothing`
  - `royal blue hair`
  - `seductive smile`
  - `shirt tucked in`
  - `silver choker`
  - `sleeves past fingers`
  - `thick thighs`
  - `two-tone hair`
  - `unbuttoned shirt`
  - `very long hair`
  - `white eyes`
  - `white long blazer`
  - `white shirt`
  - `white short shorts`
  - `wide hips`

### negative delta
- 사용자에만: **2개**
  - `indigo hair` (2건)
  - `navy hair` (2건)
- asset_config에만: **0개**

## 📋 엔트리별 씬부 샘플 (최대 20건)


### #1 id=1771737095578b9sfh12qg enabled=False
- scene tokens (41): `#인물/외형
1boy, solo, bishounen, trap, royal blue hair, lapis lazuli color hair, long hair, low ponytail, #복장/스타일 (무협풍 강조)
wuxia, hanfu, monochrome outfit, layered clothes, black outer robe, white inner robe, wide sleeves, long sleeves, sash, ornate silver details, metal trim, black pants, #액션/포즈 (창을 휘두르는 역동적인 모습)
dynamic pose, fighting stance, martial arts, swinging polearm, thrusting spear, clothes flowing, flowing sleeves, hair floating, motion blur, wind, #무기 (화려한 창)
weapon, spear, polearm, ornate spear, silver spear, dragon design on spear, #분위기/배경 (예시)
intense, battle, bamboo forest, swirling leaves, dust`

### #2 id=17729461730416danjwabj enabled=False
- scene tokens (12): `1girl, solo, small breasts, royal blue hair, lapis lazuli color hair, long hair, low ponytail, blue eyes, oversized clothes, coat, inner knit sweater, V`

### #3 id=1774200402000b2h595hsy9 enabled=False
- scene tokens (9): `1girl, nude, small breasts, navy, royal blue hair, lapis lazuli color hair, long hair, low ponytail, blue eyes`

### #4 id=1775786529178mw0gmpb49 enabled=False
- scene tokens (44): `girl, solo, key visual, royal blue hair, lapis lazuli color hair, long hair, low ponytail, blue eyes, long hair, cobalt blue eyes, expressionless, asymmetrical clothing, jacket, one shoulder exposed, layered waist belts, one hand v sign near face, other hand in pocket, head tilted, blank stare at viewer, jacket half falling off shoulder, overlapping silhouettes of herself, multiple outlines, singer silhouette, dancer silhouette, model silhouette, each silhouette different pose, different outfit, fading silhouettes, transparent layers, scattered costume pieces on ground, rock guitar, ballet shoes, microphone, spray can, all discarded, all abandoned, single fallen v-sign shaped object, broken v-sign, cracked hand mirror, empty reflection, slot machine reels, spinning dice mid-air, shuffling cards, joker card face-up`

### #5 id=17765071047379tghpe9t4 enabled=False
- scene tokens (32): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, cum in sleeves, shushing`

### #6 id=1776507446367kvw86s9ba enabled=False
- scene tokens (37): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, on bed, smata, thigh sex, cum on thighs, from below, dynamic angle, covering mouth`

### #7 id=177655877056919sx84ri4 enabled=False
- scene tokens (35): `girl, naked, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, cyan hair, purple hair, hair intakes, hair flaps, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, pussy, white censored pussy, pussy juice, target# fingering, breath, blush, tears, covering own mouth, from below, muted color`

### #8 id=1776558804219ory468ood enabled=False
- scene tokens (30): `girl, naked, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, pussy, white censored pussy, pussy juice, target# fingering, breath, blush, tears, covering own mouth, from below`

### #9 id=1776559486955t7pl6ugia enabled=False
- scene tokens (43): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, cyan hair, purple hair, hair intakes, hair flaps, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, bathroom, toilet, kneeling, close-up, source# fellatio, clothed sex, saliva trail, muted color, eye contact`

### #10 id=1776559523574dj9ywakds enabled=False
- scene tokens (36): `girl, naked, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, on bed, lying, on back, on pillow, missionary, legs apart, spread legs, thighs, nipples, parted lips, pussy juice, white censored pussy, pussy juice trail, imminent penetration, target# penis on stomach`

### #11 id=17765596107174yuc49na8 enabled=False
- scene tokens (35): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, backstage, mirror, vanity, nervous, dressing room`

### #12 id=17765596628519vtd51tmc enabled=False
- scene tokens (38): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, stage, performance, concert, spotlight, crowd silhouette, full body, bokeh, muted color`

### #13 id=1776559848343ap4j5q7pc enabled=False
- scene tokens (39): `girl, naked, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, on bed, from above, lying, on back, after sex, spreading own pussy, cum in pussy, pussy juice, white censored pussy, pussy juice trail, cum overflow, very sweaty, wet hair, heart, embarrassed, nipples, parted lips, open mouth`

### #14 id=1776560151141b220t81sg enabled=False
- scene tokens (49): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, light blue hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, bathroom, toilet, standing, spread legs, full nelson, target# leg grab, mutual# clothed sex, sex, white censored pussy, cum in pussy, cum overflow, female ejaculation, ahegao, fucked silly, torogao, heart-shaped pupils, tongue out, open mouth`

### #15 id=1776560653616uqa8q1ogx enabled=False
- scene tokens (43): `1girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, light blue hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, toilet, doggystyle, ass focus, back, anus, white censored pussy, cum in pussy, clothed sex, female ejaculation, fucked silly, torogao, heart-shaped pupils`

### #16 id=1776561590451uecey1hi6 enabled=False
- scene tokens (38): `1girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, light blue hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, on bed, spread legs, after sex, cum in pussy, cum on body, cum overflow, white censored pussy`

### #17 id=1776570461149ln92poy09 enabled=False
- scene tokens (40): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, light blue hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, on bed, lying, spread legs, after sex, facial, cum in pussy, cum on body, cum overflow, white censored pussy`

### #18 id=1776570664091n93nj6nzy enabled=False
- scene tokens (38): `girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, royal blue hair, lapis lazuli colored hair, navy hair, indigo hair, light blue hair, colored inner hair, two-tone hair, very long hair, long sidelocks, curtained bangs, hair over one eye, messy hair, white eyes, half-closed eyes, silver choker, oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts, cleavage, unbuttoned shirt, on bed, girl on top, cowgirl position, straddling, mutual# clothed sex, white censored pussy, heart-shaped pupils`