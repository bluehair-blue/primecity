# Round 2 — Codex Rebuttal

> Agent C: Implementation and Verification Reviewer  
> 기준 문서: `round_01_claude_audit.md`, `round_01_codex_audit.md`, `01_SESSION_BRIEF.md`  
> 반영 원칙: `//Moder:` 주석은 Round 1 추정보다 우선한다. 생산 코드는 수정하지 않았다.

---

## PC-A-001 — EdenChat CTA 분산 부재

### 1. 판정

**Partially Agree**

Claude의 정적 증거는 맞다. `src/components/HeroSlider.jsx:331`에 EdenChat player URL이 있고, `rg -n "eden-chat|edenchat|works/35e68463" src` 기준 `src/` 안의 외부 EdenChat 링크는 Hero 1곳뿐이다.

다만 Moderator 주석에 따라 우선순위는 조정해야 한다. Hero 단일 노출은 “의도”가 아니라 **미구현**이지만, 우선 개선은 캐릭터 상세나 카드 다중 CTA보다 **최상단 nav 리다이렉트 추가**다. 또한 현재 최초 노출 지점은 소개 사이트가 아니라 EdenChat 플랫폼 내 작품 페이지라는 전제가 있다.

### 2. Technical feasibility

- `src/data/links.js` 또는 `src/utils/links.js`로 `EDENCHAT_PLAYER_URL` 상수 분리는 낮은 난이도다.
- Navbar 외부 링크 추가도 낮은 난이도다.
- Footer, CharDetail, GameModes까지 동시 확장하면 UX/브랜드 판단이 필요해 중간 난이도로 올라간다.

```js
export const EDENCHAT_PLAYER_URL =
  "https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f";
```

### 3. Hidden implementation cost

- UTM 파라미터를 EdenChat player URL에 붙여도 플랫폼이 보존/허용하는지 검증 전에는 확정할 수 없다.
- “바로 시작” CTA를 과도하게 늘리면 쇼케이스 톤이 약해질 수 있다.
- 캐릭터별 딥링크나 모드별 prefill은 EdenChat에서 지원된다는 증거가 없다.

### 4. Verification method

```powershell
rg -n "eden-chat|edenchat|works/35e68463" src
rg -n "EDENCHAT_PLAYER_URL|EDENCHAT_BOT_URL" src
npm.cmd run build
```

브라우저 검증은 nav 클릭이 player URL로 이동하는지만 우선 확인하면 된다.

### 5. Safer alternative if needed

1차 변경은 **상수 분리 + 상단 nav 외부 링크**로 제한한다. CharDetail/GameModes CTA는 Round 합의 후 별도 UX 결정으로 진행한다.

---

## PC-A-002 — 이미지/코드 수치 카피 비일관성

### 1. 판정

**Partially Agree**

수치 불일치 자체는 사실이다. 예시는 다음과 같다.

- `src/pages/Gallery.jsx:186`: `20명 × 102장 = 총 2,000장+`
- `src/components/ImageSystemInfo.jsx:74`: `Scene Codes — 75 per character + SVG 4`
- `src/data/galleryConfig.js:17-25`: `SCENE_CATEGORIES`는 NSFW/착의 count를 `"추가 예정!"`으로 둔다.
- `docs/ai-council/01_SESSION_BRIEF.md:50`: 194 lorebook JSON이라고 하나 Moderator는 207개 non-combined 운영을 확정했다.

단, Claude의 “메인 프롬프트 db = 29이므로 사이트 카피를 거기에 맞춰야 한다”는 결론은 과하다. Moderator 주석상 이미지 원천은 `연예계/char_img/*`와 Cloudflare R2 `prime` 버킷이며, 메인 프롬프트는 수동 삽입 요소라 코드와 즉시 동기화하기 어렵다.

### 2. Technical feasibility

- 사이트 내부 표시 수치만 `src/data/galleryConfig.js` 또는 새 `imageCatalog`에서 통일하는 것은 가능하다.
- 프롬프트 JSON, R2, `char_img`, 사이트 카피를 한 번에 SSOT화하는 것은 비용이 크다.
- 프롬프트 JSON은 플랫폼 수동 삽입이 최종 단계이므로 자동 갱신 대상으로 보면 안 된다.

### 3. Hidden implementation cost

- 프롬프트를 수정하면 EdenChat 플랫폼에 수동 재삽입해야 한다.
- R2 실제 객체 수 검증에는 Cloudflare 접근 또는 dry-run 가능한 manifest가 필요하다.
- 공개 사이트에 75/102 전체 코드표를 노출하면 NSFW 범위와 미구현/추가 예정 범위를 어떻게 보여줄지 정책 판단이 필요하다.

