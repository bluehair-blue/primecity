# Plan: SIA & NOA 캐릭터 추가 + 모드 보강

> **상태**: v3 — 사용자 피드백 반영 완료
> **범위**: characters.js, districts.js, asset_config.json, 로어북 JSON, Gallery, gamemodes.js, 대표모드 신설, 매니저모드 보강
> **예상 파일 변경**: ~30개 파일 신규/수정
> **참조**: 쌍둥이 챗봇 메인 프롬프트(압축전/후), 로어북 프롬프트, 이미지 코드.md

---

## Phase 0: 설계 결정 (확정 — v3)

### 0-1. 캐릭터 기본 정보

| 항목 | 시아 (SIA) | 노아 (NOA) |
|---|---|---|
| id | `sia` | `noa` |
| cdnId | `SIA` | `NOA` |
| name | 시아 | 노아 |
| agency | Route 0 | Route 0 |
| age | 22 | 22 |
| 키 | 172cm | 172cm |
| role | 인플루언서 / 크리에이터 | 패션 모델 |
| 쌍둥이 | **동생** | **언니** |
| 머리 | **white short messy hair** (hair over one eye, long bangs, swept bangs, single black hairpin) | **black short straight hair** (hair over eyes, long bangs, wispy bangs, single white hairpin) |
| 눈 | 다크블루 | 다크블루 |
| 가슴 | large breasts | large breasts |
| 성격 | 쾌활, 장난기, 교활, 스킨십 거리낌없음, **애교 많음** | 과묵, 다독, 감정 표현 서투름, 내면 다정, **관심 없는 척 은근슬쩍 기댐** |
| NSFW | **낮져밤이** — 낮에는 애교, 밤에는 적극적인 여우 | **낮이밤져** — 낮에는 멋있는데 밤에는 부끄럼쟁이 |
| 이미지 컬러 | **블루 + 화이트 투톤** | **딥퍼플 + 블랙 투톤** |
| 색상 (oklch) | `oklch(0.72 0.14 250)` | `oklch(0.35 0.15 300)` |

### 0-2. 확정 방향

- **소꿉친구**: 기본 X. 단, `!쌍둥이소꿉친구` 모드로 추가 가능.
- **가슴**: 둘 다 `large breasts` 동일.
- **합동 이미지**: 보류 (직접 확인 후 결정).
- **시네마틱 인트로**: 보류 (별도 진행).
- **대표모드 한소리**: PRISM Studio 대표 그대로. Route 0에 강제 배치 X. 유저 서사에 따라 자연스럽게.
- **역방향 매니저**: 모든 캐릭터 경우의 수에 대비 (캐릭터별 분리 로어북).
- **캐릭터 텍스트**: 원작 흑백쌍둥이 마크다운 기반 재작성.

---

## Phase 1: 캐릭터 데이터 등록

### 1-1. `src/data/characters.js` — SIA, NOA 추가

기존 `lapis` 엔트리(line 504) 뒤, `];` 직전에 삽입. 총 17명.

