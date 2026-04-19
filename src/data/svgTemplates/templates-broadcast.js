// ── Broadcast Templates: Livestream, Breaking News, Tablet Briefing, Schedule Board ──

import { escapeXml, charAssets, safeImageUrl, typeColor } from "./helpers.js";

// ── 3. Livestream ──
function generateLivestream(p) {
  const streamer = p.streamer || "강하람";
  const title = p.title || "데뷔 연습 라이브! 오늘 열심히 해볼게요";
  const viewers = p.viewers || "12,847";
  const category = p.category || "음악";
  const chat1 = p.chat1 || "화이팅!!!";
  const chat2 = p.chat2 || "목소리 너무 좋다";
  const chat3 = p.chat3 || "앵콜 앵콜!!!";
  const assets = charAssets(p.char);
  const avatarUrl = safeImageUrl(p.avatar) || safeImageUrl(assets.avatar);
  const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.stream);

  const avatarSvg = avatarUrl
    ? `<defs><clipPath id="ls-avatar-clip"><circle cx="18" cy="18" r="18"/></clipPath></defs>
    <image href="${escapeXml(avatarUrl)}" x="0" y="0" width="36" height="36" clip-path="url(#ls-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="18" cy="18" r="18" fill="#2a2a4a" stroke="#c9a84c" stroke-width="2"/>
    <text x="18" y="23" text-anchor="middle" fill="#c9a84c" font-size="14" font-weight="bold" font-family="sans-serif">${escapeXml(streamer[0] || "?")}</text>`;

  const streamImageSvg = imageUrl
    ? `<image href="${escapeXml(imageUrl)}" x="0" y="0" width="400" height="240" clip-path="url(#stream-clip)" preserveAspectRatio="xMidYMid slice"/>
  <defs><clipPath id="stream-clip"><rect x="0" y="0" width="400" height="240" rx="12"/></clipPath></defs>`
    : `<rect x="0" y="0" width="400" height="240" rx="12 12 0 0" fill="#18182a"/>
  <text x="200" y="125" text-anchor="middle" fill="#444" font-size="14" font-family="sans-serif">LIVE STREAM</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
  <rect width="400" height="480" rx="12" fill="#0e0e1a"/>
  <!-- Stream preview area -->
  ${streamImageSvg}
  <!-- LIVE badge (animated) -->
  <rect x="12" y="12" width="50" height="22" rx="4" fill="#e03e3e">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="37" y="27" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="sans-serif">LIVE</text>
  <!-- Viewers -->
  <rect x="70" y="12" width="80" height="22" rx="4" fill="rgba(0,0,0,0.6)"/>
  <text x="110" y="27" text-anchor="middle" fill="#e8e8e8" font-size="11" font-family="sans-serif">👁 ${escapeXml(viewers)}</text>
  <!-- Streamer info -->
  <g transform="translate(16, 254)">
    ${avatarSvg}
    <text x="46" y="16" fill="#e8e8e8" font-size="14" font-weight="600" font-family="sans-serif">${escapeXml(streamer)}</text>
    <text x="46" y="32" fill="#888" font-size="10" font-family="sans-serif">${escapeXml(category)}</text>
  </g>
  <!-- Title -->
  <text x="16" y="310" fill="#ccc" font-size="12" font-family="sans-serif">${escapeXml(title.substring(0, 45))}</text>
  <!-- Divider -->
  <line x1="16" y1="324" x2="384" y2="324" stroke="#222" stroke-width="1"/>
  <!-- Chat overlay (scrolling animation) -->
  <g transform="translate(16, 330)">
    <text x="0" y="0" fill="#888" font-size="10" font-weight="600" font-family="sans-serif">실시간 채팅</text>
  </g>
  <defs><clipPath id="chat-clip"><rect x="16" y="335" width="368" height="90"/></clipPath></defs>
  <g clip-path="url(#chat-clip)">
    <g>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -90" dur="8s" repeatCount="indefinite"/>
      <g transform="translate(16, 345)">
        <text x="0" y="0" fill="#4a9eff" font-size="11" font-family="sans-serif">유저1</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat1)}</text>
      </g>
      <g transform="translate(16, 375)">
        <text x="0" y="0" fill="#e0a040" font-size="11" font-family="sans-serif">유저2</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat2)}</text>
      </g>
      <g transform="translate(16, 405)">
        <text x="0" y="0" fill="#40c060" font-size="11" font-family="sans-serif">유저3</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat3)}</text>
      </g>
      <!-- Duplicated for seamless loop -->
      <g transform="translate(16, 435)">
        <text x="0" y="0" fill="#4a9eff" font-size="11" font-family="sans-serif">유저1</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat1)}</text>
      </g>
      <g transform="translate(16, 465)">
        <text x="0" y="0" fill="#e0a040" font-size="11" font-family="sans-serif">유저2</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat2)}</text>
      </g>
      <g transform="translate(16, 495)">
        <text x="0" y="0" fill="#40c060" font-size="11" font-family="sans-serif">유저3</text>
        <text x="40" y="0" fill="#ccc" font-size="11" font-family="sans-serif">${escapeXml(chat3)}</text>
      </g>
    </g>
  </g>
  <!-- Chat input -->
  <rect x="16" y="440" width="330" height="28" rx="14" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
  <text x="30" y="458" fill="#555" font-size="11" font-family="sans-serif">채팅을 입력하세요...</text>
  <rect x="352" y="440" width="36" height="28" rx="14" fill="#c9a84c"/>
  <text x="370" y="458" text-anchor="middle" fill="#1a1a2e" font-size="12" font-weight="600" font-family="sans-serif">→</text>
  <rect width="400" height="480" rx="12" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

// ── 5. Breaking News ──
function generateNews(p) {
  const channel = p.channel || "PRIME NEWS";
  const headline = p.headline || "APEX 엔터 신인 오디션 최종 라운드 돌입";
  const sub = p.sub || "나하린 프로듀서 직접 심사";
  const reporter = p.reporter || "김기자";
  const time = p.time || "LIVE 오후 8:00";
  const ticker = p.ticker || "프라임시티 엔터테인먼트 지수 사상 최고치 경신";
  const assets = charAssets(p.char);
  const imageUrl = safeImageUrl(p.image) || safeImageUrl(assets.news);

  const newsImageSvg = imageUrl
    ? `<image href="${escapeXml(imageUrl)}" x="300" y="84" width="180" height="140" preserveAspectRatio="xMidYMid slice"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280">
  <rect width="500" height="280" rx="8" fill="#0a0a1a"/>
  <!-- Channel bar -->
  <rect x="0" y="0" width="500" height="40" fill="#1a1a2e"/>
  <text x="16" y="26" fill="#c9a84c" font-size="14" font-weight="700" font-family="sans-serif">${escapeXml(channel)}</text>
  <rect x="140" y="10" width="50" height="20" rx="3" fill="#e03e3e">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="165" y="24" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="sans-serif">LIVE</text>
  <text x="484" y="26" text-anchor="end" fill="#888" font-size="11" font-family="sans-serif">${escapeXml(time)}</text>
  <!-- Breaking banner (flash animation) -->
  <rect x="0" y="44" width="500" height="32" fill="#c62828">
    <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
  </rect>
  <text x="16" y="65" fill="#fff" font-size="13" font-weight="700" font-family="sans-serif">⚡ 속보 BREAKING</text>
  <!-- News image -->
  ${newsImageSvg}
  <!-- Headline -->
  <text x="16" y="108" fill="#e8e8e8" font-size="18" font-weight="700" font-family="sans-serif">${escapeXml(headline.substring(0, 30))}</text>
  ${headline.length > 30 ? `<text x="16" y="132" fill="#e8e8e8" font-size="18" font-weight="700" font-family="sans-serif">${escapeXml(headline.substring(30, 60))}</text>` : ""}
  <!-- Sub -->
  <text x="16" y="${headline.length > 30 ? 158 : 134}" fill="#aaa" font-size="13" font-family="sans-serif">${escapeXml(sub.substring(0, 42))}</text>
  <!-- Reporter -->
  <text x="16" y="${headline.length > 30 ? 186 : 162}" fill="#888" font-size="11" font-family="sans-serif">${escapeXml(reporter)} 기자</text>
  <!-- Ticker bar -->
  <rect x="0" y="240" width="500" height="40" fill="#12122a"/>
  <clipPath id="ticker-clip"><rect x="0" y="240" width="500" height="40"/></clipPath>
  <g clip-path="url(#ticker-clip)">
    <text y="264" fill="#c9a84c" font-size="12" font-family="sans-serif">
      <tspan>${escapeXml(ticker)}</tspan>
      <animateTransform attributeName="transform" type="translate" from="500 0" to="-1200 0" dur="20s" repeatCount="indefinite"/>
    </text>
  </g>
  <rect width="500" height="280" rx="8" fill="none" stroke="#222" stroke-width="1"/>
