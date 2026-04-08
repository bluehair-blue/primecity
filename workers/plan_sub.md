# workers/ — 태블릿 SVG 개편 계획

> **대상**: `svg-tablet.js` (tablet.bluehair.blue)
> **현 상태**: 326줄, PPP 초대장 브리핑 UI. 오디션 기본 정보만 포함.
> **목표**: 챗봇 시작상황에서 유저에게 필요한 **모든 핵심 안내**를 담은 종합 가이드 태블릿으로 개편.

### Source of Truth 정책

| 구분 | 파일 | 역할 |
|---|---|---|
| **Master** | `workers/svg-tablet.js` | Worker 배포본. 모든 변경의 출발점 |
| **Mirror** | `src/data/svgTemplates.js` generateTablet() | 사이트 프리뷰 + SvgIntro.jsx 소비용 |
| **Metadata** | `src/data/svgTemplates.js` params/desc/promptExample | SvgIntro 페이지 표 · 코드블록 표시용 |
| **Lorebook** | `docs/prompts/json/SVG_태블릿_EN.json` | 에덴챗 AI 프롬프트 |
| **Combined** | `docs/prompts/json/_combined/SVG_프롬프트_EN.json` | 합본 산출물 (수동 수정 대상 아님, Master에서 파생) |

**동기화 순서**: Master(worker) 수정 → Mirror(svgTemplates generate) 복사 → Metadata(params/desc/promptExample) 갱신 → Lorebook 갱신
**`_combined/` 파일은 건드리지 않는다** — 다음 합본 사이클에서 자동 반영.

### Escape Contract (양쪽 공통 규칙)

```
마크업 조합 변수 (roundRows, mainCells 등) → raw 삽입: ${변수}
리프 텍스트 (URL 파라미터에서 온 사용자 입력) → escapeXml(): ${escapeXml(값)}
```

이 규칙을 worker 파일 상단에 주석으로 명시한다.

---

## 0. 현재 문제점 분석

### 콘텐츠 부족
| 항목 | 현재 | 목표 |
|---|---|---|
| 모드 안내 | 3 메인 + 5 커리어 (총 8개) | **13개 전체** (!선택지, !디테일, !스킵, !비하인드, !소꿉친구 5개 추가) |
| NSFW 전환 | 언급 없음 | 🔞 토글 방식 간략 안내 |
| 오디션장 약도 | 없음 | 하입 로드 PRISM Studio 위치 + 미니맵 |
| 사이트 링크 | 없음 | intro.bluehair.blue 리다이렉트 이미지 |
| 이미지 규칙 | CDN 경로 + 코드표만 | 간략한 이미지 출력 규칙 요약 |
| {{user}} 대응 | `p.user || "{{user}}"` 패턴 있음 | 유지 (정상) |

> 모드 트리거 문자열은 `docs/prompts/json/모드/` 로어북 원문 그대로 사용한다.
> worker 내 표기 ≡ 로어북 TRIGGER — 별도 변환/축약 없음.

### UI 버그 (SYNC 드리프트 포함)
| 위치 | `svg-tablet.js` (Worker) | `svgTemplates.js` (사이트) |
|---|---|---|
| roundRows (L272 / L824) | `${escapeXml(roundRows)}` ← 버그 | `${roundRows}` ← 정상 |
| mainLabel (L279 / L831) | escapeXml 감쌈 ← 버그 | raw ← 정상 |
| mainCells (L280 / L832) | 동일 | raw ← 정상 |
| careerLabel (L281 / L833) | 동일 | raw ← 정상 |
| careerCells (L282 / L834) | 동일 | raw ← 정상 |
| imageSection 내 charTags (L152/L704) | escapeXml 감쌈 ← 버그 | raw ← 정상 |
| imageSection 내 sceneBars (L153/L705) | 동일 | raw ← 정상 |
| escapeXml 함수 존재 | 있음 (L1) | **없음** ← 무방비 |

**Root cause**: Worker는 escapeXml을 과잉 적용, svgTemplates는 escapeXml 자체가 없음.
**해결**: Worker 기준으로 escape contract 통일 후 Mirror에 복사. svgTemplates에도 escapeXml 헬퍼 추가.

