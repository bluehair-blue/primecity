# CLAUDE.md — Prime City 프로젝트 가이드

> 이 파일은 **표지판**입니다. 상세 내용은 각 전문 문서를 참조하세요.
> | 문서 | 역할 |
> |---|---|
> | `research.md` | 프로젝트 전체 분석 보고서 (16섹션, 기술/디자인/콘텐츠/인프라) |
> | `plan.md` | 구현 기획서 (상세 접근방식 + 코드 스니펫 + 사용자 피드백 주석) |
> | `idea.md` | 브레인스토밍 & 개선 아이디어 |
> | `{폴더}/research_sub.md` | 폴더별 상세 분석 |
> | `docs/CODEBASE_MAP.md` | **코드베이스 목차** (파일별 줄 수 + 역할, 분할 구조) |
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
├── .claude/               ← 훅 11개, 스킬 5개
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

### CharDetail 시네마틱 인트로 시스템 관례

> 상세 기획: `src/pages/chardetail_intro_plan.md` (v4.2)
> 구현 파일: `src/components/cinematic/`

#### 아키텍처

```
CharDetail.jsx
  ├─ if (janggru)      → JgrCharDetail (독립 컴포넌트, 별도 유지)
  ├─ if (char.keyVisual) → CinematicCharDetail (공용 뼈대)
  └─ else              → DefaultCharDetail (기존 홀로그램 뷰)

CinematicCharDetail Phase 상태기계
  Phase -1  LoadingShell (progress bar, 500ms timeout)
  Phase  0  Intro overlay (INTRO_COMPONENTS 레지스트리에서 로드)
  Phase  1  KeyVisual hero (fixed bg + 프로필 텍스트 + 이펙트)
  Phase  2  하단 콘텐츠 (CharExpressionsGrid → Sign → CharNavigation → Footer)
```

#### CenteredQuote 공용 컴포넌트

**파일**: `src/components/cinematic/CenteredQuote.jsx`

| Prop | 타입 | 설명 |
|---|---|---|
| `show` | bool | opacity/transform 게이트 |
| `emphasis` | `"subtle"` \| `"hero"` | subtle = 대사만 (opacity 0.82), hero = agency+name+quote |
| `quoteIndex` | number | `char.quoteSequence[n]` (2비트 대사용, 기본 0) |
| `glitch` | bool | `cinemaGlitchText` 애니메이션 (LSH 전용) |
| `blurred` | bool | `filter: blur(8px)` + `translateY(-12px)` (MMR Beat 2 전용) |

**전역 원칙 (v4):**

- Phase 0 첫 비트부터 `<CenteredQuote emphasis="subtle" show />` 노출
- 마지막 beat 에서 `<CenteredQuote emphasis="hero" show />` 로 교체
- hero 전 마지막 beat 는 **1초 이상** 여유 — 대사를 읽을 시간
- subtle/hero 를 각각 별도 인스턴스로 렌더하여 CSS transition 교차

#### Intro 컴포넌트 구조 패턴

```jsx
// 기본 골격 — 모든 XxxIntro.jsx 준수
export default function XxxIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      // ... beat transitions ...
      setTimeout(() => setFadingOut(true), config.duration - 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div onClick={onSkip} style={{ position:"fixed",inset:0,zIndex:200,
      opacity: fadingOut ? 0 : 1, transition: "opacity 0.5s ease-out", ... }}>
      {/* layers — zIndex 체인 준수 */}
      <CenteredQuote ... />
    </div>
  );
}
```

#### zIndex 체인 (표준)

| 레이어 | zIndex | 비고 |
|---|---|---|
| 이미지 레이어 | 1~2 | 복수 beat 이미지 |
| 모바일 fallback | 3 | specular sweep 등 |
| 비네트 | 4~5 | `radial-gradient` |
| CenteredQuote | 6 | 공용 컴포넌트 |
| introLabel | 10 | chapter label |
| 레터박스 | 15 | JSH 전용 (letterbox: true) |
| flash overlay | 20 | JSH 전용 |
| Intro 오버레이 전체 | 200 | CinematicCharDetail 에서 설정 |

#### INTRO_COMPONENTS 레지스트리

**파일**: `src/components/cinematic/index.js`

- 신규 Intro 완성 시 반드시 등록 (`styleName: XxxIntro`)
- 미등록 style → Phase 0 건너뜀 + Phase 1 직행 (안전장치 내장)
- 현재 등록: `cutaway` (JSH), `sunrise` (KHR), `ripple` (MIL)

#### introStyles.js 규칙

```js
// duration = Phase 0 총시간 (fadeOut 500ms 포함)
// 예: 6000ms = 애니메이션 5500ms + fadeOut 500ms
cutaway: { duration: 6400 },  // JSH — 연출 의도된 과부하
sunrise: { duration: 4900 },  // KHR — 카메라 컨셉
ripple:  { duration: 6000 },  // MIL — 줌 2비트 + 물결 + hero hold
```

