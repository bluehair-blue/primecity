import { useEffect, useRef, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FogIntro (NHR) — TV static noise × 2-beat zoom → unfurl → hero
   ------------------------------------------------------------
   Concept: 지직거리는 전파 노이즈 속 두 번의 줌인 → 이미지 펼쳐짐 → hero
   Layout : 이미지 70% (상단) + 바닥 reflection 22% (하단)

   Timeline: 5400ms + 500ms fadeOut = 5900ms total
     0    -  300ms : black
     300  - 1600ms : 줌인 #1 (좌하-중심) + 강한 노이즈 + "후후..." subtle  [1300ms]
     1600 - 2800ms : 줌인 #2 (우상-중심) + 강한 노이즈 + "후후..." 유지   [1200ms]
     2800 - 4100ms : "잘 부탁해?" subtle + 줌아웃 + 노이즈 중간           [1300ms >1초]
     4100 - 5400ms : hero (이름+대사) + 노이즈 사라짐                      [1300ms >1초]
     5400 - 5900ms : fadeOut → Phase 1

   Zoom positions (NHR focusBox center 50% 35% 기준):
     #1 좌하-중심: "25% 67%"
     #2 우상-중심: "75% 18%"
   ══════════════════════════════════════════════════════════ */

const NOISE_ID = "nhrStaticNoise";
const ZOOM_SCALE = 1.55;
const ZOOM_POSITIONS = ["25% 67%", "75% 18%"];

export default function FogIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const noiseSeedRef = useRef(null);
  const noiseRafRef = useRef(null);

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),   // 줌인 #1 + 노이즈 + "후후..."
      setTimeout(() => setBeat(2), 1600),  // 줌인 #2 (포지션 전환)
      setTimeout(() => setBeat(3), 2800),  // "잘 부탁해?" + 줌아웃 + 노이즈 중간
      setTimeout(() => setBeat(4), 4100),  // hero
      setTimeout(() => setFadingOut(true), 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── rAF: noise seed 랜덤화 — beats 1~3 ──
  useEffect(() => {
    if (beat < 1 || beat >= 4) {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
      return;
    }
    const tick = () => {
      if (noiseSeedRef.current) {
        noiseSeedRef.current.setAttribute("seed", Math.floor(Math.random() * 9999));
      }
      noiseRafRef.current = requestAnimationFrame(tick);
    };
    noiseRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
    };
  }, [beat]);

  // 줌인 objectPosition: beat 1→#1, beat 2→#2, beat 3+→focusBox
  const currentObjPos =
    beat === 1 ? ZOOM_POSITIONS[0] :
    beat === 2 ? ZOOM_POSITIONS[1] :
    objectPosition;

  // 이미지 scale: 줌인(1~2) → 줌아웃(3+)
  const imgScale = beat >= 3 ? 1.0 : beat >= 1 ? ZOOM_SCALE : ZOOM_SCALE;

  // 이미지 filter: 저채도(1~2) → 복원(3+)
  const imageFilter =
    beat <= 2 ? "saturate(0.35) brightness(0.65)" :
    beat === 3 ? "saturate(0.8) brightness(0.9)" :
    "saturate(1.0) brightness(1.0)";

  // 노이즈 overlay opacity: beat1~2 강함, beat3 중간, beat4 사라짐
  const noiseOpacity =
    beat === 1 || beat === 2 ? 0.55 :
    beat === 3 ? 0.35 :
    0;

  // 이미지 transition: beat 구간별 차등
  const imgTransition =
    beat >= 3
      ? "transform 1.1s cubic-bezier(0.22,1,0.36,1), object-position 1.0s ease-out, filter 1.1s ease-out, opacity 0.5s ease-out"
      : beat === 2
      ? "object-position 0.35s ease-out, opacity 0.4s ease-out, filter 0.3s ease-out"
      : "opacity 0.45s ease-out, filter 0.3s ease-out";

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
      {/* ── SVG static noise filter (seed 랜덤화로 60fps TV 지직) ── */}
      <svg
        width="0" height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id={NOISE_ID} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              ref={noiseSeedRef}
              type="turbulence"
              baseFrequency="0.65"
              numOctaves="1"
              seed="1"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* ── KV 이미지 영역 (화면 상단 70%) ── */}
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
            willChange: "transform, object-position",
          }}
        />
      </div>

      {/* ── 바닥 reflection (70%~92%) ── */}
      <div
        style={{
          position: "absolute",
          top: "70%", left: 0, right: 0,
          height: "22%",
          overflow: "hidden",
          zIndex: 2,
          opacity: beat >= 1 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      >
        <img
          src={char.keyVisual}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: currentObjPos,
            transform: "scaleY(-1)",
            filter: imageFilter,
            WebkitMaskImage:
              "linear-gradient(to bottom, oklch(1 0 0 / 0.22) 0%, transparent 85%)",
            maskImage:
              "linear-gradient(to bottom, oklch(1 0 0 / 0.22) 0%, transparent 85%)",
            opacity: 0.22,
            transition: "object-position 0.35s ease-out, filter 1.0s ease-out",
          }}
        />
        {/* reflection 하단 페이드아웃 */}
        <div
          style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(to bottom, transparent 30%, oklch(0 0 0 / 0.75) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── TV static noise overlay (전체 화면, zIndex 3) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          filter: `url(#${NOISE_ID})`,
          background: "oklch(0.5 0 0)",
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
          opacity: beat >= 1 && beat <= 3 ? 0.6 : 0,
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

      {/* ── "후후..." subtle — beats 1~2 (두 번의 줌인 내내) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat <= 2}
        quoteIndex={0}
      />

      {/* ── "잘 부탁해?" subtle — beat 3 (줌아웃 + 노이즈 중간) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat === 3}
        quoteIndex={1}
      />

      {/* ── "잘 부탁해?" hero — beat 4 (최소 1.3초) ── */}
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
