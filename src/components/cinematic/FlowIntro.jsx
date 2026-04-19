import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FlowIntro (APR) — underwater pan → water dissolve → bed hero
   ------------------------------------------------------------
   Concept: 카메라가 수중 풀샷 intro1을 따라 흘러가며 3개 포컬을 스쳐
   지나간 뒤, 물결이 이미지를 녹여 key 이미지(침대 위)로 전환한다.
   물의 흐름 = 관찰의 이동 = 장면 전환.

   Sequence: 6500ms + 500ms fadeOut = 7000ms total
     0    -  300ms : black
     300  - 1600ms : Beat 1 — intro1 zoom #1 face (50% 25%, scale 1.55) + quote subtle
     1600 - 2900ms : Beat 2 — intro1 pan #2 body/sleeves (50% 55%, scale 1.55)
     2900 - 4200ms : Beat 3 — intro1 pan #3 right deep (80% 55%, scale 1.55)
     4200 - 5500ms : Beat 4 — water dissolve — feTurbulence 왜곡 + key 페이드 인
                              intro1 opacity 1→0, key opacity 0→1
     5500 - 6500ms : Beat 5 — key 완전 표시 + hero quote (1s breathing)
     6500 - 7000ms : fadeOut → Phase 1 keyVisual

   Mobile: SVG filter 없음, CSS wave (scaleY + skew) + 크로스페이드
   zIndex: ring(1) < intro1 zooms(2) < key fade(3) < vignette(4) < quote(6) < label(10)
   ══════════════════════════════════════════════════════════ */

const FILTER_ID = "cinemaFlowFilter";

export default function FlowIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [filterActive, setFilterActive] = useState(!isMobile);
  const turbulenceRef = useRef(null);
  const rafRef = useRef(null);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const keySrc = char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1600),
      setTimeout(() => setBeat(3), 2900),
      setTimeout(() => setBeat(4), 4200),
      setTimeout(() => setBeat(5), 5500),
      setTimeout(() => setFilterActive(false), 5500),
      setTimeout(() => setFadingOut(true), 6500),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── rAF: water turbulence sweep during Beat 4 (desktop only) ──
  // RippleIntro는 baseFrequency를 decay 시켰지만, Flow는 반대로
  // displacement scale을 상승→하강시켜 "물결이 확산됐다가 잦아듦"을 연출.
  useEffect(() => {
    if (isMobile || beat !== 4 || !turbulenceRef.current) return;
    const startMs = performance.now();
    const DURATION = 1300; // Beat 4 full length
    const MAX_SCALE = 48;  // peak displacement

    const tick = (now) => {
      const t = Math.min(1, (now - startMs) / DURATION);
      // 상승→하강 곡선 (sin 반주기)
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

  // ── 포컬 포인트 정의 ──
  // TODO(user): intro1.webp의 실제 구도에 맞춰 튜닝 필요.
  // 현재 기본값은 수중 landscape 기준 face(상단중앙) → body(중앙) → right-deep(우측).
  const focals = [
    { objectPosition: "50% 25%", scale: 1.55 },  // Beat 1: 얼굴
    { objectPosition: "50% 55%", scale: 1.55 },  // Beat 2: 몸통/소매
    { objectPosition: "80% 55%", scale: 1.55 },  // Beat 3: 우측 깊이
  ];

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
      {/* ── SVG filter def (desktop, Beat 4 only) ── */}
      {filterActive && !isMobile && (
        <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id={FILTER_ID} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                ref={turbulenceRef}
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

      {/* ── Opening ripple ring (Beat 0→1) ── */}
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

      {/* ── Beat 1~3: intro1 pan/zoom layer (단일 img, focal 변경) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: beat >= 1 && beat <= 3
            ? focals[beat - 1].objectPosition
            : focals[0].objectPosition,
          transform: beat >= 1 && beat <= 3
            ? `scale(${focals[beat - 1].scale})`
            : "scale(1.55)",
          opacity: beat >= 1 && beat <= 4 ? 1 : 0,
          filter: beat === 4 && !isMobile ? `url(#${FILTER_ID})` : "none",
          transition:
            "opacity 0.6s ease-out, object-position 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 2,
        }}
      />

      {/* ── Beat 4+: key 이미지 dissolve-in ── */}
      <img
        src={keySrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          opacity: beat >= 4 ? (beat === 4 ? 0.6 : 1) : 0,
          filter: beat === 4 && !isMobile ? `url(#${FILTER_ID})` : "none",
          transform: isMobile && beat === 4 ? "scaleY(1.04) skewX(1deg)" : "none",
          transition:
            "opacity 1.3s ease-out, transform 1.3s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 3,
        }}
      />

      {/* ── Mobile: water wave shimmer (Beat 4 fallback) ── */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, top: "35%", height: "30%",
            background:
              "linear-gradient(180deg, oklch(0.62 0.20 252 / 0) 0%, oklch(0.62 0.20 252 / 0.18) 50%, oklch(0.62 0.20 252 / 0) 100%)",
            mixBlendMode: "screen",
            opacity: beat === 4 ? 1 : 0,
            transform: beat === 4 ? "translateY(8%)" : "translateY(-10%)",
            transition: "transform 1.3s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease-out",
            zIndex: 3,
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
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~4) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 5}
      />

      {/* ── CenteredQuote hero (Beat 5+) — 1s hold before fadeOut ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 5}
      />

      {/* ── Chapter label (Beat 5+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 5 ? 0.6 : 0,
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
