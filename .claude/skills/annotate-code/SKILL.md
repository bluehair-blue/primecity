---
name: annotate-code
description: 코드에 상세 주석 작성 — 역할, 이유, 연계 파일을 포함한 구조화된 주석
user-invocable: true
---

# 코드 주석 작성 스킬

코드에 상세하고 정확한 주석을 작성한다.
**이 프로젝트를 처음 접하는 사람도 즉시 이해하고 응용할 수 있는 수준**이어야 한다.

## 전제 조건: 자기 검증

주석을 작성하기 **전에** 반드시 아래를 수행할 것:

1. **대상 파일 전체 읽기** — Read 도구로 전체 코드를 확인
2. **연계 파일 확인** — Grep으로 해당 파일을 import/참조하는 모든 파일 탐색
3. **데이터 흐름 추적** — props/state/effect가 어디서 시작해 어디로 흐르는지 확인
4. **전역 리소스 확인** — index.html의 @keyframes, tokens.js 토큰, cdn.js 유틸 등

**이해가 불충분한 상태에서 주석을 추측으로 작성하지 않는다.**

## 주석 구조 (5가지 필수 항목)

모든 주석은 아래 5가지 중 해당하는 항목을 포함해야 한다:

### 1. 역할 (What)
이 코드가 무엇을 하는가?
```js
/* ── 캐릭터 전환 시 전체 리셋 + Phase 타이밍 시퀀스 ── */
```

### 2. 작용 위치 (Where)
이 코드가 어디에서, 어떤 맥락에서 실행되는가?
```js
/* [name] 의존 → /characters/seoyun → /characters/ella 이동 시 재실행 */
```

### 3. 이유 (Why)
왜 이렇게 작성했는가? 다른 방법이 아닌 이유는?
```js
/* document.body.overflow = "hidden" → 인트로 중 스크롤 차단.
   CSS class 대신 inline으로 제어하는 이유: cleanup에서 확실히 해제하기 위함 */
```

### 4. 중요도 / 관례 (Convention)
프로젝트 관례나 디자인 시스템과의 관계가 있는가?
```js
/* 프로젝트 전역 이징 — CLAUDE.md 디자인 시스템 규칙.
   모든 CharDetail 뷰(Default/JGR/Cinematic)에서 동일한 값 사용. */
```

### 5. 연계 (Dependencies)
이 코드와 연결되는 다른 파일, 라인, 컴포넌트가 있는가?
```js
/* 연계 파일:
   - src/pages/CharDetail.jsx:44 — char.id === "janggru" 일 때 디스패치
   - src/data/characters.js — char.intro1, char.intro2 (CDN 이미지)
   - index.html — @keyframes: jgrKenBurns, charGlowPulse */
```

## 주석 수준별 가이드

### 파일 헤더 (파일당 1개, 최상단)
5가지 항목 모두 포함. 파일의 전체 역할, 아키텍처, 상태기계, 레이어 구조, 연계 파일 목록.
```js
/* ══════════════════════════════════════════════════════════
   ComponentName — 한줄 설명
   ──────────────────────────────────────────────────────────
   역할: ...
   왜 이 구조인가: ...
   Phase 상태기계: ...
   연계 파일: ...
   ══════════════════════════════════════════════════════════ */
```

### 섹션 주석 (논리적 블록 단위)
역할 + 이유 또는 연계 중 해당 항목.
```js
/* ── 이미지 프리로드 (Phase -1 LoadingShell) ──
   keyVisual + introAssets를 병렬 로드. progress(0~1)는 프로그레스 바에 반영.
   전부 로드 완료 → Phase 0, 타임아웃 → Phase 1 (fall-open).
   → src/hooks/useImagePreloader.js */
```

### 인라인 주석 (개별 변수/조건)
간결하게 "무엇 + 왜" 또는 "무엇 + 연계".
```js
const timerRefs = useRef([]);  // 타이머 정리용 — cleanup에서 forEach(clearTimeout)
```

## 주석을 달지 않는 경우

- 코드 자체가 자명한 경우 (`const [scrolled, setScrolled] = useState(false)`)
- 단순 JSX 스타일 속성 (이미 CSS 속성명이 설명)
- 임시/디버그 코드

## 실행 절차

1. 사용자가 `/annotate-code` 호출 또는 대상 파일/범위 지정
2. 대상 파일 전체 Read
3. Grep으로 해당 파일을 참조하는 모든 파일 탐색
4. 연계 파일의 관련 부분 Read (import, props 전달 등)
5. 이해가 충분히 쌓이면 주석 작성 시작
6. 파일 헤더 → 섹션 주석 → 인라인 주석 순서
7. `npm run build` 통과 확인
