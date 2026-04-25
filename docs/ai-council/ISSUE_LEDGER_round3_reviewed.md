# Issue Ledger — Prime City AI Council Round 1–3 Reviewed

> 목적: Round 1 감사, Round 2 반박, Round 3 종합, 그리고 각 문서에 삽입된 `//Moder:` 주석을 대조하여 실행 가능한 이슈 원장을 확정한다.  
> 작성 기준일: 2026-04-25 KST  
> 상태: Draft for Round 4 / FINAL_IMPROVEMENT_PLAN 입력용

---

## 0. 판정 원칙

### 0.1 Source precedence

이 원장은 다음 우선순위로 판정한다.

1. **Moderator 주석** — Round 1·2 문서에 직접 달린 `//Moder:` 판단을 최우선으로 한다.
2. **양 에이전트 독립 합의** — Claude와 Codex가 독립적으로 같은 문제를 지적한 경우 우선순위를 높인다.
3. **구체 파일 증거** — 파일 경로, 라인, 명령 결과가 있는 주장을 우선한다.
4. **Round 3 synthesis** — 단, Round 2의 최신 Moderator 주석과 충돌하는 결론은 본 원장에서 보정한다.

### 0.2 Global constraints

- `docs/prompts/json/**` 본문은 **함부로 수정하지 않는다**.
- 로어북 운영 기준은 **207개 non-combined** 이다.
- `AGENTS.md`는 앞으로의 canonical **표지판** 문서로 사용하되, 세부 분석과 계획은 별도 파이프라인 문서에 둔다.
- `intro.bluehair.blue`는 2차 surface다. 최초 노출은 EdenChat 작품 페이지이므로, 소개 사이트의 CTA는 과잉 배치하지 않는다.
- 프라임시티 페이지의 톤은 세련되고 절제된 서브컬처 게임 소개 페이지에 가깝게 유지한다.
- Round 4 전까지 production code, prompt JSON, 기존 핵심 문서 편집은 하지 않는다. 이 원장은 `docs/ai-council/*` 계열 산출물로만 사용한다.

### 0.3 Status labels

| 상태 | 의미 |
|---|---|
| `Accept` | 실제 개선 계획에 포함한다. |
| `Accept — Adjusted` | 이슈는 채택하지만, 원 제안과 다른 방식으로 실행한다. |
| `Transform` | 원 제안은 거부하지만, 더 좁은 문서화·검증 작업으로 전환한다. |
| `Defer` | 문제는 인정하지만 현재 스프린트에서는 미룬다. |
| `Reject` | 현 기준에서 이슈로 채택하지 않는다. |
| `Needs Evidence` | 추가 검증 전까지 결정하지 않는다. |

---

## 1. Round 3 synthesis 보정 사항

Round 3 synthesis는 큰 틀에서 유용하지만, 이후 문서에 포함된 Moderator 주석과 대조하면 아래 항목은 보정이 필요하다.

| 항목 | Round 3 synthesis 판정 | 본 원장 보정 |
|---|---|---|
| CEO 모드 | `ModeCeo.jsx` 라우트 신설 즉시 적용 | **카드의 잘못된 노출과 null 링크를 즉시 수정한다.** 하위 페이지 추가는 후순위 가능. |
| NSFW Gallery 모달 | 모달 제거 정식화 | **모달은 유지 가능.** 현재 18세 이상 확인 팝업은 수정하지 않아도 되며, 문서가 갱신되어야 한다. |
| Works 페이지 | Creator 포트폴리오 외부 리다이렉트 P2 | 별도 포트폴리오 일정이 없고 현재 작품 유지보수가 최우선이므로 **최후순위 Defer**. |
| `edenchat_clipboard.py` | P1 | 207개가 이미 수동 삽입된 상태이므로 **P2 운영 안정화**로 보정. |
| SVG preview/Worker parity | Reject | parity 강제는 Reject가 맞지만, **의도된 비대칭을 문서화하는 Transform 작업**은 유지. |
| prompt JSON 내부 `trigger` | Reject | 데이터 변경은 Reject. 단, **문서 규칙 정정 + 스크립트 파싱 검증**으로 Transform. |

