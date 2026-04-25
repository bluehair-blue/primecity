# Round 4 — Final Judgement

> Source: `docs/ai-council/FINAL_IMPROVEMENT_PLAN.md`  
> 작성 기준일: 2026-04-25 KST  
> 범위: accepted / transformed ledger entries only. 새 finding은 추가하지 않는다.  
> 원칙: 이 문서는 우선순위 판정 문서다. Production code, prompt JSON, 기존 핵심 문서는 수정하지 않는다.

---

## 1. Judgement Summary

Final Improvement Plan의 결론을 Round 4 기준으로 확정한다.

가장 먼저 처리할 항목은 **Build CI**, **CEO 모드 카드**, **Navbar Play 리다이렉트**, **문서 baseline 갱신**, **이미지 수치 surface audit**이다. 이 다섯 항목은 사용자 노출, 출시 상태 정확성, 다음 PR의 안전성, 에이전트 온보딩 안정성에 직접 영향을 준다.

단, 실행 순서는 단순 점수순이 아니라 의존 관계를 반영한다. `PC-LDG-004` Build CI는 점수상 2위지만, 이후 PR의 gate가 되므로 **첫 PR**로 둔다. CEO 카드와 Navbar Play는 그 다음 병렬 처리한다. 문서 baseline refresh는 source-affecting PR이 안정화된 뒤 실행한다.

Round 4의 최종 판정은 다음과 같다.

- **Do Now:** `PC-LDG-004`, `PC-LDG-001`, `PC-LDG-002`, `PC-LDG-005`, `PC-LDG-003`
- **Plan Soon:** `PC-LDG-006`, `PC-LDG-010`, `PC-LDG-008`, `PC-LDG-009`, `PC-LDG-011`, `PC-LDG-012`, `PC-LDG-007`
- **Defer:** `PC-LDG-013`, `PC-LDG-014`
- **Archive as rejected/deferred:** `PC-LDG-D01`~`D04`, `PC-LDG-R01`~`R06`

---

## 2. Scoring Reference

각 항목은 1~5점으로 판정한다.

| Metric | Meaning |
|---|---|
| Impact | 브랜딩, 유저 전환, 출시 상태 정확성, 운영 안정성에 미치는 영향 |
| Urgency | 지금 하지 않으면 다음 작업을 방해하는 정도 |
| Evidence | 파일 경로, 명령 결과, moderator 판정 등 근거 강도 |
| Confidence | 제안한 해결책이 맞을 가능성 |
| Effort | 작업량. 1 = 작음, 5 = 큼 |
| Risk | 잘못 건드렸을 때 프로젝트를 망가뜨릴 가능성 |

```text
Raw Score = (Impact + Urgency + Evidence + Confidence) / (Effort + Risk)
Final Score = Raw Score × Agreement Multiplier
```

Agreement multiplier:

| Status | Multiplier |
---|---:|
| Both agents found it or moderator-confirmed core issue | 1.5 |
| One agent found it, not disputed | 1.0 |
| Issue transformed after rebuttal | 0.9 |
| Other agent materially rebutted original action | 0.7 |

Decision bands:

| Final Score | Action |
|---:|---|
| 3.00+ | Do Now |
| 2.00-2.99 | Plan Soon |
| 1.00-1.99 | Defer |
| Below 1.00 | Reject or Archive |

---

## 3. Scored Findings

