import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   GlitchIntro (LSH) — image shake + RGB ghost split
   ------------------------------------------------------------
   Concept: 신호가 깨지다 정착 — 자기부정, 숨기는 성격
   Sequence: 3800ms + 500ms fadeOut = 4300ms total
     0    -  300ms : black
     300  - 2400ms : intro1 MAIN SHAKES (cinemaGlitchMain)
                     + R ghost displaced +15px / B ghost -15px
                     + scanline + CenteredQuote subtle (glitch sync)
     2400 - 3800ms : glitch fades, hero CenteredQuote — 1.4s hold
     3800 - 4300ms : fadeOut → Phase 1 keyVisual

   Key change from v1: animate the MAIN image itself (visible regardless
   of image brightness), ghost copies use ±15px offset (not ±6px).
   Mobile: R ghost only (1 copy), reduced offset ±10px.
   ══════════════════════════════════════════════════════════ */
export default function GlitchIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 2400),
      setTimeout(() => setFadingOut(true), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const commonImg = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
    objectPosition,
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
      {/* ── Main image — SHAKES via cinemaGlitchMain ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          opacity: beat >= 1 ? 1 : 0,
          animation: beat === 1 ? "cinemaGlitchMain 2.1s ease-out forwards" : "none",
          transition: "opacity 0.3s ease-out",
          zIndex: 2,
        }}
      >
        <img src={introSrc} alt="" style={{ ...commonImg }} />
      </div>

      {/* ── R ghost — displaced right (+15px desktop, +10px mobile) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: beat === 1
            ? `translateX(${isMobile ? 10 : 15}px)`
            : "translateX(0)",
          opacity: beat === 1 ? 0.45 : 0,
          mixBlendMode: "screen",
          animation: beat === 1 ? "cinemaGlitchR 2.1s ease-out forwards" : "none",
          transition: "opacity 0.4s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <img
          src={introSrc}
          alt=""
          style={{
            ...commonImg,
            filter: "hue-rotate(-25deg) saturate(2.0) brightness(1.2)",
          }}
        />
      </div>

      {/* ── B ghost — displaced left (-15px, desktop only) ── */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: beat === 1 ? "translateX(-15px)" : "translateX(0)",
            opacity: beat === 1 ? 0.4 : 0,
            mixBlendMode: "screen",
            animation: beat === 1 ? "cinemaGlitchB 2.1s ease-out forwards" : "none",
            transition: "opacity 0.4s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <img
            src={introSrc}
            alt=""
            style={{
              ...commonImg,
              filter: "hue-rotate(195deg) saturate(2.0) brightness(1.1)",
            }}
          />
        </div>
      )}

      {/* ── Scanline overlay (Beat 1) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0) 0px, oklch(0 0 0 / 0) 3px, oklch(0 0 0 / 0.18) 4px)",
          opacity: beat === 1 ? 0.45 : 0,
          transition: "opacity 0.5s ease-out",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Vignette for hero legibility (Beat 2+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle + glitch sync (Beat 1) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
        glitch
      />

      {/* ── CenteredQuote hero (Beat 2+) — 1.4s hold ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 2}
      />

      {/* ── Chapter label (Beat 2+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 2 ? 0.6 : 0,
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
