# CLAUDE.md — Prime City 프로젝트 가이드

> 이 파일은 **표지판**입니다. 상세 내용은 각 전문 문서를 참조하세요.
> | 문서 | 역할 |
> |---|---|
> | `research.md` | 프로젝트 전체 분석 보고서 (16섹션, 기술/디자인/콘텐츠/인프라) |
> | `plan.md` | 구현 기획서 (상세 접근방식 + 코드 스니펫 + 사용자 피드백 주석) |
> | `idea.md` | 브레인스토밍 & 개선 아이디어 |
> | `{폴더}/research_sub.md` | 폴더별 상세 분석 |
> | `.claude/plans/*.md` | 세부 작업 계획서 |

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Prime City (프라임시티) |
| 도메인 | intro.bluehair.blue (사이트) · img.bluehair.blue (CDN) |
| 목적 | 개인 포트폴리오 + 연예계 시뮬레이션 챗봇 소개 |
| 챗봇 플랫폼 | 에덴챗 (Eden Chat) |
| 배포 | Cloudflare Pages (GitHub 자동 배포) |
| 저장소 | github.com/JaCha00/primecity |

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React 19 (Vite 6), react-router-dom v7, react-helmet-async |
| 스타일링 | 인라인 style (CSS-in-JS), **OKLCH 전용** (hex/rgb 금지) |
| 인프라 | Cloudflare Pages + R2 + Workers 8개 |
| 이미지 생성 | NovelAI API v4 (tools/asset_generator.py) |
| 이미지 검열 | ntd11 v5 YOLOv11s-seg (tools/auto_censor.py) |
| CI/CD | GitHub Actions (Claude Code Action + PR Review) |

> 상세 → `research.md` §2

---

## 파일 구조

```
연예계/
├── src/                   ← React 소스 (41파일, 9,820줄)
│   ├── components/ (14)   │  pages/ (16+404)  │  data/ (5)
│   ├── styles/tokens.js   │  utils/cdn.js     │  hooks/ (2)
│   └── App.jsx · main.jsx
├── docs/                  ← 기획 문서
│   ├── prompts/ (json/ source/ _backup/)  ← 챗봇 프롬프트
│   ├── image-rules/       ← NAI 프리셋 + 에셋 목록 + 검열 피드백
│   ├── worldbuilding/     ← 세계관 + 캐릭터 프로필
│   └── 은랑밀입국/        ← 별도 프로젝트
├── workers/ (8)           ← SVG Workers (*.bluehair.blue)
├── tools/                 ← NAI 생성 + 검열 파이프라인
├── tools_dist/            ← 배포용 클린 복사본
├── models/                ← ntd11_v5.pt (gitignore)
├── public/                ← favicon, icons, _headers
├── .claude/               ← 훅 4개, 스킬 4개
└── .github/workflows/     ← Claude Code Actions
```

> 상세 → `research.md` §3, 각 폴더 `research_sub.md`

---

## 디자인 시스템 (요약)

**Gold & Azure Dualism**: Gold(hue 80) = 브랜드/라벨, Blue(hue 252) = 시스템/인터랙티브, 배경(hue 265)

| 항목 | 규칙 |
|---|---|
| 색상 | `src/styles/tokens.js` 토큰만 사용 → `import C from "../styles/tokens"` |
| 폰트 | `--f-display-kr`(Noto Serif KR), `--f-display-en`(Crimson Pro), `--f-body`(Noto Sans KR) |
| 반응형 | `useIsMobile(768)` 훅 |
| 애니메이션 | `useReveal` (IntersectionObserver), 이징 `cubic-bezier(0.22,1,0.36,1)` 통일 |
| 키프레임 | `index.html` `<style>` 태그에 전역 정의 (10개) |

> 상세 → `research.md` §7

---

## 코딩 컨벤션

- `function` 키워드 컴포넌트 선언 (화살표 X)
- **OKLCH 전용** — hookify가 hex/rgb 차단
- 인라인 style 객체 (CSS 파일 최소화)
- CSS 변수는 폰트 패밀리에만
- CDN URL → `cdnUrl()` 유틸 필수 (`ASSET_VERSION` 캐시 버스팅)
- 새 페이지 → `/new-page` 스킬 또는 `PageLayout` + render props

