# CLAUDE.md — Prime City 소개 웹사이트 프로젝트

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Prime City (프라임시티) 소개 웹사이트 |
| 도메인 | bluehair.blue |
| 이미지 CDN | img.bluehair.blue |
| 목적 | 개인 포트폴리오 + 연예계 시뮬레이션 챗봇 소개 겸용 |
| 챗봇 플랫폼 | 에덴챗 (Eden Chat) |
| 배포 | Cloudflare Pages (GitHub 연동 자동 배포) |
| 언어 | 한국어 위주, 영어 포인트 (섹션 라벨, 부제목 등) |

---

## 기술 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | React (Vite) |
| 라우팅 | react-router-dom |
| 스타일링 | CSS-in-JS (인라인 style) + CSS 변수 |
| 색상 체계 | **OKLCH / OKLAB 전용** — hex/rgb 사용 금지 |
| 폰트 | Google Fonts (아래 상세) |
| 빌드 | `npm run build` → `dist/` |
| 배포 | Cloudflare Pages |

---

## 디자인 시스템

### 색상 토큰 (OKLCH)

모든 색상은 `oklch()` 함수로 정의. `src/styles/tokens.js`에서 관리.

```js
// ── Backgrounds ──
bgDeep:    "oklch(0.08 0.01 280)"          // 최심부 배경 (body)
bgCard:    "oklch(0.12 0.005 280 / 0.4)"   // 카드 배경
bgOverlay: "oklch(0.06 0.01 280 / 0.92)"   // 오버레이, 모바일 메뉴

// ── Gold / Amber (Primary Accent) ──
gold:      "oklch(0.76 0.12 80)"            // 메인 골드
goldMuted: "oklch(0.76 0.12 80 / 0.4)"     // 반투명 골드
goldDim:   "oklch(0.76 0.12 80 / 0.15)"    // 아주 연한 골드
goldGlow:  "oklch(0.76 0.12 80 / 0.2)"     // 글로우/쉐도우용
goldText:  "oklch(0.76 0.12 80 / 0.35)"    // 골드 텍스트 연하게

// ── White / Text ──
white:     "oklch(1.0 0 0)"
text90:    "oklch(1.0 0 0 / 0.9)"
text70:    "oklch(1.0 0 0 / 0.7)"
text55:    "oklch(1.0 0 0 / 0.55)"
text45:    "oklch(1.0 0 0 / 0.45)"
text35:    "oklch(1.0 0 0 / 0.35)"
text25:    "oklch(1.0 0 0 / 0.25)"
text15:    "oklch(1.0 0 0 / 0.15)"

// ── Border ──
border10:  "oklch(0.76 0.12 80 / 0.10)"
border06:  "oklch(0.76 0.12 80 / 0.06)"
border05:  "oklch(0.76 0.12 80 / 0.05)"

// ── Character Accent Colors (기획사 소속) ──
charApex:  "oklch(0.76 0.12 80)"     // 서윤 — APEX gold
charNaha:  "oklch(0.72 0.10 310)"    // 나하린 — purple
charJin:   "oklch(0.55 0.01 0)"      // 진시혁 — grey
charEri:   "oklch(0.72 0.10 170)"    // 에리카 — teal
charSeo:   "oklch(0.70 0.10 240)"    // 이서하 — blue
charHan:   "oklch(0.72 0.12 55)"     // 한소리 — warm orange

// ── Character Accent Colors (Route 0 + 오디션 참가자) ──
charHaram: "oklch(0.65 0.12 20)"     // 강하람 — red
charGru:   "oklch(0.72 0.10 300)"    // 장그루 — lavender
charMila:  "oklch(0.72 0.12 65)"     // 밀라 — orange
charElla:  "oklch(0.65 0.12 15)"     // 엘라 — wine red
charMimori:"oklch(0.72 0.10 220)"    // 미모리 — sky blue
charSieun: "oklch(0.72 0.10 85)"     // 하시은 — amber
charNia:   "oklch(0.65 0.10 200)"    // 니아 — navy-teal
charRay:   "oklch(0.72 0.10 290)"    // 레이 — lavender
charLapis: "oklch(0.60 0.12 260)"    // 라피스 — cobalt

// ── District Accent Colors ──
distCore:  "oklch(0.76 0.12 80)"     // 더 코어 — gold
distMid:   "oklch(0.65 0.10 240)"    // 미들 링 — blue
distHype:  "oklch(0.65 0.12 340)"    // 하입 로드 — pink
distTer:   "oklch(0.65 0.10 140)"    // 테라스 — green
distIndustrial: "oklch(0.60 0.08 220)" // 산업단지 — steel blue

// ── Utility ──
black:     "oklch(0.08 0.01 280)"    // 골드 위 텍스트용
```

### 폰트

```
--f-display-kr: 'Noto Serif KR', serif      // 한국어 제목 (고급 명조)
--f-display-en: 'Crimson Pro', serif         // 영어 악센트 (클래식 세리프)
--f-body:       'Noto Sans KR', sans-serif   // 본문 (가독성)
```

Google Fonts URL:
```
https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600&family=Crimson+Pro:wght@300;400;500;600&display=swap
```

### 디자인 톤

- **다크 테마** + 골드/앰버 포인트 — 레퍼런스: endfield.gryphline.com
- 시네마틱, 프리미엄 무드
- 애니메이션: IntersectionObserver 기반 스크롤 트리거 (fade-in, slide-up)
- 파티클 배경: Canvas API, 모바일에서 수량 감소
- 반응형 기준점: 768px (useIsMobile 훅)

---

## 파일 구조

