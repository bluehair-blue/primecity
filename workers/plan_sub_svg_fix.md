# workers/ — SVG 긴급 개편 계획 (v2: 드리프트 정정판)

> **대상**: 8개 SVG Workers 중 6개 (chart · tablet 제외) + `src/data/svgTemplates.js` mirror
> **증상**: 챗봇에서 "이미지가 SVG 내에 삽입되어야 하는데 이미지만 덜렁 나온다"
> **목표**: Worker ↔ mirror ↔ lorebook 간 **계약 드리프트 해소** + escape contract 전면 적용
> **전제**: 기존 `workers/plan_sub.md` (태블릿 전용)와 병행. ESCAPE CONTRACT 규약 승계.
> **v1 → v2 변경 사유**: v1 은 "풀 URL → 심볼로 전환" 이라는 잘못된 프레임으로 출발했음. 실제로는 **로어북과 mirror 가 이미 `char=` 계약을 쓰고 있고, 워커만 이를 지원하지 않는 상태**. 새로운 심볼 스킴을 발명할 필요 없이 **현존 계약을 워커에 이식**하면 충분함.

---

## 0. 근본 원인 — 계약 드리프트

세 계층의 현재 상태를 교차 확인한 결과:

| 계층 | `char=` 계약 지원 | escape 적용 | 상태 |
|---|---|---|---|
| **JSON 로어북** (news, insta, twit, live, talk) | ✅ 정식 양식으로 안내 | — | OK |
| **svgTemplates.js mirror** | ✅ `charAssets(p.char)` 구현 + `p.avatar`/`p.image` fallback | ⚠️ leaf text 전반 raw (drift) | **부분 버그** |
| **Workers** (6개) | ❌ `p.char` 파싱 자체가 없음 | ⚠️ 마크업 조각에 `escapeXml` 과잉 (drift) | **양방향 버그** |

### 실증 — 현재 계약 상태

