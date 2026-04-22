# plan.md — 구현 기획서

> 이 문서는 **코드 작성 전 반드시 거쳐야 하는 기획 단계**입니다.
> 사용자가 이 문서 안에서 주석(`<!-- 피드백 -->` 또는 인라인 코멘트)으로 피드백을 남기고,
> 기획이 충분히 구체화되었다고 판단한 뒤에야 코드베이스에 반영합니다.
>
> **절대 규칙**: 사용자의 명시적 승인 없이 코드 구현을 시작하지 않는다.

---

## 문서 구조 규칙

모든 기획 항목은 아래 구조를 따릅니다:

```
### [작업 제목]

**목적**: 왜 이 작업이 필요한가 (1-2문장)

**접근 방식**: 
어떻게 구현할 것인가. 단계별로 상세히 서술.
대안이 있었다면 왜 이 방식을 선택했는지.

**변경 파일**:
- `경로/파일명` — 무엇을 어떻게 변경하는지

**코드 스니펫** (핵심 변경사항 예시):
```언어
// 실제 코드에 적용될 패턴 미리보기
```

**고려사항 / 트레이드오프**:
- 이 방식의 장점
- 이 방식의 단점 또는 리스크
- 반드시 확인해야 할 것

**검증 방법**:
- 빌드 성공 여부
- 시각적 확인 항목
- 엣지 케이스
```

---

## 현재 기획 중

> 아래에 다음 구현할 작업의 상세 기획을 작성합니다.
> 사용자는 각 항목에 `<!-- 피드백: ... -->` 주석을 달아 방향을 조정합니다.

### 🚧 라피스 디자인 롤백 + 사피아(SPA) 신규 캐릭터 추가

**상세 기획**: `docs/prompts/plan_sub_LPS롤백_사피아신규.md` (2026-04-23)
**상태**: 계획 완료 · 사용자 최종 승인 대기

**핵심**:

1. **라피스 롤백** — 로우 포니테일·빈유·스트리트 룩·**쿨한 반말**. 아피리아와 무관해짐 (자매 로어북 삭제)
2. **사피아(SPA) 신규** — Sapphire (Apphireah의 자매). 20대 후반. APPAIREL & DESIGN 오너 (디자이너·모델·스타일리스트). 장발 하프업·거유·코발트블루·하이엔드 하네스·**플래티넘 초커**. 손목 잡기+소매 끝 만지기 시그니처. 존댓말. 보호적 방어벽 성격
3. **이미지 자산 swap** — 현재 LPS 폴더 → SPA로 이관(이름만), 0412 백업 LPS(구 디자인) → LPS로 복원. 픽셀 재생성 0
4. **CDN** — LPS 재업로드 + SPA 신규 업로드. `ASSET_VERSION 26 → 28`

**커밋 3단 분할**: 라피스 롤백 / 사피아 신규 / HTML·문서
**총 캐릭터 수**: 19명 → 20명

---

### ✅ 커밋 0: 이미지 원본 경로 통일 + Apphireah 교정 (2026-04-23, `bf363e4`)

- 레거시 외부 폴더 `캐릭터 이미지/` → `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/` rename
- 실제 원본을 `연예계/char_img/`로 단일화
- 참조처 10 파일 교정 (CLAUDE.md, plan.md, research.md, tools/, docs/)
- 아피리아 영문 `Apiria` → `Apphireah` 교정 + `plan_sub_apiria.md` → `plan_sub_apphireah.md` rename

---

### ✅ 선택지 모드 UI·품질 개선

**상세 기획**: `docs/prompts/plan_sub_선택지모드_개선.md` (2026-04-22)
**상태**: 계획 완료 · 사용자 최종 승인 대기

**개선 영역 4가지**:
1. **코드블록 래핑** — `\`\`\`CHOICE ... \`\`\`` 로 감싸 줄바꿈 누락 원천 차단
2. **3축 다양성** — 직접 행동 / 관계 유대 / 관찰·정보 — 같은 결 3개 금지
3. **프로듀서 페르소나 어휘** — "격려한다" 류 약한 표현 금지, "공개 맞선다" 같은 권한 어휘
4. **매력 요소** — 관계 레버리지·서사 분기·감정 긴장·말맛 중 최소 1개 포함

**배치**: 장면 서술 직후, 상태창 바로 위 (2턴에 1회 수준 빈도)

---

### 🚧 오디션 라운드 로어북 구체화 (6개 파일)

**상세 기획**: `docs/prompts/plan_sub_오디션라운드_구체화.md` (2026-04-22)
**상태**: 계획 완료 · 사용자 최종 승인 대기

**대상**: `1R_등급평가`, `2R_프로듀서픽`, `3R-A_팀대항전`, `3R-B_패자부활`, `3R-C_결승`, `4R_최종선택`

**표준 구조**:
- `situation` — 한 문장 라운드 상황
- `flow` — 배열로 단계 분리, 각 1~2문장
- `character_beats` — 진시혁·에리카·나하린 개입 순간
- `tension` — 핵심 감정 구도
- `end` — 태그 전환

**언어**: 영문 축약 → 한국어 완전문 (경량 모델 호환)
**글자수**: 6개 합계 64줄 → 약 147줄 (+83). 메인 프롬프트 61줄 절감의 일부 재투자

---

### ✅ 모드 로어북 트리거 키워드 확장 (19개 파일)

**상세 기획**: `docs/prompts/plan_sub_모드트리거_확장.md` (2026-04-22 작성)
**상태**: 계획 완료 · 사용자 최종 승인 대기

**목적**: 모드 전환 명령어의 인식 범위를 축약·오탈자까지 넓혀, `!매니저모드` / `!매니저` 양쪽 다 작동.

**원칙**:
- **오디션 모드만 느낌표 없이도 허용** (상시 서사 용어 특성)
- **오디션참가 포함 그 외 모든 모드는 느낌표 필수** (오발동 방어벽)
- **기폭제(시작) + 유지제(본체) 키워드 쌍 공유** — 유지 이모지는 본체에만

**예상 변경**: 19개 파일의 `// --- TRIGGER ---` 한 줄 교체, JSON 본문 무수정

---

