import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FlowIntro (APR) — snap-cut pair → water dissolve → surface
   ------------------------------------------------------------
   Concept: 침대 씬의 두 focal(좌하/우상)이 "딱, 딱" cut으로 교체된 뒤,
   수중 빛과 물결이 이미지를 녹이고, 새 이미지(수중 전설 씬)가 깊은
   곳에서 수면으로 부상한다.
   개인의 평온 → 전설의 현시.

   Sequence: 6400ms total
     0    -  300ms : black (ring opening)
     300  - 1600ms : Beat 1 — intro1 좌하 (25% 75%, scale 1.6) snap-in
     1600 - 2900ms : Beat 2 — intro1 우상 (75% 25%, scale 1.6) snap-cut
     2900 - 4700ms : Beat 3 — water transition (1800ms)
                              intro1: 수면 아래로 가라앉음 (blur↑ brightness↓ scale↑ translateY↓)
                              key   : 깊은 곳에서 부상 (blur↓ brightness↑ scale↓ translateY↑)
                              caustics feTurbulence displacement (수평 0.01 0.05)
                              wave wipe 장식 1회 (블루 밴드 top→bottom)
     4700 - 5900ms : Beat 4 — key hero + hero quote (1.2s breathing)
     5900 - 6400ms : fadeOut → Phase 1 keyVisual

   Snap 연출 원칙: object-position 트랜지션 금지. 별도 img + opacity 120ms 교체.
   Surface 연출 원칙: CSS filter 체이닝 (url + blur + brightness) + transform 연동.

   Mobile: SVG filter 없음, CSS dive-float만 사용.
   zIndex: ring(1) < intro1 beats(2) < key surface(3) < wave wipe(4) < vignette(5) < quote(6)
   ══════════════════════════════════════════════════════════ */

const FILTER_ID = "cinemaFlowFilter";

// Beat별 focal — 좌하 → 우상 대각선 snap
const BEAT1_FOCAL = { objectPosition: "25% 75%", scale: 1.6 };
const BEAT2_FOCAL = { objectPosition: "75% 25%", scale: 1.6 };

// CSS filter 유틸 — SVG caustics + native blur/brightness 체이닝
function buildFilter({ caustics, blur = 0, brightness = 1 }) {
  const parts = [];
  if (caustics) parts.push(`url(#${FILTER_ID})`);
  if (blur > 0) parts.push(`blur(${blur}px)`);
  if (brightness !== 1) parts.push(`brightness(${brightness})`);
  return parts.length ? parts.join(" ") : "none";
}

export default function FlowIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [surfacing, setSurfacing] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [filterActive, setFilterActive] = useState(!isMobile);
  const rafRef = useRef(null);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const keySrc = char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1600),
      setTimeout(() => setBeat(3), 2900),        // water transition begins
      setTimeout(() => setSurfacing(true), 3300), // 400ms in — key starts rising from deep
      setTimeout(() => setBeat(4), 4700),         // key fully surfaced + hero quote
      setTimeout(() => setFilterActive(false), 4700),
      setTimeout(() => setFadingOut(true), 5900),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Caustics displacement envelope (Beat 3, desktop only) ──
  // sin 반주기: 0 → peak(40) → 0 over 1800ms
  useEffect(() => {
    if (isMobile || beat !== 3) return;
    const startMs = performance.now();
    const DURATION = 1800;
    const MAX_SCALE = 40;

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

  // ── 필터 상태 계산 ──
  const introFilter = beat === 3
    ? buildFilter({ caustics: !isMobile, blur: 15, brightness: 0.35 })
    : "none";

  const keyFilter = beat === 3 && !surfacing
    ? buildFilter({ caustics: !isMobile, blur: 20, brightness: 0.4 })
    : beat === 3 && surfacing
    ? buildFilter({ caustics: !isMobile, blur: 0, brightness: 1 })
    : "none";

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
      {/* ── SVG filter (desktop only, Beat 3 active) ── */}
      {filterActive && !isMobile && (
        <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id={FILTER_ID} x="-10%" y="-10%" width="120%" height="120%">
              {/* 수평 방향성 물결 (x 0.01 wider, y 0.05 tighter = 옆으로 흐르는 파동) */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01 0.05"
                numOctaves="2"
                seed="9"
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
          transition: "opacity 0.12s linear",
          zIndex: 2,
        }}
      />

      {/* ── Beat 2: 우상 focal (snap in, then sinks during Beat 3) ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition: BEAT2_FOCAL.objectPosition,
          transform: beat === 3
            ? "scale(1.75) translateY(8%)"            // 수면 아래로 가라앉음
            : `scale(${BEAT2_FOCAL.scale})`,
          opacity: beat === 2 ? 1 : beat === 3 ? 0 : 0,
          filter: introFilter,
          transition: beat === 3
            ? "opacity 1.6s ease-in, filter 1.6s ease-in, transform 1.8s ease-in"
            : "opacity 0.12s linear",
          zIndex: 2,
        }}
      />

      {/* ── Beat 3+: key 이미지 (깊이에서 부상) ── */}
      <img
        src={keySrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          // Beat 3 submerged 초기 → surfacing 트리거 시 surface 상태로 CSS 트랜지션
          transform: beat === 3 && !surfacing
            ? "scale(1.1) translateY(-8%)"            // 깊은 곳 (아래에서 떠오르기 시작)
            : "none",                                  // 수면 위 (surfaced)
          opacity: beat >= 3 ? 1 : 0,
          filter: keyFilter,
          transition: "opacity 1.6s ease-out, filter 1.4s ease-out, transform 1.6s ease-out",
          zIndex: 3,
        }}
      />

      {/* ── Wave wipe 장식 (Beat 3) — 블루 라이트 밴드 top→bottom 1회 스윕 ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 0%, transparent 45%, oklch(0.65 0.18 250 / 0.28) 50%, transparent 55%, transparent 100%)",
          backgroundSize: "100% 300%",
          backgroundPosition: beat === 3 ? "0% 100%" : "0% -100%",
          mixBlendMode: "screen",
          opacity: beat === 3 ? 1 : 0,
          transition: "background-position 1.8s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease-out",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

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

      {/* ── CenteredQuote hero (Beat 4+) — 1.2s hero hold ── */}
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