---

## 2. Active Issue Ledger

## P0 — Critical

| Ledger ID | Source ID | 도메인 | 상태 | 제목 | 결정 | 근거 | 다음 조치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| PC-LDG-001 | PC-A-003 / PC-C-004 | Frontend / Mode UX | Accept — Adjusted | CEO 모드 카드 `detailPath: null` / 데드링크 위험 | 대표(CEO) 모드는 이미 출시된 모드이므로 disabled 처리만으로 끝내면 안 된다. 다만 Moderator가 하위 페이지 추가는 후순위 가능하다고 정리했으므로, 즉시 목표는 **노출 카드의 정확성 회복 + null Link 제거**다. | 양 에이전트가 독립적으로 `src/data/gamemodes.js`의 `detailPath: null`, `GameModes.jsx`의 `<Link to={cm.detailPath}>`, `/modes/ceo` 라우트 부재를 지적했다. Moderator는 CEO 모드가 이미 출시되었고 로어북 등록도 완료된 상태라고 정정했다. | 1) `ceo` 카드가 더 이상 `<Link to={null}>`로 렌더되지 않게 한다. 2) 카드에 `출시됨`, `!대표모드`, 핵심 캐릭터/장소 정보를 정확히 표시한다. 3) 하위 페이지가 준비되지 않았다면 `ModeCeo.jsx`는 backlog로 두고, 카드 클릭 동작은 명확히 정의한다. 4) 가능하면 플레이 링크 또는 최상단 Play CTA와 동작을 통일한다. | `rg -n 'id: "ceo"|detailPath' src/data/gamemodes.js`; `rg -n 'to=\{cm.detailPath\}' src/components/GameModes.jsx`; `npm run build`; 브라우저에서 CEO 카드 클릭/비클릭 상태 확인. |

---

## P1 — High

