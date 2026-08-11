# Lorebook Routing Classification

원본/경량 로어북 원본 파일은 이동하지 않았다. 이 디렉토리는 라우팅 설계 검토용 복사본이다.

## 분류 기준

- `00_main_toggle`: EdenChat 분리 프롬프트에서 원본/경량 토글 대상.
- `01_common_shared`: 원본/경량 구분 없이 단일본으로 유지할 공통 규칙.
- `02_media_format`: 출력 양식/미디어 규칙. 중복 호출보다 공통 단일본 후보.
- `03_routeable_fixed_command`: `!명령어`, 라운드/모드 고정 토큰 중심. 원본/경량 키워드 분기 가능.
- `04_routeable_state_keyword`: 하트/상태/이모지 조건 중심. 원본/경량 상태 키워드 분기 가능.
- `05`~`08`: 자연어·캐릭터명·관계·세계관 중심. 병렬 삽입 시 중복 호출 위험이 높아 단일 운영본 후보.
- `09_ambiguous_review`: 자동 분류로 결론 내기 어려운 혼합 키워드.

## 요약

| variant | route class | count | recommendation |
|---|---|---:|---|
| original | 00_main_toggle | 1 | 원본/경량 메인 프롬프트 토글로만 운용:1 |
| original | 01_common_shared | 1 | 원본/경량 구분 없이 단일 공통본으로 운용:1 |
| original | 02_media_format | 11 | 원본/경량 구분 없이 단일 공통본으로 운용:11 |
| original | 03_routeable_fixed_command | 41 | 원본/경량 키워드 분기 가능:41 |
| original | 04_routeable_state_keyword | 59 | 원본/경량 키워드 분기 가능:59 |
| original | 05_dynamic_character_core | 20 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:20 |
| original | 06_dynamic_character_trigger | 19 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:19 |
| original | 07_dynamic_deep_context | 21 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:21 |
| original | 08_dynamic_world_event | 10 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:10 |
| original | 09_ambiguous_review | 25 | 혼합 키워드. 실제 세션 샘플로 수동 검토:25 |
| lite | 00_main_toggle | 1 | 원본/경량 메인 프롬프트 토글로만 운용:1 |
| lite | 01_common_shared | 1 | 원본/경량 구분 없이 단일 공통본으로 운용:1 |
| lite | 02_media_format | 11 | 원본/경량 구분 없이 단일 공통본으로 운용:11 |
| lite | 03_routeable_fixed_command | 41 | 원본/경량 키워드 분기 가능:41 |
| lite | 04_routeable_state_keyword | 59 | 원본/경량 키워드 분기 가능:59 |
| lite | 05_dynamic_character_core | 20 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:20 |
| lite | 06_dynamic_character_trigger | 19 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:19 |
| lite | 07_dynamic_deep_context | 21 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:21 |
| lite | 08_dynamic_world_event | 10 | 병렬 삽입 위험. 단일 운영본으로 통합하거나 하나만 선택:10 |
| lite | 09_ambiguous_review | 25 | 혼합 키워드. 실제 세션 샘플로 수동 검토:25 |

## 다음 판단

- `03_routeable_fixed_command`, `04_routeable_state_keyword`는 원본/경량 접두 키워드 또는 메인 프롬프트 상태 출력 규칙으로 분기 설계 가능.
- `05_dynamic_character_core`, `06_dynamic_character_trigger`, `07_dynamic_deep_context`, `08_dynamic_world_event`는 병렬 호출 방지 대상. 하이브리드 단일본 또는 한쪽 운영본 선택이 필요.
- `02_media_format`은 원본/경량으로 나눌 실익보다 단일 공통본 유지가 안정적.
