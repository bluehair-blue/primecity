# Domain 03 — EdenChat Lorebook Pipeline

Audit the lorebook file set, insertion tooling, and QA readiness for EdenChat launch.

## Review Files

- `docs/prompts/json/**`
- `docs/prompts/_review_*.md`
- `tools/edenchat_clipboard.py`
- `docs/plan_intro_html.md`
- `docs/prompts/plan_sub*.md`

## Questions

- Is the lorebook insertion order clearly defined?
- Is the trigger separation rule applied consistently across all files?
- Does a first-10-turns QA checklist exist?
- Is there a designated location to record EdenChat upload and test logs?
- What must be verified before attempting any prompt improvement?

## Lorebook Structure

| Folder | Count | Role |
| ------ | ----- | ---- |
| `캐릭터/` | 103 | Character body, trigger, initial, deep, past, crisis, family entries |
| `모드/` | 53 | Mode body, scenario, agency branch |
| `오디션/` | 12 | Rounds and interludes |
| Root | 43 | Main prompt, district, SVG rules, events, world |

Run `python tools/edenchat_clipboard.py --list` to get current parsed count and verify against 211 total files.

## Audit Points

### Insertion Order

- Is there a canonical sequence document (what goes in first, what triggers what)?
- Does `edenchat_clipboard.py --list` output a deterministic ordered list?
- Are any entries that must load before others (main prompt, world rules) clearly marked?

### Trigger Separation

- Rule: trigger keywords must not appear inside the JSON body; they must be in a `// --- TRIGGER ---` comment at the end of the file.
- Sample 10 random files and verify the rule is followed.
- Check for any file where the trigger comment is inside the JSON structure.

### Filename Convention

- Pattern: `{이름}_EN.json`
- SVG lorebooks must be in root with `SVG_` prefix.
- Run: `find docs/prompts/json -name "*.json" | grep -v "_EN.json"` to find violations.

### AI Writing Bias

- Flag any lorebook that contains: em dash (`—`), "~하지 않는다" definitions, "A가 아니라 B" contrasts.
- These patterns create unnatural AI outputs.

### First-10-Turns QA

- Is there a checklist covering: character voice consistency, trigger activation, NSFW gating, mode switching?
- If not, what are the minimum test cases needed before launch?

### Upload Log Location

- Where should successful EdenChat uploads be recorded? (`DECISION_LOG.md`? A dedicated log file?)
- Is there a way to verify which entries are live vs not yet inserted?

## Findings

_Populate with Finding Cards after review. Use IDs: `PC-LB-NNN`._