### 캐릭터 특별 인트로 패턴 (CharDetail)

현재 장그루(JGR)에 적용된 별도 렌더 블록 패턴:
- `CharDetail.jsx` 내 **module scope** 함수 `JgrCharDetail` — parent 내부 중첩 ❌
- parent `CharDetail`에서 `if (char.id === "janggru") return <JgrCharDetail ... />;` early return
- parent에 해당 캐릭터 전용 state/effect 잔류 0줄
- 다른 캐릭터에 특별 인트로를 추가할 때도 동일 패턴 사용: module scope 함수 + early return

---

## 사이트 구조 (섹션 흐름)

```
[1] HeroSlider (bg3~11, 이중 오빗 링)
 → [2] IntroSection (캐치프레이즈)
 → [3] CharCarousel (15명)
 → [4] CityMap (5구역 인터랙티브)
 → [5] GameModes (3+5 모드)
 → [6] TriangleNav (하위 5종)
 → [7] Footer
```

**라우팅 (16+404)**: `/`, `/characters/:name`, `/districts/:id`, `/gallery`, `/svg`, `/modes/*` (8), `/updates`, `/works`, `/contact`

> 상세 → `research.md` §4, §9

---

## 세계관 (요약)

동심원 구조: **더 코어**(APEX) → **미들 링**(Blue Moon) → **하입 로드**(PRISM) → **테라스**(Route 0) → **산업단지**

15명 캐릭터 (CDN코드): SY, NHR, JSH, ERK, LSH, HSR, KHR, JGR, MIL, ELA, MMR, HSE, NIA, RAY, LPS

> 상세 → `research.md` §10, `docs/worldbuilding/캐릭터 프로필.md`, `docs/worldbuilding/프라임시티 세계관.md`

---

## 챗봇 시스템 (요약)

31개 로어북 엔트리, 55.6KB (영문 JSON):
- 메인 프롬프트 (1, 상시) + 캐릭터 (14, 트리거) + 오디션 (8, 라운드별) + 모드 (7, 명령어) + 🔒스포일러 (2)

> 상세 → `research.md` §5, `docs/prompts/json/*_EN.json`

---

## 이미지 파이프라인 (요약)

- 생성: 1,125장 + 특수 90장 (NAI API, tools/asset_generator.py)
- CDN: img.bluehair.blue/ent/ (ASSET_VERSION=3)
- 검열: ntd11 YOLO-seg → ROI→CLOSE→flood fill→best component→convex hull→**safety dilation→ROI re-clamp**
- 검열 스타일: 흰색(255,255,255) + edge_blur=9 (가우시안 안티에일리어싱)
- 75개 상황코드: 감정(1-9), 일상(10-18), NSFW(20-86)

### 로컬 원본 경로 (절대경로)

```
C:\Users\User\OneDrive\图片\챗봇 제작\캐릭터 이미지\
```

> **모든 이미지 업로드는 반드시 이 폴더에서 가져온다.** 테스트 복사본이나 백업 폴더에서 가져오지 않는다.

### CDN 경로 구조 (혼동 금지)

| 유형 | 로컬 파일 | R2 경로 | 코드 참조 |
|---|---|---|---|
| **키비주얼** | `{CHAR}/{CHAR}.webp` | `ent/{CHAR}.webp` | `cdnUrl("{CHAR}.webp")` |
| **썸네일** | `{CHAR}/{CHAR}thumbnail.webp` | `ent/{CHAR}thumbnail.webp` | `cdnUrl("{CHAR}thumbnail.webp")` |
| **프로필** | `{CHAR}/profile.webp` | `ent/{CHAR}/profile.webp` | `cdnUrl("{CHAR}/profile.webp")` |
| **사인** | `{CHAR}/sign.webp` | `ent/{CHAR}/sign.webp` | `cdnUrl("{CHAR}/sign.webp")` |
| **장면 이미지** | `{CHAR}/{번호}.webp` | `ent/{CHAR}/{번호}.webp` | `cdnExprUrl("{CHAR}",...)` |
| **SVG 에셋** | `{CHAR}/svg/*.webp` | `ent/{CHAR}/svg/*.webp` | SVG Workers |
| **도시 배경** | `bg3~11.webp` | `ent/bg3~11.webp` | `cdnUrl("bg{N}.webp")` |

