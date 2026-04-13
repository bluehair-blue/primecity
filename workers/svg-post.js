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

// ── Body word wrap: split by \n then hard-wrap at maxChars (Korean-safe char count) ──
function wrapBody(text, maxChars, maxLines) {
  if (!text) return [];
  const paragraphs = String(text).split(/\\n|\n/);
  const lines = [];
  for (const para of paragraphs) {
    if (para === "") { lines.push(""); continue; }
    let cur = "";
    for (const ch of para) {
      cur += ch;
      if (cur.length >= maxChars) { lines.push(cur); cur = ""; }
    }
    if (cur) lines.push(cur);
    if (lines.length >= maxLines) break;
  }
  return lines.slice(0, maxLines);
}

function generatePost(p) {
  // ── Defaults ──
  const board   = p.board   || "프라임시티 갤러리";
  const num     = p.num     || "1024";
  const title   = p.title   || "서윤 신곡 뮤비 떴다 ㄷㄷ";
  const author  = p.author  || "ㅇㅇ";
  const ip      = p.ip      || "121.55";
  const date    = p.date    || "2026.04.12 18:23";
  const views   = p.views   || "2,847";
  const votes   = p.votes   || "142";
  const dn      = p.dn      || "3";
  const comments= p.comments|| "24";
  const body    = p.body    || "어제 공개된 뮤비 봤음?\n진심 인생곡임\n\n후렴구 좋다고 난리남";

  const assets = charAssets(p.char);
  const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.post);

  // ── Body wrap ──
  const bodyLines = wrapBody(body, 36, 8);
  const bodyLineH = 22;
  const bodyTextH = bodyLines.length * bodyLineH;
  const imageH = imageUrl ? 160 : 0;
  const imageGap = imageUrl ? 14 : 0;
  const bodyH = 18 + bodyTextH + imageGap + imageH + 18;

  // ── Comments parse (c1~c5) ──
  const commentList = [];
  for (let i = 1; i <= 5; i++) {
    const text = p[`c${i}`];
    if (!text) continue;
    commentList.push({
      text:    text,
      author:  p[`c${i}author`] || "ㅇㅇ",
      ip:      p[`c${i}ip`]     || "182.41",
      votes:   p[`c${i}votes`]  || "0",
      time:    p[`c${i}time`]   || `${i + 1}분`,
      reply:   p[`c${i}reply`]  === "1",
    });
  }
  // Defaults if no comments provided
  if (commentList.length === 0) {
    commentList.push(
      { text: "완전 공감 ㅋㅋ", author: "음갤러", ip: "210.11", votes: "15", time: "5분", reply: false },
      { text: "서윤 최고지", author: "ㅇㅇ", ip: "58.32", votes: "8", time: "8분", reply: false },
      { text: "인정 ㄹㅇ", author: "ㅇㅇ", ip: "58.32", votes: "2", time: "10분", reply: true },
      { text: "노래 수준 미쳤음", author: "팬덤", ip: "119.45", votes: "4", time: "12분", reply: false },
    );
  }

  // ── Layout constants ──
  const W = 460;
  const headerH = 38;
  const titleH = title.length > 28 ? 78 : 58;
  const metaH = 40;
  const voteH = 56;
  const commentHeaderH = 30;
  const commentRowH = 48;
  const commentsH = commentHeaderH + commentList.length * commentRowH;
  const footerH = 40;
  const totalH = headerH + titleH + metaH + bodyH + voteH + commentsH + footerH;

  // Section Y offsets
  const yTitle    = headerH;
  const yMeta     = yTitle + titleH;
  const yBody     = yMeta + metaH;
  const yVote     = yBody + bodyH;
  const yCmtHead  = yVote + voteH;
  const yCmtList  = yCmtHead + commentHeaderH;
  const yFooter   = totalH - footerH;

  // ── Title (1 or 2 lines) ──
  const titleMaxLen = 28;
  const titleLine1 = title.length > titleMaxLen ? title.substring(0, titleMaxLen) : title;
  const titleLine2 = title.length > titleMaxLen ? title.substring(titleMaxLen, titleMaxLen * 2) : "";

  // ── Body markup ──
  const bodyTextMarkup = bodyLines.map((line, i) => {
    const ly = yBody + 28 + i * bodyLineH;
    return `<text x="22" y="${ly}" fill="#d4d4d4" font-size="12" font-family="sans-serif">${escapeXml(line)}</text>`;
  }).join("");

  const bodyImageMarkup = imageUrl
    ? `<defs><clipPath id="post-img-clip"><rect x="${(W - 280) / 2}" y="${yBody + 28 + bodyTextH + imageGap}" width="280" height="${imageH}" rx="6"/></clipPath></defs>
  <image href="${escapeXml(imageUrl)}" x="${(W - 280) / 2}" y="${yBody + 28 + bodyTextH + imageGap}" width="280" height="${imageH}" clip-path="url(#post-img-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : "";

  // ── Comments markup ──
  const commentsMarkup = commentList.map((c, i) => {
    const cy = yCmtList + i * commentRowH;
    const indent = c.reply ? 28 : 0;
    const replyMark = c.reply ? `<text x="${20 + indent - 14}" y="${cy + 14}" fill="#555" font-size="11" font-family="sans-serif">ㄴ</text>` : "";
    return `
    <g>
      ${replyMark}
      <text x="${20 + indent}" y="${cy + 14}" fill="#888" font-size="9.5" font-weight="600" font-family="sans-serif">${escapeXml(c.author)}</text>
      <text x="${20 + indent + c.author.length * 8 + 4}" y="${cy + 14}" fill="#555" font-size="8.5" font-family="monospace">(${escapeXml(c.ip)})</text>
      <text x="${W - 20}" y="${cy + 14}" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">${escapeXml(c.time)}</text>
      <text x="${W - 56}" y="${cy + 14}" text-anchor="end" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif">▲${escapeXml(c.votes)}</text>
      <text x="${20 + indent}" y="${cy + 32}" fill="#d4d4d4" font-size="11" font-family="sans-serif">${escapeXml(c.text)}</text>
      <line x1="20" y1="${cy + 44}" x2="${W - 20}" y2="${cy + 44}" stroke="#1a1a2e" stroke-width="0.5"/>
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${totalH}">
  <defs>
    <linearGradient id="post-sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="50%" stop-color="#c9a84c" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${totalH}" rx="12" fill="#0e0e1a"/>

  <!-- Header bar -->
  <rect width="${W}" height="${headerH}" rx="12 12 0 0" fill="#1a1a2e"/>
  <text x="20" y="24" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif">📋 ${escapeXml(board)}</text>
  <text x="${W - 20}" y="24" text-anchor="end" fill="#666" font-size="10" font-family="monospace">No.${escapeXml(num)}</text>
  <line x1="0" y1="${headerH}" x2="${W}" y2="${headerH}" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>

  <!-- Title -->
  <text x="20" y="${yTitle + 32}" fill="#e8e8e8" font-size="16" font-weight="700" font-family="sans-serif">${escapeXml(titleLine1)}</text>
  ${titleLine2 ? `<text x="20" y="${yTitle + 56}" fill="#e8e8e8" font-size="16" font-weight="700" font-family="sans-serif">${escapeXml(titleLine2)}</text>` : ""}

  <!-- Meta -->
  <g transform="translate(0, ${yMeta})">
    <text x="20" y="14" fill="#888" font-size="10" font-weight="600" font-family="sans-serif">${escapeXml(author)}</text>
    <text x="${20 + author.length * 8 + 4}" y="14" fill="#555" font-size="9" font-family="monospace">(${escapeXml(ip)})</text>
    <text x="${W - 20}" y="14" text-anchor="end" fill="#666" font-size="9.5" font-family="sans-serif">${escapeXml(date)}</text>
    <text x="20" y="30" fill="#666" font-size="9.5" font-family="sans-serif">조회 ${escapeXml(views)} · 추천 <tspan fill="#c9a84c" font-weight="700">${escapeXml(votes)}</tspan> · 댓글 <tspan fill="#c9a84c" font-weight="700">${escapeXml(comments)}</tspan></text>
    <line x1="20" y1="38" x2="${W - 20}" y2="38" stroke="#222" stroke-width="0.5"/>
  </g>

  <!-- Body -->
  ${bodyTextMarkup}
  ${bodyImageMarkup}
  <line x1="20" y1="${yVote - 4}" x2="${W - 20}" y2="${yVote - 4}" stroke="#222" stroke-width="0.5"/>

  <!-- Vote buttons -->
  <g transform="translate(0, ${yVote})">
    <rect x="${W / 2 - 110}" y="6" width="100" height="40" rx="20" fill="#1a1428" stroke="#c9a84c" stroke-width="0.8" opacity="0.85"/>
    <text x="${W / 2 - 60}" y="22" text-anchor="middle" fill="#c9a84c" font-size="9" font-family="sans-serif">▲ 추천</text>
    <text x="${W / 2 - 60}" y="38" text-anchor="middle" fill="#c9a84c" font-size="14" font-weight="700" font-family="sans-serif">${escapeXml(votes)}</text>

    <rect x="${W / 2 + 10}" y="6" width="100" height="40" rx="20" fill="#101822" stroke="#3a5a8a" stroke-width="0.8" opacity="0.85"/>
    <text x="${W / 2 + 60}" y="22" text-anchor="middle" fill="#6ab0f3" font-size="9" font-family="sans-serif">▼ 비추</text>
    <text x="${W / 2 + 60}" y="38" text-anchor="middle" fill="#6ab0f3" font-size="14" font-weight="700" font-family="sans-serif">${escapeXml(dn)}</text>
  </g>

  <!-- Comments header -->
  <g transform="translate(0, ${yCmtHead})">
    <rect width="${W}" height="${commentHeaderH}" fill="#141428"/>
    <text x="20" y="20" fill="#c9a84c" font-size="11" font-weight="700" font-family="sans-serif">💬 댓글 ${escapeXml(comments)}개</text>
    <line x1="0" y1="${commentHeaderH}" x2="${W}" y2="${commentHeaderH}" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
  </g>

  <!-- Comments list -->
  ${commentsMarkup}

  <!-- Footer -->
  <g transform="translate(0, ${yFooter})">
    <rect width="${W}" height="${footerH}" rx="0 0 12 12" fill="#1a1a2e"/>
    <text x="20" y="25" fill="#888" font-size="11" font-family="sans-serif">◀ 목록</text>
    <rect x="${W - 84}" y="9" width="64" height="22" rx="4" fill="#c9a84c"/>
    <text x="${W - 52}" y="24" text-anchor="middle" fill="#0e0e1a" font-size="10" font-weight="700" font-family="sans-serif">글쓰기</text>
  </g>

  <!-- Sweep highlight (subtle animation) -->
  <rect width="${W}" height="${totalH}" fill="url(#post-sweep)" opacity="0">
    <animate attributeName="opacity" values="0;0.6;0" dur="6s" repeatCount="indefinite"/>
  </rect>

  <!-- Border -->
  <rect width="${W}" height="${totalH}" rx="12" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
</svg>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    // Pre-resolve image URL → base64 data URI for <img> context compatibility
    const assets = charAssets(p.char);
    const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.post);
    const imageDataUri = await fetchAsDataUri(imageUrl);
    if (imageDataUri) p.image = imageDataUri;
    const svg = generatePost(p);
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
