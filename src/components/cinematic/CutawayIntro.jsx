import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   CutawayIntro (JSH) — punchy zoom montage → overlay fadeOut
   ------------------------------------------------------------
   Sequence (5800ms) + handoff fadeOut (600ms) = 6400ms total
     0    -  200ms : black hold
     200  - 1700ms : intro1 zoom #1 (Ken Burns, scale 2.0→2.12) + quote subtle
     1700 - 1800ms : WHITE FLASH #1 (100ms)
     1800 - 3300ms : intro1 zoom #2 (Ken Burns, scale 1.9→2.014) + quote subtle
     3300 - 3400ms : WHITE FLASH #2 (100ms)
     3400 - 5800ms : intro1 full-view (scale 1.0→1.05) + quote hero (name + line)
     5800 - 6400ms : overlay fadeOut → Phase 1 keyVisual beneath

   v4 changes:
   - CenteredQuote: subtle from beat 1, hero at beat 3 (shared component)
   - zoomSequence scale 2.0/1.9 (was 2.8/2.5) — image quality
   - Letterbox top/bottom 7% (zIndex 15)
   - introLabel bottom 10% to clear letterbox
   ══════════════════════════════════════════════════════════ */

export default function CutawayIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [flash, setFlash] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const zoomSequence = char.zoomSequence || [
    { cx: 50, cy: 30, scale: 2.0 },
    { cx: 45, cy: 55, scale: 1.9 },
  ];
  const z1 = zoomSequence[0];
  const z2 = zoomSequence[1] || z1;
  const z1Pos = `${z1.cx}% ${z1.cy}%`;
  const z2Pos = `${z2.cx}% ${z2.cy}%`;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 200),
      setTimeout(() => setFlash(1), 1700),
      setTimeout(() => { setFlash(0); setBeat(2); }, 1800),
      setTimeout(() => setFlash(2), 3300),
      setTimeout(() => { setFlash(0); setBeat(3); }, 3400),
      setTimeout(() => setFadingOut(true), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const commonImg = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

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
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* ── Beat 1: zoom #1 — slow Ken Burns drift ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: z1Pos,
          transformOrigin: z1Pos,
          transform: beat === 1 ? `scale(${z1.scale * 1.06})` : `scale(${z1.scale})`,
          opacity: beat === 1 ? 1 : 0,
          transition: "opacity 0.25s ease-out, transform 1.6s ease-out",
          zIndex: 1,
        }}
      />

      {/* ── Beat 2: zoom #2 — slow Ken Burns drift ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: z2Pos,
          transformOrigin: z2Pos,
          transform: beat === 2 ? `scale(${z2.scale * 1.06})` : `scale(${z2.scale})`,
          opacity: beat === 2 ? 1 : 0,
          transition: "opacity 0.25s ease-out, transform 1.6s ease-out",
          zIndex: 1,
        }}
      />

      {/* ── Beat 3: full view — gentle Ken Burns ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: "center center",
          transform: beat >= 3 ? "scale(1.05)" : "scale(1.0)",
          opacity: beat === 3 ? 1 : 0,
          transition: "opacity 0.6s ease-out, transform 2.4s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Dark vignette (text legibility) — beat 3 only ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 20%, oklch(0 0 0 / 0.55) 75%, oklch(0 0 0 / 0.8) 100%)",
          opacity: beat === 3 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote: subtle (beat 1/2) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 3}
      />

      {/* ── CenteredQuote: hero (beat 3) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat === 3}
      />

      {/* ── Letterbox top/bottom 7% (zIndex 15, above text) ── */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "7%",
          background: "oklch(0 0 0)",
          zIndex: 15,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "7%",
          background: "oklch(0 0 0)",
          zIndex: 15,
          pointerEvents: "none",
        }}
      />

      {/* ── Chapter label — bottom 10% (clears letterbox 7%) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat === 3 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── WHITE FLASH overlay (zIndex 20, above letterbox) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(1 0 0)",
          opacity: flash > 0 ? 1 : 0,
          transition: flash > 0 ? "opacity 0.04s linear" : "opacity 0.1s linear",
          zIndex: 20,
          pointerEvents: "none",
        }}
      />

      {/* ── Tap to skip hint ── */}
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
