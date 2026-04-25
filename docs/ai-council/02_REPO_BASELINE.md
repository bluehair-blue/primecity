# Repository Baseline

> 레포지토리 기준선 스냅샷. 리뷰 시작 전 현황을 고정하는 문서.

## 파일 통계

| 카테고리 | 파일 수 | 총 줄 수 |
|----------|---------|---------|
| src/pages/ | 17 | ~3,500 |
| src/components/ | 21 | ~7,000 |
| src/components/cinematic/ | 10 | ~2,900 |
| src/data/ | 8 | ~1,200 |
| workers/ | 10 | ~1,900 |
| tools/ | 8 | ~2,600 |
| docs/prompts/json/ | 194 | — |

## 핵심 파일 목록

### src/data/characters.js
- 20명 캐릭터 데이터
- CDN 코드: SY, NHR, JSH, ERK, LSH, HSR, KHR, JGR, MIL, ELA, MMR, HSE, NIA, RAY, LPS, SIA, NOA, ERP, APR, SPA

### src/data/gamemodes.js
- 16종 게임 모드 정의

### docs/prompts/json/
- 캐릭터/ 103개
- 모드/ 53개
- 오디션/ 12개
- 루트 26개

## 의존성

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-helmet-async": "^3.0.0",
  "react-router-dom": "^6.28.0",
  "@vitejs/plugin-react": "^4.3.4",
  "@cloudflare/vite-plugin": "^1.29.1",
  "vite": "^6.0.0",
  "wrangler": "^4.75.0"
}
```

## CDN 현황

- ASSET_VERSION: 28
- R2 버킷: prime/ent/
- 이미지 수: 2,000장+

## 마지막 갱신

<!-- 이 섹션은 baseline 재측정 시 갱신할 것 -->
- 날짜: 2026-04-25
- 브랜치: main
- 커밋: c82070c
