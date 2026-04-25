# tools/ — 개선 기획서 (plan_sub.md)

> ⚠️ **과거 기획서 (2026-04-04 구현 완료)**. 본문의 "캐릭터 이미지/" 경로는 당시 시점의 표기이며, 2026-04-23부로 이미지 원본은 **`연예계/char_img/`** 로 이동·정착됨. 경로 이력 비교는 그대로 보존하되, 실제 현행 경로는 CLAUDE.md를 참조.
>
> 이 문서는 Python 코드 리뷰 + 사용자 피드백을 바탕으로 한 **구체적 개선 계획**입니다.
> 사용자가 주석(`<!-- 피드백 -->`)으로 피드백하고 승인한 후에만 구현합니다.
>
> **리뷰 결과**: CRITICAL 0건, HIGH 7건, MEDIUM 10건
> **사용자 피드백 (2차)**: --retry-failed 교차곱 문제, done/cooldown 분리, special scene 집계, zero-mask 상태 분리, 검열 커버리지 가설 완화+ROI 재적용, 테스트 산출물 격리, 배치 래퍼 스크립트 포함, 항목 수 정정
> **총 항목**: 18개 (Phase 1: 7 + Phase 2: 3 + Phase 3: 7 + Phase 4: 1)
> **대상 파일**: asset_generator.py, auto_censor.py, extract_config.py, _run_censor_*.sh
> **이미지 경로 변경**: `연예계/캐릭터 이미지/` → `챗봇 제작/캐릭터 이미지/` (상위로 이동)

---

## Phase 1: 버그 수정 (HIGH)

> 로직 오류와 크래시 가능성이 있는 항목. 기능에 직접적 영향.

---

### 1-1. ZIP 빈 응답 가드 + exception chaining

**목적**: NAI API가 빈 ZIP 또는 손상된 ZIP을 반환할 때 `IndexError` 대신 명확한 에러 메시지를 제공한다.

**접근 방식**:
- `zf.namelist()[0]` 전에 빈 리스트 검사 추가
- bare `except Exception` → 특정 예외(`zipfile.BadZipFile`, `KeyError`, `OSError`)로 좁힘
- `raise ... from e`로 원본 traceback 보존 (PEP 3134)

**변경 파일**:
- `tools/asset_generator.py` — `call_nai_api()` 함수 (294~301행)

**코드 스니펫**:
```python
# Before (현재)
try:
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        img_name = zf.namelist()[0]
        img_data = zf.read(img_name)
        return Image.open(io.BytesIO(img_data))
except Exception as e:
    raise APIError(f"Failed to decode image: {e}")

# After (개선)
try:
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        names = zf.namelist()
        if not names:
            raise APIError("API returned an empty ZIP archive")
        img_data = zf.read(names[0])
        return Image.open(io.BytesIO(img_data))
except (zipfile.BadZipFile, KeyError, OSError) as e:
    raise APIError(f"Failed to decode image: {e}") from e
```

**고려사항**:
- `APIError`는 상위 retry 루프에서 잡히므로, chaining으로 인한 동작 변경 없음
- `Image.open()` 실패(손상 이미지)도 `OSError`로 잡힘

**검증**: `--dry-run`으로 기존 로직 영향 없음 확인 + 빌드 무관(Python 스크립트)

---

### 1-2. --retry-failed 로직 수정

**목적**: `--retry-failed`가 현재 일반 실행과 동일하게 동작하는 버그를 수정하여, 실제로 실패한 `(char, scene)` 조합만 정확히 재시도하도록 한다.

**문제 분석**:
현재 코드는 `scene_nums = ALL_SCENES`를 대입하고 `is_done()` 스킵에 의존. 이전 기획에서는 char×scene union 방식을 제안했으나, 이 역시 교차곱 문제가 있음: A가 21번만 실패, B가 32번만 실패해도 A/32, B/21이 불필요하게 재시도됨.

**접근 방식**:
- `generate_batch()`의 인터페이스를 변경하여, `retry_tasks: list[tuple[str, int]] | None` 인자를 받도록 함
- `--retry-failed` 시 failed dict에서 `[(char_code, scene_num), ...]` 형태의 명시적 태스크 리스트를 생성
- 기존 char×scene 루프와 호환되면서도, retry 시에는 정확한 조합만 실행

**변경 파일**:
- `tools/asset_generator.py` — `main()` (554~557행), `generate_batch()` 시그니처+루프

**코드 스니펫**:
```python
# main() — retry_tasks 리스트 생성
if args.retry_failed:
    failed = state.get("failed", {})
    retry_tasks = []
    for char_code, scenes in failed.items():
        if args.chars and char_code not in char_codes:
            continue
        for scene_num in (scenes if isinstance(scenes, list) else scenes.keys()):
            retry_tasks.append((char_code, int(scene_num)))
    if not retry_tasks:
        log.info("No failed items to retry. All clear!")
        return
    log.info(f"Retrying {len(retry_tasks)} failed tasks")
    generate_batch(token, config, state, retry_tasks=retry_tasks, ...)
    return

# generate_batch() — retry_tasks 지원
def generate_batch(token, config, state, char_codes=None, scene_nums=None,
                   retry_tasks=None, dry_run=False, delay=DELAY_NORMAL):
    if retry_tasks:
        tasks = retry_tasks
    else:
        tasks = [(c, s) for c in char_codes for s in scene_nums]
    total = len(tasks)
    ...
    for char_code, scene_num in tasks:
        ...  # 기존 내부 루프 로직
```

