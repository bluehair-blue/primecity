import { useEffect, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FlowIntro (APR) — snap-cut pair → deep→surface optical shift
   ------------------------------------------------------------
   Concept: 침대 씬의 두 focal(좌하/우상)이 "딱, 딱" cut으로 교체된 뒤,
   픽셀 왜곡 없이 "광학적" 변화만으로 수면 부상을 연출한다.
   - intro1: 하단에서 올라오는 어둠(depth haze)으로 깊이에 먹힌다
   - key: 상단에서 쏟아지는 빛(god rays)으로 수면 위로 밀려 올라온다
   왜곡 ❌, 빛과 초점의 변화 ✓.

   Sequence: 6400ms total
     0    -  300ms : black (ring opening)
     300  - 1600ms : Beat 1 — intro1 좌하 (25% 75%, scale 1.6) snap-in
     1600 - 2900ms : Beat 2 — intro1 우상 (75% 25%, scale 1.6) snap-cut
     2900 - 4700ms : Beat 3 — optical dive→surface (1800ms)
                              intro1: blur↑ brightness↓ scale↑ translateY↓ + depth haze
                              key   : blur↓ brightness↑ scale↓ translateY↑ + god rays 확장
                              wave wipe (subtle 장식)
     4700 - 5900ms : Beat 4 — key hero + hero quote (1.2s breathing)
     5900 - 6400ms : fadeOut → Phase 1 keyVisual

   Snap 연출 원칙: object-position 트랜지션 금지. 별도 img + opacity 120ms.
   Surface 연출 원칙: CSS filter 체이닝 + gradient overlay 광학 변화.

   Mobile: 동일 연출 (SVG 제거로 플랫폼 차이 없음).
   zIndex: ring(1) < intro1(2) < depth haze(2.5) < key(3) < god rays(3.5) < wave wipe(4) < vignette(5) < quote(6)
   ══════════════════════════════════════════════════════════ */

// Beat별 focal — 좌하 → 우상 대각선 snap
const BEAT1_FOCAL = { objectPosition: "25% 75%", scale: 1.6 };
const BEAT2_FOCAL = { objectPosition: "75% 25%", scale: 1.6 };

export default function FlowIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [surfacing, setSurfacing] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const introSrc = char.introAssets?.[0] || char.keyVisual;
  const keySrc = char.keyVisual;

  // ── Timeline ──
  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 1600),
      setTimeout(() => setBeat(3), 2900),         // optical dive → surface begins
      setTimeout(() => setSurfacing(true), 3300),  // 400ms in — key starts rising
      setTimeout(() => setBeat(4), 4700),          // key hero + hero quote
      setTimeout(() => setFadingOut(true), 5900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

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
        background: "oklch(0 0 0)",
        cursor: "pointer", overflow: "hidden",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
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
            ? "scale(1.75) translateY(8%)"
            : `scale(${BEAT2_FOCAL.scale})`,
          opacity: beat === 2 ? 1 : beat === 3 ? 0 : 0,
          filter: beat === 3 ? "blur(12px) brightness(0.35) saturate(1.3)" : "none",
          transition: beat === 3
            ? "opacity 1.6s ease-in, filter 1.6s ease-in, transform 1.8s ease-in"
            : "opacity 0.12s linear",
          zIndex: 2,
        }}
      />

      {/* ── Depth haze (Beat 3) — 하단에서 올라오는 어둠 그라디언트 ── */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: "70%",
          background:
            "linear-gradient(0deg, oklch(0.12 0.06 250 / 0.85) 0%, oklch(0.20 0.10 250 / 0.4) 50%, transparent 100%)",
          opacity: beat === 3 && !surfacing ? 1 : 0,
          transform: beat === 3 && !surfacing ? "translateY(0)" : "translateY(20%)",
          transition: "opacity 1.0s ease-out, transform 1.4s ease-out",
          zIndex: 2.5,
          pointerEvents: "none",
        }}
      />

      {/* ── Beat 3+: key 이미지 (깊이에서 부상) ── */}
      <img
        src={keySrc}
        alt=""
        style={{
          ...commonImg,
          objectPosition,
          transform: beat === 3 && !surfacing
            ? "scale(1.1) translateY(-8%)"
            : "none",
          opacity: beat >= 3 ? 1 : 0,
          filter: beat === 3 && !surfacing
            ? "blur(18px) brightness(0.42) saturate(0.85)"
            : beat === 3 && surfacing
            ? "blur(0) brightness(1) saturate(1)"
            : "none",
          transition: "opacity 1.6s ease-out, filter 1.4s ease-out, transform 1.6s ease-out",
          zIndex: 3,
        }}
      />

      {/* ── God rays (Beat 3 surfacing) — 상단에서 확장되는 빛 ── */}
      <div
        style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "120%", height: "80%",
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.92 0.10 245 / 0.55) 0%, oklch(0.78 0.14 250 / 0.22) 30%, transparent 65%)",
          opacity: beat === 3 && surfacing ? 1 : beat === 4 ? 0 : 0,
          transition: "opacity 1.3s ease-out",
          mixBlendMode: "screen",
          zIndex: 3.5,
          pointerEvents: "none",
        }}
      />

      {/* ── Wave wipe (Beat 3) — 블루 라이트 밴드 얇은 1회 스윕 (subtle) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 0%, transparent 47%, oklch(0.75 0.14 245 / 0.18) 50%, transparent 53%, transparent 100%)",
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

      {/* ── CenteredQuote hero (Beat 4+) ── */}
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
