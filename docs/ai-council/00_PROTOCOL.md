# AI Council — Protocol

## 개요
AI Council은 두 AI 에이전트(Codex, Claude)가 프라임시티 프로젝트를 독립적으로 감사하고
교차 검토·반박·종합을 통해 최종 개선 계획을 도출하는 멀티 에이전트 리뷰 프로세스다.

## 라운드 구조

| 라운드 | 파일 | 설명 |
|--------|------|------|
| Round 1 | `rounds/round_01_*_audit.md` | 각 에이전트 독립 감사 |
| Round 2 | `rounds/round_02_*_rebuttal.md` | 상대 감사 결과 반박/보완 |
| Round 3 | `rounds/round_03_synthesis.md` | 합의 사항 종합 |
| Round 4 | `rounds/round_04_final_judgement.md` | 최종 판정 및 우선순위 |

## 입력 문서

- `01_SESSION_BRIEF.md` — 현재 프로젝트 상태 요약
- `02_REPO_BASELINE.md` — 레포지토리 기준선 (파일 목록, 코드 통계)
- `03_REVIEW_QUESTIONS.md` — 검토 질문 목록
- `04_SCORE_RUBRIC.md` — 평가 루브릭

## 출력 문서

- `ISSUE_LEDGER.md` — 발견된 이슈 원장
- `DECISION_LOG.md` — 채택/기각 결정 로그
- `FINAL_IMPROVEMENT_PLAN.md` — 최종 개선 계획

## 도메인 분할

6개 도메인으로 분할하여 각 에이전트가 순차 검토:

1. Codex 마이그레이션 문서
2. 프론트엔드 UX 퍼널
3. 에덴챗 로어북 파이프라인
4. 이미지·SVG·R2 파이프라인
5. 브랜딩·수익화
6. 보안·콘텐츠 정책

## 규칙

- 각 에이전트는 Round 1에서 상대 결과를 보지 않는다
- 이슈는 `finding_card.md` 템플릿으로 기록
- 결정은 `decision_record.md` 템플릿으로 기록
- 합의된 이슈는 `ISSUE_LEDGER.md`에 집계
