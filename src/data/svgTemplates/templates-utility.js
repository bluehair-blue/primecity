// ── Utility Templates: Music Chart, Community Board, Community Post ──

import { escapeXml, charAssets, safeImageUrl, wrapBodyPost } from "./helpers.js";

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

// ── 7. Community Board (CITY BOARD-style) ──
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

// ── 8. Community Post (CITY BOARD-style single post) ──
// SYNC: Keep in sync with workers/svg-post.js
function generatePost(p) {
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

  const bodyLines = wrapBodyPost(body, 36, 8);
  const bodyLineH = 22;
  const bodyTextH = bodyLines.length * bodyLineH;
  const imageH = imageUrl ? 160 : 0;
  const imageGap = imageUrl ? 14 : 0;
  const bodyH = 18 + bodyTextH + imageGap + imageH + 18;

  const commentList = [];
  for (let i = 1; i <= 5; i++) {
    const text = p[`c${i}`];
    if (!text) continue;
    commentList.push({
      text:   text,
      author: p[`c${i}author`] || "ㅇㅇ",
      ip:     p[`c${i}ip`]     || "182.41",
      votes:  p[`c${i}votes`]  || "0",
      time:   p[`c${i}time`]   || `${i + 1}분`,
      reply:  p[`c${i}reply`]  === "1",
    });
  }
  if (commentList.length === 0) {
    commentList.push(
      { text: "완전 공감 ㅋㅋ", author: "음갤러", ip: "210.11", votes: "15", time: "5분", reply: false },
      { text: "서윤 최고지", author: "ㅇㅇ", ip: "58.32", votes: "8", time: "8분", reply: false },
      { text: "인정 ㄹㅇ", author: "ㅇㅇ", ip: "58.32", votes: "2", time: "10분", reply: true },
      { text: "노래 수준 미쳤음", author: "팬덤", ip: "119.45", votes: "4", time: "12분", reply: false },
    );
  }

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

  const yTitle    = headerH;
  const yMeta     = yTitle + titleH;
  const yBody     = yMeta + metaH;
  const yVote     = yBody + bodyH;
  const yCmtHead  = yVote + voteH;
  const yCmtList  = yCmtHead + commentHeaderH;
  const yFooter   = totalH - footerH;

  const titleMaxLen = 28;
  const titleLine1 = title.length > titleMaxLen ? title.substring(0, titleMaxLen) : title;
  const titleLine2 = title.length > titleMaxLen ? title.substring(titleMaxLen, titleMaxLen * 2) : "";

  const bodyTextMarkup = bodyLines.map((line, i) => {
    const ly = yBody + 28 + i * bodyLineH;
    return `<text x="22" y="${ly}" fill="#d4d4d4" font-size="12" font-family="sans-serif">${escapeXml(line)}</text>`;
  }).join("");

  const bodyImageMarkup = imageUrl
    ? `<defs><clipPath id="post-img-clip"><rect x="${(W - 280) / 2}" y="${yBody + 28 + bodyTextH + imageGap}" width="280" height="${imageH}" rx="6"/></clipPath></defs>
  <image href="${escapeXml(imageUrl)}" x="${(W - 280) / 2}" y="${yBody + 28 + bodyTextH + imageGap}" width="280" height="${imageH}" clip-path="url(#post-img-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : "";

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

  <!-- Sweep highlight -->
  <rect width="${W}" height="${totalH}" fill="url(#post-sweep)" opacity="0">
    <animate attributeName="opacity" values="0;0.6;0" dur="6s" repeatCount="indefinite"/>
  </rect>

  <!-- Border -->
  <rect width="${W}" height="${totalH}" rx="12" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
</svg>`;
}

