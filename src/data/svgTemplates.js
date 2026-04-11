// ── SVG Template Definitions ──
// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
// 각 템플릿: id, name, en, category, animated, desc, params[], sampleParams, generate(p), workerCode, promptExample

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export const TEMPLATE_CATEGORIES = {
  ALL: "전체",
  SNS: "SNS",
  BROADCAST: "방송",
  UTILITY: "유틸리티",
};

// ── CDN asset mapping: char code → image URLs ──
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

// ── Safe image URL helper ──
function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}

// ── 1. SNS Post (Instagram-style) ──
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

// ── 3. Livestream ──
function generateLivestream(p) {
  const streamer = p.streamer || "강하람";
  const title = p.title || "데뷔 연습 라이브! 오늘 열심히 해볼게요";
  const viewers = p.viewers || "12,847";
  const category = p.category || "음악";
  const chat1 = p.chat1 || "화이팅!!!";
  const chat2 = p.chat2 || "목소리 너무 좋다";
  const chat3 = p.chat3 || "앵콜 앵콜!!!";
  const assets = charAssets(p.char);
  const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
  const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.stream);

  const avatarSvg = avatarUrl
    ? `<defs><clipPath id="ls-avatar-clip"><circle cx="18" cy="18" r="18"/></clipPath></defs>
    <image href="${escapeXml(avatarUrl)}" x="0" y="0" width="36" height="36" clip-path="url(#ls-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="18" cy="18" r="18" fill="#2a2a4a" stroke="#c9a84c" stroke-width="2"/>
    <text x="18" y="23" text-anchor="middle" fill="#c9a84c" font-size="14" font-weight="bold" font-family="sans-serif">${escapeXml(streamer[0] || "?")}</text>`;

  const streamImageSvg = imageUrl
    ? `<image href="${escapeXml(imageUrl)}" x="0" y="0" width="400" height="240" clip-path="url(#stream-clip)" preserveAspectRatio="xMidYMid slice"/>
  <defs><clipPath id="stream-clip"><rect x="0" y="0" width="400" height="240" rx="12"/></clipPath></defs>`
    : `<rect x="0" y="0" width="400" height="240" rx="12 12 0 0" fill="#18182a"/>
  <text x="200" y="125" text-anchor="middle" fill="#444" font-size="14" font-family="sans-serif">LIVE STREAM</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
  <rect width="400" height="480" rx="12" fill="#0e0e1a"/>
  <!-- Stream preview area -->
  ${streamImageSvg}
  <!-- LIVE badge (animated) -->
  <rect x="12" y="12" width="50" height="22" rx="4" fill="#e03e3e">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="37" y="27" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="sans-serif">LIVE</text>
  <!-- Viewers -->
  <rect x="70" y="12" width="80" height="22" rx="4" fill="rgba(0,0,0,0.6)"/>
  <text x="110" y="27" text-anchor="middle" fill="#e8e8e8" font-size="11" font-family="sans-serif">👁 ${escapeXml(viewers)}</text>
  <!-- Streamer info -->
  <g transform="translate(16, 254)">
    ${avatarSvg}
    <text x="46" y="16" fill="#e8e8e8" font-size="14" font-weight="600" font-family="sans-serif">${escapeXml(streamer)}</text>
    <text x="46" y="32" fill="#888" font-size="10" font-family="sans-serif">${escapeXml(category)}</text>
  </g>
  <!-- Title -->
  <text x="16" y="310" fill="#ccc" font-size="12" font-family="sans-serif">${escapeXml(title.substring(0, 45))}</text>
  <!-- Divider -->
  <line x1="16" y1="324" x2="384" y2="324" stroke="#222" stroke-width="1"/>
  <!-- Chat overlay (scrolling animation) -->
  <g transform="translate(16, 330)">
    <text x="0" y="0" fill="#888" font-size="10" font-weight="600" font-family="sans-serif">실시간 채팅</text>
  </g>
  <defs><clipPath id="chat-clip"><rect x="16" y="335" width="368" height="90"/></clipPath></defs>
  <g clip-path="url(#chat-clip)">
    <g>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -90" dur="8s" repeatCount="indefinite"/>
      <g transform="translate(16, 345)">
        <text x="0" y="0" fill="#4a9eff" font-size="11" font-family="sans-serif">유저1</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat1)}</text>
      </g>
      <g transform="translate(16, 375)">
        <text x="0" y="0" fill="#e0a040" font-size="11" font-family="sans-serif">유저2</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat2)}</text>
      </g>
      <g transform="translate(16, 405)">
        <text x="0" y="0" fill="#40c060" font-size="11" font-family="sans-serif">유저3</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat3)}</text>
      </g>
      <!-- Duplicated for seamless loop -->
      <g transform="translate(16, 435)">
        <text x="0" y="0" fill="#4a9eff" font-size="11" font-family="sans-serif">유저1</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat1)}</text>
      </g>
      <g transform="translate(16, 465)">
        <text x="0" y="0" fill="#e0a040" font-size="11" font-family="sans-serif">유저2</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat2)}</text>
      </g>
      <g transform="translate(16, 495)">
        <text x="0" y="0" fill="#40c060" font-size="11" font-family="sans-serif">유저3</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat3)}</text>
      </g>
    </g>
  </g>
  <!-- Chat input -->
  <rect x="16" y="440" width="330" height="28" rx="14" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
  <text x="30" y="458" fill="#555" font-size="11" font-family="sans-serif">채팅을 입력하세요...</text>
  <rect x="352" y="440" width="36" height="28" rx="14" fill="#c9a84c"/>
  <text x="370" y="458" text-anchor="middle" fill="#1a1a2e" font-size="12" font-weight="600" font-family="sans-serif">→</text>
  <rect width="400" height="480" rx="12" fill="none" stroke="#222" stroke-width="1"/>
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

// ── 5. Breaking News ──
function generateNews(p) {
  const channel = p.channel || "PRIME NEWS";
  const headline = p.headline || "APEX 엔터 신인 오디션 최종 라운드 돌입";
  const sub = p.sub || "나하린 프로듀서 직접 심사";
  const reporter = p.reporter || "김기자";
  const time = p.time || "LIVE 오후 8:00";
  const ticker = p.ticker || "프라임시티 엔터테인먼트 지수 사상 최고치 경신";
  const assets = charAssets(p.char);
  const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.news);

  const newsImageSvg = imageUrl
    ? `<image href="${escapeXml(imageUrl)}" x="300" y="84" width="180" height="140" preserveAspectRatio="xMidYMid slice"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280">
  <rect width="500" height="280" rx="8" fill="#0a0a1a"/>
  <!-- Channel bar -->
  <rect x="0" y="0" width="500" height="40" fill="#1a1a2e"/>
  <text x="16" y="26" fill="#c9a84c" font-size="14" font-weight="700" font-family="sans-serif">${escapeXml(channel)}</text>
  <rect x="140" y="10" width="50" height="20" rx="3" fill="#e03e3e">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="165" y="24" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="sans-serif">LIVE</text>
  <text x="484" y="26" text-anchor="end" fill="#888" font-size="11" font-family="sans-serif">${escapeXml(time)}</text>
  <!-- Breaking banner (flash animation) -->
  <rect x="0" y="44" width="500" height="32" fill="#c62828">
    <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
  </rect>
  <text x="16" y="65" fill="#fff" font-size="13" font-weight="700" font-family="sans-serif">⚡ 속보 BREAKING</text>
  <!-- News image -->
  ${newsImageSvg}
  <!-- Headline -->
  <text x="16" y="108" fill="#e8e8e8" font-size="18" font-weight="700" font-family="sans-serif">${escapeXml(headline.substring(0, 30))}</text>
  ${headline.length > 30 ? `<text x="16" y="132" fill="#e8e8e8" font-size="18" font-weight="700" font-family="sans-serif">${escapeXml(headline.substring(30, 60))}</text>` : ""}
  <!-- Sub -->
  <text x="16" y="${headline.length > 30 ? 158 : 134}" fill="#aaa" font-size="13" font-family="sans-serif">${escapeXml(sub.substring(0, 42))}</text>
  <!-- Reporter -->
  <text x="16" y="${headline.length > 30 ? 186 : 162}" fill="#888" font-size="11" font-family="sans-serif">${escapeXml(reporter)} 기자</text>
  <!-- Ticker bar -->
  <rect x="0" y="240" width="500" height="40" fill="#12122a"/>
  <clipPath id="ticker-clip"><rect x="0" y="240" width="500" height="40"/></clipPath>
  <g clip-path="url(#ticker-clip)">
    <text y="264" fill="#c9a84c" font-size="12" font-family="sans-serif">
      <tspan>${escapeXml(ticker)}</tspan>
      <animateTransform attributeName="transform" type="translate" from="500 0" to="-1200 0" dur="20s" repeatCount="indefinite"/>
    </text>
  </g>
  <rect width="500" height="280" rx="8" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