**고려사항**:
- `retry_tasks`가 주어지면 char_codes/scene_nums 무시 → 명확한 분기
- `mark_completed()`가 실패 목록에서 제거하므로, 성공 시 자동으로 다음 retry에서 제외
- failed dict가 list(이전 형식) 또는 dict(1-5 개선 형식) 어느 쪽이든 호환

**검증**: `--retry-failed --dry-run`으로 정확히 실패한 (char, scene) 조합만 출력되는지 확인. 교차곱이 없어야 함.

---

### 1-3. done 카운터 + cooldown 카운터 분리

**목적**: (1) APIError/RequestException 시 done이 retry마다 증가하는 진행률 부정확 문제, (2) cooldown이 `done % COOLDOWN_EVERY`에 묶여 있어 skip/already-done 항목도 카운트하면 쿨다운 타이밍이 어긋나는 문제를 동시에 수정한다.

**접근 방식**:
- `done`: "처리 흐름상 순번" (진행률 표시용). retry 루프 밖에서 1회만 증가.
- `api_calls_since_cooldown`: "실제 API 호출 성공 횟수" (쿨다운 판정용). 성공 시에만 증가, skip/dry-run 시 불변.

**변경 파일**:
- `tools/asset_generator.py` — `generate_batch()` 함수 (359~458행)

**코드 스니펫**:
```python
# generate_batch() 상단
done = 0
api_calls_since_cooldown = 0

# 태스크 루프 (retry 루프 밖에서 done 증가)
done += 1
for attempt in range(1, MAX_RETRIES + 1):
    try:
        log.info(f"  [{done}/{total}] Generating ... (attempt {attempt})")
        img = call_nai_api(...)
        save_image(...)
        mark_completed(...)
        api_calls_since_cooldown += 1
        success = True
        break
    except RateLimitError:
        ...  # done 조작 없음
    except (APIError, requests.RequestException):
        ...  # done 조작 없음

# 딜레이 로직 (api_calls_since_cooldown 기준)
if not dry_run and success:
    if api_calls_since_cooldown >= COOLDOWN_EVERY:
        log.info(f"  ⏳ {COOLDOWN_EVERY}장 API 호출, {DELAY_COOLDOWN}초 쿨다운...")
        time.sleep(DELAY_COOLDOWN)
        api_calls_since_cooldown = 0
    else:
        time.sleep(delay)
```

**고려사항**:
- `done`은 로그 표시 전용 (skip 포함), `api_calls_since_cooldown`은 NAI rate limit 전용
- cooldown 판정이 `%` 대신 `>=` 비교로 변경되어, 정확히 N회 API 호출마다 발동
- 429 핸들러의 `done -= 1` 제거

**검증**: 로그에서 `[N/total]`이 순차 증가 + 쿨다운 로그가 정확히 API 10회 호출 후에만 출력되는지 확인

---

### 1-4. show_status() special scene 집계 + ZeroDivisionError 방지

**목적**: `generation_state.json`에는 special scene(901~911) 완료 기록이 포함되지만, `show_status()`는 `ALL_SCENES`(75장)만 기준으로 계산하여 진행률 100% 초과, 캐릭터별 바 길이 초과, 실패 수 왜곡이 발생하는 문제를 수정한다.

**접근 방식**:
- completed/failed 집계 시 `ALL_SCENES` 범위 내 항목만 카운트 (special scene 제외)
- special scene은 별도 줄로 표시 (있을 경우만)
- ZeroDivisionError 방어도 함께 적용

**변경 파일**:
- `tools/asset_generator.py` — `show_status()` 함수 (497~525행)

**코드 스니펫**:
```python
all_scenes_set = set(ALL_SCENES)

for code in ALL_CHARS:
    completed = state.get("completed", {}).get(code, [])
    failed_items = state.get("failed", {}).get(code, [] if isinstance(...) else {})
    # ALL_SCENES 범위 내만 카운트
    done = len([s for s in completed if s in all_scenes_set])
    fail = len([s for s in (failed_items if isinstance(failed_items, list)
                else failed_items.keys()) if int(s) in all_scenes_set])
    special_done = len([s for s in completed if s not in all_scenes_set])
    ...

# 전체 진행률도 동일 기준
completed_total = sum(
    len([s for s in v if s in all_scenes_set])
    for v in state.get("completed", {}).values()
)
pct = completed_total * 100 // total_possible if total_possible else 0
print(f"  Progress:  {completed_total}/{total_possible} ({pct}%)")

# special scene 요약 (있을 경우)
special_total = sum(
    len([s for s in v if s not in all_scenes_set])
    for v in state.get("completed", {}).values()
)
if special_total:
    print(f"  Special:   {special_total} (SVG/key visual/thumbnail)")
```

**고려사항**:
- `SPECIAL_SCENES = [901, 902, 903, 904, 910, 911]`은 이미 정의되어 있으므로 활용 가능
- 기존 state.json 호환: 어떤 scene 번호든 포함 가능하되, 집계는 범위별로 분리

**검증**: `--status` 출력에서 진행률이 100% 이하이고 special scene이 별도 표시되는지 확인

---

### 1-5. mark_failed()의 reason 저장

**목적**: 실패 사유(`reason`)가 현재 무시되고 있어, 후속 디버깅이 불가능한 문제를 수정한다.