```
primecity/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx      ← 소개, 캐릭터, 세계관, 갤러리, 더 알아보기, 문의, 플레이
│   │   ├── Particles.jsx
│   │   ├── PageLayout.jsx  ← 공통 페이지 레이아웃 (Navbar + Particles + Footer)
│   │   ├── HeroSlider.jsx  ← 배경 이미지 자동 슬라이드 (CDN bg3~bg11, 9장)
│   │   ├── CharCarousel.jsx ← 캐릭터 캐러셀 (15명, 페이지네이션)
│   │   ├── CityMap.jsx     ← 세계관 인터랙티브 맵 (hover→glow, click→구역 상세 페이지)
│   │   ├── DistrictCard.jsx ← 구역 카드 컴포넌트 (DistrictDetail에서 재사용 가능)
│   │   ├── GameModes.jsx   ← 게임 모드 이중 UI (메인 탭 3 + 직업군 카드 그리드 5)
│   │   ├── TriangleNav.jsx ← 프리즘 모자이크 네비게이션 (하위 페이지 5종 링크)
│   │   ├── ScrollNav.jsx  ← 스크롤 섹션 네비게이션 (PC: 라벨+바, 모바일: 도트)
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx        ← 메인 랜딩 (전체 섹션 조합)
│   │   ├── CharDetail.jsx  ← /characters/:name (시네마틱 인트로 + HUD + 프로필 + 미리보기)
│   │   ├── SvgIntro.jsx    ← /svg (동적 SVG 템플릿 갤러리, 8종)
│   │   ├── Gallery.jsx     ← /gallery (메이슨리 + 소속사 아코디언 필터 + 라이트박스 + NSFW)
│   │   ├── Updates.jsx     ← /updates (업데이트 로그, 타임라인)
│   │   ├── Contact.jsx     ← /contact (문의 창구)
│   │   ├── Works.jsx       ← /works (작가의 다른 작품)
│   │   ├── ModeAudition.jsx ← /modes/audition (오디션 모드 상세)
│   │   ├── ModeFreeplay.jsx ← /modes/freeplay (자유활동 모드 상세)
│   │   ├── ModeProducer.jsx ← /modes/producer (프로듀서 모드 상세)
│   │   ├── ModeManager.jsx  ← /modes/manager (매니저 모드 상세)
│   │   ├── ModeTrainee.jsx  ← /modes/trainee (연습생 모드 상세)
│   │   ├── ModeComposer.jsx ← /modes/composer (작곡가 모드 상세)
│   │   ├── ModeActor.jsx    ← /modes/actor (배우 모드 상세)
│   │   ├── ModeInfluencer.jsx ← /modes/influencer (인플루언서 모드 상세)
│   │   └── DistrictDetail.jsx ← /districts/:id (구역 상세)
│   ├── styles/
│   │   └── tokens.js       ← OKLCH 색상 토큰 export
│   ├── data/
│   │   ├── characters.js   ← 캐릭터 데이터 배열 (15명, cdnId/job/background/taste/goal/expressions 포함)
│   │   ├── gallery.js      ← 갤러리 아이템 데이터 (도시9 + 캐릭터당 74코드 × 15명, NSFW 포함)
│   │   ├── svgTemplates.js  ← SVG 템플릿 정의 (8종: SNS/트윗/라이브/메신저/뉴스/차트/커뮤니티/태블릿)
│   │   ├── districts.js    ← 구역 데이터 배열 (4구역)
│   │   └── gamemodes.js    ← 게임 모드 데이터 (메인3 + 직업군5 = 8모드, mainModes/careerModes export)
│   ├── utils/
│   │   └── cdn.js          ← CDN URL 유틸 (cdnUrl, cdnExprUrl, SCENE_CODE_MAP, EXPRESSION_KEYS/LABELS)
│   ├── hooks/
│   │   ├── useIsMobile.js
│   │   └── useReveal.js
│   ├── App.jsx             ← React Router 설정 (16개 라우트, lazy + Suspense)
│   └── main.jsx            ← 엔트리포인트
├── docs/
│   ├── Main_Prompt.txt             ← 챗봇 메인 프롬프트
│   ├── 캐릭터 프로필.txt            ← 캐릭터 상세 프로필 (15명)
│   ├── 세계관.txt                   ← 세계관 설정
│   ├── 프라임시티 세계관.txt         ← 세계관 상세
│   ├── 오디션.txt                   ← 오디션 시스템 설계
│   ├── 모드 시스템 예시.txt          ← 모드 시스템 참고
│   ├── 연예계 챗봇 로어북.txt        ← 로어북
│   ├── 연예계 챗봇 로어북 (오디션).txt ← 오디션 로어북 (8개, 한국어 원본)
│   ├── CLI_에이전트_작업_지시문.txt    ← 챗봇 제작 단계별 작업 계획 (Phase 1~5)
│   ├── 웹툰 시작상황(텍스트).txt      ← 오프닝 시퀀스 콘티 (컷 1~17)
│   ├── 마크다운 프롬프트 작성 가이드라인.txt
│   ├── 로어북_캐릭터/               ← Phase 1 산출물: 캐릭터별 로어북 16개 (한국어)
│   ├── 로어북_모드/                 ← Phase 4 산출물: 모드 로어북 8개 (한국어: 오프닝/참가/선택지/매니저/연습생/작곡가/배우/인플루언서)
│   ├── 연예계_메인_프롬프트_EN.json   ← Phase 2: 메인 프롬프트 영문 JSON
│   ├── 연예계_로어북_오디션_EN.json   ← Phase 2: 오디션 로어북 8개 영문 JSON
│   ├── 연예계_로어북_캐릭터_EN.json   ← Phase 2: 캐릭터 로어북 14명 영문 JSON
│   ├── 연예계_로어북_나하린_EN.json   ← Phase 2: 🔒나하린 4층위 영문 JSON
│   ├── 연예계_로어북_세계관이면_EN.json ← Phase 2: 🔒세계관 이면 영문 JSON
│   ├── 연예계_로어북_모드_EN.json      ← Phase 4-3: 모드 8개 영문 JSON (직업군5+오프닝+참가+선택지)
│   ├── 이미지 출력 규칙(수정).txt    ← 챗봇 이미지 출력 상황코드 DB (gallery.js 원본)
│   ├── 에셋목록_정제.txt            ← NAI 에셋 프롬프트 원본 (Female/Male Part)
│   ├── NAIS_Preset_감정_*.json     ← NAI 프리셋 (감정 에셋)
│   ├── NAIS_Preset_감정2_generated.json  ← 생성된 프리셋 (감정 8종)
│   ├── NAIS_Preset_일상_generated.json   ← 생성된 프리셋 (일상 9종)
│   ├── NAIS_Preset_상황_generated.json   ← 생성된 프리셋 (NSFW 41종)
│   ├── NAIS_Preset_착의_generated.json   ← 생성된 프리셋 (착의 16종)
│   └── nais2-backup-*.json         ← NAI 전체 백업 (캐릭터 프롬프트 포함)
├── assets/
│   └── backgrounds/                 ← 배경 이미지 에셋 (로컬)
├── public/
│   ├── _headers                     ← Cloudflare Pages 캐시 헤더
├── .claude/
│   └── skills/
│       ├── new-page/SKILL.md       ← 새 페이지 생성 스킬 (/new-page)
│       └── deploy-preview/SKILL.md ← 빌드+배포 스킬 (/deploy-preview)
├── workers/                         ← Cloudflare Worker 참조 파일 (8종, 별도 배포: svg-sns/twit/live/talk/news/chart/community/tablet)
├── CLAUDE.md               ← 이 파일
├── package.json
└── vite.config.js
```

