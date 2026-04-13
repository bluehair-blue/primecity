// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
// SYNC: Keep in sync with src/data/svgTemplates.js generateSchedule()

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Type → color mapping ──
const TYPE_COLORS = {
  broadcast: "#d46b8a",
  photo:     "#b07ad4",
  practice:  "#6db87a",
  event:     "#c9a84c",
  meeting:   "#7ba0d4",
  rest:      "#555",
};
function typeColor(t) { return TYPE_COLORS[t] || "#888"; }

function generateSchedule(p) {
  const user    = escapeXml(p.user    || "{{user}}");
  const artist  = escapeXml(p.artist  || "서윤");
  const date    = escapeXml(p.date    || "");

  // ── Layout constants (tablet convention) ──
  const W = 420;
  const L = 50;
  const R = 370;
  const contentW = R - L;
  const SEC_GAP = 24;

  // ── Helpers ──
  function sectionHeader(label, y) {
    return `
    <rect x="${L - 6}" y="${y - 10}" width="3" height="14" rx="1" fill="#c9a84c" opacity="0.5"/>
    <text x="${L}" y="${y}" fill="#888" font-size="10" font-weight="600" font-family="sans-serif" letter-spacing="2">${label}</text>
    <rect x="${L}" y="${y + 5}" width="50" height="1.5" fill="#c9a84c" opacity="0.4"/>`;
  }

  function divider(y) {
    return `<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" stroke="#222" stroke-width="0.5"/>`;
  }

  // ══════════════════════════════════════════════
  //  SECTION RENDERERS — each returns { svg, height }
  // ══════════════════════════════════════════════

  // ── [A] HEADER ──
  function renderHeader() {
    const h = 110;
    const svg = `
    <!-- Status bar -->
    <rect x="20" y="34" width="380" height="24" fill="#0a0a18" opacity="0.8"/>
    <text x="36" y="50" fill="#555" font-size="9" font-family="sans-serif">${date || "날짜 미정"}</text>
    <text x="380" y="50" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">SCHEDULE</text>

    <!-- Title -->
    <text x="210" y="82" text-anchor="middle" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif" letter-spacing="4">
      S C H E D U L E
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </text>
    <text x="210" y="100" text-anchor="middle" fill="#e8e8e8" font-size="14" font-weight="700" font-family="sans-serif">${artist}</text>

    <line x1="80" y1="${h}" x2="340" y2="${h}" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>
    <circle cx="210" cy="${h}" r="2" fill="#c9a84c" opacity="0.5"/>`;
    return { svg, height: h };
  }

  // ── [B] TODAY — schedule slots s1~s8 ──
  function renderToday(startY) {
    const slots = [];
    for (let i = 1; i <= 8; i++) {
      const time = p[`s${i}`];
      const name = p[`s${i}name`];
      if (!time && !name) continue;
      slots.push({
        time: escapeXml(time || ""),
        name: escapeXml(name || ""),
        loc:  escapeXml(p[`s${i}loc`]  || ""),
        type: p[`s${i}type`] || "",
      });
    }

    // Defaults if no slots
    if (slots.length === 0) {
      slots.push(
        { time: "09:00", name: "음악방송 리허설", loc: "KBS", type: "broadcast" },
        { time: "12:00", name: "점심 + 이동", loc: "", type: "rest" },
        { time: "14:00", name: "화보 촬영", loc: "W Magazine", type: "photo" },
        { time: "18:00", name: "보컬 레슨", loc: "Studio A", type: "practice" },
        { time: "21:00", name: "자유시간", loc: "", type: "rest" },
      );
    }

    const rowH = 36;
    let svg = sectionHeader("TODAY", startY + 18);

    slots.forEach((s, i) => {
      const y = startY + 36 + i * rowH;
      const color = typeColor(s.type);
      const delay = `${0.3 + i * 0.15}s`;
      svg += `
      <g opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}" fill="freeze"/>
        <rect x="${L}" y="${y}" width="3" height="${rowH - 4}" rx="1" fill="${color}"/>
        <text x="${L + 12}" y="${y + 14}" fill="#888" font-size="10" font-family="monospace">${s.time}</text>
        <text x="${L + 60}" y="${y + 14}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${s.name}</text>
        ${s.loc ? `<text x="${R}" y="${y + 14}" text-anchor="end" fill="#666" font-size="9" font-family="sans-serif">${s.loc}</text>` : ""}
        <text x="${L + 60}" y="${y + 27}" fill="${color}" font-size="8" font-family="sans-serif" opacity="0.7">${s.type ? s.type.toUpperCase() : ""}</text>
        <line x1="${L + 12}" y1="${y + rowH - 4}" x2="${R}" y2="${y + rowH - 4}" stroke="#1a1a2e" stroke-width="0.5"/>
      </g>`;
    });

    const h = 36 + slots.length * rowH + 8;
    return { svg, height: h };
  }

  // ── [C] UPCOMING — u1~u3 ──
  function renderUpcoming(startY) {
    const items = [];
    for (let i = 1; i <= 3; i++) {
      const name = p[`u${i}`];
      if (!name) continue;
      items.push({
        name: escapeXml(name),
        day:  escapeXml(p[`u${i}day`] || ""),
        loc:  escapeXml(p[`u${i}loc`] || ""),
      });
    }
    if (items.length === 0) return { svg: "", height: 0 };

    const rowH = 28;
    let svg = sectionHeader("UPCOMING", startY + 18);

    items.forEach((u, i) => {
      const y = startY + 36 + i * rowH;
      svg += `
      <g>
        <rect x="${L}" y="${y}" width="40" height="18" rx="4" fill="#c9a84c" opacity="0.15"/>
        <text x="${L + 20}" y="${y + 13}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="700" font-family="sans-serif">${u.day}</text>
        <text x="${L + 50}" y="${y + 13}" fill="#e8e8e8" font-size="11" font-family="sans-serif">${u.name}</text>
        ${u.loc ? `<text x="${R}" y="${y + 13}" text-anchor="end" fill="#666" font-size="9" font-family="sans-serif">${u.loc}</text>` : ""}
      </g>`;
    });

    const h = 36 + items.length * rowH + 8;
    return { svg, height: h };
  }

  // ── [D] STATUS — condition + reputation + note ──
  function renderStatus(startY) {
    const cond = parseInt(p.condition) || 0;
    const rep  = escapeXml(p.reputation || "");
    const note = escapeXml(p.note || "");

    if (!cond && !rep && !note) return { svg: "", height: 0 };

    let svg = sectionHeader("STATUS", startY + 18);
    let cy = startY + 40;

    // Condition bar
    if (cond > 0) {
      const blocks = [];
      for (let i = 1; i <= 5; i++) {
        const filled = i <= cond;
        blocks.push(`<rect x="${L + 60 + (i - 1) * 20}" y="${cy - 10}" width="14" height="14" rx="2" fill="${filled ? "#c9a84c" : "#2a2a3a"}" stroke="${filled ? "#c9a84c" : "#333"}" stroke-width="0.5"/>`);
      }
      svg += `
      <text x="${L}" y="${cy}" fill="#888" font-size="10" font-family="sans-serif">컨디션</text>
      ${blocks.join("")}`;

      // Reputation on same row if present
      if (rep) {
        svg += `
      <text x="${L + 190}" y="${cy}" fill="#888" font-size="10" font-family="sans-serif">평판</text>
      <text x="${L + 220}" y="${cy}" fill="#c9a84c" font-size="12" font-weight="700" font-family="sans-serif">★${rep}</text>`;
      }
      cy += 24;
    } else if (rep) {
      svg += `
      <text x="${L}" y="${cy}" fill="#888" font-size="10" font-family="sans-serif">평판</text>
      <text x="${L + 40}" y="${cy}" fill="#c9a84c" font-size="12" font-weight="700" font-family="sans-serif">★${rep}</text>`;
      cy += 24;
    }

    // Note
    if (note) {
      svg += `
      <text x="${L}" y="${cy}" fill="#888" font-size="9" font-family="sans-serif">메모</text>
      <text x="${L + 36}" y="${cy}" fill="#aaa" font-size="10" font-family="sans-serif">${note}</text>`;
      cy += 20;
    }

    const h = cy - startY + 8;
    return { svg, height: h };
  }

  // ── [E] FOOTER ──
  function renderFooter(startY) {
    const svg = `
    <rect x="${L}" y="${startY + 6}" width="${contentW}" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="${startY + 20}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">PRIME CITY ENTERTAINMENT</text>
    <text x="210" y="${startY + 34}" text-anchor="middle" fill="#666" font-size="8" font-family="sans-serif">일정은 상황에 따라 변동될 수 있습니다</text>`;
    return { svg, height: 50 };
  }

  // ══════════════════════════════════════════════
  //  ASSEMBLY — cascade sections with relative Y
  // ══════════════════════════════════════════════

  const header = renderHeader();
  let curY = header.height + 12;

  const today = renderToday(curY);
  curY += today.height + SEC_GAP;

  const divToday = divider(curY - 12);

  const upcoming = renderUpcoming(curY);
  const divUpcoming = upcoming.height > 0 ? divider(curY + upcoming.height + 12) : "";
  if (upcoming.height > 0) curY += upcoming.height + SEC_GAP;

  const status = renderStatus(curY);
  const divStatus = status.height > 0 ? divider(curY + status.height + 12) : "";
  if (status.height > 0) curY += status.height + SEC_GAP;

  const footer = renderFooter(curY);
  curY += footer.height + 10;

  const totalH = curY + 28;
  const innerH = totalH - 28;
  const screenH = totalH - 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${totalH}">
  <defs>
    <linearGradient id="sched-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a18"/>
    </linearGradient>
    <linearGradient id="sched-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c9a84c"/>
      <stop offset="100%" stop-color="#8a6d2b"/>
    </linearGradient>
    <linearGradient id="sched-scan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="45%" stop-color="#c9a84c" stop-opacity="0.06"/>
      <stop offset="55%" stop-color="#c9a84c" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="sched-clip">
      <rect x="20" y="20" width="380" height="${screenH}" rx="8"/>
    </clipPath>
  </defs>

  <!-- Tablet frame -->
  <rect width="${W}" height="${totalH}" rx="24" fill="#111" stroke="#2a2a3a" stroke-width="1.5"/>
  <rect x="14" y="14" width="392" height="${innerH}" rx="12" fill="url(#sched-bg)"/>

  <g clip-path="url(#sched-clip)">

    <!-- Scan line -->
    <rect x="20" y="-100" width="380" height="100" fill="url(#sched-scan)">
      <animateTransform attributeName="transform" type="translate" from="0 -100" to="0 ${totalH + 100}" dur="8s" repeatCount="indefinite"/>
    </rect>

    ${header.svg}
    ${today.svg}
    ${divToday}
    ${upcoming.svg}
    ${divUpcoming}
    ${status.svg}
    ${divStatus}
    ${footer.svg}

    <!-- Corner brackets -->
    <path d="M30,30 L30,50 M30,30 L50,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,30 L390,50 M390,30 L370,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M30,${screenH + 10} L30,${screenH - 10} M30,${screenH + 10} L50,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,${screenH + 10} L390,${screenH - 10} M390,${screenH + 10} L370,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>

  </g>

  <!-- Home indicator -->
  <rect x="170" y="${totalH - 14}" width="80" height="4" rx="2" fill="#333"/>

  <!-- Outer glow -->
  <rect width="${W}" height="${totalH}" rx="24" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.1"/>
</svg>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateSchedule(p);
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
