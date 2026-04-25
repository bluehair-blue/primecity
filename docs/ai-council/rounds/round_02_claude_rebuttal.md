# Round 2 — Claude Rebuttal (Agent A)

> Round 1 의 Codex 감사(`round_01_codex_audit.md`) 와 Claude 감사(`round_01_claude_audit.md`),
> 그리고 두 문서에 직접 달린 **Moderator 주석(`//Moder:`)** 을 1차 입력으로 사용한 _교차 검토_ 결과.
> 본 라운드의 목적은 합의·반박·증거 보완을 통해 Round 3 의 종합(`round_03_synthesis.md`) 입력을 만드는 것이다.

## 라운드 메타데이터

- 날짜: 2026-04-25
- 에이전트: Claude (Agent A — Product · Narrative · UX 관점 유지)
- 입력:
  - `docs/ai-council/rounds/round_01_codex_audit.md` (Codex / Agent C — Implementation & Verification 관점)
  - `docs/ai-council/rounds/round_01_claude_audit.md` (Agent A — 본 에이전트의 Round 1)
  - `docs/ai-council/01_SESSION_BRIEF.md`
  - 두 문서에 흩어져 있는 모든 `//Moder:` 주석 (총 14건)
- 본 라운드에서도 **프로덕션 코드는 수정하지 않았다.** 로어북 본문도 재작성하지 않았다(Moderator 의 PC-C-003 답변에 따라 _무조건_ 보호 대상).
- 산출 형식: Codex 의 `PC-C-001 ~ PC-C-010` _Finding ID 단위로_ 5개 차원 응답. _일반 요약은 의도적으로 작성하지 않는다_(사용자 요청).

---

## Moderator 재정의(Reframings) — 본 라운드의 척도

본 라운드의 모든 영향 등급은 다음 _Moderator 입력_ 위에서 매겨진다. 각 항목은 두 Round 1 문서의 `//Moder:` 주석을 그대로 인용한 것이다.

