# Domain 06 — Security · Content Policy

> XSS, 콘텐츠 노출, R2 접근 정책, CSP 헤더 감사.

## 범위

- `workers/svg-*.js` (escapeXml 적용 여부)
- `public/_headers` (HTTP 헤더 정책)
- `tools/auto_censor.py` (NSFW 검열)
- R2 버킷 설정

## 감사 포인트

### XSS 방어
- `escapeXml()` 102곳 적용 확인
- 사용자 입력이 SVG에 직접 삽입되는 경로 존재 여부

### CSP 헤더
- `public/_headers` 현재 CSP 값
- Workers 10개 서브도메인 모두 허용 여부
- `img.bluehair.blue` CDN 허용 여부

### R2 버킷 보안
- 디렉토리 리스팅 비활성 확인
- `ent/` 경로 외 접근 차단 여부

### NSFW 콘텐츠 정책
- 검열 파이프라인 우회 가능성
- CDN에서 미검열 이미지 직접 접근 경로

### 민감 파일
- `.env`, `tools/.nai_token` gitignore 확인
- `tools_dist/` 토큰 제외 확인

## 발견 이슈

_감사 후 채워진다_

## 권고사항

_감사 후 채워진다_
