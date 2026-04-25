# Prime City Final Improvement Plan

> Source: `docs/ai-council/ISSUE_LEDGER_round3_reviewed.md` + inline review notes  
> 작성 기준일: 2026-04-25 KST  
> 상태: Final draft for moderator approval  
> 원칙: 이 문서는 실행 계획이다. Production code, prompt JSON, 기존 핵심 문서는 별도 승인과 티켓 분리 전 수정하지 않는다.

---

## 1. Executive Summary

Round 1-3 검토와 inline review notes를 반영한 최종 개선 방향은 “새 기능 확장”보다 **출시된 상태와 사이트/문서/검증 체계를 정확히 맞추는 것**이다. CEO 모드는 이미 출시되고 로어북도 등록되어 있으나 사이트 카드에는 `detailPath: null`이 남아 있다. EdenChat 진입은 Hero에만 고정되어 있고, 빌드 검증은 로컬 습관에 의존한다. 이 두 문제는 사용자 경험과 배포 안정성에 직접 영향을 준다.

최종 원칙은 다음 네 가지다.

1. **출시 상태를 정확히 반영한다.** CEO 카드, 로어북 수, cinematic intro 상태, sign 이미지 수, `ASSET_VERSION` 등 현재 코드와 운영 상태를 문서와 UI에 맞춘다.
2. **전환 동선은 측정 가능한 기준으로 절제한다.** 우선 Navbar Play만 추가한다. CharDetail/GameModes CTA 추가는 정량 신호, 정성 신호, 또는 moderator override가 있을 때만 허용한다.
3. **소개 사이트의 surface 지위를 고정 사실로 보지 않는다.** 현재는 EdenChat 작품 페이지가 1차 surface지만, SNS/검색/Creator 포트폴리오/외부 인용에서는 `intro.bluehair.blue`가 즉시 1차 surface가 된다.
4. **검증 자동화를 먼저 세운다.** Build CI, 로어북 207 non-combined audit, 이미지 수치 surface audit, Worker dry-run 규칙을 통해 다음 변경의 회귀 비용을 낮춘다.

본 계획에서 채택하지 않는 작업은 명확하다. Prompt JSON 본문 자동 수정, `characters.js` 외형 필드 추가, Gallery NSFW 모달 제거, Works 내부 포트폴리오 확장, preview/Worker 강제 parity는 실행하지 않는다.

### CTA Restraint Rule

새 CTA를 추가하려면 PR 본문에 아래 중 하나를 명시해야 한다.

- 정량 신호: Navbar Play 클릭률, route별 referrer, EdenChat 플랫폼 분석 등 출처가 있는 수치.
- 정성 신호: 사용자 인터뷰 또는 운영 피드백 최소 3건.
- Moderator override: 데이터 없이도 추가해야 하는 명시적 사유.

데이터 출처가 없는 CTA 추가는 기본적으로 보류한다.

---

## 2. Non-Negotiable Constraints

- `docs/prompts/json/**` 본문은 함부로 수정하지 않는다.
- 로어북 운영 기준은 **207개 non-combined**이다.
- `AGENTS.md`는 canonical 표지판으로 유지한다. 세부 분석과 계획은 별도 파이프라인 문서에 둔다.
- `intro.bluehair.blue`는 현재 2차 surface지만, 직접 유입 시 1차 surface가 될 수 있다. 따라서 SEO/OG와 Play 접근성은 최소 기준을 만족해야 한다.
- 이미지 원천은 `연예계/char_img/*`와 Cloudflare R2 `prime` 버킷이다.
- Worker 검증은 실제 배포 전 항상 dry-run 또는 localhost 검증을 우선한다.
- Round closure가 `DECISION_LOG.md`에 기록되기 전에는 production code와 기존 핵심 문서를 편집하지 않는다.

### Round Closure Gate

문서 갱신과 구현 티켓 실행은 `docs/ai-council/DECISION_LOG.md`에 아래 형식으로 Round 4 종료가 기록된 뒤 시작한다.