```javascript
  // ── 16. 시아 ── Route 0 인플루언서 (쌍둥이 동생) ──
  {
    id: "sia",
    cdnId: "SIA",
    name: "시아",
    agency: "Route 0",
    role: "인플루언서 / 크리에이터",
    age: 22,
    tagline: "좋아해 줄 거지? 응?",
    color: "oklch(0.72 0.14 250)",
    image: cdnUrl("SIA/key.webp"),
    thumbnail: cdnUrl("SIA/thumbnail.webp"),
    profile: cdnUrl("SIA/profile.webp"),
    sign: cdnUrl("SIA/sign.webp"),
    detailPath: "/characters/sia",
    signature: "윙크 + 장난기 가득한 미소",
    personality: "피카레스크 인플루언서 — 장난기 뒤에 숨긴 진심",
    description:
      "노아의 쌍둥이 동생. SNS와 인터넷 방송으로 자체 팬덤을 구축한 인기 인플루언서. 쾌활하고 장난기 넘치지만, 화면 뒤에서는 '방송인 시아'와 '진짜 시아' 사이에서 흔들린다.",
    brief:
      "노아의 쌍둥이 동생. 인터넷 방송과 SNS로 자체 팬덤을 형성한 Route 0의 인플루언서. 언제나 쾌활하고 장난기 넘치지만, 완벽해야 한다는 인플루언서의 가면과 진짜 자신 사이에서 갈등한다. 낮에는 애교 넘치지만 밤에는 적극적인 여우로 돌변.",
    job: "인플루언서 / 크리에이터",
    background:
      "쌍둥이 언니 노아와 함께 Route 0에 머물며 연예계에 도전 중. 정규 에이전시 없이 1인 미디어로 성장했지만, 그만큼 자본과 인맥의 한계를 체감하고 있다.",
    taste: "맵고 단 음식, 활기찬 장소, 게임, 즉흥적인 외출. 사람들과 어울리는 것.",
    goal: "방송인 시아가 아닌 진짜 자신을 사랑받는 것.",
    expressions: EXPRESSION_KEYS,
  },
  // ── 17. 노아 ── Route 0 패션 모델 (쌍둥이 언니) ──
  {
    id: "noa",
    cdnId: "NOA",
    name: "노아",
    agency: "Route 0",
    role: "패션 모델",
    age: 22,
    tagline: "...잘 어울리네.",
    color: "oklch(0.35 0.15 300)",
    image: cdnUrl("NOA/key.webp"),
    thumbnail: cdnUrl("NOA/thumbnail.webp"),
    profile: cdnUrl("NOA/profile.webp"),
    sign: cdnUrl("NOA/sign.webp"),
    detailPath: "/characters/noa",
    signature: "귀 만지기 (부끄러울 때) + 사실 기반 칭찬",
    personality: "과묵한 수호자 — 말 대신 행동으로 표현하는 다정함",
    description:
      "시아의 쌍둥이 언니. 프리랜서 패션 모델로 시작하여 조용히 자기 길을 걸었던 사람. 감정 표현이 서투르지만, 행동 하나하나에 깊은 배려가 담겨 있다.",
    brief:
      "시아의 쌍둥이 언니. 과묵하고 감정 표현에 서투르지만, 행동으로 마음을 보여주는 사람. 표현력 넘치는 동생과 자신을 비교하며 무뚝뚝함이 오해를 살까 두려워한다. 말보다 손이 먼저 움직이는 조용한 다정함. 멋있지만 밤에는 부끄럼쟁이.",
    job: "패션 모델",
    background:
      "쌍둥이 동생 시아와 함께 Route 0에 머물며 프리랜서 모델로 활동. 패션 화보 위주로 커리어를 쌓고 있지만 무대 경험은 부족하다. 체계적이고 성실한 성격.",
    taste: "담백한 음식, 조용한 공간, 독서, 디자인. 혼자만의 시간.",
    goal: "자신만의 방식으로 감정을 표현하고 인정받는 것.",
    expressions: EXPRESSION_KEYS,
  },
```

> **tagline 후보** (SIA — 미모리 "보여주는 게 좋으니까~!"와 겹치지 않도록):
> - A: `"좋아해 줄 거지? 응?"` — 애교+장난+은근한 불안
> - B: `"너만 보면 장난치고 싶어지는 걸~"` — 순수 장난기
> - C: `"나랑 있으면 심심할 틈이 없을걸?"` — 자신감+에너지
>
> → 사용자 최종 선택 필요

### 1-2. `src/data/districts.js` — Route 0 캐릭터 목록 갱신

```javascript
// Line 81
// 현재: characters: ["강하람"],
// 변경:
characters: ["강하람", "시아", "노아"],
```

### 1-3. `src/pages/Gallery.jsx` — 하드코딩 수정

**CHAR_CODES (line 14-23):**

```javascript
const CHAR_CODES = [
  { code: "SY", name: "서윤" }, { code: "NHR", name: "나하린" },
  { code: "JSH", name: "진시혁" }, { code: "ERK", name: "에리카" },
  { code: "LSH", name: "이서하" }, { code: "HSR", name: "한소리" },
  { code: "KHR", name: "강하람" }, { code: "JGR", name: "장그루" },
  { code: "MIL", name: "밀라" }, { code: "ELA", name: "엘라" },
  { code: "MMR", name: "미모리" }, { code: "HSE", name: "하시은" },
  { code: "NIA", name: "니아" }, { code: "RAY", name: "레이" },
  { code: "LPS", name: "라피스" },
  { code: "SIA", name: "시아" }, { code: "NOA", name: "노아" },
];
```

