import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   GlitchIntro (LSH) — glitch intro → KV zoom pan → hero
   ------------------------------------------------------------
   Concept: 신호가 깨지다 → KV 위에서 아래로 천천히 훑음 → 정착
   Sequence: 5600ms + 500ms fadeOut = 6100ms total
     0    -  300ms : black
     300  - 2400ms : intro1 SHAKES (cinemaGlitchMain)
                     + R/B ghost copies ±15px (screen blend)
                     + scanline + CenteredQuote subtle quoteIndex=0 ("하아… 또?")
     2400 - 4200ms : KV zoom pan top→bottom (cinemaLshPan 1.8s, scale 2.0)
                     + CenteredQuote subtle quoteIndex=1 ("귀찮으니 빨리 끝내.")
     4200 - 5600ms : KV settled (scale 1.0) + hero CenteredQuote quoteIndex=1
     5600 - 6100ms : fadeOut → Phase 1 keyVisual

   Mobile: R ghost only (1 copy ±10px), G channel skipped
   Phase 1 uses cover (no keyVisualFit) → seamless handoff from pan
   ══════════════════════════════════════════════════════════ */
export default function GlitchIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 2400),
      setTimeout(() => setBeat(3), 4200),
      setTimeout(() => setFadingOut(true), 5600),
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
      {/* ════ BEAT 1: GLITCH (intro1) ════ */}

      {/* Main image — shakes via cinemaGlitchMain */}
      <div
        style={{
          position: "absolute", inset: 0,
          opacity: beat === 1 ? 1 : 0,
          animation: beat === 1 ? "cinemaGlitchMain 2.1s ease-out forwards" : "none",
          transition: "opacity 0.3s ease-out",
          zIndex: 2,
        }}
      >
        <img src={introSrc} alt="" style={{ ...commonImg }} />
      </div>

      {/* R ghost — displaced right */}
      <div
        style={{
          position: "absolute", inset: 0,
          transform: beat === 1 ? `translateX(${isMobile ? 10 : 15}px)` : "translateX(0)",
          opacity: beat === 1 ? 0.45 : 0,
          mixBlendMode: "screen",
          animation: beat === 1 ? "cinemaGlitchR 2.1s ease-out forwards" : "none",
          transition: "opacity 0.4s ease-out",
          zIndex: 3, pointerEvents: "none",
        }}
      >
        <img src={introSrc} alt="" style={{ ...commonImg, filter: "hue-rotate(-25deg) saturate(2.0) brightness(1.2)" }} />
      </div>

      {/* B ghost — displaced left (desktop only) */}
      {!isMobile && (
        <div
          style={{
            position: "absolute", inset: 0,
            transform: beat === 1 ? "translateX(-15px)" : "translateX(0)",
            opacity: beat === 1 ? 0.4 : 0,
            mixBlendMode: "screen",
            animation: beat === 1 ? "cinemaGlitchB 2.1s ease-out forwards" : "none",
            transition: "opacity 0.4s ease-out",
            zIndex: 3, pointerEvents: "none",
          }}
        >
          <img src={introSrc} alt="" style={{ ...commonImg, filter: "hue-rotate(195deg) saturate(2.0) brightness(1.1)" }} />
        </div>
      )}

      {/* Scanline (Beat 1) */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0) 0px, oklch(0 0 0 / 0) 3px, oklch(0 0 0 / 0.18) 4px)",
          opacity: beat === 1 ? 0.45 : 0,
          transition: "opacity 0.5s ease-out",
          zIndex: 4, pointerEvents: "none", mixBlendMode: "multiply",
        }}
      />

      {/* ════ BEAT 2: KV PAN (top→bottom, scale 2.0) ════ */}
      <div
        style={{
          position: "absolute", inset: 0,
          overflow: "hidden",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.5s ease-out",
          zIndex: beat >= 2 ? 2 : 0,
        }}
      >
        <img
          src={char.keyVisual}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition,
            animation:
              beat === 2 ? "cinemaLshPan 1.8s cubic-bezier(0.22,1,0.36,1) forwards" :
              beat >= 3 ? "none" : "none",
            transform: beat >= 3 ? "scale(1.0)" : "scale(2.0) translateY(-18%)",
            transition: beat >= 3
              ? "transform 1.0s cubic-bezier(0.22,1,0.36,1)"
              : "none",
          }}
        />
      </div>

      {/* ════ SHARED LAYERS (Beat 2+) ════ */}

      {/* Vignette (Beat 2+) */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.52) 90%)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          zIndex: 5, pointerEvents: "none",
        }}
      />

      {/* Quote[0] "하아… 또?" — Beat 1, glitch sync */}
      <CenteredQuote char={char} isMobile={isMobile} emphasis="subtle" show={beat === 1} quoteIndex={0} glitch />

      {/* Quote[1] "귀찮으니 빨리 끝내." — Beat 2 subtle */}
      <CenteredQuote char={char} isMobile={isMobile} emphasis="subtle" show={beat === 2} quoteIndex={1} />

      {/* Quote[1] hero — Beat 3 (1s hold) */}
      <CenteredQuote char={char} isMobile={isMobile} emphasis="hero" show={beat >= 3} quoteIndex={1} />

      {/* Chapter label (Beat 3+) */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
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

      {/* Skip hint */}
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