```markdown
| Round | Opened | Closed | Closer |
|---|---|---|---|
| 4 | 2026-04-25 | 2026-04-25 | Moderator |
```

---

## 3. Accepted Findings

| Ledger ID | Priority | Status | Title | Final Decision |
|---|---:|---|---|---|
| PC-LDG-001 | P0 | Accept - Adjusted | CEO 모드 카드 `detailPath: null` | 기본 경로는 `/modes/ceo` 최소 페이지다. 시간이 부족한 경우에만 비클릭 정보 카드 + Navbar Play 유도로 축소한다. |
| PC-LDG-002 | P1 | Accept - Adjusted | EdenChat 진입 동선 부족 | Navbar desktop/mobile Play 리다이렉트를 우선 추가한다. 외부 링크임을 시각/ARIA로 명확히 표시한다. |
| PC-LDG-003 | P1 | Accept - Adjusted | 이미지 카탈로그 수치 불일치 | R2 업로드/이미지 sync 흐름 뒤에 이미지 카운트 surface audit을 붙인다. Prompt JSON은 자동 수정하지 않는다. |
| PC-LDG-004 | P1 | Accept | Build CI 부재 | GitHub Actions build workflow와 branch protection required check를 추가한다. |
| PC-LDG-005 | P1 | Accept - Adjusted | 핵심 문서 stale 정보 | Round 4 closure 직후 baseline 문서를 현재 코드 기준으로 갱신한다. 각 숫자는 `as of YYYY-MM-DD`를 붙인다. |
| PC-LDG-006 | P2 | Accept - Adjusted | EdenChat clipboard 실행성 | `--list`는 GUI deps 없이 동작해야 하며 207개 기준을 출력해야 한다. |
| PC-LDG-007 | P2 | Accept - Adjusted | `프리플레이` 명칭 혼동 | 사이트 UI 라벨을 정리하고, 봇 응답 첫 줄 disambiguation은 moderator-controlled prompt update 후보로 분리한다. |
| PC-LDG-008 | P2 | Accept | 레거시 이미지 경로 도구 | `extract_char_prompts.py`를 legacy 처리하거나 `--allow-legacy` 가드를 추가한다. |
| PC-LDG-009 | P2 | Accept | Worker compatibility date | compatibility date를 변수화하거나 차이의 이유를 코드/문서에 명시한다. |
| PC-LDG-010 | P2 | Transform | prompt JSON 본문 `trigger` | 데이터 변경은 금지한다. Audit-only wrapper와 README guard로 오인 수정을 막는다. |
| PC-LDG-011 | P2 | Transform | SVG preview/Worker 비대칭 | 강제 parity는 하지 않는다. 코드 옆 짧은 주석으로 “preview-only / Worker canonical runtime”을 명시한다. |
| PC-LDG-012 | P2 | Accept - Adjusted | NSFW Gallery 정책 문서 | Gallery 모달은 유지 가능하다. 문서의 오래된 “제거 필요” 해석을 정정한다. |
| PC-LDG-013 | P3 | Accept - Adjusted | cinematic 문서/config drift | `cardDeal`은 제거 또는 `reserved / unused`로 명확히 표시한다. |
| PC-LDG-014 | P3 | Accept | 깨진 주석 문자 | `�` 주석만 교정하고 검증 검색을 추가한다. |

---

## 4. Deferred and Rejected Findings

### Deferred