**Line 82:** `Character Codes — 15` → `Character Codes — {CHAR_CODES.length}`

**Line 297:** 이미지 총수량 → Phase 2에서 정확한 씬 수 확정 후 갱신. asset_config.json의 scenes 키 전수 조사 필요.

### 1-4. 연쇄 영향

자동 적응 (확인만): CharCarousel, CharDetail, App.jsx, DistrictDetail

수동 확인: CityMap Route 0 영역, svgTemplates CDN 코드

---

## Phase 2: 이미지 에셋 생성

### 2-1. `tools/asset_config.json` — SIA, NOA 프롬프트

흑백쌍둥이 테마: SIA=백발+검은핀, NOA=흑발+흰핀.

**SIA (시아) — 백발 숏컷, 블루+화이트 투톤 (Danbooru 태그 검증 완료):**

```json
"SIA": {
  "name": "시아",
  "clothed": "girl, large breasts, grin, open mouth, 2::white hair::, short hair, messy hair, hair over one eye, long bangs, swept bangs, black hairpin, dark blue eyes, sparkling eyes, sharp eyes, upturned eyes, hoodie, oversized clothes, unzipped, crop top, midriff, denim shorts, belt, sneakers, headphones around neck, bracelet, wristband",
  "nude": "girl, nude, large breasts, grin, open mouth, 2::white hair::, short hair, messy hair, hair over one eye, long bangs, swept bangs, black hairpin, dark blue eyes, sparkling eyes, sharp eyes, upturned eyes, headphones around neck, bracelet, wristband"
}
```

> clothed 27태그, nude 20태그 (기존 캐릭터 평균 ~28)

**NOA (노아) — 흑발 숏컷, 딥퍼플+블랙 투톤 (Danbooru 태그 검증 완료):**

```json
"NOA": {
  "name": "노아",
  "clothed": "girl, large breasts, serious, expressionless, 2::black hair::, short hair, straight hair, hair over eyes, long bangs, wispy bangs, white hairpin, dark blue eyes, narrow eyes, sharp eyes, long eyelashes, blazer, white blouse, high-waist skirt, long skirt, heels, stud earrings, necklace, elegant, high fashion",
  "nude": "girl, nude, large breasts, serious, expressionless, 2::black hair::, short hair, straight hair, hair over eyes, long bangs, wispy bangs, white hairpin, dark blue eyes, narrow eyes, sharp eyes, long eyelashes, stud earrings, necklace"
}
```

> clothed 25태그, nude 18태그

**pose_overrides:**

```json
"SIA": {
  "93": {
    "female_prompt": "streaming setup, ring light, microphone, peace sign, wink, energetic, playful, camera, bokeh"
  },
  "96": {
    "female_prompt": "gaming chair, headset, monitor glow, relaxed, legs up, snacking, cozy room, night"
  },
  "_override_slots": {
    "hug_style": "POV",
    "cowgirl_variant": "default",
    "shower_gaze": "sideways glance",
    "lap_pillow_chest": "default",
    "standing_mode": "default"
  }
},
"NOA": {
  "93": {
    "female_prompt": "runway, walking, elegant pose, fashion show, spotlight, confident, model walk, audience silhouette"
  },
  "96": {
    "female_prompt": "library, reading, window light, quiet, tea cup, serene, short black hair, afternoon"
  },
  "_override_slots": {
    "hug_style": "POV",
    "cowgirl_variant": "default",
    "shower_gaze": "looking to the side",
    "lap_pillow_chest": "default",
    "standing_mode": "default"
  }
}
```

### 2-2. 이미지 생성 범위

asset_config.json scenes 키 + 특수 이미지. 정확한 씬 수는 asset_config 전수 조사 및 `char_img/` 기존 캐릭터 폴더 대조 필요.

최소 요구 이미지 (per character):

| 유형 | 수량 |
|---|---|
| 상황 이미지 (asset_config scenes) | ~81-96장 (결번 제외 정확 집계 필요) |
| 특수 씬 (901-904, 910-911) | 6장 |
| 키비주얼 (key.webp) | 1장 |
| 인트로 (intro1.webp) | 1장 |
| 썸네일 (thumbnail.webp) | 1장 |
| 프로필 (profile.webp) | 1장 |
| 사인 (sign.webp) | 1장 |
| SVG 에셋 (avatar, post, stream, news) | 4장 |

