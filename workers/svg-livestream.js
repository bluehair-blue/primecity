// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
// SYNC: Keep in sync with src/data/svgTemplates.js
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}

function generateLivestream(p) {
  const streamer = p.streamer || "강하람";
  const title = p.title || "데뷔 연습 라이브! 오늘 열심히 해볼게요";
  const viewers = p.viewers || "12,847";
  const category = p.category || "음악";
  const chat1 = p.chat1 || "화이팅!!!";
  const chat2 = p.chat2 || "목소리 너무 좋다";
  const chat3 = p.chat3 || "앵콜 앵콜!!!";
  const avatarUrl = safeImageUrl(p.avatar);
  const imageUrl = safeImageUrl(p.image);

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

export default {
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
};