**로어북이 챗봇에게 시키는 것** ([docs/prompts/json/SVG_뉴스_EN.json:12](docs/prompts/json/SVG_뉴스_EN.json#L12)):

```text
![](https://news.bluehair.blue/ent/?char=SY&channel=PRIME%20NEWS&headline=...)
```

**mirror 가 이를 처리하는 방법** ([src/data/svgTemplates.js:325-337](src/data/svgTemplates.js#L325-L337)):

```javascript
const assets = charAssets(p.char);                          // ← char 자동 매핑
const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.news);  // ← image 우선, 없으면 char 자산
```

**Worker 가 이를 처리하는 방법** ([workers/svg-news.js:21](workers/svg-news.js#L21)):

```javascript
const imageUrl = safeImageUrl(p.image);   // ← p.char 무시. image 없으면 그냥 빈 이미지
```

**결과**: 챗봇이 로어북 지침대로 `char=SY` 만 넘기면 워커는 **이미지 영역을 비워놓고 렌더**. 기존 이중 이스케이프 버그와 겹쳐서 "SVG 프레임만 있고 캐릭 이미지는 별도로 마크다운에서 떨어져 나온 것처럼" 관찰됨.

**실증 — 자산 존재 샘플링** (2026-04-12 플래닝 세션 중 런타임 HEAD 요청, **SY 1종만 직접 확인**):

```text
https://img.bluehair.blue/ent/SY/svg/avatar.webp  → 200 OK
https://img.bluehair.blue/ent/SY/svg/post.webp    → 200 OK
https://img.bluehair.blue/ent/SY/svg/news.webp    → 200 OK
https://img.bluehair.blue/ent/SY/svg/stream.webp  → 200 OK
```

> ⚠️ 이 샘플만으로 **15명 전원 자산 완비를 보장할 수 없다**. 로컬 `char_img/*/svg/` 구조도 균일하지 않음. 실제 배포 전 Phase B 검증 단계(§7.1)에서 **SY 외 최소 1~2종 추가 샘플링** 을 반드시 수행한다. 만약 누락이 발견되면 Phase B 착수 전 R2 업로드가 선행돼야 한다 (별개 tool 작업).

다만 **mirror 의 `charAssets()` 경로를 워커가 그대로 채용**하는 방향 자체는 변하지 않는다 — 사이트 `/svg` 프리뷰가 현재 정상 렌더되고 있다는 사실이 "경로 체계는 올바르다" 는 약한 보장을 제공. 누락 캐릭은 런타임에 `<image>` 렌더 실패 → fallback 이니셜 박스로 자동 격하.

---

## 1. 결함 분류

### Defect A — Escape Contract 드리프트

기존 `workers/plan_sub.md` §0 에서 정의된 규약:

```text
마크업 조합 변수 (joinedRows, avatarSvg, imageSvg 등)  → raw 삽입:     ${변수}
리프 텍스트  (URL 파라미터에서 온 사용자 입력)         → escapeXml(): ${escapeXml(값)}
```

**분포**:

- **A-1. 이중 이스케이프** (마크업에 escapeXml 과잉): 6 워커 · 11건 (§2.1)
- **A-2. 누락 이스케이프** (leaf text raw): 6 워커 · 8건 + mirror 전 함수 (§2.2)

### Defect B — Char Contract 드리프트

**6개 워커 중 5개** (news, sns, tweet, livestream, messenger) 가 `p.char` 미지원. community 는 별도 이슈(§3.3).

---

## 2. Escape Contract 수정 (Defect A)

### 2.1. 이중 이스케이프 — 11건

| # | 워커 | 라인 | Before | After |
|---|---|---|---|---|
| 1 | svg-community.js | L83 | `${escapeXml(commentTag)}` | `${commentTag}` |
| 2 | svg-community.js | L83 | `${escapeXml(imgTag)}` | `${imgTag}` |
| 3 | svg-community.js | L132 | `${escapeXml(rows)}` | `${rows}` |
| 4 | svg-community.js | L140 | `${escapeXml(paginationItems)}` | `${paginationItems}` |
| 5 | svg-news.js | L43 | `${escapeXml(newsImageSvg)}` | `${newsImageSvg}` |
| 6 | svg-messenger.js | L34 | `${escapeXml(avatarSvg)}` | `${avatarSvg}` |
| 7 | svg-tweet.js | L45 | `${escapeXml(avatarSvg)}` | `${avatarSvg}` |
| 8 | svg-livestream.js | L40 | `${escapeXml(streamImageSvg)}` | `${streamImageSvg}` |
| 9 | svg-livestream.js | L51 | `${escapeXml(avatarSvg)}` | `${avatarSvg}` |
| 10 | svg-sns.js | L39 | `${escapeXml(avatarSvg)}` | `${avatarSvg}` |
| 11 | svg-sns.js | L46 | `${escapeXml(imageSvg)}` | `${imageSvg}` |

### 2.2. 누락 이스케이프 — 8건 (worker) + mirror 전수

**Worker 측**:

| # | 워커 | 라인 | Before | After |
|---|---|---|---|---|
| 1 | svg-news.js | L45 | `${headline.substring(0,30)}` | `${escapeXml(headline.substring(0,30))}` |
| 2 | svg-news.js | L46 | `${headline.substring(30,60)}` | `${escapeXml(headline.substring(30,60))}` |
| 3 | svg-news.js | L48 | `${sub.substring(0,42)}` | `${escapeXml(sub.substring(0,42))}` |
| 4 | svg-messenger.js | L27 | `${contact[0]}` | `${escapeXml(contact[0] \|\| "?")}` |
| 5 | svg-tweet.js | L40 | `${name[0]}` | `${escapeXml(name[0] \|\| "?")}` |
| 6 | svg-livestream.js | L29 | `${streamer[0]}` | `${escapeXml(streamer[0] \|\| "?")}` |
| 7 | svg-livestream.js | L56 | `${title.substring(0, 45)}` | `${escapeXml(title.substring(0, 45))}` |
| 8 | svg-sns.js | L28 | `${username[0].toUpperCase()}` | `${escapeXml((username[0] \|\| "?").toUpperCase())}` |

**Mirror 측** (`src/data/svgTemplates.js`) — Copilot 피드백 #6 대로 헬퍼는 이미 존재 ([L5-L7](src/data/svgTemplates.js#L5-L7)). 다만 `generate*()` 함수들이 leaf text 에 적용을 누락하고 있어 worker 와 드리프트. 확인된 지점:

- `generateSnsPost` L66-67, 99, 102-103, 106, 108 (username · location · likes · caption · comments · time)
- `generateTweet` L149-150 (name · handle) + content word wrap + retweets/likes/time (전수)
- `generateNews` L343, L348, L357-358, L360, L362, L368 (channel · time · headline · sub · reporter · ticker)
- `generateCommunity` L493-494 (numLabel · truncTitle) + 기타
- `generateMessenger`, `generateLivestream` — **전수 점검 필요** (1506줄 파일, 실제 수정 시 각 함수 꼼꼼히)

> Phase A 구현 시 `git grep '\${' src/data/svgTemplates.js | grep -v escapeXml` 로 raw 삽입 지점을 전수 도출한 뒤, 리프 텍스트만 골라 escapeXml 로 감싼다.

### 2.3. 상단 계약 주석 추가

svg-tablet.js 에만 있는 주석을 나머지 6개 워커 상단에도 복제:

```javascript
// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```

mirror 는 이미 L2 에 동일 주석 존재.

---

## 3. Char Contract Port (Defect B)

### 3.1. 핵심 변경 — `charAssets` 를 워커에 이식

mirror 의 [charAssets()](src/data/svgTemplates.js#L18-L26) 를 5개 이미지 워커에 **그대로 복제**. 경로·슬롯명·자산 매핑 모두 mirror 와 동일하게 유지 — preview 와 live 렌더가 절대 어긋나지 않도록.

**공통 헬퍼** (news/sns/tweet/livestream/messenger 파일 상단에 각자 선언):

```javascript
// ── CDN asset mapping (mirrors src/data/svgTemplates.js charAssets) ──
const SVG_CDN = "https://img.bluehair.blue/ent";
function charAssets(code) {
  if (!code) return {};
  return {
    avatar: `${SVG_CDN}/${code}/svg/avatar.webp`,
    post:   `${SVG_CDN}/${code}/svg/post.webp`,
    stream: `${SVG_CDN}/${code}/svg/stream.webp`,
    news:   `${SVG_CDN}/${code}/svg/news.webp`,
  };
}
```

**화이트리스트가 필요한가?** — 현재 mirror 도 화이트리스트가 없음(임의 code 받아서 URL 만 만들고 끝). 워커도 **동일하게 유지**: 존재하지 않는 code 가 들어오면 R2 가 404 반환 → `<image>` 가 렌더 실패 → 브라우저가 빈 박스 표시. 이는 기존 동작과 일치하므로 **추가 검증 로직 불필요**. yak shave 방지.

> Copilot 피드백 #3 (padStart) 은 이 방향에서 **무효**가 됩니다 — 우리는 숫자 슬롯을 다루지 않음. `/svg/{avatar,post,stream,news}.webp` 네 개 고정 슬롯만 사용.

### 3.2. 워커별 Before/After 스니펫

#### (a) svg-news.js

```javascript
// ── BEFORE ──
const imageUrl = safeImageUrl(p.image);

// ── AFTER ──
const assets = charAssets(p.char);
const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.news);
```

`safeImageUrl` 은 **유지** — `p.image` 로 풀 URL 을 직접 받는 경로도 계속 허용 (mirror 와 동일, 로어북 "avatar/image 직접 지정도 가능" 문구 유효).

#### (b) svg-sns.js

```javascript
// ── BEFORE ──
const avatarUrl = safeImageUrl(p.avatar);
const imageUrl = safeImageUrl(p.image);

// ── AFTER ──
const assets = charAssets(p.char);
const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
const imageUrl  = safeImageUrl(p.image)  || safeImageUrl(assets.post);
```

#### (c) svg-tweet.js

```javascript
// ── BEFORE ──
const avatarUrl = safeImageUrl(p.avatar);

// ── AFTER ──
const assets = charAssets(p.char);
const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
```

#### (d) svg-livestream.js

```javascript
// ── BEFORE ──
const avatarUrl = safeImageUrl(p.avatar);
const imageUrl = safeImageUrl(p.image);

// ── AFTER ──
const assets = charAssets(p.char);
const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
const imageUrl  = safeImageUrl(p.image)  || safeImageUrl(assets.stream);
```

#### (e) svg-messenger.js

```javascript
// ── BEFORE ──
const avatarUrl = safeImageUrl(p.avatar);

// ── AFTER ──
const assets = charAssets(p.char);
const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
```

### 3.3. svg-community.js — `p.char` **이번 범위 제외**

Copilot 피드백 #4 가 지적한 대로:
- 현재 로어북은 `post1~post5` 만 공개, 워커·mirror 는 **내부적으로 12행 수용** (또 다른 드리프트지만 무해)
- 이번 범위에서는 **public 계약을 건드리지 않는다**
- 행별 아바타 지원·이미지 임베딩 추가 여부는 **별개 세션의 기획 주제**로 분리 (이 plan 의 §6 미결 사항 1)

**이번에 할 것**: escape 버그 4건(§2.1 #1~4)만 수정. 레이아웃·파라미터·maxLen·제목 x 좌표 **불변**.

### 3.4. svg-chart.js · svg-tablet.js — 변경 없음

- svg-chart.js: 클린 (이미지 없음, 모든 leaf escape 정상)
- svg-tablet.js: ESCAPE CONTRACT 이미 적용 완료 (`// ESCAPE CONTRACT:` 주석 L1 존재)

---

## 4. JSON 로어북 — 변경 없음

**모든 이미지 SVG 로어북 5개** (news/insta/twit/live/talk) 는 이미 `char={캐릭터코드}` 를 정식 양식으로 안내 중. `grep char= docs/prompts/json/SVG_*_EN.json` 으로 전수 확인 완료:

```text
SVG_뉴스_EN.json   ✓
SVG_SNS_EN.json    ✓
SVG_메신저_EN.json ✓
SVG_라이브_EN.json ✓
SVG_트윗_EN.json   ✓
```

**기능상 변경 불필요** — 워커가 계약을 따라잡는 것만으로 이번 버그 해결에 충분.

### 4.1. 잔존 문구 드리프트 (Phase C 이월, 수정 안 함)

기능적으로는 무변경이지만 **라벨 설명 bullet 수준의 드리프트**가 남아 있음을 기록:

| 파일                                              | 양식/예시       | 라벨 설명 bullet                           |
| ------------------------------------------------- | --------------- | ------------------------------------------ |
| `SVG_뉴스_EN.json`                                | `char=` 사용    | `char` 설명 존재 (OK)                      |
| `SVG_SNS_EN.json`                                 | `char=` 사용    | `char` 설명 존재 (OK)                      |
| `SVG_라이브_EN.json`                              | `char=` 사용    | `avatar/image 직접 지정` 중심, `char` 흐릿 |
| `SVG_메신저_EN.json`                              | `char=` 사용    | `avatar` 중심, `char` 흐릿                 |
| `SVG_트윗_EN.json`                                | 확인 필요       | 확인 필요                                  |
| `src/data/svgTemplates.js` `promptExample` 필드들 | 대응 양식 혼재  | 동일 드리프트 가능                         |

- 이번 작업(Phase A/B)은 **워커 기능 복구**가 목표이므로 문구 수정은 범위 밖.
- 단, 이 drift 가 존재하면 향후 LLM 이 `char=` 를 발명적으로 해석하지 않고 `avatar/image` 로 퇴행할 위험 존재.
- **Phase C 후보**: 로어북 라벨 설명 bullet 을 양식/예시와 일치시키는 문서 감사. 별도 세션에서 수동 검토 필요 (grep 으로 안 잡히는 종류의 드리프트).

> 이 절은 **현 버그와 무관**하지만, "완전히 정렬됨"으로 오해하지 않도록 남겨둠. 기능 승인에는 영향 없음.

**예외**: `SVG_커뮤니티_EN.json` 은 현재도 이미지 파라미터 없음 — 이번 범위 제외 (§3.3).

`_combined/SVG_프롬프트_EN.json` 도 파생 산출물이므로 손대지 않음.

---

## 5. 단계별 롤아웃

### Phase A — Escape Hotfix (즉시, 렌더 정상화)

**목표**: "렌더 자체가 깨지는" 증상만 먼저 제거. `char=` 포트는 Phase B.

**체크리스트** (worker 채널 + site 채널 **둘 다** 배포 필수 — mirror 수정이 포함돼 있으므로):

- [ ] 6개 워커의 11건 이중이스케이프 수정 (§2.1)
- [ ] 6개 워커의 8건 누락이스케이프 수정 (§2.2 상단)
- [ ] 6개 워커 상단에 ESCAPE CONTRACT 주석 추가 (§2.3)
- [ ] `src/data/svgTemplates.js` leaf text 전수 escape 적용 (§2.2 하단)
- [ ] `npm run build` 통과
- [ ] **Worker 채널 배포**: `bash workers/deploy/deploy.sh` 실행 (Git Bash / WSL)
- [ ] 6개 URL 로컬 curl 검증 (§7.1)
- [ ] 커밋: `Fix SVG worker escape contract drift (6 workers + mirror)`
- [ ] **Site 채널 배포**: `git push origin main` → Cloudflare Pages 자동 배포 대기 (CLAUDE.md §배포)
- [ ] Pages 반영 확인: `https://intro.bluehair.blue/svg` 접속 → 프리뷰 정상 (§7.2)

> ⚠️ worker 채널과 site 채널은 **완전히 분리된 배포 경로**. `deploy.sh` 는 사이트를 배포하지 않고, `git push` 는 워커를 배포하지 않음. 한쪽만 하면 drift 유발.

**소요**: 45~60분 + Pages 빌드 대기 2~5분
**리스크**: 낮음. 동작 로직 불변. 문자 치환만.

### Phase B — Char Contract Port

**목표**: 5개 워커가 `p.char` 를 인식하도록 현존 mirror 계약 이식.

**체크리스트** (Phase B 는 워커만 건드림 — site 채널 배포 불필요):

- [ ] news/sns/tweet/livestream/messenger 5개 워커에 `charAssets()` 복제 (§3.1)
- [ ] 5개 워커의 `avatarUrl` / `imageUrl` 계산식을 mirror 패턴으로 교체 (§3.2 a~e)
- [ ] `safeImageUrl` 함수는 **유지** (풀 URL 직접 경로 호환)
- [ ] **Worker 채널 재배포**: `bash workers/deploy/deploy.sh`
- [ ] 5개 URL 에 대해 `?char=SY` curl 검증 (§7.1)
- [ ] **추가 샘플링**: `?char=JSH`, `?char=ELA` 등 최소 2종 더 curl 검증 (§0 경고 대응)
- [ ] 에덴챗 실전 테스트 (§7.3)
- [ ] 커밋: `Port char= contract from mirror to 5 SVG workers`
- [ ] `git push origin main` (mirror 는 Phase A 에서 이미 배포됐지만 커밋 연속성을 위해 push)

> Phase B 는 mirror(svgTemplates.js) 를 건드리지 않음 — 이미 올바른 구현이 있기 때문. 따라서 Pages 배포는 필수는 아니지만, 커밋 이력 정합성을 위해 push 는 수행.

**소요**: 60~90분
**리스크**: 낮음. mirror 에서 이미 검증된 코드를 복제. 기존 `p.avatar`/`p.image` 경로도 유지되므로 호환성 hard break 없음.

### Phase C — 후속 고려사항 (이번 범위 제외)

- svg-community 행별 아바타 지원 (§6-1)
- 신규 자산 슬롯 (`thumbnail`, `key`, `sign`) 도입 — preview 비주얼 영향 있음 (§6-3)
- `post1~post5` public 범위 vs `post1~post12` 내부 수용 정리 (§6-2)
- mirror 의 `charAssets` 을 `src/data/characters.js` 에서 파생할지 (§6-4)

---

## 6. 미결 사항 (사용자 판단)

1. **svg-community 이미지 지원** — 지금은 기획만이라도 넣을지, 아니면 Phase C 로 완전 분리할지? (v1 에서는 "12행 avatar 신규 추가" 로 잡았으나, Copilot #4 지적대로 public 계약 확장 여부를 먼저 결정해야 함)
2. **community 의 `post6~post12` 내부 수용** — 로어북을 12행까지 공개로 넓힐지, 워커/미러를 5행으로 좁힐지, 아니면 현 상태(비공개 확장) 유지할지?
3. **신규 자산 슬롯** — `thumbnail.webp` / `key.webp` / `sign.webp` 등 "표준 캐릭 자산" 을 SVG 에서도 쓰고 싶은지? 쓰려면 mirror 의 `charAssets` 스키마 확장 + R2 신규 업로드 + 워커 공통 갱신이 모두 필요. 이번 작업 범위 밖 권장.
4. **`src/data/characters.js` 와 `charAssets` 통합** — 현재 `characters.js` 는 `thumbnail/profile/sign/key` 슬롯만 알고, `charAssets` 는 `avatar/post/stream/news` 라는 별개 슬롯을 씀 (Copilot #7 지적). 통합은 mirror 리팩토링 이슈로 분리.

**이 4가지 모두 "이번 Phase A + B 범위 밖" 으로 권장** — 현재 버그만 깔끔히 잡고, 확장 논의는 별도 세션에서.

---

## 7. 검증

### 7.1. 로컬 curl 스모크 (Git Bash / WSL 기준)

> Copilot 피드백 #8 대응: Windows 네이티브 환경이므로 `/tmp` 대신 `C:/tmp` 또는 `%TEMP%` 사용. `xmllint` 없으면 브라우저 렌더로 대체.

**Phase A 검증** (escape 만) — 모든 워커 기본 파라미터로:

```bash
mkdir -p /c/tmp/svg
curl "https://community.bluehair.blue/ent/?board=테스트"               -o /c/tmp/svg/community.svg
curl "https://news.bluehair.blue/ent/?headline=속보"                   -o /c/tmp/svg/news.svg
curl "https://talk.bluehair.blue/ent/?contact=이서하"                  -o /c/tmp/svg/talk.svg
curl "https://twit.bluehair.blue/ent/?name=나하린"                     -o /c/tmp/svg/twit.svg
curl "https://live.bluehair.blue/ent/?streamer=강하람"                 -o /c/tmp/svg/live.svg
curl "https://insta.bluehair.blue/ent/?username=seoyun"                -o /c/tmp/svg/insta.svg
```

검증 포인트:

- [ ] 6개 파일 모두 `<svg ...>...</svg>` 로 끝남 (프레임 존재)
- [ ] `grep -l '&lt;g' /c/tmp/svg/*.svg` → **아무 것도 매치 안 함** (이중이스케이프 잔존 없음)
- [ ] 각 파일 크기가 500 bytes 이상 (빈 SVG 아님)

**Phase B 검증** (`char=` 포트) — 5개 이미지 워커에 `char=SY`:

```bash
curl "https://news.bluehair.blue/ent/?char=SY&headline=속보"           -o /c/tmp/svg/news-char.svg
curl "https://talk.bluehair.blue/ent/?char=SY&contact=이서하"          -o /c/tmp/svg/talk-char.svg
curl "https://twit.bluehair.blue/ent/?char=SY&name=나하린"             -o /c/tmp/svg/twit-char.svg
curl "https://live.bluehair.blue/ent/?char=SY&streamer=강하람"         -o /c/tmp/svg/live-char.svg
curl "https://insta.bluehair.blue/ent/?char=SY&username=seoyun"        -o /c/tmp/svg/insta-char.svg
```

검증 포인트:

- [ ] 5개 파일 모두 `<image href="https://img.bluehair.blue/ent/SY/svg/...webp"` 를 포함 (grep)
- [ ] 브라우저(Chrome)에 파일 드래그 → 실제 SY 이미지가 자리에 박혀 렌더

### 7.2. 사이트 프리뷰 회귀 (mirror 전용)

> **범위 한정**: 이 절은 **mirror 회귀 확인용**. Worker `char=` 포트나 실제 이미지 임베딩 동작 검증은 **§7.1 direct worker URL 이 주**. 7.2 는 mirror 수정이 SvgIntro 페이지를 깨지지 않았다는 것만 확인.

- `http://localhost:5173/svg` (개발) 또는 `https://intro.bluehair.blue/svg` (배포) 의 SvgIntro 페이지 접속
- **기본 샘플 파라미터 기준**에서 시각 변화 없음 확인 (sampleParams 로 렌더되는 프리뷰)
- 특수문자(`<`, `&`, `"`) 를 포함한 파라미터는 leaf escape 적용 후 의도적으로 출력이 달라질 수 있음 — 이건 버그가 아니라 수정 결과. 회귀 판단 시 기본 샘플만 기준으로 삼을 것.
- 확인 포인트:
  - [ ] 6종 프리뷰가 전부 로드됨 (빈 박스 없음)
  - [ ] 기본 파라미터에서 시각 변화 없음
  - [ ] 콘솔에 `Uncaught SyntaxError` / `Invalid SVG` 류 에러 없음

### 7.3. 에덴챗 엔드투엔드

각 SVG 타입별 트리거 1건씩 (로어북 재삽입 **불필요** — JSON 변경 없음):

- [ ] news: 속보 장면
- [ ] talk: 메신저 대화 장면
- [ ] twit: 트윗 장면
- [ ] live: 라이브 방송 장면
- [ ] insta: SNS 포스트 장면
- [ ] community: 갤러리 반응 장면 (escape 수정만 검증)

---

## 8. 배포

Copilot 피드백 #9 대응 — 실제 배포 경로 확인 완료:

```bash
cd workers/deploy
bash deploy.sh
```

이 한 줄이 8개 워커 전부를 배포. [deploy.sh](workers/deploy/deploy.sh) 내부:

```bash
WORKERS[svg-news]="svg-news.js"
WORKERS[svg-insta]="svg-sns.js"
WORKERS[svg-twit]="svg-tweet.js"
WORKERS[svg-live]="svg-livestream.js"
WORKERS[svg-talk]="svg-messenger.js"
WORKERS[svg-community]="svg-community.js"
WORKERS[svg-chart]="svg-chart.js"
WORKERS[svg-tablet]="svg-tablet.js"

for NAME in "${!WORKERS[@]}"; do
  npx wrangler deploy "$WORKERS_DIR/${WORKERS[$NAME]}" --name "$NAME" --compatibility-date "2024-01-01"
done
```

**라우트 ↔ 파일 매핑** (혼동 방지용):

| 서브도메인              | 워커 이름     | 파일              |
| ----------------------- | ------------- | ----------------- |
| news.bluehair.blue      | svg-news      | svg-news.js       |
| insta.bluehair.blue     | svg-insta     | svg-sns.js        |
| twit.bluehair.blue      | svg-twit      | svg-tweet.js      |
| live.bluehair.blue      | svg-live      | svg-livestream.js |
| talk.bluehair.blue      | svg-talk      | svg-messenger.js  |
| community.bluehair.blue | svg-community | svg-community.js  |
| chart.bluehair.blue     | svg-chart     | svg-chart.js      |
| tablet.bluehair.blue    | svg-tablet    | svg-tablet.js     |

> 파일명(`svg-sns.js`)과 배포명(`svg-insta`)/도메인(`insta.`)이 다름에 주의. v1 plan 에서 사용한 `messenger.bluehair.blue` 같은 표기는 잘못.

### 8.1. 두 개의 배포 채널 — 둘 다 필수

| 채널            | 명령                                                | 영향 범위                              | 이번 plan 에서 필요?                            |
| --------------- | --------------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| **Worker 채널** | `bash workers/deploy/deploy.sh`                     | `*.bluehair.blue/ent/*` 8개 워커       | ✅ Phase A, B 모두                              |
| **Site 채널**   | `git push origin main` → Cloudflare Pages 자동 빌드 | `intro.bluehair.blue` 사이트 번들      | ✅ Phase A (mirror 수정 포함). Phase B 는 선택  |

> `deploy.sh` 는 **사이트를 배포하지 않는다**. `git push` 는 **워커를 배포하지 않는다**. mirror 수정이 포함된 Phase A 는 **두 채널 모두** 실행해야 `/svg` 프리뷰와 live 워커가 동시에 갱신됨.

### 8.2. ASSET_VERSION

- 이번 작업은 **R2 이미지 신규 업로드 없음** → `src/utils/cdn.js` 의 `ASSET_VERSION` 증분 **불필요**.
- 사이트 번들 캐시는 Vite 해시로 자동 해결. **단, 번들이 새로 빌드되려면 Pages 가 한 번 배포돼야 함** (§8.1 두 번째 채널).
- 위 문단을 "worker 배포만으로 사이트까지 갱신된다" 로 오독하지 말 것.

### 8.3. 로어북 재삽입

**불필요** — JSON 변경 없음 (§4). 단, §4.1 의 문구 드리프트를 Phase C 에서 정리할 때는 재삽입 필요.

---

## 9. 요약 테이블

| 단계        | 내용                                           | 파일                 | 스니펫 위치 | 예상 시간              | 리스크 |
| ----------- | ---------------------------------------------- | -------------------- | ----------- | ---------------------- | ------ |
| **Phase A** | Escape hotfix 19건 (11+8) + mirror leaf escape | 6 worker + 1 mirror  | §2.1, §2.2  | 45~60분                | 낮음   |
| **Phase B** | `charAssets` 이식 5 worker                     | 5 worker             | §3.1, §3.2  | 60~90분                | 낮음   |
| **검증**    | curl + 브라우저 + 에덴챗 E2E                   | —                    | §7          | 30~45분                | —      |
| **배포**    | `deploy.sh` ×2 + `git push` ×1 (Phase A 필수)  | —                    | §8.1        | 5분 + Pages 빌드 2~5분 | —      |

**총 작업량**: 2~3시간 (v1 의 5~7시간 추정 대비 축소 — 심볼 resolver / shared module / JSON 재작성 모두 불필요해졌음)

---

## 10. v1 대비 폐기 사항

참고를 위해, v1 에서 제안했으나 v2 에서 **불필요로 확인**된 것들:

1. ❌ 심볼 스킴 (`.key`/`.sign`/`.NN` 도트 문법) — `char=CODE` 면 충분, 슬롯은 고정 4개
2. ❌ `workers/_shared/cdn.js` — 로컬 복제가 더 단순 (Copilot #2, #7)
3. ❌ `padStart(2, "0")` 숫자 패딩 — 우리가 숫자 슬롯을 다루지 않음 (Copilot #3)
4. ❌ `wrangler.community.toml` 같은 per-worker config — 존재 안 함 (Copilot #9)
5. ❌ JSON 로어북 `image_symbol_rules` 블록 추가 — 현 계약 이미 충분 (Copilot #1, #5)
6. ❌ `svgTemplates.js` 에 `escapeXml` 헬퍼 신규 추가 — 이미 존재 (Copilot #6)
7. ❌ `edenchat_clipboard.py --filter "SVG_"` — `--filter` 옵션 없음 (Copilot #10). 어차피 JSON 미변경이라 재삽입 자체가 불필요
8. ❌ 하위 호환 Hard break — 현 워커에서 `p.avatar`/`p.image` 풀 URL 도 계속 허용하므로 break 없음
9. ❌ svg-community 에 `avatar1~avatar12` 신규 파라미터 — 이번 범위 제외, 미결 §6-1 로 이월

---

## 11. 기존 `workers/plan_sub.md` 와의 관계

- 이 문서는 **태블릿 작업과 병행하는 별도 플랜**
- ESCAPE CONTRACT 규약·Source of Truth 정책 모두 기존 plan_sub.md 계승
- 태블릿 작업 완결 여부와 무관하게 Phase A/B 독립 실행 가능
- `src/data/svgTemplates.js` 를 양쪽이 동시 수정 시 머지 충돌 가능 — 두 plan 중 하나 완료 후 진행 권장

---

**작성일**: 2026-04-12
**버전**: v2 (드리프트 정정판 — Copilot review 10건 반영)
**상태**: 🟡 초안 — 사용자 승인 대기. 승인 시 Phase A 부터 착수.
