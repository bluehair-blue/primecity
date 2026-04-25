---
name: project-patterns
description: 프라임시티 코드베이스 패턴 — git 히스토리에서 추출한 개발 워크플로우, 컴포넌트 구조, 커밋 관례
version: 1.0.0
source: local-git-analysis
analyzed_commits: 84
user-invocable: false
metadata:
  filePattern: "src/**/*.{jsx,js}"
  bashPattern: "git (commit|log|diff)"
---

# Prime City Development Patterns

Git 히스토리 84개 커밋에서 추출한 개발 패턴.

## 커밋 컨벤션

이 프로젝트는 **서술형 커밋 메시지**를 사용합니다 (Conventional Commits 아님).

**패턴:**
- 동사로 시작: `Add`, `Fix`, `Update`, `Redesign`, `Replace`, `Upgrade`
- 컴포넌트명 포함: `Fix CharCarousel: useEffect deps...`, `CityMap: fix hover bug...`
- AGENTS.md 변경 시 별도 커밋: `Update AGENTS.md with ...`

**빈도 높은 접두사:**
| 접두사 | 용도 | 비율 |
|--------|------|------|
| Add | 새 기능/파일 | ~30% |
| Fix | 버그 수정 | ~20% |
| Update | 기존 파일 갱신 | ~15% |
| Redesign | 시각 리뉴얼 | ~10% |
| Merge | PR 머지 | ~15% |

## 핵심 변경 패턴 (파일 공변)

### 1. 새 컴포넌트 추가
항상 함께 변경:
- `src/components/NewComponent.jsx` (생성)
- `src/pages/Home.jsx` (섹션 추가)
- `AGENTS.md` (파일 구조 + 상태 업데이트)

### 2. 새 페이지 추가
항상 함께 변경:
- `src/pages/PageName.jsx` (생성)
- `src/App.jsx` (Route 추가)
- `src/data/*.js` (데이터 파일 추가/수정)
- `AGENTS.md` (라우트 목록 + 상태 업데이트)

### 3. 캐릭터 데이터 변경
`src/data/characters.js`가 11회 변경 — 가장 빈번하게 수정되는 데이터 파일.
변경 시 확인할 것:
- CharCarousel.jsx (렌더링)
- CharDetail.jsx (상세 페이지)
- 캐릭터 수가 변경되면 페이지네이션 (3페이지 × 5명)

### 4. 시각 리뉴얼 사이클
반복 패턴:
1. 컴포넌트 리디자인 (`Redesign CharCarousel`, `Redesign TriangleNav`)
2. 버그 수정 (`Fix hover bug`, `Fix tooltip position`)
3. 미세 조정 (`Faster glow`, `instant glow`)
4. AGENTS.md 업데이트

## 컴포넌트 구조 패턴

### 핫 컴포넌트 (수정 빈도 Top 5)
1. `CharCarousel.jsx` (10회) — 가장 복잡, 리디자인 반복
2. `HeroSlider.jsx` (9회)
3. `CityMap.jsx` (9회) — 인터랙션 복잡도 높음
4. `Home.jsx` (9회) — 섹션 추가/조정
5. `TriangleNav.jsx` (3회)

### 안정 컴포넌트
- `PageLayout.jsx` — 변경 1회 후 안정
- `Footer.jsx` — 변경 1회
- `Particles.jsx` — 변경 2회

### 컴포넌트 생명주기
1. 초기 생성 → 2. 리디자인 1~2회 → 3. 버그 수정 → 4. 안정화
- `CharCard.jsx`는 생성 후 `CharCarousel.jsx`로 대체되어 삭제됨 (리팩토링 패턴)

## 디버깅 패턴

이 코드베이스에서 자주 발생하는 버그 유형:
1. **hover/pointer 이벤트 버그** — CityMap 애니메이션 중 pointer-events 충돌 (3회 수정)
2. **tooltip 위치 문제** — fixed vs absolute, containing block (2회 수정)
3. **이미지 로딩 실패** — crossOrigin, CDN 경로, fallback (2회 수정)
4. **useEffect 경쟁 조건** — setTimeout cleanup, deps 배열 (1회 수정)

## 배포 워크플로우

```
코드 수정 → npm run build (Vite) → wrangler deploy → Cloudflare Pages
```

- GitHub PR 기반 작업 (Codex/ 브랜치)
- 자동 배포: GitHub → Cloudflare Pages 연동
- 수동 배포: `npm run deploy` (build + wrangler deploy)
