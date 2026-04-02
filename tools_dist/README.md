# NAI Asset Generation + Auto Censor Toolkit

NovelAI 이미지 자동 생성 + YOLO 기반 성기 자동 검열 파이프라인.

## 파일 구성

| 파일 | 설명 |
|---|---|
| `asset_generator.py` | NAI API 자동 이미지 생성 (배치, 진행추적, 재시도) |
| `asset_config.json` | 캐릭터 × 장면 프롬프트 DB |
| `extract_config.py` | NAIS2 백업에서 프롬프트 추출 |
| `auto_censor.py` | YOLO 세그멘테이션 + 형태 복원 기반 성기 검열 |

## 요구 사항

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) (권장) 또는 pip

## 빠른 시작

### 이미지 생성

```bash
# uv 사용 (의존성 자동 설치)
uv run asset_generator.py --token YOUR_NAI_TOKEN --chars SY --scenes 1-8 --dry-run

# 전체 생성
uv run asset_generator.py --token YOUR_NAI_TOKEN
```

### 자동 검열

ntd11 v5 모델이 필요합니다: [Civitai에서 다운로드](https://civitai.com/models/1313556)

```bash
# models/ 폴더에 모델 배치
mkdir -p models
# ntd11_anime_nsfw_segm_v5-variant1.pt → models/ntd11_v5.pt

# 단일 이미지 검열 + 미리보기
uv run auto_censor.py image.webp --preview

# 배치 검열
uv run auto_censor.py --batch-all

# 모자이크 스타일
uv run auto_censor.py image.webp --style mosaic
```

## 검열 파이프라인

```
YOLO 감지 (pussy/penis/anus)
  → ROI 제한 (bbox 기반)
  → 크기 크롭 (클래스별 최대치)
  → CLOSE (끊김 봉합)
  → Flood Fill (내부 구멍 제거)
  → Best Component (면적+거리 점수)
  → Convex Hull 재채우기 (솔리드)
  → Opening (잔돌기 제거)
  → 최종 검열 적용
```

### 감지 대상

| 클래스 | 검열 | 비고 |
|---|---|---|
| penis | ✅ | |
| pussy | ✅ | |
| anus | ✅ | |
| nipples | ❌ | 무시 |
| testicles | ❌ | 무시 |

### 주요 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--yolo-conf` | 0.5 | YOLO 신뢰도 (권장: 0.5~0.8) |
| `--style` | solid | solid(검은색) 또는 mosaic(모자이크) |
| `--preview` | - | 감지 영역 미리보기 저장 |

## 주의사항

- `asset_generator.py` 사용 시 유효한 NovelAI API 토큰 필요
- `auto_censor.py`는 ntd11 v5 모델 파일(`models/ntd11_v5.pt`)이 필요
- 모델은 애니메이션 전용 (실사 이미지 미지원)
- 성기가 없는 이미지는 원본 유지 (재저장 안 함 = 품질 열화 0)

## 라이선스

스크립트: MIT
ntd11 모델: Civitai 이용약관 참조
