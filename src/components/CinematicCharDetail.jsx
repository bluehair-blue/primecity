import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useCharLightbox from "../hooks/useCharLightbox";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Seo from "./Seo";
import CharLightbox from "./CharLightbox";
import CharExpressionsGrid from "./CharExpressionsGrid";
import CharNavigation from "./CharNavigation";
import { useImagePreloader } from "../hooks/useImagePreloader";
import { INTRO_STYLE_CONFIG, PRELOAD_BUDGET_OVERRIDE, DEFAULT_PRELOAD_BUDGET } from "../data/introStyles";
import { INTRO_COMPONENTS } from "./cinematic";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ══════════════════════════════════════════════════════════
   CinematicCharDetail — Step 4 skeleton (module scope)
   ------------------------------------------------------------
   Phase state machine + LoadingShell for characters with
   `introStyle`. Actual cinematic transitions come in Steps 5-7;
   Phase 0 here is a placeholder keyVisual fade + quote.

   Phases:
     -1  LoadingShell (progress bar)
      0  Cinematic intro overlay (placeholder)
      1  KeyVisual hero (fixed bg + profile column)
      2  CharSections (Expressions / Navigation / Footer)
   ══════════════════════════════════════════════════════════ */
export default function CinematicCharDetail({ char, isMobile, prevChar, nextChar, sameAgency }) {
  const { name } = useParams();
  const navigate = useNavigate();

  // ── Config ──
  const config = INTRO_STYLE_CONFIG[char.introStyle] || {};
  const preloadBudget = PRELOAD_BUDGET_OVERRIDE[char.cdnId] ?? DEFAULT_PRELOAD_BUDGET;

  // ── Phase state machine ──
  const [phase, setPhase] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const { lightbox, setLightbox, close: closeLightbox } = useCharLightbox();
  const [exprErrors, setExprErrors] = useState({});
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const phase1Ref = useRef(null);
  const exprSectionRef = useRef(null);

  // ── Preload list: keyVisual + introAssets ──
  const preloadUrls = [char.keyVisual, ...(char.introAssets || [])].filter(Boolean);
  const { loaded, total, timedOut, progress } = useImagePreloader(preloadUrls, { timeoutMs: preloadBudget });

  // ── Detect reduced-motion ──
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // ── Reset on character change ──
  useEffect(() => {
    window.scrollTo(0, 0);
    setPhase(-1);
    setNavbarVisible(false);
    setExprErrors({});
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [name]);

  // ── Shell → Phase transition ──
  // Priority:
  //   1) reduced-motion   → always skip cinematic → Phase 1
  //   2) all assets loaded in time → Phase 0 (cinematic plays)
  //   3) timedOut before fully loaded → fall-open to Phase 1
  useEffect(() => {
    if (phase !== -1) return;
    if (reducedMotion) {
      setPhase(1);
      return;
    }
    const fullyLoaded = loaded >= total;
    if (fullyLoaded) {
      setPhase(0);
      document.body.style.overflow = "hidden";
      return;
    }
    if (timedOut) {
      setPhase(1);
      return;
    }
    // still loading, wait
  }, [phase, loaded, total, timedOut, reducedMotion]);

  // ── Phase 0 → Phase 1 auto-advance ──
  useEffect(() => {
    if (phase !== 0) return;
    const duration = config.duration || 2000;
    const t = setTimeout(() => {
      setPhase(1);
      document.body.style.overflow = "";
    }, duration);
    return () => clearTimeout(t);
  }, [phase, config.duration]);

  // ── Skip on click/touch during Phase 0 ──
  const skipIntro = () => {
    if (phase !== 0) return;
    setPhase(1);
    document.body.style.overflow = "";
  };

  // ── Phase 1 → Phase 2 (scroll triggers navbar visibility state) ──
  useEffect(() => {
    if (phase !== 1) return;
    const handler = () => {
      if (window.scrollY > 80) {
        setPhase(2);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [phase]);

  // ── Scroll tracking for Navbar (Phase 2+) ──
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Mouse tilt (desktop Phase 1, ±1.5deg) ──
  useEffect(() => {
    if (isMobile || phase < 1) return;
    const handleMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setTilt({ x: ((e.clientY - cy) / cy) * -1.5, y: ((e.clientX - cx) / cx) * 1.5 });
    };
    const handleLeave = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [isMobile, phase]);

  // ── Navbar IntersectionObserver (show after Expressions visible) ──
  useEffect(() => {
    if (phase < 2 || !exprSectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNavbarVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(exprSectionRef.current);
    return () => obs.disconnect();
  }, [phase]);

  // ── focusBox → objectPosition derivation ──
  const fb = char.focusBox || {};
  const focus = isMobile ? (fb.mobile || fb.desktop) : (fb.desktop || fb.mobile);
  const objectPosition = focus ? `${focus.cx}% ${focus.cy}%` : "center 30%";

  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  // ════════ PHASE -1: LoadingShell ════════
  if (phase === -1) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: C.bgDeep,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <Seo title={char.name} description={`${char.name} — ${char.role}`} path={`/characters/${name}`} />
        <div style={{
          fontFamily: "var(--f-display-en)", fontSize: 11,
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: C.text45, marginBottom: 16,
        }}>
          Loading {char.introLabel || char.name}
        </div>
        {/* Progress bar */}
        <div style={{
          width: 200, height: 2,
          background: C.border06,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${Math.round(progress * 100)}%`,
            background: char.color,
            transition: "width 0.3s ease-out",
          }} />
        </div>
      </div>
    );
  }

  // ════════ PHASE 0+ : Hero + (conditional) cinematic overlay ════════
  // Phase 0 renders the intro overlay ON TOP of Phase 1 hero so the
  // overlay can fadeOut naturally to reveal the final keyVisual+hero.
  // (JGR pattern — overlay layer, not a separate render branch.)
  const StyleComponent = INTRO_COMPONENTS[char.introStyle];

  return (
    <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Seo title={char.name} description={`${char.name} — ${char.role}`} path={`/characters/${name}`} />

      {/* Navbar — visible after Phase 2 IntersectionObserver trigger */}
      <div style={{
        opacity: navbarVisible ? 1 : 0,
        pointerEvents: navbarVisible ? "auto" : "none",
        transition: "opacity 0.5s",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <Navbar scrolled={scrolled} isMobile={isMobile} />
      </div>

      {/* Fixed keyVisual background (z:0) — tilt applied on desktop Phase 1 */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          transform: !isMobile
            ? `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : "none",
          transition: "transform 0.45s ease-out",
        }}
      >
        <img
          src={char.keyVisual}
          alt=""
          style={{
            width: "100%",
            height: char.keyVisualStage ? "70%" : "100%",
            objectFit: char.keyVisualFit || "cover",
            objectPosition: char.keyVisualFit === "contain" ? "50% 50%" : objectPosition,
          }}
        />
        {/* Reflection strip — adjacent to image bottom
            Fix: transformOrigin "bottom" → "center" (이전 코드는 모든 콘텐츠가
            element 밖으로 렌더링돼 overflow:hidden에 완전 클리핑됨)
            Fix: mask white (alpha=1) + element opacity 0.18 (이전: mask alpha 0.18 cap) */}
        <div
          style={{
            position: "absolute",
            ...(char.keyVisualStage ? { top: "70%" } : { bottom: 0 }),
            left: 0, right: 0,
            height: char.keyVisualStage ? "22%" : "28%",
            overflow: "hidden",
          }}
        >
          <img
            src={char.keyVisual}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: char.keyVisualFit || "cover",
              objectPosition: char.keyVisualFit === "contain" ? "50% 50%" : objectPosition,
              transform: "scaleY(-1)",
              transformOrigin: "center",
              WebkitMaskImage: "linear-gradient(to top, white 0%, transparent 65%)",
              maskImage: "linear-gradient(to top, white 0%, transparent 65%)",
              opacity: phase >= 1 ? (char.keyVisualStage ? 0.28 : 0.18) : 0,
              transition: "opacity 1s ease-out",
            }}
          />
        </div>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? "linear-gradient(to top, oklch(0 0 0 / 0.88) 25%, oklch(0 0 0 / 0.35) 55%, transparent 75%)"
            : "linear-gradient(to right, oklch(0 0 0 / 0.82) 28%, oklch(0 0 0 / 0.35) 55%, transparent 75%)",
        }} />
      </div>

      {/* Back button — Phase 1+ only, top-right to avoid Navbar logo */}
      {phase >= 1 && (
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          aria-label="Back"
          style={{
            position: "fixed", top: isMobile ? 68 : 84, right: 16, zIndex: 150,
            width: 40, height: 40,
            background: "oklch(0 0 0 / 0.6)",
            border: `1px solid ${C.border10}`,
            borderRadius: "50%",
            color: C.white, fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >←</button>
      )}

      {/* Phase 1 hero: name + tagline + profile */}
      <section ref={phase1Ref} style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        padding: isMobile ? "0 24px 80px" : "0 0 0 64px",
        overflow: "hidden",
      }}>
        {/* bgMarquee line 1 */}
        {phase >= 1 && (
          <div style={{
            position: "absolute", top: isMobile ? "12%" : "18%", left: 0,
            display: "flex", width: "200%",
            animation: "bgMarquee 80s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }}>
            {[1, 2].map((k) => (
              <div key={k} style={{
                flex: "0 0 50%",
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? "clamp(36px,9vw,50px)" : "clamp(70px,7vw,100px)",
                fontWeight: 900, color: char.color, opacity: 0.025,
                whiteSpace: "nowrap", textTransform: "uppercase",
                letterSpacing: "0.08em", lineHeight: 0.8,
                filter: "blur(1px)",
              }}>
                {char.agency} ◆ PRIME CITY ◆ {char.cdnId} ◆ {char.role} ◆&nbsp;
              </div>
            ))}
          </div>
        )}
        {/* bgMarquee line 2 — reverse */}
        {phase >= 1 && (
          <div style={{
            position: "absolute", bottom: isMobile ? "12%" : "16%", left: 0,
            display: "flex", width: "200%",
            animation: "bgMarqueeReverse 100s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }}>
            {[1, 2].map((k) => (
              <div key={k} style={{
                flex: "0 0 50%",
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? "clamp(36px,9vw,50px)" : "clamp(70px,7vw,100px)",
                fontWeight: 900, color: char.color, opacity: 0.018,
                whiteSpace: "nowrap", textTransform: "uppercase",
                letterSpacing: "0.08em", lineHeight: 0.9,
                filter: "blur(1.5px)",
              }}>
                SECTOR: {char.cdnId} ◆ CLASSIFICATION: CONFIDENTIAL ◆ PRIME CITY ◆&nbsp;
              </div>
            ))}
          </div>
        )}

        <div style={{
          maxWidth: isMobile ? "100%" : 520,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s",
        }}>
          <p style={{
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: char.color, marginBottom: 12,
          }}>{char.introLabel || char.agency}</p>
          <h1 style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(44px,12vw,60px)" : "clamp(56px,6vw,88px)",
            fontWeight: 700, color: C.white,
            margin: "0 0 8px", lineHeight: 1.1,
          }}>{char.name}</h1>
          <p style={{
            fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 16,
            color: C.text55, marginBottom: 20,
          }}>{char.role}</p>
          <p style={{
            fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 17 : 20,
            fontStyle: "italic", color: char.color,
            lineHeight: 1.6, marginBottom: 28, wordBreak: "keep-all", whiteSpace: "pre-line",
          }}>&ldquo;{char.tagline}&rdquo;</p>
          {profileFields.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profileFields.map((f) => (
                <div key={f.en}>
                  <div style={{
                    fontFamily: "var(--f-display-en)", fontSize: 9,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: char.color, marginBottom: 3,
                  }}>{f.en} · {f.label}</div>
                  <div style={{
                    fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 14,
                    color: C.text70, lineHeight: 1.7, wordBreak: "keep-all",
                  }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Scroll hint */}
        {phase >= 1 && (
          <div style={{
            position: "absolute",
            bottom: 32, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: "var(--f-display-en)", fontSize: isMobile ? 18 : 22,
              letterSpacing: "0.45em", textTransform: "uppercase",
              color: C.goldText,
              textShadow: `0 0 20px ${C.goldText}88`,
            }}>Scroll</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 3, background: C.goldText,
                animation: "scrollPulse 1.6s ease-in-out infinite",
                boxShadow: `0 0 8px ${C.goldText}99`,
              }} />
              <div style={{
                width: 36, height: 3, background: C.goldText,
                animation: "scrollPulse 1.6s ease-in-out infinite 0.15s",
                boxShadow: `0 0 8px ${C.goldText}99`,
              }} />
            </div>
          </div>
        )}
      </section>

      {/* Lower sections — always rendered so the page is scrollable
           and the cinematic overlay can fadeOut onto real content */}
      <div style={{ position: "relative", zIndex: 2, background: C.bgDeep, paddingTop: 80 }}>
        <CharExpressionsGrid
          char={char}
          isMobile={isMobile}
          sectionRef={exprSectionRef}
          exprErrors={exprErrors}
          setExprErrors={setExprErrors}
          onOpen={(key, src) => setLightbox({ key, src })}
        />
        {/* Sign */}
        {char.sign && (
          <section style={{ padding: isMobile ? "32px 24px 48px" : "48px 64px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, margin: "0 0 20px" }}>Sign</p>
            <img src={char.sign} alt={`${char.name} signature`} style={{ maxWidth: isMobile ? 220 : 300, height: "auto", opacity: 0.9, filter: `drop-shadow(0 2px 18px ${char.color}77)` }} />
          </section>
        )}
        <CharNavigation
          prevChar={prevChar}
          nextChar={nextChar}
          sameAgency={sameAgency}
          isMobile={isMobile}
        />
        <Footer isMobile={isMobile} />
      </div>
      <CharLightbox
        lightbox={lightbox}
        onClose={closeLightbox}
        charName={char.name}
        isMobile={isMobile}
      />

      {/* Phase 0: cinematic overlay layered on top of everything */}
      {phase === 0 && StyleComponent && (
        <StyleComponent
          char={char}
          isMobile={isMobile}
          objectPosition={objectPosition}
          config={config}
          onSkip={skipIntro}
        />
      )}
    </div>
  );
}