### ✅ 메인 프롬프트 토큰 최적화 (NSFW 분리·chars 축약·용어 풀어쓰기·rules 통합)

**상세 기획**: `docs/prompts/plan_sub_메인프롬프트_최적화.md` (2026-04-22 작성)
**상태**: 계획 완료 · 사용자 최종 승인 대기

**6대 최적화**:
1. **NSFW 이미지 DB → `이미지_NSFW_EN.json`** — 21·22·43·44·45·46은 SFW 로맨스로 재분류, 나머지 NSFW 전부 이동 (21줄 감소)
2. **chars 축약** — 19명의 외형·성격·말투 전부 제거, 소속사별 이름만 나열. 플랫폼 캐릭터 프롬프트에 이관 (22줄 감소)
3. **terms 캐릭터 용어 7개 풀어쓰기** — 고데레/아네데레/다루데레/무자각 여친계/감초/언더독/변수 → 각 캐릭터 본체 로어북 `inner` 필드로 풀어쓰기 이관 (7줄)
4. **terms 짠꿉공 제거** — 관계 로어북에 이미 정의. `에리카_이서하_짠꿉공_EN.json` overview 문구만 자체 정의로 수정 (1줄)
5. **sym 전체 삭제** — chars 축약으로 기호 참조 0건. 플랫폼 캐릭터 프롬프트에 풀어쓴 텍스트 블록 별도 제공 (1줄)
6. **rules/guidance/char_rules 통합** — 경량 모델 호환성 향상. 18줄 3블록 → 9키 단일 플랫 구조로 통합. 의미 손실 0 검증 완료 (9줄)

**예상 결과**: 메인 프롬프트 180줄 → 약 119줄 (**34% 감축**)

**연쇄 영향 매트릭스**: plan_sub §8 — 총 11개 로어북 교차 조사 완료. 영향 받는 로어북 1개(`에리카_이서하_짠꿉공_EN.json`)만 문구 수정 필요.

**산출물**:
- 수정: 메인_프롬프트_EN.json, 이미지_NSFW_EN.json, 짠꿉공 관계 로어북, 본체 로어북 7개 (총 10개 파일, 1커밋)
- 신규: `docs/prompts/플랫폼_캐릭터프롬프트_EN_풀어쓰기.md` (플랫폼 UI 복붙용)

---

### 🚧 CharDetail 시네마틱 인트로 시스템 (8캐릭터, JGR 제외)

**상태**: Step 5a(JSH) 완료 · Step 5b~8 대기 (2026-04-10 세션 종료 시점)

**아키텍처 (확정, 변경 금지)**:
- `CharDetail.jsx` 내부 3개 분기: `JgrCharDetail` → `CinematicCharDetail` → `DefaultCharDetail`
  - early return: `char.id === "janggru"` → JGR / `char.introStyle` → Cinematic / else → Default
- `CinematicCharDetail` (module scope 함수, ~L415-L740) — 8캐릭터 공용 컨테이너
- `src/components/cinematic/index.js` — 스타일 레지스트리 (`INTRO_COMPONENTS`)
  - 현재: `{ cutaway: CutawayIntro }` / 7스타일 주석 처리
- `src/data/introStyles.js` — `INTRO_STYLE_CONFIG` (duration, mobileFallback 등)
- `src/data/characters.js` — 캐릭터별 `introStyle`, `introAssets[]`, `introLabel`, `quoteSequence[]`, `focusBox{}`, `zoomSequence[]`
- `src/hooks/useImagePreloader.js` — `{loaded, total, ready, progress, timedOut}` 반환

**Phase 상태기계**:
- `-1`: LoadingShell (progress bar, `char.color`)
- `0`: 시네마틱 overlay (z:200) 재생
- `1`: hero + lower sections (scroll 가능)
- `2`: navbar 노출 (IntersectionObserver)

**핵심 결정사항 (재결정 금지)**:
- **Fall-open 프로토콜**: `fullyLoaded = loaded >= total`을 먼저 체크, 그 다음에만 `timedOut` 체크. race condition 방지.
- **JGR 패턴 handoff**: Phase 0 overlay는 unmount가 아닌 opacity fadeOut. Phase 1 컨텐츠는 overlay 아래에 항상 렌더.
- **Lower sections 상시 렌더**: `phase2Latched` gate 제거 완료. scroll deadlock 해결.
- **Hero + lower 단일 render tree**: 분기 렌더 금지 (Phase 0에 overlay만 얹는 방식)

**Step 5a: JSH (cutaway) — ✅ 완료**
- `src/components/cinematic/CutawayIntro.jsx` (247줄)
- 시퀀스 6400ms: black(200) → zoom1+Ken Burns(1500) → flash(100) → zoom2+Ken Burns(1500) → flash(100) → full view+centered hero text(2400) → fadeOut(600)
- 캐릭터 데이터: `zoomSequence: [{cx:50,cy:25,scale:2.8},{cx:42,cy:55,scale:2.5}]`
- 4차 반복 결과: 3초→6.4초 (느긋함 요청), 단순 페이드→2줌+화이트플래시(방향성 교정), 우하 텍스트→centered hero text, 부자연 전환→JGR dissolve 패턴
- 커밋: `fceac30`

**Step 5b: KHR (sunrise) — ⏳ 대기**
- `INTRO_STYLE_CONFIG.sunrise`: duration 2500, `flare: true`
- 목표: 태양 플레어/광원 효과 (KHR=스타덤/청순)

**Step 6: MIL (ripple) — ⏳ 대기**
- `requiresSvgFilter: true`, `svgId: "introRipple"` — SVG 필터 먼저 정의 필요

**Step 7a: LSH (glitch) — ⏳ 대기** — `layers: 3`, mobileFallback `simpleGlitch`
**Step 7b: MMR (flash) — ⏳ 대기** — `flashes: 3`, `commentOverlay: true`, `commentRows: 5`
  - MMR introComments 데이터 finalize 필요
  - PRELOAD_BUDGET_OVERRIDE: MMR=1200ms (animated WebP 무거움)
**Step 7c: NHR (fog) — ⏳ 대기** — `fogLayers: 2`
**Step 7d: HSR (cardDeal) — ⏳ 대기** — `perspective: 1200`
**Step 7e: HSE (pageFlip) — ⏳ 대기** — `direction: "ltr"`, HSE focusBox finalize 필요

