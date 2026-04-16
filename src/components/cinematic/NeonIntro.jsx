import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   NeonIntro (SIA) — neon glow text → glitter burst → SNS notification pop → reveal
   ------------------------------------------------------------
   Concept: 인플루언서 시아의 화려한 팝 에너지. 네온 글로우가 번쩍이고,
   알림 팝업이 터지듯 등장하며, 글리터가 흩날리는 가운데 윙크 컷으로 마무리.
   Sequence: 6800ms + 500ms fadeOut = 7300ms total
     0    -  300ms : black
     300  - 1200ms : neon glow ring pulses (char.color) + beat drop
     1200 - 2400ms : intro image slides in from bottom + neon text flash + quote subtle
     2400 - 3600ms : notification badges pop in (3개, 순차) + glitter particles
     3600 - 5200ms : full image reveal + notifications fade + zoom settle
     5200 - 6800ms : hero quote + introLabel — 1.6s breathing room
     6800 - 7300ms : fadeOut → Phase 1 keyVisual

   zIndex: neonRing(1) < image(2) < notifications(3) < glitter(3) < vignette(4) < quote(6) < label(10)
   연계 파일:
   - characters.js — SIA: introStyle="neon", quoteSequence, focusBox
   - introStyles.js — neon: { duration: 7300 }
   - cinematic/index.js — INTRO_COMPONENTS 레지스트리
   ══════════════════════════════════════════════════════════ */

/* 알림 배지 데이터 — 시아의 인플루언서 정체성 표현 */
const NOTIFICATIONS = [
  { icon: "♡", text: "12.4K", delay: 0 },
  { icon: "💬", text: "3,847", delay: 200 },
  { icon: "🔔", text: "LIVE", delay: 400 },
];

export default function NeonIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;

  /* ── Timeline ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),    // neon ring pulse
      setTimeout(() => setBeat(2), 1200),   // image slide in + neon flash
      setTimeout(() => setBeat(3), 2400),   // notification pop + glitter
      setTimeout(() => setBeat(4), 3600),   // full reveal + settle
      setTimeout(() => setBeat(5), 5200),   // hero quote hold
      setTimeout(() => setFadingOut(true), config.duration - 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [config.duration]);

  const neonColor = char.color || "oklch(0.72 0.14 250)";

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
        background: "oklch(0.03 0.02 265)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* ── Neon ring pulse — Beat 1, 중앙에서 확장 후 소멸 ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: isMobile ? 120 : 180,
          height: isMobile ? 120 : 180,
          marginLeft: isMobile ? -60 : -90,
          marginTop: isMobile ? -60 : -90,
          borderRadius: "50%",
          border: `2px solid ${neonColor}`,
          boxShadow: `0 0 20px ${neonColor}88, 0 0 40px ${neonColor}44, inset 0 0 20px ${neonColor}22`,
          opacity: beat === 1 ? 0.9 : 0,
          transform: beat >= 1 ? "scale(2.5)" : "scale(0.3)",
          transition: "opacity 0.6s ease-out, transform 0.9s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 1, pointerEvents: "none",
        }}
      />

      {/* ── 2차 neon ring — Beat 1, 시간차 확장 ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: isMobile ? 80 : 120,
          height: isMobile ? 80 : 120,
          marginLeft: isMobile ? -40 : -60,
          marginTop: isMobile ? -40 : -60,
          borderRadius: "50%",
          border: `1px solid ${neonColor}`,
          boxShadow: `0 0 12px ${neonColor}66`,
          opacity: beat === 1 ? 0.6 : 0,
          transform: beat >= 1 ? "scale(3.0)" : "scale(0.5)",
          transition: "opacity 0.8s ease-out 0.15s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.15s",
          zIndex: 1, pointerEvents: "none",
        }}
      />

      {/* ── Main image — Beat 2: slide up, Beat 4: settle ── */}
      <img
        src={introSrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          transform: beat < 2
            ? "translateY(8%) scale(1.1)"
            : beat < 4
              ? "translateY(0%) scale(1.05)"
              : "translateY(0%) scale(1.0)",
          opacity: beat >= 2 ? 1 : 0,
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Neon glow overlay — Beat 2~3, 이미지 위 네온 글로우 ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, ${neonColor}18 0%, oklch(0 0 0 / 0) 40%, oklch(0 0 0 / 0) 60%, ${neonColor}12 100%)`,
          mixBlendMode: "screen",
          opacity: beat >= 2 && beat < 4 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 2, pointerEvents: "none",
        }}
      />

      {/* ── Notification badges — Beat 3, 순차 팝인 ── */}
      {NOTIFICATIONS.map((n, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${18 + i * 12}%`,
            right: isMobile ? 16 : 48,
            background: "oklch(0.12 0.02 265 / 0.85)",
            border: `1px solid ${neonColor}44`,
            borderRadius: 8,
            padding: "6px 14px",
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--f-body)", fontSize: isMobile ? 12 : 14,
            color: "oklch(0.9 0 0)",
            boxShadow: `0 4px 16px oklch(0 0 0 / 0.4), 0 0 8px ${neonColor}22`,
            opacity: beat === 3 ? 1 : 0,
            transform: beat === 3 ? "translateX(0) scale(1)" : "translateX(20px) scale(0.8)",
            transition: `opacity 0.4s ease-out ${n.delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${n.delay}ms`,
            zIndex: 3, pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: isMobile ? 14 : 16 }}>{n.icon}</span>
          <span style={{ fontWeight: 600, color: neonColor }}>{n.text}</span>
        </div>
      ))}

      {/* ── Vignette (Beat 2+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.5) 85%)`,
          opacity: beat >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          zIndex: 4, pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 2~4) ── */}
      <CenteredQuote
        char={char} isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 2 && beat < 5}
      />

      {/* ── CenteredQuote hero (Beat 5+) — 1.6s hold before fadeOut ── */}
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
