// SYNC: Keep in sync with src/data/svgTemplates.js
function generateTablet(p) {
  const user = p.user || "{{user}}";
  const agency = p.agency || "PRISM Studio";
  const season = p.season || "Season 1";
  const division = p.division || "스테이지";
  const date = p.date || "";

  const judge1 = p.judge1 || "진시혁";
  const judge1agency = p.judge1agency || "APEX Entertainment";
  const judge1role = p.judge1role || "수석 프로듀서";
  const judge2 = p.judge2 || "에리카";
  const judge2agency = p.judge2agency || "Blue Moon Entertainment";
  const judge2role = p.judge2role || "프로듀서";

  const rounds = [
    { tag: "1R", name: "등급 평가", desc: "개인 무대 → 등급 배정" },
    { tag: "2R", name: "프로듀서 픽", desc: "지명 → 대결 → 탈락 2인" },
    { tag: "3R", name: "팀 대항전", desc: "팀 매치 → 패자부활 → 3인 생존" },
    { tag: "4R", name: "최종 선택", desc: "참가자가 프로듀서를 선택" },
  ];

  const roundRows = rounds.map((r, i) => {
    const y = 524 + i * 38;
    const barDelay = `${0.3 + i * 0.15}s`;
    return `
    <g>
      <rect x="50" y="${y}" width="32" height="22" rx="4" fill="#c9a84c" opacity="0.15"/>
      <text x="66" y="${y + 15}" text-anchor="middle" fill="#c9a84c" font-size="10" font-weight="700" font-family="sans-serif">${r.tag}</text>
      <text x="92" y="${y + 10}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${r.name}</text>
      <text x="92" y="${y + 22}" fill="#888" font-size="8.5" font-family="sans-serif">${r.desc}</text>
      <rect x="50" y="${y + 28}" width="0" height="1" fill="#c9a84c" opacity="0.3">
        <animate attributeName="width" from="0" to="290" dur="0.8s" begin="${barDelay}" fill="freeze"/>
      </rect>
    </g>`;
  }).join("");

  // Mode commands
  const modeRows = `
    <text x="66" y="716" fill="#c9a84c" font-size="11" font-weight="700" font-family="monospace">!오디션모드</text>
    <text x="220" y="716" fill="#e8e8e8" font-size="10" font-family="sans-serif">PPP 오디션 개막 (메인 스토리)</text>
    <text x="66" y="738" fill="#888" font-size="9.5" font-family="monospace">!오디션참가</text>
    <text x="220" y="738" fill="#666" font-size="8.5" font-family="sans-serif">참가자 시점으로 전환</text>
    <line x1="60" y1="750" x2="350" y2="750" stroke="#222" stroke-width="0.5" stroke-dasharray="2,3"/>
    <text x="66" y="768" fill="#888" font-size="9.5" font-family="monospace">!(직업군)</text>
    <text x="150" y="768" fill="#666" font-size="8.5" font-family="sans-serif">매니저 · 배우 · 연습생 · 인플루언서 · 작곡가</text>
    <text x="66" y="784" fill="#555" font-size="8" font-family="sans-serif">예: !매니저모드, !배우모드, !작곡가모드 ...</text>`;

  function judgeCard(name, agencyName, role, y, delay, isUser) {
    const badge = isUser ? "YOU" : "";
    const nameColor = isUser ? "#c9a84c" : "#e8e8e8";
    const borderColor = isUser ? "#c9a84c" : "#333";
    return `
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}s" fill="freeze"/>
      <rect x="50" y="${y}" width="290" height="44" rx="6" fill="#141428" stroke="${borderColor}" stroke-width="${isUser ? 1.5 : 0.5}"/>
      ${isUser ? `<rect x="50" y="${y}" width="290" height="44" rx="6" fill="#c9a84c" opacity="0.05"/>` : ""}
      <text x="66" y="${y + 18}" fill="${nameColor}" font-size="13" font-weight="700" font-family="sans-serif">${name}</text>
      ${badge ? `<rect x="${66 + name.length * 13 + 6}" y="${y + 6}" width="30" height="16" rx="3" fill="#c9a84c"/>
      <text x="${66 + name.length * 13 + 21}" y="${y + 18}" text-anchor="middle" fill="#0e0e1a" font-size="8" font-weight="700" font-family="sans-serif">${badge}</text>` : ""}
      <text x="66" y="${y + 34}" fill="#888" font-size="9" font-family="sans-serif">${agencyName} · ${role}</text>
      <rect x="324" y="${y + 12}" width="8" height="8" rx="4" fill="${isUser ? "#c9a84c" : "#555"}" opacity="${isUser ? 1 : 0.5}"/>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 880">
  <defs>
    <linearGradient id="tablet-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a18"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c9a84c"/>
      <stop offset="100%" stop-color="#8a6d2b"/>
    </linearGradient>
    <linearGradient id="scanline" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="45%" stop-color="#c9a84c" stop-opacity="0.06"/>
      <stop offset="55%" stop-color="#c9a84c" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="screen-clip">
      <rect x="20" y="20" width="380" height="840" rx="8"/>
    </clipPath>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Tablet frame -->
  <rect width="420" height="880" rx="24" fill="#111" stroke="#2a2a3a" stroke-width="1.5"/>
  <rect x="14" y="14" width="392" height="852" rx="12" fill="url(#tablet-bg)"/>

  <g clip-path="url(#screen-clip)">

    <!-- Scan line -->
    <rect x="20" y="-100" width="380" height="100" fill="url(#scanline)">
      <animateTransform attributeName="transform" type="translate" from="0 -100" to="0 980" dur="6s" repeatCount="indefinite"/>
    </rect>

    <!-- Status bar -->
    <rect x="20" y="20" width="380" height="28" fill="#0a0a18" opacity="0.8"/>
    <text x="36" y="38" fill="#555" font-size="9" font-family="sans-serif">${date || "D-7"}</text>
    <text x="380" y="38" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">CONFIDENTIAL</text>

    <!-- PPP Header -->
    <g transform="translate(210, 82)">
      <polygon points="0,-22 19,11 -19,11" fill="none" stroke="url(#gold-grad)" stroke-width="1.5" filter="url(#glow)">
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="0,-12 10,6 -10,6" fill="#c9a84c" opacity="0.15"/>
    </g>
    <text x="210" y="124" text-anchor="middle" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif" letter-spacing="4">P R O D U C E</text>
    <text x="210" y="143" text-anchor="middle" fill="#e8e8e8" font-size="16" font-weight="700" font-family="sans-serif">프라임 · 프라이오리티</text>
    <text x="210" y="160" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif" letter-spacing="2">${season.toUpperCase()}</text>

    <!-- Divider -->
    <line x1="80" y1="175" x2="340" y2="175" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>
    <circle cx="210" cy="175" r="2" fill="#c9a84c" opacity="0.5"/>

    <!-- Briefing header -->
    <text x="50" y="205" fill="#888" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="2">AUDITION BRIEFING</text>
    <rect x="50" y="210" width="60" height="1.5" fill="#c9a84c" opacity="0.4"/>

    <!-- Info grid -->
    <g>
      <text x="50" y="236" fill="#666" font-size="9" font-family="sans-serif">부문</text>
      <text x="130" y="236" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${division}</text>
      <text x="230" y="236" fill="#666" font-size="9" font-family="sans-serif">참가자</text>
      <text x="290" y="236" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">8명</text>
    </g>
    <g>
      <text x="50" y="258" fill="#666" font-size="9" font-family="sans-serif">라운드</text>
      <text x="130" y="258" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">총 4라운드</text>
      <text x="230" y="258" fill="#666" font-size="9" font-family="sans-serif">기간</text>
      <text x="290" y="258" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">약 2개월</text>
    </g>
    <g>
      <text x="50" y="280" fill="#666" font-size="9" font-family="sans-serif">분야</text>
      <text x="130" y="280" fill="#ccc" font-size="10" font-family="sans-serif">아이돌 · 가수 · 댄서 · 싱어송라이터</text>
    </g>

    <!-- Divider -->
    <line x1="50" y1="296" x2="370" y2="296" stroke="#222" stroke-width="0.5"/>

    <!-- Judges -->
    <text x="50" y="320" fill="#888" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="2">JUDGE PANEL</text>
    <rect x="50" y="325" width="40" height="1.5" fill="#c9a84c" opacity="0.4"/>

    ${judgeCard(judge1, judge1agency, judge1role, 338, 0.5, false)}
    ${judgeCard(judge2, judge2agency, judge2role, 388, 0.7, false)}
    ${judgeCard(user, agency, "프로듀서", 438, 0.9, true)}

    <!-- Divider -->
    <line x1="50" y1="496" x2="370" y2="496" stroke="#222" stroke-width="0.5"/>

    <!-- Rounds -->
    <text x="50" y="516" fill="#888" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="2">ROUND STRUCTURE</text>
    ${roundRows}

    <!-- Divider -->
    <line x1="50" y1="672" x2="370" y2="672" stroke="#222" stroke-width="0.5"/>

    <!-- Mode commands -->
    <text x="50" y="692" fill="#888" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="2">AVAILABLE MODES</text>
    <rect x="50" y="697" width="50" height="1.5" fill="#c9a84c" opacity="0.4"/>
    ${modeRows}

    <!-- Warning -->
    <rect x="50" y="826" width="320" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="842" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">⚠ 본 문서는 심사위원 전용 브리핑입니다</text>
    <text x="210" y="856" text-anchor="middle" fill="#666" font-size="8" font-family="sans-serif">무단 유출 시 프라임시티 방송위원회 규정에 의거하여 제재됩니다</text>

    <!-- Copyright -->
    <text x="210" y="878" text-anchor="middle" fill="#444" font-size="7.5" font-family="sans-serif">© PPP Operating Committee · Prime City Broadcasting Authority</text>

    <!-- Corner brackets -->
    <path d="M30,30 L30,50 M30,30 L50,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.25" fill="none"/>
    <path d="M390,30 L390,50 M390,30 L370,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.25" fill="none"/>
    <path d="M30,850 L30,830 M30,850 L50,850" stroke="#c9a84c" stroke-width="0.8" opacity="0.25" fill="none"/>
    <path d="M390,850 L390,830 M390,850 L370,850" stroke="#c9a84c" stroke-width="0.8" opacity="0.25" fill="none"/>

  </g>

  <!-- Home indicator -->
  <rect x="170" y="866" width="80" height="4" rx="2" fill="#333"/>

  <!-- Outer glow -->
  <rect width="420" height="880" rx="24" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.1"/>
</svg>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateTablet(p);
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