| Finding ID | Impact | Urgency | Evidence | Confidence | Effort | Risk | Raw | Multiplier | Final | Decision |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---:|---:|---:|---|
| PC-LDG-004 | 5 | 5 | 5 | 5 | 2 | 1 | 6.67 | 1.0 | 6.67 | Do Now |
| PC-LDG-001 | 5 | 5 | 5 | 4 | 3 | 2 | 3.80 | 1.5 | 5.70 | Do Now |
| PC-LDG-002 | 4 | 4 | 5 | 4 | 2 | 2 | 4.25 | 1.5 | 6.38 | Do Now |
| PC-LDG-005 | 4 | 4 | 5 | 5 | 3 | 2 | 3.60 | 1.5 | 5.40 | Do Now |
| PC-LDG-003 | 4 | 4 | 4 | 4 | 3 | 2 | 3.20 | 1.5 | 4.80 | Do Now |
| PC-LDG-006 | 3 | 3 | 5 | 5 | 2 | 2 | 4.00 | 1.0 | 4.00 | Plan Soon |
| PC-LDG-010 | 4 | 3 | 5 | 5 | 2 | 2 | 4.25 | 0.9 | 3.83 | Plan Soon |
| PC-LDG-008 | 3 | 3 | 5 | 5 | 2 | 2 | 4.00 | 1.0 | 4.00 | Plan Soon |
| PC-LDG-009 | 3 | 3 | 4 | 4 | 2 | 2 | 3.50 | 1.0 | 3.50 | Plan Soon |
| PC-LDG-011 | 3 | 3 | 4 | 5 | 1 | 2 | 5.00 | 0.7 | 3.50 | Plan Soon |
| PC-LDG-012 | 3 | 2 | 4 | 5 | 2 | 2 | 3.50 | 0.9 | 3.15 | Plan Soon |
| PC-LDG-007 | 3 | 2 | 4 | 3 | 2 | 3 | 2.40 | 1.0 | 2.40 | Plan Soon |
| PC-LDG-013 | 2 | 2 | 5 | 4 | 1 | 2 | 4.33 | 0.7 | 3.03 | Defer |
| PC-LDG-014 | 1 | 1 | 5 | 5 | 1 | 1 | 6.00 | 1.0 | 6.00 | Defer |

### Score Notes

- `PC-LDG-014` has a high mathematical score because effort/risk are very low, but its business impact is minimal. It is explicitly band-overridden to **Defer**.
- `PC-LDG-013` also scores above 3 mathematically, but it is not a launch blocker and should ride with documentation/hygiene work. It is band-overridden to **Defer**.
- `PC-LDG-011` is Plan Soon despite transformed status because the fix is very small and prevents repeated misunderstanding of SVG preview/runtime behavior.
- `PC-LDG-004` has no agreement multiplier but is execution-gating infrastructure. It is first in implementation order.

---

## 4. Do Now

### PC-LDG-004 — Build CI 부재

**Final decision:** Do Now, first PR.

**Reason:** Every later implementation benefits from CI. Existing GitHub Actions do not enforce `npm ci && npm run build`; local build was previously verified, but not automated. This is low-risk and high-leverage.

**Required output:**

- `.github/workflows/build.yml`
- Branch protection required check for `Build / build`
- `DECISION_LOG.md` entry recording branch protection setup

### PC-LDG-001 — CEO 모드 카드 `detailPath: null`

**Final decision:** Do Now.

**Reason:** CEO mode is already launched and lorebook-registered, but the site currently represents it as a null-link card. This is the clearest user-visible correctness issue.

**Required output:**

- Preferred: `ModeCeo.jsx` minimum page + `/modes/ceo` route
- Fallback: non-click info card with `출시됨`, `!대표모드`, key characters, Play guidance
- No `<Link to={null}>`

### PC-LDG-002 — Navbar Play 리다이렉트

**Final decision:** Do Now.

**Reason:** Hero-only EdenChat entry is insufficient. Moderator chose top Navbar Play as the first conversion improvement, not CTA sprawl.

**Required output:**

- Canonical EdenChat URL module
- Hero URL refactored to constant
- Desktop/mobile Navbar Play external link
- External link identity via ARIA and visual cue

### PC-LDG-005 — Documentation baseline refresh

**Final decision:** Do Now after source-affecting PRs stabilize.

**Reason:** Current docs contain stale numbers and status. Agent onboarding will continue to produce wrong recommendations if this remains unfixed.