**접근 방식**:
- `state["failed"]` 구조를 `{char_code: [scene_num, ...]}` → `{char_code: {"scene_num": reason, ...}}`로 변경
- **키 타입 규약: 전 구간 str 키 표준**. JSON round-trip 시 dict key가 문자열이 되므로, `mark_failed()`에서 `str(scene_num)`으로 저장, `mark_completed()`에서 `str(scene_num)`으로 pop. `load_state()`에서 별도 int 변환 불필요.
- `is_done()`, `mark_completed()`, `show_status()`, `--retry-failed` 로직도 호환성 업데이트

**변경 파일**:
- `tools/asset_generator.py` — `mark_failed()`, `mark_completed()`, `show_status()`, `main()`

**코드 스니펫**:
```python
# Before (현재 — reason 무시)
def mark_failed(state, char_code, scene_num, reason):
    state.setdefault("failed", {}).setdefault(char_code, [])
    if scene_num not in state["failed"][char_code]:
        state["failed"][char_code].append(scene_num)
    save_state(state)

# After (개선 — str 키 표준, reason 저장)
def mark_failed(state, char_code, scene_num, reason):
    state.setdefault("failed", {}).setdefault(char_code, {})
    state["failed"][char_code][str(scene_num)] = reason   # ← str 키
    save_state(state)

# mark_completed — str 키로 pop
def mark_completed(state, char_code, scene_num):
    state.setdefault("completed", {}).setdefault(char_code, [])
    if scene_num not in state["completed"][char_code]:
        state["completed"][char_code].append(scene_num)
    # failed에서 제거 (str 키)
    if char_code in state.get("failed", {}):
        state["failed"][char_code].pop(str(scene_num), None)
        if not state["failed"][char_code]:
            del state["failed"][char_code]
    save_state(state)
```

**고려사항**:
- **기존 state 호환성**: 기존 `generation_state.json`의 failed가 list 형식일 수 있음. `load_state()`에서 자동 마이그레이션:
  ```python
  for code, val in state.get("failed", {}).items():
      if isinstance(val, list):
          state["failed"][code] = {str(s): "unknown (migrated)" for s in val}
  ```
- **JSON round-trip 안전**: 모든 failed dict key는 `str(scene_num)` → JSON 저장/로드 후에도 동일. `mark_completed()`에서 `pop(str(scene_num))`으로 제거. completed 리스트는 int 유지 (JSON 배열이므로 타입 보존).
- `show_status()`에서 `len(v)`는 dict에서도 동일하게 동작 (키 수 = 실패 수)

**검증**: `--status`로 실패 사유 표시 확인. 기존 state.json과 호환 테스트.

---

### 1-6. YOLO 임시 파일 race condition 수정

**목적**: `yolo_detect()`가 고정 경로 `/tmp/censor_yolo.jpg`를 사용하여, 향후 병렬화 시 충돌 위험이 있는 문제를 수정한다.

**변경 파일**:
- `tools/auto_censor.py` — `yolo_detect()` 함수 (274~277행)

**코드 스니펫**:
```python
# Before (현재 — 고정 경로)
tmp = Path(tempfile.gettempdir()) / "censor_yolo.jpg"
PILImage.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB)).save(str(tmp), "JPEG", quality=95)
results = model(str(tmp), verbose=False, conf=conf, imgsz=1024)
tmp.unlink(missing_ok=True)

# After (개선 — 고유 임시 파일 + try/finally 정리)
with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tf:
    tmp = Path(tf.name)
try:
    PILImage.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB)).save(str(tmp), "JPEG", quality=95)
    results = model(str(tmp), verbose=False, conf=conf, imgsz=1024)
finally:
    tmp.unlink(missing_ok=True)
```

**고려사항**:
- `NamedTemporaryFile`은 OS별 고유 파일명 보장
- `try/finally`로 프로세스 중단 시에도 정리됨
- 성능 영향 없음 (파일명 생성 비용 무시 가능)

---

### 1-7. zero-mask 상태 분리 (모델 미가용 vs 정상 통과 vs 추론 실패)

**목적**: `yolo_detect()`와 `process_single()`에서 "성기 미감지(정상 통과)"와 "모델 로드 실패/경로 오류"가 동일한 zero mask + `clean (skip)` 로그로 합쳐지는 문제를 해소한다. 배치 실행 시 모델 미가용 상태를 clean과 동일 취급하면, 검열 없이 전량 통과되어도 알 수 없다.

**접근 방식**:
- `get_model()` 반환값에 따라 세 가지 상태를 구분:
  - `None` (모델 미가용): 즉시 경고 + 배치 시 중단 또는 경고 카운터
  - zero mask + detections 빈 리스트: 정상 통과 (no detection)
  - zero mask + 추론 에러: 실패 로그

**변경 파일**:
- `tools/auto_censor.py` — `yolo_detect()` (266~310행), `process_single()` (339~385행), `process_batch()` (397~421행)

**코드 스니펫**:
```python
# yolo_detect() — 모델 미가용 시 명시적 상태 반환
def yolo_detect(image, conf=0.5):
    model = get_model()
    if model is None:
        return np.zeros(image.shape[:2], dtype=np.uint8), [], "no_model"
    ...
    return final_mask, detections, "ok"

# process_single() — 상태별 로그 분기
mask, detections, status = yolo_detect(image, conf=yolo_conf)
if status == "no_model":
    log.warning(f"  {Path(input_path).name} → MODEL UNAVAILABLE (not censored!)")
    return {"path": input_path, "success": False, "reason": "no_model"}

# process_batch() — 배치 요약에 모델 미가용 카운트 추가
no_model = sum(1 for r in results if r.get("reason") == "no_model")
if no_model:
    log.error(f"⚠ {no_model} images skipped: model unavailable!")
```

