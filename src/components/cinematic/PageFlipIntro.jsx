import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   PageFlipIntro (HSE) — 책장 넘기듯 드러나는 하시은
   ------------------------------------------------------------
   컨셉: 크림색 책 페이지 2장이 순차 스윕(R→L) → KV 줌 단계적 노출
   KV: 책더미 둘러싸인 서재에서 턱을 괸 하시은, 빨간 펜 (2304×960)

   Timeline: 7400ms + 700ms fadeOut = 8100ms
     0    -  200  : beat 0 — cream pages cover screen
     200  - 2400  : beat 1 — Page B sweeps → zoom #1 (pen+hand 61% 52%) + quote[0]  [hold 1200]
     2400 - 4600  : beat 2 — Page A sweeps → zoom #2 (face 35% 36%)                [hold 1200]
     4600 - 6600  : beat 3 — contain reveal (1.5s cross-fade) + quote[1] subtle     [hold 1000]
     6600 - 7400  : beat 4 — hero + vignette + label
     7400 - 8100  : fadeOut (0.7s) → Phase 1

   Page sweep: CSS transition translateX(0 → -105%), 1.1s ease-out
   zIndex:
     Layer A cover zoom (2)
     Layer B contain (3)
     signature pulse (5)
     vignette (6)
     Page A overlay (11) — sweeps at beat 2
     Page B overlay (12) — sweeps at beat 1
     CenteredQuote (internal 6)
     label / skip (10)
   ══════════════════════════════════════════════════════════ */

// 줌 좌표 — 2304×960 울트라와이드
// beats 1~2 는 고정 포지션 (페이지 스윕이 리빌을 담당, 줌 점프 방지)
// beat 3 에서 contain 으로 전체 리빌
const ZOOM_FIXED = {
  desktop: { pos: "42% 45%", scale: 1.15 },  // 얼굴 약간 좌측, 자연스러운 중심
  mobile:  { pos: "44% 46%", scale: 1.12 },
};

export default function PageFlipIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 200),
      setTimeout(() => setBeat(2), 2400),
      setTimeout(() => setBeat(3), 4600),
      setTimeout(() => setBeat(4), 6600),
      setTimeout(() => setFadingOut(true), 7400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const zoomFixed = ZOOM_FIXED[isMobile ? "mobile" : "desktop"];

  const isZoomBeat = beat >= 1 && beat <= 2;
  const isReveal = beat >= 3;

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0.08 0.01 85)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.7s ease-out",
      }}
    >
      {/* ══ Layer A: 줌 클로즈업 (beats 1~2) ══ */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: zoomFixed.pos,
          transform: `scale(${zoomFixed.scale})`,
          transformOrigin: zoomFixed.pos,
          filter: "saturate(0.9) brightness(0.85) contrast(1.05)",
          opacity: isReveal ? 0 : (beat >= 1 ? 1 : 0),
          transition: "opacity 1.5s ease-out",
          zIndex: 2,
        }}
      />

      {/* ══ Layer B: contain 전체 리빌 (beats 3~4) ══ */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain",
          objectPosition: "50% 50%",
          filter: isReveal ? "saturate(1) brightness(1)" : "saturate(0.8) brightness(0.6)",
          opacity: isReveal ? 1 : 0,
          transition: "opacity 1.5s ease-out, filter 1.5s ease-out",
          zIndex: 3,
        }}
      />

      {/* ══ 시그니처 pulse — beat 2 (빨간 펜·손 영역, 우측 노출 후) ══ */}
      {beat === 2 && (
        <div
          key="pulse-pen"
          style={{
            position: "absolute",
            left: isMobile ? "62%" : "65%",
            top: isMobile ? "48%" : "50%",
            width: isMobile ? 220 : 300,
            height: isMobile ? 220 : 300,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: char.color,
            filter: "blur(60px)",
            opacity: 0,
            animation: "cinemaHsePulse 2.2s ease-out forwards",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ Vignette (beat 3+) ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 25%, oklch(0 0 0 / 0.55) 95%)",
          opacity: beat >= 4 ? 1 : beat === 3 ? 0.25 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />

      {/* ══ Page B — 첫 번째 페이지, beat 1 에서 스윕 ══ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "oklch(0.96 0.012 85)",
          transform: beat >= 1 ? "translateX(-105%)" : "translateX(0)",
          transition: "transform 1.1s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "inset -14px 0 28px -8px oklch(0 0 0 / 0.12)",
          zIndex: 12,
          pointerEvents: "none",
        }}
      >
        {/* 노트 라인 텍스처 */}
        <div style={{
          position: "absolute",
          top: "8%", left: "10%", right: "10%", bottom: "8%",
          background:
            "repeating-linear-gradient(to bottom, oklch(0.80 0.02 85 / 0.25) 0px, oklch(0.80 0.02 85 / 0.25) 1px, transparent 1px, transparent 28px)",
          pointerEvents: "none",
        }} />
        {/* 페이지 우측 하단 장식 */}
        <span style={{
          position: "absolute", bottom: "10%", right: "10%",
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 10 : 13,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "oklch(0.75 0.03 85 / 0.4)",
        }}>
          Note
        </span>
      </div>

      {/* ══ Page A — 우측 55%만 덮는 두 번째 페이지, beat 2 에서 스윕 ══
          Page B 스윕 시 좌측 45% 가 먼저 드러남 (얼굴 영역).
          Page A 스윕 시 나머지 우측 55% 드러남 (펜·책 영역).
          좌측 엣지에 책등(spine) 그림자 — 북 바인딩 느낌. */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: "45%", right: 0,
          background: "oklch(0.94 0.015 85)",
          transform: beat >= 2 ? "translateX(110%)" : "translateX(0)",
          transition: "transform 1.1s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-8px 0 20px -4px oklch(0 0 0 / 0.15), inset -14px 0 28px -8px oklch(0 0 0 / 0.08)",
          zIndex: 11,
          pointerEvents: "none",
        }}
      >
        {/* 노트 라인 텍스처 */}
        <div style={{
          position: "absolute",
          top: "8%", left: "8%", right: "10%", bottom: "8%",
          background:
            "repeating-linear-gradient(to bottom, oklch(0.78 0.02 85 / 0.20) 0px, oklch(0.78 0.02 85 / 0.20) 1px, transparent 1px, transparent 32px)",
          pointerEvents: "none",
        }} />
      </div>

      {/* ══ CenteredQuote — quote[0] "세상 모든것에는―..." subtle (beats 1~2) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat <= 2}
        quoteIndex={0}
      />

      {/* ══ CenteredQuote — quote[1] "배울 점이 있거든요!" subtle (beat 3) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat === 3}
        quoteIndex={1}
      />

      {/* ══ CenteredQuote — quote[1] hero (beat 4+) ══ */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 4}
        quoteIndex={1}
      />

      {/* ══ Chapter label (beat 4+) ══ */}
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
            opacity: beat >= 4 ? 0.6 : 0,
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
