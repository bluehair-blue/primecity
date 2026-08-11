# Anus Censor Pipeline

`tools/auto_censor.py`는 `models/ntd11_v5.pt`를 읽어 지정 클래스만 검열한다. 테스트는 원본 `char_img/{CHAR}`를 수정하지 않고 별도 결과 폴더에 저장한다.

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

판정 기준:

- 원본과 결과 이미지 수가 같아야 한다.
- `censor_report.json`의 `target_classes`는 요청 클래스만 포함해야 한다.
- `censored: true` 항목은 `mask_area_px > 0`이어야 한다.
- 모델 로드·이미지 읽기·저장 실패는 `success: false` 또는 `reason`으로 남아야 한다.

검출 대상을 늘릴 때는 `--target-classes`에 명시하고 별도 복사본으로 먼저 검증한다.
