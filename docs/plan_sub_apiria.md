# plan_sub_apiria.md — 신규 캐릭터 아피리아(APR) 추가 기획서

> **작성일**: 2026-04-18
> **목적**: 16명 → 17명 확장. 신규 캐릭터 "아피리아"를 이미지 → 챗봇 프롬프트 → SVG → 사이트 → 소개 HTML 순으로 단계적 추가.
> **원칙**: 각 Phase 완료 후 사용자 승인 → 다음 Phase. 절대 일괄 금지.
>
> _승인 전까지 코드/JSON 수정 금지. plan은 살아있는 문서 — 피드백 주석을 여기에 남길 것._

---

## 0. 캐릭터 확정 정보

| 항목 | 값 |
|---|---|
| **한글명** | 아피리아 |
| **어원** | **s**apphire 에서 S 제거한 발음 ("아피리아") |
| **CDN ID** | `APR` |
| **아키타입** | `seductive` (HSR/ELA/MMR/NHR/LPS 레일) |
| **외형 키** | royal blue 장발, 한쪽 눈 가림, 흰 눈동자, 실눈, 은색 초커, 오버사이즈 화이트(셔츠+롱블레이저+롱타이+쇼츠), **sleeves past fingers** |
| **체형** | mature female / huge breasts / thick thighs / wide hips |
| **성격 노트** | 평상시 여유로운 매혹 (`seductive smile` 유지) ↔ 강하게 박힐 시 표정 격변(붕괴) |

### 캐릭터 프롬프트 (원본)

```
girl, mature female, seductive smile, huge breasts, thick thighs, wide hips,
3::high chroma blue hair, royal blue hair, lapis lazuli colored hair ::,
-2::navy hair, indigo hair, colored inner hair, two-tone hair ::,
3::very long hair, long sidelocks, curtained bangs, hair over one eye ::,
messy hair,
3::white eyes, half-closed eyes, silver choker ::,
3::oversized clothing, loose clothes, white shirt, shirt tucked in,
   white long blazer, long white tie, sleeves past fingers, white short shorts ::,
-3::cleavage, unbuttoned shirt ::
```

**해석**:
- `3::` = 강화 가중치 (핵심 시그니처: 파란 장발·한쪽 눈 가림·흰눈·실눈·은초커·화이트 오버사이즈)
- `-2::` = 네거티브 (2톤/이너컬러/네이비/인디고 금지 — **순수 로열블루 강제**)
- `-3::` = 네거티브 강화 (cleavage/단추풀림 금지 — **정숙한 오버사이즈** 실루엣 유지)

---

## 1. 실행 순서 (Phase 전체)

```
Phase A. 이미지 프롬프트
  A-1. Danbooru 태그 전수 검수 (라이브씬 93-96 제외)   ← 여기부터
  A-2. 신규 체위 씬 2개(97/98) 추가 + 전 아키타입 7개 pose 추가
  A-3. asset_config.json에 APR 캐릭터 등록 + 씬 override
  A-4. character_pose_overrides.json에 APR overrides 작성 (표정 변주 스크립팅)
  A-5. 실제 이미지 생성 (asset_generator.py 돌려서 샘플 → 사용자 검수 → 본 배치)

Phase B. 챗봇 프롬프트
  B-1. 캐릭터 본체 로어북 (아피리아_EN.json)
  B-2. 트리거/초기/심화/과거/위기/가족 분리 (기존 14명 패턴)
  B-3. 관계 로어북 (짠꿉공/라이벌/자매/작품 중 어울리는 것)
  B-4. 메인 프롬프트에 캐릭터 등록
  B-5. 에덴챗 플랫폼 삽입 (edenchat_clipboard.py)

Phase C. SVG
  C-1. 기존 범용 SVG(일정표/뉴스/라이브/SNS 등)는 자동 대응 (캐릭터 아바타만 추가)
  C-2. APR 전용 SVG 에셋 필요 여부 판단 (svg-stream, svg-post 등은 cdnUrl("APR/svg/*")로 자동)

Phase D. 사이트
  D-1. src/data/characters.js 에 APR 엔트리 추가 (17번째)
  D-2. CharCarousel 확인 (자동 대응)
  D-3. 시네마틱 인트로 추가 여부 판단 (introStyle 선택 or DefaultCharDetail)
  D-4. CityMap/District 어디 소속시킬지 (APEX/BlueMoon/PRISM/Route0)
  D-5. npm run build

Phase E. 소개페이지 HTML (docs/프라임시티 소개페이지.txt)
  E-1. 캐릭터 썸네일 카드 추가 (17번째)
  E-2. 기획사별 라인업 업데이트
  E-3. 에덴챗 삽입 후 실제 렌더 확인
```

