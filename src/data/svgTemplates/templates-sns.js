// ── SNS Templates: SNS Post, Tweet, Messenger ──

import { escapeXml, charAssets, safeImageUrl } from "./helpers.js";

// ── 1. SNS Post (PRISMGRAM-style) ──
function generateSnsPost(p) {
  const username = p.username || "seoyun_official";
  const caption = p.caption || "프라임시티의 밤은 끝나지 않는다.";
  const likes = p.likes || "24,891";
  const comments = p.comments || "1,204";
  const time = p.time || "2시간 전";
  const location = p.location || "The Core, Prime City";
  const assets = charAssets(p.char);
  const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
  const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.post);

  const avatarSvg = avatarUrl
    ? `<defs><clipPath id="avatar-clip"><circle cx="24" cy="24" r="18"/></clipPath></defs>
    <image href="${escapeXml(avatarUrl)}" x="6" y="6" width="36" height="36" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="24" cy="24" r="18" fill="#2a2a4a" stroke="#c9a84c" stroke-width="2"/>
    <text x="24" y="28" text-anchor="middle" fill="#c9a84c" font-size="14" font-weight="bold" font-family="sans-serif">${escapeXml((username[0] || "?").toUpperCase())}</text>`;

  const imageSvg = imageUrl
    ? `<image href="${escapeXml(imageUrl)}" x="0" y="60" width="400" height="300" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="0" y="60" width="400" height="300" fill="#12122a"/>
  <text x="200" y="215" text-anchor="middle" fill="#333" font-size="14" font-family="sans-serif">IMAGE</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">
  <rect width="400" height="520" rx="12" fill="#1a1a2e"/>
  <!-- Header -->
  <g transform="translate(16, 12)">
    ${avatarSvg}
    <text x="52" y="22" fill="#e8e8e8" font-size="13" font-weight="600" font-family="sans-serif">${escapeXml(username)}</text>
    <text x="52" y="38" fill="#888" font-size="10" font-family="sans-serif">${escapeXml(location)}</text>
    <circle cx="${52 + username.length * 8 + 10}" cy="18" r="5" fill="#4a9eff"/>
    <text x="${52 + username.length * 8 + 7}" y="22" fill="#fff" font-size="8" font-family="sans-serif">✓</text>
  </g>
  <!-- Image area -->
  ${imageSvg}
  <!-- Floating hearts animation -->
  <g transform="translate(20, 340)">
    <text font-size="12" fill="#e03e3e">♥
      <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="0s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="-5 -60" dur="3s" begin="0s" repeatCount="indefinite"/>
    </text>
  </g>
  <g transform="translate(35, 350)">
    <text font-size="10" fill="#e03e3e">♥
      <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="0.8s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="5 -70" dur="3s" begin="0.8s" repeatCount="indefinite"/>
    </text>
  </g>
  <g transform="translate(12, 330)">
    <text font-size="14" fill="#e03e3e">♥
      <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="1.6s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="-8 -50" dur="3s" begin="1.6s" repeatCount="indefinite"/>
    </text>
  </g>
  <!-- Actions -->
  <g transform="translate(16, 376)">
    <text x="0" y="0" fill="#e8e8e8" font-size="18">♡</text>
    <text x="30" y="0" fill="#e8e8e8" font-size="18">💬</text>
    <text x="60" y="0" fill="#e8e8e8" font-size="18">↗</text>
  </g>
  <!-- Likes -->
  <text x="16" y="402" fill="#e8e8e8" font-size="12" font-weight="600" font-family="sans-serif">좋아요 ${escapeXml(likes)}개</text>
  <!-- Caption -->
  <text x="16" y="424" fill="#e8e8e8" font-size="12" font-family="sans-serif">
    <tspan font-weight="600">${escapeXml(username)}</tspan>
    <tspan dx="6" fill="#ccc">${escapeXml(caption)}</tspan>
  </text>
  <!-- Comments -->
  <text x="16" y="448" fill="#888" font-size="11" font-family="sans-serif">댓글 ${escapeXml(comments)}개 모두 보기</text>
  <!-- Time -->
  <text x="16" y="470" fill="#666" font-size="10" font-family="sans-serif">${escapeXml(time)}</text>
  <!-- Border -->
  <rect width="400" height="520" rx="12" fill="none" stroke="#333" stroke-width="1"/>
</svg>`;
}

