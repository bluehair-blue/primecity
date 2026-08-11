# Image Pipeline

모든 명령은 프로젝트 루트에서 실행한다.

## 흐름

1. `tools/asset_generator.py`가 `char_img/`에 이미지를 만들고 `char_img_metadata/`에 생성정보를 기록한다.
2. `tools/auto_censor.py`가 별도 복사본에서 검열 결과를 검증한다.
3. `tools/image_metadata_release.py`가 WebP 컨테이너와 픽셀 은닉정보를 sidecar에 보존한 뒤 제거하고 권리 XMP만 기록한다.
4. `tools/r2_fullsync.py`가 검증된 이미지와 sidecar를 공개/비공개 R2로 분리 업로드한다.
5. 원격 검증 완료 후 `src/utils/cdn.js`의 `ASSET_VERSION`을 1 올린다.

## 메타데이터 정화

```powershell
py tools/image_metadata_release.py audit
py tools/image_metadata_release.py release `
  --backup "char_img_bak_YYYYMMDD_HHMMSS_metadata" `
  --stage "char_img_release_staging_YYYYMMDD_HHMMSS"
py tools/image_metadata_release.py verify
```

`release` 전에 새 불변 백업 경로를 확보한다. 기본 권리 XMP는 `bluehair.blue`, All rights reserved, 무단 전재·복제·배포·수정 금지와 권리 조건 효력일을 기록한다. 창작일이나 등록일은 추정하지 않는다.

## R2

```powershell
py tools/r2_fullsync.py --dry-run
py tools/r2_fullsync.py --workers 8 --verify-private
```

- WebP: `prime/ent/{relative_path}`
- JSON sidecar: `prime-metadata/ent/{relative_path_without_ext}.json`
- `tools/.r2_uploaded.json`은 로컬 재개 상태이며 Git에 올리지 않는다.
- sidecar를 공개 `prime` 버킷이나 CDN에 업로드하지 않는다.
- 실제 업로드 후 CDN HEAD/ETag·크기와 private SHA-256 검증이 모두 끝나기 전에는 `ASSET_VERSION`을 바꾸지 않는다.

동일 절차는 사용자 전역 Codex skill `image-metadata-release`에도 간략히 보존한다.
