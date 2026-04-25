# CharDetail 파일 분할 — plan_sub.md

> **목표**: CharDetail.jsx(663줄)를 순수 디스패처 + 독립 뷰 파일로 분할.
> 유지보수성 향상 + 각 뷰가 독립적으로 고수준 트랜지션을 구현할 수 있는 구조.
> **마지막 갱신**: 2026-04-15

---

## 0. 현황 진단

```
CharDetail.jsx (663줄) ← 디스패처 + DefaultCharDetail 혼재
  ├─ L1-17:   import 16개 (Default 전용 8개 + 공용 8개 혼합)
  ├─ L20-98:  CharDetail() — params/state/reset/scroll + Default 전용 state 7개
  ├─ L100-117: 3갈래 분기 (not-found → JGR → Cinematic → Default)
  └─ L119-663: DefaultCharDetail 렌더 (544줄, 홀로그램 UI)
```

**문제**:
1. 디스패처 50줄 + Default 뷰 544줄이 한 파일에 혼재
2. Default 전용 state(`uiReady`, `phase`, `glitchDone`, `imgError`, `tilt`, `contentReached`)가 라우터 스코프를 오염
3. Default에서만 쓰는 import(`Link`, `useReveal`, `Particles`)가 JGR/Cinematic 경로에도 번들 로딩
4. 3곳(JGR·Cinematic·Default)에 Sign 섹션·profileFields 패턴 복붙 → 유지보수 부채

---

## 1. 분할 아키텍처

### 1-1. 파일 배치 결정

```
src/
├── pages/
│   └── CharDetail.jsx          ← 순수 디스패처 (≈55줄)
└── components/
    ├── DefaultCharDetail.jsx   ← 신규 (≈550줄, 홀로그램 UI)
    ├── JgrCharDetail.jsx       ← 기존 유지 (402줄)
    ├── CinematicCharDetail.jsx ← 기존 유지 (486줄)
    ├── CharSign.jsx            ← 신규 공용 (≈25줄)
    └── cinematic/              ← 기존 유지
```

**결정 근거**:

| 선택지 | 장점 | 단점 | 채택 |
|--------|------|------|------|
| `components/DefaultCharDetail.jsx` | JGR·Cinematic과 동일 위치, import 경로 `./` 통일 | — | **✅ 채택** |
| `pages/DefaultCharDetail.jsx` | pages 폴더에 "CharDetail 패밀리" 모임 | JGR·Cinematic과 다른 위치, import 경로 혼재 | ❌ |

### 1-2. 라우팅 결정

```
App.jsx
  └─ /characters/:name → CharDetail (lazy)   ← 변경 없음
```

**단일 라우트 + 디스패처 패턴 유지**.

이유:
- `prevChar`/`nextChar`/`sameAgency` 계산이 3곳 공통 → 디스패처에서 1번 계산
- App.jsx의 lazy 경계가 CharDetail 1개 → 코드 스플리팅 포인트 유지
- 향후 캐릭터 유형 추가 시 App.jsx 건드리지 않고 디스패처만 수정

---

## 2. 공용 컴포넌트 추출

### 2-1. CharSign.jsx (Sign 섹션 — 3곳 동일 코드)

현재 JGR(L373-378), Cinematic(L452-457), Default(L630-636)에 **완전 동일한** Sign 섹션 복붙:

```jsx
// src/components/CharSign.jsx — 신규
import C from "../styles/tokens";

export default function CharSign({ char, isMobile }) {
  if (!char.sign) return null;
  return (
    <section style={{
      padding: isMobile ? "32px 24px 48px" : "48px 64px",
      maxWidth: 1100, margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <p style={{
        fontFamily: "var(--f-display-en)", fontSize: 10,
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: C.goldText, margin: "0 0 20px",
      }}>Sign</p>
      <img
        src={char.sign}
        alt={`${char.name} signature`}
        style={{
          maxWidth: isMobile ? 220 : 300, height: "auto",
          opacity: 0.9,
          filter: `drop-shadow(0 2px 18px ${char.color}77)`,
        }}
      />
    </section>
  );
}
```

**적용**: 3곳의 인라인 Sign 섹션을 `<CharSign char={char} isMobile={isMobile} />` 로 교체.

### 2-2. profileFields 헬퍼 (3곳 동일 로직)

현재 3곳 모두 동일한 필터 로직:
```js
const profileFields = [
  { label: "직업", en: "JOB", value: char.job },
  { label: "배경", en: "BACKGROUND", value: char.background },
  { label: "취향", en: "TASTE", value: char.taste },
  { label: "목표", en: "GOAL", value: char.goal },
].filter((f) => f.value);
```

