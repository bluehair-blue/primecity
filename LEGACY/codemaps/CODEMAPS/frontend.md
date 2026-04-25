<!-- Generated: 2026-04-11 | Files scanned: 41 JSX/JS | Token estimate: ~900 -->

# Prime City — Frontend Codemap

## Route Tree (src/App.jsx)

```
/                          Home.jsx
/characters/:name          CharDetail.jsx   [lazy]
/districts/:id             DistrictDetail.jsx [lazy]
/gallery                   Gallery.jsx      [lazy]
/svg                       SvgIntro.jsx     [lazy]
/updates                   Updates.jsx      [lazy]
/contact                   Contact.jsx      [lazy]
/works                     Works.jsx        [lazy]
/modes/audition            ModeAudition.jsx [lazy]
/modes/freeplay            ModeFreeplay.jsx [lazy]
/modes/producer            ModeProducer.jsx [lazy]
/modes/manager             ModeManager.jsx  [lazy]
/modes/trainee             ModeTrainee.jsx  [lazy]
/modes/composer            ModeComposer.jsx [lazy]
/modes/actor               ModeActor.jsx    [lazy]
/modes/influencer          ModeInfluencer.jsx [lazy]
*                          NotFound.jsx     [lazy]
```

## Home.jsx Section Flow

```
Navbar → Particles → HeroSlider → IntroSection
→ CharCarousel → CityMap → GameModes → TriangleNav → Footer
```

## CharDetail 상태기계

```
CharDetail.jsx
  ├─ if janggru   → JgrCharDetail       (module-scope, 독립 컴포넌트)
  ├─ if keyVisual → CinematicCharDetail (공용 뼈대)
  └─ else         → DefaultCharDetail   (기존 홀로그램)

CinematicCharDetail phases:
  Phase -1  LoadingShell (500ms timeout, progress bar)
  Phase  0  Intro overlay (INTRO_COMPONENTS[char.introStyle])
  Phase  1  KeyVisual hero (tilt ±1.5° · 반사 · bgMarquee)
  Phase  2  CharExpressionsGrid → Sign → CharNavigation → Footer
```

## 컴포넌트 계층

```
src/components/
  Navbar.jsx            전역 상단 네비
  PageLayout.jsx        표준 페이지 래퍼 (render props)
  HeroSlider.jsx        bg3~11 배경 슬라이더 + 이중 오빗 링
  CharCarousel.jsx      15명 캐릭터 카드 슬라이더
  CityMap.jsx           5구역 인터랙티브 맵 (등각 보정)
  GameModes.jsx         3+5 모드 카드
  TriangleNav.jsx       하위 5종 링크
  CharExpressionsGrid.jsx  9종 표정 그리드 + 라이트박스
  CharLightbox.jsx      이미지 라이트박스
  CharNavigation.jsx    이전/다음 캐릭터 네비
  Seo.jsx               react-helmet-async 래퍼
  Footer.jsx / Particles.jsx / ScrollNav.jsx / DistrictCard.jsx

  cinematic/
    index.js            INTRO_COMPONENTS 레지스트리
    CenteredQuote.jsx   공용 대사 오버레이 (subtle/hero emphasis)
    CutawayIntro.jsx    JSH — 컷어웨이 + 레터박스
    SunriseIntro.jsx    KHR — 카메라 컨셉
    RippleIntro.jsx     MIL — SVG turbulence 물결
    GlitchIntro.jsx     LSH — RGB 채널 분리 글리치
    FlashIntro.jsx      MMR — 댓글 스트림 + 모션블러
```

## 데이터 레이어

```
src/data/
  characters.js   15명 캐릭터 정의 (cdnUrl 참조)
  districts.js    5구역 정의
  gamemodes.js    3+5 게임모드
  gallery.js      갤러리 데이터
  introStyles.js  INTRO_STYLE_CONFIG (duration, letterbox, etc.)
  svgTemplates.js generateTablet() 등 SVG 생성 함수

src/styles/
  tokens.js       OKLCH 색상 토큰 (C.gold, C.primeBlue, C.bgDeep 등)

src/utils/
  cdn.js          cdnUrl(), cdnExprUrl(), SCENE_CODE_MAP, ASSET_VERSION=11

src/hooks/
  useIsMobile.js  (768px breakpoint)
  useReveal.js    IntersectionObserver 애니메이션 게이트
  useImagePreloader.js  키비주얼+인트로 에셋 사전로드
  useCharLightbox.js    라이트박스 상태 관리
```

## 인트로 등록 절차 (신규 캐릭터)

1. `src/components/cinematic/XxxIntro.jsx` 작성 (골격: CLAUDE.md §CharDetail)
2. `src/components/cinematic/index.js` INTRO_COMPONENTS에 등록
3. `src/data/introStyles.js` INTRO_STYLE_CONFIG에 duration 추가
4. `src/data/characters.js` 해당 캐릭터에 `introStyle: "xxx"` 설정
5. `npm run build` → 커밋

## 미완 인트로 (Step 7c~7e)

| 캐릭터 | 스타일 | 연출 |
|--------|--------|------|
| NHR | fog | 안개 서서히 걷힘 |
| HSR | cardDeal | 카드 딜 |
| HSE | pageFlip | 페이지 넘김 |
