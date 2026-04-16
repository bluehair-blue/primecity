# SVG Worker — 일정표 (Schedule Board) 기획

> **목적**: 모든 모드에서 범용으로 사용하는 아티스트/유저 일정표 SVG
> **워커명**: `svg-schedule` (schedule.bluehair.blue)
> **파일**: `workers/svg-schedule.js`
> **이미지 포함**: 없음 (텍스트 전용) → base64 인라인 파이프라인 불필요

---

## 디자인 컨셉

**태블릿 스타일** — svg-tablet.js의 톤앤매너를 계승:

- 다크 배경 (`#0e0e1a` → `#1a1a2e` 그라데이션)
- Gold accent (`#c9a84c`) — 섹션 헤더, 강조, 액센트 바
- 좌측 accent bar + 영문 섹션 라벨 (`sectionHeader` 패턴)
- 코너 브라켓 장식 (tablet 동일)
- 스캔라인 애니메이션 (tablet 동일)
- `escapeXml()` 전 파라미터 처리

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ ▎ SCHEDULE BOARD                         │  ← 헤더 (타이틀 + 날짜)
│   {artist} — {date}                      │
│   Manager: {user}                        │
├─────────────────────────────────────────┤
│ ▎ TODAY                                  │  ← 오늘 일정 섹션
│  ┌ 09:00 ── 음악방송 리허설 ───── KBS ┐  │
│  │ 12:00 ── 점심 + 이동 ─────────── - │  │
│  │ 14:00 ── 화보 촬영 ──── W Magazine │  │
│  │ 18:00 ── 보컬 레슨 ────── Studio A │  │
│  └ 21:00 ── 자유시간 ───────────── - ┘  │
├─────────────────────────────────────────┤
│ ▎ UPCOMING                               │  ← 향후 일정 (선택)
│   +1d  팬사인회 (강남)                    │
│   +2d  앨범 녹음                          │
│   +3d  예능 촬영 (런닝맨)                 │
├─────────────────────────────────────────┤
│ ▎ STATUS                                 │  ← 상태 요약
│   컨디션: ■■■■□   평판: ★72              │
│   특이사항: 내일 팬사인회 준비 필요        │
├─────────────────────────────────────────┤
│ ⚠ PRIME CITY ENTERTAINMENT              │  ← 푸터
│ 일정은 상황에 따라 변동될 수 있습니다      │
└─────────────────────────────────────────┘
```

**겹침 방지 원칙**: 각 섹션은 `renderXxx(startY)` → `{ svg, height }` 패턴으로 높이를 반환하고, assembly에서 `curY += height + SEC_GAP` 으로 순차 배치. 섹션 헤더(sectionHeader)와 divider는 고정 간격(SEC_GAP=24) 안에서 배치되어 텍스트와 겹치지 않도록 한다. tablet.js의 검증된 패턴을 그대로 사용.

---

## URL 파라미터 설계

### 필수 파라미터

| 파라미터 | 설명 | 기본값 | 예시 |
| --- | --- | --- | --- |
| `user` | 유저명 | `{{user}}` | `김프로` |
| `artist` | 아티스트명 | `서윤` | `강하람` |
| `date` | 오늘 날짜 | `2026.04.14` | `2026.04.14 (월)` |

### 오늘 일정 (`s1`~`s8` — 최대 8개 슬롯)

각 슬롯: `s{N}` = 시간, `s{N}name` = 일정명, `s{N}loc` = 장소, `s{N}type` = 유형

| 파라미터 | 설명 | 예시 |
| --- | --- | --- |
| `s1` | 시간 | `09:00` |
| `s1name` | 일정명 | `음악방송 리허설` |
| `s1loc` | 장소 (선택) | `KBS` |
| `s1type` | 유형 (선택) | `broadcast` |
| `s2` ~ `s8` | 동일 패턴 | ... |

**유형별 색상 코딩:**

| type | 색상 | 의미 |
| --- | --- | --- |
| `broadcast` | `#d46b8a` (pink) | 방송 (음방/예능/라디오) |
| `photo` | `#b07ad4` (purple) | 촬영 (화보/MV/광고) |
| `practice` | `#6db87a` (green) | 연습/레슨 |
| `event` | `#c9a84c` (gold) | 이벤트 (팬미팅/시상식) |
| `meeting` | `#7ba0d4` (blue) | 미팅/인터뷰 |
| `rest` | `#555` (gray) | 휴식/자유시간/이동 |
| (기본) | `#888` | 미지정 |

### 향후 일정 (`u1`~`u3` — 최대 3개)

