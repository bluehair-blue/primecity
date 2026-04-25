# Decision Log

Owner: human moderator  
Project: Prime City / EdenChat / `intro.bluehair.blue`  
Source: `FINAL_IMPROVEMENT_PLAN.md`, `round_04_final_judgement.md`  
작성 기준일: 2026-04-25 KST  
Status: Round 4 closed; implementation may begin under the decisions below.

---

## Round Closure

| Round | Opened | Closed | Closer | Status |
|---|---|---|---|---|
| 4 | 2026-04-25 | 2026-04-25 | Moderator | Closed |

## Implementation Gate

Implementation may begin only under the following gate:

1. First implementation PR must be **Build CI**.
2. CEO card correction and Navbar Play may proceed after the CI gate PR is created.
3. Documentation baseline refresh must wait until source-facing corrections stabilize.
4. Prompt JSON body edits remain prohibited unless the moderator explicitly opens a prompt/platform update cycle.
5. Gallery NSFW modal removal remains rejected.
6. Works expansion remains deferred until a concrete Creator portfolio URL or release trigger exists.

---

## Template

```markdown
# Decision PC-DEC-NNN

## Decision
One sentence stating what was decided.

## Linked Findings / Tickets
- PC-LDG-XXX
- PC-R4-XXX

## Why
The reason this decision was made — constraint, evidence, or stakeholder need.

## Alternatives Considered
- Alternative A — why it was not chosen.
- Alternative B — why it was not chosen.

## Chosen Next Step
The concrete first action that implements this decision.

## Status
Accepted / Rejected / Deferred
```

---

# Accepted

## Decision PC-DEC-001 — Close Round 4 and authorize implementation

## Decision
Round 4 is closed, and implementation may begin under `FINAL_IMPROVEMENT_PLAN.md` and `round_04_final_judgement.md`.

## Linked Findings / Tickets
- Round 4 closure gate
- All accepted / transformed `PC-LDG-*` entries

## Why
The AI Council review has produced a final plan, scored findings, implementation ordering, rejected/deferred boundaries, and verification commands. The final judgement explicitly states that implementation should proceed only after moderator closure is recorded in `DECISION_LOG.md`.

## Alternatives Considered
- Keep Round 4 open — rejected because implementation is now blocked only by formal closure, not by unresolved analysis.
- Start implementation without recording closure — rejected because the plan requires closure before editing production code or core project documents.

## Chosen Next Step
Begin with `PC-R4-003 — Build CI Workflow` as the first implementation PR.

## Status
Accepted

---

## Decision PC-DEC-002 — Build CI is the first implementation PR

## Decision
The first implementation PR must create a GitHub Actions build workflow and make build verification the release gate.

## Linked Findings / Tickets
- `PC-LDG-004`
- `PC-R4-003 — Build CI Workflow`

## Why
Every later implementation benefits from automated build verification. Existing GitHub Actions do not enforce `npm ci && npm run build`, and local build verification is not enough for PR safety.

## Alternatives Considered
- Start with CEO card correction — rejected as the first PR because later UI work should be protected by CI.
- Rely on Cloudflare Pages build checks only — rejected because that does not necessarily protect PR merge flow.
- Add lint/test/typecheck immediately — deferred because the immediate gate is production build correctness.

## Chosen Next Step
Create `.github/workflows/build.yml` using Node `22.11.0` unless Cloudflare Pages requires another pinned version. The workflow should run `npm ci --prefer-offline` and `npm run build`. Configure branch protection so `Build / build` is required before merge.

## Status
Accepted

---

## Decision PC-DEC-003 — Correct CEO mode released-state representation

## Decision
The CEO mode card must no longer render a null link or imply an unreleased state.

## Linked Findings / Tickets
- `PC-LDG-001`
- `PC-R4-001 — CEO Card Released-State Correction`

## Why
CEO mode is already launched and lorebook-registered, but the site card still has `detailPath: null`. This is the clearest user-visible correctness issue.

## Alternatives Considered
- Leave `detailPath: null` until a full page is ready — rejected because the current card can behave like a dead click.
- Mark CEO mode as coming soon — rejected because it is factually launched.
- Hide CEO mode entirely — acceptable only as an emergency fallback, but worse than accurately representing the released state.

## Chosen Next Step
Default path: create a minimal `ModeCeo.jsx` page and `/modes/ceo` route. Fallback path: render CEO as a non-click information card showing `출시됨`, `!대표모드`, key characters, and Navbar Play guidance. Do not merge if neither path can be done safely.