**고려사항**:
- 배치 모드에서 모델 미가용이 1건이라도 발생하면, 요약 로그에 경고 출력
- `process_batch()` 시작 시 `get_model()` 선행 체크를 추가하여, 모델 없으면 배치 자체를 중단하는 옵션도 고려 (fail-fast)
- 기존 반환 타입 `tuple[np.ndarray, list[dict]]` → `tuple[np.ndarray, list[dict], str]` 변경 → process_single도 수정 필요

**검증**: 모델 경로를 임시로 변경 후 단일 파일/배치 실행 시 로그 구분 확인

---

## Phase 2: 산출물 안전 (HIGH)

> 산출물 품질/무결성에 직접 영향. Phase 1과 함께 1차 커밋 대상.

---

### 2-1. auto_censor 원본 파일 보호

**목적**: `process_batch()`에서 입력=출력 경로가 동일하여, 저장 실패 시 원본이 손상되는 위험을 방지한다.

**접근 방식**:
- 임시 파일에 먼저 저장 → 성공 시 원본 교체 (atomic write 패턴)
- `--backup` 플래그 추가는 과도 → 단순히 안전한 쓰기만 적용

**변경 파일**:
- `tools/auto_censor.py` — `process_single()` (367행)

**코드 스니펫**:
```python
# process_single() 내부 — 검열 결과 저장 부분
result = apply_censor(image, mask, style, color)

# 입력과 출력이 같은 경우 atomic write
out = Path(output_path)
if Path(input_path).resolve() == out.resolve():
    tmp_out = out.with_suffix(".tmp" + out.suffix)
    save_image(result, str(tmp_out))
    tmp_out.replace(out)  # atomic on same filesystem
else:
    save_image(result, output_path)
```

**고려사항**:
- Windows에서 `Path.replace()`는 대상 파일이 존재하면 덮어쓰기 (Python 3.8+ 보장)
- `.tmp.webp` 파일이 남을 수 있음 → 프로세스 중단 시에만, 수동 삭제 가능
- 디스크 공간: 이미지 1장 추가 용량만 필요 (~50KB)

---

### 2-2. 검열 커버리지 보강 (마스크 빈틈 제거)

**목적**: 검열 마스크에 1~수 px 빈틈이 남아 성기 영역이 일부 노출되는 현상을 해소한다.

**원인 분석**:

`refine_segmentation_mask()` 파이프라인의 9단계를 추적. 유력 가설 2개:

```
Step 1  threshold(0.5)      → 경계 신뢰도 0.3~0.5 픽셀 탈락 ← 보조 가설
Step 2  ROI restriction      → pad_ratio=0.05 (정상 판단)
Step 3  force crop           → float→int 변환 + bbox 경계에서 1~2px 손실 가능 ← 공동 가설
Step 4  CLOSE (kernel ~8px)  → 끊김 봉합 (정상)
Step 5  flood fill holes     → 내부 구멍 제거 (정상)
Step 6  keep best component  → 최대 영역 선택 (정상)
Step 7  convex hull fill     → 솔리드 채우기 (정상)
Step 8  Opening (kernel ~5px)→ 곡률 높은 가장자리에서 1~2px 순 수축 ← 유력 가설
Step 9  flood fill           → 내부 구멍만 복구, 외곽 수축은 미복구
```

**유력 가설 (Step 8 Opening)**: `open_sz = max(3, int(base_dim * 0.004)) | 1` = 1024px 기준 5×5 커널. convex hull 후 곡률 높은 외곽에서 erosion 복원이 불완전 → 1~2px 순 수축. flood fill(Step 9)은 외곽 수축을 복구 불가.

**공동 가설 (Step 3 force crop)**: `map(int, bbox_xyxy)`에서 float→int 절단 + crop_w/crop_h 계산의 정수 연산에서 1px 손실 가능. 이 손실이 Opening 수축과 합산되면 빈틈이 커질 수 있음.

**보조 가설 (Step 1 threshold)**: `seg_thr=0.5`에서 전이 픽셀 탈락. 단독으로는 빈틈 원인이 되기 어려우나, 위 두 가설과 합산 시 영향.

> ⚠ Step 8이 유력하나 아직 확정 아님. 테스트셋에서 Step 3과 Step 8을 비교 검증해야 함.

**접근 방식** (3단계):

**(A) Safety dilation + ROI 재적용** — Opening 후 1~2px 팽창 + ROI/crop 마스크로 재클램프

```python
# refine_segmentation_mask() — Step 8과 9 사이에 삽입

    # 8. Light opening for tiny spikes
    temp = cv2.morphologyEx(temp, cv2.MORPH_OPEN, k_open, iterations=1)

    # 8.5 Safety dilation — compensate net shrinkage from opening
    safety_sz = max(3, int(base_dim * 0.002)) | 1  # ~2px for 1024
    k_safety = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (safety_sz, safety_sz))
    temp = cv2.dilate(temp, k_safety, iterations=1)

    # 8.6 Re-clamp to ROI + crop limits (dilation이 원래 경계 밖으로 퍼지는 것 방지)
    temp = cv2.bitwise_and(temp, roi_mask)
    temp = cv2.bitwise_and(temp, crop_mask)

    # 9. Final fill after opening
    temp = flood_fill_holes(temp)
```