| 파라미터 | 설명 | 예시 |
| --- | --- | --- |
| `u1` | 일정명 | `팬사인회` |
| `u1day` | 날짜 표시 | `+1d` 또는 `4/15` |
| `u1loc` | 장소 (선택) | `강남` |

### 상태 (선택)

| 파라미터 | 설명 | 예시 |
| --- | --- | --- |
| `condition` | 컨디션 (1~5) | `4` |
| `reputation` | 평판 (0~100) | `72` |
| `note` | 특이사항 | `내일 팬사인회 준비 필요` |

---

## 디자인 상세

### 레이아웃 상수 (tablet 계승)

```js
const W = 420;
const L = 50;        // left margin
const R = 370;       // right guide
const contentW = 320; // R - L
const SEC_GAP = 24;
```

### 일정 행 디자인

```
┌─ type color bar (3px wide, 행 높이)
│  09:00    음악방송 리허설              KBS
│  ← time  ← name                       ← loc
└─ divider line (stroke #222)
```

- 좌측 3px 세로 색상 바 (type별)
- 시간: `fill="#888"` monospace 10pt
- 일정명: `fill="#e8e8e8"` sans-serif 11pt bold
- 장소: `fill="#666"` sans-serif 9pt, 우측 정렬

### 컨디션 바

```
■■■■□ → 5칸 중 4칸 채워짐
채워진 칸: #c9a84c (gold)
빈 칸: #2a2a3a (dark)
```

### 애니메이션

- 태블릿 스캔라인 (tablet 동일)
- 헤더 골드 펄스 (opacity 0.6→1→0.6, 3s)
- 일정 행 순차 fade-in (0.3s 간격)

---

## 로어북 JSON 설계

### 파일: `docs/prompts/json/모드/일정표SVG_EN.json`

이 로어북은 **모든 모드에서 AI가 일정표를 출력할 때 참조하는 범용 규칙**입니다. 모드별 키워드/이모지를 직접 노출하지 않고, {{user}}의 역할 맥락으로 지침을 제공합니다.

```json
{
  "id": 0,
  "role": "Schedule SVG output rules — universal across all modes",
  "when": "새로운 날이 시작되거나, 유저가 일정/스케줄을 확인 또는 요청할 때. 모드 무관.",
  "format": "![](https://schedule.bluehair.blue/ent/?user={유저명}&artist={아티스트}&date={날짜}&s1={시간}&s1name={일정명}&s1loc={장소}&s1type={유형}&...)",
  "rules": [
    "일정 슬롯 s1~s8: 시간순 정렬, 최소 3개 이상 채울 것",
    "type 필수 지정: broadcast/photo/practice/event/meeting/rest",
    "유저명은 반드시 {{user}}로 전달 (플랫폼이 치환)",
    "아티스트명은 현재 맥락의 캐릭터 본명",
    "condition/reputation은 현재 상태창 수치와 일치시킬 것",
    "note는 다음 턴에 영향을 줄 수 있는 정보를 간결하게",
    "향후 일정 u1~u3은 스토리 맥락에서 예고된 이벤트만"
  ],
  "context_guide": {
    "{{user}}가 아티스트의 매니저일 때": "AM 스케줄 확인 턴에 자동 출력. 스케줄 관리→실행→조정 루프의 기점. condition/reputation 필수.",
    "{{user}}가 오디션 심사위원일 때": "라운드 전 준비 일정 표시. 리허설·평가·대기 중심. note에 라운드 진행도 기재.",
    "{{user}}가 자유롭게 도시를 탐색 중일 때": "유저가 하루 계획을 물을 때 출력. 자유도 높은 일정 구성. 일상+탐색 위주.",
    "{{user}}가 프로듀서로 아이돌을 육성 중일 때": "연습·녹음·이미지메이킹 스케줄. condition 중요.",
    "{{user}}가 연습생일 때": "훈련 스케줄 중심. practice 타입 비중 높게.",
    "{{user}}가 작곡가일 때": "작곡·녹음·미팅 중심. meeting/practice 위주.",
    "{{user}}가 배우일 때": "촬영 스케줄 중심. photo 타입 + 대본리딩(practice).",
    "{{user}}가 인플루언서일 때": "콘텐츠 촬영·브랜드딜 미팅·라이브 방송 중심."
  },
  "url_encoding": "공백→%20, 콤마→%2C, 괄호→%28%29, <> 사용 금지, 한국어 그대로 가능",
  "example": "![](https://schedule.bluehair.blue/ent/?user={{user}}&artist=강하람&date=2026.04.14%20(월)&s1=09:00&s1name=음악방송%20리허설&s1loc=KBS&s1type=broadcast&s2=12:00&s2name=점심%20%2B%20이동&s2type=rest&s3=14:00&s3name=화보%20촬영&s3loc=W%20Magazine&s3type=photo&s4=18:00&s4name=보컬%20레슨&s4loc=Studio%20A&s4type=practice&s5=21:00&s5name=자유시간&s5type=rest&condition=4&reputation=72&note=내일%20팬사인회%20준비%20필요&u1=팬사인회&u1day=%2B1d&u1loc=강남&u2=앨범%20녹음&u2day=%2B2d&u3=예능%20촬영&u3day=%2B3d&u3loc=SBS)"
}
```