#### focusBox 규칙

- 모든 캐릭터 focusBox `w`/`h` 값은 **원안 +10%** (v4 확정값 `chardetail_intro_plan.md` §8-1 참조)
- `keyVisualFit: "contain"` 추가 시 Phase 1 에서 전체 이미지 표시 (현재 JSH/KHR/MIL)
  - contain 시 `objectPosition: "50% 50%"` 자동 적용 (CinematicCharDetail 분기 내장)
- 클로즈업 scale 상한: **2.0~2.2** (화질 유지)

#### Phase 1 CinematicCharDetail 이펙트 (2026-04-10 추가)

| 이펙트 | 구현 | 비고 |
|---|---|---|
| 마우스 틸트 | `perspective(1400px) rotateX(±1.5deg) rotateY(±1.5deg)` | desktop only, Phase 1+ |
| 반사 | 하단 28% `scaleY(-1)` + `maskImage` gradient | opacity 0.18 |
| bgMarquee | 2줄 (top 18%, bottom 16%) | 80s / 100s, opacity 0.025/0.018 |

#### Sign 섹션 (2026-04-10 추가)

- 15명 전원 `char.sign = cdnUrl("{CHAR}/sign.webp")` 등록 완료
- CharDetail 3곳 모두 Sign 섹션 추가: JgrCharDetail · CinematicCharDetail · DefaultCharDetail
- 위치: `CharExpressionsGrid → Sign → CharNavigation → Footer`
- 스타일: gold `Sign` 라벨 + `drop-shadow(... char.color)` 글로우

#### 구현 정책

- **1 캐릭터 완전 구현 → 사용자 피드백 → 다음 캐릭터** (절대 일괄 금지)
- 각 Step = 컴포넌트 작성 + 레지스트리 등록 + focusBox 갱신 + `npm run build` + 사용자 승인
- 상세 체크리스트 → `chardetail_intro_plan.md` §5

### 챗봇 로어북 JSON 파일 규칙 (`docs/prompts/json/`)

새 캐릭터/모드/라운드 로어북을 만들 때 반드시 따를 것:

| 규칙 | 설명 |
|---|---|
| **파일 단위** | 로어북 엔트리 1개 = JSON 파일 1개. 합본 금지 |
| **trigger 분리** | JSON 본문에 `trigger` 키 포함 ❌ → 파일 하단에 `// --- TRIGGER ---` 주석으로 기록 |
| **fav 미포함** | 호감도 초기값은 JSON에 넣지 않음. 플랫폼 UI에서 직접 설정 |
| **폴더 배치** | 캐릭터 → `캐릭터/`, 모드 → `모드/`, 오디션 라운드 → `오디션/`, SVG 규칙 → **루트** (`SVG_` prefix), 스포일러 → 루트 |
| **파일명** | `{이름}_EN.json` (예: `강하람_EN.json`, `매니저모드_EN.json`, `SVG_일정표_EN.json`) |
| **SVG 로어북** | 범용 SVG 출력 규칙은 `json/SVG_{이름}_EN.json` (루트). `모드/` 하위에 넣지 않을 것 — `edenchat_clipboard.py` glob 패턴 `SVG_*_EN.json`과 매칭 필수 |
| **모드 키워드 격리** | 범용 로어북에서 모드 이모지/키워드(📋, 🎤 등) 직접 노출 금지. `{{user}}의 역할이 ~일 시` 맥락으로 지침 제공 |

```
// 파일 끝 형식 예시:
}

// --- TRIGGER ---
// 강하람
```

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
- CDN: img.bluehair.blue/ent/ (**ASSET_VERSION=11**, 2026-04-10 sign 이미지 일괄 등록 시 업)
- 검열: ntd11 YOLO-seg → ROI→CLOSE→flood fill→best component→convex hull→**safety dilation→ROI re-clamp**
- 검열 스타일: 흰색(255,255,255) + edge_blur=9 (가우시안 안티에일리어싱)
- 75개 상황코드: 감정(1-9), 일상(10-18), NSFW(20-86)

### 로컬 원본 경로 (절대경로)

```
C:\Users\User\OneDrive\图片\챗봇 제작\연예계\char_img\
```

> **모든 이미지 업로드는 반드시 이 폴더에서 가져온다.** 테스트 복사본이나 백업 폴더에서 가져오지 않는다.
>
> ⚠️ **레거시 경고**: 과거 프로젝트에는 `OneDrive/图片/챗봇 제작/캐릭터 이미지/` 라는 외부 폴더가 있었으나, 2026-04-23 이후 `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/` 로 이름이 변경되어 사용 금지. **어떤 경우에도 이 레거시 폴더를 참조하지 말 것.** 실제 원본은 `연예계/char_img/` 뿐이다.