| Ledger ID | Title | Exit Condition | Re-evaluate |
|---|---|---|---|
| PC-LDG-D01 | Works 페이지 placeholder | Creator 포트폴리오 URL 확정 또는 다음 공개 release 전 `/works` 노출 지속 여부 결정 | URL 미확정 상태가 다음 release까지 지속되면 nav/TriangleNav에서 Works 숨김 또는 relabel 검토 |
| PC-LDG-D02 | Scene Codes 전체 공개 | 이미지 카탈로그를 팬덤/레퍼런스 페이지로 확장하기로 결정 | 별도 카탈로그 페이지 기획 시 |
| PC-LDG-D03 | 모드 카드별 챗봇 CTA | Navbar Play 적용 후 route/referrer 또는 사용자 피드백 확보 | 1분기 또는 첫 데이터 리뷰 후 |
| PC-LDG-D04 | CharDetail별 “이 캐릭터로 시작” CTA | CharDetail 직접 유입이 의미 있는 비중으로 확인되거나 moderator override 발생 | SEO/OG audit 및 링크 공유 데이터 확인 후 |

### Rejected

| Ledger ID | Title | Reason |
|---|---|---|
| PC-LDG-R01 | `characters.js` 외형 필드 추가 | 최신 외형 정보는 `docs/prompts/json/*`가 기준이다. 중복 필드는 drift를 만든다. |
| PC-LDG-R02 | Updates 과거 수치 정정 | 과거 로그는 historical record로 보존한다. 단, 향후 Updates를 수정할 때 `(당시 N명)` 또는 현재 상태 header를 추가하는 것은 허용한다. |
| PC-LDG-R03 | prompt JSON 본문 `trigger` rename | Moderator가 절대 수정 금지로 정리했다. |
| PC-LDG-R04 | preview/Worker `data:` 정책 강제 동기화 | Worker가 실제 runtime이고 preview는 구조 확인용이다. |
| PC-LDG-R05 | Gallery NSFW 모달 제거 | 현재 18+ 확인 팝업은 유지 가능하다. |
| PC-LDG-R06 | Works 내부 라인업/디테일 확장 | 장기 방향은 별도 Creator 포트폴리오다. |

---

## 5. Roadmap

### Phase 0 - Immediate Correctness

1. **CEO card released-state correction**
   - Ledger: `PC-LDG-001`
   - Files: `src/data/gamemodes.js`, `src/components/GameModes.jsx`, `src/pages/ModeCeo.jsx`, `src/App.jsx`
   - Default: create minimal `/modes/ceo` page.
   - Fallback: if implementation time is under 30 minutes, use non-click info card with `출시됨`, `!대표모드`, key characters, and Navbar Play guidance.
   - Do not merge: if neither default nor fallback can be done safely.

2. **Mode trigger audit**
   - Ledger: `PC-LDG-001`
   - Files: create `tools/audit_mode_triggers.py`
   - Rule: read-only only. It compares site-advertised mode triggers with mode lorebook trigger strings and never edits prompt JSON.

### Phase 1 - Conversion and Build Gate

1. **EdenChat URL constant + Navbar Play**
   - Ledger: `PC-LDG-002`
   - Files: `src/data/links.js` or `src/utils/links.js`, `src/components/Navbar.jsx`, `src/components/HeroSlider.jsx`
   - External identity:
     - Use `<a>` for external EdenChat links, not React Router `<Link>`.
     - Add `target="_blank"` and `rel="noopener noreferrer"` unless moderator explicitly wants same-tab navigation.
     - Add `aria-label="플레이 (외부 링크)"`.
     - Add a small visible external/action cue such as `↗` or `▶`.
   - Acceptance:
     - The raw EdenChat player URL appears only in the canonical link file.
     - HeroSlider and Navbar consume the exported constant.

2. **Referrer/query decision check**
   - Ledger: `PC-LDG-D03`, `PC-LDG-D04`, `PC-OPEN-002`
   - Goal: determine whether future CTA decisions can be data-driven.
   - Decision tree:
     - If EdenChat preserves referrer, use pure player URL and route/referrer data.
     - If referrer is not preserved, test lightweight query markers such as `?ref=intro-navbar`.
     - If query markers are stripped or ignored, record that future CTA expansion is moderator/qualitative decision only.