→ **추출하지 않는다**. 이유: 4줄짜리 인라인 로직이며, 각 뷰에서 렌더 방식이 다름(JGR은 grid, Cinematic은 flex column, Default는 animated border-left). 헬퍼로 빼면 오히려 불필요한 abstraction.

---

## 3. CharDetail.jsx — 순수 디스패처 (목표 ≈55줄)

```jsx
// src/pages/CharDetail.jsx — 리팩터 후
import { useParams, Link } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { characters } from "../data/characters";
import JgrCharDetail from "../components/JgrCharDetail";
import CinematicCharDetail from "../components/CinematicCharDetail";
import DefaultCharDetail from "../components/DefaultCharDetail";
import C from "../styles/tokens";

export default function CharDetail() {
  const { name } = useParams();
  const isMobile = useIsMobile();

  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar = charIndex < characters.length - 1 ? characters[charIndex + 1] : null;
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  // ── Not found ──
  if (!char) {
    return (
      <div style={{
        background: C.bgDeep, color: C.white, minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-body)",
      }}>
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>
          캐릭터를 찾을 수 없습니다.
        </p>
        <Link to="/" style={{
          color: C.gold, textDecoration: "none",
          fontSize: 13, letterSpacing: "0.1em",
        }}>&larr; 메인으로 돌아가기</Link>
      </div>
    );
  }

  // ── Dispatch ──
  const props = { char, isMobile, prevChar, nextChar, sameAgency };

  if (char.id === "janggru") return <JgrCharDetail {...props} />;
  if (char.introStyle)       return <CinematicCharDetail {...props} />;
  return <DefaultCharDetail {...props} />;
}
```

**변경점**:
- Default 전용 import 전부 제거 (`useNavigate`, `useState`, `useEffect`, `useRef`, `useReveal`, `useCharLightbox`, `Navbar`, `Particles`, `Footer`, `Seo`, `CharLightbox`, `CharExpressionsGrid`, `CharNavigation`)
- Default 전용 state/effect 전부 제거
- `props` 객체로 spread → 타이핑 실수 방지
- not-found 렌더만 디스패처에 잔류 (라우트 레벨 404)

---

## 4. DefaultCharDetail.jsx — 홀로그램 UI (≈550줄)

### 4-1. import 구성

```jsx
// src/components/DefaultCharDetail.jsx — 신규
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import useCharLightbox from "../hooks/useCharLightbox";
import Navbar from "./Navbar";
import Particles from "./Particles";
import Footer from "./Footer";
import Seo from "./Seo";
import CharLightbox from "./CharLightbox";
import CharExpressionsGrid from "./CharExpressionsGrid";
import CharNavigation from "./CharNavigation";
import CharSign from "./CharSign";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
```

**차이**: `Link`·`useIsMobile`·`characters`·`JgrCharDetail`·`CinematicCharDetail` 불필요 (디스패처에서 처리).

### 4-2. 함수 시그니처

```jsx
export default function DefaultCharDetail({ char, isMobile, prevChar, nextChar, sameAgency }) {
  const { name } = useParams();
  const navigate = useNavigate();
  // ... 기존 CharDetail.jsx L24-L98의 Default 전용 state/effect 그대로 이동
```

### 4-3. 이동 대상 (CharDetail.jsx에서 잘라내기)

| 원본 줄 | 내용 | 비고 |
|---------|------|------|
| L24-35 | `scrolled`, `uiReady`, `phase`, `glitchDone`, `imgError`, `lightbox`, `exprErrors`, `tilt`, `contentReached`, refs | 그대로 이동 |
| L46-58 | Reset + animation sequence `useEffect` | 그대로 이동 |
| L60-65 | Scroll detection `useEffect` | 그대로 이동 |
| L67-76 | Content section observer `useEffect` | 그대로 이동 |
| L78-90 | Mouse tilt handlers | 그대로 이동 |
| L92-98 | `useReveal`, `showPhase2Cue`, `cueCopy` | 그대로 이동 |
| L119-663 | 전체 렌더 JSX | Sign 섹션만 `<CharSign>` 교체, 나머지 그대로 |

### 4-4. Sign 섹션 교체

