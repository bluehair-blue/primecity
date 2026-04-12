import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   WindIntro (HSR) — 바람 흩날리는 사무실
   ------------------------------------------------------------
   컨셉: 바람이 일다 → 정점 → 잠잠해지며 한소리 리빌
   KV: 팔짱 낀 한소리 + 종이 흩날리는 사무실 내부

   Timeline: 9000ms + 800ms fadeOut = 9800ms (v2: 여유 확보 + flash 전환)
     0    -  150  : black
     150  - 2150  : beat 1 — 책상·팔짱 zoom (30% 61%), wind starts, quote[0]  [hold 1400]
     2150 - 4150  : beat 2 — 종이·바람 zoom (75% 49%), wind peak, pulse       [hold 1400]
     4150 - 6150  : beat 3 — 얼굴·표정 zoom (51% 34%), wind sustain          [hold 1400]
     6150 - 8150  : beat 4 — contain reveal (1.5s cross-fade), quote[1]      [hold 1400]
     8150 - 9000  : beat 5 — hero + vignette + label
     9000 - 9800  : fadeOut (0.8s) → Phase 1

   zIndex:
     sway-wrapper + Layer A cover zoom (2)
     edge flutter ghost (3)
     Layer B contain (4)
     wind streaks (5)
     paper + dust particles (6)
     signature pulse (7)
     vignette (8)
     CenteredQuote (internal 6)
     label / skip (10)
   ══════════════════════════════════════════════════════════ */

// 줌 좌표 — 이미지 좌표 (center=0,0) → objectPosition % 변환 완료
// 원본: (-302,144)→30%61%, (376,-15)→75%49%, (21,-209)→51%34%
const ZOOM_BEATS = {
  desktop: {
    1: { pos: "30% 61%", scale: 1.15 },  // 책상·팔짱·서류 (좌하)
    2: { pos: "75% 49%", scale: 1.20 },  // 흩날리는 종이·바람 (우측)
    3: { pos: "51% 34%", scale: 1.10 },  // 얼굴·표정·머리카락 (중앙상단)
  },
  mobile: {
    1: { pos: "32% 58%", scale: 1.12 },
    2: { pos: "70% 50%", scale: 1.18 },
    3: { pos: "50% 36%", scale: 1.08 },
  },
};

// 종이 파티클 — 마름모/사각형 형태, 좌→우 드리프트
const PAPERS = [
  { top: 6,  size: 12, rotation: 42,  dur: 2.8, delay: 0,    opacity: 0.55 },
  { top: 18, size: 8,  rotation: -18, dur: 3.6, delay: 0.4,  opacity: 0.38 },
  { top: 32, size: 15, rotation: 65,  dur: 2.2, delay: 0.9,  opacity: 0.62 },
  { top: 45, size: 9,  rotation: -35, dur: 3.9, delay: 0.2,  opacity: 0.32 },
  { top: 56, size: 13, rotation: 52,  dur: 2.5, delay: 0.6,  opacity: 0.48 },
  { top: 67, size: 7,  rotation: -50, dur: 4.1, delay: 1.1,  opacity: 0.28 },
  { top: 78, size: 11, rotation: 22,  dur: 3.0, delay: 0.35, opacity: 0.42 },
  { top: 90, size: 14, rotation: -62, dur: 2.7, delay: 0.75, opacity: 0.52 },
];

// 먼지 파티클 — box-shadow 군집 (single DOM element)
const DUST_SHADOW = [
  "18vw 12vh 0 1px oklch(1 0 0 / 0.14)",
  "45vw 28vh 0 0.5px oklch(1 0 0 / 0.10)",
  "8vw 55vh 0 1px oklch(1 0 0 / 0.12)",
  "62vw 8vh 0 0.5px oklch(1 0 0 / 0.08)",
  "30vw 72vh 0 1px oklch(1 0 0 / 0.11)",
  "78vw 40vh 0 0.5px oklch(1 0 0 / 0.09)",
  "52vw 85vh 0 1px oklch(1 0 0 / 0.13)",
  "15vw 38vh 0 0.5px oklch(1 0 0 / 0.07)",
  "88vw 62vh 0 1px oklch(1 0 0 / 0.10)",
  "40vw 18vh 0 0.5px oklch(1 0 0 / 0.12)",
  "70vw 75vh 0 1px oklch(1 0 0 / 0.08)",
  "25vw 92vh 0 0.5px oklch(1 0 0 / 0.11)",
].join(", ");

