import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════
   CutawayIntro (JSH) — "탈락, 다음."
   ------------------------------------------------------------
   Black screen → 0.3s hold → keyVisual SHARP cut-in (no fade)
   Typewriter quote (CSS width+steps, not per-letter JS)
   Letterbox 7% top/bottom
   Total: config.duration (1700ms)
   ══════════════════════════════════════════════════════════ */
export default function CutawayIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  // beat 0: black only (0-300ms)
  // beat 1: image cut-in + typewriter starts (300ms+)

  useEffect(() => {
    const t = setTimeout(() => setBeat(1), 300);
    return () => clearTimeout(t);
  }, []);

  const quote = char.quoteSequence?.[0] || char.tagline || "";
  const chars = quote.length;
  // typewriter duration: scale with quote length, max ~1200ms
  const typeDuration = Math.min(1200, chars * 90);

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {/* KeyVisual — sharp cut-in at beat 1 */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition,
          opacity: beat >= 1 ? 1 : 0,
          // NO transition — sharp cut
        }}
      />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 35%, oklch(0 0 0 / 0.75) 100%)",
        opacity: beat >= 1 ? 1 : 0,
        transition: "opacity 0.2s linear 0.05s",
        pointerEvents: "none",
      }} />

      {/* Letterbox top/bottom 7% */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "7%",
        background: "oklch(0 0 0)",
        zIndex: 4,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "7%",
        background: "oklch(0 0 0)",
        zIndex: 4,
      }} />

      {/* Quote with typewriter effect (CSS width+steps) */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "0 24px" : "0 48px",
        zIndex: 3,
        pointerEvents: "none",
      }}>
        {beat >= 1 && (
          <div
            key={quote}
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(26px,7vw,36px)" : "clamp(36px,4vw,52px)",
              fontWeight: 600,
              color: "oklch(0.98 0 0)",
              letterSpacing: "-0.01em",
              textShadow: "0 2px 32px oklch(0 0 0 / 0.9)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              borderRight: "2px solid oklch(0.98 0 0 / 0.9)",
              animation: `cinemaTypewriter ${typeDuration}ms steps(${chars}, end) forwards, cinemaCaretBlink 0.6s step-end infinite`,
              width: 0,
            }}
          >
            {quote}
          </div>
        )}
      </div>

      {/* Chapter label */}
      {char.introLabel && (
        <span style={{
          position: "absolute", bottom: "10%",
          left: isMobile ? 20 : 48,
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 10 : 12,
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: "oklch(0.75 0 0)",
          opacity: beat >= 1 ? 0.7 : 0,
          transition: "opacity 0.3s ease-out 0.15s",
          zIndex: 5,
          pointerEvents: "none",
        }}>
          {char.introLabel}
        </span>
      )}

      {/* Skip hint — bottom right */}
      <span style={{
        position: "absolute", bottom: "10%", right: isMobile ? 20 : 48,
        fontFamily: "var(--f-display-en)",
        fontSize: isMobile ? 9 : 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "oklch(0.5 0 0)",
        opacity: beat >= 1 ? 0.4 : 0,
        transition: "opacity 0.4s ease-out 0.8s",
        zIndex: 5,
        pointerEvents: "none",
      }}>
        Tap to skip
      </span>
    </div>
  );
}