// ── 2. Tweet (X-style) ──
function generateTweet(p) {
  const name = p.name || "나하린";
  const handle = p.handle || "@naharin_apex";
  const content = p.content || "재능 있는 사람이 어디까지 가는지... 그걸 구경하는 게 제일 재밌지 않아?";
  const retweets = p.retweets || "3,847";
  const likes = p.likes || "18,291";
  const time = p.time || "오후 11:42";
  const assets = charAssets(p.char);
  const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);

  // Word wrap content
  const maxCharsPerLine = 32;
  const lines = [];
  let cur = "";
  for (const ch of content) {
    cur += ch;
    if (cur.length >= maxCharsPerLine) { lines.push(cur); cur = ""; }
  }
  if (cur) lines.push(cur);

  const contentHeight = lines.length * 22;
  const totalHeight = 180 + contentHeight;

  const avatarSvg = avatarUrl
    ? `<defs><clipPath id="tw-avatar-clip"><circle cx="40" cy="40" r="20"/></clipPath></defs>
  <image href="${escapeXml(avatarUrl)}" x="20" y="20" width="40" height="40" clip-path="url(#tw-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="40" cy="40" r="20" fill="#1a3a5c" stroke="#c9a84c" stroke-width="1.5"/>
  <text x="40" y="45" text-anchor="middle" fill="#c9a84c" font-size="16" font-weight="bold" font-family="sans-serif">${escapeXml(name[0] || "?")}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${totalHeight}">
  <rect width="400" height="${totalHeight}" rx="12" fill="#15202b"/>
  <!-- Avatar -->
  ${avatarSvg}
  <!-- Name + handle -->
  <text x="70" y="34" fill="#e8e8e8" font-size="14" font-weight="700" font-family="sans-serif">${escapeXml(name)}</text>
  <circle cx="${70 + name.length * 14 + 10}" cy="30" r="5" fill="#4a9eff"/>
  <text x="${70 + name.length * 14 + 7}" y="34" fill="#fff" font-size="7" font-family="sans-serif">✓</text>
  <text x="70" y="50" fill="#8899a6" font-size="12" font-family="sans-serif">${escapeXml(handle)}</text>
  <!-- Content -->
  ${lines.map((line, i) => `<text x="20" y="${80 + i * 22}" fill="#e8e8e8" font-size="15" font-family="sans-serif">${escapeXml(line)}</text>`).join("\n  ")}
  <!-- Time -->
  <text x="20" y="${80 + contentHeight + 20}" fill="#8899a6" font-size="11" font-family="sans-serif">${escapeXml(time)}</text>
  <!-- Divider -->
  <line x1="20" y1="${80 + contentHeight + 32}" x2="380" y2="${80 + contentHeight + 32}" stroke="#2a3a4a" stroke-width="1"/>
  <!-- Engagement (animated pulse) -->
  <g transform="translate(20, ${80 + contentHeight + 52})" opacity="0.7">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    <text x="0" y="0" fill="#8899a6" font-size="12" font-family="sans-serif"><tspan font-weight="700" fill="#e8e8e8">${escapeXml(retweets)}</tspan> 리포스트</text>
    <text x="130" y="0" fill="#8899a6" font-size="12" font-family="sans-serif"><tspan font-weight="700" fill="#e8e8e8">${escapeXml(likes)}</tspan> 좋아요</text>
  </g>
  <rect width="400" height="${totalHeight}" rx="12" fill="none" stroke="#2a3a4a" stroke-width="1"/>
</svg>`;
}