3. **Build CI**
   - Ledger: `PC-LDG-004`
   - Files: `.github/workflows/build.yml`
   - CI policy:
     - Pin Node to a documented version. Use `22.11.0` unless Cloudflare Pages project settings require another version.
     - Use `actions/setup-node@v4` with `cache: npm`.
     - Do **not** add `node_modules` cache with `npm ci`; `npm ci` removes `node_modules`, so that cache is low value and can create confusion.
     - Add branch protection: `Build / build` must be a required check before merging to `main`.

```yaml
name: Build
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22.11.0"
          cache: npm
      - run: npm ci --prefer-offline
      - run: npm run build
```

### Phase 2 - Documentation and Sync Baseline

1. **Documentation baseline refresh**
   - Ledger: `PC-LDG-005`
   - Files: `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`, `docs/ai-council/01_SESSION_BRIEF.md`, `docs/ai-council/02_REPO_BASELINE.md`
   - Trigger: Round 4 closure in `DECISION_LOG.md`.
   - Canonical facts as of 2026-04-25:
     - Characters: 20
     - Lorebooks: 207 non-combined
     - `ASSET_VERSION`: 28
     - Cinematic registry: 12
     - Sign images: 20
     - Messenger domain: `talk.bluehair.blue`
   - Each numeric fact must include `as of 2026-04-25` or equivalent context.
   - Historical timeline values remain historical and are not overwritten.

2. **Image count surface audit**
   - Ledger: `PC-LDG-003`
   - Files to monitor initially:
     - `docs/프라임시티 소개페이지.txt`
     - `src/pages/Gallery.jsx`
     - `src/components/ImageSystemInfo.jsx`
     - `workers/svg-tablet.js`
     - `AGENTS.md`
     - `CLAUDE.md`
     - latest/current-state portions of `src/pages/Updates.jsx`
   - Rule:
     - Audit discovers count surfaces.
     - Human classifies each result as `current`, `historical`, or `ignore`.
     - Prompt JSON is never auto-edited.
   - Execution timing:
     - Trigger audit at the end of R2 upload/sync workflows where practical.
     - If not connected to upload scripts yet, require manual execution in image update checklist.

3. **SEO/OG light audit**
   - Ledger: critique of surface assumption
   - Files: `src/components/Seo.jsx`, route pages using `Seo`
   - Goal: direct route sharing should have adequate title/description/OG metadata.
   - SPA note: plain `curl` may not see client-rendered Helmet output. Use browser-rendered DOM via local preview or Playwright-style inspection.
   - Acceptance:
     - Main routes have title, description, canonical URL, `og:title`, `og:description`, `og:url`.
     - `og:image` absence is recorded as a separate design decision.

### Phase 3 - Operational Stabilization

1. **EdenChat clipboard lazy import**
   - Ledger: `PC-LDG-006`
   - File: `tools/edenchat_clipboard.py`
   - Acceptance:
     - `--list` runs without `pyperclip`/`pyautogui`.
     - Output explicitly says `207 non-combined`.

2. **Legacy image prompt extraction guard**
   - Ledger: `PC-LDG-008`
   - File: `tools/extract_char_prompts.py`
   - Acceptance:
     - Default execution fails with a clear message.
     - Legacy execution requires `--allow-legacy`.

3. **Worker compatibility cleanup**
   - Ledger: `PC-LDG-009`
   - File: `workers/deploy/deploy.sh`
   - Acceptance:
     - compatibility date is a top-level variable or documented exception.
     - dry-run/localhost validation is documented before any real deploy.

4. **Prompt trigger protection**
   - Ledger: `PC-LDG-010`
   - Files:
     - create `docs/prompts/json/README_DO_NOT_TOUCH.md`
     - create `tools/audit_trigger_keys.ps1` or equivalent wrapper
   - Acceptance:
     - Audit output prints a clear “AUDIT ONLY - DO NOT MODIFY” warning.
     - Direct `rg '"trigger"'` command is not presented as a fix list.

