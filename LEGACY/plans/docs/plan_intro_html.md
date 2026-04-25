# 에덴챗 소개 HTML 개편 계획

> **대상**: `docs/프라임시티 소개페이지.txt` (에덴챗 플랫폼 작품 소개란에 들어가는 HTML)
> **현 상태**: 333줄 HTML+CSS. 기본 구조는 잘 잡혀 있으나 정보가 구버전이고 이미지 누락 다수.
> **목표**: 직관적 UX + 최신 정보 반영 + 사이트 톤앤매너 일치 + 이미지 정상 표시

---

## 0. 현재 문제점 분석

### 정보 누락/오류
| 항목 | 현재 | 정확한 값 |
|---|---|---|
| 프로그램명 | "Produce · Prism · Priority" | "Produce · Prime · Priority" (**Prism→Prime**) |
| 이미지 시스템 | 15명 × 74장 = 1,110장 | 15명 × 96장면 + 부속 = **103/char, 1,545장** |
| 이미지 DB 범위 | 감정 1-8, 일상 10-18, NSFW 20-67, 착의 70-86 | 감정 1-9, 일상 10-19, NSFW 20-69+87-92, 착의 70-86, 무대 93-96 |
| 유틸리티 모드 | 없음 | !선택지, !디테일, !스킵, !비하인드, !소꿉친구 5개 추가 필요 |
| 산업단지 구역 | 없음 | 5번째 구역 추가 필요 |
| 캐시 버스팅 | `?v=2` | `?v=3` (ASSET_VERSION=3) |
| 오디션 장소 | 명시 안 됨 | 더 코어 프라임 돔 |

### 이미지 문제
| 캐릭터 | 썸네일 | 프로필 | 문제 |
|---|---|---|---|
| SY, NHR, LSH, KHR | ✅ 이미지 | ✅ | 정상 (썸네일 URL 사용) |
| JSH | 한자 아이콘 "진" | ✅ | **썸네일 미사용** — 이미지로 교체 필요 |
| ERK | 한자 아이콘 "에" | ✅ | 동일 |
| HSR | 한자 아이콘 "한" | ✅ | 동일 |
| JGR~LPS (8명) | 한자 아이콘 | ✅ | 동일 — 모두 썸네일 이미지로 교체 |

> 15명 중 **11명이 텍스트 아이콘** (`<div class="ap">`)으로 표시. CDN에 `{CODE}/thumbnail.webp`가 존재하므로 모두 이미지로 교체 가능.

### UX 문제
1. **Image System 섹션이 캐릭터보다 위에 있음** — 유저가 캐릭터 소개 전에 기술 정보를 먼저 봄. 순서가 비직관적
2. **캐릭터 프로필이 details 접힘** — 모바일에서 일일이 탭해야 함. 주요 캐릭터(SY, NHR, JSH)는 기본 열림이 나을 수 있음
3. **Career Modes 섹션에 유틸리티 모드 누락** — !선택지, !디테일, !스킵, !비하인드, !소꿉친구
4. **CTA 영역이 약함** — "더 자세히" 버튼만 있고, 챗봇 직접 시작 버튼이 없음
5. **피드백 링크 클릭 시 confirm 팝업** — 불필요한 마찰

### 디자인 톤앤매너
- 현재: Gold & Azure 듀얼리즘 잘 적용, OKLCH 사용, 폰트 serif+sans-serif 조합
- **유지할 것**: 전체 색상 시스템, 애니메이션, 접힘 섹션 UX
- **개선할 것**: 폰트 사이즈 일부 작음 (9-10px), 모바일 가독성

---

## 1. 개편 섹션 구조 (재배치)

```
[1] System Bar (유지)
[2] Hero (프로그램명 수정 + CTA 강화)
[3] About (유지, 문구 약간 조정)
[4] Characters (썸네일 전체 이미지 교체, 소개 정보 업데이트)
[5] World Building (산업단지 추가)
[6] Game Modes (유틸리티 모드 추가)
[7] Image System (하단으로 이동, 수치 업데이트)
[8] CTA (챗봇 시작 버튼 추가, 사이트 링크)
[9] Footer
```