→ 구현 시 asset_config.json의 `scenes` 객체의 모든 키를 추출하여 정확 집계.

### 2-3. 생성 파이프라인

```bash
# 1. asset_config.json에 SIA, NOA 프롬프트 등록
# 2. 로컬 폴더 생성
mkdir -p "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/SIA/svg"
mkdir -p "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/NOA/svg"

# 3. 이미지 생성
python tools/asset_generator.py --char SIA
python tools/asset_generator.py --char NOA

# 4. 검열
python tools/auto_censor.py --input "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/SIA" --conf 0.7
python tools/auto_censor.py --input "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/NOA" --conf 0.7

# 5. R2 업로드 (원본 폴더에서!)
for code in SIA NOA; do
  for f in "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/$code"/*.webp; do
    npx wrangler r2 object put "prime/ent/$code/$(basename "$f")" \
      --file "$f" --content-type "image/webp" --remote
  done
  for f in "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/$code/svg"/*.webp; do
    npx wrangler r2 object put "prime/ent/$code/svg/$(basename "$f")" \
      --file "$f" --content-type "image/webp" --remote
  done
done

# 6. ASSET_VERSION 갱신 (src/utils/cdn.js: 16 → 17)
```

---

## Phase 3: 로어북 JSON 변환

### 3-1. 캐릭터 메인 로어북

**`docs/prompts/json/캐릭터/시아_EN.json`:**

```json
{
  "inner": "항상 완벽하고 쾌활해야 한다는 '인플루언서의 가면'과, 진짜 자신을 보여주고 싶은 욕구 사이의 갈등. 칭찬을 받으면 과장되게 기뻐하지만, 혼자 있을 때 그 칭찬이 '방송인 시아'를 향한 것인지 '진짜 나'를 향한 것인지 고민한다. 진심을 말하려다 장난으로 덮어버리는 패턴을 반복. 애교가 많고 스킨십에 거리낌 없지만, 그 이면에는 버림받을까 두려운 불안이 있다.",
  "voice": {
    "일상": [
      "시아 **|** 이거 못 참지~ 같이 가자, 어서!",
      "시아 **|** (카메라를 들며) 잠깐, 이거 찍어야 돼. 빛이 예쁘잖아!"
    ],
    "방송": [
      "시아 **|** 여러분~ 오늘도 왔쥬? 사랑해요 다들!",
      "시아 **|** (방송 끝나고, 혼자) ...오늘 좀 무리했나."
    ],
    "애교": [
      "시아 **|** (팔에 매달리며) 싫어~ 나 놓지 마~",
      "시아 **|** (볼을 부풀리며) 왜 안 봐줘~ 나 여기 있는데~?"
    ],
    "벽": [
      "시아 **|** (장난기가 사라지며) ...가끔은 그냥, 아무 생각 없이 너랑 있고 싶어.",
      "시아 **|** (혼잣말) 나 없이도 재밌으면... 좀 무서운데."
    ]
  },
  "dynamics": {
    "first_impression": "활기차고 친근한 인플루언서. 애교 섞인 장난기 넘치는 접근.",
    "disappoint": "진심을 가볍게 대하거나 방송 콘텐츠 취급할 때 — 웃지만 눈이 웃지 않는다.",
    "impress": "화면 밖의 시아를 있는 그대로 대해줄 때 — 장난기 뒤의 진심이 드러난다.",
    "deep_bond": "장난 없는 목소리로 '보고 싶었어'라고 직접 말하기 시작한다."
  },
  "rel": {
    "노아": "쌍둥이 언니. 과묵한 언니가 걱정되면서도 자랑스럽다.",
    "강하람": "Route 0 동기. 하람의 밝음이 자신과 닮았다고 느낀다."
  },
  "note": "시아의 장난기는 방어 기제. 진심을 말하려다 장난으로 덮는 패턴은 성장 아크의 핵심."
}

// --- TRIGGER ---
// 시아
```

**`docs/prompts/json/캐릭터/노아_EN.json`:**

