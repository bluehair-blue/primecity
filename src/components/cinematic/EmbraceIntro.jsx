import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   EmbraceIntro (ERP) — soft blur → warm bloom → gentle zoom → embrace wrap
   ------------------------------------------------------------
   Concept: 마망의 따뜻한 포옹. 부드럽게 흐린 화면이 서서히 선명해지며
   따뜻한 빛이 퍼지고, 화면 가장자리가 감싸안듯이 비네트가 오므라든다.
   Sequence: 6500ms + 500ms fadeOut = 7000ms total
     0    -  400ms : black → warm pink gradient fades in
     400  - 1800ms : intro image blurred (12px) + warm bloom overlay + quote subtle
     1800 - 3200ms : blur → 0, image reveals in soft focus + bloom fades
     3200 - 4800ms : gentle zoom in (1.0 → 1.08) + embrace vignette closes in
     4800 - 6500ms : hero quote + introLabel — 1.7s breathing room
     6500 - 7000ms : fadeOut → Phase 1 keyVisual

   zIndex: warmGlow(1) < image(2) < vignette(4) < quote(6) < label(10)
   연계 파일:
   - characters.js — ERP: introStyle="embrace", quoteSequence, focusBox
   - introStyles.js — embrace: { duration: 7000 }
   - cinematic/index.js — INTRO_COMPONENTS 레지스트리
   - CinematicCharDetail.jsx — Phase 0 에서 이 컴포넌트 로드
   ══════════════════════════════════════════════════════════ */

export default function EmbraceIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  /* ── Timeline ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 400),    // warm bloom + blurred image
      setTimeout(() => setBeat(2), 1800),   // blur clears, image reveals
      setTimeout(() => setBeat(3), 3200),   // gentle zoom + embrace vignette
      setTimeout(() => setBeat(4), 4800),   // hero quote hold
      setTimeout(() => setFadingOut(true), config.duration - 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [config.duration]);

  /* 에르피 시그니처 색상 — 연분홍 */
  const warmPink = char.color || "oklch(0.80 0.10 350)";

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
        background: "oklch(0.02 0.01 350)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── Warm glow base layer — 분홍빛 그라데이션, Beat 0~1에서 피어남 ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, ${warmPink}33 0%, oklch(0 0 0 / 0) 70%)`,
          opacity: beat >= 1 && beat < 3 ? 0.8 : 0,
          transition: "opacity 1.2s ease-out",
          zIndex: 1, pointerEvents: "none",
        }}
      />

      {/* ── Main image — Beat 1: blurred, Beat 2: clear, Beat 3: zoom ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          /* Beat 0: invisible, Beat 1: blurred, Beat 2+: clear */
          filter: beat === 1 ? "blur(12px) brightness(1.1)" : beat >= 2 ? "blur(0px) brightness(1.0)" : "blur(20px)",
          /* Beat 3: gentle zoom in (포옹하듯 다가오는 느낌) */
          transform: beat >= 3 ? "scale(1.08)" : "scale(1.0)",
          transformOrigin: "50% 45%",
          opacity: beat >= 1 ? 1 : 0,
          transition: beat >= 2
            ? "filter 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.8s cubic-bezier(0.22,1,0.36,1), opacity 0.8s ease-out"
            : "filter 1.2s ease-out, opacity 1.0s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Bloom overlay — Beat 1~2, 따뜻한 빛 확산 ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${warmPink}22 0%, oklch(0 0 0 / 0) 60%)`,
          mixBlendMode: "screen",
          opacity: beat >= 1 && beat < 3 ? 0.6 : 0,
          transition: "opacity 1.5s ease-out",
          zIndex: 2, pointerEvents: "none",
        }}
      />

      {/* ── Embrace vignette — Beat 3+, 감싸안는 비네트 (중앙 밝고 가장자리 어두움) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 50%,
            oklch(0 0 0 / 0) ${beat >= 3 ? "25%" : "40%"},
            oklch(0 0 0 / 0.35) ${beat >= 3 ? "55%" : "70%"},
            oklch(0 0 0 / 0.7) 100%)`,
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.8s ease-out, background 1.6s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 4, pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 4}
      />

      {/* ── CenteredQuote hero (Beat 4+) — 1.7s hold before fadeOut ── */}
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
