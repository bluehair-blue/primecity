import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   RippleIntro (MIL) — zoom scan → SVG turbulence ripple → hero
   ------------------------------------------------------------
   Concept: 카메라가 밀라를 훑어본 뒤 → 음파가 이미지를 흔든다 → 잔잠해짐
   Sequence: 5500ms + 500ms fadeOut = 6000ms total
     0    -  300ms : black
     300  - 1500ms : intro1 zoom #1 lower body (50% 80%, scale 2.0→2.12) + quote subtle
     1500 - 2700ms : intro1 zoom #2 middle    (50% 50%, scale 2.0→2.12) + quote subtle
     2700 - 4500ms : ripple — SVG turbulence decays (desktop)
                              scaleY + specular sweep (mobile)
                              objectPosition → focusBox, scale → 1.0
     4500 - 5500ms : ripple gone, hero CenteredQuote — 1s breathing room
     5500 - 6000ms : fadeOut → Phase 1 keyVisual

   Mobile: SVG filter 없음, CSS scaleY + sweep
   zIndex: ring(1) < zoom/ripple-img(2) < mobile-sweep(3) < vignette(4) < quote(6) < label(10)
   ══════════════════════════════════════════════════════════ */

const FILTER_ID = "cinemaRippleFilter";

export default function RippleIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [filterActive, setFilterActive] = useState(!isMobile);
  const turbulenceRef = useRef(null);
  const rafRef = useRef(null);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1500),
      setTimeout(() => setBeat(3), 2700),
      setTimeout(() => setBeat(4), 4500),
      setTimeout(() => setFilterActive(false), 4500),
      setTimeout(() => setFadingOut(true), 5500),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── rAF: decay baseFrequency during Beat 3 (desktop only) ──
  useEffect(() => {
    if (isMobile || beat !== 3 || !turbulenceRef.current) return;
    const startMs = performance.now();
    const DURATION = 1800;  // decay over 1.8s of the 1.8s ripple beat
    const START_BF = 0.018;

    const tick = (now) => {
      const t = Math.min(1, (now - startMs) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const bf = START_BF * (1 - eased);
      if (turbulenceRef.current) {
        turbulenceRef.current.setAttribute("baseFrequency", bf.toFixed(5));
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [beat, isMobile]);

  const commonImg = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
  };

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── SVG filter def (desktop, Beat 3 only, unmounts at Beat 4) ── */}
      {filterActive && !isMobile && (
        <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id={FILTER_ID} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0.018"
                numOctaves="2"
                seed="5"
                result="noise"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}

      {/* ── Sonic ring — Beat 0, expands as Beat 1 starts ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: isMobile ? 110 : 160,
          height: isMobile ? 110 : 160,
          marginLeft: isMobile ? -55 : -80,
          marginTop: isMobile ? -55 : -80,
          borderRadius: "50%",
          border: `1.5px solid ${char.color}`,
          boxShadow: `0 0 12px ${char.color}55`,
          opacity: beat === 0 ? 0.75 : 0,
          transform: beat === 0 ? "scale(0.3)" : "scale(1.6)",
          transition: "opacity 0.5s ease-out, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Beat 1: zoom #1 lower body ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: "50% 80%",
          transformOrigin: "50% 80%",
          transform: beat === 1 ? "scale(2.12)" : "scale(2.0)",
          opacity: beat === 1 ? 1 : 0,
          transition: "opacity 0.3s ease-out, transform 1.4s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Beat 2: zoom #2 middle ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: "50% 50%",
          transformOrigin: "50% 50%",
          transform: beat === 2 ? "scale(2.12)" : "scale(2.0)",
          opacity: beat === 2 ? 1 : 0,
          transition: "opacity 0.3s ease-out, transform 1.4s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Beat 3+: ripple image (SVG filter desktop / scaleY mobile) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          filter: filterActive && !isMobile ? `url(#${FILTER_ID})` : "none",
          transform: isMobile
            ? (beat === 3 ? "scaleY(1.0)" : "scaleY(1.03)")
            : "none",
          opacity: beat >= 3 ? 1 : 0,
          transition:
            "opacity 0.5s ease-out, transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 2,
        }}
      />

      {/* ── Mobile: specular highlight sweep (Beat 3) ── */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, height: "28%",
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0) 0%, oklch(1 0 0 / 0.2) 50%, oklch(1 0 0 / 0) 100%)",
            mixBlendMode: "screen",
            opacity: beat === 3 ? 1 : 0,
            top: beat === 3 ? "60%" : "0%",
            transition: "top 2.4s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Vignette (Beat 3+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 90%)",
          opacity: beat >= 3 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 4}
      />

      {/* ── CenteredQuote hero (Beat 4+) — 1s hold before fadeOut ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 4}
      />

      {/* ── Chapter label (Beat 4+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 4 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── Skip hint ── */}
      <span
        style={{
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10, pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
