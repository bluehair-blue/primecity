# Round 1 — Claude Audit (Agent A)

> Claude 에이전트의 독립 감사 결과. Round 1에서는 Codex 결과를 참조하지 않는다.
> 본 라운드는 **Agent A: Product / Narrative / User Experience** 관점에서 수행한다.

## 감사 메타데이터

- 날짜: 2026-04-25
- 에이전트: Claude (Agent A — Product · Narrative · UX)
- 베이스라인: `02_REPO_BASELINE.md` 기준 (브랜치 `main`, 커밋 `c82070c`, ASSET_VERSION 28)
- Round 1 입력만 사용 — `round_01_codex_audit.md` 는 본 시점 빈 템플릿(L25 `_비어있음_`)이므로 교차 참조하지 않았다.
- 본 감사에서는 **프로덕션 코드를 수정하지 않았다.** 인용한 파일은 모두 읽기 전용으로 검증.
- 사용자가 `Read` 대상으로 지정한 다음 3개 파일은 레포에 존재하지 않아 감사 외 처리:
  - `docs/plan_intro_html.md` (Glob 0 hit)
  - `docs/prompts/_review_summary.md` (Glob 0 hit)
  - `docs/prompts/_review_v3_final.md` (Glob 0 hit)
  - 처리: **본 라운드의 Questions for the human moderator** 절에 기록.

## 담당 도메인

본 에이전트(A)는 다음 도메인을 일차적으로 감사하였다. 도메인 1·4·6은 Agent B(Codex) 의 Round 1 산출을 우선으로 한다는 가정 하에 _코멘트 수준_으로만 다룬다.

- [x] 도메인 2: 프론트엔드 UX 퍼널
- [x] 도메인 3: 에덴챗 로어북 파이프라인 (프롬프트 본문 재작성 금지 — _구조·일관성·트리거 메타_ 만 검토)
- [x] 도메인 5: 브랜딩·수익화
- [ ] 도메인 1: Codex 마이그레이션 문서 (Codex 우선)
- [ ] 도메인 4: 이미지·SVG·R2 파이프라인 (Codex 우선)
- [ ] 도메인 6: 보안·콘텐츠 정책 (Codex 우선 — NSFW 모달 한 항목만 코멘트)

---

## Executive Summary

프라임시티 사이트는 시각·세계관·캐릭터 캐러셀 측면에서 매우 완성도 높은 ‘쇼케이스’를 갖췄으나, **‘쇼케이스 → 챗봇 시작’ 으로 이어지는 전환 퍼널이 1지점에 집중되어 있다**. 사이트 전체에서 EdenChat URL 리터럴은 단 1곳(`src/components/HeroSlider.jsx:331`)이며, 캐릭터 상세·게임 모드 카드·푸터·모바일 네비게이션 어디에도 챗봇 진입 CTA 가 없다. Hero를 지나간 사용자는 평균 6번의 섹션 스크롤을 통과한 뒤 다시 Hero 까지 _상향 스크롤_ 해야 챗봇을 시작할 수 있다.

수치 일관성에서는 ‘20명 × 102장 = 2,000장+’(`src/pages/Gallery.jsx:186`) 와 ‘75 per character + SVG 4’(`src/components/ImageSystemInfo.jsx:74`), 그리고 메인 프롬프트의 실제 정의된 상황코드(감정 9 + 일상 10 + 로맨스 6 + 무대 4 = 29; `docs/prompts/json/메인_프롬프트_EN.json:78-81`) 가 서로 일치하지 않아 _도구별 자기 일관성_(self-consistency) 이 깨진다. NSFW 모달은 1-step confirm 으로 _연령 확인을 통한 책임 이전(deflection)_ 이 약하고, 모드 데이터(`src/data/gamemodes.js`) 에는 `freeplay` 메인 모드와 `freeplay-config` 유틸 모드가 같은 한국어 명을 공유하면서도 별개 동작이라 **온보딩 인지 비용이 누적**된다.

Works 페이지(`src/pages/Works.jsx`) 는 작품 1건 + 플레이스홀더 카드만 노출돼 _‘작가의 다른 작품’_ 라벨을 약속하면서 약속을 회수하지 않는다 — 신규 방문자가 작가의 신뢰도를 평가하는 보조 신호로서 역효과를 낳는 상태다. ‘대표(CEO)’ 모드 카드(`src/data/gamemodes.js:111`)는 `detailPath: null` 인 채로 그리드에 배치돼 클릭 무반응 가능성이 있어 즉시 검증 대상이다.

전체적으로 **콘텐츠는 풍부하나 ‘플레이 시작’ 동선이 1차원**이며, 사이트와 메인 프롬프트 간의 _수치·시그니처·자산_ 메타데이터가 단일 소스 오브 트루스로 통합되지 않아 캐릭터 외형 변경(예: 사용자가 직전 세션에서 한 하시은 단발/루비색 변경)이 사이트 카피·이미지 시그니처·로어북 셋 모두에 동시 반영됐는지 한 눈에 검증할 수단이 없다.

핵심 우선순위(상세는 Top 10 Findings):

1. **EdenChat CTA 분산 부재** (P1): HeroSlider 외 다른 진입 지점 0건.
2. **수치 카피 비일관성** (P1): 102/75/29/2,000장+ 가 단일 소스로 동기화되지 않음.
3. **CEO 모드 카드의 dead link 위험** (P0 if true): `detailPath: null` 노출.
4. **Works 페이지 ‘플레이스홀더만 있는 약속’** (P2): 신뢰도 비용.
5. **Freeplay 명칭 충돌** (P2): 메인 모드와 유틸 모드 동명.

---

## Top 10 Findings (Finding Card 포맷)

> Finding ID 명명 규약: `PC-A-NNN` (Agent A). Severity 는 `04_SCORE_RUBRIC.md` 등급 사용. Confidence 는 [0.00, 1.00].

---

### Finding ID: PC-A-001

#### Area
도메인 5 — 브랜딩·수익화 / 도메인 2 — UX 퍼널 / EdenChat 진입 전환

#### Claim
사이트 전체에서 EdenChat 진입(챗봇 시작) 링크는 단 1곳(`src/components/HeroSlider.jsx:331`)에만 존재한다. Hero를 지나친 사용자는 캐릭터 상세·게임 모드·갤러리·푸터·모바일 네비게이션 어디에서도 챗봇을 시작할 수 없으며, 시작하려면 페이지 최상단으로 _상향 스크롤_ 해야 한다.

#### Evidence
- `src/components/HeroSlider.jsx:331`
  - observed: 절대 URL 리터럴 1건
  ```jsx
  href="https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f"
  ```
- 도메인 전수 grep — `edenchat|에덴챗|eden-chat|chatbot start|챗봇 시작` 패턴 with `src/`:
  - `src/pages/Updates.jsx` — 키워드 멘션만 있고 외부 링크 0건
  - `src/components/HeroSlider.jsx` — 위 1건이 유일