export const utilitySvgTemplates = [
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
    desc: "CITY BOARD(시티보드) 스타일 커뮤니티 게시판. 다크 테마, 게시글 5개, 페이지네이션, 행 하이라이트 스윕 애니메이션.",
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
    id: "post",
    name: "커뮤니티 게시글",
    en: "Community Post",
    category: "유틸리티",
    animated: true,
    desc: "CITY BOARD(시티보드) 스타일 단일 게시글. 제목/작성자(IP)/날짜/조회·추천/본문(8줄)/이미지/추천비추 버튼/댓글 5개(ㄴ대댓글). 게시글 내부를 정독하는 장면용.",
    params: [
      { name: "board", desc: "갤러리 이름", example: "프라임시티 갤러리" },
      { name: "num", desc: "게시글 번호", example: "1024" },
      { name: "title", desc: "글 제목", example: "서윤 신곡 뮤비 떴다 ㄷㄷ" },
      { name: "author", desc: "작성자 닉네임", example: "ㅇㅇ" },
      { name: "ip", desc: "작성자 IP 앞부분", example: "121.55" },
      { name: "date", desc: "작성 일시", example: "2026.04.12 18:23" },
      { name: "views", desc: "조회수", example: "2,847" },
      { name: "votes", desc: "추천수", example: "142" },
      { name: "dn", desc: "비추수", example: "3" },
      { name: "comments", desc: "댓글 총 개수", example: "24" },
      { name: "body", desc: "본문 (줄바꿈 %0A, 자동 단어랩)", example: "어제 공개된 뮤비 봤음?%0A진심 인생곡임" },
      { name: "char", desc: "캐릭터코드 → 본문 이미지 자동", example: "SY" },
      { name: "c1~5", desc: "댓글 본문 5개", example: "완전 공감 ㅋㅋ" },
      { name: "c1~5author", desc: "댓글 작성자", example: "음갤러" },
      { name: "c1~5ip", desc: "댓글 IP", example: "210.11" },
      { name: "c1~5votes", desc: "댓글 추천수", example: "15" },
      { name: "c1~5time", desc: "댓글 시간", example: "5분" },
      { name: "c1~5reply", desc: "1이면 ㄴ 대댓글 들여쓰기", example: "1" },
    ],
    sampleParams: {},
    generate: generatePost,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
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
};`,
    promptExample: `■ 커뮤니티 게시글 SVG 출력 프롬프트

【라벨 설명】
- board: 갤러리 이름
- num: 게시글 번호
- title: 글 제목
- author: 작성자 닉네임 (보통 ㅇㅇ)
- ip: 작성자 IP 앞부분 (예: 121.55)
- date: 작성 일시
- views / votes / dn / comments: 조회·추천·비추·댓글 수
- body: 본문 텍스트 (%0A로 줄바꿈, 자동 단어랩 36자/줄, 최대 8줄)
- char: 캐릭터코드 (SY, NHR 등) → 본문 이미지 자동 매핑
- image: 본문 이미지 직접 지정 (선택, char보다 우선)
- c1~c5: 댓글 본문 (최대 5개)
- c1~c5author / c1~c5ip / c1~c5votes / c1~c5time: 각 댓글 메타
- c1~c5reply: "1"이면 ㄴ 대댓글 들여쓰기

【출력 위치】
캐릭터가 커뮤니티 게시글을 직접 정독하는 장면, 인터넷 여론의 한 글을
구체적으로 인용하는 장면에서 나레이션 중간에 출력. 게시판 목록은 svg-community 사용.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F / 줄바꿈 → %0A
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://post.bluehair.blue/ent/?char={캐릭터코드}&board={갤러리}&title={제목}&author={닉}&ip={IP}&date={일시}&views={조회}&votes={추천}&comments={댓글수}&body={본문}&c1={댓글1})

【예시】
![](https://post.bluehair.blue/ent/?char=SY&board=프라임시티%20갤러리&num=1024&title=서윤%20신곡%20뮤비%20떴다%20ㄷㄷ&author=ㅇㅇ&ip=121.55&date=2026.04.12%2018:23&views=2%2C847&votes=142&dn=3&comments=24&body=어제%20공개된%20뮤비%20봤음?%0A진심%20인생곡임%0A%0A후렴구%20좋다고%20난리남&c1=완전%20공감%20ㅋㅋ&c1author=음갤러&c1ip=210.11&c1votes=15&c2=서윤%20최고지&c2author=ㅇㅇ&c2ip=58.32&c2votes=8&c3=인정%20ㄹㅇ&c3author=ㅇㅇ&c3ip=58.32&c3votes=2&c3reply=1)`,
  },
];