## Status
Accepted

---

## Decision PC-DEC-004 — Add canonical EdenChat player URL and Navbar Play link only

## Decision
Add one canonical EdenChat player URL module and add desktop/mobile Navbar Play links, while avoiding CTA sprawl.

## Linked Findings / Tickets
- `PC-LDG-002`
- `PC-R4-002 — Navbar Play Redirect`
- `PC-LDG-D03`
- `PC-LDG-D04`

## Why
Hero-only EdenChat entry is insufficient, but the moderator chose top Navbar Play as the first conversion improvement. Additional CharDetail/GameModes CTA expansion must wait for data, user feedback, or moderator override.

## Alternatives Considered
- Add CTA buttons across Hero, Footer, CharDetail, GameModes, and mode pages at once — rejected because it risks clutter and lacks measurement.
- Keep only the Hero CTA — rejected because users need an always-accessible entry point.
- Use React Router `<Link>` for EdenChat — rejected because EdenChat is an external destination.

## Chosen Next Step
Create `src/data/links.js` or `src/utils/links.js` exporting `EDENCHAT_PLAYER_URL`. Replace the hardcoded Hero URL with the constant. Add visible external Play links in both desktop and mobile Navbar using `<a>`, `target="_blank"`, `rel="noopener noreferrer"`, and `aria-label="플레이 (외부 링크)"` unless moderator later requests same-tab navigation.

## Status
Accepted

---

## Decision PC-DEC-005 — Refresh documentation baseline after source-facing PRs stabilize

## Decision
Refresh baseline project documents only after Build CI, CEO card, Navbar Play, and source-facing audit changes stabilize.

## Linked Findings / Tickets
- `PC-LDG-005`
- `PC-R4-004 — Documentation Baseline Refresh`

## Why
Current docs contain stale numbers and statuses. Future agents will keep producing wrong recommendations unless baseline facts are updated. However, refreshing docs before source-facing fixes would immediately make the docs stale again.

## Alternatives Considered
- Update docs before implementation — rejected because source-facing PRs are about to change the baseline.
- Leave docs stale — rejected because stale onboarding material is a recurring agent failure mode.
- Rewrite historical update logs — rejected because historical records should remain historical.

## Chosen Next Step
After source-facing PRs stabilize, update `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`, `docs/ai-council/01_SESSION_BRIEF.md`, and `docs/ai-council/02_REPO_BASELINE.md`. Current-state facts must include `as of 2026-04-25` context and match: 20 characters, 207 non-combined lorebooks, `ASSET_VERSION=28`, 12 cinematic styles, 20 sign images, and `talk.bluehair.blue`.

## Status
Accepted

---

## Decision PC-DEC-006 — Add read-only image count surface audit

## Decision
Create a read-only image count surface audit and tie it to the image update workflow or checklist.

## Linked Findings / Tickets
- `PC-LDG-003`
- `PC-R4-005 — Image Count Surface Audit`

## Why
Image count and asset copy drift appears across multiple surfaces. The correct fix is an audit/checklist that surfaces candidate files, not automatic prompt JSON edits.

## Alternatives Considered
- Auto-edit all count surfaces — rejected because some counts are historical and some surfaces require human classification.
- Use prompt JSON as the single source of truth — rejected because prompt JSON is a platform paste artifact and should not be auto-mutated.
- Ignore count drift — rejected because inconsistent image counts hurt trust and future agent accuracy.

## Chosen Next Step
Create `tools/audit_image_count_surfaces.ps1` or equivalent. It should print candidate files containing image count/current asset facts and require human classification as `current`, `historical`, or `ignore`. Initial monitor list should include `docs/프라임시티 소개페이지.txt`, `src/pages/Gallery.jsx`, `src/components/ImageSystemInfo.jsx`, `workers/svg-tablet.js`, `AGENTS.md`, `CLAUDE.md`, and latest/current-state portions of `src/pages/Updates.jsx`.

## Status
Accepted

---

## Decision PC-DEC-007 — Protect prompt JSON body fields and add trigger audit guardrails

## Decision
Prompt JSON body fields, including narrative `trigger` keys, must not be renamed or auto-fixed; add audit-only guardrails instead.

## Linked Findings / Tickets
- `PC-LDG-010`
- `PC-R4-006 — Prompt Trigger Protection`
- Rejected: `PC-LDG-R03`

