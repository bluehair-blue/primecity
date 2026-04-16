# CharDetail — phase 2 ↔ 콘텐츠 섹션 연결감 강화 (plan_sub.md)

> 사용자 승인 후 구현합니다.

---

## 현재 구조 분석

### Phase 시스템

```
phase 0 (0ms)   → 초기화
phase 1 (100ms) → 캐릭터 이름+태그라인+홀로그램 (전체 화면 중앙)
                  기존 스크롤 인디케이터: "Scroll" + 골드 라인 (scrollPulse)
phase 2 (2200ms)→ 프로필 카드 전환 (이미지 좌측 축소 + 우측 정보 패널 슬라이드인)
```

### 페이지 섹션 흐름

```
[Hero]  100vh, phase 1→2 시네마틱
  └── 이미지(좌) + 프로필 패널(우): tagline, role, brief, fields, traits
[Signature]   char.sign이 있을 때만 (현재 KHR만)
[Expressions] 표정 4장 프리뷰 + 갤러리 링크
[Navigation]  같은 소속사 + 이전/다음 캐릭터
[Footer]
```

### 현재 문제

- phase 1의 "Scroll" 인디케이터가 phase 2 전환 시 사라짐
- phase 2에서 프로필 패널이 보이지만, 아래에 더 많은 콘텐츠가 있다는 시각 힌트 없음
- Hero가 `minHeight: 100vh` + `justifyContent: flex-start`라서 텍스트 길이에 따라 실제 높이 변동 → absolute bottom 배치 시 모바일/긴 텍스트에서 위치 어색

### 현재 시각 밀도 (phase 2)

배경 그리드, 대형 name watermark, 양방향 marquee, ambient glow, hologram rings, ghost echo, HUD overlay — 이미 높음. 추가 장식은 노이즈.

---

## 개선 기획

### 목표

"스크롤 유도 요소 추가"가 아니라 **"phase 2와 아래 섹션 사이의 연결감 강화"**. cue가 "추가 오브젝트"가 아니라 "장면 전환의 일부"로 읽히도록.

### 접근 방식: 흐름형 Seam Cue

Hero 콘텐츠(프로필 패널) 아래에 자연스러운 seam cue를 배치. absolute overlay가 아니라 document flow 안에 위치.

**소멸 로직**: IntersectionObserver로 다음 섹션(Signature 또는 Expressions) 진입을 감지하여 fade-out. 전역 `scrolled` 상태를 재사용하지 않음.

**시각 밀도 정리**: phase 2 진입 시 배경 marquee opacity를 추가 감소시켜 cue가 돋보이도록.

### 구현 상세

**(1) 새 상태 + ref + effect:**

```jsx
const [contentReached, setContentReached] = useState(false);
const contentRef = useRef(null);  // hero 다음 첫 실제 섹션 wrapper

// [name] reset에 포함 (route 전환 깜빡임 방지)
useEffect(() => {
  // ... 기존 reset ...
  setContentReached(false);
}, [name]);

// Observer: 다음 첫 실제 콘텐츠 섹션 wrapper를 관찰
useEffect(() => {
  if (!contentRef.current) return;
  const observer = new IntersectionObserver(
    ([entry]) => setContentReached(entry.isIntersecting),
    { threshold: 0.2 }
  );
  observer.observe(contentRef.current);
  return () => observer.disconnect();
}, [name]);

const showPhase2Cue = phase === 2 && !contentReached;

// 카피: 첫 후속 섹션 기준 동적 분기
const cueCopy = char.sign
  ? "Signature Below"
  : char.expressions?.length
    ? "Expressions Below"
    : "Continue Below";
```

**(2) Observer target (ref 할당)** — hero 다음 첫 실제 콘텐츠 섹션에 ref 부착:

```jsx
{/* Signature */}
{char.sign && (
  <section ref={contentRef} ...>  {/* ← sign 있으면 여기가 target */}
    ...
  </section>
)}

{/* Expressions */}
{char.expressions?.length > 0 && (
  <section ref={char.sign ? exprRef : contentRef} ...>  {/* ← sign 없으면 여기가 target */}
    ...
  </section>
)}

{/* Navigation (sign도 expressions도 없는 극단 케이스) */}
<section ref={!char.sign && !char.expressions?.length ? contentRef : navRef} ...>
```