---

## 2. Phase A-1 — Danbooru 태그 전수 검수

### 2-1. 검수 원칙 (v2 사용자 피드백 반영)

- **대상**: **씬 프롬프트 + 아키타입 pose 태그** 전수
  - `tools/asset_config.json` → `scenes.*.female_prompt` / `scenes.*.male_prompt` / `character_scene_overrides.*.*.female_prompt`
  - `tools/character_pose_overrides.json` → `_archetypes.*.poses.*` 전수 + `_character_overrides.*.*` 전수
- **제외**:
  - 🚫 라이브씬 93~96 (사용자 확정: 해당 씬 한정 검증된 조합, 다른 씬에 사용 금지)
  - 🚫 아피리아 **캐릭터 본체 프롬프트** (이미 사용자가 검증/조정 완료)
  - 가중치 문법(`3::`, `-2::`, `1.5::`, `::`)은 제거 후 태그만 추출
  - `source#` / `target#` prefix 제거
- **판정 기준**:
  - `OK` (post_count ≥ 100) → 그대로 사용
  - `LOW` (1~99) → 유지하되 리포트 기록
  - `GHOST` (0) → 대체 태그 탐색 (fuzzy 결과 참조) → 사용자 승인 후 교체

### 2-2. 검수 목적 (2차 목적)

- **1차**: GHOST 태그 제거
- **2차 (사용자 피드백)**: 추상 감정 태그 정리 — `annoyed`, `tsundere`, `grumpy`, `reluctant`, `indignant` 등은 Danbooru에 있어도 **그림체가 흔들리는 모호한 concept 태그**. 가급적 `sideways glance` / `clenched teeth` / `pursed lips` / `crossed arms` 같은 **구체 표정·손짓**으로 대체.

### 2-3. 실행 방법

**추출 스크립트**: `c:/tmp/audit_apiria_tags.py` (신규, 일회성)

- 두 JSON에서 모든 프롬프트/pose 태그 추출 → 가중치 문법·접두어 제거 → 유니크 세트
- Danbooru API 호출 (0.3초 간격) → `tools/_apiria_tag_audit.md` 리포트 생성
- GHOST에 한해 fuzzy 검색으로 대체 후보 3개씩 제시

**예상 태그 수**: 200-300개 유니크 → 60-90초 소요 예상.

### 2-4. 결과 사용 방식

- 리포트 생성 → 사용자에게 요약 보고 (GHOST 개수, 교체 제안)
- 사용자 승인 후 두 JSON의 GHOST 태그를 일괄 교체 (Phase A-2~A-4 진행 전 사전 정리)

---

## 3. Phase A-2 — 신규 체위 씬 97/98 추가 + 전 아키타입 pose 추가

### 3-1. asset_config.json 에 씬 97/98 추가

위치: `asset_config.json` → `scenes` 객체 → `"96"` 다음에 append.

```json
"97": {
  "name": "smata",
  "width": 1216,
  "height": 832,
  "female_prompt": "on bed, smata, thigh sex, cum on thighs, from below, cum overflow, dynamic angle",
  "male_prompt": "boy, pov, out of frame, large penis, cum"
},
"98": {
  "name": "after-handjob",
  "width": 832,
  "height": 1216,
  "female_prompt": "after handjob, cum on hand",
  "male_prompt": ""
}
```

**해상도 선택**:
- 97 스마타 = 가로 (`from below` + `dynamic angle` 전신 구도)
- 98 핸드잡 후 = 세로 (표정·손 포커스)

### 3-2. `_scene_to_pose` 매핑 추가

```json
"97": "smata",
"98": "post_handjob"
```

### 3-3. 전 아키타입 7개에 `smata` / `post_handjob` pose 추가

사용자 확정: **신규 체위는 전 아키타입 전부에 추가**. 기존 16명도 이 씬 생성 가능.

아래는 아키타입별 **기본 pose 제안** — plan 승인 시 그대로 반영, 수정 원하면 이 블록에 주석으로 기록.

#### 3-3-1. `aloof` (SY·RAY·NIA·HSE)

