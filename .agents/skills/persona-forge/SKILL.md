---
name: persona-forge
description: Edit or review the Persona Forge onboarding engine, scenario JSON, prompt compiler, localStorage handoff, or CTA telemetry.
---

# Persona Forge Workflow

Use this skill when touching:
- `src/pages/persona-cyoa/`
- `src/components/persona-cyoa/`
- `src/pages/ChatPersonaDraftPage.jsx`
- `src/data/persona-cyoa/`
- `src/utils/personaCompiler.js`
- `src/utils/personaProgress.js`
- `src/utils/personaSchema.js`
- `tools/validate-persona-cyoa.mjs`
- `workers/index.js`
- `workers/persona-cyoa-schema.sql`
- `src/App.jsx`
- `.github/workflows/build.yml`

## Required context

Read `docs/persona-forge.md` before editing. The document explains how scenario JSON, reducer state, prompt compilation, localStorage handoff, and D1 telemetry interact.

## Guardrails

- Keep scenario assets relative and route them through `cdnUrl()`.
- Do not use `dangerouslySetInnerHTML`.
- Do not add CSS `filter`, `blur`, or `backdropFilter` to Persona Forge files.
- Keep compiled prompts out of D1 and all backend telemetry.
- Add new prompt slots only by updating `personaSchema.js`, the compiler, the validator, and all scenarios together.

## Verification

Run these before claiming completion:

```powershell
npm run validate:persona
npm run build
npx wrangler deploy --dry-run
```