// 바람 줄기 — 얇은 가로선 7개
const STREAKS = [
  { top: 8,  width: 1.0, speed: 2.8, delay: 0,    alpha: 0.10 },
  { top: 19, width: 1.5, speed: 2.2, delay: 0.3,  alpha: 0.13 },
  { top: 33, width: 0.8, speed: 3.2, delay: 0.7,  alpha: 0.08 },
  { top: 46, width: 1.2, speed: 2.5, delay: 0.15, alpha: 0.11 },
  { top: 58, width: 1.8, speed: 2.0, delay: 0.5,  alpha: 0.14 },
  { top: 72, width: 1.0, speed: 3.0, delay: 0.85, alpha: 0.09 },
  { top: 86, width: 1.4, speed: 2.4, delay: 0.4,  alpha: 0.12 },
];

export default function WindIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1),  150),
      setTimeout(() => setBeat(2), 2150),
      setTimeout(() => setBeat(3), 4150),
      setTimeout(() => setBeat(4), 6150),
      setTimeout(() => setBeat(5), 8150),
      setTimeout(() => setFadingOut(true), 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const zoomTable = ZOOM_BEATS[isMobile ? "mobile" : "desktop"];
  const currentZoom = zoomTable[Math.min(Math.max(beat, 1), 3)] || zoomTable[1];

  const isWindBeat = beat >= 1 && beat <= 3;
  const isReveal = beat >= 4;

  // 바람 세기 (0~1) — beat 별 곡선
  const windLevel =
    beat === 1 ? 0.5 :
    beat === 2 ? 1.0 :
    beat === 3 ? 0.65 :
    beat === 4 ? 0.15 :
    0;

  // sway 애니메이션 선택 (강약)
  const swayAnim =
    beat === 2 ? "cinemaHsrSwayStrong 2s ease-in-out infinite"
    : isWindBeat ? "cinemaHsrSway 3.2s ease-in-out infinite"
    : "none";

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.8s ease-out",
      }}
    >
      {/* ══ Layer A: 줌 클로즈업 (beats 1~3) — sway wrapper ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          animation: swayAnim,
          opacity: isReveal ? 0 : 1,
          transition: "opacity 1.5s ease-out",
          zIndex: 2,
        }}
      >
        <img
          src={introSrc}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: currentZoom.pos,
            transform: `scale(${currentZoom.scale})`,
            transformOrigin: currentZoom.pos,
            filter: "saturate(0.85) brightness(0.88) contrast(1.05)",
            opacity: beat >= 1 ? 1 : 0,
            transition: "object-position 0.6s cubic-bezier(0.33,1,0.68,1), transform 0.6s cubic-bezier(0.33,1,0.68,1), opacity 0.5s ease-out",
            willChange: "transform, object-position",
          }}
        />
      </div>

      {/* ══ Edge flutter ghost (beats 1~3) — 머리카락·자켓 끝 펄럭임 ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          animation: isWindBeat ? "cinemaHsrEdgeFlutter 1.4s ease-in-out infinite" : "none",
          opacity: beat === 2 ? 0.22 : isWindBeat ? 0.14 : 0,
          filter: "blur(3px)",
          mixBlendMode: "screen",
          transition: "opacity 0.6s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <img
          src={introSrc}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: currentZoom.pos,
            transform: `scale(${currentZoom.scale})`,
            transformOrigin: currentZoom.pos,
            transition: "object-position 0.6s ease-out, transform 0.6s ease-out",
          }}
        />
      </div>

      {/* ══ Layer B: contain 전체 리빌 (beats 4~5) ══ */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain",
          objectPosition: "50% 50%",
          filter: isReveal ? "saturate(1) brightness(1)" : "saturate(0.8) brightness(0.7)",
          opacity: isReveal ? 1 : 0,
          transition: "opacity 1.5s ease-out, filter 1.5s ease-out",
          zIndex: 4,
        }}
      />

      {/* ══ 바람 줄기 (wind streaks) — 좌→우 가로선 7개 ══ */}
      {isWindBeat && STREAKS.map((s, i) => (
        <div
          key={`streak-${i}`}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: "-50%",
            width: "200%",
            height: s.width,
            background: `linear-gradient(to right, transparent 0%, oklch(1 0 0 / ${s.alpha * windLevel}) 30%, oklch(1 0 0 / ${s.alpha * windLevel * 1.5}) 50%, transparent 100%)`,
            animation: `cinemaHsrWindStreak ${s.speed}s linear infinite`,
            animationDelay: `${s.delay}s`,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ══ 종이 파티클 — 마름모·사다리꼴 종이조각 좌→우 드리프트 ══ */}
      {isWindBeat && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 6, pointerEvents: "none" }}>
          {PAPERS.map((p, i) => (
            <div
              key={`paper-${i}`}
              style={{
                position: "absolute",
                left: "-8%",
                top: `${p.top}%`,
                width: p.size,
                height: p.size * (0.55 + (i % 3) * 0.15),
                background: `oklch(0.95 0.02 55 / ${p.opacity * windLevel})`,
                borderRadius: i % 3 === 0 ? "1px" : "0",
                transform: `rotate(${p.rotation}deg) skewX(${(i % 2 === 0 ? 12 : -8)}deg)`,
                animation: `cinemaHsrPaperDrift ${p.dur / (0.6 + windLevel * 0.4)}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ══ 먼지 파티클 — box-shadow 군집 좌→우 ══ */}
      {isWindBeat && (
        <div
          style={{
            position: "absolute", left: "-15%", top: 0,
            width: 2, height: 2,
            borderRadius: "50%",
            background: "oklch(1 0 0 / 0.10)",
            boxShadow: DUST_SHADOW,
            opacity: windLevel * 0.8,
            animation: `cinemaHsrDustDrift ${4 / (0.5 + windLevel * 0.5)}s linear infinite`,
            zIndex: 6,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ 시그니처 pulse — beat 2 (바람·자켓 영역) ══ */}
      {beat === 2 && (
        <div
          key="pulse-wind"
          style={{
            position: "absolute",
            left: isMobile ? "70%" : "75%",
            top: isMobile ? "50%" : "49%",
            width: isMobile ? 240 : 320,
            height: isMobile ? 240 : 320,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: char.color,
            filter: "blur(65px)",
            opacity: 0,
            animation: "cinemaHsrPulse 1.6s ease-out forwards",
            zIndex: 7,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ 비트 전환 flash — 번쩍 (beats 2/3/4 진입) ══ */}
      {beat >= 2 && beat <= 4 && (
        <div
          key={`flash-${beat}`}
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            background: "oklch(1 0 0)",
            opacity: 0,
            animation: "cinemaHsrTransFlash 0.4s ease-out forwards",
            mixBlendMode: "overlay",
            zIndex: 9,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ Vignette (beat 4+) ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 25%, oklch(0 0 0 / 0.6) 95%)",
          opacity: beat >= 5 ? 1 : beat === 4 ? 0.3 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 8,
          pointerEvents: "none",
        }}
      />

      {/* ══ CenteredQuote — quote[0] "잘 들어." subtle (beats 1~3) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat <= 3}
        quoteIndex={0}
      />

      {/* ══ CenteredQuote — quote[1] "이번이 마지막 기회야." subtle (beat 4) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 4}
        quoteIndex={1}
      />

      {/* ══ CenteredQuote — quote[1] hero (beat 5+) ══ */}
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
