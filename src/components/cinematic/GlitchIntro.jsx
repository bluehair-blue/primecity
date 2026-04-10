import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   GlitchIntro (LSH) — RGB channel split with decaying shake
   ------------------------------------------------------------
   Concept: 신호가 깨지다 정착 — 자기부정, 숨기는 성격의 시각 문법
   Sequence: 2800ms + 400ms fadeOut = 3200ms total
     0    -  300ms : black
     300  - 2400ms : intro1 base + RGB glitch layers (decaying via keyframes)
                     + scanline overlay + CenteredQuote subtle (glitch sync)
     2400 - 2800ms : glitch settles, RGB layers fade, hero CenteredQuote
     2800 - 3200ms : fadeOut → Phase 1 keyVisual

   Mobile: G channel skipped (2 layers), hue-rotate removed, smaller amplitude
   zIndex: base-img(2) < RGB layers(3) < scanline(4) < vignette(5) < quote(6) < label(10)
   ══════════════════════════════════════════════════════════ */
export default function GlitchIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 2400),
      setTimeout(() => setFadingOut(true), 2800),
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
        transition: "opacity 0.4s ease-out",
      }}
    >
      {/* ── Base image layer (Beat 1+) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          opacity: beat >= 1 ? 1 : 0,
          transition: "opacity 0.4s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Glitch RGB — R channel ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          mixBlendMode: "screen",
          filter: isMobile
            ? "hue-rotate(-15deg) saturate(1.5)"
            : "hue-rotate(-20deg) saturate(1.8)",
          opacity: beat === 1 ? 0.55 : 0,
          animation: beat === 1 ? "cinemaGlitchR 2.1s ease-out forwards" : "none",
          transition: "opacity 0.35s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Glitch RGB — G channel (desktop only) ── */}
      {!isMobile && (
        <img
          src={introSrc}
          alt=""
          style={{
            ...commonImg,
            mixBlendMode: "screen",
            filter: "hue-rotate(110deg) saturate(1.6)",
            opacity: beat === 1 ? 0.45 : 0,
            animation: beat === 1 ? "cinemaGlitchG 2.1s ease-out forwards" : "none",
            transition: "opacity 0.35s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Glitch RGB — B channel ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          mixBlendMode: "screen",
          filter: isMobile
            ? "hue-rotate(180deg) saturate(1.5)"
            : "hue-rotate(200deg) saturate(1.8)",
          opacity: beat === 1 ? 0.55 : 0,
          animation: beat === 1 ? "cinemaGlitchB 2.1s ease-out forwards" : "none",
          transition: "opacity 0.35s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

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

      {/* ── CenteredQuote hero (Beat 2+) ── */}
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
