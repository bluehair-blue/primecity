<!-- Generated: 2026-04-11 | Files scanned: 8 Workers + 5 Python tools | Token estimate: ~700 -->

# Prime City — Backend / Workers / Tools

## SVG Workers (workers/*.js)

각 Worker는 `*.bluehair.blue`에 배포된 Cloudflare Worker입니다.
공통 패턴: URL 파라미터 파싱 → `escapeXml()` 적용 → SVG 문자열 반환

| Worker | 도메인 | 용도 | LOC |
|--------|--------|------|-----|
| svg-tablet.js | tablet.bluehair.blue | 오디션 심사 태블릿 UI | 494 |
| svg-community.js | community.bluehair.blue | 커뮤니티 게시판 | 164 |
| svg-livestream.js | livestream.bluehair.blue | 라이브스트림 UI | 117 |
| svg-sns.js | sns.bluehair.blue | SNS 카드 | 102 |
| svg-messenger.js | messenger.bluehair.blue | 메신저 UI | 90 |
| svg-tweet.js | tweet.bluehair.blue | 트윗 카드 | 81 |
| svg-news.js | news.bluehair.blue | 뉴스 카드 | 78 |
| svg-chart.js | chart.bluehair.blue | 차트 UI | 66 |

### 보안 규칙
- 마크업 조합 변수 → raw `${}`
- 리프 텍스트(URL param) → `escapeXml()` 필수
- SYNC 주석: `src/data/svgTemplates.js`와 로직 동기화 유지

## Python 이미지 파이프라인 (tools/)

```
extract_config.py    NAIS2 백업 → asset_config.json 추출
       ↓
asset_generator.py   asset_config.json → NAI API 호출 → char_img/{CHAR}/{N}.webp
       ↓
auto_censor.py       char_img/ → YOLOv11s-seg 감지 → 검열 마스크 → 덮어쓰기
       ↓
wrangler r2 upload   char_img/ → R2 prime/ent/  (수동, ASSET_VERSION++)
```

## asset_generator.py 핵심 함수

```
load_config()          → asset_config.json 로드
load_state()           → generation_state.json (재개용 진행 상태)
save_state()           → atomic tmp→rename 쓰기 (Ctrl+C 안전)
build_prompt()         → (base, female_caption, male_caption, w, h) | None
call_nai_api()         → PIL.Image (ZIP 언패킹)
_generate_one()        → 재시도 3회, RateLimit 지수 백오프
generate_batch()       → 배치 루프, 10장마다 쿨다운
show_status()          → 진행률 바 출력
```

## auto_censor.py 마스크 파이프라인

```
load_image() → yolo_detect() → refine_segmentation_mask()
                                  1. threshold
                                  2. ROI 제한
                                  3. force crop (class별 최대 크기)
                                  4. morphological close
                                  5. flood fill holes
                                  6. best component
                                  7. convex hull fill
                                  8. light open + safety dilate
                                  8.6. ROI re-clamp
                                  9. final flood fill
              → apply_censor() → atomic save
```

## edenchat_clipboard.py

```
collect_lorebooks() → JSON 파싱 + 우선순위 정렬 (메인→캐릭터→오디션→모드→구역→SVG→이미지)
run_pipeline()      → pyautogui Tab/Enter 시뮬레이션
  제목 → Tab×3 → 본문 → Tab×1 → 키워드(Enter 구분) → Tab×3 → Enter(저장)
```

## 로어북 구조 (docs/prompts/json/)

```
메인_프롬프트_EN.json            상시 로드 (1개)
캐릭터/    {이름}_EN.json         캐릭터 본체 (14개)
캐릭터/    {이름}_트리거_EN.json  트리거 전용 (14개)
캐릭터/    {이름}_{심화|초기|과거|위기}_EN.json  호감도별
오디션/    {1-4R + 막간}_EN.json  오디션 라운드 (11개)
모드/      {모드명}_EN.json       게임모드 (13개)
나하린_*.json                     특수 캐릭터
SVG_*.json / 구역_*.json / 이미지_NSFW_EN.json
총 103개 로어북 → Eden Chat 삽입 완료
```