**Step 8: 테스트 체크리스트 — ⏳ 대기**
- 8캐릭터 × (mobile/desktop) × (첫 로드/재방문) × (reduced-motion) × (fall-open)
- 각 스타일 skip 작동, back button, scroll hint 작동
- navbar IntersectionObserver 복귀

**마지막 세션 수정 사항 (2026-04-10)**:
1. 뒤로가기 버튼 수정 (`6c9f7ba` 직전):
   - `zIndex: 50 → 150` (Navbar z:100 위로)
   - 위치: `top:16 left:16 → top:(isMobile?68:84) right:16` (로고 겹침 해소)
   - `phase >= 1`일 때만 렌더 (Phase 0 overlay가 가려 무의미)
   - `navigate(-1)` → history fallback 추가 (`window.history.length > 1 ? navigate(-1) : navigate("/")`)
2. Scroll hint 재디자인 (`6c9f7ba`):
   - SCROLL 텍스트 22px (desktop) / 18px (mobile), 금색 + textShadow glow
   - 이중 수평바 36×3px, 금색, boxShadow glow
   - `scrollPulse` 1.6s 애니메이션 + 두 번째 바 `0.15s` delay로 스태거드

**다음 세션 착수 지점**: Step 5b (KHR sunrise intro)

---

### 디버그: Hero 오빗 링 모바일 위치 이탈 + CharDetail 뒤로가기 목적지

**목적**: 모바일 새로고침 시 오빗 링이 왼쪽 상단으로 튀는 버그 + CharDetail `← PRIME CITY` 버튼이 캐러셀이 아닌 Hero로 이동하는 버그 수정.

---

#### 버그 1: 모바일 Hero 오빗 링 왼쪽 상단 이탈

**원인 (유력 — rename 후 재현 소멸로 최종 확정 예정)**:

`@keyframes spin` 정의가 **두 곳**에 존재하며 서로 충돌:

| 위치 | 정의 | translate 포함 |
|---|---|---|
| `src/main.jsx:16` | `from { transform: translate(-50%,-50%) rotate(0deg) } to { ... rotate(360deg) }` | **포함** ✅ |
| `src/App.jsx:44` | `to { transform: rotate(360deg) }` | **미포함** ❌ |

`App.jsx`의 `spin`은 Suspense fallback(로딩 스피너)용이지만, **같은 이름**이라 CSS cascade에서 나중에 파싱되는 쪽이 우선할 수 있음. 이 경우 HeroSlider의 오빗 링이 `translate(-50%,-50%)`를 잃고 `top:50%; left:50%` 기준점(= 왼쪽 상단)에 찍힘.

> **참고**: Home은 App.jsx에서 lazy가 아닌 sync import이므로, "fallback이 먼저 마운트되어 override"라고 단정하기엔 한 단계 과함. 다만 동일 이름 충돌 자체는 코드에서 확인되며, `spinLoader` rename은 저위험 방어 수정으로 가치가 충분.

**수정 방법**:

App.jsx의 로딩 스피너 keyframe 이름을 `spinLoader`로 변경하여 충돌 제거.

```jsx
// App.jsx (44행)
// Before:
<style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

// After:
<style>{`@keyframes spinLoader { to { transform: rotate(360deg) } }`}</style>
```

```jsx
// App.jsx (41행) — animation 참조도 변경
// Before:
animation: "spin 0.8s linear infinite",

// After:
animation: "spinLoader 0.8s linear infinite",
```

**변경 파일**: `src/App.jsx` (2곳)
**연쇄 영향**: Suspense fallback 로딩 스피너만 영향. 나머지 `spin` 사용처(HeroSlider 오빗 링)는 main.jsx 정의를 그대로 사용.

---

#### 버그 2: CharDetail `← PRIME CITY` 뒤로가기가 Hero로 이동

**원인 (확정)**:

CharDetail의 `← PRIME CITY`가 `<Link to="/">`로 되어 있어 항상 **홈 최상단**(Hero)으로 이동.

| 위치 | 현재 코드 | 행 |
|---|---|---|
| JgrCharDetail | `<Link to="/">` | 287행 |
| CharDetail (공통) | `<Link to="/">` | 767행 |

이전 UX 수정(acd78b8)에서 14개 페이지의 `← PRIME CITY`를 `button + navigate(-1)` + fallback으로 변경했지만, CharDetail은 이미 별도 구조(JGR 분리 + 공통)라서 누락.

**수정 방법**:

**기존 14개 페이지와 동일 패턴**(`<button>` + `onClick`)으로 맞춤. `useNavigate` import 새로 추가 필요 (현재 `useParams, Link`만 있음).

> **동작 특성**: `navigate(-1)`은 브라우저 history scroll restoration에 기대하는 best-effort. 캐러셀 경유 시 높은 확률로 섹션 위치 복귀되지만, `location.state`/hash 기반의 정확한 섹션 복귀 설계는 아님. 또한 `window.history.length > 1`이면 이전 엔트리가 외부 사이트일 수도 있음 — 현재 14개 페이지도 동일한 한계를 공유하며, 이번 범위에서는 기존과 일관성을 맞추는 것이 목표.

```jsx
// import 추가:
import { useParams, Link, useNavigate } from "react-router-dom";

// JgrCharDetail (287행), CharDetail (767행) — 두 곳 모두 동일:
// Before:
<Link to="/" style={{ ... }}>&larr; PRIME CITY</Link>

// After:
<button
  onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
  style={{
    background: "none", border: "none", padding: 0,
    color: C.text35, fontSize: 12, letterSpacing: "0.08em",
    cursor: "pointer", fontFamily: "var(--f-body)",
  }}>&larr; PRIME CITY</button>
```

**변경 파일**: `src/pages/CharDetail.jsx` (import 1곳 + button 교체 2곳)
**연쇄 영향**: JgrCharDetail 내부에 `const navigate = useNavigate();` 추가 필요 (CharDetail 공통은 이미 확인 필요)

---

**검증**:

| 케이스 | 확인 항목 |
|---|---|
| 모바일 새로고침 | 오빗 링이 화면 중앙에 유지되는지 |
| 데스크톱 새로고침 | 동일 |
| Bug 1 확정 검증 | `spinLoader` rename 후 모바일 재현 소멸 여부 |
| CharDetail → 뒤로 (캐러셀 경유) | 이전 위치로 복귀 (best-effort, scroll restoration 의존) |
| CharDetail → 뒤로 (직접 URL/새 탭) | 홈 `/`로 이동 |
| CharDetail → 뒤로 (외부 사이트 경유) | 외부 사이트로 복귀 (기존 14개 페이지와 동일 동작) |
| Suspense 로딩 스피너 | 회전 정상 동작 |
| JGR CharDetail 뒤로 | 공통과 동일하게 작동 |

<!-- ✅ 승인 대기 중 -->

---

### JSON 프롬프트 품질 개선 — Phase 5

**목적**: 에덴챗 배포용 JSON 프롬프트(`docs/prompts/json/`)를 AI가 더 잘 이해하고, 캐릭터성을 정확히 드러내며, AI 자율성과 사용자 의도 사이의 균형을 최적화한다.

**범위**: 6개 JSON 파일 전체 (메인 프롬프트, 캐릭터, 모드, 오디션, 나하린, 세계관이면)

**핵심 문제**:
1. Source → JSON 변환 과정에서 **핵심 시스템 누락** (Hidden Tracker, 내면 독백 규칙, 응답 길이 조절, 선택지 포맷)
2. 캐릭터별 **감정 트리거/지뢰**, **호감도 변동 패턴**이 과도하게 압축되어 AI가 맥락을 놓침
3. `ud.i/d/u/hi` 등 **약어 키**가 AI에게 불분명
4. Characters 문서의 **미반영 설정** (서윤 원래 꿈, 나하린 4층위 상세, 허브 이벤트)
5. AI 자율성 vs 사용자 의도 사이 **가드레일 부재** (감정 변화 속도, 서사 주도권 범위)

**상세 분석**: → `docs/research_sub.md` (비교 분석 결과)
**상세 개선 계획**: → `docs/prompts/plan_sub.md` (파일별 개선안)

**접근 방식**: 
1. research_sub.md에 Source↔JSON 비교 분석 완료
2. plan_sub.md에 파일별 구체적 변경안 수립
3. 사용자 피드백/승인 후 JSON 수정 착수

<!-- ✅ 승인 대기 중 — plan_sub.md 검토 후 승인해주세요 -->

---

### ~~tools/ Python 파이프라인 개선 (18항목, 4Phase)~~ ✅ 구현 완료 → 완료 이력 참조

---

### CharDetail — phase 2 ↔ 콘텐츠 섹션 연결감 강화

**목적**: phase 2 hero와 아래 섹션(Signature/Expressions/Navigation) 사이에 자연스러운 seam을 만들어, 페이지가 한 호흡으로 이어지는 인상을 준다. 단순한 "스크롤 유도 화살표 추가"가 아니라 장면 전환의 일부로 설계.

**상세 기획**: → `src/pages/plan_sub.md`

**설계 결정 (2차 피드백 반영)**:

| 결정 | 내용 |
|---|---|
| **배치** | hero 흐름 마지막에 **흐름형 seam cue** (프로필 패널 아래) |
| **카피** | 첫 후속 섹션 기준 **동적 분기** (A안 채택): sign 있으면 "Signature Below", 없으면 "Expressions Below", 둘 다 없으면 "Continue Below" |
| **Observer 대상** | hero 내부 sentinel ❌ → **다음 첫 실제 콘텐츠 섹션 wrapper를 직접 관찰** (Signature → Expressions → Navigation 우선순위). threshold 0.2. |
| **초기화** | `[name]` reset effect에 `setContentReached(false)` 포함 (route 전환 깜빡임 방지) |
| **그라데이션(B)** | **보류** |
| **시각 밀도** | phase 2 marquee opacity 추가 감소 (선택적) |

**구현 요소**:
- `contentReached` 상태 + `contentRef` ref + IntersectionObserver effect
- observer target = hero 다음 첫 실제 섹션 wrapper (ref를 동적으로 할당)
- `showPhase2Cue = phase === 2 && !contentReached`
- 카피: `char.sign ? "Signature Below" : char.expressions?.length ? "Expressions Below" : "Continue Below"`
- seam cue: eyebrow text + accent gradient line + pulse line (2회 재생)

**변경 파일**: `src/pages/CharDetail.jsx` (1개)
**연쇄 영향**: 파일 수 변동 없음. 내부 state 1개 + ref 1개 + effect 1개 + reset 1줄 확장.

**검증 최소 세트** (현재 live 코드 기준으로 정정):

> Signature는 hero 내부 프로필 이미지 아래로 이동됨. 독립 섹션 없음.
> `cueCopy`는 `Expressions Below` / `Continue Below` 2분기만 존재 (정확).
> `contentRef`는 항상 Expressions(또는 Navigation fallback)에 부착 (정확).

| 케이스 | 캐릭터 | 확인 항목 |
|---|---|---|
| sign 있음 | KHR (강하람) | 카피 **"Expressions Below"** (sign은 hero 내부이므로 다음 섹션은 Expressions), observer가 Expressions 진입 시 소멸 |
| sign 없음 (일반) | JGR (장그루) | 카피 "Expressions Below", observer가 Expressions 섹션 진입 시 소멸 |
| 텍스트 긴 캐릭터 | SY (서윤) | cue 위치가 프로필 패널과 겹치지 않고 자연스러운지 |

<!-- ✅ 승인 완료, 구현 완료. 문서를 live 코드 기준으로 정정함. -->

---

### 장그루(JGR) CharDetail 특별 인트로

**목적**: 재도전형 캐릭터 장그루만의 영화적 2-beat 시네마틱 인트로. 사이버펑크/HUD 대신 영화적 문법으로 차별화.

**상세 기획**: → `src/pages/chardetail_jgr_plan_sub.md`

