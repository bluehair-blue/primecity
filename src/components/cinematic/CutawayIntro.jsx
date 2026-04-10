import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════
   CutawayIntro (JSH) — punchy zoom montage → overlay fadeOut
   ------------------------------------------------------------
   Sequence (5800ms) + handoff fadeOut (600ms)
     0    -  200ms : black hold
     200  - 1700ms : intro1 zoom #1 (1500ms hold) — slow Ken Burns
     1700 - 1800ms : WHITE FLASH #1 (100ms)
     1800 - 3300ms : intro1 zoom #2 (1500ms hold) — slow Ken Burns
     3300 - 3400ms : WHITE FLASH #2 (100ms)
     3400 - 5800ms : intro1 full-view (2400ms) + centered hero text
     5800 - 6400ms : overlay fadeOut over 600ms → Phase 1 keyVisual beneath
   Total: config.duration (6400ms)

   Phase 1 handoff follows JGR pattern: Phase 1 content is already
   rendered beneath; this overlay simply fades away without
   unmounting the keyVisual.
   ══════════════════════════════════════════════════════════ */
export default function CutawayIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [flash, setFlash] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const quote = char.quoteSequence?.[0] || char.tagline || "";

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
      {/* ── Beat 1: intro1 zoom #1 with slow Ken Burns drift ── */}
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

      {/* ── Beat 2: intro1 zoom #2 with slow Ken Burns drift ── */}
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

      {/* ── Beat 3: intro1 full view with gentle Ken Burns ── */}
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

      {/* Dark radial vignette for text legibility during beat 3 */}
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
          transform: beat === 3 ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
          transition: "opacity 0.8s ease-out 0.2s, transform 1.1s ease-out 0.2s",
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

      {/* Chapter label — bottom center, beat 3 only */}
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
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── WHITE FLASH overlay ── */}
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
