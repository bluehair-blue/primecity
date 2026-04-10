import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════
   CutawayIntro (JSH) — 3-second punchy zoom montage
   ------------------------------------------------------------
   0    -  100ms : black hold
   100  -  800ms : intro1 zoom #1 (zoomSequence[0], ~2.8x)
   800  -  900ms : WHITE FLASH #1
   900  - 1500ms : intro1 zoom #2 (zoomSequence[1], ~2.5x)
   1500 - 1600ms : WHITE FLASH #2
   1600 - 2400ms : intro1 full-view + CENTERED hero text
                   (agency · name · quote, vertically centered)
   2400 - 3000ms : intro1 → keyVisual crossfade (handoff)
   Total: 3000ms (config.duration)
   ══════════════════════════════════════════════════════════ */
export default function CutawayIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [flash, setFlash] = useState(0); // 0 = off, 1 = flash1, 2 = flash2
  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const quote = char.quoteSequence?.[0] || char.tagline || "";

  // Zoom sequence — per-character override, fallback to 2 default spots
  const zoomSequence = char.zoomSequence || [
    { cx: 50, cy: 30, scale: 2.7 },
    { cx: 45, cy: 55, scale: 2.4 },
  ];
  const z1 = zoomSequence[0];
  const z2 = zoomSequence[1] || z1;
  const z1Pos = `${z1.cx}% ${z1.cy}%`;
  const z2Pos = `${z2.cx}% ${z2.cy}%`;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 100),
      setTimeout(() => setFlash(1), 800),
      setTimeout(() => { setFlash(0); setBeat(2); }, 900),
      setTimeout(() => setFlash(2), 1500),
      setTimeout(() => { setFlash(0); setBeat(3); }, 1600),
      setTimeout(() => setBeat(4), 2400),
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
      }}
    >
      {/* ── Beat 1: intro1 zoom #1 ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: z1Pos,
          transform: `scale(${z1.scale})`,
          transformOrigin: z1Pos,
          opacity: beat === 1 ? 1 : 0,
          transition: "opacity 0.12s linear",
          zIndex: 1,
        }}
      />

      {/* ── Beat 2: intro1 zoom #2 ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: z2Pos,
          transform: `scale(${z2.scale})`,
          transformOrigin: z2Pos,
          opacity: beat === 2 ? 1 : 0,
          transition: "opacity 0.12s linear",
          zIndex: 1,
        }}
      />

      {/* ── Beat 3: intro1 full view (slight Ken Burns) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: "center center",
          transform: beat >= 3 ? "scale(1.04)" : "scale(1.0)",
          opacity: beat === 3 ? 1 : 0,
          transition: "opacity 0.45s ease-out, transform 1.2s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Beat 4: keyVisual handoff (final frame of Phase 0) ── */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          opacity: beat >= 4 ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 3,
        }}
      />

      {/* Dark radial gradient — legibility during beat 3 centered text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 25%, oklch(0 0 0 / 0.55) 80%, oklch(0 0 0 / 0.75) 100%)",
          opacity: beat === 3 ? 1 : 0,
          transition: "opacity 0.4s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* Beat 3: CENTERED hero text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: isMobile ? "0 24px" : "0 48px",
          zIndex: 5,
          pointerEvents: "none",
          opacity: beat === 3 ? 1 : 0,
          transform: beat === 3 ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
          transition: "opacity 0.45s ease-out, transform 0.65s ease-out",
        }}
      >
        <p
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 11 : 14,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: char.color,
            margin: "0 0 14px",
            textShadow: "0 2px 20px oklch(0 0 0 / 0.85)",
          }}
        >
          {char.agency}
        </p>
        <h1
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(58px,16vw,84px)" : "clamp(84px,10vw,144px)",
            fontWeight: 700,
            color: "oklch(0.99 0 0)",
            margin: "0 0 20px",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: "0 6px 48px oklch(0 0 0 / 0.9)",
          }}
        >
          {char.name}
        </h1>
        <p
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 17 : 24,
            fontStyle: "italic",
            color: char.color,
            margin: 0,
            wordBreak: "keep-all",
            textShadow: "0 2px 24px oklch(0 0 0 / 0.9)",
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Chapter label — centered bottom, only during beat 3 */}
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
            opacity: beat === 3 ? 0.6 : 0,
            transition: "opacity 0.4s ease-out 0.2s",
            zIndex: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── WHITE FLASH overlay (beats 1→2 and 2→3) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(1 0 0)",
          opacity: flash > 0 ? 1 : 0,
          transition: flash > 0 ? "opacity 0.04s linear" : "opacity 0.08s linear",
          zIndex: 20,
          pointerEvents: "none",
        }}
      />

      {/* Skip hint */}
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
          transition: "opacity 0.4s ease-out",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        Tap to skip
      </span>
    </div>
  );
}
