<!-- Generated: 2026-04-11 | Files scanned: 51 src + 8 workers + 5 tools | Token estimate: ~650 -->

# Prime City — System Architecture

## Overview

```
User Browser
  │
  ├─ intro.bluehair.blue  ←── Cloudflare Pages (dist/ from Vite build)
  │    React 19 SPA (react-router-dom v7, code-split lazy)
  │
  ├─ img.bluehair.blue    ←── Cloudflare R2 (CDN, ASSET_VERSION=11)
  │    /ent/{CHAR}/{N}.webp  (1,125+ images)
  │
  └─ *.bluehair.blue      ←── Cloudflare Workers (8 SVG micro-services)
       svg-tablet / sns / tweet / chart / community / livestream / messenger / news
```

## Data Flow

```
characters.js  ──► CharCarousel ──► /characters/:name ──► CharDetail.jsx
                                                               │
                                         ┌─────────────────────┤
                                         ▼                     ▼
                                  JgrCharDetail       CinematicCharDetail
                                  (장그루 전용)         (keyVisual 있는 캐릭터)
                                                             │
                                               INTRO_COMPONENTS registry
                                               ┌──────────────────────┐
                                               │ cutaway (JSH)        │
                                               │ sunrise  (KHR)       │
                                               │ ripple   (MIL)       │
                                               │ glitch   (LSH)       │
                                               │ flash    (MMR)       │
                                               └──────────────────────┘
```

## Deployment Pipeline

```
git push origin main
  └─► GitHub Actions
        ├─► Cloudflare Pages (React SPA, vite build)
        └─► wrangler deploy (SVG Workers, per-worker config)

R2 업로드 (수동):
  npx wrangler r2 object put "prime/ent/{path}" --file "char_img/{path}"
  → ASSET_VERSION++ in src/utils/cdn.js
```

## Key Constraints

- OKLCH colors only (hex/rgb hookify 차단)
- CDN paths: `cdnUrl("{CHAR}/key.webp")` / `cdnExprUrl("{CHAR}", sceneCode)`
- 모든 마크업 변수: `escapeXml()` (XSS)
- 새 캐릭터 인트로: module-scope 함수 + early return + INTRO_COMPONENTS 등록
