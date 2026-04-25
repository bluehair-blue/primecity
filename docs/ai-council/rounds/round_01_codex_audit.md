# Round 1 — Codex Audit (Agent C)

> 역할: Implementation and Verification Reviewer  
> 작성일: 2026-04-25 KST  
> 원칙: 생산 코드 수정 없음. 증거와 추정을 분리하여 기록.

## Executive Summary

이번 감사는 `AGENTS.md`, `CLAUDE.md`, `package.json`, `docs/CODEBASE_MAP.md`, 요청된 `src/`, `workers/`, `tools/edenchat_clipboard.py`, `docs/prompts/json/` 구조를 기준으로 수행했다. 요청 목록의 `docs/CODEMAPS/*`는 실제 경로가 존재하지 않았다.

가장 큰 결론은 “서비스 빌드는 현재 통과하지만, 검증 체계가 자동화되어 있지 않다”이다. `npm.cmd run build`는 sandbox 밖에서 성공했고 Vite가 110개 모듈을 빌드했다. 반면 `package.json`에는 `test`/`lint` 스크립트가 없고, GitHub Actions는 Claude Code/Review만 실행하며 실제 `npm ci && npm run build`를 보장하지 않는다.

두 번째 핵심은 문서와 실제 코드의 시간 차이다. 실제 캐릭터는 20명이고 `ASSET_VERSION`은 28이며, non-combined 로어북 JSON은 207개다. 그러나 여러 문서는 15명/17명/31개/102개/103개/194개/ASSET_VERSION 11 같은 이전 상태를 동시에 말한다. 새 에이전트가 이 상태에서 작업하면 잘못된 기준으로 구현할 가능성이 높다.

세 번째 핵심은 에덴챗 및 SVG 파이프라인의 실행성이다. `tools/edenchat_clipboard.py`는 중요한 자동화 스크립트지만 현재 로컬 기본 `python` 명령이 없고, 번들 Python에도 `pyperclip`/`pyautogui`가 없어 `--list`조차 실행되지 않는다. 워커 배포 스크립트와 사이트/로어북 도메인은 대체로 맞지만, 코드맵에는 메신저 도메인이 `msg.bluehair.blue`로 남아 있어 배포 문서의 신뢰도를 낮춘다.

감사 중 생산 코드 변경은 하지 않았다. 다만 빌드 검증으로 `dist/`가 재생성될 수 있었다. 최종 검수 시점의 `git status --short`에는 이 감사 문서와 `docs/ai-council/rounds/round_01_claude_audit.md`가 modified로 보였는데, Claude 감사 문서는 본 Agent C가 편집하지 않았다. 기존 untracked 로그 파일들도 감사 전부터 존재했다.

## Top 10 Findings using Finding Card format

## Finding ID: PC-C-001

### Area

Build / CI / Release gate

### Claim

현재 저장소에는 “빌드가 통과해야 변경이 안전하다”는 규칙이 문서에는 있지만, CI나 npm 스크립트 레벨에서 이를 강제하는 장치가 없다.

### Evidence

증거:

- `package.json:6-10`에는 `dev`, `build`, `preview`, `deploy`만 있고 `test`/`lint`가 없다.
- `.github/workflows/claude-code-review.yml:34-41`은 Claude Code Review 액션만 실행한다.
- `.github/workflows/claude.yml:33-41`도 Claude Code 액션과 `actions: read` 권한만 설정한다.
- `npm.cmd run build`는 sandbox 밖에서 성공했다. 출력 요약: `vite v6.4.2`, `110 modules transformed`, `✓ built in 672ms`.

추정/리스크:

- PR 또는 main push에서 실제 Vite 빌드를 돌리지 않으면 라우트/번들/Cloudflare Pages 호환성 문제가 코드 리뷰만 통과하고 뒤늦게 발견될 수 있다.

### Impact

문서상 필수인 빌드 검증이 개인 로컬 습관에 의존한다. 특히 `src/data/characters.js`, `src/data/svgTemplates/*`, `workers/*`처럼 영향 범위가 넓은 변경에서 회귀 탐지가 늦어진다.

### Severity

High / P1

### Confidence

0.96

### Proposed Change