// ── 4. Messenger ──
function generateMessenger(p) {
  const contact = p.contact || "이서하";
  const msg1 = p.msg1 || "내일 스튜디오 올 수 있어";
  const msg2 = p.msg2 || "새 곡 작업하려고 하는데";
  const reply1 = p.reply1 || "네! 몇 시에 갈까요";
  const reply2 = p.reply2 || "기대돼요";
  const time = p.time || "오후 9:15";
  const assets = charAssets(p.char);
  const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);

  const avatarSvg = avatarUrl
    ? `<defs><clipPath id="msg-avatar-clip"><circle cx="56" cy="28" r="16"/></clipPath></defs>
    <image href="${escapeXml(avatarUrl)}" x="40" y="12" width="32" height="32" clip-path="url(#msg-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="56" cy="28" r="16" fill="#2a2a4a" stroke="#6ab0f3" stroke-width="1.5"/>
    <text x="56" y="33" text-anchor="middle" fill="#6ab0f3" font-size="12" font-weight="bold" font-family="sans-serif">${escapeXml(contact[0] || "?")}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
  <rect width="400" height="480" rx="12" fill="#1a1a2e"/>
  <!-- Top bar -->
  <rect x="0" y="0" width="400" height="56" rx="12 12 0 0" fill="#12122a"/>
  <text x="16" y="32" fill="#888" font-size="16" font-family="sans-serif">←</text>
  ${avatarSvg}
  <text x="82" y="24" fill="#e8e8e8" font-size="14" font-weight="600" font-family="sans-serif">${escapeXml(contact)}</text>
  <circle cx="${82 + contact.length * 14 + 10}" cy="20" r="4" fill="#4caf50"/>
  <text x="82" y="40" fill="#4caf50" font-size="10" font-family="sans-serif">온라인</text>
  <!-- Messages -->
  <g transform="translate(0, 80)">
    <!-- Incoming msg 1 -->
    <rect x="16" y="0" width="${Math.min(msg1.length * 11 + 24, 260)}" height="34" rx="16" fill="#2a2a4a"/>
    <text x="28" y="22" fill="#e8e8e8" font-size="13" font-family="sans-serif">${escapeXml(msg1)}</text>
    <!-- Incoming msg 2 -->
    <rect x="16" y="44" width="${Math.min(msg2.length * 11 + 24, 260)}" height="34" rx="16" fill="#2a2a4a"/>
    <text x="28" y="66" fill="#e8e8e8" font-size="13" font-family="sans-serif">${escapeXml(msg2)}</text>
    <!-- Time -->
    <text x="200" y="102" text-anchor="middle" fill="#555" font-size="10" font-family="sans-serif">${escapeXml(time)}</text>
    <!-- Outgoing reply 1 -->
    <rect x="${400 - Math.min(reply1.length * 11 + 24, 260) - 16}" y="116" width="${Math.min(reply1.length * 11 + 24, 260)}" height="34" rx="16" fill="#3a5a8a"/>
    <text x="${400 - Math.min(reply1.length * 11 + 24, 260) - 16 + 12}" y="138" fill="#e8e8e8" font-size="13" font-family="sans-serif">${escapeXml(reply1)}</text>
    <!-- Outgoing reply 2 -->
    <rect x="${400 - Math.min(reply2.length * 11 + 24, 260) - 16}" y="160" width="${Math.min(reply2.length * 11 + 24, 260)}" height="34" rx="16" fill="#3a5a8a"/>
    <text x="${400 - Math.min(reply2.length * 11 + 24, 260) - 16 + 12}" y="182" fill="#e8e8e8" font-size="13" font-family="sans-serif">${escapeXml(reply2)}</text>
  </g>
  <!-- Typing indicator -->
  <g transform="translate(28, 290)">
    <circle cx="0" cy="0" r="3" fill="#888">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0s" repeatCount="indefinite"/>
    </circle>
    <circle cx="10" cy="0" r="3" fill="#888">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="20" cy="0" r="3" fill="#888">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.4s" repeatCount="indefinite"/>
    </circle>
  </g>
  <!-- Input bar -->
  <rect x="0" y="432" width="400" height="48" fill="#12122a"/>
  <rect x="16" y="442" width="330" height="28" rx="14" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
  <text x="30" y="460" fill="#555" font-size="11" font-family="sans-serif">메시지 입력...</text>
  <text x="370" y="460" text-anchor="middle" fill="#c9a84c" font-size="16" font-family="sans-serif">➤</text>
  <rect width="400" height="480" rx="12" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

export const snsSvgTemplates = [
  {
    id: "sns-post",
    name: "SNS 포스트",
    en: "SNS Post",
    category: "SNS",
    animated: true,
    desc: "PRISMGRAM(프리즘그램) 스타일 SNS 포스트. 프로필, 이미지 영역, 좋아요/댓글 수, 캡션을 표시합니다. 떠오르는 하트 애니메이션 포함.",
    params: [
      { name: "username", desc: "유저네임", example: "seoyun_official" },
      { name: "caption", desc: "캡션 텍스트", example: "프라임시티의 밤은 끝나지 않는다." },
      { name: "likes", desc: "좋아요 수", example: "24,891" },
      { name: "comments", desc: "댓글 수", example: "1,204" },
      { name: "time", desc: "게시 시간", example: "2시간 전" },
      { name: "location", desc: "위치", example: "The Core, Prime City" },
      { name: "char", desc: "캐릭터코드 → 아바타/이미지 자동", example: "SY" },
    ],
    sampleParams: {},
    generate: generateSnsPost,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateSnsPost(p);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml;charset=UTF-8",
        "Cache-Control": "public, max-age=604800, s-maxage=2592000",
        "CDN-Cache-Control": "max-age=2592000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};`,
    promptExample: `■ SNS 포스트 SVG 출력 프롬프트

【라벨 설명】
- username: 게시자의 SNS 아이디 (영문)
- caption: 게시글 본문 (캐릭터의 현재 상황/감정에 맞는 한 줄)
- likes: 좋아요 수 (콤마 포함 시 %2C로 인코딩)
- comments: 댓글 수
- time: 게시 시점 (예: 방금, 1시간%20전)
- location: 게시 장소 (구역명 등)
- char: 캐릭터코드 (SY, NHR 등) → 아바타/이미지 자동 매핑
- avatar: 프로필 이미지 직접 지정 (선택, char보다 우선)
- image: 게시물 이미지 직접 지정 (선택, char보다 우선)

【출력 위치】
캐릭터가 SNS 게시물을 올리거나, 다른 캐릭터의 SNS를 확인하는 장면에서
나레이션 하단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://insta.bluehair.blue/ent/?char={캐릭터코드}&username={아이디}&caption={본문}&likes={좋아요수}&comments={댓글수}&time={시간}&location={장소})

【예시】
![](https://insta.bluehair.blue/ent/?char=SY&username=seoyun_official&caption=프라임시티의%20밤은%20끝나지%20않는다.&likes=24%2C891&comments=1%2C204&time=2시간%20전&location=The%20Core%2C%20Prime%20City)`,
  },
  {
    id: "tweet",
    name: "실시간 트윗",
    en: "Tweet",
    category: "SNS",
    animated: true,
    desc: "SIGNAL(시그널) 스타일 트윗. 프로필, 본문, 리포스트/좋아요 수를 표시합니다. 인게이지먼트 수치 펄스 애니메이션 포함.",
    params: [
      { name: "name", desc: "표시 이름", example: "나하린" },
      { name: "handle", desc: "핸들", example: "@naharin_apex" },
      { name: "content", desc: "트윗 본문", example: "재능 있는 사람이 어디까지 가는지..." },
      { name: "retweets", desc: "리포스트 수", example: "3,847" },
      { name: "likes", desc: "좋아요 수", example: "18,291" },
      { name: "time", desc: "게시 시간", example: "오후 11:42" },
      { name: "char", desc: "캐릭터코드 → 아바타 자동", example: "NHR" },
    ],
    sampleParams: {},
    generate: generateTweet,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateTweet(p);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml;charset=UTF-8",
        "Cache-Control": "public, max-age=604800, s-maxage=2592000",
        "CDN-Cache-Control": "max-age=2592000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};`,
    promptExample: `■ 트윗 SVG 출력 프롬프트

【라벨 설명】
- name: 트윗 작성자 이름 (캐릭터 본명)
- handle: @핸들 (영문, 캐릭터 설정에 맞게)
- content: 트윗 본문 (캐릭터의 말투와 성격 반영)
- retweets: 리포스트 수
- likes: 좋아요 수
- time: 게시 시간
- char: 캐릭터코드 (SY, NHR 등) → 아바타 자동 매핑
- avatar: 프로필 이미지 직접 지정 (선택, char보다 우선)

【출력 위치】
캐릭터의 SNS 발언이 화제가 되거나, 트윗을 확인하는 장면에서
나레이션 상단 또는 대사 직전에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://twit.bluehair.blue/ent/?char={캐릭터코드}&name={이름}&handle={핸들}&content={본문}&retweets={리포수}&likes={좋아요수}&time={시간})

【예시】
![](https://twit.bluehair.blue/ent/?char=NHR&name=나하린&handle=@naharin_apex&content=재능%20있는%20사람이%20어디까지%20가는지...%20구경하는%20게%20제일%20재밌지%20않아%3F&retweets=3%2C847&likes=18%2C291&time=오후%2011:42)`,
  },
  {
    id: "messenger",
    name: "메신저",
    en: "Messenger",
    category: "유틸리티",
    animated: true,
    desc: "채팅 앱 스타일 메신저 대화. 좌우 대화 버블, 온라인 상태, 타이핑 인디케이터 애니메이션 포함.",
    params: [
      { name: "contact", desc: "상대방 이름", example: "이서하" },
      { name: "msg1", desc: "상대방 메시지 1", example: "내일 스튜디오 올 수 있어" },
      { name: "msg2", desc: "상대방 메시지 2", example: "새 곡 작업하려고 하는데" },
      { name: "reply1", desc: "내 답장 1", example: "네! 몇 시에 갈까요" },
      { name: "reply2", desc: "내 답장 2", example: "기대돼요" },
      { name: "time", desc: "시간", example: "오후 9:15" },
      { name: "char", desc: "캐릭터코드 → 아바타 자동", example: "LSH" },
    ],
    sampleParams: {},
    generate: generateMessenger,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateMessenger(p);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml;charset=UTF-8",
        "Cache-Control": "public, max-age=604800, s-maxage=2592000",
        "CDN-Cache-Control": "max-age=2592000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};`,
    promptExample: `■ 메신저 SVG 출력 프롬프트

【라벨 설명】
- contact: 대화 상대 캐릭터 이름
- msg1, msg2: 상대방이 보낸 메시지 2개 (캐릭터 말투 반영)
- reply1, reply2: 유저의 답장 2개
- time: 대화 시각
- avatar: 상대방 프로필 이미지 URL (선택)

【출력 위치】
캐릭터와 메시지를 주고받는 장면에서
대사 블록 사이 또는 나레이션 하단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://talk.bluehair.blue/ent/?char={캐릭터코드}&contact={이름}&msg1={메시지1}&msg2={메시지2}&reply1={답장1}&reply2={답장2}&time={시각})

【예시】
![](https://talk.bluehair.blue/ent/?char=LSH&contact=이서하&msg1=내일%20스튜디오%20올%20수%20있어&msg2=새%20곡%20작업하려고%20하는데&reply1=네!%20몇%20시에%20갈까요&reply2=기대돼요&time=오후%209:15)`,
  },
];
