# Recovery

## 소스 복구

1. 원격 저장소의 `main`을 clone한다.
2. `npm ci`로 의존성을 재생성한다.
3. 로컬 전용 `char_img/`, `char_img_metadata/`, `models/ntd11_v5.pt`, `tools/.r2_uploaded.json`을 검증된 보존본에서 같은 상대경로로 복구한다.
4. `MIGRATION_MANIFEST.json`의 파일 수와 SHA-256을 대조한다.
5. Persona 검증과 build를 실행한다.

## 자산 복구

- 공개 WebP 기준 키: `prime/ent/**`
- 비공개 sidecar 기준 키: `prime-metadata/ent/**`
- private sidecar는 공개 CDN을 복구원으로 사용하지 않는다.
- 권리 XMP 또는 픽셀 정화를 다시 수행해야 하면 전역 `image-metadata-release` skill과 `docs/workflows/IMAGE_PIPELINE.md`를 따른다.

## 전체 스냅샷

2026-08-11 이전 전체 프로젝트는 `entertainment-roleplay_FULL_20260811_150525` 보존본과 같은 이름의 receipt/manifest로 검증됐다. 전체 보존본은 새 작업본 안정화와 별도 매체 복제가 끝날 때까지 삭제하지 않는다.
