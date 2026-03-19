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
│   └── assets/
│       ├── bg/              ← 도시 배경 슬라이드 (bg1.png ~ bg5.png)
│       ├── characters/      ← 캐릭터 이미지 (세로형 2:3)
│       └── map/             ← 세계관 탑뷰 맵
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Particles.jsx
│   │   ├── HeroSlider.jsx   ← 배경 이미지 자동 슬라이드
│   │   ├── CharCarousel.jsx ← 캐릭터 캐러셀 (15명, 페이지네이션)
│   │   ├── CityMap.jsx      ← 세계관 인터랙티브 맵 (이미지 레이어 + SVG 히트박스)
│   │   ├── DistrictCard.jsx
│   │   ├── CharCard.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx         ← 메인 랜딩 (전체 섹션 조합)
│   │   └── CharDetail.jsx   ← /characters/:name (캐릭터 상세)
│   ├── styles/
│   │   └── tokens.js        ← OKLCH 색상 토큰 export
│   ├── data/
│   │   ├── characters.js    ← 캐릭터 데이터 배열
│   │   └── districts.js     ← 구역 데이터 배열
│   ├── hooks/
│   │   ├── useIsMobile.js
│   │   └── useReveal.js
│   ├── App.jsx              ← React Router 설정
│   └── main.jsx             ← 엔트리포인트
├── CLAUDE.md                ← 이 파일
├── package.json
└── vite.config.js
```

---

## 사이트 구조 (섹션 흐름)

```
[1] 히어로
    - 도시 배경 4~5장 자동 슬라이드 (풀스크린)
    - fade/crossfade 전환
    - 이미지 위에 그라디언트 오버레이 + 비네팅
        ↓ 스크롤
[2] 소개
    - 캐치프레이즈 + 간략 소개
    - 스크롤 트리거 애니메이션 (fade-in, slide-up)
        ↓ 스크롤
[3] 캐릭터 갤러리
    - 좌우 스와이프 캐러셀 (한 명씩)
    - 왼쪽: 이름, 신체정보(키, 컵 수 등), 간단 소개, 상세 페이지 링크
    - 오른쪽: 캐릭터 이미지
    - 양쪽 화살표 또는 드래그로 전환
        ↓ 스크롤
[4] 세계관
    - 탑뷰 도시 이미지 (인터랙티브 맵)
    - 각 구역에 클릭 가능한 마커/화살표
    - 클릭 시 해당 구역 상세 설명으로 스크롤 이동
        ↓
[4-sub] 구역 상세
    - 더 코어 / 미들 링 / 하입 로드 / 테라스
    - 각 구역이 스크롤 도착점 (id anchor)
        ↓
[5] 푸터
    - 로고 + © 2026 bluehair.blue

[별도 페이지] /characters/:name
    - 캐릭터별 상세 소개 페이지
    - URL 라우팅 (react-router-dom)
```

---

## 라우팅

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/characters/:name" element={<CharDetail />} />
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

총 15명. 상세 프로필은 `Characters` 파일 참조.

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

각 캐릭터 객체 필드: `id`, `name`, `agency`, `role`, `age`, `tagline`, `color`, `image`, `thumbnail`, `detailPath`, `signature`, `personality`, `description`, `brief`

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

### CDN 경로 규칙

| 에셋 유형 | CDN 경로 | 비고 |
|---|---|---|
| 도시 배경 | `https://img.bluehair.blue/ent/bg{N}.png` | N = 1~9 |
| 캐릭터 | `https://img.bluehair.blue/ent/char/{id}.png` | 서윤만 완료 (SY.png, SYthumbnail.png) |
| 맵 베이스 | `https://img.bluehair.blue/ent/Citybase(1).png` | 전체 탑뷰 맵 |
| 맵 구역 | `https://img.bluehair.blue/ent/{구역명}.png` | The Core, Middle Ring, Hype Road, Terrace, industrial complex |

또는 `public/assets/` 로컬 경로도 사용 가능.

### 해상도 기준

| 에셋 | 해상도 | 비율 | 포맷 |
|---|---|---|---|
| 도시 배경 (히어로 슬라이드) | 1920×800 또는 1536×640 | ~2.4:1 | PNG |
| 캐릭터 (갤러리) | 800×1200 | 2:3 세로형 | PNG (투명 배경 권장) |
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

### SPA 라우팅 처리

Cloudflare Pages에서 SPA 라우팅을 위해 `public/_redirects` 파일 필요:
```
/*  /index.html  200
```

---

## 현재 상태 및 남은 작업

### 완료
- [x] 사이트 구조 확정 (5섹션 + 캐릭터 상세 페이지)
- [x] 디자인 시스템 (OKLCH 색상, 폰트, 톤)
- [x] 콘텐츠 확정 (캐치프레이즈, 캐릭터 15명, 구역 4개 + 산업단지)
- [x] 프로토타입 JSX (Claude.ai에서 제작)
- [x] 배경 이미지 CDN 테스트 (bg1~bg9 업로드 완료)
- [x] Vite 프로젝트 세팅 + 파일 분리
- [x] Cloudflare Workers & Pages 배포 + 도메인 연결 (intro.bluehair.blue)
- [x] 캐릭터 캐러셀 (Endfield 레퍼런스 기반 — 썸네일 리스트 + 정보 + 일러스트)
- [x] 캐릭터 캐러셀 15명 확장 + 모바일 페이지네이션
- [x] 캐릭터 상세 페이지 기본 틀 (/characters/:name)
- [x] 히어로 배경 슬라이더 (9장 자동 전환 + 순수 CSS 크로스페이드)
- [x] wrangler.jsonc 배포 설정 수정 (assets.directory 추가)
- [x] 세계관 인터랙티브 맵 (이미지 레이어 + SVG 히트박스, 5구역 hover/click)
- [x] 도시 탑뷰 맵 이미지 CDN 업로드 (베이스맵 + 5개 구역 분리 PNG)
- [x] CityMap 구역 hover 시 accent 색상 윤곽선 glow 효과
- [x] CityMap 툴팁 맵 하단 고정 배치 (PC/모바일 통일)

### 구현 필요
- [ ] 캐릭터 상세 페이지 콘텐츠 보강 (현재 기본 틀만 있음, Characters 파일 기반)
- [ ] 캐릭터 이미지 에셋 제작 + 업로드 (서윤만 완료, 나머지 14명 플레이스홀더)
- [ ] 모바일 최종 검수
