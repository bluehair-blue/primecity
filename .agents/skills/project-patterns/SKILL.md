---
name: project-patterns
description: Prime City의 코드·콘텐츠·이미지·Cloudflare 변경 규칙
user-invocable: false
---

# Prime City Project Patterns

작업 전 `docs/INDEX.md`와 해당 `docs/workflows/*.md`를 읽는다.

## 공통

- 실제 참조자를 `rg`로 찾은 뒤 공용 지점에서 한 번 수정한다.
- 컴포넌트는 `function` 선언을 사용한다.
- 색상은 `src/styles/tokens.js`의 OKLCH 토큰을 사용한다.
- CDN URL은 `src/utils/cdn.js`의 `cdnUrl()`·`cdnExprUrl()`로 만든다.
- 완료 전 `npm run validate:persona`와 `npm run build`를 실행한다.

## 이미지와 R2

1. 생성: `tools/asset_generator.py`
2. 검열: `tools/auto_censor.py`
3. 메타데이터 정화: `tools/image_metadata_release.py`
4. dry-run: `py tools/r2_fullsync.py --dry-run`
5. 공개 WebP는 `prime/ent/**`, private sidecar는 `prime-metadata/ent/**`
6. 실제 업로드와 원격 검증 후에만 `ASSET_VERSION`을 1 올린다.

`char_img/`, `char_img_metadata/`, 모델과 secret은 Git에 올리지 않는다.

## 로어북

- 정식 원본은 `docs/prompts/json/`이다.
- 1엔트리=1 JSON, trigger는 파일 하단 `// --- TRIGGER ---`에 둔다.
- lite → routing → unified 순서는 `docs/workflows/PROMPT_PIPELINE.md`를 따른다.

## Worker

- 사이트 설정은 `wrangler.jsonc` 하나만 사용한다.
- SVG Worker는 `workers/svg-*.js`와 `workers/deploy/deploy.sh`를 함께 확인한다.
- 배포 스크립트는 기본 dry-run이다. 실제 배포는 `REAL_DEPLOY=1`을 명시한다.
- 이미지 포함 SVG Worker는 외부 이미지를 data URI로 인라인한다.

## 커밋

서술형 `{동사} {대상} — {근거}` 형식을 사용한다. 대규모 변경은 무엇을 남기고 제외했는지와 검증 명령을 본문에 기록한다.