별도 CI 워크플로를 추가하여 최소한 아래를 강제한다.

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
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
```

추후 `lint`, JSON 검증, 워커 dry-run 검증을 추가한다.

### Counterargument

Cloudflare Pages가 배포 시 빌드를 수행한다면 중복 검증일 수 있다.

### What Would Disprove This

GitHub branch protection 또는 Cloudflare Pages check가 이미 PR 필수 상태 체크로 연결되어 있고, 실패 시 merge가 불가능하다는 설정 증거가 있으면 우선순위가 낮아진다.

## Finding ID: PC-C-002

### Area

EdenChat lorebook automation / Local runtime

### Claim

`tools/edenchat_clipboard.py`는 현재 로컬 기본 환경에서 실행 가능한 상태가 아니며, 문서의 삽입 대상 수(102/103개)와 실제 수집 대상 수(207개)가 맞지 않는다.

### Evidence

증거:

- `tools/edenchat_clipboard.py:2-5`는 PEP 723 스타일로 `pyperclip`, `pyautogui` 의존성을 선언한다.
- 같은 파일 `tools/edenchat_clipboard.py:45-57`에서 `pyperclip`/`pyautogui`를 최상단에서 즉시 import하므로 `--list`도 의존성 없이는 실패한다.
- `tools/edenchat_clipboard.py:187-211`은 `_combined`를 제외한 루트/캐릭터/모드/오디션/SVG/이미지 파일을 모두 수집하는 구조다.
- 실제 파일 수: `docs/prompts/json/` 전체 211개, `_combined` 제외 207개, `// --- TRIGGER ---` 마커도 207개.
- `AGENTS.md:441-453`은 103개/102개 삽입을 말한다.
- 실행 검증:

```powershell
python tools\edenchat_clipboard.py --list
# python: 'python' 용어가 인식되지 않음

C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\edenchat_clipboard.py --list
# pip install pyperclip 필요
```

추정/리스크:

- 현재 문서대로 재삽입하면 최신 207개 기준이 아니라 과거 102/103개 기준으로 운영자가 판단할 수 있다.

### Impact

에덴챗 플랫폼 삽입 재현성이 낮다. 목록 확인도 GUI 의존성에 막혀, 삽입 전 대상 수/순서/키워드 수를 검증하기 어렵다.

### Severity

High / P1

### Confidence

0.97

### Proposed Change

`--list`와 파싱 검증은 GUI 의존성 없이 실행되도록 import를 지연한다.

```python
def load_ui_deps():
    import pyperclip
    import pyautogui
    pyautogui.PAUSE = 0.05
    pyautogui.FAILSAFE = True
    return pyperclip, pyautogui
```

그리고 `requirements-edenchat.txt` 또는 `uv run --script tools/edenchat_clipboard.py --list` 사용법을 문서화한다. 출력에는 “총 207개 / `_combined` 제외”를 명시해야 한다.

### Counterargument

스크립트는 운영자 PC에서만 쓰는 반자동 매크로라 현재 Codex 런타임에서 실패해도 실제 운영에는 문제가 없을 수 있다.

### What Would Disprove This

운영자 PC에서 `python`, `pyperclip`, `pyautogui`가 이미 설치되어 있고, 최신 삽입 대상이 여전히 102/103개로 의도된 것이라는 확인이 있으면 우선순위가 낮아진다.

## Finding ID: PC-C-003

### Area

Lorebook schema / Prompt rules

### Claim

로어북 규칙은 JSON 본문 내 `trigger` 키를 금지하지만, 실제 non-combined JSON 207개 중 13개 위치에 `"trigger"` 키가 남아 있다.

### Evidence

증거:

- `AGENTS.md:233-235`는 “JSON 본문에 `trigger` 키 포함 금지, 파일 하단 `// --- TRIGGER ---` 주석으로 기록”을 규칙으로 둔다.
- 발견된 본문 `trigger` 예:
  - `docs/prompts/json/나하린_EN.json:30`
  - `docs/prompts/json/나하린_EN.json:42`
  - `docs/prompts/json/나하린_EN.json:54`
  - `docs/prompts/json/모드/선택지_EN.json:18`
  - `docs/prompts/json/오디션/2R_프로듀서픽_EN.json:15`
  - `docs/prompts/json/캐릭터/노아_트리거_EN.json:13`
  - `docs/prompts/json/캐릭터/시아_트리거_EN.json:13`
  - `docs/prompts/json/캐릭터/시아_노아_자매_EN.json:14`
- 전체 JSON 파싱 검증은 통과했다: `JSON validation PASS: 207 non-combined files`.
- `fav` 키는 non-combined JSON에서 발견되지 않았다.

추정/리스크:

