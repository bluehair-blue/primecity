---
name: ai-council-review
description: Prime City AI Council review workflow for diagnosing the repository and writing structured audit, rebuttal, synthesis, or final-priority markdown. Use when Codex is asked to run an AI Council round, answer council review questions, create finding cards, write rebuttals, synthesize findings, or produce an ordered improvement plan without modifying production code.
---

# AI Council Review

Conduct a structured audit of the Prime City repository and write evidence-backed council markdown.
Follow the full protocol in `docs/ai-council/00_PROTOCOL.md`.

## Hard Rules

- Do not modify production code: `src/`, `workers/`, `tools/`, or `public/`.
- Do not overwrite another agent's files. Codex writes only to files whose names contain `codex`; Claude writes only to files whose names contain `claude`.
- Read the council documents fresh each round. Do not rely on memory from previous chats.
- Support every claim with a concrete file path, line number, or command output. If evidence is not available, mark the claim `[hypothesis]`.
- Write only the file named by the human moderator. If no output file is specified, ask for the target path before writing.

## Step 1: Read Required Documents

Read these files in this order before writing findings:

1. `docs/ai-council/01_SESSION_BRIEF.md` - current project state and scope
2. `docs/ai-council/02_REPO_BASELINE.md` - file list and code statistics
3. `docs/ai-council/03_REVIEW_QUESTIONS.md` - questions to answer
4. `docs/ai-council/04_SCORE_RUBRIC.md` - scoring formula

Also read `docs/ai-council/00_PROTOCOL.md` when the requested round, output location, or agent interaction rules are unclear.

## Step 2: Determine The Round

| Round | Task |
| ----- | ---- |
| Round 1 | Independent audit. Do not read the other agent's audit yet. |
| Round 2 | Read the other agent's Round 1 output. Write rebuttals. |
| Round 3 | Synthesis only. Do not add new findings. |
| Round 4 | Final judgement and ordered task list. |

## Step 3: Gather Evidence

- Use `rg` for repository search and include exact file references when possible.
- Use commands only to inspect or validate; do not run code generators or deployment commands.
- For line references, cite `path:line`.
- For command evidence, include the command and the relevant output snippet.
- Keep hypotheses separate from confirmed findings.

## Step 4: Write The Output File

Use these sections as needed:

```markdown
## Executive Summary
One paragraph. State the biggest risk and biggest opportunity.

## Finding Cards
One card per finding.

## Open Questions
Unresolved issues that need human or other-agent input.

## Recommended Next Tasks
Ordered list. Each task must be concrete enough for a Codex implementation ticket.

## Verification Commands
Shell commands the human moderator can run to confirm findings.
```

## Finding Card Template

Copy this block for each finding:

```markdown
### {PC-AREA-NNN}

**Area:** Docs / Frontend / EdenChat / SVG / Image / Branding / Security

**Claim:** One clear sentence.

**Evidence:** `path/to/file:line` or command output. If none, write `[hypothesis]`.

**Impact:** Why this matters for launch or user experience.

**Severity:** Critical / High / Medium / Low

**Confidence:** 0.00

**Proposed Change:** Specific action.

**Counterargument:** Best reason not to do this.

**Verification:** How to prove the fix worked.
```

## Rebuttal Card Template

Use this in Round 2 when responding to the other agent:

```markdown
### Rebuttal: {PC-AREA-NNN}

**Verdict:** Agree / Partially Agree / Disagree / Need More Evidence

**Reason:** Concise rationale.

**Additional Evidence:** `path/to/file:line` or observation.

**Adjustment:** Change / Merge / Defer / Reject

**Rebuttal Confidence:** 0.00
```

## Priority Scoring For Round 3+

After cross-validation, score each accepted finding:

```text
Priority Score = (Impact + Urgency + Evidence + Confidence) / (Effort + Risk)
```

Each dimension is 1 to 5. Use `docs/ai-council/04_SCORE_RUBRIC.md` for scale definitions.

Apply the agreement multiplier:

| Status | Multiplier |
| ------ | ---------- |
| Both agents found it | x1.5 |
| One agent only | x1.0 |
| Other agent rebutted it | x0.7 |

Decision bands:

| Score | Action |
| ----- | ------ |
| 3.00+ | Do now |
| 2.00-2.99 | Plan soon |
| 1.00-1.99 | Defer |
| Below 1.00 | Reject or archive |

## Review Domains

Cover these six areas unless the moderator narrows the scope:

1. Migration documentation
2. Frontend UX funnel
3. EdenChat lorebook pipeline
4. Image / SVG / R2 pipeline
5. Branding and monetization
6. Security and content policy
