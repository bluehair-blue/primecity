# Domain 06 — Security & Content Policy

Audit XSS defenses, HTTP headers, R2 access policy, NSFW content gating, and sensitive file handling.

## Review Files

- `workers/svg-*.js`
- `public/_headers`
- `tools/auto_censor.py`
- `src/utils/cdn.js`
- `.gitignore`
- `tools_dist/`

## Questions

- Is `escapeXml()` applied to all user-controlled inputs in SVG workers?
- Does the CSP in `_headers` correctly cover all 10 worker subdomains and the CDN?
- Is the R2 bucket locked against directory listing and unauthorized path traversal?
- Can an uncensored image be accessed directly via CDN URL?
- Are sensitive files (API tokens, NAI credentials) reliably excluded from version control?

## Audit Points

### XSS Defense (SVG Workers)

- `escapeXml()` should wrap every user-supplied string before it enters SVG markup.
- Run: `grep -c "escapeXml" workers/svg-*.js` — verify count per file.
- Check for any interpolation pattern (`${param}`) inside SVG strings that bypasses `escapeXml()`.
- Confirm workers that accept no user input (e.g., chart, schedule) don't expose unnecessary parameters.

### CSP Header Coverage

- Read `public/_headers` and extract the `Content-Security-Policy` value.
- Verify it includes:
  - `img-src` covering `img.bluehair.blue` and `*.bluehair.blue`
  - `connect-src` or `worker-src` if Workers fetch external resources
  - No `unsafe-inline` or `unsafe-eval` unless intentionally scoped
- Check that all 10 worker subdomains (`chart`, `community`, `live`, `msg`, `news`, `post`, `schedule`, `insta`, `tablet`, `twit`) are allowed.

### R2 Bucket Access

- Confirm directory listing is disabled on the `prime` bucket.
- Confirm only `ent/` path objects are publicly readable.
- Check if there is a wildcard rule that could expose `tools/`, `models/`, or other non-public paths.

### NSFW Content Gating

- Can an uncensored image be accessed by constructing a CDN URL directly (e.g., `img.bluehair.blue/ent/{CHAR}/20.webp`)?
- Is the Gallery NSFW confirmation modal enforced server-side, or is it purely client-side?
- Is the censorship pipeline (auto_censor.py, conf=0.7) producing false negatives for small or partially obscured regions?

### Sensitive File Exclusion

- Check `.gitignore` includes: `tools/.nai_token`, `.env`, `generation_state.json`, `.r2_uploaded.json`, `models/*.pt`.
- Check `tools_dist/` does not contain any token or credential files.
- Run: `git ls-files tools/.nai_token` — result should be empty.

## Findings

_Populate with Finding Cards after review. Use IDs: `PC-SEC-NNN`._