> `roi_mask`와 `crop_mask`를 Step 2, 3에서 생성 후 함수 끝까지 보존해야 함 (현재는 `temp`에 직접 AND 적용 후 마스크 변수 미보존).

**(B) Threshold 완화** — seg_thr 0.5 → 0.45 (선택적, 테스트 결과에 따라 적용 여부 결정)

**(C) `--coverage-test` 모드** — 전용 헬퍼로 원본 read-only 강제

기존 `process_single(src, src, preview=True)`는 원본을 in-place 검열하므로 재사용 불가. **전용 함수 `run_coverage_test()`**를 만들어, 입력은 read-only로 열고 모든 출력은 `--result-dir`로 강제한다.

```python
def run_coverage_test(input_dir: Path, result_dir: Path, yolo_conf: float):
    """원본 read-only. 모든 산출물을 result_dir에 격리 저장."""
    result_dir.mkdir(parents=True, exist_ok=True)
    manifest = []  # stats.json 집계용

    for src in sorted(input_dir.glob("*.webp")):
        image = load_image(str(src))
        mask, detections, status = yolo_detect(image, conf=yolo_conf)
        area = int(np.sum(mask > 0))

        stem = src.stem  # e.g. "KHR_64"
        # preview: 마스크 윤곽선 오버레이
        preview = image.copy()
        cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(preview, cnts, -1, (0, 255, 0), 2)
        cv2.imwrite(str(result_dir / f"{stem}_preview.jpg"), preview)
        # mask: 바이너리
        cv2.imwrite(str(result_dir / f"{stem}_mask.png"), mask)

        manifest.append({
            "file": src.name,
            "detected": bool(detections),
            "mask_area_px": area,
            "detections": detections,
            "status": status,
        })

    # stats.json: 폴더 단위 집계 manifest (전체 샘플 요약)
    (result_dir / "stats.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False))
    log.info(f"Coverage test: {len(manifest)} images → {result_dir}")
```

**디렉토리 구조**:
```
tools/test_samples/
├── input/              ← 사용자가 빈틈 확인된 원본 5~10장 배치
└── results/
    ├── before/         ← 수정 전 결과 (preview + mask + stats.json)
    └── after/          ← 수정 후 결과
```

**stats.json 형식**: 폴더 단위 집계 manifest (배열). 이미지별 개별 파일 아님.
```json
[
  {"file": "KHR_64.webp", "detected": true, "mask_area_px": 12340, "detections": [...], "status": "ok"},
  {"file": "SY_51.webp", "detected": true, "mask_area_px": 8920, "detections": [...], "status": "ok"}
]
```

> 기존 `--preview`/`process_batch(preview_first)`는 원본 in-place 검열 + 원본 옆 저장이므로 **coverage-test에서 사용 금지**. 전용 `run_coverage_test()`만 사용.

**변경 파일**:
- `tools/auto_censor.py` — `refine_segmentation_mask()` (roi_mask/crop_mask 보존 + 8.5~8.6 삽입), `main()` (--coverage-test)

**고려사항**:
- **(A)의 ROI 재적용이 핵심**. dilation만 추가하면 bbox 근처 다른 부위로 번질 위험
- `roi_mask`와 `crop_mask`를 함수 끝까지 보존하려면 변수 스코프 조정 필요 (현재는 `temp`에 AND 후 마스크 버려짐)
- **(B)는 테스트 결과에 따라 결정**. Step 3 crop이 주 원인이면 threshold 완화는 불필요
- ground truth 마스크 없으므로 자동 "비검열 픽셀 수" 계산은 불가 → 면적 변화량 + 수동 확대 검수
- 면적 증가율 기준: 기존 대비 < 10%이면 수용 가능 (과검열 방지)
- `캐릭터 이미지/` 원본을 직접 테스트 시에도 출력은 `test_samples/results/`로 강제

**검증 방법**:
1. 사용자가 빈틈 확인된 샘플 5~10장을 `tools/test_samples/input/`에 배치
2. 수정 전: `python auto_censor.py --coverage-test --result-dir tools/test_samples/results/before`
3. 수정 후: 동일 명령 `--result-dir tools/test_samples/results/after`
4. `stats.json` 면적 비교 + 각 preview를 200% 확대하여 수동 검수
5. 판정 기준: 수동 확대 시 성기 영역 빈틈 0개 AND 면적 증가율 < 10%
6. Step 3 vs Step 8 비교: safety dilation 없이 Step 3만 수정한 결과와 비교하여 원인 특정

---

### 2-3. 이미지/모델/배치스크립트 경로 통합 업데이트

**목적**: `캐릭터 이미지/` 상위 이동 + `auto_censor.py` tools/ 이동으로 깨진 경로를 한 묶음으로 수정한다. 이미지 경로, 모델 경로, 배치 래퍼 스크립트 3가지 모두 대상.

**현재 상태** (전부 깨져 있음):

| 대상 | 현재 코드 | 해석 결과 | 실제 위치 |
|---|---|---|---|
| `asset_generator.py:61` (이미지) | `TOOLS_DIR.parent / "캐릭터 이미지"` | `연예계/캐릭터 이미지/` | `챗봇 제작/캐릭터 이미지/` |
| `auto_censor.py:62` (이미지) | `Path(__file__).parent / "캐릭터 이미지"` | `tools/캐릭터 이미지/` (**이중 오류**) | `챗봇 제작/캐릭터 이미지/` |
| `auto_censor.py:63` (모델) | `Path(__file__).parent / "models" / "ntd11_v5.pt"` | `tools/models/ntd11_v5.pt` (**오류**) | `연예계/models/ntd11_v5.pt` |
| `_run_censor_*.sh` | `cd "캐릭터 이미지"` (tools/ 기준) | `tools/캐릭터 이미지/` | `챗봇 제작/캐릭터 이미지/` |

