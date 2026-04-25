# Domain 04 — Image / SVG / R2 Pipeline

Audit image generation, censorship, CDN versioning, SVG workers, and R2 upload integrity.

## Review Files

- `src/utils/cdn.js`
- `src/data/gallery.js`
- `src/data/galleryConfig.js`
- `src/components/ImageSystemInfo.jsx`
- `src/data/svgTemplates.js`
- `src/data/svgTemplates/**`
- `workers/svg-*.js`
- `tools/asset_generator.py`
- `tools/r2_sync_loop.py`
- `tools/auto_censor.py`

## Questions

- Is the ASSET_VERSION policy consistent between documentation and code?
- Do SVG workers and frontend templates share the same output rules?
- Is the R2 upload / cache / missing-asset verification process sufficient?
- Does the gallery description match the actual asset structure on R2?

## Pipeline Flow

```text
NAI API → char_img/{CHAR}/ → auto_censor.py → r2_sync_loop.py → R2: prime/ent/
                                                                       ↓
                                                          cdnUrl() → browser
                                                          svg-*.js → EdenChat <img>
```

## Audit Points

### ASSET_VERSION Policy

- Current value: check `grep "ASSET_VERSION" src/utils/cdn.js`.
- Is the value in `cdn.js` consistent with the value mentioned in `CLAUDE.md` and `02_REPO_BASELINE.md`?
- Is there a documented rule for when to bump (after every R2 upload)?
- Is the bump ever forgotten? Look for recent commits that upload to R2 without a corresponding cdn.js change.

### SVG Worker vs Frontend Template Parity

- For each worker in `workers/svg-*.js`, is there a corresponding function in `src/data/svgTemplates/`?
- Are the field names, escaping rules, and output structure consistent?
- Workers are the canonical EdenChat runtime. Frontend templates are preview-only. Is this distinction documented in both locations?

### Base64 Inline Images

- Which workers use `<image href>`? List them.
- For those workers: does `safeImageUrl()` pass `data:` prefix without modification?
- Is `fetchAsDataUri()` implemented with chunked btoa (8192-byte chunks)?
- Workers without images (chart, tablet, community, schedule) do not need this — confirm they don't have dead `fetchAsDataUri` calls.

### R2 Verification

- Is there a command or script to verify which characters have all required assets (`thumbnail`, `profile`, `sign`, `key.webp`) on R2?
- Is there a way to detect orphaned R2 objects (uploaded but no longer referenced in code)?
- Does `r2_sync_loop.py` log which files were newly uploaded vs already present?

### Gallery Accuracy

- Does `src/data/gallery.js` reflect the current number of images on R2?
- Does `ImageSystemInfo.jsx` display accurate asset counts?
- Are there category descriptions that no longer match the actual scene code structure?

### Legacy Path Guard

- Confirm no tool references `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/`.
- Run: `grep -r "OLD_DO_NOT_USE" tools/` — result should be empty.

## Findings

_Populate with Finding Cards after review. Use IDs: `PC-IMG-NNN`._
