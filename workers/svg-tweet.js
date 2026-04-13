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
  <circle cx="${70 + name.length * 11 + 8}" cy="30" r="5" fill="#4a9eff"/>
  <text x="${70 + name.length * 11 + 5}" y="34" fill="#fff" font-size="7" font-family="sans-serif">✓</text>
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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    // Pre-resolve avatar URL → base64 data URI for <img> context compatibility
    const assets = charAssets(p.char);
    const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
    const avatarDataUri = await fetchAsDataUri(avatarUrl);
    if (avatarDataUri) p.avatar = avatarDataUri;
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
};