// ── 6. Music Chart ──
function generateChart(p) {
  const chart = p.chart || "PRIME CHART";
  const time = p.time || "2026.03.22 20:00 기준";
  const songs = [
    { rank: 1, song: p.song1 || "Zero Point", artist: p.artist1 || "서윤", change: p.change1 || "—" },
    { rank: 2, song: p.song2 || "Midnight Signal", artist: p.artist2 || "이서하", change: p.change2 || "▲2" },
    { rank: 3, song: p.song3 || "불꽃처럼", artist: p.artist3 || "강하람", change: p.change3 || "NEW" },
    { rank: 4, song: p.song4 || "Masquerade", artist: p.artist4 || "엘라", change: p.change4 || "▼1" },
    { rank: 5, song: p.song5 || "자유낙하", artist: p.artist5 || "밀라", change: p.change5 || "▲5" },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
  <rect width="400" height="480" rx="12" fill="#0e0e1a"/>
  <!-- Header -->
  <text x="200" y="36" text-anchor="middle" fill="#c9a84c" font-size="16" font-weight="700" font-family="sans-serif">${escapeXml(chart)}</text>
  <text x="200" y="56" text-anchor="middle" fill="#666" font-size="10" font-family="sans-serif">${escapeXml(time)}</text>
  <line x1="40" y1="70" x2="360" y2="70" stroke="#222" stroke-width="1"/>
  <!-- Chart rows -->
  ${songs.map((s, i) => {
    const y = 100 + i * 76;
    const isFirst = i === 0;
    const changeColor = s.change.includes("▲") || s.change === "NEW" ? "#4caf50" : s.change.includes("▼") ? "#e03e3e" : "#888";
    return `
    <g transform="translate(0, ${y})">
      ${isFirst ? `<rect x="16" y="-12" width="368" height="60" rx="8" fill="#1a1a0a" stroke="#c9a84c" stroke-width="0.5">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="stroke-width" values="0.5;1.5;0.5" dur="2s" repeatCount="indefinite"/>
      </rect>` : ""}
      <text x="36" y="18" text-anchor="middle" fill="${isFirst ? "#c9a84c" : "#888"}" font-size="${isFirst ? 24 : 18}" font-weight="700" font-family="sans-serif">${escapeXml(s.rank)}</text>
      <text x="68" y="12" fill="#e8e8e8" font-size="14" font-weight="${isFirst ? 700 : 500}" font-family="sans-serif">${escapeXml(s.song)}</text>
      <text x="68" y="32" fill="#888" font-size="11" font-family="sans-serif">${escapeXml(s.artist)}</text>
      <text x="360" y="18" text-anchor="end" fill="${changeColor}" font-size="12" font-weight="600" font-family="sans-serif">${escapeXml(s.change)}</text>
    </g>`;
  }).join("")}
  <rect width="400" height="480" rx="12" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

// ── 7. Community Board (DCInside-style) ──
function generateCommunity(p) {
  const board = p.board || "프라임시티 갤러리";
  const page = p.page || "1";

  // ── Parse posts from URL params (post1~postN) ──
  const defaults = [
    { title: "갤러리 이용 안내 및 규칙 (필독)", author: "운영자", views: "1.2k", votes: "45", notice: true },
    { title: "PPP 오디션 시즌1 일정 공지", author: "운영자", views: "850", votes: "32", notice: true },
    { title: "서윤 신곡 뮤비 떴다 ㄷㄷ", author: "ㅇㅇ", views: "2847", votes: "142", comments: "24" },
    { title: "오디션 3라운드 결과 예측해봄", author: "갤주", views: "1523", votes: "89", comments: "56" },
    { title: "강하람 라이브 방송 캡쳐본.jpg", author: "ㅇㅇ", views: "987", votes: "56", img: true },
    { title: "이서하 작곡 목록 정리 (업데이트)", author: "음갤러", views: "3241", votes: "201", comments: "12" },
    { title: "엘라 직캠 모음집 공유한다", author: "ㅇㅇ", views: "1876", votes: "94", img: true },
    { title: "나하린 팀장 정체가 뭐임?", author: "추리왕", views: "412", votes: "15" },
    { title: "오늘자 하시은 연습실 퇴근길", author: "팬카페", views: "654", votes: "28", img: true },
    { title: "PPP 오디션 티켓팅 성공한 사람?", author: "ㅇㅇ", views: "342", votes: "10" },
  ];

  // Override defaults with URL params (post1, author1, views1, votes1, comments1)
  const posts = [];
  for (let i = 0; i < 12; i++) {
    const n = i + 1;
    const paramTitle = p[`post${n}`];
    if (paramTitle) {
      posts.push({
        title: paramTitle,
        author: p[`author${n}`] || "ㅇㅇ",
        views: p[`views${n}`] || "0",
        votes: p[`votes${n}`] || "0",
        comments: p[`comments${n}`] || "",
        notice: p[`notice${n}`] === "1",
        img: p[`img${n}`] === "1",
      });
    } else if (i < defaults.length) {
      posts.push(defaults[i]);
    }
  }

  // ── Layout constants ──
  const rowH = 30;
  const headerH = 58;
  const colH = 26;
  const footerH = 44;
  const listH = posts.length * rowH;
  const totalH = headerH + colH + listH + footerH;

  // ── Row rendering ──
  const rows = posts.map((post, i) => {
    const y = i * rowH;
    const isNotice = post.notice;
    const bg = isNotice
      ? "url(#notice-grad)"
      : i % 2 === 0 ? "#0e0e1a" : "#111122";
    const numLabel = isNotice ? "공지" : String(1024 - i);
    const numColor = isNotice ? "#c9a84c" : "#555";
    const titleColor = isNotice ? "#c9a84c" : "#e8e8e8";
    const votesNum = parseInt(post.votes) || 0;
    const votesColor = votesNum >= 50 ? "#c9a84c" : "#555";

    // Title with comment count + image marker
    const maxLen = post.comments || post.img ? 18 : 22;
    const truncTitle = post.title.length > maxLen
      ? post.title.substring(0, maxLen) + ".."
      : post.title;
    const commentTag = post.comments
      ? `<tspan fill="#c9a84c" font-size="9" font-weight="700"> [${escapeXml(post.comments)}]</tspan>`
      : "";
    const imgTag = post.img
      ? `<tspan fill="#666" font-size="8"> [img]</tspan>`
      : "";

    return `
    <g transform="translate(0,${y})">
      <rect width="400" height="${rowH}" fill="${bg}"/>
      <rect width="400" height="${rowH}" fill="url(#sweep-grad)" opacity="0">
        <animate attributeName="opacity" values="0;0.12;0" dur="4s" begin="${i * 0.4}s" repeatCount="indefinite"/>
      </rect>
      <text x="28" y="20" text-anchor="middle" fill="${numColor}" font-size="9" font-weight="${isNotice ? 700 : 400}" font-family="sans-serif">${escapeXml(numLabel)}</text>
      <text x="54" y="20" fill="${titleColor}" font-size="11" font-family="sans-serif">${escapeXml(truncTitle)}${commentTag}${imgTag}</text>
      <text x="278" y="20" text-anchor="middle" fill="#888" font-size="9.5" font-family="sans-serif">${escapeXml(post.author)}</text>
      <text x="332" y="20" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif">${escapeXml(post.views)}</text>
      <text x="375" y="20" text-anchor="middle" fill="${votesColor}" font-size="9" font-weight="700" font-family="sans-serif">${escapeXml(post.votes)}</text>
      <line x1="0" y1="${rowH}" x2="400" y2="${rowH}" stroke="#1a1a2e" stroke-width="0.5"/>
    </g>`;
  }).join("");

  // ── Pagination ──
  const pages = [1, 2, 3, 4, 5];
  const paginationItems = pages.map((n, i) => {
    const active = String(n) === page;
    return `<text x="${i * 24}" y="0" fill="${active ? "#c9a84c" : "#888"}" font-size="11" font-weight="${active ? 700 : 400}" font-family="sans-serif">${n}</text>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${totalH}">
  <defs>
    <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="50%" stop-color="#c9a84c" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="notice-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0.12"/>
    </linearGradient>
  </defs>

  <rect width="400" height="${totalH}" rx="12" fill="#0e0e1a"/>

  <!-- Header -->
  <rect width="400" height="${headerH}" rx="12 12 0 0" fill="#1a1a2e"/>
  <text x="20" y="26" fill="#c9a84c" font-size="15" font-weight="700" font-family="sans-serif">📋 ${escapeXml(board)}</text>
  <text x="20" y="44" fill="#666" font-size="9.5" font-family="sans-serif">전체글 ${posts.length}개 · 페이지 ${escapeXml(page)}</text>
  <rect x="332" y="14" width="50" height="22" rx="4" fill="#c9a84c"/>
  <text x="357" y="29" text-anchor="middle" fill="#0e0e1a" font-size="9.5" font-weight="700" font-family="sans-serif">글쓰기</text>

  <!-- Column headers -->
  <g transform="translate(0,${headerH})">
    <rect width="400" height="${colH}" fill="#141428"/>
    <text x="28" y="17" text-anchor="middle" fill="#888" font-size="8.5" font-weight="600" font-family="sans-serif">번호</text>
    <text x="54" y="17" fill="#888" font-size="8.5" font-weight="600" font-family="sans-serif">제목</text>
    <text x="278" y="17" text-anchor="middle" fill="#888" font-size="8.5" font-weight="600" font-family="sans-serif">글쓴이</text>
    <text x="332" y="17" text-anchor="middle" fill="#888" font-size="8.5" font-weight="600" font-family="sans-serif">조회</text>
    <text x="375" y="17" text-anchor="middle" fill="#888" font-size="8.5" font-weight="600" font-family="sans-serif">추천</text>
  </g>

  <!-- Post rows -->
  <g transform="translate(0,${headerH + colH})">
    ${rows}
  </g>

  <!-- Pagination -->
  <g transform="translate(0,${headerH + colH + listH})">
    <rect width="400" height="${footerH}" rx="0 0 12 12" fill="#1a1a2e"/>
    <text x="140" y="28" fill="#555" font-size="11" font-family="sans-serif">&lt;</text>
    <g transform="translate(158,28)">
      ${paginationItems}
    </g>
    <text x="262" y="28" fill="#555" font-size="11" font-family="sans-serif">&gt;</text>
  </g>

  <!-- Border -->
  <rect width="400" height="${totalH}" rx="12" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
</svg>`;
}

// ── 8. Tablet Briefing ──
// SYNC: Keep in sync with workers/svg-tablet.js
function generateTablet(p) {
  const user = escapeXml(p.user || "{{user}}");
  const agency = escapeXml(p.agency || "PRISM Studio");
  const division = escapeXml(p.division || "스테이지");
  const date = escapeXml(p.date || "");

  const judge1 = escapeXml(p.judge1 || "진시혁");
  const judge1agency = escapeXml(p.judge1agency || "APEX Entertainment");
  const judge1role = escapeXml(p.judge1role || "수석 프로듀서");
  const judge2 = escapeXml(p.judge2 || "에리카");
  const judge2agency = escapeXml(p.judge2agency || "Blue Moon Entertainment");
  const judge2role = escapeXml(p.judge2role || "프로듀서");

  // ── Layout constants ──
  const W = 420;
  const L = 50;       // left margin
  const R = 370;      // right guide
  const contentW = R - L; // 320
  const colW = 155;
  const gapX = 10;
  const SEC_GAP = 24;  // uniform section gap

  // ── Section accent bar helper ──
  function sectionHeader(label, y) {
    return `
    <rect x="${L - 6}" y="${y - 10}" width="3" height="14" rx="1" fill="#c9a84c" opacity="0.5"/>
    <text x="${L}" y="${y}" fill="#888" font-size="10" font-weight="600" font-family="sans-serif" letter-spacing="2">${label}</text>
    <rect x="${L}" y="${y + 5}" width="50" height="1.5" fill="#c9a84c" opacity="0.4"/>`;
  }

  function divider(y) {
    return `<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" stroke="#222" stroke-width="0.5"/>`;
  }

  // ══════════════════════════════════════════════
  //  SECTION RENDERERS — each returns { svg, height }
  // ══════════════════════════════════════════════

  // ── [A] HEADER ──
  // [1] status bar y=34로 하향 (코너 브라켓 겹침 해소)
  // [2] PRIME PRIORITY 영문화
  // [3] 시즌 표시 제거
  // [4] "본선 심사위원 위촉 서한"
  function renderHeader() {
    const h = 180;
    const svg = `
    <!-- Status bar — [1] y=34 to avoid corner bracket overlap -->
    <rect x="20" y="34" width="380" height="24" fill="#0a0a18" opacity="0.8"/>
    <text x="36" y="50" fill="#555" font-size="9" font-family="sans-serif">${date || "D-7"}</text>
    <text x="380" y="50" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">CONFIDENTIAL</text>

    <!-- PPP Logo -->
    <g transform="translate(210, 88)">
      <polygon points="0,-22 19,11 -19,11" fill="none" stroke="url(#gold-grad)" stroke-width="1.5" filter="url(#glow)">
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="0,-12 10,6 -10,6" fill="#c9a84c" opacity="0.15"/>
    </g>
    <text x="210" y="130" text-anchor="middle" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif" letter-spacing="4">P R O D U C E</text>
    <!-- [2] English program name -->
    <text x="210" y="150" text-anchor="middle" fill="#e8e8e8" font-size="16" font-weight="700" font-family="sans-serif">PRIME PRIORITY</text>
    <!-- [3] season removed, [4] 본선 추가 -->
    <text x="210" y="168" text-anchor="middle" fill="#555" font-size="9" font-family="sans-serif" font-style="italic">본선 심사위원 위촉 서한</text>

    <!-- Divider -->
    <line x1="80" y1="180" x2="340" y2="180" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>
    <circle cx="210" cy="180" r="2" fill="#c9a84c" opacity="0.5"/>`;
    return { svg, height: h };
  }

  // ── [B] AUDITION BRIEFING ──
  // [5] "본선 진출자" + 간격 확보
  function renderBriefing(startY) {
    const h = 100;
    const svg = `
    ${sectionHeader("AUDITION BRIEFING", startY + 18)}
    <g>
      <text x="${L}" y="${startY + 50}" fill="#666" font-size="10" font-family="sans-serif">부문</text>
      <text x="130" y="${startY + 50}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${division}</text>
      <text x="230" y="${startY + 50}" fill="#666" font-size="10" font-family="sans-serif">본선 진출자</text>
      <text x="320" y="${startY + 50}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">8명</text>
    </g>
    <g>
      <text x="${L}" y="${startY + 70}" fill="#666" font-size="10" font-family="sans-serif">라운드</text>
      <text x="130" y="${startY + 70}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">총 4라운드</text>
      <text x="230" y="${startY + 70}" fill="#666" font-size="10" font-family="sans-serif">기간</text>
      <text x="320" y="${startY + 70}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">약 2개월</text>
    </g>
    <g>
      <text x="${L}" y="${startY + 90}" fill="#666" font-size="10" font-family="sans-serif">분야</text>
      <text x="130" y="${startY + 90}" fill="#ccc" font-size="10" font-family="sans-serif">아이돌 · 가수 · 댄서 · 싱어송라이터 · 멀티</text>
    </g>`;
    return { svg, height: h };
  }

  // ── [C] JUDGE PANEL ──
  // [6] 원형 아이콘 R-14로 수정
  function renderJudges(startY) {
    function judgeCard(name, agencyName, role, profile, y, delay, isUser) {
      const badge = isUser ? "YOU" : "";
      const nameColor = isUser ? "#c9a84c" : "#e8e8e8";
      const borderColor = isUser ? "#c9a84c" : "#2a2a3a";
      const cardH = profile ? 56 : 44;
      return `
      <g opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}s" fill="freeze"/>
        <rect x="${L}" y="${y}" width="${contentW}" height="${cardH}" rx="6" fill="#141428" stroke="${borderColor}" stroke-width="${isUser ? 1.5 : 0.5}"/>
        ${isUser ? `<rect x="${L}" y="${y}" width="${contentW}" height="${cardH}" rx="6" fill="#c9a84c" opacity="0.05"/>` : ""}
        <text x="${L + 16}" y="${y + 18}" fill="${nameColor}" font-size="13" font-weight="700" font-family="sans-serif">${name}</text>
        ${badge ? `<rect x="${L + 16 + name.length * 13 + 6}" y="${y + 6}" width="30" height="16" rx="3" fill="#c9a84c"/>
        <text x="${L + 16 + name.length * 13 + 21}" y="${y + 18}" text-anchor="middle" fill="#0e0e1a" font-size="8" font-weight="700" font-family="sans-serif">${badge}</text>` : ""}
        <text x="${L + 16}" y="${y + 34}" fill="#888" font-size="9" font-family="sans-serif">${agencyName} · ${role}</text>
        ${profile ? `<text x="${L + 16}" y="${y + 48}" fill="#555" font-size="9" font-family="sans-serif">${profile}</text>` : ""}
        <!-- [6] R-14 to keep circle inside card -->
        <rect x="${R - 14}" y="${y + 12}" width="8" height="8" rx="4" fill="${isUser ? "#c9a84c" : "#555"}" opacity="${isUser ? 1 : 0.5}"/>
      </g>`;
    }

    const cardGap = 6;
    let cy = startY + 30;
    const j1 = judgeCard(judge1, judge1agency, judge1role, "업계 1위 기획사 A&amp;R 총괄", cy, 0.5, false);
    cy += 56 + cardGap;
    const j2 = judgeCard(judge2, judge2agency, judge2role, "히트 프로듀싱 전문", cy, 0.7, false);
    cy += 56 + cardGap;
    const j3 = judgeCard(user, agency, "프로듀서", "", cy, 0.9, true);
    cy += 44 + cardGap;

    const note = `<text x="210" y="${cy + 6}" text-anchor="middle" fill="#555" font-size="9" font-family="sans-serif">심사위원 상호 간 평가 방식, 합의 구조는 라운드별 상이</text>`;
    const h = cy + 16 - startY;

    const svg = `
    ${sectionHeader("JUDGE PANEL", startY + 15)}
    ${j1}${j2}${j3}
    ${note}`;
    return { svg, height: h };
  }

  // ── [D] ROUND STRUCTURE ──
  // [7] subdesc 별도 줄 + 폰트 확대 + rowH 48
  function renderRounds(startY) {
    const rounds = [
      { tag: "1R", name: "등급 평가", desc: "개인 무대 → 등급 배정", subdesc: "탈락 없음" },
      { tag: "2R", name: "프로듀서 픽", desc: "지명 → 대결 → 탈락 2인", subdesc: "" },
      { tag: "3R", name: "팀 대항전", desc: "팀 매치 → 패자부활 → 3인 생존", subdesc: "~ 합숙 1개월 후" },
      { tag: "4R", name: "최종 선택", desc: "참가자가 프로듀서를 선택", subdesc: "역전 구조" },
    ];

    const rowH = 48;
    const rows = rounds.map((r, i) => {
      const y = startY + 30 + i * rowH;
      const barDelay = `${0.3 + i * 0.15}s`;
      return `
      <g>
        <rect x="${L}" y="${y}" width="32" height="22" rx="4" fill="#c9a84c" opacity="0.15"/>
        <text x="${L + 16}" y="${y + 15}" text-anchor="middle" fill="#c9a84c" font-size="10" font-weight="700" font-family="sans-serif">${r.tag}</text>
        <text x="${L + 42}" y="${y + 11}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${r.name}</text>
        <text x="${L + 42}" y="${y + 24}" fill="#888" font-size="10" font-family="sans-serif">${r.desc}</text>
        ${r.subdesc ? `<text x="${L + 42}" y="${y + 36}" fill="#666" font-size="9" font-family="sans-serif" font-style="italic">${r.subdesc}</text>` : ""}
        <rect x="${L}" y="${y + 40}" width="0" height="1" fill="#c9a84c" opacity="0.3">
          <animate attributeName="width" from="0" to="${contentW}" dur="0.8s" begin="${barDelay}" fill="freeze"/>
        </rect>
      </g>`;
    }).join("");

    const h = 30 + rounds.length * rowH + 10;
    const svg = `
    ${sectionHeader("ROUND STRUCTURE", startY + 15)}
    ${rows}`;
    return { svg, height: h };
  }

  // ── [E] VENUE MAP ──
  // [8] "오시는 길" + 더 코어 프라임 돔 강조
  function renderVenueMap(startY) {
    const zones = [
      { label: "코어", w: 50, color: "#c9a84c" },
      { label: "미들", w: 60, color: "#7ba0d4" },
      { label: "하입", w: 70, color: "#e8e8e8" },
      { label: "테라스", w: 70, color: "#888" },
      { label: "산업", w: 50, color: "#555" },
    ];
    const barH = 24;
    const barY = startY + 34;
    const totalBarW = zones.reduce((a, z) => a + z.w, 0);
    const barStartX = L + (contentW - totalBarW) / 2;

    let cx = barStartX;
    const zoneBars = zones.map((z) => {
      const x = cx;
      cx += z.w;
      const isHighlight = z.label === "코어";
      return `
        <rect x="${x}" y="${barY}" width="${z.w}" height="${barH}" fill="${z.color}" opacity="${isHighlight ? 0.35 : 0.12}" stroke="${z.color}" stroke-width="${isHighlight ? 1.5 : 0.5}" rx="2"/>
        <text x="${x + z.w / 2}" y="${barY + 16}" text-anchor="middle" fill="${isHighlight ? "#fff" : z.color}" font-size="9" font-weight="${isHighlight ? "700" : "400"}" font-family="sans-serif">${isHighlight ? "★ " + z.label : z.label}</text>`;
    }).join("");

    const legendY = barY + barH + 18;
    const legend = `<text x="210" y="${legendY}" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif">★ 프라임 돔 — 더 코어 중앙, 프라임시티</text>`;

    const h = legendY + 12 - startY;
    const svg = `
    ${sectionHeader("오시는 길", startY + 15)}
    ${zoneBars}
    ${legend}`;
    return { svg, height: h };
  }

  // ── [F] MODE COMMANDS ──
  // [9] 소꿉친구 desc 수정
  function renderModes(startY) {
    const mainModes = [
      { icon: "🎤", name: "오디션", trigger: "메인 스토리", desc: "PPP 서바이벌 오디션", accent: "#c9a84c" },
      { icon: "🌆", name: "프리플레이", trigger: "자유 탐색", desc: "도시 탐색 · 사이드 스토리", accent: "#7ba0d4" },
      { icon: "🎬", name: "프로듀서", trigger: "아이돌 육성", desc: "스케줄 · 곡 · 이미지 메이킹", accent: "#b07ad4" },
    ];
    const careerModes = [
      { icon: "📋", name: "매니저", trigger: "!매니저모드", desc: "스케줄 · 위기 · 관계 관리", accent: "#d4a84c" },
      { icon: "✿", name: "연습생", trigger: "!연습생모드", desc: "훈련 · 평가 · 데뷔 게이지", accent: "#6db87a" },
      { icon: "∂", name: "작곡가", trigger: "!작곡가모드", desc: "작곡 → 매칭 → 발매 → 차트", accent: "#7ba0d4" },
      { icon: "▷", name: "배우", trigger: "!배우모드", desc: "캐스팅 → 촬영 → 방영", accent: "#d46b8a" },
      { icon: "◐", name: "인플루언서", trigger: "!인플루언서모드", desc: "콘텐츠 · 바이럴 · 브랜드딜", accent: "#6bacd4" },
    ];
    const utilModes = [
      { icon: "🧩", name: "프리플레이 설정", trigger: "!프리플레이", desc: "유저노트 기반 커스텀 규칙 우선", accent: "#6bacd4" },
      { icon: "📋✦", name: "선택지", trigger: "!선택지", desc: "행동 분기 명시적 제시", accent: "#d4a84c" },
      { icon: "🔍", name: "디테일", trigger: "!디테일", desc: "감각 밀도 ×1.5", accent: "#c9a84c" },
      { icon: "⏩", name: "스킵", trigger: "!스킵", desc: "몽타주 시간 가속", accent: "#888" },
      { icon: "🕶️", name: "비하인드", trigger: "!비하인드", desc: "업계 이면 포커스", accent: "#7ba0d4" },
      { icon: "💫", name: "소꿉친구", trigger: "!소꿉친구", desc: "장그루는 이제 당신의 소꿉친구입니다.", accent: "#b07ad4" },
    ];

    function modeCell(m, x, y, cellH) {
      return `
      <g>
        <rect x="${x}" y="${y}" width="${colW}" height="${cellH}" rx="4" fill="#141428" stroke="#2a2a3a" stroke-width="0.5"/>
        <text x="${x + 10}" y="${y + Math.round(cellH * 0.6)}" font-size="13" font-family="'Segoe UI Emoji','Apple Color Emoji',sans-serif">${m.icon}</text>
        <text x="${x + 32}" y="${y + 16}" fill="${m.accent}" font-size="10" font-weight="700" font-family="sans-serif">${m.name}</text>
        <text x="${x + 32}" y="${y + 30}" fill="#777" font-size="9" font-family="sans-serif">${m.desc}</text>
        <text x="${x + colW - 8}" y="${y + 14}" text-anchor="end" fill="#444" font-size="7.5" font-family="monospace" opacity="0.8">${m.trigger}</text>
      </g>`;
    }

    function renderGrid(modes, label, baseY, cellH) {
      const rowH = cellH + 6;
      let svg = `<text x="${L}" y="${baseY}" fill="#666" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="1.5">${label}</text>`;
      modes.forEach((m, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        svg += modeCell(m, L + col * (colW + gapX), baseY + 10 + row * rowH, cellH);
      });
      const rows = Math.ceil(modes.length / 2);
      return { svg, height: rows * rowH + 24 };
    }

    let cy = startY + 30;
    const main = renderGrid(mainModes, "MAIN STORY", cy, 40);
    cy += main.height;
    const career = renderGrid(careerModes, "CAREER MODES — !명령어로 전환", cy, 40);
    cy += career.height;
    const util = renderGrid(utilModes, "UTILITY MODES — !명령어로 전환", cy, 40);
    cy += util.height;

    const noteY = cy + 2;
    const note = `<text x="${L}" y="${noteY}" fill="#555" font-size="9" font-family="sans-serif">모드 활성화 시 상태창 🔧란에 해당 이모지가 유지됩니다</text>`;

    const h = noteY + 14 - startY;
    const svg = `
    ${sectionHeader("AVAILABLE MODES", startY + 15)}
    ${main.svg}${career.svg}${util.svg}
    ${note}`;
    return { svg, height: h };
  }

  // ── [G] NSFW ASSET TOGGLE ──
  function renderNsfwToggle(startY) {
    const boxY = startY + 6;
    const boxH = 52;
    const svg = `
    <rect x="${L}" y="${boxY}" width="${contentW}" height="${boxH}" rx="6" fill="#1a1020" stroke="#d46b8a" stroke-width="0.5" opacity="0.6"/>
    <text x="${L + 16}" y="${boxY + 17}" fill="#d46b8a" font-size="10" font-weight="600" font-family="sans-serif">🔞 친밀 장면 진입 시 상태창에 🔞가 추가됩니다</text>
    <text x="${L + 16}" y="${boxY + 32}" fill="#888" font-size="9" font-family="sans-serif">일상 복귀 시 자동 해제 · 이미지 DB: NSFW(20-42) + 삽입(50-67) + 착의(70-86)</text>
    <text x="${L + 16}" y="${boxY + 44}" fill="#555" font-size="8" font-family="sans-serif">착의(70-86)는 Clothed NSFW — 성인 에셋이나 직관성을 위해 별도 표기</text>`;
    return { svg, height: boxH + 14 };
  }

  // ── [H] IMAGE OUTPUT ──
  // [10] 글자 겹침 해소 + 전체 폰트 상향
  function renderImageOutput(startY) {
    const charLines = [
      { label: "APEX", codes: "SY  NHR  JSH" },
      { label: "BLUE MOON", codes: "ERK  LSH" },
      { label: "PRISM", codes: "HSR" },
      { label: "ROUTE 0", codes: "KHR" },
      { label: "CONTESTANTS", codes: "JGR  MIL  ELA  MMR  HSE  NIA  RAY  LPS" },
    ];

    let cy = startY + 32;

    // CDN 경로 — 2줄로 분리
    const cdnLine = `
    <text x="${L}" y="${cy}" fill="#666" font-size="10" font-family="sans-serif">CDN: img.bluehair.blue/ent/</text>
    <text x="${R}" y="${cy}" text-anchor="end" fill="#555" font-size="10" font-family="sans-serif">15명 × ~103 = 1,543장</text>`;
    cy += 18;
    const cdnFormat = `
    <text x="${L}" y="${cy}" fill="#c9a84c" font-size="10" font-family="monospace" font-weight="600">{CODE}/{NUM}.webp</text>`;
    cy += 22;

    // 소속사 코드표 — label과 codes 간격 확보
    const charSvg = charLines.map((c) => {
      const line = `
      <text x="${L}" y="${cy}" fill="#555" font-size="8" font-weight="600" font-family="sans-serif" letter-spacing="1">${c.label}</text>
      <text x="${L + 90}" y="${cy}" fill="#666" font-size="9.5" font-family="monospace">${c.codes}</text>`;
      cy += 18;
      return line;
    }).join("");

    // Scene category bars — 확대
    cy += 8;
    const sceneCats = [
      { label: "감정 1–9", n: 9, color: "#c9a84c" },
      { label: "일상 10–19", n: 10, color: "#7ba0d4" },
      { label: "NSFW 20–69", n: 50, color: "#d46b8a" },
      { label: "착의 70–86", n: 17, color: "#6bacd4" },
      { label: "확장 87–92", n: 6, color: "#b07ad4" },
      { label: "무대 93–96", n: 4, color: "#6db87a" },
    ];
    const barW = contentW - 50;
    let barOffset = 0;
    const sceneBars = sceneCats.map((sc) => {
      const w = (sc.n / 96) * barW;
      const x = L + barOffset;
      barOffset += w;
      return `
      <text x="${x + w / 2}" y="${cy}" text-anchor="middle" fill="${sc.color}" font-size="8" font-weight="600" font-family="sans-serif">${sc.label}</text>
      <rect x="${x}" y="${cy + 5}" width="${w}" height="22" fill="${sc.color}" opacity="0.2"/>
      <rect x="${x}" y="${cy + 5}" width="${w}" height="22" fill="none" stroke="${sc.color}" stroke-width="0.5" opacity="0.3"/>`;
    }).join("");
    const barEnd = `<text x="${L + barW + 8}" y="${cy + 18}" fill="#555" font-size="9" font-family="sans-serif">103/char</text>`;
    cy += 36;

    const h = cy - startY;
    const svg = `
    ${sectionHeader("IMAGE OUTPUT SYSTEM", startY + 15)}
    ${cdnLine}
    ${cdnFormat}
    ${charSvg}
    ${sceneBars}
    ${barEnd}`;
    return { svg, height: h };
  }

  // ── [J] FOOTER ──
  function renderFooter(startY) {
    const warnY = startY + 6;
    const svg = `
    <rect x="${L}" y="${warnY}" width="${contentW}" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="${warnY + 14}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">⚠ 본 문서는 심사위원 전용 브리핑입니다</text>
    <text x="210" y="${warnY + 28}" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif">무단 유출 시 프라임시티 방송위원회 규정에 의거하여 제재됩니다</text>
    <text x="210" y="${warnY + 52}" text-anchor="middle" fill="#444" font-size="8" font-family="sans-serif">© PPP Operating Committee · Prime City Broadcasting Authority</text>`;
    return { svg, height: 66 };
  }

  // ══════════════════════════════════════════════
  //  ASSEMBLY — cascade sections with relative Y
  // ══════════════════════════════════════════════

  const header = renderHeader();
  let curY = header.height + 12;

  const briefing = renderBriefing(curY);
  curY += briefing.height + SEC_GAP;

  const divBriefing = divider(curY - 12);
  const judges = renderJudges(curY);
  curY += judges.height + SEC_GAP;

  const divJudges = divider(curY - 12);
  const rounds = renderRounds(curY);
  curY += rounds.height + SEC_GAP;

  const divRounds = divider(curY - 12);
  const venue = renderVenueMap(curY);
  curY += venue.height + SEC_GAP;

  const divVenue = divider(curY - 12);
  const modes = renderModes(curY);
  curY += modes.height + SEC_GAP;

  const divModes = divider(curY - 12);
  const nsfwToggle = renderNsfwToggle(curY);
  curY += nsfwToggle.height + SEC_GAP;

  const divNsfw = divider(curY - 12);
  const imageOutput = renderImageOutput(curY);
  curY += imageOutput.height + SEC_GAP;

  // [11] site link 섹션 제거 — 별도 이미지+하이퍼링크로 대체

  const footer = renderFooter(curY);
  curY += footer.height + 10;

  const totalH = curY + 28;
  const innerH = totalH - 28;
  const screenH = totalH - 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${totalH}">
  <defs>
    <linearGradient id="tablet-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a18"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c9a84c"/>
      <stop offset="100%" stop-color="#8a6d2b"/>
    </linearGradient>
    <linearGradient id="scanline" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="45%" stop-color="#c9a84c" stop-opacity="0.06"/>
      <stop offset="55%" stop-color="#c9a84c" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="screen-clip">
      <rect x="20" y="20" width="380" height="${screenH}" rx="8"/>
    </clipPath>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Tablet frame -->
  <rect width="${W}" height="${totalH}" rx="24" fill="#111" stroke="#2a2a3a" stroke-width="1.5"/>
  <rect x="14" y="14" width="392" height="${innerH}" rx="12" fill="url(#tablet-bg)"/>

  <g clip-path="url(#screen-clip)">

    <!-- Scan line -->
    <rect x="20" y="-100" width="380" height="100" fill="url(#scanline)">
      <animateTransform attributeName="transform" type="translate" from="0 -100" to="0 ${totalH + 100}" dur="8s" repeatCount="indefinite"/>
    </rect>

    ${header.svg}
    ${briefing.svg}
    ${divBriefing}
    ${judges.svg}
    ${divJudges}
    ${rounds.svg}
    ${divRounds}
    ${venue.svg}
    ${divVenue}
    ${modes.svg}
    ${divModes}
    ${nsfwToggle.svg}
    ${divNsfw}
    ${imageOutput.svg}
    ${footer.svg}

    <!-- Corner brackets -->
    <path d="M30,30 L30,50 M30,30 L50,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,30 L390,50 M390,30 L370,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M30,${screenH + 10} L30,${screenH - 10} M30,${screenH + 10} L50,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,${screenH + 10} L390,${screenH - 10} M390,${screenH + 10} L370,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>

  </g>

  <!-- Home indicator -->
  <rect x="170" y="${totalH - 14}" width="80" height="4" rx="2" fill="#333"/>

  <!-- Outer glow -->
  <rect width="${W}" height="${totalH}" rx="24" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.1"/>
</svg>`;
}

// ── Template Definitions ──
export const svgTemplates = [
  {
    id: "sns-post",
    name: "SNS 포스트",
    en: "SNS Post",
    category: "SNS",
    animated: true,
    desc: "Instagram 스타일 SNS 포스트. 프로필, 이미지 영역, 좋아요/댓글 수, 캡션을 표시합니다. 떠오르는 하트 애니메이션 포함.",
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
    desc: "X(Twitter) 스타일 트윗. 프로필, 본문, 리포스트/좋아요 수를 표시합니다. 인게이지먼트 수치 펄스 애니메이션 포함.",
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
    id: "livestream",
    name: "라이브 방송",
    en: "Livestream",
    category: "방송",
    animated: true,
    desc: "스트리밍 플랫폼 스타일 라이브 방송 화면. LIVE 배지 깜빡임 + 채팅 스크롤 애니메이션 포함.",
    params: [
      { name: "streamer", desc: "스트리머명", example: "강하람" },
      { name: "title", desc: "방송 제목", example: "데뷔 연습 라이브! 오늘 열심히 해볼게요" },
      { name: "viewers", desc: "시청자 수", example: "12,847" },
      { name: "category", desc: "카테고리", example: "음악" },
      { name: "chat1", desc: "채팅 메시지 1", example: "화이팅!!!" },
      { name: "chat2", desc: "채팅 메시지 2", example: "목소리 너무 좋다" },
      { name: "chat3", desc: "채팅 메시지 3", example: "앵콜 앵콜!!!" },
      { name: "char", desc: "캐릭터코드 → 아바타/프리뷰 자동", example: "KHR" },
    ],
    sampleParams: {},
    generate: generateLivestream,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateLivestream(p);
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
    promptExample: `■ 라이브 방송 SVG 출력 프롬프트

【라벨 설명】
- streamer: 방송하는 캐릭터 이름
- title: 방송 제목 (캐릭터가 설정한 제목)
- viewers: 실시간 시청자 수
- category: 방송 카테고리 (음악, 토크, 연습 등)
- chat1~chat3: 실시간 채팅 메시지 3개 (시청자 반응)
- avatar: 스트리머 프로필 이미지 URL (선택)
- image: 방송 프리뷰/썸네일 이미지 URL (선택)

【출력 위치】
캐릭터가 라이브 방송을 시작하거나 시청하는 장면에서
장면 전환 직후, 나레이션 최상단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://live.bluehair.blue/ent/?char={캐릭터코드}&streamer={이름}&title={방송제목}&viewers={시청자수}&category={카테고리}&chat1={채팅1}&chat2={채팅2}&chat3={채팅3})

【예시】
![](https://live.bluehair.blue/ent/?char=KHR&streamer=강하람&title=데뷔%20연습%20라이브!%20오늘%20열심히%20해볼게요&viewers=12%2C847&category=음악&chat1=화이팅!!!&chat2=목소리%20너무%20좋다&chat3=앵콜%20앵콜!!!)`,
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
  {
    id: "news",
    name: "뉴스 속보",
    en: "Breaking News",
    category: "방송",
    animated: true,
    desc: "뉴스 방송 스타일 속보 화면. LIVE 표시 깜빡임 + 속보 배너 플래시 + 하단 티커 스크롤 애니메이션.",
    params: [
      { name: "channel", desc: "채널명", example: "PRIME NEWS" },
      { name: "headline", desc: "헤드라인", example: "APEX 엔터 신인 오디션 최종 라운드 돌입" },
      { name: "sub", desc: "부제", example: "나하린 프로듀서 직접 심사" },
      { name: "reporter", desc: "기자명", example: "김기자" },
      { name: "time", desc: "방송 시간", example: "LIVE 오후 8:00" },
      { name: "ticker", desc: "하단 티커 텍스트", example: "프라임시티 엔터테인먼트 지수 사상 최고치 경신" },
      { name: "char", desc: "캐릭터코드 → 뉴스 이미지 자동", example: "SY" },
    ],
    sampleParams: {},
    generate: generateNews,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateNews(p);
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
    promptExample: `■ 뉴스 속보 SVG 출력 프롬프트

【라벨 설명】
- channel: 뉴스 채널명 (예: PRIME NEWS)
- headline: 메인 헤드라인 (사건의 핵심)
- sub: 부제/보충 설명 (한 줄)
- reporter: 기자명
- time: 방송 시각 (LIVE 포함 가능)
- ticker: 하단 스크롤 자막 (관련 속보 요약)
- char: 캐릭터코드 (SY, NHR 등) → 뉴스 이미지 자동 매핑
- image: 뉴스 이미지 직접 지정 (선택, char보다 우선)

【출력 위치】
방송 뉴스가 나오는 장면, 긴급 속보가 전달되는 장면에서
장면 전환 직후 최상단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://news.bluehair.blue/ent/?char={캐릭터코드}&channel={채널명}&headline={헤드라인}&sub={부제}&reporter={기자명}&time={시각}&ticker={자막})

【예시】
![](https://news.bluehair.blue/ent/?char=SY&channel=PRIME%20NEWS&headline=APEX%20엔터%20신인%20오디션%20최종%20라운드%20돌입&sub=나하린%20프로듀서%20직접%20심사&reporter=김기자&time=LIVE%20오후%208:00&ticker=프라임시티%20엔터테인먼트%20지수%20사상%20최고치%20경신)`,
  },
  {
    id: "chart",
    name: "음원 차트",
    en: "Music Chart",
    category: "유틸리티",
    animated: true,
    desc: "음원 차트 랭킹. 1위 골드 글로우 펄스 애니메이션, 변동 화살표, 5곡 표시.",
    params: [
      { name: "chart", desc: "차트명", example: "PRIME CHART" },
      { name: "song1~5", desc: "곡명 5개", example: "Zero Point" },
      { name: "artist1~5", desc: "아티스트 5명", example: "서윤" },
      { name: "change1~5", desc: "변동 (▲/▼/—/NEW)", example: "▲2" },
      { name: "time", desc: "기준 시간", example: "2026.03.22 20:00 기준" },
    ],
    sampleParams: {},
    generate: generateChart,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateChart(p);
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
    promptExample: `■ 음원 차트 SVG 출력 프롬프트

【라벨 설명】
- chart: 차트명 (예: PRIME CHART)
- song1~song5: 1위~5위 곡명
- artist1~artist5: 각 곡의 아티스트명
- change1~change5: 순위 변동 (▲숫자, ▼숫자, —, NEW)
- time: 차트 기준 시각

【출력 위치】
음원 차트 순위가 발표되거나, 캐릭터의 곡이 차트에 진입하는 장면에서
나레이션 하단 또는 장면 전환 시 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://chart.bluehair.blue/ent/?chart={차트명}&song1={곡명1}&artist1={아티스트1}&change1={변동1}&song2={곡명2}&artist2={아티스트2}&change2={변동2}&...&time={기준시각})

【예시】
![](https://chart.bluehair.blue/ent/?chart=PRIME%20CHART&song1=Zero%20Point&artist1=서윤&change1=—&song2=Midnight%20Signal&artist2=이서하&change2=▲2&song3=불꽃처럼&artist3=강하람&change3=NEW&song4=Masquerade&artist4=엘라&change4=▼1&song5=자유낙하&artist5=밀라&change5=▲5&time=2026.03.22%2020:00%20기준)`,
  },
  {
    id: "community",
    name: "커뮤니티 게시판",
    en: "Community Board",
    category: "유틸리티",
    animated: true,
    desc: "DCInside 스타일 커뮤니티 게시판. 다크 테마, 게시글 5개, 페이지네이션, 행 하이라이트 스윕 애니메이션.",
    params: [
      { name: "board", desc: "게시판 이름", example: "프라임시티 갤러리" },
      { name: "post1~5", desc: "게시글 제목 5개", example: "서윤 신곡 뮤비 떴다" },
      { name: "author1~5", desc: "글쓴이 5명", example: "ㅇㅇ" },
      { name: "views1~5", desc: "조회수 5개", example: "2847" },
      { name: "votes1~5", desc: "추천수 5개", example: "142" },
      { name: "page", desc: "현재 페이지", example: "1" },
    ],
    sampleParams: {},
    generate: generateCommunity,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateCommunity(p);
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
    promptExample: `■ 커뮤니티 게시판 SVG 출력 프롬프트

【라벨 설명】
- board: 게시판 이름
- post1~post5: 게시글 제목 5개
- author1~author5: 각 게시글 작성자 닉네임
- views1~views5: 각 게시글 조회수
- votes1~votes5: 각 게시글 추천수
- page: 현재 페이지 번호

【출력 위치】
온라인 커뮤니티 반응이 묘사되는 장면, 캐릭터가 인터넷 여론을 확인하는 장면에서
나레이션 중간 또는 하단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://community.bluehair.blue/ent/?board={게시판명}&post1={제목1}&author1={작성자1}&views1={조회수1}&votes1={추천수1}&...&page={페이지})

【예시】
![](https://community.bluehair.blue/ent/?board=프라임시티%20갤러리&post1=서윤%20신곡%20뮤비%20떴다&author1=ㅇㅇ&views1=2847&votes1=142&post2=오디션%203라운드%20결과%20예측&author2=갤주&views2=1523&votes2=89&post3=강하람%20라이브%20방송%20캡쳐&author3=ㅇㅇ&views3=987&votes3=56&post4=이서하%20작곡%20목록%20정리&author4=음갤러&views4=3241&votes4=201&post5=엘라%20직캠%20모음&author5=ㅇㅇ&views5=1876&votes5=94&page=1)`,
  },
  {
    id: "tablet",
    name: "태블릿 브리핑",
    en: "Tablet Briefing",
    category: "유틸리티",
    animated: true,
    desc: "PPP 오디션 종합 브리핑 태블릿. 심사위원 패널 + 라운드 구조 + 오디션장 약도 + 14개 모드 안내 + NSFW 토글 + 이미지 시스템 + 사이트 링크. 스캔라인 애니메이션.",
    params: [
      { name: "user", desc: "유저(심사위원) 이름", example: "{{user}}" },
      { name: "agency", desc: "유저 소속 기획사", example: "PRISM Studio" },
      { name: "season", desc: "시즌", example: "Season 1" },
      { name: "division", desc: "부문", example: "스테이지" },
      { name: "date", desc: "D-day 또는 날짜", example: "D-7" },
      { name: "judge1", desc: "심사위원1 이름", example: "진시혁" },
      { name: "judge1agency", desc: "심사위원1 소속", example: "APEX Entertainment" },
      { name: "judge2", desc: "심사위원2 이름", example: "에리카" },
      { name: "judge2agency", desc: "심사위원2 소속", example: "Blue Moon Entertainment" },
    ],
    sampleParams: {},
    generate: generateTablet,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateTablet(p);
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
    promptExample: `■ 태블릿 브리핑 SVG 출력 프롬프트

【라벨 설명】
- user: 유저(심사위원) 이름
- agency: 유저 소속 기획사 (기본: PRISM Studio)
- season: 오디션 시즌 (기본: Season 1)
- division: 부문 (기본: 스테이지)
- date: D-day 표시 (기본: D-7)
- judge1, judge1agency: 심사위원1 이름/소속
- judge2, judge2agency: 심사위원2 이름/소속

【포함 섹션】
오디션 브리핑 / 심사위원 패널(프로필 포함) / 라운드 구조(4R, subdesc) /
오디션장 약도(하입 로드 미니맵) / 모드 안내(14개, 3단 구조) /
🔞 NSFW 토글 안내 / 이미지 출력 시스템(15×74) / 사이트 링크(intro.bluehair.blue)

【출력 위치】
오디션 오프닝에서 한소리가 초대장을 건네는 Beat 7에서 출력.
유저가 심사위원으로서 처음으로 오디션 정보를 받는 순간.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://tablet.bluehair.blue/ent/?user={유저이름}&agency={소속기획사}&date={D-day})

【예시】
![](https://tablet.bluehair.blue/ent/?user={{user}}&agency=PRISM%20Studio&date=D-7)`,
  },
];