- `src/components/Footer.jsx`(51줄, CODEBASE_MAP.md:62 기준) — 라우트 grep 결과 푸터에는 외부 링크 0건
- `src/components/Navbar.jsx:54,72,85,121` — 모두 내부 라우트(`l.href`/`/`) 만 노출
- `src/pages/CharDetail.jsx`, `src/components/CinematicCharDetail.jsx`, `src/components/DefaultCharDetail.jsx`, `src/components/JgrCharDetail.jsx` — 캐릭터 상세에서 챗봇 시작 트리거 0건 (back 링크만 존재 — 예: `DefaultCharDetail.jsx:350`)
- `src/components/GameModes.jsx:189,274` — 모드 카드의 `Link to` 는 모두 _상세 소개_ 내부 라우트(`/modes/*`) 로만 분기, EdenChat 진입은 0건

#### Impact
캐릭터·세계관·게임 모드 콘텐츠를 끝까지 소비한 사용자(=가장 전환 의향이 높은 사용자) 일수록 챗봇 시작 버튼을 다시 만나기 위해 페이지 최상단으로 되돌아가야 한다. 모바일 사용자(`useIsMobile(768)`) 는 평균 4–6번의 ScrollNav 탭 또는 상향 스와이프 액션을 추가로 수행해야 하며, 이는 명백한 전환 누수다. 또한 **하나의 URL 리터럴**(=단일 SPOF) 이라 EdenChat 측 슬러그가 변경될 때 grep으로 1건만 잡히면 끝나지만, 이 단일성 자체가 _신규 진입 지점 추가_ 의 진입 비용으로 작용해 ‘CTA 다중 노출’ 의도조차 차단해 왔다.

#### Severity
High (P1)

#### Confidence
0.95

#### Proposed Change
프로덕션 코드 수정은 본 라운드 범위가 아니다. 후속 라운드에서 다음을 권고:
1. `src/data/links.js`(또는 `src/utils/links.js`) 신설 — `EDENCHAT_BOT_URL` 단일 export.
2. 다음 4지점에 동일 URL 재사용: (a) Footer, (b) Navbar(데스크톱·모바일 햄버거), (c) `DefaultCharDetail`/`CinematicCharDetail` 의 “Sign 섹션 직후”, (d) `GameModes.jsx` 메인 모드 카드 하단 `자세히 보기 →` 보조 CTA.
3. 캐릭터별 딥링크가 가능하다면 `EDENCHAT_CHAR_PARAM` 식 함수화하여 분석/AB 테스트 여지 확보.

```js
// 제안: src/data/links.js
export const EDENCHAT_BOT_URL =
  "https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f";

export function edenchatStart({ utm } = {}) {
  if (!utm) return EDENCHAT_BOT_URL;
  const u = new URL(EDENCHAT_BOT_URL);
  Object.entries(utm).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}
```

#### Counterargument
사용자가 ‘콘텐츠 우선 노출 → 동기화된 단 한 번의 결정’ 디자인을 _의도적_ 으로 채택했을 가능성. CTA를 다중 배치하면 사이트의 ‘잡지·미술관’ 톤이 약화될 수 있다. 또한 캐릭터별 딥링크가 EdenChat 측에서 지원되지 않으면 단일 URL을 여러 곳에 복제하는 효과뿐일 수 있다.

#### What Would Disprove This
- 사용자(human moderator) 가 “Hero CTA 단일 노출은 의도된 디자인”이라고 명시한다.
- EdenChat 슬러그/딥링크 변경 빈도가 분기 1회 이상이라 다중 노출의 유지보수 비용이 전환 이득을 상쇄한다.
- 분석 데이터로 Hero CTA 클릭률이 이미 충분히 높다고 입증된 경우.

---

### Finding ID: PC-A-002

#### Area
도메인 2 — UX 퍼널 / 도메인 5 — 브랜딩(수치 카피)

#### Claim
사이트 카피·컴포넌트 메타·메인 프롬프트의 _이미지 카탈로그 수치_ 가 일관되지 않는다. Gallery는 “20명 × 102장 = 총 2,000장+”라 약속하나, ImageSystemInfo는 “75 per character + SVG 4”로 표기하고, 메인 프롬프트의 `db` 정의는 29개 코드만 정의한다. 단일 소스 오브 트루스가 부재.

#### Evidence
- `src/pages/Gallery.jsx:186`
  ```jsx
  20명 × 102장 = 총 2,000장+
  ```
- `src/components/ImageSystemInfo.jsx:74`
  ```jsx
  Scene Codes — 75 per character + SVG 4
  ```
- `docs/prompts/json/메인_프롬프트_EN.json:78-81` — 정의된 코드 = 9 + 10 + 6 + 4 = **29**
- `src/pages/Updates.jsx:18` — “이미지 2,000장+ · ASSET_VERSION 26 → 28”
- `src/pages/Updates.jsx:31` — “이미지 1,900장+ · ASSET_VERSION 19 → 24”
- `src/pages/Updates.jsx:47` — “R2 sync **1631/1632** 완료” (1,631장)
- `CLAUDE.md` — “생성: 1,125장 + 특수 90장 (NAI API)” / “75개 상황코드” 표기

#### Impact
방문자가 _얼마나 많은 콘텐츠가 있는가_ 라는 가장 단순한 질문에 사이트가 4가지 답을 동시에 제공한다(102 / 75 / 29 / 1,631~2,000+). 신뢰도와 “이게 정말 그만큼 풍성한 봇인가” 라는 판단을 흐린다. 또한 **메인 프롬프트의 db** 가 사이트 표기보다 좁은 코드 집합을 공식 정의로 가지고 있어, 봇이 실제로 발화하는 이미지 호출 패턴(URL → 404)과 사이트 약속이 불일치할 위험이 있다(예: 봇이 `…/3.webp` 만 사용하는데 사이트는 75/102 코드 풍성함을 약속).

#### Severity
High (P1)

#### Confidence
0.85

#### Proposed Change
1. `src/data/imageCatalog.js` (가칭) 신설 — `CHAR_COUNT`, `CODES_PER_CHAR`, `SVG_CODES`, `TOTAL_IMAGES` 를 단일 export.
2. `Gallery.jsx`/`ImageSystemInfo.jsx`/`Updates.jsx`/메인 프롬프트 `db` 카운트 모두 동일 출처에서 파생.
3. 메인 프롬프트가 정식으로 정의하지 않는 카테고리(예: 연차 수련/오디션 무대 계열) 가 사이트에만 광고된다면, 그 코드의 _봇 측 핸들링_ 을 명시한 fallback 규칙을 메인 프롬프트에 추가하거나 사이트 카피를 좁혀야 한다.

#### Counterargument
“75/102 는 _계획된 최종 목표_, 메인 프롬프트는 _현 빌드의 현실_” 이라는 의도적 분리일 수 있다. 이 경우 카피에 “생성 진행 X / Y” 진행률을 노출하는 식으로 표현하면 모순이 아니라 진척도 신호가 된다.

#### What Would Disprove This
사용자가 “이 수치들은 의도된 다단(multi-tier) 카피 — 75는 코드 정의 기준, 102는 캐릭터 표정+컨셉 합산” 이라는 _공식 매핑_을 제시.

---

### Finding ID: PC-A-003

#### Area
도메인 2 — UX 퍼널 / 도메인 5 — 브랜딩(작동 안 할 가능성이 있는 카드)

#### Claim
GameModes 그리드의 ‘대표(CEO)’ 카드는 `detailPath: null` 상태로 노출되어, `<Link to={null}>` 가 React Router에서 어떻게 분기되든 _명확한 자세히 보기 동선_ 을 제공하지 않는다. 즉 `Career Modes` 섹션 6개 카드 중 1개는 잠재적 dead-click.