**Required output:**

- Update current-state facts with `as of 2026-04-25`
- Preserve historical timeline counts
- Confirm: 20 characters, 207 non-combined lorebooks, `ASSET_VERSION=28`, 12 cinematic styles, 20 sign images, `talk.bluehair.blue`

### PC-LDG-003 — Image count surface audit

**Final decision:** Do Now.

**Reason:** Image count and asset copy drift has multiple surfaces. The correct fix is an audit/checklist tied to upload/sync flow, not automatic prompt JSON edits.

**Required output:**

- Read-only image count surface audit
- Initial monitor list includes `Gallery.jsx`, `ImageSystemInfo.jsx`, `workers/svg-tablet.js`, `AGENTS.md`, `CLAUDE.md`, and latest/current-state `Updates.jsx` areas
- Human classification as `current`, `historical`, or `ignore`

---

## 5. Plan Soon

| Finding ID | Reason | Trigger |
|---|---|---|
| PC-LDG-006 | `edenchat_clipboard.py --list` must work without GUI dependencies, but 207 entries are already manually inserted. | Before any re-insertion or lorebook maintenance cycle |
| PC-LDG-010 | Prompt body `trigger` fields are protected; guardrails prevent accidental destructive cleanup. | Before any prompt audit work |
| PC-LDG-008 | Legacy path tool can pollute prompt config if run accidentally. | Before tools cleanup or image pipeline work |
| PC-LDG-009 | Worker compatibility should be explicit before deploy workflows are touched. | Before next Worker dry-run/deploy |
| PC-LDG-011 | Preview/runtime SVG distinction should be codified near code. | Before SVG template edits |
| PC-LDG-012 | NSFW policy documentation should stop implying modal removal. | Before policy/docs cleanup |
| PC-LDG-007 | Freeplay label ambiguity is real but trigger changes are prohibited. | Before mode page/UI copy cleanup |

---

## 6. Defer

| Finding ID | Reason | Exit Condition |
|---|---|---|
| PC-LDG-013 | `cardDeal` / cinematic config drift is low runtime risk and belongs with docs/hygiene cleanup. | Next cinematic intro maintenance pass |
| PC-LDG-014 | Broken source comments have low user impact despite easy fix. | Include in opportunistic hygiene PR |
| PC-LDG-D01 | Works strategy depends on Creator portfolio URL/timeline. | Creator portfolio target exists or next public release approaches |
| PC-LDG-D02 | Full Scene Codes public UI may overexpose implementation details. | Dedicated image catalog/reference page is planned |
| PC-LDG-D03 | Mode-card CTA expansion needs data. | Navbar Play data/referrer decision complete |
| PC-LDG-D04 | CharDetail CTA expansion needs direct-entry evidence or moderator override. | SEO/OG/direct sharing audit shows material direct entry |

---

## 7. Reject or Archive

| Finding ID | Reason |
|---|---|
| PC-LDG-R01 | Do not add duplicated appearance fields to `characters.js`; latest appearance source is `docs/prompts/json/*`. |
| PC-LDG-R02 | Do not rewrite historical Updates counts. Add context only when touching the file for current-state work. |
| PC-LDG-R03 | Do not rename prompt JSON body `trigger` keys. |
| PC-LDG-R04 | Do not force site preview and Worker `data:` behavior to match. |
| PC-LDG-R05 | Do not remove Gallery NSFW modal as a default action. |
| PC-LDG-R06 | Do not expand Works internally as a portfolio hub; long-term direction is separate Creator portfolio. |

---

## 8. Ordered Implementation Tickets

### 1. PC-R4-003 — Build CI Workflow

**Finding:** `PC-LDG-004`  
**Files:** `.github/workflows/build.yml`, repo branch protection, `docs/ai-council/DECISION_LOG.md`  
**Effort:** Small  
**Acceptance:** Build workflow runs `npm ci --prefer-offline` and `npm run build`; branch protection requires the check.

