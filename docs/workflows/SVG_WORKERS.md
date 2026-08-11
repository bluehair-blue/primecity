# SVG Worker Workflow

Worker 본체는 `workers/svg-*.js`, 배포 기준은 `workers/deploy/deploy.sh`다. `workers/wrangler.svg.jsonc`를 명시하여 루트 Vite/사이트 설정의 자동 탐색을 차단한다. 배포 스크립트의 기본값은 dry-run이며 `REAL_DEPLOY=1`을 명시해야만 실제 배포한다.

| Worker | Route |
|---|---|
| `svg-insta` | `insta.bluehair.blue/*` |
| `svg-twit` | `twit.bluehair.blue/*` |
| `svg-live` | `live.bluehair.blue/*` |
| `svg-talk` | `talk.bluehair.blue/*` |
| `svg-news` | `news.bluehair.blue/*` |
| `svg-chart` | `chart.bluehair.blue/*` |
| `svg-community` | `community.bluehair.blue/*` |
| `svg-post` | `post.bluehair.blue/*` |
| `svg-tablet` | `tablet.bluehair.blue/*` |
| `svg-schedule` | `schedule.bluehair.blue/*` |

```bash
cd workers/deploy
bash -n deploy.sh
bash deploy.sh
REAL_DEPLOY=1 bash deploy.sh
```

이미지 포함 Worker는 외부 URL을 fetch한 뒤 data URI로 인라인해야 한다. 실제 배포 전 10개 JS의 `node --check`와 Wrangler dry-run 번들을 모두 통과시킨다. dry-run 결과의 업로드 크기가 각 SVG Worker 크기와 비슷해야 하며 사이트 전체 번들이 반복되면 config 격리가 실패한 것이다. 실배포 후 10개 공개 route에서 HTTP 200, `image/svg+xml`, 유효한 `<svg>` 루트, CORS `*`를 전수 확인하고 이미지 포함 6종은 모든 `<image href>`가 `data:image/`인지 확인한다.
