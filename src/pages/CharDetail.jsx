import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import useCharLightbox from "../hooks/useCharLightbox";
import { characters } from "../data/characters";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import CharLightbox from "../components/CharLightbox";
import CharExpressionsGrid from "../components/CharExpressionsGrid";
import CharNavigation from "../components/CharNavigation";
import JgrCharDetail from "../components/JgrCharDetail";
import CinematicCharDetail from "../components/CinematicCharDetail";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function CharDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [glitchDone, setGlitchDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { lightbox, setLightbox, close: closeLightbox } = useCharLightbox();
  const [exprErrors, setExprErrors] = useState({});
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [contentReached, setContentReached] = useState(false);
  const timerRefs = useRef([]);
  const imgRef = useRef(null);
  const contentRef = useRef(null);

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
    setImgError(false); setUiReady(false); setPhase(0);
    setGlitchDone(false); setExprErrors({}); setLightbox(null);
    setTilt({ x: 0, y: 0 }); setContentReached(false);
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

  // Content section observer (seam cue dismissal)
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setContentReached(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [name]);

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

  const showPhase2Cue = phase === 2 && !contentReached;
  const cueCopy = char
    ? (char.expressions?.length ? "Expressions Below" : "Continue Below")
    : "";

  if (!char) {
    return (
      <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-body)" }}>
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>캐릭터를 찾을 수 없습니다.</p>
        <Link to="/" style={{ color: C.gold, textDecoration: "none", fontSize: 13, letterSpacing: "0.1em" }}>&larr; 메인으로 돌아가기</Link>
      </div>
    );
  }

  // JGR → 완전 분리 렌더 블록 (legacy intro1/intro2)
  if (char.id === "janggru") {
    return <JgrCharDetail char={char} isMobile={isMobile} prevChar={prevChar} nextChar={nextChar} sameAgency={sameAgency} />;
  }

  // Cinematic intro (characters with introStyle) → 공통 시네마틱 컴포넌트
  if (char.introStyle) {
    return <CinematicCharDetail char={char} isMobile={isMobile} prevChar={prevChar} nextChar={nextChar} sameAgency={sameAgency} />;
  }

  const hasImage = char.image && !imgError;
  const profileSrc = char.profile || char.image; // Phase 2 uses profile if available
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
      <Seo title={char.name} description={`${char.name} — ${char.role}. 프라임시티 캐릭터 상세 프로필.`} path={`/characters/${name}`} />
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

        {/* Floating name — right-aligned, slow drift */}
        <div style={{
          position: "absolute", top: isMobile ? "22%" : "30%", left: 0, right: 0,
          overflow: "hidden", pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(80px, 22vw, 120px)" : "clamp(160px, 18vw, 280px)",
            fontWeight: 900, color: char.color, opacity: 0.045,
            whiteSpace: "nowrap", lineHeight: 1,
            textAlign: "right",
            paddingBottom: "0.1em",
            animation: "nameFloat 25s ease-in-out infinite",
            willChange: "transform",
          }}>
            {char.name}
          </div>
        </div>
        <style>{`
          @keyframes nameFloat {
            0%, 100% { transform: translateX(5%); }
            50% { transform: translateX(-15%); }
          }
        `}</style>

        {/* Marquee line 1 — archive data (blurred for depth) */}
        <div style={{
          position: "absolute", top: isMobile ? "12%" : "16%", left: 0,
          display: "flex", width: "200%",
          animation: "bgMarquee 80s linear infinite",
          willChange: "transform",
        }}>
          {[1, 2].map((k) => (
            <div key={k} style={{
              flex: "0 0 50%",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? "clamp(36px, 9vw, 50px)" : "clamp(70px, 7vw, 100px)",
              fontWeight: 900, color: char.color, opacity: 0.025,
              whiteSpace: "nowrap", textTransform: "uppercase",
              letterSpacing: "0.08em", lineHeight: 0.8,
              filter: "blur(1px)",
            }}>
              {char.agency} ◆ PRIME CITY ARCHIVE ◆ DATA ID: {char.cdnId} ◆ {char.role} ◆&nbsp;
            </div>
          ))}
        </div>

        {/* Marquee line 2 — reverse, deeper blur */}
        <div style={{
          position: "absolute", top: isMobile ? "58%" : "62%", left: 0,
          display: "flex", width: "200%",
          animation: "bgMarqueeReverse 100s linear infinite",
          willChange: "transform",
        }}>
          {[1, 2].map((k) => (
            <div key={k} style={{
              flex: "0 0 50%",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? "clamp(36px, 9vw, 50px)" : "clamp(70px, 7vw, 100px)",
              fontWeight: 900, color: char.color, opacity: 0.018,
              whiteSpace: "nowrap", textTransform: "uppercase",
              letterSpacing: "0.08em", lineHeight: 0.9,
              filter: "blur(1.5px)",
            }}>
              SECTOR: {char.cdnId} ◆ CLASSIFICATION: CONFIDENTIAL ◆ PRIME CITY ◆&nbsp;
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
          <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 15 : 18, color: C.text70, fontStyle: "italic", margin: 0, lineHeight: 1.6, textAlign: "center", whiteSpace: "pre-line", opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)", transition: t(0.6) }}>
            &ldquo;{char.tagline}&rdquo;
          </p>
        </div>

        {/* ── Back link (phase 2) ── */}
        <div style={{ width: "100%", maxWidth: 1100, opacity: phase === 2 ? 1 : 0, transition: `opacity 0.6s ${EASE} 0.3s`, marginBottom: isMobile ? 24 : 40 }}>
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
            style={{ background: "none", border: "none", padding: 0, color: C.text35, fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "var(--f-body)", transition: "color 0.3s" }}>
            &larr; PRIME CITY
          </button>
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
                      transition: `opacity 0.9s ${EASE}, transform 0.9s ${EASE}`,
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
                      transition: `opacity 0.9s ${EASE}, transform 0.9s ${EASE}`,
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
                      transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                    }}
                  />
                  {/* Profile card (Phase 2): focus lock-on with blur clear */}
                  <img
                    src={profileSrc} alt={char.name}
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
                  {/* Vignette — Phase 2 only, lighter on mobile */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(ellipse at center, transparent ${isMobile ? "50%" : "40%"}, ${C.bgDeep} 100%)`,
                    opacity: phase === 2 ? (isMobile ? 0.3 : 0.4) : 0,
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
              transition: `opacity 1s ${EASE} 0.3s, transform 1s ${EASE} 0.3s`,
              pointerEvents: phase === 2 ? "auto" : "none",
            }}
          >
            {/* Signature tagline */}
            <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 16 : 17, color: char.color, fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.7, wordBreak: "keep-all", whiteSpace: "pre-line" }}>
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
                    transition: `opacity 0.8s ${EASE} ${0.5 + i * 0.12}s, transform 0.8s ${EASE} ${0.5 + i * 0.12}s`,
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

        {/* ── Phase 2 seam cue ── */}
        <div style={{ width: "100%", maxWidth: 1100, marginTop: isMobile ? 48 : 80 }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            opacity: showPhase2Cue ? 1 : 0,
            transform: showPhase2Cue ? "translateY(0)" : "translateY(-10px)",
            transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
            pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: "var(--f-display-en)", fontSize: 13,
              letterSpacing: "0.35em", textTransform: "uppercase", color: C.text35,
            }}>
              {cueCopy}
            </span>
            <div style={{
              width: isMobile ? 200 : 400, height: 1,
              background: `linear-gradient(90deg, transparent, ${char.color}, transparent)`,
              boxShadow: `0 0 12px ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
            }} />
            <div style={{
              width: 1, height: 48,
              background: `linear-gradient(to bottom, ${char.color}, transparent)`,
              animation: "scrollPulse 2s ease-in-out 2",
            }} />
          </div>
        </div>
      </section>

      {/* ══════════ Concept Art & Expressions Preview ══════════ */}
      <CharExpressionsGrid
        char={char}
        isMobile={isMobile}
        sectionRef={(el) => { exprRef.current = el; contentRef.current = el; }}
        sectionStyle={{
          opacity: exprV ? 1 : 0,
          transform: exprV ? "translateY(0)" : "translateY(30px)",
          transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
        }}
        exprErrors={exprErrors}
        setExprErrors={setExprErrors}
        onOpen={(key, src) => setLightbox({ key, src })}
      />

      {/* ══════════ Sign ══════════ */}
      {char.sign && (
        <section style={{ padding: isMobile ? "32px 24px 48px" : "48px 64px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, margin: "0 0 20px" }}>Sign</p>
          <img src={char.sign} alt={`${char.name} signature`} style={{ maxWidth: isMobile ? 220 : 300, height: "auto", opacity: 0.9, filter: `drop-shadow(0 2px 18px ${char.color}77)` }} />
        </section>
      )}

      {/* ══════════ Navigation ══════════ */}
      <CharNavigation
        prevChar={prevChar}
        nextChar={nextChar}
        sameAgency={sameAgency}
        isMobile={isMobile}
        sectionRef={(el) => { navRef.current = el; if (!(char.expressions?.length)) contentRef.current = el; }}
        sectionStyle={{
          opacity: navV ? 1 : 0,
          transform: navV ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
        }}
      />

      {/* ══════════ Lightbox ══════════ */}
      <CharLightbox
        lightbox={lightbox}
        onClose={closeLightbox}
        charName={char.name}
        isMobile={isMobile}
      />

      <Footer isMobile={isMobile} />
    </div>
  );
}
