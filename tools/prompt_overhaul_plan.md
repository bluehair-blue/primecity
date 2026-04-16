# 프롬프트 대개편 계획서 (v5 — 피드백 4차 반영)

> tools/asset_config.json scenes + characters 수정 | 2026-04-11
> Q&A 통합, 캐릭터 외형 재추출 + 오버라이드 배정 확정

---

## 핵심 원칙

1. **주체/대상 구분**: `source#` / `target#` / `mutual#` 메타태그로 상호작용 태그를 F·M 파트에 정확히 분배
2. **"penis는 항상 male의 것"**: 묘사 주체가 누구든 `penis` 태그는 M파트에 위치 (deepthroat 예외)
3. **POV 기본 원칙**: 3인칭 남성 외형 태그(`1boy, black hair, hair over eyes`) 일괄 제거 → 대부분 POV로 전환
4. **구도 태그는 학습 데이터 관점에서 선택**: `from front`처럼 학습 데이터가 적은 태그는 사용 지양
5. **캐릭터성 반영**: 일부 태그는 캐릭터별 오버라이드로 선택 적용
6. **신체 태그 우선 원칙**: 구도 태그보다 F파트의 신체 부위 태그(`back`, `anal`, `pussy`, `upper body`, `breasts` 등)가 더 중요

---

## 변경 그룹 1 — `penis` 태그 주체/대상 분리

### 1-A. 일반 삽입씬 (51~83 범위)

**규칙**: `penis`는 M파트에만 위치. F파트에서 제거.

### 1-B. imminent 씬 (87, 88, 89) — 주체/대상 명확 구분

| 씬 | 태그 | 주체 | 처리 |
|----|------|------|------|
| 87 | `penis on stomach` | M의 penis가 F의 배 위 | F: `target# penis on stomach`, M: `source# penis on stomach` + `penis` |
| 88 | `looking at penis` | F가 보는 행위 | F: `source# looking at penis`, M: `target# looking at penis` + `penis` |
| 89 | `penis` (weight 블록 내) | M의 것 | M파트로 이동 |

### 1-C. 예외 — deepthroat (씬 35)

`penis`가 F의 입 안 깊이 들어가 **보이지 않는 상태**를 의도.
→ M파트에 `penis` / `large penis` **태그 없음** (유일한 예외)

---

## 변경 그룹 2 — `sex` / `clothed sex` → `mutual#`

**규칙**: F·M **양쪽 파트 모두에** `mutual# sex` / `mutual# clothed sex` 적용

"서로가 서로에게"의 의미이므로 반드시 양쪽 필수.

**대상**: `sex` 보유 삽입씬 전체

---

## 변경 그룹 3 — `cum` 분배 통일

| 태그 유형 | 위치 | 이유 |
|----------|------|------|
| `cum in pussy / ass / mouth` | **F파트** | 결과 상태 |
| `cum on face / body / hair / breasts` | **F파트** | 결과 상태 |
| `overflow` | **F파트** | 결과 상태 |
| `cum`, `precum` | **M파트** | 사출 주체 명확 |

**M파트에 `cum` 추가 필요 씬** (17개):
52, 54, 56, 58, 60, 62, 64, 66, 69, 71, 73, 75, 81, 83, 86
※ 34(fellatio-climax-3rd)는 3인칭 유지 → 기존대로

---

## 변경 그룹 4 — 3인칭 → POV 전환

### 4-A. POV 전환 대상

