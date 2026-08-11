---
name: deploy-preview
description: 프라임시티 프로젝트를 빌드하고 Cloudflare Worker 정적 자산으로 배포합니다
disable-model-invocation: true
---

# 빌드 & 배포

## 절차

1. `npm run build` 실행하여 빌드 검증
2. 빌드 성공 시 `npm run deploy` 실행 (wrangler deploy)
3. 배포 완료 후 URL 확인

## 배포 대상

- **도메인**: intro.bluehair.blue
- **플랫폼**: Cloudflare Workers Static Assets
- **빌드 출력**: `dist/`
- **SPA 라우팅**: wrangler.jsonc의 `not_found_handling: "single-page-application"` 설정으로 자동 처리

## 주의사항

- 빌드 실패 시 배포하지 않음 — 에러를 먼저 수정
- `dist/` 폴더가 생성되었는지 확인
- 배포 전 `git status`로 커밋하지 않은 변경 사항 확인 알림
