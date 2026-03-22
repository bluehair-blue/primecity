import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import { characters } from "../data/characters";
import { cdnExprUrl, EXPRESSION_LABELS } from "../utils/cdn";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Footer from "../components/Footer";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function CharDetail() {
  const { name } = useParams();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [glitchDone, setGlitchDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [exprErrors, setExprErrors] = useState({});
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const timerRefs = useRef([]);
  const imgRef = useRef(null);

  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar = charIndex < characters.length - 1 ? characters[charIndex + 1] : null;
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  // Reset + animation sequence
  useEffect(() => {
    window.scrollTo(0, 0);
    setImgError(false);
    setUiReady(false);
    setPhase(0);
    setGlitchDone(false);
    setExprErrors({});
    setLightbox(null);
    setTilt({ x: 0, y: 0 });

    timerRefs.current.forEach(clearTimeout);
    const t1 = setTimeout(() => { setUiReady(true); setPhase(1); }, 100);
    const t2 = setTimeout(() => setGlitchDone(true), 600);
    const t3 = setTimeout(() => setPhase(2), 2200);
    timerRefs.current = [t1, t2, t3];

    return () => timerRefs.current.forEach(clearTimeout);
  }, [name]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lightbox ESC
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // Mouse tilt (desktop only, phase 2)
  function handleMouseMove(e) {
    if (isMobile || phase !== 2 || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientY - cy) / (rect.height / 2)) * -3;
    const y = ((e.clientX - cx) / (rect.width / 2)) * 3;
    setTilt({ x, y });
  }
  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const [exprRef, exprV] = useReveal(0.1);
  const [navRef, navV] = useReveal(0.1);

  if (!char) {
    return (
      <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-body)" }}>
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>캐릭터를 찾을 수 없습니다.</p>
        <Link to="/" style={{ color: C.gold, textDecoration: "none", fontSize: 13, letterSpacing: "0.1em" }}>&larr; 메인으로 돌아가기</Link>
      </div>
    );
  }

  const hasImage = char.image && !imgError;
  const t = (delay) => `all 1s ${EASE} ${delay}s`;

  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  // Image container styles
  const imgContainerStyle = isMobile
    ? {
        width: "100%",
        maxWidth: phase === 2 ? 280 : "70vw",
        aspectRatio: "2/3",
        margin: phase === 2 ? "0 auto 32px" : "0 auto",
        transition: `max-width 1.2s ${EASE}, margin 1.2s ${EASE}`,
      }
    : {
        width: phase === 2 ? 300 : "clamp(320px, 40vw, 500px)",
        aspectRatio: "2/3",
        flexShrink: 0,
        transition: `width 1.2s ${EASE}`,
      };

  return (
    <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Particles isMobile={isMobile} />
      <Navbar scrolled={scrolled} isMobile={isMobile} />

      {/* ══════════ Dynamic Cyberpunk Background ══════════ */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        {/* Vertical data grid */}
        <div style={{
          position: "absolute", inset: 0,
          background: `repeating-linear-gradient(90deg, transparent, transparent calc(10% - 1px), ${`color-mix(in oklch, ${char.color} 4%, transparent)`} 10%)`,
          maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        }} />

        {/* Marquee line 1 — agency + archive data */}
        <div style={{
          position: "absolute", top: isMobile ? "12%" : "18%", left: 0,
          display: "flex", width: "200%",
          animation: "bgMarquee 80s linear infinite",
          willChange: "transform",
        }}>
          {[1, 2].map((k) => (
            <div key={k} style={{
              flex: "0 0 50%",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? "clamp(80px, 20vw, 120px)" : "clamp(160px, 18vw, 280px)",
              fontWeight: 900, color: char.color, opacity: 0.03,
              whiteSpace: "nowrap", textTransform: "uppercase",
              letterSpacing: "0.05em", lineHeight: 0.8,
            }}>
              PRIME CITY ARCHIVE // {char.agency} // DATA ID: {char.cdnId} //&nbsp;
            </div>
          ))}
        </div>

        {/* Marquee line 2 — reverse direction, tagline */}
        <div style={{
          position: "absolute", top: isMobile ? "55%" : "60%", left: 0,
          display: "flex", width: "200%",
          animation: "bgMarqueeReverse 100s linear infinite",
          willChange: "transform",
        }}>
          {[1, 2].map((k) => (
            <div key={k} style={{
              flex: "0 0 50%",
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(60px, 16vw, 90px)" : "clamp(120px, 14vw, 200px)",
              fontWeight: 700, color: char.color, opacity: 0.02,
              whiteSpace: "nowrap", lineHeight: 0.9,
            }}>
              {char.tagline} — {char.name} — {char.role} —&nbsp;
            </div>
          ))}
        </div>

        {/* Ghost watermark (large faded character portrait) */}
        {hasImage && (
          <img
            src={char.image} alt=""
            style={{
              position: "absolute",
              right: isMobile ? "-40%" : "-10%",
              bottom: "-10%",
              height: "120vh",
              objectFit: "contain",
              opacity: 0.035,
              filter: "grayscale(100%) contrast(150%)",
              mixBlendMode: "screen",
              transform: phase === 2 ? "translateX(0)" : "translateX(5%)",
              transition: `transform 2s ${EASE}`,
            }}
          />
        )}
      </div>

      {/* ══════════ Unified Hero + Profile ══════════ */}
      <section
        style={{
          position: "relative", zIndex: 2, minHeight: "100vh",
          display: "flex", flexDirection: "column",
          justifyContent: phase === 2 ? "flex-start" : "center",
          alignItems: "center",
          padding: phase === 2
            ? (isMobile ? "100px 24px 48px" : "120px 64px 80px")
            : (isMobile ? "80px 24px" : "80px 64px"),
          transition: `padding 1.2s ${EASE}`,
        }}
      >
        {/* Ambient glow — FIXED position, animated via transform */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: isMobile ? "50%" : "20%",
            width: isMobile ? 300 : 500,
            height: isMobile ? 300 : 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${char.color}, transparent 70%)`,
            animation: "charGlowPulse 4s ease-in-out infinite",
            pointerEvents: "none",
            transform: phase === 2
              ? "translate(-50%, -50%)"
              : `translate(${isMobile ? "-50%" : "150%"}, 75%)`,
            transition: `transform 1.2s ${EASE}`,
            willChange: "transform",
          }}
        />

        {/* Scanline */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom, transparent 50%, ${char.color} 50%, transparent 51%)`,
            backgroundSize: "100% 4px", opacity: 0.02,
            pointerEvents: "none", animation: "charScanline 8s linear infinite",
          }}
        />

        {/* ── Phase 1 overlay: Name + tagline ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            zIndex: phase === 2 ? 0 : 5,
            opacity: phase === 1 ? 1 : 0,
            pointerEvents: phase === 2 ? "none" : "auto",
            transition: `opacity 0.8s ${EASE}`,
          }}
        >
          <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: char.color, opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)", transition: t(0.2), marginBottom: 12 }}>
            {char.agency}
          </span>
          <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(48px, 14vw, 64px)" : "clamp(64px, 8vw, 96px)", fontWeight: 700, color: C.white, margin: "0 0 12px", lineHeight: 1.1, textAlign: "center", opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(24px)", transition: t(0.4), textShadow: `0 0 80px ${`color-mix(in oklch, ${char.color} 40%, transparent)`}` }}>
            {char.name}
          </h1>
          <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 15 : 18, color: C.text70, fontStyle: "italic", margin: 0, lineHeight: 1.6, textAlign: "center", opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)", transition: t(0.6) }}>
            &ldquo;{char.tagline}&rdquo;
          </p>
        </div>

        {/* ── Back link (phase 2) ── */}
        <div style={{ width: "100%", maxWidth: 1100, opacity: phase === 2 ? 1 : 0, transition: `opacity 0.6s ${EASE} 0.3s`, marginBottom: isMobile ? 24 : 40 }}>
          <Link to="/" style={{ color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em", transition: "color 0.3s" }}>
            &larr; PRIME CITY
          </Link>
        </div>

        {/* ── Main content: Image + Profile panels ── */}
        <div
          style={{
            width: "100%", maxWidth: 1100,
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            gap: isMobile ? 0 : (phase === 2 ? 56 : 0),
            justifyContent: phase === 2 ? "flex-start" : "center",
            transition: `gap 1.2s ${EASE}`,
          }}
        >
          {/* Character image with hologram rings + tilt + glitch */}
          <div style={{ ...imgContainerStyle, position: "relative" }}>
            {/* Hologram ring 1 */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: "120%", height: "120%",
              border: `1px solid ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
              borderRadius: "50%",
              animation: "holoRingSpin 20s linear infinite",
              opacity: phase === 1 ? 0.6 : (phase === 2 ? 0.15 : 0),
              transition: `opacity 1s ${EASE}`,
              pointerEvents: "none",
              marginTop: "-60%", marginLeft: "-60%",
            }} />
            {/* Hologram ring 2 */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: "140%", height: "140%",
              border: `1px solid ${`color-mix(in oklch, ${char.color} 20%, transparent)`}`,
              borderRadius: "50%",
              animation: "holoRingSpinReverse 30s linear infinite",
              opacity: phase === 1 ? 0.4 : (phase === 2 ? 0.08 : 0),
              transition: `opacity 1s ${EASE}`,
              pointerEvents: "none",
              marginTop: "-70%", marginLeft: "-70%",
            }} />

            {/* Image container: Ghost Echo + SVG HUD Lock-on */}
            <div
              ref={imgRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%", height: "100%",
                background: phase === 2 ? C.bgCard : "transparent",
                border: `1px solid ${phase === 2 ? C.border06 : "transparent"}`,
                overflow: "hidden", position: "relative",
                opacity: uiReady ? 1 : 0,
                transform: `scale(${phase === 2 ? 1 : 1.05}) perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: `background 0.8s ${EASE}, border-color 0.8s ${EASE}, opacity 0.8s ${EASE} 0.1s, transform 0.6s ${EASE}`,
                willChange: "transform",
              }}
            >
              {hasImage ? (
                <>
                  {/* Ghost echo left (cyan silhouette) */}
                  <img
                    src={char.image} alt=""
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", pointerEvents: "none", mixBlendMode: "screen",
                      filter: `drop-shadow(0 0 12px oklch(0.7 0.15 200)) brightness(1.2)`,
                      opacity: phase === 2 ? 0 : 0.6,
                      transform: phase === 2 ? "scale(0.9) translateX(0)" : "scale(1) translateX(-12%)",
                      transition: `all 0.9s ${EASE}`,
                    }}
                  />
                  {/* Ghost echo right (character accent silhouette) */}
                  <img
                    src={char.image} alt=""
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", pointerEvents: "none", mixBlendMode: "screen",
                      filter: `drop-shadow(0 0 12px ${char.color}) brightness(1.2)`,
                      opacity: phase === 2 ? 0 : 0.6,
                      transform: phase === 2 ? "scale(0.9) translateX(0)" : "scale(1) translateX(12%)",
                      transition: `all 0.9s ${EASE}`,
                    }}
                  />
                  {/* Central hologram (Phase 1) */}
                  <img
                    src={char.image} alt={`${char.name} hologram`}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", pointerEvents: "none",
                      filter: `drop-shadow(0 0 20px ${`color-mix(in oklch, ${char.color} 50%, transparent)`})`,
                      opacity: phase === 2 ? 0 : 1,
                      transform: phase === 2 ? "scale(0.95)" : "scale(1)",
                      transition: `all 0.8s ${EASE}`,
                    }}
                  />
                  {/* Profile card (Phase 2): focus lock-on with blur clear */}
                  <img
                    src={char.image} alt={char.name}
                    onError={() => setImgError(true)}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover",
                      opacity: phase === 2 ? 1 : 0,
                      filter: phase === 2 ? "blur(0px) brightness(1)" : "blur(8px) brightness(1.5)",
                      transform: phase === 2 ? "scale(1)" : "scale(1.1)",
                      transition: `opacity 0.8s ${EASE} 0.1s, filter 0.8s ${EASE} 0.1s, transform 0.8s ${EASE} 0.1s`,
                      animation: !glitchDone && uiReady ? "charGlitch 0.5s ease-out forwards" : "none",
                    }}
                  />
                  {/* Vignette — Phase 2 only */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(ellipse at center, transparent 30%, ${C.bgDeep} 100%)`,
                    opacity: phase === 2 ? 0.5 : 0,
                    transition: `opacity 1s ${EASE}`,
                    pointerEvents: "none",
                  }} />
                  {/* SVG HUD overlay: scan line + crosshair + corner brackets */}
                  <svg
                    viewBox="0 0 100 100" preserveAspectRatio="none"
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      pointerEvents: "none", zIndex: 5,
                      opacity: phase === 2 ? 1 : 0,
                      transition: `opacity 0.4s ${EASE} 0.2s`,
                    }}
                  >
                    {/* Scan line sweep */}
                    <line x1="0" y1="0" x2="100" y2="0"
                      stroke={char.color} strokeWidth="0.8" opacity={phase === 2 ? 0 : 0.8}
                      style={{
                        transform: phase === 2 ? "translateY(100px)" : "translateY(0)",
                        transition: phase === 2 ? "transform 1.2s linear 0.2s, opacity 0.2s ease 1.2s" : "none",
                      }}
                    />
                    {/* Crosshair lines */}
                    <line x1="50" y1="0" x2="50" y2="100"
                      stroke={`color-mix(in oklch, ${C.white} 20%, transparent)`} strokeWidth="0.3" strokeDasharray="2 2"
                      style={{ transformOrigin: "center", transform: phase === 2 ? "scaleY(1)" : "scaleY(0)", transition: `transform 1s ${EASE} 0.4s` }}
                    />
                    <line x1="0" y1="50" x2="100" y2="50"
                      stroke={`color-mix(in oklch, ${C.white} 20%, transparent)`} strokeWidth="0.3" strokeDasharray="2 2"
                      style={{ transformOrigin: "center", transform: phase === 2 ? "scaleX(1)" : "scaleX(0)", transition: `transform 1s ${EASE} 0.4s` }}
                    />
                    {/* Corner brackets (stroke-dashoffset draw) */}
                    {[
                      "M 0 15 L 0 0 L 15 0",
                      "M 85 0 L 100 0 L 100 15",
                      "M 100 85 L 100 100 L 85 100",
                      "M 15 100 L 0 100 L 0 85",
                    ].map((d, i) => (
                      <path key={i} d={d} fill="none" stroke={char.color} strokeWidth="0.8"
                        strokeDasharray="30" strokeDashoffset={phase === 2 ? 0 : 30}
                        style={{ transition: `stroke-dashoffset 0.8s ${EASE} 0.5s` }}
                      />
                    ))}
                  </svg>
                </>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: `radial-gradient(ellipse at 50% 30%, ${char.color}, ${C.bgDeep})` }}>
                  <span style={{ fontFamily: "var(--f-display-kr)", fontSize: phase === 2 ? 48 : (isMobile ? 80 : 120), fontWeight: 700, color: `color-mix(in oklch, ${char.color} 25%, transparent)`, transition: `font-size 1.2s ${EASE}`, lineHeight: 1 }}>
                    {char.name}
                  </span>
                  <span style={{ color: C.text15, fontSize: 10, letterSpacing: "0.1em", opacity: phase === 2 ? 1 : 0, transition: `opacity 0.6s ${EASE}` }}>
                    IMAGE COMING SOON
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile panels — slide in */}
          <div
            style={{
              flex: 1, minWidth: 0,
              opacity: phase === 2 ? 1 : 0,
              transform: phase === 2 ? "translateX(0)" : (isMobile ? "translateY(30px)" : "translateX(60px)"),
              transition: `all 1s ${EASE} 0.3s`,
              pointerEvents: phase === 2 ? "auto" : "none",
            }}
          >
            {/* Signature tagline */}
            <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 16 : 17, color: char.color, fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.7, wordBreak: "keep-all" }}>
              &ldquo;{char.tagline}&rdquo;
            </p>

            {/* Role + Age */}
            <p style={{ fontSize: 13, color: C.text45, fontFamily: "var(--f-body)", margin: "0 0 20px" }}>
              {char.role}{char.age && ` · ${char.age}`}
            </p>

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${char.color}, transparent)`, marginBottom: 20 }} />

            {/* Brief */}
            {char.brief && (
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 14, lineHeight: 1.9, color: C.text55, fontWeight: 300, wordBreak: "keep-all", margin: "0 0 28px" }}>
                {char.brief}
              </p>
            )}

            {/* Profile fields with animated border-left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {profileFields.map((field, i) => (
                <div
                  key={field.en}
                  style={{
                    position: "relative",
                    paddingLeft: 18,
                    opacity: phase === 2 ? 1 : 0,
                    transform: phase === 2 ? "translateX(0)" : "translateX(30px)",
                    transition: `all 0.8s ${EASE} ${0.5 + i * 0.12}s`,
                  }}
                >
                  {/* Animated border-left line (scaleY 0→1) */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 2,
                    background: char.color,
                    transformOrigin: "top",
                    transform: phase === 2 ? "scaleY(1)" : "scaleY(0)",
                    transition: `transform 0.6s ${EASE} ${0.5 + i * 0.12}s`,
                  }} />
                  {/* Content — fades in after border draws */}
                  <div style={{
                    padding: "14px 16px",
                    background: C.bgCard,
                    opacity: phase === 2 ? 1 : 0,
                    transition: `opacity 0.5s ${EASE} ${0.65 + i * 0.12}s`,
                  }}>
                    <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", color: char.color, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      {field.en}
                    </span>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.7, color: C.text45, margin: 0, wordBreak: "keep-all" }}>
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Traits */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 0", borderTop: `1px solid ${C.border06}` }}>
              {char.signature && (
                <p style={{ fontSize: 12, color: C.text35, fontFamily: "var(--f-body)", margin: 0 }}>
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span> 시그니처: {char.signature}
                </p>
              )}
              {char.personality && (
                <p style={{ fontSize: 12, color: C.text35, fontFamily: "var(--f-body)", margin: 0 }}>
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span> 성격: {char.personality}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator (phase 1) */}
        <div style={{ position: "absolute", bottom: isMobile ? 24 : 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: phase === 1 ? 1 : 0, transition: `opacity 0.6s ${EASE}`, pointerEvents: "none" }}>
          <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.3em", color: C.text25, textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${char.color}, transparent)`, animation: "scrollPulse 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ══════════ Expression Gallery ══════════ */}
      {char.expressions && char.expressions.length > 0 && (
        <section ref={exprRef} style={{ position: "relative", zIndex: 2, padding: isMobile ? "48px 24px" : "64px 64px", maxWidth: 1100, margin: "0 auto", opacity: exprV ? 1 : 0, transform: exprV ? "translateY(0)" : "translateY(30px)", transition: `all 0.8s ${EASE}` }}>
          <h3 style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, marginBottom: isMobile ? 20 : 28 }}>Expressions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 8 : 14 }}>
            {char.expressions.map((key) => {
              const exprSrc = cdnExprUrl(char.cdnId, key);
              const hasError = exprErrors[key];
              return (
                <div key={key} onClick={() => !hasError && setLightbox({ key, src: exprSrc })} style={{ aspectRatio: "1/1", background: C.bgCard, border: `1px solid ${C.border06}`, overflow: "hidden", position: "relative", cursor: hasError ? "default" : "pointer", transition: `border-color 0.3s ${EASE}` }}
                  onMouseEnter={(e) => { if (!hasError) e.currentTarget.style.borderColor = char.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; }}
                >
                  {!hasError ? (
                    <img src={exprSrc} alt={EXPRESSION_LABELS[key]} onError={() => setExprErrors((prev) => ({ ...prev, [key]: true }))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: `radial-gradient(circle, ${`color-mix(in oklch, ${char.color} 8%, transparent)`}, transparent)` }}>
                      <span style={{ fontSize: isMobile ? 11 : 13, color: C.text25, fontFamily: "var(--f-body)" }}>{EXPRESSION_LABELS[key]}</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "4px 6px" : "6px 10px", background: `linear-gradient(to top, ${C.bgDeep}, transparent)` }}>
                    <span style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 9 : 10, color: C.text45, letterSpacing: "0.05em" }}>{EXPRESSION_LABELS[key]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════ Navigation ══════════ */}
      <section ref={navRef} style={{ position: "relative", zIndex: 2, padding: isMobile ? "32px 24px 48px" : "48px 64px 80px", maxWidth: 1100, margin: "0 auto", opacity: navV ? 1 : 0, transform: navV ? "translateY(0)" : "translateY(20px)", transition: `all 0.8s ${EASE}` }}>
        {sameAgency.length > 0 && (
          <div style={{ marginBottom: isMobile ? 32 : 48 }}>
            <h3 style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, marginBottom: isMobile ? 16 : 20 }}>Same Agency</h3>
            <div style={{ display: "flex", gap: isMobile ? 10 : 16, flexWrap: "wrap" }}>
              {sameAgency.map((c) => (
                <Link key={c.id} to={`/characters/${c.id}`} style={{ textDecoration: "none", padding: isMobile ? "10px 16px" : "12px 20px", background: C.bgCard, border: `1px solid ${C.border06}`, display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 0 16px ${`color-mix(in oklch, ${c.color} 20%, transparent)`}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ color: c.color, fontSize: 8 }}>●</span>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text55 }}>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: `1px solid ${C.border06}` }}>
          {prevChar ? (
            <Link to={`/characters/${prevChar.id}`} style={{ textDecoration: "none", color: C.text35, fontSize: 12, fontFamily: "var(--f-body)", transition: "color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}>
              &larr; {prevChar.name}
            </Link>
          ) : <span />}
          {nextChar ? (
            <Link to={`/characters/${nextChar.id}`} style={{ textDecoration: "none", color: C.text35, fontSize: 12, fontFamily: "var(--f-body)", transition: "color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}>
              {nextChar.name} &rarr;
            </Link>
          ) : <span />}
        </div>
      </section>

      {/* ══════════ Lightbox ══════════ */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: C.bgOverlay, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: isMobile ? "90vw" : "60vw", maxHeight: "80vh", position: "relative" }}>
            <img src={lightbox.src} alt={EXPRESSION_LABELS[lightbox.key]} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", border: `1px solid ${C.border10}` }} />
            <p style={{ textAlign: "center", fontFamily: "var(--f-body)", fontSize: 13, color: C.text55, marginTop: 12 }}>{char.name} — {EXPRESSION_LABELS[lightbox.key]}</p>
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -12, right: -12, width: 32, height: 32, background: C.bgDeep, border: `1px solid ${C.border10}`, borderRadius: "50%", color: C.text55, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
      )}

      <Footer isMobile={isMobile} />
    </div>
  );
}
