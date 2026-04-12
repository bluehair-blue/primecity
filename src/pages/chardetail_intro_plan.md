# CharDetail 시네마틱 인트로 + 사이트 로딩 개편 계획 v5

> **기존**: JGR만 시네마틱 인트로, CharCarousel 이미지 preload 없음
> **목표**: (1) 키비주얼 보유 8명 시네마틱 인트로 추가  (2) 사이트 전반 이미지 로딩 개선
> **패턴**: CLAUDE.md 규칙 준수 — module scope 함수 + early return

---

## v5 변경사항 (사용자 피드백 4차 반영, 2026-04-12)

### 배경

NHR FogIntro 를 5회 수정 반복(`0b67995` → `26f43ce` → `0c25d50` → `139b053` → `5e9f89c`)하고도 결과물 품질이 낮았음. 공통 원인을 분석해 **이후 모든 시네마틱 인트로(신규/기존 재점검 포함)에 필수 적용될 4대 원칙**을 확정. NHR 은 본 원칙에 맞춰 **전면 재설계**(§2 F 참조).

### 4대 원칙 (v5 규범)

#### 원칙 1. 줌인 특정성 (Zoom Specificity)

- 모든 Phase 0 인트로는 캐릭터 KV 이미지의 **의미 있는 디테일**에 줌인해야 함.
- "의미 있는 디테일" 예시:
  - 얼굴 구성요소: 눈매, 입꼬리, 볼, 귀
  - 시그니처 오브젝트: NHR 손목시계·한쪽 이어폰, JSH 볼펜, HSR 카드, HSE 책등
  - 바디랭귀지: 포즈, 손동작, 머리카락 드리프트
- **금지**: 근거 없는 좌표 (`25% 67%`, `75% 18%` 같은 임의값). v4 NHR FogIntro 가 이에 해당해 폐기.
- **필수**: 줌 좌표 선정 시 실제 KV 이미지(`{CHAR}/key.webp`)를 로컬/브라우저에서 직접 확인하고, 각 좌표가 어떤 디테일을 프레이밍하는지 **plan 에 주석 기록**.
- 줌 scale 권장: **1.8~2.2** (v4 상한 2.2 유지, 화질 손상 방지).

#### 원칙 2. 비트 여유 (Beat Breathing Room)

- 각 beat 는 **전환 시간 외 1초 이상의 정적 보유 시간(static hold)** 확보.
- 공식: `beatDuration ≥ transitionDuration + 1000ms`
- 빠른 전환(0.3~0.5s)으로 "휙휙" 넘어가는 연출 금지. v4 NHR FogIntro 의 Beat 2(850ms hold) · Beat 3(200ms hold) 가 이 원칙을 위반해 폐기.
- 대사(quote) 표시 beat 는 **읽을 시간**을 최소 1.2초 더 확보.
- 검증 방법: 각 plan 섹션에 **비트 타임라인 표**를 반드시 명시하고 `transition` / `hold` 열을 분리 기록.

#### 원칙 3. KV 네거티브 스페이스 (KV Negative Space)

- KV 이미지는 **화면을 꽉 채우지 않음** — 최소 **20~30% 네거티브 스페이스** 확보.
- Phase 1 `keyVisualStage: true` 옵션(top 70% + reflection 22% = bottom 8% void)을 기본으로 하되, Phase 0 에선 더 과감한 프레이밍 선택 가능:
  - **Top-stage**: top 70% 이미지 + bottom 30% 이펙트 공간 (NHR v5 채택)
  - **Center-strip**: 중앙 세로 60% 높이 + 상하 20% 공백
  - **Spotlight-circle**: 원형 마스크 + 주변 네거티브
  - **Side-stage**: 좌/우 60% 이미지 + 나머지 텍스트·이펙트
- 네거티브 스페이스는 **검정 블랙박스가 아니라** 이펙트로 채워야 함:
  - fog · particles · bgMarquee · grid · 캐릭터 컬러 글로우
  - 이미지 경계는 `linear-gradient` mask 로 자연스럽게 dissipate 시킬 것

#### 원칙 4. 캐릭터 개성 이펙트 (Character-Unique, No-Cheap)

- 이펙트는 **캐릭터 모티프와 1:1 매핑**되어야 함 (NHR=안개, JSH=컷어웨이, KHR=카메라, MIL=물결, MMR=플래시, LSH=글리치, HSR=카드딜, HSE=페이지넘김).
- **금지 이펙트 (허접함 유발)**:
  - ❌ TV 정적 노이즈 canvas (80×45 픽셀 랜덤) — **v4 NHR 에이전트가 택한 오답**
  - ❌ CRT 스캔라인 단독 사용 (디지털 감성이 "안개"와 충돌)
  - ❌ 단색 백플래시 반복 (흰색/검정 번쩍) — MMR flash 중에도 남용 금지
  - ❌ 단일 블러 transition 만으로 구성된 인트로
- **권장 이펙트 (품질 담보)**:
  - ✅ **유기체 움직임**: SVG `feTurbulence` + `feDisplacementMap`, 다층 semi-transparent gradient drift
  - ✅ **캐릭터 컬러 글로우**: `char.color` 기반 `radial-gradient` pulse, `box-shadow` halo, `text-shadow` aurora
  - ✅ **Chromatic aberration**: RGB split 1~2.5px (reveal 순간 정점 → hold 동안 수렴)
  - ✅ **모션 블러**: `filter: blur(Xpx)` during transition → 0 on hold
  - ✅ **Bloom / Lens flare**: 조명 캐릭터(MIL 무대, MMR 플래시, KHR 카메라)
  - ✅ **Parallax 레이어링**: 이미지 + fog/particles 가 상이한 속도로 drift
- 이펙트는 **켜졌다/꺼졌다** 이진 스위칭이 아니라, beat 진행에 따라 **생성 → 유지 → 해제** 곡선을 그릴 것.

### v5 체크리스트 (신규/재작업 Intro 모두)

```
[ ] KV 이미지를 실제로 확인하고 줌 좌표 3~4개 선정 완료?
[ ] 각 좌표가 "어떤 디테일"을 프레이밍하는지 주석 기록 완료?
[ ] 비트 타임라인 표에 transition / hold 분리 기록 완료?
[ ] 모든 beat 의 hold ≥ 1000ms 검증 완료?
[ ] KV 네거티브 스페이스 최소 20% 확보했는가?
[ ] 네거티브 스페이스를 이펙트로 채우는 계획 존재하는가?
[ ] 금지 이펙트 목록에 해당하지 않는가?
[ ] 이펙트가 캐릭터 모티프와 1:1 매핑되는가?
[ ] 빌드 성공 + 실기기 3종 테스트 (desktop/mobile/reduced-motion)?
```

### 적용 범위

- **즉시 재작업 (우선순위 1)**: NHR FogIntro — Section F 전면 재설계 (본 문서)
- **기존 구현 재점검**: JSH CutawayIntro · KHR SunriseIntro · MIL RippleIntro — v5 원칙 위반 사항이 있는지 사용자와 함께 확인 후 필요 시 재작업
- **신규 구현 전 사전 검토**: LSH(7a) · MMR(7b) · HSR(7d) · HSE(7e) — 기존 plan 스켈레톤을 v5 체크리스트에 맞춰 갱신한 후 진행

---

## v4 변경사항 (사용자 피드백 반영, 2026-04-10)

### 전역 원칙 추가

- **인트로부터 중앙 대사** — JGR 패턴을 따라 **Phase 0(인트로)부터 캐릭터 대사가 화면 중앙에 노출**. 기존 "마지막 비트에만 등장" 설계 폐기. 모든 캐릭터에 공통 적용.
- **유연한 클로즈업** — Phase 0 zoom은 화질 저하를 막는 선에서 유연하게. 권장 scale 상한 **2.0~2.2** (기존 2.5~2.8 과다). `zoomSequence`/클로즈업 수치는 모두 이 원칙에 맞춰 완화.

### 개별 수정사항

- **MMR 시퀀스 전면 재설계 (v4.1)** — Phase 0는 **댓글 스크롤 → 모션 블러 전환 → key.webp 3단 줌인** 구성.
  - 댓글 스크롤 구간(~2.5초)이 animated WebP(17MB) 의 백그라운드 decode 창구 역할
  - 모션 블러는 속도감 연출 (댓글 흐름의 속도가 zoom으로 "떨어지는" 느낌)
  - 3단 줌: **좌측 상단 → 좌측 하단 → 우측 중반** (Z자 시선 궤적)
  - 댓글은 **15줄** 로 확장 (기존 4~5줄 → 더 풍성한 피드)
  - `PRELOAD_BUDGET_OVERRIDE.MMR` 제거 가능 (Phase 0 댓글 구간이 decode 시간 흡수)
- **focusBox 일괄 확장** — 모든 캐릭터의 `w`/`h` 값을 **+10% 확장** (cx/cy 유지). 화질 안전 영역을 넓혀 과도 클로즈업 방지.

### 구현 정책

- **1 캐릭터 완전 구현 → 사용자 피드백 → 다음 캐릭터**. **절대 일괄 진행 금지**. 각 Step은 전용 컴포넌트 작성 + 레지스트리 등록 + 빌드 검증 + 사용자 승인까지 완료한 뒤에만 다음 Step 착수.

### JSH 상태

v3 대비 유지: 6400ms 3비트 켄 번즈 구조 ("과부하" 의도된 연출).

v4 적용 사항:

- 대사가 beat 3에만 등장하던 것 → **beat 1부터 중앙에 노출** (JGR 패턴)
- `zoomSequence` scale 2.8/2.5 → **2.0/1.9** 로 완화 (화질 우선)
- `CutawayIntro.jsx` 리팩터링 필요 (Step 5b 이전에 Step 5a로 선행)

---

## 0. 대상 캐릭터

| 캐릭터 | 코드 | 트랜지션 | introLabel |
|---|---|---|---|
| 진시혁 | JSH | **컷 어웨이** | Jin Sihyuk / Verdict |
| 강하람 | KHR | **선라이즈** | Kang Haram / Daybreak |
| 이서하 | LSH | **글리치** | Lee Seoha / Indifference |
| 밀라 | MIL | **물결** | Mila / Instinct |
| 미모리 | MMR | **플래시** | Mimori / Spotlight |
| 나하린 | NHR | **안개** | Naharin / Enigma |
| 한소리 | HSR | **카드 딜** | Han Sori / Last Hand |
| 하시은 | HSE | **페이지 넘김** | Ha Sieun / Diligence |
| 장그루 | JGR | **기존 유지** | (별도 컴포넌트) |

미보유: SY, ERK, ELA, NIA, RAY, LPS — 키비주얼 생성 후 추가

---

## 1. 아키텍처 결정사항

### 1-1. 성능 규칙

| 규칙 | 상세 |
|---|---|
| **Timeout → Detail Shell** | keyVisual + introAssets 프리로드 시작 → **500ms 초과 시 시네마틱 포기, Detail Shell로 직행** |
| **LoadingShell** | route 진입 직후 progress bar 표시 (asset-count 기반 `loadedAssets/totalAssets` + easing), Suspense spinner와 별개 |
| **Phase 0~1 레이어 비활성화** | Particles, marquee, holo ring, ghost image → Phase 2 진입 시에만 활성화 |
| **reduced-motion** | `matchMedia('(prefers-reduced-motion: reduce)')` → Phase 0 건너뜀, keyVisual ready면 Phase 1 직행 |

> "Cinematic optional / Detail guaranteed" — intro는 포기 가능하지만 최종 Detail 도달은 반드시 보장.

### 1-2. 데이터 구조 (characters.js)

```js
// 키비주얼 보유 캐릭터에만 추가
keyVisual: cdnUrl("{CHAR}.webp"),
introStyle: "glitch",                              // INTRO_STYLE_CONFIG 키
introAssets: [cdnUrl("{CHAR}/intro1.webp")],        // 트랜지션 전용 이미지 (선택, 빈 배열 가능)
introLabel: "Lee Seoha / Indifference",             // 영문 챕터
quoteSequence: ["하아… 또?"],                        // 1비트/2비트 공통. 없으면 [char.tagline]
focusBox: {
  desktop: { cx: 52, cy: 34, w: 34, h: 46 },       // 안전 영역 (cx/cy=중심, w/h=범위%)
  mobile:  { cx: 58, cy: 30, w: 42, h: 54 },
},
introComments: ["미모리 뭐야", "카메라 진짜 잘 받네"], // MMR 전용, 선택
```

**필드 역할:**
- `quoteSequence`: 1비트 = 길이 1, 2비트 = 길이 2. 없으면 `[char.tagline]` fallback
- `focusBox`: cx/cy → objectPosition 파생, w/h → zoom clamp + 모바일 크롭 안전 영역
- `introComments`: MMR 전용 댓글 문구. characters.js 콘텐츠 데이터
- `keyVisual` vs `image`: 역할 분리 유지 (풀스크린 배경 vs 카드/히어로)

**분리 원칙:**
- `characters.js` → 콘텐츠 데이터만
- `INTRO_STYLE_CONFIG` → 표현 설정 (duration, letterbox, mobileFallback 등)
- loading bar 상태 → 공통 preload hook/state (INTRO_STYLE_CONFIG에 넣지 않음)

### 1-3. Capability 테이블 (코드 상수)

```js
const INTRO_STYLE_CONFIG = {
  cutaway:  { duration: 1700, letterbox: true,  requiresSvgFilter: false, mobileFallback: null,           typewriter: true  },
  sunrise:  { duration: 2500, letterbox: false, requiresSvgFilter: false, mobileFallback: null,           flare: true       },
  glitch:   { duration: 2800, letterbox: false, requiresSvgFilter: false, mobileFallback: "simpleGlitch", layers: 3         },
  ripple:   { duration: 3000, letterbox: false, requiresSvgFilter: true,  mobileFallback: "simpleRipple", svgId: "ripple"   },
  flash:    { duration: 2000, letterbox: false, requiresSvgFilter: false, mobileFallback: null,           flashes: 3,
              commentOverlay: true, commentDuration: 900, commentRows: 5 },
  fog:      { duration: 3500, letterbox: false, requiresSvgFilter: false, mobileFallback: null,           fogLayers: 2      },
  cardDeal: { duration: 2000, letterbox: false, requiresSvgFilter: false, mobileFallback: null,           perspective: 1200 },
  pageFlip: { duration: 2200, letterbox: false, requiresSvgFilter: false, mobileFallback: null,           direction: "ltr"  },
};
```

> MMR flash의 `commentOverlay` 플래그 + 문구는 `char.introComments`에서 읽음

### 1-4. 분기 구조 (CharDetail.jsx)

```
CharDetail()
  ├─ if (char.id === "janggru") → JgrCharDetail (기존 유지, 별도 컴포넌트)
  ├─ if (char.keyVisual) → CinematicCharDetail (공통 뼈대 + 트랜지션 분기)
  └─ else → DefaultCharDetail (기본형)
```

**하단 공통 섹션 추출 (3갈래 중복 방지):**
```
CharSections — 공통 하단 (module scope 함수)
  ├─ ExpressionsGrid (표정 그리드)
  ├─ ProfileInfo (프로필 카드)
  ├─ Navigation (이전/다음 캐릭터)
  ├─ Lightbox
  └─ Footer
```

### 1-5. Keyframes 배치

| 위치 | 내용 |
|---|---|
| `index.html <style>` | 공용 keyframes (cinemaCutIn, cinemaClipUp, cinemaGlitch, cinemaFlash, cinemaFog, cinemaCard, cinemaPage, cinemaRipple) |
| 코드 상수 | 캐릭터별 수치 차이 |
| 인라인 style | 런타임 값만 (phase 기반 opacity, transform) |

---

## 2. 트랜지션 상세

> **전역 원칙 (v4)**:
>
> - 모든 인트로는 **Phase 0 첫 비트부터 대사가 화면 중앙에 노출** (JGR 패턴). 레터박스가 있는 JSH만 중앙 정렬을 레터박스 안쪽 기준으로 유지.
> - 클로즈업 scale은 **2.0~2.2 상한**. WebP 원본 해상도 한계를 넘지 않도록 보수적으로.
> - Phase 0 → Phase 1 교차는 overlay opacity 1→0 (400~600ms), key 이미지의 scale/translate는 이 구간에 건드리지 않음.

### 공통 코드 패턴 (Shared Patterns)

모든 Intro 컴포넌트가 따르는 공통 구조. 각 컴포넌트는 이 패턴을 기준으로 부위만 차별화.

#### P1. 컨테이너 골격

```jsx
export default function XxxIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      // ... beat transitions ...
      setTimeout(() => setFadingOut(true), config.duration - 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [config.duration]);

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* layers */}
    </div>
  );
}
```

#### P2. 중앙 대사 오버레이 (CenteredQuote — shared)