**새 캐릭터 사인 이미지 추가 시 체크리스트:**
1. 로컬: `캐릭터 이미지/{CHAR}/sign.webp` 에 파일 배치
2. R2: `npx wrangler r2 object put "prime/ent/{CHAR}/sign.webp" --file "...\{CHAR}\sign.webp" --content-type "image/webp" --remote`
3. 코드: `src/data/characters.js` 해당 캐릭터의 `sign: null` → `sign: cdnUrl("{CHAR}/sign.webp")`
4. 연쇄 확인: CharCarousel.jsx + CharDetail.jsx 에서 `char.sign`으로 자동 표시 (추가 수정 불필요)

> 상세 → `research.md` §6, §7.3, `tools/research_sub.md`

---

## 배포

| 대상 | 방법 |
|---|---|
| 사이트 | `git push origin main` → Cloudflare Pages 자동 |
| SVG Worker | `cd workers && wrangler deploy --config wrangler.toml` (Worker별) |
| R2 이미지 | `npx wrangler r2 object put "prime/ent/{path}" --file "C:\...\캐릭터 이미지\{path}"` |

> **R2 업로드 시 반드시 로컬 원본 폴더(`캐릭터 이미지/`)에서 파일을 지정할 것.** 테스트/백업 폴더 사용 금지.
> **R2에 이미지를 업로드할 때마다 반드시 `src/utils/cdn.js`의 `ASSET_VERSION`을 +1 올릴 것.** 이를 빠뜨리면 브라우저/CDN 캐시 때문에 업데이트가 반영되지 않는다.

> 상세 → `research.md` §13

---

## 보안 (요약)

- SVG Workers: escapeXml() 102곳 (XSS 방지)
- HTTP 헤더: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- R2: 디렉토리 리스팅 비활성, 소스맵 미생성
- 토큰: tools/.nai_token gitignore + tools_dist 제외

> 상세 → `research.md` §12

---

## Claude Code Skills

| 스킬 | 호출 | 설명 |
|---|---|---|
| `/new-page` | 사용자+Claude | 새 페이지 생성 + 라우트 등록 + 빌드 검증 |
| `/deploy-preview` | 사용자 전용 | 빌드+배포 원커맨드 |
| `frontend-design` | Claude 자동 | 디자인 가이드라인 |
| `project-patterns` | Claude 자동 | Git 히스토리 기반 패턴 |

---

## 개발 워크플로우

```
 1. CLAUDE.md 읽기              ← 표지판 (이 파일)
 2. research_sub.md 읽기/수정    ← 해당 폴더 상세 분석
 3. research.md 읽기/수정        ← 전체 프로젝트 종합
 4. plan.md 읽기/수정            ← 상세 기획 (접근방식, 코드 스니펫, 파일 경로, 트레이드오프)
 5. plan_sub.md 읽기/수정        ← 세부 구현 계획 (필요 시)
 6. 사용자의 plan 주석/피드백 분석 ← 사용자가 plan.md 내부에 주석으로 피드백
 7. 사용자의 명시적 승인 후 구현   ← "이 기획을 구현해도 된다"는 승인이 있어야만 코드 작성
 7.5 연쇄 영향 전수 조사          ← 수정 파일을 참조하는 모든 파일을 grep으로 찾아 함께 수정
 8. 빌드 검증                    ← npm run build
 9. 커밋                         ← 서술형 (Add/Fix/Update/Redesign)
10. 푸시                         ← git push origin main
11. CLAUDE.md 업데이트            ← 요약만 갱신
12. research/plan 업데이트        ← 변경 내용 반영
```

