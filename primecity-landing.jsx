import { useState, useEffect, useRef } from "react";

// ─── OKLCH Color Tokens ─────────────────────────────────────────
// 모든 색상을 oklch() 기반으로 정의
const C = {
  // Backgrounds
  bgDeep:    "oklch(0.08 0.01 280)",         // 최심부 배경
  bgCard:    "oklch(0.12 0.005 280 / 0.4)",  // 카드 배경
  bgOverlay: "oklch(0.06 0.01 280 / 0.92)",  // 오버레이

  // Gold / Amber (primary accent)
  gold:      "oklch(0.76 0.12 80)",           // 메인 골드
  goldMuted: "oklch(0.76 0.12 80 / 0.4)",    // 반투명 골드
  goldDim:   "oklch(0.76 0.12 80 / 0.15)",   // 아주 연한 골드
  goldGlow:  "oklch(0.76 0.12 80 / 0.2)",    // 글로우용
  goldText:  "oklch(0.76 0.12 80 / 0.35)",   // 골드 텍스트 연하게

  // White / Text
  white:     "oklch(1.0 0 0)",
  text90:    "oklch(1.0 0 0 / 0.9)",
  text70:    "oklch(1.0 0 0 / 0.7)",
  text55:    "oklch(1.0 0 0 / 0.55)",
  text45:    "oklch(1.0 0 0 / 0.45)",
  text35:    "oklch(1.0 0 0 / 0.35)",
  text25:    "oklch(1.0 0 0 / 0.25)",
  text15:    "oklch(1.0 0 0 / 0.15)",

  // Border
  border10:  "oklch(0.76 0.12 80 / 0.10)",
  border06:  "oklch(0.76 0.12 80 / 0.06)",
  border05:  "oklch(0.76 0.12 80 / 0.05)",

  // Character accent colors
  charApex:  "oklch(0.76 0.12 80)",           // 서윤, APEX gold
  charNaha:  "oklch(0.72 0.10 310)",          // 나하린, purple
  charJin:   "oklch(0.55 0.01 0)",            // 진시혁, grey
  charEri:   "oklch(0.72 0.10 170)",          // 에리카, teal
  charSeo:   "oklch(0.70 0.10 240)",          // 이서하, blue
  charHan:   "oklch(0.72 0.12 55)",           // 한소리, warm orange

  // District accent colors
  distCore:  "oklch(0.76 0.12 80)",           // 더 코어 gold
  distMid:   "oklch(0.65 0.10 240)",          // 미들 링 blue
  distHype:  "oklch(0.65 0.12 340)",          // 하입 로드 pink
  distTer:   "oklch(0.65 0.10 140)",          // 테라스 green

  // Black for text on gold
  black:     "oklch(0.08 0.01 280)",
};

// ─── Hooks ──────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < bp);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [bp]);
  return m;
}

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
}