</svg>`;
}

// ── 9. Tablet Briefing ──
// SYNC: Keep in sync with workers/svg-tablet.js
function generateTablet(p) {
  const user = escapeXml(p.user || "{{user}}");
  const agency = escapeXml(p.agency || "PRISM Studio");
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
  const SEC_GAP = 24;  // uniform section gap

  // ── Section accent bar helper ──
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
  // [1] status bar y=34로 하향 (코너 브라켓 겹침 해소)
  // [2] PRIME PRIORITY 영문화
  // [3] 시즌 표시 제거
  // [4] "본선 심사위원 위촉 서한"
  function renderHeader() {
    const h = 180;
    const svg = `
    <!-- Status bar — [1] y=34 to avoid corner bracket overlap -->
    <rect x="20" y="34" width="380" height="24" fill="#0a0a18" opacity="0.8"/>
    <text x="36" y="50" fill="#555" font-size="9" font-family="sans-serif">${date || "D-7"}</text>
    <text x="380" y="50" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">CONFIDENTIAL</text>

    <!-- PPP Logo -->
    <g transform="translate(210, 88)">
      <polygon points="0,-22 19,11 -19,11" fill="none" stroke="url(#gold-grad)" stroke-width="1.5" filter="url(#glow)">
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="0,-12 10,6 -10,6" fill="#c9a84c" opacity="0.15"/>
    </g>
    <text x="210" y="130" text-anchor="middle" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif" letter-spacing="4">P R O D U C E</text>
    <!-- [2] English program name -->
    <text x="210" y="150" text-anchor="middle" fill="#e8e8e8" font-size="16" font-weight="700" font-family="sans-serif">PRIME PRIORITY</text>
    <!-- [3] season removed, [4] 본선 추가 -->
    <text x="210" y="168" text-anchor="middle" fill="#555" font-size="9" font-family="sans-serif" font-style="italic">본선 심사위원 위촉 서한</text>

    <!-- Divider -->
    <line x1="80" y1="180" x2="340" y2="180" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>
    <circle cx="210" cy="180" r="2" fill="#c9a84c" opacity="0.5"/>`;
    return { svg, height: h };
  }

  // ── [B] AUDITION BRIEFING ──
  // [5] "본선 진출자" + 간격 확보
  function renderBriefing(startY) {
    const h = 100;
    const svg = `
    ${sectionHeader("AUDITION BRIEFING", startY + 18)}
    <g>
      <text x="${L}" y="${startY + 50}" fill="#666" font-size="10" font-family="sans-serif">부문</text>
      <text x="130" y="${startY + 50}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${division}</text>
      <text x="230" y="${startY + 50}" fill="#666" font-size="10" font-family="sans-serif">본선 진출자</text>
      <text x="320" y="${startY + 50}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">8명</text>
    </g>
    <g>
      <text x="${L}" y="${startY + 70}" fill="#666" font-size="10" font-family="sans-serif">라운드</text>
      <text x="130" y="${startY + 70}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">총 4라운드</text>
      <text x="230" y="${startY + 70}" fill="#666" font-size="10" font-family="sans-serif">기간</text>
      <text x="320" y="${startY + 70}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">약 2개월</text>
    </g>
    <g>
      <text x="${L}" y="${startY + 90}" fill="#666" font-size="10" font-family="sans-serif">분야</text>
      <text x="130" y="${startY + 90}" fill="#ccc" font-size="10" font-family="sans-serif">아이돌 · 가수 · 댄서 · 싱어송라이터 · 멀티</text>
    </g>`;
    return { svg, height: h };
  }

  // ── [C] JUDGE PANEL ──
  // [6] 원형 아이콘 R-14로 수정
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
        ${profile ? `<text x="${L + 16}" y="${y + 48}" fill="#555" font-size="9" font-family="sans-serif">${profile}</text>` : ""}
        <!-- [6] R-14 to keep circle inside card -->
        <rect x="${R - 14}" y="${y + 12}" width="8" height="8" rx="4" fill="${isUser ? "#c9a84c" : "#555"}" opacity="${isUser ? 1 : 0.5}"/>
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

    const note = `<text x="210" y="${cy + 6}" text-anchor="middle" fill="#555" font-size="9" font-family="sans-serif">심사위원 상호 간 평가 방식, 합의 구조는 라운드별 상이</text>`;
    const h = cy + 16 - startY;

    const svg = `
    ${sectionHeader("JUDGE PANEL", startY + 15)}
    ${j1}${j2}${j3}
    ${note}`;
    return { svg, height: h };
  }

  // ── [D] ROUND STRUCTURE ──
  // [7] subdesc 별도 줄 + 폰트 확대 + rowH 48
  function renderRounds(startY) {
    const rounds = [
      { tag: "1R", name: "등급 평가", desc: "개인 무대 → 등급 배정", subdesc: "탈락 없음" },
      { tag: "2R", name: "프로듀서 픽", desc: "지명 → 대결 → 탈락 2인", subdesc: "" },
      { tag: "3R", name: "팀 대항전", desc: "팀 매치 → 패자부활 → 3인 생존", subdesc: "~ 합숙 1개월 후" },
      { tag: "4R", name: "최종 선택", desc: "참가자가 프로듀서를 선택", subdesc: "역전 구조" },
    ];

    const rowH = 48;
    const rows = rounds.map((r, i) => {
      const y = startY + 30 + i * rowH;
      const barDelay = `${0.3 + i * 0.15}s`;
      return `
      <g>
        <rect x="${L}" y="${y}" width="32" height="22" rx="4" fill="#c9a84c" opacity="0.15"/>
        <text x="${L + 16}" y="${y + 15}" text-anchor="middle" fill="#c9a84c" font-size="10" font-weight="700" font-family="sans-serif">${r.tag}</text>
        <text x="${L + 42}" y="${y + 11}" fill="#e8e8e8" font-size="11" font-weight="600" font-family="sans-serif">${r.name}</text>
        <text x="${L + 42}" y="${y + 24}" fill="#888" font-size="10" font-family="sans-serif">${r.desc}</text>
        ${r.subdesc ? `<text x="${L + 42}" y="${y + 36}" fill="#666" font-size="9" font-family="sans-serif" font-style="italic">${r.subdesc}</text>` : ""}
        <rect x="${L}" y="${y + 40}" width="0" height="1" fill="#c9a84c" opacity="0.3">
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
  // [8] "오시는 길" + 더 코어 프라임 돔 강조
  function renderVenueMap(startY) {
    const zones = [
      { label: "코어", w: 50, color: "#c9a84c" },
      { label: "미들", w: 60, color: "#7ba0d4" },
      { label: "하입", w: 70, color: "#e8e8e8" },
      { label: "테라스", w: 70, color: "#888" },
      { label: "산업", w: 50, color: "#555" },
    ];
    const barH = 24;
    const barY = startY + 34;
    const totalBarW = zones.reduce((a, z) => a + z.w, 0);
    const barStartX = L + (contentW - totalBarW) / 2;

    let cx = barStartX;
    const zoneBars = zones.map((z) => {
      const x = cx;
      cx += z.w;
      const isHighlight = z.label === "코어";
      return `
        <rect x="${x}" y="${barY}" width="${z.w}" height="${barH}" fill="${z.color}" opacity="${isHighlight ? 0.35 : 0.12}" stroke="${z.color}" stroke-width="${isHighlight ? 1.5 : 0.5}" rx="2"/>
        <text x="${x + z.w / 2}" y="${barY + 16}" text-anchor="middle" fill="${isHighlight ? "#fff" : z.color}" font-size="9" font-weight="${isHighlight ? "700" : "400"}" font-family="sans-serif">${isHighlight ? "★ " + z.label : z.label}</text>`;
    }).join("");

    const legendY = barY + barH + 18;
    const legend = `<text x="210" y="${legendY}" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif">★ 프라임 돔 — 더 코어 중앙, 프라임시티</text>`;

    const h = legendY + 12 - startY;
    const svg = `
    ${sectionHeader("오시는 길", startY + 15)}
    ${zoneBars}
    ${legend}`;
    return { svg, height: h };
  }

  // ── [F] MODE COMMANDS ──
  // [9] 소꿉친구 desc 수정
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
      { icon: "🏢", name: "대표", trigger: "!대표모드", desc: "에이전시 경영 · 아티스트 육성", accent: "#d46b6b" },
    ];
    const utilModes = [
      { icon: "🧩", name: "프리플레이", trigger: "!프리플레이", desc: "커스텀 설정 오버레이", accent: "#b07ad4" },
      { icon: "📋✦", name: "선택지", trigger: "!선택지", desc: "행동 분기 명시적 제시", accent: "#d4a84c" },
      { icon: "🔍", name: "디테일", trigger: "!디테일", desc: "감각 밀도 ×1.5", accent: "#c9a84c" },
      { icon: "⏩", name: "스킵", trigger: "!스킵", desc: "몽타주 시간 가속", accent: "#888" },
      { icon: "🕶️", name: "비하인드", trigger: "!비하인드", desc: "업계 이면 포커스", accent: "#7ba0d4" },
      { icon: "💫", name: "소꿉친구", trigger: "!소꿉친구", desc: "장그루 소꿉친구 배경 활성화", accent: "#b07ad4" },
      { icon: "🔧", name: "디버그", trigger: "!디버그", desc: "기술적 수정 · 코드 조정", accent: "#888" },
    ];

    function modeCell(m, x, y, cellH) {
      return `
      <g>
        <rect x="${x}" y="${y}" width="${colW}" height="${cellH}" rx="4" fill="#141428" stroke="#2a2a3a" stroke-width="0.5"/>
        <text x="${x + 10}" y="${y + Math.round(cellH * 0.6)}" font-size="13" font-family="'Segoe UI Emoji','Apple Color Emoji',sans-serif">${m.icon}</text>
        <text x="${x + 32}" y="${y + 16}" fill="${m.accent}" font-size="10" font-weight="700" font-family="sans-serif">${m.name}</text>
        <text x="${x + 32}" y="${y + 30}" fill="#777" font-size="9" font-family="sans-serif">${m.desc}</text>
        <text x="${x + colW - 8}" y="${y + 14}" text-anchor="end" fill="#444" font-size="7.5" font-family="monospace" opacity="0.8">${m.trigger}</text>
      </g>`;
    }

    function renderGrid(modes, label, baseY, cellH) {
      const rowH = cellH + 6;
      let svg = `<text x="${L}" y="${baseY}" fill="#666" font-size="9" font-weight="600" font-family="sans-serif" letter-spacing="1.5">${label}</text>`;
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
    const note = `<text x="${L}" y="${noteY}" fill="#555" font-size="9" font-family="sans-serif">모드 활성화 시 상태창 🔧란에 해당 이모지가 유지됩니다</text>`;

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
    const boxH = 52;
    const svg = `
    <rect x="${L}" y="${boxY}" width="${contentW}" height="${boxH}" rx="6" fill="#1a1020" stroke="#d46b8a" stroke-width="0.5" opacity="0.6"/>
    <text x="${L + 16}" y="${boxY + 17}" fill="#d46b8a" font-size="10" font-weight="600" font-family="sans-serif">🔞 친밀 장면 진입 시 상태창에 🔞가 추가됩니다</text>
    <text x="${L + 16}" y="${boxY + 32}" fill="#888" font-size="9" font-family="sans-serif">일상 복귀 시 자동 해제 · 이미지 DB: NSFW(20-42) + 삽입(50-67) + 착의(70-86)</text>
    <text x="${L + 16}" y="${boxY + 44}" fill="#555" font-size="8" font-family="sans-serif">착의(70-86)는 Clothed NSFW — 성인 에셋이나 직관성을 위해 별도 표기</text>`;
    return { svg, height: boxH + 14 };
  }

  // ── [H] IMAGE OUTPUT ──
  // [10] 글자 겹침 해소 + 전체 폰트 상향
  function renderImageOutput(startY) {
    const charLines = [
      { label: "APEX", codes: "SY  NHR  JSH" },
      { label: "BLUE MOON", codes: "ERP  ERK  LSH" },
      { label: "PRISM", codes: "HSR" },
      { label: "ROUTE 0", codes: "KHR  SIA  NOA" },
      { label: "FREELANCE", codes: "APR" },
      { label: "CONTESTANTS", codes: "JGR  MIL  ELA  MMR  HSE  NIA  RAY  LPS" },
    ];

    let cy = startY + 32;

    // CDN 경로 — 2줄로 분리
    const cdnLine = `
    <text x="${L}" y="${cy}" fill="#666" font-size="10" font-family="sans-serif">CDN: img.bluehair.blue/ent/</text>
    <text x="${R}" y="${cy}" text-anchor="end" fill="#555" font-size="10" font-family="sans-serif">19명 × ~102 = 1,938장+</text>`;
    cy += 18;
    const cdnFormat = `
    <text x="${L}" y="${cy}" fill="#c9a84c" font-size="10" font-family="monospace" font-weight="600">{CODE}/{NUM}.webp</text>`;
    cy += 22;

    // 소속사 코드표 — label과 codes 간격 확보
    const charSvg = charLines.map((c) => {
      const line = `
      <text x="${L}" y="${cy}" fill="#555" font-size="8" font-weight="600" font-family="sans-serif" letter-spacing="1">${c.label}</text>
      <text x="${L + 90}" y="${cy}" fill="#666" font-size="9.5" font-family="monospace">${c.codes}</text>`;
      cy += 18;
      return line;
    }).join("");

    // Scene category bars — 확대
    cy += 8;
    const sceneCats = [
      { label: "감정 1–9", n: 9, color: "#c9a84c" },
      { label: "일상 10–19", n: 10, color: "#7ba0d4" },
      { label: "NSFW 20–69", n: 50, color: "#d46b8a" },
      { label: "착의 70–86", n: 17, color: "#6bacd4" },
      { label: "확장 87–92", n: 6, color: "#b07ad4" },
      { label: "무대 93–96", n: 4, color: "#6db87a" },
    ];
    const barW = contentW - 50;
    let barOffset = 0;
    const sceneBars = sceneCats.map((sc) => {
      const w = (sc.n / 96) * barW;
      const x = L + barOffset;
      barOffset += w;
      return `
      <text x="${x + w / 2}" y="${cy}" text-anchor="middle" fill="${sc.color}" font-size="8" font-weight="600" font-family="sans-serif">${sc.label}</text>
      <rect x="${x}" y="${cy + 5}" width="${w}" height="22" fill="${sc.color}" opacity="0.2"/>
      <rect x="${x}" y="${cy + 5}" width="${w}" height="22" fill="none" stroke="${sc.color}" stroke-width="0.5" opacity="0.3"/>`;
    }).join("");
    const barEnd = `<text x="${L + barW + 8}" y="${cy + 18}" fill="#555" font-size="9" font-family="sans-serif">102/char</text>`;
    cy += 36;

    const h = cy - startY;
    const svg = `
    ${sectionHeader("IMAGE OUTPUT SYSTEM", startY + 15)}
    ${cdnLine}
    ${cdnFormat}
    ${charSvg}
    ${sceneBars}
    ${barEnd}`;
    return { svg, height: h };
  }

  // ── [J] FOOTER ──
  function renderFooter(startY) {
    const warnY = startY + 6;
    const svg = `
    <rect x="${L}" y="${warnY}" width="${contentW}" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="${warnY + 14}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">⚠ 본 문서는 심사위원 전용 브리핑입니다</text>
    <text x="210" y="${warnY + 28}" text-anchor="middle" fill="#666" font-size="9" font-family="sans-serif">무단 유출 시 프라임시티 방송위원회 규정에 의거하여 제재됩니다</text>
    <text x="210" y="${warnY + 52}" text-anchor="middle" fill="#444" font-size="8" font-family="sans-serif">© PPP Operating Committee · Prime City Broadcasting Authority</text>`;
    return { svg, height: 66 };
  }

  // ══════════════════════════════════════════════
  //  ASSEMBLY — cascade sections with relative Y
  // ══════════════════════════════════════════════

  const header = renderHeader();
  let curY = header.height + 12;

  const briefing = renderBriefing(curY);
  curY += briefing.height + SEC_GAP;

  const divBriefing = divider(curY - 12);
  const judges = renderJudges(curY);
  curY += judges.height + SEC_GAP;

  const divJudges = divider(curY - 12);
  const rounds = renderRounds(curY);
  curY += rounds.height + SEC_GAP;

  const divRounds = divider(curY - 12);
  const venue = renderVenueMap(curY);
  curY += venue.height + SEC_GAP;

  const divVenue = divider(curY - 12);
  const modes = renderModes(curY);
  curY += modes.height + SEC_GAP;

  const divModes = divider(curY - 12);
  const nsfwToggle = renderNsfwToggle(curY);
  curY += nsfwToggle.height + SEC_GAP;

  const divNsfw = divider(curY - 12);
  const imageOutput = renderImageOutput(curY);
  curY += imageOutput.height + SEC_GAP;

  // [11] site link 섹션 제거 — 별도 이미지+하이퍼링크로 대체

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

