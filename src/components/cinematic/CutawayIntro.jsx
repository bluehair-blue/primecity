import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════
   CutawayIntro (JSH) — 3-beat zoom-to-hero sequence
   ------------------------------------------------------------
   Beat 0 (  0 - 200ms) : black hold
   Beat 1 (200 -1400ms) : intro1 zoomed 2.3x at focusBox
   Beat 2 (1400-1500ms) : cross-fade
   Beat 3 (1500-3000ms) : intro1 full-view + hero text
   Tail   (3000-3200ms) : handoff fade (auto-advance)
   Total: config.duration (3200ms)
   ══════════════════════════════════════════════════════════ */
export default function CutawayIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const quote = char.quoteSequence?.[0] || char.tagline || "";

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 200),
      setTimeout(() => setBeat(2), 1400),
      setTimeout(() => setBeat(3), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

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
      {/* ── Beat 1: Zoom-in (focusBox region, 2.3x scale) ── */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: beat === 1 ? 1 : 0,
        transition: "opacity 0.25s ease-out",
        zIndex: 1,
      }}>
        <img
          src={introSrc}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition,
            transform: beat >= 1 ? "scale(2.3)" : "scale(2.0)",
            transformOrigin: objectPosition,
            transition: "transform 1.3s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      {/* ── Beat 3: Full view + hero text overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: beat === 3 ? 1 : 0,
        transition: "opacity 0.4s ease-out",
        zIndex: 2,
      }}>
        <img
          src={introSrc}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition,
            transform: beat >= 3 ? "scale(1.0)" : "scale(1.1)",
            transition: "transform 1.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        />

        {/* Gradient overlay for text legibility */}
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? "linear-gradient(to top, oklch(0 0 0 / 0.85) 20%, oklch(0 0 0 / 0.2) 55%, oklch(0 0 0 / 0.6) 100%)"
            : "linear-gradient(to right, oklch(0 0 0 / 0.78) 30%, oklch(0 0 0 / 0.2) 60%, transparent 100%)",
        }} />

        {/* Large hero text — name + agency + tagline */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex",
          alignItems: isMobile ? "flex-end" : "center",
          padding: isMobile ? "0 24px 80px" : "0 0 0 64px",
          zIndex: 3,
        }}>
          <div style={{
            maxWidth: isMobile ? "100%" : 560,
            opacity: beat >= 3 ? 1 : 0,
            transform: beat >= 3 ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s",
          }}>
            <p style={{
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? 10 : 12,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: char.color,
              marginBottom: 10,
            }}>{char.introLabel || char.agency}</p>
            <h1 style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(48px,13vw,64px)" : "clamp(60px,6.5vw,92px)",
              fontWeight: 700,
              color: "oklch(0.98 0 0)",
              margin: "0 0 10px",
              lineHeight: 1.1,
              textShadow: "0 4px 32px oklch(0 0 0 / 0.7)",
            }}>{char.name}</h1>
            <p style={{
              fontFamily: "var(--f-body)",
              fontSize: isMobile ? 14 : 16,
              color: "oklch(1 0 0 / 0.65)",
              marginBottom: 16,
            }}>{char.role}</p>
            <p style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? 17 : 22,
              fontStyle: "italic",
              color: char.color,
              lineHeight: 1.6,
              wordBreak: "keep-all",
              textShadow: "0 2px 16px oklch(0 0 0 / 0.7)",
            }}>&ldquo;{quote}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Chapter label — bottom left, fades in at beat 1 */}
      {char.introLabel && (
        <span style={{
          position: "absolute",
          bottom: "6%",
          left: isMobile ? 20 : 48,
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 10 : 12,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "oklch(0.8 0 0)",
          opacity: beat >= 1 ? 0.55 : 0,
          transition: "opacity 0.5s ease-out 0.2s",
          zIndex: 10,
          pointerEvents: "none",
        }}>{char.introLabel}</span>
      )}

      {/* Skip hint — bottom right */}
      <span style={{
        position: "absolute",
        bottom: "6%",
        right: isMobile ? 20 : 48,
        fontFamily: "var(--f-display-en)",
        fontSize: isMobile ? 9 : 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "oklch(0.5 0 0)",
        opacity: beat >= 1 ? 0.4 : 0,
        transition: "opacity 0.5s ease-out 1s",
        zIndex: 10,
        pointerEvents: "none",
      }}>Tap to skip</span>
    </div>
  );
}