#### Evidence
- `src/data/gamemodes.js:103-114`
  ```js
  {
    id: "ceo",
    name: "대표",
    en: "CEO",
    trigger: "!대표모드",
    tagline: "남을 위해 깎는 길이 결국 자신의 길이 된다.",
    desc: "Route 0의 신임 대표가 되어 …",
    accent: "oklch(0.65 0.10 140)",
    icon: "🏢",
    detailPath: null,  // TODO: ModeCeo.jsx 구현 후 "/modes/ceo" 활성화
    location: "테라스 · Route 0 사무실",
    keyChar: "강하람 · 시아 · 노아",
  },
  ```
- `src/components/GameModes.jsx:271-274` — `careerModes.map(...)` 로 6개 모두를 `<Link to={cm.detailPath}>` 로 그린다.
  ```jsx
  {careerModes.map((cm, i) => (
    <Link
      key={cm.id}
      to={cm.detailPath}
      …
  ```

#### Impact
React Router v6 의 `<Link to={null}>` 은 명시적으로 동작이 보장되지 않으며, 일부 브라우저/버전에서 `to=""` 로 폴백되어 _현재 경로 재진입_ 이 일어날 수 있다. 사용자 입장에서는 “클릭이 먹히지 않는 카드”로 인식돼 신뢰도 손상. 또한 CTA 가 가장 늦게 추가된 6번째 모드일수록 _완성도 신호_ 로 쓰이므로 부정적 첫인상에 가깝다.

#### Severity
Critical (P0) — _‘배포된 상태에서 클릭 시도 시 실패 가능성’_ 차원에서 P0. 단순 disable 처리로 즉시 해소 가능하므로 reversibility 가 높다.

#### Confidence
0.90 (실제 브라우저에서의 동작은 검증 안 함; 소스만으로 90%)

#### Proposed Change
1. `GameModes.jsx` 의 `careerModes.map` 에서 `detailPath` 가 nullish 이면 `<Link>` 대신 `<div role="button" aria-disabled="true" title="준비 중">` 렌더링 + 시각적 dim 처리.
2. 상태 라벨 “준비 중” 배지 추가(에리카 카드의 `진행 중` 배지 스타일 재사용 — `Works.jsx` 의 `status` 배지 코드 패턴 재활용 가능).
3. 또는 `careerModes` 배열에서 `ceo` 항목을 임시 제거하고 _구현 완료 시점에 다시 추가_ — 그리드 5개로 정렬 깔끔.

```jsx
// 제안 패치 스니펫 (참고용, 본 라운드에서는 미적용)
careerModes.map((cm, i) => {
  const isReady = !!cm.detailPath;
  const Wrapper = isReady ? Link : "div";
  const wrapperProps = isReady
    ? { to: cm.detailPath }
    : { role: "button", "aria-disabled": "true", style: { cursor: "not-allowed", opacity: 0.55 } };
  return <Wrapper key={cm.id} {...wrapperProps} …>…</Wrapper>;
});
```

#### Counterargument
`<Link to={null}>` 은 RR v6 에서 콘솔 경고만 출력하고 실제로는 클릭이 무시될 수 있다. _‘아무 일도 일어나지 않음’_ 이 사용자에게 _‘아직 준비 중’_ 으로 자연 해석된다는 주장도 가능. 그러나 시각적 단서 0인 상태에서는 ‘버그’ 로 인식될 가능성이 더 높다.

#### What Would Disprove This
브라우저 실측 결과 클릭이 명백히 무동작이며 시각적으로도 다른 카드와 구분되어 사용자 혼동이 0에 가깝다는 데이터.

---

### Finding ID: PC-A-004

#### Area
도메인 2 — UX 온보딩 / 도메인 3 — 모드 명명

#### Claim
‘프리플레이’ 라는 이름이 메인 모드(`mainModes.id="freeplay"`) 와 유틸 모드(`utilityModes.id="freeplay-config"`, trigger `!프리플레이`) 두 곳에 동시에 등장한다. 한국어 카드 라벨이 거의 동일(‘프리플레이’ vs ‘프리플레이 설정’)해서, 신규 유저가 ‘메인 Free Play를 시작하는 명령’이 `!프리플레이`라고 오인할 가능성이 매우 크다.

#### Evidence
- `src/data/gamemodes.js:14-22` — 메인 모드
  ```js
  { id: "freeplay", name: "프리플레이", en: "Free Play", … detailPath: "/modes/freeplay" }
  ```
- `src/data/gamemodes.js:118-127` — 유틸리티 모드
  ```js
  { id: "freeplay-config", name: "프리플레이 설정", en: "Custom Freeplay", trigger: "!프리플레이", … }
  ```
- `src/components/GameModes.jsx:459-462` — 사용자에게 직접 보이는 카피로 _“!프리플레이는 메인 Free Play와 별개로, 원하는 관계·호칭·말투·상황을 유저노트용 한 줄 설정으로 정리해 유지하는 커스텀 오버레이입니다.”_ 라고 _뒤늦게_ 해소.

#### Impact
같은 페이지 안에서 유저는 `프리플레이` 라는 단어를 **두 개의 서로 다른 의미**로 마주친다. 사이트 카피가 “별개”라고 부연하는 시점이 _이미 카드를 본 후_ 라서, 카피가 손상 통제(damage control) 역할을 한다. 결국 _시작 명령어_ 라는 가장 중요한 인터페이스에서 인지 비용을 지불하게 된다.

#### Severity
Medium (P2)

#### Confidence
0.80

#### Proposed Change
- 유틸리티 모드의 한국어 라벨을 **차별화** — 예: `프리셋 모드`, `커스텀 설정`, `유저노트 빌더` 등.
- 또는 유틸리티 트리거를 `!설정` / `!프리플레이설정` / `!커스텀` 으로 변경.
- 사이트 카피와 메인 프롬프트(트리거 인식) 양쪽을 동시에 업데이트해야 _이름 변경_ 의 효과가 의미 있어진다.

#### Counterargument
이미 EdenChat 플랫폼에 102개 로어북이 등록된 상황에서 트리거 키워드 하나를 바꾸면 등록 매크로 재실행이 필요하다. 운영 비용이 있다.

#### What Would Disprove This
실제 사용자(혹은 UAT 데이터) 상에서 `!프리플레이` 와 ‘메인 Free Play’ 사이의 혼동률이 5% 미만이라는 증거.

---

### Finding ID: PC-A-005

#### Area
도메인 5 — 브랜딩 / Works 페이지의 약속 vs 회수

#### Claim
`Works.jsx` 는 “작가의 다른 작품” 라벨로 _복수의 작품 포트폴리오_ 를 약속한 뒤, 실제로는 본 프로젝트(프라임시티) 1건과 “더 많은 작품이 준비 중” 플레이스홀더만 노출한다. 작가 신뢰도 강화 페이지로 의도된 자리가 도리어 _진행 중 신호_ 로 작용한다.

#### Evidence
- `src/pages/Works.jsx:8-16`
  ```js
  const works = [
    {
      title: "프라임시티",
      en: "Prime City",
      desc: "전 세계가 주목하는 엔터테인먼트 특별자치구. 연예계 시뮬레이션 챗봇.",
      accent: C.gold,
      status: "진행 중",
    },
  ];
  ```
