<!-- Generated: 2026-04-11 | Token estimate: ~500 -->

# Prime City — Dependencies & Integrations

## Runtime Dependencies (package.json)

| Package | Version | 용도 |
|---------|---------|------|
| react | ^18.3.1 | UI 렌더링 |
| react-dom | ^18.3.1 | DOM 바인딩 |
| react-router-dom | ^6.28.0 | 클라이언트 라우팅 |
| react-helmet-async | ^3.0.0 | SEO meta 태그 |

## Dev / Build

| Package | 용도 |
|---------|------|
| vite ^6.0.0 | 번들러 |
| @cloudflare/vite-plugin | Cloudflare Pages 통합 |
| @vitejs/plugin-react | React 변환 |
| wrangler ^4.75.0 | Worker/Pages/R2 배포 |

## External Services

| 서비스 | 용도 | 비고 |
|--------|------|------|
| Cloudflare Pages | SPA 호스팅 | dist/ → intro.bluehair.blue |
| Cloudflare R2 | 이미지 CDN | img.bluehair.blue/ent/ |
| Cloudflare Workers | SVG API × 8 | *.bluehair.blue |
| GitHub Actions | CI/CD | Claude Code Action + PR Review |
| NovelAI API v4 | 이미지 생성 | tools/asset_generator.py |
| Eden Chat | 챗봇 플랫폼 | 103개 로어북 삽입 완료 |

## Python Tools Dependencies (tools/)

```
# script-inline (PEP 723)
asset_generator.py:   requests, pillow
auto_censor.py:       opencv-python-headless, numpy, pillow, ultralytics
edenchat_clipboard.py: pyperclip, pyautogui

# pip install
extract_config.py:    stdlib only
utils.py:             stdlib only
```

## CDN 이미지 구조

```
img.bluehair.blue/ent/
  {CHAR}/
    key.webp       키비주얼
    thumbnail.webp 썸네일
    profile.webp   프로필
    sign.webp      사인 (15명 전원)
    {N}.webp       상황코드 이미지 (75코드, 1125+장)
    svg/           SVG Worker용 에셋
  bg3~bg11.webp    홈 히어로 배경
```

## 모델

```
연예계/models/
  ntd11_v5.pt   YOLOv11s-seg (gitignore, 로컬 전용)
  용도: pussy/penis/anus 감지 → 검열 마스크 생성
  TODO: CPU → CUDA (RTX 5070 Ti 16GB)
```

## HTTP Security Headers (public/_headers)

```
CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```
