import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   SunriseIntro (KHR) — phone camera UI → film photo print
   ------------------------------------------------------------
   Concept: 스마트폰 카메라가 KHR을 촬영 → 필름 사진으로 현상
   Sequence: 4400ms + 500ms fadeOut = 4900ms total
     0    -  300 : dark → camera UI frame appears
     300  -  900 : intro1 reveal + focus scan BOTTOM (하체)
     900  - 1600 : focus pan to TOP (얼굴/상체) + quote subtle
     1600 - 2300 : focus expand FULL FRAME + focus lock + char.color
     2300 - 2450 : shutter iris wipe + white flash
     2450 - 4000 : key.webp film developing (translateY↑ + filter developing)
     4000 - 4400 : stable — hero quote
     4400 - 4900 : fadeOut → Phase 1 keyVisual (contain)

   zIndex chain:
     camera-layer (beat0~4): img(1) grid(2) vignette(2) hud+focus(3)
     shutter(10) flash(11)
     film-key(5) grain(6) dark-vignette(7)
     CenteredQuote(6 inside layer) / (8 for film beats)
     label(10) skip(10)
   ══════════════════════════════════════════════════════════ */

// objectPosition per beat for pan effect
const OBJ_POS = {
  1: "50% 85%",  // 하체
  2: "50% 20%",  // 얼굴/상체
  3: "50% 50%",  // 전체
};