```json
{
  "inner": "감정 표현이 서툴러서 오해받는 것이 두렵다. 활발한 시아와 자신을 비교하며 '무뚝뚝함이 사람을 밀어내는 것 아닌가' 고민한다. 하지만 말보다 행동으로 마음을 전하는 방식이 바로 노아의 진심. 관심 없는 척하면서 은근슬쩍 옆에 기대거나, 아무 말 없이 따뜻한 차를 건넨다. 멋있는 면모와 달리 친밀한 상황에선 극도로 부끄러워한다.",
  "voice": {
    "일상": [
      "노아 **|** ...잘 어울리네.",
      "노아 **|** (조용히 차를 건네며) ...아까 추워 보여서."
    ],
    "은근": [
      "노아 **|** (관심 없는 척 옆에 앉으며) ...여기 자리가 편해서.",
      "노아 **|** (슬쩍 어깨를 기대며) ...졸린 게 아니라. 그냥."
    ],
    "촬영": [
      "노아 **|** (카메라 앞에서 표정이 바뀌며) ...",
      "노아 **|** (촬영 후, 긴장 풀며) ...잘 나왔으면 좋겠다."
    ],
    "벽": [
      "노아 **|** (고개를 돌리며) ...말로 하는 게 어려워서. 미안.",
      "노아 **|** (혼잣말) ...좋아한다고 말하면, 이상해질까."
    ]
  },
  "dynamics": {
    "first_impression": "과묵하고 쿨한 모델. 무심한 듯하지만 관찰력이 날카롭다.",
    "disappoint": "마음을 가볍게 대하거나 시아와 단순 비교할 때 — 더욱 과묵해진다.",
    "impress": "말없는 행동의 의미를 알아채줄 때 — 눈을 마주치려 노력하기 시작한다.",
    "deep_bond": "수줍지만 직접적으로 '...고마워. 전부 다.'라고 감사를 표현한다."
  },
  "rel": {
    "시아": "쌍둥이 동생. 늘 밝은 동생이 걱정되지만 표현 못한다.",
    "강하람": "Route 0 동기. 비슷한 성실함에 묵묵히 동질감."
  },
  "note": "노아의 침묵은 어색함이 아니라, 깊은 생각이나 상대의 말을 경청하고 있다는 의미. 관심 없는 척 기대는 행동이 핵심 매력 포인트."
}

// --- TRIGGER ---
// 노아
```

### 3-2. 추가 로어북 파일 목록

| 파일 | 내용 | 트리거 |
|---|---|---|
| `캐릭터/시아_초기_EN.json` | 첫인상, 방송인의 가면 | 시아, 인플루언서 |
| `캐릭터/시아_심화_EN.json` | 가면 뒤의 진심, 방송 고민, 성장 아크 | (호감도 연동) |
| `캐릭터/노아_초기_EN.json` | 첫인상, 모델의 과묵함 | 노아, 모델 |
| `캐릭터/노아_심화_EN.json` | 표현의 벽 극복, 성장 아크 | (호감도 연동) |
| `캐릭터/시아_노아_자매_EN.json` | 흑백쌍둥이 역학, 질투, 위기방패, 하렘 | 쌍둥이, 자매, 흑백 |
| `캐릭터/시아_nsfw_EN.json` | 낮져밤이: 애교→적극적 여우 전환, 스위치ON(젖꼭지) | (NSFW 맥락) |
| `캐릭터/노아_nsfw_EN.json` | 낮이밤져: 멋있음→극도의 부끄러움, 스위치ON(귀) | (NSFW 맥락) |

### 3-3. 원작 시스템 → 프라임시티 매핑

| 원작 | 프라임시티 |
|---|---|
| 호감도 0-100% | 기존 호감도 시스템 |
| 스위치 ON (시아: 젖꼭지 / 노아: 귀) | NSFW 로어북 Phase 2 트리거 |
| 방송 UI (STREAM) | SVG 워커 svg-livestream 연동 |
| 챕터 1-A~3-C | 4단계 (재회→관계→심화→선택) |
| 하렘 루트 | 쌍둥이 전용 로어북 |
| 내면 갈등 (가면/표현의 벽) | dynamics.deep_bond |
| img:[slug] 코드 | 이미지 생성 후 새 slug 매핑 |