- `src/pages/Works.jsx:176-196` — placeholder 카드 영역
  ```jsx
  {/* Placeholder for future works */}
  <div style={{ … border: `1px dashed ${C.border10}`, … }}>
    <p>더 많은 작품이 준비 중입니다.</p>
  </div>
  ```
- 라우팅 · Navbar / TriangleNav 등에서 `/works` 가 노출되는 한, 신규 방문자는 “포트폴리오를 보러” 들어왔다가 동일 작품 1건만 마주친다.

#### Impact
- **포지티브 케이스**: 캐릭터 챗봇 작가의 일관된 브랜드 신호.
- **네거티브 케이스**: 작가 신뢰도가 _아직 1작품 작가_ 라는 인상으로 굳어짐. 본 사이트가 이미 ‘프라임시티 사이트’ 임을 알고 들어온 사용자에게는 자기참조적이며, _장기 IP 작가_ 임을 어필하려는 의도와 어긋난다.

#### Severity
Medium (P2)

#### Confidence
0.75 (의도/전략에 의존)

#### Proposed Change
세 가지 옵션 중 택일:
1. **메뉴 임시 비공개**: Navbar/TriangleNav 에서 `/works` 진입 제거(라우트는 유지) — 콘텐츠 보강 시 재공개.
2. **계획 카드화**: 플레이스홀더 자리를 ‘다음 IP — 가제 / 컨셉 한 줄 / 출시 분기’ 카드 1–2개로 채워 _라인업_ 신호로 전환.
3. **현재 작품 디테일 강화**: 프라임시티 카드에 _세부 라벨_(에피소드 수·캐릭터 수·업데이트 빈도)을 노출해 “1작품 = 깊은 작품” 톤으로 재포지셔닝.

#### Counterargument
‘아직 시작 단계’ 임을 솔직히 노출하는 톤이 신생 IP에는 더 적절할 수 있다.

#### What Would Disprove This
사용자가 “Works 는 의도적으로 공석으로 두고, 진척도 신호로만 쓴다” 라는 명시적 의도를 표명한 경우.

---

### Finding ID: PC-A-006

#### Area
도메인 5 — 브랜딩 일관성 / 캐릭터 외형 단일 소스

#### Claim
사이트의 캐릭터 카드(`src/data/characters.js`) 는 _시그니처(소품/제스처)_ 만 등록하고 외형(머리 길이·눈동자 색·하네스 등) 은 등록하지 않는다. 직전 세션에서 사용자가 외형 변경(하시은 단발→장발 등)을 도입한 경우, 변경이 사이트 카피에 반영됐는지 _grep으로_ 확인할 수단이 없다(데이터 자체에 외형 필드가 없으므로 false-negative 위험).

#### Evidence
- `src/data/characters.js` 전수 — `signature` 필드는 모든 캐릭터에 존재(예: HSE `메모/기록 습관 — 항상 뭔가를 적고 있음`, LPS `V사인 — 트레이드마크`) 하지만 _외형 묘사 필드_(`appearance`, `hair`, `eyes`) 는 0건.
- `docs/worldbuilding/캐릭터 프로필.md` (Glob 확인) — 외형 변경의 주 소스 추정.
- `docs/prompts/json/메인_프롬프트_EN.json:5` — `"캐릭터의 시각 시그니처(고유 소품, 상징적 디테일)만 외형 묘사에 활용한다."` 는 _시그니처 필드_ 가 봇 출력에 영향한다는 직접 증거.

#### Impact
외형 변경(하시은 장발/루비 눈동자, 라피스 장발 반묶음, 에리카 장발, 라피스/하시은 하네스 등) 이 도입돼도 사이트 데이터(`characters.js`) 의 단일 진실 원천에는 _이름표가 없는 영역_ 이라 검증이 어렵다. 이미지 에셋 / 로어북 / 사이트 카피 셋 중 어느 한 쪽이 누락되면 _봇이 말하는 외형_과 _사이트가 보여주는 이미지/카피_ 가 어긋날 수 있다.

#### Severity
Medium (P2)

#### Confidence
0.70 (외형 변경의 실제 반영 상태는 본 라운드에서 직접 grep 하지 않음 — 사용자 직전 세션 요약 의존)

#### Proposed Change
1. `characters.js` 에 `appearance` 객체 추가 — `{ hair, eyes, accessory, outfitNotes }`. 사이트 표시는 옵션이지만, 단일 소스 오브 트루스로서 grep 가능해진다.
2. 또는 `docs/worldbuilding/캐릭터 프로필.md` 를 _빌드 타임에 파싱_ 하여 `characters.js` 가 _참조_ 하는 구조로 전환(과도하면 단순 README 링크만이라도).
3. 변경 로그(`Updates.jsx`) 에 “외형 변경 캐릭터 N명 — 사이트·로어북·이미지 에셋 동시 반영” 항목을 명시해 _3축 동시 반영_ 의 검증 책임을 명문화.

#### Counterargument
사이트 카드는 _간결한 시그니처_ 가 미덕이고, 외형 묘사는 봇이 출력하는 _이미지_ 로 충분하다는 디자인 선택이 가능하다. 외형 필드 추가는 카피의 톤을 흐릴 수 있다.

#### What Would Disprove This
외형 변경이 적용된 _가장 최근 캐릭터_(예: 하시은) 의 경우 사이트 카피·R2 이미지·로어북 셋이 _이미 일치_ 한다는 grep 증거.

---

### Finding ID: PC-A-007

#### Area
도메인 6 — 콘텐츠 정책(코멘트 한정) / NSFW 게이트

#### Claim
Gallery NSFW 토글은 _단일 confirm_ 으로 즉시 활성된다. 한 번의 “확인” 클릭 후에는 동일 세션 동안 자유로이 토글 가능하며, _연령 미달자가 ‘확인’ 을 클릭하면 그대로 통과_ 하는 표준 ‘책임 이전(deflection)’ 패턴이지만, **모달 내 메시지가 한 번뿐이고 브라우저 reload 후 상태가 초기화되지 않는다**. (state 가 컴포넌트 내 `useState` — 새로고침 시 초기화는 됨. 그러나 _세션 간_ 만 초기화되고, 모달 자체에 ‘재확인 주기’ 가 없다.)

#### Evidence
- `src/pages/Gallery.jsx:412-467` — NSFW 모달 구현
  ```jsx
  {nsfwModal && (
    <div … aria-label="연령 제한 확인" …>
      <p>이 섹션에는 성인용(18+) 콘텐츠가 포함되어 있습니다.<br />
        <span …>만 18세 이상</span>이신가요?</p>
      <div …>
        <button onClick={() => { setNsfwEnabled(true); setNsfwModal(false); }}>확인</button>
        <button onClick={() => setNsfwModal(false)}>취소</button>
      </div>
    </div>
  )}
  ```
- `CLAUDE.md` — “에덴챗 소개 HTML 개편 완료 (… **confirm 팝업 제거**)” 라고 명시. 즉 _다른 자산_(에덴챗 소개 HTML) 에서는 confirm 을 제거했지만, _Gallery_ 의 NSFW confirm 은 그대로 남아 있다 — 정책의 _일관성_ 자체가 비대칭.

