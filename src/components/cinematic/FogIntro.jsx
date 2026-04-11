import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — TV static noise → zoom-out reveal → hero
   ------------------------------------------------------------
   Concept: 지직거리는 전파 노이즈 속에 모습을 드러내는 NHR
   Sequence: 3500ms + 500ms fadeOut = 4000ms total

     0    -  300ms : black + noise primed (seed rAF starts)
     300  - 1400ms : KV scale(1.45) low-sat + strong TV static + "후후..." subtle
     1400 - 1900ms : pause — noise weakens, KV stays zoomed, quote fades
     1900 - 3100ms : "잘 부탁해?" subtle + KV scale(1.45→1.0) unfurl + color restore
     3100 - 3500ms : "잘 부탁해?" hero + vignette + stable
     3500 - 4000ms : fadeOut → Phase 1

   Noise: SVG feTurbulence seed randomized per rAF frame (60fps static)
   Zoom : transformOrigin=objectPosition → character face stays anchored
   zIndex: img(2) < noise(3) < scanline(4) < vignette(5) < CenteredQuote(6) < label(10)
   ══════════════════════════════════════════════════════════ */

const NOISE_ID = "nhrStaticNoise";

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const noiseSeedRef = useRef(null);
  const noiseRafRef = useRef(null);

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),   // KV + noise burst + "후후..."
      setTimeout(() => setBeat(2), 1400),  // pause — noise subsides
      setTimeout(() => setBeat(3), 1900),  // "잘 부탁해?" + zoom-out unfurl
      setTimeout(() => setBeat(4), 3100),  // hero
      setTimeout(() => setFadingOut(true), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── rAF: randomize noise seed every frame (beats 1~2 only) ──
  useEffect(() => {
    if (beat < 1 || beat >= 3) {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
      return;
    }
    const tick = () => {
      if (noiseSeedRef.current) {
        noiseSeedRef.current.setAttribute("seed", Math.floor(Math.random() * 9999));
      }
      noiseRafRef.current = requestAnimationFrame(tick);
    };
    noiseRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
    };
  }, [beat]);

  // Image scale: zoomed in (1.45) → full reveal (1.0) at beat 3
  const imgScale = beat >= 3 ? 1.0 : 1.45;

  // Image filter: low-sat during noise → color restore on unfurl
  const imageFilter =
    beat <= 2
      ? "saturate(0.3) brightness(0.65)"
      : beat === 3
      ? "saturate(0.85) brightness(0.95)"
      : "saturate(1.0) brightness(1.0)";

  // TV static overlay opacity
  const noiseOpacity =
    beat === 0 ? 0.2 :
    beat === 1 ? 0.55 :
    beat === 2 ? 0.18 :
    0;

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
      {/* ── SVG static noise filter — seed randomized via rAF ── */}
      <svg
        width="0" height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id={NOISE_ID} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              ref={noiseSeedRef}
              type="turbulence"
              baseFrequency="0.65"
              numOctaves="1"
              seed="1"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* ── Key visual: zoomed in → zoom-out reveal ── */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${imgScale})`,
          transformOrigin: objectPosition,
          filter: imageFilter,
          opacity: beat >= 1 ? 1 : 0,
          transition: beat >= 3
            ? "transform 1.2s cubic-bezier(0.22,1,0.36,1), filter 1.2s ease-out, opacity 0.5s ease-out"
            : "opacity 0.4s ease-out, filter 0.4s ease-out",
          zIndex: 2,
          willChange: "transform",
        }}
      />

      {/* ── TV static noise overlay (filter output replaces div rendering) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          filter: `url(#${NOISE_ID})`,
          background: "oklch(0.5 0 0)",  // gray canvas for turbulence
          opacity: noiseOpacity,
          mixBlendMode: "overlay",
          transition: "opacity 0.6s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Scanline overlay (CRT effect, beats 1~2) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0) 0px, oklch(0 0 0 / 0) 2px, oklch(0 0 0 / 0.15) 3px)",
          opacity: beat === 1 ? 0.65 : beat === 2 ? 0.2 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Vignette for hero legibility (Beat 4) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 4 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── Quote[0] "후후..." subtle — Beat 1 only ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
        quoteIndex={0}
      />

      {/* ── Quote[1] "잘 부탁해?" subtle — Beat 3, during zoom-out ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 3}
        quoteIndex={1}
      />

      {/* ── Quote[1] "잘 부탁해?" hero — Beat 4 ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 4}
        quoteIndex={1}
      />

      {/* ── Chapter label (Beat 4+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 4 ? 0.6 : 0,
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