### CDN 경로 구조 (혼동 금지)

| 유형 | 로컬 파일 | R2 경로 | 코드 참조 |
|---|---|---|---|
| **키비주얼** | `{CHAR}/key.webp` | `ent/{CHAR}/key.webp` | `cdnUrl("{CHAR}/key.webp")` |
| **썸네일** | `{CHAR}/thumbnail.webp` | `ent/{CHAR}/thumbnail.webp` | `cdnUrl("{CHAR}/thumbnail.webp")` |
| **프로필** | `{CHAR}/profile.webp` | `ent/{CHAR}/profile.webp` | `cdnUrl("{CHAR}/profile.webp")` |
| **사인** | `{CHAR}/sign.webp` | `ent/{CHAR}/sign.webp` | `cdnUrl("{CHAR}/sign.webp")` |
| **장면 이미지** | `{CHAR}/{번호}.webp` | `ent/{CHAR}/{번호}.webp` | `cdnExprUrl("{CHAR}",...)` |
| **SVG 에셋** | `{CHAR}/svg/*.webp` | `ent/{CHAR}/svg/*.webp` | SVG Workers |
| **도시 배경** | `bg3~11.webp` | `ent/bg3~11.webp` | `cdnUrl("bg{N}.webp")` |

**새 캐릭터 사인 이미지 추가 시 체크리스트:**

1. 로컬: `연예계/char_img/{CHAR}/sign.webp` 에 파일 배치
2. R2: `npx wrangler r2 object put "prime/ent/{CHAR}/sign.webp" --file "...\char_img\{CHAR}\sign.webp" --content-type "image/webp" --remote`
3. 코드: `src/data/characters.js` 해당 캐릭터의 `sign: null` → `sign: cdnUrl("{CHAR}/sign.webp")`
4. 연쇄 확인: CharCarousel.jsx + CharDetail.jsx 에서 `char.sign`으로 자동 표시 (추가 수정 불필요)

> 상세 → `research.md` §6, §7.3, `tools/research_sub.md`

---

## 배포

| 대상 | 방법 |
|---|---|
| 사이트 | `git push origin main` → Cloudflare Pages 자동 |
| SVG Worker | `cd workers && wrangler deploy --config wrangler.toml` (Worker별) |
| R2 이미지 | `npx wrangler r2 object put "prime/ent/{path}" --file "C:\...\연예계\char_img\{path}"` |

> **R2 업로드 시 반드시 로컬 원본 폴더(`연예계/char_img/`)에서 파일을 지정할 것.** 레거시 폴더(`_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/`) 및 테스트/백업 폴더 사용 금지.
> **R2에 이미지를 업로드할 때마다 반드시 `src/utils/cdn.js`의 `ASSET_VERSION`을 +1 올릴 것.** 이를 빠뜨리면 브라우저/CDN 캐시 때문에 업데이트가 반영되지 않는다.

> 상세 → `research.md` §13

---

## SVG 워커 파이프라인

**10개 워커** (workers/svg-*.js): sns, tweet, livestream, messenger, news, chart, community, post, tablet, **schedule**

### 신규 워커 작성 체크리스트

1. `workers/svg-{name}.js` 작성 (tablet 골격: `renderXxx(startY)` → `{ svg, height }`)
2. `src/data/svgTemplates.js`에 `generateXxx` 함수 + 템플릿 등록
3. `workers/deploy/deploy.sh`에 `WORKERS[svg-{name}]` + `ROUTES[svg-{name}]` 추가
4. 로어북 `docs/prompts/json/SVG_{이름}_EN.json` 작성 (트리거 키워드 + 오타 변형 포함)
5. `npm run build` → 빌드 검증
6. `wrangler deploy --route "{subdomain}.bluehair.blue/*"` → 배포 + 라우트 등록
7. **CF Dashboard → DNS → CNAME 레코드 추가** (`{subdomain}` → `post.bluehair.blue`, Proxied)
8. 소개 사이트 + 에덴챗 실제 테스트

### 이미지 포함 워커 필수 패턴 (base64 인라인)

`<image href>` 가 있는 워커는 반드시:
- `safeImageUrl()`에 `data:` prefix 통과: `if (url.startsWith("data:")) return url;`
- `fetchAsDataUri(url)` 헬퍼 (청크 방식 btoa, 8192 bytes)
- `fetch()` 핸들러에서 이미지 URL 선해석 → data URI 변환 → `p` 객체에 주입

**이유**: 에덴챗이 SVG를 `<img>` 태그로 렌더링 → 브라우저가 SVG 내부 외부 리소스 차단.
이미지 없는 워커(chart, tablet, community, schedule)는 불필요.