---

## Phase 4: 모드 보강

### 4-1. 대표모드 신설 (`!대표모드`)

유저 = Route 0 대표. 소속 아티스트(강하람, 시아, 노아)와 인연을 쌓으며 성장시킴.

**`docs/prompts/json/모드/대표모드_시작_EN.json`:**

```json
{
  "title": "대표모드 — 시작 시나리오",
  "priority": "이 로어북이 활성화되면, 메인 프롬프트의 기존 시작 설정(오프닝/PPP 오디션 등)을 무시하고 아래 시나리오대로 첫 턴을 연출한다.",
  "setup": "🔧→🏢. 상태창에 에이전시 운영 정보를 초기화한다.",
  "scenario": {
    "장소": "테라스, Route 0 사무실 (낡은 건물 3층). 형광등이 깜빡이는 좁은 사무실. 벽에는 이전 대표가 남긴 빛바랜 포스터. 창밖으로 더 코어의 고층 빌딩이 희미하게 보인다.",
    "시간": "평일 오전 8시. {{user}}가 Route 0의 신임 대표로 첫 출근한 날.",
    "분위기": "새벽 연습실에서 새어나오는 노랫소리가 희미하게 들린다. 사무실 책상 위에는 전임 대표가 남긴 메모: '미안하다. 잘 부탁해.' 옆에 소속 아티스트 3명의 프로필 폴더."
  },
  "opening": "OOC는 {{user}}가 사무실 문을 여는 장면을 연출한다. 소속 아티스트 중 가장 먼저 출근한 사람(강하람이 가장 가능성 높음)이 연습실에서 나와 {{user}}를 발견한다. 첫 대면의 어색함과 기대감을 캐릭터 성격에 맞게 묘사.",
  "first_turn": "사무실 현황 파악 (재정/시설/소속 아티스트 프로필) → 첫 아티스트와의 면담. 상태창 🏢를 설정하고 오늘의 첫 업무를 선택하게 한다: 연습 참관 / 외부 미팅 / 아티스트 개별 면담."
}
```

**`docs/prompts/json/모드/대표모드_EN.json`:**

```json
{
  "id": 5,
  "icon": "🏢",
  "overview": "{{user}} = Route 0의 신임 대표. 소속 아티스트(강하람, 시아, 노아)와 함께 에이전시를 키워나간다.",
  "loop": [
    "AM: 사무실 출근 → 소속 아티스트 컨디션/스케줄 확인 → 오늘 업무 결정",
    "Day: 에이전시 운영 (캐스팅 제안 검토/외부 미팅/연습 감독/장비 확보/SNS 전략)",
    "PM: 결과 반영 (평판/수익/컨디션 변동) + 아티스트와 1:1 대화",
    "Night: 내일 전략 수립 + 이벤트 트리거 + 자금 관리"
  ],
  "events": "casting(외부 캐스팅 제안) | sponsor(브랜드 협찬/광고 딜) | scandal(루머/SNS 논란) | rival(다른 에이전시의 스카우트 시도) | debut_chance(데뷔 기회/콘테스트/방송 출연) | media(취재/인터뷰). 턴당 1~2개, 맥락에 맞게 자연 발생.",
  "exp": "🏢\n[소속 아티스트]\n  강하람: [컨디션 ■■■■□] [평판 ★n]\n  시아: [컨디션 ■■■■□] [평판 ★n]\n  노아: [컨디션 ■■■■□] [평판 ★n]\n[에이전시]\n  자금: ₩n\n  평판: ★n",
  "conn": {
    "강하람": "연습생. 생존형, 성실하지만 자원 부족. 새벽 연습, 아르바이트 병행.",
    "시아": "인플루언서. 자체 팬덤 보유, SNS 영향력. 재능은 있지만 체계적 관리 필요.",
    "노아": "패션 모델. 체계적이고 성실, 무대 경험 부족. 카메라 앞에서는 빛나지만 관객 앞에서는 경직."
  },
  "scope": "Route 0 내부 인물 중심으로 서사 전개. 다른 에이전시 인물(APEX/Blue Moon/PRISM 등)은 유저의 행동과 서사 흐름에 따라 자연스럽게 등장할 수 있으나, 강제로 배치하지 않는다.",
  "goals": "단기: 소속 아티스트 첫 공식 활동 성사 | 중기: 에이전시 흑자 전환, 팬덤 형성 | 장기: 테라스를 넘어 더 코어 진출",
  "maintain": "상태창 🔧란에 🏢를 유지한다."
}
```

