# 이미지 에셋 확장 계획

> **목표**: 캐릭터당 에셋 수 확대 → 15명 × 107+ = **1,600장 이상**
> **현재**: 75장면 + 4SVG + 1thumb + 1profile + 1sign = 82/char × 15 = 1,230장

---

## 1. 에셋 수 계산

### 현재 (82/char)
| 유형 | 코드 | 개수 |
|---|---|---|
| 감정 | 1-8 | 8 |
| neutral | 9 | 1 |
| 일상 | 10-18 | 9 |
| NSFW 비삽입 | 20-42 | 23 |
| NSFW 삽입 | 50-67 | 18 |
| NSFW 착의 침실 | 70-78 | 9 |
| NSFW 착의 화장실 | 80-86 | 7 |
| SVG | 901-904 | 4 |
| 키비주얼 (챗봇 미포함) | 910 | (제외) |
| 썸네일 | 911 | 1 |
| profile | - | 1 |
| sign | - | 1 |
| **소계** | | **82** |

### 확장 후 (107/char)
| 유형 | 코드 | 개수 | 변경 |
|---|---|---|---|
| 감정 | 1-9 | 9 | (유지) |
| 일상 | 10-19 | 10 | **+1** (19=sleeping) |
| NSFW 비삽입 | 20-49 | 30 | **+7** (43-49 추가) |
| NSFW 삽입 | 50-69 | 20 | **+2** (68-69 추가) |
| NSFW 착의 침실 | 70-79 | 10 | **+1** (79 추가) |
| NSFW 착의 화장실 | 80-86 | 7 | (유지) |
| NSFW 확장 (섹스웅 패턴) | 87-92 | 6 | **+6** (신규) |
| 라이브씬/무대씬 | 93-96 | 4 | **+4** (신규) |
| SVG | 901-904 | 4 | (유지) |
| 썸네일 | 911 | 1 | (유지) |
| profile | - | 1 | (유지) |
| sign | - | 1 | (유지) |
| **소계** | | **107** |

**107 × 15 = 1,605장**

---

## 2. 신규 장면 상세

### [A] 빈 번호 채움 (11개 → 코드 1-86 연속)

| 코드 | 이름 | 분류 | 프롬프트 방향 |
|---|---|---|---|
| 19 | sleeping | 일상 | `bedroom, sleeping, eyes closed, on bed, peaceful, blanket` |
| 43 | lap-pillow | 비삽입 로맨틱 | `lap pillow, thighs, sitting, smile, looking down, pov` |
| 44 | hug-from-behind | 비삽입 로맨틱 | `hug from behind, mutual#, blush, closed eyes` |
| 45 | forehead-kiss | 비삽입 로맨틱 | `forehead kiss, close-up, closed eyes, gentle` |
| 46 | neck-kiss | 비삽입 로맨틱 | `neck kiss, collarbone, blush, closed eyes, from side` |
| 47 | body-worship | 비삽입 분위기 | `from above, lying, on bed, nude, arms above head, eye contact` |
| 48 | shower-together | 비삽입 분위기 | `shower, bathroom, wet body, wet hair, steam, nude, from side` |
| 49 | sixty-nine | 비삽입 상호 | `sixty-nine, from side, bedroom, wet body` |
| 68 | standing-sex | 삽입 | `standing sex, against wall, leg lift, from side, wet body` |
| 69 | standing-sex-climax | 삽입 절정 | `standing sex, against wall, leg lift, cum in pussy, overflow, ahegao` |
| 79 | clothed-spooning-bedroom | 착의 | `bedroom, from side, spooning, clothed sex, wet body` |

### [B] NSFW 확장 — 섹스웅 패턴 (6개, 코드 87-92)

> 섹스웅.json에서 영감: 전/약/강/사정/후 5단계 중 기존에 없는 **전(imminent)** + **후(afterglow spread)** 패턴 추가