## Why
`docs/prompts/json/**` is a manual platform paste artifact and is treated as protected runtime content. Renaming body fields could force destructive re-insertion or alter intended narrative behavior.

## Alternatives Considered
- Rename body `trigger` keys to `activation_condition` or similar — rejected by moderator instruction.
- Present raw `rg '"trigger"'` output as a fix list — rejected because it invites accidental edits.
- Ignore the confusion entirely — rejected because future agents may still misread the keys as schema violations.

## Chosen Next Step
Create `docs/prompts/json/README_DO_NOT_TOUCH.md` and `tools/audit_trigger_keys.ps1`. The audit wrapper must print clear `AUDIT ONLY - DO NOT MODIFY` warnings before and after search output.

## Status
Accepted

---

## Decision PC-DEC-008 — Make EdenChat clipboard listing work without GUI dependencies

## Decision
`tools/edenchat_clipboard.py --list` must run without importing GUI clipboard dependencies and must report the 207 non-combined lorebook count.

## Linked Findings / Tickets
- `PC-LDG-006`
- `PC-R4-007 — EdenChat Clipboard Lazy Import`

## Why
207 non-combined lorebooks are already the operational standard. The list/audit command must be available before any re-insertion or lorebook maintenance cycle without requiring `pyperclip` or `pyautogui`.

## Alternatives Considered
- Leave GUI imports at module load time — rejected because even read-only listing fails in dependency-light environments.
- Rewrite the full clipboard automation now — rejected because only lazy import and list reliability are needed before the next maintenance cycle.

## Chosen Next Step
Move GUI imports behind a function used only by clipboard/automation actions. Keep `--list` and parsing/audit behavior dependency-light and ensure output explicitly says `207 non-combined`.

## Status
Accepted

---

## Decision PC-DEC-009 — Guard legacy image prompt extraction

## Decision
The legacy image prompt extraction tool must not run accidentally against old image paths.

## Linked Findings / Tickets
- `PC-LDG-008`
- `PC-R4-008 — Legacy Image Tool Guard`

## Why
The legacy path tool can pollute prompt/image configuration if accidentally run. It references old image sources that are not part of the current canonical image pipeline.

## Alternatives Considered
- Delete the script outright — rejected because it may have historical/recovery value.
- Leave it in `tools/` without a guard — rejected because new agents may execute it by mistake.
- Move only documentation — insufficient because the script itself remains runnable.

## Chosen Next Step
Either move `tools/extract_char_prompts.py` into a clearly labeled legacy location or add an explicit `--allow-legacy` guard that fails by default with a clear message.

## Status
Accepted

---

## Decision PC-DEC-010 — Make Worker compatibility date and dry-run discipline explicit

## Decision
Worker compatibility date handling must be explicit, and Worker deploy validation must prioritize dry-run or localhost verification before real deploys.

## Linked Findings / Tickets
- `PC-LDG-009`
- `PC-R4-009 — Worker Compatibility Cleanup`

## Why
The site and Worker deploy scripts currently risk compatibility-date drift. Worker runtime behavior is operationally important and should not be changed blindly.

## Alternatives Considered
- Force all Worker compatibility dates to match the site immediately — rejected unless there is no Worker-specific reason for the older date.
- Leave dates hardcoded without explanation — rejected because it preserves drift and weakens deploy reproducibility.

## Chosen Next Step
Update `workers/deploy/deploy.sh` so compatibility date is a top-level variable or documented exception. Keep dry-run/localhost validation explicit before any real deploy.

## Status
Accepted

---

## Decision PC-DEC-011 — Document SVG preview/runtime asymmetry instead of forcing parity

## Decision
Do not force site SVG preview behavior and Worker runtime behavior to match; document their intended asymmetry near the relevant code.

## Linked Findings / Tickets
- `PC-LDG-011`
- Rejected: `PC-LDG-R04`

## Why
The Worker is the canonical runtime for actual chatbot SVG output. The site preview is a structure/preview surface and may intentionally differ, especially around `data:` URI handling.

## Alternatives Considered
- Add `data:` support to site preview for parity — rejected because parity is not the intended invariant.
- Remove the preview — rejected because it remains useful for structure checking.
- Leave `Keep in sync` comments ambiguous — rejected because they cause repeated false findings.