| 씬 | 이름 | 전환 후 M파트 | 특기사항 |
|----|------|------------|---------|
| 20 | cunnilingus | `pov, source# cunnilingus, source# licking, tongue` | 혀만 pussy에 닿는 구도 유도 |
| 35 | deepthroat | `pov, source# deepthroat, source# grabbing another's head` | penis 태그 **없음** (입안 매몰) |
| 44 | hug-from-behind | 캐릭터성에 따라 POV / 3인칭 | **7-4 참조** (뒤→앞 구도 반전) |
| 48 | shower-together | `pov, close-up` | |
| 51 | missionary-sex | `pov, mutual# sex` | F파트 `pussy, thighs` 보강 |
| 52 | missionary-climax | `pov, mutual# sex, cum` | F파트 신체태그 보강, `from above` 삭제 |
| 53 | doggystyle-sex | `pov, mutual# sex` | **doggystyle = 후배위, F파트 `anal`, `back` 필수** |
| 54 | doggystyle-climax | `pov, mutual# sex, cum` | 상동 |
| 55 | cowgirl-sex | `pov, mutual# sex` | F파트 `cowgirl position` + `girl on top` 병용 필수 |
| 56 | cowgirl-climax | `pov, mutual# sex, cum` | 상동 |
| 61 | anal-sex | `pov, mutual# sex` | `from behind` 유지, F파트 `back` 필수 |
| 62 | anal-sex-cum | `pov, mutual# sex, cum` | 상동 |
| 68 | standing-sex | `pov, mutual# sex` | **기본: standing anal 후배위**. `anal`, `from behind`, `back` 추가. 캐릭터 오버라이드로 현행 유지(leg lift) 가능 |
| 69 | standing-sex-climax | **3인칭 유지** | **측위로 재정의** → `from side` 유지, M파트 `1boy`만 유지(색상/헤어 제거) |
| 70 | clothed-missionary-bedroom | `pov, mutual# clothed sex` | F파트 신체+성기 태그 보강 |
| 71 | clothed-missionary-climax | `pov, mutual# clothed sex, cum` | `from above` 삭제, F파트 신체+성기 태그 보강 |
| 74 | clothed-cowgirl | `pov, mutual# clothed sex` | `cowgirl position` + `girl on top` 병용 |
| 75 | clothed-cowgirl-climax | `pov, mutual# clothed sex, cum` | 상동 |
| 80 | clothed-doggystyle-toilet | `pov, mutual# clothed sex` | `anal`, `back` 추가 |
| 81 | clothed-doggystyle-climax-toilet | `pov, mutual# clothed sex, cum` | 상동 |

### 4-B. POV 전환 제외 (3인칭 유지)

| 씬 | 이름 | 이유 |
|----|------|------|
| 33, 34 | **fellatio-3rd, fellatio-climax-3rd** | **이름 자체가 3인칭 의도** |
| 39, 40 | rimjob, rimjob-cum | 예외 |
| 49 | 69 | 예외 |
| 57, 58 | spooning-sex/climax | 측위 |
| 59, 60 | full-nelson, full-nelson-climax | 다리 들기 |
| 65, 66 | pregnant-sex/cum | 측위 |
| 69 | standing-sex-climax | **측위로 재정의** |
| 72, 73 | clothed-fullnelson-bedroom | 다리 들기 |
| 79 | clothed-spooning-bedroom | 측위 |
| 82, 83 | clothed-fullnelson-toilet | 다리 들기 |

### 4-C. 3인칭 유지 씬의 M파트 외형 태그 처리

**규칙**: 3인칭 유지 씬이라도 외형 태그(`black hair, hair over eyes`)는 **일괄 제거**. **`1boy`만 유지**하여 성별 구분.

예외: 39, 40(rimjob)은 `1boy, all fours, ass up, hetero` 유지 (포지션 지정 필요)

---

## 변경 그룹 5 — 구도 태그 정책 (통합)

| 태그 | 정책 | 근거 |
|------|------|------|
| `from front` | **일괄 삭제** | 학습 데이터 적음 |
| `from side` | **일괄 삭제** | 씬 69만 예외 |
| `from above` | **일괄 삭제** | 불필요 |
| `from behind` | **후배위/애널 씬에서 유지** + F파트 `back` 필수 병용 | 항문/등 가시화 |

### 세부 적용

- **정상위 `from above`** (52, 71): 삭제
- **펠라치오 `from above`** (76, 77, 84, 85): 삭제
- **기승위 `from front`** (55, 56, 74, 75): 삭제
- **포옹 `from behind`** (44): 삭제 (7-4 참조)
- **후배위 `from behind`** (53, 54, 61, 62, 68, 80, 81): **유지** + `back` 병용

### 구도 태그 우선순위

> 구도 태그보다 **여성 신체 부위 태그**(`back`, `anal`, `pussy`, `upper body`, `breasts` 등)와 **행동 태그**가 더 중요.
> 해당 구도에서 **보이지 말아야 할 요소가 없는 것**이 관건.

---

## 변경 그룹 6 — 씬별 개별 특수 처리

### 6-1. kiss (씬 21, 22) — 완전 POV

- **F파트**: `close-up, face focus, detailed face, 2::mutual# kiss::`
- **M파트 신설**: `pov` (외형 태그 절대 금지)

### 6-2. cunnilingus (씬 20) — POV 전환 + tongue/licking

- **F파트 추가**: `target# cunnilingus`
- **M파트 교체**: `pov, source# cunnilingus, source# licking, tongue`
- 혀만 pussy에 닿도록 유도

### 6-3. deepthroat (씬 35) — POV 전환, 특수 규칙

