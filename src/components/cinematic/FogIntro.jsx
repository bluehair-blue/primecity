import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — canvas TV static + 2-beat zoom → unfurl → hero
   ------------------------------------------------------------
   v4: canvas 기반 노이즈 (SVG filter 제거 — filter+blend-mode 충돌 해결)
       80×45 저해상도 canvas → pixelated 확대 → TV 정적 노이즈
       reflection: maskImage white→transparent (alpha 오용 수정)

   Timeline: 5400ms + 500ms fadeOut = 5900ms total
     0    -  300ms : black
     300  - 1600ms : 줌인 #1 (25% 67%) + 강한 노이즈 + "후후..." subtle  [1300ms]
     1600 - 2800ms : 줌인 #2 (75% 18%) + 강한 노이즈 + "후후..." 유지   [1200ms]
     2800 - 4100ms : "잘 부탁해?" subtle + 줌아웃 + 노이즈 중간          [1300ms]
     4100 - 5400ms : hero (이름+대사) + 노이즈 사라짐                     [1300ms]
     5400 - 5900ms : fadeOut → Phase 1
   ══════════════════════════════════════════════════════════ */

const ZOOM_SCALE = 1.55;
const ZOOM_POSITIONS = ["25% 67%", "75% 18%"];

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const canvasRef = useRef(null);
  const noiseRafRef = useRef(null);

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1600),
      setTimeout(() => setBeat(3), 2800),
      setTimeout(() => setBeat(4), 4100),
      setTimeout(() => setFadingOut(true), 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Canvas TV static noise — beats 1~3 ──
  // 80×45 저해상도 랜덤 픽셀 → pixelated CSS 확대 → TV 정적 효과
  // canvas element에는 CSS filter 없음 → mix-blend-mode 정상 동작
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || beat < 1 || beat >= 4) {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
      return;
    }

    canvas.width = 80;
    canvas.height = 45;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const d = ctx.createImageData(80, 45);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.floor(Math.random() * 256);
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 185;  // ~72% alpha
      }
      ctx.putImageData(d, 0, 0);
      noiseRafRef.current = requestAnimationFrame(draw);
    };

    noiseRafRef.current = requestAnimationFrame(draw);
    return () => {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
    };
  }, [beat]);

  // 줌인 objectPosition
  const currentObjPos =
    beat === 1 ? ZOOM_POSITIONS[0] :
    beat === 2 ? ZOOM_POSITIONS[1] :
    objectPosition;

  // scale: 줌인(1~2) → 줌아웃(3+)
  const imgScale = beat >= 3 ? 1.0 : 1.55;

  // 이미지 filter (저채도 → 복원)
  const imageFilter =
    beat <= 2 ? "saturate(0.35) brightness(0.65)" :
    beat === 3 ? "saturate(0.8) brightness(0.9)" :
    "saturate(1.0) brightness(1.0)";

  // 노이즈 canvas opacity
  const noiseOpacity =
    beat === 1 || beat === 2 ? 0.5 :
    beat === 3 ? 0.3 :
    0;

  // 이미지 transition (beat마다 차등)
  const imgTransition =
    beat >= 3
      ? "transform 1.1s cubic-bezier(0.22,1,0.36,1), object-position 1.0s ease-out, filter 1.1s ease-out, opacity 0.5s ease-out"
      : beat === 2
      ? "object-position 0.35s ease-out"
      : "opacity 0.45s ease-out";

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
      {/* ── KV 이미지 (상단 70%) ── */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "70%",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        <img
          src={char.keyVisual}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: currentObjPos,
            transform: `scale(${imgScale})`,
            transformOrigin: currentObjPos,
            filter: imageFilter,
            opacity: beat >= 1 ? 1 : 0,
            transition: imgTransition,
            willChange: "transform",
          }}
        />
      </div>

      {/* ── Canvas TV static noise ──
          CSS filter 없이 직접 픽셀 그리기 → mix-blend-mode overlay 정상 작동
          imageRendering: pixelated → 80×45 픽셀이 chunky 블록으로 확대 (TV 정적)  */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          imageRendering: "pixelated",
          opacity: noiseOpacity,
          mixBlendMode: "overlay",
          transition: "opacity 0.5s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── CRT 스캔라인 (beats 1~3) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0) 0px, oklch(0 0 0 / 0) 2px, oklch(0 0 0 / 0.13) 3px)",
          opacity: beat >= 1 && beat <= 3 ? 0.55 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Vignette (beat 4) ── */}
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

      {/* ── "후후..." subtle (beat 1~2) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat <= 2}
        quoteIndex={0}
      />

      {/* ── "잘 부탁해?" subtle (beat 3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 3}
        quoteIndex={1}
      />

      {/* ── "잘 부탁해?" hero (beat 4) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="hero"
        show={beat >= 4}
        quoteIndex={1}
      />

      {/* ── Chapter label (beat 4+) ── */}
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
