// SYNC: Keep in sync with src/data/svgTemplates.js
function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}

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
  <text x="200" y="36" text-anchor="middle" fill="#c9a84c" font-size="16" font-weight="700" font-family="sans-serif">${chart}</text>
  <text x="200" y="56" text-anchor="middle" fill="#666" font-size="10" font-family="sans-serif">${time}</text>
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
      <text x="36" y="18" text-anchor="middle" fill="${isFirst ? "#c9a84c" : "#888"}" font-size="${isFirst ? 24 : 18}" font-weight="700" font-family="sans-serif">${s.rank}</text>
      <text x="68" y="12" fill="#e8e8e8" font-size="14" font-weight="${isFirst ? 700 : 500}" font-family="sans-serif">${s.song}</text>
      <text x="68" y="32" fill="#888" font-size="11" font-family="sans-serif">${s.artist}</text>
      <text x="360" y="18" text-anchor="end" fill="${changeColor}" font-size="12" font-weight="600" font-family="sans-serif">${s.change}</text>
    </g>`;
  }).join("")}
  <rect width="400" height="480" rx="12" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

export default {
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
};