5. **SVG preview/runtime guard comments**
   - Ledger: `PC-LDG-011`
   - Files: `src/data/svgTemplates/helpers.js`, `src/data/svgTemplates.js`, representative `workers/svg-*.js`
   - Acceptance:
     - Short code comments state that site preview is preview-only and Worker is canonical runtime.

### Phase 4 - Low-Risk UX and Hygiene

1. **Freeplay label disambiguation**
   - Ledger: `PC-LDG-007`
   - Files: `src/data/gamemodes.js`, `src/components/GameModes.jsx`
   - Acceptance:
     - Site UI distinguishes main Free Play from `!프리플레이` custom/user-note overlay.
     - Prompt/platform disambiguation is listed as moderator-controlled update, not automatic code edit.

2. **NSFW policy documentation cleanup**
   - Ledger: `PC-LDG-012`
   - Acceptance:
     - Gallery 18+ modal is not removed.
     - Docs no longer imply it must be removed as stale launch-only behavior.

3. **Cinematic config cleanup**
   - Ledger: `PC-LDG-013`
   - Acceptance:
     - `cardDeal` is removed or marked `reserved / unused`.
     - Source implementation is documented as canonical.

4. **Encoding hygiene**
   - Ledger: `PC-LDG-014`
   - Acceptance:
     - `rg -n '�' AGENTS.md CLAUDE.md docs src workers tools` returns no unreviewed source comments.

5. **Updates historical clarity**
   - Ledger: `PC-LDG-R02` refinement
   - Acceptance:
     - Do not rewrite historical counts.
     - If `Updates.jsx` is touched for current-state work, add `(당시 N명)` or a current-state header to reduce ambiguity.

---

## 6. Implementation Tickets

### Ticket PC-R4-001 - CEO Card Released-State Correction

**Priority:** P0  
**Ledger:** `PC-LDG-001`  
**Goal:** CEO card must not render as a null link or unreleased feature.

**Files:**
- Modify: `src/data/gamemodes.js`
- Modify: `src/components/GameModes.jsx`
- Default create: `src/pages/ModeCeo.jsx`
- Default modify: `src/App.jsx`
- Optional create: `tools/audit_mode_triggers.py`

**Decision tree:**

```markdown
if available time >= 2h:
  create ModeCeo.jsx + /modes/ceo route + accurate CEO briefing
elif available time >= 30min:
  render CEO as non-click info card with "출시됨", "!대표모드", key chars, and Navbar Play guidance
else:
  do not merge; remove or hide the broken card in a separate emergency PR
```

**Steps:**

- [ ] Verify current CEO source with `rg -n 'id: "ceo"|detailPath: null|/modes/ceo|ModeCeo' src`.
- [ ] Implement the selected branch from the decision tree.
- [ ] Add read-only trigger audit if time allows.
- [ ] Run `npm.cmd run build`.
- [ ] Browser-check CEO card behavior.

**Acceptance:**

- `rg -n 'detailPath: null|to=\{null\}|to=\{cm.detailPath\}' src/components src/data` shows no unsafe CEO null-link path.
- CEO mode is represented as launched, not as “coming soon”.
- Build passes.

### Ticket PC-R4-002 - Navbar Play Redirect

**Priority:** P1  
**Ledger:** `PC-LDG-002`  
**Goal:** Add an always-accessible EdenChat player link without CTA clutter.

**Files:**
- Create: `src/data/links.js` or `src/utils/links.js`
- Modify: `src/components/HeroSlider.jsx`
- Modify: `src/components/Navbar.jsx`

**Canonical URL rule:**

```js
export const EDENCHAT_PLAYER_URL =
  "https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f";
```

The raw `https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f` string should appear only in the canonical URL module.

**Steps:**

- [ ] Create the canonical URL module.
- [ ] Replace HeroSlider hardcoded URL with the exported constant.
- [ ] Add desktop Navbar Play external link with visible external/action cue.
- [ ] Add mobile Navbar Play external link with the same behavior.
- [ ] Run `npm.cmd run build`.
- [ ] Check desktop and mobile navigation manually.