> 변경 핵심: Image System을 Characters/World/Modes 아래로 이동. 유저는 콘텐츠 먼저 보고, 기술 정보는 관심 있으면 펼침.

---

## 2. 수정 상세

### [2] Hero
- `Produce · Prism · Priority` → `Produce · Prime · Priority`
- 배경 이미지 `?v=2` → `?v=3`

### [4] Characters — 썸네일 이미지 교체
모든 캐릭터를 `<div class="ap">한</div>` → `<div class="ai">` (이미지)로 교체:
```html
<!-- 현재 (텍스트 아이콘) -->
<div class="ap" style="background:oklch(...);">진</div>

<!-- 수정 (이미지) -->
<div class="ai" style="background-image:url('https://img.bluehair.blue/ent/JSH/thumbnail.webp?v=10');border-color:oklch(...);"></div>
```

대상: JSH, ERK, HSR, JGR, MIL, ELA, MMR, HSE, NIA, RAY, LPS (11명)
이미 이미지인 캐릭터: SY, NHR, LSH, KHR (4명) — `?v=2` → `?v=3`만 변경

### [5] World Building — 산업단지 추가
```html
<div class="dst">
  <div class="da" style="...">I</div>
  <div>
    <div>외곽 · 생산기지</div>
    <div>산업단지 <span>Industrial</span></div>
    <div>도시 인프라의 뒷배경. 자동화 공장과 물류 시설.</div>
  </div>
</div>
```

### [6] Game Modes — 유틸리티 모드 추가
Career Modes 아래에:
```
Utility Modes · 유틸리티 모드
  !선택지 — 행동 분기 명시적 제시
  !디테일 — 감각 밀도 ×1.5
  !스킵 — 몽타주 시간 가속
  !비하인드 — 업계 이면 포커스
  !소꿉친구 — 장그루는 이제 당신의 소꿉친구입니다.
```

### [7] Image System — 수치 업데이트
```
15명 × 103장 = 총 1,545장
감정 1-9 · 9장
일상 10-19 · 10장
NSFW 20-69 · 50장
착의 70-86 · 17장
확장 87-92 · 6장
무대 93-96 · 4장
```

### [8] CTA — 강화
- "챗봇 시작" 버튼 추가 (에덴챗 작품 URL로 직접 링크)
- "더 자세히" → intro.bluehair.blue
- 피드백 링크 confirm 팝업 제거

### 전체 — 캐시 버스팅
모든 이미지 URL `?v=2` → `?v=3`

---

## 3. 수정 대상 파일

| 파일 | 변경 |
|---|---|
| `docs/프라임시티 소개페이지.txt` | 전면 수정 (주요 파일) |
| `src/utils/cdn.js` | ASSET_VERSION 확인 (현재 3이면 OK) |

---

## 4. 구현 순서

- [x] Hero: 프로그램명 수정 (Prism→Prime)
- [x] 전체: `?v=2` → `?v=3` 일괄 교체
- [x] Characters: 11명 썸네일 이미지 교체 (`.ap` 텍스트 아이콘 → `.ai` CDN 이미지)
- [x] World Building: 산업단지 추가 (5번째 구역, 아이콘 "I")
- [x] Game Modes: 유틸리티 모드 5개 추가 (!선택지/!디테일/!스킵/!비하인드/!소꿉친구)
- [x] Image System: 섹션 하단 이동 + 6카테고리 3열 그리드 + 캐릭터 코드란 + 갤러리 링크
- [x] CTA: 챗봇 시작 버튼 + bg11 배경이미지 + confirm 팝업 제거
- [x] 폰트 전체 +4px 리디자인
- [x] Stat bridge 2개 추가 (Characters↔World, Modes↔Image System 사이)
- [ ] 에덴챗 플랫폼에 HTML 업로드 (수동)