- **F파트 수정**:
  - 삭제: `from side`, `crying with eyes open`
  - 추가: `teardrop`, `target# deepthroat`, `target# grabbing another's head`
- **M파트 교체**: `pov, source# deepthroat, source# grabbing another's head`
- **`penis` / `large penis` 태그 절대 추가 금지** (입안 매몰로 불가시)

### 6-4. hug-from-behind (씬 44) — 구도 반전, 캐릭터성 의존

**기본 방향**: POV (여성이 앞에서 M을 안는 구도)

#### POV 버전 (기본)

- **F파트 재구성**:
  - 삭제: `hug from behind`
  - 추가: `reaching hand toward viewer`, `upper body`, `source# hug`
  - **하체 태그 절대 금지**
  - 유지: `blush, closed eyes, smile`
- **M파트 신설**: `pov, target# hug`

#### 3인칭 변형 (캐릭터성에 따라 오버라이드)

일부 캐릭터는 3인칭이 어울림 → 캐릭터 오버라이드로:

- **양쪽 파트에 `mutual# hug` 추가**
- **F파트**: `arms around neck` (3인칭 전용 태그)
- **M파트**: `1boy` 유지, 외형 색상/헤어 제거

> **태그 구분**:
>
> - `reaching hand toward viewer` — POV 전용
> - `arms around neck` — 3인칭 전용

### 6-5. shower-together (씬 48) — POV + close-up

- **F파트 수정**:
  - 삭제: `from side`, `standing`
  - 유지: `shower, bathroom, wet body, wet hair, steam, nude, blush`
  - **캐릭터 오버라이드**: `sideways glance` / `looking to the side`
- **M파트 교체**: `pov, close-up`

### 6-6. standing-sex 68, 69 — 재정의 분리

#### 씬 68 → **standing 후배위 POV (기본)**

- **F파트 수정**:
  - 삭제: `from side`
  - 추가: `anal`, `from behind`, `back`
  - 유지: `bedroom, standing sex, against wall, wet body, blush, open mouth`
- **M파트 교체**: `pov, mutual# sex`

**캐릭터 오버라이드**: 일부 캐릭터는 현행(정면 + `leg lift`) 유지

- override로 `anal`/`from behind`/`back` 제거, `leg lift` 유지

#### 씬 69 → **standing 측위 3인칭**

- **F파트**: `from side` **유지**, `penis` 삭제(M으로), `cum in pussy, overflow` 등 결과 태그 유지
- **M파트 재구성**: 색상/헤어 태그 제거하고 **`1boy`만 유지**
  - 결과: `1boy, mutual# sex, cum` 정도

### 6-7. lap-pillow (씬 43) — 하체 삭제, 상체 추가

- **F파트 수정**:
  - **삭제**: `thighs`, `sitting`
  - **유지**: `lap pillow`, `looking down`, `pov`, `head on lap`, `gentle`, `smile`
  - **추가**: `from below`, `upper body`, `breasts`
  - **캐릭터 오버라이드**: `underboob` (가슴 강조 캐릭터 한정)
  - **금지**: `cleavage` (위에서 내려다보는 구도 — from below와 상충)

### 6-8. after-sex 씬 (63, 67, 78, 86)

- **M파트 신설**: `pov`만
- F파트는 기존 결과 태그 유지

---

## 변경 그룹 7 — `fellatio` M파트 외형 규칙

**규칙**: POV 펠라치오 M파트 허용 태그:

- `pov`
- `large penis`
- `cum`(climax씬만)
- `source# / target#` 인터랙션 태그

### 인터랙션 태그 방향

- **F파트**: `source# fellatio` (F가 행위 주체)
- **M파트**: `target# fellatio` (M이 행위 대상)
- 추가 인터랙션 (climax씬): `target# grabbing another's hair`(F) + `source# grabbing another's hair`(M)

### 영향 씬

| 씬 | 이름 | F파트 추가 | M파트 최종 |
|----|------|----------|----------|
| 31 | fellatio-pov | `source# fellatio` | `pov, large penis, target# fellatio` |
| 32 | fellatio-climax-pov | `source# fellatio` | `pov, large penis, cum, target# fellatio, source# grabbing another's hair` |
| **33, 34** | **fellatio-3rd / climax-3rd** | `source# fellatio` | **3인칭 유지** — `1boy, target# fellatio` (+climax는 `cum`, `source# grabbing another's hair`) |
| 35 | deepthroat | 6-3 참조 | 6-3 참조 (`penis` 태그 없음 예외) |
| 76, 77 | clothed-fellatio-bedroom / climax | `source# fellatio` | `pov, large penis, target# fellatio` (+climax `cum`) |
| 84, 85 | clothed-fellatio-toilet / climax | `source# fellatio` | `pov, large penis, target# fellatio` (+climax `cum`) |