```diff
-      {/* ══════════ Sign ══════════ */}
-      {char.sign && (
-        <section style={{ padding: isMobile ? "32px 24px 48px" : "48px 64px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
-          <p style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, margin: "0 0 20px" }}>Sign</p>
-          <img src={char.sign} alt={`${char.name} signature`} style={{ maxWidth: isMobile ? 220 : 300, height: "auto", opacity: 0.9, filter: `drop-shadow(0 2px 18px ${char.color}77)` }} />
-        </section>
-      )}
+      <CharSign char={char} isMobile={isMobile} />
```

---

## 5. JgrCharDetail · CinematicCharDetail — Sign 교체만

기존 파일의 인라인 Sign 섹션을 `<CharSign>` 으로 교체:

### 5-1. JgrCharDetail.jsx

```diff
 import CharNavigation from "./CharNavigation";
+import CharSign from "./CharSign";

 // ... L373-379:
-        {/* Sign */}
-        {char.sign && (
-          <section style={{ ... }}>
-            <p style={{ ... }}>Sign</p>
-            <img src={char.sign} ... />
-          </section>
-        )}
+        <CharSign char={char} isMobile={isMobile} />
```

### 5-2. CinematicCharDetail.jsx

```diff
 import CharNavigation from "./CharNavigation";
+import CharSign from "./CharSign";

 // ... L452-458:
-        {/* Sign */}
-        {char.sign && (
-          <section style={{ ... }}>
-            <p style={{ ... }}>Sign</p>
-            <img src={char.sign} ... />
-          </section>
-        )}
+        <CharSign char={char} isMobile={isMobile} />
```

---

## 6. 트랜지션 확장성 이점

분리 후 각 뷰가 독립적으로 고수준 트랜지션을 구현할 수 있는 이유:

### 6-1. 독립 상태기계

```
분리 전: CharDetail.jsx 안에 3개 뷰의 state가 혼재
         → phase, jgrBeat, glitchDone 등이 같은 스코프
         → 새 트랜지션 추가 시 다른 뷰에 영향 우려

분리 후: 각 파일이 자체 상태기계를 소유
         DefaultCharDetail: phase 0→1→2 (홀로그램)
         CinematicCharDetail: phase -1→0→1→2 (시네마틱)
         JgrCharDetail: phase 0→1→2 (영화적)
         → 각각 독립적으로 phase 추가/수정 가능
```

### 6-2. 뷰별 고유 트랜지션 강화 경로

| 뷰 | 현재 | 분리 후 가능한 강화 |
|----|------|---------------------|
| **Default** | 홀로그램 링 + 글리치 + SVG HUD | Phase 0.5(데이터 스캔 이펙트) 추가, 캐릭터별 HUD 변형 |
| **Cinematic** | Phase 0 인트로 오버레이 | 인트로→Phase 1 크로스페이드 커스텀, Phase 1.5(중간 컷) |
| **JGR** | 세피아→풀컬러 2비트 | 3비트 확장, 필름 번 에지 강화 |

### 6-3. 코드 스플리팅 개선

```
분리 전: /characters/seoyun 접속 시
         CharDetail.jsx 663줄 전체 로딩 (JGR·Cinematic 코드 포함)

분리 후: CharDetail.jsx ≈55줄 (디스패처) + DefaultCharDetail.jsx ≈550줄
         JGR·Cinematic import는 디스패처의 정적 import이므로
         번들러가 tree-shaking 할 수 없지만,
         향후 lazy() 전환 시 뷰별 코드 스플리팅 가능
```

> **향후 lazy 전환** (선택적, 지금은 하지 않음):
> ```jsx
> // 디스패처에서 조건부 lazy — 각 뷰가 별도 청크
> const JgrCharDetail = lazy(() => import("../components/JgrCharDetail"));
> const CinematicCharDetail = lazy(() => import("../components/CinematicCharDetail"));
> const DefaultCharDetail = lazy(() => import("../components/DefaultCharDetail"));
> ```
> 현재 15캐릭터 × 3뷰 규모에서는 불필요. 뷰 복잡도가 1000줄+ 넘어갈 때 고려.

---

## 7. 연쇄 영향 분석

### 7-1. 직접 영향

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `src/pages/CharDetail.jsx` | **대폭 축소** | 663줄 → ≈55줄 (디스패처) |
| `src/components/DefaultCharDetail.jsx` | **신규** | ≈550줄 (CharDetail에서 추출) |
| `src/components/CharSign.jsx` | **신규** | ≈25줄 (공용 Sign 섹션) |
| `src/components/JgrCharDetail.jsx` | **소폭** | Sign 인라인 → CharSign import |
| `src/components/CinematicCharDetail.jsx` | **소폭** | Sign 인라인 → CharSign import |

