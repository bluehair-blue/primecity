import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   SunriseIntro (KHR) — clip-path reveal + gold lens flare
   ------------------------------------------------------------
   Sequence: 3200ms + 500ms fadeOut = 3700ms total
     0    -  400ms : black + horizon gold glow ignition
     400  - 2400ms : intro1 clip-path sunrise + scale 1.08→1.0
                     + diagonal gold lens flare + quote subtle
     2400 - 3200ms : settle + residual glow + quote hero
     3200 - 3700ms : overlay fadeOut → Phase 1 keyVisual

   Character: 강하람 — activity, morning light, determination
   zIndex chain: horizon(1) < clip-img(2) < flare(3) < vignette(4) < quote(6) < label(10)
   ══════════════════════════════════════════════════════════ */
export default function SunriseIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 400),
      setTimeout(() => setBeat(2), 2400),
      setTimeout(() => setFadingOut(true), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer",
        overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── Horizon glow — bottom 35%, ignites Beat 0 ── */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          height: "35%",
          background:
            "radial-gradient(ellipse at 50% 100%, oklch(0.78 0.16 80 / 0.55) 0%, oklch(0.4 0.08 60 / 0.25) 40%, oklch(0 0 0 / 0) 75%)",
          opacity: beat >= 0 ? 1 : 0,
          transition: "opacity 0.9s ease-out",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Sunrise image — clip-path reveal, bottom→top ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          clipPath: beat >= 1 ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
          transform: beat >= 1 ? "scale(1.0)" : "scale(1.08)",
          willChange: "clip-path, transform",
          transition:
            "clip-path 2.0s cubic-bezier(0.22, 1, 0.36, 1), transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 2,
        }}
      />

      {/* ── Diagonal gold lens flare — Beat 1, sweeps then fades ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, oklch(0.92 0.16 85 / 0) 20%, oklch(0.92 0.18 85 / 0.55) 45%, oklch(0.92 0.16 85 / 0) 70%)",
          mixBlendMode: "screen",
          opacity: beat === 1 ? 1 : 0,
          animation: beat === 1 ? "cinemaSunriseFlare 2.0s ease-out forwards" : "none",
          transition: "opacity 0.6s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Light vignette — Beat 2+ for text legibility ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.45) 90%)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
      />

      {/* ── CenteredQuote hero (Beat 2+) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 2}
      />

      {/* ── Chapter label — Beat 2+, bottom 7% ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute",
            bottom: "7%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 2 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── Skip hint ── */}
      <span
        style={{
          position: "absolute",
          bottom: "2.5%",
          right: isMobile ? 16 : 32,
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "oklch(0.55 0 0)",
          opacity: beat >= 1 ? 0.4 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
