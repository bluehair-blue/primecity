# plan.md — 프라임시티 프로젝트 총체적 기획

> CLAUDE.md에서 분리된 작업 기획 문서. 완료 항목은 이력으로 보존하고, 미완 항목은 우선순위별로 관리한다.
> 하위 폴더별 세부 작업 지시가 필요하면 해당 폴더에 `plan_sub.md`를 생성한다.

---

## 완료된 작업 이력

### 기반 구축
- [x] 사이트 구조 확정 (7섹션 + 하위 페이지 10개)
- [x] 디자인 시스템 (OKLCH 색상 토큰, 폰트, 다크+골드 톤)
- [x] 콘텐츠 확정 (캐치프레이즈, 캐릭터 15명, 구역 4+1개, 게임모드 8개)
- [x] Vite + React 프로젝트 세팅 + Cloudflare Pages 배포
- [x] GitHub repo 구성 (JaCha00/primecity)

### 메인 페이지 (전 섹션 완료)
- [x] HeroSlider (CDN bg3~11, CSS 크로스페이드, 이중 오빗 링)
- [x] IntroSection (캐치프레이즈 + 스크롤 트리거)
- [x] CharCarousel (15명, Endfield 레퍼런스, 모바일 페이지네이션)
- [x] CityMap (SVG 히트박스, 5구역, 블루 그리드, 모바일 싱글탭)
- [x] GameModes (메인 3탭 + 직업군 5카드)
- [x] TriangleNav (SVG 모자이크, 색수차)
- [x] ScrollNav (PC: 라벨+바, 모바일: 도트)

### 하위 페이지 (16개 전부 완료)
- [x] CharDetail — 시네마틱 Phase 전환, HUD, 고스트 에코, 마우스 틸팅, 표정 미리보기
- [x] DistrictDetail — 히어로 + 랜드마크 + 로어 (사이버펑크 톤)
- [x] Gallery — 메이슨리, 소속사 아코디언 필터, 라이트박스, NSFW 토글
- [x] SvgIntro — 8종 SVG 템플릿 갤러리 + 모달
- [x] ModeAudition~ModeInfluencer — 8개 모드 상세 (웹툰 섹션 포함)
- [x] Updates, Works, Contact, NotFound

### 디자인 시스템
- [x] Gold & Azure Dualism (tokens.js primeBlue 5토큰, hue 265)
- [x] 전 컴포넌트 블루 호버 적용 (Navbar, ScrollNav, GameModes)
- [x] 파티클 골드:블루 7:3
- [x] CharDetail 마키 라인 리뉴얼 (이름 독립 레이어, blur ◆ 구분자)

### 챗봇 프롬프트 (Phase 1~4 완료)
- [x] Phase 1: 캐릭터별 한국어 로어북 (16개)
- [x] Phase 2: 영문화 + 포맷 최적화 (6개 JSON, ~1000토큰 절약)
- [x] Phase 3: SVG 커스텀 도메인 (8개 Worker)
- [x] Phase 4: 직업군 모드 + 오디션 보조 (8개 모드 로어북)
- [x] 프롬프트 압축: 84KB → 56KB (33% 절감)
- [x] !오디션참가 → 오디션 perspective 통합
- [x] 챗봇 소개 HTML 오버홀 (CSS vars, 접기 UX, 프로필 15명, 문의 링크)

### 에셋 파이프라인 (완료)
- [x] NAI API 자동화 (asset_generator.py) — 1,125장 + 특수 90장 생성
- [x] R2 업로드 (1,235장+)
- [x] PNG→WebP CDN 전환 (ASSET_VERSION 2)
- [x] 자동 검열 (auto_censor.py) — ntd11 YOLO-seg + 형태 복원

### 보안
- [x] SVG Worker 8개 XSS 수정 (escapeXml 101곳)
- [x] 보안 헤더 6종 (CSP, X-Frame-Options 등)

### 코드 정리
- [x] 루트 파일 정리 (7문서→docs, 스크립트→tools, 임시파일 삭제, primecity/ 삭제)
- [x] tools_dist/ 배포용 클린 복사본
- [x] research.md/research_sub.md 문서 체계 구축

---

## 미완 작업 (우선순위순)

### 긴급 (마감 전)
- [ ] NSFW 이미지 검열 배치 실행 (`auto_censor.py --batch-all` → R2 재업로드)
- [ ] 에덴챗 플랫폼 로어북 삽입 테스트 (동시 활성 성능, 상태창 렌더링)

### 중간
- [ ] Works 페이지에 추가 작품 등록 (현재 프라임시티만)
- [ ] Phase 5: 프롬프트 품질 개선 (자가점검/감정잔여/복선스케줄러)
- [ ] 검열 모델 한계 보완: pussy/anus 미감지율 개선

### 낮음
- [ ] 모바일 시네마틱 효과 최종 검수 + 성능 최적화
- [ ] CharDetail 그래픽 가속 off 환경 성능 테스트
- [ ] README.md 프로젝트 맞춤 내용으로 교체
