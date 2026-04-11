import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — v5 재설계 (2026-04-12, 7.9초 압축판)
   ------------------------------------------------------------
   컨셉: 유기체 안개 3층 + 3점 의미 있는 줌인 + RGB 분리 reveal

   Timeline: 7400ms + 500ms fadeOut = 7900ms (모든 hold ≥ 1100ms)
     0    -  100  : black
     100  - 1800  : 짙은 안개 + 미소 줌인 + quote[0] subtle         [hold 1100]
     1800 - 3400  : 안개 1파 걷힘 + 시계 줌인 + signature pulse     [hold 1100]
     3400 - 5000  : 안개 재확산 + 이어폰 줌인 + signature pulse     [hold 1100]
     5000 - 6700  : 줌아웃 + chromatic aberration + quote[0→1]      [hold 1100]
     6700 - 7400  : quote[1] hero + vignette + chapter label
     7400 - 7900  : fadeOut → Phase 1

   zIndex 체인:
     kvStage(2) - kvMask(3) - fogA-svg(4) - fogB(5) - fogC(6)
     sigPulse(7) - bgMarquee(8) - vignette(9) - CenteredQuote(internal)
     label(10) - skip(10)
   ══════════════════════════════════════════════════════════ */

// 줌 포인트 — NHR/key.webp 실물 확인 후 미세 조정 가능
const ZOOM_POINTS = {
  desktop: {
    1: { pos: "50% 28%", scale: 2.0 },  // 입꼬리/미소
    2: { pos: "38% 62%", scale: 2.1 },  // 손목시계
    3: { pos: "62% 24%", scale: 2.0 },  // 한쪽 이어폰
    4: { pos: "50% 35%", scale: 1.0 },  // 전체 (focusBox cx/cy)
  },
  mobile: {
    1: { pos: "50% 32%", scale: 1.9 },
    2: { pos: "42% 65%", scale: 2.0 },
    3: { pos: "58% 28%", scale: 1.9 },
    4: { pos: "50% 30%", scale: 1.0 },
  },
};

