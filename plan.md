# plan.md — 구현 기획서

> 이 문서는 **코드 작성 전 반드시 거쳐야 하는 기획 단계**입니다.
> 사용자가 이 문서 안에서 주석(`<!-- 피드백 -->` 또는 인라인 코멘트)으로 피드백을 남기고,
> 기획이 충분히 구체화되었다고 판단한 뒤에야 코드베이스에 반영합니다.
>
> **절대 규칙**: 사용자의 명시적 승인 없이 코드 구현을 시작하지 않는다.

---

## 문서 구조 규칙

모든 기획 항목은 아래 구조를 따릅니다:

```
### [작업 제목]

**목적**: 왜 이 작업이 필요한가 (1-2문장)

**접근 방식**: 
어떻게 구현할 것인가. 단계별로 상세히 서술.
대안이 있었다면 왜 이 방식을 선택했는지.

**변경 파일**:
- `경로/파일명` — 무엇을 어떻게 변경하는지

**코드 스니펫** (핵심 변경사항 예시):
```언어
// 실제 코드에 적용될 패턴 미리보기
```

**고려사항 / 트레이드오프**:
- 이 방식의 장점
- 이 방식의 단점 또는 리스크
- 반드시 확인해야 할 것

**검증 방법**:
- 빌드 성공 여부
- 시각적 확인 항목
- 엣지 케이스
```

---

## 현재 기획 중

> 아래에 다음 구현할 작업의 상세 기획을 작성합니다.
> 사용자는 각 항목에 `<!-- 피드백: ... -->` 주석을 달아 방향을 조정합니다.

### tools/ Python 파이프라인 개선 (18항목, 4Phase)

**목적**: 코드 리뷰 + 사용자 피드백(2차)을 바탕으로 한 버그 수정, 검열 커버리지, 경로 복구, 코드 품질 통합 개선.

**상세 기획**: → `tools/plan_sub.md` (전체 코드 스니펫 + 변경 파일 + 고려사항)

**Phase 요약**:

| Phase | 내용 | 항목수 | 영향도 |
|---|---|---|---|
| **1. 버그 수정** | ZIP 가드, --retry-failed(명시적 태스크 리스트), done+cooldown 분리, status(special scene 집계), mark_failed reason, 임시 파일, **zero-mask 상태 분리** | 7 | HIGH |
| **2. 산출물 안전** | 원본 보호(atomic write), **검열 커버리지 보강**, **이미지/모델/배치스크립트 경로 통합** | 3 | HIGH |
| **3. 코드 품질** | 공유 utils, pathlib, 미사용 import, 환경변수, UTC, 로깅, 함수 분할 | 7 | MEDIUM |
| **4. 타입 힌트** | public 함수 시그니처 어노테이션 | 1 | MEDIUM |

---

**핵심 의사결정 요약**:

**1) 검열 커버리지 보강 (2-2)** — plan_sub.md에 상세
- 빈틈 원인: **Step 8 Opening이 유력 가설** (5×5 커널 → 외곽 1~2px 순 수축), **Step 3 force crop이 공동 가설** (float→int bbox 경계 손실). 아직 확정 아님 — 테스트셋에서 비교 검증 필요.
- 해결: safety dilation 추가 + **ROI/crop 마스크를 dilation 후 AND로 재적용** (bbox 밖 번짐 방지)
- threshold 완화(0.5→0.45)는 테스트 결과에 따라 선택적 적용
- 검증: 원본 read-only, 결과는 `tools/test_samples/results/{before,after}/`에 격리 저장. 산출물 = preview + mask + stats.json. 최종 판정은 200% 확대 수동 검수.

**2) --retry-failed (1-2)** — 교차곱 문제 해결
- char×scene union은 불필요한 조합까지 재실행 → `[(char, scene)]` 명시적 태스크 리스트로 변경
- `generate_batch()`가 `retry_tasks` 인자를 직접 받도록 시그니처 수정

**3) done + cooldown (1-3)** — 카운터 분리
- `done`(진행률, skip 포함) + `api_calls_since_cooldown`(API 성공 횟수, 쿨다운 전용) 2개 분리

**4) show_status (1-4)** — special scene 집계
- state에 901~911 기록 존재 → ALL_SCENES 범위만 카운트, special은 별도 표시. ZeroDivisionError 방어도 포함.

**5) zero-mask 상태 분리 (1-7, 신규)**
- 모델 미가용/정상 통과/추론 실패가 동일한 `clean (skip)`으로 합쳐지는 문제 → 3가지 상태를 로그+반환값으로 구분. 배치 시 모델 미가용 경고 출력.

**6) 경로 통합 (2-3)** — 3가지 대상
- 이미지 경로(`OUTPUT_BASE`/`BASE_DIR`) + 모델 경로(`MODEL_PATH`) + 배치 래퍼(`_run_censor_*.sh`)
- `_run_censor_*.sh`는 존재하지 않는 CLI 옵션 호출 중 → deprecated 또는 재작성 판단 필요