> **공용화 결정 (Step 5b 시점)**: Step 5a(JSH)에서 `CutawayIntro.jsx` 내 모듈 스코프 함수로 검증됨. Step 5b 착수 시점에 `src/components/cinematic/CenteredQuote.jsx` 로 **승격**하여 모든 Intro 컴포넌트가 import. JSH 도 import 방식으로 전환(내부 정의 삭제).

**파일**: `src/components/cinematic/CenteredQuote.jsx` (Step 5b 시작 시 생성)

```jsx
/* ══════════════════════════════════════════════════════════
   CenteredQuote — shared quote overlay for all Intros
   ------------------------------------------------------------
   Props:
     - char        : character object (quoteSequence, name, agency, color)
     - isMobile    : boolean
     - emphasis    : "subtle" | "hero" — size/color scale
     - show        : boolean — opacity/transform gate
     - quoteIndex  : number (default 0) — for 2-beat sequences (NHR/HSR/HSE)
     - glitch      : boolean (default false) — LSH glitch sync flag
     - blurred     : boolean (default false) — MMR motion blur beat
   ══════════════════════════════════════════════════════════ */
export default function CenteredQuote({
  char,
  isMobile,
  emphasis = "subtle",
  show,
  quoteIndex = 0,
  glitch = false,
  blurred = false,
}) {
  const quote =
    char.quoteSequence?.[quoteIndex] ||
    char.quoteSequence?.[0] ||
    char.tagline ||
    "";
  const isHero = emphasis === "hero";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isMobile ? "0 24px" : "0 48px",
        pointerEvents: "none",
        opacity: show ? 1 : 0,
        transform: show
          ? (blurred ? "translateY(-12px) scale(1)" : "translateY(0) scale(1)")
          : "translateY(16px) scale(0.96)",
        filter: blurred ? "blur(8px)" : "none",
        transition:
          "opacity 0.8s ease-out, transform 1.0s ease-out, filter 0.35s ease-out",
        animation: glitch ? "cinemaGlitchText 2.4s ease-out" : "none",
      }}
    >
      {isHero && (
        <p
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 11 : 14,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: char.color,
            margin: "0 0 14px",
            textShadow: "0 2px 20px oklch(0 0 0 / 0.85)",
          }}
        >
          {char.agency}
        </p>
      )}

      {isHero && (
        <h1
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile
              ? "clamp(58px,16vw,84px)"
              : "clamp(84px,10vw,144px)",
            fontWeight: 700,
            color: "oklch(0.99 0 0)",
            margin: "0 0 20px",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: "0 6px 48px oklch(0 0 0 / 0.9)",
          }}
        >
          {char.name}
        </h1>
      )}

      <p
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isHero
            ? (isMobile ? 17 : 24)
            : (isMobile ? "clamp(14px,4vw,18px)" : "clamp(16px,1.8vw,22px)"),
          fontStyle: "italic",
          fontWeight: isHero ? 500 : 400,
          color: isHero ? char.color : "oklch(0.88 0 0)",
          margin: 0,
          wordBreak: "keep-all",
          textShadow: isHero
            ? "0 2px 24px oklch(0 0 0 / 0.9)"
            : "0 2px 18px oklch(0 0 0 / 0.85)",
          opacity: isHero ? 1 : 0.82,
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
```

**호환 노트**:

- 2비트 시퀀스 캐릭터(NHR/HSR/HSE)는 두 개의 `<CenteredQuote>` 인스턴스를 렌더 — 각각 `quoteIndex={0}`, `quoteIndex={1}`. `show` prop을 beat별로 교차시켜 첫 번째가 fadeOut하면서 두 번째가 fadeIn.
- `glitch` prop: LSH 전용. `cinemaGlitchText` keyframe 은 `index.html` 에 별도 정의 필요 (§B keyframes 참조).
- `blurred` prop: MMR Beat 2(모션 블러) 전용. 텍스트도 함께 blur + translateY.
- hero 전환: 모든 Intro가 **마지막 beat에서 hero 로 전환** — 일관성 규칙.

#### P3. Skip hint (공통 하단 라벨)

```jsx
<span
  style={{
    position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
    fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: "oklch(0.55 0 0)",
    opacity: beat >= 1 ? 0.4 : 0,
    transition: "opacity 0.6s ease-out",
    zIndex: 10, pointerEvents: "none",
  }}
>
  Tap to skip
</span>
```

#### P4. Chapter label (beat 마지막에 등장)

```jsx
{char.introLabel && (
  <span
    style={{
      position: "absolute", bottom: "7%", left: "50%",
      transform: "translateX(-50%)",
      fontFamily: "var(--f-display-en)",
      fontSize: isMobile ? 10 : 12,
      letterSpacing: "0.35em", textTransform: "uppercase",
      color: "oklch(0.82 0 0)",
      opacity: beat >= LAST_BEAT ? 0.6 : 0,
      transition: "opacity 0.6s ease-out 0.4s",
      zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
    }}
  >
    {char.introLabel}
  </span>
)}
```

---

### A. 컷 어웨이 (JSH) — ["탈락, 다음."]

구조: 과부하 의도된 6400ms 3비트 켄 번즈 유지. v4 변경은 **대사 등장 시점 + 클로즈업 완화** 두 가지.

**비트 타임라인**:

- **Beat 0 (0~200ms)** — 검은 바탕
- **Beat 1 (200~1700ms)** — `intro1.webp` zoom #1, `transformOrigin: 50% 30%`, `scale(2.0 → 2.12)`. Ken Burns drift. **대사 subtle 노출 시작**
- **flash 1 (1700~1800ms)** — 흰색 100ms
- **Beat 2 (1800~3300ms)** — `intro1.webp` zoom #2, `transformOrigin: 45% 55%`, `scale(1.9 → 2.014)`. **대사 subtle 유지**
- **flash 2 (3300~3400ms)** — 흰색 100ms
- **Beat 3 (3400~5800ms)** — `intro1.webp` full view (scale 1.0 → 1.05) + **대사 hero 확대** + 이름 대형 히어로 텍스트 + chapter label
- **fadeOut (5800~6400ms)** — overlay opacity 1 → 0 → Phase 1 keyVisual 노출

**대사 노출 로직**:

- Beat 1/2: `<CenteredQuote beat={beat} emphasis="subtle" />` → opacity 0.82, medium size
- Beat 3: `<CenteredQuote beat={3} emphasis="hero" />` 로 교체 → opacity 1, 대형 size (이름 · 태그라인 전체)

**characters.js JSH 변경**:

```js
// BEFORE (v3)
zoomSequence: [
  { cx: 50, cy: 25, scale: 2.8 },
  { cx: 42, cy: 55, scale: 2.5 },
],
focusBox: {
  desktop: { cx: 50, cy: 35, w: 35, h: 65 },
  mobile:  { cx: 50, cy: 32, w: 45, h: 70 },
},

// AFTER (v4)
zoomSequence: [
  { cx: 50, cy: 30, scale: 2.0 },  // 2.8 → 2.0 (화질 우선)
  { cx: 45, cy: 55, scale: 1.9 },  // 2.5 → 1.9
],
focusBox: {
  desktop: { cx: 50, cy: 35, w: 45, h: 75 },  // +10%
  mobile:  { cx: 50, cy: 32, w: 55, h: 80 },  // +10%
},
```

**CutawayIntro.jsx 변경 지점**:

1. beat 1/2 블록에 `<CenteredQuote emphasis="subtle" />` 렌더 (기존에는 beat 3에만 있음)
2. beat 3 블록의 기존 중앙 텍스트를 `<CenteredQuote emphasis="hero" />` 로 교체
3. 레터박스 상하 7% 추가 (기존에 없음 — v3 plan 사양)
4. Ken Burns 계수 `* 1.06` 유지 (실효 scale: 2.12 / 2.014 — 상한 2.2 이내)

**레터박스**:

```jsx
<div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "7%",
              background: "oklch(0 0 0)", zIndex: 15 }} />
<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "7%",
              background: "oklch(0 0 0)", zIndex: 15 }} />
```

### B. 카메라 (KHR) — ["오늘도 연습! 아자아자~!"]

> **v4.2 전면 재설계** (2026-04-10): "선라이즈" 컨셉 폐기 → "스마트폰 카메라로 KHR 촬영" 컨셉.
>
> 확정 디자인 결정: (1) 포커스 스캔 하단→상단→전체 3번 전환. (2) 필름 현상 translateY+filter 조합. (3) 테두리 없음. (4) 대사+포커스잠금 겹침.

**캐릭터 해석**: 활력·연습벌레·밝은 절박함. "카메라가 KHR을 촬영하고 → 필름 사진으로 현상된다". 4400ms + 500ms fadeOut = **4900ms**.

**비트 타임라인**:

- **Beat 0 (0~300ms)** — 검은 화면 → 카메라 UI 프레임(뷰파인더 코너, HUD) opacity 0→1
- **Beat 1 하단 (300~900ms)** — `intro1.webp` 즉시 노출 (opacity 0→1, 300ms). `objectPosition: "50% 85%"` (하체). 포커스 사각형 하단 중앙. 카메라 그리드 + 정보 HUD 표시.
- **Beat 2 상단 (900~1600ms)** — `objectPosition: "50% 20%"` 으로 전환 (얼굴/상체). 포커스 사각형 상단 중앙으로 이동. CenteredQuote subtle "아자아자~!" 등장 (포커스 이동과 동시).
- **Beat 3 전체 (1600~2300ms)** — `objectPosition: "50% 50%"` 전체 프레임. 포커스 사각형 전체 frame 으로 확장. 포커스 잠금: 사각형 색 → `char.color` + "AF ●" 표시. CenteredQuote subtle 유지.
- **Beat 4 셔터 (2300~2450ms)** — iris wipe (검은 원 0→100→0, 150ms) + 흰색 플래시 80ms.
- **Beat 5 필름 현상 (2450~4000ms)** — `key.webp` `translateY(100%)→0` + `filter: brightness(3) saturate(0) → brightness(1) saturate(1)` 동시 전환. 카메라 UI 전체 fadeOut. CenteredQuote hero 등장.
- **Beat 6 안정 (4000~4400ms)** — 모든 레이어 안정. CenteredQuote hero 유지.
- **fadeOut (4400~4900ms)** — overlay opacity 1→0 → Phase 1 drop-in.

**objectPosition 스캔 sequence**:

```js
const OBJ_POS = {
  1: "50% 85%",   // 하단 — 하체
  2: "50% 20%",   // 상단 — 얼굴/상체
  3: "50% 50%",   // 전체
};
const introObjPos = OBJ_POS[Math.min(beat, 3)] || "50% 85%";
// beat >= 1 일 때만 transition 적용
```

**포커스 사각형 위치**:

```js
const FOCUS_RECT = {
  1: { top: "58%", left: "30%", w: isMobile ? 120 : 160, h: isMobile ? 80 : 100 },
  2: { top: "12%", left: "32%", w: isMobile ? 110 : 140, h: isMobile ? 110 : 140 },
  3: { top: "6%",  left: "8%",  w: "84%", h: "88%" },  // 전체 frame
};
```

**characters.js KHR 변경**:

```js
// focusBox: Phase 1 contain 이므로 center
focusBox: {
  desktop: { cx: 50, cy: 50, w: 100, h: 100 },
  mobile:  { cx: 50, cy: 50, w: 100, h: 100 },
},
// Phase 1 objectFit contain 으로 전체 이미지 표시
keyVisualFit: "contain",
```

**CinematicCharDetail 분기** (`char.keyVisualFit`):

```jsx
// Phase 1 fixed background img
<img src={char.keyVisual} alt="" style={{
  width: "100%", height: "100%",
  objectFit: char.keyVisualFit || "cover",
  objectPosition,   // contain 시 center
  ...
}} />
```

**컴포넌트 스켈레톤** (`src/components/cinematic/SunriseIntro.jsx` — 완전 재작성):

```jsx
import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   SunriseIntro (KHR) — phone camera UI → film photo print
   Sequence: 4400ms + 500ms fadeOut = 4900ms total
     0    -  300 : dark → camera UI frame
     300  -  900 : intro1 reveal + focus scan BOTTOM
     900  - 1600 : focus pan to TOP + quote subtle
     1600 - 2300 : focus expand FULL + focus lock + char.color
     2300 - 2450 : shutter iris + white flash
     2450 - 4000 : key.webp film developing (translateY + filter)
     4000 - 4400 : stable hero
     4400 - 4900 : fadeOut
   ══════════════════════════════════════════════════════════ */

const OBJ_POS = { 1: "50% 85%", 2: "50% 20%", 3: "50% 50%" };

export default function SunriseIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [focusLocked, setFocusLocked] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const introObjPos = beat >= 1 ? (OBJ_POS[Math.min(beat, 3)] || "50% 85%") : "50% 85%";

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 900),
      setTimeout(() => { setBeat(3); }, 1600),
      setTimeout(() => setFocusLocked(true), 2100),   // lock overlaps with quote
      setTimeout(() => setBeat(4), 2300),
      setTimeout(() => setBeat(5), 2450),
      setTimeout(() => setBeat(6), 4000),
      setTimeout(() => setFadingOut(true), 4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Focus rect geometry
  const focusRect =
    beat >= 3
      ? { top: "6%", left: "8%", right: "8%", bottom: "6%", width: "auto", height: "auto" }
      : beat === 2
      ? { top: "12%", left: isMobile ? "30%" : "32%", width: isMobile ? 110 : 140, height: isMobile ? 110 : 140 }
      : { top: "58%", left: isMobile ? "28%" : "30%", width: isMobile ? 120 : 160, height: isMobile ? 80 : 100 };

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── Camera UI container (Beat 0~4) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          opacity: beat >= 5 ? 0 : 1,
          transition: "opacity 0.4s ease-out",
          zIndex: beat >= 5 ? 0 : 4,
          pointerEvents: "none",
        }}
      >
        {/* intro1 image */}
        <img
          src={introSrc}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: introObjPos,
            opacity: beat >= 1 ? 1 : 0,
            transition: "opacity 0.3s ease-out, object-position 0.7s ease-in-out",
            zIndex: 1,
          }}
        />

        {/* Camera grid 3×3 */}
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 2,
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.18) 1px, transparent 1px), " +
              "linear-gradient(90deg, oklch(1 0 0 / 0.18) 1px, transparent 1px)",
            backgroundSize: "33.33% 33.33%",
            opacity: beat >= 1 && beat <= 3 ? 0.6 : 0,
            transition: "opacity 0.4s ease-out",
            pointerEvents: "none",
          }}
        />

        {/* Camera HUD top */}
        <div
          style={{
            position: "absolute", top: isMobile ? 12 : 16, left: isMobile ? 12 : 18, right: isMobile ? 12 : 18,
            display: "flex", justifyContent: "space-between",
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.08em", color: "oklch(1 0 0 / 0.75)",
            opacity: beat >= 1 && beat <= 3 ? 1 : 0,
            transition: "opacity 0.4s ease-out",
            zIndex: 3, pointerEvents: "none",
          }}
        >
          <span>f/1.8  1/1000  ISO 100</span>
          <span>● REC  00:0{Math.max(0, beat)}</span>
        </div>

        {/* Focus rectangle */}
        {beat >= 1 && beat <= 3 && (
          <div
            style={{
              position: "absolute",
              ...(beat >= 3
                ? { inset: "6%", width: "auto", height: "auto" }
                : { top: focusRect.top, left: focusRect.left, width: focusRect.width, height: focusRect.height }),
              border: `2px solid ${focusLocked ? char.color : "oklch(1 0 0 / 0.85)"}`,
              boxShadow: focusLocked ? `0 0 10px ${char.color}88` : "none",
              transition:
                "top 0.6s ease-in-out, left 0.6s ease-in-out, width 0.6s ease-in-out, height 0.6s ease-in-out, " +
                "border-color 0.3s, box-shadow 0.3s, inset 0.6s ease-in-out",
              zIndex: 3, pointerEvents: "none",
            }}
          />
        )}

        {/* Focus locked label */}
        {focusLocked && beat <= 4 && (
          <div
            style={{
              position: "absolute",
              top: beat >= 3 ? "7%" : "55%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? 9 : 10,
              letterSpacing: "0.15em",
              color: char.color,
              textShadow: `0 0 8px ${char.color}88`,
              opacity: 1,
              transition: "opacity 0.3s",
              zIndex: 3, pointerEvents: "none",
            }}
          >
            AF ●
          </div>
        )}

        {/* Vignette */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, transparent 55%, oklch(0 0 0 / 0.35) 100%)",
            zIndex: 2, pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Shutter iris (Beat 4) ── */}
      {beat === 4 && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "oklch(0 0 0)",
            animation: "cinemaIrisWipe 0.15s ease-in-out forwards",
            zIndex: 10, pointerEvents: "none",
          }}
        />
      )}

      {/* ── White flash (Beat 4) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "oklch(1 0 0)",
          opacity: beat === 4 ? 1 : 0,
          transition: beat === 4 ? "opacity 0.04s linear" : "opacity 0.12s linear",
          zIndex: 11, pointerEvents: "none",
        }}
      />

      {/* ── Film developing: key.webp (Beat 4+, develops from Beat 5) ── */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: char.keyVisualFit || "cover",
          objectPosition: "50% 50%",
          transform: beat >= 5 ? "translateY(0)" : "translateY(100%)",
          filter: beat >= 5 ? "brightness(1) saturate(1)" : "brightness(3) saturate(0)",
          opacity: beat >= 4 ? 1 : 0,
          transition: beat >= 5
            ? "transform 1.2s cubic-bezier(0.22,1,0.36,1), filter 1.6s ease-out"
            : "opacity 0.05s",
          zIndex: 5,
        }}
      />

      {/* ── Film grain overlay (Beat 5, fades out) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E\")",
          opacity: beat === 5 ? 0.3 : 0,
          mixBlendMode: "overlay",
          transition: "opacity 1.4s ease-out",
          zIndex: 6, pointerEvents: "none",
        }}
      />

      {/* ── Dark vignette for hero legibility (Beat 5+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 90%)",
          opacity: beat >= 5 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 7, pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 2~4, overlaps with focus scan) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 2 && beat < 5}
      />

      {/* ── CenteredQuote hero (Beat 5+) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 5}
      />

      {/* ── Chapter label (Beat 5+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 6 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── Skip hint ── */}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

**필수 keyframes** (`index.html` — `cinemaIrisWipe` 추가):

```css
@keyframes cinemaIrisWipe {
  0%   { clip-path: circle(100% at center); opacity: 1; }
  50%  { clip-path: circle(0% at center);   opacity: 1; }
  100% { clip-path: circle(0% at center);   opacity: 0; }
}
```

**파일 변경 요약**:

- `SunriseIntro.jsx` — 완전 재작성 (카메라 컨셉)
- `characters.js` KHR — `focusBox` center/100%, `keyVisualFit: "contain"` 추가
- `CharDetail.jsx` `CinematicCharDetail` — `char.keyVisualFit || "cover"` 분기
- `introStyles.js` — `sunrise.duration` 3700 → 4900
- `index.html` — `@keyframes cinemaIrisWipe` 추가

### C. 글리치 (LSH) — ["하아… 또?"]

**캐릭터 해석**: 자기부정·귀차니즘·숨기는 성격. 글리치는 "정상화되지 못한 상태"의 시각 문법. 2800ms + 400ms fadeOut = **3200ms**.

**비트 타임라인**:

- **Beat 0 (0~300ms)** — 검은 바탕
- **Beat 1 (300~2400ms)** — `intro1.webp` 기본 레이어 + RGB 3채널 분리 (R/G/B) 각각 미세 translate + hue-rotate. `cinemaGlitchLayer` keyframe 으로 진폭 감쇠. CenteredQuote subtle + `glitch={true}` (동기화된 떨림).
- **Beat 2 (2400~2800ms)** — 글리치 진폭 급격히 정착. RGB 레이어 opacity 0으로 페이드. CenteredQuote hero 전환.
- **fadeOut (2800~3200ms)** — overlay opacity 1→0.

**모바일 fallback**: RGB 3레이어 → 2레이어 (R+B만), hue-rotate 생략, 진폭 절반.

**focusBox 업데이트**: `characters.js` LSH `focusBox` v4 +10% 반영.

**컴포넌트 스켈레톤** (`src/components/cinematic/GlitchIntro.jsx`):

```jsx
import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   GlitchIntro (LSH) — RGB channel split with decaying shake
   Sequence: 2800ms + 400ms fadeOut = 3200ms total
     0    -  300 : black
     300  - 2400 : intro1 base + RGB layers glitch-shake (decaying)
                   + quote subtle + sync glitch
     2400 - 2800 : glitch settles, RGB layers fade out
                   + quote hero
     2800 - 3200 : fadeOut
   ══════════════════════════════════════════════════════════ */