### 트리거

```
// --- TRIGGER ---
// 일정표, 일정, 스케줄, 스케쥴, 스캐줄, schedule, 오늘 일정, 내일 일정, 이번주, 금주, 주간 일정, 하루 일정, 하루 계획, 스케줄표, 스케쥴표, 일정 확인, 일정확인, 스케줄 확인, 스케쥴 확인
```

---

## 메인 프롬프트 상태창 연동 구상

현재 상태창 `확장 구역`(하단 `---` 이후)에 간결한 일정 요약을 삽입하는 방안:

```
```STATUS
🔧 (현재 모드)
📍 (현재 위치) | 🕐 (시간) | 📅 (날짜)
{{user}} | (소속/직책)
---
[캐릭터명]: ❤️n | (현재 위치, 상세 행동)
---
📅 다음: 14:00 화보 촬영 (W Magazine) → 18:00 보컬 레슨
```

- 확장 구역에 `📅 다음: {가장 가까운 미래 일정 1~2개}` 한 줄 추가
- SVG 일정표의 풀 버전과 중복되지 않게 "다음 예정만" 간결하게 표시
- 이 부분은 로어북의 `context_guide`에서 "condition/reputation 필수" 같은 지침과 함께 안내
- **구현 범위**: 이번 SVG 워커 완성 후 별도 태스크로 메인 프롬프트 수정 검토

---

## 구현 순서

1. `workers/svg-schedule.js` 작성 (tablet 골격 차용)
2. `src/data/svgTemplates.js`에 schedule 템플릿 등록
3. `workers/deploy/deploy.sh`에 `svg-schedule` 추가
4. `docs/prompts/json/모드/일정표SVG_EN.json` 로어북 작성
5. `npm run build` — 소개 사이트 빌드 검증
6. wrangler deploy + CF Dashboard 라우트 설정 (`schedule.bluehair.blue`)
7. 소개 사이트에서 SVG 프리뷰 정상 렌더링 확인
8. 에덴챗에서 실제 챗봇 테스트 (매니저모드 + 프리플레이 최소 2개 모드)
9. (후속) 메인 프롬프트 상태창 확장 구역에 간결한 일정 요약 삽입 검토

---

## svgTemplates.js 등록 형태

```js
{
  id: "schedule",
  name: "일정표",
  en: "Schedule Board",
  category: "유틸리티",
  animated: true,
  desc: "범용 아티스트 일정표. 모든 모드에서 사용 가능. 오늘 일정 + 향후 예정 + 상태 요약.",
  params: [
    { name: "user", desc: "유저명", example: "{{user}}" },
    { name: "artist", desc: "아티스트명", example: "강하람" },
    { name: "date", desc: "날짜", example: "2026.04.14 (월)" },
    { name: "s1~s8", desc: "일정 시간", example: "09:00" },
    { name: "s{N}name", desc: "일정명", example: "음악방송 리허설" },
    { name: "s{N}loc", desc: "장소", example: "KBS" },
    { name: "s{N}type", desc: "유형", example: "broadcast" },
    { name: "condition", desc: "컨디션 1~5", example: "4" },
    { name: "reputation", desc: "평판 0~100", example: "72" },
    { name: "note", desc: "특이사항", example: "내일 팬사인회 준비 필요" },
  ],
  ...
}
```

---

## 체크리스트

- [ ] `workers/svg-schedule.js` 작성
- [ ] `src/data/svgTemplates.js`에 schedule 등록
- [ ] `workers/deploy/deploy.sh`에 추가
- [ ] `docs/prompts/json/모드/일정표SVG_EN.json` 로어북 작성
- [ ] `npm run build` 소개 사이트 빌드 검증
- [ ] wrangler deploy + CF Dashboard 라우트 설정
- [ ] 소개 사이트 SVG 프리뷰 렌더링 확인
- [ ] 에덴챗 멀티모드 테스트 (매니저 + 프리플레이 최소)
- [ ] (후속) 메인 프롬프트 상태창 확장 구역 일정 요약 삽입
