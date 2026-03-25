// SYNC: Keep in sync with src/data/svgTemplates.js
function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}

function generateMessenger(p) {
  const contact = p.contact || "이서하";
  const msg1 = p.msg1 || "내일 스튜디오 올 수 있어";
  const msg2 = p.msg2 || "새 곡 작업하려고 하는데";
  const reply1 = p.reply1 || "네! 몇 시에 갈까요";
  const reply2 = p.reply2 || "기대돼요";
  const time = p.time || "오후 9:15";
  const avatarUrl = safeImageUrl(p.avatar);

  const avatarSvg = avatarUrl
    ? `<defs><clipPath id="msg-avatar-clip"><circle cx="56" cy="28" r="16"/></clipPath></defs>
    <image href="${avatarUrl}" x="40" y="12" width="32" height="32" clip-path="url(#msg-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="56" cy="28" r="16" fill="#2a2a4a" stroke="#6ab0f3" stroke-width="1.5"/>
    <text x="56" y="33" text-anchor="middle" fill="#6ab0f3" font-size="12" font-weight="bold" font-family="sans-serif">${contact[0]}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
  <rect width="400" height="480" rx="12" fill="#1a1a2e"/>
  <!-- Top bar -->
  <rect x="0" y="0" width="400" height="56" rx="12 12 0 0" fill="#12122a"/>
  <text x="16" y="32" fill="#888" font-size="16" font-family="sans-serif">←</text>
  ${avatarSvg}
  <text x="82" y="24" fill="#e8e8e8" font-size="14" font-weight="600" font-family="sans-serif">${contact}</text>
  <circle cx="${82 + contact.length * 10 + 8}" cy="20" r="4" fill="#4caf50"/>
  <text x="82" y="40" fill="#4caf50" font-size="10" font-family="sans-serif">온라인</text>
  <!-- Messages -->
  <g transform="translate(0, 80)">
    <!-- Incoming msg 1 -->
    <rect x="16" y="0" width="${Math.min(msg1.length * 11 + 24, 260)}" height="34" rx="16" fill="#2a2a4a"/>
    <text x="28" y="22" fill="#e8e8e8" font-size="13" font-family="sans-serif">${msg1}</text>
    <!-- Incoming msg 2 -->
    <rect x="16" y="44" width="${Math.min(msg2.length * 11 + 24, 260)}" height="34" rx="16" fill="#2a2a4a"/>
    <text x="28" y="66" fill="#e8e8e8" font-size="13" font-family="sans-serif">${msg2}</text>
    <!-- Time -->
    <text x="200" y="102" text-anchor="middle" fill="#555" font-size="10" font-family="sans-serif">${time}</text>
    <!-- Outgoing reply 1 -->
    <rect x="${400 - Math.min(reply1.length * 11 + 24, 260) - 16}" y="116" width="${Math.min(reply1.length * 11 + 24, 260)}" height="34" rx="16" fill="#3a5a8a"/>
    <text x="${400 - Math.min(reply1.length * 11 + 24, 260) - 16 + 12}" y="138" fill="#e8e8e8" font-size="13" font-family="sans-serif">${reply1}</text>
    <!-- Outgoing reply 2 -->
    <rect x="${400 - Math.min(reply2.length * 11 + 24, 260) - 16}" y="160" width="${Math.min(reply2.length * 11 + 24, 260)}" height="34" rx="16" fill="#3a5a8a"/>
    <text x="${400 - Math.min(reply2.length * 11 + 24, 260) - 16 + 12}" y="182" fill="#e8e8e8" font-size="13" font-family="sans-serif">${reply2}</text>
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

export default {
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
};
