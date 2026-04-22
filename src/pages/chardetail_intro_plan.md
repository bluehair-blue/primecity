# CharDetail 시네마틱 인트로 — 관례 (Conventions)

> **목적**: JGR 부터 NHR 까지 구현한 8개 시네마틱 Detail 페이지에서 정착된 패턴을 관례로 정리. 향후 HSR / HSE / 미구현 캐릭터 추가 시 본 문서를 단일 진실 공급원으로 사용.
>
> **대체 전임 문서**: v1~v6 (2026-04-10 ~ 2026-04-12 기간의 단계별 step 체크리스트) — git history 에만 보존. 본 문서가 현재 유일한 소스.
>
> **마지막 업데이트**: 2026-04-12 (NHR FogIntro v6 + Phase 1 crop fix 완료)

---

## 0. 구현 현황

| 캐릭터 | 코드 | introStyle | 컴포넌트 | duration | 상태 |
|---|---|---|---|---|---|
| 장그루 | JGR | — | `JgrCharDetail` (CharDetail.jsx 내부) | — | ✅ legacy 유지 |
| 진시혁 | JSH | `cutaway` | `CutawayIntro.jsx` | 6400ms | ✅ |
| 강하람 | KHR | `sunrise` | `SunriseIntro.jsx` | 4900ms | ✅ |
| 이서하 | LSH | `glitch` | `GlitchIntro.jsx` | 6100ms | ✅ |
| 밀라 | MIL | `ripple` | `RippleIntro.jsx` | 6000ms | ✅ |
| 미모리 | MMR | `flash` | `FlashIntro.jsx` | 8800ms | ✅ |
| 나하린 | NHR | `fog` | `FogIntro.jsx` (v6) | 7900ms | ✅ |
| 한소리 | HSR | `cardDeal` | `CardDealIntro.jsx` | 3600ms | ⏳ 미구현 |
| 하시은 | HSE | `pageFlip` | `PageFlipIntro.jsx` | 3800ms | ⏳ 미구현 |

**미보유 키비주얼** (시네마틱 인트로 없이 DefaultCharDetail): SY · ERK · ELA · NIA · RAY · LPS · SPA

---

## 1. 분기 아키텍처 (3갈래)