| 코드 | 이름 | 프롬프트 방향 |
|---|---|---|
| 87 | imminent-missionary | `on bed, lying, missionary, imminent penetration, just the tip, penis on stomach, pussy juice, seductive smile, looking at viewer` |
| 88 | imminent-cowgirl | `cowgirl position, imminent penetration, just the tip, looking at penis, pussy juice, hands on stomach, tongue out` |
| 89 | imminent-doggystyle | `from behind, doggystyle, imminent penetration, just the tip, penis, pussy juice, embarrassed, ass focus` |
| 90 | spread-after-missionary | `from above, lying, on back, spread pussy, cum in pussy, cum overflow, very sweaty, wet hair, seductive smile, heart` |
| 91 | spread-after-cowgirl | `cowgirl position, spread pussy, cum in pussy, cum overflow, looking down, seductive smile, very sweaty, arched back` |
| 92 | spread-after-doggystyle | `from above, doggystyle, spread pussy, ass focus, cum in pussy, cum overflow, very sweaty, wet hair, smile` |

### [C] 라이브씬/무대씬 (4개, 코드 93-96)

> **핵심**: "live" 대신 **무대/공연/작업** 키워드 사용 → 프로듀서/작곡가/배우 등 다른 직업군에도 적용 가능
> 장그루(JGR)는 이미 라이브씬 보유 → 패스 (기존 에셋 유지)
> 각 캐릭터 포지션에 맞는 무대 장면

| 코드 | 이름 | 공통 프롬프트 | 캐릭터별 오버라이드 |
|---|---|---|---|
| 93 | stage-solo | `spotlight, stage, microphone, performing, dynamic pose, dramatic lighting, crowd silhouette` | 포지션별 차별화 |
| 94 | stage-group | `stage, formation, group performance, synchronized, dramatic lighting, concert` | 공통 |
| 95 | recording-studio | `recording studio, microphone, headphones, monitor screen, soundproof room, focused, professional` | 포지션별 차별화 |
| 96 | backstage | `backstage, mirror, vanity, preparing, costume, nervous, determination` | 공통 |

**캐릭터별 93번(stage-solo) 오버라이드 방향**:

| 캐릭터 | 포지션 | 93번 오버라이드 키워드 |
|---|---|---|
| SY (서윤) | 아이돌 정상 | `elegant, center stage, confident, arms spread, wind effect` |
| NHR (나하린) | 프로듀서/설계자 | `conducting, command, overlooking stage, silhouette, backlit` |
| JSH (진시혁) | 수석 프로듀서 | `judging, arms crossed, sitting, evaluating, serious, clipboard` |
| ERK (에리카) | 프로듀서 | `headphones, mixing console, focused, monitor glow, serious` |
| LSH (이서하) | 작곡가 | `piano, composing, sheet music, dimly lit room, contemplative, glasses` |
| HSR (한소리) | 기획사 대표 | `phone call, documents, desk, exhausted, determined, dark circles` |
| KHR (강하람) | 보컬+댄스+연기 | `dancing, dynamic pose, spotlight, sweat, passionate, powerful` |
| JGR (장그루) | 보컬+작곡 | **(패스 — 기존 라이브씬 유지)** |
| MIL (밀라) | 자유 보컬 | `guitar, singing, casual, rooftop, wind, carefree, smile` |
| ELA (엘라) | 비주얼+댄스 | `runway, walking, confident, hair flip, glamorous, flash photography` |
| MMR (미모리) | 인플루언서+보컬 | `selfie pose, ring light, wink, peace sign, energetic, streaming` |
| HSE (하시은) | 안정형 올라운더 | `practice room, mirror, stretching, focused, ballet barre, determined` |
| NIA (니아) | 성장형 보컬 | `small stage, nervous, gripping microphone, trembling, first performance` |
| RAY (레이) | 댄스+언더독 | `street dance, breaking, dynamic, low angle, prosthetic leg visible, powerful` |
| LPS (라피스) | 멀티/탐색형 | `DJ booth, turntable, headphones, neon lights, genre mixing, experimental` |

---

## 3. 수정 대상 파일

### [1] `tools/asset_config.json`
- `scene_variant_map`: 코드 19, 43-49, 68-69, 79, 87-96 추가
- `scene_captions`: 각 코드의 name, width, height, female_prompt, male_prompt 추가
- `character_scene_overrides`: 코드 93(stage-solo)에 캐릭터별 오버라이드 추가