#### Impact
정책 측면에서 ‘에덴챗 소개 HTML 은 confirm 없이 진입, Gallery 는 확인 1단계’ 라는 _이중 기준_ 이 존재. 로컬 정책상 둘 중 어느 쪽이 _공식 노선_ 인지 명시되지 않으면, 향후 광고·플랫폼 노출에서 동일한 자산이 다른 게이트를 갖는 모순으로 보일 수 있다.

#### Severity
Low (P3) — Codex 가 도메인 6 을 우선 감사할 것이므로 본 항목은 _상호 검증_ 용 코멘트 수준.

#### Confidence
0.65

#### Proposed Change
정책을 _하나의 문서_(예: `docs/ai-council/domains/06_security_content_policy.md`) 로 명문화한 뒤, 사이트의 모든 NSFW 게이트가 동일한 정책을 따르도록 통일. 단순히 NSFW 토글의 _UX_ 만 변경할지(예: 영구 쿠키), 아니면 _법적 게이트_ 로 격상할지(예: 별도 라우트) 는 정책 결정.

#### Counterargument
법적 책임은 EdenChat 플랫폼 측에 있고, 사이트의 NSFW 토글은 ‘민감 콘텐츠 사전 경고’ 수준이면 충분하다는 입장.

#### What Would Disprove This
‘에덴챗 소개 HTML confirm 제거’ 가 의도된 정책 변경이며 Gallery 모달은 별도 보호 계층(가족 기기 노출 차단 등) 이라는 명시적 정책.

---

### Finding ID: PC-A-008

#### Area
도메인 2 — UX 퍼널 / 도메인 5 — 콘텐츠 명명

#### Claim
ImageSystemInfo 의 “Scene Codes — 75 per character + SVG 4” 표기는 _범위 별도 명세 없이_ 카운트만 노출한다. 사용자/방문자가 “75는 어떤 코드들의 합인가” 를 클릭으로 펼쳐 봐도 카테고리 라벨만 있을 뿐 _코드 리스트 자체_ 가 사이트에 없다.

#### Evidence
- `src/components/ImageSystemInfo.jsx:71-92` — `SCENE_CATEGORIES.map((sc) => …)`. `sc.label / sc.range / sc.en / sc.count` 만 출력.
- `src/data/galleryConfig.js` — `SCENE_CATEGORIES` 정의(본 라운드 직접 read 미수행, import 경로만 확인).
- `docs/prompts/json/메인_프롬프트_EN.json:78-81` — db 정의는 29개로 _좁다_.

#### Impact
사이트가 _“코드 시스템이 정교하다” 고 광고하지만, 실제로 코드를 _열람_ 하려면 메인 프롬프트 JSON 파일을 읽어야 한다. 사이트 방문자가 ‘봇 풍성도’ 를 직접 검증할 수단이 약하다. PC-A-002 의 수치 비일관성과 결합되면 ‘카운트 광고’ 가 도리어 의심 신호가 될 수 있다.

#### Severity
Low (P3)

#### Confidence
0.60

#### Proposed Change
ImageSystemInfo 의 펼침 영역에 _코드 → 라벨 매핑 테이블_(메인 프롬프트 db 의 정의를 그대로 가져와 정렬) 을 노출. 9 (감정) / 10 (일상) / 6 (로맨스) / 4 (무대) / … (NSFW 코드는 토글 게이트 안쪽) 식.

#### Counterargument
‘코드 시스템 = 백엔드 디테일’ 이라 일반 방문자는 깊이 알 필요가 없다. 풍성도 신호를 추가로 늘리는 것이 오히려 인지 비용.

#### What Would Disprove This
사이트 방문자 인터뷰/UX 설문에서 “코드 카운트만으로 충분하다” 는 응답이 우세.

---

### Finding ID: PC-A-009

#### Area
도메인 5 — 브랜딩 / 모드 카드의 _시작 동선_ 부재

#### Claim
GameModes 의 메인·직업군·유틸리티 카드는 _상세 페이지로의 분기_ 또는 _트리거 명령어_ 만 노출한다. 어떤 카드도 _그 자리에서 챗봇을 시작하는_ CTA 를 제공하지 않는다. 즉 “모드 → 챗봇” 의 한 단계가 비어 있다.

#### Evidence
- `src/components/GameModes.jsx:188-203` — 메인 모드의 마지막 CTA
  ```jsx
  <Link to={mode.detailPath} … >자세히 보기 →</Link>
  ```
- `src/components/GameModes.jsx:271-408` — 직업군 모드 카드 — `Link to={cm.detailPath}` 한 곳, 트리거 텍스트(`cm.trigger`) 한 곳. 외부 EdenChat URL 0건.
- `src/components/GameModes.jsx:471-558` — 유틸리티 모드 카드 — `<div>` (Link 아님). `um.trigger` 텍스트 노출만.

#### Impact
_모드 카드_ 는 사용자가 “이 모드를 해보고 싶다” 는 의향을 가장 명료하게 표현하는 지점이다. 그 자리에 챗봇 시작 진입이 없다 = PC-A-001 의 단일 진입 의존도가 모드 페이지 단계까지 확장됨을 의미한다.

#### Severity
High (P1)

#### Confidence
0.85

#### Proposed Change
- 메인 모드의 ‘자세히 보기 →’ 옆에 _보조 CTA_ ‘바로 시작 →’ 추가 — `EDENCHAT_BOT_URL` 사용.
- 직업군 모드 카드의 `cm.trigger` 텍스트를 _복사 가능한 chip_ 으로 만들고, 그 옆에 ‘이 트리거로 시작’ 보조 링크 배치(EdenChat 진입 후 자동으로 트리거 입력은 불가능하므로 _복사 + 안내_ 를 페어링).
- 유틸리티 모드는 _트리거 복사_ 만 추가해도 충분.

#### Counterargument
모드 상세 페이지(`/modes/*`) 가 ‘브리핑 단계’ 역할을 하고 있고, 그 마지막에 챗봇 시작이 있다면 카드 단계의 보조 CTA 는 중복일 수 있다. (모드 상세 페이지의 CTA 노출 여부는 본 라운드에서 모든 페이지 read 까지 수행하지 않음 — 검증 필요.)

#### What Would Disprove This
모든 `src/pages/Mode*.jsx` (8개) 에 EdenChat 진입 CTA 가 이미 존재한다는 grep 증거. (현재 grep 결과 0건이므로 이 반증은 _부재_ 한다.)

---

### Finding ID: PC-A-010

#### Area
도메인 3 — 로어북 파이프라인 / 도메인 5 — 카피 일관성 / 캐릭터 수

#### Claim
캐릭터 수의 _공식 카운트_ 가 문서 간 흐트러져 있다. CLAUDE.md 는 “20명”, Updates.jsx 는 “20번째 캐릭터 사피아”, ImageSystemInfo 는 `CHAR_CODES.length` 동적 카운트, Gallery 카피는 “20명 × 102장”. 그러나 _‘17명 체제’_(2026-04-14) 와 _‘19명’_(2026-04-19) 표현이 Updates.jsx 에 그대로 남아 있어, 신규 방문자가 처음 접하는 _순서대로 읽는 타임라인_ 에서 “17 → 19 → 20” 이라는 정상 진행을 보지만, ‘과거 항목’ 의 카운트가 이전 시점의 진실로 _고정_ 됐는지(즉, _historical 정보_)인지 _현재 사이트의 광고 카운트_ 인지 모호하다.

