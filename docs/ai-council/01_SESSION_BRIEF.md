# Session Brief — Prime City AI Council

## Project

Prime City / EdenChat chatbot introduction site / `intro.bluehair.blue`.

- Repository: `github.com/JaCha00/primecity`
- CDN: `img.bluehair.blue` (Cloudflare R2)
- Chatbot platform: EdenChat (Eden Chat)
- Deployment: Cloudflare Pages (auto-deploy on `git push origin main`)

## Long-term Goal

AI chatbot character content creator — branding, audience acquisition, and monetization through EdenChat.

## Current Task

**Do not implement. Diagnose the repository and produce an improvement plan.**

Each agent independently audits assigned domains, cross-reviews the other agent's findings, and converges on a prioritized improvement roadmap.

## Non-goals

- Do not add new characters.
- Do not rewrite lorebook prompt content.
- Do not deploy to Cloudflare Pages or Workers.
- Do not modify production code unless explicitly instructed.
- Do not make speculative claims without file-level evidence (path + line).
- Do not reference the legacy image folder `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/`.

## Current Known Facts

### Tech Stack

- React 18.3.1, react-dom 18.3.1
- Vite 6.0.0, @vitejs/plugin-react 4.3.4
- react-router-dom 6.28.0
- react-helmet-async 3.0.0
- @cloudflare/vite-plugin 1.29.1, wrangler 4.75.0
- Inline `style` objects only — OKLCH color tokens (`src/styles/tokens.js`), hex/rgb forbidden
- Cloudflare Pages + R2 + 10 SVG Workers
- NovelAI API v4 image generation (`tools/asset_generator.py`)
- ntd11 YOLOv11s-seg NSFW censor (`tools/auto_censor.py`)
- Python pipeline (`tools/`) — asset generation, censor, R2 sync, EdenChat macro

### Repository State

- 20 characters (latest: SPA 사피아)
- `src/utils/cdn.js` `ASSET_VERSION` = 28
- `docs/prompts/json/` — 194 lorebook JSON files (캐릭터 103, 모드 53, 오디션 12, 루트 26)
- Cinematic intro system: JSH / KHR / MIL complete; LSH / MMR / NHR / HSR / HSE in progress
- EdenChat lorebook insertion: 103 entries inserted via `tools/edenchat_clipboard.py`
- 2,000+ image assets in R2; local originals at `연예계/char_img/`
- Existing Claude automation: `.claude/` (9 hooks, 4 skills), `.github/workflows/`
- Future implementation planned via local Codex CLI

### Known Open Items

- Works page (`src/pages/Works.jsx`) — incomplete, placeholder state
- Accessibility optimization (optimization ⑤) — awaiting design decision
- ntd11 YOLO fine-tuning — GPU activation required (RTX 5070 Ti, 40-image labeling)

## Required Output

A practical markdown improvement plan covering:

1. **Findings** — per-domain issues with file evidence
2. **Disagreements** — where Codex and Claude diverge and why
3. **Prioritized roadmap** — P0→P3 sorted action list
4. **Verification commands** — shell/grep commands to confirm each finding
5. **Implementation-safe next tasks** — changes that can be made without breaking production