### [2] `docs/prompts/json/메인_프롬프트_EN.json`
- `image.db.감정`: 현행 유지 (1-8, 9는 neutral로 별도)
- `image.db.일상`: `19=sleeping` 추가
- 로어북 내 에셋 범위 설명 업데이트

### [3] `docs/prompts/json/이미지_NSFW_EN.json`
- `db.nsfw_비삽입`: 43-49 추가
- `db.nsfw_삽입`: 68-69 추가
- `db.nsfw_착의_침실`: 79 추가
- `db.nsfw_확장`: 87-92 추가 (신규 카테고리)

### [4] `workers/svg-tablet.js` + `src/data/svgTemplates.js`
- IMAGE OUTPUT SYSTEM: 수치 업데이트
  - 장면 75→96 (코드 1-96, 빈 번호 없음)
  - 총합: 96 + 4(SVG) + 1(thumb) + 1(profile) + 1(sign) = **103/char**
  - Scene bar 비율 재계산
- 15명 × 107 = 1,605장 (키비주얼 제외, JGR 라이브씬은 기존 에셋 포함)

### [5] `tools/asset_generator.py`
- `generation_state.json` 리셋 또는 신규 코드만 생성하도록 처리
- JGR 93번은 건너뛰기 (기존 에셋 유지)

### [6] `CLAUDE.md`
- 작업 현황 업데이트

---

## 4. 프롬프트 작성 워크플로우

> 프롬프트 품질이 이미지 품질에 직결. 유저가 Danbooru 태그 검색 사이트를 통해 검증.

### 단계
1. **초안 작성** — Claude가 기존 프롬프트 패턴 + 섹스웅.json 스타일로 초안
2. **태그 검증** — 유저가 Chrome Claude + Danbooru 태그 사이트에서 태그 유효성 확인
3. **asset_config 반영** — 검증된 프롬프트를 config에 추가
4. **테스트 생성** — 1-2캐릭터로 샘플 생성 후 품질 확인
5. **전체 생성** — 승인 후 전체 15캐릭터 배치 생성

### 프롬프트 작성 규칙 (기존 패턴 준수)
- 태그 순서: Background & Viewpoint → Pose & Body → Action → Expression
- 가중치는 최소한으로. NAI가 어려워하는 부분에만 사용 (예: `0.6::pregnant::`)
- 남성 파트: 보이면 `boy, black hair, hair over eyes`, POV면 `pov, large penis`
- `target#/source#/mutual#` 상호작용 프리픽스 유지
- `[!]` 구도 경고 주석

---

## 5. 구현 순서

### Phase 1: 프롬프트 초안 (Claude 작성)
- [ ] 빈 번호 11개 프롬프트 초안
- [ ] NSFW 확장 6개 프롬프트 초안 (섹스웅 패턴)
- [ ] 라이브씬 4개 × 15캐릭터 오버라이드 프롬프트 초안

### Phase 2: 프롬프트 검증 (유저 + Danbooru)
- [ ] 유저가 Chrome Claude로 태그 검증/수정
- [ ] 최종 프롬프트 확정

### Phase 3: config + 로어북 수정
- [ ] asset_config.json 업데이트
- [ ] 메인_프롬프트_EN.json DB 업데이트
- [ ] 이미지_NSFW_EN.json DB 업데이트

### Phase 4: SVG + 파이프라인 수정
- [ ] svg-tablet.js 수치 업데이트
- [ ] svgTemplates.js Mirror 동기화
- [ ] CLAUDE.md 업데이트
- [ ] wrangler deploy

### Phase 5: 이미지 생성
- [ ] 신규 코드만 생성 (기존 에셋 보존)
- [ ] 검열 배치 (conf=0.7)
- [ ] CDN 비교 + 업로드

---

## 6. JGR 라이브씬 처리

장그루는 이미 라이브씬이 있으므로:
- 코드 93-96 중 JGR은 **기존 에셋을 해당 코드로 매핑** 또는 **생성 스킵**
- `character_scene_overrides`에서 JGR의 93번을 기존 파일로 포인팅
- 나머지 94-96은 공통 프롬프트로 신규 생성
