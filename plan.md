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
- **교훈**: 키비주얼(`ent/{CHAR}.webp`)과 프로필(`ent/{CHAR}/profile.webp`)을 혼동하지 말 것. 업로드 소스는 반드시 `C:\...\캐릭터 이미지\` 원본 폴더에서.

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