> 추가 문제: `_run_censor_and_upload.sh`와 `_run_censor_v2.sh`는 `--workers`, `--threshold`, `--min-area` 등 **현행 auto_censor.py에 존재하지 않는 옵션**을 호출하고 있어, 경로를 고쳐도 실행 불가.

**접근 방식**:

**(1) Python 스크립트 경로 수정:**

```python
# 공통 패턴: PROJECT_ROOT 기준으로 파생
PROJECT_ROOT = Path(__file__).resolve().parent.parent     # 연예계/

# asset_generator.py (61행)
OUTPUT_BASE = PROJECT_ROOT.parent / "캐릭터 이미지"       # 챗봇 제작/캐릭터 이미지/

# auto_censor.py (62~63행)
BASE_DIR = PROJECT_ROOT.parent / "캐릭터 이미지"          # 챗봇 제작/캐릭터 이미지/
MODEL_PATH = PROJECT_ROOT / "models" / "ntd11_v5.pt"     # 연예계/models/ntd11_v5.pt
```

**(2) 경로 존재 검증 — I/O 실행 경로에서만 (지연 평가):**

`캐릭터 이미지/`는 git 미추적 로컬 자산이므로, `--status`/`--help`/`--dry-run` 같은 읽기 전용 명령에서 경로 검증 때문에 막히면 사용성이 나빠짐. 검증은 **실제 이미지 I/O가 필요한 경로에서만** 수행:

```python
# asset_generator.py — generate_batch() 진입 시 (not dry_run일 때만)
if not dry_run and not OUTPUT_BASE.exists():
    log.error(f"Image directory not found: {OUTPUT_BASE.resolve()}")
    sys.exit(1)

# auto_censor.py — process_single/process_batch 진입 시
if not BASE_DIR.exists():
    log.error(f"Image directory not found: {BASE_DIR.resolve()}")
    sys.exit(1)

# MODEL_PATH는 get_model() 내부에서 이미 체크됨 (1-7 zero-mask 상태 분리로 대응)
```

> `--status`, `--help`, `--coverage-test` 준비 단계에서는 검증하지 않음.

**(3) 배치 래퍼 스크립트 처리:**

`_run_censor_*.sh`는 gitignored 로컬 스크립트이며, 존재하지 않는 CLI 옵션을 호출 중. 두 가지 선택지:

- **A (권장): deprecated 처리** — 스크립트 상단에 경고 주석 + 현행 CLI 대체 명령 안내:
  ```bash
  # DEPRECATED: 이 스크립트는 더 이상 사용하지 않습니다.
  # 대체 명령:
  #   python tools/auto_censor.py --batch-all --style solid
  #   그 후 wrangler r2 upload 별도 실행
  ```
- **B: 현행 CLI에 맞게 재작성** — 경로 수정 + 존재하지 않는 옵션 제거 + wrangler 업로드 연동

> 긴급 대기열의 "검열 배치 실행"이 이 스크립트에 의존하므로, 최소한 deprecated 안내 + 대체 명령은 반드시 기록.

**변경 파일**:
- `tools/asset_generator.py` — OUTPUT_BASE 경로 (61행) + 존재 검증
- `tools/auto_censor.py` — BASE_DIR, MODEL_PATH 경로 (62~63행) + 존재 검증
- `tools/_run_censor_and_upload.sh` — deprecated 처리 또는 재작성
- `tools/_run_censor_v2.sh` — deprecated 처리 또는 재작성

**고려사항**:
- `PROJECT_ROOT` 패턴을 양 스크립트에서 통일하면, Phase 3-1(공유 utils)에서 상수로 추출 가능
- `.resolve()`로 OneDrive 가상 경로 대응
- 향후 `PRIMECITY_IMAGE_DIR` 환경변수 오버라이드는 Phase 3-4에서 함께 추가

**검증**: `python tools/auto_censor.py --help` + `python tools/asset_generator.py --status`가 경로 오류 없이 실행되는지 확인

---

## Phase 3: 코드 품질 (MEDIUM)

> 기능에 직접 영향 없지만, 유지보수성과 일관성을 개선.

---

### 3-1. 공유 유틸리티 추출 (`tools/utils.py`)

**목적**: `parse_scene_range()`, `ALL_CHARS`, `NSFW_SCENES`, `ALL_SCENES` 등 두 파일에 중복된 상수/함수를 단일 모듈로 통합한다.

**변경 파일**:
- **신규**: `tools/utils.py`
- **수정**: `tools/asset_generator.py`, `tools/auto_censor.py` — import 변경

