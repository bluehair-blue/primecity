# Prime City Index

이 문서는 새 작업본의 단일 진입점이다. 수정 대상과 생성 산출물을 혼동하지 않는다.

## 실행 코드

| 경로 | 역할 |
|---|---|
| `src/` | React/Vite 사이트 |
| `src/data/` | 캐릭터·구역·갤러리·Persona 데이터 |
| `src/utils/cdn.js` | CDN 주소와 `ASSET_VERSION` |
| `public/` | 헤더·아이콘·포토부스 로컬 자산 |
| `workers/index.js` | 사이트 Worker |
| `workers/svg-*.js` | SVG Worker 10종 |
| `workers/wrangler.svg.jsonc` | 루트 Vite 설정과 격리하는 SVG Worker 전용 설정 |
| `wrangler.jsonc` | 유일한 사이트 Wrangler 설정 |

## 콘텐츠 원본과 산출물

| 분류 | 경로 | 정책 |
|---|---|---|
| 권위 원본 | `docs/prompts/json/` | 사람이 수정 |
| 공통 원본 | `docs/prompts/common/` | 사람이 수정 |
| 창작 원전 | `docs/prompts/source/` | 참고용, 운영 입력 아님 |
| 생성물 | `json_lite/`, `routing_classified/`, `json_unified/` | 도구로 재생성 |
| 세계관 | `docs/worldbuilding/` | 사람이 수정 |
| 이미지 규칙 | `docs/image-rules/` | 현행 프리셋만 보존 |

읽기용 통합 문서: [`docs/worldbuilding/캐릭터 설정집.md`](worldbuilding/캐릭터%20설정집.md)

읽기용 통합 문서: [세계관 설정집](worldbuilding/세계관%20설정집.md)

## 로컬 전용 핵심 자산

- `char_img/`: 정화된 WebP 기준 이미지 2,003개와 보조 파일
- `char_img_metadata/`: 원본 메타데이터·생성정보·전후 해시 sidecar 2,003개와 release manifest
- `models/ntd11_v5.pt`: 자동 검열 모델
- `tools/.r2_uploaded.json`: 로컬 R2 업로드 재개 상태

이 네 항목은 Git에 포함하지 않는다. 이미지와 sidecar는 각각 공개 `prime/ent/**`, 비공개 `prime-metadata/ent/**`에서 운영한다.

## 주요 워크플로우

- [`DEVELOPMENT.md`](workflows/DEVELOPMENT.md)
- [`IMAGE_PIPELINE.md`](workflows/IMAGE_PIPELINE.md)
- [`PROMPT_PIPELINE.md`](workflows/PROMPT_PIPELINE.md)
- [`SVG_WORKERS.md`](workflows/SVG_WORKERS.md)
- [`RECOVERY.md`](workflows/RECOVERY.md)

이전 범위와 검증 근거는 루트 `MIGRATION_MANIFEST.json`을 따른다.
