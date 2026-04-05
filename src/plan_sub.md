# 사이트 총체적 최적화 상세 (plan_sub.md)

> 사용자 승인 후 구현합니다.
> 상위 문서: `plan.md` "사이트 총체적 최적화"

---

## ① 구조: PageLayout + Hook 소유권

### isMobile 소유권 설계

```
[현재]                              [변경 후]
PageLayout                         PageLayout
├── useIsMobile() ← 소유            ├── useIsMobile() ← 유지 (padding/Navbar/Footer용)
├── children({ isMobile }) ← 전달   ├── {children} ← 일반 ReactNode
│   └── useReveal() ← ⚠ callback   │
│                    내부 호출       │
페이지                              페이지
└── (isMobile 받아서 사용)           ├── useIsMobile() ← 직접 호출
                                    └── useReveal() ← 최상단 호출 ✅
```

- `useIsMobile`은 `matchMedia` 기반 → 중복 호출 비용 무시 가능 (listener 1개만 추가)
- PageLayout의 padding(`80px 24px 48px` vs `120px 48px 80px`)과 Navbar/Footer는 PageLayout 내부 `isMobile`로 계속 처리 → 페이지 코드 변경 최소화

### 변경 패턴 (11개 페이지 공통)

```jsx
// Before
export default function Contact() {
  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.15);  // ⚠ callback 내부 Hook
        return (<section ref={ref} ...>...</section>);
      }}
    </PageLayout>
  );
}

// After
export default function Contact() {
  const isMobile = useIsMobile();
  const [ref, v] = useReveal(0.15);  // ✅ 최상단 Hook
  return (
    <PageLayout>
      <section ref={ref} ...>...</section>
    </PageLayout>
  );
}
```

### 대상 파일 (16개)

**기존 11개**: Contact, Gallery, SvgIntro, Works, ModeFreeplay, ModeActor, ModeManager, ModeTrainee, ModeComposer, ModeInfluencer, ModeProducer

**추가 5개** (피드백 반영): ModeAudition(268행), Updates(161행), NotFound(8행), DistrictDetail(17행, 34행)

> 하나라도 빠지면 즉시 런타임 오류. grep `PageLayout` → `children` 호출 패턴 전수 확인 필수.

---

## ② 모달/인터랙션 접근성 패스

A-2(popstate) + D-1(dialog) + D-2(div→button)을 **한 커밋으로 통합**.

### 요소 교체 3규칙 (확정)

1. **이동** → `<a>` / `<Link>` (URL 변경이 목적)
2. **모달 트리거** → `<button>` (Gallery:433, SvgIntro:97, CharDetail:1060 등)
3. **중첩 인터랙션 금지** — `<a>` 안 `<button>` (HeroSlider:322,326) → 구조 분리 (별도 형제 요소)

### Gallery lightbox state 안정화 (popstate 전제)

현재: 배열 인덱스(Gallery.jsx:131,550)에 의존 → filtered 배열 변동 시 "뒤로가기=같은 이미지 닫기" 계약 깨짐.

```jsx
// Before: 인덱스 기반
setLightbox(index);  // filtered 배열 흔들리면 다른 이미지를 가리킬 수 있음

// After: stable key 기반
setLightbox({ src: item.src, label: item.label });  // src가 identity
```

### 공통 패턴: lightbox popstate

```jsx
function openLightbox(item) {
  setLightbox(item);
  history.pushState({ lightbox: true }, "");
}
useEffect(() => {
  if (!lightbox) return;
  function onPop() { setLightbox(null); }
  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}, [lightbox]);
```

### 공통 패턴: dialog + button

```jsx
// dialog
<div role="dialog" aria-modal="true" aria-label="이미지 상세보기" ...>

// div→button (모달 트리거)
<button onClick={() => openLightbox(item)}
  style={{ background: "none", border: "none", padding: 0,
           font: "inherit", color: "inherit", cursor: "pointer", ... }}>
```

### 파일별 적용 범위

| 파일 | popstate | dialog | div→button | 추가 |
|---|---|---|---|---|
| Gallery.jsx | lightbox | overlay | 이미지 카드 | **stable key 전환** |
| CharDetail.jsx | lightbox | overlay | expr preview | — |
| SvgIntro.jsx | 이미 있음 | 추가 | 템플릿 카드 | — |
| Navbar.jsx | 모바일 메뉴 | 추가 | — | — |
| HeroSlider.jsx | — | — | — | **a안button 구조 분리** |

---

## ③ 성능 hot path

### Particles.jsx 변경 — 캔버스 + RAF 제어

