function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// SYNC: Keep in sync with src/data/svgTemplates.js
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
    const paramTitle = p[`post${escapeXml(n)}`];
    if (paramTitle) {
      posts.push({
        title: paramTitle,
        author: p[`author${escapeXml(n)}`] || "ㅇㅇ",
        views: p[`views${escapeXml(n)}`] || "0",
        votes: p[`votes${escapeXml(n)}`] || "0",
        comments: p[`comments${escapeXml(n)}`] || "",
        notice: p[`notice${escapeXml(n)}`] === "1",
        img: p[`img${escapeXml(n)}`] === "1",
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
      <text x="54" y="20" fill="${titleColor}" font-size="11" font-family="sans-serif">${escapeXml(truncTitle)}${escapeXml(commentTag)}${escapeXml(imgTag)}</text>
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
    return `<text x="${i * 24}" y="0" fill="${active ? "#c9a84c" : "#888"}" font-size="11" font-weight="${active ? 700 : 400}" font-family="sans-serif">${escapeXml(n)}</text>`;
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
  <text x="20" y="44" fill="#666" font-size="9.5" font-family="sans-serif">전체글 ${escapeXml(posts.length)}개 · 페이지 ${escapeXml(page)}</text>
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
    ${escapeXml(rows)}
  </g>

  <!-- Pagination -->
  <g transform="translate(0,${headerH + colH + listH})">
    <rect width="400" height="${footerH}" rx="0 0 12 12" fill="#1a1a2e"/>
    <text x="140" y="28" fill="#555" font-size="11" font-family="sans-serif">&lt;</text>
    <g transform="translate(158,28)">
      ${escapeXml(paginationItems)}
    </g>
    <text x="262" y="28" fill="#555" font-size="11" font-family="sans-serif">&gt;</text>
  </g>

  <!-- Border -->
  <rect width="400" height="${totalH}" rx="12" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
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