#### Evidence
- `CLAUDE.md` — “20명 캐릭터 (CDN코드)”
- `src/pages/Updates.jsx:11-21` (최신) — “20번째 캐릭터 사피아(SPA)”
- `src/pages/Updates.jsx:52-62` — “17명 체제 확장”
- `src/pages/Updates.jsx:91-97` — “17명 × 102장”
- `src/data/characters.js` — 배열 길이 20 (line 691 주석 `// ── 20. 사피아 ──`)

#### Impact
historical 카운트의 노출은 _진척도 서사_ 로서 의미가 있으나, 카운트가 비일관 출현하면 “20명 × 102장” 이라는 광고 카피와 “17명 × 102장” 이라는 과거 표현이 같은 페이지에 공존한다. 신규 방문자가 _현재 카운트_ 를 빠르게 식별하지 못할 수 있다.

#### Severity
Low (P3)

#### Confidence
0.60

#### Proposed Change
- 타임라인 항목의 _historical 카운트_ 옆에 작은 라벨(예: `(당시 17명)`) 또는 _현재 카운트는 N명_ 이라는 sticky 헤더를 노출.
- 또는 `Updates.jsx` 상단에 _현재 상태 카드_(캐릭터 N · 모드 M · ASSET_VERSION K)를 고정 표시.

#### Counterargument
업데이트 로그는 _시점 사진_ 이며, 시점별 수치가 그대로 남아 있는 것이 정직.

#### What Would Disprove This
사용자 인터뷰 결과 ‘historical 카운트’ 가 신규 방문자 혼동 요인 0%.

---

> Top 10 외 백로그 후보 — Round 2 에서 우선 검토 권고.

- **PC-A-101** (Hero CTA 절대 URL 하드코딩) — `src/components/HeroSlider.jsx:331` 의 절대 URL을 `src/data/links.js`로 분리. 단순 리팩터.
- **PC-A-102** (CharCarousel 전수 이미지 idle preload 비용) — `src/components/CharCarousel.jsx:39-54` 가 20명 키 이미지를 `requestIdleCallback` 으로 모두 preload. 모바일 데이터 비용 검토.
- **PC-A-103** (MMR 의 introComments 하드코딩) — `src/data/characters.js:360-376` 에 한글 댓글 15개 인라인. 향후 다국어/모더레이션을 고려하면 별도 데이터로 분리 권장.

---

## New-user onboarding risks

신규 방문자(=프라임시티/EdenChat 모두 처음 접하는 사용자) 관점에서 _첫 90초_ 의 위험.

| 위험 | 근거 | 발생 빈도 추정 |
|---|---|---|
| Hero CTA 를 무심코 지나치면 챗봇 진입을 다시 못 만남 | PC-A-001 — Hero 외 EdenChat 링크 0 | High |
| 모드 명칭 ‘프리플레이’ 가 두 의미로 등장 | PC-A-004 — `freeplay` vs `freeplay-config` | High |
| ‘대표 모드’ 카드 클릭 무반응 가능 | PC-A-003 — `detailPath: null` | Medium |
| 사이트 광고 수치(102/75/2,000장+) 의 차이로 인한 신뢰도 저하 | PC-A-002 + PC-A-008 + PC-A-010 | Medium |
| Works 가 실질적 비어있음 → 작가 신뢰도 1작품 인상 | PC-A-005 | Low–Medium |

추가 _구체적 동선 시나리오_:

- **시나리오 S1**(데스크톱, 잡지 톤 선호): Hero → Intro → Carousel → CityMap → GameModes → TriangleNav → Footer. 끝까지 본 뒤 “시작하고 싶다” 는 의향 발화 시점 = **EdenChat 링크가 화면 밖**. 평균 5–6 섹션 거리.
- **시나리오 S2**(모바일, 캐릭터 중심): Carousel 에서 캐릭터 1명 클릭 → CharDetail 의 시네마틱 인트로(JSH/KHR/MIL/…) → Sign 섹션 → Footer. 캐릭터 상세에서 _봇 시작_ 트리거 0건 → 사용자 _“이 캐릭터로 대화하고 싶다”_ 의 의향이 즉시 만족되지 않음.
- **시나리오 S3**(콘텐츠 검증형): Gallery → ImageSystemInfo 펼침 → 75/102/29 카운트 차이 발견 → 신뢰도 의문.

---

## EdenChat launch risks

EdenChat 플랫폼 출시(=정식 노출) 시 발생 가능한 위험.

1. **단일 슬러그 의존성** — `src/components/HeroSlider.jsx:331` 의 절대 URL 1건이 EdenChat 측 슬러그 변경 시 grep 로 즉시 잡히지만, _캐싱·SNS 공유 링크_ 측면에서는 이미 외부에 노출된 URL 변경의 리스크가 있다.
2. **로어북-사이트 메타 동기화 부재** — 메인 프롬프트(`docs/prompts/json/메인_프롬프트_EN.json`) 의 `img.codes` (20개 CDN 코드) 와 `src/data/characters.js` 의 `cdnId` 셋이 일치하지만, 누군가 한 쪽만 추가/삭제하면 즉시 _broken image_ 가 봇 응답에 노출된다(Domain 4 세부 — Codex 우선).
3. **NSFW 게이트 비대칭** — PC-A-007. 에덴챗 소개 HTML 과 사이트 NSFW 모달이 다른 게이트.
4. **Works 페이지 노출** — PC-A-005. 출시 시 _포트폴리오 깊이_ 신호로 약한 카드.
5. **‘대표(CEO) 모드’ ‘준비 중’ 표시 부재** — PC-A-003. 출시 시점에 dead-click 카드 1개는 인상 비용이 크다.
6. **트리거 명령어의 _복사 친화성 부족_** — 카드의 `cm.trigger` (`!매니저모드` 등) 가 일반 텍스트로 노출만 됨(`src/components/GameModes.jsx:397-407`). 클릭→복사 (clipboard API) 미구현 — 모바일에서 길게 눌러 복사해야 하는 추가 비용.
7. **출시 첫 주 통계 부재 위험** — `EDENCHAT_BOT_URL` 에 UTM 파라미터 적용이 없어, 어느 진입 동선이 효과적인지 측정 불가능.

---

## Branding and monetization opportunities

본 사이트가 _이미 갖고 있는 자산_을 수익화/브랜딩으로 더 끌어올릴 수 있는 지점.

