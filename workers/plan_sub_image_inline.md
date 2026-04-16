# SVG Worker 이미지 인라인화 계획

> **문제**: 에덴챗에서 SVG를 `<img>` 태그로 렌더링 → 브라우저 보안 정책이 SVG 내부 `<image href="https://...">` 외부 리소스 로딩 차단 → 엑박
> **브라우저 직접 접속**: SVG가 문서(document)로 로드되므로 정상 작동
> **해결**: Worker에서 이미지 fetch → base64 data URI 변환 → SVG에 인라인 삽입

---

## 영향 범위 (6개 워커, 8개 이미지 참조)

| 워커 | 파일 | 이미지 유형 | 개수 |
|---|---|---|---|
| svg-sns | svg-sns.js | avatar + post image | 2 |
| svg-tweet | svg-tweet.js | avatar | 1 |
| svg-livestream | svg-livestream.js | avatar + stream thumbnail | 2 |
| svg-messenger | svg-messenger.js | avatar | 1 |
| svg-news | svg-news.js | news image | 1 |
| svg-post | svg-post.js | post image | 1 |

**미영향**: svg-chart.js (이미지 없음), svg-tablet.js (이미지 없음), svg-community.js (확인 필요)

---

## 접근 방식

### 공용 함수 `fetchAsDataUri(url)`

각 워커에 동일한 헬퍼 함수 추가:

```js
async function fetchAsDataUri(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "image/webp";
    const buf = await res.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `data:${ct};base64,${b64}`;
  } catch (e) {
    return null;
  }
}
```

### `safeImageUrl` 업데이트 (필수)

data URI(`data:image/...;base64,...`)는 현재 `safeImageUrl`이 `http:`/`https:` 만 허용하므로 거부됨.
data URI prefix 통과 로직 추가:

```js
function safeImageUrl(url) {
  if (!url) return null;
  if (typeof url === "string" && url.startsWith("data:")) return url;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}
```

> `escapeXml`과 data URI 호환성: base64 인코딩은 `A-Za-z0-9+/=`만 사용하고
> prefix `data:image/webp;base64,`에도 XML 특수문자(`& < > " '`)가 없으므로 안전.

### 변경점

1. `safeImageUrl`에 data URI 통과 로직 추가 (6개 워커 공통)
2. `fetch()` 핸들러에서 이미지 URL 선해석 → `fetchAsDataUri()` → `p.image`/`p.avatar`에 주입
3. generate 함수는 수정 없음 (주입된 data URI를 그대로 사용)
4. 실패 시 이미지 섹션 자체를 생략 (빈 엑박보다 나음 — 기존 fallback 로직 유지)

### 워커별 변경 상세

#### svg-sns.js
```
Before: avatarUrl = assets.avatar, imageUrl = assets.post
After:  avatarDataUri = await fetchAsDataUri(avatarUrl)
        imageDataUri  = await fetchAsDataUri(imageUrl)
        → <image href="${avatarDataUri}"> / <image href="${imageDataUri}">
```

#### svg-tweet.js
```
avatarDataUri = await fetchAsDataUri(avatarUrl)
```

#### svg-livestream.js
```
avatarDataUri = await fetchAsDataUri(avatarUrl)
imageDataUri  = await fetchAsDataUri(imageUrl)   // stream thumbnail
```

#### svg-messenger.js
```
avatarDataUri = await fetchAsDataUri(avatarUrl)
```

#### svg-news.js
```
imageDataUri = await fetchAsDataUri(imageUrl)
```

#### svg-post.js
```
imageDataUri = await fetchAsDataUri(imageUrl)
```

---

## 성능 고려사항

| 항목 | 분석 |
|---|---|
| 이미지 크기 | avatar ~5-15KB, post/stream ~50-150KB webp |
| base64 오버헤드 | +33% (150KB → 200KB) |
| SVG 응답 크기 | 현재 ~5KB → 최대 ~210KB (이미지 포함 시) |
| fetch 지연 | CDN이 같은 CF 네트워크 → 수십ms 수준 |
| Worker CPU | fetch I/O는 CPU 시간에 미포함 (CF 정책) |
| 캐시 | SVG 응답에 이미 `Cache-Control: max-age=604800` → 첫 요청만 fetch 발생 |

**결론**: 성능 영향 미미. CF 내부 네트워크 fetch + CDN 캐싱으로 체감 차이 없음.

---

## btoa 대안: CF Workers 환경

CF Workers에서 큰 이미지의 `btoa(String.fromCharCode(...spread))` 는 스택 오버플로 위험.
안전한 청크 방식:

```js
async function fetchAsDataUri(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "image/webp";
    const buf = new Uint8Array(await res.arrayBuffer());
    // chunk to avoid stack overflow on large images
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    return `data:${ct};base64,${btoa(binary)}`;
  } catch (e) {
    return null;
  }
}
```

---

## 구현 순서

1. svg-post.js 먼저 수정 (사용자 현재 열람 중 + 이미지 1개로 단순)
2. 에덴챗에서 테스트 확인
3. 나머지 5개 워커 일괄 적용
4. 전체 배포 (`deploy.sh`)

---

## 체크리스트

- [x] `fetchAsDataUri` 함수 6개 워커에 추가
- [x] `safeImageUrl` data URI 통과 로직 추가 (6개 워커)
- [x] 각 워커 `fetch()` 핸들러에서 이미지 URL → data URI 변환
- [x] 커밋 `c2eba1c` + 푸시 완료
- [x] 6개 워커 wrangler deploy 완료 (2026-04-14)
- [ ] 에덴챗 실제 테스트 확인 (사용자)

---

## 신규 SVG 워커 작성 시 파이프라인

**이미지를 포함하는 SVG 워커**는 반드시 아래 패턴을 적용할 것:

1. `safeImageUrl`에 `data:` prefix 통과 로직 포함
2. `fetchAsDataUri(url)` 헬퍼 포함 (청크 방식 btoa)
3. `fetch()` 핸들러에서 이미지 URL 선해석 → data URI 변환 → `p` 객체에 주입
4. generate 함수는 수정 불필요 (data URI를 일반 URL처럼 사용)

**이유**: 에덴챗 등 외부 플랫폼이 SVG를 `<img>` 태그로 렌더링하면 브라우저가 SVG 내부 외부 리소스를 차단함.
이미지가 없는 워커(chart, tablet, community)는 적용 불필요.