**시퀀스 (v3 — 별도 렌더 블록 + cinematic 범위 확정)**:
```
[검은 화면]        : preload 대기 (char.image 사용 안 함 → 깜빡임 없음)
Beat 1 (0.3→5초)   : intro1 세피아+필름그레인+비네트+letterbox + "보고있어? 이게―..."
Beat 2 (5→9초)     : intro2 풀컬러+블룸 + "내 마지막 꿈이야."
Handoff (9→9.5초)  : dissolve (jgrFadingOut 0.5초)
Phase 2 (9.5초~)   : intro2 배경 + JGR 전용 크레딧 프로필 (순차 리빌)
                     → 하단에 bgDeep 페이드 전환 (cinematic 종료)
[Expressions]      : 공통 bgDeep 배경 복귀 (intro2 보이지 않음)
[Navigation/Footer]: 공통
* 클릭/wheel/touchmove/ESC 시 즉시 phase 2 skip
```

**설계 결정 (v4 — 분리 범위/fallback/배경 종료/Navbar/skip 확정)**:

| 결정 | 내용 |
|---|---|
| **완전 분리** | `JgrCharDetail`을 **module scope 별도 함수 컴포넌트**로 선언 (CharDetail 내부 중첩 ❌ → remount 리스크 방지). JGR 전용 state/effect(`jgrBeat`, `jgrAssetsReady`, `jgrFallback`, `jgrFadingOut`, preload, skip) 전부 `JgrCharDetail` 내부로 이동. parent CharDetail에는 JGR 관련 코드 0줄. |
| **fallback 주체** | **`JgrCharDetail` 내부**에서 자체 판단. preload 실패 시 JgrCharDetail이 공통 인트로와 유사한 fallback 화면(이름+태그라인)을 자체 렌더. parent로 돌려보내기 ❌ (early return 구조 유지). |
| **intro2 배경 종료** | `position: fixed` 배경 위에 `position: relative` hero 콘텐츠. hero 하단에 `minHeight: 100vh`의 **bgDeep 커버 div** (relative, z-index 위)를 배치하여 스크롤 시 intro2를 물리적으로 덮음. fixed 배경 자체를 제거하지 않되, 스크롤하면 bgDeep이 위로 올라와 완전히 가림. |
| **Navbar 복귀** | Expressions wrapper에 **IntersectionObserver (threshold 0.1)** 부착. 뷰포트 10% 진입 시 `navbarVisible=true` → Navbar opacity fade-in. hero 영역에서는 back link만. |
| **phase 2 payoff** | 순차 리빌: chapter(0s)→이름(0.3s)→line(0.5s)→role(0.7s)→tagline(1s)→brief(1.3s)→fields(1.6s~) |
| **skip 시 리빌 압축** | `skipped` boolean state. skip 경로에서는 모든 리빌 딜레이를 **0으로 압축** → 즉시 전체 표시. 일반 진입에서만 순차 재생. |
| **seam 검증 기준** | 모바일에서 hero 하단 20~30%에 Expressions 상단 eyebrow("Concept Art & Expressions")가 **실제로 보이는지** 시각 확인. 안 보이면 hero `minHeight`를 `90vh`로 조정하거나 Expressions 상단 여백 축소. |
| **Skip** | 클릭/wheel(preventDefault)/touchmove(preventDefault)/ESC + `overflow:hidden` |
| **z-index** | overlay 200 > Navbar 100 |
| **Handoff** | `jgrFadingOut` 500ms dissolve |
| **타이밍** | Beat 1: 0.3→5s (4.7초), Beat 2: 5→9s (4초), dissolve: 0.5초 |

**변경 파일** (live 코드 기준):
- `src/pages/CharDetail.jsx` — 기존 JGR state/effect 전부 제거 + `JgrCharDetail` module scope 함수 추가 + `isJGR` early return
- `src/data/characters.js` — 변경 없음
- `src/utils/cdn.js` — 변경 없음

**검증**:
- `/characters/janggru`: 검은 화면→Beat 1→Beat 2→dissolve→크레딧 순차 리빌→bgDeep 커버→Expressions
- `/characters/seoyun`: 기존 100% 정상 (JGR 코드 0줄 잔류)
- Skip: 클릭/wheel/ESC → 즉시 phase 2, 리빌 딜레이 0 (즉시 전체 표시)
- 배경 종료: Expressions 스크롤 시 intro2가 bgDeep 커버 뒤로 완전히 가려짐
- Navbar: Expressions 10% 진입 시 fade-in
- 모바일 seam: hero 하단에서 Expressions 상단 eyebrow가 살짝 예고되는지 확인
- 에셋 실패: JgrCharDetail 내부 fallback (이름+태그라인 자체 렌더)

<!-- ✅ 승인 완료, v4 구현 완료 (3bef079) -->

**Phase 요약**:

| Phase | 내용 | 항목수 | 영향도 |
|---|---|---|---|
| **1. 버그 수정** | ZIP 가드, --retry-failed(명시적 태스크 리스트), done+cooldown 분리, status(special scene 집계), mark_failed reason, 임시 파일, **zero-mask 상태 분리** | 7 | HIGH |
| **2. 산출물 안전** | 원본 보호(atomic write), **검열 커버리지 보강**, **이미지/모델/배치스크립트 경로 통합** | 3 | HIGH |
| **3. 코드 품질** | 공유 utils, pathlib, 미사용 import, 환경변수, UTC, 로깅, 함수 분할 | 7 | MEDIUM |
| **4. 타입 힌트** | public 함수 시그니처 어노테이션 | 1 | MEDIUM |

---

**핵심 의사결정 요약**:

**1) 검열 커버리지 보강 (2-2)** — plan_sub.md에 상세
- 빈틈 원인: **Step 8 Opening이 유력 가설** (5×5 커널 → 외곽 1~2px 순 수축), **Step 3 force crop이 공동 가설** (float→int bbox 경계 손실). 아직 확정 아님 — 테스트셋에서 비교 검증 필요.
- 해결: safety dilation 추가 + **ROI/crop 마스크를 dilation 후 AND로 재적용** (bbox 밖 번짐 방지)
- threshold 완화(0.5→0.45)는 테스트 결과에 따라 선택적 적용
- 검증: 원본 read-only, 결과는 `tools/test_samples/results/{before,after}/`에 격리 저장. 산출물 = preview + mask + stats.json. 최종 판정은 200% 확대 수동 검수.