**Acceptance:**

- `rg -n 'https://www\.eden-chat\.com/works/35e68463' src` returns exactly one source location: the canonical URL module.
- `rg -n 'EDENCHAT_PLAYER_URL' src` shows HeroSlider and Navbar usage.
- Play link is visually distinct from internal routes.

### Ticket PC-R4-003 - Build CI Workflow

**Priority:** P1  
**Ledger:** `PC-LDG-004`  
**Goal:** Build must run before PR/main changes are accepted.

**Files:**
- Create: `.github/workflows/build.yml`
- Repo settings: branch protection on `main`

**Steps:**

- [ ] Add Build workflow using Node `22.11.0` unless Cloudflare Pages requires a different pinned version.
- [ ] Use `npm ci --prefer-offline`.
- [ ] Use `npm run build`.
- [ ] Configure branch protection so the Build check is required.
- [ ] Record branch protection setup in `DECISION_LOG.md`.

**Acceptance:**

- GitHub Actions shows Build status on PR.
- Branch protection requires Build before merge.
- Local `npm.cmd run build` passes.

### Ticket PC-R4-004 - Documentation Baseline Refresh

**Priority:** P1  
**Ledger:** `PC-LDG-005`
**Goal:** New agents must not start from stale counts or stale intro status.

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `docs/CODEBASE_MAP.md`
- Modify: `docs/ai-council/01_SESSION_BRIEF.md`
- Modify: `docs/ai-council/02_REPO_BASELINE.md`

**Steps:**

- [ ] Confirm Round 4 is closed in `DECISION_LOG.md`.
- [ ] Re-run source fact commands in §8.
- [ ] Update current-state facts with `as of 2026-04-25`.
- [ ] Preserve historical timeline counts.
- [ ] Run stale-pattern search after edits.

**Acceptance:**

- Current-state docs match 20 / 207 / 28 / 12 / 20 / `talk.bluehair.blue`.
- Historical records remain historical.

### Ticket PC-R4-005 - Image Count Surface Audit

**Priority:** P1  
**Ledger:** `PC-LDG-003`
**Goal:** Image count changes must surface every file that may need review.

**Files:**
- Create: `tools/audit_image_count_surfaces.ps1` or equivalent
- Optionally modify: R2 sync script to call audit after upload

**Steps:**

- [ ] Implement a read-only count surface audit.
- [ ] Classify findings as current/historical/ignore.
- [ ] Add the audit to the image update checklist.
- [ ] If safe, call the audit at the end of existing R2 upload/sync workflow.

**Acceptance:**

- Running the audit prints candidate files containing image count/current asset facts.
- Prompt JSON is not modified.

### Ticket PC-R4-006 - Prompt Trigger Protection

**Priority:** P2  
**Ledger:** `PC-LDG-010`
**Goal:** Prevent future contributors from “fixing” narrative `trigger` keys.

**Files:**
- Create: `docs/prompts/json/README_DO_NOT_TOUCH.md`
- Create: `tools/audit_trigger_keys.ps1`

**Steps:**

- [ ] Add a short README explaining that JSON body `trigger` keys are protected and must not be renamed.
- [ ] Add audit wrapper that prints guard text before and after search output.
- [ ] Reference wrapper in docs instead of raw `rg`.

**Acceptance:**

- Audit output itself says “AUDIT ONLY - DO NOT MODIFY”.
- No prompt JSON body is changed.

---

## 7. Execution DAG

```mermaid
graph TD
  CI["PC-R4-003 Build CI"] -.gates.-> CEO["PC-R4-001 CEO Card"]
  CI -.gates.-> PLAY["PC-R4-002 Navbar Play"]
  CI -.gates.-> IMG["PC-R4-005 Image Count Audit"]
  CI -.gates.-> CLIP["PC-LDG-006 Clipboard Lazy Import"]

  CEO --> DOCS["PC-R4-004 Documentation Baseline"]
  PLAY --> DATA["PC-OPEN-002 Referrer/Query Decision"]
  IMG --> DOCS

  LEGACY["PC-LDG-008 Legacy Guard"] -.independent.-> MERGE["Merge when verified"]
  WORKER["PC-LDG-009 Worker Compat"] -.independent.-> MERGE
  ENCODING["PC-LDG-014 Encoding Hygiene"] -.independent.-> MERGE
  TRIGGER["PC-R4-006 Trigger Protection"] -.independent.-> MERGE
```

