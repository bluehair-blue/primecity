---
name: anus-censor
description: 캐릭터 이미지 폴더를 복사본 기준으로 anus-only 자동 검열 테스트한다
---

# Anus Censor

사용자가 `anus`, `항문`, `자동검열`, `ntd11`, `NSFW detection`, `char_img` 검열 테스트를 요청할 때 적용한다.

1. 프로젝트 루트에서 실행하고 원본 `char_img/*`를 직접 수정하지 않는다.
2. 입력과 출력 폴더를 분리한다.
3. 기본 모델 `models/ntd11_v5.pt`의 라벨에 `anus`가 있는지 확인한다.
4. 실행 후 원본/결과 이미지 수와 `censor_report.json`의 실패 수를 대조한다.

```powershell
py tools/auto_censor.py `
  --folder "char_img/NHR" `
  --output-dir "char_img_censor_tests/NHR_anus_YYYYMMDD_HHMMSS" `
  --model-path "models/ntd11_v5.pt" `
  --target-classes anus `
  --style solid `
  --edge-blur 9 `
  --yolo-conf 0.5
```

세부 판정 기준은 `docs/anus-censor-pipeline.md`를 따른다.
