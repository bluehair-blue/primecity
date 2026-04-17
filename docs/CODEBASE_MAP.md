# Codebase Map — Prime City

> 이 문서는 프로젝트 전체 구조를 빠르게 파악하기 위한 **목차 파일**입니다.
> 각 파일의 줄 수와 역할을 기록합니다. 파일 분할/추가/삭제 시 갱신할 것.
> 마지막 갱신: 2026-04-17 (오디션 모드 분리 + scene_roster 범용 방어)

---

## src/ — React Frontend

### Pages (src/pages/)

| File | Lines | Role |
|------|------:|------|
| CharDetail.jsx | 47 | 캐릭터 상세 디스패처 (라우팅 분기) |
| Gallery.jsx | 578 | 이미지 갤러리 (필터/페이지네이션) |
| ModeAudition.jsx | 584 | 오디션 모드 소개 (프로듀서/참가자 2관점 카드) |
| Updates.jsx | 298 | 업데이트 로그 |
| Home.jsx | 247 | 메인 페이지 (섹션 오케스트레이터) |
| Works.jsx | 201 | 작품 페이지 |
| DistrictDetail.jsx | 200 | 구역 상세 |
| ModeFreeplay.jsx | 199 | 프리플레이 모드 소개 |
| ModeProducer.jsx | 191 | 프로듀서 모드 소개 |
| SvgIntro.jsx | 190 | SVG 템플릿 갤러리 |
| Contact.jsx | 159 | 연락처 |
| ModeManager.jsx | 145 | 매니저 모드 소개 |
| ModeInfluencer.jsx | 130 | 인플루언서 모드 소개 |
| ModeTrainee.jsx | 106 | 연습생 모드 소개 |
| ModeComposer.jsx | 106 | 작곡가 모드 소개 |
| ModeActor.jsx | 105 | 배우 모드 소개 |
| NotFound.jsx | 102 | 404 페이지 |

### Components (src/components/)

| File | Lines | Role |
|------|------:|------|
| CharCarousel.jsx | 874 | 캐릭터 캐러셀 (메인) |
| GameModes.jsx | 563 | 게임 모드 섹션 |
| DefaultCharDetail.jsx | 625 | 기본 캐릭터 상세 (홀로그램 UI) |
| CinematicCharDetail.jsx | 481 | 시네마틱 인트로 공용 뼈대 |
| TriangleNav.jsx | 474 | 하위 네비게이션 |
| HeroSlider.jsx | 416 | 히어로 슬라이더 |
| JgrCharDetail.jsx | 397 | 장그루 전용 인트로 |
| CityMap.jsx | 386 | 도시 지도 (인터랙티브) |
| Navbar.jsx | 354 | 상단 네비게이션 |
| CharExpressionsGrid.jsx | 178 | 캐릭터 표정 그리드 |
| ScrollNav.jsx | 160 | 스크롤 네비게이션 |
| CharNavigation.jsx | 125 | 캐릭터 간 이동 |
| DistrictCard.jsx | 107 | 구역 카드 |
| ImageSystemInfo.jsx | 97 | 이미지 시스템 설명 패널 |
| Particles.jsx | 96 | 파티클 배경 |
| DistrictTooltip.jsx | 81 | 지도 구역 툴팁 |
| CharSign.jsx | 27 | 캐릭터 사인 이미지 (공용) |
| CharLightbox.jsx | 69 | 이미지 라이트박스 |
| Footer.jsx | 51 | 푸터 |
| PageLayout.jsx | 46 | 페이지 레이아웃 래퍼 |
| Seo.jsx | 28 | SEO 메타 태그 |

#### Cinematic Intro (src/components/cinematic/)

| File | Lines | Style | Character |
|------|------:|-------|-----------|
| WindIntro.jsx | 385 | wind | HSR (한소리) |
| SunriseIntro.jsx | 370 | sunrise | KHR (강하람) |
| FogIntro.jsx | 361 | fog | NHR (나하린) |
| PageFlipIntro.jsx | 267 | pageFlip | HSE (하시은) |
| FlashIntro.jsx | 257 | flash | MMR (미모리) |
| RippleIntro.jsx | 254 | ripple | MIL (밀라) |
| CutawayIntro.jsx | 226 | cutaway | JSH (진시혁) |
| GlitchIntro.jsx | 198 | glitch | LSH (이서하) |
| CenteredQuote.jsx | 113 | (공용) | 대사 표시 컴포넌트 |
| index.js | 19 | — | INTRO_COMPONENTS 레지스트리 |

#### Carousel (src/components/carousel/)

| File | Lines | Role |
|------|------:|------|
| Thumbnail.jsx | 61 | 캐릭터 썸네일 버튼 |
| InfoTag.jsx | 36 | 정보 배지 |

### Data (src/data/)

| File | Lines | Role |
|------|------:|------|
| characters.js | 561 | 17명 캐릭터 데이터 |
| gamemodes.js | 176 | 게임 모드 정의 (16종) |
| gallery.js | 166 | 갤러리 아이템 |
| cityMapGeometry.js | 124 | 도시 지도 좌표/도형 |
| districts.js | 118 | 5개 구역 데이터 |
| introStyles.js | 75 | 시네마틱 인트로 설정 |
| galleryConfig.js | 23 | 갤러리 상수 |
| svgTemplates.js | 17 | SVG 템플릿 re-export |