Recommended PR batches:

1. **First PR:** Build CI. This creates the gate for later PRs.
2. **Parallel PR set 1:** CEO card, Navbar Play, Image Count Audit, legacy guard, Worker compatibility, trigger protection, encoding hygiene.
3. **PR set 2:** Documentation baseline refresh after source-affecting PRs stabilize.
4. **Data-dependent track:** Referrer/query decision, then revisit GameModes/CharDetail CTA defers.

---

## 8. Verification Commands

### Source Facts

```powershell
# characters
(Select-String -LiteralPath src\data\characters.js -Pattern '^\s+id: "').Count

# lorebooks, excluding _combined
Get-ChildItem docs\prompts\json -Recurse -File -Filter *.json |
  Where-Object { $_.FullName -notmatch '\\_combined\\' } |
  Measure-Object

# asset version
Select-String -Path src\utils\cdn.js -Pattern 'ASSET_VERSION'

# cinematic registry
Get-Content -Encoding UTF8 src\components\cinematic\index.js
```

### Issue Checks

```powershell
# CEO null-link and route
rg -n 'id: "ceo"|detailPath: null|to=\{null\}|to=\{cm.detailPath\}|/modes/ceo|ModeCeo' src

# EdenChat direct URL must be centralized
rg -n 'https://www\.eden-chat\.com/works/35e68463|EDENCHAT_PLAYER_URL' src

# image count/current asset surfaces
rg -n '102장|75 per character|2,000장|1,900장|1631|1632|ASSET_VERSION' src docs workers AGENTS.md CLAUDE.md

# legacy image path
rg -n '_OLD_DO_NOT_USE|extract_char_prompts' tools docs

# worker compatibility
rg -n 'compatibility_date|compatibility-date' wrangler.jsonc workers

# encoding hygiene
rg -n '�' AGENTS.md CLAUDE.md docs src workers tools
```

### Prompt Trigger Audit Wrapper

Do not run raw `rg '"trigger"'` as a fix list. Use a wrapper that prints guard text:

```powershell
Write-Host "════════════════════════════════════════════════════"
Write-Host "AUDIT ONLY - DO NOT MODIFY THESE LINES (MOD-3)"
Write-Host "These 'trigger' keys may be narrative conditions, not platform triggers."
Write-Host "Renaming them can force re-insertion of 207 lorebooks."
Write-Host "════════════════════════════════════════════════════"
rg -n '"trigger"\s*:' docs\prompts\json
Write-Host "════════════════════════════════════════════════════"
Write-Host "AUDIT ONLY. If you intend to edit these, stop and escalate."
Write-Host "════════════════════════════════════════════════════"
```

### Build

```powershell
npm.cmd run build
```

Use `npm.cmd` on PowerShell if execution policy blocks `npm.ps1`.

---

## 9. Decision Timing

| Decision | Trigger Event | Re-evaluate After |
|---|---|---|
| CharDetail/GameModes CTA expansion | Navbar Play merged and referrer/query decision complete | 1분기 or first meaningful traffic review |
| Works defer | Creator portfolio URL exists or next public release approaches | Before next release |
| Prompt disambiguation for `!프리플레이` | Moderator approves prompt/platform update cycle | Next lorebook maintenance window |
| `og:image` support | SEO/OG audit finds missing preview quality | Next frontend polish sprint |
| Worker compatibility unification | `wrangler.jsonc` date changes or Worker dry-run fails | Immediately after infra change |

---