- 일부 `trigger`는 플랫폼 트리거가 아니라 서사 조건 필드일 수 있다. 그렇더라도 규칙과 충돌하여 다음 에이전트가 삭제/유지 판단을 다르게 할 가능성이 있다.

### Impact

에덴챗 삽입 데이터의 스키마 일관성이 흔들린다. 특히 “트리거는 주석에서만 파싱한다”는 자동화 가정과 본문 조건 필드가 섞이면 검증 도구를 만들 때 예외가 늘어난다.

### Severity

Medium / P2

### Confidence

0.94

### Proposed Change

본문 내 서사 조건 필드는 `activation_condition`, `scene_condition`, `when` 등으로 이름을 바꾸거나, `trigger` 키 예외 목록을 문서화한다. 이후 검증 스크립트에서 다음 규칙을 강제한다.

```powershell
Get-ChildItem docs\prompts\json -Recurse -Filter *.json |
  Where-Object { $_.FullName -notmatch '\\_combined\\' } |
  Select-String -Pattern '"trigger"\s*:'
```

### Counterargument

본문 `trigger`는 플랫폼 트리거가 아니라 캐릭터 행동 조건을 설명하는 도메인 단어일 수 있다.

### What Would Disprove This

문서 규칙이 “플랫폼 트리거 키만 금지, 내부 서사 조건명 `trigger`는 허용”으로 정정되면 이 finding은 단순 문서 보완으로 낮아진다.

## Finding ID: PC-C-004

### Area

Frontend UX / Routing

### Claim

GameModes의 CEO 카드가 `detailPath: null`인 상태로 `<Link to={cm.detailPath}>`에 전달된다. 사용자가 클릭 가능한 카드로 인식하지만 실제 목적지가 없다.

### Evidence

증거:

- `src/data/gamemodes.js:103-111`에서 `ceo` 모드의 `detailPath`는 `null`이고 TODO가 남아 있다.
- `src/components/GameModes.jsx:271-275`는 모든 `careerModes`를 `<Link to={cm.detailPath}>`로 렌더한다.
- `src/App.jsx:61-68`에는 `/modes/ceo` 라우트가 없다.

관련 코드:

```jsx
// src/components/GameModes.jsx:271-275
{careerModes.map((cm, i) => (
  <Link
    key={cm.id}
    to={cm.detailPath}
```

추정/리스크:

- React Router가 `to={null}`을 현재 URL 또는 비정상 href로 처리할 수 있다. 빌드는 통과하지만 클릭 UX가 깨질 가능성이 높다.

### Impact

메인 페이지의 모드 전환 퍼널에서 “대표” 카드가 무의미한 클릭 지점이 된다. 사용자 입장에서는 미완성 기능처럼 보인다.

### Severity

High / P1

### Confidence

0.90

### Proposed Change

둘 중 하나로 결정한다.

```jsx
// 선택 A: 아직 미구현이면 Link 대신 disabled card
const isReady = Boolean(cm.detailPath);
return isReady ? <Link to={cm.detailPath}>...</Link> : <div aria-disabled="true">...</div>;
```

또는 `ModeCeo.jsx`와 `/modes/ceo` 라우트를 추가한다.

### Counterargument

CEO 모드를 일부러 티저로 보여주려는 의도일 수 있다.

### What Would Disprove This

브라우저 테스트에서 CEO 카드 클릭이 명확한 “준비 중” 상태를 표시하거나, React Router가 `null`을 안전하게 무시하고 시각적으로도 disabled 처리된다는 증거가 있으면 심각도가 낮아진다.

## Finding ID: PC-C-005

### Area

Documentation accuracy / Onboarding

### Claim

핵심 문서들이 실제 코드와 여러 숫자·도메인·상태에서 충돌한다. 단일 표지판 역할을 하는 문서가 오히려 이전 상태를 섞어 전달한다.

### Evidence

증거:

- `docs/CODEBASE_MAP.md:85`는 `characters.js`를 17명 데이터로 기록하지만 실제 `src/data/characters.js`에는 20개 캐릭터 객체가 있다.
- `docs/CODEBASE_MAP.md:166-173`은 로어북을 194개로 기록하지만 실제 JSON은 전체 211개, `_combined` 제외 207개다.
- `docs/CODEBASE_MAP.md:138`은 메신저 도메인을 `msg.bluehair.blue`로 쓰지만 실제 로어북과 사이트 템플릿은 `talk.bluehair.blue`를 사용한다. 예: `docs/prompts/json/SVG_메신저_EN.json:4`, `src/data/svgTemplates/templates-sns.js:371`.
- `AGENTS.md:187`은 INTRO_COMPONENTS 현재 등록을 3개로 말하지만 실제 `src/components/cinematic/index.js:14-27`은 12개를 등록한다.
- `AGENTS.md:216`은 15명 sign 등록 완료라고 하지만 `src/data/characters.js` 기준 20명 모두 `sign` 필드를 가진다.
- `AGENTS.md:281-282`는 로어북 31개/55.6KB라고 쓰고, `AGENTS.md:441-453`은 103/102개 삽입을 말한다.
- `AGENTS.md:291`은 `ASSET_VERSION=11`을 말하지만 실제 `src/utils/cdn.js:6`은 28이다.

