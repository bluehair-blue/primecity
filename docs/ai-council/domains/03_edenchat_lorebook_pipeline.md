# Domain 03 — Edenchat Lorebook Pipeline

> 에덴챗 로어북 103개 파일 및 삽입 파이프라인 감사.

## 범위

- `docs/prompts/json/` (194개 파일)
- `tools/edenchat_clipboard.py`
- `tools/extract_char_prompts.py`

## 로어북 구조

| 폴더 | 수량 | 역할 |
|------|------|------|
| 캐릭터/ | 103 | 캐릭터 본체·트리거·초기·심화 등 |
| 모드/ | 53 | 모드 본체·시나리오·기획사 분기 |
| 오디션/ | 12 | 라운드별·막간 |
| 루트 | 26 | 메인·구역·SVG·이벤트 |

## 감사 포인트

### 트리거 충돌
- 동일 키워드가 복수 로어북에 매핑된 경우
- 한국어·영어 키워드 일관성

### AI 편향 패턴 (feedback_ai_writing_bias.md 참조)
- em dash (`—`) 남용
- "~하지 않는다" 부정 정의
- "A가 아니라 B" 대조 구조 과다

### 파일명 규칙 준수
- `{이름}_EN.json` 패턴
- SVG 로어북 루트 배치 여부 (`SVG_` prefix)
- trigger 분리 (`// --- TRIGGER ---` 주석)

## 발견 이슈

_감사 후 채워진다_

## 권고사항

_감사 후 채워진다_