// ─── Particle Background ────────────────────────────────────────
function Particles({ isMobile }) {
  const ref = useRef(null);
  const anim = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = (c.width = window.innerWidth);
    let h = (c.height = document.documentElement.scrollHeight || window.innerHeight * 5);
    const N = isMobile ? 35 : 80;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.1 - 0.06,
      o: Math.random() * 0.45 + 0.08,
      p: Math.random() * Math.PI * 2,
    }));
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.dx; p.y += p.dy; p.p += 0.005;
        const a = p.o * (0.5 + Math.sin(p.p) * 0.5);
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,85,${a})`;
        ctx.fill();
      }
      anim.current = requestAnimationFrame(draw);
    }
    draw();
    const onR = () => { w = c.width = window.innerWidth; h = c.height = document.documentElement.scrollHeight || window.innerHeight * 5; };
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(anim.current); window.removeEventListener("resize", onR); };
  }, [isMobile]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.5 }} />;
}

// ─── Navbar ─────────────────────────────────────────────────────
function Navbar({ scrolled, isMobile }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  const links = [
    { label: "소개", href: "#intro" },
    { label: "캐릭터", href: "#characters" },
    { label: "세계관", href: "#world" },
  ];
  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: isMobile ? "0 20px" : "0 48px",
        height: isMobile ? 56 : 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled || open ? C.bgOverlay : "transparent",
        backdropFilter: scrolled || open ? "blur(20px)" : "none",
        borderBottom: scrolled || open ? `1px solid ${C.border10}` : "1px solid transparent",
        transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
        fontFamily: "var(--f-body)",
      }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: isMobile ? 24 : 28, height: isMobile ? 24 : 28,
            background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.55 0.12 80) 100%)`,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }} />
          <span style={{
            fontSize: isMobile ? 13 : 15, fontWeight: 600,
            letterSpacing: "0.1em", color: C.gold, textTransform: "uppercase",
            fontFamily: "var(--f-display-en)",
          }}>Prime City</span>
        </a>
        {!isMobile && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {links.map(l => (
              <a key={l.href} href={l.href} style={{
                color: C.text45, fontSize: 13, letterSpacing: "0.08em",
                textDecoration: "none", transition: "color 0.3s",
              }}
                onMouseEnter={e => e.target.style.color = C.gold}
                onMouseLeave={e => e.target.style.color = C.text45}
              >{l.label}</a>
            ))}
            <button style={{
              padding: "7px 22px", background: "transparent",
              border: `1px solid ${C.goldMuted}`, color: C.gold,
              fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "var(--f-body)", fontWeight: 500,
              transition: "all 0.3s",
            }}
              onMouseEnter={e => { e.target.style.background = C.goldDim; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; }}
            >플레이</button>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setOpen(!open)} aria-label="메뉴" style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 8, display: "flex", flexDirection: "column", gap: 5, zIndex: 110,
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 20, height: 1.5, background: C.gold,
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                transform: open
                  ? i === 0 ? "rotate(45deg) translate(4.5px,4.5px)"
                    : i === 2 ? "rotate(-45deg) translate(4.5px,-4.5px)" : "none"
                  : "none",
                opacity: open && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        )}
      </nav>
      {isMobile && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "oklch(0.06 0.01 280 / 0.97)", backdropFilter: "blur(30px)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 28,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              color: C.text70, fontSize: 17, letterSpacing: "0.2em",
              textDecoration: "none", fontFamily: "var(--f-body)",
              opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.07}s`,
            }}>{l.label}</a>
          ))}
          <div style={{ width: 36, height: 1, background: C.goldText }} />
          <button onClick={() => setOpen(false)} style={{
            padding: "11px 32px",
            background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.65 0.12 75) 100%)`,
            border: "none", color: C.black, fontSize: 13, fontWeight: 600,
            letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "var(--f-body)",
            opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s cubic-bezier(0.22,1,0.36,1) 0.35s",
          }}>플레이</button>
        </div>
      )}
    </>
  );
}

