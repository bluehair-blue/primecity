# Domain 01 — Codex Migration & Docs

Audit agent documentation, workflow configuration, and developer onboarding materials.

## Review Files

- `CLAUDE.md`
- `AGENTS.md` (if it exists)
- `README.md`
- `SECURITY.md`
- `docs/CODEBASE_MAP.md`
- `docs/CODEMAPS/*`
- `.github/workflows/*`
- `.agents/skills/*` / `.claude/skills/*`
- `package.json`

## Questions

- What is the minimum essential guidance that must go into a Codex-facing `AGENTS.md`?
- What information in `CLAUDE.md` is stale, wrong, or Claude-specific and should be marked as such?
- Where does `docs/CODEMAPS/` diverge from the actual codebase structure?
- Should the Claude GitHub Actions workflow be kept active, deactivated, or archived?

## Audit Points

### AGENTS.md Completeness

- Does `AGENTS.md` exist? If not, what is missing from `CLAUDE.md` that Codex needs?
- Minimum required: project overview, tech stack, file structure, CDN rules, commit conventions, build command.
- Does the file distinguish between Claude-specific guidance and agent-neutral guidance?

### CLAUDE.md Accuracy

- Cross-check character count, image count, lorebook count, ASSET_VERSION against actual code.
- Check if any referenced files or paths no longer exist.
- Identify any section that describes planned work as if it were complete.

### CODEBASE_MAP Drift

- Compare `docs/CODEBASE_MAP.md` line counts against actual files.
- Flag any file listed but deleted, or any file present but unlisted.
- Check if the cinematic intro registry (`src/components/cinematic/index.js`) matches the map.

### GitHub Workflows

- List all files under `.github/workflows/`.
- For each workflow: is it triggered, passing, and still relevant?
- Flag any workflow that references a deprecated token, action version, or removed branch.

### Skills & Hooks

- List skills under `.agents/skills/` (or `.claude/skills/`).
- For each skill: does the trigger description match current codebase behavior?
- List hooks under `.claude/hooks/` or equivalent. Verify each hook's regex or file pattern is still accurate.

## Findings

_Populate with Finding Cards after review. Use IDs: `PC-DOC-NNN`._
