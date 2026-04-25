# Domain 04 — Image · SVG · R2 Pipeline

> 이미지 생성·검열·업로드·SVG 워커 파이프라인 감사.

## 범위

- `tools/asset_generator.py`
- `tools/auto_censor.py`
- `tools/r2_sync_loop.py`
- `workers/svg-*.js` (10개)
- `src/utils/cdn.js`

## 파이프라인 흐름

```
NAI API → char_img/ → auto_censor → r2_sync → R2 버킷
                                                    ↓
                                         cdnUrl() → 브라우저
```

## 감사 포인트

### ASSET_VERSION 관리
- 현재 값: 28
- R2 업로드 시 버전 증가 누락 가능성

### base64 인라인 SVG 워커
- `fetchAsDataUri()` 미구현 워커 확인
- `safeImageUrl()` data: prefix 통과 여부

### 검열 파이프라인
- conf=0.7 임계값 적정성
- false negative 패턴 (귀두/소형 성기)
- 252장 검열 / 603장 클린 비율 검토

### 레거시 경로 오염
- `_OLD_DO_NOT_USE_캐릭터이미지_use_char_img/` 참조 여부

## 발견 이슈

_감사 후 채워진다_

## 권고사항

_감사 후 채워진다_