---

## 사이트 구조 (섹션 흐름)

```
[1] 히어로 (HeroSlider)
    - CDN 배경 9장 자동 슬라이드 (bg3~bg11, 풀스크린)
    - 순수 CSS 크로스페이드 전환 (6초 간격)
    - 그라디언트 오버레이 + 비네팅 + 오빗 링 애니메이션
    - CTA: "플레이 시작" + "세계관 보기"
        ↓ 스크롤
[2] 소개 (IntroSection — Home.jsx 내 인라인)
    - 캐치프레이즈 + 간략 소개
    - 스크롤 트리거 애니메이션 (fade-in, slide-up)
        ↓ 스크롤
[3] 캐릭터 갤러리 (CharCarousel)
    - 15명 캐릭터 캐러셀
    - 데스크톱: 썸네일 리스트 + 정보 패널 + 일러스트 (Endfield 레퍼런스)
    - 모바일: 세로 스택 + 5명씩 페이지네이션 (3페이지)
    - 키보드 네비게이션 (좌우 화살표)
        ↓ 스크롤
[4] 세계관 (CityMap → DistrictDetail)
    - 탑뷰 도시 이미지 (인터랙티브 맵, 5구역)
    - SVG 히트박스 + 구역별 이미지 오버레이
    - hover 시 즉각적 glow (0.15s) + 밝은 glowColor + 하단 툴팁
    - 클릭 시 /districts/:id 구역 상세 페이지로 이동
    - 모바일: 1탭=툴팁 + "자세히 보기 →" 버튼으로 상세 페이지 이동
        ↓ 스크롤
[5] 게임 모드 (GameModes)
    - 메인 스토리 탭 셀렉터: 오디션 / 자유활동 / 프로듀서
    - 직업군 모드 카드 그리드: 매니저 / 연습생 / 작곡가 / 배우 / 인플루언서
    - 각 모드별 설명 + "자세히 보기 →" 링크 → 상세 페이지 (8개)
        ↓ 스크롤
[6] 더 알아보기 (TriangleNav — 프리즘 모자이크)
    - 데스크톱: 불규칙 다각형 SVG 모자이크 (5개 클릭 + 3개 장식)
    - 모바일: 각진 clip-path 스트립 스택
    - 하위 페이지 5종 링크 → 각 페이지로 이동
        ↓ 스크롤
[7] 푸터 (Footer)
    - 로고 + © 2026 bluehair.blue
```

---

## 라우팅