// 시그니처 pulse 위치 — beat 2 (watch) / beat 3 (earphone)
const SIG_POS = {
  desktop: {
    2: { left: "38%", top: "43%", size: 180 },
    3: { left: "62%", top: "17%", size: 160 },
  },
  mobile: {
    2: { left: "42%", top: "45%", size: 140 },
    3: { left: "58%", top: "20%", size: 120 },
  },
};

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1),  100),
      setTimeout(() => setBeat(2), 1800),
      setTimeout(() => setBeat(3), 3400),
      setTimeout(() => setBeat(4), 5000),
      setTimeout(() => setBeat(5), 6700),
      setTimeout(() => setFadingOut(true), 7400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const zoomTable = ZOOM_POINTS[isMobile ? "mobile" : "desktop"];
  const sigTable = SIG_POS[isMobile ? "mobile" : "desktop"];
  const currentZoom = zoomTable[Math.min(Math.max(beat, 1), 4)] || zoomTable[1];

  // 이미지 saturation/brightness : 안개 속 저채도 → reveal 복원
  const imageFilter =
    beat <= 1 ? "saturate(0.35) brightness(0.6)" :
    beat === 2 ? "saturate(0.55) brightness(0.75)" :
    beat === 3 ? "saturate(0.55) brightness(0.75)" :
    beat === 4 ? "saturate(0.9) brightness(0.95)" :
    "saturate(1.0) brightness(1.0)";

  // 안개 3층 밀도 (beat 1~4 엇갈린 감쇠)
  const fogA = beat === 1 ? 0.92 : beat === 2 ? 0.58 : beat === 3 ? 0.68 : beat === 4 ? 0.15 : 0.05;
  const fogB = beat === 1 ? 0.78 : beat === 2 ? 0.45 : beat === 3 ? 0.52 : beat === 4 ? 0.12 : 0.05;
  const fogC = beat === 1 ? 0.62 : beat === 2 ? 0.35 : beat === 3 ? 0.40 : beat === 4 ? 0.08 : 0.04;

  // RGB chromatic aberration (beat 4 peak → 수렴)
  const ca = beat === 4 ? 2.5 : 0;

  // 이미지 transition: beat별 속도 분리 (압축판)
  const imgTransition =
    beat === 4
      ? "transform 0.6s cubic-bezier(0.22,1,0.36,1), object-position 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease-out"
      : beat >= 2
      ? "transform 0.5s cubic-bezier(0.33,1,0.68,1), object-position 0.5s cubic-bezier(0.33,1,0.68,1), filter 0.5s ease-out"
      : "transform 0.6s ease-out, object-position 0.6s ease-out, filter 0.6s ease-out, opacity 0.55s ease-out";

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
      {/* ── KV STAGE: top 70%, bottom 30% 네거티브 스페이스 ── */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "70%",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        {/* Base KV image (ca=0 때만 표시) */}
        <img
          src={char.keyVisual}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: currentZoom.pos,
            transform: `scale(${currentZoom.scale})`,
            transformOrigin: currentZoom.pos,
            filter: imageFilter,
            opacity: beat >= 1 ? (ca > 0 ? 0 : 1) : 0,
            transition: imgTransition,
            willChange: "transform",
          }}
        />

        {/* Chromatic aberration RGB 3-layer (beat 4 only) */}
        {ca > 0 && ["R", "G", "B"].map((channel, i) => {
          const dx = (i - 1) * ca; // -ca, 0, +ca
          const hue = channel === "R" ? 0 : channel === "G" ? 120 : 240;
          return (
            <img
              key={channel}
              src={char.keyVisual}
              alt=""
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: currentZoom.pos,
                transform: `scale(${currentZoom.scale}) translate(${dx}px, 0)`,
                transformOrigin: currentZoom.pos,
                filter: `hue-rotate(${hue}deg) saturate(1.3) brightness(0.95)`,
                mixBlendMode: "screen",
                opacity: 0.45,
                transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* KV 하단 dissipate mask (이미지 → 블랙 자연 전환) */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "35%",
            background: "linear-gradient(to bottom, transparent 0%, oklch(0 0 0) 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </div>

      {/* ══ 유기체 안개 Layer A — SVG feTurbulence (볼륨 있는 수증기) ══ */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: fogA,
          transition: "opacity 1.2s ease-out",
          mixBlendMode: "screen",
          zIndex: 4,
          pointerEvents: "none",
          animation: beat >= 1 ? "cinemaFogBreathe 22s ease-in-out infinite alternate" : "none",
        }}
      >
        <defs>
          <filter id="nhrFogTurb" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="50" />
            <feGaussianBlur stdDeviation="18" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.85   0 0 0 0 0.82   0 0 0 0 0.92   0 0 0 0.9 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="oklch(0.85 0.04 310)" filter="url(#nhrFogTurb)" />
      </svg>

      {/* ══ 유기체 안개 Layer B — 중경 violet drift ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(135deg, oklch(0.85 0.03 310 / 0.95) 0%, oklch(0.70 0.05 300 / 0.4) 50%, oklch(0.85 0.03 310 / 0.95) 100%)",
          backgroundSize: "220% 220%",
          opacity: fogB,
          animation: beat >= 1 ? "cinemaFogDrift1 18s linear infinite" : "none",
          transition: "opacity 1.2s ease-out",
          mixBlendMode: "screen",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ══ 유기체 안개 Layer C — 후경 cool-blue drift ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(-45deg, oklch(0.70 0.04 280 / 0.8) 0%, oklch(0.55 0.06 280 / 0.2) 50%, oklch(0.70 0.04 280 / 0.8) 100%)",
          backgroundSize: "180% 180%",
          opacity: fogC,
          animation: beat >= 1 ? "cinemaFogDrift2 14s linear infinite" : "none",
          transition: "opacity 1.2s ease-out",
          mixBlendMode: "screen",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />

      {/* ══ 시그니처 글로우 pulse — beat 2 (watch) / beat 3 (earphone) ══ */}
      {(beat === 2 || beat === 3) && (
        <div
          key={`sig-${beat}`}
          style={{
            position: "absolute",
            left: sigTable[beat].left,
            top: sigTable[beat].top,
            width: sigTable[beat].size,
            height: sigTable[beat].size,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(closest-side, ${char.color} 0%, transparent 65%)`,
            mixBlendMode: "screen",
            animation: "cinemaSignaturePulse 1.2s ease-in-out 2",
            zIndex: 7,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ bgMarquee — 네거티브 스페이스 채움 (bottom 30%) ══ */}
      {beat >= 1 && (
        <div
          style={{
            position: "absolute", bottom: "8%", left: 0,
            display: "flex", width: "200%",
            animation: "bgMarquee 45s linear infinite",
            pointerEvents: "none",
            zIndex: 8,
            opacity: beat === 4 ? 0.10 : 0.05,
            transition: "opacity 1s ease-out",
          }}
        >
          {[1, 2].map((k) => (
            <div
              key={k}
              style={{
                flex: "0 0 50%",
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? 36 : 64,
                letterSpacing: "0.2em",
                color: "oklch(0.85 0.03 310)",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              NAHARIN · ENIGMA · MIST · NAHARIN · ENIGMA · MIST ·{" "}
            </div>
          ))}
        </div>
      )}

      {/* ══ Vignette (beat 5+) ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.6) 90%)",
          opacity: beat >= 5 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 9,
          pointerEvents: "none",
        }}
      />

      {/* ══ CenteredQuote — quote[0] "후후..." subtle (beat 1~3) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat <= 3}
        quoteIndex={0}
      />

      {/* ══ CenteredQuote — quote[1] "잘 부탁해?" subtle (beat 4) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 4}
        quoteIndex={1}
      />

      {/* ══ CenteredQuote — quote[1] "잘 부탁해?" hero (beat 5+) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 5}
        quoteIndex={1}
      />

      {/* ══ Chapter label (beat 5+) ══ */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 5 ? 0.6 : 0,
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
          position: "absolute", bottom: "2.5%", right: isMobile ? 16 : 32,
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