| 키 | 인용 | 즉각적 함의 |
|---|---|---|
| MOD-1 | _“현재 가장 먼저 노출되는 컨텐츠는 플랫폼 내의 작품 페이지이지, 소개 사이트가 아님.”_ (Round 1 Claude Q3) | 사이트는 **2차 surface**. EdenChat 작품 페이지가 1차 진입. → 사이트 단의 CTA/UX 결함은 _launch 차단 사유로 격상되지 않는다_. |
| MOD-2 | _“이미 출시한 모드이고, 로어북 등록도 되어있는 모드임. 정보 수정 필요.”_ (Q5, CEO 모드) | CEO 는 _플레이 가능한_ 모드. UI(`/modes/ceo` + `ModeCeo.jsx`)와 사이트 카피가 _뒤늦게_ 따라가야 함. PC-C-004 / PC-A-003 의 권고 변경. |
| MOD-3 | _“로어북 json 파일 내부 trigger는 절대 건드리지 말 것 …모든 로어북은 파일 형식만 json일 뿐, 전부 수동으로 챗봇 플랫폼에 붙여 넣어야 하는 최중요 요소임.”_ (Codex Q3) | 로어북 JSON은 _데이터 모델_ 이 아니라 _수동 페이스트 매체_. 자동화/스키마 변경 금지. |
| MOD-4 | _“반드시 207개 non-combined로 운영되어야 함.”_ + _“207개 로어북이 수동 삽입 된 상태이다.”_ | 102/103/194 라는 모든 카운트는 stale. 207 = 단일 정답. |
| MOD-5 | _“프리뷰는 말 그대로 프리뷰이다. 실제 챗봇 플레이 중 출력되는 Worker SVG는 URL 내부 인라인을 반영해야 한다.”_ (Codex Q5) | 사이트 SVG 헬퍼와 Worker SVG 헬퍼는 _의도적으로 비대칭_. PC-C-007 의 “parity 추구” 권고는 거부 대상. |
| MOD-6 | _“HSR 인트로는 현재 전부 구현 완료. src 내부 내용이 정식.”_ (Codex Q1·Q2) | 12개 인트로(`cardDeal` 제외) 모두 완성. 문서가 stale. |
| MOD-7 | _“AGENTS.md를 표지판으로 삼는다. 단, … 실질적 분석 및 계획은 세부 파이프라인 문서에서 작성된다.”_ (Codex Q4) | AGENTS.md 는 canonical _표지판_. 단 실측치는 파이프라인 문서가 보유. |
| MOD-8 | _“항상 dry-run으로 검증할 것. 필요 시 localhost 브라우저 검증.”_ (Codex Q5) | Worker 배포·R2 업로드는 dry-run 우선. _실배포 검증_ 은 인간 트리거 시점만. |
| MOD-9 | _“모든 라운드가 끝나기 전 까지 실제 리포지토리 내부 중요 문서에 대한 편집은 금지한다.”_ (Codex Q1) | Round 4 종결 전 AGENTS.md/CLAUDE.md/CODEBASE_MAP.md 편집 금지. _수정 권고는_ Round 4 의 FINAL_IMPROVEMENT_PLAN 으로 이월. |
| MOD-10 | (NSFW 정책 Q6) _“이는 작품 정식 출시 직후 NSFW 이미지가 전부 채워져있지 않아 잠시 유저들의 NSFW 이미지로의 접근을 임시 차단했을 때 했던 조치. 현재는 정상적으로 NSFW 이미지 에셋에 접근 가능.”_ | 사이트 Gallery 모달은 _과거 임시 조치의 잔재_. PC-A-007 의 _이중 기준_ 진단은 사실이지만, 정식 정책은 _confirm 게이트 제거 방향_ 이다. |
| MOD-11 | (Hero CTA Q3) _“미구현. 개선안 확립 필요. 단, 이보다는 최상단 nav에 리다이렉트 추가가 우선적 개선사항.”_ | PC-A-001 의 _다중 CTA_ 권고는 유효하나, _Navbar 내 리다이렉트_ 가 최우선. |
| MOD-12 | (Works Q4) _“추후 Creater 포트폴리오, 즉 제작자 소개 사이트 페이지를 따로 병설 예정. 그 사이트에 리다이렉트 할 것.”_ | Works 페이지는 _장기적으로 외부 포트폴리오로 리다이렉트_. 본 사이트 내부 콘텐츠 보강 권고(PC-A-005 옵션 2/3)는 폐기 후보. |
| MOD-13 | (수치 SSOT Q8) _“메인 프롬프트의 경우, 챗봇 플랫폼에 수동 삽입해야하는 요소이므로 동시 갱신 어려움. 갱신 시 함께 수정하는 hook 등 추가 필요.”_ | _빌드 타임 SSOT 자동화_ 는 메인 프롬프트와 사이트 둘에 모두 강제할 수 없음. _hook 알림_ 으로 우회. |
| MOD-14 | (외형 SSOT Q7) _“반영 되었으나, 교차검증 필요. … 현재 prompts/json/* 내부 파일에 반영된 내용들이 가장 최신 정보이므로 참고.”_ | 외형 변경의 SSOT = `docs/prompts/json/*`. `characters.js` 는 _보조 카피_ 일 뿐 SSOT 아님. PC-A-006 의 권고 방향 수정. |

핵심 함의 — Moderator 입력은 두 감사를 **세 가지 축으로 압축**한다:

1. **Launch 차단 사유는 매우 좁다.** EdenChat 작품 페이지가 1차 surface 이므로(MOD-1), 사이트 단의 CTA/Works/UX 결함은 _차단 X_. 단, _사이트가 외부 인용/광고 surface 가 되는 순간_(예: 작가 명함, SNS 링크) 에는 launch 외 비용으로 환산.
2. **로어북·메인 프롬프트는 자동화 대상이 아니다.** MOD-3·MOD-4·MOD-13. 코덱스의 ‘스키마 통일/자동 검증’ 권고 다수가 여기서 _수정 대상이 아닌 보호 대상_ 이 된다.
3. **Round 4 까지 문서 편집 금지.** MOD-9. PC-C-005 / PC-A-002 등 ‘문서 충돌’ 발견은 _Round 4 의 FINAL_IMPROVEMENT_PLAN_ 으로만 이행되며, 본 라운드의 권고는 ‘무엇을 / 어떤 우선순위로 고칠지’ 까지만이다.

---

## Per-Finding Rebuttal (Codex Round 1)

> 각 항목은 사용자 지정 5개 차원으로만 응답한다. 일반 요약 없이 직진한다.

---

### Finding ID: PC-C-001 — Build / CI / Release gate

#### 1. Position

**Agree** (Confidence 0.92)

빌드 검증이 _개인 로컬 습관_ 에 의존한다는 진단은 코드 증거(`package.json:6-10`, `.github/workflows/claude-code-review.yml:34-41`, `.github/workflows/claude.yml:33-41`)와 정확히 부합한다. Cloudflare Pages 가 빌드를 수행한다는 반론(Codex Counterargument)은 _PR 단에서의 차단_ 을 보장하지 않는다 — Pages 빌드 실패는 _이미 머지된 후_ 의 신호다. 본 에이전트 Round 1 에서는 이 항목을 _다루지 않았다_(도메인 4·1 우선권을 Codex 에 양보) — 따라서 PC-C-001 은 Codex의 _단독 발견_ 이며, ×1.5 합의 가중치 대상은 아니지만 conf 0.96 의 강한 단독 발견이다.

#### 2. Product or user impact

**중간**. 빌드 깨진 PR 이 main 에 머지되면 Cloudflare Pages 자동 배포가 실패하거나 _구버전_ 으로 롤백되며, 이때 사용자가 보는 사이트는 _이전 빌드_ 또는 _500_ 으로 노출된다. 회복은 빠르지만(롤백·재배포), _UX 신뢰도_ 측면의 누적 비용이 있다.

#### 3. Branding impact

**낮음 — 잠재적**. 사이트가 _완벽함_ 을 약속하는 잡지 톤이라(예: HeroSlider 의 시네마틱 전환), 한 번의 _빈 화면_/_빌드 실패 페이지_ 노출도 톤 손상. 단 발생률 자체가 낮다.

#### 4. EdenChat launch impact

**낮음 (MOD-1 적용 후)**. 사이트는 2차 surface 이므로 빌드 실패가 _직접_ 챗봇 진입을 막지는 않는다. 다만 SNS·언론 인용 시 _깨진 사이트_ 가 노출되면 1차 surface 까지 거꾸로 영향.

#### 5. Block launch?

**No — 차단 사유 아님**. 그러나 _“오픈 베타” 또는 SNS 광고 단계 진입 직전_ 에는 추가 권장. CI 추가는 1파일·1워크플로 신설로 끝나는 reversible 작업(Codex 제안 yaml 그대로 채택 가능). MOD-9 에 따라 _Round 4_ 의 FINAL_IMPROVEMENT_PLAN 에 P1 으로 이월.

---

### Finding ID: PC-C-002 — EdenChat lorebook automation / Local runtime

#### 1. Position

**Partially Agree** (Confidence 0.80)

근거 두 갈래로 분리한다:

- **(a) `--list` 가 GUI 의존성에서 실패하는 구조** — Agree. `tools/edenchat_clipboard.py:45-57` 의 최상단 import 가 `pyperclip`/`pyautogui` 를 즉시 로드하므로, _목록 출력만 원하는 운영자_ 도 GUI 의존성 설치를 강요당한다. Codex 제안의 `load_ui_deps()` 지연 import 는 단순·안전.
- **(b) “102/103 vs 207 의 카운트 불일치”** — Partially Agree. _문서 카운트_ 가 stale 한 것은 사실(PC-A-002/PC-A-010 과 합의). 그러나 MOD-4 가 _“207개 로어북이 수동 삽입 된 상태”_ 라고 단정하므로, 운영 측 실태는 207. 즉 _스크립트가 실제로 207을 처리해 왔다_ 는 점에서 Codex의 _“삽입 재현성이 낮다”_ 는 결론은 _스크립트 동작 신뢰성_ 보다 _문서 신뢰성_ 의 문제로 더 많이 본다.
- **(c) 트리거 본문 키 관련 결합** — Codex 가 PC-C-003 과 같이 묶었다면 분리 필요. MOD-3 에 따라 본문 `trigger` 키는 _자동화 대상이 아님_ — 따라서 스크립트의 _파싱 로직_ 만 검증하면 된다(== `// --- TRIGGER ---` 주석만 인식하는지). 본 라운드에서 스크립트 파싱 로직은 직접 실행 검증하지 않았으나, MOD-3 + MOD-4 의 모순 없음(207개 모두 정상 삽입됨) 에서 역추정 가능.

#### 2. Product or user impact

**낮음**. 스크립트는 _운영자 PC 단_ 의 매크로. 사용자에게 직접 노출되는 코드 경로 아님. 진단 정확성 자체의 운영 비용 차원만 존재.

#### 3. Branding impact

**0**. 외부에 노출되지 않음.

#### 4. EdenChat launch impact

**낮음 (MOD-4 + MOD-3 적용 후)**. 207개가 _이미_ 삽입 완료 상태. 다음 _재삽입 사이클_(예: 21번째 캐릭터 추가 또는 트리거 변경) 시 _다시 207+α_ 를 처리해야 할 때만 위험.

#### 5. Block launch?

**No**. Codex 제안의 `load_ui_deps()` 리팩터 + 사용법 문서화는 _다음 재삽입 사이클 직전_ 에 처리하면 충분. Round 4 P2 로 이월.

---

### Finding ID: PC-C-003 — Lorebook schema / Prompt rules

#### 1. Position

**Disagree (제안된 행동에 한정)** + **Partially Agree (현상 진단에 한정)** (Confidence 0.85)

두 갈래로 분리:

- **(a) 현상 진단** — Codex 가 발견한 13개 위치(`나하린_EN.json:30,42,54` 등)에 본문 `"trigger"` 키가 존재한다는 _사실_ 은 정확. 또한 그것이 `AGENTS.md:233-235` 의 _“JSON 본문에 trigger 키 포함 금지”_ 규칙과 _문언상_ 충돌하는 것도 사실. → Agree.
- **(b) 제안된 행동** — `activation_condition`/`scene_condition`/`when` 으로 _이름을 바꾸자_ 또는 _검증 스크립트로 강제하자_ 는 권고. → **Disagree.** MOD-3: _“로어북 json 파일 내부 trigger는 **절대 건드리지 말 것** … 모든 로어북은 … 전부 수동으로 챗봇 플랫폼에 붙여 넣어야 하는 최중요 요소.”_ → 데이터 보호가 _문서 일관성_ 보다 우선.

올바른 행동(본 라운드의 대안 권고):

1. `AGENTS.md` 의 _“JSON 본문 trigger 키 금지”_ 규칙을 _“플랫폼 트리거 키만 금지. 캐릭터 행동 조건/내러티브 조건 의미의 `trigger` 키는 허용 — 단 `// --- TRIGGER ---` 주석과 의미 구분”_ 으로 정정.
2. `tools/edenchat_clipboard.py` 의 트리거 _파싱 로직_ 이 본문 `trigger` 키를 무시하고 _주석만_ 보는지 검증(직접 실행 미수행 — Round 3 에서 검증 권고).
3. 데이터 자체는 변경하지 않는다.

#### 2. Product or user impact

**0**. 본문 `trigger` 키는 봇 응답에 _직접_ 영향하지 않는다(NPC 행동 조건의 _원본 텍스트_ 일 뿐, 플랫폼이 키 자체를 트리거로 인식하지 않는다 — MOD-3 의 _“형식만 JSON”_).

#### 3. Branding impact

**0**.

#### 4. EdenChat launch impact

**0** — 데이터를 _건드리지 않으면_. 만약 Codex 제안대로 13개 위치를 변경하면 _전체 재삽입_ 이 강요되며 그때 위험 발생.

#### 5. Block launch?

**No**. 그러나 _Codex 제안을 그대로 실행하면_ 207개 재삽입을 강제 = 즉각적 _자해_ 위험. 이 finding 은 “행동 거부 + 문서 정정” 으로 종결되어야 한다.

---

### Finding ID: PC-C-004 — Frontend UX / GameModes CEO card

#### 1. Position

**Agree (사실 진단)** + **Reframe (행동 권고)** (Confidence 0.96)

본 에이전트의 PC-A-003 과 _독립 합의_. 04_SCORE_RUBRIC 의 ×1.5 가중치 대상. 두 감사 모두 동일 라인(`src/data/gamemodes.js:103-114`, `src/components/GameModes.jsx:271-275`)을 인용했다. _사실 진단은 100% 일치_.

행동 권고에서는 **MOD-2 가 게임 체인저**: _“이미 출시한 모드이고, 로어북 등록도 되어있는 모드.”_ — 즉 CEO 는 _플레이 가능한_ 모드인데 _사이트 UI_ 만 _“미구현”_ 으로 표시되고 있다. 이는 “disabled card 처리(Codex 옵션 A · 본 에이전트 PC-A-003 1차 권고)” 가 _틀렸다_ 는 의미: disabled 처리는 _“곧 구현될 모드”_ 의 임시 카드용이며, _이미 플레이 가능한 모드_ 에는 그 자리에 **`/modes/ceo` 라우트 + `ModeCeo.jsx` 페이지** 가 와야 한다.

#### 2. Product or user impact

**높음**. 모드는 _작동_ 하는데 카드만 _미작동처럼 보인다_. 사용자 입장에서는 _“이 모드는 안 되는구나”_ → _“다른 모드도 의심”_ 의 부정 연쇄. PC-A-003 Counterargument 의 _“클릭 무반응 = 자연스러운 ‘준비 중’ 해석”_ 가설은 MOD-2 입력 하에서는 _틀림_. (실제로는 _준비 중이 아닌_ 모드를 _준비 중처럼_ 보이게 만드는 잘못된 신호.)

#### 3. Branding impact

**높음**. 6개 모드 중 1개가 _작동 안 하는 것처럼_ 보이는 카드는 _“완성도 1/6 손실”_ 의 인상 비용. 작가의 IP 신뢰도에 직접 작용.

#### 4. EdenChat launch impact

**중간 (MOD-1 보정 후)**. 사이트가 2차 surface 라도, _2차 surface 의 광고 카드가 1차 surface 의 _이미 작동 중인 모드_ 를 _숨기는_ 비대칭은 측정 가능한 _숨은 모드_ 손실. 즉 “플레이 가능한 모드 6개” 라는 약속이 “플레이 가능한 모드 5개” 처럼 보임.

#### 5. Block launch?

**Conditional Yes (지연 권고가 아닌 _즉시 수정_ 권고)**.

차단 사유는 _launch_ 가 아니라 _이미 launch 된 모드의 사이트 측 노출_. 두 옵션 중 택일 권고:

- **옵션 A (즉시·소규모)**: `careerModes[ceo].detailPath = "/modes/ceo"` 로 변경 + _임시_ `ModeCeo.jsx` 페이지(다른 Mode 페이지의 골격 재사용 — 예: `ModeManager.jsx` 145줄 가량) 빠르게 생성. MVP 카피 + 트리거(`!대표모드`) 안내 + EdenChat 진입 CTA(MOD-11).
- **옵션 B (즉시·최소)**: `gamemodes.js` 의 ‘대표’ 카드를 임시 _제거_ 하여 그리드 5개로 정렬. 카드가 광고하지 않으면 _광고 누락_ 비용은 있으나 _작동 안 하는 카드_ 보다는 낫다. → MOD-2 가 _“정보 수정 필요”_ 라 명시했으므로, _옵션 A_ 가 의도에 더 가깝다.

본 에이전트는 **옵션 A** 를 권고. 1–2 파일·1라우트 추가로 종결되며 reversibility 상.

---

### Finding ID: PC-C-005 — Documentation accuracy / Onboarding

#### 1. Position

**Agree** (Confidence 0.99)

본 에이전트의 PC-A-002 / PC-A-008 / PC-A-010 과 _부분 합의_. Codex 의 진단 범위가 더 넓다(메신저 도메인 `msg → talk` 까지 포함). _증거의 정확성_ 은 100% 검증된 라인 인용. ×1.5 가중치 대상.

핵심 stale 항목 정리(Codex 인용 + 본 에이전트 보강):

| 항목 | stale 표현 | 현실 | 위치 |
|---|---|---|---|
| 캐릭터 수 | 17명 (CODEBASE_MAP.md:85) / 15명·17명 (Updates 과거 항목) | **20명** | `src/data/characters.js` 배열 길이 |
| 로어북 수 | 194 (CODEBASE_MAP.md, 02_REPO_BASELINE.md) / 102·103 (AGENTS.md:441-453) | **207 non-combined** (MOD-4) | `docs/prompts/json/` |
| INTRO_COMPONENTS | 3개 (AGENTS.md:187, CLAUDE.md:187) | **12개** (MOD-6) | `src/components/cinematic/index.js:14-27` |
| Sign 등록 | 15명 완료 | **20명 모두** | `src/data/characters.js` 전수 |
| ASSET_VERSION | 11 (AGENTS.md:291) | **28** | `src/utils/cdn.js:6` |
| 메신저 도메인 | `msg.bluehair.blue` (CODEBASE_MAP.md:138) | **`talk.bluehair.blue`** | `docs/prompts/json/SVG_메신저_EN.json:4`, `templates-sns.js:371` |
| 시네마틱 진척 | Step 7a~7e _진행 중_ | **모두 완료** (MOD-6) | `src/components/cinematic/` 12개 파일 |
| Char Detail SIA/NOA | introStyle 없음 (DefaultCharDetail.jsx:4-5) | **neon, silence 보유** | `src/data/characters.js:520-560` |
| `cardDeal` | HSR 진행 대상 (AGENTS.md:435) | **dead config** (`introStyles.js:53-59` 만 잔존, registry 미등록) | MOD-6 |

추가로 본 에이전트가 Round 1 에서 발견한 이미지 카탈로그 수치 4중 분기(102/75/29/2,000+/1,631) 도 동일 카테고리.

#### 2. Product or user impact

**낮음** (사용자에게 직접 보이는 충돌은 PC-A-002 의 102/75/29 정도). 그러나 _누적_ 시 사이트 카피 신뢰도 저하.

#### 3. Branding impact

**중간**. _“우리 봇이 얼마나 큰가”_ 라는 가장 단순한 마케팅 질문에 _4–5 가지 답_. PC-A-002 의 진단과 동일.

#### 4. EdenChat launch impact

**낮음 (MOD-1 적용 후)**. 1차 surface 는 EdenChat 작품 페이지이며, 그곳의 카피는 _별도 자산_(에덴챗 소개 HTML — `CLAUDE.md` 가 이미 _“20명 총괄”_ 표기로 갱신했다고 명시). 사이트 단의 stale 한 표기가 1차 surface 까지 역류하는 경로는 좁다.

#### 5. Block launch?

**No** — 그러나 _MOD-9 에 의해 본 라운드에서는 수정 불가_. Round 4 의 FINAL_IMPROVEMENT_PLAN 의 _가장 큰 문서 작업 카테고리_ 로 이월. 권고 우선순위:

1. (P1) `ASSET_VERSION` / 캐릭터 수 / 로어북 수 / INTRO_COMPONENTS 수 — 4 항목은 _동적 카운트_ 로 산출 가능. Codex 제안의 PowerShell `Select-String` 검증 명령을 _문서 빌드 단계_(또는 README 의 “인용 시 grep 명령” 박스) 에 명시.
2. (P2) 메신저 도메인 `msg → talk` 통일.
3. (P2) 시네마틱 진척 라벨 ‘진행 중 → 완료’.
4. (P3) `cardDeal` dead config 제거 또는 _“reserved”_ 주석.

#### 추가 — Codex 의 “Stale or contradictory documentation” 별도 절

Codex 가 별도 절(`Stale or contradictory documentation`) 로 정리한 11개 항목은 사실상 PC-C-005 의 expansion. 모두 Agree. 추가 발견 없음.

---

### Finding ID: PC-C-006 — Cinematic intro registry / Implementation status

#### 1. Position

**Agree** (Confidence 0.95)

MOD-6 (_HSR 인트로 전부 구현 완료, src 내부 내용이 정식_) 가 Codex 의 진단을 _직접 확인_ 한다. `cardDeal` 은 폐기·예약 둘 중 _분명한 결정_ 이 필요 — Moderator 가 _“구현 완료”_ 라고 단언했으므로 → **폐기**. PC-C-005 와 한 묶음으로 처리 가능하나 별도 finding 으로 유지하는 게 추적성에 유리.

#### 2. Product or user impact

**0** (런타임 영향 없음). registry 미등록 이라 _사용자에게 노출되지 않는 dead config_.

#### 3. Branding impact

**0**.

#### 4. EdenChat launch impact

**0**.

#### 5. Block launch?

**No**. Round 4 P3.

권고 행동(Round 4 이행):

```diff
// src/data/introStyles.js
- cardDeal: { duration: ... },  // (legacy reservation)
+ // cardDeal: removed (HSR currently uses 'wind'; see AGENTS.md cinematic registry)
```

또는 “reserved — 미사용” 주석을 명시. AGENTS.md 의 캐릭터별 진척 라벨(`Step 7a~7e 진행 중`) 을 `완료(2026-04-12)` 로 정정.

---

### Finding ID: PC-C-007 — SVG template parity / Site preview vs Worker runtime

#### 1. Position

**Disagree (제안된 행동)** + **Partially Agree (진단)** (Confidence 0.85)

진단(헬퍼 둘이 `data:` 허용 정책에서 다르다)은 정확. `src/data/svgTemplates/helpers.js:27-35` 와 `workers/svg-sns.js:6-15` 의 코드 비교는 100% 일치하는 fact-check.

그러나 _제안된 행동_(둘을 동일 정책으로 정렬) 는 **MOD-5 가 명시적으로 거부**: _“프리뷰는 말 그대로 프리뷰. 실제 챗봇 플레이 중 출력되는 Worker SVG는 URL 내부 인라인을 반영해야 한다.”_ — 즉 두 헬퍼는 _의도적으로 비대칭_ 이며, Worker 만 canonical.

올바른 행동:

1. `src/data/svgTemplates.js:3-6` 의 _“Keep in sync”_ 류 주석을 **명확화** — _“site preview = SVG 구조 검증용, Worker = 실제 렌더 산출. 이미지 URL 처리 정책은 의도적으로 다름(Worker 만 data: 인라인)”_ 같은 한 줄로 _불일치를 정상으로 명시_.
2. `workers/plan_sub_image_inline.md` 가 이미 보유한 _“fetchAsDataUri / safeImageUrl data URI 통과”_ 체크리스트 항목을 사이트 헬퍼 측 주석에 _뒷연결_.
3. parity 테스트(스냅샷)는 _그릴 필요 없음_.

#### 2. Product or user impact

**0**. 사이트 프리뷰는 개발자 도구 — 사용자에게 노출되지 않는다(`src/pages/SvgIntro.jsx` 가 _데모 갤러리_ 목적이라 가정 — 본 라운드에서 직접 read 미수행. Round 3 에서 검증 권고).

#### 3. Branding impact

**0**.

#### 4. EdenChat launch impact

**0**. 챗봇이 받는 것은 _Worker_ 출력이므로 — 그쪽이 정상이면 끝.

#### 5. Block launch?

**No**. 본 finding 은 “문서 정정” 으로 종결.

---

### Finding ID: PC-C-008 — Image pipeline / Legacy path safety

#### 1. Position

**Agree** (Confidence 0.92)

`tools/extract_char_prompts.py:8-9, 44` 의 `BACKUP_DIR = ... / "_OLD_DO_NOT_USE_캐릭터이미지_use_char_img" / ...` 하드코딩은 `AGENTS.md:302-304` 의 _“레거시 폴더 어떤 경우에도 참조하지 말 것”_ 규칙과 정면 충돌. 진단 정확.

본 에이전트 Round 1 에서는 도메인 4 우선권을 Codex 에 양보하여 직접 검증하지 않았던 영역이므로 _독립 합의_ 는 아니지만, _비반박_(non-contradiction).

#### 2. Product or user impact

**0** (사용자 노출 없음). _운영자 실수_ 가능성만 존재.

#### 3. Branding impact

**0**.

#### 4. EdenChat launch impact

**0**. 스크립트는 launch path 에 없음.

#### 5. Block launch?

**No**. Round 4 P2 — Codex 제안의 두 옵션 중 하나 선택:

- (a) `tools/extract_char_prompts.py` 를 `LEGACY/` 디렉터리로 이동(MOD-9 에 의거 Round 4 이후).
- (b) 실행 시 기본 가드 추가:

  ```python
  if not args.allow_legacy:
      raise SystemExit("legacy backup extraction is disabled; use char_img/ as source")
  ```

본 에이전트는 (a) 를 더 선호 — `LEGACY/` 가시화로 _“이 코드는 죽었다”_ 를 명백히 표시.

---

### Finding ID: PC-C-009 — Source hygiene / Replacement chars `�`

#### 1. Position

**Agree** (Confidence 0.97)

`src/pages/CharDetail.jsx:2`, `src/components/CinematicCharDetail.jsx:3,16,60`, `DefaultCharDetail.jsx:114`, `CharSign.jsx:20` 의 6개 위치에 U+FFFD 가 실제로 저장돼 있다(Codex 검증 명령 `rg -n "�"` 인용). 주석 영역이라 런타임 영향 0.

#### 2. Product or user impact

**0** (주석 한정).

#### 3. Branding impact

**0** (사용자에게 노출 없음).

#### 4. EdenChat launch impact

**0**.

#### 5. Block launch?

**No**. Round 4 P3. 단순 grep+교정 작업이므로 작업 비용 낮다.

부수효과: 인코딩 가드(예: `pre-commit`) 를 같은 시점에 추가하면 _재발 방지_. MOD-9 에 의거 Round 4 이행.

---

### Finding ID: PC-C-010 — Cloudflare Worker deployment / Compatibility date drift

#### 1. Position

**Agree** (Confidence 0.85)

`wrangler.jsonc:4` 의 `2025-09-27` 와 `workers/deploy/deploy.sh:32` 의 하드코딩 `2024-01-01` 은 정확한 fact-check. 즉시 장애는 아니나 _런타임 일관성_ 위험.

본 에이전트 Round 1 에서는 도메인 4 미감사. _비반박_.

#### 2. Product or user impact

**낮음**. 일치하지 않는 compat date 가 _드리프트로 누적되면_ Worker 측 fetch/encoding/Response header 처리에서 차이가 생길 수 있다. _발생률은 매우 낮으나_ 경계 사례에서 디버깅 비용이 크다.

#### 3. Branding impact

**0** (사용자 노출 없음).

#### 4. EdenChat launch impact

**낮음 (MOD-8 보정)**. _“항상 dry-run 으로 검증”_ 원칙 하에서는 dry-run 시 발견 가능.

#### 5. Block launch?

**No**. Round 4 P2 — Codex 제안의 변수화(`COMPATIBILITY_DATE` 환경 변수 또는 deploy.sh 상단 상수) 채택. 코드 1줄 수정.

---

## Codex 의 “Recommended next 5 tasks” 와의 매핑

Codex 가 마지막에 제시한 5개 후속 작업과 본 에이전트 Round 1 의 5개 후속 작업을 _합쳐_ 보면, 합의·신규·우선순위 변동이 다음과 같다:

| Codex 후속 | Claude 후속 | 합의 여부 | 권고 우선순위(MOD 보정 후) |
|---|---|---|---|
| 1. Build CI 추가 | (해당 없음) | Codex 단독 | **P1** |
| 2. CEO 모드 카드 처리 | 1. CEO 카드 ‘준비 중’ 처리 | **합의 ×1.5** — 단 행동은 MOD-2 에 따라 _disabled_ 가 아니라 _ModeCeo.jsx 신설_ | **P0 (즉시)** |
| 3. 로어북 검증 스크립트 | (해당 없음) | Codex 단독 — _단 MOD-3 적용으로 “수정 X, 검증 O”_ | **P2** |
| 4. 문서 기준선 갱신 | (수치 카피 단일화 PC-A-002) 부분 합의 | **합의 ×1.5** | **P1 (Round 4 의 단일 큰 작업)** |
| 5. EdenChat 자동화 실행성 복구 | (해당 없음) | Codex 단독 | **P2** |
| (해당 없음) | 2. EdenChat URL 단일 export | Claude 단독 + MOD-11 보강 | **P1** |
| (해당 없음) | 3. 수치 카피 단일 SSOT (`imageCatalog.js`) | Claude 단독 — MOD-13 에 의해 hook 알림 형태로 우회 | **P1** |
| (해당 없음) | 4. 캐릭터 상세 EdenChat ‘이 캐릭터로 시작’ CTA | Claude 단독 — MOD-11 에 의해 우선순위 _Navbar 리다이렉트_ 다음으로 | **P2** |
| (해당 없음) | 5. ‘프리플레이’ 명칭 분리 | Claude 단독 — MOD-3 보정 시 207 재삽입 비용 큼 | **P3 (보류)** |

종합 _실행 우선순위_(Round 4 FINAL_IMPROVEMENT_PLAN 후보):

1. **P0** — CEO 모드 사이트 노출 정상화 (`ModeCeo.jsx` + `/modes/ceo` 라우트). 1–2 파일.
2. **P1** — Navbar 에 EdenChat 리다이렉트 CTA 추가 (MOD-11 명시). `src/data/links.js` SSOT 와 동시 도입.
3. **P1** — Build CI 워크플로 신설 (PC-C-001).
4. **P1** — 문서 기준선 갱신 (PC-C-005 + Stale 절). MOD-9 에 의해 Round 4 종결 직후 일괄.
5. **P2** — `tools/edenchat_clipboard.py` 의 lazy import + 207 카운트 명시 (PC-C-002).
6. **P2** — Worker compatibility date 변수화 (PC-C-010).
7. **P2** — `extract_char_prompts.py` LEGACY 이동 또는 가드 (PC-C-008).
8. **P2** — 캐릭터 상세 EdenChat CTA (Claude 단독 권고, MOD-11 보정).
9. **P3** — `cardDeal` dead config 정리 (PC-C-006).
10. **P3** — U+FFFD 교정 + 인코딩 pre-commit (PC-C-009).
11. **보류** — ‘프리플레이’ 명칭 변경(PC-A-004) — 207 재삽입 비용이 효익보다 큼. 다음 _대규모 재삽입 사이클_ 에 통합.
12. **폐기** — Codex PC-C-003 의 _“본문 trigger 키 이름 변경”_ — MOD-3 에 의해 거부. 단 _문서 규칙 정정_ 으로 변환.
13. **폐기** — Codex PC-C-007 의 _“site preview ↔ worker SVG parity”_ — MOD-5 에 의해 거부. 단 _주석 명확화_ 로 변환.
14. **폐기** — Claude PC-A-005 의 _Works 페이지 보강_ 옵션 2/3 — MOD-12 에 의해 _외부 포트폴리오 리다이렉트_ 로 대체.
15. **폐기** — Claude PC-A-007 의 _Gallery NSFW 모달 1-step confirm_ 진단의 _“이중 기준”_ 해석 — MOD-10 에 의해 _임시 조치의 잔재_ 로 재정의. 정식 정책은 _confirm 게이트 제거_ 방향. 즉 _Gallery 모달도 제거 권고_.

---

## 추가 메모: Launch-blocking 판정 정리

> 사용자가 5개 차원 중 _“launch 차단 여부”_ 만 단독 추적할 수 있도록 한 표.

| Codex Finding | 진단 등급(Codex) | MOD 보정 후 차단 여부 | 비고 |
|---|---|---|---|
| PC-C-001 (Build CI) | High / P1 | **No** | 발생률 낮음. 사이트=2차 surface. 오픈 베타 직전 P1. |
| PC-C-002 (edenchat_clipboard) | High / P1 | **No** | 207개 이미 삽입 완료. 다음 사이클에 처리. |
| PC-C-003 (trigger keys) | Medium / P2 | **No (행동 거부)** | MOD-3 의 _절대 보호_. 데이터 변경 X. |
| PC-C-004 (CEO card) | High / P1 | **Conditional Yes** | _이미 launch 된 모드_ 가 사이트에서 _작동 안 하는 카드_ 처럼 보이는 비대칭. ModeCeo.jsx 즉시 신설 권고. |
| PC-C-005 (Doc accuracy) | Medium / P2 | **No** | Round 4 일괄 갱신. |
| PC-C-006 (cardDeal/HSR) | Medium / P2 | **No** | dead config 정리. |
| PC-C-007 (SVG parity) | Medium / P2 | **No (행동 거부)** | MOD-5 의 _의도된 비대칭_. |
| PC-C-008 (legacy folder) | Medium / P2 | **No** | 운영자 실수 방지 차원. |
| PC-C-009 (replacement chars) | Low / P3 | **No** | 주석 한정. |
| PC-C-010 (compat date) | Medium / P2 | **No** | dry-run 보호. |

**결론**: Codex 의 10개 finding 중 **launch 차단 사유에 가장 가까운 것은 PC-C-004 단 1건** 이다(그것도 _“이미 launch 됐는데 사이트가 못 따라가는”_ 비대칭 차원). 두 감사가 합의한 다른 항목은 모두 _Round 4 의 문서·자동화 보강_ 으로 종결 가능.

---

## 본 에이전트 Round 1 발견의 _Moderator 보정_ 결과

> Round 1 Claude 발견 중 Moderator 주석으로 _권고 방향이 변경된_ 항목만 명시(반복 회피).

- **PC-A-001 (EdenChat CTA 분산)** — 유지. 단 우선순위 1번은 _Navbar 리다이렉트_(MOD-11) 로 변경. `src/data/links.js` SSOT 도입은 그대로 유효.
- **PC-A-003 (CEO 카드)** — Codex PC-C-004 와 합의. 권고 행동 _disabled 카드_ → _ModeCeo.jsx 신설_ 로 변경(MOD-2).
- **PC-A-005 (Works 페이지)** — 옵션 2/3(라인업 카드화/디테일 강화) 폐기. **외부 포트폴리오 사이트로 리다이렉트**(MOD-12) 만 유효. `Works.jsx` 의 _placeholder 카드_ 는 _“Creator 포트폴리오는 별도 사이트”_ 안내로 교체 권고.
- **PC-A-006 (외형 변경 SSOT)** — 권고 방향 수정. `characters.js` 에 외형 필드를 _추가하지 않음_. SSOT = `docs/prompts/json/*` (MOD-14). `docs/worldbuilding/캐릭터 프로필.md` 는 _historical reference_ 로 유지.
- **PC-A-007 (NSFW 모달 이중 기준)** — _“이중 기준”_ 진단은 사실이지만, MOD-10 에 의해 _Gallery 모달 confirm 자체가 임시 조치의 잔재_. 정식 정책 = _confirm 제거_. 권고 행동은 “정책 통일” 이 아니라 “Gallery 모달 제거”.
- **PC-A-002 / PC-A-008 / PC-A-010 (수치 카피)** — Codex PC-C-005 와 합의 ×1.5. SSOT 자동화는 MOD-13 에 의해 _빌드 타임 강제 X_. _hook 알림_ 으로 우회.

---

## Questions Forwarded to Codex (Round 3 Synthesis 전 검증 권고)

1. **PC-C-002 의 `pyperclip` lazy import 패치 후 `--list` 가 정상 출력하는지** 운영자 PC 에서 검증해 주는 것이 가능한가? 현재 Codex 런타임 에서는 GUI 의존성이 부재(증거 인용된 `# pip install pyperclip 필요`).
2. **PC-C-003 의 13개 `"trigger"` 본문 키가 실제로 `tools/edenchat_clipboard.py` 의 파싱 결과에 _어떤 영향도 없는지_** — 즉 스크립트가 _주석만_ 트리거로 인식하는지 코드 라인 수준 인용 가능한가? (MOD-3 보호 하에서 _데이터 안전성 증명_ 만 필요.)
3. **PC-C-004 의 _즉시 옵션_** — Codex 가 옵션 A(disabled)/B(라우트 추가) 중 어느 쪽을 선호하는지? 본 에이전트는 MOD-2 에 의거 _옵션 B(=`ModeCeo.jsx` 신설)_ 권고.
4. **PC-C-005 의 메신저 도메인 `msg → talk` 전환** — `public/_headers` 의 CSP 가 `talk.bluehair.blue` 를 이미 허용하는지(또는 `msg.bluehair.blue` 만 허용해 _런타임_ 영향이 있는지). 본 라운드에서 직접 확인 미수행.
5. **PC-C-007 의 _site preview 자체가 사이트 사용자에게 노출되는지_** — `src/pages/SvgIntro.jsx` 가 공개 라우트인지(공개라면 MOD-5 의 _“프리뷰는 프리뷰”_ 가 _공식 사용자 노출_ 까지 적용되는지 재확인 필요).
6. **PC-C-008 의 `extract_char_prompts.py --apply`** 가 _현재 어떤 파일을 수정 가능_ 한지 — 즉 _실제 위험 표면적_ 이 어디까지인지(현 `tools/` 검증 시 `asset_config.json` 만이 가능한 출력 대상으로 보임).

---

## Questions Forwarded to the Human Moderator

> Round 3 종합 직전에 명확화가 필요한 추가 항목(Round 1 의 9개 외).

1. **MOD-2 의 “정보 수정 필요”** — CEO 모드의 _즉시 수정_ 범위가 _`gamemodes.js` 카드 카피 + `ModeCeo.jsx` 신설_ 까지 포함되는지, 아니면 _카드 카피만_ 정정인지? (즉 _“페이지는 천천히, 카드만 정확히”_ 노선이 가능한지.)
//Moder:노출되는 카드는 정확히 수정. 하위 페이지 추가는 후순위로 미뤄도 상관 없음.
2. **MOD-11 의 “최상단 nav 리다이렉트”** — _Navbar.jsx_ 의 데스크톱·모바일 둘 다 추가 대상인지, 데스크톱만인지? 모바일 햄버거 메뉴는 작은 surface 이므로 누락이 자주 발생.
//Moder:당연히 모바일, 데스크탑 둘 다 추가.
3. **MOD-12 의 “Creator 포트폴리오 사이트”** — 출시 일정/슬러그가 정해져 있다면 `Works.jsx` 의 임시 카피에 _“곧 별도 포트폴리오 사이트 공개”_ 같은 _시간성 안내_ 를 둘 수 있다. 확정 일정이 있는가?
//Moder:없음. 현재 공개된 작품 유지관리보수가 최우선. 최후순위 작업.
4. **MOD-10 의 “Gallery NSFW 모달 임시 조치”** — _제거_ 시점은 _즉시_ 가 가능한가, 아니면 _다음 NSFW 에셋 추가 사이클_ 이후인가?
//Moder:갤러리에서 NSFW 카테고리 클릭 시 팝업되는 모달은 현재 18세 이상인지 물어보는 팝업으로 존재한다. 수정하지 않아도 됨. 오히려 문서가 갱신되어야 함.
5. **MOD-13 의 “hook 등 추가 필요”** — _수치 카피 동시 갱신_ 알림 hook 의 형태(예: `.claude/hooks/imagecount-sync.sh`) 에 대한 선호가 있는가? 본 라운드에서는 형태 미정 권고.
//Moder:이미지 에셋 개수 변경 시, 수정되어야 할 파일은 명확하다. `C:\Users\User\OneDrive\图片\챗봇 제작\연예계\docs\프라임시티 소개페이지.txt`, `C:\Users\User\OneDrive\图片\챗봇 제작\연예계\src\pages\Gallery.jsx`, `C:\Users\User\OneDrive\图片\챗봇 제작\연예계\src\components\ImageSystemInfo.jsx`, `C:\Users\User\OneDrive\图片\챗봇 제작\연예계\workers\svg-tablet.js`. 위 파일들의 이미지 개수를 동시 수정하라 알리는 hook 추가하면 됨.
6. **MOD-9 의 “라운드 종결 전 문서 편집 금지”의 _경계_** — `tools/extract_char_prompts.py` 같은 _스크립트_ 는 _문서_ 가 아니므로 Round 4 이전에 가드 추가가 가능한지(본 에이전트는 _Round 4 이후_ 로 보수적 해석했으나 명확화 필요).
//Moder:내가 말한 `문서`란, `docs/ai-concil/*`내부 파일을 제외한 프로젝트 리포지토리 내부 모든 파일을 말한다.
7. **MOD-1 의 “플랫폼 작품 페이지가 1차 surface”** — 1차 surface 의 _스크린샷 또는 카피_ 를 본 사이트 어디든(예: Footer · Hero 보조 영역) _“플랫폼에서 시작” / “EdenChat 작품 페이지”_ 식으로 노출하는 것이 _브랜드 톤_ 에 맞는가? (현재는 _완전한 별도 surface_ 처럼 운용됨.)
//Moder:이미 우측 상단에 `플레이` 버튼이 상시 보이도록 설계되어 있는데, 굳이 그렇게 할 이유가 없다. 난잡함을 줄이고 최소한의 정보를 가장 세련되고 고급스러우며 우아한 방식으로 전달하는 것이 `프라임시티` 페이지의 톤앤매너. 레퍼런스는 '명일방주:엔드필드' 등 최전선 서브컬쳐 게임의 소개 페이지.

---

## 종합 평가 (Round 2 단)

| 항목 | 점수(1–5) | 비고 |
|------|----------|------|
| 합의 강도(Agree+합의 ×1.5 가중치 대상 수) | 4 | PC-C-004(↔PC-A-003), PC-C-005(↔PC-A-002/008/010) — 두 감사가 _독립적으로_ 같은 결론 |
| Moderator 입력의 결정력 | 5 | 14건의 `//Moder:` 주석 중 7건이 _권고 방향을 바꾸거나_ 우선순위를 _재정의_ 함 — 본 라운드의 척도를 거의 _확정_ |
| Launch 차단 사유의 _희소성_ | 4 | 10개 Codex finding 중 차단 사유에 근접한 것은 PC-C-004 단 1건 (그것도 _이미 launch 된 모드의 비대칭_ 차원) |
| 문서 vs 코드의 _순방향 동기화_ 부족 | 5 | PC-C-005 + Stale 절 + PC-A-002 결합. Round 4 의 가장 큰 작업 카테고리 |
| Round 3 의 위험 | 2 | 두 감사 사이의 _직접 충돌_ 은 0건. 합의 가능성 매우 높다 |

종합 점수(루브릭 공식 `(Impact × 2 + Likelihood + Urgency) / 4`) — 본 라운드는 _감사_ 가 아니므로 직접 산출 X. 대신 _Round 3 입력 적합성_ 을 자가 평가:

- 두 감사의 발견이 _완전 충돌_ 하는 항목: **0건**.
- 두 감사가 _독립 합의_ 한 항목: **2건**(PC-C-004↔PC-A-003, PC-C-005↔PC-A-002·008·010). ×1.5 가중치 대상.
- Moderator 가 _행동 방향을 변경_ 시킨 항목: **3건**(PC-C-003, PC-C-007, PC-A-005). _‘반박’_ 이 아니라 _‘재정의’_.
- _문서 편집 금지_(MOD-9) 에 의해 본 라운드 _권고_ 만 가능, _이행_ 은 Round 4: **거의 모든 권고**.

본 라운드의 _실행 가능_ 산출물 = `round_03_synthesis.md` 의 _합의 이슈 카드 후보 12건 + 폐기 후보 4건 + Moderator 결정 대기 7건_.

---

> 본 문서는 Agent A(Claude) 의 Round 2 교차 검토 결과이며, Round 3(`round_03_synthesis.md`) 에서 Codex 의 Round 2 반박(`round_02_codex_rebuttal.md`) 과 합쳐 _합의 이슈 원장_(`ISSUE_LEDGER.md`) 을 채우는 데 사용된다. 본 라운드에서는 _프로덕션 코드 미수정_ 원칙을 유지하였고, MOD-9 에 의해 _리포지토리 내부 중요 문서_ 도 편집하지 않았다. _권고는 모두 Round 4 의 FINAL_IMPROVEMENT_PLAN 에 매핑된다_.