1. **CTA 다중화 → 진입 측정 가능화** (PC-A-001) — UTM 파라미터(`src/data/links.js` 의 `edenchatStart({ utm })`) 를 통해 _Hero / Carousel / Char Detail / Mode Card / Footer_ 다섯 진입의 클릭률 측정. 데이터로 다음 라운드 의사결정.
2. **‘챗봇 시작’ 보조 카드의 모드별 차별화** — 캐릭터 상세 마지막 ‘Sign 섹션’ 직후에 _이 캐릭터와 시작_ 카드를 두면, 캐릭터가 곧 캐릭터 상세 페이지의 _이미지 광고_ 와 직결된다. 즉 사이트 자체가 _캐릭터 중심 랜딩 페이지_ 의 집합으로 작동.
3. **갤러리 코드 개념의 마케팅화** (PC-A-008) — “29 → 75 → 102” 의 진척도를 _진행률_ 카피로 바꾸고, 코드 시스템을 _공식 카탈로그_(별도 페이지) 로 노출. 리뷰어/팬덤이 _레퍼런스 가능_ 한 자료가 된다.
4. **에르피·아피리아·사피아 ‘무소속 라인’ 의 시각 묶음** — `characters.js` 의 `agency: "무소속"` 캐릭터 4명(JGR/MIL/ELA/MMR/HSE/NIA/RAY/LPS/APR/SPA — 10명) 중 ‘전설’ 계열(에르피[Blue Moon 대표], 아피리아, 사피아) 은 사실상 _상위 IP 군_ 으로 분리 가능. Carousel/Gallery 에 ‘레전드 라인’ 또는 ‘전설 아티스트’ 큐레이션 탭을 추가하면 _고가 IP_ 광고화.
5. **Works 페이지의 ‘다음 IP 카드화’** — PC-A-005 옵션 2.
6. **모드 트리거 _클립보드 복사_ UX** — 위 EdenChat launch risks #6 의 보완책. 작은 기능이지만 _“오, 친절하다”_ 느낌의 마이크로 인터랙션.

---

## Content consistency risks

본 라운드에서 _구조 차원_ 의 일관성 위험만 정리(로어북 본문 재작성은 금지). 본문 톤 자체는 다음 라운드의 Codex 도메인 3 진단과 교차 검증 권고.

1. **수치 카피 4중 분기** (PC-A-002, PC-A-008, PC-A-010): 102 / 75 / 29 / 1,631–2,000+ / 17–19–20명. _단일 소스_ 부재 시 누구도 동시 갱신을 보장할 수 없다.
2. **이름표 비대칭** — 메인 모드 ‘프리플레이’ vs 유틸 ‘프리플레이 설정’ (PC-A-004).
3. **외형 변경 단일 소스 부재** — `characters.js` 가 외형 필드를 가지지 않음(PC-A-006). 외형 변경의 _3축 동시 반영_(사이트/로어북/이미지) 검증 인프라 없음.
4. **CDN ID 와 캐릭터 ID 의 별도 키** — `src/data/characters.js` 가 `id` (route 키) 와 `cdnId` (CDN 키) 를 분리 운용. 19/20번 캐릭터 추가 시 두 키를 동시에 등록해야 하나 _이를 강제하는 빌드 검증_ 은 없음.
5. **시그니처 vs 외형 묘사 경계 모호** — `personality` 필드에 _외형적 단서_(예: HSR `실눈 + 다크서클 (이중 장치)`) 가 섞임. 카드 단위에서는 무난하나 _외형 변경 추적_에는 잡음.
6. **메인 프롬프트의 `img.codes` 리스트 vs `characters.js` 의 `cdnId`** — 둘 다 20개로 일치하지만, 정렬 순서·신규 캐릭터 추가 시 _수동 동기화_ 가 필요하다.
7. **‘에덴챗 소개 HTML’(외부 자산) 과 사이트 톤** — `CLAUDE.md` 가 언급한 ‘confirm 팝업 제거’ 등의 변경이 사이트 NSFW 모달과 다른 결정. 자산 별 톤·정책 통합 부재(PC-A-007).

---

## Recommended next 5 tasks

> 본 라운드에서 _프로덕션 코드 미수정_ 원칙을 준수하면서, 다음 라운드(또는 사용자 승인 후) 가 _가장 작은 변경으로 가장 큰 리스크 해소_ 가 가능한 5개 작업.

1. **[P0] CEO 모드 카드의 ‘준비 중’ 처리** — `src/data/gamemodes.js:103-114` 의 `detailPath: null` 항목을 `<Link>` 가 아닌 disabled 카드로 렌더(PC-A-003 패치 스니펫 참고). 1파일·약 15줄 수정.
2. **[P1] EdenChat URL 단일 export 분리** — `src/data/links.js` 신설 + `HeroSlider.jsx:331` 의 절대 URL 치환. 후속 단계(다중 CTA) 의 전제 조건이며, 단독으로도 유지보수 비용 감소(PC-A-001 / PC-A-101).
3. **[P1] 수치 카피 단일 소스화** — `src/data/imageCatalog.js` 에 `CHAR_COUNT / CODES_PER_CHAR / SVG_CODES / TOTAL_IMAGES` export. `Gallery.jsx:186` · `ImageSystemInfo.jsx:74` · `Updates.jsx:18,31,47` · `메인_프롬프트_EN.json:img.codes` 가 동일 출처를 참조하도록 정리(PC-A-002 / PC-A-008 / PC-A-010).
4. **[P1] 캐릭터 상세 페이지에 EdenChat ‘이 캐릭터로 시작’ 보조 CTA 추가** — `Default/Cinematic/JgrCharDetail` 3개 컴포넌트의 ‘Sign 섹션 직후’ 위치(이미 CLAUDE.md 의 _Sign 섹션 표준 위치_ 정의 존재) 에 단일 컴포넌트로 추가. UTM 파라미터로 _캐릭터 ID_ 노출하여 진입 측정(PC-A-001 / PC-A-009).
5. **[P2] ‘프리플레이’ 명칭 분리** — 유틸리티 모드를 `프리셋 / 커스텀 설정 / 유저노트 빌더` 중 1로 변경. `src/data/gamemodes.js:120-127` + `GameModes.jsx:459-462` + 메인 프롬프트의 트리거 인식 + 에덴챗 등록 매크로 재실행(PC-A-004).

---

## Questions for Codex

> Round 2 에서 Codex 와의 교차 검토를 위해, Codex 가 _이미 검증했거나 검증 예정_ 인 사항을 사전에 질의. (Round 1 에서는 Codex 결과를 보지 않았다.)

1. 도메인 4 측면 — `src/data/characters.js` 의 `cdnId` 20개 셋과 `docs/prompts/json/메인_프롬프트_EN.json:img.codes` 의 셋이 _런타임_ 에서 일치 검증되는 인프라가 있는가? 없다면 사전 검증 스크립트(`tools/`) 도입 우선순위는?
2. 도메인 6 — Gallery NSFW 모달(`src/pages/Gallery.jsx:412-467`) 과 ‘에덴챗 소개 HTML 의 confirm 제거’ 가 일관된 정책을 따르는지에 대한 Codex 의 판정은? PC-A-007 의 P3 등급에 동의하는가?
3. 도메인 4 — `ASSET_VERSION` 캐시 버스팅이 _이미지가 추가된 시점_ 마다 +1 되는 규칙(CLAUDE.md 명시) 인데, _구조적_ 자동화(예: pre-commit hook 의 R2 업로드 감지) 가 가능한가? 현재 휴먼 의존도 높음.
4. 도메인 1 — AGENTS.md 가 레포에 존재하지 않는 것으로 보인다(Glob 미확인). Codex 마이그레이션 문서의 _기준점_ 을 무엇으로 잡아야 하는지(=`CLAUDE.md` 단일?).
5. 도메인 4 — `tools/r2_sync_loop.py` 가 `Updates.jsx:47` 의 “1631/1632 완료” 와 같은 진척 카운트를 _자동 출력_ 하는가, 아니면 사용자가 수동 기록하는가? 자동 출력이라면 Updates.jsx 가 _이를 import_ 하도록 SSOT 화 가능.
6. 도메인 3 — 102개 로어북의 _트리거 키워드 충돌_ 검사 스크립트가 `tools/` 에 존재하는가? 없다면 PC-A-004 의 ‘프리플레이’ 케이스가 단독 사례인지 _체계적_ 으로 알 수 없다.