### 4. Verification method

```powershell
Select-String -Path src\pages\Gallery.jsx -Pattern "102장|2,000"
Select-String -Path src\components\ImageSystemInfo.jsx -Pattern "75 per character"
Get-Content -Encoding UTF8 src\data\galleryConfig.js
Get-ChildItem docs\prompts\json -Recurse -File -Filter *.json |
  Where-Object { $_.FullName -notmatch '\\_combined\\' } |
  Measure-Object
```

R2/로컬 원천 검증은 별도 dry-run 스크립트가 필요하다.

### 5. Safer alternative if needed

프롬프트를 직접 고치지 말고, 먼저 **검증 리포트 생성 스크립트**를 만든다. 산출물은 “사이트 표시 수치 / `galleryConfig` / `char_img` / R2 manifest / 207 non-combined 로어북”을 비교만 해야 한다.

---

## PC-A-003 — CEO 모드 카드 dead link 위험

### 1. 판정

**Partially Agree**

소스 레벨 증거는 맞다.

- `src/data/gamemodes.js:103-111`: `ceo.detailPath: null`
- `src/components/GameModes.jsx:271-275`: 모든 `careerModes`를 `<Link to={cm.detailPath}>`로 렌더링
- `src/App.jsx:61-68`: `/modes/ceo` 라우트 없음

하지만 Moderator가 “이미 출시한 모드이고, 로어북 등록도 되어있는 모드”라고 정정했다. 따라서 Claude의 “disabled 카드” 제안은 현재 운영 사실과 충돌한다.

### 2. Technical feasibility

- 가장 올바른 구현은 `ModeCeo.jsx` 추가, `src/App.jsx` lazy route 추가, `src/data/gamemodes.js`의 `detailPath`를 `/modes/ceo`로 변경하는 것이다.
- 단기 임시처리는 `<Link>`를 막는 것보다 “대표 모드 정보 페이지가 누락됨”을 해결하는 방향이어야 한다.

### 3. Hidden implementation cost

- `ModeCeo.jsx`는 단순 페이지가 아니라 이미 출시된 로어북 내용과 맞아야 한다.
- `/modes/ceo` 추가 시 SEO, mode nav, GameModes 카드, EdenChat trigger 안내까지 일관되게 봐야 한다.
- 출시된 모드를 disabled 처리하면 실제 기능이 없는 것처럼 보이는 역정보가 된다.

### 4. Verification method

```powershell
Select-String -Path src\data\gamemodes.js -Pattern 'id: "ceo"|detailPath'
Select-String -Path src\App.jsx -Pattern '/modes/ceo|ModeCeo'
Select-String -Path src\components\GameModes.jsx -Pattern 'careerModes.map|to={cm.detailPath}'
npm.cmd run build
```

브라우저에서는 `/`에서 CEO 카드를 클릭해 `/modes/ceo`로 이동하는지 확인한다.

### 5. Safer alternative if needed

`ModeCeo.jsx` 콘텐츠가 아직 합의되지 않았다면, production disabled 카드가 아니라 **최소 브리핑 페이지**를 둔다. 페이지에는 `!대표모드` 트리거, 핵심 캐릭터, 현재 출시 상태만 정확히 표시한다.

---

## PC-A-004 — Freeplay 명칭 충돌

### 1. 판정

**Partially Agree**

명칭 중복 증거는 맞다.

- `src/data/gamemodes.js:14-22`: 메인 모드 `프리플레이`
- `src/data/gamemodes.js:120-127`: 유틸리티 모드 `프리플레이 설정`, trigger `!프리플레이`
- `src/components/GameModes.jsx`는 별개 모드라고 설명 문장을 추가한다.

그러나 Moderator 주석상 로어북 JSON 내부 trigger 관련 요소는 함부로 건드리면 안 된다. 207개 로어북은 이미 수동 삽입된 상태이며, trigger 변경은 운영 비용이 매우 크다.

### 2. Technical feasibility

- 사이트 라벨/설명만 개선하는 것은 낮은 난이도다.
- `!프리플레이` trigger 자체를 바꾸는 것은 높은 난이도다. 플랫폼 수동 삽입 재작업과 회귀 확인이 필요하다.

### 3. Hidden implementation cost

- trigger 변경은 `docs/prompts/json/**`, `tools/edenchat_clipboard.py` 파싱 결과, EdenChat 플랫폼 내 등록 상태를 모두 건드린다.
- 사용자가 이미 알고 있는 명령어를 바꾸면 실제 플레이어 혼란이 생길 수 있다.

