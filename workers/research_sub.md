# workers/ 폴더 분석

## 개요
Cloudflare Workers로 배포되는 8개의 SVG 동적 생성 서버. 챗봇이 URL 파라미터로 호출하면 캐릭터별 맞춤 SVG 이미지를 실시간 렌더링하여 반환한다.

## 파일 목록
```
workers/
├── svg-sns.js         ← Instagram 스타일 SNS 포스트 (102줄)
├── svg-tweet.js       ← X/Twitter 트윗 (81줄)
├── svg-livestream.js  ← 라이브 방송 프리뷰 (117줄)
├── svg-messenger.js   ← 메신저 대화 (90줄)
├── svg-news.js        ← 뉴스 속보 (78줄)
├── svg-chart.js       ← 음원 차트 (66줄)
├── svg-community.js   ← DCInside 스타일 커뮤니티 게시판 (164줄)
└── svg-tablet.js      ← PPP 초대장 태블릿 브리핑 (325줄, 가장 복잡)
```

## 도메인 매핑
| Worker | 도메인 | 엔드포인트 |
|---|---|---|
| svg-sns | insta.bluehair.blue | /ent/?... |
| svg-tweet | twit.bluehair.blue | /ent/?... |
| svg-livestream | live.bluehair.blue | /ent/?... |
| svg-messenger | talk.bluehair.blue | /ent/?... |
| svg-news | news.bluehair.blue | /ent/?... |
| svg-chart | chart.bluehair.blue | /ent/?... |
| svg-community | community.bluehair.blue | /ent/?... |
| svg-tablet | tablet.bluehair.blue | /ent/?... |

## 공통 아키텍처

### 요청 처리 흐름
```
URL 파라미터 → escapeXml()로 XSS 방지 → SVG 템플릿 문자열에 삽입 → Content-Type: image/svg+xml 응답
```

### 보안
- **escapeXml()**: 모든 Worker 선두에 정의, 총 102곳에서 사용
  - `& < > " '` → HTML 엔티티로 변환
  - URL 파라미터의 모든 텍스트 값에 적용
- **safeImageUrl()**: `char` 파라미터를 CDN URL로 안전하게 변환 (프로토콜 검증)
- **CORS**: `Access-Control-Allow-Origin: *`
- **캐시**: `Cache-Control: max-age=604800` (7일)

### 캐릭터 이미지 매핑
```javascript
// char=SY → https://img.bluehair.blue/ent/SY/svg/{type}.webp
// 지원 에셋: avatar, post, stream, news (캐릭터당 4종)
```

## Worker별 특징

### svg-tablet.js (~480줄, 가장 복잡)
- PPP 오디션 종합 브리핑 태블릿 (10개 섹션)
- 섹션 렌더러 패턴: 각 함수가 `{ svg, height }` 반환, 상대좌표 cascading
- escapeXml contract: 마크업 조합 → raw, 리프 텍스트(URL param) → escapeXml()
- [A] Header (PPP 로고 + "심사위원 위촉 서한")
- [B] Audition Briefing (부문/참가자/라운드/기간/분야)
- [C] Judge Panel (진시혁/에리카 프로필 + {{user}} YOU 뱃지)
- [D] Round Structure (4라운드, subdesc 포함)
- [E] Venue Map (5구역 수평 바 미니맵, ★ 하입 로드)
- [F] Mode Commands (13개 모드, 3단: Main/Career/Utility)
- [G] NSFW Asset Toggle (🔞 토글 안내, 분류 체계)
- [H] Image Output System (CDN 경로, 코드표, Scene Bar)
- [I] Site Link (intro.bluehair.blue URL 배너)
- [J] Footer (경고 + 저작권)

### svg-community.js (164줄)
- DCInside 스타일 게시판
- 10개 기본글 + 공지 + 댓글수
- 동적 높이 계산

### svg-sns.js (102줄)
- Instagram 포스트 레이아웃
- 좋아요/댓글 카운터, 위치 태그

## 배포 방법
```bash
# 프로젝트 루트의 wrangler.jsonc가 Pages 설정이므로, Worker 개별 배포 시 전용 config 생성
cd workers
cat > wrangler.toml << 'EOF'
name = "svg-tablet"
main = "svg-tablet.js"
compatibility_date = "2024-01-01"
EOF
npx wrangler deploy --config wrangler.toml
rm wrangler.toml
```