## Chosen Next Step
Add short guard comments in `src/data/svgTemplates/helpers.js`, `src/data/svgTemplates.js`, and representative `workers/svg-*.js` files stating that site preview is preview-only and Worker is canonical runtime.

## Status
Accepted

---

## Decision PC-DEC-012 — Resolve Freeplay ambiguity through UI copy only

## Decision
Clarify Freeplay naming in site UI, but do not change platform triggers or prompt data.

## Linked Findings / Tickets
- `PC-LDG-007`

## Why
The Freeplay label ambiguity is real, but trigger changes are prohibited and could require platform-level maintenance. UI copy can reduce confusion without touching protected lorebook content.

## Alternatives Considered
- Rename the `!프리플레이` trigger — rejected because it touches platform behavior and may require re-insertion.
- Ignore the ambiguity — rejected because it is a known onboarding risk.

## Chosen Next Step
Update site copy in `src/data/gamemodes.js` and/or `src/components/GameModes.jsx` to distinguish main Free Play from the `!프리플레이` custom/user-note overlay. Treat prompt/platform disambiguation as a moderator-controlled future update only.

## Status
Accepted

---

## Decision PC-DEC-013 — Keep Gallery NSFW modal; fix stale policy documentation

## Decision
Do not remove the Gallery 18+ modal by default; instead, update stale documentation so it no longer implies the modal must be removed.

## Linked Findings / Tickets
- `PC-LDG-012`
- Rejected: `PC-LDG-R05`

## Why
The moderator clarified that the Gallery 18+ modal can remain. The error is stale documentation that interprets the modal as a launch-only blocker/removal target.

## Alternatives Considered
- Remove the modal — rejected by moderator clarification.
- Strengthen the modal into a heavier policy gate — rejected because the current decision is only to preserve the existing warning behavior.
- Leave docs stale — rejected because future agents may attempt removal again.

## Chosen Next Step
During policy/docs cleanup, update relevant documentation to state that the Gallery 18+ modal is retained unless the moderator explicitly changes the policy.

## Status
Accepted

---

## Decision PC-DEC-014 — Record regressions in the Decision Log

## Decision
If a Definition of Done item regresses, add a regression entry to this log within one working day.

## Linked Findings / Tickets
- Final Improvement Plan Definition of Done
- Rollback Hints

## Why
The plan defines several fragile acceptance points: CEO null-link removal, Navbar Play, build CI, docs baseline, image count audit, clipboard listing, legacy guard, Worker compatibility, and prompt JSON protection. Regression handling should be explicit.

## Alternatives Considered
- Track regressions only in ad hoc chat history — rejected because chat history is not a durable repo artifact.
- Track regressions only in issues — optional, but the Decision Log should still preserve the architectural/process decision trail.

## Chosen Next Step
Use this format when a regression is found:

```markdown
Regression: <item> @ <sha> @ <date> — owner: <name> — next action: <action>
```

## Status
Accepted

---

# Rejected

## Decision PC-DEC-015 — Reject duplicated appearance fields in `characters.js`

## Decision
Do not add duplicated character appearance fields to `src/data/characters.js` as a new source of truth.

## Linked Findings / Tickets
- `PC-LDG-R01`

## Why
The latest appearance information is in `docs/prompts/json/*`. Duplicating appearance data in `characters.js` would create drift.

## Alternatives Considered
- Add `appearance`, `hair`, `eyes`, or similar fields to every character — rejected because it creates another manually synchronized dataset.
- Use `characters.js` as the canonical appearance source — rejected because it is not the current operational source.

## Chosen Next Step
Keep `characters.js` focused on site display metadata and use prompt JSON files as the latest appearance reference.

## Status
Rejected

---

## Decision PC-DEC-016 — Reject rewriting historical Updates counts

## Decision
Do not rewrite historical counts in `Updates.jsx` merely to match current totals.

## Linked Findings / Tickets
- `PC-LDG-R02`

## Why
Historical update entries are records of the state at that time. Changing old counts to current counts would corrupt the timeline.

## Alternatives Considered
- Replace all old 17/19/asset counts with current values — rejected because it destroys historical meaning.
- Leave all current-state ambiguity unresolved — not ideal; adding context is allowed when touching the file for current-state work.

## Chosen Next Step
Preserve historical counts. If `Updates.jsx` is touched for current-state work, add clarifying context such as `(당시 N명)` or a current-state header.

## Status
Rejected

---

## Decision PC-DEC-017 — Reject prompt JSON body `trigger` renaming

