import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — v6 재설계 (2026-04-12)
   ------------------------------------------------------------
   v5 폐기 사유 (사용자 피드백 5건 모두 근본 원인):
   1. 반투명 하얀색 레이어만 보임 (mixBlendMode:screen 오용)
   2. Smooth pan 줌 → 역동성 0
   3. 노이즈 효과 완전 부재 (TV static 제거를 사용자가 "허접하니까
      제거"로 잘못 지시한 줄 알았으나, 실제로는 "허접하니까 품질을
      올려라" 였음)
   4. 보라 pulse 비가시 (screen 블렌딩 + 작은 gradient)
   5. KV 이미지 하단 ~33% 잘림 (top-70% stage + mask-to-black 크롭)

   v6 컨셉: "망가진 전자기 신호가 NHR 을 튜닝"
     - 지직거리는 전자기 노이즈 (SVG turbulence + scanlines + crackle bars)
     - 번쩍이는 줌인 (fade-in/crackle-out/fade-in 반복 flash 패턴)
     - L/R/L 교차 줌 position
     - Beat 4 에서 objectFit: contain 으로 KV 전체를 한눈에

   Timeline: 7400ms + 500ms fadeOut = 7900ms (모든 visible hold ≥ 1000ms)
     0    -  100  : black
     100  - 1600  : beat 1 (LEFT 미소, flash, EM noise heavy, quote[0])
     1600 - 3100  : beat 2 (RIGHT 손목시계, flash, purple pulse, noise)
     3100 - 4600  : beat 3 (LEFT-TOP 이어폰, flash, purple pulse, noise)
     4600 - 6500  : beat 4 (contain FULL reveal, noise fades, quote[1])
     6500 - 7400  : beat 5 (hero + vignette + label)
     7400 - 7900  : fadeOut → Phase 1

   레이어 구조 (zIndex 체인):
     black bg          (viewport)
     Layer A cover zoom (2)  ← beats 1-3: 클로즈업
     Layer B contain     (3)  ← beats 4-5: 전체 리빌
     scanlines          (4)
     EM noise SVG       (5)
     crackle bars       (6)
     flash overlay      (7)
     purple pulse       (8)
     vignette           (9)
     CenteredQuote      (internal)
     label / skip       (10)
   ══════════════════════════════════════════════════════════ */

// 줌 포인트 — 좌/우/좌 교차, NHR KV 실물 확인 후 미세 조정 가능
const ZOOM_BEATS = {
  desktop: {
    1: { pos: "38% 32%", scale: 1.8 },  // LEFT — 미소 (입꼬리 + 눈매)
    2: { pos: "64% 58%", scale: 1.9 },  // RIGHT — 손목시계 영역
    3: { pos: "36% 22%", scale: 1.8 },  // LEFT-TOP — 한쪽 이어폰
  },
  mobile: {
    1: { pos: "40% 34%", scale: 1.7 },
    2: { pos: "60% 60%", scale: 1.8 },
    3: { pos: "38% 26%", scale: 1.7 },
  },
};

// 보라 pulse 위치 (viewport % 좌표) — beat 2(watch) / beat 3(earphone)
const PULSE_POS = {
  desktop: {
    2: { left: "64%", top: "58%" },
    3: { left: "36%", top: "22%" },
  },
  mobile: {
    2: { left: "60%", top: "60%" },
    3: { left: "38%", top: "26%" },
  },
};

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1),  100),
      setTimeout(() => setBeat(2), 1600),
      setTimeout(() => setBeat(3), 3100),
      setTimeout(() => setBeat(4), 4600),
      setTimeout(() => setBeat(5), 6500),
      setTimeout(() => setFadingOut(true), 7400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const zoomTable = ZOOM_BEATS[isMobile ? "mobile" : "desktop"];
  const pulseTable = PULSE_POS[isMobile ? "mobile" : "desktop"];
  const currentZoom = zoomTable[Math.min(Math.max(beat, 1), 3)] || zoomTable[1];

  // Beat 1~3 은 flash animation + cover zoom
  // Beat 4~5 는 stable contain reveal
  const isZoomBeat = beat >= 1 && beat <= 3;
  const isRevealBeat = beat >= 4;

  // EM 노이즈 intensity
  const noiseOpacity =
    beat === 0 ? 0 :
    isZoomBeat ? 0.9 :
    beat === 4 ? 0.25 :
    0.05;

  // Scanlines intensity
  const scanlineOpacity =
    isZoomBeat ? 0.55 :
    beat === 4 ? 0.12 :
    0;

  // Crackle bars intensity
  const crackleOpacity =
    isZoomBeat ? 0.7 :
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
      {/* ══ Layer A: 줌 클로즈업 (beats 1~3) ══
          - cover fit + transform scale → 뷰포트 꽉 채우는 close-up
          - React key={beat} 로 flash keyframe 재시작
          - filter 는 static style, opacity 만 애니메이션     */}
      <img
        key={`zoom-${beat}`}
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: currentZoom.pos,
          transform: `scale(${currentZoom.scale})`,
          transformOrigin: currentZoom.pos,
          filter: "saturate(0.7) brightness(0.82) contrast(1.12)",
          opacity: isRevealBeat ? 0 : (beat === 0 ? 0 : 1),
          animation: isZoomBeat ? "cinemaNhrFlash 1.5s ease-out forwards" : "none",
          transition: isRevealBeat ? "opacity 0.7s ease-out" : "none",
          zIndex: 2,
          willChange: "opacity",
        }}
      />

      {/* ══ Layer B: 전체 리빌 (beats 4~5, contain) ══
          - contain fit → 이미지 전체가 뷰포트 안에 레터박스로 들어옴
          - "한눈에 보이는 KV"  */}
      <img
        src={char.keyVisual}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain",
          objectPosition: "50% 50%",
          filter: beat === 4
            ? "saturate(0.95) brightness(0.95)"
            : "saturate(1) brightness(1)",
          opacity: isRevealBeat ? 1 : 0,
          transition: "opacity 0.9s ease-out, filter 0.9s ease-out",
          zIndex: 3,
        }}
      />

      {/* ══ Scanlines (horizontal interference bars) ══ */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background:
            "repeating-linear-gradient(to bottom, oklch(1 0 0 / 0.12) 0px, oklch(1 0 0 / 0.12) 2px, transparent 2px, transparent 5px)",
          opacity: scanlineOpacity,
          transition: "opacity 0.8s ease-out",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />

      {/* ══ EM 노이즈 — SVG feTurbulence + CSS crackle shake ══
          - 정적 turbulence 패턴 (한번 렌더, 재생성 없음)
          - CSS transform 으로 10Hz 지터 → "지직거리는" 효과
          - overlay 블렌딩 → 이미지에 노이즈 입힘, 색 탈색 X */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-3%",  // 엣지 짤림 방지 (transform shake 때문에)
          width: "106%", height: "106%",
          opacity: noiseOpacity,
          transition: "opacity 1s ease-out",
          mixBlendMode: "overlay",
          zIndex: 5,
          pointerEvents: "none",
          animation: isZoomBeat ? "cinemaNhrCrackle 0.1s steps(4) infinite" : "none",
        }}
      >
        <defs>
          <filter id="nhrEmNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.8"
              numOctaves="2"
              seed="13"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.92  0 0 0 0 0.92  0 0 0 0 0.98  0 0 0 1 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#nhrEmNoise)" />
      </svg>

      {/* ══ Crackle glitch bars — 랜덤 수평선 이동 ══ */}
      <div
        aria-hidden="true"
        key={`crackle-${beat}`}
        style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 17%, oklch(0.92 0.05 310 / 0.55) 18%, transparent 19%, transparent 44%, oklch(0.85 0.08 260 / 0.45) 45%, transparent 46%, transparent 73%, oklch(0.95 0.03 310 / 0.5) 74%, transparent 75%, transparent 100%)",
          opacity: crackleOpacity,
          transition: "opacity 0.6s ease-out",
          animation: isZoomBeat ? "cinemaNhrGlitchBars 0.38s steps(3) infinite" : "none",
          zIndex: 6,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* ══ 흰 flash overlay (beat 전환 순간 번쩍) ══ */}
      <div
        aria-hidden="true"
        key={`flash-${beat}`}
        style={{
          position: "absolute", inset: 0,
          background: "oklch(1 0 0)",
          opacity: 0,
          animation: isZoomBeat || beat === 4
            ? "cinemaNhrFlashOverlay 0.28s ease-out forwards"
            : "none",
          zIndex: 7,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />

      {/* ══ 보라 pulse — beat 2 (watch) / beat 3 (earphone) ══
          - 크고 짙은 솔리드 color + blur(70px) → 선명한 아우라
          - normal compositing (no mixBlendMode)
          - 높은 zIndex 로 노이즈 위에 표시  */}
      {(beat === 2 || beat === 3) && (
        <div
          aria-hidden="true"
          key={`pulse-${beat}`}
          style={{
            position: "absolute",
            left: pulseTable[beat].left,
            top: pulseTable[beat].top,
            width: isMobile ? 260 : 360,
            height: isMobile ? 260 : 360,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: char.color,
            filter: "blur(70px)",
            opacity: 0,
            animation: "cinemaNhrPulse 1.5s ease-out forwards",
            zIndex: 8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══ Vignette (beat 4+) ══ */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 25%, oklch(0 0 0 / 0.65) 95%)",
          opacity: beat >= 5 ? 1 : beat === 4 ? 0.35 : 0,
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
