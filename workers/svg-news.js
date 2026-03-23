// Reference: Breaking News SVG Worker
// Deploy separately to Cloudflare Workers
// Usage: ![](https://svg-news.your-worker.dev/?channel=PRIME NEWS&headline=APEX 엔터, 신인 오디션 최종 라운드 돌입&sub=나하린 프로듀서 직접 심사&reporter=김기자&time=LIVE 오후 8:00&ticker=프라임시티 엔터테인먼트 지수 사상 최고치)

function generateNews(p) {
  const channel = p.channel || "PRIME NEWS";
  const headline = p.headline || "APEX 엔터, 신인 오디션 최종 라운드 돌입";
  const sub = p.sub || "나하린 프로듀서 직접 심사... 역대 최대 규모 시청자 기록";
  const reporter = p.reporter || "김기자";
  const time = p.time || "LIVE 오후 8:00";
  const ticker = p.ticker || "프라임시티 엔터테인먼트 지수 사상 최고치 경신 ▲ APEX 주가 +12.4% ▲ 더 코어 부동산 가격 급등";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280">
  <rect width="500" height="280" rx="8" fill="#0a0a1a"/>
  <!-- Channel bar -->
  <rect x="0" y="0" width="500" height="40" fill="#1a1a2e"/>
  <text x="16" y="26" fill="#c9a84c" font-size="14" font-weight="700" font-family="sans-serif">${channel}</text>
  <rect x="140" y="10" width="50" height="20" rx="3" fill="#e03e3e">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="165" y="24" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="sans-serif">LIVE</text>
  <text x="440" y="26" fill="#888" font-size="11" font-family="sans-serif">${time}</text>
  <!-- Breaking banner -->
  <rect x="0" y="44" width="500" height="32" fill="#c62828"/>
  <text x="16" y="65" fill="#fff" font-size="13" font-weight="700" font-family="sans-serif">⚡ 속보 BREAKING</text>
  <!-- Headline -->
  <text x="16" y="108" fill="#e8e8e8" font-size="18" font-weight="700" font-family="sans-serif">${headline.substring(0, 30)}</text>
  ${headline.length > 30 ? `<text x="16" y="132" fill="#e8e8e8" font-size="18" font-weight="700" font-family="sans-serif">${headline.substring(30, 60)}</text>` : ""}
  <!-- Sub -->
  <text x="16" y="${headline.length > 30 ? 158 : 134}" fill="#aaa" font-size="13" font-family="sans-serif">${sub.substring(0, 42)}</text>
  <!-- Reporter -->
  <text x="16" y="${headline.length > 30 ? 186 : 162}" fill="#888" font-size="11" font-family="sans-serif">${reporter} 기자</text>
  <!-- Ticker bar -->
  <rect x="0" y="240" width="500" height="40" fill="#12122a"/>
  <clipPath id="ticker-clip"><rect x="0" y="240" width="500" height="40"/></clipPath>
  <g clip-path="url(#ticker-clip)">
    <text y="264" fill="#c9a84c" font-size="12" font-family="sans-serif">
      <tspan>${ticker}</tspan>
      <animateTransform attributeName="transform" type="translate" from="500 0" to="-1200 0" dur="20s" repeatCount="indefinite"/>
    </text>
  </g>
  <rect width="500" height="280" rx="8" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

export default {
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
};