---

## 변경 그룹 8 — 기승위 태그 병용 규칙

### 8-1. 기본 (씬 55, 56, 74, 75)

**F파트 필수 병용**: `cowgirl position, girl on top` (둘 다 써야 NAI 인식률 높음)

### 8-2. 캐릭터 오버라이드 변형

#### reverse cowgirl

- `cowgirl position` **제거**
- 추가: `reverse cowgirl position`, `girl on top`, **`back`, `anal`, `ass` 병용 필수**
- **의미**: F가 viewer(남성)로부터 **등을 돌리고** 올라탄 자세
- **`anal` 태그는 "항문 가시" 의미** (후배위 규칙과 동일) — 항문 성교 의미 아님
- 씬 의미 변화 없음

#### squatting cowgirl

- `cowgirl position` **제거** (병용 안 함)
- 추가: `squatting cowgirl position`, `girl on top`

---

## 변경 그룹 9 — 캐릭터별 오버라이드 슬롯

`asset_config.json`의 `character_scene_overrides`에 추가할 슬롯:

| 슬롯 | 대상 씬 | 오버라이드 내용 |
|------|---------|---------------|
| `hug_style` | 44 | POV / 3rd (arms around neck + mutual# hug) |
| `cowgirl_variant` | 55, 56, 74, 75 | default / reverse / squatting |
| `shower_gaze` | 48 | none / sideways glance / looking to the side |
| `lap_pillow_chest` | 43 | default / underboob |
| `standing_mode` | 68 | default (anal 후배위) / legacy (정면 + leg lift) |

> 캐릭터별 실제 배정은 별도 작업. 이 계획에서는 스키마만 준비.

---

## 변경 그룹 10 — clothed 씬 성기 묘사 태그 보강

**규칙**: clothed 씬(70~86) F파트에도 성기/신체 부위 태그 **명시적 추가 필수**

"옷을 입은 채 성행위"지만 성기 부위는 노출되어야 함 → clothed sex + exposed genitals 조합 필요.

### 대상 씬

70, 71, 72, 73, 74, 75, 76, 77, 79, 80, 81, 82, 83, 84, 85, 86

### 추가 권장 태그

- **F파트 공통**: `pussy`, `pussy juice`(climax)
- **후배위 (80, 81)**: `anal`, `back`
- **fellatio (76, 77, 84, 85)**: 기존 유지
- **기승위 (74, 75)**: `cowgirl position, girl on top` 병용

> 기존 clothed 씬에 이미 `penis`가 있었으나, F파트의 `pussy` 등은 대부분 누락
> → `clothed sex`가 "옷 위로 하는 것"이 아니라 "옷은 입고 있지만 필요 부위는 노출"임을 명확히

---

## 변경 그룹 11 — 캐릭터 외형 프롬프트 재추출

### 11-1. 백업 폴더 조사 결과

**3개 백업 폴더 발견** (캐릭터 이미지 디렉토리 상위):

| 폴더 | 날짜 | PNG | WebP | 메타데이터 | 용도 |
|------|------|-----|------|----------|------|
| `_backup_20260323_225654` | 3/23 | 있음 | 있음 | ✓ (PNG) | clothed 표정/프로필 초기판 |
| `_backup_20260331_212520` | 3/31 | 있음 | 있음 | ✓ (PNG) | **주력 — clothed + nude 테스트 파일 공존** |
| `_backup_nsfw_20260401` | 4/01 | 없음 | 있음 | ✗ | WebP만 → EXIF 추출 불가 |

### 11-2. `_backup_20260331_212520` 파일 구조 (SY 기준)

```text
1.png ~ 9.png           # 감정 표정 (clothed) — 의상 태그 포함
21_test.png             # nude 씬 21 테스트 (kiss, nude) — 의상 태그 없음
51_test.png             # nude 씬 51 테스트 (missionary) — 의상 태그 없음
70_test.png             # clothed 씬 70 테스트 — 의상 태그 풀셋
profile.png             # 프로필 컷 (clothed)
neutral.png             # 기본 대화 컷 (clothed)
seductive.png           # 유혹 컷 (구조화된 주석 # 머리, # 눈 등 포함)
NAIS_*.png              # 원본 NAI 파일명 보존 (초기 구성)
SY.png                  # 커버 이미지 (메타데이터 없는 경우 있음)
```

### 11-3. clothed vs nude char_caption 비교 (SY 실측)

**clothed 프롬프트** (70_test.png):

```text
1girl, solo, silver hair, very long hair, wavy hair, ..., golden eyes, ..., elegant,
aloof, expressionless, large breasts, oversized clothes, elegant coat, layered clothes,
belt, inner white dress, fashion, celebrity, high fashion, black pantyhose,
black half gloves, gold earrings, 2::gold choker::
```

**nude 프롬프트** (21_test.png):

```text
1girl, silver hair, very long hair, wavy hair, ..., golden eyes, ..., elegant, aloof,
expressionless, nude, large breasts, gold earrings, 2::gold choker::
```

**핵심 관찰**:

- **공통(캐릭터성)**: 머리카락, 눈, 성격, 체형, 악세서리(gold earrings, gold choker)
- **nude에서 제거된 태그**: `oversized clothes, elegant coat, layered clothes, belt, inner white dress, fashion, celebrity, high fashion, black pantyhose, black half gloves` (의상 일체)
- **nude에 추가**: `nude`
- **공통 유지된 악세서리**: gold earrings, gold choker (캐릭터 시그니처)

### 11-4. 추출 방법

#### Step 1 — clothed 프롬프트 추출

소스 파일 우선순위:

1. `seductive.png` — 구조화된 주석 `# 머리`, `# 눈/시선`, `# 체형` 등 포함 (원본성 높음)
2. `profile.png` — 프로필 지정 컷
3. `neutral.png` — 기본 대화 컷
4. `70_test.png` — 의상 태그 풀셋

→ `seductive.png` 있으면 최우선 (주석 구조 보존 목적), 없으면 profile/neutral 중 char_caption 더 긴 쪽

#### Step 2 — nude 프롬프트 추출

소스 파일 우선순위:

1. `21_test.png`, `22_test.png`, `23_test.png`, `51_test.png` 등 **nude 씬(20~67번대) 테스트 파일**
2. 없으면 clothed 프롬프트에서 수동 필터링 (의상 태그 제거)

#### Step 3 — 의상 태그 제거 규칙 (nude 필터링 시)

**제거 대상 키워드** (부분 일치):

```text
clothes, coat, dress, shirt, blouse, skirt, pants, jacket, cardigan, sweater,
sleeve, collar, buttons, hem, trim, layered, belt, pantyhose, stockings, tights,
gloves, fashion, celebrity, high fashion, oversized, school uniform, uniform, suit
```

**유지 대상** (캐릭터 시그니처):

```text
gold choker, gold earrings, ribbon (if character-defining), pendant, necklace,
bracelet, nails, 헤어 관련 전부, 눈 관련 전부, 성격 관련 전부, 체형 전부
```

**판단 기준**: "해당 장신구가 캐릭터 시그니처인가" — characters.js의 `signature` 필드 참조

#### Step 4 — 주석 구조 보존

char_caption에 `# 머리` / `# 눈/시선` / `# 체형` 등의 섹션 주석이 있을 경우 그대로 유지.
없으면 수동으로 주석 추가 불필요.

### 11-5. profile / neutral 필수 유지

- `profile.png`와 `neutral.png`는 **두 이미지 모두 생성 대상으로 유지**
- profile = 캐릭터 정보 페이지용 프로필 이미지
- neutral = 챗봇 일반 대화 시 기본 출력 이미지
- 두 씬의 프롬프트는 동일한 char_caption 공유 (clothed)

### 11-6. 대상 캐릭터

#### clothed 프롬프트 재추출 — 15명 전원

ELA, ERK, HSE, HSR, JGR, JSH, KHR, LPS, LSH, MIL, MMR, NHR, NIA, RAY, SY

#### nude 프롬프트 재추출 — 14명 (JSH 제외)

- **JSH(진시혁)은 nude 프롬프트 불필요**
- 남성 캐릭터는 NSFW 씬(20~89, 특히 여성 캐릭터 대상) 생성 제외
- JSH는 씬 33/34(fellatio-3rd)에서 3인칭 남성 오브젝트로만 등장 — 이 경우에도 JSH의 clothed 프롬프트 사용 or 남성 외형 태그 직접 주입
- asset_config.json 수정: `characters.JSH`는 `clothed`만 유지, `nude` 필드 제거 or `""` 처리

### 11-7. RAY(레이) 의족 특수 처리

RAY는 선천적 의족 설정 — 이미지 생성 시 의족이 자연스럽게 표현되어야 함.

- **RAY nude 프롬프트에 `2::single prosthetic leg::` 추가 필수** (weight 2 강조)
- clothed 프롬프트는 의족이 의상에 가려지므로 추가 여부 선택적
- signature 필드: "의족 (숨김) — 공정한 평가를 위해 감춤" → nude에서는 의족 노출

### 11-8. 구현 스크립트 (Phase F)

```python
# tools/extract_char_prompts.py (신규)
#   - _backup_20260331_212520 에서 clothed/nude char_caption 추출
#   - 의상 필터링 규칙 적용
#   - asset_config.json의 characters.{CODE}.clothed / nude 교체
```

---

## 변경 그룹 12 (신규) — 캐릭터별 오버라이드 배정 초안

> 15명 × 5 슬롯. **성격 기반 추정 초안** — 사용자 피드백으로 확정 예정.
> 슬롯 정의는 그룹 9 참조.

### 12-1. 성격 요약 (characters.js 기준)

| 코드 | 이름 | 성격 키워드 | 시그니처 |
|------|------|-----------|---------|
| SY | 서윤 | 고데레, 탑 아이돌, 신뢰 서툶 | 금색 초커 |
| NHR | 나하린 | 장난기+변덕+예측불가 | 낡은 손목시계 + 한쪽 이어폰 |
| JSH | 진시혁 | 냉정+직설+합리 (남성) | 볼펜 시퀀스 |
| ERK | 에리카 | 아네데레 독설가, 내면 따뜻 | 느슨한 넥타이 |
| LSH | 이서하 | 다루데레+자기부정+귀차니즘 | 둥근 안경 + 다크서클 |
| HSR | 한소리 | 능글능글, 내면 절박 | 실눈 + 다크서클 |
| KHR | 강하람 | 무자각 여친계, 밝음 | 손목 스크런치 |
| JGR | 장그루 | 담담+단단, 내면 간절 | 낡은 작사 노트 |
| MIL | 밀라 | 자유로운 영혼, 본능적 음악 | 흥얼거림 |
| ELA | 엘라 | 여유 관능미, 자존심 | 머리카락 넘기기 |
| MMR | 미모리 | 천연 관종+센스 | 특이한 헤어핀 |
| HSE | 하시은 | 성실 우등생, 안정형 | 메모/기록 습관 |
| NIA | 니아 | 귀족 출신, 성장형, 늦된 출발 | 흔들리는 눈 |
| RAY | 레이 | 꺾이지 않는 밝음, 의족 | 숨긴 의족 |
| LPS | 라피스 | 쿨+여유+예측불가 | V사인 |

### 12-2. 슬롯별 배정 초안

#### 슬롯 1: `hug_style` (POV / 3rd)

| 캐릭터 | 값 | 이유 |
|--------|-----|------|
| SY | POV | 웬만하면 POV (사용자 확정) |
| NHR | POV | 장난스럽게 접근 |
| ERK | **3rd** | 아네데레, 겉은 거리두기 |
| LSH | **3rd** | 귀차니즘, 수동적 |
| HSR | POV | 능글능글 적극성 |
| KHR | POV | 여친계, 직접 안김 |
| JGR | POV | 간절함, 진심 |
| MIL | POV | 자유로움, 본능적 |
| ELA | **3rd** | 여유, 관능적 거리감 |
| MMR | POV | 관종, 카메라 지향 |
| HSE | **3rd** | 수줍은 우등생 |
| NIA | **3rd** | 어색함, 성장형 |
| RAY | POV | 단단한 밝음 |
| LPS | POV | 다양성 시도 |

#### 슬롯 2: `cowgirl_variant` (default / reverse / squatting)

| 캐릭터 | 값 | 이유 |
|--------|-----|------|
| SY | **default** | 정통파 |
| NHR | **squatting** | 변덕, 유동적 |
| ERK | **default** | 정석 |
| LSH | **default** | 귀차니즘 |
| HSR | **default** | 능글 |
| KHR | **default** | 여친계 정통 |
| JGR | **default** | 담담 |
| MIL | **squatting** | 야성적, 자유 |
| ELA | **reverse** | 자신감, 등 노출 |
| MMR | **default** | 카메라 정면 |
| HSE | **default** | 성실 |
| NIA | **default** | 소심 |
| RAY | **default** | 무리 없는 정통 |
| LPS | **squatting** | 쿨한 변형 |

※ reverse 선택 시 `back, anal, ass` 태그 강제 병용 (등 돌린 자세 의미)

#### 슬롯 3: `shower_gaze` (none / sideways glance / looking to the side)

| 캐릭터 | 값 | 이유 |
|--------|-----|------|
| SY | sideways glance | POV 호환, 새침한 표정 |
| NHR | none | 당당 |
| ERK | sideways glance | 겉 츤, 속 부끄 |
| LSH | looking to the side | 귀찮음 |
| HSR | none | 능글 당당 |
| KHR | none | 밝음 |
| JGR | sideways glance | 담담한 수줍음 |
| MIL | none | 순수 |
| ELA | none | 관능적 자신감 |
| MMR | none | 관종 |
| HSE | looking to the side | 성실 수줍음 |
| NIA | looking to the side | 소심 |
| RAY | none | 단단함 |
| LPS | none | 쿨 |

#### 슬롯 4: `lap_pillow_chest` (default / underboob)

| 캐릭터 | 값 | 이유 |
|--------|-----|------|
| SY | default | 위엄 유지 |
| NHR | **underboob** | 성숙한 매력 |
| ERK | default | 정석 |
| LSH | default | 귀차니즘 |
| HSR | **underboob** | 성숙한 여성미 |
| KHR | default | 건전 밝음 |
| JGR | default | 담담 |
| MIL | default | 순수 |
| ELA | **underboob** | 관능미 |
| MMR | default | 경쾌 |
| HSE | default | 성실 |
| NIA | default | 소심 |
| RAY | default | 단단 |
| LPS | default | 쿨 |

#### 슬롯 5: `standing_mode` (default 후배위 / legacy 정면 leg lift)

| 캐릭터 | 값 | 이유 |
|--------|-----|------|
| SY | default | 웬만하면 POV (사용자 확정) |
| NHR | default | 자유로운 태도 |
| ERK | **legacy** | 거리감 유지 |
| LSH | **legacy** | 수동적 |
| HSR | default | 적극적 |
| KHR | default | 격정적 |
| JGR | default | 간절함 |
| MIL | default | 자유 |
| ELA | **legacy** | 정면 얼굴 강조 |
| MMR | default | 카메라 지향 |
| HSE | **legacy** | 수줍음 |
| NIA | **legacy** | 수동적 |
| RAY | **legacy** | 의족으로 격한 후배위 제한적 |
| LPS | default | 쿨한 다양성 |

### 12-3. 배정 요약 표

| 코드 | hug | cowgirl | shower | lap chest | standing |
|------|-----|---------|--------|-----------|----------|
| SY | POV | default | sideways | default | default |
| NHR | POV | squatting | none | underboob | default |
| ERK | 3rd | default | sideways | default | legacy |
| LSH | 3rd | default | look side | default | legacy |
| HSR | POV | default | none | underboob | default |
| KHR | POV | default | none | default | default |
| JGR | POV | default | sideways | default | default |
| MIL | POV | squatting | none | default | default |
| ELA | 3rd | reverse | none | underboob | legacy |
| MMR | POV | default | none | default | default |
| HSE | 3rd | default | look side | default | legacy |
| NIA | 3rd | default | look side | default | legacy |
| RAY | POV | default | none | default | legacy |
| LPS | POV | squatting | none | default | default |

※ JSH(진시혁)는 남성 캐릭터 → 오버라이드 배정 대상 아님

### 12-4. 특이 사항 (확정)

- **RAY(레이)**: nude 프롬프트에 **`2::single prosthetic leg::` 강제 주입** (그룹 11-7 참조). 의족을 공정하게 감추는 설정이나 nude에서는 노출이 자연스러움
- **ELA(엘라) reverse cowgirl**: 의미 변화 없음. `reverse cowgirl position`은 "F가 viewer로부터 등을 돌리고 올라탄 자세"이며, `back, anal, ass` 태그 병용으로 구도 명확화 (anal은 "항문 가시" 의미)
- **JSH(진시혁)**: 남성 캐릭터이므로 **NSFW 씬 전체 생성 제외**. nude 프롬프트 불필요. 씬 33/34(fellatio-3rd)에서 필요한 3인칭 남성 태그는 씬 프롬프트에 직접 주입 (별도 캐릭터 프롬프트 불필요)
- **오버라이드 배정은 14명 (JSH 제외)**

---

## 실행 순서

### Phase A — 스크립트 일괄 처리 (기계적 변환)

1. `penis` F→M 이동 (imminent 87~89 특수 처리 포함)
2. `sex` / `clothed sex` → `mutual# sex` 양쪽 적용
3. climax씬 M파트에 `cum` 추가
4. `from side`, `from front`, `from above` 일괄 삭제 (예외: 씬 69 `from side`)
5. 3인칭 유지 씬 M파트에서 색상/헤어 태그 제거 → `1boy`만 유지
6. `source#` / `target#` 누락 보충 (1차 research 기준)

### Phase B — 씬별 수동 재구성 (POV 전환)

- 씬별로 M파트 외형 태그 제거 + POV 구조로 재작성
- 대상: 20, 35, 44, 48, 51~56, 61, 62, 68, 70, 71, 74, 75, 80, 81
- fellatio POV 씬(31, 32, 76, 77, 84, 85) M파트 정리

### Phase C — 특수 씬 처리

- kiss (21, 22): M파트 신설
- lap-pillow (43): 하체 삭제 + 상체 추가
- hug-from-behind (44): POV 기본 + 캐릭터 오버라이드 슬롯
- deepthroat (35): 특수 규칙 적용
- after-sex (63, 67, 78, 86): M파트 신설
- standing-sex 68/69 재정의 분리

### Phase D — clothed 씬 성기 태그 보강 (그룹 10)

- 70~86 F파트에 `pussy`, `pussy juice`(climax), `anal`(후배위) 등 추가

### Phase E — 캐릭터 오버라이드 스키마 + 배정 (그룹 9 + 12)

- `character_scene_overrides`에 슬롯 생성 (hug_style, cowgirl_variant, shower_gaze, lap_pillow_chest, standing_mode)
- 그룹 12 배정 초안을 asset_config.json에 주입
- 사용자 확정 후 실제 배정 값 반영

### Phase F — 캐릭터 외형 프롬프트 재추출 (그룹 11)

- `tools/extract_char_prompts.py` 신규 작성
- `_backup_20260331_212520`에서 clothed 소스 (seductive/profile/neutral/70_test 우선순위)
- `_backup_20260331_212520`에서 nude 소스 (21_test/51_test 등 nude 테스트 파일)
- 의상 태그 필터 규칙 적용 (그룹 11-4 Step 3)
- 15명 char_caption 재추출 → asset_config.json `characters.{CODE}.clothed` / `nude` 교체

### Phase G — 검증

- F파트에 `penis` 잔존 없음 확인 (87~89 특수 제외)
- `from side` 잔존 확인 (씬 69만)
- `from front` / `from above` 완전 제거 확인
- `mutual#` 양쪽 파트 동기화 확인
- climax씬 `cum` 존재 확인 (M파트)
- 후배위 씬 F파트에 `back` 존재 확인
- 3인칭 유지 씬에 `1boy` 존재, 색상/헤어 태그 없음 확인
- clothed 씬에 성기 태그 존재 확인 (그룹 10)
- 캐릭터 외형 프롬프트에서 `normal quality` 잔존 확인 (없어야 함)
- nude 프롬프트에서 의상 태그 완전 제거 확인

---

## 확정된 결정 사항 (피드백 반영 완료)

| 항목 | 확정 내용 |
|------|---------|
| squatting cowgirl | `squatting cowgirl position`만 사용, `cowgirl position` 병용 안 함 |
| 캐릭터 대표 이미지 | `profile.png` + `neutral.png` 둘 다 유지 (별개 이미지 슬롯) |
| nude 프롬프트 소스 | `_backup_20260331_212520`의 nude 테스트 파일(21_test 등)에서 직접 추출 |
| nude 필터링 | 의상 태그 전부 제거. 단, 캐릭터 시그니처 악세서리는 유지 (gold choker 등) |
| RAY 의족 | nude 프롬프트에 `2::single prosthetic leg::` 강제 주입 |
| ELA reverse cowgirl | 의미 변화 없음 — `back, anal, ass` 병용으로 "등 돌린 자세" 표현 |
| JSH NSFW 제외 | 남성 캐릭터이므로 NSFW 씬 생성 전체 제외, nude 프롬프트 불필요 |
| SY 배정 | 웬만하면 POV (hug=POV, standing=default) |
| 오버라이드 배정 대상 | 14명 (JSH 제외) |

---

## 사용자 확정 대기 항목

1. **그룹 12 오버라이드 배정 (14명)** — SY POV화 반영, ELA reverse 의미 확정, RAY 의족 주입 확정
   - 나머지 13명(NHR, ERK, LSH, HSR, KHR, JGR, MIL, MMR, HSE, NIA, RAY, LPS, ELA) 배정이 성격에 맞는지 재검토 요청

2. **캐릭터 시그니처 악세서리 유지 목록** — nude 필터링 시 "캐릭터성 중요" 판단 기준
   - SY: `gold choker`, `gold earrings` ✓ (실측 확인됨)
   - 나머지 13명의 시그니처 태그는 Phase F 실행 시 각 캐릭터 EXIF 추출 결과로 확인 (characters.js `signature` 필드 참조)