### 4. Verification method

```powershell
Select-String -Path src\data\gamemodes.js -Pattern 'freeplay|프리플레이|!프리플레이'
rg -n '"!프리플레이"|프리플레이 설정|Custom Freeplay' docs\prompts\json src tools
```

실제 혼동 여부는 코드로 증명할 수 없으므로 UAT 또는 사용자 로그가 필요하다.

### 5. Safer alternative if needed

trigger는 유지한다. 사이트 UI에서만 유틸리티 모드를 `커스텀 설정`, `유저노트 설정`, `프리플레이 오버레이`처럼 설명하고, `!프리플레이`는 “설정 명령어”로 명확히 표시한다.

---

## PC-A-005 — Works 페이지의 약속 vs 회수

### 1. 판정

**Partially Agree**

현재 소스 증거는 맞다.

- `src/pages/Works.jsx:8`: `works` 배열은 프라임시티 1건
- `src/pages/Works.jsx:26`: SEO description은 “프라임시티 작가의 다른 작품 소개”
- `src/pages/Works.jsx:176-194`: future works placeholder

다만 Moderator가 방향을 정했다. 추후 Creator 포트폴리오, 즉 제작자 소개 사이트를 별도로 병설하고 그 사이트로 리다이렉트할 예정이다. 따라서 Claude의 “메뉴 임시 비공개 / 라인업 카드화 / 현재 작품 디테일 강화” 중에서는 **별도 Creator 포트폴리오 redirect**가 상위 요구다.

### 2. Technical feasibility

- 외부 Creator 포트폴리오 URL이 확정되면 `/works`를 redirect 또는 안내 페이지로 바꾸는 것은 낮은 난이도다.
- 별도 페이지가 아직 없다면 현 페이지를 숨기거나 “준비 중”으로 두는 결정이 필요하다.

### 3. Hidden implementation cost

- Creator 포트폴리오 URL, 도메인, SEO title, nav copy가 필요하다.
- 현재 `/works`를 내부 포트폴리오로 키우면 추후 별도 사이트와 역할이 중복된다.

### 4. Verification method

```powershell
Select-String -Path src\pages\Works.jsx -Pattern 'Other Works|작가의 다른 작품|더 많은 작품|const works'
rg -n '"/works"|/works' src
```

브라우저에서는 nav/TriangleNav의 `/works` 진입이 의도한 대상인지 확인한다.

### 5. Safer alternative if needed

Creator 사이트 URL이 없으면 production 변경은 보류한다. URL 확정 후 `/works`를 redirect하는 방식이 가장 안전하다.

---

## PC-A-006 — 캐릭터 외형 단일 소스 부재

### 1. 판정

**Need More Evidence**

`src/data/characters.js`에 `appearance`, `hair`, `eyes` 같은 필드가 없고 `signature` 중심이라는 Claude의 관찰은 맞다. 그러나 “외형 필드를 characters.js에 추가해야 한다”는 결론은 아직 검증되지 않았다.

Moderator는 `"캐릭터 프로필.md"`가 오래된 소스이고, 현재 최신 정보는 `prompts/json/*` 내부 파일이라고 정리했다. 또한 worldbuilding 문서를 굳이 검증하지 않아도 되고 `prompts/*`가 최신이면 충분하다고 했다.

### 2. Technical feasibility

- `characters.js`에 `appearance` 객체를 추가하는 것은 기술적으로 가능하다.
- 하지만 사이트 데이터와 prompt JSON 사이에 외형 정보를 중복 보관하게 되므로 장기 drift 가능성이 커진다.

### 3. Hidden implementation cost

- 20명 캐릭터의 외형 필드를 새로 정의해야 한다.
- 로어북, 이미지 원본, 사이트 데이터 간 충돌이 생기면 어떤 쪽을 canonical로 볼지 다시 정해야 한다.
- 이 변경은 UX 표시 요구가 없는 한 데이터 부채가 될 수 있다.

### 4. Verification method

```powershell
Select-String -Path src\data\characters.js -Pattern 'signature|appearance|hair|eyes'
rg -n 'hair|eyes|appearance|signature|시그니처' docs\prompts\json\캐릭터 docs\prompts\json
```

외형 반영 여부는 특정 캐릭터 변경 사례를 기준으로 `prompts/json/*`, `char_img/{CHAR}`, 사이트 표시를 비교해야 한다.

### 5. Safer alternative if needed

