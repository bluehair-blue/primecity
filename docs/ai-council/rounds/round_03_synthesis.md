# Round 1~3 — Synthesis

> Round 1·2 결과를 종합하여 합의된 이슈 목록을 확정하는 단계.

## 종합 일시

- 날짜: 2026-04-25

## 합의된 이슈 (양쪽 동의)

| 이슈 ID | 도메인 | 등급 | 제목 |
|---------|--------|------|------|
| PC-A-003 / PC-C-004 | Frontend | P0 (Critical) | CEO 모드 카드 `detailPath: null` 데드링크 (Moderator 확인: 이미 출시된 모드이므로 `ModeCeo.jsx` 라우트 신설 즉시 적용) |
| PC-C-005 | Docs | P1 (High) | 핵심 문서(AGENTS.md 등)와 실제 코드 간 수치/상태 불일치 (Moderator 확인: `AGENTS.md`를 표지판 삼아 Round 4에서 일괄 갱신) |

## 단독 이슈 (한쪽만 발견, 채택)

| 이슈 ID | 발견자 | 도메인 | 등급 | 제목 | 채택 근거 |
|---------|--------|--------|------|------|----------|
| PC-A-001 | Agent A | UX Funnel | P1 (High) | Hero CTA 외 챗봇 진입 동선(URL) 부재 | Moderator 지침: 최상단 Nav에 외부 링크 리다이렉트 최우선 추가 |
| PC-A-002 | Agent A | Branding | P1 (High) | 이미지 카탈로그 수치 비일관성 (102/75/29/2000+) | 사용자 혼동 방지를 위해 UI 상의 노출 수치 단일화 합의 |
| PC-C-001 | Agent C | Build/CI | P1 (High) | 코드 저장소 내 빌드 검증 워크플로 부재 | 배포 전 회귀 탐지를 위해 GitHub Actions 워크플로 구축 채택 |
| PC-C-002 | Agent C | Automation | P1 (High) | `edenchat_clipboard.py` GUI 의존성 에러 | 207개 기준 수동 삽입에 맞춰 `load_ui_deps` 지연 import로 구동 복구 |
| PC-A-004 | Agent A | Onboarding | P2 (Medium) | '프리플레이' 명칭 충돌 (메인 모드 vs 유틸 모드) | 로어북 수정 없이, 사이트 UI 상의 라벨/설명만 혼동 없게 수정 |
| PC-A-005 | Agent A | Branding | P2 (Medium) | Works 페이지가 빈자리 위주로 노출됨 | Moderator 지침: 추후 생성될 Creator 포트폴리오 외부 사이트로 리다이렉트 |
| PC-C-006 | Agent C | Frontend | P2 (Medium) | 시네마틱 인트로 문서(cardDeal)와 실제 레지스트리 어긋남 | Moderator 확인: 현재 구현된 12종이 정식이며, dead config는 제거 |
| PC-C-008 | Agent C | Pipeline | P2 (Medium) | 프롬프트 추출 스크립트 내 레거시 경로 하드코딩 잔존 | 잘못된 백업 기준으로 덮어쓸 위험 방지를 위해 `LEGACY/`로 스크립트 이동 |
| PC-C-010 | Agent C | Worker | P2 (Medium) | 워커 배포 스크립트의 호환성 날짜 하드코딩 | 런타임 일관성을 위한 환경 변수화 동의 |
| PC-A-007 | Agent A | Policy | P3 (Low) | Gallery와 외부 HTML 간 NSFW 정책 비대칭 | Moderator 확인: 임시 조치의 잔재이므로, 정상 접근에 맞춰 모달 제거 정식화 |
| PC-C-009 | Agent C | Hygiene | P3 (Low) | 소스 주석 내 Unicode 깨짐() 기호 포함 | 온보딩 및 검색 신뢰도 향상을 위해 텍스트 교정 동의 |

## 기각 및 보류된 이슈 (반박 후 무효/연기)

| 이슈 ID | 발견자 | 상태 | 기각/보류 근거 |
|---------|--------|------|----------|
| PC-A-006 | Agent A | **Reject** | **Moderator 지침 반영:** `characters.js`에 외형 정보를 중복 기재하지 않음. 기존 `prompts/*` 내부 파일을 유일한 진실 공급원(SSOT)으로 유지함. |
| PC-A-008 | Agent A | **Defer** | **비용 대비 효익 부족:** Scene Codes의 전체 목록 노출은 운영 매뉴얼처럼 보일 수 있으므로 공개 UI에서는 카테고리 요약만 유지하고 전체 코드는 보류. |
| PC-A-009 | Agent A | **Defer** | **우선순위 조정:** 모드 카드 내 과도한 CTA 배치 방지. Moderator의 지침에 따라 최상단 Nav 리다이렉트를 우선 적용하고 개별 카드 CTA는 보류. |
| PC-A-010 | Agent A | **Reject** | **기록 보존 원칙:** Updates 타임라인 로그의 과거 수치(17/19/20)는 해당 시점의 역사적 기록이므로 현재 수치로 덮어쓰지 않고 보존함. |
| PC-C-003 | Agent C | **Reject** | **Moderator 절대 지침:** 로어북 JSON 본문 내 `trigger` 키는 챗봇 플랫폼에 수동 삽입되는 최중요 요소이므로, 스키마 규칙 명목으로 본문 데이터를 변경하는 것을 절대 금지. |
| PC-C-007 | Agent C | **Reject** | **Moderator 절대 지침:** 사이트 SVG 프리뷰와 워커의 렌더링 정책 차이는 "프리뷰는 단순 프리뷰"라는 의도된 비대칭이므로, 강제 동기화 불필요. |

## ISSUE_LEDGER.md 업데이트 현황

- [x] P0 이슈 기록 완료
- [x] P1 이슈 기록 완료
- [x] P2 이슈 기록 완료
-[x] P3 이슈 기록 완료