> 상세 → `workers/plan_sub_image_inline.md`

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
| `/annotate-code` | 사용자+Claude | 코드에 상세 주석 작성 (역할/이유/연계) |
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

**완료**: 사이트 16페이지, 디자인 시스템, 에셋 1,215장+, 보안, 파일 정리, tools/ 파이프라인 개선 (18항목), NSFW 검열 배치 (264/855장), 캐릭터 사인/썸네일 15명 CDN 통일, CharDetail seam cue, **장그루 전용 시네마틱 인트로 (JgrCharDetail v4)**, 사이트 총체적 최적화 ①②③④, CityMap 히트박스 등각 보정, **챗봇 프롬프트 Phase 5 전면 개편 완료 (103개 로어북, 최종 검증 A~E PASS)**, **태블릿 SVG 개편 (10섹션, 13모드, escapeXml 수정, 상대좌표 리팩터링)**, 이미지 에셋 재생성 1,125장 완료 (char_img/), **에덴챗 로어북 102개 플랫폼 삽입 완료** (edenchat_clipboard.py 매크로), char_img/ 검열 배치 완료 (conf=0.7, 252장 검열/603장 클린), **이미지 에셋 확장 완료 (21코드×15캐릭 = 314장 + 검열 53장)** — 코드 1-96 빈번호 해소 + NSFW 확장(섹스웅 패턴) + 라이브씬/무대씬, **에덴챗 소개 HTML 개편 완료** (폰트 +4px, 15명 전체 썸네일 이미지, Prism→Prime, ?v=3, 섹션 재배치, stat bridge 2개, 산업단지 추가, 유틸리티 모드 5개, Image System 6카테고리+캐릭터코드란, CTA 배경이미지+챗봇 시작 버튼, confirm 팝업 제거), **15명 sign 이미지 전원 등록** (ASSET_VERSION 11, CharDetail 3곳 Sign 섹션 추가), **CinematicCharDetail 인트로 시스템 Step 5a/5b/6 완료** (JSH CutawayIntro v4 · KHR CameraIntro · MIL RippleIntro), **CinematicCharDetail Phase 1 이펙트 추가** (마우스 틸트 · 반사 · bgMarquee)
**진행 중**: **CharDetail 시네마틱 인트로 시스템** — Step 7a(LSH 글리치), 7b(MMR 플래시+댓글), 7c(NHR 안개), 7d(HSR 카드딜), 7e(HSE 페이지넘김), 8(전수 테스트). 아키텍처: `CinematicCharDetail` + `INTRO_COMPONENTS` 레지스트리 + Phase -1/0/1/2 상태기계 + `CenteredQuote.jsx` 공용 컴포넌트. 상세 → `src/pages/chardetail_intro_plan.md`
**미완**: **에덴챗 소개 HTML 사용자 피드백 반영** (에덴챗 플랫폼 삽입 후 확인 필요), **에덴챗 삽입 테스트** (실제 챗봇 동작 검증), Works 확장, 최적화 ⑤ 접근성(사용자 디자인 판단 대기), svgTemplates.js 고유명사 반영, char_img/ CDN 비교+반영
**최후순위**: PyTorch CPU→CUDA 교체 + ntd11 YOLO 파인튜닝 (귀두/작은 성기 미감지 개선, 라벨링 40장 필요, GPU 활성화 후 학습 5-10분)

### 에덴챗 로어북 삽입 반자동화

> 103개 로어북 JSON을 에덴챗 플랫폼에 등록하는 작업.
> Playwright 좌표/스크롤 기반 완전 자동화는 UI 변동에 취약 — **반자동화** 접근.

**접근 결과**:
- [x] 에덴챗 로어북 API 존재 여부 → **API 비공개** (Network 탭에 Facebook Pixel/GA만 노출)
- [x] 에덴챗 로어북 임포트/익스포트 기능 → **없음**
- [x] 채택: **pyautogui 키보드 매크로** (`tools/edenchat_clipboard.py`)
  - Tab 네비게이션: 제목→Tab×3→본문→Tab×1→트리거(키워드 개별 Enter)→Tab×3→Enter(저장)
  - 102개 로어북, 652개 키워드 자동 파싱
  - `--from N`으로 중단/재개, `--pause-each`로 항목별 확인 가능

**변환 스크립트 준비** (API/임포트 확정 전이라도 미리 가능):
- `tools/edenchat_clipboard.py` — 102개 JSON을 에덴챗 UI에 자동 입력
- `// --- TRIGGER ---` 주석에서 트리거 키워드 자동 파싱
- fav 범위는 파일명 패턴으로 추론 (`*_초기_*` → 10-39, `*_심화_*` → 60-99)

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
