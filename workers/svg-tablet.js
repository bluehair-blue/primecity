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

  // ── Layout constants ──
  const L = 50;       // left margin
  const R = 370;      // right guide
  const contentW = R - L; // 320

  // ── Section accent bar helper ──
  function sectionHeader(label, y) {
    return `
    <rect x="${L - 6}" y="${y - 10}" width="3" height="14" rx="1" fill="#c9a84c" opacity="0.5"/>
    <text x="${L}" y="${y}" fill="#888" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="2">${label}</text>
    <rect x="${L}" y="${y + 5}" width="50" height="1.5" fill="#c9a84c" opacity="0.4"/>`;
  }

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
      <rect x="${L}" y="${y}" width="32" height="22" rx="4" fill="#c9a84c" opacity="0.15"/>
      <text x="${L + 16}" y="${y + 15}" text-anchor="middle" fill="#c9a84c" font-size="10" font-weight="700" font-family="sans-serif">${r.tag}</text>
      <text x="${L + 42}" y="${y + 10}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${r.name}</text>
      <text x="${L + 42}" y="${y + 22}" fill="#888" font-size="8.5" font-family="sans-serif">${r.desc}</text>
      <rect x="${L}" y="${y + 28}" width="0" height="1" fill="#c9a84c" opacity="0.3">
        <animate attributeName="width" from="0" to="${contentW}" dur="0.8s" begin="${barDelay}" fill="freeze"/>
      </rect>
    </g>`;
  }).join("");

  // ── Mode section: 2-column compact grid ──
  const mainModes = [
    { icon: "🎤", name: "오디션", trigger: "메인 스토리", desc: "PPP 서바이벌 오디션", accent: "#c9a84c" },
    { icon: "🌆", name: "프리플레이", trigger: "자유 탐색", desc: "도시 탐색 · 사이드 스토리", accent: "#7ba0d4" },
    { icon: "🎬", name: "프로듀서", trigger: "아이돌 육성", desc: "스케줄 · 곡 · 이미지 메이킹", accent: "#b07ad4" },
  ];
  const careerModes = [
    { icon: "📋", name: "매니저", trigger: "!매니저모드", desc: "스케줄 · 위기 · 관계 관리", accent: "#d4a84c" },
    { icon: "✿", name: "연습생", trigger: "!연습생모드", desc: "훈련 · 평가 · 데뷔 게이지", accent: "#6db87a" },
    { icon: "∂", name: "작곡가", trigger: "!작곡가모드", desc: "작곡 → 매칭 → 발매 → 차트", accent: "#7ba0d4" },
    { icon: "▷", name: "배우", trigger: "!배우모드", desc: "캐스팅 → 촬영 → 방영", accent: "#d46b8a" },
    { icon: "◐", name: "인플루언서", trigger: "!인플루언서모드", desc: "콘텐츠 · 바이럴 · 브랜드딜", accent: "#6bacd4" },
  ];

  const colW = 155;
  const gapX = 10;
  function modeCell(m, x, y) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="${colW}" height="40" rx="4" fill="#141428" stroke="#2a2a3a" stroke-width="0.5"/>
      <text x="${x + 10}" y="${y + 24}" font-size="14" font-family="sans-serif">${m.icon}</text>
      <text x="${x + 32}" y="${y + 16}" fill="${m.accent}" font-size="10" font-weight="700" font-family="sans-serif">${m.name}</text>
      <text x="${x + 32}" y="${y + 30}" fill="#777" font-size="8.5" font-family="sans-serif">${m.desc}</text>
      <text x="${x + colW - 8}" y="${y + 14}" text-anchor="end" fill="#444" font-size="7" font-family="monospace" opacity="0.8">${m.trigger}</text>
    </g>`;
  }

  const modeStartY = 700;
  const mainLabel = `<text x="${L}" y="${modeStartY}" fill="#666" font-size="8.5" font-weight="600" font-family="sans-serif" letter-spacing="1.5">MAIN STORY</text>`;
  const mainCells = mainModes.map((m, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    return modeCell(m, L + col * (colW + gapX), modeStartY + 10 + row * 46);
  }).join("");

  const careerY = modeStartY + 10 + Math.ceil(mainModes.length / 2) * 46 + 14;
  const careerLabel = `<text x="${L}" y="${careerY}" fill="#666" font-size="8.5" font-weight="600" font-family="sans-serif" letter-spacing="1.5">CAREER MODES — 채팅에서 전환</text>`;
  const careerCells = careerModes.map((m, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    return modeCell(m, L + col * (colW + gapX), careerY + 10 + row * 46);
  }).join("");

  const modeEndY = careerY + 10 + Math.ceil(careerModes.length / 2) * 46 + 6;

  // ── Image Output System section ──
  const imgY = modeEndY + 16;

  // Character codes grouped by agency (3 columns)
  const charGroups = [
    { agency: "APEX", chars: ["SY 서윤", "NHR 나하린", "JSH 진시혁"] },
    { agency: "BLUE MOON", chars: ["ERK 에리카", "LSH 이서하"] },
    { agency: "PRISM", chars: ["HSR 한소리"] },
    { agency: "ROUTE 0", chars: ["KHR 강하람"] },
    { agency: "CONTESTANTS", chars: ["JGR 장그루", "MIL 밀라", "ELA 엘라", "MMR 미모리", "HSE 하시은", "NIA 니아", "RAY 레이", "LPS 라피스"] },
  ];

  let charTagsY = imgY + 48;
  const charTags = charGroups.map((g) => {
    const labelSvg = `<text x="${L}" y="${charTagsY}" fill="#555" font-size="7" font-weight="600" font-family="sans-serif" letter-spacing="1">${g.agency}</text>`;
    charTagsY += 14;
    const rows = [];
    for (let i = 0; i < g.chars.length; i++) {
      const col = i % 3;
      const tx = L + col * 108;
      rows.push(`<text x="${tx}" y="${charTagsY}" fill="#666" font-size="8.5" font-family="monospace">${g.chars[i]}</text>`);
      if (col === 2 || i === g.chars.length - 1) charTagsY += 15;
    }
    return labelSvg + rows.join("");
  }).join("");

  // Scene category bars (taller, labels above)
  const sceneBarY = charTagsY + 8;
  const sceneCats = [
    { label: "감정 1–8", n: 8, color: "#c9a84c" },
    { label: "일상 10–18", n: 9, color: "#7ba0d4" },
    { label: "NSFW 20–67", n: 41, color: "#d46b8a" },
    { label: "착의 70–86", n: 16, color: "#6bacd4" },
  ];
  const barW = contentW - 50;
  let barOffset = 0;
  const sceneBars = sceneCats.map((sc) => {
    const w = (sc.n / 74) * barW;
    const x = L + barOffset;
    barOffset += w;
    return `
      <text x="${x + w / 2}" y="${sceneBarY}" text-anchor="middle" fill="${sc.color}" font-size="7" font-weight="600" font-family="sans-serif">${sc.label}</text>
      <rect x="${x}" y="${sceneBarY + 4}" width="${w}" height="18" fill="${sc.color}" opacity="0.2"/>
      <rect x="${x}" y="${sceneBarY + 4}" width="${w}" height="18" fill="none" stroke="${sc.color}" stroke-width="0.5" opacity="0.3"/>`;
  }).join("");

  const imageSection = `
    <line x1="${L}" y1="${imgY - 6}" x2="${R}" y2="${imgY - 6}" stroke="#222" stroke-width="0.5"/>
    ${sectionHeader("IMAGE OUTPUT SYSTEM", imgY + 10)}
    <text x="${L}" y="${imgY + 32}" fill="#666" font-size="9" font-family="sans-serif">CDN: img.bluehair.blue/ent/</text>
    <text x="${L + 168}" y="${imgY + 32}" fill="#c9a84c" font-size="9" font-family="monospace" font-weight="600">{code}/{num}</text>
    <text x="${L + 250}" y="${imgY + 32}" fill="#666" font-size="9" font-family="monospace">.webp</text>
    <text x="${R}" y="${imgY + 32}" text-anchor="end" fill="#555" font-size="8.5" font-family="sans-serif">15명 × 74 = 1,110장</text>
    ${charTags}
    ${sceneBars}
    <text x="${L + barW + 8}" y="${sceneBarY + 16}" fill="#555" font-size="8" font-family="sans-serif">74/char</text>`;

  // ── Dynamic bottom positions ──
  const warnY = sceneBarY + 36;
  const copyY = warnY + 50;
  const totalH = copyY + 28;
  const innerH = totalH - 28;
  const screenH = totalH - 40;

  function judgeCard(name, agencyName, role, y, delay, isUser) {
    const badge = isUser ? "YOU" : "";
    const nameColor = isUser ? "#c9a84c" : "#e8e8e8";
    const borderColor = isUser ? "#c9a84c" : "#2a2a3a";
    return `
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}s" fill="freeze"/>
      <rect x="${L}" y="${y}" width="${contentW}" height="44" rx="6" fill="#141428" stroke="${borderColor}" stroke-width="${isUser ? 1.5 : 0.5}"/>
      ${isUser ? `<rect x="${L}" y="${y}" width="${contentW}" height="44" rx="6" fill="#c9a84c" opacity="0.05"/>` : ""}
      <text x="${L + 16}" y="${y + 18}" fill="${nameColor}" font-size="13" font-weight="700" font-family="sans-serif">${name}</text>
      ${badge ? `<rect x="${L + 16 + name.length * 13 + 6}" y="${y + 6}" width="30" height="16" rx="3" fill="#c9a84c"/>
      <text x="${L + 16 + name.length * 13 + 21}" y="${y + 18}" text-anchor="middle" fill="#0e0e1a" font-size="8" font-weight="700" font-family="sans-serif">${badge}</text>` : ""}
      <text x="${L + 16}" y="${y + 34}" fill="#888" font-size="9" font-family="sans-serif">${agencyName} · ${role}</text>
      <rect x="${R - 6}" y="${y + 12}" width="8" height="8" rx="4" fill="${isUser ? "#c9a84c" : "#555"}" opacity="${isUser ? 1 : 0.5}"/>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 ${totalH}">
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
      <rect x="20" y="20" width="380" height="${screenH}" rx="8"/>
    </clipPath>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Tablet frame -->
  <rect width="420" height="${totalH}" rx="24" fill="#111" stroke="#2a2a3a" stroke-width="1.5"/>
  <rect x="14" y="14" width="392" height="${innerH}" rx="12" fill="url(#tablet-bg)"/>

  <g clip-path="url(#screen-clip)">

    <!-- Scan line -->
    <rect x="20" y="-100" width="380" height="100" fill="url(#scanline)">
      <animateTransform attributeName="transform" type="translate" from="0 -100" to="0 ${totalH + 100}" dur="8s" repeatCount="indefinite"/>
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
    ${sectionHeader("AUDITION BRIEFING", 205)}

    <!-- Info grid -->
    <g>
      <text x="${L}" y="236" fill="#666" font-size="9" font-family="sans-serif">부문</text>
      <text x="130" y="236" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${division}</text>
      <text x="230" y="236" fill="#666" font-size="9" font-family="sans-serif">참가자</text>
      <text x="290" y="236" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">8명</text>
    </g>
    <g>
      <text x="${L}" y="258" fill="#666" font-size="9" font-family="sans-serif">라운드</text>
      <text x="130" y="258" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">총 4라운드</text>
      <text x="230" y="258" fill="#666" font-size="9" font-family="sans-serif">기간</text>
      <text x="290" y="258" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">약 2개월</text>
    </g>
    <g>
      <text x="${L}" y="280" fill="#666" font-size="9" font-family="sans-serif">분야</text>
      <text x="130" y="280" fill="#ccc" font-size="10" font-family="sans-serif">아이돌 · 가수 · 댄서 · 싱어송라이터</text>
    </g>

    <!-- Divider -->
    <line x1="${L}" y1="296" x2="${R}" y2="296" stroke="#222" stroke-width="0.5"/>

    <!-- Judges -->
    ${sectionHeader("JUDGE PANEL", 320)}

    ${judgeCard(judge1, judge1agency, judge1role, 338, 0.5, false)}
    ${judgeCard(judge2, judge2agency, judge2role, 388, 0.7, false)}
    ${judgeCard(user, agency, "프로듀서", 438, 0.9, true)}

    <!-- Divider -->
    <line x1="${L}" y1="496" x2="${R}" y2="496" stroke="#222" stroke-width="0.5"/>

    <!-- Rounds -->
    ${sectionHeader("ROUND STRUCTURE", 516)}
    ${roundRows}

    <!-- Divider -->
    <line x1="${L}" y1="672" x2="${R}" y2="672" stroke="#222" stroke-width="0.5"/>

    <!-- Mode commands — 2-column compact grid -->
    ${sectionHeader("AVAILABLE MODES", 692)}
    ${mainLabel}
    ${mainCells}
    ${careerLabel}
    ${careerCells}

    <!-- Image output system -->
    ${imageSection}

    <!-- Warning -->
    <rect x="${L}" y="${warnY}" width="${contentW}" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="${warnY + 14}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">⚠ 본 문서는 심사위원 전용 브리핑입니다</text>
    <text x="210" y="${warnY + 28}" text-anchor="middle" fill="#666" font-size="8.5" font-family="sans-serif">무단 유출 시 프라임시티 방송위원회 규정에 의거하여 제재됩니다</text>

    <!-- Copyright -->
    <text x="210" y="${copyY}" text-anchor="middle" fill="#444" font-size="8" font-family="sans-serif">© PPP Operating Committee · Prime City Broadcasting Authority</text>

    <!-- Corner brackets -->
    <path d="M30,30 L30,50 M30,30 L50,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,30 L390,50 M390,30 L370,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M30,${screenH + 10} L30,${screenH - 10} M30,${screenH + 10} L50,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,${screenH + 10} L390,${screenH - 10} M390,${screenH + 10} L370,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>

  </g>

  <!-- Home indicator -->
  <rect x="170" y="${totalH - 14}" width="80" height="4" rx="2" fill="#333"/>

  <!-- Outer glow -->
  <rect width="420" height="${totalH}" rx="24" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.1"/>
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