// ── 10. Schedule Board ──
// SYNC: Keep in sync with workers/svg-schedule.js
function generateSchedule(p) {
  const user    = escapeXml(p.user    || "{{user}}");
  const artist  = escapeXml(p.artist  || "서윤");
  const date    = escapeXml(p.date    || "");

  const W = 420;
  const L = 50;
  const R = 370;
  const contentW = R - L;
  const SEC_GAP = 24;

  function sectionHeader(label, y) {
    return `
    <rect x="${L - 6}" y="${y - 10}" width="3" height="14" rx="1" fill="#c9a84c" opacity="0.5"/>
    <text x="${L}" y="${y}" fill="#888" font-size="10" font-weight="600" font-family="sans-serif" letter-spacing="2">${label}</text>
    <rect x="${L}" y="${y + 5}" width="50" height="1.5" fill="#c9a84c" opacity="0.4"/>`;
  }

  function divider(y) {
    return `<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" stroke="#222" stroke-width="0.5"/>`;
  }

  function renderHeader() {
    const h = 110;
    const svg = `
    <rect x="20" y="34" width="380" height="24" fill="#0a0a18" opacity="0.8"/>
    <text x="36" y="50" fill="#555" font-size="9" font-family="sans-serif">${date || "날짜 미정"}</text>
    <text x="380" y="50" text-anchor="end" fill="#555" font-size="9" font-family="sans-serif">SCHEDULE</text>
    <text x="210" y="82" text-anchor="middle" fill="#c9a84c" font-size="11" font-weight="600" font-family="sans-serif" letter-spacing="4">
      S C H E D U L E
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </text>
    <text x="210" y="100" text-anchor="middle" fill="#e8e8e8" font-size="14" font-weight="700" font-family="sans-serif">${artist}</text>
    <line x1="80" y1="${h}" x2="340" y2="${h}" stroke="#c9a84c" stroke-width="0.5" opacity="0.3"/>
    <circle cx="210" cy="${h}" r="2" fill="#c9a84c" opacity="0.5"/>`;
    return { svg, height: h };
  }

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

  function renderStatus(startY) {
    const cond = parseInt(p.condition) || 0;
    const rep  = escapeXml(p.reputation || "");
    const note = escapeXml(p.note || "");
    if (!cond && !rep && !note) return { svg: "", height: 0 };
    let svg = sectionHeader("STATUS", startY + 18);
    let cy = startY + 40;
    if (cond > 0) {
      const blocks = [];
      for (let i = 1; i <= 5; i++) {
        const filled = i <= cond;
        blocks.push(`<rect x="${L + 60 + (i - 1) * 20}" y="${cy - 10}" width="14" height="14" rx="2" fill="${filled ? "#c9a84c" : "#2a2a3a"}" stroke="${filled ? "#c9a84c" : "#333"}" stroke-width="0.5"/>`);
      }
      svg += `
      <text x="${L}" y="${cy}" fill="#888" font-size="10" font-family="sans-serif">컨디션</text>
      ${blocks.join("")}`;
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
    if (note) {
      svg += `
      <text x="${L}" y="${cy}" fill="#888" font-size="9" font-family="sans-serif">메모</text>
      <text x="${L + 36}" y="${cy}" fill="#aaa" font-size="10" font-family="sans-serif">${note}</text>`;
      cy += 20;
    }
    const h = cy - startY + 8;
    return { svg, height: h };
  }

  function renderFooter(startY) {
    const svg = `
    <rect x="${L}" y="${startY + 6}" width="${contentW}" height="36" rx="6" fill="#1a1028" stroke="#c9a84c" stroke-width="0.5" opacity="0.6"/>
    <text x="210" y="${startY + 20}" text-anchor="middle" fill="#c9a84c" font-size="9" font-weight="600" font-family="sans-serif" opacity="0.8">PRIME CITY ENTERTAINMENT</text>
    <text x="210" y="${startY + 34}" text-anchor="middle" fill="#666" font-size="8" font-family="sans-serif">일정은 상황에 따라 변동될 수 있습니다</text>`;
    return { svg, height: 50 };
  }

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
  <rect width="${W}" height="${totalH}" rx="24" fill="#111" stroke="#2a2a3a" stroke-width="1.5"/>
  <rect x="14" y="14" width="392" height="${innerH}" rx="12" fill="url(#sched-bg)"/>
  <g clip-path="url(#sched-clip)">
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
    <path d="M30,30 L30,50 M30,30 L50,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,30 L390,50 M390,30 L370,30" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M30,${screenH + 10} L30,${screenH - 10} M30,${screenH + 10} L50,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
    <path d="M390,${screenH + 10} L390,${screenH - 10} M390,${screenH + 10} L370,${screenH + 10}" stroke="#c9a84c" stroke-width="0.8" opacity="0.35" fill="none"/>
  </g>
  <rect x="170" y="${totalH - 14}" width="80" height="4" rx="2" fill="#333"/>
  <rect width="${W}" height="${totalH}" rx="24" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.1"/>
</svg>`;
}

export const broadcastSvgTemplates = [
  {
    id: "livestream",
    name: "라이브 방송",
    en: "Livestream",
    category: "방송",
    animated: true,
    desc: "스트리밍 플랫폼 스타일 라이브 방송 화면. LIVE 배지 깜빡임 + 채팅 스크롤 애니메이션 포함.",
    params: [
      { name: "streamer", desc: "스트리머명", example: "강하람" },
      { name: "title", desc: "방송 제목", example: "데뷔 연습 라이브! 오늘 열심히 해볼게요" },
      { name: "viewers", desc: "시청자 수", example: "12,847" },
      { name: "category", desc: "카테고리", example: "음악" },
      { name: "chat1", desc: "채팅 메시지 1", example: "화이팅!!!" },
      { name: "chat2", desc: "채팅 메시지 2", example: "목소리 너무 좋다" },
      { name: "chat3", desc: "채팅 메시지 3", example: "앵콜 앵콜!!!" },
      { name: "char", desc: "캐릭터코드 → 아바타/프리뷰 자동", example: "KHR" },
    ],
    sampleParams: {},
    generate: generateLivestream,
    workerCode: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);
    const svg = generateLivestream(p);
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
    promptExample: `■ 라이브 방송 SVG 출력 프롬프트

【라벨 설명】
- streamer: 방송하는 캐릭터 이름
- title: 방송 제목 (캐릭터가 설정한 제목)
- viewers: 실시간 시청자 수
- category: 방송 카테고리 (음악, 토크, 연습 등)
- chat1~chat3: 실시간 채팅 메시지 3개 (시청자 반응)
- avatar: 스트리머 프로필 이미지 URL (선택)
- image: 방송 프리뷰/썸네일 이미지 URL (선택)

【출력 위치】
캐릭터가 라이브 방송을 시작하거나 시청하는 장면에서
장면 전환 직후, 나레이션 최상단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://live.bluehair.blue/ent/?char={캐릭터코드}&streamer={이름}&title={방송제목}&viewers={시청자수}&category={카테고리}&chat1={채팅1}&chat2={채팅2}&chat3={채팅3})

【예시】
![](https://live.bluehair.blue/ent/?char=KHR&streamer=강하람&title=데뷔%20연습%20라이브!%20오늘%20열심히%20해볼게요&viewers=12%2C847&category=음악&chat1=화이팅!!!&chat2=목소리%20너무%20좋다&chat3=앵콜%20앵콜!!!)`,
  },
  {
    id: "news",
    name: "뉴스 속보",
    en: "Breaking News",
    category: "방송",
    animated: true,
    desc: "뉴스 방송 스타일 속보 화면. LIVE 표시 깜빡임 + 속보 배너 플래시 + 하단 티커 스크롤 애니메이션.",
    params: [
      { name: "channel", desc: "채널명", example: "PRIME NEWS" },
      { name: "headline", desc: "헤드라인", example: "APEX 엔터 신인 오디션 최종 라운드 돌입" },
      { name: "sub", desc: "부제", example: "나하린 프로듀서 직접 심사" },
      { name: "reporter", desc: "기자명", example: "김기자" },
      { name: "time", desc: "방송 시간", example: "LIVE 오후 8:00" },
      { name: "ticker", desc: "하단 티커 텍스트", example: "프라임시티 엔터테인먼트 지수 사상 최고치 경신" },
      { name: "char", desc: "캐릭터코드 → 뉴스 이미지 자동", example: "SY" },
    ],
    sampleParams: {},
    generate: generateNews,
    workerCode: `export default {
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
};`,
    promptExample: `■ 뉴스 속보 SVG 출력 프롬프트

【라벨 설명】
- channel: 뉴스 채널명 (예: PRIME NEWS)
- headline: 메인 헤드라인 (사건의 핵심)
- sub: 부제/보충 설명 (한 줄)
- reporter: 기자명
- time: 방송 시각 (LIVE 포함 가능)
- ticker: 하단 스크롤 자막 (관련 속보 요약)
- char: 캐릭터코드 (SY, NHR 등) → 뉴스 이미지 자동 매핑
- image: 뉴스 이미지 직접 지정 (선택, char보다 우선)

【출력 위치】
방송 뉴스가 나오는 장면, 긴급 속보가 전달되는 장면에서
장면 전환 직후 최상단에 출력.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://news.bluehair.blue/ent/?char={캐릭터코드}&channel={채널명}&headline={헤드라인}&sub={부제}&reporter={기자명}&time={시각}&ticker={자막})

【예시】
![](https://news.bluehair.blue/ent/?char=SY&channel=PRIME%20NEWS&headline=APEX%20엔터%20신인%20오디션%20최종%20라운드%20돌입&sub=나하린%20프로듀서%20직접%20심사&reporter=김기자&time=LIVE%20오후%208:00&ticker=프라임시티%20엔터테인먼트%20지수%20사상%20최고치%20경신)`,
  },
  {
    id: "tablet",
    name: "태블릿 브리핑",
    en: "Tablet Briefing",
    category: "유틸리티",
    animated: true,
    desc: "PPP 오디션 종합 브리핑 태블릿. 심사위원 패널 + 라운드 구조 + 오디션장 약도 + 14개 모드 안내 + NSFW 토글 + 이미지 시스템 + 사이트 링크. 스캔라인 애니메이션.",
    params: [
      { name: "user", desc: "유저(심사위원) 이름", example: "{{user}}" },
      { name: "agency", desc: "유저 소속 기획사", example: "PRISM Studio" },
      { name: "season", desc: "시즌", example: "Season 1" },
      { name: "division", desc: "부문", example: "스테이지" },
      { name: "date", desc: "D-day 또는 날짜", example: "D-7" },
      { name: "judge1", desc: "심사위원1 이름", example: "진시혁" },
      { name: "judge1agency", desc: "심사위원1 소속", example: "APEX Entertainment" },
      { name: "judge2", desc: "심사위원2 이름", example: "에리카" },
      { name: "judge2agency", desc: "심사위원2 소속", example: "Blue Moon Entertainment" },
    ],
    sampleParams: {},
    generate: generateTablet,
    workerCode: `export default {
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
};`,
    promptExample: `■ 태블릿 브리핑 SVG 출력 프롬프트

【라벨 설명】
- user: 유저(심사위원) 이름
- agency: 유저 소속 기획사 (기본: PRISM Studio)
- season: 오디션 시즌 (기본: Season 1)
- division: 부문 (기본: 스테이지)
- date: D-day 표시 (기본: D-7)
- judge1, judge1agency: 심사위원1 이름/소속
- judge2, judge2agency: 심사위원2 이름/소속

【포함 섹션】
오디션 브리핑 / 심사위원 패널(프로필 포함) / 라운드 구조(4R, subdesc) /
오디션장 약도(하입 로드 미니맵) / 모드 안내(14개, 3단 구조) /
🔞 NSFW 토글 안내 / 이미지 출력 시스템(15×74) / 사이트 링크(intro.bluehair.blue)

【출력 위치】
오디션 오프닝에서 한소리가 초대장을 건네는 Beat 7에서 출력.
유저가 심사위원으로서 처음으로 오디션 정보를 받는 순간.

【URL 규칙】
공백 → %20 / 콤마 → %2C / 물음표 → %3F
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://tablet.bluehair.blue/ent/?user={유저이름}&agency={소속기획사}&date={D-day})

【예시】
![](https://tablet.bluehair.blue/ent/?user={{user}}&agency=PRISM%20Studio&date=D-7)`,
  },
  {
    id: "schedule",
    name: "일정표",
    en: "Schedule Board",
    category: "유틸리티",
    animated: true,
    desc: "범용 아티스트 일정표. 모든 모드에서 사용 가능. 오늘 일정(최대 8슬롯) + 향후 예정 + 컨디션/평판 상태 요약. 태블릿 스타일.",
    params: [
      { name: "user", desc: "유저명", example: "{{user}}" },
      { name: "artist", desc: "아티스트명", example: "강하람" },
      { name: "date", desc: "날짜", example: "2026.04.14 (월)" },
      { name: "s1~s8", desc: "일정 시간", example: "09:00" },
      { name: "s{N}name", desc: "일정명", example: "음악방송 리허설" },
      { name: "s{N}loc", desc: "장소 (선택)", example: "KBS" },
      { name: "s{N}type", desc: "유형: broadcast/photo/practice/event/meeting/rest", example: "broadcast" },
      { name: "u1~u3", desc: "향후 일정명", example: "팬사인회" },
      { name: "u{N}day", desc: "향후 날짜", example: "+1d" },
      { name: "u{N}loc", desc: "향후 장소 (선택)", example: "강남" },
      { name: "condition", desc: "컨디션 1~5", example: "4" },
      { name: "reputation", desc: "평판 0~100", example: "72" },
      { name: "note", desc: "특이사항", example: "내일 팬사인회 준비 필요" },
    ],
    sampleParams: {},
    generate: generateSchedule,
    workerCode: `export default {
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
};`,
    promptExample: `■ 일정표 SVG 출력 프롬프트

【라벨 설명】
- user: 유저명 (반드시 {{user}}로 전달)
- artist: 아티스트/캐릭터 본명
- date: 오늘 날짜 (예: 2026.04.14 (월))
- s1~s8: 일정 시간 (09:00 형식)
- s{N}name: 일정명
- s{N}loc: 장소 (선택)
- s{N}type: broadcast/photo/practice/event/meeting/rest
- u1~u3: 향후 일정명
- u{N}day: 향후 날짜 (+1d 또는 4/15 등)
- condition: 컨디션 1~5 (선택)
- reputation: 평판 0~100 (선택)
- note: 메모/특이사항 (선택)

【유형별 색상】
broadcast=핑크 | photo=보라 | practice=초록 | event=골드 | meeting=파랑 | rest=회색

【출력 위치】
새로운 날이 시작되거나, 유저가 일정/스케줄을 확인할 때.
모든 모드에서 범용으로 사용.

【URL 규칙】
공백 → %20 / 콤마 → %2C / +기호 → %2B / 괄호 → %28%29
<, >, 괄호 사용 금지. 한국어는 그대로 사용 가능.

【양식】
![](https://schedule.bluehair.blue/ent/?user={유저}&artist={아티스트}&date={날짜}&s1={시간}&s1name={일정}&s1loc={장소}&s1type={유형}&...)

【예시】
![](https://schedule.bluehair.blue/ent/?user={{user}}&artist=강하람&date=2026.04.14%20(월)&s1=09:00&s1name=음악방송%20리허설&s1loc=KBS&s1type=broadcast&s2=12:00&s2name=점심%20%2B%20이동&s2type=rest&s3=14:00&s3name=화보%20촬영&s3loc=W%20Magazine&s3type=photo&s4=18:00&s4name=보컬%20레슨&s4loc=Studio%20A&s4type=practice&s5=21:00&s5name=자유시간&s5type=rest&condition=4&reputation=72&note=내일%20팬사인회%20준비%20필요&u1=팬사인회&u1day=%2B1d&u1loc=강남)`,
  },
];
