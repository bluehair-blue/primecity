# Repo Baseline

Snapshot taken: 2026-04-25 · branch: main · commit: bd7ccf6

## package.json

- React: `^18.3.1`
- Router: `react-router-dom ^6.28.0`
- Helmet: `react-helmet-async ^3.0.0`
- Vite: `^6.0.0` (plugin-react `^4.3.4`, cloudflare-vite-plugin `^1.29.1`)
- Wrangler: `^4.75.0`

## Counts

| Category | Count |
| -------- | ----- |
| `src/` JS/JSX files | 74 |
| `workers/` JS files | 10 |
| `tools/` Python files | 10 |
| `docs/prompts/json/` lorebook files | 211 |
| Characters registered in `characters.js` | 20 |

### Lorebook Breakdown

| Folder | Files |
| ------ | ----- |
| `캐릭터/` | 103 |
| `모드/` | 53 |
| `오디션/` | 12 |
| Root (events, SVG rules, world) | 43 |

### Character CDN Codes (20)

`SY NHR JSH ERK LSH HSR KHR JGR MIL ELA MMR HSE NIA RAY LPS SIA NOA ERP APR SPA`

## Important Constants

- **ASSET_VERSION:** `28` — `src/utils/cdn.js`
- **CDN_BASE:** `https://img.bluehair.blue/ent` — `src/utils/cdn.js`

### Routes (18)

| Path | Component |
| ---- | --------- |
| `/` | Home |
| `/characters/:name` | CharDetail |
| `/gallery` | Gallery |
| `/svg` | SvgIntro |
| `/updates` | Updates |
| `/contact` | Contact |
| `/works` | Works |
| `/modes/audition` | ModeAudition |
| `/modes/freeplay` | ModeFreeplay |
| `/modes/producer` | ModeProducer |
| `/modes/manager` | ModeManager |
| `/modes/trainee` | ModeTrainee |
| `/modes/composer` | ModeComposer |
| `/modes/actor` | ModeActor |
| `/modes/influencer` | ModeInfluencer |
| `/districts/:id` | DistrictDetail |
| `*` | NotFound |

### Workers (10)

`chart` · `community` · `livestream` · `messenger` · `news` · `post` · `schedule` · `sns` · `tablet` · `tweet`

All served under `*.bluehair.blue`.

## Verification Commands

```bash
# Confirm the build passes cleanly
npm run build

# List all lorebook entries and their trigger keywords
python tools/edenchat_clipboard.py --list

# Count current src files
find src -name "*.jsx" -o -name "*.js" | wc -l

# Confirm ASSET_VERSION
grep "ASSET_VERSION" src/utils/cdn.js

# Check lorebook file count
find docs/prompts/json -name "*.json" | wc -l
```