**코드 스니펫**:
```python
# tools/utils.py (신규)
"""tools/ 공유 상수 및 유틸리티."""
from __future__ import annotations
import argparse

ALL_CHARS = [
    "SY", "NHR", "JSH", "ERK", "LSH", "HSR", "KHR",
    "JGR", "MIL", "ELA", "MMR", "HSE", "NIA", "RAY", "LPS",
]

ALL_SCENES = [
    *range(1, 10), *range(10, 19),
    *range(20, 43), *range(50, 68),
    *range(70, 79), *range(80, 87),
]

NSFW_SCENES = (
    list(range(20, 43)) + list(range(50, 68))
    + list(range(70, 79)) + list(range(80, 87))
)


def parse_scene_range(s: str) -> list[int]:
    """Parse '1-8' or '1,2,3' or '1-8,20-42' into sorted unique ints."""
    try:
        nums = []
        for part in s.split(","):
            if "-" in part:
                a, b = part.split("-", 1)
                nums.extend(range(int(a), int(b) + 1))
            else:
                nums.append(int(part))
        return sorted(set(nums))
    except ValueError as e:
        raise argparse.ArgumentTypeError(f"Invalid scene range '{s}': {e}") from e
```

**고려사항**:
- 두 스크립트 모두 `if __name__ == "__main__"` 패턴이라 직접 실행됨 → `from tools.utils import ...` 대신 상대 import 필요
- 스크립트를 `python tools/auto_censor.py`로 실행하면 패키지 import 실패 가능 → 해결: `sys.path` 조작 또는 `-m` 실행
- **가장 현실적인 방법**: 같은 디렉토리이므로 `from utils import ...`로 단순 import

**검증**: 두 스크립트 모두 `--help` 동작 확인

---

### 3-2. extract_config.py pathlib 통합

**목적**: `os.path` 사용을 `pathlib`로 통일하여 나머지 두 파일과 일관성을 맞춘다.

**변경 파일**:
- `tools/extract_config.py` — 전체 (`os.path.dirname` → `Path(__file__).parent` 등)

**코드 스니펫**:
```python
# Before
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(BASE_DIR, "docs")
OUT = os.path.join(BASE_DIR, "tools", "asset_config.json")
# ... os.path.exists(path) ... open(path, "r")

# After
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
DOCS = BASE_DIR / "docs"
OUT = BASE_DIR / "tools" / "asset_config.json"
# ... path.exists() ... path.open("r", encoding="utf-8")
```

**고려사항**: 순수 리팩터링. 동작 변경 없음.

---

### 3-3. 미사용 import 제거

**변경 파일**:
- `tools/asset_generator.py` — `import base64` 삭제 (32행)
- `import os`는 3-4(환경변수)에서 필요하므로 **유지**

---

### 3-4. 환경변수 토큰 + 이미지 경로 오버라이드

**목적**: `--token` CLI 인자 대신 환경변수를 지원하여 프로세스 목록 노출을 방지한다.

**변경 파일**:
- `tools/asset_generator.py` — `main()` 함수 (564~570행)

**우선순위 (확정)**: `--token` > `--token-file` > `NAI_TOKEN` 환경변수

**코드 스니펫**:
```python
# After — 우선순위: CLI > file > env
token = args.token
if not token and args.token_file:
    token = Path(args.token_file).read_text().strip()
if not token:
    token = os.environ.get("NAI_TOKEN")
```

**고려사항**:
- `import os`는 `os.environ.get()` 때문에 유지 (3-3에서 `base64`만 삭제)
- 향후 `PRIMECITY_IMAGE_DIR` 환경변수도 동일 패턴으로 추가 가능

---

### 3-5. naive datetime → UTC

**변경 파일**:
- `tools/asset_generator.py` — `save_state()` (100행), `generate_batch()` (367행)

**코드 스니펫**:
```python
# Before
from datetime import datetime
state["last_updated"] = datetime.now().isoformat()

# After
from datetime import datetime, timezone
state["last_updated"] = datetime.now(timezone.utc).isoformat()
```

**고려사항**: 기존 state.json의 타임스탬프와 포맷이 달라지지만(`+00:00` 접미사 추가), 문자열 비교만 하므로 영향 없음.

---

### 3-6. extract_config.py 로깅 추가

**목적**: `print()` 출력을 `logging` 모듈로 교체하여 파일 로깅과 일관성을 확보한다.

**변경 파일**:
- `tools/extract_config.py` — 전체 `print()` → `log.info()`/`log.warning()`

**고려사항**: 로그 파일 경로를 별도로 둘지, 기존 `generation.log`를 공유할지 결정 필요. 추출은 1회성이므로 stdout만 유지해도 무방 — 다만 WARNING 누락 방지를 위해 로깅 도입 권장.

---

### 3-7. generate_batch() 함수 분할

**목적**: cyclomatic complexity 18인 `generate_batch()`를 분리하여 테스트와 유지보수를 개선한다.

**변경 파일**:
- `tools/asset_generator.py` — `generate_batch()` → `_generate_one()` 추출

**코드 스니펫**:
```python
def _generate_one(token, config, state, char_code, scene_num, negative, dry_run, delay):
    """단일 이미지 생성 시도. 성공 시 True, 실패 시 False.
    AccountBannedError/AuthError/KeyboardInterrupt는 상위로 전파."""
    scene_key = str(scene_num)
    scene_name = config["scenes"][scene_key]["name"]
    base_prompt, female_cap, male_cap, w, h = build_prompt(config, char_code, scene_num)

    if dry_run:
        log.info(f"  DRY-RUN {char_code}/{scene_num} ({scene_name}) {w}x{h}")
        return True

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            log.info(f"  Generating {char_code}/{scene_num}.webp ({scene_name}) (attempt {attempt})")
            img = call_nai_api(token, base_prompt, female_cap, male_cap, negative, w, h)
            save_image(img, char_code, scene_num, config)
            mark_completed(state, char_code, scene_num)
            return True
        except RateLimitError:
            wait = min(DELAY_429_BASE * (2 ** (attempt - 1)), DELAY_429_MAX)
            log.warning(f"  429 Rate Limit. {wait}s wait...")
            time.sleep(wait)
        except (APIError, requests.RequestException) as e:
            log.error(f"  Attempt {attempt}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(30)
            else:
                mark_failed(state, char_code, scene_num, str(e))
                return False
    return False
```