| Ledger ID | Source ID | 도메인 | 상태 | 제목 | 결정 | 근거 | 다음 조치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| PC-LDG-002 | PC-A-001 / PC-A-009 | UX Funnel / Conversion | Accept — Adjusted | Hero 외 EdenChat 진입 동선 부족 | 챗봇 진입 CTA를 무분별하게 늘리지 않는다. **최상단 Navbar의 데스크톱·모바일 Play 리다이렉트**를 우선 적용한다. | Claude는 Hero 외 EdenChat URL이 `src/` 내 거의 없다고 지적했다. Codex도 정적 증거는 인정했지만, Moderator가 “최상단 nav 리다이렉트가 우선”이며 모바일·데스크톱 모두 대상이라고 정리했다. | 1) `EDENCHAT_PLAYER_URL` 상수 파일을 만든다. 2) `HeroSlider.jsx` 하드코딩 URL을 상수로 교체한다. 3) `Navbar.jsx`의 데스크톱·모바일 메뉴에 절제된 `플레이` 외부 링크를 추가한다. 4) Footer·GameModes·CharDetail CTA 확장은 보류한다. | `rg -n 'eden-chat|works/35e68463|EDENCHAT_PLAYER_URL' src`; 데스크톱/모바일 nav 클릭 확인; `npm run build`. |
| PC-LDG-003 | PC-A-002 / PC-A-008 / PC-C-005 | Image Catalog / UI Copy / Sync | Accept — Adjusted | 이미지 카탈로그 수치 불일치 | 사이트와 관련 문서의 이미지 수치 표현을 정리하되, prompt JSON을 자동 SSOT로 강제하지 않는다. **이미지 개수 변경 시 수정 대상 파일을 알리는 hook/checklist**를 만든다. | Claude는 `102/75/29/2,000+` 등 수치 분기를 지적했다. Codex는 이미지 원천이 prompt JSON이 아니라 `char_img/*`와 R2라는 Moderator 주석을 반영해 “검증 리포트/동기화 알림”이 더 안전하다고 보정했다. | 1) 현재 표시 수치 기준을 정한다. 2) 이미지 에셋 개수 변경 시 다음 파일 갱신을 알리는 hook/checklist를 만든다: `docs/프라임시티 소개페이지.txt`, `src/pages/Gallery.jsx`, `src/components/ImageSystemInfo.jsx`, `workers/svg-tablet.js`. 3) prompt JSON은 수동 삽입 요소이므로 자동 변경하지 않는다. | 지정 파일에서 `102장`, `75 per character`, `2,000장+` 등 검색; R2/로컬 asset manifest와 비교하는 dry-run 리포트; `npm run build`. |
| PC-LDG-004 | PC-C-001 | Build / CI | Accept | 빌드 검증 워크플로 부재 | PR/push에서 최소 `npm ci && npm run build`를 강제하는 GitHub Actions workflow를 추가한다. | Codex는 `package.json`에 `test`/`lint`가 없고 기존 GitHub Actions가 Claude 액션만 수행하며 실제 build gate가 없다고 확인했다. 로컬 `npm.cmd run build`는 성공했다. | `.github/workflows/build.yml` 추가. 초기 범위는 `npm ci`, `npm run build`만 포함한다. 이후 lint/typecheck/worker dry-run은 별도 확장. | GitHub Actions에서 PR/push build 통과 확인; 로컬 `npm run build`. |
| PC-LDG-005 | PC-C-005 / PC-A-002 / PC-A-010 | Docs / Agent Onboarding | Accept — Adjusted | 핵심 문서와 실제 코드 간 수치·상태 불일치 | Round 4 이후 `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`, baseline 문서를 현재 코드 기준으로 일괄 갱신한다. 단, `AGENTS.md`는 세부 이력장이 아니라 **정확한 표지판**으로 유지한다. | Codex는 캐릭터 수, 로어북 수, `ASSET_VERSION`, `INTRO_COMPONENTS`, sign 등록, messenger domain, cinematic status 등 다수 stale 정보를 지적했다. Moderator는 `AGENTS.md`를 canonical 표지판으로 삼되 세부 분석은 파이프라인 문서에서 작성한다고 정리했다. | 갱신 기준: 캐릭터 20명, 로어북 207 non-combined, `ASSET_VERSION=28`, intro registry 12개, sign 20명, messenger domain `talk.bluehair.blue`, source 내부 내용이 정식. 과거 Updates 타임라인의 historical count는 보존한다. | 캐릭터 수 grep, 로어북 count, `src/utils/cdn.js` 확인, `src/components/cinematic/index.js` registry 확인, `rg 'msg.bluehair.blue|talk.bluehair.blue'`. |

---

## P2 — Medium