```json
"smata": [
  "embarrassed", "light blush", "sideways glance", "looking to the side",
  "covering own mouth", "parted lips", "knees together"
],
"post_handjob": [
  "sideways glance", "looking to the side", "embarrassed",
  "light blush", "parted lips", "looking at own hand"
]
```

#### 3-3-2. `tsundere` (ERK·LSH)

> v2: `annoyed` / `tsundere` / `pout` 등 추상 concept 태그 대신 **구체 표정·손짓** 위주.

```json
"smata": [
  "sideways glance", "looking to the side", "blush",
  "clenched teeth", "pursed lips"
],
"post_handjob": [
  "sideways glance", "looking to the side",
  "blush", "pursed lips", "biting own lip", "looking at own hand"
]
```

#### 3-3-3. `aloof_tsun` (JGR)

```json
"smata": [
  "closed eyes", "light blush", "parted lips", "quiet"
],
"post_handjob": [
  "looking down", "light blush", "parted lips", "focus"
]
```

#### 3-3-4. `seductive` (HSR·ELA·MMR·NHR·LPS·**APR**)

```json
"smata": [
  "seductive smile", "licking lips", "tongue out",
  "looking down", "half-closed eyes", "confident"
],
"post_handjob": [
  "seductive smile", "licking own lips", "tongue out",
  "half-closed eyes", "playful", "looking down"
]
```

#### 3-3-5. `passionate` (KHR·MIL)

```json
"smata": [
  "open mouth", "blush", "moaning", "heavy breathing"
],
"post_handjob": [
  "open mouth", "blush", "smile", "eager", "looking down"
]
```

#### 3-3-6. `gentle` (ERP)

```json
"smata": [
  "light smile", "closed eyes", "light blush"
],
"post_handjob": [
  "light smile", "looking down", "light blush"
]
```

---

## 4. Phase A-3 — asset_config.json 에 APR 캐릭터 등록

### 4-1. `characters.APR` 엔트리 추가

위치: `asset_config.json` → `characters` 객체 최하단.

```json
"APR": {
  "name": "apiria",
  "base_prompt": "girl, mature female, seductive smile, huge breasts, thick thighs, wide hips, 3::high chroma blue hair, royal blue hair, lapis lazuli colored hair ::, -2::navy hair, indigo hair, colored inner hair, two-tone hair ::, 3::very long hair, long sidelocks, curtained bangs, hair over one eye ::, messy hair, 3::white eyes, half-closed eyes, silver choker ::",
  "outfit_prompt": "3::oversized clothing, loose clothes, white shirt, shirt tucked in, white long blazer, long white tie, sleeves past fingers, white short shorts ::, -3::cleavage, unbuttoned shirt ::",
  "nude_prompt": "nude, huge breasts, thick thighs, wide hips, silver choker",
  "negative_prompt": "navy hair, indigo hair, colored inner hair, two-tone hair, cleavage, unbuttoned shirt"
}
```

**주의 포인트**:
- `base_prompt` 와 `outfit_prompt` 분리 → NSFW 씬에서 `outfit_prompt` 무시하고 `nude_prompt` 병합하는 기존 패턴 따라감
- `silver choker` 는 `base_prompt` 에 포함 → 옷을 벗어도 초커는 유지 (기존 HSR/ELA 패턴과 동일)

### 4-2. `character_scene_overrides.APR` 추가

라이브씬(93/96) 전용 override — 다른 캐릭터 패턴 참조하여 아피리아에 어울리는 포즈.

```json
"APR": {
  "93": {
    "female_prompt": "on stage, concert, spotlight, crowd silhouette, bokeh, face focus, seductive smile, hair flip, confident, half-closed eyes, mic in hand, performing"
  },
  "96": {
    "female_prompt": "casual, relaxed, cafe, window light, seductive smile, hand on own cheek, sleeves past fingers"
  },
  "remove_tags": [""]
}
```

_(93/96 라이브씬은 Danbooru 검수 예외 — 다른 캐릭터 override 패턴 모방)_

---

## 5. Phase A-4 — character_pose_overrides.json 에 APR 추가 (**표정 변주 스크립팅**)

### 5-1. 핵심 설계 원칙 (v2 — 사용자 피드백 반영)