## 10. Ownership Matrix

| Area | Primary Owner | Secondary | Moderator Escalation |
|---|---|---|---|
| CEO card and mode pages | Site maintainer | Frontend reviewer | If `/modes/ceo` scope exceeds minimum briefing |
| Navbar Play / CTA policy | Site maintainer | UX reviewer | Any additional CTA beyond Navbar |
| Build CI / branch protection | Repo admin | Site maintainer | If branch protection blocks emergency hotfix |
| Lorebook / prompt JSON | Runtime maintainer | Moderator | Any JSON body edit |
| Image count sync | Runtime maintainer | Docs maintainer | If R2/local counts disagree |
| Worker deploy | Infra maintainer | Runtime maintainer | Any real deploy |
| Documentation baseline | Docs maintainer | Site maintainer | Any canonical fact conflict |

---

## 11. Numerical Acceptance

| Item | Command | Expected as of 2026-04-25 |
|---|---|---|
| Character count | `(Select-String -LiteralPath src\data\characters.js -Pattern '^\s+id: "').Count` | `20` |
| Lorebook count | non-combined `Get-ChildItem` command in §8 | `207` |
| Asset version | `Select-String -Path src\utils\cdn.js -Pattern 'ASSET_VERSION'` | `28` |
| Cinematic registry | inspect `src/components/cinematic/index.js` | `12 registered styles` |
| Messenger domain | `rg -n 'talk.bluehair.blue|msg.bluehair.blue' src docs workers` | current domain is `talk.bluehair.blue` |
| Build | `npm.cmd run build` | exit code `0` |

---

## 12. Rollback Hints

| Acceptance | Owner | Re-check Cadence | Rollback Hint |
|---|---|---|---|
| CEO card has no null link | Site maintainer | Before release / quarterly | Revert CEO PR or temporarily remove CEO from rendered card list with DECISION_LOG entry |
| Navbar Play exists | Site maintainer | Before release | Revert Navbar Play PR; keep Hero URL as fallback |
| Build CI required | Repo admin | Weekly until stable | Temporarily unrequire check only with DECISION_LOG reason |
| Docs match 20/207/28/12 | Docs maintainer | On character/lorebook/asset changes | Revert doc commit or mark fact as `as of` historical |
| Image count audit works | Runtime maintainer | After image upload/sync | Fall back to manual checklist |
| `edenchat_clipboard.py --list` works | Runtime maintainer | Before any re-insertion cycle | Use prior release tag script only if recorded |
| Legacy tool guarded | Tools maintainer | Quarterly | Guard bypass only with explicit `--allow-legacy` |
| Worker compatibility clear | Infra maintainer | On wrangler changes | Revert deploy script variable change |
| Prompt JSON protected | Moderator | Before release and ad hoc | Immediate revert and DECISION_LOG regression entry |

If any Definition of Done item regresses, add this line to `docs/ai-council/DECISION_LOG.md` within one working day:

```markdown
Regression: <item> @ <sha> @ <date> — owner: <name> — next action: <action>
```

---

## 13. Definition of Done

The plan is complete when all of the following are true:

- CEO card no longer creates a null link and represents released state accurately.
- Desktop/mobile Navbar has a clearly external Play link.
- Build CI runs `npm ci && npm run build` and is required before merge.
- Current-state docs are updated with `as of` context for 20 characters, 207 non-combined lorebooks, `ASSET_VERSION=28`, 12 cinematic styles, 20 sign images, and `talk.bluehair.blue`.
- Image count surface audit exists and is tied to upload/sync workflow or checklist.
- `tools/edenchat_clipboard.py --list` runs without GUI dependencies and reports 207 non-combined entries.
- Legacy image prompt extraction cannot run accidentally.
- Worker compatibility date handling and dry-run discipline are explicit.
- Prompt JSON body fields and Gallery NSFW modal are not modified without moderator approval.
- Deferred CTA decisions have exit conditions and do not rely on undefined “future data.”