### 구조적 문제
- 모든 섹션이 하나의 `generateTablet()` 함수에 직렬 연결 → 높이 계산이 cascading
- 절대 Y값이 여러 레벨에 산재 (338/388/438, 524+i*38, modeStartY=700)
  → 섹션 함수 분리 시 **내부 상대좌표** 방식으로 전환해야 cascading 실제 해소
- 모드 아이콘에 유니코드 심볼(∂, ◐, ▷, ✿) 사용 → 폰트별 렌더링 불일치

---

## 1. 개편 섹션 구성

> 심사위원에게 전달하는 **안내 편지 + 브리핑 태블릿** 컨셉.
> 순서는 위에서 아래로 읽히는 자연스러운 정보 흐름.

### [A] HEADER — PPP 로고 + 시즌 정보
- 현재 유지. 삼각형 로고 + "PRODUCE 프라임 · 프라이오리티" + 시즌
- `date` 파라미터는 **기존 D-day 용도 유지** (하위 호환)
- "심사위원 위촉 서한" 문구는 date 슬롯이 아닌 **별도 고정 텍스트**로 추가

### [B] AUDITION BRIEFING — 오디션 기본 정보
- 부문/참가자/라운드/기간 그리드 유지
- **추가**: 분야 줄에 "아이돌 · 가수 · 댄서 · 싱어송라이터 · 멀티" 반영

### [C] JUDGE PANEL — 심사위원 정보 (확장)
- 현재: 이름 + 소속 + 역할만 표시
- **확장**: 진시혁/에리카에 대한 1줄 프로필 추가
  - 진시혁: "APEX Entertainment 수석 프로듀서 · 업계 1위 기획사의 A&R 총괄"
  - 에리카: "Blue Moon Entertainment 프로듀서 · 히트 프로듀싱 전문"
  - {{user}}: 소속사 + "YOU" 뱃지 유지
- **간략 설명 1줄**: "심사위원 상호 간 평가 방식, 합의 구조는 라운드별 상이"
- **파라미터 정리**: `judge1role`, `judge2role`은 worker 내부에는 존재하지만 svgTemplates params와 lorebook에 미노출 상태.
  → 프로필 1줄을 **고정 문구로 흡수**, role 파라미터는 worker default로만 유지 (공개 불필요)
  → svgTemplates params에 추가하지 않음 — 사이트 표와 lorebook이 간결해짐

### [D] ROUND STRUCTURE — 라운드 구조 (개선)
- 현재 4라운드 기본 정보 유지
- **데이터 구조 확장**: `{ tag, name, desc }` → `{ tag, name, desc, subdesc }`
  ```javascript
  const rounds = [
    { tag: "1R", name: "등급 평가", desc: "개인 무대 → 등급 배정", subdesc: "탈락 없음" },
    { tag: "2R", name: "프로듀서 픽", desc: "지명 → 대결 → 탈락 2인", subdesc: "" },
    { tag: "3R", name: "팀 대항전", desc: "팀 매치 → 패자부활 → 3인 생존", subdesc: "~ 합숙 1개월 후" },
    { tag: "4R", name: "최종 선택", desc: "참가자가 프로듀서를 선택", subdesc: "역전 구조" },
  ];
  ```
- 렌더링: subdesc가 있으면 desc 아래에 작은 폰트로 추가 표시

### [E] VENUE MAP — 오디션장 약도 (신규)
- **하입 로드 PRISM Studio 미니맵**
  - SVG 내 간략한 도시 단면도 (5구역 전체):
    더 코어(중심) → 미들 링 → **하입 로드(★ 현재 위치)** → 테라스 → 산업단지
  - PRISM Studio 건물 아이콘 + 주소 텍스트
  - 주소: "하입 로드 7번길, 프라임시티" (가상 주소)