`characters.js`에 외형 필드를 추가하지 않는다. 대신 추후 필요 시 **읽기 전용 검증 체크리스트**를 둔다. 기준은 Moderator 주석대로 `prompts/json/*`를 최신 소스로 삼고, 사이트에는 꼭 필요한 시그니처만 유지한다.

---

## PC-A-007 — NSFW 게이트 비대칭

### 1. 판정

**Partially Agree**

Gallery NSFW 모달 구현은 실제로 존재한다.

- `src/pages/Gallery.jsx:22-23`: `nsfwEnabled`, `nsfwModal` state
- `src/pages/Gallery.jsx:438-443`: 18+ 확인 문구와 확인 버튼

하지만 Moderator 주석이 중요하다. 이 confirm 계열 조치는 정식 출시 직후 NSFW 이미지가 전부 채워져 있지 않았을 때 임시 차단했던 조치이며, 현재는 NSFW 이미지 에셋 접근이 정상 가능하다. 따라서 핵심은 “법적 게이트 강화”가 아니라 **현재 상태에 맞게 정보와 UX를 정정할 필요**다.

### 2. Technical feasibility

- Gallery 모달 제거 또는 문구 수정은 낮은 난이도다.
- NSFW 정책 문서화와 전체 자산 일관화는 중간 난이도다.

### 3. Hidden implementation cost

- 성인 콘텐츠 접근 정책은 사이트, EdenChat 플랫폼, 외부 소개 HTML이 서로 얽힌다.
- 확인 모달을 제거하면 UX는 단순해지지만 민감 콘텐츠 사전 경고가 사라진다.
- 유지하면 현재 Moderator가 말한 “정상 접근 가능” 상태와 상충하는 정보가 남을 수 있다.

### 4. Verification method

```powershell
Select-String -Path src\pages\Gallery.jsx -Pattern 'nsfwModal|setNsfwEnabled|만 18세|성인용'
rg -n 'NSFW|confirm|성인|18\\+' src docs
```

브라우저에서는 Gallery NSFW 토글이 현재 정책대로 동작하는지 확인한다.

### 5. Safer alternative if needed

모달을 즉시 제거하기보다, 먼저 현재 정책을 한 줄로 확정한다. “정상 접근 가능하되 민감 콘텐츠 경고는 유지”인지 “임시 차단 UI 제거”인지 결정한 뒤 Gallery와 소개 HTML을 맞춘다.

---

## PC-A-008 — ImageSystemInfo 코드 리스트 부재

### 1. 판정

**Partially Agree**

`ImageSystemInfo`가 상세 코드표를 제공하지 않는다는 지적은 맞다.

- `src/components/ImageSystemInfo.jsx:74`: `Scene Codes — 75 per character + SVG 4`
- `src/components/ImageSystemInfo.jsx:77`: `SCENE_CATEGORIES.map(...)`
- `src/data/galleryConfig.js:17-25`: 범위와 카테고리 중심 데이터

다만 Claude의 “코드 리스트를 사이트에 노출” 제안은 목적 대비 비용이 불명확하다. Moderator는 이미지 원천을 `char_img/*`와 R2로 보며, 메인 프롬프트는 플랫폼 수동 삽입 요소라 동시 갱신이 어렵다고 했다.

### 2. Technical feasibility

- `SCENE_CATEGORIES` 기반 요약을 개선하는 것은 쉽다.
- 모든 코드 매핑을 공개 UI에 넣는 것은 디자인·정책·동기화 비용이 있다.

### 3. Hidden implementation cost

- NSFW/착의 범위를 공개 코드표로 노출할지 결정해야 한다.
- prompt JSON의 이미지 규칙과 사이트 코드표가 어긋나면 오히려 신뢰도가 낮아진다.
- 코드표가 길어지면 `ImageSystemInfo`가 소개 컴포넌트가 아니라 운영 매뉴얼처럼 보일 수 있다.

### 4. Verification method

```powershell
Get-Content -Encoding UTF8 src\data\galleryConfig.js
Select-String -Path src\components\ImageSystemInfo.jsx -Pattern 'Scene Codes|SCENE_CATEGORIES'
rg -n '상황코드|Scene Codes|img.bluehair.blue/ent/\\{캐릭터코드\\}' docs\prompts\json src
```

### 5. Safer alternative if needed

공개 UI에는 카테고리 요약만 정리하고, 전체 코드 매핑은 내부 검증 스크립트/리포트로 둔다. 공개 표시는 `현재 공개`, `NSFW`, `확장`, `SVG`처럼 방문자가 이해할 수준으로 제한한다.

---

## PC-A-009 — 모드 카드의 챗봇 시작 동선 부재

### 1. 판정

