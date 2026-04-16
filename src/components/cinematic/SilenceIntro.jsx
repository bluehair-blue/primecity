import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   SilenceIntro (NOA) — slow fade → minimal layout → quiet reveal
   ------------------------------------------------------------
   Concept: 과묵한 노아의 정적. 미니멀하고 고요한 등장.
   여백이 많고, 움직임이 느리며, 짧은 텍스트 한 줄이 천천히 나타난다.
   '말보다 행동'인 노아답게 — 화려함 없이 조용히 존재감을 드러낸다.
   Sequence: 6200ms + 500ms fadeOut = 6700ms total
     0    -  600ms : deep black, 아무것도 없음 (의도적 정적)
     600  - 2000ms : 얇은 수평선 중앙에 서서히 등장 + quote subtle
     2000 - 3400ms : 수평선이 갈라지며 이미지가 슬릿 사이로 드러남
     3400 - 5000ms : 슬릿이 확장 → 전체 이미지 reveal + 수평선 소멸
     5000 - 6200ms : hero quote + introLabel — 1.2s breathing room
     6200 - 6700ms : fadeOut → Phase 1 keyVisual

   zIndex: line(1) < image(2) < mask(3) < vignette(4) < quote(6) < label(10)
   연계 파일:
   - characters.js — NOA: introStyle="silence", quoteSequence, focusBox
   - introStyles.js — silence: { duration: 6700 }
   - cinematic/index.js — INTRO_COMPONENTS 레지스트리
   ══════════════════════════════════════════════════════════ */

export default function SilenceIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  /* ── Timeline ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 600),    // 수평선 등장
      setTimeout(() => setBeat(2), 2000),   // 슬릿 열림 시작
      setTimeout(() => setBeat(3), 3400),   // 전체 reveal
      setTimeout(() => setBeat(4), 5000),   // hero quote hold
      setTimeout(() => setFadingOut(true), config.duration - 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [config.duration]);

  const accentColor = char.color || "oklch(0.35 0.15 300)";

  const commonImg = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
  };

  /* 슬릿 마스크: Beat별로 clip-path가 확장
     Beat 0-1: 완전히 닫힘 (50% 50%)
     Beat 2: 얇은 슬릿 (중앙 2% 틈)
     Beat 3: 전체 열림 (0% 100%) */
  const getClipPath = () => {
    if (beat < 2) return "inset(50% 0 50% 0)";     // 닫힘
    if (beat === 2) return "inset(35% 0 35% 0)";   // 슬릿 (중앙 30%)
    return "inset(0% 0 0% 0)";                      // 전체
  };

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0.02 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── 수평선 — Beat 1, 중앙에 얇은 선이 서서히 등장 ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "10%", right: "10%",
          height: 1,
          background: `linear-gradient(90deg, oklch(0 0 0 / 0), ${accentColor}88, oklch(0 0 0 / 0))`,
          opacity: beat >= 1 && beat < 3 ? 0.7 : 0,
          transform: `scaleX(${beat >= 1 ? 1 : 0})`,
          transformOrigin: "center",
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1), opacity 0.8s ease-out",
          zIndex: 1, pointerEvents: "none",
        }}
      />

      {/* ── Main image — clip-path로 슬릿 reveal ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          clipPath: getClipPath(),
          transform: beat >= 3 ? "scale(1.0)" : "scale(1.04)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "clip-path 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── 상하 마스크 엣지 — Beat 2, 슬릿 가장자리 글로우 ── */}
      {beat === 2 && (
        <>
          <div
            style={{
              position: "absolute", left: 0, right: 0, height: "4%",
              top: "33%",
              background: `linear-gradient(180deg, oklch(0 0 0 / 0), ${accentColor}15)`,
              zIndex: 3, pointerEvents: "none",
              transition: "opacity 0.5s ease-out",
            }}
          />
          <div
            style={{
              position: "absolute", left: 0, right: 0, height: "4%",
              bottom: "33%",
              background: `linear-gradient(0deg, oklch(0 0 0 / 0), ${accentColor}15)`,
              zIndex: 3, pointerEvents: "none",
              transition: "opacity 0.5s ease-out",
            }}
          />
        </>
      )}

      {/* ── Vignette (Beat 3+) — 미니멀, 약한 비네트 ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, oklch(0 0 0 / 0) 40%, oklch(0 0 0 / 0.4) 90%)",
          opacity: beat >= 3 ? 1 : 0,
          transition: "opacity 1.0s ease-out",
          zIndex: 4, pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~3) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 4}
      />

      {/* ── CenteredQuote hero (Beat 4+) — 1.2s hold before fadeOut ── */}
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