### 7-2. 간접 영향 (변경 불필요)

| 파일 | 이유 |
|------|------|
| `App.jsx` | `lazy(() => import("./pages/CharDetail"))` — 경로 불변 |
| `CharExpressionsGrid.jsx` | props 인터페이스 불변 |
| `CharNavigation.jsx` | props 인터페이스 불변 |
| `CharLightbox.jsx` | props 인터페이스 불변 |
| `characters.js` | 데이터 불변 |
| `cinematic/*.jsx` | CinematicCharDetail 내부에서 호출, 인터페이스 불변 |
| `introStyles.js` | CinematicCharDetail에서 import, 경로 불변 |

### 7-3. CODEBASE_MAP.md 갱신

```diff
 ### Components (src/components/)
+| DefaultCharDetail.jsx | ~550 | 기본 캐릭터 상세 (홀로그램 UI) |
 | CinematicCharDetail.jsx | 486 | 시네마틱 인트로 공용 뼈대 |
 | JgrCharDetail.jsx | 402 | 장그루 전용 인트로 |
+| CharSign.jsx | ~25 | 캐릭터 사인 이미지 (공용) |

 ### Pages (src/pages/)
-| CharDetail.jsx | 663 | 캐릭터 상세 (라우팅 + DefaultCharDetail) |
+| CharDetail.jsx | ~55 | 캐릭터 상세 디스패처 (라우팅 분기) |
```

---

## 8. 구현 체크리스트

### Step 1: CharSign.jsx 생성
- [ ] `src/components/CharSign.jsx` 생성 (§2-1 코드)
- [ ] `npm run build` 통과 확인 (아직 참조 없으므로 tree-shake)

### Step 2: DefaultCharDetail.jsx 생성
- [ ] `src/components/DefaultCharDetail.jsx` 생성
- [ ] CharDetail.jsx L24-35 state/refs → DefaultCharDetail로 이동
- [ ] CharDetail.jsx L46-98 useEffect/handlers → DefaultCharDetail로 이동
- [ ] CharDetail.jsx L119-663 렌더 JSX → DefaultCharDetail로 이동
- [ ] Sign 인라인 → `<CharSign>` 교체
- [ ] import 정리: Default 전용 import만 남기기

### Step 3: CharDetail.jsx 디스패처화
- [ ] CharDetail.jsx를 §3 코드로 교체 (≈55줄)
- [ ] Default 전용 import 전부 제거
- [ ] `import DefaultCharDetail from "../components/DefaultCharDetail"` 추가
- [ ] `npm run build` 통과 확인

### Step 4: JGR·Cinematic Sign 교체
- [ ] JgrCharDetail.jsx: `import CharSign` + 인라인 Sign → `<CharSign>` 교체
- [ ] CinematicCharDetail.jsx: `import CharSign` + 인라인 Sign → `<CharSign>` 교체
- [ ] `npm run build` 통과 확인

### Step 5: 검증
- [ ] `npm run build` 최종 통과
- [ ] 브라우저 테스트: Default 캐릭터 (SY) — 홀로그램 UI + 트랜지션 정상
- [ ] 브라우저 테스트: Cinematic 캐릭터 (JSH) — 인트로 + Phase 전환 정상
- [ ] 브라우저 테스트: JGR — 세피아 인트로 정상
- [ ] 브라우저 테스트: 존재하지 않는 캐릭터 — 404 메시지 표시
- [ ] CODEBASE_MAP.md 갱신

### Step 6: 커밋
- [ ] `git add` 5파일 (CharDetail.jsx, DefaultCharDetail.jsx, CharSign.jsx, JgrCharDetail.jsx, CinematicCharDetail.jsx)
- [ ] 커밋 메시지: `Split CharDetail into dispatcher + DefaultCharDetail, extract CharSign`

---

## 9. 리스크 & 완화

| 리스크 | 확률 | 완화 |
|--------|------|------|
| DefaultCharDetail 이동 시 import 경로 오류 | 중 | `../styles/` → `../styles/`, `../hooks/` → `../hooks/` (components/ 기준 동일) |
| Sign 교체 시 스타일 미세 차이 | 저 | 현재 3곳 코드가 완전 동일 확인 완료 |
| `useParams()` 중복 호출 (디스패처 + 뷰) | 저 | React Router 내부 캐싱, 성능 영향 0. JGR·Cinematic도 이미 이 패턴 |
| Default 전용 `@keyframes nameFloat` 누락 | 저 | JSX 내부 `<style>` 태그로 정의되어 있어 컴포넌트와 함께 이동 |