> **문제**: seductive 아키타입 climax 기본 pose와 APR override 가 겹치면 단순 가중치(1.5)로는 `seductive smile`/`confident`/`half-closed eyes` 같은 **평상시 표정 태그**를 완전히 밀어내지 못할 수 있음.
>
> **해결 (사용자 확정)**: 겹치는 태그는 **가중치 2 이상**을 부여해 NAI 프롬프트 우선순위를 명확히 확정. 평상시는 아키타입 기본값을 그대로 쓰고, climax 에서만 `2::...::` 그룹으로 **표정 강제 교체**.

**가중치 2+ 효과**:

- NAI v4에서 2.0+ 는 거의 "반드시 반영" 수준의 강도 (부정 가중치 `-2::` 와 대칭)
- `seductive smile` / `confident` 같은 평상시 태그와 **명시적 경쟁 → 승리** 보장
- 1.5 는 은은한 혼합, 2.0+ 는 결정적 교체 — climax의 "격변" 시그니처에 적합

### 5-2. APR overrides 상세

```json
"APR": {
  "_note": "아피리아 — 여유로운 seductive (sleeves past fingers 시그니처). Non-climax 씬에서는 seductive smile·confident·half-closed eyes 유지. Climax 씬에서는 가중치 2+ 그룹으로 ahegao/fucked silly/torogao/heart-shaped pupils/tongue out/open mouth 를 강제 발동하여 평상시 표정을 완전히 덮어씀.",

  "_rule": {
    "평상시": "아키타입(seductive) 기본 pose 그대로 — override 없음 또는 최소 (sleeves past fingers 등 시그니처 소품만 추가)",
    "격변_가중치2": "climax 씬 (키에 _climax 포함) OR 씬 번호 52/54/56/58/60/62/66/71/73/75/81/83 → 2::ahegao, fucked silly, torogao, heart-shaped pupils, tongue out, open mouth:: 그룹으로 기본 표정 덮어씀"
  },

  "missionary": ["sleeves past fingers"],
  "missionary_climax": ["2::ahegao, fucked silly, torogao, heart-shaped pupils, tongue out, open mouth::", "tears"],

  "cowgirl": ["hair flip", "sleeves past fingers"],
  "cowgirl_climax": ["2::ahegao, fucked silly, torogao, heart-shaped pupils, tongue out, open mouth::", "tears"],

  "doggystyle": ["looking back", "ass"],
  "doggystyle_climax": ["2::ahegao, fucked silly, torogao, heart-shaped pupils, tongue out::", "looking back"],

  "spooning_climax": ["2::torogao, heart-shaped pupils, tongue out, open mouth::", "looking back"],
  "fullnelson_climax": ["2::ahegao, fucked silly, torogao, heart-shaped pupils, tongue out, open mouth::", "arms up"],
  "anal_climax": ["2::fucked silly, torogao, heart-shaped pupils, tears::", "arched back"],

  "fellatio_pov": ["eye contact", "sleeves past fingers"],
  "paizuri": ["sleeves past fingers", "grabbing own breast"],

  "facial": ["2::torogao, heart-shaped pupils, tongue out, open mouth::"],

  "post_handjob": ["cum in sleeves", "shushing", "one finger on lips", "sleeves past fingers", "half-closed eyes"]
}
```

**주요 포인트**:

- **평상시 override 최소화**: seductive 아키타입 기본 pose(`seductive smile`/`half-closed eyes`/`confident` 등)를 그대로 사용하고 `sleeves past fingers` 시그니처만 추가. Override 충돌 없음.
- **Climax 가중치 2+**: 기본 seductive_climax 에 이미 있는 `heart-shaped pupils`/`tongue out`/`open mouth` 를 **재명시하며 2::로 승격** → 겹침 발생 시에도 확실히 적용. `ahegao`/`fucked silly`/`torogao` 는 기본에 없던 강도 높은 태그 — 동일 그룹으로 2::.
- **`post_handjob` APR 전용**: `cum in sleeves` + `shushing` + `one finger on lips` + `sleeves past fingers` (사용자 요청 2-1)
- **시그니처 `sleeves past fingers` 활용**: `paizuri` / `fellatio_pov` / `post_handjob` 에 명시 → 옷소매로 덮인 손이 시그니처 연출

---

## 6. Phase A-5 — 이미지 생성

### 6-1. 샘플 생성 (사용자 검수용)

```bash
cd tools
python asset_generator.py --char APR --scene 1,910,911,51,52,37,38,97,98 --limit 1
```

