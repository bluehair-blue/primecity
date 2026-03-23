// Reference: SNS Post SVG Worker
// Deploy separately to Cloudflare Workers
// Usage: ![](https://svg-sns.your-worker.dev/?username=seoyun_official&caption=오늘의 무대를 마치며.&likes=31,204&comments=2,891&time=방금&location=The Core)

function generateSnsPost(p) {
  const username = p.username || "seoyun_official";
  const caption = p.caption || "프라임시티의 밤은 끝나지 않는다.";
  const likes = p.likes || "24,891";
  const comments = p.comments || "1,204";
  const time = p.time || "2시간 전";
  const location = p.location || "The Core, Prime City";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">
  <defs><clipPath id="avatar-clip"><circle cx="24" cy="24" r="18"/></clipPath></defs>
  <rect width="400" height="520" rx="12" fill="#1a1a2e"/>
  <!-- Header -->
  <g transform="translate(16, 12)">
    <circle cx="24" cy="24" r="18" fill="#2a2a4a" stroke="#c9a84c" stroke-width="2"/>
    <text x="24" y="28" text-anchor="middle" fill="#c9a84c" font-size="14" font-weight="bold" font-family="sans-serif">${username[0].toUpperCase()}</text>
    <text x="52" y="22" fill="#e8e8e8" font-size="13" font-weight="600" font-family="sans-serif">${username}</text>
    <text x="52" y="38" fill="#888" font-size="10" font-family="sans-serif">${location}</text>
    <circle cx="${52 + username.length * 7 + 8}" cy="18" r="5" fill="#4a9eff"/>
    <text x="${52 + username.length * 7 + 5}" y="22" fill="#fff" font-size="8" font-family="sans-serif">✓</text>
  </g>
  <!-- Image area -->
  <rect x="0" y="60" width="400" height="300" fill="#12122a"/>
  <text x="200" y="215" text-anchor="middle" fill="#333" font-size="14" font-family="sans-serif">📷 IMAGE</text>
  <!-- Actions -->
  <g transform="translate(16, 376)">
    <text x="0" y="0" fill="#e8e8e8" font-size="18">♡</text>
    <text x="30" y="0" fill="#e8e8e8" font-size="18">💬</text>
    <text x="60" y="0" fill="#e8e8e8" font-size="18">↗</text>
  </g>
  <!-- Likes -->
  <text x="16" y="402" fill="#e8e8e8" font-size="12" font-weight="600" font-family="sans-serif">좋아요 ${likes}개</text>
  <!-- Caption -->
  <text x="16" y="424" fill="#e8e8e8" font-size="12" font-family="sans-serif">
    <tspan font-weight="600">${username}</tspan>
    <tspan dx="6" fill="#ccc">${caption}</tspan>
  </text>
  <!-- Comments -->
  <text x="16" y="448" fill="#888" font-size="11" font-family="sans-serif">댓글 ${comments}개 모두 보기</text>
  <!-- Time -->
  <text x="16" y="470" fill="#666" font-size="10" font-family="sans-serif">${time}</text>
  <!-- Border -->
  <rect width="400" height="520" rx="12" fill="none" stroke="#333" stroke-width="1"/>
</svg>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
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