### 전체 라우트 (16개, 모두 구현 완료)

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/characters/:name" element={<CharDetail />} />
  <Route path="/svg" element={<SvgIntro />} />
  <Route path="/gallery" element={<Gallery />} />
  <Route path="/updates" element={<Updates />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/works" element={<Works />} />
  <Route path="/modes/audition" element={<ModeAudition />} />
  <Route path="/modes/freeplay" element={<ModeFreeplay />} />
  <Route path="/modes/producer" element={<ModeProducer />} />
  <Route path="/modes/manager" element={<ModeManager />} />
  <Route path="/modes/trainee" element={<ModeTrainee />} />
  <Route path="/modes/composer" element={<ModeComposer />} />
  <Route path="/modes/actor" element={<ModeActor />} />
  <Route path="/modes/influencer" element={<ModeInfluencer />} />
  <Route path="/districts/:id" element={<DistrictDetail />} />
</Routes>
```

---

## 콘텐츠 데이터

### 히어로

| 항목 | 값 |
|---|---|
| 메인 타이틀 | 프라임시티 |
| 영문 서브 | PRIME CITY |
| 영문 라벨 | Entertainment Simulation |
| 캐치프레이즈 | 전 세계가 주목하는 단 하나의 무대. **증명하라.** 세계가 당신을 알게 된다. |
| CTA 1 | "플레이 시작" → 에덴챗 링크 (추후 확정) |
| CTA 2 | "세계관 보기" → #world 앵커 |

### 소개 섹션

| 항목 | 값 |
|---|---|
| 영문 라벨 | About |
| 제목 | 재능과 야망이 교차하는 초거대 엔터테인먼트 특별자치구 |
| 본문 | 자동화가 모든 것을 대체한 근미래. 사람이 자신의 가치를 증명할 수 있는 무대는 단 하나 — 엔터테인먼트. 프라임시티는 그 정점에 있다. 이곳에 입성한다는 것 자체가, 업계에서 인정받았다는 의미. |

### 캐릭터 데이터 (src/data/characters.js)

총 15명. 상세 프로필은 `docs/캐릭터 프로필.md` 참조.

| # | id | 이름 | 소속 | 역할 | accent 색상 |
|---|---|---|---|---|---|
| 1 | seoyun | 서윤 | APEX | 톱 아이돌 겸 배우 | gold |
| 2 | naharin | 나하린 | APEX | 치프 프로듀서 / 오디션 제작 총괄 | purple |
| 3 | jinshihyuk | 진시혁 | APEX | 프로듀서 / 심사위원 | grey |
| 4 | erika | 에리카 | Blue Moon | 프로듀서 / 심사위원 | teal |
| 5 | leeseha | 이서하 | Blue Moon | 싱어송라이터 겸 프로듀서 | blue |
| 6 | hansori | 한소리 | PRISM | 기획사 대표 | warm orange |
| 7 | kangharam | 강하람 | Route 0 | 연습생 → 데뷔 준비 중 | red |
| 8 | janggru | 장그루 | 무소속 | 오디션 참가자 / 보컬·아이돌 지망 | lavender |
| 9 | mila | 밀라 | 무소속 | 오디션 참가자 | orange |
| 10 | ella | 엘라 | 무소속 | 오디션 참가자 | wine red |
| 11 | mimori | 미모리 | 무소속 | 인플루언서·크리에이터 출신 / 오디션 참가자 | sky blue |
| 12 | hasieun | 하시은 | 무소속 | 오디션 참가자 | amber |
| 13 | nia | 니아 | 무소속 | 오디션 참가자 | navy-teal |
| 14 | ray | 레이 | 무소속 | 오디션 참가자 | lavender |
| 15 | lapis | 라피스 | 무소속 | 오디션 참가자 | cobalt |

각 캐릭터 객체 필드: `id`, `cdnId`, `name`, `agency`, `role`, `age`, `tagline`, `color`, `image`, `thumbnail`, `detailPath`, `signature`, `personality`, `description`, `brief`, `job`, `background`, `taste`, `goal`, `expressions`

### 구역 데이터 (src/data/districts.js)

```js
export const districts = [
  {
    id: "core",
    name: "더 코어",
    en: "The Core",
    tier: "정상 · 지배층",
    agency: "APEX Entertainment — 업계 1위",
    desc: "프라임 돔과 방송국 본사가 자리한 정점. 화려하지만 숨 막히는 긴장감이 감도는 곳.",
    accent: "oklch(0.76 0.12 80)",
    characters: ["서윤", "나하린", "진시혁"],
  },
  {
    id: "middle",
    name: "미들 링",
    en: "Middle Ring",
    tier: "검증된 실력자",
    agency: "Blue Moon Entertainment — 업계 2위",
    desc: "스튜디오가 밀집한 실력의 구역. 실력으로 말하는 사람들이 모이는 곳.",
    accent: "oklch(0.65 0.10 240)",
    characters: ["이서하", "에리카"],
  },
  {
    id: "hype",
    name: "하입 로드",
    en: "Hype Road",
    tier: "트렌드 최전선",
    agency: "PRISM Studio — 개성으로 승부",
    desc: "유행이 태어나고 죽는 곳. 라이브 클럽과 공유 스튜디오가 에너지를 뿜는 거리.",
    accent: "oklch(0.65 0.12 340)",
    characters: ["한소리", "유저(플레이어)"],
  },
  {
    id: "terrace",
    name: "테라스",
    en: "Terrace",
    tier: "시작과 안주의 경계",
    agency: "Route 0 — 무한 가능성, 무한 불확실",
    desc: "처음 오는 사람에게는 희망. 밀려온 사람에게는 어중간한 안락함의 유혹.",
    accent: "oklch(0.65 0.10 140)",
    characters: ["강하람"],
  },
];
```

---

## 이미지 에셋

### CDN 캐시 버스팅

모든 CDN 이미지 URL은 `src/utils/cdn.js`의 `cdnUrl()` 함수를 통해 생성.
이미지 갱신 시 `ASSET_VERSION` 상수를 올리면 `?v=N` 쿼리가 변경되어 브라우저+CDN 캐시 자동 무효화.

```js
import { cdnUrl } from "../utils/cdn";
cdnUrl("SY.png")  // → "https://img.bluehair.blue/ent/SY.png?v=1"
```

### CDN 경로 규칙

| 에셋 유형 | CDN 경로 | 비고 |
|---|---|---|
| 도시 배경 | `cdnUrl("bg{N}.png")` | N = 3~11 |
| 캐릭터 | `cdnUrl("{cdnId}.png")` | 서윤(SY), 나하린(NHR), 이서하(LSH), 강하람(KHR) 완료 |
| 캐릭터 표정/상황 | `cdnExprUrl("{cdnId}", "{code}")` | 경로: `ent/{cdnId}/{숫자}.webp` (SCENE_CODE_MAP 자동 변환) |
| 맵 베이스 | `cdnUrl("Citybase(1).png")` | 전체 탑뷰 맵 |
| 맵 구역 | `cdnUrl("{구역명}.png")` | The Core, Middle Ring, Hype Road, Terrace, industrial complex |

### 표정 에셋 경로 상세

```
cdnExprUrl("SY", "happy") → https://img.bluehair.blue/ent/SY/3.webp?v=1
```

- **폴더 구조**: `ent/{cdnId}/` (캐릭터별 폴더)
- **파일명**: `{숫자}.webp` — 영문 코드가 `SCENE_CODE_MAP`을 통해 숫자로 자동 변환
- **숫자 매핑 규칙**: 감정(1-8), neutral(9, 사이트전용), 일상(10-18), 비삽입(20-42), 삽입(50-67), 착의침실(70-78), 착의화장실(80-86)
- **포맷**: WebP (갤러리/챗봇 에셋은 WebP 사용, 사이트 배경·스탠딩 이미지는 PNG 유지)
- **cdnId 매핑**: SY(서윤), NHR(나하린), JSH(진시혁), ERK(에리카), LSH(이서하), HSR(한소리), KHR(강하람), JGR(장그루), MIL(밀라), ELA(엘라), MMR(미모리), HSE(하시은), NIA(니아), RAY(레이), LPS(라피스)
- **유틸**: `src/utils/cdn.js`의 `cdnExprUrl()`, `SCENE_CODE_MAP`, `EXPRESSION_KEYS`, `EXPRESSION_LABELS`
- **전체 상황코드 DB**: `src/data/gallery.js`에 정의 (감정 9 + 일상 9 + NSFW 56 = 74코드/캐릭터)
- **챗봇 프롬프트 원본**: `docs/이미지 출력 규칙(수정).txt`
- **챗봇 메인 프롬프트**: `docs/연예계 챗봇 메인 프롬프트.txt` (숫자 기반 상황코드 DB 포함)
- **챗봇 프롬프트 원본**: `docs/이미지 출력 규칙(수정).txt`

### 해상도 기준

| 에셋 | 해상도 | 비율 | 포맷 |
|---|---|---|---|
| 도시 배경 (히어로 슬라이드) | 1920×800 또는 1536×640 | ~2.4:1 | PNG |
| 캐릭터 스탠딩 (사이트) | 800×1200 | 2:3 세로형 | PNG (투명 배경 권장) |
| 캐릭터 표정 (갤러리/챗봇) | 자유 | 자유 | **WebP** |
| 도시 탑뷰 맵 (세계관) | 1920×1080 | 16:9 | PNG |

---

## 코딩 컨벤션

### 일반 원칙
- 함수형 컴포넌트 + Hooks 사용 (클래스 컴포넌트 금지)
- `function` 키워드로 컴포넌트 선언 (`const` 화살표 함수 X)
- 컴포넌트당 하나의 파일
- 네이밍: PascalCase (컴포넌트), camelCase (변수/함수), kebab-case (파일명은 PascalCase 허용)

### 색상
- **반드시 OKLCH 또는 OKLAB 사용** — hex, rgb, hsl 사용 금지
- 모든 색상은 `src/styles/tokens.js`의 토큰을 import하여 사용
- 새 색상이 필요하면 tokens.js에 추가 후 사용

### 스타일
- 인라인 style 객체 사용 (현재 코드베이스 패턴 유지)
- CSS 변수는 폰트 패밀리에만 사용 (`--f-display-kr`, `--f-display-en`, `--f-body`)
- 키프레임 애니메이션은 전역 `<style>` 태그에 정의

### 반응형
- `useIsMobile(768)` 훅으로 분기
- 모바일: 1열 레이아웃, 축소된 패딩/폰트, 햄버거 메뉴
- 데스크톱: 다열 그리드, 호버 효과 활성

### 애니메이션
- 스크롤 트리거: `useReveal` 훅 (IntersectionObserver)
- 전환 이징: `cubic-bezier(0.22, 1, 0.36, 1)` 통일
- 파티클: Canvas API, 모바일에서 수량 감소 (120 → 40)

### 새 페이지 추가 시
- `src/components/PageLayout.jsx`을 레이아웃으로 사용 (Navbar + Particles + Footer 자동 포함)
- render props 패턴: `{({ isMobile }) => ( ... )}` 으로 isMobile 수신
- `/new-page` 스킬로 자동 생성 가능

---

## 세계관 요약 (콘텐츠 참고용)

프라임시티는 세계 유일의 엔터테인먼트 산업 특별자치구. 근미래, 자동화가 전통 산업을 대체한 시대. 엔터테인먼트가 자신을 증명할 수 있는 거의 유일한 무대.

- 동심원 구조: 중심부(더 코어)일수록 자원과 기회 집중
- 4개 구역: 더 코어 → 미들 링 → 하입 로드 → 테라스
- 4개 기획사: APEX(1위) → Blue Moon(2위) → PRISM(소형) → Route 0(신생)
- 구역 간 이동은 자유롭지만, 생활비 차이가 자연스러운 분리를 만듦
- 공식적으로 "실력이 전부"라는 원칙이 통용되나, 실제로는 소속사 위상 + 화제성 + 인맥이 보이지 않는 천장을 만듦
- 나하린이 프라임시티의 숨겨진 설계자 (유저에게는 후반에 밝혀짐)

---

## 배포 설정 (Cloudflare Pages)

| 항목 | 값 |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 18+ |
| Custom domain | intro.bluehair.blue |
| GitHub repo | JaCha00/primecity |
| **배포 방법** | **`git push origin main` → Cloudflare 자동 빌드+배포** |

> **중요**: `npm run deploy` (wrangler CLI)는 API 토큰 설정 필요. 비대화형 환경에서는 git push 방식 사용.

### SPA 라우팅 처리

`wrangler.jsonc`의 assets 설정으로 SPA 라우팅 자동 처리:
```jsonc
{
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```
별도 `public/_redirects` 파일 불필요. 모든 404가 `index.html`로 fallback되어 React Router가 클라이언트에서 처리.

### 캐싱 최적화

Cloudflare Cache Reserve + Tiered Cache Topology 활성 환경. `public/_headers`로 제어:

| 에셋 유형 | Cache-Control | 비고 |
|---|---|---|
| HTML (`/`, `/index.html`) | `max-age=0, must-revalidate` | 항상 최신 확인, CDN에 5분 캐시 |
| JS/CSS (`/assets/*`) | `max-age=1년, immutable` | Vite 해시 파일명으로 자동 버스팅 |
| SVG (`/*.svg`) | `max-age=1일, stale-while-revalidate=7일` | 중기 캐시 |
| CDN 이미지 (`img.bluehair.blue`) | `cdnUrl()` 쿼리 파라미터로 버스팅 | `ASSET_VERSION` 변경 시 갱신 |

---

## Claude Code Skills

프로젝트 전용 스킬 (`.claude/skills/`에 위치, Git 추적됨):

| 스킬 | 호출 | 설명 |
|---|---|---|
| `/new-page` | 사용자 + Claude | 새 페이지 생성 + App.jsx 라우트 등록 + 빌드 검증 |
| `/deploy-preview` | 사용자 전용 | `npm run build` + `wrangler deploy` 원커맨드 |
| `frontend-design` | Claude 전용 | 프론트엔드 디자인 가이드라인 (자동 참조) |
| `project-patterns` | Claude 전용 | git 히스토리 기반 개발 패턴 (커밋 컨벤션, 파일 공변 등) |

---

## 현재 상태 및 남은 작업

### 완료

#### 기반 구축
- [x] 사이트 구조 확정 (7섹션 + 하위 페이지 10개)
- [x] 디자인 시스템 (OKLCH 색상 토큰, 폰트, 다크+골드 톤)
- [x] 콘텐츠 확정 (캐치프레이즈, 캐릭터 15명, 구역 4개 + 산업단지, 게임모드 3개)
- [x] Vite + React 프로젝트 세팅 + 파일 분리
- [x] Cloudflare Workers & Pages 배포 + 도메인 연결 (intro.bluehair.blue)
- [x] wrangler.jsonc SPA 라우팅 설정 (not_found_handling)
- [x] GitHub repo 구성 (JaCha00/primecity)
- [x] 기획 문서 docs/ 폴더 정리 (프롬프트, 세계관, 캐릭터 프로필 등)

#### 메인 페이지 섹션
- [x] 히어로 배경 슬라이더 (CDN bg3~bg11, 9장 자동 전환 + 순수 CSS 크로스페이드)
- [x] 소개 섹션 (캐치프레이즈 + 스크롤 트리거 애니메이션)
- [x] 캐릭터 캐러셀 (Endfield 레퍼런스 — 썸네일 리스트 + 정보 + 일러스트, 15명 + 모바일 페이지네이션)
- [x] 세계관 인터랙티브 맵 (이미지 레이어 + SVG 히트박스, 5구역 hover/click + glow + 하단 툴팁)
- [x] CityMap 클릭 → 구역 상세 페이지 이동 (DistrictDetail.jsx, 5구역)
- [x] CityMap hover glow 즉각 반응 (불빛 0.05s + 모션 0.4s 분리, 순색 glowColor, brightness 1.1)
- [x] CityMap 등장 애니메이션 중 pointer-events 차단 (hover 히트테스트 버그 수정)
- [x] CityMap 데스크톱 커서 추적 툴팁 (DOM 직접 조작, absolute + 상대좌표, 리렌더 없음)
- [x] 구역 소개 텍스트(lore) 사이버펑크 톤으로 리뉴얼 (5구역)
- [x] 게임 모드 섹션 (메인 3탭 + 직업군 5카드 이중 UI + 8개 상세 페이지 링크)
- [x] TriangleNav 프리즘 모자이크 네비게이션 (데스크톱 SVG 모자이크 + 모바일 각진 스트립)
- [x] 파티클 배경 (Canvas API, 모바일 수량 감소)
- [x] 공통 PageLayout 컴포넌트 (하위 페이지 공유)
- [x] ScrollNav 스크롤 목차 (PC: 오른쪽 라벨+바, 모바일: 도트, 현재 섹션 자동 감지)

#### 하위 페이지 (TriangleNav 링크)
- [x] `/svg` — 세계관 비주얼 가이드 (SvgIntro.jsx)
- [x] `/gallery` — 아트 갤러리 + 라이트박스 (Gallery.jsx)
- [x] `/updates` — 업데이트 로그 타임라인 (Updates.jsx)
- [x] `/contact` — 문의 창구 (Contact.jsx)
- [x] `/works` — 작가의 다른 작품 (Works.jsx)

#### 게임 모드 상세 페이지 (메인 3 + 직업군 5 = 8개)
- [x] `/modes/audition` — 오디션 4라운드 상세 (ModeAudition.jsx)
- [x] `/modes/freeplay` — 자유활동 모드 소개 (ModeFreeplay.jsx)
- [x] `/modes/producer` — 프로듀서 모드 소개 (ModeProducer.jsx)
- [x] `/modes/manager` — 매니저 모드 (ModeManager.jsx, A/B분기 + 데일리 루프 + 이벤트)
- [x] `/modes/trainee` — 연습생 모드 (ModeTrainee.jsx, 실력바/평가/데뷔 게이지)
- [x] `/modes/composer` — 작곡가 모드 (ModeComposer.jsx, 곡작업→매칭→발매→차트)
- [x] `/modes/actor` — 배우 모드 (ModeActor.jsx, 캐스팅→촬영→방영)
- [x] `/modes/influencer` — 인플루언서 모드 (ModeInfluencer.jsx, 콘텐츠/팔로워/브랜드딜)

#### 캐릭터 상세 페이지 (Phase 2 완료)
- [x] 기본 틀 + 이미지 로딩/폴백 + brief 섹션
- [x] 같은 소속 캐릭터 네비게이션 (Same Agency)
- [x] 이전/다음 캐릭터 링크
- [x] 시네마틱 Phase 전환 (Phase 1: 홀로그램 스폰 → Phase 2: 프로필 카드 록온)
- [x] 2-Image Crossfade (contain 전신 홀로그램 → cover 크롭 카드, blur 포커스 록온)
- [x] 고스트 에코 실루엣 (시안+accent 좌우 분리 → 중앙 머지, mix-blend-mode: screen)
- [x] SVG HUD 오버레이 (스캔라인 스윕, 크로스헤어, stroke-dashoffset 코너 브라켓)
- [x] 홀로그램 링 2개 (반대 방향 회전, Phase 1 등장 → Phase 2 페이드)
- [x] 마우스 틸팅 3D 효과 (데스크톱 전용, ±3도 perspective)
- [x] 글리치 스폰 애니메이션 (clip-path 기반 0.5초)
- [x] 프로필 필드 borderLeft 그리기 애니메이션 (scaleY 0→1 HUD 효과)
- [x] 다이나믹 사이버펑크 배경 (세로 데이터 그리드 + 듀얼 마키 + 고스트 워터마크)
- [x] Concept Art & Expressions 미리보기 (4장) + "View All in Gallery →" 리다이렉트
- [x] 성능 최적화 (top/left→transform, willChange, GPU 가속)
- [x] cdnId 필드 15명 추가 (표정 CDN 경로용)

#### 데이터 & 에셋
- [x] 캐릭터 데이터 15명 완성 (characters.js)
- [x] 구역 데이터 4개 (districts.js) + 산업단지 (CityMap 내 정의)
- [x] 게임 모드 데이터 8개 (gamemodes.js — mainModes 3 + careerModes 5)
- [x] 배경 이미지 CDN 업로드 (bg3~bg11)
- [x] 도시 탑뷰 맵 CDN 업로드 (베이스맵 + 5개 구역 분리 PNG)
- [x] 캐릭터 이미지: 서윤, 나하린, 이서하, 강하람 (4/15 CDN 업로드 완료)

#### 코드 정리
- [x] 미사용 CharCard.jsx 삭제
- [x] flatted 보안 취약점 수정 (overrides >=3.4.2)
- [x] Claude Code Skills 2개 생성 (new-page, deploy-preview)
- [x] CDN 캐시 버스팅 유틸 (cdnUrl + ASSET_VERSION)
- [x] Cloudflare Pages 캐시 헤더 (_headers: HTML must-revalidate, JS/CSS immutable)
- [x] CharCarousel 코드 품질 개선 (useEffect deps, setTimeout race condition, color-mix, 컴포넌트 분리, 전역 keyframes)

---

#### Gallery 페이지 (Phase 3 완료)
- [x] Gallery 메이슨리 레이아웃 (CSS columns, 데스크톱 3열 / 모바일 2열)
- [x] Gallery 카테고리 필터 (대분류: 전체/도시/캐릭터, 하위 태그: 감정표현, 일상, 컨셉아트, NSFW)
- [x] Gallery 캐릭터 필터 — 소속사 아코디언 UI (`?character={id}` 쿼리 파라미터 연동)
- [x] Gallery 라이트박스 강화 (이전/다음 화살표, 터치 스와이프, 이미지 설명+태그, 키보드 ←→ESC, 카운터)
- [x] Gallery NSFW 토글 (기본 숨김 → R18 경고 모달 → 확인 후 표시, 세션 내 유지)
- [x] gallery.js 전체 상황코드 DB (감정 9 + 일상 9 + NSFW 56 = 캐릭터당 74코드 × 15명)
- [x] gallery.js cdnExprUrl 버그 수정 (char.id.toUpperCase() → char.cdnId)
- [x] 전체 15명 캐릭터 포함 (이미지 미업로드 시 imgErrors로 자동 숨김)

#### Navbar 개선
- [x] 갤러리(/gallery), 문의(/contact), 더 알아보기(#explore) 링크 추가
- [x] 하위 페이지에서 앵커 링크 작동 (useNavigate → 홈 이동 후 scrollIntoView)
- [x] 로고 클릭 → Link to="/" (SPA 라우팅)

#### SVG 템플릿 갤러리 (/svg 교체)
- [x] svgTemplates.js 데이터 파일 (6종: SNS 포스트, 트윗, 라이브 방송, 메신저, 뉴스 속보, 음원 차트)
- [x] SvgIntro.jsx → SVG 갤러리로 전면 교체 (카테고리 필터 + 상세 모달 3탭)
- [x] Worker 참조 파일 6개 (workers/ 디렉토리, 별도 배포)
- [x] App.jsx lazy + Suspense + NotFound 404 페이지 (다른 세션에서 추가된 리팩토링 통합)

#### SVG 템플릿 오버홀
- [x] 모바일 모달 닫기 버튼 위치 수정 (top:64, 44x44 터치 영역)
- [x] popstate 핸들러 (뒤로가기 시 모달 닫기, 홈 이탈 방지)
- [x] 커뮤니티 보드 신규 템플릿 추가 (DCInside 스타일, 7종째)
- [x] 전 템플릿 동적 애니메이션 (하트/채팅스크롤/타이핑점/배너플래시/골드글로우/스위프)
- [x] 외부 이미지 지원 (char 파라미터 → CDN 자동 매핑, safeImageUrl 보안)
- [x] promptExample 프로덕션 프롬프트로 교체 (라벨설명/출력위치/양식/예시 구분)
- [x] URL 인코딩 규칙 명시 (%20, %2C, %3F, 금지문자)
- [x] Cloudflare Workers 7개 배포 완료 (svg-insta/twit/live/talk/news/chart/community)
- [x] 운영 도메인 설정: `{종류}.bluehair.blue/ent/` (7개 라우트)
- [x] 태블릿 브리핑 SVG 신규 (8종째) — PPP 초대장 UI (심사위원/라운드/모드 안내/카피라이트)
- [x] Cloudflare Worker 배포 (svg-tablet → `tablet.bluehair.blue/ent/`)
- [x] svgTemplates.js 8개 템플릿 체계 완성

#### CityMap 모바일 개선
- [x] 더블탭 네비게이션 → 싱글탭 툴팁 + "자세히 보기 →" 버튼으로 변경

#### 챗봇 에셋 프리셋 (docs/)
- [x] NAI 프리셋 JSON 생성 (74개 scene: 감정 8 + 일상 9 + NSFW 41 + 착의 16)
- [x] 4개 파일로 분리 (감정2, 일상, 상황(NSFW), 착의)
- [x] nais2-backup에 9명 캐릭터 탈의 프롬프트 추가 (한소리~레이)
- [x] 프롬프트 구조: 배경→구도→Male Part→행위→여성 신체→부가→표정

#### CDN 파일명 숫자 코드 전환
- [x] SCENE_CODE_MAP 도입 (74개 영문→숫자 매핑, cdn.js)
- [x] cdnExprUrl 자동 변환 (happy→3.webp, doggystyle-sex→53.webp)
- [x] gallery.js 아이템에 sceneNum 필드 추가
- [x] Gallery.jsx에 #번호 배지 표시 (그리드 + 라이트박스)

#### 배경 밝기 최적화
- [x] HeroSlider 모바일 밝기 개선 (opacity 0.35→0.5, brightness 0.6→0.7, 비네팅 0.7→0.5)
- [x] HeroSlider 데스크톱 밝기 개선 (opacity 0.35→0.45, brightness 0.6→0.65, 비네팅 0.7→0.6)
- [x] CharDetail 비네팅 감소 (모바일 0.3/50%, 데스크톱 0.4/40%)
- [x] Home.jsx 섹션 구분선 + 장식 라인 추가

#### 오디션 네이밍
- [x] 오디션 고유명사: 프로듀스 · 프라임 · 프라이오리티 (PPP)
- [x] 작품명: 프로듀스 · 프리즘 · 프라이오리티
- [x] 스테이지 부문 (아이돌/가수/댄서/싱어송라이터) 설정 추가
- [x] 4R 에필로그 힌트: "프라임 → 프리즘" 순간
- [x] 소개 사이트 HeroSlider + gamemodes.js + 챗봇 HTML 반영
- [x] 히어로 CTA "플레이 시작" → 에덴챗 링크 (target="_blank")

#### 챗봇 프롬프트 Phase 1: 캐릭터별 로어북 (한국어)
- [x] 심사위원 3인 (진시혁, 에리카, 이서하) — 내면/대화패턴/관계역학/호감도
- [x] PRISM Studio (한소리, 강하람) — 오프닝 톤, 동료 관계
- [x] 오디션 참가자 8인 (장그루~라피스) — 오디션성향/무대스타일/탈락반응/호감도
- [x] 서윤 (간략, 확장 예정)
- [x] 🔒나하린 4층위 로어북 (스포일러 격리, 절대금지사항 5개)
- [x] 🔒세계관 이면 로어북 (구조적 레일, 복선 가이드)

#### 챗봇 프롬프트 Phase 4-1: 오디션 보조 모드 (한국어)
- [x] 오디션 오프닝 시퀀스 (Beat 1~7, 코믹 export 기반 개편 — 통화장면/커피/PPP설명/적자장부/초대장)
- [x] !오디션참가 모드 (참가자 시점, 시점 전환)
- [x] !선택지 애드온 모드 (토글 ON/OFF, 서사적 분기 선택지)

#### 챗봇 프롬프트 Phase 4-2: 직업군 모드 로어북 (한국어)
- [x] !매니저모드 (A/B 분기, 아티스트별 특색, 스케줄/위기/관계 루프)
- [x] !연습생모드 (Route 0, 실력바/평가등급/데뷔게이지)
- [x] !작곡가모드 (Blue Moon, 곡작업→매칭→발매→차트)
- [x] !배우모드 (캐스팅→촬영→방영, 연기력/인지도)
- [x] !인플루언서모드 (하입로드, 팔로워/트렌드/브랜드딜)

#### 챗봇 프롬프트 Phase 4-3: 모드 영문화
- [x] 직업군 모드 5개 영문 JSON (연예계_로어북_모드_EN.json, id 0~4)
- [x] 오디션 오프닝 시퀀스 영문 JSON (id 5, Beat 1~7 코믹 기반)
- [x] !오디션참가 영문 JSON (id 6, 시점 전환/탈락 처리)
- [x] !선택지 애드온 영문 JSON (id 7, 토글/중첩 규칙)
- [x] 한글 고유명사 유지 (컨디션/평판/호감도/후배님/능글능글/까칠하지만/천재일우/라스트 댄스 등)

#### 챗봇 프롬프트 Phase 3: SVG 커스텀 도메인
- [x] 7개 서브도메인 DNS AAAA 레코드 등록 (news/insta/twit/live/talk/chart/community)
- [x] SVG 정렬 수정 (news time, talk online dot, badge positions)
- [x] 4개 Worker 수정 후 재배포

#### 챗봇 프롬프트 Phase 2: 영문화 + 포맷 최적화
- [x] 메인 프롬프트 영문 JSON (terminology 섹션 포함)
- [x] 오디션 로어북 8개 영문 JSON
- [x] 캐릭터 로어북 14명 영문 JSON
- [x] 🔒나하린 4층위 영문 JSON
- [x] 🔒세계관 이면 영문 JSON
- [x] 한글 고유명사 유지 (고데레/아네데레/다루데레/무자각 여친계/감초/언더독/변수/짠꿉공 등)
- [x] 약 1000토큰 절약 확인

#### 챗봇 프롬프트: 코믹 export 반영
- [x] 오디션 오프닝 로어북 코믹 기반 전면 개편 (통화장면/커피취향/PPP명칭/적자장부/초대장)
- [x] 한소리 한국어 로어북 보강 (커피취향 기억, 적자 메모 습관, PPP 심사위원 독단 배정)
- [x] 한소리 영문 로어북 동기화 (inner/dialogue 코믹 대사 추가)
- [x] PPP 약자 gamemodes.js 반영

---

### 구현 필요

#### 우선순위 높음 — 에셋 제작
- [ ] 캐릭터 이미지 에셋 제작 + CDN 업로드 (4/15 완료, 11명 플레이스홀더)
- [ ] 캐릭터 표정/상황 WebP 에셋 생성 (NAI 프리셋 사용) + CDN 업로드 (파일명: {숫자}.webp)
- [ ] SVG 전용 에셋 제작 + CDN 업로드 (경로: `ent/{cdnId}/svg/{type}.webp`)
  - avatar.webp (1:1 정사각, 프로필) × 15명
  - post.webp (4:3 가로, SNS 게시물) × 필요 캐릭터
  - stream.webp (5:3 가로, 방송 프리뷰) × 필요 캐릭터
  - news.webp (16:9 가로, 뉴스 이미지) × 필요 캐릭터
- [ ] CharDetail 히어로 전용 와이드 에셋 검토 (현재 2:3 세로형 이미지를 풀스크린에 사용 중)

#### 직업군 모드 + SVG 업데이트 (이번 세션 완료)
- [x] gamemodes.js 확장: mainModes(3) + careerModes(5) 분리 export
- [x] GameModes.jsx UI 개편: 메인 탭(3) + 직업군 카드 그리드(5) 이중 구조
- [x] 직업군 상세 페이지 5개 생성 (ModeManager/ModeTrainee/ModeComposer/ModeActor/ModeInfluencer)
- [x] App.jsx 라우트 5개 추가 (총 16개)
- [x] 챗봇 소개 HTML에 직업군 모드 5개 + 시작 명령어(!모드명) 반영
- [x] SVG CDN 양식 점검 완료: 8개 Worker 정상, charAssets() 클라이언트 전용으로 동기화 불필요 확인, promptExample URL 일치 확인
- [x] 태블릿 템플릿은 svgTemplates.js에 이미 포함 → SvgIntro에서 자동 표시

#### 우선순위 중간 — 코드 동기화 + 챗봇
- [ ] 챗봇 메인 프롬프트에 SVG 출력 규칙 통합 (docs/연예계 챗봇 메인 프롬프트.txt)
- [ ] Works 페이지에 추가 작품 등록 (현재 프라임시티만)
- [ ] Phase 5: 프롬프트 품질 개선 (자가점검/감정잔여/복선스케줄러)
- [ ] 에덴챗 플랫폼 테스트 (로어북 동시 활성 성능, 상태창 렌더링)

#### 우선순위 낮음 — 품질 관리
- [ ] 모바일 시네마틱 효과 최종 검수 + 성능 최적화 (전 페이지)
- [ ] CharDetail 그래픽 가속 off 환경 성능 테스트

---

## 향후 개선 아이디어

> 현재 핵심 기능 완성 후 고려할 수 있는 개선 방향들.

### UX / 인터랙션
- **페이지 전환 애니메이션** — View Transitions API 또는 Framer Motion 활용, 하위 페이지 진입 시 시네마틱 전환
- **캐릭터 관계도** — 인맥/소속 기반 그래프 시각화 (SVG 또는 D3.js)
- **캐릭터 필터/검색** — 소속사·역할별 필터링, 검색 기능
- **사운드 디자인** — BGM 토글 버튼 + 호버/클릭 효과음 (Web Audio API)

### 기술 / 성능
- **이미지 최적화** — WebP/AVIF 포맷 변환, srcset 반응형 이미지, Cloudflare Image Resizing 활용
- ~~**코드 스플리팅** — React.lazy + Suspense로 하위 페이지 동적 임포트~~ ✅ 구현됨
- ~~**SEO** — react-helmet-async로 페이지별 메타태그 + OG 이미지 동적 생성~~ ✅ 구현됨 (Seo 컴포넌트)
- **접근성(a11y)** — 키보드 네비게이션 강화, aria-label, 고대비 모드, 스크린 리더 지원
- ~~**404 페이지** — 존재하지 않는 경로 접근 시 커스텀 404~~ ✅ 구현됨 (NotFound.jsx)
- ~~**로딩 상태** — 페이지 전환 시 스켈레톤/스피너 (Suspense fallback)~~ ✅ 구현됨 (App.jsx Fallback)

### 콘텐츠 확장
- **i18n 다국어** — 한/영/일 지원 (react-i18next)
- **에덴챗 연동** — 챗봇 위젯 임베드 프리뷰 또는 데모 대화
- **타임라인/연대기** — 프라임시티 세계관 역사 타임라인 시각화
- **팬 아트 갤러리** — 커뮤니티 투고 기능 (Cloudflare R2 + Workers)
- **구역 상세 콘텐츠 확장** — DistrictDetail 페이지에 구역별 배경 이미지, 명소 소개, 주민 생활 등 추가
- **캐릭터 관계망** — 캐릭터 상세 페이지에서 관계 캐릭터 간 양방향 링크 + 관계 설명

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