| Ledger ID | Source ID | 도메인 | 상태 | 제목 | 결정 | 근거 | 다음 조치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| PC-LDG-006 | PC-C-002 | EdenChat Automation | Accept — Adjusted | `edenchat_clipboard.py --list` 실행성이 GUI 의존성에 막힘 | `--list`와 파싱 검증은 GUI 의존성 없이 실행되도록 `pyperclip`/`pyautogui` import를 지연한다. 207개 기준을 명시한다. | Codex는 최상단 import 때문에 `--list`도 의존성 실패가 난다고 확인했다. Moderator는 207개 로어북이 이미 수동 삽입된 상태라고 정리했으므로 launch blocker는 아니다. | 1) GUI deps lazy import. 2) `--list` 출력에 207 non-combined 기준 명시. 3) 의존성 설치 절차 문서화. 4) prompt JSON 본문은 수정하지 않는다. | `python tools/edenchat_clipboard.py --list`; non-combined count 207 확인; clipboard 실행은 운영자 PC에서만 별도 확인. |
| PC-LDG-007 | PC-A-004 | Onboarding / Mode Naming | Accept — Adjusted | `프리플레이` 명칭 충돌 | trigger는 유지한다. 사이트 UI 라벨·설명만 “메인 Free Play”와 “설정/오버레이 명령”이 구분되도록 다듬는다. | Claude는 메인 모드 `프리플레이`와 유틸 모드 `프리플레이 설정`, trigger `!프리플레이`가 혼동될 수 있다고 지적했다. Codex는 trigger 변경은 207개 수동 삽입과 충돌하므로 사이트 표시만 조정하자고 보정했다. | `freeplay-config`의 사이트 표기를 `프리플레이 오버레이`, `유저노트 설정`, `커스텀 설정` 등으로 명확화한다. 로어북 trigger와 prompt JSON은 건드리지 않는다. | `rg -n 'freeplay|프리플레이|!프리플레이' src docs/prompts/json`; 변경 후 빌드 및 UI 확인. |
| PC-LDG-008 | PC-C-008 | Image Pipeline / Legacy Safety | Accept | 레거시 이미지 경로 하드코딩 잔존 | `tools/extract_char_prompts.py`를 `LEGACY/`로 이동하거나 `--allow-legacy` 없이는 실행 실패하도록 가드한다. | Codex는 사용 금지된 `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img` 경로가 도구에 하드코딩되어 있고 `--apply` 성격이 있어 실수 위험이 있다고 지적했다. | 1) 스크립트를 `tools/LEGACY/`로 이동하거나 실행 가드 추가. 2) 현재 자동화 루프에서 호출되지 않는지 확인. 3) 문서에 legacy tool로 표시. | `rg -n '_OLD_DO_NOT_USE|extract_char_prompts' tools docs`; 가드 후 무옵션 실행 실패 확인. |
| PC-LDG-009 | PC-C-010 | Cloudflare Worker / Deploy | Accept | Worker compatibility date 하드코딩 | 워커 배포 스크립트의 compatibility date를 변수화하거나 사이트 `wrangler.jsonc`와 차이가 나는 이유를 명시한다. | Codex는 `wrangler.jsonc`와 `workers/deploy/deploy.sh`의 compatibility date가 서로 다르다고 확인했다. Moderator는 항상 dry-run 및 필요 시 localhost 검증을 원칙으로 제시했다. | `workers/deploy/deploy.sh` 상단에 `COMPATIBILITY_DATE` 변수를 두거나 wrangler 설정과 동기화한다. 실제 deploy가 아니라 dry-run/localhost 검증만 수행한다. | `rg -n 'compatibility_date|compatibility-date' wrangler.jsonc workers`; dry-run 명령 확인. |
| PC-LDG-010 | PC-C-003 | Lorebook Rules / Prompt Safety | Transform | prompt JSON 본문 `trigger` 키 처리 | 원 제안인 본문 `trigger` rename은 Reject한다. 대신 문서 규칙을 “플랫폼 트리거는 `// --- TRIGGER ---`, 본문 내 narrative `trigger` 키는 건드리지 않음”으로 정정한다. | Codex는 본문 `trigger` 키와 문서 규칙 충돌을 발견했다. Moderator는 로어북 JSON 본문 내부 `trigger`는 절대 건드리지 말라고 정리했다. | 1) `AGENTS.md` 또는 파이프라인 문서의 trigger 규칙을 정정한다. 2) `edenchat_clipboard.py`가 주석 trigger만 읽고 본문 키를 무시하는지 코드 라인으로 확인한다. 3) 본문 데이터 수정 금지. | `rg -n '"trigger"\s*:' docs/prompts/json`; `edenchat_clipboard.py` trigger 파싱 함수 확인; `--list` 결과 확인. |
| PC-LDG-011 | PC-C-007 | SVG / Worker Runtime | Transform | Site preview와 Worker SVG 정책 비대칭 | parity 강제는 Reject한다. 대신 preview와 Worker가 의도적으로 다르다는 주석·문서를 명확히 한다. | Codex는 site helper가 `data:` URI를 거부하고 Worker는 허용한다고 지적했다. Moderator는 프리뷰는 프리뷰이고 실제 챗봇 출력 Worker는 URL 내부 인라인을 반영해야 한다고 정리했다. | `src/data/svgTemplates/helpers.js`, `src/data/svgTemplates.js`, 관련 worker 문서에 “preview는 구조 확인용, Worker가 canonical runtime”임을 명시한다. | `rg -n 'safeImageUrl|data:' src/data/svgTemplates workers`; Worker URL 출력만 dry-run/localhost 검증. |
| PC-LDG-012 | PC-A-007 | Policy / Gallery UX | Accept — Adjusted | NSFW Gallery 정책 문서 불일치 | Gallery의 18+ 확인 모달은 유지 가능하다. 잘못된 “임시 차단 잔재이므로 제거” 결론을 폐기하고, 현재 정책을 문서에 맞춘다. | Claude는 Gallery NSFW confirm과 외부 HTML 정책 비대칭을 지적했다. 이후 Moderator는 현재 Gallery의 18세 이상 팝업은 존재하며 수정하지 않아도 되고, 오히려 문서가 갱신되어야 한다고 명시했다. | 1) Gallery 모달을 제거하지 않는다. 2) 문서에서 “임시 차단” 또는 “제거 필요”로 오해될 수 있는 설명을 정정한다. 3) EdenChat 소개 HTML과 사이트의 역할 차이를 명시한다. | `rg -n 'NSFW|18\+|성인|confirm|nsfwModal' src docs`; 브라우저에서 NSFW 카테고리 클릭 동작 확인. |