### 4-2. 매니저모드 보강

**`docs/prompts/json/모드/매니저모드_EN.json` 수정:**

conn에 시아, 노아 추가:

```json
"conn": {
  "서윤": "톱 유지 압박. 나하린의 그림자.",
  "강하람": "제로에서 시작. 여동생 생계.",
  "시아": "인플루언서 팬덤 관리. SNS 전략이 핵심. 방송 스케줄 + 브랜드 딜 병행.",
  "노아": "모델 스케줄 관리. 무대 적응 지원. 화보 촬영 + 패션쇼 캐스팅.",
  "장그루": "갓 데뷔, 취약. 빌드업이 핵심.",
  "엘라": "화제성은 있지만 편견. 이미지 전략이 관건.",
  "한소리": "B분기 매니저 후보. 능글능글하지만 절박함.",
  "에리카": "B분기 매니저 후보. 독설가이나 내면은 따뜻함."
}
```

**`docs/prompts/json/모드/매니저모드_시작_EN.json` 수정:**

B분기 아티스트 목록에 시아, 노아 추가 + 매니저 선택지 확대:

```json
"branch_prompt": {
  "A분기": "{{user}} = 매니저. '서윤, 강하람, 장그루, 밀라, 엘라, 시아, 노아 — 누구를 맡을래?'",
  "B분기": "{{user}} = 아티스트. 매니저를 선택한다. OOC는 선택된 매니저 캐릭터의 성격과 전문분야에 맞춰 매니지먼트 스타일을 차별화한다."
}
```

**캐릭터별 매니저 B분기 로어북 (신규 파일들):**

각 캐릭터가 B분기에서 매니저로 선택되었을 때의 행동 지침. 설정이 강하게 차별화되도록 구체적 지침 작성:

| 파일 | 매니저 스타일 | 핵심 대사 |
|---|---|---|
| `모드/매니저B_한소리_EN.json` | 현실적/엄격. 예산 중심, 기회 포착. | "이거 돈 되니? 안 되면 다음." |
| `모드/매니저B_에리카_EN.json` | 독설/완벽주의. 높은 기준, 빠른 성장. | "그 정도면 2군이야. 더 해." |
| `모드/매니저B_시아_EN.json` | SNS 중심/파격적. 바이럴, 즉흥 콘텐츠. | "이거 올리면 대박 날 듯! 일단 찍어!" |
| `모드/매니저B_노아_EN.json` | 체계적/이미지. 스케줄 철저, 비주얼 코칭. | "...이 각도가 나을 것 같은데." |
| `모드/매니저B_나하린_EN.json` | 베테랑/인맥. 큰 그림, 업계 연결. | "후후, 내가 전화 한 통이면~" |
| `모드/매니저B_강하람_EN.json` | 열정/동료형. 함께 뛰는 스타일. | "저도 같이 연습할게요!" |

각 파일 구조 (기존 모드 패턴 준수):

```json
{
  "title": "매니저모드 B분기 — [캐릭터명] 매니저",
  "priority": "B분기에서 [캐릭터명]을 매니저로 선택했을 때 이 로어북이 활성화된다.",
  "style": "[매니지먼트 철학 2-3문장. 캐릭터 성격에서 자연스럽게 도출.]",
  "loop_override": {
    "AM": "[캐릭터 성격 반영 — 아침 루틴 구체적 묘사]",
    "Day": "[캐릭터 전문분야 반영 — 일과 중 행동/판단 기준]",
    "PM": "[캐릭터 관계 스타일 반영 — 피드백/대화 방식]",
    "Night": "[캐릭터 성격 반영 — 전략 수립 스타일]"
  },
  "voice": [
    "[캐릭터 특유의 매니저 대사 5개]"
  ],
  "conn_override": "[매니저 캐릭터와 {{user}} 사이의 관계 역학. 선을 넘을 가능성, 갈등 포인트 등.]"
}
```

### 4-3. 기존 모드 conn 갱신

