// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
// SYNC: Keep in sync with src/data/svgTemplates.js generateTablet()

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function generateTablet(p) {
  const user = escapeXml(p.user || "{{user}}");
  const agency = escapeXml(p.agency || "PRISM Studio");
  const season = escapeXml(p.season || "Season 1");
  const division = escapeXml(p.division || "스테이지");
  const date = escapeXml(p.date || "");

  const judge1 = escapeXml(p.judge1 || "진시혁");
  const judge1agency = escapeXml(p.judge1agency || "APEX Entertainment");
  const judge1role = escapeXml(p.judge1role || "수석 프로듀서");
  const judge2 = escapeXml(p.judge2 || "에리카");
  const judge2agency = escapeXml(p.judge2agency || "Blue Moon Entertainment");
  const judge2role = escapeXml(p.judge2role || "프로듀서");

  // ── Layout constants ──
  const W = 420;
  const L = 50;       // left margin
  const R = 370;      // right guide
  const contentW = R - L; // 320
  const colW = 155;
  const gapX = 10;
  const SEC_GAP = 20;  // uniform section gap

  // ── Section accent bar helper ──
  function sectionHeader(label, y) {
    return `
    <rect x="${L - 6}" y="${y - 10}" width="3" height="14" rx="1" fill="#c9a84c" opacity="0.5"/>
    <text x="${L}" y="${y}" fill="#888" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="2">${label}</text>
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
    const h = 170;
    const svg = `
    <!-- Status bar -->
    <rect x="20" y="20" width="380" height="28" fill="#0a0a18" opacity="0.8"/>
    <text x="36" y="38" fill="#555" font-size="9" font-family="sans-serif">${date || "D-7"}</text>
    <text x="380" y="38" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">CONFIDENTIAL</text>

    <!-- PPP Logo -->
    <g transform="translate(210, 82)">
      <polygon points="0,-22 19,11 -19,11" fill="none" stroke="url(#gold-grad)" stroke-width="1.5" filter="url(#glow)">
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="0,-12 10,6 -10,6" fill="#c9a84c" opacity="0.15"/>
    </g>
    <text x="210" y="124" text-anchor="middle" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif" letter-spacing="4">P R O D U C E</text>
    <text x="210" y="143" text-anchor="middle" fill="#e8e8e8" font-size="16" font-weight="700" font-family="sans-serif">프라임 · 프라이오리티</text>
    <text x="210" y="160" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif" letter-spacing="2">${season.toUpperCase()}</text>
    <text x="210" y="174" text-anchor="middle" fill="#555" font-size="8" font-family="sans-serif" font-style="italic">심사위원 위촉 서한</text>

    <!-- Divider -->
    <line x1="80" y1="185" x2="340" y2="185" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>
    <circle cx="210" cy="185" r="2" fill="#c9a84c" opacity="0.5"/>`;
    return { svg, height: h };
  }

  // ── [B] AUDITION BRIEFING ──
  function renderBriefing(startY) {
    const h = 95;
    const svg = `
    ${sectionHeader("AUDITION BRIEFING", startY + 15)}
    <g>
      <text x="${L}" y="${startY + 46}" fill="#666" font-size="9" font-family="sans-serif">부문</text>
      <text x="130" y="${startY + 46}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${division}</text>
      <text x="230" y="${startY + 46}" fill="#666" font-size="9" font-family="sans-serif">참가자</text>
      <text x="290" y="${startY + 46}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">8명</text>
    </g>
    <g>
      <text x="${L}" y="${startY + 66}" fill="#666" font-size="9" font-family="sans-serif">라운드</text>
      <text x="130" y="${startY + 66}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">총 4라운드</text>
      <text x="230" y="${startY + 66}" fill="#666" font-size="9" font-family="sans-serif">기간</text>
      <text x="290" y="${startY + 66}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">약 2개월</text>
    </g>
    <g>
      <text x="${L}" y="${startY + 86}" fill="#666" font-size="9" font-family="sans-serif">분야</text>
      <text x="130" y="${startY + 86}" fill="#ccc" font-size="10" font-family="sans-serif">아이돌 · 가수 · 댄서 · 싱어송라이터 · 멀티</text>
    </g>`;
    return { svg, height: h };
  }

  // ── [C] JUDGE PANEL ──
  function renderJudges(startY) {
    function judgeCard(name, agencyName, role, profile, y, delay, isUser) {
      const badge = isUser ? "YOU" : "";
      const nameColor = isUser ? "#c9a84c" : "#e8e8e8";
      const borderColor = isUser ? "#c9a84c" : "#2a2a3a";
      const cardH = profile ? 56 : 44;
      return `
      <g opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}s" fill="freeze"/>
        <rect x="${L}" y="${y}" width="${contentW}" height="${cardH}" rx="6" fill="#141428" stroke="${borderColor}" stroke-width="${isUser ? 1.5 : 0.5}"/>
        ${isUser ? `<rect x="${L}" y="${y}" width="${contentW}" height="${cardH}" rx="6" fill="#c9a84c" opacity="0.05"/>` : ""}
        <text x="${L + 16}" y="${y + 18}" fill="${nameColor}" font-size="13" font-weight="700" font-family="sans-serif">${name}</text>
        ${badge ? `<rect x="${L + 16 + name.length * 13 + 6}" y="${y + 6}" width="30" height="16" rx="3" fill="#c9a84c"/>
        <text x="${L + 16 + name.length * 13 + 21}" y="${y + 18}" text-anchor="middle" fill="#0e0e1a" font-size="8" font-weight="700" font-family="sans-serif">${badge}</text>` : ""}
        <text x="${L + 16}" y="${y + 34}" fill="#888" font-size="9" font-family="sans-serif">${agencyName} · ${role}</text>
        ${profile ? `<text x="${L + 16}" y="${y + 48}" fill="#555" font-size="8" font-family="sans-serif">${profile}</text>` : ""}
        <rect x="${R - 6}" y="${y + 12}" width="8" height="8" rx="4" fill="${isUser ? "#c9a84c" : "#555"}" opacity="${isUser ? 1 : 0.5}"/>
      </g>`;
    }

    const cardGap = 6;
    let cy = startY + 30;
    const j1 = judgeCard(judge1, judge1agency, judge1role, "업계 1위 기획사 A&amp;R 총괄", cy, 0.5, false);
    cy += 56 + cardGap;
    const j2 = judgeCard(judge2, judge2agency, judge2role, "히트 프로듀싱 전문", cy, 0.7, false);
    cy += 56 + cardGap;
    const j3 = judgeCard(user, agency, "프로듀서", "", cy, 0.9, true);
    cy += 44 + cardGap;

    const note = `<text x="210" y="${cy + 6}" text-anchor="middle" fill="#555" font-size="8" font-family="sans-serif">심사위원 상호 간 평가 방식, 합의 구조는 라운드별 상이</text>`;
    const h = cy + 16 - startY;

    const svg = `
    ${sectionHeader("JUDGE PANEL", startY + 15)}
    ${j1}${j2}${j3}
    ${note}`;
    return { svg, height: h };
  }

  // ── [D] ROUND STRUCTURE ──
  function renderRounds(startY) {
    const rounds = [
      { tag: "1R", name: "등급 평가", desc: "개인 무대 → 등급 배정", subdesc: "탈락 없음" },
      { tag: "2R", name: "프로듀서 픽", desc: "지명 → 대결 → 탈락 2인", subdesc: "" },
      { tag: "3R", name: "팀 대항전", desc: "팀 매치 → 패자부활 → 3인 생존", subdesc: "~ 합숙 1개월 후" },
      { tag: "4R", name: "최종 선택", desc: "참가자가 프로듀서를 선택", subdesc: "역전 구조" },
    ];

    const rowH = 42;
    const rows = rounds.map((r, i) => {
      const y = startY + 30 + i * rowH;
      const barDelay = `${0.3 + i * 0.15}s`;
      return `
      <g>
        <rect x="${L}" y="${y}" width="32" height="22" rx="4" fill="#c9a84c" opacity="0.15"/>
        <text x="${L + 16}" y="${y + 15}" text-anchor="middle" fill="#c9a84c" font-size="10" font-weight="700" font-family="sans-serif">${r.tag}</text>
        <text x="${L + 42}" y="${y + 10}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${r.name}</text>
        <text x="${L + 42}" y="${y + 22}" fill="#888" font-size="8.5" font-family="sans-serif">${r.desc}</text>
        ${r.subdesc ? `<text x="${R}" y="${y + 10}" text-anchor="end" fill="#555" font-size="7.5" font-family="sans-serif" font-style="italic">${r.subdesc}</text>` : ""}
        <rect x="${L}" y="${y + 30}" width="0" height="1" fill="#c9a84c" opacity="0.3">
          <animate attributeName="width" from="0" to="${contentW}" dur="0.8s" begin="${barDelay}" fill="freeze"/>
        </rect>
      </g>`;
    }).join("");

    const h = 30 + rounds.length * rowH + 10;
    const svg = `
    ${sectionHeader("ROUND STRUCTURE", startY + 15)}
    ${rows}`;
    return { svg, height: h };
  }

  // ── [E] VENUE MAP ──
  function renderVenueMap(startY) {
    const zones = [
      { label: "코어", w: 50, color: "#c9a84c" },
      { label: "미들", w: 60, color: "#7ba0d4" },
      { label: "하입", w: 70, color: "#e8e8e8" },
      { label: "테라스", w: 70, color: "#888" },
      { label: "산업", w: 50, color: "#555" },
    ];
    const barH = 22;
    const barY = startY + 32;
    const totalBarW = zones.reduce((a, z) => a + z.w, 0); // 300
    const barStartX = L + (contentW - totalBarW) / 2;

    let cx = barStartX;
    const zoneBars = zones.map((z) => {
      const x = cx;
      cx += z.w;
      const isHighlight = z.label === "하입";
      return `
        <rect x="${x}" y="${barY}" width="${z.w}" height="${barH}" fill="${z.color}" opacity="${isHighlight ? 0.35 : 0.12}" stroke="${z.color}" stroke-width="${isHighlight ? 1.5 : 0.5}" rx="2"/>
        <text x="${x + z.w / 2}" y="${barY + 14}" text-anchor="middle" fill="${isHighlight ? "#fff" : z.color}" font-size="8" font-weight="${isHighlight ? "700" : "400"}" font-family="sans-serif">${isHighlight ? "★ " + z.label : z.label}</text>`;
    }).join("");

    const legendY = barY + barH + 16;
    const legend = `<text x="210" y="${legendY}" text-anchor="middle" fill="#666" font-size="8" font-family="sans-serif">★ PRISM Studio — 하입 로드 7번길, 프라임시티</text>`;

    const h = legendY + 10 - startY;
    const svg = `
    ${sectionHeader("VENUE", startY + 15)}
    ${zoneBars}
    ${legend}`;
    return { svg, height: h };
  }

  // ── [F] MODE COMMANDS ──
  function renderModes(startY) {
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
    const utilModes = [
      { icon: "📋✦", name: "선택지", trigger: "!선택지", desc: "행동 분기 명시적 제시", accent: "#d4a84c" },
      { icon: "🔍", name: "디테일", trigger: "!디테일", desc: "감각 밀도 ×1.5", accent: "#c9a84c" },
      { icon: "⏩", name: "스킵", trigger: "!스킵", desc: "몽타주 시간 가속", accent: "#888" },
      { icon: "🕶️", name: "비하인드", trigger: "!비하인드", desc: "업계 이면 포커스", accent: "#7ba0d4" },
      { icon: "💫", name: "소꿉친구", trigger: "!소꿉친구", desc: "장그루 배경 서사", accent: "#b07ad4" },
    ];

    function modeCell(m, x, y, cellH) {
      return `
      <g>
        <rect x="${x}" y="${y}" width="${colW}" height="${cellH}" rx="4" fill="#141428" stroke="#2a2a3a" stroke-width="0.5"/>
        <text x="${x + 10}" y="${y + Math.round(cellH * 0.6)}" font-size="13" font-family="'Segoe UI Emoji','Apple Color Emoji',sans-serif">${m.icon}</text>
        <text x="${x + 32}" y="${y + 16}" fill="${m.accent}" font-size="10" font-weight="700" font-family="sans-serif">${m.name}</text>
        <text x="${x + 32}" y="${y + 30}" fill="#777" font-size="8.5" font-family="sans-serif">${m.desc}</text>
        <text x="${x + colW - 8}" y="${y + 14}" text-anchor="end" fill="#444" font-size="7" font-family="monospace" opacity="0.8">${m.trigger}</text>
      </g>`;
    }

    function renderGrid(modes, label, baseY, cellH) {
      const rowH = cellH + 6;
      let svg = `<text x="${L}" y="${baseY}" fill="#666" font-size="8.5" font-weight="600" font-family="sans-serif" letter-spacing="1.5">${label}</text>`;
      modes.forEach((m, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        svg += modeCell(m, L + col * (colW + gapX), baseY + 10 + row * rowH, cellH);
      });
      const rows = Math.ceil(modes.length / 2);
      return { svg, height: rows * rowH + 24 };
    }

    let cy = startY + 30;
    const main = renderGrid(mainModes, "MAIN STORY", cy, 40);
    cy += main.height;
    const career = renderGrid(careerModes, "CAREER MODES — !명령어로 전환", cy, 40);
    cy += career.height;
    const util = renderGrid(utilModes, "UTILITY MODES — !명령어로 전환", cy, 40);
    cy += util.height;

    const noteY = cy + 2;
    const note = `<text x="${L}" y="${noteY}" fill="#555" font-size="8" font-family="sans-serif">모드 활성화 시 상태창 🔧란에 해당 이모지가 유지됩니다</text>`;

    const h = noteY + 14 - startY;
    const svg = `
    ${sectionHeader("AVAILABLE MODES", startY + 15)}
    ${main.svg}${career.svg}${util.svg}
    ${note}`;
    return { svg, height: h };
  }

  // ── [G] NSFW ASSET TOGGLE ──
  function renderNsfwToggle(startY) {
    const boxY = startY + 6;
    const boxH = 50;
    const svg = `
    <rect x="${L}" y="${boxY}" width="${contentW}" height="${boxH}" rx="6" fill="#1a1020" stroke="#d46b8a" stroke-width="0.5" opacity="0.6"/>
    <text x="${L + 16}" y="${boxY + 16}" fill="#d46b8a" font-size="9" font-weight="600" font-family="sans-serif">🔞 친밀 장면 진입 시 상태창에 🔞가 추가됩니다</text>
    <text x="${L + 16}" y="${boxY + 30}" fill="#888" font-size="8" font-family="sans-serif">일상 복귀 시 자동 해제 · 이미지 DB: NSFW(20-42) + 삽입(50-67) + 착의(70-86)</text>
    <text x="${L + 16}" y="${boxY + 42}" fill="#555" font-size="7.5" font-family="sans-serif">착의(70-86)는 Clothed NSFW — 성인 에셋이나 직관성을 위해 별도 표기</text>`;
    return { svg, height: boxH + 14 };
  }

  // ── [H] IMAGE OUTPUT ──
  function renderImageOutput(startY) {
    const charLines = [
      { label: "APEX", codes: "SY  NHR  JSH" },
      { label: "BLUE MOON", codes: "ERK  LSH" },
      { label: "PRISM", codes: "HSR" },
      { label: "ROUTE 0", codes: "KHR" },
      { label: "CONTESTANTS", codes: "JGR  MIL  ELA  MMR  HSE  NIA  RAY  LPS" },
    ];

    let cy = startY + 30;
    const cdnLine = `
    <text x="${L}" y="${cy}" fill="#666" font-size="9" font-family="sans-serif">CDN: img.bluehair.blue/ent/</text>
    <text x="${L + 168}" y="${cy}" fill="#c9a84c" font-size="9" font-family="monospace" font-weight="600">{CODE}/{NUM}</text>
    <text x="${L + 250}" y="${cy}" fill="#666" font-size="9" font-family="monospace">.webp</text>
    <text x="${R}" y="${cy}" text-anchor="end" fill="#555" font-size="8.5" font-family="sans-serif">15명 × 74 = 1,110장</text>`;
    cy += 20;

    const charSvg = charLines.map((c) => {
      const line = `
      <text x="${L}" y="${cy}" fill="#555" font-size="7" font-weight="600" font-family="sans-serif" letter-spacing="1">${c.label}</text>
      <text x="${L + 80}" y="${cy}" fill="#666" font-size="8.5" font-family="monospace">${c.codes}</text>`;
      cy += 14;
      return line;
    }).join("");

    // Scene category bars
    cy += 6;
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
      <text x="${x + w / 2}" y="${cy}" text-anchor="middle" fill="${sc.color}" font-size="7" font-weight="600" font-family="sans-serif">${sc.label}</text>
      <rect x="${x}" y="${cy + 4}" width="${w}" height="18" fill="${sc.color}" opacity="0.2"/>
      <rect x="${x}" y="${cy + 4}" width="${w}" height="18" fill="none" stroke="${sc.color}" stroke-width="0.5" opacity="0.3"/>`;
    }).join("");
    const barEnd = `<text x="${L + barW + 8}" y="${cy + 16}" fill="#555" font-size="8" font-family="sans-serif">74/char</text>`;
    cy += 30;

    const h = cy - startY;
    const svg = `
    ${sectionHeader("IMAGE OUTPUT SYSTEM", startY + 15)}
    ${cdnLine}
    ${charSvg}
    ${sceneBars}
    ${barEnd}`;
    return { svg, height: h };
  }

  // ── [I] SITE LINK ──
  function renderSiteLink(startY) {
    const boxY = startY + 4;
    const svg = `
    <rect x="${L}" y="${boxY}" width="${contentW}" height="32" rx="6" fill="#141428" stroke="#c9a84c" stroke-width="0.8" opacity="0.7"/>
    <text x="${L + 16}" y="${boxY + 14}" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif">Prime City 소개 사이트</text>
    <text x="${R - 16}" y="${boxY + 14}" text-anchor="end" fill="#888" font-size="8.5" font-family="monospace">→</text>
    <text x="210" y="${boxY + 26}" text-anchor="middle" fill="#7ba0d4" font-size="9" font-family="monospace">https://intro.bluehair.blue</text>`;
    return { svg, height: 44 };
  }

  // ── [J] FOOTER ──
  function renderFooter(startY) {
    const warnY = startY + 6;
    const svg = `
    <rect x="${L}" y="${warnY}" width="${contentW}" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="${warnY + 14}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">⚠ 본 문서는 심사위원 전용 브리핑입니다</text>
    <text x="210" y="${warnY + 28}" text-anchor="middle" fill="#666" font-size="8.5" font-family="sans-serif">무단 유출 시 프라임시티 방송위원회 규정에 의거하여 제재됩니다</text>
    <text x="210" y="${warnY + 52}" text-anchor="middle" fill="#444" font-size="8" font-family="sans-serif">© PPP Operating Committee · Prime City Broadcasting Authority</text>`;
    return { svg, height: 66 };
  }

  // ══════════════════════════════════════════════
  //  ASSEMBLY — cascade sections with relative Y
  // ══════════════════════════════════════════════

  const header = renderHeader();
  let curY = header.height + 10;

  const briefing = renderBriefing(curY);
  curY += briefing.height + SEC_GAP;

  const divBriefing = divider(curY - 10);
  const judges = renderJudges(curY);
  curY += judges.height + SEC_GAP;

  const divJudges = divider(curY - 10);
  const rounds = renderRounds(curY);
  curY += rounds.height + SEC_GAP;

  const divRounds = divider(curY - 10);
  const venue = renderVenueMap(curY);
  curY += venue.height + SEC_GAP;

  const divVenue = divider(curY - 10);
  const modes = renderModes(curY);
  curY += modes.height + SEC_GAP;

  const divModes = divider(curY - 10);
  const nsfwToggle = renderNsfwToggle(curY);
  curY += nsfwToggle.height + SEC_GAP;

  const divNsfw = divider(curY - 10);
  const imageOutput = renderImageOutput(curY);
  curY += imageOutput.height + SEC_GAP;

  const siteLink = renderSiteLink(curY);
  curY += siteLink.height + 10;

  const footer = renderFooter(curY);
  curY += footer.height + 10;

  const totalH = curY + 28;
  const innerH = totalH - 28;
  const screenH = totalH - 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${totalH}">
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
  <rect width="${W}" height="${totalH}" rx="24" fill="#111" stroke="#2a2a3a" stroke-width="1.5"/>
  <rect x="14" y="14" width="392" height="${innerH}" rx="12" fill="url(#tablet-bg)"/>

  <g clip-path="url(#screen-clip)">

    <!-- Scan line -->
    <rect x="20" y="-100" width="380" height="100" fill="url(#scanline)">
      <animateTransform attributeName="transform" type="translate" from="0 -100" to="0 ${totalH + 100}" dur="8s" repeatCount="indefinite"/>
    </rect>

    ${header.svg}
    ${briefing.svg}
    ${divBriefing}
    ${judges.svg}
    ${divJudges}
    ${rounds.svg}
    ${divRounds}
    ${venue.svg}
    ${divVenue}
    ${modes.svg}
    ${divModes}
    ${nsfwToggle.svg}
    ${divNsfw}
    ${imageOutput.svg}
    ${siteLink.svg}
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