추정/리스크:

- Codex/Claude/사람 운영자가 서로 다른 문서를 신뢰하면 캐릭터 수, CDN 버전, 에덴챗 삽입 대상, SVG 도메인을 다르게 판단한다.

### Impact

온보딩 비용과 오작업 가능성이 높다. 특히 R2 업로드, 에덴챗 재삽입, 시네마틱 인트로 후속 구현에서 잘못된 기준을 사용할 수 있다.

### Severity

Medium / P2

### Confidence

0.99

### Proposed Change

문서 숫자는 수동 편집 대신 검증 명령 결과를 붙이는 방식으로 갱신한다.

```powershell
(Select-String -LiteralPath src\data\characters.js -Pattern '^\s+id: "').Count
Get-ChildItem docs\prompts\json -Recurse -File -Filter *.json |
  Where-Object { $_.FullName -notmatch '\\_combined\\' } |
  Measure-Object
```

`AGENTS.md`/`CLAUDE.md`는 표지판으로 유지하되, 오래된 완료 이력은 “현재 기준”과 “히스토리”를 분리한다.

### Counterargument

일부 숫자는 “삽입 완료된 로어북” 또는 “사이트에 노출 중인 캐릭터”처럼 다른 기준일 수 있다.

### What Would Disprove This

각 숫자의 기준이 문서에 명시되어 있고, 194/207/102/103이 서로 다른 의도된 집합이라는 설명이 추가되면 충돌이 완화된다.

## Finding ID: PC-C-006

### Area

Cinematic intro registry / Implementation status

### Claim

시네마틱 인트로 상태 문서와 실제 레지스트리가 어긋나며, `cardDeal` 설정은 존재하지만 현재 컴포넌트·캐릭터 연결이 없다.

### Evidence

증거:

- `AGENTS.md:435`는 HSR을 “카드딜” 진행 대상으로 적는다.
- 실제 `src/data/characters.js:185-187`에서 HSR은 `introStyle: "wind"`다.
- `src/data/introStyles.js:53-59`에는 `cardDeal` 설정이 남아 있다.
- `src/components/cinematic/index.js:14-27`에는 `cardDeal` 등록이 없고 `WindIntro`가 등록되어 있다.
- `src/components/CinematicCharDetail.jsx:4-5`는 인트로 대상이 8명이라고 적지만, 실제 `introStyle` 보유 캐릭터는 12명이다.

추정/리스크:

- `cardDeal`이 폐기된 기획인지, 다음 구현 대기인지 불명확하다. 다음 에이전트가 HSR을 잘못 다시 갈아엎을 가능성이 있다.

### Impact

시네마틱 인트로 후속 작업의 기준선이 흐려진다. 이미 구현된 `wind`, `neon`, `silence`, `embrace`, `flow`가 문서상 미완처럼 보인다.

### Severity

Medium / P2

### Confidence

0.93

### Proposed Change

`src/pages/chardetail_intro_plan.md`, `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`를 실제 레지스트리 기준으로 정정한다. `cardDeal`이 폐기라면 `introStyles.js`에서 제거하고, 보류라면 “reserved, no character currently uses it” 주석을 추가한다.

### Counterargument

`cardDeal`은 곧 쓸 예정인 사전 예약 설정일 수 있다.

### What Would Disprove This

Claude 또는 인간 moderator가 `cardDeal`을 HSR 또는 다른 캐릭터에 적용할 승인된 계획이 있다고 확인하면, 제거 대신 예약 상태 문서화가 맞다.

## Finding ID: PC-C-007

### Area

SVG template parity / Site preview vs Worker runtime

### Claim

사이트 내 SVG 템플릿 헬퍼와 워커 헬퍼가 “동기화” 주석을 달고 있지만, 이미지 URL 허용 정책이 다르다. 워커는 `data:` URI를 허용하고 base64 인라인을 수행하지만, 사이트 헬퍼는 `data:`를 거부한다.