---

## Questions for the human moderator

> 본 감사가 가정에 의존하지 않도록, 사용자(human moderator) 의 명시적 응답이 필요한 항목.

1. **누락 입력 파일 확인** — 본 라운드 입력으로 지정된 다음 3개 파일이 _현 시점 레포에 존재하지 않는다_:
   - `docs/plan_intro_html.md`
   - `docs/prompts/_review_summary.md`
   - `docs/prompts/_review_v3_final.md`
   파일이 (a) 다른 경로에 있는지, (b) 본 라운드 직전에 삭제됐는지, (c) 처음부터 미작성인지 확인 부탁드린다. (b)/(c) 라면 _대체 경로_ 또는 _문서 미존재 사실_ 자체를 Round 2 의 입력에 명시 필요.
   //Moder:필요한 파일 아님. 무시해도 좋음.
2. **EdenChat URL 의 _정식 안정성_** — 현 슬러그(`https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f`) 는 변경 가능성이 있는가, 아니면 영구 핀 가능한가? 변경 가능하다면 PC-A-001 의 다중 CTA 도입 직전에 _UTM 표준_ 합의가 필요.
//Moder:영구 핀. dev url="https://www.eden-chat.com/edit-work/35e68463-aba5-488e-ac42-1ea15234df1f", for player="https://www.eden-chat.com/works/35e68463-aba5-488e-ac42-1ea15234df1f"
3. **Hero CTA 단일 노출의 _의도_ 여부** — PC-A-001 의 단일 CTA 가 _의도된 디자인_ 인지, 단순히 다중화가 아직 미구현인지 확인.
//Moder:미구현. 개선안 확립 필요. 단, 이보다는 최상단 nav에 리다이렉트 추가가 우선적 개선사항. 더불어, 현재 가장 먼저 노출되는 컨텐츠는 플랫폼 내의 작품 페이지이지, 소개 사이트가 아님. 참고.
4. **Works 페이지의 _전략_** — PC-A-005 의 세 옵션(메뉴 임시 비공개 / 라인업 카드화 / 현재 작품 디테일 강화) 중 어느 방향이 IP 전략에 부합하는가?
//Moder:추후 Creater 포트폴리오, 즉 제작자 소개 사이트 페이지를 따로 병설 예정. 그 사이트에 리다이렉트 할 것.
5. **‘CEO 모드’ 출시 일정** — PC-A-003 의 dead-click 위험을 _즉시 disabled 카드_ 로 막을지, 아니면 곧 출시하므로 _MVP 페이지를 빠르게 만들고_ 통과시킬지 결정 필요.
//Moder:이미 출시한 모드이고, 로어북 등록도 되어있는 모드임. 정보 수정 필요.
6. **NSFW 정책의 _공식 노선_** — PC-A-007 의 ‘에덴챗 소개 HTML confirm 제거’ vs ‘Gallery 모달 confirm 유지’ 중 어느 쪽이 정식 노선?
//Moder:이는 작품 정식 출시 직후 NSFW 이미지가 전부 채워져있지 않아 잠시 유저들의 NSFW 이미지로의 접근을 임시 차단했을 때 했던 조치. 현재는 정상적으로 NSFW 이미지 에셋에 접근 가능. 마찬가지로 정보 수정 필요.
7. **외형 변경 SSOT** — PC-A-006 — `docs/worldbuilding/캐릭터 프로필.md` 가 단일 진실 원천인가? 아니라면 `characters.js` 에 외형 필드를 추가해도 되는가? (직전 세션의 외형 변경이 사이트 카피에 반영됐는지 _재확인 책임_ 의 위치를 정해야 한다.)
//Moder:반영 되었으나, 교차검증 필요. "캐릭터 프로필.md"는 꽤 오래된 소스이나 여전히 유용한 정보가 많으므로 그대로 둘 것. 현재 `prompts/json/*` 내부 파일에 반영된 내용들이 가장 최신 정보이므로 참고.
8. **수치 카피 단일화의 _권한_** — PC-A-002 / PC-A-008 — `imageCatalog.js` SSOT 도입 시, _가장 좁은 정의_(메인 프롬프트 db = 29) 에 사이트 카피를 맞출지, _가장 넓은 정의_(102) 를 메인 프롬프트로 끌어올릴지의 결정.
//Moder:이미지 소스 원천은 `연예계/char_img/*`내부 프리픽스와 CloudeFlare R2 스토리지 prime 버킷. 메인 프롬프트의 경우, 챗봇 플랫폼에 수동 삽입해야하는 요소이므로 동시 갱신 어려움. 갱신 시 함께 수정하는 hook 등 추가 필요.
9. **세션 인수인계 메모의 _진실 여부_** — 직전 세션 요약에 ‘하시은 단발→장발’, ‘라피스 로우 포니테일→장발 반묶음’ 등 외형 변경이 있다고 적혀 있다. 본 라운드에서는 `docs/worldbuilding/캐릭터 프로필.md` 본문 검증을 수행하지 않았다 — Round 2 시점에 _반영 완료 상태_ 를 검증해도 되는가?
//Moder:굳이 검증하지 않아도 됨. `prompts/*` 내부 내용만 최신상태이면 충분.

---

## 종합 평가

| 항목 | 점수(1–5) | 비고 |
|------|----------|------|
| Impact (UX 퍼널 차원) | 4 | Hero 단일 CTA 의존성과 모드 카드 dead-link 가 _첫 90초 전환_ 에 직접 영향 |
| Likelihood (실제 발생 확률) | 4 | 본 감사 시점에 모두 _현 빌드_ 에서 재현 가능한 정적 증거 기반 |
| Reversibility (수정 난이도) | 4 | Top 10 의 8개는 단일 파일 패치(중간 패치 PC-A-002 만 SSOT 신설) |
| Scope (영향 파일 수) | 3 | 1–4 파일 / 항목. 단 PC-A-002 는 4–5 파일 동기화 필요 |
| Urgency (블로킹 여부) | 3 | Round 2/3 의 우선순위 결정에 영향 — 출시 임박 가정 시 4 |

종합 점수(루브릭 공식 `(Impact × 2 + Likelihood + Urgency) / 4`) = `(4×2 + 4 + 3) / 4` = **3.75 → 다음 스프린트 내 처리** 권고.

본 라운드의 Top 10 은 **단일 합의 발견 시 ×1.5 가중**(04_SCORE_RUBRIC) 을 받을 수 있도록 _파일·라인 단위 증거_ 와 _반증 조건_ 을 모두 명시했다. Round 2 에서 Codex 의 도메인 1·4·6 결과를 받아 교차 검토 시, PC-A-001 / PC-A-002 / PC-A-003 의 P0–P1 항목은 합의 가능성이 가장 높다고 본다.

---

> 본 문서는 Agent A(Claude) 의 Round 1 독립 감사 결과이며, 후속 Round 2(`round_02_claude_rebuttal.md`) 에서 Codex Round 1 결과와 교차 검토된다. 발견된 이슈는 `ISSUE_LEDGER.md` 합의 후 등재되며, 합의되지 않은 이슈는 `DECISION_LOG.md` 에 _기각/보류_ 사유와 함께 기록된다.
