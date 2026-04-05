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

### 대상 파일 (11개)

Contact, Gallery, SvgIntro, Works, ModeFreeplay, ModeActor, ModeManager, ModeTrainee, ModeComposer, ModeInfluencer, ModeProducer

---

## ② 모달/인터랙션 접근성 패스

A-2(popstate) + D-1(dialog) + D-2(div→button)을 **한 커밋으로 통합**. 같은 파일의 같은 DOM을 건드리므로 분리하면 회귀 위험만 증가.

### 공통 패턴: lightbox popstate

```jsx
// SvgIntro에서 가져오는 기준 패턴
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

### 공통 패턴: dialog semantics

```jsx
// lightbox wrapper에 추가
<div role="dialog" aria-modal="true" aria-label="이미지 상세보기"
  onClick={() => setLightbox(null)} ...>
```

### 공통 패턴: div→button

```jsx
// Before
<div onClick={() => openLightbox(item)} style={{ cursor: "pointer", ... }}>

// After
<button onClick={() => openLightbox(item)}
  style={{ background: "none", border: "none", padding: 0,
           font: "inherit", color: "inherit", cursor: "pointer", ... }}>
```

### 파일별 적용 범위

| 파일 | popstate | dialog | div→button |
|---|---|---|---|
| Gallery.jsx | lightbox | lightbox overlay | 이미지 카드 |
| CharDetail.jsx | lightbox | lightbox overlay | expr preview |
| SvgIntro.jsx | 이미 있음 | overlay에 추가 | 템플릿 카드 |
| Navbar.jsx | 모바일 메뉴 (선택적) | 모바일 메뉴 | — |

---

## ③ 성능 hot path

### Particles.jsx 변경

```jsx
// Before
h = document.documentElement.scrollHeight || window.innerHeight * 5;
canvas.height = h;
// → 매 프레임 전체 clearRect

// After
canvas.style.position = "fixed";
canvas.style.inset = "0";
h = window.innerHeight;
canvas.height = h;
// → 뷰포트만 clearRect, 스크롤 무관
```

저사양 감지:
```jsx
const cpuCores = navigator.hardwareConcurrency || 4;
const count = isMobile ? (cpuCores <= 2 ? 15 : 40) : (cpuCores <= 2 ? 40 : 120);
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

### prefers-reduced-motion

`index.html`에 추가:
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

---

## ④ 성능 cold path + 네트워크

### transition:all cold path (67곳, 20개 파일)

hot path에서 문제 없으면 동일 패턴으로 일괄 치환. 사용자 hover 검수 필수 파일:
- GameModes (6곳) — 탭/카드 hover 많음
- TriangleNav (8곳) — 프리즘 모자이크 hover
- Gallery (9곳) — 필터 바, 카드 hover

### Hero preload 분산

```jsx
// Before: 9장 동시
bgImages.forEach(src => { const img = new Image(); img.src = src; });

// After: 첫 장 즉시 → 나머지 순차
const first = new Image(); first.src = bgImages[0];
first.onload = () => {
  bgImages.slice(1).forEach((src, i) => {
    setTimeout(() => { const img = new Image(); img.src = src; }, (i + 1) * 200);
  });
};
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