```jsx
// 캔버스 크기 제한
canvas.style.position = "fixed";
canvas.style.inset = "0";
h = window.innerHeight;
canvas.height = h;

// 저사양 감지
const cpuCores = navigator.hardwareConcurrency || 4;
const count = isMobile ? (cpuCores <= 2 ? 15 : 40) : (cpuCores <= 2 ? 40 : 120);

// RAF 비용 제어
// 1) reduced-motion: rAF 미시작
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced) return;  // 정적 상태 유지, 그리지 않음

// 2) visibility pause: 탭 비활성 시 rAF 중단
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(anim.current);
  else anim.current = requestAnimationFrame(draw);
});
```

### transition:all hot path 목록 (26곳)

| 파일 | 곳수 | 주요 대상 |
|---|---|---|
| CharDetail.jsx | 12 | phase 전환, hover, 프로필 패널 |
| Navbar.jsx | 4 | 배경/blur, 링크 hover |
| ScrollNav.jsx | 4 | 도트 hover, 활성 상태 |
| Home.jsx | 4 | 섹션 reveal, CTA |
| HeroSlider.jsx | 2 | divider, 버튼 |

각 `transition: all`을 실제 변경 속성으로 치환:
```jsx
// Before
transition: "all 0.3s"

// After (예: Navbar)
transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s"
```

### prefers-reduced-motion (CSS + JS 양면)

**CSS** (`index.html`):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**JS smooth scroll** (CSS만으로 안 잡히는 곳):
```jsx
// 공통 헬퍼 (utils/ 또는 각 파일 내)
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = prefersReduced ? "auto" : "smooth";

// 적용 대상:
// - Navbar.jsx:36,42 — scrollIntoView({behavior: scrollBehavior})
// - ScrollNav.jsx:42,46 — 동일
// - ModeAudition.jsx:154 — 동일
// - main.jsx:13 — CSS scroll-behavior로 이미 커버
```

---

## ④ 성능 cold path + 네트워크

### transition:all cold path (67곳, 20개 파일)

hot path에서 문제 없으면 동일 패턴으로 일괄 치환. 사용자 hover 검수 필수 파일:
- GameModes (6곳) — 탭/카드 hover 많음
- TriangleNav (8곳) — 프리즘 모자이크 hover
- Gallery (9곳) — 필터 바, 카드 hover

### Hero preload 분산 + autoplay 연동

```jsx
// Before: 9장 동시 → autoplay 즉시 시작 → 미로드 슬라이드 빈 화면
bgImages.forEach(src => { const img = new Image(); img.src = src; });

// After: 최소 2장(현재+다음) 로드 후 autoplay 시작
const loaded = new Set();
function preloadImage(src) {
  return new Promise(resolve => {
    const img = new Image(); img.src = src;
    img.onload = () => { loaded.add(src); resolve(); };
    img.onerror = resolve;
  });
}

// 첫 2장 즉시
Promise.all([preloadImage(bgImages[0]), preloadImage(bgImages[1])]).then(() => {
  setAutoplayReady(true);  // autoplay 시작 게이트
  // 나머지 순차
  bgImages.slice(2).forEach((src, i) => {
    setTimeout(() => preloadImage(src), (i + 1) * 300);
  });
});

// autoplay 전환 시 다음 이미지 로드 체크
// loaded.has(bgImages[nextIdx]) === false → skip 또는 대기
```

---

## ⑤ 접근성/이미지 (사용자 판단 포함)

### 이미지 lazy loading 기준

| 위치 | loading | 이유 |
|---|---|---|
| Hero 배경 | eager | LCP 대상 |
| CharCarousel 현재 캐릭터 | eager | above-the-fold |
| CharDetail 프로필 | eager | hero 내부 |
| Gallery 그리드 | lazy | 이미 적용됨 |
| Expressions preview | lazy | below-the-fold |
| SvgIntro 카드 | lazy | below-the-fold |

### 저시력 대비/터치 (사용자 판단 필요)

현재 문제가 되는 토큰:
| 토큰 | 불투명도 | 용도 | WCAG AA 기준 |
|---|---|---|---|
| `text15` | 15% | Footer 카피, 배경 장식 | 장식용이면 OK, 읽어야 하면 NG |
| `text25` | 25% | 구분자, 뮤트 라벨 | 장식용이면 OK |
| `text35` | 35% | 보조 텍스트 | 어둠 배경 기준 **대비 부족 가능** |
| `goldText` | — | 연한 골드 | 어둠 배경 기준 경계선 |

**사용자 결정 사항**: `text35`를 `text45`로 올리면 보조 텍스트 가독성 개선되지만 미감 달라짐. 사용자가 직접 비교 후 결정.
