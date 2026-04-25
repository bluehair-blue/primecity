# AI Council Protocol — Prime City

## Purpose

This workflow coordinates two local AI coding agents to diagnose Prime City and produce a high-quality improvement plan.

The agents do not chat freely. They write structured markdown artifacts that preserve evidence, claims, disagreement, and decisions.

## Agents

### Agent C — Codex

Primary responsibility:

- implementation feasibility
- repository structure
- build/deploy verification
- stale documentation
- toolchain and workflow risks
- exact next implementation tasks

### Agent A — Claude

Primary responsibility:

- product direction
- EdenChat user experience
- character/worldbuilding clarity
- branding and monetization
- content launch readiness
- onboarding and retention risks

## Human Moderator

The human moderator:

- sets the scope
- resolves conflicting claims
- updates ISSUE_LEDGER.md
- approves FINAL_IMPROVEMENT_PLAN.md
- decides when implementation may begin

## Round Structure

| Round   | Files                                   | Description                            |
| ------- | --------------------------------------- | -------------------------------------- |
| Round 1 | `rounds/round_01_*_audit.md`            | Independent audit by each agent        |
| Round 2 | `rounds/round_02_*_rebuttal.md`         | Cross-rebuttal and supplementation     |
| Round 3 | `rounds/round_03_synthesis.md`          | Synthesis of agreed findings           |
| Round 4 | `rounds/round_04_final_judgement.md`    | Final judgement and prioritization     |

Agents do not read each other's Round 1 output until Round 2 begins.

## Review Domains

Six domains are reviewed sequentially by each agent:

1. Migration documentation (Codex)
2. Frontend UX funnel
3. EdenChat lorebook pipeline
4. Image / SVG / R2 pipeline
5. Branding and monetization
6. Security and content policy

## Input Documents

- `01_SESSION_BRIEF.md` — current project state summary
- `02_REPO_BASELINE.md` — repository baseline (file list, code statistics)
- `03_REVIEW_QUESTIONS.md` — review question list
- `04_SCORE_RUBRIC.md` — evaluation rubric

## Output Files

- Codex writes to files with `codex` in the filename.
- Claude writes to files with `claude` in the filename.
- The human moderator owns `ISSUE_LEDGER.md` and `DECISION_LOG.md`.
- The final synthesizer owns `FINAL_IMPROVEMENT_PLAN.md`.

## Rules

1. Do not modify production code during council review.
2. Write findings as cards, not essays.
3. Every claim must include evidence or be marked as hypothesis.
4. Use file paths whenever possible.
5. Use confidence scores from 0.00 to 1.00.
6. Separate launch blockers from nice-to-have improvements.
7. Respond to the other agent by Finding ID.
8. Do not overwrite the other agent's files.
9. Do not rely on memory from previous chats; read the specified documents each round.
10. Final output must become actionable local Codex tasks.

## Finding Card

Each finding must use this structure:

### Finding ID

Unique ID, e.g. PC-DOC-001.

### Area

Docs / Frontend / EdenChat / SVG / Image / Branding / Security.

### Claim

One clear claim.

### Evidence

Concrete files, lines, command outputs, or observed behavior.

### Impact

Why this matters.

### Severity

Critical / High / Medium / Low.

### Confidence

0.00 to 1.00.

### Proposed Change

Specific action.

### Counterargument

Best argument against this action.

### Verification

How to prove the change worked.

## Rebuttal Card

### Target Finding

Finding ID.

### Verdict

Agree / Partially Agree / Disagree / Need More Evidence.

### Reason

Concise rationale.

### Additional Evidence

Files or observations.

### Adjustment

Change, merge, defer, or reject.

### Rebuttal Confidence

0.00 to 1.00.
