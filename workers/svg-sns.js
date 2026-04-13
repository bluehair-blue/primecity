// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
// SYNC: Keep in sync with src/data/svgTemplates.js
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeImageUrl(url) {
  if (!url) return null;
  if (typeof url === "string" && url.startsWith("data:")) return url;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}
async function fetchAsDataUri(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "image/webp";
    const buf = new Uint8Array(await res.arrayBuffer());
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
// CDN asset mapping (mirrors src/data/svgTemplates.js charAssets)
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

function generateSnsPost(p) {
  const username = p.username || "seoyun_official";
  const caption = p.caption || "프라임시티의 밤은 끝나지 않는다.";
  const likes = p.likes || "24,891";
  const comments = p.comments || "1,204";
  const time = p.time || "2시간 전";
  const location = p.location || "The Core, Prime City";
  const assets = charAssets(p.char);
  const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
  const imageUrl  = safeImageUrl(p.image)  || safeImageUrl(assets.post);

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
    <circle cx="${52 + username.length * 7 + 8}" cy="18" r="5" fill="#4a9eff"/>
    <text x="${52 + username.length * 7 + 5}" y="22" fill="#fff" font-size="8" font-family="sans-serif">✓</text>
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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    // Pre-resolve image URLs → base64 data URI for <img> context compatibility
    const assets = charAssets(p.char);
    const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
    const imageUrl  = safeImageUrl(p.image)  || safeImageUrl(assets.post);
    const [avatarDataUri, imageDataUri] = await Promise.all([
      fetchAsDataUri(avatarUrl),
      fetchAsDataUri(imageUrl),
    ]);
    if (avatarDataUri) p.avatar = avatarDataUri;
    if (imageDataUri)  p.image  = imageDataUri;
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
};
