# Domain 02 — Frontend UX Funnel

> 메인 페이지부터 챗봇 시작까지의 사용자 퍼널 감사.

## 범위

- `src/pages/` (17개 페이지)
- `src/components/` (캐러셀, 히어로슬라이더, 게임모드 등)
- CharDetail 시네마틱 인트로 시스템

## 퍼널 단계

```
[1] 랜딩 (HeroSlider)
[2] 캐릭터 탐색 (CharCarousel)
[3] 캐릭터 상세 (CharDetail / CinematicCharDetail)
[4] 챗봇 유입 CTA
[5] 에덴챗 시작
```

## 감사 포인트

### 이탈 지점
- 각 단계에서 사용자가 이탈할 수 있는 UX 문제
- CTA 버튼 가시성·클릭 유도력

### 모바일 UX
- `useIsMobile(768)` 분기 처리 누락 컴포넌트
- 터치 인터랙션 (캐러셀 스와이프, 지도 탭)

### 성능
- 이미지 지연 로딩 미적용 구간
- 불필요한 리렌더링

## 발견 이슈

_감사 후 채워진다_

## 권고사항

_감사 후 채워진다_
