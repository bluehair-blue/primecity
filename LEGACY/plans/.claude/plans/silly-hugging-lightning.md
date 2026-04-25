# [ARCHIVED] Phase 2: CharDetail 전면 재설계 플랜
> **상태**: 완료 — immutable-seeking-bee.md Phase 2에 통합됨 (2026-04-15 아카이브)

## Context

현재 CharDetail.jsx는 단순 2열 레이아웃(이미지+텍스트). CLAUDE.md의 "우선순위 높음" 항목에 따라 시네마틱 풀스크린 경험으로 재설계한다. Phase 1에서 추가한 데이터 필드(job, background, taste, goal)와 표정 시스템(cdnExprUrl, EXPRESSION_KEYS)을 활용.

## 재설계 구조 (스크롤 흐름)

### Section 1: 풀스크린 스플래시 히어로 (100vh)
- 캐릭터 이미지 풀블리드 배경 (object-fit: cover, 어둡게 오버레이)
- 이미지 없는 캐릭터: 캐릭터 accent 색상 그라디언트 배경
- 스태거드 입장 애니메이션 (HeroSlider 패턴):
  - 소속사 라벨 → 이름 → 태그라인 → 스크롤 인디케이터
- charGlowPulse + charScanline 기존 keyframe 활용
- 하단 스크롤 인디케이터 (scrollPulse)

### Section 2: 프로필 섹션 (useReveal)
- 왼쪽: 캐릭터 이미지 (2:3, 고정 위치감)
- 오른쪽: 4개 필드 카드 형태
  - 직업 (job), 배경 (background), 취향 (taste), 목표 (goal)
- 시그니처 + 성격 트레이트
- 모바일: 세로 스택

### Section 3: 표정 갤러리 (useReveal)
- 3×3 그리드 (9종 표정)
- 각 썸네일: cdnExprUrl(charCdnId, key) + EXPRESSION_LABELS[key]
- 클릭 시 확대 모달 (라이트박스)
- 이미지 없을 시 플레이스홀더 (accent 색상 + 표정 이름)
- 모바일: 3열 유지, 작은 사이즈

### Section 4: 네비게이션 (기존 유지 + 개선)
- Same Agency 링크
- 이전/다음 캐릭터

## 파일 변경 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/pages/CharDetail.jsx` | 전면 재작성 |
| `index.html` | keyframe 추가 (scrollPulse 없으면 추가) |
| `src/data/characters.js` | cdnId 매핑 필요 시 추가 (SY, NHR 등 CDN 파일명) |

## 재사용 패턴

- `useReveal(threshold)` — 섹션 등장 (src/hooks/useReveal.js)
- `useIsMobile(768)` — 반응형 (src/hooks/useIsMobile.js)
- `cdnExprUrl(id, expr)` — 표정 CDN 경로 (src/utils/cdn.js)
- `EXPRESSION_KEYS`, `EXPRESSION_LABELS` — 표정 메타데이터
- `C.*` — OKLCH 색상 토큰 (src/styles/tokens.js)
- 이징: `cubic-bezier(0.22, 1, 0.36, 1)`
- 스태거드 딜레이: `const t = (d) => \`all 1s cubic-bezier(0.22,1,0.36,1) ${d}s\``

## CDN ID 매핑 이슈

characters.js의 image 필드에서 CDN 파일명 추출 필요:
- seoyun → "SY", naharin → "NHR", leeseha → "LSH", kangharam → "KHR"
- 나머지 11명은 CDN 이미지 미업로드 → 표정 갤러리도 플레이스홀더

`cdnId` 필드를 characters.js에 추가하여 cdnExprUrl에서 사용.

## 검증

1. `npm run build` — 빌드 성공 확인
2. 데스크톱/모바일 양쪽에서 /characters/seoyun 접근 → 풀스크린 히어로 + 스크롤 섹션 확인
3. 이미지 없는 캐릭터 (/characters/mila 등) → 폴백 UI 확인
4. 표정 갤러리 그리드 렌더링 확인 (이미지 없어도 플레이스홀더)