**변경 파일**:
- `tools/asset_generator.py` — Phase 1(1-1~1-5) + Phase 2(경로) + Phase 3~4
- `tools/auto_censor.py` — Phase 1(1-6, 1-7) + Phase 2(전부) + Phase 3(utils)
- `tools/extract_config.py` — Phase 3(pathlib, 로깅)
- `tools/_run_censor_*.sh` — deprecated 또는 재작성
- **신규** `tools/utils.py`, `tools/test_samples/{input,results}/`

**권장 배치**: 1차(Phase 1+2) → 2차(Phase 3) → 3차(Phase 4)

**검증 방법**:
- `--status`로 special scene 분리 집계 확인
- `--retry-failed --dry-run`으로 정확한 (char, scene) 조합만 출력 (교차곱 없음)
- `--coverage-test --result-dir`로 before/after 격리 + 200% 확대 수동 검수
- 경로: `auto_censor.py --help`, `asset_generator.py --status` 에러 없이 실행

<!-- 사용자 피드백 영역 -->
<!-- 3차 피드백(6건) 반영 완료:
  - 1-5: failed dict str 키 표준 확정 + JSON round-trip 안전 명시
  - 2-2(C): 전용 run_coverage_test() 헬퍼, 기존 preview 재사용 금지
  - 2-2: stats.json = 폴더 단위 집계 manifest (배열) 확정
  - 2-3: 경로 검증은 I/O 실행 경로에서만 (status/help/dry-run 제외)
  - 3-3+3-4: import os 유지(base64만 삭제), 토큰 우선순위 --token > --token-file > NAI_TOKEN 확정
  - 수치: ALL_SCENES 75장으로 통일
-->

---

## 대기열 (우선순위순)

> plan.md에 상세 기획이 작성되기 전의 작업 후보 목록입니다.
> 사용자가 선택하면 "현재 기획 중" 섹션으로 승격되어 상세화됩니다.

### 긴급
1. ~~**NSFW 이미지 검열 배치 실행**~~ ✅ 완료 (264/855장 검열, 흰색+edge_blur=9)
2. **에덴챗 로어북 삽입 테스트** — 동시 활성 성능, 상태창 렌더링 확인

### 중간
3. **Works 페이지 확장** — 추가 작품 등록
4. **Phase 5: 프롬프트 품질 개선** — 자가점검/감정잔여/복선스케줄러
5. **검열 모델 + 후처리 한계 보완** — 모델 미감지율 + 후처리 커버리지 + 경계 정밀도 종합 개선

### 낮음
6. **모바일 성능 최적화** — 시네마틱 효과 검수
7. **README.md 커스터마이즈** — Vite 기본 → 프로젝트 맞춤

---

## 완료 이력

> 구현이 완료된 기획은 여기로 이동합니다. 접근 방식과 결과만 간략히 기록.

### 2026-04-04: tools/ Python 파이프라인 개선 (Phase 1~4)
- Phase 1 (버그 7건): ZIP 가드, --retry-failed 명시적 태스크 리스트, done+cooldown 분리, status special scene 집계, mark_failed str key+reason, 임시 파일 race condition, zero-mask 상태 분리
- Phase 2 (산출물 3건): atomic write, 검열 커버리지 보강(safety dilation+ROI re-clamp), 이미지/모델/배치 경로 통합
- Phase 3 (코드 품질 7건): utils.py 추출, pathlib 통합, base64 삭제, 환경변수 토큰, UTC, 로깅, generate_batch→_generate_one 분할
- Phase 4 (타입 힌트): public 함수 시그니처 어노테이션
- 추가: 검열 색상 흰색 기본값, edge_blur 안티에일리어싱(기본 9), --coverage-test 검증 인프라
- NSFW 배치 검열 실행: 855장 → 264장 검열, 0 실패

### 2026-04-03: 프로젝트 파일 정리 + 문서 체계 구축
- 루트 콘텐츠 파일 7개 → docs/, 스크립트 → tools/, 임시파일 삭제
- research.md/research_sub.md 9개 폴더 분석 (16섹션 종합)
- CLAUDE.md 분리: plan.md(기획) + idea.md(브레인스토밍) + CLAUDE.md(표지판)

### 2026-04-02: 자동 검열 파이프라인 완성
- 진화: 수평밀도→핑크contour→NudeNet(실패)→ntd11 YOLO-seg→형태복원 최종
- ROI 제한 → CLOSE → flood fill → best component → convex hull → opening

### 2026-04-01~02: 소개 사이트 대규모 개선
- Gold & Azure Dualism 색상 시스템
- 구역 상세 페이지 오버홀 (히어로+랜드마크+로어)
- 챗봇 HTML 오버홀 (CSS vars, 접기 UX)
- 프롬프트 압축 84KB→56KB (33%)
- SVG Worker 8개 XSS 수정 + 보안 헤더
- 에셋 1,125장 + 특수 90장 생성/업로드