**2) --retry-failed (1-2)** — 교차곱 문제 해결
- char×scene union은 불필요한 조합까지 재실행 → `[(char, scene)]` 명시적 태스크 리스트로 변경
- `generate_batch()`가 `retry_tasks` 인자를 직접 받도록 시그니처 수정

**3) done + cooldown (1-3)** — 카운터 분리
- `done`(진행률, skip 포함) + `api_calls_since_cooldown`(API 성공 횟수, 쿨다운 전용) 2개 분리

**4) show_status (1-4)** — special scene 집계
- state에 901~911 기록 존재 → ALL_SCENES 범위만 카운트, special은 별도 표시. ZeroDivisionError 방어도 포함.

**5) zero-mask 상태 분리 (1-7, 신규)**
- 모델 미가용/정상 통과/추론 실패가 동일한 `clean (skip)`으로 합쳐지는 문제 → 3가지 상태를 로그+반환값으로 구분. 배치 시 모델 미가용 경고 출력.

**6) 경로 통합 (2-3)** — 3가지 대상
- 이미지 경로(`OUTPUT_BASE`/`BASE_DIR`) + 모델 경로(`MODEL_PATH`) + 배치 래퍼(`_run_censor_*.sh`)
- `_run_censor_*.sh`는 존재하지 않는 CLI 옵션 호출 중 → deprecated 또는 재작성 판단 필요

**변경 파일**:
- `tools/asset_generator.py` — Phase 1(1-1~1-5) + Phase 2(경로) + Phase 3~4
- `tools/auto_censor.py` — Phase 1(1-6, 1-7) + Phase 2(전부) + Phase 3(utils)
- `tools/extract_config.py` — Phase 3(pathlib, 로깅)
- `tools/_run_censor_*.sh` — deprecated 또는 재작성
- **신규** `tools/utils.py`, `tools/test_samples/{input,results}/`

**권장 배치**: 1차(Phase 1+2) → 2차(Phase 3) → 3차(Phase 4)

**검증 방법**:
- `--status`로 special scene 분리 집계 확인
- `--retry-failed --dry-run`으로 정확한 (char, scene) 조합만 출력 (교차곱 없음)
- `--coverage-test --result-dir`로 before/after 격리 + 200% 확대 수동 검수
- 경로: `auto_censor.py --help`, `asset_generator.py --status` 에러 없이 실행


---

---

### 사이트 총체적 최적화 (research.md §17 감사 기반)

**목적**: 12개 감사 항목을 5개 커밋 단위로 해소. 성능/접근성/구조 안정성/UX 동시 개선.

**상세 감사**: → `research.md` §17 | **상세 구현**: → `src/plan_sub.md`

**커밋 단위 (피드백 반영: 항목 재편성)**:

| 커밋 | 내용 | 변경 파일 | 누가 |
|---|---|---|---|
| **①구조** | PageLayout→wrapper, Hook 소유권 정리 | `PageLayout.jsx` + **16개 페이지** | Claude |
| **②모달 패스** | lightbox popstate + dialog + div→button + **HeroSlider 구조 분리** (A-2+D-1+D-2+D-4 통합) | `Gallery.jsx`, `CharDetail.jsx`, `SvgIntro.jsx`, `Navbar.jsx`, `HeroSlider.jsx` | Claude |
| **③성능 hot** | Particles fixed+RAF제어, transition:all **hot path 5개**, reduced motion (CSS+JS) | `Particles.jsx`, 5개 hot path, `index.html` | Claude + 사용자 검수 |
| **④성능 cold** | transition:all **나머지 20개** + Hero preload 분산(대기 방식) + preconnect | 20개 파일, `HeroSlider.jsx`, `index.html` | Claude + 사용자 hover 검수 |
| **⑤접근성** | 이미지 lazy/placeholder, 터치 타깃, 대비 | 여러 | **사용자 디자인 판단** + Claude |

---

#### ① 구조: PageLayout + Hook 소유권 (최우선)

**isMobile 소유권 (확정)**: PageLayout 유지 + 페이지 직접 `useIsMobile()` 호출. Context 일원화 ❌ — 중복 호출을 감수하되 구현 단순성 우선. `useIsMobile`은 **resize listener** 기반(matchMedia 아닌)이나, listener 추가 비용은 여전히 낮음.

**변경 범위 (16개 파일)**:
- `PageLayout.jsx`: render prop 분기 제거 → 항상 `{children}`
- 기존 11개: Contact, Gallery, SvgIntro, Works, Mode× 6개, ModeFreeplay
- **추가 5개**: ModeAudition, Updates, NotFound, DistrictDetail(2곳 — 17행, 34행)
- 하나라도 빠지면 **즉시 런타임 오류**.

**디자인 침해**: 없음. 시각 결과 100% 동일.

---

#### ② 모달/인터랙션 접근성 패스 (A-2 + D-1 + D-2 통합)

같은 파일의 같은 DOM 노드를 건드리는 3개 항목을 **한 커밋으로 통합**.

**요소 교체 3규칙** (확정):
1. **이동** → `<a>` / `<Link>` (URL 변경이 목적)
2. **모달 트리거** → `<button>` (Gallery:433, SvgIntro:97, CharDetail:1060 등)
3. **중첩 인터랙션 금지** — `<a>` 안 `<button>` (HeroSlider:322,326) → 구조 분리 (별도 형제 요소로)

**Gallery lightbox state 안정화** (popstate 전제):
- 현재: 배열 인덱스(Gallery.jsx:131,550)에 의존 → filtered 배열 변동 시 "뒤로가기=같은 이미지 닫기" 계약 깨짐
- 변경: `src` 또는 `sceneNum` 같은 **stable key** 기반으로 modal state 전환 후 popstate

| 파일 | popstate | dialog | div→button | 추가 작업 |
|---|---|---|---|---|
| `Gallery.jsx` | lightbox | overlay | 이미지 카드 | **stable key 전환** |
| `CharDetail.jsx` | lightbox | overlay | expr preview | — |
| `SvgIntro.jsx` | 이미 있음 | 추가 | 템플릿 카드 | — |
| `Navbar.jsx` | 모바일 메뉴 | 추가 | — | — |
| `HeroSlider.jsx` | — | — | — | **a안button 구조 분리** |