**고려사항**:
- `AccountBannedError`, `AuthError`, `KeyboardInterrupt`는 `_generate_one()` 안에서 잡지 않고 상위로 전파
- `generate_batch()`는 루프 + 카운터 + 딜레이 + 요약만 담당하도록 단순화

---

## Phase 4: 타입 어노테이션 (MEDIUM)

> 기능 영향 없음. 단, IDE 지원과 정적 분석에 크게 기여.

---

### 4-1. 주요 public 함수에 타입 힌트 추가

**변경 파일**: 3개 전체

**코드 스니펫** (asset_generator.py 예시):
```python
def load_config() -> dict:
def load_state() -> dict:
def save_state(state: dict) -> None:
def mark_completed(state: dict, char_code: str, scene_num: int) -> None:
def mark_failed(state: dict, char_code: str, scene_num: int, reason: str) -> None:
def is_done(state: dict, char_code: str, scene_num: int) -> bool:
def build_prompt(config: dict, char_code: str, scene_num: int) -> tuple[str, str, str, int, int]:
def call_nai_api(token: str, ...) -> "Image.Image":
def save_image(img: "Image.Image", char_code: str, scene_num: int, config: dict | None = None) -> Path:
def generate_batch(token: str | None, config: dict, state: dict, ...) -> None:
def parse_scene_range(s: str) -> list[int]:
```

**고려사항**:
- `from __future__ import annotations` 사용 시 Python 3.10 미만에서도 `X | Y` 문법 사용 가능
- 완전한 타입 정의(TypedDict 등)보다는 기본 힌트만 추가하여 실용성 우선

---

## 구현 우선순위 요약

| 순서 | 항목 | Phase | 영향도 | 난이도 | 변경량 |
|---|---|---|---|---|---|
| 1 | ZIP 가드 + exception chaining | 1-1 | HIGH | 낮음 | ~6줄 |
| 2 | --retry-failed: 명시적 태스크 리스트 | 1-2 | HIGH | 중간 | ~25줄 |
| 3 | done + cooldown 카운터 분리 | 1-3 | HIGH | 중간 | ~15줄 |
| 4 | show_status: special scene 집계 | 1-4 | HIGH | 중간 | ~20줄 |
| 5 | mark_failed reason 저장 | 1-5 | HIGH | 중간 | ~20줄 (마이그레이션 포함) |
| 6 | 임시 파일 race condition | 1-6 | HIGH | 낮음 | ~6줄 |
| 7 | zero-mask 상태 분리 | 1-7 | HIGH | 중간 | ~15줄 |
| 8 | 원본 파일 보호 (atomic write) | 2-1 | HIGH | 낮음 | ~6줄 |
| 9 | 검열 커버리지 보강 + 검증 인프라 | 2-2 | HIGH | 중간 | ~25줄 + 검증 인프라 |
| 10 | 이미지/모델/배치스크립트 경로 통합 | 2-3 | HIGH | 중간 | ~15줄 + 래퍼 처리 |
| 11 | 공유 유틸리티 추출 | 3-1 | MEDIUM | 중간 | 신규 파일 + import 변경 |
| 12 | pathlib 통합 | 3-2 | MEDIUM | 낮음 | ~15줄 |
| 13 | 미사용 import 제거 | 3-3 | MEDIUM | 낮음 | 2줄 삭제 |
| 14 | 환경변수 토큰 + 이미지 경로 | 3-4 | MEDIUM | 낮음 | ~5줄 |
| 15 | UTC datetime | 3-5 | MEDIUM | 낮음 | 2줄 |
| 16 | extract_config 로깅 | 3-6 | MEDIUM | 낮음 | ~10줄 |
| 17 | generate_batch 분할 | 3-7 | MEDIUM | 중간 | ~50줄 리팩터링 |
| 18 | 타입 어노테이션 | 4-1 | MEDIUM | 낮음 | 시그니처만 |

**권장 배치**:
- **1차 커밋**: 1~10번 — 버그 수정 + 산출물 안전 (경로 복구 포함). 검열 커버리지는 테스트셋 검증 후.
- **2차 커밋**: 11~16번 — 코드 품질. 리팩터링이라 별도 커밋.
- **3차 커밋**: 17~18번 — 구조 개선 + 타입. 가장 큰 diff.

**검열 커버리지 검증 전제조건**:
- 사용자가 빈틈 확인된 샘플 5~10장을 `tools/test_samples/input/`에 배치
- 수정 전/후 결과를 `tools/test_samples/results/before/` 및 `after/`에 격리 저장
- 각 실행 산출물: preview (마스크 오버레이), mask (바이너리), stats.json (면적/검출 요약)
- 원본 `캐릭터 이미지/`를 직접 테스트해도 출력은 반드시 `test_samples/results/`로 강제 (원본 트리 오염 금지)
- 판정: 200% 확대 수동 검수에서 빈틈 0개 AND stats.json 면적 증가율 < 10%
- Step 3 crop vs Step 8 opening 비교: 각각 단독 수정 결과를 별도 서브디렉토리에 저장하여 원인 특정