---

## P3 — Low

| Ledger ID | Source ID | 도메인 | 상태 | 제목 | 결정 | 근거 | 다음 조치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| PC-LDG-013 | PC-C-006 | Frontend / Cinematic Registry | Accept — Adjusted | `cardDeal` dead config와 cinematic 문서 drift | 런타임 영향은 낮다. source 내부 구현이 정식이므로, `cardDeal`은 제거하거나 reserved 상태로 명확히 표시하고 문서를 정리한다. | Codex는 `cardDeal` 설정은 남아 있으나 registry/캐릭터 연결이 없고 HSR은 `wind`를 쓴다고 지적했다. Moderator는 현재 src 내부 내용이 정식이라고 확인했다. | `introStyles.js`의 `cardDeal` 처리 방향 결정: 제거 또는 `reserved / unused` 주석. `AGENTS.md`/pipeline 문서에서 cinematic intro 12개 완료 상태 반영. | `rg -n 'cardDeal|introStyle|INTRO_COMPONENTS|WindIntro' src docs`; build. |
| PC-LDG-014 | PC-C-009 | Hygiene / Encoding | Accept | 소스 주석 내 Unicode replacement character | 사용자 노출 영향은 없지만 온보딩·검색 신뢰도를 위해 주석의 깨진 문자를 교정한다. | Codex는 `src/pages/CharDetail.jsx`, `CinematicCharDetail.jsx`, `DefaultCharDetail.jsx`, `CharSign.jsx` 등에서 `�` 문자를 발견했다. | 해당 주석만 UTF-8 정상 문자열로 수정한다. 가능하면 `rg -n '�'` 검증을 추가한다. | `rg -n '�' AGENTS.md CLAUDE.md docs src workers tools`; build. |

---

## 3. Deferred Issues

