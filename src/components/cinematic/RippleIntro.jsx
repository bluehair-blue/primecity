import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   RippleIntro (MIL) — SVG turbulence ripple decay
   ------------------------------------------------------------
   Concept: 음파 고리 하나 → 물결(turbulence) 일렁임 → 잠잠해짐
   Sequence: 3500ms + 500ms fadeOut = 4000ms total
     0    -  400ms : black + expanding sonic ring (scale 0.3→1.4)
     400  - 2800ms : intro1 + SVG feTurbulence (desktop, baseFreq 0.018→0 via rAF)
                     mobile fallback: scaleY(1.03→1.0) + specular sweep
                     CenteredQuote subtle
     2800 - 3500ms : ripple gone, hero CenteredQuote
     3500 - 4000ms : fadeOut → Phase 1 keyVisual

   Mobile: SVG filter 완전 제거, CSS scaleY + light sweep 만 사용
   Desktop: SVG <filter> 언마운트 시 filterActive = false (메모리 정리)

   zIndex chain:
     sonic-ring(1) < intro-img(2) < mobile-sweep(3) < vignette(4) < CenteredQuote(6) < label(10)
   ══════════════════════════════════════════════════════════ */

const FILTER_ID = "cinemaRippleFilter";

export default function RippleIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [filterActive, setFilterActive] = useState(!isMobile);
  const turbulenceRef = useRef(null);
  const rafRef = useRef(null);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 400),
      setTimeout(() => setBeat(2), 2800),
      setTimeout(() => { setFilterActive(false); }, 3500),
      setTimeout(() => setFadingOut(true), 3500),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── rAF: decay baseFrequency during Beat 1 (desktop only) ──
  useEffect(() => {
    if (isMobile || beat !== 1 || !turbulenceRef.current) return;
    const startMs = performance.now();
    const DURATION = 2400;
    const START_BF = 0.018;

    const tick = (now) => {
      const t = Math.min(1, (now - startMs) / DURATION);
      // easeOutCubic — 초반 빠른 감쇠, 후반 느긋하게 정착
      const eased = 1 - Math.pow(1 - t, 3);
      const bf = START_BF * (1 - eased);
      if (turbulenceRef.current) {
        turbulenceRef.current.setAttribute("baseFrequency", bf.toFixed(5));
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [beat, isMobile]);

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
      {/* ── SVG filter def (desktop, Beat 0~1, unmounts when filterActive=false) ── */}
      {filterActive && !isMobile && (
        <svg
          width="0"
          height="0"
          style={{ position: "absolute", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <defs>
            <filter id={FILTER_ID} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0.018"
                numOctaves="2"
                seed="5"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="22"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* ── Sonic ring (Beat 0 → fades by Beat 1) ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: isMobile ? 120 : 180,
          height: isMobile ? 120 : 180,
          marginLeft: isMobile ? -60 : -90,
          marginTop: isMobile ? -60 : -90,
          borderRadius: "50%",
          border: `1.5px solid ${char.color}`,
          boxShadow: `0 0 12px ${char.color}55`,
          opacity: beat === 0 ? 0.8 : 0,
          transform: beat === 0 ? "scale(0.3)" : "scale(1.5)",
          transition: "opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── intro1 image with SVG filter (desktop) or plain (mobile) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          filter:
            filterActive && !isMobile ? `url(#${FILTER_ID})` : "none",
          transform: isMobile
            ? (beat === 1 ? "scaleY(1.0)" : "scaleY(1.03)")
            : "none",
          opacity: beat >= 1 ? 1 : 0,
          transition:
            "opacity 0.5s ease-out, " +
            "transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 2,
        }}
      />

      {/* ── Mobile: specular highlight sweep (Beat 1, top→bottom) ── */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "28%",
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0) 0%, oklch(1 0 0 / 0.22) 50%, oklch(1 0 0 / 0) 100%)",
            mixBlendMode: "screen",
            opacity: beat === 1 ? 1 : 0,
            top: beat === 1 ? "65%" : "0%",
            transition:
              "top 2.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease-out",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Vignette for hero legibility (Beat 2+) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 90%)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 1}
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
            position: "absolute",
            bottom: "7%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 2 ? 0.6 : 0,
            transition: "opacity 0.6s ease-out 0.4s",
            zIndex: 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {char.introLabel}
        </span>
      )}

      {/* ── Skip hint ── */}
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