// ─── Hero Section (with background image) ───────────────────────
function Hero({ isMobile }) {
  const [uiReady, setUiReady] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { const t = setTimeout(() => setUiReady(true), 300); return () => clearTimeout(t); }, []);
  const t = (delay) => `all 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`;

  const BG_URL = "https://img.bluehair.blue/ent/bg1.png";

  return (
    <section style={{
      position: "relative", height: "100vh", minHeight: isMobile ? 560 : 680,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center",
      padding: isMobile ? "0 24px" : "0 48px", overflow: "hidden",
    }}>
      {/* ── Background Image ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
      }}>
        {/* Method 1: CSS background-image (더 나은 샌드박스 호환성) */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: !imgError ? `url(${BG_URL})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: imgLoaded ? 0.35 : 0,
          transition: "opacity 2s cubic-bezier(0.22,1,0.36,1) 0.2s",
          filter: "brightness(0.6) saturate(0.8)",
        }} />

        {/* Hidden img to detect load/error */}
        <img
          src={BG_URL}
          alt=""
          crossOrigin="anonymous"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          style={{ display: "none" }}
        />

        {/* Fallback gradient (이미지 로드 실패 시 또는 로딩 중) */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(
            ellipse at 50% 40%,
            oklch(0.18 0.04 80 / 0.6) 0%,
            oklch(0.12 0.02 260 / 0.4) 40%,
            ${C.bgDeep} 80%
          )`,
          opacity: imgError || !imgLoaded ? 1 : 0,
          transition: "opacity 2s ease",
          pointerEvents: "none",
        }} />

        {/* Gradient overlay — bottom fade to bg */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(
            180deg,
            oklch(0.08 0.01 280 / 0.3) 0%,
            oklch(0.08 0.01 280 / 0.15) 30%,
            oklch(0.08 0.01 280 / 0.5) 70%,
            ${C.bgDeep} 100%
          )`,
        }} />
        {/* Vignette overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, oklch(0.08 0.01 280 / 0.7) 100%)",
        }} />
      </div>

      {/* ── Orbit ring ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: isMobile ? 220 : 420, height: isMobile ? 220 : 420,
        borderRadius: "50%", border: `1px solid ${C.border05}`,
        animation: "spin 80s linear infinite", pointerEvents: "none",
        transform: "translate(-50%,-50%)",
      }}>
        <div style={{
          position: "absolute", top: -3, left: "50%",
          width: 5, height: 5, borderRadius: "50%", background: C.gold,
          boxShadow: `0 0 10px ${C.goldGlow}`,
        }} />
      </div>

      {/* ── Sub label ── */}
      <p style={{
        fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 11,
        letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold,
        marginBottom: isMobile ? 14 : 20,
        opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)",
        transition: t(0.4), position: "relative", zIndex: 2,
      }}>Entertainment Simulation</p>

      {/* ── Title ── */}
      <h1 style={{
        fontFamily: "var(--f-display-kr)",
        fontSize: isMobile ? "clamp(38px,12vw,54px)" : "clamp(52px,7vw,92px)",
        fontWeight: 700, lineHeight: 1.1, color: C.white, margin: 0,
        opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(30px)",
        transition: t(0.6), position: "relative", zIndex: 2,
        textShadow: `0 0 60px ${C.goldGlow}`,
      }}>
        프라임시티
        <span style={{
          display: "block", fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? "clamp(11px,3.5vw,15px)" : "clamp(14px,1.8vw,20px)",
          fontWeight: 300, letterSpacing: isMobile ? "0.35em" : "0.6em",
          color: C.text25, marginTop: isMobile ? 8 : 14,
          textTransform: "uppercase", textShadow: "none",
        }}>Prime City</span>
      </h1>

      {/* ── Divider ── */}
      <div style={{
        width: uiReady ? (isMobile ? 48 : 72) : 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        margin: isMobile ? "24px 0" : "36px 0",
        transition: "width 1.4s cubic-bezier(0.22,1,0.36,1) 0.9s",
        position: "relative", zIndex: 2,
      }} />

      {/* ── Catchphrase ── */}
      <p style={{
        fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 14 : 17,
        lineHeight: 1.9, color: C.text55, maxWidth: isMobile ? 300 : 520,
        margin: 0, fontWeight: 400, wordBreak: "keep-all",
        opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)",
        transition: t(1.1), position: "relative", zIndex: 2,
      }}>
        전 세계가 주목하는 단 하나의 무대.
        <br />
        <span style={{ color: C.gold, fontWeight: 500 }}>증명하라.</span>
        {" "}세계가 당신을 알게 된다.
      </p>

      {/* ── CTA ── */}
      <div style={{
        marginTop: isMobile ? 28 : 44, display: "flex",
        flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 14,
        alignItems: "center", width: isMobile ? "100%" : "auto",
        maxWidth: isMobile ? 260 : "none",
        opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)",
        transition: t(1.3), position: "relative", zIndex: 2,
      }}>
        <button style={{
          padding: isMobile ? "13px 0" : "13px 38px",
          width: isMobile ? "100%" : "auto",
          background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.65 0.12 75) 100%)`,
          border: "none", color: C.black, fontSize: 12, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "var(--f-body)",
          boxShadow: `0 0 28px ${C.goldGlow}`,
          transition: "all 0.4s",
        }}>플레이 시작</button>
        <button style={{
          padding: isMobile ? "13px 0" : "13px 38px",
          width: isMobile ? "100%" : "auto",
          background: "transparent",
          border: `1px solid ${C.text15}`,
          color: C.text45, fontSize: 12, fontWeight: 500,
          letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "var(--f-body)", transition: "all 0.4s",
        }}>세계관 보기</button>
      </div>

      {/* ── Scroll indicator ── */}
      <div style={{
        position: "absolute", bottom: isMobile ? 20 : 36, left: "50%",
        transform: "translateX(-50%)", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6,
        opacity: uiReady ? 0.3 : 0, transition: "opacity 1.5s ease 2.4s",
      }}>
        <span style={{
          fontFamily: "var(--f-body)", fontSize: 8, letterSpacing: "0.3em",
          textTransform: "uppercase", color: C.gold,
        }}>Scroll</span>
        <div style={{
          width: 1, height: isMobile ? 24 : 36,
          background: `linear-gradient(180deg, ${C.gold}, transparent)`,
          animation: "scrollPulse 2s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}

// ─── Intro Section ──────────────────────────────────────────────
function IntroSection({ isMobile }) {
  const [ref, v] = useReveal(0.15);
  return (
    <section id="intro" ref={ref} style={{
      position: "relative", zIndex: 2,
      padding: isMobile ? "72px 24px" : "120px 48px",
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center",
    }}>
      <span style={{
        fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
        letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold,
        marginBottom: isMobile ? 12 : 18,
        opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}>About</span>

      <h2 style={{
        fontFamily: "var(--f-display-kr)",
        fontSize: isMobile ? "clamp(20px,5.5vw,28px)" : "clamp(26px,3vw,40px)",
        fontWeight: 600, color: C.white, margin: 0, lineHeight: 1.4,
        opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
        wordBreak: "keep-all",
      }}>재능과 야망이 교차하는<br />초거대 엔터테인먼트 특별자치구</h2>

      <div style={{
        width: v ? 56 : 0, height: 1, margin: isMobile ? "20px 0" : "28px 0",
        background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
      }} />

      <p style={{
        fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 15,
        lineHeight: 1.9, color: C.text45, maxWidth: isMobile ? 340 : 560,
        fontWeight: 300, wordBreak: "keep-all",
        opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s",
      }}>
        자동화가 모든 것을 대체한 근미래.
        사람이 자신의 가치를 증명할 수 있는 무대는 단 하나 — 엔터테인먼트.
        <br /><br />
        프라임시티는 그 정점에 있다.
        이곳에 입성한다는 것 자체가, 업계에서 인정받았다는 의미.
      </p>
    </section>
  );
}

// ─── Character Silhouette SVG ───────────────────────────────────
function CharSilhouette({ color }) {
  return (
    <svg viewBox="0 0 120 160" fill="none" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="60" cy="42" rx="18" ry="20" fill={`${color}`} fillOpacity="0.06" stroke={color} strokeOpacity="0.15" strokeWidth="1" />
      <path d="M38 70 Q40 58 60 56 Q80 58 82 70 L88 130 Q88 145 60 148 Q32 145 32 130 Z"
        fill={color} fillOpacity="0.03" stroke={color} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="60" y1="82" x2="60" y2="118" stroke={color} strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="60" cy="42" r="2" fill={color} opacity="0.35">
        <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── Character Card ─────────────────────────────────────────────
function CharCard({ name, agency, role, tagline, color, index, visible, isMobile }) {
  return (
    <div style={{
      position: "relative", textAlign: "center",
      padding: isMobile ? "20px 14px 18px" : "28px 20px 24px",
      background: C.bgCard,
      border: `1px solid ${C.border05}`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(36px)",
      transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s`,
      overflow: "hidden",
    }}>
      <div style={{
        width: isMobile ? 76 : 96, height: isMobile ? 102 : 128,
        margin: "0 auto 14px",
      }}>
        <CharSilhouette color={color} />
      </div>
      <h4 style={{
        fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 16 : 18,
        fontWeight: 600, color: C.white, margin: "0 0 4px",
      }}>{name}</h4>
      <p style={{
        fontFamily: "var(--f-body)", fontSize: 10,
        letterSpacing: "0.06em", color: C.text35, margin: "0 0 8px",
      }}>
        <span style={{ color, opacity: 0.7 }}>●</span>{" "}
        {agency} · {role}
      </p>
      <p style={{
        fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 11 : 12,
        color: C.text25, fontStyle: "italic",
        margin: 0, lineHeight: 1.6, wordBreak: "keep-all",
      }}>"{tagline}"</p>
    </div>
  );
}

// ─── Characters Section ─────────────────────────────────────────
function CharactersSection({ isMobile }) {
  const [tRef, tV] = useReveal(0.12);
  const [gRef, gV] = useReveal(0.05);

  const chars = [
    { name: "서윤", agency: "APEX", role: "톱 아이돌", tagline: "영점, 그리고 정점.", color: C.charApex },
    { name: "나하린", agency: "APEX", role: "치프 프로듀서", tagline: "안녕~. 네 이름 많이 들었어.", color: C.charNaha },
    { name: "진시혁", agency: "APEX", role: "프로듀서", tagline: "탈락, 다음.", color: C.charJin },
    { name: "에리카", agency: "Blue Moon", role: "프로듀서", tagline: "만만하게 보면 큰코다친다?", color: C.charEri },
    { name: "이서하", agency: "Blue Moon", role: "싱어송라이터", tagline: "하아… 귀찮으니 빨리 끝내.", color: C.charSeo },
    { name: "한소리", agency: "PRISM", role: "기획사 대표", tagline: "이게 마지막 기회야.", color: C.charHan },
  ];

  return (
    <section id="characters" style={{
      position: "relative", padding: isMobile ? "64px 20px 56px" : "100px 48px 100px",
      zIndex: 2,
    }}>
      <div ref={tRef} style={{
        textAlign: "center", marginBottom: isMobile ? 30 : 52,
        opacity: tV ? 1 : 0, transform: tV ? "translateY(0)" : "translateY(24px)",
        transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <span style={{
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.4em", textTransform: "uppercase",
          color: C.gold, display: "block", marginBottom: isMobile ? 10 : 16,
        }}>Characters</span>
        <h2 style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? "clamp(22px,6vw,30px)" : "clamp(28px,3.5vw,44px)",
          fontWeight: 600, color: C.white, margin: 0,
        }}>이 무대의 주인공들</h2>
        <div style={{
          width: tV ? 56 : 0, height: 1, margin: isMobile ? "14px auto 0" : "24px auto 0",
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
        }} />
      </div>
      <div ref={gRef} style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        gap: isMobile ? 10 : 18,
        maxWidth: 900, margin: "0 auto",
      }}>
        {chars.map((c, i) => (
          <CharCard key={i} {...c} index={i} visible={gV} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}

// ─── District Card ──────────────────────────────────────────────
function DistrictCard({ name, en, tier, agency, desc, accent, index, visible, isMobile }) {
  return (
    <div style={{
      position: "relative", padding: isMobile ? "24px 20px" : "36px 32px",
      background: C.bgCard,
      border: `1px solid ${C.border06}`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(36px)",
      transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s`,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent 70%)`, opacity: 0.5,
      }} />
      <div style={{
        display: "inline-block", padding: "3px 10px", marginBottom: isMobile ? 12 : 16,
        background: C.goldDim, border: `1px solid ${C.border10}`,
        fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
        color: C.gold, fontFamily: "var(--f-body)",
      }}>{tier}</div>
      <h3 style={{
        fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 20 : 24,
        fontWeight: 600, color: C.white, margin: "0 0 4px",
      }}>{name}</h3>
      <span style={{
        fontFamily: "var(--f-display-en)", fontSize: 11,
        letterSpacing: "0.12em", color: C.goldText,
        textTransform: "uppercase", fontWeight: 300,
      }}>{en}</span>
      <p style={{
        fontFamily: "var(--f-body)", fontSize: isMobile ? 11 : 12,
        color: C.text45, margin: "14px 0 10px",
        fontWeight: 500, letterSpacing: "0.03em",
      }}>
        <span style={{ color: accent, opacity: 0.7 }}>◆</span> {agency}
      </p>
      <p style={{
        fontFamily: "var(--f-body)", fontSize: isMobile ? 12 : 13,
        lineHeight: 1.8, color: C.text35, margin: 0,
        fontWeight: 300, wordBreak: "keep-all",
      }}>{desc}</p>
    </div>
  );
}

// ─── World Section ──────────────────────────────────────────────
function WorldSection({ isMobile }) {
  const [tRef, tV] = useReveal(0.12);
  const [gRef, gV] = useReveal(0.05);
  const districts = [
    { name: "더 코어", en: "The Core", tier: "정상 · 지배층", agency: "APEX Entertainment — 업계 1위", desc: "프라임 돔과 방송국 본사가 자리한 정점. 화려하지만 숨 막히는 긴장감이 감도는 곳.", accent: C.distCore },
    { name: "미들 링", en: "Middle Ring", tier: "검증된 실력자", agency: "Blue Moon Entertainment — 업계 2위", desc: "스튜디오가 밀집한 실력의 구역. 실력으로 말하는 사람들이 모이는 곳.", accent: C.distMid },
    { name: "하입 로드", en: "Hype Road", tier: "트렌드 최전선", agency: "PRISM Studio — 개성으로 승부", desc: "유행이 태어나고 죽는 곳. 라이브 클럽과 공유 스튜디오가 에너지를 뿜는 거리.", accent: C.distHype },
    { name: "테라스", en: "Terrace", tier: "시작과 안주의 경계", agency: "Route 0 — 무한 가능성, 무한 불확실", desc: "처음 오는 사람에게는 희망. 밀려온 사람에게는 어중간한 안락함의 유혹.", accent: C.distTer },
  ];

  return (
    <section id="world" style={{
      position: "relative", padding: isMobile ? "64px 20px 56px" : "100px 48px 100px",
      zIndex: 2,
    }}>
      <div ref={tRef} style={{
        textAlign: "center", marginBottom: isMobile ? 36 : 60,
        opacity: tV ? 1 : 0, transform: tV ? "translateY(0)" : "translateY(24px)",
        transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <span style={{
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.4em", textTransform: "uppercase",
          color: C.gold, display: "block", marginBottom: isMobile ? 10 : 16,
        }}>World Building</span>
        <h2 style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? "clamp(22px,6vw,30px)" : "clamp(28px,3.5vw,44px)",
          fontWeight: 600, color: C.white, margin: 0,
        }}>프라임시티의 구역들</h2>
        <p style={{
          fontFamily: "var(--f-body)", fontSize: isMobile ? 12 : 14,
          color: C.text35, marginTop: isMobile ? 10 : 16,
          maxWidth: 460, marginLeft: "auto", marginRight: "auto",
          lineHeight: 1.7, fontWeight: 300, wordBreak: "keep-all",
        }}>중심부일수록 자원과 기회가 집중되는 동심원 구조.</p>
        <div style={{
          width: tV ? 56 : 0, height: 1, margin: isMobile ? "16px auto 0" : "24px auto 0",
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
        }} />
      </div>
      <div ref={gRef} style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
        gap: isMobile ? 12 : 18,
        maxWidth: 960, margin: "0 auto",
      }}>
        {districts.map((d, i) => (
          <DistrictCard key={i} {...d} index={i} visible={gV} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────
function Footer({ isMobile }) {
  return (
    <footer style={{
      position: "relative", zIndex: 2,
      padding: isMobile ? "28px 20px 22px" : "48px 48px 36px",
      borderTop: `1px solid ${C.border06}`,
      display: "flex", flexDirection: isMobile ? "column" : "row",
      justifyContent: isMobile ? "center" : "space-between",
      alignItems: "center", gap: isMobile ? 10 : 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 16, height: 16,
          background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.55 0.12 80) 100%)`,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }} />
        <span style={{
          fontFamily: "var(--f-display-en)", fontSize: 11,
          color: C.text25, letterSpacing: "0.08em",
        }}>PRIME CITY</span>
      </div>
      <p style={{
        fontFamily: "var(--f-body)", fontSize: 10,
        color: C.text15, margin: 0,
      }}>© 2026 bluehair.blue — All rights reserved.</p>
    </footer>
  );
}

// ─── App ────────────────────────────────────────────────────────
export default function PrimeCityLanding() {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{
      background: C.bgDeep, color: C.white, minHeight: "100vh",
      position: "relative", overflowX: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600&family=Crimson+Pro:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --f-display-kr: 'Noto Serif KR', serif;
          --f-display-en: 'Crimson Pro', serif;
          --f-body: 'Noto Sans KR', sans-serif;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; background: oklch(0.08 0.01 280); }

        @keyframes spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50%      { opacity: 0.7; transform: scaleY(1.2); }
        }

        ::selection { background: oklch(0.76 0.12 80 / 0.2); color: oklch(1.0 0 0); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: oklch(0.08 0.01 280); }
        ::-webkit-scrollbar-thumb { background: oklch(0.76 0.12 80 / 0.2); border-radius: 2px; }

        @media (hover: none) { button:active { opacity: 0.85; } }
      `}</style>

      <Particles isMobile={isMobile} />
      <Navbar scrolled={scrolled} isMobile={isMobile} />
      <Hero isMobile={isMobile} />
      <IntroSection isMobile={isMobile} />
      <CharactersSection isMobile={isMobile} />
      <WorldSection isMobile={isMobile} />
      <Footer isMobile={isMobile} />
    </div>
  );
}