### Evidence

증거:

- `src/data/svgTemplates/helpers.js:27-35`의 `safeImageUrl`은 `http:`/`https:`만 허용한다.
- `workers/svg-sns.js:6-15`의 `safeImageUrl`은 `data:`를 먼저 허용한다.
- `workers/svg-sns.js:15-27`에는 `fetchAsDataUri`가 있다.
- `workers/plan_sub_image_inline.md:165-179`는 `fetchAsDataUri`와 `safeImageUrl data URI 통과`를 완료 체크리스트로 기록한다.
- `src/data/svgTemplates.js:3-6`와 워커 파일들은 “Keep in sync” 계열 주석을 가진다.

관련 코드:

```js
// src/data/svgTemplates/helpers.js:28-34
export function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}
```

추정/리스크:

- 현재 사이트 프리뷰가 data URI를 직접 넣지 않는다면 즉시 깨지지는 않는다. 그러나 “사이트 프리뷰와 실제 에덴챗 워커 결과가 같아야 한다”는 검증 기준에는 어긋난다.

### Impact

SVG 템플릿을 사이트에서 미리 볼 때와 워커에서 렌더링할 때 이미지 처리 결과가 다를 수 있다. 향후 data URI 샘플이나 내부 변환 테스트를 추가하면 사이트 프리뷰만 실패할 수 있다.

### Severity

Medium / P2

### Confidence

0.82

### Proposed Change

사이트 헬퍼에도 워커와 동일하게 `data:` 허용을 추가하거나, “사이트 프리뷰는 외부 URL만 허용”이라고 문서화하여 동기화 주석을 좁힌다.

### Counterargument

사이트 프리뷰는 inline SVG DOM으로 렌더링되므로 외부 이미지 차단 문제가 워커와 다르게 발생할 수 있다.

### What Would Disprove This

브라우저 프리뷰와 에덴챗 `<img>` 렌더링을 비교한 스냅샷 테스트에서 항상 동일하게 렌더링된다는 증거가 있으면 우선순위가 낮아진다.

## Finding ID: PC-C-008

### Area

Image pipeline / Legacy path safety

### Claim

사용 금지된 레거시 이미지 폴더 경로가 `tools/extract_char_prompts.py`에 아직 하드코딩되어 있다.

### Evidence

증거:

- `AGENTS.md:302-304`는 `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/` 레거시 폴더를 어떤 경우에도 참조하지 말라고 명시한다.
- `tools/extract_char_prompts.py:8-9`는 레거시 폴더를 소스로 설명한다.
- `tools/extract_char_prompts.py:44`는 `BACKUP_DIR = TOOLS_DIR.parent.parent / "_OLD_DO_NOT_USE_캐릭터이미지_use_char_img" / ...`를 하드코딩한다.

추정/리스크:

- 이 스크립트는 `[레거시 1회용 스크립트]`라고 표시되어 있어 실제 운영에서 쓰지 않을 수 있다. 그러나 `tools/` 목록에 남아 있으면 새 에이전트가 실수로 실행할 수 있다.

### Impact

이미지 원본 경로 통일 정책을 깨뜨리는 예외가 남는다. 특히 `--apply`가 `asset_config.json`을 수정할 수 있어, 잘못된 백업 기준으로 프롬프트 DB를 덮을 위험이 있다.

### Severity

Medium / P2

### Confidence

0.91

### Proposed Change

`tools/extract_char_prompts.py`를 `LEGACY/`로 이동하거나 실행 시 기본 실패하도록 가드한다.

```python
if not args.allow_legacy:
    raise SystemExit("legacy backup extraction is disabled; use char_img/ as source")
```

### Counterargument

역사 보존용 1회성 도구라면 실행 가능 상태로 남겨두는 것이 재현성에 도움이 될 수 있다.

### What Would Disprove This

`tools/extract_char_prompts.py`가 현재 자동화 루프에서 호출되지 않고, `LEGACY/` 보관 대상으로 명시되어 있다는 운영 합의가 있으면 심각도가 낮아진다.

## Finding ID: PC-C-009

### Area

Source hygiene / Documentation in code

### Claim

일부 소스 주석에 Unicode replacement character `�`가 실제로 들어가 있다. 동작에는 영향이 적지만, 온보딩과 검색 신뢰도를 낮춘다.

### Evidence

증거:

- `src/pages/CharDetail.jsx:2` — `캐릭��� 상세 페이지`
- `src/components/CinematicCharDetail.jsx:3`
- `src/components/CinematicCharDetail.jsx:16`
- `src/components/CinematicCharDetail.jsx:60`
- `src/components/DefaultCharDetail.jsx:114`
- `src/components/CharSign.jsx:20`

검증 명령:

```powershell
rg -n "�" AGENTS.md CLAUDE.md docs src workers tools
```

추정/리스크:

- 현재 발견 위치는 주석이라 런타임 영향은 낮다. 다만 인코딩 문제의 흔적이므로 문서 생성/복사 과정에서 다른 파일에도 재발할 수 있다.

### Impact

코드 주석을 신뢰하고 작업하는 에이전트가 문장을 오해하거나 검색 키워드를 놓칠 수 있다.

### Severity

Low / P3

### Confidence

0.99

### Proposed Change

해당 주석만 UTF-8 정상 문자열로 교정하고, 문서/소스 검증에 `rg -n "�"`를 추가한다.

### Counterargument

사용자에게 보이지 않는 주석이며 빌드 결과에 영향이 없다.

### What Would Disprove This

해당 문자가 터미널 렌더링 문제일 뿐 파일에 실제 저장된 문자가 아니라는 바이트 수준 증거가 있으면 finding은 기각된다.

## Finding ID: PC-C-010

### Area

Cloudflare Worker deployment / Compatibility

### Claim

사이트 배포와 SVG 워커 배포의 Cloudflare compatibility date가 서로 다르다.

### Evidence

증거:

- 사이트 `wrangler.jsonc:4`는 `"compatibility_date": "2025-09-27"`이다.
- SVG 워커 일괄 배포 스크립트 `workers/deploy/deploy.sh:32`는 `--compatibility-date "2024-01-01"`을 하드코딩한다.

추정/리스크:

- 현재 워커 코드가 구형 compatibility에서도 동작하므로 즉시 장애는 아닐 수 있다. 그러나 Worker 런타임 API나 보안 기본값 차이가 누적되면 사이트와 워커가 서로 다른 환경에서 검증된다.

### Impact

배포 재현성과 런타임 일관성이 낮아진다. 특히 `fetch`, encoding, Response header 처리처럼 워커 전역 API를 사용하는 `workers/svg-*.js`에서 향후 차이가 생길 수 있다.

### Severity

Medium / P2

### Confidence

0.87

### Proposed Change

`workers/deploy/deploy.sh`의 compatibility date를 변수화하고 `wrangler.jsonc`와 맞추거나, 워커별 compatibility 이유를 명시한다.

```bash
COMPATIBILITY_DATE="2025-09-27"
npx wrangler deploy "$WORKERS_DIR/$FILE" \
  --name "$NAME" \
  --compatibility-date "$COMPATIBILITY_DATE" \
  --route "$ROUTE"
```

### Counterargument

워커는 독립 산출물이라 사이트 compatibility date와 반드시 같을 필요는 없다.

### What Would Disprove This

Cloudflare Worker별로 2024-01-01을 고정해야 하는 호환성 이유가 문서화되어 있으면 단순 문서 보강 이슈로 낮아진다.

## Stale or contradictory documentation

- `docs/CODEMAPS/*`: 요청된 경로지만 실제로 존재하지 않는다. 존재하는 것은 `docs/CODEBASE_MAP.md`뿐이다.
- `docs/CODEBASE_MAP.md:85`: `characters.js` 17명이라고 하나 실제는 20명이다.
- `docs/CODEBASE_MAP.md:166-173`, `docs/ai-council/01_SESSION_BRIEF.md:50`, `docs/ai-council/02_REPO_BASELINE.md:15`: 194개 로어북 기준이 남아 있다. 실제는 전체 211개, `_combined` 제외 207개다.
- `AGENTS.md:187`, `CLAUDE.md:187`: INTRO_COMPONENTS 현재 등록을 3개로 설명하지만 실제 registry는 12개다.
- `AGENTS.md:216`, `CLAUDE.md:216`: sign 이미지 15명 등록 완료라고 하나 실제 20명 캐릭터 모두 sign 필드를 가진다.
- `AGENTS.md:281-282`, `CLAUDE.md:281-282`: 챗봇 시스템을 31개 로어북/55.6KB로 설명한다. 현재 `docs/prompts/json/` 규모와 맞지 않는다.
- `AGENTS.md:291`, `CLAUDE.md:291`: ASSET_VERSION 11이 남아 있다. 실제 `src/utils/cdn.js:6`은 28이다.
- `AGENTS.md:435`, `CLAUDE.md:435`: 시네마틱 진행 상태가 Step 7a~7e 진행 중으로 적혀 있으나, 실제 `src/components/cinematic/`에는 `GlitchIntro`, `FlashIntro`, `FogIntro`, `WindIntro`, `PageFlipIntro`, `EmbraceIntro`, `NeonIntro`, `SilenceIntro`, `FlowIntro`까지 존재한다.
- `docs/CODEBASE_MAP.md:138`: 메신저 워커 도메인이 `msg.bluehair.blue`로 남아 있지만 실제 템플릿/로어북/배포 스크립트는 `talk.bluehair.blue`다.
- `src/components/DefaultCharDetail.jsx:4-5`: SIA/NOA를 `introStyle` 없는 기본 캐릭터로 설명하지만 실제 `src/data/characters.js:520-560`에서 SIA/NOA는 각각 `neon`, `silence` 인트로를 가진다.

