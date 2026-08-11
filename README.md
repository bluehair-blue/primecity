# PRODUCE PRISM PRIORITY

Prime City의 런타임, 핵심 콘텐츠, 이미지 파이프라인과 Cloudflare 운영 파일만 남긴 우선 작업본입니다.

```powershell
npm ci
npm run validate:persona
npm run build
```

문서 진입점은 [`docs/INDEX.md`](docs/INDEX.md)입니다. `char_img/`, `char_img_metadata/`, `models/ntd11_v5.pt`는 중요한 로컬 전용 자산이며 Git에는 올리지 않습니다.

- 사이트: `intro.bluehair.blue`
- 이미지 CDN: `img.bluehair.blue/ent/`
- 공개 이미지 R2: `prime/ent/**`
- 비공개 sidecar R2: `prime-metadata/ent/**`