| Ledger ID | Source ID | 도메인 | 상태 | 제목 | 보류 사유 | 다음 검토 시점 |
|---|---|---|---|---|---|---|
| PC-LDG-D01 | PC-A-005 | Branding / Works | Defer | Works 페이지가 플레이스홀더 중심 | 별도 Creator 포트폴리오 사이트로 리다이렉트할 계획은 있으나 일정이 없고, 현재 공개 작품 유지관리보수가 최우선이다. 내부 Works 확장도 외부 redirect도 지금은 최후순위. | Creator 포트폴리오 URL·도메인·카피가 확정된 후. |
| PC-LDG-D02 | PC-A-008 | ImageSystemInfo / Public UI | Defer | Scene Codes 전체 목록 공개 부재 | 전체 코드표를 공개 UI에 넣으면 운영 매뉴얼처럼 보일 수 있고, NSFW/확장 범위 표시 정책이 필요하다. 현재는 카테고리 요약 유지가 적절하다. | 이미지 카탈로그를 팬덤/레퍼런스 페이지로 확장할 때. |
| PC-LDG-D03 | PC-A-009 | Mode UX / CTA | Defer | 모드 카드별 챗봇 시작 CTA 부재 | Moderator는 최상단 nav 리다이렉트가 우선이며, 페이지 톤상 CTA 과밀은 피해야 한다고 정리했다. | Navbar Play CTA 적용 후 실제 탐색/클릭 데이터를 보고 판단. |
| PC-LDG-D04 | PC-A-001 subset | Char Detail CTA | Defer | 캐릭터 상세별 “이 캐릭터로 시작” CTA | 전환 관점에서는 유효하지만, 현재는 우측 상단 Play 버튼과 세련된 소개 페이지 톤을 우선한다. | Nav Play CTA 적용 후 캐릭터 상세 체류/이탈 데이터를 보고 판단. |

---

## 4. Rejected Issues

| Ledger ID | Source ID | 도메인 | 상태 | 제목 | 기각 사유 |
|---|---|---|---|---|---|
| PC-LDG-R01 | PC-A-006 | Character Data / SSOT | Reject | `characters.js`에 외형 필드 추가 | 최신 외형 정보의 SSOT는 `docs/prompts/json/*`이다. `characters.js`에 외형 정보를 중복 기재하면 drift 가능성이 커진다. |
| PC-LDG-R02 | PC-A-010 | Updates / Historical Record | Reject | Updates 과거 수치 정정 | `17명`, `19명`, `20명` 등은 해당 시점의 historical timeline으로 보존해야 한다. 현재 수치는 별도 현재 상태 카드나 문서에서 다룬다. |
| PC-LDG-R03 | PC-C-003 original action | Lorebook Schema | Reject | prompt JSON 본문 `trigger` 키 rename | Moderator가 로어북 JSON 본문 내부 `trigger`를 절대 건드리지 말라고 명시했다. 데이터 변경은 금지하며 문서 규칙 정정으로만 처리한다. |
| PC-LDG-R04 | PC-C-007 original action | SVG | Reject | site preview와 Worker의 `data:` URI 정책 강제 동기화 | Worker가 실제 챗봇 runtime이고 preview는 preview다. 비대칭은 의도된 차이로 본다. |
| PC-LDG-R05 | PC-A-007 old action | Policy / Gallery UX | Reject | Gallery NSFW 모달 제거 | Moderator가 현재 18세 이상 확인 팝업은 수정하지 않아도 된다고 명시했다. 제거가 아니라 문서 갱신이 맞다. |
| PC-LDG-R06 | PC-A-005 options 2/3 | Branding / Works | Reject | Works 내부 라인업 카드화 또는 현재 작품 디테일 확장 | 장기 방향은 별도 Creator 포트폴리오 사이트다. 현재 `/works` 내부를 포트폴리오 허브로 키우는 방향은 우선 채택하지 않는다. |

---

## 5. Open Verification Items