## Decision
Do not rename prompt JSON body `trigger` fields.

## Linked Findings / Tickets
- `PC-LDG-R03`
- `PC-LDG-010`

## Why
The moderator prohibited this. Prompt JSON files are protected manual paste artifacts, and body field renaming can damage runtime content or force re-insertion.

## Alternatives Considered
- Rename body `trigger` keys to a less confusing schema term — rejected.
- Enforce a schema that bans all body `trigger` keys — rejected.

## Chosen Next Step
Use audit-only guardrails from `PC-DEC-007` instead.

## Status
Rejected

---

## Decision PC-DEC-018 — Reject forced SVG preview/Worker `data:` parity

## Decision
Do not force site preview and Worker runtime SVG image URL policies to match.

## Linked Findings / Tickets
- `PC-LDG-R04`
- `PC-LDG-011`

## Why
The Worker is the canonical runtime; the site preview is preview-only. The asymmetry is intentional.

## Alternatives Considered
- Make the site helper accept `data:` URIs to match Worker behavior — rejected because parity is not the target invariant.
- Make the Worker reject `data:` URIs to match site preview — rejected because Worker runtime needs inline behavior.

## Chosen Next Step
Document the asymmetry as accepted in code comments under `PC-DEC-011`.

## Status
Rejected

---

## Decision PC-DEC-019 — Reject Gallery NSFW modal removal as a default action

## Decision
Do not remove the Gallery 18+ modal as a default cleanup item.

## Linked Findings / Tickets
- `PC-LDG-R05`
- `PC-LDG-012`

## Why
The moderator clarified that the current 18+ popup may remain. The needed action is documentation cleanup, not UI removal.

## Alternatives Considered
- Remove the modal immediately — rejected.
- Treat the modal as a launch blocker — rejected.

## Chosen Next Step
Keep the modal and update stale documentation under `PC-DEC-013`.

## Status
Rejected

---

## Decision PC-DEC-020 — Reject internal Works portfolio expansion

## Decision
Do not expand `Works` internally into a full portfolio hub during this implementation cycle.

## Linked Findings / Tickets
- `PC-LDG-R06`
- `PC-LDG-D01`

## Why
The long-term direction is a separate Creator portfolio site. Internal Works expansion would duplicate that future surface and distract from current maintenance priorities.

## Alternatives Considered
- Add future work lineups and portfolio details inside `Works.jsx` now — rejected.
- Remove `/works` immediately — deferred until a release trigger or Creator portfolio URL decision.

## Chosen Next Step
Keep Works strategy deferred until a Creator portfolio URL exists or the next public release forces a decision.

## Status
Rejected

---

# Deferred

## Decision PC-DEC-021 — Defer Works redirect until Creator portfolio target exists

## Decision
Defer changes that redirect or reposition `/works` until a concrete Creator portfolio URL or next-release trigger exists.

## Linked Findings / Tickets
- `PC-LDG-D01`

## Why
The Creator portfolio direction is accepted, but there is no target URL or release timeline. Maintenance of the current public work is higher priority.

## Alternatives Considered
- Redirect immediately to a placeholder — deferred because it may create a worse user experience.
- Expand Works internally — rejected under `PC-DEC-020`.

## Chosen Next Step
Re-evaluate before the next public release or when a Creator portfolio URL is ready.

## Status
Deferred

---

## Decision PC-DEC-022 — Defer full Scene Codes public UI

## Decision
Defer a full public Scene Codes/code-table UI.

## Linked Findings / Tickets
- `PC-LDG-D02`

## Why
A full code table may overexpose implementation details and turn the public site into an operations manual. The current priority is launch correctness and operational safety.

## Alternatives Considered
- Publish the full code list now — deferred because the product/UX value is not proven.
- Remove Scene Code summaries — not chosen because category-level summaries can remain useful.

## Chosen Next Step
Re-evaluate only if an image catalog, fan reference, or dedicated documentation page is planned.

## Status
Deferred

---

## Decision PC-DEC-023 — Defer mode-card and CharDetail CTA expansion

## Decision
Do not add additional GameModes or CharDetail EdenChat CTA links until Navbar Play data/referrer evidence, user feedback, or moderator override exists.

## Linked Findings / Tickets
- `PC-LDG-D03`
- `PC-LDG-D04`
- CTA Restraint Rule

## Why
Navbar Play is the chosen first conversion improvement. Additional CTA expansion should be measurement-led or explicitly overridden to avoid clutter.