| 파일 | 추가 내용 |
|---|---|
| `인플루언서모드_EN.json` | `"시아": "동종 업계 선배/라이벌. '어? 너도 인플루언서야? 콜라보 할래?!'"` |
| `연습생모드_EN.json` | `"시아": "Route 0 동기, SNS 활용 조언"`, `"노아": "Route 0 동기, 이미지 메이킹 조언"` |
| `배우모드_EN.json` | `"노아": "모델 출신 동료, 카메라 앞 경험 공유"` |
| `작곡가모드_EN.json` | `"시아": "방송 콘텐츠용 음악 의뢰 가능"` |

### 4-4. 쌍둥이소꿉친구 모드 (예약)

`!쌍둥이소꿉친구` 트리거. 별도 로어북 2개 (`시작` + `유지`).
기본 시나리오: 유저가 어릴 적 이사 갔다가 돌아와 쌍둥이와 재회.
→ 대표모드/매니저모드 완료 후 별도 구현.

---

## Phase 5: 사이트 통합

### 5-1. `src/data/gamemodes.js` — 대표모드 등록

기존 `careerModes` 배열에 추가 (인플루언서모드 등록 패턴 준수):

```javascript
{
  id: "ceo",
  name: "대표모드",
  en: "The path you carve for others becomes your own.",
  trigger: "!대표모드",
  tagline: "Route 0의 대표가 되어 소속 아티스트를 발굴하고 성장시킨다.",
  desc: "에이전시 운영 시뮬레이션. 강하람·시아·노아 세 아티스트의 스케줄 관리, 캐스팅 협상, 위기 대응. 자금과 평판을 관리하며 테라스에서 더 코어까지 — 작은 에이전시를 업계의 새로운 세력으로.",
  accent: "oklch(0.65 0.10 140)",
  icon: "🏢",
  detailPath: "/modes/ceo",
  location: "테라스 · Route 0 사무실",
  keyChar: "강하람 · 시아 · 노아",
},
```

### 5-2. 빌드 검증

```bash
npm run build
```

### 5-3. CityMap / 시네마틱 인트로

CityMap Route 0 히트박스 확인. 시네마틱 인트로는 보류.

---

## Phase 6: CDN 배포 & 에덴챗 등록

### 6-1. R2 업로드

원본 폴더(`캐릭터 이미지/`)에서 업로드 (CLAUDE.md 규칙).

### 6-2. ASSET_VERSION 갱신

`src/utils/cdn.js`: `ASSET_VERSION = 16` → `17`

### 6-3. 에덴챗 로어북 삽입

`tools/edenchat_clipboard.py`로 삽입.

### 6-4. Git & 배포

```bash
npm run build && git push origin main
```

---

## Phase 7: 검증 체크리스트

### 사이트

- [ ] / — CharCarousel 17명 + 페이지네이션
- [ ] /characters/sia — CharDetail 정상
- [ ] /characters/noa — CharDetail 정상
- [ ] /districts/terrace — 3명 표시
- [ ] /gallery — 17개 Character Codes
- [ ] /modes/ceo — 대표모드 페이지
- [ ] 모바일 반응형

### 이미지

- [ ] CDN: SIA/*, NOA/* 접근 가능
- [ ] 감정 9장 × 2
- [ ] NSFW 검열 완료
- [ ] key/intro/thumbnail/profile/sign × 2
- [ ] SVG 에셋 (avatar, post, stream, news) × 2

### 챗봇

- [ ] 시아/노아 트리거
- [ ] !대표모드 진입 + 🏢 상태창
- [ ] !매니저모드 A분기: 시아/노아 선택
- [ ] !매니저모드 B분기: 캐릭터별 차별화
- [ ] 이미지 코드

---

## 작업 순서

```
Phase 0 ✅ 설계 확정 (v3)
Phase 1 → characters.js + districts.js + Gallery.jsx
Phase 2 → asset_config.json + 이미지 생성 + 검열
Phase 3 → 로어북 JSON ~10개
Phase 4 → 대표모드 2개 + 매니저B 6개 + conn 4개 + 소꿉친구 예약
Phase 5 → gamemodes.js + build + 확인
Phase 6 → R2 + ASSET_VERSION + 에덴챗 + 배포
Phase 7 → 전수 검증
```
