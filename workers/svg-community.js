// SYNC: Keep in sync with src/data/svgTemplates.js
function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}

function generateCommunity(p) {
  const board = p.board || "\ud504\ub77c\uc784\uc2dc\ud2f0 \uac24\ub7ec\ub9ac";
  const page = p.page || "1";
  const posts = [
    { num: 1, title: p.post1 || "\uc11c\uc724 \uc2e0\uace1 \ubba4\ube44 \ub5b4\ub2e4", author: p.author1 || "\u3147\u3147", views: p.views1 || "2847", votes: p.votes1 || "142" },
    { num: 2, title: p.post2 || "\uc624\ub514\uc158 3\ub77c\uc6b4\ub4dc \uacb0\uacfc \uc608\uce21", author: p.author2 || "\uac24\uc8fc", views: p.views2 || "1523", votes: p.votes2 || "89" },
    { num: 3, title: p.post3 || "\uac15\ud558\ub78c \ub77c\uc774\ube0c \ubc29\uc1a1 \uce90\uccd0", author: p.author3 || "\u3147\u3147", views: p.views3 || "987", votes: p.votes3 || "56" },
    { num: 4, title: p.post4 || "\uc774\uc11c\ud558 \uc791\uace1 \ubaa9\ub85d \uc815\ub9ac", author: p.author4 || "\uc74c\uac24\ub7ec", views: p.views4 || "3241", votes: p.votes4 || "201" },
    { num: 5, title: p.post5 || "\uc5d8\ub77c \uc9c1\uce84 \ubaa8\uc74c", author: p.author5 || "\u3147\u3147", views: p.views5 || "1876", votes: p.votes5 || "94" },
  ];

  const headerY = 80;
  const rowHeight = 36;
  const rowStartY = headerY + 30;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
  <defs>
    <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="50%" stop-color="#c9a84c" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="480" rx="12" fill="#0e0e1a"/>
  <!-- Header -->
  <rect x="0" y="0" width="400" height="60" rx="12 12 0 0" fill="#1a1a2e"/>
  <text x="20" y="28" fill="#c9a84c" font-size="16" font-weight="700" font-family="sans-serif">\ud83d\udccb ${board}</text>
  <text x="20" y="48" fill="#666" font-size="10" font-family="sans-serif">\uac8c\uc2dc\ud310</text>
  <!-- Column headers -->
  <rect x="0" y="${headerY - 8}" width="400" height="28" fill="#141428"/>
  <text x="30" y="${headerY + 10}" text-anchor="middle" fill="#888" font-size="9" font-weight="600" font-family="sans-serif">No.</text>
  <text x="160" y="${headerY + 10}" text-anchor="middle" fill="#888" font-size="9" font-weight="600" font-family="sans-serif">\uc81c\ubaa9</text>
  <text x="280" y="${headerY + 10}" text-anchor="middle" fill="#888" font-size="9" font-weight="600" font-family="sans-serif">\uae00\uc4f4\uc774</text>
  <text x="330" y="${headerY + 10}" text-anchor="middle" fill="#888" font-size="9" font-weight="600" font-family="sans-serif">\uc870\ud68c</text>
  <text x="375" y="${headerY + 10}" text-anchor="middle" fill="#888" font-size="9" font-weight="600" font-family="sans-serif">\ucd94\ucc9c</text>
  <!-- Rows -->
  ${posts.map((post, i) => {
    const rowY = rowStartY + i * rowHeight;
    const bgColor = i % 2 === 0 ? "#0e0e1a" : "#141428";
    return `
    <rect x="0" y="${rowY}" width="400" height="${rowHeight}" fill="${bgColor}"/>
    <rect x="0" y="${rowY}" width="400" height="${rowHeight}" fill="url(#sweep-grad)" opacity="0">
      <animate attributeName="opacity" values="0;0.15;0" dur="4s" begin="${i * 0.5}s" repeatCount="indefinite"/>
    </rect>
    <text x="30" y="${rowY + 22}" text-anchor="middle" fill="#555" font-size="10" font-family="sans-serif">${post.num}</text>
    <text x="60" y="${rowY + 22}" fill="#e8e8e8" font-size="11" font-family="sans-serif">${post.title.substring(0, 18)}</text>
    <text x="280" y="${rowY + 22}" text-anchor="middle" fill="#888" font-size="10" font-family="sans-serif">${post.author}</text>
    <text x="330" y="${rowY + 22}" text-anchor="middle" fill="#666" font-size="10" font-family="sans-serif">${post.views}</text>
    <text x="375" y="${rowY + 22}" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="sans-serif">${post.votes}</text>
    <line x1="0" y1="${rowY + rowHeight}" x2="400" y2="${rowY + rowHeight}" stroke="#1a1a2e" stroke-width="0.5"/>`;
  }).join("")}
  <!-- Pagination -->
  <g transform="translate(140, 420)">
    <text x="0" y="0" fill="#555" font-size="12" font-family="sans-serif">&lt;</text>
    <text x="20" y="0" fill="${page === "1" ? "#c9a84c" : "#888"}" font-size="12" font-weight="${page === "1" ? "700" : "400"}" font-family="sans-serif">1</text>
    <text x="40" y="0" fill="${page === "2" ? "#c9a84c" : "#888"}" font-size="12" font-weight="${page === "2" ? "700" : "400"}" font-family="sans-serif">2</text>
    <text x="60" y="0" fill="${page === "3" ? "#c9a84c" : "#888"}" font-size="12" font-weight="${page === "3" ? "700" : "400"}" font-family="sans-serif">3</text>
    <text x="80" y="0" fill="${page === "4" ? "#c9a84c" : "#888"}" font-size="12" font-weight="${page === "4" ? "700" : "400"}" font-family="sans-serif">4</text>
    <text x="100" y="0" fill="${page === "5" ? "#c9a84c" : "#888"}" font-size="12" font-weight="${page === "5" ? "700" : "400"}" font-family="sans-serif">5</text>
    <text x="120" y="0" fill="#555" font-size="12" font-family="sans-serif">&gt;</text>
  </g>
  <rect width="400" height="480" rx="12" fill="none" stroke="#1a1a2e" stroke-width="1"/>
</svg>`;
}

export default {
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
};
