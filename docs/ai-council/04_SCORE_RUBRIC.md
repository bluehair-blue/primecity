# Score Rubric

Score each accepted issue from 1 to 5.

## Impact

How strongly this improves EdenChat launch success, user conversion, branding, maintainability, or monetization.

| Score | Meaning |
| ----- | ------- |
| 5 | Directly unblocks launch or prevents user loss |
| 4 | Significantly improves conversion, branding, or retention |
| 3 | Noticeable improvement to UX or maintainability |
| 2 | Minor quality or consistency gain |
| 1 | Cosmetic or negligible effect |

## Urgency

How much this blocks the next meaningful project step.

| Score | Meaning |
| ----- | ------- |
| 5 | Blocks EdenChat launch or another P0 task right now |
| 4 | Blocks a planned milestone within one week |
| 3 | Should be resolved before the next release |
| 2 | Can wait until the next sprint |
| 1 | No time pressure |

## Evidence

How strong the supporting evidence is.

| Score | Meaning |
| ----- | ------- |
| 5 | Reproduced with exact file path, line number, or error output |
| 4 | Observed behavior with partial file evidence |
| 3 | Credible hypothesis supported by related findings |
| 2 | Educated guess, no direct evidence |
| 1 | Speculation only |

## Confidence

How likely the proposed solution is to work.

| Score | Meaning |
| ----- | ------- |
| 5 | Solution is well-understood; similar fix has worked before |
| 4 | High confidence; minor unknowns remain |
| 3 | Moderate confidence; some experimentation likely needed |
| 2 | Uncertain; multiple approaches may be needed |
| 1 | Experimental; outcome is unclear |

## Effort

How much work it requires.

| Score | Meaning |
| ----- | ------- |
| 1 | Under 30 minutes; single file change |
| 2 | 1–2 hours; a few files |
| 3 | Half day; moderate scope |
| 4 | Full day; multi-file refactor |
| 5 | Multiple days; architectural change |

## Risk

How likely it is to break existing behavior or distract from launch.

| Score | Meaning |
| ----- | ------- |
| 1 | Isolated change; no user-facing side effects |
| 2 | Low risk; easy to revert |
| 3 | Moderate risk; requires testing |
| 4 | High risk; touches shared components or data |
| 5 | Critical path risk; could destabilize launch |

## Formula

```text
Priority Score = (Impact + Urgency + Evidence + Confidence) / (Effort + Risk)
```

Effort and Risk are costs — higher values lower the score.
Impact, Urgency, Evidence, and Confidence are benefits — higher values raise the score.

## Decision Bands

| Score      | Action            |
| ---------- | ----------------- |
| 3.00+      | Do now            |
| 2.00–2.99  | Plan soon         |
| 1.00–1.99  | Defer             |
| Below 1.00 | Reject or archive |

## Agreement Multiplier

Apply after scoring to reflect cross-agent validation:

| Status                         | Multiplier |
| ------------------------------ | ---------- |
| Agreed (both agents found it)  | ×1.5       |
| Solo finding (one agent only)  | ×1.0       |
| Rebutted (other agent objects) | ×0.7       |