#### SVG Templates (src/data/svgTemplates/)

| File | Lines | Role |
|------|------:|------|
| templates-broadcast.js | 1,095 | 방송계 SVG (라이브/뉴스/태블릿/일정) |
| templates-utility.js | 546 | 유틸리티 SVG (차트/커뮤니티/게시글) |
| templates-sns.js | 376 | SNS SVG (포스트/트윗/메신저) |
| helpers.js | 66 | 공용 헬퍼 (escapeXml, CDN, 색상) |

### Hooks (src/hooks/)

| File | Lines | Role |
|------|------:|------|
| useImagePreloader.js | 62 | 이미지 사전 로딩 |
| useCharLightbox.js | 43 | 라이트박스 상태 관리 |
| useReveal.js | 22 | IntersectionObserver 애니메이션 |
| useIsMobile.js | 12 | 모바일 감지 (768px) |

### Utils & Styles

| File | Lines | Role |
|------|------:|------|
| utils/cdn.js | 76 | CDN URL 생성 + ASSET_VERSION |
| styles/tokens.js | 65 | OKLCH 디자인 토큰 |

### Entry Points

| File | Lines | Role |
|------|------:|------|
| App.jsx | 75 | 라우트 정의 |
| main.jsx | 43 | React 마운트 |

---

## workers/ — Cloudflare SVG Workers

| File | Lines | Domain | Role |
|------|------:|--------|------|
| svg-tablet.js | 497 | tablet.bluehair.blue | PPP 브리핑 태블릿 |
| svg-schedule.js | 304 | schedule.bluehair.blue | 일정표 |
| svg-post.js | 258 | post.bluehair.blue | 커뮤니티 게시글 |
| svg-community.js | 166 | community.bluehair.blue | 커뮤니티 게시판 |
| svg-livestream.js | 158 | live.bluehair.blue | 라이브 스트리밍 |
| svg-sns.js | 143 | insta.bluehair.blue | SNS 포스트 |
| svg-messenger.js | 126 | msg.bluehair.blue | 메신저 |
| svg-tweet.js | 117 | twit.bluehair.blue | 트윗 |
| svg-news.js | 114 | news.bluehair.blue | 뉴스 속보 |
| svg-chart.js | 66 | chart.bluehair.blue | 음원 차트 |

---

## tools/ — Python Pipeline

| File | Lines | Role |
|------|------:|------|
| asset_generator.py | 731 | NAI API 이미지 생성 배치 |
| auto_censor.py | 577 | YOLO 기반 NSFW 검열 |
| extract_char_prompts.py | 339 | 캐릭터 프롬프트 추출 |
| edenchat_clipboard.py | 322 | 에덴챗 로어북 삽입 매크로 |
| r2_sync_loop.py | 283 | char_img → R2 동기화 루프 |
| extract_config.py | 233 | NAIS2 설정 추출 |
| verify_danbooru_tags.py | 61 | Danbooru 태그 검증 |
| utils.py | 60 | 공용 상수 (ALL_CHARS 등) |

**주요 설정 파일:**
- `asset_config.json` — 캐릭터 프롬프트 + 씬 정의 + 오버라이드
- `character_pose_overrides.json` — 아키타입별 포즈/표정 태그
- `generation_state.json` — 생성 진행 상태 (런타임)
- `.r2_uploaded.json` — R2 업로드 트래커 (런타임)

---

## docs/prompts/json/ — Lorebook System (103개+)

| Folder | Count | Role |
|--------|------:|------|
| 캐릭터/ | 88 | 캐릭터 본체/트리거/초기/심화/특수 |
| 모드/ | 28 | 모드 본체/시작 시나리오/B분기 |
| 오디션/ | 12 | 오디션 모드(프로듀서/참가자) · 라운드/막간 |
| 루트 | 21 | 메인 프롬프트, 구역, SVG, 이미지, 세계관 |

**파일 규칙:** `{이름}_EN.json` · 트리거는 `// --- TRIGGER ---` 주석 · 1엔트리=1파일

---

## .claude/ — Hooks & Skills

### Hooks (9개)
| Hook | Trigger | 역할 |
|------|---------|------|
| build-check-before-stop | stop | 빌드 검증 후 종료 |
| cdn-url-hardcode | regex: CDN URL | cdnUrl() 강제 |
| char-intro-checklist | edit CharDetail | 시네마틱 인트로 체크리스트 |
| lorebook-naming | write json/ | 로어북 파일명 규칙 |
| oklch-color-enforce | regex: hex/rgb | OKLCH 전용 색상 |
| optimization-checklist | edit *.jsx | 최적화 체크리스트 |
| sensitive-files | pattern: .env | 민감 파일 경고 |
| svg-image-inline | edit svg-*.js | base64 인라인 확인 |
| worker-dns-reminder | wrangler deploy | DNS CNAME 알림 |

### Skills (4개)
| Skill | 역할 |
|-------|------|
| /new-page | 새 페이지 생성 + 라우트 등록 |
| /deploy-preview | 빌드 + 배포 원커맨드 |
| frontend-design | 디자인 가이드라인 (자동) |
| project-patterns | Git 히스토리 패턴 (자동) |