| ID | 항목 | 이유 | 권장 확인 |
|---|---|---|---|
| PC-OPEN-001 | CEO 카드의 최종 클릭 동작 | `ModeCeo.jsx`가 후순위라면 카드가 클릭 가능한지, 플레이 링크로 가는지, 또는 비클릭 정보 카드인지 정해야 한다. | 디자인 톤 기준으로 “출시됨 + trigger 표시 + Play nav 유도” 또는 “EdenChat player external link” 중 선택. |
| PC-OPEN-002 | `public/_headers`의 `talk.bluehair.blue` 허용 여부 | Codex/Claude Round 2에서 메신저 도메인 drift가 언급되었으나 CSP 영향은 미확인이다. | `rg -n 'talk.bluehair.blue|msg.bluehair.blue|connect-src|img-src' public src workers docs`. |
| PC-OPEN-003 | `SvgIntro` 공개 라우트 여부 | preview가 일반 사용자에게 노출된다면 “프리뷰는 프리뷰” 문구의 UI/문서 배치가 필요할 수 있다. | `src/App.jsx` route와 `src/pages/SvgIntro.jsx` 공개 상태 확인. |
| PC-OPEN-004 | EdenChat URL UTM 보존 여부 | URL 상수화는 필요하지만 UTM/딥링크는 플랫폼이 보존하는지 검증 전에는 사용하지 않는 것이 안전하다. | EdenChat player URL에 test query를 붙여 이동/보존 여부 확인. |
| PC-OPEN-005 | 이미지 수치 변경 hook 형태 | Moderator는 수정 대상 파일을 지정했으나 hook 구현 방식은 미정이다. | shell hook, npm script, Codex/Claude skill checklist 중 하나로 결정. |

---

## 6. Recommended Round 4 Task Order

1. **PC-LDG-001 — CEO card null link / released state correction**
2. **PC-LDG-002 — EdenChat player URL constant + Navbar Play redirect**
3. **PC-LDG-004 — Build CI workflow**
4. **PC-LDG-005 — Documentation baseline refresh**
5. **PC-LDG-003 — Image count sync checklist/hook**
6. **PC-LDG-006 — EdenChat clipboard lazy import and 207-count list output**
7. **PC-LDG-008 — Legacy prompt extraction script guard/move**
8. **PC-LDG-009 — Worker compatibility date variable/dry-run discipline**
9. **PC-LDG-010 / PC-LDG-011 / PC-LDG-012 — Rules/policy documentation cleanup**
10. **PC-LDG-013 / PC-LDG-014 — Cinematic dead config + encoding hygiene**

---

## 7. Minimal Implementation Ticket Seeds

### Task PC-R4-001 — CEO card released-state correction

**Goal:** CEO mode card must not render as a broken/null link.  
**Files:** `src/data/gamemodes.js`, `src/components/GameModes.jsx`, optionally `src/App.jsx`, optionally `src/pages/ModeCeo.jsx`.  
**Non-goals:** Do not rewrite CEO lorebooks. Do not touch prompt JSON.  
**Acceptance:** CEO card displays accurate release state and trigger; no `<Link to={null}>`; build passes.

### Task PC-R4-002 — Navbar Play redirect

**Goal:** Add an elegant, always-accessible EdenChat player link to desktop and mobile nav.  
**Files:** create `src/data/links.js` or `src/utils/links.js`; edit `Navbar.jsx`, `HeroSlider.jsx`.  
**Non-goals:** Do not add noisy CTA clusters to every card/page.  
**Acceptance:** One canonical EdenChat player URL; desktop/mobile nav works; build passes.

### Task PC-R4-003 — Build CI

**Goal:** Enforce `npm ci && npm run build` on PR/push.  
**Files:** `.github/workflows/build.yml`.  
**Acceptance:** GitHub Actions build passes and fails on build error.

### Task PC-R4-004 — Documentation baseline refresh

**Goal:** Update stale agent/doc baseline facts after Round 4.  
**Files:** `AGENTS.md`, `CLAUDE.md`, `docs/CODEBASE_MAP.md`, relevant `docs/ai-council/*`.  
**Acceptance:** Facts match current source: 20 characters, 207 non-combined lorebooks, `ASSET_VERSION=28`, 12 cinematic intros, `talk.bluehair.blue`, 20 sign images.

---

