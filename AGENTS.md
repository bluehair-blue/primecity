# AGENTS.md — Produce Prism Priority

이 파일은 표지판입니다. 작업 전 `docs/INDEX.md`와 해당 `docs/workflows/*.md`를 읽습니다.

## 권위 원본

| 대상 | 기준 |
|---|---|
| 프론트엔드 | `src/`, `public/`, `index.html` |
| 사이트 Worker | `workers/index.js`, `wrangler.jsonc` |
| SVG Worker | `workers/svg-*.js`, `workers/deploy/deploy.sh` |
| 로어북 | `docs/prompts/json/` |
| 이미지 | 로컬 `char_img/` |
| 이미지 생성정보 | 비공개 `char_img_metadata/` |
| 이미지 생성/검열/정화 | `tools/asset_generator.py`, `auto_censor.py`, `image_metadata_release.py` |

## 불변식

- 프로젝트 경로는 `Path(__file__)` 또는 현재 프로젝트 루트에서 계산한다. 사용자별 절대경로를 코드·skill·문서에 넣지 않는다.
- CDN URL은 `src/utils/cdn.js`의 `cdnUrl()`·`cdnExprUrl()`만 사용한다.
- R2 이미지를 실제 업로드하고 원격 검증한 뒤에만 `ASSET_VERSION`을 1 올린다.
- 공개 이미지는 `prime/ent/**`, 생성정보 sidecar는 공개 도메인이 없는 `prime-metadata/ent/**`에만 둔다.
- `char_img_metadata/`, secret, token, `.dev.vars`를 Git이나 공개 CDN에 넣지 않는다.
- SVG 외부 이미지는 Worker에서 data URI로 인라인한다.
- 로어북 1엔트리=1 JSON이며 trigger는 파일 하단 `// --- TRIGGER ---` 주석에 둔다.
- 구현 전 영향 경로를 `rg`로 찾고, 완료 전 `npm run validate:persona`와 `npm run build`를 실행한다.

## 워크플로우

- 개발·배포: `docs/workflows/DEVELOPMENT.md`
- 이미지·R2: `docs/workflows/IMAGE_PIPELINE.md`
- 프롬프트: `docs/workflows/PROMPT_PIPELINE.md`
- SVG Worker: `docs/workflows/SVG_WORKERS.md`
- 복구: `docs/workflows/RECOVERY.md`
