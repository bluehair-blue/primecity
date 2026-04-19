import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FlowIntro (APR) — snap-cut pair → water dissolve → bed hero
   ------------------------------------------------------------
   Concept: 2개의 focal(좌하/우상)이 "딱, 딱" cut으로 교체된 뒤
   물결이 이미지를 녹여 key 이미지(침대)로 전환된다.
   대각선 관찰 → 물 흐름 → 휴식.

   Sequence: 5900ms total
     0    -  300ms : black (ring opening)
     300  - 1700ms : Beat 1 — intro1 좌하 (25% 75%, scale 1.6) snap-in
     1700 - 3100ms : Beat 2 — intro1 우상 (75% 25%, scale 1.6) snap-cut
     3100 - 4400ms : Beat 3 — water dissolve
                              feTurbulence 왜곡 + intro1 opacity 1→0
                              key opacity 0→1
     4400 - 5400ms : Beat 4 — key hero + hero quote (1s hold)
     5400 - 5900ms : fadeOut → Phase 1 keyVisual

   Snap 연출 원칙: 각 beat별 img를 별도 요소로 분리하고 각자 fixed
   focal에 배치. beat 전환은 opacity 120ms 교체 (사실상 cut).
   object-position 트랜지션 금지 — 부드러운 pan은 "싸구려" 느낌.

   Mobile: SVG filter 없음, CSS wave shimmer fallback.
   zIndex: ring(1) < intro1 beats(2) < key dissolve(3) < vignette(4) < quote(6)
   ══════════════════════════════════════════════════════════ */

const FILTER_ID = "cinemaFlowFilter";

// Beat별 focal — 사용자 확정 (좌하 → 우상 대각선)
const BEAT1_FOCAL = { objectPosition: "25% 75%", scale: 1.6 };
const BEAT2_FOCAL = { objectPosition: "75% 25%", scale: 1.6 };

export default function FlowIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [filterActive, setFilterActive] = useState(!isMobile);
  const rafRef = useRef(null);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const keySrc = char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1700),
      setTimeout(() => setBeat(3), 3100),   // water dissolve
      setTimeout(() => setBeat(4), 4400),   // key hero
      setTimeout(() => setFilterActive(false), 4400),
      setTimeout(() => setFadingOut(true), 5400),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── rAF: water displacement envelope during Beat 3 (desktop only) ──
  // 물결 확산→잦아듦 sin 반주기. MIL ripple의 역방향 패턴 (displacement는 상승→하강).
  useEffect(() => {
    if (isMobile || beat !== 3) return;
    const startMs = performance.now();
    const DURATION = 1300;
    const MAX_SCALE = 56;

    const tick = (now) => {
      const t = Math.min(1, (now - startMs) / DURATION);
      const envelope = Math.sin(t * Math.PI);
      const scale = MAX_SCALE * envelope;
      const filter = document.getElementById(FILTER_ID);
      if (filter) {
        const displacement = filter.querySelector("feDisplacementMap");
        if (displacement) displacement.setAttribute("scale", scale.toFixed(2));
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [beat, isMobile]);

  const commonImg = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
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
      {/* ── SVG filter (desktop, Beat 3 only) ── */}
      {filterActive && !isMobile && (
        <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id={FILTER_ID} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.014 0.022"
                numOctaves="3"
                seed="7"
                result="noise"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}

      {/* ── Opening ring (Beat 0→1) ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: isMobile ? 120 : 180,
          height: isMobile ? 120 : 180,
          marginLeft: isMobile ? -60 : -90,
          marginTop: isMobile ? -60 : -90,
          borderRadius: "50%",
          border: `1.5px solid ${char.color}`,
          boxShadow: `0 0 14px ${char.color}66`,
          opacity: beat === 0 ? 0.7 : 0,
          transform: beat === 0 ? "scale(0.2)" : "scale(1.8)",
          transition: "opacity 0.6s ease-out, transform 0.9s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Beat 1: 좌하 focal (snap in/out) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: BEAT1_FOCAL.objectPosition,
          transform: `scale(${BEAT1_FOCAL.scale})`,
          opacity: beat === 1 ? 1 : 0,
          transition: "opacity 0.12s linear",  // snap cut (120ms = 거의 하드 컷)
          zIndex: 2,
        }}
      />

      {/* ── Beat 2: 우상 focal (snap in, stays through Beat 3 dissolve) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: BEAT2_FOCAL.objectPosition,
          transform: `scale(${BEAT2_FOCAL.scale})`,
          opacity: beat === 2 ? 1 : beat === 3 ? 0 : 0,
          filter: beat === 3 && !isMobile ? `url(#${FILTER_ID})` : "none",
          // Beat 1→2 snap: 120ms. Beat 2→3 dissolve: 1300ms water fade.
          transition: beat === 3
            ? "opacity 1.3s ease-out"
            : "opacity 0.12s linear",
          zIndex: 2,
        }}
      />

      {/* ── Beat 3+: key dissolve-in (underneath intro1 during dissolve) ── */}
      <img
        src={keySrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          opacity: beat >= 3 ? 1 : 0,
          filter: beat === 3 && !isMobile ? `url(#${FILTER_ID})` : "none",
          transform: isMobile && beat === 3 ? "scaleY(1.04) skewX(1deg)" : "none",
          transition: "opacity 1.3s ease-out, transform 1.3s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 3,
        }}
      />

      {/* ── Mobile: water shimmer (Beat 3 fallback for missing SVG filter) ── */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, top: "35%", height: "30%",
            background:
              "linear-gradient(180deg, oklch(0.62 0.20 252 / 0) 0%, oklch(0.62 0.20 252 / 0.18) 50%, oklch(0.62 0.20 252 / 0) 100%)",
            mixBlendMode: "screen",
            opacity: beat === 3 ? 1 : 0,
            transform: beat === 3 ? "translateY(8%)" : "translateY(-10%)",
            transition: "transform 1.3s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease-out",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Vignette (Beat 1+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 25%, oklch(0 0 0 / 0.55) 95%)",
          opacity: beat >= 1 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 4}
      />

      {/* ── CenteredQuote hero (Beat 4+) — 1s hero hold ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 4}
      />

      {/* ── Chapter label (Beat 4+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
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