**Partially Agree**

정적 증거는 맞다.

- `src/components/GameModes.jsx:188-203`: 메인 모드는 내부 `자세히 보기` 링크만 있음
- `src/components/GameModes.jsx:271-408`: 직업군 모드는 내부 Link와 trigger 텍스트만 있음
- `src/components/GameModes.jsx:471-558`: 유틸리티 모드는 trigger 텍스트만 있음
- `rg -n "eden-chat|works/35e68463" src` 결과 Hero 외 모드 카드에는 EdenChat 링크가 없다.

다만 PC-A-001의 Moderator 주석과 동일하게 우선순위는 “모든 카드에 바로 시작 CTA”가 아니라 **최상단 nav 리다이렉트**다. 소개 사이트가 최초 노출 지점이 아니라는 점도 urgency를 낮춘다.

### 2. Technical feasibility

- trigger 복사 chip은 중간 난이도다. 모바일 clipboard, fallback, 접근성 처리가 필요하다.
- “바로 시작” 외부 링크 추가는 쉽지만, EdenChat에 trigger prefill이 되지 않으면 사용자가 다시 명령어를 입력해야 한다.

### 3. Hidden implementation cost

- 모드별 CTA를 넣으면 카드 밀도가 높아진다.
- EdenChat 진입 후 모드 trigger가 자동 적용되지 않으면 기대와 실제가 어긋날 수 있다.
- 유틸리티 모드는 모드 시작이 아니라 대화 중 명령어라 “바로 시작” 표현이 부정확할 수 있다.

### 4. Verification method

```powershell
Select-String -Path src\components\GameModes.jsx -Pattern '자세히 보기|trigger|eden-chat|works/35e68463'
rg -n 'eden-chat|works/35e68463|챗봇' src\pages\Mode*.jsx src\components\GameModes.jsx
```

브라우저에서는 모드 카드 클릭, trigger 표시, clipboard 동작을 각각 검증해야 한다.

### 5. Safer alternative if needed

1차는 nav 리다이렉트. 2차는 trigger 복사 chip. 3차에서만 모드 카드별 EdenChat 링크를 추가한다. 자동 trigger prefill이 불가능하면 CTA 문구는 “시작”보다 “EdenChat에서 입력”에 가깝게 써야 한다.

---

## PC-A-010 — Updates의 17/19/20명 historical 카운트 혼동

### 1. 판정

**Disagree**

Claude가 인용한 파일 경로는 맞지만, 결론은 약하다. `src/pages/Updates.jsx`의 17명/19명/20명 표현은 업데이트 타임라인의 시점별 기록으로 보는 것이 자연스럽다.

오히려 실제로 정정해야 할 것은 `docs/ai-council/01_SESSION_BRIEF.md:50`의 194 lorebook JSON 같은 현재 기준 문서의 stale 정보다. Updates 로그의 과거 숫자를 현재 숫자로 고치는 것은 히스토리를 손상시킬 수 있다.

### 2. Technical feasibility

- Updates 상단에 현재 상태 카드(`20 characters`, `ASSET_VERSION 28`, `207 non-combined lorebooks`)를 추가하는 것은 쉽다.
- 과거 로그 문구를 전부 현재 기준으로 바꾸는 것은 권장하지 않는다.

### 3. Hidden implementation cost

- 과거 로그를 고치면 “그 당시 무엇이 변경됐는지”가 흐려진다.
- 현재 상태 카드가 별도 유지보수 대상이 되면 또 하나의 stale source가 생긴다.

### 4. Verification method

```powershell
Select-String -Path src\pages\Updates.jsx -Pattern '20번째|17명|19명|102장|ASSET_VERSION'
(Select-String -LiteralPath src\data\characters.js -Pattern '^\s+id: "').Count
Get-ChildItem docs\prompts\json -Recurse -File -Filter *.json |
  Where-Object { $_.FullName -notmatch '\\_combined\\' } |
  Measure-Object
```

### 5. Safer alternative if needed

과거 타임라인은 유지한다. 필요하다면 Updates 페이지 상단에 “현재 기준” 배지를 추가하되, 이 배지는 코드에서 계산하거나 검증 스크립트 결과로 관리해야 한다.

---

## Round 2 작업 제한 메모

- Moderator 지시: 모든 라운드가 끝나기 전까지 실제 리포지토리 내부 중요 문서 편집은 금지.
- 본 파일은 요청된 Round 2 산출물이므로 작성했다.
- production code, prompt JSON, `AGENTS.md`, `CLAUDE.md`, `CODEBASE_MAP.md`는 수정하지 않았다.