### 핵심 규칙
- **구현 전 반드시 plan.md에 상세 기획을 작성할 것** — 접근 방식, 코드 스니펫, 변경 파일, 트레이드오프 포함
- **사용자가 plan.md 내부에서 피드백 주석을 달고 명시적으로 승인하기 전까지 코드 구현 금지**
- **커밋 전 반드시 빌드 검증** (`npm run build`)
- **CLAUDE.md는 표지판** — 상세 내용은 research.md/plan.md/idea.md에
- **파일 수정 시 연쇄 영향 전수 조사 필수** — 하나의 파일을 수정할 때, 해당 파일을 import/참조/소비하는 모든 파일을 grep으로 찾아 연쇄 영향을 분석한 후 함께 수정할 것. 데이터 파일(characters.js, cdn.js 등) 변경 시 이를 소비하는 컴포넌트/페이지를 반드시 확인. CDN 경로 변경 시 R2 업로드 경로·코드 참조·로컬 파일 구조 3곳이 일치하는지 교차 검증. "한 곳만 고치고 나머지는 안 고치는" 실수를 절대 반복하지 않는다.

### 문서 체계
| 문서 | 역할 | 갱신 주기 |
|---|---|---|
| CLAUDE.md | 표지판 (요약 + 안내) | 매 세션 (가볍게) |
| research.md | 총체적 분석 보고서 | 구조 변경 시 |
| research_sub.md | 폴더별 상세 | 해당 폴더 변경 시 |
| plan.md | 구현 기획서 (승인 전까지 코드 금지) | 기획 시작/승인/완료 시 |
| idea.md | 브레인스토밍 | 자유롭게 |

---

## 작업 현황 (요약)

**완료**: 사이트 16페이지, 디자인 시스템, 챗봇 프롬프트 Phase 1~4 (56KB), 에셋 1,215장+, 보안, 파일 정리, tools/ 파이프라인 개선 (18항목), NSFW 검열 배치 (264/855장), 캐릭터 사인/썸네일 15명 CDN 통일, CharDetail seam cue, **장그루 전용 시네마틱 인트로 (JgrCharDetail v4)**, 사이트 총체적 최적화 ①②③④ (PageLayout Hook 정리, 모달 접근성, Particles/transition:all/reduced motion, Hero preload), CityMap 히트박스 등각 보정
**미완**: 에덴챗 삽입 테스트, Phase 5 프롬프트 품질, Works 확장, 나머지 캐릭터 사인 이미지, 최적화 ⑤ 접근성(사용자 디자인 판단 대기)

> 상세 → `plan.md`
> 아이디어 → `idea.md`

<!-- ooo:START -->
<!-- ooo:VERSION:0.25.0 -->
# Ouroboros — Specification-First AI Development

> Before telling AI what to build, define what should be built.
> As Socrates asked 2,500 years ago — "What do you truly know?"
> Ouroboros turns that question into an evolutionary AI workflow engine.

Most AI coding fails at the input, not the output. Ouroboros fixes this by
**exposing hidden assumptions before any code is written**.

1. **Socratic Clarity** — Question until ambiguity <= 0.2
2. **Ontological Precision** — Solve the root problem, not symptoms
3. **Evolutionary Loops** — Each evaluation cycle feeds back into better specs

```
Interview → Seed → Execute → Evaluate
    ↑                           ↓
    └─── Evolutionary Loop ─────┘
```

## ooo Commands

Each command loads its agent/MCP on-demand. Details in each skill file.

| Command | Loads |
|---------|-------|
| `ooo` | — |
| `ooo interview` | `ouroboros:socratic-interviewer` |
| `ooo seed` | `ouroboros:seed-architect` |
| `ooo run` | MCP required |
| `ooo evolve` | MCP: `evolve_step` |
| `ooo evaluate` | `ouroboros:evaluator` |
| `ooo unstuck` | `ouroboros:{persona}` |
| `ooo status` | MCP: `session_status` |
| `ooo setup` | — |
| `ooo help` | — |

## Agents

Loaded on-demand — not preloaded.

**Core**: socratic-interviewer, ontologist, seed-architect, evaluator,
wonder, reflect, advocate, contrarian, judge
**Support**: hacker, simplifier, researcher, architect
<!-- ooo:END -->