**디자인 침해**: button reset 필요. 사용자 시각 확인.

> HeroSlider `<a>` 안 `<button>` 정리(D-4)는 이 ② 커밋에서 처리. ⑤에서는 다루지 않음.

---

#### ③ 성능 hot path (최우선)

**B-1. Particles.jsx 캔버스 + RAF 최적화**:
- 캔버스: `scrollHeight` → `window.innerHeight`, `position: fixed`
- 저사양: `hardwareConcurrency <= 2` 시 파티클 절반
- **RAF 비용 제어** (높이만 줄여도 full-screen repaint는 계속됨):
  1. **visibility pause**: `document.hidden` 시 rAF 중단 (`visibilitychange` 이벤트)
  2. **reduced-motion short-circuit**: `matchMedia("(prefers-reduced-motion: reduce)")` 시 rAF 미시작
  3. **route opt-out**: 기존 unmount 패턴 유지 (JGR 시네마틱 등). 추가 opt-out 라우트 없음.
- **cleanup 보장**: visibilitychange listener 등록/해제 + **active rAF 단일 보장** (탭 복귀 시 중복 rAF 가드)
- **디자인 침해**: `fixed`면 시각 차이 거의 없음. 사용자 검수.

**B-2-hot. transition:all 제거 — hot path 5개만**:
- `Navbar.jsx` (4곳), `HeroSlider.jsx` (2곳), `CharDetail.jsx` (12곳), `ScrollNav.jsx` (4곳), `Home.jsx` (4곳) = **26곳**
- 이 5개 파일이 모든 페이지/스크롤에서 항상 활성 → 최대 체감.
- 나머지 20개 파일(67곳)은 ④에서 처리.

**B-3. prefers-reduced-motion** (CSS + JS 양면):
- **CSS** (`index.html`): `@media (prefers-reduced-motion: reduce)` — 전역 keyframes override + `scroll-behavior: auto`
- **JS 컴포넌트**: `Particles.jsx` rAF 중단, `HeroSlider.jsx` 자동재생 비활성
- **JS smooth scroll 호출** (CSS만으론 안 잡히는 곳): `Navbar.jsx`(36,42행), `ScrollNav.jsx`(42,46행), `ModeAudition.jsx`(154행) 등의 `scrollIntoView({behavior:"smooth"})` → `matchMedia` 체크 후 `behavior: "auto"` 분기
- 범위: main.jsx 전역 `scroll-behavior` + 개별 JS 호출 모두 포함

---

#### ④ 성능 cold path + 네트워크

**B-2-cold. transition:all 나머지 20개 파일** (67곳):
- CharCarousel, CityMap, DistrictCard, DistrictDetail, Gallery, GameModes, TriangleNav, Mode* 8개, Contact, Works, Updates, SvgIntro
- hot path 적용 후 문제 없으면 동일 패턴으로 일괄 치환.
- **사용자 역할**: hover 효과 많은 컴포넌트 (GameModes, TriangleNav, Gallery) 검수.

**C-1. Hero preload 전략** (autoplay 연동 필수):
- 현재: 9장 동시 preload → autoplay 즉시 시작(HeroSlider.jsx:33) → 미로드 슬라이드 빈 화면
- 변경: **최소 현재+다음 2장 로드 후 autoplay 시작**. 나머지는 순차 분산.
- autoplay 인덱스 전환(HeroSlider.jsx:35) 시 다음 이미지 로드 여부 체크 → **미로드면 현재 슬라이드 유지, 준비되면 전환 ("대기" 확정, skip ❌)**.