- 1 (neutral portrait), 910 (key visual), 911 (thumbnail) → 외모 검증
- 51/52 (missionary/climax) → 표정 변주 검증 (평상시 vs 격변)
- 37/38 (handjob) → 기본 seductive 유지
- 97/98 (신규 스마타/핸드잡 후) → 신규 체위 + cum in sleeves 검증

### 6-2. 사용자 피드백 후 본 배치

- 21코드 × 표정/포즈 변형 ≈ 314장 + NSFW 확장 + 검열 배치

---

## 7. 연쇄 영향 체크리스트 (CLAUDE.md 규칙 준수)

수정 예정 파일별 **참조하는 하위 파일** 전수 조사:

| 수정 파일 | 참조하는 곳 (grep으로 확인 예정) | 조치 |
|---|---|---|
| `tools/asset_config.json` | `tools/asset_generator.py`, `tools/extract_char_prompts.py`, `tools/utils.py` (ALL_CHARS) | ALL_CHARS 에 `APR` 추가 필요 |
| `tools/character_pose_overrides.json` | `tools/asset_generator.py` | 자동 로드 — 추가만 |
| (Phase D 이후) `src/data/characters.js` | CharCarousel, CharDetail, Home, ModeAudition 등 17곳 | characters 배열 말미에 push |
| (Phase D) `src/utils/cdn.js` | `ASSET_VERSION` +1 필수 (R2 업로드 시) | 업로드 직후 bump |

---

## 8. 사용자 피드백 반영 현황 (v2, 2026-04-18)

| # | 항목 | 결정 |
|---|---|---|
| 1 | Danbooru 검수 실행 | ✅ **YES** — 바로 진행. 검수 대상: `asset_config.json` 씬 + `character_pose_overrides.json` pose 전수 (라이브씬 93-96 및 아피리아 본체 프롬프트 제외) |
| 2 | 신규 체위 번호 97/98 | ✅ **확정** |
| 3 | 아키타입별 pose 제안(§3-3) | ✅ 기본 OK — 단, `annoyed`/`tsundere`/`pout` 등 추상 감정 태그 제거 (§3-3-2 tsundere 수정 완료) |
| 4 | APR climax 표정 가중치 | ✅ **가중치 2 이상**으로 승격 (§5-2 완료). 겹치는 태그는 2:: 로 명시 → 평상시 seductive_smile 확실히 덮어씀 |
| 5 | 소속 기획사 | 🟡 **보류** — §11 "기획사 고민" 별도 섹션으로 정리 |
| 6 | 관계 설정 | ✅ **라피스(LPS)와 자매** 확정 |

---

## 9. Phase B 이후 예고 (현재 미승인 — A 완료 후 별도 승인 단계)

### Phase B 챗봇 로어북 예정 파일

```
docs/prompts/json/캐릭터/
  ├─ 아피리아_EN.json                 (본체)
  ├─ 아피리아_트리거_EN.json          (호출)
  ├─ 아피리아_초기_EN.json            (fav 10-39)
  ├─ 아피리아_심화_EN.json            (fav 60-99)
  ├─ 아피리아_과거_EN.json
  ├─ 아피리아_위기_EN.json
  ├─ 아피리아_라피스_자매_EN.json     ← ✅ 사용자 확정 (LPS)
  └─ 라피스_아피리아_자매_EN.json     ← 양방향 (LPS → APR 방향도 기존 패턴상 필요)
```

**자매 설정 해석 포인트** (Phase B-3에서 본격 설계, 여기는 힌트):

- LPS "라피스(lapis)" = 청금석 → 짙은 파랑
- APR "아피리아(Apiria = Sapphire - S)" = 사파이어 → 밝은 로열블루
- **자매성**: 둘 다 파란 보석 어원 + 파란 머리 공유 → 시각적 자매 설정 자연스러움
- LPS 성격(쿨+여유+V사인 장난) ↔ APR 성격(여유 매혹+평상시 심플+climax 격변) → **여유로운 언니-여유로운 동생** 혹은 **낮은 텐션의 자매 듀오**. 나이/순서는 Phase B에서 결정.

### Phase D 사이트 시네마틱 인트로 (선택적)

기존 Intro 스타일(cutaway/sunrise/fog/wind/pageFlip/flash/ripple/glitch) 중 "sleeves past fingers + 은은한 관능" 컨셉에 어울리는 후보:

- **flash** (MMR) — 카메라 플래시 후 여유 미소 드러남 (아피리아 성격과 호응)
- **ripple** (MIL) — 물결 확산, 은은한 감각 (장발/실눈 컨셉)
- **신규 style** — `sleeves_reveal` (소매 아래서 드러나는 손의 공허함 + 쉿 제스처)

→ Phase D 진입 시 별도 결정

---

## 10. 변경 이력

- 2026-04-18 00:XX — 최초 작성. CDN=APR, 아키타입=seductive, 전 아키타입 97/98 확장, 표정 변주 스크립팅안 초안.
- 2026-04-18 01:XX — v2 사용자 피드백 반영: (1) 검수 범위 = 씬+pose 전수 (본체 프롬프트 제외), (2) tsundere pose에서 annoyed/tsundere/pout 제거 → 구체 표정/손짓, (3) climax 가중치 1.5 → 2.0+ 로 승격, (4) 라피스 자매 설정 확정, (5) 기획사 §11 보류 섹션 추가.
- 2026-04-18 02:XX — 1차 검수 완료 (OK 254 / LOW 4 / GHOST 85). §12 GHOST 교체 매핑표 작성. B(mutual#)/C(검열) 보존 지시에 따라 **교체 대상 80개** (A 추상 30 + D 복합어 35 + E 단문자 15).

---

## 12. GHOST 교체 매핑표 (사용자 지시: A/D/E 전부 교체, B/C 보존)

### 12-1. 교체 원칙

- **대체 태그도 Danbooru 검수 필수** — 매핑 후 `c:/tmp/preaudit_replacements.py` 로 Pre-audit → 통과한 태그만 확정
- **추상 분위기 태그 완전 제거** — `expression`, `focus`, `quiet`, `seductive`(단독), `provocative`, `dominant`, `playful`, `dedication` 등 모호 concept은 그림체 오염원 → 구체 표정/손짓 + 필요 시 삭제
- **기존 OK 254개 안에서 우선 선택** — Pre-audit 부담 최소화
- **NAI V4 `source#`/`target#` 문법은 그대로 유지** (B 패턴 불변)

### 12-2. 패턴 A — 추상 감정/상태 (30개)

| GHOST | 대체 | 비고 |
|---|---|---|
| `annoyed smile` | `clenched teeth, light smile` | |
| `annoyed gaze` | `clenched teeth, sideways glance` | |
| `annoyed glare` | `frown` | |
| `grumpy expression` | `frown` | |
| `grumpy smile` | `frown, light smile` | |
| `angry embarrassment` | `blush, frown` | |
| `embarrassed smile` | `blush, light smile` | |
| `muffled annoyance` | `face in pillow, clenched teeth` | |
| `muffled complaints` | `biting own lip` | |
| `silent endurance` | `clenched teeth, closed mouth` | |
| `silent orgasm` | `closed mouth, trembling` | |
| `small reaction` | `parted lips, half-closed eyes` | |
| `lost in pleasure` | `half-closed eyes, open mouth` | |
| `light tears` | `tears` | 축소 |
| `faint smile` | `light smile` | 정규화 |
| `disdainful` | `sideways glance, half-closed eyes` | |
| `dedication` | ❌ 삭제 | 순수 분위기 태그 |
| `expression` | ❌ 삭제 | 순수 분위기 태그 (기존 씬 87 사용) |
| `quiet` | `closed mouth` | |
| `playful` | `tongue out, smile` | |
| `provocative` | `smirk, tongue out` | |
| `relaxed` | `closed eyes, light smile` | |
| `focus` | `half-closed eyes, looking down` | |
| `focused` | `half-closed eyes, looking down` | |
| `dominant` | `smirk, half-closed eyes` | |
| `seductive` (단독) | `seductive smile` | `seductive_smile`은 OK |
| `endurance` | `clenched teeth` | |
| `eager` (LOW 13) | `open mouth, smile` | LOW 도 교체 |
| `reluctant` (LOW 37) | `frown, closed mouth` | LOW 도 교체 |

### 12-3. 패턴 D — 공백/복합어 (35개)

| GHOST | 대체 | 비고 |
|---|---|---|
| `looking at the viewer` | `looking at viewer` | 오타 교정 |
| `arms above head` | `arms up` | 표준형 |
| `face focus` | ❌ 삭제 | `face` 단독도 GHOST |
| `face to face` | `eye contact` | |
| `faceless men` | `faceless male` | 표준형 |
| `female focus` | `1girl` | 의미 동등 |
| `finger in pussy` | `fingering` | 표준형 |
| `grabbing another's breasts` | `grabbing another's breast` | 단수형 시도 (Pre-audit) |
| `head on lap` | `lap pillow` | 이미 OK 확인됨 |
| `head pat` | `hand on another's head` | |
| `holding popcorn` | ❌ 삭제 | |
| `holding shopping bag` | `shopping bag` | Pre-audit |
| `knees together` | `knees together feet apart` | 표준형 (Pre-audit 39160 확인됨) |
| `licking own lips` | `licking lips` | |
| `lying on back` | `on back` | |
| `lying on bed` | `on bed` | |
| `lying on pillow` | `on pillow` | Pre-audit |
| `sitting on bed` | `sitting, on bed` | 조합으로 분해 |
| `water droplets` | `water drop` | Pre-audit |
| `white bed` | `white sheets` | Pre-audit |
| `bathroom stall` | `bathroom` | 축소 |
| `cum on face` | `facial` | alias 가능성 |
| `cold face` | `expressionless` | |
| `detailed face` | ❌ 삭제 | 분위기 태그 |
| `formal` | `formal clothes` | (scene 87 text: press conference 문맥) |
| `elegant` | ❌ 삭제 | 분위기 태그 |
| `very sweaty` → 유지 (OK 10300) | — | 이건 OK라 교체 불필요 |
| `sharp details` | ❌ 삭제 | quality 태그, 지울 것 |
| `detailed face` | ❌ 삭제 | 중복 |
| `clothed` | `clothed sex` | 문맥상 이미 있음 |
| `clothed paizuri` | `paizuri, clothed sex` | 분해 |

### 12-4. 패턴 E — 단일 문자/NAI-only (15개)

| GHOST | 대체 | 비고 |
| --- | --- | --- |
| `V` | `v` | 소문자 |
| `5-fingers` | ❌ 삭제 | |
| `nsfw` | ❌ 삭제 | |
| `abhorrent` | ❌ 삭제 | |
| `sharp details` | ❌ 삭제 | 이미 A에 없음 — E로 이동 |
| `very aesthetic` | ❌ 삭제 | |
| `astride` | `straddling` | Pre-audit |
| `bar` | `bar (place)` 또는 삭제 | 문맥 확인 필요 |
| `carried` | `princess carry` | Pre-audit |
| `chokehold` | `hand on another's neck` | |
| `grip` | ❌ 삭제 | 문맥 애매 |
| `hand` | ❌ 삭제 | 너무 일반 |
| `live broadcast` | `broadcast` | Pre-audit |
| `press conference` (LOW 49) | 유지 | LOW지만 press conference는 실제 정식 태그로 사용됨 |
| `shower` | `showering` | |
| `straight on` | `from front` | Pre-audit |
| `behind her` | ❌ 삭제 | 모호 (`from behind`는 이미 사용 중) |
| `reaching one hand towards another's pussy` | `fingering` | 축소 |
| `fingers in another's pussy` | `fingering` | 축소 |

### 12-5. Pre-audit 결과 (완료 2026-04-18)

신규 조회 21개 중 **17 OK / 4 GHOST** → 4개 재매핑:

| 신규 GHOST | 재매핑 | 근거 |
| --- | --- | --- |
| `broadcast` | ❌ 삭제 | svg-stream 씬에 `live`/`monitor`/`screen` 이미 존재 |
| `from front` | ❌ 삭제 | 정면 앵글은 기본값 |
| `peace sign` | `v` | `v`는 OK 213028 |
| `white sheets` | `bed sheet` | OK 116178 (색상 제거) |

§12-3 `white bed` → `bed sheet`, §12-4 `live broadcast` → ❌삭제, `straight on` → ❌삭제 로 조정.

→ 모든 대체 태그 OK 확정 → §12-6 치환 실행.

### 12-6. 작업 결과 (2026-04-18 완료)

| 라운드 | 변경 | OK | LOW | GHOST |
| --- | ---: | ---: | ---: | ---: |
| 1차 audit (baseline) | — | 254 | 4 | **85** |
| 1차 치환 | 240 | — | — | — |
| 2차 audit (누락 발견) | — | 269 | 2 | **12** |
| 2차 패치 치환 (누락 7개) | 17 | — | — | — |
| **3차 audit (최종)** | — | **270** | **2** | **5** |

**최종 GHOST 5개 = 의도된 보존분**:

- `mutual# 69`, `mutual# clothed sex`, `mutual# oral` (B 패턴 — NAI 멀티캐릭터 문법)
- `white censored penis`, `white censored pussy` (C 패턴 — NAI 검열 규칙)

**2차 패치 누락분 (최초 매핑에서 놓쳤던 7개)**:

- `aggressive kiss` → `french kiss` (20515)
- `anticipation` → ❌삭제 (분위기 태그)
- `arms crossed` → `crossed arms` (112202)
- `ass up` → `top-down bottom-up` (26386)
- `eyes closed` → `closed eyes` (962k)
- `grumbling` → ❌삭제 (분위기 태그)
- `indignant` → ❌삭제 (분위기 태그)

**부산물**:

- 백업: `tools/asset_config.json.bak_20260418_184933`·`_185410`, `tools/character_pose_overrides.json.bak_20260418_184933`·`_185410`
- 리포트: `tools/_apiria_tag_audit.md` + `.json`
- 치환 스크립트: `c:/tmp/apply_ghost_replacements.py` (매핑 보존)

→ **Phase A-1 완료**. Phase A-2 (씬 97/98 추가 + 아키타입 pose 확장) 진행 가능.

---

## 11. 🟡 소속 기획사 고민 (보류 — 별도 결정 필요)

### 11-1. 제약 조건

- **APEX** (현재 5명): SY, NHR, JSH, ERK, LSH — 서사상 톱티어, 더 이상 추가하면 밸런스 무너짐
- **Blue Moon** (현재 3명): HSR, KHR, ERP — 대표 겸임 아이돌 구도 이미 있음. 추가 가능하나 신인급 포지션만 여유
- **PRISM** (현재 3명): ELA, MMR, MIL — **오디션 통과자 전용** 컨셉. 아피리아는 "오디션에서 데려온" 서사 아님 → 원천적 불일치
- **Route 0** (현재 3명): JGR, NIA, RAY — 저항·언더그라운드 색채. 아피리아의 "여유로운 매혹" 톤과 이질적
- **LPS** 소속: 확인 필요 (자매 설정 감안하여 같은 소속 검토 가능성)

### 11-2. 외부 강사/프리랜서 안 (사용자 제시)

> "외부 강사 또는 프리랜서이지만 명성은 매우 높다는 느낌으로 가야할까?"

**장점**:

- 기존 기획사 밸런스 침범 X
- "어디에도 속하지 않지만 누구나 아는" 독립적 포지션 → **높은 위치에 두고 싶다** 는 사용자 의도와 호응
- 에덴챗 챗봇 서사에서 "{{user}}가 어느 기획사에 속하든 만날 수 있는 인물" 로 작동 가능 → 모드 독립성 높음

**단점**:

- 소개 페이지/사이트 UI(기획사별 라인업 섹션)에서 분류 애매
- 자매 설정한 LPS와 기획사 이질성 발생 가능 (LPS 소속 확인 필요)

### 11-3. 대안 (브레인스토밍)

| 안 | 요지 | 비고 |
| --- | --- | --- |
| A | **프리랜서 + 명성** | 어느 기획사에도 속하지 않는 전설급 보컬/퍼포머. "라이브 한 번에 수억" 수준 단가. |
| B | **외부 강사** | 프라임시티 아카데미 또는 APEX/BlueMoon에 **외부 컨설턴트**로 드나듦. 기획사 분류는 느슨하게 "APEX 자문" 표기. |
| C | **해외 기획사 소속** | 한국 밖 (일본/미국/유럽) 메이저 소속으로, 프라임시티에 가끔 원정. 프리랜서 장점 + 소속은 있음. |
| D | **LPS 소속사로 합류** | LPS 소속 확인 후, 같은 소속으로 자매 서사 강화. 밸런스 문제는 LPS 소속사에 달림. |
| E | **독립 레이블 창립** | 자매(LPS+APR) 2인 레이블. 제일 희귀하지만 세계관 확장 필요. |

### 11-4. 다음 단계

- LPS 소속부터 확인 → 자매 서사와 기획사 정합성 교차 검증
- 후보 A~E 중 사용자 판단 → Phase B 로어북 작성 전까지 확정 필요 (B 이후는 기획사 기반 서사 필요)

_이 섹션은 Phase A (이미지) 동안에는 차단 요소 아님 — 이미지 생성에는 기획사 정보 불필요._