[src/pages/CharDetail.jsx](CharDetail.jsx#L970-L985) 의 최상위에서 3갈래로 분기:

```jsx
// 1) JGR → legacy 독립 컴포넌트 (intro1/intro2 + 홀로그램)
if (char.id === "janggru") {
  return <JgrCharDetail {...props} />;
}

// 2) introStyle 지정 캐릭터 → 공용 시네마틱 시스템
if (char.introStyle) {
  return <CinematicCharDetail {...props} />;
}

// 3) 기타 (미보유 KV) → DefaultCharDetail 홀로그램 뷰
return <DefaultCharDetail {...props} />;
```

### 1-1. JGR 예외 (legacy)

- **파일**: `JgrCharDetail` — [src/pages/CharDetail.jsx](CharDetail.jsx) 상단 module-scope 함수
- **특징**: intro1/intro2 에셋 + 자체 beat 상태기계 + 홀로그램 UI. `CinematicCharDetail` 로 편입하지 않고 독립 유지 (코드 특수성 + 안정 검증 완료).
- **관례**: **다른 캐릭터에 특별 인트로가 필요해도 JGR 처럼 독립 컴포넌트를 만들지 말 것**. JGR 이후 모든 시네마틱은 `CinematicCharDetail` + `INTRO_COMPONENTS` 레지스트리 패턴으로 통일.

### 1-2. CinematicCharDetail 상태기계

```
Phase -1  LoadingShell (progress bar, timeoutMs = preloadBudget)
   │
   ▼  (조건부 분기)
   ├─ reduced-motion                → Phase 1 직행 (스킵)
   ├─ preload fullyLoaded            → Phase 0 (cinematic 재생)
   └─ timedOut (preloadBudget 초과)  → Phase 1 직행 (fall-open)
   │
Phase 0  Intro overlay (INTRO_COMPONENTS[introStyle] 렌더)
   │     config.duration 경과 → Phase 1 자동 전환
   │     클릭/탭 → skipIntro() → Phase 1 즉시
   │
Phase 1  KeyVisual hero (fixed bg + profile + reflection + 마우스 틸트)
   │     scroll > 80px → Phase 2
   │
Phase 2  Content sections (CharExpressionsGrid → Sign → CharNavigation → Footer)
```

**핵심 원칙**: *Cinematic optional / Detail guaranteed*. 인트로는 포기 가능하지만 최종 Detail 도달은 반드시 보장 (timedOut fallback + reduced-motion).

### 1-3. Phase 1 KV 레이아웃 (CharDetail.jsx 에서 렌더)

- **Fixed 배경**: `position: fixed, inset: 0, zIndex: 0`
- **이미지**: `width: 100%, height: 100%, objectFit: char.keyVisualFit || "cover"`
- **reflection 스트립**: 하단 28% 높이, `scaleY(-1)` + `maskImage linear-gradient(to top, white 0%, transparent 65%)`, opacity 0.18
- **Gradient overlay**: 좌→우 (데스크톱) 또는 하→상 (모바일) 그라디언트로 프로필 텍스트 가독성 확보
- **마우스 틸트** (desktop only): `perspective(1400px) rotateX(±1.5deg) rotateY(±1.5deg)`, 0.45s ease-out transition
- **bgMarquee**: 2줄 영문 텍스트 스크롤 (80s / 100s 반대방향), opacity 0.025 / 0.018

---

## 2. 4대 설계 원칙 (v5 규범, 모든 인트로 공통)

NHR v4→v5→v6 의 반복 수정에서 정착된 4대 원칙. 신규 인트로 구현 시 사전·사후 검증 필수.

### 원칙 1 — 줌인 특정성 (Zoom Specificity)

- Phase 0 의 모든 줌은 캐릭터 KV 이미지의 **의미 있는 디테일**에 맞춰야 함.
- "의미 있는 디테일" 예시:
  - 얼굴 구성요소 — 눈매, 입꼬리, 볼, 귀
  - 시그니처 오브젝트 — JSH 볼펜, NHR 손목시계·이어폰, HSR 카드, HSE 책등
  - 바디랭귀지 — 포즈, 손동작, 머리카락 드리프트
- **금지**: 근거 없는 임의 좌표 (`25% 67%` 같은).
- **필수**: 구현 착수 전 실제 `{CHAR}/key.webp` 를 로컬/브라우저에서 확인하고, 각 좌표가 어떤 디테일을 프레이밍하는지 컴포넌트 상단 주석에 기록.
- 권장 scale 상한: **1.8~2.2** (화질 유지).

### 원칙 2 — 비트 여유 (Beat Breathing Room)

- 각 beat 는 전환 시간 외 **정적 보유 시간(static hold) ≥ 1000ms** 확보.
- 공식: `beatDuration ≥ transitionDuration + 1000ms`.
- 빠른 전환(0.3~0.5s) "휙휙" 연출 금지. NHR v4 Beat 2 850ms hold, Beat 3 200ms hold 가 이 원칙을 위반해 폐기.
- 대사(`CenteredQuote`) 표시 beat 는 읽을 시간 최소 1.2초 추가.
- 검증: 컴포넌트 상단 타임라인 주석에 `[hold 1100]` 같은 형식으로 beat 별 hold 명시.

### 원칙 3 — KV 네거티브 스페이스 / 크롭 금지

- **`characters.js` 에서 시네마틱 캐릭터는 전부 `keyVisualFit: "contain"` 을 써야 함.**
- **`keyVisualStage` 필드 사용 금지** (v6 에서 NHR 에서 제거 완료 — 부분 높이 stage + cover 조합이 반드시 크롭을 유발함).
- Phase 0 인트로 내부에서도 "한눈에 보이는 KV" 보장:
  - 줌 beats → `objectFit: cover` + `transform: scale` (클로즈업 의도된 crop 은 허용)
  - 리빌 beats → `objectFit: contain` (전체 이미지 letterbox)
  - 두 레이어를 cross-fade 하는 **2-layer image 패턴** 권장 (§5-1).
- 네거티브 스페이스는 **이펙트로 채움**: fog, particles, marquee text, grid, 캐릭터 컬러 글로우. 검정 블랙박스 금지.

### 원칙 4 — 캐릭터 개성 이펙트 (Motif 1:1 Mapping)

- 이펙트는 캐릭터 모티프와 **1:1 매핑**되어야 함.
- **금지 이펙트** (허접함 유발):
  - ❌ TV 정적 노이즈 단일 canvas (80×45 random pixel) — NHR v4 폐기 이유
  - ❌ CRT 스캔라인 단독 사용 (볼륨감 있는 모티프와 충돌)
  - ❌ 단색 백플래시 반복 (흰색/검정 번쩍만)
  - ❌ 단일 blur transition 으로만 구성된 인트로
  - ❌ `mixBlendMode: screen` 으로 dark bg 위 밝은 컬러 탈색 유발 (NHR v5 폐기 이유)
- **권장 이펙트** (품질 담보):
  - ✅ SVG `<feTurbulence>` + `<feDisplacementMap>` (유기체 움직임)
  - ✅ `char.color` 기반 `radial-gradient` pulse / `box-shadow` halo / `filter: blur()` glow
  - ✅ Chromatic aberration RGB 3-layer (peak → 수렴)
  - ✅ 모션 블러 (`filter: blur(Xpx)` 전환 중 → 0 on hold)
  - ✅ Bloom / Lens flare (조명 캐릭터 전용)
  - ✅ Parallax 레이어링 (상이한 drift 속도)
- 이펙트 진행 곡선은 이진 on/off 가 아니라 **생성 → 유지 → 해제** 또는 그 반대.

### v5 체크리스트 (신규/재작업 인트로 모두)

```
[ ] KV 이미지 실물 확인 후 줌 좌표 3~4점 선정
[ ] 각 좌표가 어떤 디테일인지 주석 기록
[ ] 비트 타임라인 주석에 transition / hold 분리 표기
[ ] 모든 beat 의 hold ≥ 1000ms 검증
[ ] characters.js 에 keyVisualFit: "contain" 설정
[ ] keyVisualStage 필드 사용하지 않음
[ ] 네거티브 스페이스를 이펙트로 채우는 계획 존재
[ ] 금지 이펙트 목록에 해당하지 않음
[ ] 캐릭터 모티프와 1:1 매핑
[ ] npm run build 성공 + 실기기 3종 테스트 (desktop/mobile/reduced-motion)
```

---

## 3. 공용 컴포넌트 계약 (Shared Contract)

### 3-1. Intro 컴포넌트 시그니처

모든 `{Xxx}Intro.jsx` 는 다음 시그니처를 따른다:

```jsx
export default function XxxIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), T1),
      // ...
      setTimeout(() => setFadingOut(true), TN - 500),  // 500ms fadeOut window
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

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
      {/* 이미지 레이어 (zIndex 2~3) */}
      {/* 이펙트 레이어 (zIndex 4~9) */}
      <CenteredQuote ... />
      {char.introLabel && <span>...</span>}
      <span>Tap to skip</span>
    </div>
  );
}
```

**계약 조항**:

- `onClick={onSkip}` 으로 탭/클릭 스킵 제공 (`CinematicCharDetail.skipIntro` 에 연결).
- 루트 `div` 는 `position: fixed, inset: 0, zIndex: 200` + `overflow: hidden` 고정.
- `fadingOut` state 로 fadeOut 0.5s window 수행. `setFadingOut(true)` 는 `config.duration - 500ms` 에 트리거.
- `onAnimationEnd` / `phase` 전환은 호출하지 않음. Phase 0 → 1 은 `CinematicCharDetail` 의 auto-advance 타이머가 담당.

### 3-2. CenteredQuote (공용 대사 오버레이)

[src/components/cinematic/CenteredQuote.jsx](../components/cinematic/CenteredQuote.jsx) — 모든 인트로가 공유.

| Prop | 타입 | 설명 |
|---|---|---|
| `char` | object | quoteSequence / name / agency / color |
| `isMobile` | bool | 폰트 크기 분기 |
| `emphasis` | `"subtle"` \| `"hero"` | subtle = 대사만 (0.82 opacity), hero = agency + name + 대사 |
| `show` | bool | opacity / transform 게이트 |
| `quoteIndex` | number | `char.quoteSequence[n]`. 2비트 시퀀스(NHR/HSR/HSE)는 0 / 1 교차 |
| `glitch` | bool | `cinemaGlitchText` 애니메이션 (LSH 전용) |
| `blurred` | bool | `filter: blur(8px)` + `translateY(-12px)` (MMR Beat 2 전용) |

**사용 원칙**:

- Phase 0 첫 비트부터 `<CenteredQuote emphasis="subtle" show />` 를 노출.
- 마지막 beat 에서 `<CenteredQuote emphasis="hero" show />` 로 교체 (별도 인스턴스로 렌더, CSS transition 교차).
- 2비트 시퀀스는 두 개의 CenteredQuote 인스턴스를 `quoteIndex={0}` / `quoteIndex={1}` 로 동시에 배치하고 `show` prop 으로 제어.
- hero 전 마지막 subtle beat 는 **1초 이상** 여유 — 대사 읽을 시간.

### 3-3. zIndex 체인 (표준)

| 레이어 | zIndex | 비고 |
|---|---|---|
| 이미지 레이어 | 2~3 | 2-layer 패턴: cover-zoom(2), contain-reveal(3) |
| 모바일 fallback / scanlines | 3~4 | specular sweep, interference bars |
| 비네트 / fog layers | 4~6 | `radial-gradient` / drift gradients |
| Character pulse / glow | 7~8 | 시그니처 디테일 강조 |
| Flash / shutter overlay | 9~10 | 비트 전환 번쩍, iris wipe |
| 레터박스 | 15 | JSH 전용 (`letterbox: true`) |
| Intro overlay 전체 | 200 | 컴포넌트 루트 `div` — `CinematicCharDetail` 이 `position: fixed` 로 띄움 |

### 3-4. `INTRO_COMPONENTS` 레지스트리

[src/components/cinematic/index.js](../components/cinematic/index.js) 에서 키(introStyle) → 컴포넌트 매핑:

```js
export const INTRO_COMPONENTS = {
  cutaway: CutawayIntro,
  sunrise: SunriseIntro,
  glitch:  GlitchIntro,
  ripple:  RippleIntro,
  flash:   FlashIntro,
  fog:     FogIntro,
  // cardDeal, pageFlip — 미구현
};
```

- 신규 Intro 완성 시 반드시 여기에 등록.
- 미등록 style → `CinematicCharDetail` 이 Phase 0 건너뜀 + Phase 1 직행 (안전장치 내장).

---

## 4. 데이터 관례 (`characters.js`)

시네마틱 인트로 대상 캐릭터에 필수로 설정해야 하는 필드:

```js
{
  id: "...",
  cdnId: "...",  // R2 폴더 코드 (JSH, KHR, ...)

  // ── 기본 이미지 ──
  keyVisual: cdnUrl("{CHAR}/key.webp"),

  // ── Cinematic intro ──
  introStyle:    "cutaway",                           // INTRO_COMPONENTS 키
  introAssets:   [cdnUrl("{CHAR}/intro1.webp")],       // 전용 트랜지션 이미지 (선택)
  introLabel:    "Character / Keyword",               // 영문 챕터 자막
  quoteSequence: ["대사1"],                            // 1비트 = 길이 1, 2비트 = 길이 2
  focusBox: {
    desktop: { cx: 50, cy: 35, w: 55, h: 75 },        // cx/cy → Phase 1 objectPosition
    mobile:  { cx: 50, cy: 30, w: 65, h: 70 },        // w/h → 안전 영역 (참고)
  },
  keyVisualFit: "contain",                            // ⚠️ 필수 — Phase 1 크롭 방지

  // ── 선택 ──
  zoomSequence: [                                      // Cutaway / Flash 전용
    { cx: 50, cy: 30, scale: 2.0 },
    { cx: 45, cy: 55, scale: 1.9 },
  ],
  introComments: ["...", "...", ...],                 // MMR 전용 SNS 댓글 (15개)
}
```

**금지 필드**:

- ❌ `keyVisualStage: true` — v6 에서 NHR 이 제거한 필드. 부분 높이 stage + cover 조합이 KV 하단 크롭을 유발함. `keyVisualFit: "contain"` 으로 일원화.

**`keyVisualFit: "contain"` 의 의미**:

- [CharDetail.jsx:644-646](CharDetail.jsx#L644-L646) 에서 읽힘
- Phase 1 에서 `<img height: 100%, objectFit: contain, objectPosition: 50% 50%>` 로 렌더
- 레터박스 허용 → 전체 이미지 가시 보장
- FogIntro Layer B 같은 "contain reveal" 과 handoff 원활

---

## 5. 구현 패턴 (NHR v6 에서 정착, 재사용 권장)

### 5-1. 2-Layer Image Pattern (FogIntro v6 기원)

**용도**: "Beats 1-N 은 클로즈업 줌 / 마지막 beat 는 전체 리빌" 구조.

```jsx
{/* Layer A: 줌 클로즈업 (beats 1~3) — cover + transform scale */}
<img
  key={`zoom-${beat}`}
  src={char.keyVisual}
  style={{
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
    objectPosition: currentZoom.pos,
    transform: `scale(${currentZoom.scale})`,
    transformOrigin: currentZoom.pos,
    filter: "saturate(0.7) brightness(0.82)",  // static
    opacity: isRevealBeat ? 0 : 1,
    animation: isZoomBeat ? "cinemaXxxFlash 1.5s ease-out forwards" : "none",
    transition: isRevealBeat ? "opacity 0.7s ease-out" : "none",
    zIndex: 2,
  }}
/>

{/* Layer B: 전체 리빌 (beats 4~5) — contain */}
<img
  src={char.keyVisual}
  style={{
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "contain",
    objectPosition: "50% 50%",
    opacity: isRevealBeat ? 1 : 0,
    transition: "opacity 0.9s ease-out",
    zIndex: 3,
  }}
/>
```

**장점**:
- 단일 `<img>` 로 `objectFit` 을 런타임에 바꿀 때 생기는 reflow 점프 없음.
- 브라우저가 같은 URL 을 캐시하므로 디코드 비용 0.
- Phase 1 의 contain fit 과 매끄럽게 handoff (Layer B 가 그대로 Phase 1 이미지 역할).

### 5-2. Flash Keyframe Pattern (opacity-only)

**용도**: 비트 전환 시 이미지가 "번쩍이는" 느낌 (fade-in → hold → crackle-out → hold).

```css
@keyframes cinemaXxxFlash {
  0%   { opacity: 0; }
  8%   { opacity: 1; }
  38%  { opacity: 1; }
  42%  { opacity: 0.18; }
  48%  { opacity: 1; }
  78%  { opacity: 1; }
  82%  { opacity: 0.22; }
  88%  { opacity: 1; }
  100% { opacity: 1; }
}
```

**규칙**:
- **opacity 만 애니메이션**, filter 는 static style 로 분리 (animation 이 filter 를 덮어쓰지 않게).
- React `key={beat}` 로 컴포넌트 remount 유도 → animation restart.
- 1.5s 기준 visible hold ≈ 1100ms (원칙 2 충족).
- 이 패턴은 FogIntro 에서 검증됨. 향후 HSR(cardDeal) 의 카드 안착 shake, HSE(pageFlip) 의 페이지 넘김에도 응용 가능.

### 5-3. Signature Pulse (normal compositing)

**용도**: 특정 디테일(시계·이어폰·카드·책) 위에 캐릭터 컬러 글로우 펄스.

```jsx
{beat === N && (
  <div
    key={`pulse-${beat}`}
    style={{
      position: "absolute",
      left: pulsePos.left, top: pulsePos.top,
      width: isMobile ? 260 : 360,
      height: isMobile ? 260 : 360,
      borderRadius: "50%",
      transform: "translate(-50%, -50%)",
      background: char.color,
      filter: "blur(70px)",          // ← 솔리드 컬러 + blur 로 halo
      opacity: 0,
      animation: "cinemaXxxPulse 1.5s ease-out forwards",
      zIndex: 8,                     // ← 다른 이펙트 위
      pointerEvents: "none",
      // ❌ mixBlendMode: "screen" 금지 (washed out 됨)
    }}
  />
)}
```

**핵심**:
- `mixBlendMode` 없음 → normal compositing 으로 선명한 컬러 유지.
- `filter: blur(60~80px)` 으로 soft halo 효과. `radial-gradient` 보다 선명.
- `char.color` 직접 사용 → 캐릭터 브랜드 컬러 유지.
- NHR v5 는 `mixBlendMode: screen` + `radial-gradient closest-side` 로 만들었다가 완전 invisible. v6 에서 이 패턴으로 교체 후 가시화됨.

### 5-4. Electromagnetic Noise (SVG feTurbulence + CSS crackle)

**용도**: "지직거리는" 노이즈 (NHR v6 전자기 신호 튜닝 모티프).

```jsx
<svg
  aria-hidden="true"
  style={{
    position: "absolute", inset: "-3%",
    width: "106%", height: "106%",
    opacity: noiseOpacity,
    mixBlendMode: "overlay",  // ← screen 아님 (탈색 방지)
    zIndex: 5,
    pointerEvents: "none",
    animation: isNoiseBeat ? "cinemaXxxCrackle 0.1s steps(4) infinite" : "none",
  }}
>
  <defs>
    <filter id="xxxNoise">
      <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="13" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.92 ..." />
    </filter>
  </defs>
  <rect width="100%" height="100%" filter="url(#xxxNoise)" />
</svg>
```

**규칙**:
- SVG `<feTurbulence>` 는 **정적** (내장 `<animate>` 쓰지 않음 — 브라우저 지원 불안정).
- 동적 움직임은 **SVG 요소 자체에 CSS transform 키프레임** 으로 처리.
- `inset: -3%` / `width: 106%` — crackle shake 가 엣지를 노출시키지 않도록 여유.
- `mixBlendMode: overlay` 는 이미지 위에 노이즈를 얹되 색 탈색이 거의 없음. `screen` 은 밝기 쪽으로 편향되므로 금지.
- 80×45 canvas TV static 은 금지 (원칙 4). SVG turbulence 가 훨씬 유기체적이고 캐시 친화적.

### 5-5. Crackle Glitch Bars (moving horizontal streaks)

**용도**: 수평 간섭 띠 이동 (전자기 신호 · 글리치 효과).

```jsx
<div
  key={`crackle-${beat}`}
  style={{
    background:
      "linear-gradient(to bottom, transparent 0%, transparent 17%, oklch(0.92 0.05 310 / 0.55) 18%, transparent 19%, transparent 44%, oklch(0.85 0.08 260 / 0.45) 45%, transparent 46%, ...)",
    opacity: isNoiseBeat ? 0.7 : 0,
    animation: isNoiseBeat ? "cinemaXxxGlitchBars 0.38s steps(3) infinite" : "none",
    mixBlendMode: "screen",
    zIndex: 6,
  }}
/>
```

```css
@keyframes cinemaXxxGlitchBars {
  0%   { transform: translateY(0) scaleX(1); }
  33%  { transform: translateY(-12%) scaleX(1.015); }
  66%  { transform: translateY(22%)  scaleX(0.985); }
  100% { transform: translateY(-5%)  scaleX(1); }
}
```

**주의**: glitch bars 는 `mixBlendMode: screen` 허용 (색 번짐이 의도된 효과). 단, **이미지 위** 에만 적용하고 **텍스트 위** 엔 얹지 말 것.

### 5-6. Chromatic Aberration (RGB 3-Layer)

**용도**: reveal 순간의 "신호가 맞춰지는" 느낌.

```jsx
{ca > 0 && ["R", "G", "B"].map((channel, i) => {
  const dx = (i - 1) * ca;
  const hue = channel === "R" ? 0 : channel === "G" ? 120 : 240;
  return (
    <img
      key={channel}
      src={char.keyVisual}
      style={{
        position: "absolute", inset: 0,
        objectFit: "cover",
        objectPosition: currentZoom.pos,
        transform: `scale(${currentZoom.scale}) translate(${dx}px, 0)`,
        filter: `hue-rotate(${hue}deg) saturate(1.3)`,
        mixBlendMode: "screen",
        opacity: 0.45,
        transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}
    />
  );
})}
```

- Peak 값 `ca = 2.5px` → hold 중 `ca → 0` 수렴.
- 수렴 후 base 이미지로 복귀. 계속 유지하지 말 것 (DOM 낭비).

---

## 6. Keyframe 라이브러리

[index.html](../../index.html) `<style>` 태그에 정의. 재사용 가능한 애니메이션 모음.

### 6-1. 공통

| 이름 | 용도 | 사용 중 |
|---|---|---|
| `bgMarquee` | 2줄 배경 마퀴 좌→우 | Phase 1 (모든 캐릭터), FogIntro 네거티브 스페이스 |
| `bgMarqueeReverse` | 2줄 배경 마퀴 우→좌 | Phase 1 |
| `scrollPulse` | 스크롤 힌트 bounce | CharDetail |
| `splashFadeIn` | splash 페이드인 | Loading |

### 6-2. Intro 전용

| 이름 | 소유 스타일 | 용도 |
|---|---|---|
| `cinemaCutIn` | cutaway | Ken Burns 줌 비트 #1 |
| `cinemaClipUp` | cutaway | 비트 #3 hero 업-클립 |
| `cinemaFlash` | cutaway | 흰 플래시 100ms |
| `cinemaTypewriter` | cutaway | 타이프라이터 대사 |
| `cinemaIrisWipe` | sunrise | 셔터 아이리스 와이프 |
| `cinemaSunriseFlare` | sunrise | 일출 flare |
| `cinemaGlitchMain` | glitch | LSH 메인 흔들림 |
| `cinemaGlitchR` | glitch | R 채널 ghost |
| `cinemaGlitchG` | glitch | G 채널 ghost (desktop only) |
| `cinemaGlitchB` | glitch | B 채널 ghost |
| `cinemaGlitchText` | glitch | 대사 글리치 텍스트 |
| `cinemaGlitchLayer` | glitch | 레이어 아티팩트 |
| `cinemaLshPan` | glitch | KV 세로 pan |
| `cinemaRippleFade` | ripple | 모바일 ripple fade |
| `cinemaNhrFlash` | fog (v6) | opacity-only 2회 crackle |
| `cinemaNhrCrackle` | fog (v6) | SVG 10Hz 지터 |
| `cinemaNhrGlitchBars` | fog (v6) | 수평 간섭 띠 이동 |
| `cinemaNhrPulse` | fog (v6) | 시그니처 디테일 pulse |
| `cinemaNhrFlashOverlay` | fog (v6) | 비트 전환 흰 번쩍 |
| `cinemaCardFlip` | cardDeal | 카드 flip (미구현) |
| `cinemaPageWipe` | pageFlip | 페이지 넘김 (미구현) |
| `mmrCommentRise` | flash | SNS 댓글 상승 |
| `jgrKenBurns` | JGR legacy | JgrCharDetail 전용 |

**네이밍 규칙**:
- `cinema{Style}{Action}` (예: `cinemaNhrFlash`). 캐릭터 코드 4자 이내로.
- v6 이후 신규 키프레임은 캐릭터 코드 접두사 사용 (`cinemaNhr*`, `cinemaHsr*`, `cinemaHse*`) — 스타일별 네임스페이스 분리.

---

## 7. 스타일별 구현 요약

### 7-1. Cutaway (JSH, 6400ms) — 컷어웨이 몽타주

**컨셉**: 2회 Ken Burns 줌 + 2회 흰 플래시 → hero 업클립. 의도된 "과부하" 연출.

- **에셋**: `intro1.webp` (별도 트랜지션 컷)
- **비트**: 5단 (black 200 → zoom#1 1500 → flash #1 100 → zoom#2 1500 → flash #2 100 → hero 2400 → fadeOut 600)
- **특징**: `letterbox: true` (상하 7%, zIndex 15), 타이프라이터 효과 (`cinemaTypewriter`)
- **코드**: [CutawayIntro.jsx](../components/cinematic/CutawayIntro.jsx)

### 7-2. Sunrise (KHR, 4900ms) — 스마트폰 카메라 → 필름 현상

**컨셉**: "카메라가 KHR 을 촬영 → 셔터 → 필름 사진으로 현상"

- **에셋**: `intro1.webp` (촬영 원본)
- **비트**: 6단 (dark UI 300 → focus scan 600 → focus pan 700 → focus lock 700 → shutter+flash 150 → film develop 1550 → hero 400 → fadeOut 500)
- **특징**: Camera HUD (`f/1.8 1/1000 ISO 100`, `REC`), focus rectangle 애니메이션, iris wipe, film grain SVG data URI
- **코드**: [SunriseIntro.jsx](../components/cinematic/SunriseIntro.jsx)

### 7-3. Glitch (LSH, 6100ms) — 신호 깨짐 + KV pan

**컨셉**: "신호가 깨지다 → KV 위에서 아래로 천천히 훑음 → 정착"

- **에셋**: `intro1.webp`
- **비트**: 4단 (black 300 → glitch 2100 → KV pan 1800 → settle 1400 → fadeOut 500)
- **특징**: R/B ghost 복제본 (desktop 3-layer, mobile R only) screen blend, `cinemaGlitchText` 대사, `cinemaLshPan` 1.8s pan
- **코드**: [GlitchIntro.jsx](../components/cinematic/GlitchIntro.jsx)

### 7-4. Ripple (MIL, 6000ms) — 음파 왜곡 + hero

**컨셉**: "카메라가 밀라를 훑어본 뒤 → 음파가 이미지를 흔든다 → 잔잠해짐"

- **에셋**: `intro1.webp`
- **비트**: 5단 (black 300 → zoom#1 lower body 1200 → zoom#2 middle 1200 → ripple 1800 → hero hold 1000 → fadeOut 500)
- **특징**: SVG `<feTurbulence>` + `feDisplacementMap` (desktop) + rAF decay baseFrequency, mobile 은 CSS `scaleY` + specular sweep fallback, `requiresSvgFilter: true`, `mobileFallback: "simpleRipple"`
- **코드**: [RippleIntro.jsx](../components/cinematic/RippleIntro.jsx)

### 7-5. Flash (MMR, 8800ms) — SNS 댓글 스트림 + 3-zoom

**컨셉**: "댓글 스크롤 → 모션블러 전환 → KV 3단 줌 → hero"

- **에셋**: 없음 (`key.webp` 는 animated WebP 17MB — Phase 0 에서 사용 금지, Phase 1 에서만)
- **비트**: 7단 (brand 300 → comments 2700 → motion blur 400 → zoom#1 1100 → zoom#2 1100 → zoom#3 1100 → settle 1600 → fadeOut 500)
- **특징**: `CommentStream` 내부 컴포넌트 (15개 chip 155ms stagger), `FAKE_NICKS` 15명, `CenteredQuote blurred` 모션블러 브리지 전용
- **코드**: [FlashIntro.jsx](../components/cinematic/FlashIntro.jsx)

### 7-6. Fog (NHR, 7900ms, v6) — 전자기 신호 튜닝

**컨셉**: "망가진 전자기 신호가 NHR 을 튜닝"

- **에셋**: 없음 (`key.webp` 만 사용)
- **비트**: 6단 (black 100 → L smile flash 1500 → R watch flash 1500 → L earphone flash 1500 → contain reveal 1900 → hero 900 → fadeOut 500)
- **특징**: 2-layer image (cover zoom + contain reveal), SVG feTurbulence EM noise + crackle shake + glitch bars + scanlines, 보라 pulse (blur 70px), `cinemaNhrFlash` opacity-only keyframe (원칙 2 준수)
- **ZOOM_BEATS** 구조체: `desktop: { 1: {pos, scale}, 2: {...}, 3: {...} }` 좌우 교차
- **PULSE_POS** 구조체: beat 2 (watch), beat 3 (earphone)
- **코드**: [FogIntro.jsx](../components/cinematic/FogIntro.jsx)

### 7-7. CardDeal (HSR, 3600ms) — 미구현

**컨셉**: "카드 딜러가 테이블 위에 KV 를 뒤집어 내려놓는다"

- **에셋**: `key.webp` 만
- **예상 비트**:
  - Beat 0: black + 얇은 골드 세로 라인 (테이블 가장자리)
  - Beat 1: `perspective(1200px) rotateY(90→0deg)` 카드 딜 (800ms)
  - Beat 2: 수평 떨림 안착 + `quote[0]` "잘 들어." subtle
  - Beat 3: `quote[1]` "이번이 마지막 기회야." subtle
  - Beat 4: hero 전환
- **v5 체크리스트 적용**: `keyVisualFit: "contain"` 필수, 카드 안착 hold ≥ 1000ms, pulse 는 카드 가장자리 골드 엣지 glow 권장

### 7-8. PageFlip (HSE, 3800ms) — 미구현

**컨셉**: "책의 한 페이지가 넘겨지며 NHR 이 드러남"

- **에셋**: `key.webp` 만
- **예상 비트**:
  - Beat 0: black + 책 페이지 모서리 (하단 텍스처)
  - Beat 1: 페이지 접힘 진행 (`cinemaPageWipe`), 대사 "세상 모든것에는―..."
  - Beat 2: 페이지 완전 넘어감 + hero
  - Beat 3: hero hold "배울 점이 있거든요!"
- **pulse 위치**: 책 등 / 책갈피 (`char.signature` 참고)

---

## 8. 구현 정책

### 8-1. 1 캐릭터 완전 구현 → 사용자 피드백 → 다음 캐릭터

**절대 일괄 진행 금지**. NHR v4→v5→v6 반복 수정은 일괄 진행의 위험성을 증명한 사례.

각 캐릭터 구현 단계:

1. `NHR/key.webp` 같은 실제 KV 이미지를 브라우저에서 확인 → 줌 좌표 3~4점 선정
2. 컴포넌트 작성 (공용 contract 준수, 4대 원칙 검증)
3. `characters.js` 필드 업데이트 (`keyVisualFit: "contain"` 확인)
4. `introStyles.js` 의 `INTRO_STYLE_CONFIG[style].duration` 설정
5. `index.html` 에 필요한 키프레임 추가
6. `INTRO_COMPONENTS` 레지스트리 등록
7. `npm run build` 성공 확인
8. 로컬 dev 서버 실기기 3종 테스트 (desktop / mobile / reduced-motion)
9. 사용자 체감 검증 → 피드백 수령
10. 승인 후 커밋 → 다음 캐릭터 착수

### 8-2. 연쇄 영향 전수 조사

CLAUDE.md §핵심규칙 — 파일 수정 시 연쇄 영향 전수 조사 필수. 시네마틱 인트로에서 특히 주의할 연쇄 지점:

| 수정 파일 | 영향받는 지점 |
|---|---|
| `characters.js` NHR 필드 | Phase 1 KV 렌더 (CharDetail.jsx), Phase 0 이미지 레이어 (FogIntro), CharCarousel 카드 |
| `INTRO_STYLE_CONFIG.{style}.duration` | Phase 0 auto-advance 타이머, fadeOut 시점 |
| `INTRO_COMPONENTS` 레지스트리 | Phase 0 렌더 분기, 미등록 style 은 Phase 0 건너뜀 |
| `index.html` 키프레임 | 해당 키프레임을 사용하는 모든 인트로 |
| `CenteredQuote.jsx` | 6개 인트로 전부 |
| `keyVisualFit` 필드 | Phase 1 이미지 레이아웃, reflection 스트립, Phase 0 → 1 handoff |

### 8-3. 빌드 검증 + 실기기 테스트

커밋 전 필수:

1. `npm run build` 성공 (경고 허용, 에러 0)
2. 로컬 `npm run dev` 에서 `/characters/{name}` 진입 테스트
3. Desktop / Mobile viewport 각각 확인
4. `prefers-reduced-motion: reduce` 에서 Phase 0 건너뛰고 Phase 1 직행 확인
5. Tap to skip 작동 확인
6. Phase 0 → Phase 1 handoff 부드러움 확인 (이미지 점프 없음)
7. "허접함" 체감 검증 — 이펙트가 캐릭터 모티프와 일치하는지 사용자 판단

---

## 9. 이력

본 문서는 **현재 구현 기준 관례** 만 담는다. 세부 이력은 git log 에서 확인.

- **v1~v3** (2026-04-01 ~ 04-09) — 초기 Step 설계 (JGR 외 7종 계획)
- **v4** (2026-04-10) — JSH / KHR / MIL 구현 완료, Phase 1 이펙트 추가 (tilt · reflection · bgMarquee)
- **v5** (2026-04-12 오전) — NHR 유기체 fog + 3-zoom + 10.5s → 7.9s 압축. 구현 결과 품질 미달 (하얀 레이어, smooth pan, pulse 비가시, crop)
- **v6** (2026-04-12 오후) — NHR 재설계 "망가진 전자기 신호" + 2-layer image pattern + flash keyframe + Phase 1 crop fix. 본 관례 문서 정착.
- **앞으로** — HSR cardDeal / HSE pageFlip 구현 시 본 문서를 단일 진실 공급원으로 사용. 신규 패턴 발견 시 §5 에 편입.