**C-2. preconnect** (사용자 직접 — 3줄):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://img.bluehair.blue" />
```

---

#### ⑤ 접근성/이미지 (이후, 사용자 디자인 판단 포함)

**C-3. 이미지 lazy/placeholder**: above-the-fold은 eager 유지.
**D-3. 저시력 대비/터치 타깃**: **사용자 판단 필수** — 토큰 값 변경은 사이트 전체 영향.
~~**D-4**~~: ②에서 처리 완료 (HeroSlider 구조 분리).

---

**역할 분담 요약**:

| 항목 | 구현 주체 | 사용자 역할 |
|---|---|---|
| ① 구조 | Claude | 빌드 후 **16개 페이지** 시각 확인 |
| ② 모달 패스 | Claude | lightbox 뒤로가기 + button 시각 + HeroSlider 구조 확인 |
| ③ 성능 hot | Claude | Particles 시각 + hover 효과 검수 |
| ④ 성능 cold | Claude | hover 효과 검수 (GameModes/TriangleNav/Gallery) |
| ④ preconnect | **사용자 직접** | index.html 3줄 추가 |
| ⑤ 접근성 | Claude + **사용자 판단** | 대비/터치 디자인 결정 |

**디자인 침해 위험**:

| 항목 | 위험도 | 대응 |
|---|---|---|
| Particles fixed | 중간 | 사용자 시각 비교 검수 |
| transition:all 제거 | 중간 | hot path 먼저 → 문제 없으면 cold 확장 |
| div→button | 낮음 | style reset + 사용자 확인 |
| 대비/터치 (D-3) | **높음** | 사용자 디자인 판단 필수 |

<!-- ✅ 커밋 ①②③④ 구현 완료. ⑤는 사용자 디자인 판단 후 진행. -->
<!-- 모든 피드백 반영 완료 (최종):
  - 문서 정합성: 요약표/역할분담/plan_sub 모두 16개 파일 기준 통일
  - 기술 근거: useIsMobile = resize listener (matchMedia 아님) 정정
  - HeroSlider D-4: ②에만 고정, ⑤에서 삭제
  - Hero preload: “대기” 확정 (skip ❌)
  - Particles: cleanup 보장 + active rAF 단일 가드 명시
  - isMobile: Context ❌, 중복 호출로 확정
  - route opt-out: 기존 unmount 패턴만 유지, 추가 라우트 없음
-->
---

## 대기열 (우선순위순)

> plan.md에 상세 기획이 작성되기 전의 작업 후보 목록입니다.
> 사용자가 선택하면 "현재 기획 중" 섹션으로 승격되어 상세화됩니다.

### 긴급
1. ~~**NSFW 이미지 검열 배치 실행**~~ ✅ 완료 (264/855장 검열, 흰색+edge_blur=9)
2. **에덴챗 로어북 삽입 테스트** — 동시 활성 성능, 상태창 렌더링 확인

### 중간
3. **Works 페이지 확장** — 추가 작품 등록
4. **Phase 5: 프롬프트 품질 개선** — 자가점검/감정잔여/복선스케줄러
5. **검열 모델 + 후처리 한계 보완** — 모델 미감지율 + 후처리 커버리지 + 경계 정밀도 종합 개선

### 낮음
6. **모바일 성능 최적화** — 시네마틱 효과 검수
7. **README.md 커스터마이즈** — Vite 기본 → 프로젝트 맞춤

---

## 완료 이력

> 구현이 완료된 기획은 여기로 이동합니다. 접근 방식과 결과만 간략히 기록.

### 2026-04-05: UX 수정 + CityMap 히트박스 등각 보정
- JGR intro 타이밍: Beat 2 at 4.2s, phase 2 at 8.2s (0.8초 빨라짐)
- ← PRIME CITY: `Link to="/"` → `navigate(-1)` + fallback (14개 페이지)
- CityMap: Hype Road 상단 확장 폴리곤 + Terrace 확장/오버라이드 폴리곤 (등각 뷰 보정)
  - 타원 링 모델의 한계를 SVG 폴리곤 오버레이로 해결
  - SVG z-order: 링 → Terrace 확장 → Hype 상단 → Terrace 우측 오버라이드 (최상위)

### 2026-04-05: 사이트 총체적 최적화 (①②③④)
- ① 구조: PageLayout render prop 제거, 16개 페이지 Hook 최상단 이동
- ② 모달 패스: Gallery/CharDetail lightbox popstate, dialog semantics, div→button, HeroSlider 구조 분리, Gallery stable key
- ③ 성능 hot: Particles fixed+RAF+visibility+reduced-motion, transition:all hot 5개 26곳, prefers-reduced-motion CSS+JS
- ④ 성능 cold: transition:all 나머지 21곳, Hero staged preload(대기 방식)
- ⑤ 접근성: 사용자 디자인 판단 대기 (대비/터치)

### 2026-04-05: 장그루(JGR) CharDetail 전면 개편 v4
- JgrCharDetail: module scope 완전 분리 (parent JGR 코드 0줄)
- 영화적 2-beat 시네마틱 인트로: Beat 1(세피아 4.7초) → Beat 2(풀컬러 4초) → dissolve handoff
- Phase 2: intro2 fixed 배경 + 영화 크레딧 순차 리빌 + bgDeep 커버로 cinematic 종료
- Preload(allSettled) + 자체 fallback + skip(클릭/wheel/touch/ESC, 리빌 압축) + scroll lock
- Navbar: hero 숨김, Expressions IO(0.1)에서 복귀
- 4차 피드백 사이클: preload/fallback 상태기계, dissolve unmount 문제, scroll lock, z-index, 모바일 seam

### 2026-04-04: CharDetail seam cue + 캐릭터 이미지 정비
- CharDetail phase 2 seam cue: 흐름형 배치, 동적 카피, IntersectionObserver 소멸
- 캐릭터 사인 이미지 시스템 (`{CHAR}/sign.webp`): characters.js + CharCarousel + CharDetail
- 키비주얼/프로필 15명 전원 CDN 통일 (`cdnUrl("{CHAR}.webp")` + `cdnUrl("{CHAR}/profile.webp")`)
- KHR 키비주얼+사인, ERK/SY/NHR/LSH 키비주얼 재업로드, ASSET_VERSION 3→4

### 2026-04-04: tools/ Python 파이프라인 개선 (Phase 1~4) + R2 업로드
- Phase 1 (버그 7건): ZIP 가드, --retry-failed 명시적 태스크 리스트, done+cooldown 분리, status special scene 집계, mark_failed str key+reason, 임시 파일 race condition, zero-mask 상태 분리
- Phase 2 (산출물 3건): atomic write, 검열 커버리지 보강(safety dilation+ROI re-clamp), 이미지/모델/배치 경로 통합
- Phase 3 (코드 품질 7건): utils.py 추출, pathlib 통합, base64 삭제, 환경변수 토큰, UTC, 로깅, generate_batch→_generate_one 분할
- Phase 4 (타입 힌트): public 함수 시그니처 어노테이션
- 추가: 검열 색상 흰색 기본값, edge_blur 안티에일리어싱(기본 9), --coverage-test 검증 인프라
- NSFW 배치 검열 실행: 855장 → 264장 검열, 0 실패
- R2 업로드: 검열 264장 + 키비주얼 15장 + 프로필 15장, ASSET_VERSION 2→3
- **교훈**: 키비주얼(`ent/{CHAR}.webp`)과 프로필(`ent/{CHAR}/profile.webp`)을 혼동하지 말 것. 업로드 소스는 반드시 `연예계/char_img/` 원본 폴더에서.

### 2026-04-03: 프로젝트 파일 정리 + 문서 체계 구축
- 루트 콘텐츠 파일 7개 → docs/, 스크립트 → tools/, 임시파일 삭제
- research.md/research_sub.md 9개 폴더 분석 (16섹션 종합)
- CLAUDE.md 분리: plan.md(기획) + idea.md(브레인스토밍) + CLAUDE.md(표지판)

### 2026-04-02: 자동 검열 파이프라인 완성
- 진화: 수평밀도→핑크contour→NudeNet(실패)→ntd11 YOLO-seg→형태복원 최종
- ROI 제한 → CLOSE → flood fill → best component → convex hull → opening

### 2026-04-01~02: 소개 사이트 대규모 개선
- Gold & Azure Dualism 색상 시스템
- 구역 상세 페이지 오버홀 (히어로+랜드마크+로어)
- 챗봇 HTML 오버홀 (CSS vars, 접기 UX)
- 프롬프트 압축 84KB→56KB (33%)
- SVG Worker 8개 XSS 수정 + 보안 헤더
- 에셋 1,125장 + 특수 90장 생성/업로드