### 2. PC-R4-001 — CEO Card Released-State Correction

**Finding:** `PC-LDG-001`  
**Files:** `src/data/gamemodes.js`, `src/components/GameModes.jsx`, default `src/pages/ModeCeo.jsx`, `src/App.jsx`  
**Effort:** Medium  
**Acceptance:** No null link; CEO is represented as launched; build passes.

### 3. PC-R4-002 — Navbar Play Redirect

**Finding:** `PC-LDG-002`  
**Files:** `src/data/links.js` or `src/utils/links.js`, `src/components/HeroSlider.jsx`, `src/components/Navbar.jsx`  
**Effort:** Small  
**Acceptance:** Raw EdenChat player URL appears only in canonical URL module; desktop/mobile Navbar has external Play.

### 4. PC-R4-005 — Image Count Surface Audit

**Finding:** `PC-LDG-003`  
**Files:** `tools/audit_image_count_surfaces.ps1` or equivalent; optionally R2 sync script/checklist  
**Effort:** Medium  
**Acceptance:** Audit prints candidate count/current-asset surfaces; prompt JSON is not modified.

### 5. PC-R4-004 — Documentation Baseline Refresh

**Finding:** `PC-LDG-005`  
**Files:** `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`, `docs/ai-council/01_SESSION_BRIEF.md`, `docs/ai-council/02_REPO_BASELINE.md`  
**Effort:** Medium  
**Acceptance:** Current-state facts match final plan; each number has `as of` context; historical logs preserved.

### 6. PC-R4-006 — Prompt Trigger Protection

**Finding:** `PC-LDG-010`  
**Files:** `docs/prompts/json/README_DO_NOT_TOUCH.md`, `tools/audit_trigger_keys.ps1`  
**Effort:** Small  
**Acceptance:** Trigger audit output states audit-only; no prompt body edit.

### 7. PC-R4-007 — EdenChat Clipboard Lazy Import

**Finding:** `PC-LDG-006`  
**Files:** `tools/edenchat_clipboard.py`  
**Effort:** Small  
**Acceptance:** `--list` runs without GUI dependencies and reports 207 non-combined entries.

### 8. PC-R4-008 — Legacy Image Tool Guard

**Finding:** `PC-LDG-008`  
**Files:** `tools/extract_char_prompts.py` or `tools/LEGACY/`  
**Effort:** Small  
**Acceptance:** Tool cannot run accidentally without explicit legacy flag.

### 9. PC-R4-009 — Worker Compatibility Cleanup

**Finding:** `PC-LDG-009`  
**Files:** `workers/deploy/deploy.sh`, optional docs note  
**Effort:** Small  
**Acceptance:** Compatibility date is variable or documented; dry-run rule remains explicit.

---

## 9. Required Verification Commands

Run these before marking Round 4 execution complete.

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

---

## 10. Round 4 Completion Checklist

- [x] Final plan read
- [x] Accepted ledger entries scored
- [x] Multipliers applied
- [x] Band assignments made
- [x] Implementation tickets created for Do Now / near-term Plan Soon items
- [ ] Moderator confirms final band assignments
- [ ] `docs/ai-council/DECISION_LOG.md` Round 4 closure entry recorded

Suggested closure entry:

```markdown
| Round | Opened | Closed | Closer |
|---|---|---|---|
| 4 | 2026-04-25 | 2026-04-25 | Moderator |
```

---

## 11. Final Ruling

The AI Council improvement process should proceed to implementation only after moderator closure is recorded. The first implementation PR must be Build CI. After that, CEO card correction and Navbar Play can proceed in parallel. Documentation refresh must wait until those source-facing corrections settle, otherwise the docs will immediately stale again.

Prompt JSON body edits remain prohibited. Gallery NSFW modal removal remains rejected. Works expansion remains deferred until the separate Creator portfolio direction has a concrete URL or release trigger.