- **디자인**: 수평 바 형태의 동심원 단면도. 각 구역을 색상으로 구분.
  - 더 코어: gold (#c9a84c)
  - 미들 링: blue (#7ba0d4)
  - 하입 로드: accent (#e8e8e8, ★ 강조)
  - 테라스: muted (#888)
  - 산업단지: dim (#555)
- 구현: 순수 SVG rect + text로 미니맵 (외부 이미지 없음)
- **라벨 전략**: 420px 폭 제약 → 바 내부에는 **축약 라벨** (코어 / 미들 / 하입 / 테라스 / 산업), 바 하단에 legend 1줄: "★ = PRISM Studio (하입 로드 7번길)"

### [F] MODE COMMANDS — 모드 안내 (전면 개편)
- **3단 구조**:
  1. **MAIN STORY** (자동 진행): 오디션(🎤), 프리플레이(🌆), 프로듀서(🎬)
  2. **CAREER MODES** (!명령어 전환): 매니저(📋), 연습생(✿), 작곡가(∂), 배우(▷), 인플루언서(◐)
  3. **UTILITY MODES** (!명령어 전환): 선택지(📋✦), 디테일(🔍), 스킵(⏩), 비하인드(🕶️), 소꿉친구(💫)

- **아이콘**: 로어북 `maintain` 필드 및 TRIGGER와의 일관성을 위해 **원래 아이콘 유지**
  - 연습생(✿), 작곡가(∂), 배우(▷), 인플루언서(◐) — 로어북과 동일
  - `font-family`는 **아이콘 `<text>` 노드에만** emoji fallback 적용: `"Segoe UI Emoji", "Apple Color Emoji", sans-serif`
  - 이름/설명/trigger 텍스트는 기존 `sans-serif` 유지 — 한글 렌더링 보호
  - ∂, ◐은 유니코드 심볼이므로 렌더링 불안정 가능 → **배포 후 실물 확인 필수**

- **카드 레이아웃**:
  - MAIN/CAREER: 2열 카드 (현행 colW=155px 유지)
  - UTILITY: trigger 문자열이 길고 📋✦ 같은 2글자 아이콘 있음 → **카드 높이를 46→52px로 확장**, trigger 표기 위치를 우상단에서 이름 옆 인라인으로 변경
- **각 모드 표시 정보**: 아이콘 | 이름 | !트리거 | 1줄 설명
- **유지제 안내 소문구**: "모드 활성화 시 상태창 🔧란에 해당 이모지가 유지됩니다"

### [G] NSFW ASSET TOGGLE — 성인 에셋 전환 안내 (신규)
- **간략 1블록**:
  - "친밀 장면 진입 시 상태창에 🔞가 추가됩니다"
  - "일상 복귀 시 자동 해제"
  - 이미지 DB 전환: 감정(1-8) / 일상(10-18) ↔ NSFW 비삽입(20-42) + 삽입(50-67) + 착의(70-86)
- **디자인**: warning-style 박스 (현재 하단 경고와 유사한 스타일, 색상만 분홍 계열)
- 수치 분류는 [H] 섹션의 scene bar 분류 체계와 일치시킨다
- **착의(70-86) 분류 해석**: 운영상 Clothed NSFW로 adult asset bank에 포함되나, 사용자 안내 및 scene bar에서는 직관성을 위해 별도 버킷으로 분리 표기한다. [G]와 [H] 양쪽에서 동일 해석 적용.

### [H] IMAGE OUTPUT — 이미지 출력 규칙 (간소화)
- 현재: 캐릭터 코드 전체 + Scene 카테고리 바
- **간소화**:
  - CDN 경로 형식 1줄: `img.bluehair.blue/ent/{CODE}/{NUM}.webp`
  - **코드표 압축 방식**: 소속 라벨 1줄 + 코드만 1줄 (이름 생략)
    ```
    APEX: SY NHR JSH  |  BLUE MOON: ERK LSH  |  PRISM: HSR  |  ROUTE 0: KHR
    CONTESTANTS: JGR MIL ELA MMR HSE NIA RAY LPS
    ```
  - Scene 바 유지 (시각적으로 유용): 감정 1-8 / 일상 10-18 / NSFW 20-67 / 착의 70-86
  - "15명 × 74 = 1,110장" (현행 유지, 실제 DB 기준 74개 정확)

### [I] SITE LINK — 챗봇 소개 사이트 리다이렉트 (신규)
- **위치**: 하단 경고 박스 위
- **디자인**: 버튼형 배너
  - 텍스트: "Prime City 소개 사이트"
  - URL: `https://intro.bluehair.blue` (프로토콜 포함, 복사 실수 방지)
  - 시각: 골드 아웃라인 둥근 사각형 + 외부 링크 아이콘(→)
  - **에덴챗은 `![](url)` → `<img>`로 렌더링** → SVG 내 `<a>` 클릭 불가
  - 따라서 **URL 텍스트만 표시** (유저가 복사 가능하도록 눈에 잘 띄게 배치)
  - 1줄에 수용 가능한 길이 (contentW=320px 내에서 font-size 10으로 충분)

### [J] FOOTER — 경고 + 저작권
- 현재 유지: "본 문서는 심사위원 전용 브리핑입니다" + 저작권
- **위치**: 항상 최하단

---

## 2. UI 버그 수정

### Phase 0 선행: Diff Audit
**worker ↔ svgTemplates 양쪽 `generateTablet()` diff를 먼저 수행**하여 드리프트 전체 목록을 확보한다.
현재 파악된 차이:
1. escape 정책 차이 (worker: escapeXml 과잉, svgTemplates: escapeXml 부재)
2. params 표 불일치 (worker: judge1role/judge2role 존재, svgTemplates params: 미포함)
3. 기타 미파악 drift 가능

### escapeXml contract 통일

**Worker 수정** (과잉 → 정상):
- `roundRows`, `mainLabel`, `mainCells`, `careerLabel`, `careerCells` → `${변수}` (raw)
- `imageSection` 내부 `charTags`, `sceneBars` → `${변수}` (raw)

**svgTemplates 보강** (무방비 → 방어):
- `escapeXml()` 헬퍼 함수 추가 (worker와 동일)
- 리프 텍스트(user, agency 등 URL 파라미터 값)에 escapeXml 적용

**양쪽 파일 상단에 contract 주석 명시**:
```javascript
// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
```

### 레이아웃 리팩터링
- **섹션 함수 분리 + 내부 상대좌표**:
  ```javascript
  function renderSection(startY) {
    // 섹션 내부는 0 기준 상대좌표로 계산
    // SVG <g transform="translate(0, ${startY})"> 로 배치
    const height = ...; // 섹션 내부에서 계산
    return { svg, height };
  }

  let curY = 200;
  const briefing = renderBriefing(curY);
  curY += briefing.height + 20; // 20 = 섹션 간격
  const judges = renderJudges(curY);
  curY += judges.height + 20;
  // ...
  ```
- 각 섹션 함수는 `{ svg: string, height: number }` 반환
- 절대 Y값 하드코딩 (338, 388, 438, 524, 700 등) 완전 제거

---

## 3. {{user}} 변수 + URL 파라미터

### 파라미터 정의 (worker 내부)
| 파라미터 | 기본값 | 설명 | 공개 여부 |
|---|---|---|---|
| `user` | `{{user}}` | 유저 이름 | 공개 (params + lorebook) |
| `agency` | `PRISM Studio` | 유저 소속사 | 공개 |
| `season` | `Season 1` | 오디션 시즌 | 공개 |
| `division` | `스테이지` | 부문 | 공개 |
| `date` | (빈 문자열) | D-day | 공개 |
| `judge1` | `진시혁` | 심사위원1 | 공개 |
| `judge1agency` | `APEX Entertainment` | 심사위원1 소속 | 공개 |
| `judge1role` | `수석 프로듀서` | 심사위원1 역할 | **비공개** (worker default로만 사용) |
| `judge2` | `에리카` | 심사위원2 | 공개 |
| `judge2agency` | `Blue Moon Entertainment` | 심사위원2 소속 | 공개 |
| `judge2role` | `프로듀서` | 심사위원2 역할 | **비공개** |

> "공개" = svgTemplates params 배열 + lorebook prompt에 표시
> "비공개" = worker 코드에만 존재, 사이트/lorebook에서 비노출 (현행 유지)

### URL 예시 (에덴챗 마크다운)
```
![](https://tablet.bluehair.blue/ent/?user={{user}}&agency=PRISM%20Studio&date=D-7)
```

- 기존 파라미터 셋 유지 (호환성)
- 추가 파라미터 불필요 — 신규 섹션은 모두 정적 콘텐츠

---

## 4. 구현 순서

### Phase 0: Diff Audit + Contract 확립
- [ ] `workers/svg-tablet.js` ↔ `src/data/svgTemplates.js` generateTablet() diff audit
- [ ] 드리프트 목록 확보 + escape contract 주석 확정
- [ ] tablet.bluehair.blue 현재 렌더링 상태 브라우저 확인 (escapeXml 버그 실제 영향 범위 파악)

### Phase 1: 버그 수정 + 구조 리팩터링
- [ ] Worker: escapeXml 이중 적용 7곳 수정 (마크업 변수 → raw)
- [ ] svgTemplates: escapeXml 헬퍼 추가 + 리프 텍스트에 적용
- [ ] 양쪽 파일 상단에 escape contract 주석 추가
- [ ] 섹션별 함수 분리 (내부 상대좌표 + `{ svg, height }` 반환 패턴)
- [ ] 레이아웃 상수 정리, 절대 Y값 하드코딩 제거

### Phase 2: 기존 섹션 개선
- [ ] [A] HEADER: "심사위원 위촉 서한" 고정 문구 추가 (date 파라미터는 유지)
- [ ] [B] AUDITION BRIEFING 분야 줄 업데이트
- [ ] [C] JUDGE PANEL 1줄 프로필 추가 (role 파라미터 비공개 유지)
- [ ] [D] ROUND STRUCTURE: rounds 데이터 구조에 subdesc 추가 + 렌더링 확장
- [ ] [F] MODE COMMANDS 전면 개편 (13개 모드, 3단 구조, 아이콘 원본 유지, utility 카드 확장)

### Phase 3: 신규 섹션 추가
- [ ] [E] VENUE MAP 하입 로드 미니맵 (5구역, 축약 라벨 + legend)
- [ ] [G] NSFW ASSET TOGGLE 안내 (분류 체계 scene bar와 일치)
- [ ] [I] SITE LINK 배너 (`https://intro.bluehair.blue` 전체 URL 텍스트)

### Phase 4: 동기화 + 마무리
- [ ] [H] IMAGE OUTPUT 간소화 (코드만 표시, 이름 생략) + 수치 검증
- [ ] 전체 높이 계산 검증
- [ ] **Worker → svgTemplates Mirror 동기화** (generate 함수 전체 복사)
- [ ] **svgTemplates Metadata 갱신** (desc, params 배열, promptExample)
- [ ] `docs/prompts/json/SVG_태블릿_EN.json` 로어북 업데이트
- [ ] `workers/research_sub.md` tablet 설명 갱신 (capability summary 변경)
- [ ] `workers/deploy/deploy.sh`: svg-tablet 항목 + route 안내문 추가
- [ ] wrangler deploy (임시 wrangler.toml 방식, **Git Bash CLI 기준** — VS Code 기본 PowerShell과 혼동 주의)
  ```bash
  cd workers
  cat > wrangler.toml << 'EOF'
  name = "svg-tablet"
  main = "svg-tablet.js"
  compatibility_date = "2024-01-01"
  EOF
  npx wrangler deploy --config wrangler.toml
  rm wrangler.toml
  ```
- [ ] 배포 후 ∂, ◐ 등 유니코드 심볼 렌더링 실물 확인
- [ ] `src/pages/SvgIntro.jsx` maxHeight:260 카드 프리뷰 → 태블릿 첫 화면 표시 확인 (blocker 아님, 참고)

---

## 5. 배포 체크리스트

- [ ] 로컬 SVG 렌더링 확인 (브라우저에서 직접 열기)
- [ ] `npx wrangler deploy` 성공 (임시 wrangler.toml 방식, 루트 wrangler.jsonc는 Pages 설정이므로 사용 금지)
- [ ] `tablet.bluehair.blue/ent/?user=테스트` 접속 확인
- [ ] `src/data/svgTemplates.js`의 tablet 항목: generate 함수 + params + desc + promptExample 동기화 완료
- [ ] `SVG_태블릿_EN.json` 로어북 프롬프트 텍스트 동기화
- [ ] `workers/deploy/deploy.sh`에 svg-tablet 항목 + route 안내문 존재 확인
- [ ] `workers/research_sub.md` tablet 섹션 갱신 확인

---

## 6. 예상 총 높이

| 섹션 | 예상 높이 (px) |
|---|---|
| [A] Header | ~160 |
| [B] Briefing | ~100 |
| [C] Judges | ~180 |
| [D] Rounds | ~190 |
| [E] Venue Map | ~120 |
| [F] Modes | ~370 |
| [G] NSFW Toggle | ~60 |
| [H] Image Output | ~200 |
| [I] Site Link | ~50 |
| [J] Footer | ~70 |
| **합계** | **~1,500** |

현재: ~1,100px → 개편 후: ~1,500px (약 36% 증가)

> **참고**: SvgIntro.jsx 카드 프리뷰는 `maxHeight: 260`으로 잘림. Modal 전체보기는 정상. 갤러리 카드에서는 Header만 보이게 되나, 이는 tablet 특성상 자연스러움 (다른 긴 SVG도 동일).

---

## 7. 트레이드오프

| 선택지 | 장점 | 단점 | 결정 |
|---|---|---|---|
| 모드를 전부 표시 vs 주요 모드만 | 완전한 안내 | SVG가 길어짐 | **전부 표시** — 첫 브리핑이므로 |
| 미니맵 SVG vs 텍스트만 | 몰입감 | 구현 복잡도 | **SVG 미니맵** — 축약 라벨 + legend로 420px 내 수용 |
| `<a>` 링크 vs 텍스트 URL | 클릭 가능 | `<img>` 렌더링 시 인터랙션 무시됨 | **텍스트 URL만** — `<img>` 삽입 시 `<a>` 작동 불가 |
| 이미지 코드 전체 표시 vs 간략화 | 참조 편의 | 공간 | **간략화** — 코드만 1줄, 이름 생략, 바 차트 유지 |
| judge role 파라미터 공개 vs 비공개 | 유연성 | sync 범위 증가 | **비공개** — 고정 프로필에 흡수, metadata 간결화 |
| 섹션 함수 내부 좌표 방식 | cascading 해소 | 구현 복잡도 | **상대좌표 + g transform** — 유지보수 이점이 큼 |

---

## 8. 최종 수정 (v2)

> Phase 0-4 완료 후 실물 검토에서 발견된 10개 이슈.

### [1] 상단 status bar ↔ 코너 브라켓 겹침
- **원인**: status bar가 y=20에서 시작, 코너 브라켓도 M30,30. 높이가 겹침
- **수정**: status bar를 y=34로 내리고 텍스트를 y=50으로. 또는 코너 브라켓을 y=20으로 올려서 status bar 위에 배치
- **채택**: status bar y 시작을 34로 내림. 코너 브라켓은 현행 유지 (프레임 장식이므로 콘텐츠 위에 겹쳐도 OK)

### [2] 프로그램명 영문화
- **현재**: `프라임 · 프라이오리티` (한글)
- **수정**: `PRIME PRIORITY` (영문, 프로그램 공식 영문명)
- 위 `P R O D U C E` 라인은 유지

### [3] 시즌 표시 제거
- **현재**: `${season.toUpperCase()}` → "SEASON 1"
- **수정**: 해당 `<text>` 라인 삭제. season 파라미터는 코드에 남겨두되 렌더링하지 않음
- 이에 따라 아래 요소들의 Y 좌표 10px 상향

### [4] 위촉 서한 문구 수정
- **현재**: `심사위원 위촉 서한`
- **수정**: `본선 심사위원 위촉 서한`

### [5] 위촉 서한 ↔ AUDITION BRIEFING 간격 + "참가자" 텍스트
- **원인**: header height=170, briefing startY=180. divider y=185 → briefing header y=195. 간격 ~10px로 너무 좁음
- **수정**: header height를 180으로 키우고, divider 후 briefing 시작 전에 SEC_GAP(20px)이 충분히 들어가도록 조정
- "참가자" → "본선 진출자"

### [6] JUDGE PANEL 우측 원형 아이콘 프레임 침범
- **원인**: `<rect x="${R - 6}" y="${y+12}" width="8"...>` → R=370이므로 x=364, 끝=372. 프레임 inner edge=392이므로 이론상 OK. 실제로는 카드 width=contentW(320)이고 카드 x=L(50)이므로 카드 끝=370. 원형이 370-6=364에서 시작, 364+8=372로 카드 바깥으로 2px 삐져나옴
- **수정**: `R - 14` 로 변경 (카드 내부에 완전 수용: x=356, 끝=364 < 370)

### [7] ROUND STRUCTURE subdesc 정렬 + 폰트
- **현재**: `text-anchor="end"` at `x="${R}"`, font-size 7.5. R=370인데 desc 텍스트와 겹칠 수 있고 폰트가 너무 작음
- **수정**: 
  - subdesc를 desc 아래 별도 줄로 이동 (현재 y+10 → y+34 정도)
  - font-size 8.5로 키움
  - x를 `${L + 42}`로 맞춰 desc와 좌정렬 통일
  - rowH를 42→48로 확장하여 3줄 수용

### [8] VENUE → "오시는 길" + 오디션 장소 수정
- **현재**: sectionHeader "VENUE", ★=하입 로드 PRISM Studio
- **수정**: 
  - sectionHeader → "오시는 길"
  - ★ 강조를 "코어"(더 코어)로 이동 — 오디션은 더 코어 프라임 돔에서 진행
  - legend: "★ 프라임 돔 — 더 코어 중앙, 프라임시티"
- **연쇄 확인**: 로어북에 오디션 장소가 잘못 기술되어 있는지 grep 필요

### [9] 소꿉친구 모드 설명 수정
- **현재**: `desc: "장그루 배경 서사"`
- **수정**: `desc: "장그루는 이제 당신의 소꿉친구입니다."`
- 적용 위치: svg-tablet.js + svgTemplates.js 양쪽

### [10] IMAGE OUTPUT SYSTEM 글자 겹침 + 전체 폰트 사이즈
- **현재**: CDN 경로 라인, 소속사 코드표, Scene Bar 라벨이 서로 겹침. 전체적으로 font-size 7~8.5로 너무 작음
- **수정**:
  - CDN 경로 라인: `{CODE}/{NUM}` 부분을 별도 줄로 분리 (현재 같은 Y에 4개 텍스트가 수평 나열 → 겹침)
  - 소속사 코드표: label과 codes 사이 간격 확보 (label x=L, codes x=L+90으로 확장)
  - 줄 간격 14→18px로 확장
  - Scene Bar: 라벨 font-size 7→9, 바 height 18→22로 확장
  - **전체 폰트 사이즈 기준 상향**: 
    - 현재 7~8.5 → 최소 9 기준
    - sectionHeader label: 9→10
    - 일반 텍스트: 8.5→10
    - 서브 텍스트: 7.5→9
    - monospace 코드: 8.5→9.5
  - charLines 간격: cy+=14 → cy+=18

### [11] 소개 사이트 → 별도 이미지 + 하이퍼링크
- **현재**: SVG 내 텍스트로 URL 표시 (클릭 불가)
- **수정**: renderSiteLink 섹션을 제거하고, 로어북/프롬프트 프리픽스에 별도 이미지 출력 지시를 추가
  - `<a href="https://intro.bluehair.blue"><img src="..."></a>` 형태로 에덴챗 마크다운에서 HTML 렌더링
  - SVG에서는 해당 섹션 삭제 (SVG 내 `<a>` 태그는 `<img>` 삽입 시 작동 불가이므로)
  - 대안: SVG는 그대로 두되, 사이트 소개는 별도 마크다운 이미지로 출력하도록 오프닝 로어북에 지시 추가

### 구현 순서
- [ ] [1] status bar Y 조정
- [ ] [2] 프로그램명 영문화
- [ ] [3] 시즌 표시 제거 + Y 좌표 보정
- [ ] [4] "본선 심사위원 위촉 서한"
- [ ] [5] header-briefing 간격 + "본선 진출자"
- [ ] [6] judge 원형 아이콘 R-14
- [ ] [7] subdesc 별도 줄 + 폰트 확대 + rowH 48
- [ ] [8] "오시는 길" + 더 코어 강조 + legend 수정
- [ ] [9] 소꿉친구 desc 수정
- [ ] [10] IMAGE OUTPUT 글자 겹침 해소 + 전체 폰트 사이즈 상향
- [ ] [11] site link 섹션 처리 (SVG에서 제거 or 유지 결정 후)
- [ ] svgTemplates.js Mirror 동기화
- [ ] 로어북 연쇄 확인 (오디션 장소 오류)
- [ ] 빌드 검증 + wrangler deploy
