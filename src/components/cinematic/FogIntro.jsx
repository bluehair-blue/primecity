import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — 2-beat quote with fog dissipation
   ------------------------------------------------------------
   Concept: 안개 속에 숨겨진 정체 → 서서히 걷히는 안개
   Sequence: 3800ms + 500ms fadeOut = 4300ms total
     0    -  400ms : black
     400  - 1800ms : key.webp low-sat + fog layers + quote[0] "후후." subtle
     1800 - 3200ms : fog dissipates + quote[0] fades out + quote[1] fades in
     3200 - 3800ms : full color + quote[1] "잘 부탁해?" hero
     3800 - 4300ms : fadeOut → Phase 1

   zIndex 체인: img(2) < fog1(3) < fog2(4) < vignette(5) < CenteredQuote(6) < label(10)
   keyframes: cinemaFogDrift1 (18s), cinemaFogDrift2 (14s) — index.html
   ══════════════════════════════════════════════════════════ */

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 400),
      setTimeout(() => setBeat(2), 1800),
      setTimeout(() => setBeat(3), 3200),
      setTimeout(() => setFadingOut(true), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // filter interpolates: low-sat → mid → full color across beats
  const imageFilter =
    beat <= 1 ? "saturate(0.4) brightness(0.7)" :
    beat === 2 ? "saturate(0.7) brightness(0.85)" :
    "saturate(1.0) brightness(1.0)";

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
      {/* ── Key visual with saturation transition ── */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition,
          filter: imageFilter,
          opacity: beat >= 1 ? 1 : 0,
          transition: "filter 1.4s ease-out, opacity 0.8s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Fog layer 1 (slow diagonal drift, screen blend) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(135deg, oklch(0.85 0.02 260 / 0.9) 0%, oklch(0.7 0.04 260 / 0.4) 50%, oklch(0.85 0.02 260 / 0.9) 100%)",
          backgroundSize: "200% 200%",
          opacity: beat === 1 ? 0.85 : beat === 2 ? 0.4 : beat >= 3 ? 0.1 : 0,
          animation: beat >= 1 ? "cinemaFogDrift1 18s linear infinite" : "none",
          transition: "opacity 1.4s ease-out",
          zIndex: 3,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Fog layer 2 (faster, reversed direction) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(-45deg, oklch(0.7 0.03 280 / 0.7) 0%, oklch(0.55 0.05 280 / 0.2) 50%, oklch(0.7 0.03 280 / 0.7) 100%)",
          backgroundSize: "180% 180%",
          opacity: beat === 1 ? 0.75 : beat === 2 ? 0.3 : beat >= 3 ? 0.05 : 0,
          animation: beat >= 1 ? "cinemaFogDrift2 14s linear infinite" : "none",
          transition: "opacity 1.4s ease-out",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Vignette for hero legibility (Beat 3) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 3 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── Quote[0] "후후." subtle — Beat 1, fades as Beat 2 begins ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
        quoteIndex={0}
      />

      {/* ── Quote[1] "잘 부탁해?" subtle — Beat 2, fog dissipating ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 2}
        quoteIndex={1}
      />

      {/* ── Quote[1] "잘 부탁해?" hero — Beat 3, full reveal ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 3}
        quoteIndex={1}
      />

      {/* ── Chapter label (Beat 3+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 3 ? 0.6 : 0,
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