export default function GlitchIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 2400),
      setTimeout(() => setFadingOut(true), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const commonImg = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
    objectPosition,
  };

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.4s ease-out",
      }}
    >
      {/* ── Base image layer (Beat 1+) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          opacity: beat >= 1 ? 1 : 0,
          transition: "opacity 0.4s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Glitch RGB layers — R channel ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          mixBlendMode: "screen",
          filter: "hue-rotate(-20deg) saturate(1.8)",
          opacity: beat === 1 ? 0.55 : 0,
          animation: beat === 1 ? "cinemaGlitchR 2.1s ease-out forwards" : "none",
          transition: "opacity 0.35s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Glitch RGB layers — G channel (skip on mobile) ── */}
      {!isMobile && (
        <img
          src={introSrc}
          alt=""
          style={{
            ...commonImg,
            mixBlendMode: "screen",
            filter: "hue-rotate(110deg) saturate(1.6)",
            opacity: beat === 1 ? 0.45 : 0,
            animation: beat === 1 ? "cinemaGlitchG 2.1s ease-out forwards" : "none",
            transition: "opacity 0.35s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Glitch RGB layers — B channel ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          mixBlendMode: "screen",
          filter: "hue-rotate(200deg) saturate(1.8)",
          opacity: beat === 1 ? 0.55 : 0,
          animation: beat === 1 ? "cinemaGlitchB 2.1s ease-out forwards" : "none",
          transition: "opacity 0.35s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Scanline overlay (Beat 1) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0) 0px, oklch(0 0 0 / 0) 3px, oklch(0 0 0 / 0.2) 4px)",
          opacity: beat === 1 ? 0.4 : 0,
          transition: "opacity 0.5s ease-out",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Vignette for hero legibility (Beat 2) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle with glitch sync (Beat 1) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
        glitch
      />

      {/* ── CenteredQuote hero (Beat 2+) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 2}
      />

      {/* ── Chapter label (Beat 2+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 2 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── Skip hint ── */}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

**필수 keyframes** (`index.html`):

```css
@keyframes cinemaGlitchR {
  0%   { transform: translate(0, 0); }
  8%   { transform: translate(-6px, 2px); }
  14%  { transform: translate(4px, -1px); }
  22%  { transform: translate(-3px, 1px); }
  35%  { transform: translate(2px, -1px); }
  50%  { transform: translate(-1.5px, 0.5px); }
  70%  { transform: translate(1px, 0); }
  100% { transform: translate(0, 0); }
}
@keyframes cinemaGlitchG {
  0%   { transform: translate(0, 0); }
  10%  { transform: translate(4px, -2px); }
  18%  { transform: translate(-3px, 1px); }
  30%  { transform: translate(2.5px, -0.5px); }
  55%  { transform: translate(-1px, 0.5px); }
  100% { transform: translate(0, 0); }
}
@keyframes cinemaGlitchB {
  0%   { transform: translate(0, 0); }
  6%   { transform: translate(5px, 1px); }
  16%  { transform: translate(-4px, -1px); }
  28%  { transform: translate(3px, 0.5px); }
  45%  { transform: translate(-2px, 0.5px); }
  65%  { transform: translate(1.5px, 0); }
  100% { transform: translate(0, 0); }
}
@keyframes cinemaGlitchText {
  0%   { transform: translate(0, 0); }
  12%  { transform: translate(-3px, 1px); }
  22%  { transform: translate(2px, 0); }
  38%  { transform: translate(-1.5px, 0.5px); }
  60%  { transform: translate(1px, 0); }
  100% { transform: translate(0, 0); }
}
```

**주의**: keyframe 진폭이 시간 진행에 따라 감쇠하도록 고정 stops 로 표현 — JS interval 불필요.

### D. 물결 (MIL) — ["그냥 음악이 좋아서."]

**캐릭터 해석**: 음악에 대한 본능적 몰입. 물결은 "한 번 찾아왔다가 진정되는 본능"의 시각 문법. 3500ms + 500ms fadeOut = **4000ms**.

**비트 타임라인**:

- **Beat 0 (0~400ms)** — 검은 바탕 + 중앙 음파 고리 1회 (border oklch, scale 0→1.3, opacity 1→0)
- **Beat 1 (400~2800ms)** — `intro1.webp` + SVG feTurbulence 필터 적용. `baseFrequency` 0.018 → 0 (rAF로 감쇠). CenteredQuote subtle + 감쇠 동기화 blur (미세).
- **Beat 2 (2800~3500ms)** — 필터 off, 정적 프레임 안정. CenteredQuote hero.
- **Phase 0 종료 전 (3500ms)** — SVG `<filter>` DOM 언마운트 (useEffect cleanup).
- **fadeOut (3500~4000ms)** — overlay opacity 1→0.

**모바일 fallback**: SVG 필터 제거. `transform: scaleY(1.03 → 1.0)` + 상→하 specular highlight band sweep.

**focusBox 업데이트**: `characters.js` MIL `focusBox` v4 +10% 반영.

**컴포넌트 스켈레톤** (`src/components/cinematic/RippleIntro.jsx`):

```jsx
import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

const FILTER_ID = "cinemaRippleFilter";

/* ══════════════════════════════════════════════════════════
   RippleIntro (MIL) — SVG turbulence ripple decay
   Sequence: 3500ms + 500ms fadeOut = 4000ms total
     0    -  400  : black + expanding sonic ring
     400  - 2800  : intro1 + SVG turbulence (baseFrequency 0.018→0 via rAF)
                    + quote subtle + sync subtle blur
     2800 - 3500  : settle, filter unmount, quote hero
     3500 - 4000  : fadeOut
   ══════════════════════════════════════════════════════════ */
export default function RippleIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [filterActive, setFilterActive] = useState(!isMobile);
  const turbulenceRef = useRef(null);
  const rafRef = useRef(null);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 400),
      setTimeout(() => setBeat(2), 2800),
      setTimeout(() => setFilterActive(false), 3500),   // unmount SVG filter
      setTimeout(() => setFadingOut(true), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── rAF loop: decay baseFrequency during Beat 1 ──
  useEffect(() => {
    if (isMobile || beat !== 1 || !turbulenceRef.current) return;
    const startMs = performance.now();
    const duration = 2400;
    const start = 0.018;
    const end = 0.0;

    const tick = (now) => {
      const t = Math.min(1, (now - startMs) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const bf = start + (end - start) * eased;
      if (turbulenceRef.current) {
        turbulenceRef.current.setAttribute("baseFrequency", bf.toFixed(4));
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [beat, isMobile]);

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── SVG filter def (desktop only, Beat 0~1) ── */}
      {filterActive && !isMobile && (
        <svg
          width="0" height="0"
          style={{ position: "absolute", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <defs>
            <filter id={FILTER_ID}>
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0.018"
                numOctaves="2"
                seed="3"
              />
              <feDisplacementMap in="SourceGraphic" scale="24" />
            </filter>
          </defs>
        </svg>
      )}

      {/* ── Sonic ring (Beat 0) ── */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          width: isMobile ? 120 : 180,
          height: isMobile ? 120 : 180,
          marginLeft: isMobile ? -60 : -90,
          marginTop: isMobile ? -60 : -90,
          borderRadius: "50%",
          border: `2px solid ${char.color}`,
          opacity: beat === 0 ? 1 : 0,
          transform: beat === 0 ? "scale(0.3)" : "scale(1.4)",
          transition: "opacity 0.4s ease-out, transform 0.7s ease-out",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Image layer with SVG filter (desktop) or CSS (mobile) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition,
          filter: filterActive && !isMobile ? `url(#${FILTER_ID})` : "none",
          transform: isMobile
            ? (beat === 1 ? "scaleY(1.0)" : "scaleY(1.03)")
            : "none",
          opacity: beat >= 1 ? 1 : 0,
          transition:
            "opacity 0.5s ease-out, transform 2.4s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 2,
        }}
      />

      {/* ── Mobile specular highlight sweep (Beat 1) ── */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0,
            height: "30%",
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0) 0%, oklch(1 0 0 / 0.25) 50%, oklch(1 0 0 / 0) 100%)",
            mixBlendMode: "screen",
            opacity: beat === 1 ? 1 : 0,
            top: beat === 1 ? "70%" : "0%",
            transition: "top 2.4s ease-out, opacity 0.4s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Vignette for hero legibility (Beat 2+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 90%)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
      />

      {/* ── CenteredQuote hero (Beat 2+) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 2}
      />

      {/* ── Chapter label + skip hint (reusable, see KHR pattern) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 2 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

**필수 keyframes**: 없음 (rAF + 인라인 transition으로 처리).

**메모리 관리 주의**: `filterActive` 가 false 로 전환되면 SVG `<filter>` DOM 이 완전히 언마운트됨. `rafRef` 는 cleanup에서 `cancelAnimationFrame` 호출. Phase 0 종료 시 메모리 누수 없음.

### E. 플래시 (MMR) — ["보여주는 게 좋으니까~!"]

**v4.1 전면 재설계**: 댓글 스크롤 → 모션 블러 전환 → key.webp 3단 줌인.
총 Phase 0 duration **6200ms** (JSH와 비슷한 "과부하" 연출).

**시퀀스 타임라인**:

- **Beat 0 (0~300ms)** — 검은 바탕 + 브랜드 컬러 subtle radial glow
- **Beat 1 댓글 스트림 (300~2800ms)** — 15개 댓글 chip 이 화면 하단 → 상단으로 연속 스크롤 (스태거 150ms 간격, 각 chip 수명 2500ms). `overflow: hidden` 컨테이너. `translateY` + `opacity` one-shot. `char.introComments` 에서 문구 읽음. animated WebP 17MB 의 background decode 창구 역할.
- **Beat 2 모션 블러 (2800~3200ms)** — 댓글 전체가 급가속하여 위로 휩쓸려 나가며 동시에 `filter: blur(0→14px)` + translateY 가속. 같은 구간에 key.webp 가 `blur(20px) scale(2.3)` 상태로 페이드인. 400ms 브리지.
- **Beat 3 zoom #1 좌상 (3200~4000ms)** — key.webp `objectPosition: 25% 25%`, `scale(2.0 → 2.06)`, `blur(14px → 0)`. Ken Burns drift.
- **Beat 4 zoom #2 좌하 (4000~4800ms)** — key.webp `objectPosition: 25% 72%`, `scale(2.0 → 2.06)`. 교차 180ms.
- **Beat 5 zoom #3 우중 (4800~5600ms)** — key.webp `objectPosition: 75% 50%`, `scale(2.0 → 2.06)`. 교차 180ms.
- **Beat 6 settle (5600~6200ms)** — zoom #3 `scale(2.06 → 1.0)`, `objectPosition` 도 Phase 1 focusBox 값(`48% 42%` 데스크톱)으로 교차. 600ms.
- **fadeOut (6200~6700ms)** — overlay `opacity: 1 → 0` → Phase 1 keyVisual drop-in (동일 이미지 동일 focus로 정렬).

**대사 중앙 노출**: Beat 1부터 `subtle` 로 노출, Beat 2 에서 `blurred={true}` 로 모션블러 동기화, Beat 3~5 subtle 유지 (3단 zoom 동안), Beat 6 에서 `hero` 로 전환.

**댓글 chip 스타일**: 반투명 검은 배경 (`oklch(0 0 0 / 0.5)`) + 캐릭터 컬러 좌측 2px 라인 + 작은 원형 아바타 placeholder + 짧은 닉네임 + 본문.

**에셋 전략** (v4 초안 수정): Phase 0 Beat 3부터 key.webp 사용. 그 전에 2.5초 댓글 스크롤이 decode 시간을 완전히 흡수하므로 문제 없음. `PRELOAD_BUDGET_OVERRIDE.MMR` 제거.

`INTRO_STYLE_CONFIG.flash.duration` → **6200** (기존 2000 에서 변경).

#### MMR FlashIntro.jsx 스켈레톤

```jsx
import { useEffect, useState, useMemo } from "react";
import CenteredQuote from "./CenteredQuote";

const ZOOMS = [
  { cx: 25, cy: 25, scale: 2.0 },  // 좌상
  { cx: 25, cy: 72, scale: 2.0 },  // 좌하
  { cx: 75, cy: 50, scale: 2.0 },  // 우중
];

export default function FlashIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const comments = char.introComments || [];

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),     // comments stream
      setTimeout(() => setBeat(2), 2800),    // motion blur bridge
      setTimeout(() => setBeat(3), 3200),    // zoom #1 upper-left
      setTimeout(() => setBeat(4), 4000),    // zoom #2 lower-left
      setTimeout(() => setBeat(5), 4800),    // zoom #3 right-middle
      setTimeout(() => setBeat(6), 5600),    // settle to Phase 1 focus
      setTimeout(() => setFadingOut(true), 6200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Active zoom params — Beat 3=0, Beat 4=1, Beat 5=2, Beat 6=Phase 1 focus
  const zoom = beat >= 3 && beat <= 5 ? ZOOMS[beat - 3] : null;
  const currentObjPos = zoom
    ? `${zoom.cx}% ${zoom.cy}%`
    : objectPosition; // Phase 1 focus for beat 6+

  const currentScale = beat === 6 ? 1.0 : (zoom ? zoom.scale : 2.3);
  const currentBlur =
    beat === 2 ? 20 :
    beat === 3 ? 0 :   // already cleared by Beat 3 transition
    0;

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)", cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* Beat 0 brand glow — fades out by beat 2 */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: `radial-gradient(ellipse at center,
            ${char.color}22 0%, oklch(0 0 0) 60%)`,
          opacity: beat <= 1 ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* Beat 1 — comment stream */}
      <CommentStream
        comments={comments}
        char={char}
        isMobile={isMobile}
        active={beat >= 1 && beat <= 2}
        accelerate={beat === 2}
      />

      {/* Beat 2+ — key.webp with zoom sequence */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: currentObjPos,
          transform: `scale(${currentScale})`,
          transformOrigin: currentObjPos,
          filter: `blur(${currentBlur}px)`,
          opacity: beat >= 2 ? 1 : 0,
          transition: beat === 2
            ? "opacity 0.4s ease-out, filter 0.4s ease-out, transform 0.4s ease-out"
            : "object-position 0.18s ease-out, transform 0.8s ease-out, filter 0.35s ease-out",
          zIndex: 2,
        }}
      />

      {/* Dark vignette — boost text legibility from Beat 3 */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 3,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 3 ? 1 : 0,
          transition: "opacity 0.5s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~5) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 6}
        blurred={beat === 2}
      />

      {/* ── CenteredQuote hero (Beat 6+) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 6}
      />

      {/* Chapter label */}
      {char.introLabel && beat >= 3 && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 6 ? 0.6 : 0.3,
            transition: "opacity 0.6s ease-out",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* Skip hint */}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

#### MMR CommentStream 컴포넌트

```jsx
function CommentStream({ comments, char, isMobile, active, accelerate }) {
  // 15 comments stagger 150ms apart, each lifespan 2500ms
  // Beat 2 (accelerate) applies filter blur + translate gust-out
  const items = useMemo(() => comments.map((text, i) => ({
    text,
    delay: i * 150,
    nick: FAKE_NICKS[i % FAKE_NICKS.length],
  })), [comments]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0, right: 0,
        top: isMobile ? "30%" : "25%",
        bottom: isMobile ? "12%" : "15%",
        overflow: "hidden",
        zIndex: 4,
        pointerEvents: "none",
        filter: accelerate ? "blur(14px)" : "blur(0px)",
        transform: accelerate ? "translateY(-60px)" : "translateY(0)",
        opacity: active ? 1 : 0,
        transition: "filter 0.35s ease-in, transform 0.35s ease-in, opacity 0.5s ease-out",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: isMobile ? "6%" : "10%",
            right: isMobile ? "6%" : "30%",
            bottom: 0,
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px",
            background: "oklch(0 0 0 / 0.55)",
            borderLeft: `2px solid ${char.color}`,
            backdropFilter: "blur(6px)",
            fontFamily: "var(--f-body)",
            fontSize: isMobile ? 13 : 14,
            color: "oklch(0.92 0 0)",
            transform: "translateY(0)",
            animation: active
              ? `mmrCommentRise 2500ms ease-out ${item.delay}ms forwards`
              : "none",
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              width: 20, height: 20, borderRadius: "50%",
              background: `linear-gradient(135deg, ${char.color}, oklch(0.5 0.05 300))`,
              flexShrink: 0,
            }}
          />
          <span style={{ color: char.color, fontSize: isMobile ? 11 : 12, flexShrink: 0 }}>
            {item.nick}
          </span>
          <span style={{ opacity: 0.9 }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

const FAKE_NICKS = [
  "fan_01", "momonimo", "kpop_luv", "seoul_cam",
  "idol_diary", "pink_hae", "bluemoon", "n_tone",
  "starlight", "clip_daily", "viewcam", "midnightfm",
  "shinedown", "audience", "dailypop",
];
```

#### mmrCommentRise keyframe (index.html)

```css
@keyframes mmrCommentRise {
  0%   { transform: translateY(40px); opacity: 0; }
  15%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translateY(-520px); opacity: 0; }
}
```

> `-520px` 는 데스크톱 viewport 높이(약 800px) 기준 스트림 컨테이너를 벗어나는 offset. 모바일에선 비율상 자연스럽게 위로 빠져나감. 필요 시 `vh` 단위로 전환 가능.

### F. 안개 (NHR) — v6 재설계 (2026-04-12, EM 신호 튜닝) ⚠️ 현재 구현

> **v5 폐기 사유** (사용자 피드백, 5건 모두 근본적 실패):
>
> 1. 반투명 하얀색 레이어만 보임 — `mixBlendMode: screen` 3층이 검정 배경 위 violet gradient 를 완전 탈색
> 2. 줌이 smooth pan 이라 역동성 0 — "fade-in/fade-out 반복" 요구 미반영
> 3. 노이즈 효과 완전 부재 — "허접한 TV static 제거" 를 "노이즈 자체 제거" 로 오독
> 4. 보라 pulse 비가시 — `mixBlendMode: screen` + `radial-gradient closest-side` + 하얀 fog 아래 → washed out
> 5. KV 이미지 하단 33% 잘림 — `top-70% stage` + `linear-gradient mask-to-black` 이 크롭 효과 유발
>
> **v6 재설계 컨셉**: "**망가진 전자기 신호가 NHR 을 튜닝**"
>
> - 지직거리는 **전자기 노이즈** (SVG feTurbulence + scanlines + crackle bars)
> - **번쩍이는 줌인** (fade-in → hold → crackle-out → hold → crackle-out → hold 패턴, 비트당 1.5s)
> - **좌/우/좌 교차** 줌 position
> - Beat 4 에서 **`objectFit: contain`** 으로 KV 전체를 한눈에 (레터박스 OK, crop 금지)
>
> **v6 타임라인** (7900ms, 모든 visible hold ≥ 1000ms):
>
> | Beat | 시간 | 길이 | 내용 | Layer |
> |---|---|---|---|---|
> | 0 | 0 – 100 | 100 | black | - |
> | 1 | 100 – 1600 | 1500 | LEFT 미소 (38%/32%, scale 1.8) + flash 패턴 + EM noise + quote[0] | A cover zoom |
> | 2 | 1600 – 3100 | 1500 | RIGHT 손목시계 (64%/58%, scale 1.9) + flash + 보라 pulse | A cover zoom |
> | 3 | 3100 – 4600 | 1500 | LEFT-TOP 이어폰 (36%/22%, scale 1.8) + flash + 보라 pulse | A cover zoom |
> | 4 | 4600 – 6500 | 1900 | **contain 전체 리빌** + 노이즈 감쇠 + quote[1] subtle | B contain |
> | 5 | 6500 – 7400 | 900 | hero 대사 + vignette + chapter label | B contain |
> | fO | 7400 – 7900 | 500 | fadeOut → Phase 1 | - |
>
> **v6 핵심 구현 결정**:
>
> - **2-layer image 구조**: Layer A (`objectFit: cover` + `transform: scale`) 는 beats 1~3 클로즈업 / Layer B (`objectFit: contain`) 는 beats 4~5 전체 리빌. Beat 4 에서 cross-fade (0.9s).
> - **flash keyframe** (`cinemaNhrFlash`): opacity 만 애니메이션 (filter 는 static style). 패턴 0→1→1→0.18→1→1→0.22→1→1. React `key={beat}` 로 restart. Visible hold ≈ 1100ms.
> - **EM 노이즈**: SVG `<feTurbulence baseFrequency="1.8" numOctaves="2">` 정적 + `transform translate(±2px)` 10Hz 지터 (`cinemaNhrCrackle`). `mixBlendMode: overlay` (screen 아님 — 탈색 방지).
> - **보라 pulse**: 솔리드 `char.color` + `filter: blur(70px)` + zIndex 8 (노이즈 위) + **normal compositing** (mixBlendMode 제거). 크기 360px desktop / 260px mobile. 1.5s `cinemaNhrPulse` 키프레임.
> - **zIndex 체인**: Layer A(2) < Layer B(3) < scanlines(4) < EM noise(5) < crackle bars(6) < flash overlay(7) < purple pulse(8) < vignette(9) < CenteredQuote(internal) < label/skip(10).
>
> **신규 keyframes** (`index.html`): `cinemaNhrFlash`, `cinemaNhrCrackle`, `cinemaNhrGlitchBars`, `cinemaNhrPulse`, `cinemaNhrFlashOverlay`. v5 keyframes (`cinemaFogBreathe`, `cinemaSignaturePulse`, `cinemaFogDrift1/2`) 제거.
>
> **`INTRO_STYLE_CONFIG.fog`**: `duration: 7900`, `fogLayers: 0` (fog 개념 폐기, EM noise 로 교체).
>
> **단일 진실 공급원**: 아래 F-1 ~ F-10 은 **v5 이력 (폐기)** 으로 유지. 현재 구현은 [src/components/cinematic/FogIntro.jsx](../components/cinematic/FogIntro.jsx) 코드 파일 자체가 정답. 추후 수정 시 코드와 본 v6 헤더 블록을 함께 업데이트.

---

### 📦 v5 이력 (폐기됨, 참고용 아카이브)

⚠️ 아래 F-1 ~ F-10 은 v5 재설계안이며 **구현 결과 실패**. v6 에서 접근법 전체를 교체. 이후 읽을 땐 v6 컨셉(위 블록) 을 기준으로 할 것.

---

#### F-1. 캐릭터 해석

- NHR 은 **미스테리·변덕·여유**. 안개는 "정체를 감춤" 의 시각 문법.
- 2비트 대사(`["후후...", "잘 부탁해?"]`) — 첫 대사는 안개 속에서 은근히, 두 번째는 안개가 걷히며 정체가 드러나는 순간.
- 시그니처: **낡은 손목시계 + 한쪽 이어폰** — 인트로에서 반드시 클로즈업해야 할 디테일.

#### F-2. 줌 좌표 (v5 원칙 #1 준수)

> ⚠️ 아래 좌표는 `src/data/characters.js` NHR focusBox 주석(`환영 포즈+두 팔 궤적, 미소` / `얼굴과 미소`) + NHR KV 초안 기반 추정치. 구현 착수 시 실제 `NHR/key.webp` 를 브라우저에서 직접 확인하고 좌표 미세 조정 필요. 조정 결과는 plan 에 재반영.

| 비트 | 줌 대상 | desktop (cx%, cy%, scale) | mobile (cx%, cy%, scale) | 이유 |
|---|---|---|---|---|
| 1 | **입꼬리 / 미소** | `50, 28, 2.0` | `50, 32, 1.9` | NHR 변덕·장난기 상징. 첫 대사 "후후..." 와 직결. |
| 2 | **손목시계 영역** | `38, 62, 2.1` | `42, 65, 2.0` | 시그니처 디테일 #1. v4 focusBox 하단부. |
| 3 | **한쪽 이어폰** | `62, 24, 2.0` | `58, 28, 1.9` | 시그니처 디테일 #2. 얼굴 측면 상단. |
| 4 | **전체 프레임 (줌아웃)** | `50, 35, 1.0` | `50, 30, 1.0` | focusBox 기본 — Phase 1 예고. |

`transformOrigin` 은 각 비트의 `objectPosition` 과 동일하게 설정하여 해당 지점을 축으로 줌.

#### F-3. 비트 타임라인 (v5 원칙 #2 준수) — **7900ms 압축판** (2026-04-12)

> v4→v5 1차 드래프트는 10500ms 였으나 사용자 피드백으로 **8초 아래**로 압축. 3점 줌인(미소·시계·이어폰)은 유지, 모든 beat static hold ≥ 1100ms 확보.

| Beat | 시간 (ms) | 길이 | Transition | **Static Hold** | 내용 |
|---|---|---|---|---|---|
| 0 | 0 – 100 | 100 | - | - | 검은 바탕, KV 숨김 |
| 1 | 100 – 1800 | 1700 | 600 fade-in + zoom-to-smile | **1100** ✓ | 짙은 안개(A 0.92/B 0.78/C 0.62), `quote[0]` "후후..." subtle |
| 2 | 1800 – 3400 | 1600 | 500 zoom to watch + pos | **1100** ✓ | 안개 1파 걷힘(A 0.58/B 0.45/C 0.35), **시계 글로우 pulse 2회** |
| 3 | 3400 – 5000 | 1600 | 500 zoom to earphone | **1100** ✓ | 안개 재확산(A 0.68/B 0.52/C 0.40), **이어폰 글로우 pulse 2회** |
| 4 | 5000 – 6700 | 1700 | 600 zoom out + fog dissipate | **1100** ✓ | 전체 프레임, chromatic aberration peak→converge, `quote[0]`→`quote[1]` cross-fade |
| 5 | 6700 – 7400 | 700 | 400 quote hero swap | - | `quote[1]` hero + chapter label + vignette |
| fadeOut | 7400 – 7900 | 500 | - | - | overlay opacity 1→0 → Phase 1 |

**총 길이**: 7900ms (약 7.9초, v5 원칙 #2 공식 `hold ≥ 1000ms` 모두 충족)

> **참고**: JSH 컷어웨이 6400ms 보다 1.5초 길지만, NHR 은 2비트 대사 + 3점 줌인 구조(JSH 는 1비트 + 2점 줌인)이므로 합리적. Skip hint 노출 유지(`Tap to skip`).
>
> **여유 분석**: 전환 500~600ms 는 v4 의 0.35s 랙 이슈("휙휙 넘어가는" 느낌)와 달리 부드러움. Hold 1100ms 는 대사/디테일 인지에 충분.

#### F-4. KV 레이아웃 (v5 원칙 #3 준수)

- 현재 v4 FogIntro 의 top-70% 스테이지 구조 **유지** (`characters.js` NHR `keyVisualStage: true` 이미 반영됨).
- Phase 0 오버레이 내부에서도 **KV 이미지는 상단 70%** 높이로 제한. 하단 30% 는 네거티브 스페이스.
- 네거티브 스페이스 채움:
  - **bgMarquee 텍스트**: `NAHARIN · ENIGMA · MIST · ` 무한 스크롤 (45s linear) — 하단 8% 위치, opacity 0.05 → 0.10 (beat 4 에서 강조)
  - **하단 fog drift 층** — 네거티브 공간에 안개 잔류
  - **KV 이미지 하단 경계 gradient mask** — `linear-gradient(to bottom, transparent 0%, oklch(0 0 0) 100%)` 로 이미지 → 블랙 자연 fade

#### F-5. 이펙트 설계 (v5 원칙 #4 준수)

##### (a) 유기체 안개 3층 구조 — TV 정적 노이즈 완전 대체

| 층 | 구현 | 드리프트 | 밀도 곡선 (beat 1→4) | zIndex |
|---|---|---|---|---|
| **A (전경)** | SVG `<feTurbulence baseFrequency="0.012 0.02" numOctaves="3">` + `<feDisplacementMap scale="50">` + `<feGaussianBlur stdDeviation="18">` + SVG `transform: scale(X)` CSS 애니메이션 | 22s | 0.92 → 0.55 → 0.68 → 0.15 | 4 |
| **B (중경)** | `linear-gradient(135deg, violet-white-violet)` + `backgroundSize: 220% 220%` | 18s | 0.78 → 0.42 → 0.52 → 0.12 | 5 |
| **C (후경)** | `linear-gradient(-45deg, cool-blue drift)` + `backgroundSize: 180% 180%` | 14s | 0.62 → 0.32 → 0.40 → 0.08 | 6 |

3층 밀도 곡선이 **서로 엇갈리며** 안개가 "숨 쉬는" 효과. 단일 전역 opacity 가 아닌 **layer 별 opacity 변화**가 유기체 움직임을 만듦.

> **구현 주의**: SVG `<animate>` 내장 태그는 브라우저 지원이 불안정하므로 사용하지 않고, 대신 **SVG `<svg>` 요소 자체에 CSS `transform: scale(1) ↔ scale(1.15)` 키프레임**(22s alternate ease-in-out) 을 걸어 displacement 모습의 "호흡"을 시뮬레이션.

##### (b) 시그니처 글로우 pulse (beat 2, 3 강조)

- **Beat 2 (손목시계)**: 좌표 `desktop 38% 62%` / `mobile 42% 65%` 에 `radial-gradient(closest-side, char.color 0%, transparent 60%)` 원형 글로우. **1.2초 주기 × 2회** pulse.
- **Beat 3 (한쪽 이어폰)**: 좌표 `desktop 62% 24%` / `mobile 58% 28%` 에 동일 패턴. **1.2초 주기 × 2회** pulse.
- Pulse 키프레임: `opacity 0 → 0.75 → 0.2 → 0.75 → 0` + `scale 0.85 → 1.05 → 0.98 → 1.10` (부드러운 숨결).

##### (c) Chromatic Aberration on reveal (beat 4)

- KV `<img>` 를 **3개 레이어로 복제**: Red / Green / Blue 채널 분리.
- 각 레이어: `mix-blend-mode: screen` + `filter: hue-rotate({0|120|240}deg) saturate(1.3)` + `transform: translate({-ca|0|+ca}px, 0)`.
- Beat 4 시작 시 `ca = 2.5px` 최대 → beat 4 hold 진행 중 `ca → 0` 수렴 (1.0s transform transition).
- 수렴 완료 후 beat 5 에서 단일 KV 로 전환 (DOM 절약).

##### (d) Bloom / Vignette (beat 5+)

- `radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.6) 90%)` — hero 대사 가독성 확보.
- 상단 violet glow 띠 (선택): `linear-gradient(to bottom, char.color 0%, transparent 20%)` opacity 0.08.

#### F-6. 컴포넌트 스켈레톤 (`src/components/cinematic/FogIntro.jsx` 전면 재작성)

```jsx
import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — v5 재설계 (2026-04-12, 7.9초 압축판)
   ------------------------------------------------------------
   컨셉: 유기체 안개 3층 + 3점 의미 있는 줌인 + RGB 분리 reveal

   Timeline: 7400ms + 500ms fadeOut = 7900ms (모든 hold ≥ 1100ms)
     0    -  100  : black
     100  - 1800  : 짙은 안개 + 미소 줌인 + quote[0] subtle         [hold 1100]
     1800 - 3400  : 안개 1파 걷힘 + 시계 줌인 + signature pulse     [hold 1100]
     3400 - 5000  : 안개 재확산 + 이어폰 줌인 + signature pulse     [hold 1100]
     5000 - 6700  : 줌아웃 + chromatic aberration + quote[0→1]      [hold 1100]
     6700 - 7400  : quote[1] hero + vignette + chapter label
     7400 - 7900  : fadeOut → Phase 1

   zIndex 체인:
     kvStage(2) - kvMask(3) - fogA-svg(4) - fogB(5) - fogC(6)
     sigPulse(7) - bgMarquee(8) - vignette(9) - CenteredQuote(internal)
     label(10) - skip(10)
   ══════════════════════════════════════════════════════════ */

// ⚠️ 좌표는 NHR/key.webp 실물 확인 후 미세 조정 필요
const ZOOM_POINTS = {
  desktop: {
    1: { pos: "50% 28%", scale: 2.0 },  // 입꼬리/미소
    2: { pos: "38% 62%", scale: 2.1 },  // 손목시계
    3: { pos: "62% 24%", scale: 2.0 },  // 한쪽 이어폰
    4: { pos: "50% 35%", scale: 1.0 },  // 전체 (focusBox cx/cy)
  },
  mobile: {
    1: { pos: "50% 32%", scale: 1.9 },
    2: { pos: "42% 65%", scale: 2.0 },
    3: { pos: "58% 28%", scale: 1.9 },
    4: { pos: "50% 30%", scale: 1.0 },
  },
};

// 시그니처 pulse 위치 (viewport 기준 %) — beat 2, 3 에서 사용
const SIG_POS = {
  desktop: {
    2: { left: "38%", top: "43%", size: 180 },  // watch
    3: { left: "62%", top: "17%", size: 160 },  // earphone
  },
  mobile: {
    2: { left: "42%", top: "45%", size: 140 },
    3: { left: "58%", top: "20%", size: 120 },
  },
};

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1),  100),
      setTimeout(() => setBeat(2), 1800),
      setTimeout(() => setBeat(3), 3400),
      setTimeout(() => setBeat(4), 5000),
      setTimeout(() => setBeat(5), 6700),
      setTimeout(() => setFadingOut(true), 7400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const zoomTable = ZOOM_POINTS[isMobile ? "mobile" : "desktop"];
  const sigTable = SIG_POS[isMobile ? "mobile" : "desktop"];
  const currentZoom = zoomTable[Math.min(Math.max(beat, 1), 4)] || zoomTable[1];

  // 이미지 saturation/brightness : 안개 속 저채도 → reveal 복원
  const imageFilter =
    beat <= 1 ? "saturate(0.35) brightness(0.6)" :
    beat === 2 ? "saturate(0.55) brightness(0.75)" :
    beat === 3 ? "saturate(0.55) brightness(0.75)" :
    beat === 4 ? "saturate(0.9) brightness(0.95)" :
    "saturate(1.0) brightness(1.0)";

  // 안개 3층 밀도 (beat 별)
  const fogA = beat === 1 ? 0.92 : beat === 2 ? 0.55 : beat === 3 ? 0.68 : beat === 4 ? 0.15 : 0.05;
  const fogB = beat === 1 ? 0.78 : beat === 2 ? 0.42 : beat === 3 ? 0.52 : beat === 4 ? 0.12 : 0.05;
  const fogC = beat === 1 ? 0.62 : beat === 2 ? 0.32 : beat === 3 ? 0.40 : beat === 4 ? 0.08 : 0.04;

  // RGB chromatic aberration (beat 4 peak → 수렴)
  const ca = beat === 4 ? 2.5 : 0;

  // 이미지 transition: beat별 속도 분리 (압축판 — hold 예산에 맞춰 단축)
  const imgTransition =
    beat === 4
      ? "transform 0.6s cubic-bezier(0.22,1,0.36,1), object-position 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease-out"
      : beat >= 2
      ? "transform 0.5s cubic-bezier(0.33,1,0.68,1), object-position 0.5s cubic-bezier(0.33,1,0.68,1), filter 0.5s ease-out"
      : "transform 0.6s ease-out, object-position 0.6s ease-out, filter 0.6s ease-out, opacity 0.55s ease-out";

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── KV STAGE: top 70%, bottom 30% 네거티브 스페이스 ── */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "70%",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        {/* Base KV image (ca=0 때만 표시) */}
        <img
          src={char.keyVisual}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: currentZoom.pos,
            transform: `scale(${currentZoom.scale})`,
            transformOrigin: currentZoom.pos,
            filter: imageFilter,
            opacity: beat >= 1 ? (ca > 0 ? 0 : 1) : 0,
            transition: imgTransition,
            willChange: "transform",
          }}
        />

        {/* Chromatic aberration RGB 3-layer (beat 4 only) */}
        {ca > 0 && ["R", "G", "B"].map((channel, i) => {
          const dx = (i - 1) * ca; // -ca, 0, +ca
          const hue = channel === "R" ? 0 : channel === "G" ? 120 : 240;
          return (
            <img
              key={channel}
              src={char.keyVisual}
              alt=""
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: currentZoom.pos,
                transform: `scale(${currentZoom.scale}) translate(${dx}px, 0)`,
                transformOrigin: currentZoom.pos,
                filter: `hue-rotate(${hue}deg) saturate(1.3) brightness(0.95)`,
                mixBlendMode: "screen",
                opacity: 0.45,
                transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* KV 하단 dissipate mask (이미지 → 블랙 자연 전환) */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "35%",
            background: "linear-gradient(to bottom, transparent 0%, oklch(0 0 0) 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </div>

      {/* ══ 유기체 안개 Layer A — SVG feTurbulence (볼륨 있는 수증기) ══ */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: fogA,
          transition: "opacity 1.2s ease-out",
          mixBlendMode: "screen",
          zIndex: 4,
          pointerEvents: "none",
          animation: beat >= 1 ? "cinemaFogBreathe 22s ease-in-out infinite alternate" : "none",
        }}
      >
        <defs>
          <filter id="nhrFogTurb" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="50" />
            <feGaussianBlur stdDeviation="18" />
            <feColorMatrix type="matrix"
              values="0 0 0 0 0.85   0 0 0 0 0.82   0 0 0 0 0.92   0 0 0 0.9 0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="oklch(0.85 0.04 310)" filter="url(#nhrFogTurb)" />
      </svg>

      {/* ══ 유기체 안개 Layer B — 중경 violet drift ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(135deg, oklch(0.85 0.03 310 / 0.95) 0%, oklch(0.70 0.05 300 / 0.4) 50%, oklch(0.85 0.03 310 / 0.95) 100%)",
          backgroundSize: "220% 220%",
          opacity: fogB,
          animation: beat >= 1 ? "cinemaFogDrift1 18s linear infinite" : "none",
          transition: "opacity 1.2s ease-out",
          mixBlendMode: "screen",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ══ 유기체 안개 Layer C — 후경 cool-blue drift ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(-45deg, oklch(0.70 0.04 280 / 0.8) 0%, oklch(0.55 0.06 280 / 0.2) 50%, oklch(0.70 0.04 280 / 0.8) 100%)",
          backgroundSize: "180% 180%",
          opacity: fogC,
          animation: beat >= 1 ? "cinemaFogDrift2 14s linear infinite" : "none",
          transition: "opacity 1.2s ease-out",
          mixBlendMode: "screen",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />

      {/* ══ 시그니처 글로우 pulse — beat 2 (watch) / beat 3 (earphone) ══ */}
      {(beat === 2 || beat === 3) && (
        <div
          key={`sig-${beat}`}  // beat 전환 시 re-mount → 애니메이션 재시작
          style={{
            position: "absolute",
            left: sigTable[beat].left,
            top: sigTable[beat].top,
            width: sigTable[beat].size,
            height: sigTable[beat].size,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(closest-side, ${char.color} 0%, transparent 65%)`,
            mixBlendMode: "screen",
            animation: "cinemaSignaturePulse 1.2s ease-in-out 2",
            zIndex: 7,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ bgMarquee — 네거티브 스페이스 채움 (bottom 30%) ══ */}
      {beat >= 1 && (
        <div
          style={{
            position: "absolute", bottom: "8%", left: 0,
            display: "flex", width: "200%",
            animation: "bgMarquee 45s linear infinite",
            pointerEvents: "none",
            zIndex: 8,
            opacity: beat === 4 ? 0.10 : 0.05,
            transition: "opacity 1s ease-out",
          }}
        >
          {[1, 2].map((k) => (
            <div
              key={k}
              style={{
                flex: "0 0 50%",
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? 36 : 64,
                letterSpacing: "0.2em",
                color: "oklch(0.85 0.03 310)",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              NAHARIN · ENIGMA · MIST · NAHARIN · ENIGMA · MIST · 
            </div>
          ))}
        </div>
      )}

      {/* ══ Vignette (beat 5+) ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.6) 90%)",
          opacity: beat >= 5 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 9,
          pointerEvents: "none",
        }}
      />

      {/* ══ CenteredQuote — quote[0] "후후..." subtle (beat 1~3) ══ */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat <= 3}
        quoteIndex={0}
      />

      {/* ══ CenteredQuote — quote[1] "잘 부탁해?" subtle (beat 4) ══ */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 4}
        quoteIndex={1}
      />

      {/* ══ CenteredQuote — quote[1] "잘 부탁해?" hero (beat 5+) ══ */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 5}
        quoteIndex={1}
      />

      {/* ══ Chapter label (beat 5+) ══ */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 5 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ══ Skip hint ══ */}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

#### F-7. 필수 keyframes (`index.html`)

기존 `cinemaFogDrift1`, `cinemaFogDrift2` 는 유지. 신규 2개 추가:

```css
/* v4 기존 유지 */
@keyframes cinemaFogDrift1 {
  0%, 100% { background-position: 0% 0%; }
  50%      { background-position: 100% 100%; }
}
@keyframes cinemaFogDrift2 {
  0%, 100% { background-position: 100% 0%; }
  50%      { background-position: 0% 100%; }
}

/* v5 신규 — SVG Layer A "호흡" (displacement 대체) */
@keyframes cinemaFogBreathe {
  0%   { transform: scale(1)    translate(0, 0); }
  50%  { transform: scale(1.12) translate(-2%, -1%); }
  100% { transform: scale(1.04) translate(1%, 2%); }
}

/* v5 신규 — 시그니처 글로우 pulse (beat 2/3) */
@keyframes cinemaSignaturePulse {
  0%   { opacity: 0;    transform: translate(-50%, -50%) scale(0.85); }
  30%  { opacity: 0.75; transform: translate(-50%, -50%) scale(1.05); }
  60%  { opacity: 0.2;  transform: translate(-50%, -50%) scale(0.98); }
  100% { opacity: 0;    transform: translate(-50%, -50%) scale(1.10); }
}
```

#### F-8. 연쇄 변경 사항 (CLAUDE.md 규칙 — 수정 시 연쇄 영향 전수 조사)

- [ ] `CinematicCharDetail.jsx` or `CharDetail.jsx` 의 `INTRO_STYLE_CONFIG.fog.duration` 을 **3500 → 7900** 으로 업데이트 (Phase 0 auto-advance 타이밍 영향, 압축판)
- [ ] `INTRO_STYLE_CONFIG.fog.fogLayers` 를 **2 → 3** 으로 업데이트 (표기 일관성)
- [ ] `characters.js` NHR `focusBox` — 유지 (`desktop w:55 h:75, mobile w:65 h:70` v4 값 그대로 OK. 줌 좌표는 FogIntro 내부 상수로 관리)
- [ ] `characters.js` NHR `keyVisualStage: true` — 유지 (이미 반영됨)
- [ ] `index.html` 키프레임 추가: `cinemaFogBreathe`, `cinemaSignaturePulse`
- [ ] `src/components/cinematic/FogIntro.jsx` 전면 재작성 — 위 스켈레톤 기반
- [ ] Phase 1 KV 레이아웃 영향 없음 (CharDetail.jsx 의 `char.keyVisualStage` 분기 유지)

#### F-9. v5 검증 체크리스트

```
[ ] 줌 좌표 4개가 모두 NHR KV 이미지의 의미 있는 디테일인가?
    → Beat 1 미소 / Beat 2 손목시계 / Beat 3 이어폰 / Beat 4 전체
    → 실 KV(NHR/key.webp) 브라우저 확인 후 좌표 미세 조정 완료?

[ ] 각 beat 의 static hold ≥ 1000ms?
    → Beat 1: 1100 ✓  Beat 2: 1100 ✓  Beat 3: 1100 ✓  Beat 4: 1100 ✓ (압축판, 7.9초 총)

[ ] KV 네거티브 스페이스 30% 확보 (bottom 30%)?
    → keyVisualStage top-70% 스테이지 구조 유지 ✓

[ ] 네거티브 스페이스를 이펙트로 채웠는가?
    → fog 3층 drift + bgMarquee + KV 하단 dissipate mask ✓

[ ] 금지 이펙트 제거됐는가?
    → TV 정적 노이즈 canvas 제거 ✓
    → CRT 스캔라인 제거 ✓

[ ] 이펙트가 NHR 모티프("안개 = 정체를 감춤")와 일치하는가?
    → 유기체 3층 안개 / 시그니처 pulse / chromatic aberration reveal ✓

[ ] 빌드 성공 (`npm run build`)?
[ ] 로컬 dev 서버 `/characters/naharin` 진입 테스트 (desktop/mobile/reduced-motion)?
[ ] 실제 체감상 "허접" 하지 않은가? → 사용자 승인?
```

#### F-10. 구현 순서 (사용자 승인 후)

1. NHR KV 이미지 브라우저 열어 줌 좌표 4점 미세 조정
2. `FogIntro.jsx` 전면 재작성 (위 스켈레톤 기반, 7.9초 압축판)
3. `index.html` keyframes 2개 추가
4. `INTRO_STYLE_CONFIG.fog.duration` 7900 업데이트
5. `npm run build` 검증
6. 로컬 dev 서버 실기기 테스트 (desktop/mobile/reduced-motion)
7. 사용자 피드백 수령 → 승인 후 커밋: `Redesign NHR FogIntro v5 (organic fog + meaningful zoom + breathing)`
8. 기존 commits (5e9f89c → 26f43ce) 은 git history 에만 유지 (revert 하지 않음)

### G. 카드 딜 (HSR) — ["잘 들어.", "이번이 마지막 기회야."] (2비트 대사)

**캐릭터 해석**: 기획사 대표·관록·상대를 시험. "판을 깐다"는 행위의 시각 문법. 카드가 테이블 위에 뒤집혀 내려앉음. 3200ms + 400ms fadeOut = **3600ms**.

**비트 타임라인**:

- **Beat 0 (0~300ms)** — 검은 바탕 + 화면 중앙 얇은 골드 세로 라인 (테이블 가장자리, width 2px, height 40%)
- **Beat 1 카드 딜 (300~1100ms)** — `key.webp` `perspective(1200px) rotateY(90deg)` → `rotateY(0deg)` (800ms). `transform-origin: left center`, `backface-visibility: hidden`. 골드 세로 라인 페이드아웃.
- **Beat 2 안착 + quote[0] (1100~1800ms)** — 가벼운 수평 떨림 (`translateX: 0 → -4 → 2 → 0`). CenteredQuote `quoteIndex={0}` `"잘 들어."` subtle.
- **Beat 3 quote[1] (1800~2800ms)** — CenteredQuote `quoteIndex={1}` `"이번이 마지막 기회야."` subtle (교체).
- **Beat 4 hero (2800~3200ms)** — CenteredQuote `quoteIndex={1}` hero 전환.
- **fadeOut (3200~3600ms)** — overlay opacity 1→0.

**focusBox 업데이트**: `characters.js` HSR `focusBox` v4 +10% 반영.

**컴포넌트 스켈레톤** (`src/components/cinematic/CardDealIntro.jsx`):

```jsx
import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   CardDealIntro (HSR) — 3D card flip onto table
   Sequence: 3200ms + 400ms fadeOut = 3600ms total
     0    -  300  : black + gold vertical table edge
     300  - 1100  : key rotateY 90→0 (card flip)
     1100 - 1800  : subtle horizontal wobble + quote[0] "잘 들어."
     1800 - 2800  : quote[1] "이번이 마지막 기회야."
     2800 - 3200  : quote[1] hero
     3200 - 3600  : fadeOut
   ══════════════════════════════════════════════════════════ */
export default function CardDealIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1100),
      setTimeout(() => setBeat(3), 1800),
      setTimeout(() => setBeat(4), 2800),
      setTimeout(() => setFadingOut(true), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const wobble =
    beat === 2 ? "translateX(-4px)" :
    beat >= 3 ? "translateX(0)" :
    "translateX(0)";

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.4s ease-out",
        perspective: "1200px",
      }}
    >
      {/* ── Gold table edge (Beat 0, fades on Beat 1) ── */}
      <div
        style={{
          position: "absolute",
          top: "30%", bottom: "30%",
          left: "50%",
          width: 2,
          marginLeft: -1,
          background:
            "linear-gradient(to bottom, transparent 0%, oklch(0.85 0.14 80) 50%, transparent 100%)",
          boxShadow: "0 0 18px oklch(0.85 0.14 80 / 0.7)",
          opacity: beat === 0 ? 1 : 0,
          transition: "opacity 0.4s ease-out",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Card (key.webp) with rotateY flip ── */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: beat >= 1
            ? `rotateY(0deg) ${wobble}`
            : "rotateY(90deg) translateX(0)",
          transformOrigin: "left center",
          backfaceVisibility: "hidden",
          opacity: beat >= 1 ? 1 : 0,
          transition:
            beat === 2
              ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease-out"
              : "transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Vignette for hero legibility (Beat 4) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 4 ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Quote[0] "잘 들어." (Beat 2) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 2}
        quoteIndex={0}
      />

      {/* ── Quote[1] subtle (Beat 3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 3}
        quoteIndex={1}
      />

      {/* ── Quote[1] hero (Beat 4) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 4}
        quoteIndex={1}
      />

      {/* ── Chapter label + skip hint ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 4 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

**필수 keyframes**: 없음 (인라인 transition 으로 충분). wobble 은 Beat 2 단발성 overshoot spring easing 사용.

### H. 페이지 넘김 (HSE) — ["세상 모든것에는―...", "배울 점이 있거든요!"] (2비트 대사)

**캐릭터 해석**: 성실·학구파·예의범절. 책장을 넘기는 행위의 시각 문법. 종이 와이프 + 접힘 seam. 3400ms + 400ms fadeOut = **3800ms**.

**비트 타임라인**:

- **Beat 0 (0~300ms)** — 오프화이트 바탕 (종이 느낌, `oklch(0.96 0.01 85)`)
- **Beat 1 와이프 (300~1700ms)** — `key.webp` 를 좌에서 우로 `clip-path: polygon` 와이프 (1400ms). 와이프 경계에 `seam gradient` 레이어가 동기화되어 이동.
- **Beat 2 quote[0] (1700~2800ms)** — CenteredQuote `quoteIndex={0}` `"세상 모든것에는―..."` subtle.
- **Beat 3 quote[1] (2800~3400ms)** — CenteredQuote `quoteIndex={1}` `"배울 점이 있거든요!"` hero (바로 hero 로 전환 — HSE는 2비트 모두가 하나의 완전한 문장이므로).
- **fadeOut (3400~3800ms)** — overlay opacity 1→0.

**focusBox 업데이트**: `characters.js` HSE `focusBox` v4 +10% 반영.

**컴포넌트 스켈레톤** (`src/components/cinematic/PageFlipIntro.jsx`):

```jsx
import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   PageFlipIntro (HSE) — left-to-right clip-path wipe with seam
   Sequence: 3400ms + 400ms fadeOut = 3800ms total
     0    -  300  : off-white paper background
     300  - 1700  : key clip-path wipe L→R + seam gradient follows
     1700 - 2800  : quote[0] "세상 모든것에는―..." subtle
     2800 - 3400  : quote[1] "배울 점이 있거든요!" hero
     3400 - 3800  : fadeOut
   ══════════════════════════════════════════════════════════ */
export default function PageFlipIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1700),
      setTimeout(() => setBeat(3), 2800),
      setTimeout(() => setFadingOut(true), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Wipe progress: 0% (covered) → 100% (revealed)
  const wipePercent = beat >= 1 ? 100 : 0;

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0.96 0.01 85)",  // off-white paper
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.4s ease-out",
      }}
    >
      {/* ── Paper texture (subtle) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "repeating-linear-gradient(90deg, oklch(0.93 0.015 85 / 0.25) 0px, oklch(0.93 0.015 85 / 0.25) 1px, transparent 1px, transparent 3px)",
          opacity: 0.6,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Key image with left-to-right clip-path wipe ── */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition,
          clipPath: `polygon(0 0, ${wipePercent}% 0, ${wipePercent}% 100%, 0 100%)`,
          transition: "clip-path 1.4s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 2,
        }}
      />

      {/* ── Seam gradient (travels with wipe edge) ── */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: `${wipePercent}%`,
          width: 24,
          marginLeft: -12,
          background:
            "linear-gradient(90deg, oklch(0 0 0 / 0) 0%, oklch(0 0 0 / 0.35) 40%, oklch(0 0 0 / 0.5) 50%, oklch(0 0 0 / 0.25) 60%, oklch(0 0 0 / 0) 100%)",
          opacity: beat === 1 ? 1 : 0,
          transition:
            "left 1.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease-out 0.9s",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Vignette for hero (Beat 3) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 90%)",
          opacity: beat >= 3 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── Quote[0] (Beat 2) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 2}
        quoteIndex={0}
      />

      {/* ── Quote[1] hero (Beat 3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 3}
        quoteIndex={1}
      />

      {/* ── Chapter label + skip hint ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 3 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
```

**필수 keyframes**: 없음. seam gradient 의 `left: {wipePercent}%` 가 이미지의 `clip-path` 와 같은 transition duration/easing 을 공유하여 동기화됨.

---

## 3. Phase 구조

```
LoadingShell: route 진입 직후
  ├─ progress bar (loadedAssets/totalAssets + easing)
  ├─ Preload: keyVisual + introAssets (Promise.allSettled, 500ms timeout)
  ├─ timeout 시 → Detail Shell 직행 (시네마틱 포기)
  ├─ assets ready + canPlayIntro → Phase 0
  └─ reduced-motion + keyVisual ready → Phase 1

Phase 0: 시네마틱 오버레이
  ├─ body overflow: hidden
  ├─ LoadingShell 통과 후에만 진입
  ├─ 트랜지션 실행 (INTRO_STYLE_CONFIG)
  ├─ 클릭/터치 → skipIntro() → Phase 1
  └─ 자동 진행: config.duration → fade-out → Phase 1

Phase 0→1: intro 레이어 언마운트, keyVisual 한 장만 남김, 0.5초 fade

Phase 1: 키비주얼 히어로
  ├─ keyVisual fixed 배경 (focusBox 기반)
  ├─ 데스크톱: 좌측 그래디언트 + 프로필 / 모바일: 하단 그래디언트 + 프로필
  ├─ Back button 즉시 노출
  ├─ Particles/marquee/holo ring 비활성
  └─ 스크롤 시 → Phase 2 (one-way latch, 되돌림 없음)

Phase 2: 기존 CharDetail
  ├─ Particles, marquee, holo ring 활성화
  ├─ Navbar 표시
  └─ <CharSections> 공통 하단
```

---

## 4. 사이트 메인 로딩 개선 (CharCarousel)

### 현재 문제
- `CharCarousel.jsx`: 15명 캐릭터 `<img src={char.image}>` 직접 렌더, preload 없음
- 스크롤 시 선택 캐릭터 이미지가 뒤늦게 로드 → 깜빡임
- `HeroSlider.jsx`: 배경은 staged preload (첫 2장 → 나머지 순차) 구현 완료

### 해결: CharCarousel 이미지 preload 전략

```
Phase 1: 현재 선택 캐릭터 + 양옆 1명 = 3장 즉시 preload
Phase 2: 나머지 12장 idle callback 또는 IntersectionObserver 진입 시 순차 preload
```

**구현:**
```js
// CharCarousel 내부 useEffect
useEffect(() => {
  const targets = [selectedIdx, selectedIdx - 1, selectedIdx + 1]
    .map(i => characters[((i % 15) + 15) % 15])
    .filter(c => c.image);

  targets.forEach(c => {
    const img = new Image();
    img.src = c.image;
  });
}, [selectedIdx]);

// 전체 preload (idle)
useEffect(() => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      characters.forEach(c => { if (c.image) { const i = new Image(); i.src = c.image; } });
    });
  }
}, []);
```

### 추가: 이미지 로딩 중 placeholder
- skeleton shimmer 또는 `char.color` 기반 그래디언트 배경
- 이미지 `onLoad` 시 fade-in (opacity 0→1, 0.3s)

### LoadingShell을 CharDetail 전용으로만? vs 공통?

| 범위 | 장점 | 단점 |
|---|---|---|
| **CharDetail 전용** | 영향 범위 최소, 빠른 구현 | 메인 페이지 캐러셀은 별도 해결 |
| **공통 hook** | `useImagePreloader(urls)` 하나로 모든 곳에서 사용 | 약간의 추상화 비용 |

**결정: 공통 hook `useImagePreloader`**
- CharDetail LoadingShell에서 사용
- CharCarousel에서도 사용
- HeroSlider는 이미 자체 preload 있으므로 유지

```js
function useImagePreloader(urls) {
  const [loaded, setLoaded] = useState(0);
  const total = urls.length;
  const ready = loaded >= total;
  // ... Promise.allSettled + count tracking
  return { loaded, total, ready, progress: total ? loaded / total : 1 };
}
```

---

## 5. 구현 순서

### v4 구현 정책 (최상위)

> **1 캐릭터 완전 구현 → 사용자 피드백 → 다음 캐릭터**.
> 절대 여러 캐릭터를 한 번에 진행하지 않는다.
> 각 Step은 다음을 전부 마친 후에만 완료로 간주:
>
> - 전용 Intro 컴포넌트 작성 (`src/components/cinematic/{Style}Intro.jsx`)
> - `INTRO_COMPONENTS` 레지스트리 등록
> - 필요 시 `index.html` keyframe 추가
> - `npm run build` 검증
> - 사용자의 명시적 승인 (대사 중앙 노출, 클로즈업 화질, 키비주얼 전환 자연스러움 확인)
>
> 사용자 피드백 후 수정이 있으면 그 자리에서 반영하고, 승인된 후에만 다음 캐릭터로 이동.

### Step 1~4: 완료

- [x] Step 1: 공통 인프라 (`useImagePreloader`, CharCarousel preload)
- [x] Step 2: 공통 섹션 추출
- [x] Step 3: 데이터 + keyframes 초안
- [x] Step 4: `CinematicCharDetail` 뼈대 (Phase -1/0/1/2, LoadingShell, fall-open)

### Step 5a: JSH (CutawayIntro) — **완료** (2026-04-10)

v3 대비 v4 전역 원칙 반영 리팩터 완료. 커밋 `5a6b55a`.

**수행된 변경:**

- [x] `characters.js` JSH `zoomSequence` 2.8/2.5 → 2.0/1.9, `focusBox` +10%
- [x] `introStyles.js` `cutaway.letterbox` false → true
- [x] `CutawayIntro.jsx` `CenteredQuote` 모듈 스코프 함수 추출 (파일 내)
- [x] Beat 1/2 `<CenteredQuote emphasis="subtle" />`, Beat 3 `<CenteredQuote emphasis="hero" />` 교체
- [x] hero 에 agency + name + quote 통합 (별도 `showName` prop 불필요)
- [x] 레터박스 상하 7% (zIndex 15), flash overlay zIndex 20 검증
- [x] `introLabel` bottom 10% 로 이동 (레터박스 회피)
- [x] `npm run build` 성공, 커밋 + 푸시

**사용자 피드백**: "이번 구현 상당히 마음에 들어" — 레퍼런스로 확정. Step 5b 이후 이 패턴 준수.

### Step 5b: KHR (SunriseIntro) — **다음 차례**

**선행 작업 (CenteredQuote 공용 승격):**

- [ ] `src/components/cinematic/CenteredQuote.jsx` 신규 생성 (§2 공통 코드 패턴 P2 스펙 적용)
  - `show`, `quoteIndex`, `glitch`, `blurred` props 지원
  - hero 에 agency + name + quote 통합
- [ ] `CutawayIntro.jsx` 내 기존 `CenteredQuote` 함수 삭제, 상단에 `import CenteredQuote from "./CenteredQuote";` 추가
- [ ] JSH 동작 회귀 확인 (빌드 + dev 서버에서 /characters/jinshihyuk 재확인)

**준비 · 데이터 변경:**

- [ ] `characters.js` KHR `focusBox` +10% 반영 (desktop w:65 h:75, mobile w:70 h:70)

**컴포넌트 작성 (`src/components/cinematic/SunriseIntro.jsx` 신규):**

- [ ] §2 B 섹션 스켈레톤 복사 기반 작성
- [ ] Beat 0 horizon glow (하단 35% radial-gradient)
- [ ] Beat 1 clip-path `inset(100% 0 0 0) → inset(0)` + `scale(1.08 → 1.0)` + `will-change`
- [ ] Beat 1 대각 골드 렌즈 플레어 레이어 (`cinemaSunriseFlare` keyframe)
- [ ] Beat 2 light vignette
- [ ] `<CenteredQuote emphasis="subtle" show={beat === 1} />`
- [ ] `<CenteredQuote emphasis="hero" show={beat >= 2} />`
- [ ] Chapter label (Beat 2+, bottom 7%)
- [ ] Skip hint

**레지스트리 등록:**

- [ ] `src/components/cinematic/index.js` 에 `import SunriseIntro` + `sunrise: SunriseIntro` 추가

**Keyframes (`index.html`):**

- [ ] `@keyframes cinemaSunriseFlare` 추가 (opacity + translateX, §2 B 참조)

**zIndex 체인 검증:**

- [ ] horizon glow (1) < clip-path img (2) < flare (3) < vignette (4) < CenteredQuote (6) < label (10)

**검증:**

- [ ] `npm run build` 성공
- [ ] 로컬 dev 서버에서 `/characters/kangharam` 진입 → Phase 0 3.7초 진행 확인
- [ ] Beat 1 에서 `intro1.webp` 가 아래에서 위로 떠오르는 애니메이션 확인
- [ ] 골드 플레어 대각선 스윕 확인
- [ ] Beat 2 에서 CenteredQuote hero 로 교체 확인
- [ ] Phase 0 → Phase 1 전환 부드러움 (focusBox objectPosition 일치)
- [ ] 모바일 뷰포트 확인
- [ ] reduced-motion 활성 시 Phase 0 스킵
- [ ] 탭/휠 skip 정상

**커밋 + 피드백 대기:**

- [ ] 커밋 메시지: `Add KHR SunriseIntro (clip-path reveal + gold flare)`
- [ ] **사용자 피드백 수령 → 승인 후 Step 6 착수**

### Step 6: MIL (RippleIntro)

**준비 · 데이터 변경:**

- [ ] `characters.js` MIL `focusBox` +10% 반영 (desktop w:65 h:80, mobile w:55 h:75)

**컴포넌트 작성 (`src/components/cinematic/RippleIntro.jsx` 신규):**

- [ ] §2 D 섹션 스켈레톤 복사 기반 작성
- [ ] Beat 0 sonic ring (border circle, scale 0.3→1.4, opacity 1→0)
- [ ] Beat 1 데스크톱: SVG `<filter>` feTurbulence + feDisplacementMap
- [ ] Beat 1 `turbulenceRef` + `requestAnimationFrame` 으로 baseFrequency 0.018→0 감쇠 (easeOutCubic)
- [ ] Beat 1 모바일 fallback: `scaleY(1.03 → 1.0)` + horizontal specular sweep
- [ ] Beat 2 vignette + hero CenteredQuote
- [ ] Phase 0 종료 시 `filterActive = false` → SVG `<filter>` DOM 언마운트
- [ ] `rafRef.current` cleanup (`cancelAnimationFrame`)
- [ ] `<CenteredQuote subtle show={beat === 1} />`
- [ ] `<CenteredQuote hero show={beat >= 2} />`

**레지스트리 등록:**

- [ ] `index.js` 에 `ripple: RippleIntro` 추가

**Keyframes:** 없음 (rAF + 인라인 transition).

**zIndex 체인 검증:**

- [ ] sonic ring (1) < img w/ filter (2) < mobile sweep (3) < vignette (4) < CenteredQuote (6) < label (10)

**검증:**

- [ ] `npm run build` 성공
- [ ] 로컬 dev 서버에서 `/characters/mila` 진입 → Phase 0 4초 진행
- [ ] 데스크톱: SVG 필터가 적용되어 물결 효과 (Chrome + Firefox)
- [ ] 모바일 뷰포트: 필터 없이 scaleY + sweep 확인
- [ ] DevTools Elements 에서 Phase 0 종료 후 `<filter>` 노드 사라짐 확인 (메모리)
- [ ] DevTools Performance 에서 rAF 루프 종료 후 idle 확인
- [ ] Phase 0 → Phase 1 전환 부드러움
- [ ] 탭/휠 skip 정상

**커밋 + 피드백 대기:**

- [ ] 커밋 메시지: `Add MIL RippleIntro (SVG turbulence + mobile fallback)`
- [ ] **사용자 피드백 수령 → 승인 후 Step 7a 착수**

### Step 7a: LSH (GlitchIntro)

**준비 · 데이터 변경:**

- [ ] `characters.js` LSH `focusBox` +10% 반영 (desktop w:55 h:65, mobile w:55 h:60)

**컴포넌트 작성 (`src/components/cinematic/GlitchIntro.jsx` 신규):**

- [ ] §2 C 섹션 스켈레톤 복사 기반 작성
- [ ] Base layer (Beat 1+, 정적)
- [ ] RGB 3레이어: R/G/B 채널 각각 `hue-rotate` + `mix-blend-mode: screen`
- [ ] G 레이어는 `!isMobile` 로 조건부 (모바일 fallback: 2레이어)
- [ ] `cinemaGlitchR`, `cinemaGlitchG`, `cinemaGlitchB` keyframes 적용 (감쇠 패턴)
- [ ] Scanline overlay (Beat 1, `repeating-linear-gradient`)
- [ ] `<CenteredQuote subtle show={beat === 1} glitch />`
- [ ] `<CenteredQuote hero show={beat >= 2} />`
- [ ] Vignette (Beat 2)

**레지스트리 등록:**

- [ ] `index.js` 에 `glitch: GlitchIntro` 추가

**Keyframes (`index.html`):**

- [ ] `@keyframes cinemaGlitchR` (8 stops, 감쇠)
- [ ] `@keyframes cinemaGlitchG` (5 stops, 감쇠)
- [ ] `@keyframes cinemaGlitchB` (6 stops, 감쇠)
- [ ] `@keyframes cinemaGlitchText` (5 stops, 텍스트 동기화용)

**zIndex 체인 검증:**

- [ ] base (2) < RGB layers (3) < scanline (4) < vignette (5) < CenteredQuote (6) < label (10)

**검증:**

- [ ] `npm run build` 성공
- [ ] 로컬 dev 서버에서 `/characters/leeseha` 진입 → Phase 0 3.2초 진행
- [ ] 데스크톱: RGB 3채널 글리치 + 감쇠 확인
- [ ] 모바일 뷰포트: G 채널 숨김, 2레이어 확인
- [ ] 대사 텍스트가 글리치와 동기화되어 떨리는지 (`cinemaGlitchText` 적용)
- [ ] Beat 2 진입 시 모든 글리치 정착
- [ ] Phase 0 → Phase 1 전환 부드러움
- [ ] 탭/휠 skip 정상

**커밋 + 피드백 대기:**

- [ ] 커밋 메시지: `Add LSH GlitchIntro (RGB channel split with decaying shake)`
- [ ] **사용자 피드백 수령 → 승인 후 Step 7b 착수**

### Step 7b: MMR (FlashIntro) — v4.1 전면 재설계

**준비 · 데이터 변경:**

- [ ] `characters.js` MMR `focusBox` +10% 반영
- [ ] `characters.js` MMR `introComments` **15줄** 추가 (§8-5 확정값 참조)
- [ ] `introStyles.js` `flash.duration` 2000 → **6200**
- [ ] `introStyles.js` `PRELOAD_BUDGET_OVERRIDE.MMR` **제거**
- [ ] v4.1 플래시 사양 변경에 따라 `INTRO_STYLE_CONFIG.flash` 에서 `flashes: 3` 필드 제거 (별도 플래시 없음), `commentOverlay`/`commentDuration`/`commentRows` 필드도 이제 미사용 — **제거**
- [ ] `flash.zoomSequence` 필드 도입 검토 — 현재는 FlashIntro.jsx 내 상수 `ZOOMS` 로 충분

**컴포넌트 작성 (`FlashIntro.jsx` 신규):**

- [ ] 스켈레톤 구조 (위 §2 E 코드 참조)
- [ ] Beat 0 브랜드 컬러 radial glow
- [ ] `CommentStream` 컴포넌트 (같은 파일 내 모듈 함수)
- [ ] `FAKE_NICKS` 상수 (15개 닉네임)
- [ ] `ZOOMS` 상수 (좌상/좌하/우중 3개 좌표)
- [ ] Beat 1 댓글 스트림 렌더 (active 플래그)
- [ ] Beat 2 모션 블러 전환 (`accelerate` 플래그 → CommentStream 블러 + key.webp 페이드인)
- [ ] Beat 3/4/5 zoom 교차 (transition: object-position 0.18s, transform 0.8s)
- [ ] Beat 6 settle (Phase 1 focusBox 좌표로 복귀)
- [ ] CenteredQuote 상주 (Beat 1~5 `subtle`, Beat 6 `hero`) + `blurred` Beat 2 처리
- [ ] Vignette 레이어 (Beat 3+)
- [ ] Chapter label (Beat 6+)
- [ ] INTRO_COMPONENTS.flash 등록

**Keyframes (`index.html`):**

- [ ] `@keyframes mmrCommentRise` 추가 (§2 E 코드 참조)

**에셋 확인:**

- [ ] R2 `prime/ent/MMR/key.webp` 존재 확인 (17MB animated)
- [ ] 로컬 `캐릭터 이미지/MMR/key.webp` 원본 백업 존재 확인

**검증:**

- [ ] 빌드 성공
- [ ] 로컬 진입 → 댓글 스트림 흐름 확인 (15개 스태거)
- [ ] Beat 2 모션 블러 시각 확인
- [ ] 3단 zoom 좌표 정확도 확인 (각 좌표에 캐릭터 신체 부위가 잘 잡히는지)
- [ ] Beat 6 settle 에서 Phase 1 focusBox 와 자연스럽게 교차하는지
- [ ] animated WebP decode 지연이 댓글 구간에 완전히 숨겨지는지 (Beat 3 진입 시 지연/끊김 없음) — **Throttled CPU 4x** 로 실측
- [ ] 모바일 뷰포트 확인 (댓글 chip 너비 · 높이 · 스태거 타이밍)
- [ ] tap to skip 정상
- [ ] **사용자 승인**

### Step 7c: NHR (FogIntro) — **v5 전면 재설계** (2026-04-12)

> ⚠️ **Step 7c 는 완료 후 폐기 재작업**. v4 구현(0b67995 → 5e9f89c, 5커밋)은 품질 미달로 전면 재설계 필요. 상세 재설계 스펙은 **§2 F 섹션** 참조. 본 Step 은 v5 기준 체크리스트로 재구성.

**준비 · 사전 확인 (v5 원칙 #1):**

- [ ] `NHR/key.webp` 를 로컬 또는 브라우저에서 직접 열어 실물 확인
- [ ] §2 F-2 의 줌 좌표 4점(미소 / 시계 / 이어폰 / 전체) 이 실제 KV 디테일과 일치하는지 검증
- [ ] 좌표 미세 조정 결과를 §2 F-2 테이블에 반영 (plan 역주입)

**데이터 변경:**

- [ ] `characters.js` NHR `focusBox` 유지 (v4 값 OK)
- [ ] `characters.js` NHR `keyVisualStage: true` 유지 (이미 반영됨)
- [ ] `INTRO_STYLE_CONFIG.fog.duration` **3500 → 7900** 업데이트 (압축판)
- [ ] `INTRO_STYLE_CONFIG.fog.fogLayers` **2 → 3** 업데이트

**컴포넌트 전면 재작성 (`src/components/cinematic/FogIntro.jsx`):**

- [ ] 기존 v4 구현(TV static canvas + CRT scanlines) **완전 제거**
- [ ] §2 F-6 스켈레톤 복사 기반 작성
- [ ] `ZOOM_POINTS` 상수 — desktop/mobile 좌표 4개 (F-2 반영)
- [ ] `SIG_POS` 상수 — 시그니처 pulse 위치 (beat 2/3)
- [ ] Beat 타이머 6단 (100 / 1800 / 3400 / 5000 / 6700 / 7400, 압축판)
- [ ] Beat 별 `imageFilter`, `fogA/B/C`, `ca`, `imgTransition` 로직 구현
- [ ] KV stage top-70% + `linear-gradient` dissipate mask (bottom 35% → black)
- [ ] Chromatic aberration 3-layer RGB (beat 4 only, ca 2.5 → 0)
- [ ] 안개 Layer A — SVG `<feTurbulence>` + `<feDisplacementMap>` + `cinemaFogBreathe` 22s alternate
- [ ] 안개 Layer B — violet 중경 gradient + `cinemaFogDrift1` 18s linear
- [ ] 안개 Layer C — cool-blue 후경 gradient + `cinemaFogDrift2` 14s linear
- [ ] 시그니처 pulse — beat 2 (watch) / beat 3 (earphone), `cinemaSignaturePulse` 1.2s × 2회
- [ ] bgMarquee — `NAHARIN · ENIGMA · MIST` 하단 8% (opacity 0.05 → 0.10)
- [ ] Vignette — beat 5+ (hero 대사 가독성)
- [ ] `<CenteredQuote subtle show={beat>=1 && beat<=3} quoteIndex={0} />` — "후후..."
- [ ] `<CenteredQuote subtle show={beat===4} quoteIndex={1} />` — "잘 부탁해?"
- [ ] `<CenteredQuote hero show={beat>=5} quoteIndex={1} />` — hero 전환
- [ ] Chapter label + Tap to skip hint

**레지스트리 유지:**

- [ ] `index.js` 의 `fog: FogIntro` 유지 (이미 등록됨)

**Keyframes (`index.html`):**

- [ ] `@keyframes cinemaFogDrift1` 유지 (v4 기존)
- [ ] `@keyframes cinemaFogDrift2` 유지 (v4 기존)
- [ ] `@keyframes cinemaFogBreathe` **신규 추가** (SVG Layer A 호흡, §2 F-7)
- [ ] `@keyframes cinemaSignaturePulse` **신규 추가** (시그니처 pulse, §2 F-7)

**zIndex 체인 검증:**

- [ ] kvStage(2) < kvMask(3) < fogA-svg(4) < fogB(5) < fogC(6) < sigPulse(7) < bgMarquee(8) < vignette(9) < CenteredQuote(internal) < label(10) < skip(10)

**v5 원칙 검증 (§2 F-9 전체):**

- [ ] 원칙 1 (줌인 특정성): 좌표 4개가 모두 의미 있는 디테일?
- [ ] 원칙 2 (비트 여유): 모든 beat static hold ≥ 1000ms?
- [ ] 원칙 3 (KV 네거티브 스페이스): bottom 30% 확보 + 이펙트 채움?
- [ ] 원칙 4 (캐릭터 개성 이펙트): 안개 3층 + pulse + CA, 금지 이펙트 없음?

**빌드 + 실기기 테스트:**

- [ ] `npm run build` 성공 (경고/에러 0)
- [ ] 로컬 dev 서버 `/characters/naharin` 진입 → Phase 0 **7.9초** 진행
- [ ] **Beat 1**: 짙은 안개 속 미소 줌인, "후후..." subtle 표시 (1.1초 hold)
- [ ] **Beat 2**: 안개 1파 걷힘, 손목시계 줌인, 글로우 pulse 2회 (1.1초 hold)
- [ ] **Beat 3**: 안개 재확산, 이어폰 줌인, 글로우 pulse 2회 (1.1초 hold)
- [ ] **Beat 4**: 줌아웃 전체, chromatic aberration 2.5→0 수렴, "잘 부탁해?" subtle 교체 (1.1초 hold)
- [ ] **Beat 5**: hero 대사 + 챕터 라벨 + vignette
- [ ] Phase 0 → Phase 1 전환 부드러움, keyVisualStage top-70% 유지
- [ ] 모바일 뷰포트 확인 (줌 좌표 mobile 테이블 적용)
- [ ] reduced-motion 대응 (Phase 0 건너뜀 정상)
- [ ] 탭/휠/클릭 skip 정상 (Tap to skip hint 표시)
- [ ] **사용자 체감 검증**: "허접함" 없이 유기체 안개 + 의미 있는 줌인 + 1초 이상 여유가 모두 체감되는가?

**커밋 + 피드백 대기:**

- [ ] 커밋 메시지: `Redesign NHR FogIntro v5 (organic fog + meaningful zoom + breathing)`
- [ ] **사용자 피드백 수령 → 승인 후 Step 7d 착수**
- [ ] v5 원칙을 Step 7d/7e 신규 구현에도 적용

### Step 7d: HSR (CardDealIntro) — 2비트 대사

**준비 · 데이터 변경:**

- [ ] `characters.js` HSR `focusBox` +10% 반영 (desktop w:50 h:65, mobile w:65 h:75)

**컴포넌트 작성 (`src/components/cinematic/CardDealIntro.jsx` 신규):**

- [ ] §2 G 섹션 스켈레톤 복사 기반 작성
- [ ] 루트 컨테이너 `perspective: 1200px` 설정
- [ ] Beat 0 골드 세로 라인 (테이블 가장자리, width 2px)
- [ ] Beat 1 `key.webp` `rotateY(90deg) → rotateY(0)`, `transform-origin: left center`, `backface-visibility: hidden` (0.8s)
- [ ] Beat 2 `translateX(-4px)` wobble (overshoot spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`)
- [ ] `<CenteredQuote subtle show={beat === 2} quoteIndex={0} />` — "잘 들어."
- [ ] `<CenteredQuote subtle show={beat === 3} quoteIndex={1} />` — "이번이 마지막 기회야."
- [ ] `<CenteredQuote hero show={beat >= 4} quoteIndex={1} />` — hero 전환
- [ ] Vignette (Beat 4)

**레지스트리 등록:**

- [ ] `index.js` 에 `cardDeal: CardDealIntro` 추가

**Keyframes:** 없음 (인라인 transition + spring easing).

**zIndex 체인 검증:**

- [ ] gold line (1) < card img (2) < vignette (3) < CenteredQuote (6) < label (10)

**검증:**

- [ ] `npm run build` 성공
- [ ] 로컬 dev 서버에서 `/characters/hansori` 진입 → Phase 0 3.6초 진행
- [ ] Beat 1 에서 카드가 90도 뒤집혀 테이블에 안착하는 플립 확인
- [ ] Beat 2 wobble 자연스러운지 (spring overshoot)
- [ ] 첫 대사 → 두 번째 대사 교체 자연스러운지
- [ ] Beat 4 hero 전환
- [ ] Phase 0 → Phase 1 전환 부드러움
- [ ] 모바일 뷰포트 (3D perspective 가 iOS Safari 에서 정상 동작)
- [ ] 탭/휠 skip 정상

**커밋 + 피드백 대기:**

- [ ] 커밋 메시지: `Add HSR CardDealIntro (3D flip with 2-beat quote)`
- [ ] **사용자 피드백 수령 → 승인 후 Step 7e 착수**

### Step 7e: HSE (PageFlipIntro) — 2비트 대사

**준비 · 데이터 변경:**

- [ ] `characters.js` HSE `focusBox` +10% 반영 (desktop w:55 h:75, mobile w:60 h:70)

**컴포넌트 작성 (`src/components/cinematic/PageFlipIntro.jsx` 신규):**

- [ ] §2 H 섹션 스켈레톤 복사 기반 작성
- [ ] 루트 컨테이너 배경 오프화이트 `oklch(0.96 0.01 85)` (종이)
- [ ] 종이 텍스처 레이어 (`repeating-linear-gradient` subtle lines)
- [ ] Beat 1 `key.webp` `clip-path: polygon(0 0, Xpercent% 0, Xpercent% 100%, 0 100%)` 와이프 (1.4s)
- [ ] Seam gradient 레이어 (24px width, `left: Xpercent%` transition 동기화)
- [ ] `<CenteredQuote subtle show={beat === 2} quoteIndex={0} />` — "세상 모든것에는―..."
- [ ] `<CenteredQuote hero show={beat >= 3} quoteIndex={1} />` — "배울 점이 있거든요!" (바로 hero)
- [ ] Vignette (Beat 3)

**레지스트리 등록:**

- [ ] `index.js` 에 `pageFlip: PageFlipIntro` 추가

**Keyframes:** 없음 (`clip-path` + `left` 인라인 transition 동기화).

**zIndex 체인 검증:**

- [ ] paper texture (1) < clipped img (2) < seam gradient (3) < vignette (4) < CenteredQuote (6) < label (10)

**검증:**

- [ ] `npm run build` 성공
- [ ] 로컬 dev 서버에서 `/characters/hasieun` 진입 → Phase 0 3.8초 진행
- [ ] Beat 1 에서 좌→우 페이지 넘김 와이프 확인
- [ ] Seam gradient 가 와이프 경계를 정확히 따라가는지
- [ ] 첫 대사 subtle → 두 번째 대사 hero 자연스러운지
- [ ] Phase 0 → Phase 1 전환 부드러움 (off-white → focusBox focus 교차)
- [ ] 모바일 뷰포트 확인
- [ ] 탭/휠 skip 정상

**커밋 + 피드백 대기:**

- [ ] 커밋 메시지: `Add HSE PageFlipIntro (clip-path wipe with seam gradient)`
- [ ] **사용자 피드백 수령 → 승인 후 Step 8 전수 테스트**

### Step 8: 전수 테스트 체크리스트 (8명 완료 후 회귀)

**기능 회귀:**

- [ ] reduced-motion 미디어쿼리 활성 시 Phase 0 스킵 → Phase 1 직행 (8명 전원)
- [ ] 모바일 탭/터치로 skip (8명 전원)
- [ ] 데스크톱 휠/클릭/Esc 로 skip (8명 전원)
- [ ] preload 500ms 초과 시 fall-open to Phase 1 (slow 3G 시뮬레이션)
- [ ] 뒤로가기 (popstate) → CharCarousel 복귀 정상 (8명 전원)
- [ ] CharNavigation 이전/다음 이동 시 Phase 0 재시작 (상태 리셋) 정상
- [ ] Lightbox (Expressions 클릭) 정상 작동, 뒤로가기 후 스크롤 위치 보존
- [ ] Phase 1 → Phase 2 스크롤 전환 후 Navbar fade-in 정상
- [ ] Phase 2 하단 CharSections (ExpressionsGrid, Navigation, Footer) 정상 렌더

**시각 품질 (v4 핵심):**

- [ ] 8명 전원 Phase 0 첫 비트부터 대사 중앙 노출 확인
- [ ] 8명 전원 Phase 0 → Phase 1 전환이 끊김 없이 부드러운지 (focusBox `objectPosition` 일치 확인)
- [ ] 8명 전원 과도 클로즈업 없는지 — scale 2.0~2.2 상한 준수
- [ ] 8명 전원 Back button (top:68/84, right:16) Phase 1 진입 즉시 노출
- [ ] 8명 전원 Chapter label Phase 0 마지막 비트에 등장, Phase 1 에선 Phase 1 hero 텍스트에 통합

**성능:**

- [ ] 8명 전원 Chrome DevTools Performance — Phase 0 동안 frame drop 없음 (60fps 유지 목표)
- [ ] MIL (SVG 필터) 모바일 뷰포트에서 fallback 자동 활성화
- [ ] MIL Phase 0 종료 시 SVG `<filter>` DOM 언마운트 확인 (DOM 노드 누수 없음)
- [ ] MMR animated WebP 17MB decode 시간이 Beat 1 댓글 구간에 완전히 숨겨짐 (CPU Throttle 4x 실측)
- [ ] Phase 0/1/2 전환 시 메모리 해제 확인 (DevTools Memory heap snapshot)

**접근성:**

- [ ] `prefers-reduced-motion: reduce` 활성 시 Phase 0 완전 스킵
- [ ] 키보드 네비게이션: Esc 로 skip, Tab 으로 Back button 포커스 가능
- [ ] Back button `aria-label="Back"` 확인

**회귀 (기존 캐릭터):**

- [ ] JGR 디테일 페이지 — 기존 구현 변경 없음 (JgrCharDetail 완전 분리)
- [ ] 키비주얼 미보유 7명 (SY/ERK/ELA/NIA/RAY/LPS) — DefaultCharDetail 정상 작동
- [ ] CharCarousel preload 정상 (선택 + 양옆 즉시, 나머지 idle)
- [ ] HeroSlider 배경 preload 정상

---

## 6. 파일 변경 목록 (v4 현황)

**완료된 파일 (Step 1~4):**

- `src/hooks/useImagePreloader.js` — 공통 이미지 프리로드 hook
- `src/data/introStyles.js` — `INTRO_STYLE_CONFIG`, `PRELOAD_BUDGET_OVERRIDE`, `DEFAULT_PRELOAD_BUDGET`
- `src/pages/CharDetail.jsx` — `CinematicCharDetail` 뼈대 (Phase -1/0/1/2, LoadingShell)
- `src/components/cinematic/index.js` — `INTRO_COMPONENTS` 레지스트리
- `src/components/cinematic/CutawayIntro.jsx` — JSH 전용 6400ms 3비트 **(v4 리팩터 대상)**
- `src/data/characters.js` — 7명 시네마틱 필드 등록 (JSH/KHR/LSH/MIL/MMR/NHR/HSR/HSE)
- `src/components/CharCarousel.jsx` — preload + fade-in

**Step 5a (JSH 리팩터) 에서 수정할 파일:**

| 파일 | 변경 |
|---|---|
| `src/data/characters.js` | JSH `zoomSequence` 2.8/2.5 → 2.0/1.9, `focusBox` +10% |
| `src/components/cinematic/CutawayIntro.jsx` | `CenteredQuote` 추출, Beat 1/2 대사 노출, Beat 3 hero 전환, 레터박스 7% |
| `src/data/introStyles.js` | `cutaway.letterbox` false → true |

**Step 5b~7e 에서 생성할 파일:**

| 파일 | 담당 Step |
|---|---|
| `src/components/cinematic/SunriseIntro.jsx` | 5b (KHR) |
| `src/components/cinematic/RippleIntro.jsx` | 6 (MIL) |
| `src/components/cinematic/GlitchIntro.jsx` | 7a (LSH) |
| `src/components/cinematic/FlashIntro.jsx` | 7b (MMR) — CommentStream 포함 |
| `src/components/cinematic/FogIntro.jsx` | 7c (NHR) |
| `src/components/cinematic/CardDealIntro.jsx` | 7d (HSR) |
| `src/components/cinematic/PageFlipIntro.jsx` | 7e (HSE) |
| `src/components/cinematic/index.js` | 각 Step 마다 `INTRO_COMPONENTS` 에 추가 등록 |
| `src/data/characters.js` | 각 Step 마다 해당 캐릭터 `focusBox` +10% 반영 |
| `index.html` | `cinemaSunrise`, `cinemaRipple`, `cinemaGlitch`, `mmrCommentRise`, `cinemaFog`, `cinemaCard`, `cinemaPage` keyframes |

**공용 유틸 후보 (Step 5b 이후 승격 검토):**

`CenteredQuote` 컴포넌트는 Step 5a 에서 CutawayIntro.jsx 안에 둠. 다른 Intro 컴포넌트에서도 동일 구조가 필요한 것이 확정되면 (Step 5b 진입 시점), `src/components/cinematic/CenteredQuote.jsx` 로 추출 승격.

---

## 7. 트레이드오프

| 선택 | 이유 |
|---|---|
| 공통 `useImagePreloader` hook | CharDetail + CharCarousel 둘 다 혜택, 추상화 비용 최소 |
| CharSections 추출 선행 | 3갈래 중복 방지 |
| INTRO_STYLE_CONFIG 상수 테이블 | 분기 폭발 방지 |
| keyframes → index.html | 프로젝트 패턴 준수 |
| SVG 필터: desktop / mobile fallback | 물결(MIL) 모바일 비용 과다 대응 |
| focusBox 필수 | 크롭 수정 라운드 사전 방지 |
| LoadingShell + timeout → Detail Shell | 시네마틱 포기 가능, Detail 도달 보장 |
| Phase 1→2 one-way latch | mount/unmount 반복 방지 |
| 댓글 오버레이: DOM translateY one-shot | SVG보다 가볍고 CharDetail 오버레이에 적합 |
| seam gradient 절대배치 (HSE) | clip-path + box-shadow 비호환 대응 |

---

## 8. 확정 데이터

### 8-1. focusBox (v4: 전부 확정, w/h +10% 확장 반영)

> v4 변경: 모든 `w`/`h` 값을 +10% 확장하여 화질 안전 영역 확보. cx/cy는 유지.
> HSE도 사용자 아이디어 반영되어 미확정 해제.

```js
// JSH — 컷 어웨이. 7% 레터박스 고려, 권위적 상체+얼굴
JSH: {
  desktop: { cx: 50, cy: 35, w: 45, h: 75 },
  mobile:  { cx: 50, cy: 32, w: 55, h: 80 },
},
// KHR — 선라이즈. 양팔 벌린 역동 포즈+리본, 활기찬 얼굴
KHR: {
  // 데스크톱 (가로형): 양팔을 벌린 역동적인 포즈와 리본을 넉넉히 담아내며, 얼굴을 상단 중앙에 배치
  desktop: { cx: 50, cy: 38, w: 65, h: 75 },
  // 모바일 (세로형): 하단의 카메라 UI 비중을 줄이고, 활기찬 얼굴과 상체 위주로 타이트하게 포착
  mobile:  { cx: 50, cy: 32, w: 70, h: 70 },
},
// LSH — 글리치. 베개에 파묻힌 무기력 포즈, 안경 쓴 눈빛
LSH: {
  // 데스크톱 (가로형): 무기력하게 베개에 파묻힌 얼굴과 늘어진 후드 소매의 형태감을 살리도록 포착
  desktop: { cx: 38, cy: 45, w: 55, h: 65 },
  // 모바일 (세로형): "귀찮음"을 가장 잘 보여주는 안경 쓴 눈빛과 표정에 완전히 시선이 고정되도록 강하게 좌측으로 당김
  mobile:  { cx: 32, cy: 40, w: 55, h: 60 },
},
// MIL — 물결. 흩날리는 머리카락+기타+낙하 역동 포즈
MIL: {
  // 데스크톱 (가로형): 흩날리는 머리카락, 기타, 역동적인 낙하 포즈를 넓게 포착
  desktop: { cx: 55, cy: 45, w: 65, h: 80 },
  // 모바일 (세로형): 우측 상단에 위치한 얼굴이 잘리지 않도록 중심을 우측 상단으로 이동하여 타이트하게 포착
  mobile:  { cx: 62, cy: 38, w: 55, h: 75 },
},
// MMR — 플래시. 중앙 브이 포즈+SNS 프레임, 윙크
MMR: {
  desktop: { cx: 48, cy: 42, w: 55, h: 70 },
  mobile:  { cx: 48, cy: 35, w: 65, h: 70 },
},
// NHR — 안개. 환영 포즈+두 팔 궤적, 미소
NHR: {
  // 데스크톱 (가로형): 환영하듯 벌린 두 팔의 궤적과 여유로운 상체, 주변의 복잡한 배경 오브젝트를 넓게 포착
  desktop: { cx: 50, cy: 35, w: 55, h: 75 },
  // 모바일 (세로형): 안개가 걷히면서 가장 먼저 시선을 사로잡을 얼굴과 미소에 집중하도록 타이트하게 포착
  mobile:  { cx: 50, cy: 30, w: 65, h: 70 },
},
// HSR — 카드 딜. 팔짱+흩날리는 자켓, 여유로운 상체
HSR: {
  desktop: { cx: 48, cy: 40, w: 50, h: 65 },
  mobile:  { cx: 48, cy: 36, w: 65, h: 75 },
},
// HSE — 페이지 넘김. 사용자 아이디어 반영 (v4 확정)
HSE: {
  // 데스크톱 (가로형): 턱을 괸 여유로운 상체와 책을 짚고 있는 손, 그리고 양옆의 책더미를 책의 한 페이지처럼 넓게 포착
  desktop: { cx: 48, cy: 45, w: 55, h: 75 },
  // 모바일 (세로형): 세로 화면에 꽉 차도록 턱을 괸 지적인 미소와 상체 위주로 타이트하게 포착
  mobile:  { cx: 45, cy: 35, w: 60, h: 70 },
},

### 8-2. 이미지 에셋 규칙

| 유형 | 파일명 | 용도 | R2 경로 |
|---|---|---|---|
| **키비주얼** | `{CHAR}.webp` | Phase 1 풀스크린 배경 | `ent/{CHAR}.webp` |
| **트랜지션 에셋** | `intro1.webp`, `intro2.webp` ... | Phase 0 트랜지션 전용 (선택) | `ent/{CHAR}/intro1.webp` |

- intro 이미지가 없는 캐릭터 → **키비주얼 이미지를 Phase 0 트랜지션에도 그대로 사용**
- 모든 키비주얼 + intro 이미지는 **R2에 재업로드 필요** (구현 전 Step 3에서 처리)

### 8-3. MMR 특이사항: animated WebP (v4 전략 확정)

MMR `key.webp`는 **animated WebP 17MB**. v4에서 에셋 전략 전면 변경:

- **Phase 0에서 key.webp 사용 금지**. Phase 0 는 CSS/SVG 댓글 트랜지션 + 플래시로만 구성
- `key.webp`는 Phase 1 진입 시점부터만 표시. Phase 0 3초 동안 background decode 완료
- `PRELOAD_BUDGET_OVERRIDE.MMR` **제거** — 표준 500ms 예산으로 충분 (Phase 0 진입만 막지 않으면 됨)
- `introAssets` 는 빈 배열 유지 (신규 intro1.webp 업로드 불필요)
- 이 전략으로 animated WebP decode 대기 시간이 사용자 경험에서 완전히 숨겨짐

### 8-4. quoteSequence (확정)

| 캐릭터 | quoteSequence |
|---|---|
| JSH | `["탈락, 다음."]` |
| KHR | `["오늘도 연습! 아자아자~!"]` |
| LSH | `["하아… 또?"]` |
| MIL | `["그냥 음악이 좋아서."]` |
| MMR | `["보여주는 게 좋으니까~!"]` |
| NHR | `["후후.", "잘 부탁해?"]` |
| HSR | `["잘 들어.", "이번이 마지막 기회야."]` |
| HSE | `["세상 모든것에는―...", "배울 점이 있거든요!"]` |

### 8-5. MMR introComments (v4.1 15줄 확정)

15개 SNS 스타일 댓글. 미모리의 "셀피·라이브·무대" 정체성을 다각도로 드러냄.

```js
introComments: [
  "미모리 뭐야ㅋㅋㅋ",
  "카메라 진짜 잘 받네",
  "오늘도 폼 미쳤다",
  "또 1등이네 ㄷㄷ",
  "보여주는 거 맞네ㅋㅋ",
  "와 스타일 진짜",
  "저 윙크 뭐야ㅠㅠ",
  "진짜 찍혀야 될 사람",
  "미모리 최애 확정",
  "뭘 해도 예쁨",
  "라이브 또 언제야?",
  "미모리 오픈런 어디야",
  "오늘도 메인 캐릭터",
  "표정 관리 실화?",
  "미모리 보고 입덕함",
],
```

**닉네임 15개 (FlashIntro.jsx 내 FAKE_NICKS 상수)**:

```js
const FAKE_NICKS = [
  "fan_01", "momonimo", "kpop_luv", "seoul_cam",
  "idol_diary", "pink_hae", "bluemoon_x", "n_tone",
  "starlight", "clip_daily", "viewcam", "midnightfm",
  "shinedown", "audience_k", "dailypop",
];
```

> 댓글과 닉네임은 Step 7b 착수 시 `characters.js` 에 반영. 사용자가 문구를 조정하고 싶으면 Step 7b 시작 시점에 수정 후 진행.

### 8-6. v4에서 해소된 항목

- [x] HSE focusBox — 사용자 아이디어 반영 후 v4 +10% 확장으로 확정
- [x] MMR preloadBudget — Phase 0 Beat 1 댓글 스크롤이 decode 시간 흡수, 오버라이드 불필요
- [x] MMR introComments — v4.1 에서 15줄 확정 (§8-5)
