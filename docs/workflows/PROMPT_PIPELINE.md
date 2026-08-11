# Prompt Pipeline

## 기준

- `docs/prompts/json/`: 정식 원본
- `docs/prompts/common/`: 공통 규칙
- `docs/prompts/json_lite/`: 경량 생성물
- `docs/prompts/routing_classified/`: route 분류와 manifest
- `docs/prompts/json_unified/`: EdenChat 설치용 통합 생성물

로어북은 1엔트리=1파일이다. JSON 본문에 `trigger`나 초기 `fav`를 넣지 않고, trigger는 파일 하단 `// --- TRIGGER ---` 주석에 기록한다.

## 재생성·검증 순서

```powershell
py tools/generate_prompt_lite.py
py tools/validate_prompt_lite.py
py tools/classify_lorebook_routes.py
py tools/build_unified_lorebooks.py
py tools/validate_lorebook_organicity.py
py tools/edenchat_clipboard.py --list
```

생성 스크립트가 표시한 warning과 golden/manifest 차이를 확인한 뒤에만 EdenChat 입력 매크로를 실행한다. `--list`는 UI를 변경하지 않는 사전 확인이다.
