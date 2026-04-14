# Plan: SIA & NOA 캐릭터 추가 + 모드 보강

> **상태**: 피드백 반영 완료 — 상세 피드백 대기
> **범위**: characters.js, districts.js, asset_config.json, 로어북 JSON, Gallery, 대표모드 신설, 매니저모드 보강
> **예상 파일 변경**: ~25개 파일 신규/수정
> **참조**: 쌍둥이 챗봇 메인 프롬프트, 로어북 프롬프트, 이미지 코드.md

---

## Phase 0: 설계 결정 (확정)

### 0-1. 캐릭터 기본 정보

| 항목 | 시아 (SIA) | 노아 (NOA) |
|---|---|---|
| id | `sia` | `noa` |
| cdnId | `SIA` | `NOA` |
| name | 시아 | 노아 |
| agency | Route 0 | Route 0 |
| age | 22 | 22 |
| role | 인플루언서 / 크리에이터 | 패션 모델 |
| 외모 | 쌍둥이 동생, 172cm, white short messy hair(hair over one eye, long bangs, swept bangs, single black hairpin), 다크블루 눈 | 쌍둥이 언니, 172cm, black short straight hair(hair over eyes, long bangs, wispy bangs, single white hairpin), 다크블루 눈 |
| 가슴 | large breasts (둘 다 동일) | large breasts (둘 다 동일) |
| 성격 | 쾌활, 장난기, 교활, 스킨십 거리낌없음, 애교 많음 | 과묵, 다독, 감정 표현 서투름, 내면 다정, 관심 없는 척 은근슬쩍 기댐 |

### 0-2. 확정된 방향

- **소꿉친구 설정**: X (사용하지 않음. 단, `!쌍둥이소꿉친구`모드로 추가 가능.). 프라임시티에서 새로운 만남.
- **가슴 크기**: 둘 다 `large breasts` (동일 통일)
- **쌍둥이 합동 이미지**: 보류. 직접 보면서 검토 필요.
- **시네마틱 인트로**: 보류. 나중에 별도 진행.
- **대표모드 한소리**: PRISM Studio 대표 그대로. Route 0에 강제 배치 X. 유저 서사에 따라 자연스럽게 만남.
- **역방향 매니저**: 모든 캐릭터 경우의 수에 대비. 특정 우선순위 없음.
- **캐릭터 텍스트**: 원작 쌍둥이 마크다운 프롬프트 기반으로 작성.

### 0-3. 색상 스키마 (oklch)

- 시아: `oklch(0.72 0.14 250)` — 생기있는 블루 + 화이트 (방송인/에너지)
- 노아: `oklch(0.35 0.15 300)` — 차분한 딥 퍼플 + 블랙 (모델/우아함)

---

## Phase 1: 캐릭터 데이터 등록

### 1-1. `src/data/characters.js` — SIA, NOA 추가

기존 `lapis` 엔트리(line 505 `];`) 직전에 2명 삽입. 총 17명.

원작 프롬프트에서 추출한 성격/배경을 프라임시티 맥락으로 재작성:

```javascript
  // ── 16. 시아 ── Route 0 인플루언서 ──
  {
    id: "sia",
    cdnId: "SIA",
    name: "시아",
    agency: "Route 0",
    role: "인플루언서 / 크리에이터",
    age: 22,
    tagline: // 이전은 너무 밈 성격이 강함. 오리지널리티 강하게 바꿀 것. 장난스러우면서도 사랑스러운 느낌이 들도록. 미모리와 겹치면 안 됨.
    color: "oklch(0.72 0.14 250)", // 블루 + 화이트 투톤 이미지 컬러로 변경
    image: cdnUrl("SIA/key.webp"),
    thumbnail: cdnUrl("SIA/thumbnail.webp"),
    profile: cdnUrl("SIA/profile.webp"),
    sign: cdnUrl("SIA/sign.webp"),// `연예계/char_img/SIA/*` 폴더 및 R2 버킷 프리픽스 생성
    detailPath: "/characters/sia",
    signature: "윙크 + 장난기 가득한 미소",
    personality: "피카레스크 인플루언서 — 장난기 뒤에 숨긴 진심",
    description:
      "노아의 쌍둥이 동생. SNS와 인터넷 방송으로 자체 팬덤을 구축한 인기 인플루언서. 쾌활하고 장난기 넘치지만, 화면 뒤에서는 '방송인 시아'와 '진짜 시아' 사이에서 흔들린다.",
    brief:
      "노아의 쌍둥이 동생. 인터넷 방송과 SNS로 자체 팬덤을 형성한 Route 0의 인플루언서. 언제나 쾌활하고 장난기 넘치지만, 완벽해야 한다는 인플루언서의 가면과 진짜 자신 사이에서 갈등한다. 낮에는 애교 넘치지만 nsfw상황에서는 적극적인 여우로 돌변. 낮져밤이",
    job: "인플루언서 / 크리에이터",
    background:
      "쌍둥이 언니 노아와 함께 Route 0에 머물며 연예계에 도전 중. 정규 에이전시 없이 1인 미디어로 성장했지만, 그만큼 자본과 인맥의 한계를 체감하고 있다.",
    taste: "맵고 단 음식, 활기찬 장소, 게임, 즉흥적인 외출. 사람들과 어울리는 것.",
    goal: "방송인 시아가 아닌 진짜 자신을 사랑받는 것.",
    expressions: EXPRESSION_KEYS,
  },
  // ── 17. 노아 ── Route 0 패션 모델 ──
  {
    id: "noa",
    cdnId: "NOA",
    name: "노아",
    agency: "Route 0",
    role: "패션 모델",
    age: 22,
    tagline: "...잘 어울리네.",
    color: "oklch(0.68 0.08 280)", // 딥 퍼플 + 블랙 이미지 컬러로 변경. 위쪽 참조.
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
      "시아의 쌍둥이 언니. 과묵하고 감정 표현에 서투르지만, 행동으로 마음을 보여주는 사람. 표현력 넘치는 언니와 자신을 비교하며 무뚝뚝함이 오해를 살까 두려워한다. 말보다 손이 먼저 움직이는 조용한 다정함. 멋있는 면모. nsfw상황에선 부끄럼쟁이. 낮이밤져",
    job: "패션 모델",
    background:
      "쌍둥이 동생 시아와 함께 Route 0에 머물며 프리랜서 모델로 활동. 패션 화보 위주로 커리어를 쌓고 있지만 무대 경험은 부족하다. 체계적이고 성실한 성격.",
    taste: "담백한 음식, 조용한 공간, 독서, 디자인. 혼자만의 시간.",
    goal: "자신만의 방식으로 감정을 표현하고 인정받는 것.",
    expressions: EXPRESSION_KEYS,
  },
```

### 1-2. `src/data/districts.js` — Route 0 캐릭터 목록 갱신

```javascript
// Line 81: 현재
characters: ["강하람"],
// 변경
characters: ["강하람", "시아", "노아"],
```

### 1-3. `src/pages/Gallery.jsx` — 하드코딩 수정

**CHAR_CODES 배열 (line 14-23):**
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
  { code: "SIA", name: "시아" }, { code: "NOA", name: "노아" },  // 추가
];
```

**카운트 라벨 (line 82):**
```javascript
// 현재: Character Codes — 15
// 변경:
Character Codes — {CHAR_CODES.length}
```

**이미지 수량 텍스트 (line 297):**
```javascript
// 현재: 15명 × 74장 = 총 1,110장.
// 변경: 17명 × 74장 = 총 1,258장.
// (정확한 수치는 이미지 생성 완료 후 갱신)
```
// 한참 못 세아렸음. asset_config 파일 참조. `연예계/char_img` 폴더를 살펴 볼 것. 최소한 SVG 4장, 특수 2장, 상황 96장, 키비주얼, 인트로, 썸네일, 프로필 이미지, 서명, 가 있어야함.
### 1-4. 연쇄 영향

**자동 적응 (변경 불필요):**
- CharCarousel.jsx — `characters.length` 동적
- CharDetail.jsx — `characters.find(c => c.id === name)` 동적
- App.jsx — `/characters/:name` 동적 라우트
- DistrictDetail.jsx — `characters.filter()` 동적

**수동 확인:**
- CityMap.jsx — Route 0 영역 히트박스/아이콘 확인
- svgTemplates.js — CDN 코드 자동 매핑 OK, SVG 에셋은 나중에

---

## Phase 2: 이미지 에셋 생성

### 2-1. `tools/asset_config.json` — SIA, NOA 프롬프트

기존 캐릭터 프롬프트 패턴 참조 (MIL, ELA 등). 원작 외모 → NAI 태그 변환:

**SIA (시아):**
```json
"SIA": {
  "name": "시아",
  "clothed": "girl, large breasts, playful, wink, 2::ivory hair::, medium hair, wavy hair, loose waves, side swept bangs, long sidelocks, dark blue eyes, bright eyes, sharp eyes, lively expression, streamer, casual fashion, oversized hoodie, crop top, denim shorts, belt accessories, sneakers, earbuds around neck, bracelet",
  "nude": "girl, nude, large breasts, playful, wink, 2::ivory hair::, medium hair, wavy hair, loose waves, side swept bangs, long sidelocks, dark blue eyes, bright eyes, sharp eyes, lively expression, earbuds around neck, bracelet"
}
```

**NOA (노아):**
```json
"NOA": {
  "name": "노아",
  "clothed": "girl, large breasts, calm, composed, 2::platinum blonde hair::, long hair, straight hair, blunt bangs, dark blue eyes, cool eyes, narrow eyes, stoic expression, model, high fashion, fitted blazer, white blouse, high-waisted long skirt, heels, minimalist earrings, thin necklace",
  "nude": "girl, nude, large breasts, calm, composed, 2::platinum blonde hair::, long hair, straight hair, blunt bangs, dark blue eyes, cool eyes, narrow eyes, stoic expression, minimalist earrings, thin necklace"
}
```

**pose_overrides (캐릭터별 특수 씬):**
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
    "female_prompt": "library, reading, window light, quiet, tea cup, serene, long hair flowing, afternoon"
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

### 2-2. 생성 범위 & 파이프라인

| 유형 | 수량/캐릭 | 소계 |
|---|---|---|
| 감정 표현 (1-9) | 9장 | 18장 |
| 일상/SFW (10-19) | 10장 | 20장 |
| NSFW (20-96) | 77장 | 154장 |
| 특수 (901-904, 910-911) | 6장 | 12장 |
| 키비주얼/썸네일/프로필/사인 | 4장 | 8장 |
| SVG 에셋 (avatar, post, stream, news) | 4장 | 8장 |
| **합계** | | **~220장** |

```bash
# 1. 프롬프트 등록 후 생성
python tools/asset_generator.py --char SIA
python tools/asset_generator.py --char NOA

# 2. 검열
python tools/auto_censor.py --input "C:\Users\User\OneDrive\图片\챗봇 제작\캐릭터 이미지\SIA" --conf 0.7
python tools/auto_censor.py --input "C:\Users\User\OneDrive\图片\챗봇 제작\캐릭터 이미지\NOA" --conf 0.7

# 3. R2 업로드 (원본 폴더에서!)
for code in SIA NOA; do
  for f in "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/$code"/*.webp; do
    npx wrangler r2 object put "prime/ent/$code/$(basename "$f")" \
      --file "$f" --content-type "image/webp" --remote
  done
done

# 4. ASSET_VERSION 갱신
# src/utils/cdn.js: ASSET_VERSION 16 → 17
```

### 2-3. 쌍둥이 합동 이미지

**보류**. 개별 캐릭터 이미지 완성 후 직접 확인하며 결정.

---

## Phase 3: 로어북 JSON 변환

### 3-1. 캐릭터 메인 로어북

원작 쌍둥이 마크다운에서 추출 → 프라임시티 포맷 (inner/voice/dynamics/rel/note):

**`docs/prompts/json/캐릭터/시아_EN.json`:**
```json
{
  "inner": "항상 완벽하고 쾌활해야 한다는 '인플루언서의 가면'과, 진짜 자신을 보여주고 싶은 욕구 사이의 갈등. 칭찬을 받으면 과장되게 기뻐하지만, 혼자 있을 때 그 칭찬이 '방송인 시아'를 향한 것인지 '진짜 나'를 향한 것인지 고민한다. 진심을 말하려다 장난으로 덮어버리는 패턴을 반복.",
  "voice": {
    "일상": [
      "시아 **|** 이거 못 참지~ 같이 가자, 어서!",
      "시아 **|** (카메라를 들며) 잠깐, 이거 찍어야 돼. 빛이 예쁘잖아!"
    ],
    "방송": [
      "시아 **|** 여러분~ 오늘도 왔쥬? 사랑해요 다들!",
      "시아 **|** (방송 끝나고, 혼자) ...오늘 좀 무리했나."
    ],
    "벽": [
      "시아 **|** (장난기가 사라지며) ...가끔은 그냥, 아무 생각 없이 너랑 있고 싶어.",
      "시아 **|** (혼잣말) 나 없이도 재밌으면... 좀 무서운데."
    ],
    "도움": [
      "시아 **|** 뭐야, 힘든 거 있으면 말해! 내가 다 해결해줄게... 는 못 하지만, 옆에 있어줄 수는 있지!",
      "시아 **|** (진지하게) 너 때문에 방송이 더 재밌어진 거 알지?"
    ]
  },
  "dynamics": {
    "first_impression": "활기차고 친근한 인플루언서. 장난기 넘치는 접근.",
    "disappoint": "진심을 가볍게 대하거나 방송 콘텐츠 취급할 때 — 웃지만 눈이 웃지 않는다.",
    "impress": "화면 밖의 시아를 있는 그대로 대해줄 때 — 장난기 뒤의 진심이 드러난다.",
    "deep_bond": "장난 없는 목소리로 '보고 싶었어'라고 직접 말하기 시작한다."
  },
  "rel": {
    "노아": "쌍둥이 동생. 과묵한 동생이 걱정되면서도 자랑스럽다.",
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
  "inner": "감정 표현이 서툴러서 오해받는 것이 두렵다. 활발한 시아와 자신을 비교하며 '무뚝뚝함이 사람을 밀어내는 것 아닌가' 고민한다. 하지만 말보다 행동으로 마음을 전하는 방식이 바로 노아의 진심. 칭찬을 들으면 눈을 피하며 귀를 만지작거리지만, 혼자일 때 그 말을 되새기며 미소 짓는다.",
  "voice": {
    "일상": [
      "노아 **|** ...그 옷, 너한테 잘 어울려.",
      "노아 **|** (조용히 차를 건네며) ...아까 추워 보여서."
    ],
    "촬영": [
      "노아 **|** (카메라 앞에서 표정이 바뀌며) ...",
      "노아 **|** (촬영 후, 긴장 풀며) ...잘 나왔으면 좋겠다."
    ],
    "벽": [
      "노아 **|** (고개를 돌리며) ...말로 하는 게 어려워서. 미안.",
      "노아 **|** (혼잣말) ...좋아한다고 말하면, 이상해질까."
    ],
    "도움": [
      "노아 **|** (말없이 옆에 앉는다. 한참 후) ...괜찮아?",
      "노아 **|** (Uが 추워하면 자기 겉옷을 벗어 건넨다. 아무 말 없이.)"
    ]
  },
  "dynamics": {
    "first_impression": "과묵하고 쿨한 모델. 무심한 듯하지만 관찰력이 날카롭다.",
    "disappoint": "마음을 가볍게 대하거나 시아와 단순 비교할 때 — 더욱 과묵해진다.",
    "impress": "말없는 행동의 의미를 알아채줄 때 — 눈을 마주치려 노력하기 시작한다.",
    "deep_bond": "수줍지만 직접적으로 '...고마워. 전부 다.'라고 감사를 표현한다."
  },
  "rel": {
    "시아": "쌍둥이 언니. 늘 밝은 언니가 걱정되지만 표현 못한다.",
    "강하람": "Route 0 동기. 비슷한 성실함에 묵묵히 동질감."
  },
  "note": "노아의 침묵은 어색함이 아니라, 깊은 생각이나 상대의 말을 경청하고 있다는 의미."
}

// --- TRIGGER ---
// 노아
```

### 3-2. 추가 로어북 파일 목록

| 파일 | 내용 | 트리거 |
|---|---|---|
| `캐릭터/시아_초기_EN.json` | 첫인상, 방송인으로서의 접근 | 시아, 인플루언서 |
| `캐릭터/시아_심화_EN.json` | 가면 뒤의 진심, 방송 고민, 성장 아크 | (호감도 연동) |
| `캐릭터/노아_초기_EN.json` | 첫인상, 모델로서의 존재감 | 노아, 모델 |
| `캐릭터/노아_심화_EN.json` | 표현의 벽 극복, 사진첩, 성장 아크 | (호감도 연동) |
| `캐릭터/시아_노아_자매_EN.json` | 쌍둥이 역학, 질투, 위기방패 | 쌍둥이, 자매 |
| `캐릭터/시아_nsfw_EN.json` | Playful Queen → 스위치ON | (NSFW 맥락) |
| `캐릭터/노아_nsfw_EN.json` | Shy Exploration → 스위치ON → Aftermath | (NSFW 맥락) |

### 3-3. 원작 시스템 → 프라임시티 매핑

| 원작 | 프라임시티 대응 |
|---|---|
| 호감도 0-100% | 기존 호감도 시스템 |
| 스위치 ON (시아: 젖꼭지 / 노아: 귀) | NSFW 로어북 Phase 2 트리거 |
| 방송 UI (STREAM 포맷) | SVG 워커 svg-livestream 연동 |
| 챕터 1-A~3-C | 프라임시티 4단계 (재회→관계→심화→선택) |
| 하렘 루트 | 쌍둥이 전용 로어북 엔트리 |
| img:[slug] 코드 | 새 이미지 slug 생성 (Phase 2 완료 후) |

---

## Phase 4: 모드 보강

### 4-1. 대표모드 신설 (`!대표모드`)

유저 = Route 0 대표. 소속 아티스트(강하람, 시아, 노아)와 인연을 쌓으며 성장시키는 모드.

**`docs/prompts/json/모드/대표모드_EN.json`:**
```json
{
  "id": 0,
  "icon": "🏢",
  "overview": "{{user}} = Route 0의 신임 대표. 소속 아티스트들과 함께 에이전시를 키워나간다.",
  "loop": [
    "AM: 사무실 → 소속 아티스트 스케줄 확인, 오늘의 업무 결정",
    "Day: 에이전시 운영 (캐스팅/협상/연습 감독/외부 미팅)",
    "PM: 결과 반영 (평판/수익/컨디션) + 아티스트와 대화",
    "Night: 전략 수립 + 이벤트 트리거"
  ],
  "events": "casting | sponsor | scandal | rival | debut_chance | media. 턴당 1~2개. 이벤트는 Route 0 내부 인물과의 관계에서 자연스럽게 발생.",
  "exp": "🏢\n[소속]: 강하람, 시아, 노아\n[에이전시 평판]: ★n\n[자금]: ₩n\n[컨디션]\n  강하람: ■■■■□\n  시아: ■■■■□\n  노아: ■■■■□",
  "conn": {
    "강하람": "연습생. 생존형, 성실하지만 자원 부족",
    "시아": "인플루언서. 자체 팬덤 보유, SNS 영향력",
    "노아": "패션 모델. 체계적, 무대 경험 부족"
  },
  "scope": "Route 0 내부 인물 중심. 다른 에이전시(APEX, Blue Moon, PRISM 등)의 인물은 유저의 서사에 따라 자연스럽게 등장할 수 있으나, 강제로 배치하지 않는다.",
  "goals": "단기: 소속 아티스트 첫 활동 성사 / 중기: 에이전시 안정화 / 장기: 더 코어 진출",
  "maintain": "상태창 🔧란에 🏢를 유지한다."
}
```

**`docs/prompts/json/모드/대표모드_시작_EN.json`:**
```json
{
  "title": "대표모드 — 시작 시나리오",
  "priority": "이 로어북이 활성화되면, 메인 프롬프트의 기존 시작 설정을 무시",
  "setup": "🔧→🏢. 상태창에 에이전시 운영 정보 초기화",
  "scenario": {
    "장소": "테라스, Route 0 사무실 (낡은 건물 3층)",
    "시간": "평일 오전 8시",
    "분위기": "형광등이 깜빡이는 좁은 사무실. 벽에는 이전 대표가 남긴 빛바랜 포스터. 창밖으로 더 코어의 고층 빌딩이 희미하게 보인다."
  },
  "opening": "OOC는 {{user}}가 Route 0의 신임 대표로 첫 출근하는 장면을 연출한다. 사무실에서 소속 아티스트 중 한 명과의 첫 만남을 자연스럽게 배치.",
  "first_turn": "사무실 상태 확인 → 소속 아티스트 현황 파악 → 첫 면담"
}
```
// 시작상황, 트리거 더 구체적으로 생각
### 4-2. 매니저모드 보강

**`docs/prompts/json/모드/매니저모드_EN.json` 수정:**

conn 객체에 시아, 노아 추가 + 역방향 매니저 분기:

```json
{
  "conn": {
    "서윤": "톱 유지 압박",
    "강하람": "제로에서 시작",
    "시아": "인플루언서 팬덤 관리, SNS 전략",
    "노아": "모델 스케줄 관리, 무대 적응 지원",
    "...": "기존 캐릭터 유지"
  },
  "reverse_mode": {
    "overview": "{{user}}가 아티스트, 캐릭터가 {{user}}의 매니저가 되는 역방향 시나리오.",
    "rule": "B분기(아티스트 시점) 선택 시, OOC는 담당 매니저 캐릭터의 성격을 반영하여 매니지먼트 스타일을 차별화한다.",
    "note": "모든 캐릭터가 매니저 역할을 수행할 수 있다. 각 캐릭터의 기존 성격/전문 분야에 따라 매니지먼트 접근이 달라진다."
  }
}
```

**`docs/prompts/json/모드/매니저모드_시작_EN.json` 수정:**

역방향 분기(B분기) 강화:

```json
{
  "branch_prompt": {
    "A분기": "{{user}} = 매니저. 담당 아티스트를 선택하여 관리한다.",
    "B분기": "{{user}} = 아티스트. 매니저 캐릭터를 선택한다. 매니저의 성격에 따라 매니지먼트 스타일이 달라진다. (예: 한소리 → 현실적/엄격, 시아 → SNS 중심/파격적, 노아 → 체계적/이미지 중심)"
  }
}
```
// 각 캐릭터 별 매니저모드 로어북 분리. 더욱 설정 강하게 변경되도록 지침 강화. 시작상황도 좀 더 상세히.
### 4-3. 기존 모드 conn 갱신

시아/노아를 참조할 수 있는 모드들의 conn에 추가:

| 파일 | 추가 내용 |
|---|---|
| `인플루언서모드_EN.json` | `"시아": "동종 업계 선배/라이벌"` |
| `연습생모드_EN.json` | `"시아": "Route 0 동기, SNS 활용 조언"`, `"노아": "Route 0 동기, 이미지 메이킹 조언"` |
| `배우모드_EN.json` | `"노아": "모델 출신 동료, 카메라 앞 경험 공유"` |

---

## Phase 5: 사이트 통합

### 5-1. 빌드 검증

```bash
npm run build
```

Phase 1 데이터 추가만으로 자동 적응:
- CharCarousel, CharDetail, DistrictDetail, App 라우팅

### 5-2. CityMap 확인

Route 0 히트박스에 캐릭터 3명 표시 확인. 필요 시 히트박스 크기 조정.

### 5-3. 시네마틱 인트로

**보류**. 나중에 별도로 진행.

---

## Phase 6: CDN 배포 & 에덴챗 등록

### 6-1. R2 업로드

```bash
# 원본 폴더에서 업로드 (CLAUDE.md 규칙)
for code in SIA NOA; do
  for f in "C:/Users/User/OneDrive/图片/챗봇 제작/캐릭터 이미지/$code"/*.webp; do
    npx wrangler r2 object put "prime/ent/$code/$(basename "$f")" \
      --file "$f" --content-type "image/webp" --remote
  done
done
```

### 6-2. ASSET_VERSION 갱신

`src/utils/cdn.js`: `ASSET_VERSION = 16` → `17`

### 6-3. 에덴챗 로어북 삽입

`tools/edenchat_clipboard.py`로 시아/노아 로어북 + 모드 JSON 삽입.

### 6-4. 사이트 게시물 (src/data/gamemodes.js)

대표모드를 gamemodes 목록에 추가:

```javascript
{
  id: "ceo",
  icon: "🏢",
  name: "대표모드",
  trigger: "!대표모드",
  desc: "Route 0의 대표가 되어 소속 아티스트를 성장시키는 경영 시뮬레이션.",
  category: "career",
}
```
// 훨씬 구체적으로 작성되어야 함. `docs/prompts/json` 폴더를 꼼꼼히 참고하여 패턴과 관례를 분석하여 적용.
### 6-5. Git 커밋 & 배포

```bash
npm run build
git add -A  # 변경 파일 목록 확인 후
git commit -m "Add SIA and NOA characters to Route 0, create CEO mode, enhance Manager mode"
git push origin main
```

---

## Phase 7: 검증 체크리스트

### 사이트
- [ ] / — CharCarousel 17명 정상 표시 + 페이지네이션
- [ ] /characters/sia — CharDetail 정상 렌더링
- [ ] /characters/noa — CharDetail 정상 렌더링
- [ ] /districts/terrace — 강하람, 시아, 노아 3명 표시
- [ ] /gallery — Character Codes 17개, SIA/NOA 포함
- [ ] 모바일 반응형 확인

### 이미지
- [ ] CDN: img.bluehair.blue/ent/SIA/*, /NOA/* 접근 가능
- [ ] 감정 표현 9장 × 2 정상
- [ ] NSFW 검열 완료
- [ ] key/thumbnail/profile/sign 정상

### 챗봇
- [ ] 에덴챗: 시아/노아 트리거 정상
- [ ] !대표모드 정상 진입 + 상태창
- [ ] !매니저모드 역방향(B분기) 정상
- [ ] 이미지 코드 정상 표시

---

## 작업 순서

```
Phase 0 ✅ 설계 결정 확정
Phase 1 → characters.js + districts.js + Gallery.jsx (코드 작업)
Phase 2 → asset_config.json + 이미지 ~220장 생성 + 검열
Phase 3 → 로어북 JSON ~10개 파일 작성
Phase 4 → 대표모드 신설 + 매니저모드 보강 + 기존 모드 conn 갱신
Phase 5 → npm run build + 사이트 확인
Phase 6 → R2 업로드 + ASSET_VERSION + 에덴챗 + gamemodes + 배포
Phase 7 → 전수 검증
```