## Build/deploy/test verification gaps

실행한 검증:

```powershell
npm.cmd run build
```

결과:

- 성공: Vite production build 통과.
- 출력 요약: `110 modules transformed`, `✓ built in 672ms`.
- 경고: Node `DEP0040` `punycode` deprecation warning.
- 참고: PowerShell의 `npm`은 실행 정책 때문에 `npm.ps1`에서 막혔다. `npm.cmd`로 우회했다.
- 참고: sandbox 내부 최초 실행은 esbuild child process `spawn EPERM`으로 실패하여 sandbox 밖 실행 승인을 받아 검증했다.

검증 공백:

- `package.json`에 `test`, `lint`, `typecheck`, `validate:prompts`, `validate:workers`가 없다.
- `.github/workflows/*`는 Claude 액션만 있고 `npm ci`/`npm run build`가 없다.
- `docs/prompts/json/` 207개 JSON은 이번 감사에서 수동 PowerShell로 파싱 검증했지만, 저장소에 재사용 가능한 검증 스크립트가 없다.
- `tools/edenchat_clipboard.py --list`가 GUI 의존성 import 때문에 실행되지 않는다.
- Worker 배포는 실제 배포 금지 원칙 때문에 실행하지 않았다. dry-run/route smoke test 스크립트도 없다.
- R2 객체 존재 여부와 `src/utils/cdn.js`의 `ASSET_VERSION` 증가 여부를 연결 검증하는 자동화가 없다.
- 브라우저 기반 UI 검증(캐릭터 상세 phase 전환, CEO 카드 클릭, SVG 프리뷰 렌더링)은 이번 감사에서 실행하지 않았다.

## High-risk files and why

- `src/data/characters.js`: 캐릭터 20명의 ID, CDN 코드, 이미지 경로, 인트로 스타일, sign, gallery/detail 연결을 모두 가진 단일 계약 파일이다.
- `src/utils/cdn.js`: `ASSET_VERSION`과 scene code mapping의 출처다. R2 업로드와 불일치하면 캐시/이미지 경로 문제가 바로 발생한다.
- `src/data/gamemodes.js` + `src/components/GameModes.jsx` + `src/App.jsx`: 모드 데이터, 클릭 카드, 라우트가 3곳에 나뉘어 있어 `detailPath: null` 같은 불일치가 사용자 클릭으로 노출된다.
- `src/components/CinematicCharDetail.jsx`, `src/components/cinematic/index.js`, `src/data/introStyles.js`: phase 상태기계와 인트로 registry/config가 분리되어 있다. 문서 불일치가 있으면 다음 캐릭터 추가 시 실패 가능성이 높다.
- `src/data/svgTemplates/*`와 `workers/svg-*.js`: 사이트 프리뷰와 실제 워커가 별도 구현이라 drift가 생기기 쉽다.
- `workers/deploy/deploy.sh`: 10개 워커 배포와 route 등록을 한 번에 수행한다. compatibility date, route, worker name 오류가 전체 SVG 시스템에 영향을 준다.
- `tools/edenchat_clipboard.py`: 207개 로어북을 실제 플랫폼 UI에 넣는 운영 자동화다. 의존성/순서/키워드 파싱 실패가 플랫폼 상태에 직접 영향을 준다.
- `docs/prompts/json/**`: 챗봇 동작의 실질 데이터다. 파일 수가 많고 trigger/fav/schema 규칙이 중요하다.
- `public/_headers`: CSP, cache, frame policy가 사이트 전체에 적용된다. SVG/CDN/폰트 도메인 변경 시 이 파일을 함께 봐야 한다.
- `tools/extract_char_prompts.py`: 레거시 경로와 `--apply` 성격이 있어 실수 실행 시 prompt config 오염 위험이 있다.