> ref 할당 우선순위: Signature > Expressions > Navigation

**(3) Seam cue 마크업** — Hero 섹션 내부, 프로필 패널 아래:

```jsx
{/* ── Phase 2 seam cue ── */}
<div style={{ width: "100%", maxWidth: 1100, marginTop: isMobile ? 12 : 20 }}>
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    opacity: showPhase2Cue ? 1 : 0,
    transform: showPhase2Cue ? "translateY(0)" : "translateY(-6px)",
    transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
    pointerEvents: "none",
  }}>
    <span style={{
      fontFamily: "var(--f-display-en)", fontSize: 9,
      letterSpacing: "0.28em", textTransform: "uppercase", color: C.text25,
    }}>
      {cueCopy}
    </span>
    <div style={{
      width: isMobile ? 72 : 112, height: 1,
      background: `linear-gradient(90deg, transparent, ${char.color}, transparent)`,
    }} />
    <div style={{
      width: 1, height: 18,
      background: `linear-gradient(to bottom, ${char.color}, transparent)`,
      animation: "scrollPulse 2s ease-in-out 2",
    }} />
  </div>
</div>
```

**삽입 위치**: Hero `</section>` 닫기 직전, 기존 phase 1 스크롤 인디케이터 아래.

**(4) Phase 2 시각 밀도 경감** (선택적):

```jsx
// Marquee line 1 — 현재 opacity: 0.025
opacity: phase === 2 ? 0.012 : 0.025,

// Marquee line 2 — 현재 opacity: 0.018
opacity: phase === 2 ? 0.008 : 0.018,
```

### 설계 근거

| 결정 | 이유 |
|---|---|
| absolute bottom ❌ | hero `minHeight: 100vh` + 가변 콘텐츠 높이 → 모바일/긴 텍스트에서 위치 어색 |
| 흐름형 배치 ✅ | document flow 안에서 프로필 패널 바로 아래 → 항상 자연스러운 위치 |
| `scrolled` ❌ | 네비바용 전역 상태. 스크롤 힌트 소멸과 묶으면 UX 거침 |
| section wrapper 관찰 ✅ | sentinel은 phase 2 안정 시 즉시 뷰포트 진입 → 너무 빨리 소멸. 실제 섹션 wrapper + threshold 0.2가 안정적 |
| 카피 동적 분기 (A안) | KHR처럼 sign이 첫 후속 섹션인 경우 "Expressions Below"가 부정확 → 실제 다음 콘텐츠 기준 |
| `contentReached` reset | route 전환 시 이전 값 잔류 방지 → `[name]` effect에 포함 |
| `scrollPulse` 2회 재생 | 무한 반복은 주의 분산. 2회면 충분한 힌트 |
| 그라데이션(B) 보류 | 기존 vignette+glow+marquee와 충돌. 밀도 과잉 |

### 변경 파일

- `src/pages/CharDetail.jsx` — state/ref/effect 추가 + seam cue + observer target ref 할당 + (선택) marquee opacity

### 연쇄 영향

| 대상 | 영향 |
|---|---|
| `index.html` | `scrollPulse` 이미 존재 → 불필요 |
| `tokens.js` | 기존 토큰 → 불필요 |
| `CharCarousel.jsx` | 무관 |
| 내부 확장 | `contentReached` state + `contentRef` ref + observer effect + reset 1줄 |

### 검증 최소 세트 (3케이스)

| 케이스 | 캐릭터 | 확인 항목 |
|---|---|---|
| **sign 있음** | KHR (강하람) | 카피 "Signature Below", observer가 Signature 섹션 20% 진입 시 소멸 |
| **sign 없음 (일반)** | JGR (장그루) | 카피 "Expressions Below", observer가 Expressions 섹션 진입 시 소멸 |
| **텍스트 긴 캐릭터** | SY (서윤) | cue 위치가 프로필 패널과 겹치지 않고 자연스러운지, phase 1 인디케이터 유지 |
