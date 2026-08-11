# Persona Forge Architecture Notes

Persona Forge is a client-side persona starting engine, not an ending-collection mini-game. Static scenario JSON files under `src/data/persona-cyoa/` feed `PersonaForgeEngine.jsx`; each choice contributes deterministic `choice.add` prompt fragments and `choice.vector` stat changes.

`src/utils/personaSchema.js` owns the allowed slots and sanitization contract. `src/utils/personaCompiler.js` merges fragments and compiles the final RP prompt with the system/developer-priority disclaimer. `src/utils/personaProgress.js` wraps the compiled prompt for chatbot handoff and stores drafts only in same-origin `localStorage`.

The React components in `src/components/persona-cyoa/` render only plain JSX text. Result prompts must stay inside `<pre>{prompt}</pre>` and must not use `dangerouslySetInnerHTML`. Scenario image paths must remain relative and must pass through `src/utils/assets.js` so external tracking pixels are blocked before `cdnUrl()` expands the asset URL.

`workers/index.js` is intentionally narrow: it accepts CTA telemetry at `/api/persona-cyoa/cta` and writes only aggregate analytics fields to D1. It must never receive or store the compiled prompt, opening line, or custom player text.

Before changing persona scenarios or reducer/compiler logic, run:

```powershell
npm run validate:persona
npm run build
npx wrangler deploy --dry-run
```