## Recommended next 5 tasks

1. **Build CI 추가**: `.github/workflows/build.yml`을 만들어 `npm ci`와 `npm run build`를 PR/push에서 강제한다.
2. **CEO 모드 카드 처리 결정**: `src/data/gamemodes.js:111`의 `detailPath: null`을 disabled 카드로 처리하거나 `/modes/ceo` 페이지와 라우트를 추가한다.
3. **로어북 검증 스크립트 추가**: 207개 non-combined 파일 기준으로 JSON parse, `// --- TRIGGER ---` 존재, 본문 `"trigger"` 예외, `_combined` 제외, fav 금지를 자동 검증한다.
4. **문서 기준선 갱신**: `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`, `docs/ai-council/01_SESSION_BRIEF.md`, `docs/ai-council/02_REPO_BASELINE.md`의 캐릭터 수, 로어북 수, 인트로 registry, ASSET_VERSION, 메신저 도메인을 실제 코드 기준으로 맞춘다.
5. **EdenChat 자동화 실행성 복구**: `tools/edenchat_clipboard.py --list`가 GUI 의존성 없이 동작하도록 import를 지연하고, 운영자가 그대로 실행할 수 있는 의존성 설치 절차를 문서화한다.

## Questions for Claude

- `cardDeal`은 폐기된 인트로인가, 아니면 다음 구현 예약인가?
- HSR은 현재 `wind`가 정식인가, 문서의 “카드딜”이 정식인가?
//Moder:HSR 인트로는 현재 전부 구현 완료. src 내부 내용이 정식.
- `docs/prompts/json/`의 운영 기준 수는 207개 non-combined인가, 194개인가, 아니면 실제 플랫폼 삽입 완료 102/103개인가?
//Moder:반드시 207개 non-combined로 운영되어야 함.
- 본문 내부 `"trigger"` 키는 규칙 위반으로 수정해야 하는가, 아니면 서사 조건 필드로 허용해야 하는가?
//Moder:로어북 json 파일 내부 tregger는 절대 건드리지 말 것. `C:\Users\User\OneDrive\图片\챗봇 제작\연예계\tools\edenchat_clipboard.py` 해당 스크립트와 연동성을 검증하면 알겠지만, 모든 로어북은 파일 형식만 json일 뿐, 전부 수동으로 챗봇 플랫폼에 붙여 넣어야 하는 최중요 요소임. 절대 함부로 판단하여 건드리지 말 것.
- 사이트 SVG 프리뷰와 Worker 렌더링은 완전 동등해야 하는가, 아니면 Worker만 data URI 인라인을 보장하면 되는가?
//Moder:프리뷰는 말 그대로 프리뷰이다. 실제 챗봇 플레이 중 출력되는 Worker SVG는 URL 내부 인라인을 반영해야 한다.

## Questions for the human moderator

- 이번 라운드 이후 Agent C가 문서/검증 스크립트 수정까지 맡아도 되는가, 아니면 감사 문서 작성까지만 유지할까?
//Moder:모든 라운드가 끝나기 전 까지 실제 리포지토리 내부 중요 문서에 대한 편집은 금지한다.
- CEO 모드는 실제로 출시 예정인가, 아니면 메인 페이지에서 숨기는 편이 맞는가?
//Moder:위에서 말했듯, 이미 출시 된 상태이다.
- 에덴챗 플랫폼에는 현재 102/103개가 들어간 상태인가, 아니면 최신 207개 기준으로 재삽입해야 하는가?
//Moder:207개 로어북이 수동 삽입 된 상태이다.
- `AGENTS.md`와 `CLAUDE.md` 중 어느 파일을 앞으로 canonical 표지판으로 삼을까?
//Moder:`AGENTS.md`를 표지판으로 삼는다. 단, 어디까지나 파이프라인 안내를 돕기 위한 표지판 문서라는 것을 명심. 실질적 분석 및 계획은 세부 파이프라인 문서에서 작성된다.
- Cloudflare Worker 배포 검증은 다음 단계에서 dry-run/smoke test까지 허용할까, 아니면 실제 배포 직전까지만 보류할까?
//Moder:항상 dry-run으로 검증할 것. 필요 시 localhost 브라우저 검증.