## Alternatives Considered
- Add CTAs to all mode cards and character detail pages now — deferred because it could clutter the showcase and lacks measurement.
- Keep only Hero forever — rejected by the Navbar Play decision.

## Chosen Next Step
After Navbar Play is merged, test whether referrer or lightweight query markers can support route-level conversion decisions. If not, use qualitative feedback or moderator override.

## Status
Deferred

---

## Decision PC-DEC-024 — Defer cinematic config cleanup

## Decision
Defer `cardDeal` / cinematic config cleanup to the next cinematic intro maintenance pass.

## Linked Findings / Tickets
- `PC-LDG-013`

## Why
The issue has low runtime risk and is not a launch blocker. It should ride with documentation or cinematic hygiene work.

## Alternatives Considered
- Remove or mark `cardDeal` immediately — deferred because it is not blocking the first implementation batch.
- Ignore permanently — not chosen because the config drift can still confuse future agents.

## Chosen Next Step
During the next cinematic maintenance pass, remove `cardDeal` or mark it `reserved / unused`, and document source implementation as canonical.

## Status
Deferred

---

## Decision PC-DEC-025 — Defer encoding hygiene to opportunistic cleanup

## Decision
Defer broken source comment character cleanup to an opportunistic hygiene PR.

## Linked Findings / Tickets
- `PC-LDG-014`

## Why
The mathematical score is high because effort/risk are low, but business impact is minimal. It should not displace launch-correctness work.

## Alternatives Considered
- Fix immediately as part of the first PR — deferred because the first PR must remain focused on Build CI.
- Ignore permanently — not chosen because it is easy to clean up during a hygiene pass.

## Chosen Next Step
When a hygiene PR is opened, ensure `rg -n '�' AGENTS.md CLAUDE.md docs src workers tools` returns no unreviewed source comments.

## Status
Deferred

---

# Implementation Order Summary

| Order | Ticket | Decision | Status |
|---:|---|---|---|
| 1 | `PC-R4-003 — Build CI Workflow` | `PC-DEC-002` | Accepted |
| 2 | `PC-R4-001 — CEO Card Released-State Correction` | `PC-DEC-003` | Accepted |
| 3 | `PC-R4-002 — Navbar Play Redirect` | `PC-DEC-004` | Accepted |
| 4 | `PC-R4-005 — Image Count Surface Audit` | `PC-DEC-006` | Accepted |
| 5 | `PC-R4-004 — Documentation Baseline Refresh` | `PC-DEC-005` | Accepted after source-facing PRs stabilize |
| 6 | `PC-R4-006 — Prompt Trigger Protection` | `PC-DEC-007` | Accepted |
| 7 | `PC-R4-007 — EdenChat Clipboard Lazy Import` | `PC-DEC-008` | Accepted / Plan Soon |
| 8 | `PC-R4-008 — Legacy Image Tool Guard` | `PC-DEC-009` | Accepted / Plan Soon |
| 9 | `PC-R4-009 — Worker Compatibility Cleanup` | `PC-DEC-010` | Accepted / Plan Soon |

---

# Verification Commands to Preserve

```powershell
# Build
npm.cmd run build

# CEO null-link and route
rg -n 'id: "ceo"|detailPath: null|to=\{null\}|to=\{cm.detailPath\}|/modes/ceo|ModeCeo' src

# EdenChat URL centralization
rg -n 'https://www\.eden-chat\.com/works/35e68463|EDENCHAT_PLAYER_URL' src

# Current source facts
(Select-String -LiteralPath src\data\characters.js -Pattern '^\s+id: "').Count
Get-ChildItem docs\prompts\json -Recurse -File -Filter *.json |
  Where-Object { $_.FullName -notmatch '\\_combined\\' } |
  Measure-Object
Select-String -Path src\utils\cdn.js -Pattern 'ASSET_VERSION'

# Image count/current asset surfaces
rg -n '102장|75 per character|2,000장|1,900장|1631|1632|ASSET_VERSION' src docs workers AGENTS.md CLAUDE.md

# Protected trigger audit must be audit-only
Write-Host "AUDIT ONLY - DO NOT MODIFY THESE LINES (MOD-3)"
rg -n '"trigger"\s*:' docs\prompts\json

# Worker compatibility
rg -n 'compatibility_date|compatibility-date' wrangler.jsonc workers
```