export default function SunriseIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [focusLocked, setFocusLocked] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const introObjPos = beat >= 1 ? (OBJ_POS[Math.min(beat, 3)] || "50% 85%") : "50% 85%";

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1),          300),
      setTimeout(() => setBeat(2),          900),
      setTimeout(() => setBeat(3),          1600),
      setTimeout(() => setFocusLocked(true),2100),  // lock overlaps quote
      setTimeout(() => setBeat(4),          2300),
      setTimeout(() => setBeat(5),          2450),
      setTimeout(() => setBeat(6),          4000),
      setTimeout(() => setFadingOut(true),  4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Focus rect geometry — all as px so transition works uniformly
  // beat 3: expand to almost full frame using large px values
  const frameW = isMobile ? 390 : 1200;  // generous upper bound
  const frameH = isMobile ? 780 : 800;

  const focusStyle = beat >= 3
    ? {
        top: "6%", left: "6%",
        width: "88%", height: "88%",
        // use percentages for full-frame so it's always viewport-relative
      }
    : beat === 2
    ? {
        top: isMobile ? "12%" : "10%",
        left: isMobile ? "32%" : "35%",
        width: isMobile ? 110 : 140,
        height: isMobile ? 120 : 150,
      }
    : {
        // beat 1 — bottom focus
        top: isMobile ? "62%" : "58%",
        left: isMobile ? "28%" : "30%",
        width: isMobile ? 120 : 160,
        height: isMobile ? 75 : 95,
      };

  const cameraLayerOpacity = beat >= 5 ? 0 : 1;

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
      {/* ══ CAMERA LAYER (Beat 0~4, fades out at Beat 5) ══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cameraLayerOpacity,
          transition: "opacity 0.4s ease-out",
          zIndex: cameraLayerOpacity > 0 ? 4 : 0,
          pointerEvents: "none",
        }}
      >
        {/* intro1 image — immediate reveal, pans via objectPosition */}
        <img
          src={introSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: introObjPos,
            opacity: beat >= 1 ? 1 : 0,
            transition: "opacity 0.3s ease-out, object-position 0.7s ease-in-out",
            zIndex: 1,
          }}
        />

        {/* Camera grid 3×3 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.18) 1px, transparent 1px), " +
              "linear-gradient(90deg, oklch(1 0 0 / 0.18) 1px, transparent 1px)",
            backgroundSize: "33.33% 33.33%",
            opacity: beat >= 1 && beat <= 3 ? 0.55 : 0,
            transition: "opacity 0.5s ease-out",
            pointerEvents: "none",
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 50%, oklch(0 0 0 / 0.4) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Camera HUD — top bar */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? 12 : 16,
            left: isMobile ? 14 : 20,
            right: isMobile ? 14 : 20,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 9 : 11,
            letterSpacing: "0.07em",
            color: "oklch(1 0 0 / 0.72)",
            opacity: beat >= 1 && beat <= 3 ? 1 : 0,
            transition: "opacity 0.4s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <span>f/1.8  1/1000  ISO 100</span>
          <span style={{ color: focusLocked ? char.color : "oklch(1 0 0 / 0.72)" }}>
            {focusLocked ? "● LOCKED" : `● REC  00:0${Math.max(0, beat)}`}
          </span>
        </div>

        {/* Focus rectangle */}
        {beat >= 1 && beat <= 3 && (
          <div
            style={{
              position: "absolute",
              top: focusStyle.top,
              left: focusStyle.left,
              width: typeof focusStyle.width === "number"
                ? `${focusStyle.width}px`
                : focusStyle.width,
              height: typeof focusStyle.height === "number"
                ? `${focusStyle.height}px`
                : focusStyle.height,
              border: `1.5px solid ${focusLocked ? char.color : "oklch(1 0 0 / 0.85)"}`,
              boxShadow: focusLocked
                ? `0 0 12px ${char.color}88, 0 0 4px ${char.color}55`
                : "none",
              transition:
                "top 0.65s ease-in-out, left 0.65s ease-in-out, " +
                "width 0.65s ease-in-out, height 0.65s ease-in-out, " +
                "border-color 0.3s, box-shadow 0.3s",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
        )}

        {/* AF locked label */}
        {focusLocked && beat <= 4 && (
          <span
            style={{
              position: "absolute",
              top: beat >= 3 ? "5%" : "57%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? 9 : 10,
              letterSpacing: "0.15em",
              color: char.color,
              textShadow: `0 0 8px ${char.color}99`,
              transition: "top 0.5s ease-in-out",
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            AF ●
          </span>
        )}
      </div>

      {/* ══ SHUTTER iris wipe (Beat 4) ══ */}
      {beat === 4 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "oklch(0 0 0)",
            animation: "cinemaIrisWipe 0.15s ease-in-out forwards",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ WHITE FLASH (Beat 4) ══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(1 0 0)",
          opacity: beat === 4 ? 1 : 0,
          transition: beat === 4
            ? "opacity 0.04s linear"
            : "opacity 0.12s linear",
          zIndex: 11,
          pointerEvents: "none",
        }}
      />

      {/* ══ FILM DEVELOPING: key.webp (Beat 4+ offscreen, develops Beat 5+) ══ */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: char.keyVisualFit || "cover",
          objectPosition: "50% 50%",
          transform: beat >= 5 ? "translateY(0)" : "translateY(100%)",
          filter: beat >= 5
            ? "brightness(1) saturate(1)"
            : "brightness(3) saturate(0)",
          opacity: beat >= 4 ? 1 : 0,
          transition: beat >= 5
            ? "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), filter 1.6s ease-out"
            : "opacity 0.05s",
          zIndex: 5,
        }}
      />

      {/* ══ FILM GRAIN overlay (Beat 5, fades out) ══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E\")",
          opacity: beat === 5 ? 0.28 : 0,
          mixBlendMode: "overlay",
          transition: "opacity 1.4s ease-out",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />

      {/* ══ DARK VIGNETTE for hero legibility (Beat 5+) ══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 90%)",
          opacity: beat >= 5 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 7,
          pointerEvents: "none",
        }}
      />

      {/* ══ CenteredQuote SUBTLE (Beat 2~4) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 2 && beat < 5}
      />

      {/* ══ CenteredQuote HERO (Beat 5+) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 5}
      />

      {/* ══ Chapter label (Beat 6+) ══ */}
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
            opacity: beat >= 6 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ══ Skip hint ══ */}
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
