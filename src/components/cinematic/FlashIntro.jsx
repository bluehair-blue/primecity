import { useEffect, useMemo, useState } from "react";
import CenteredQuote from "./CenteredQuote";

/* ══════════════════════════════════════════════════════════
   FlashIntro (MMR) — comment stream → motion blur → KV zoom × 3 → hero
   ------------------------------------------------------------
   Concept: SNS 댓글 스크롤(animated WebP decode 창구) → 모션블러 전환
            → KV 3단 줌인(좌상·좌하·우중) → hero settle
   Sequence: 8300ms + 500ms fadeOut = 8800ms total
     0    -  300ms : brand glow
     300  - 3000ms : 15개 댓글 chip 스크롤 (CenteredQuote subtle)
     3000 - 3400ms : 모션블러 브리지 (blur gust + key.webp 블러 페이드인)
     3400 - 4500ms : zoom #1 좌상 25%25%, scale 2.0→2.06 (1100ms)
     4500 - 5600ms : zoom #2 좌하 25%72%, scale 2.0→2.06 (1100ms)
     5600 - 6700ms : zoom #3 우중 75%50%, scale 2.0→2.06 (1100ms)
     6700 - 8300ms : settle → focusBox 복귀 + hero CenteredQuote (1600ms)
     8300 - 8800ms : fadeOut → Phase 1 (keyVisualFit: contain)

   PRELOAD_BUDGET_OVERRIDE.MMR 제거 — 댓글 2700ms가 decode 흡수
   ══════════════════════════════════════════════════════════ */

const ZOOMS = [
  { cx: 25, cy: 25, scale: 2.0 },  // 좌상
  { cx: 25, cy: 72, scale: 2.0 },  // 좌하
  { cx: 75, cy: 50, scale: 2.0 },  // 우중
];

const FAKE_NICKS = [
  "fan_01", "momonimo", "kpop_luv", "seoul_cam",
  "idol_diary", "pink_hae", "bluemoon_x", "n_tone",
  "starlight", "clip_daily", "viewcam", "midnightfm",
  "shinedown", "audience_k", "dailypop",
];

/* ── CommentStream: 15 chips scrolling bottom→top ── */
function CommentStream({ comments, char, isMobile, active, accelerate }) {
  const items = useMemo(
    () => comments.map((text, i) => ({
      text,
      delay: i * 155,
      nick: FAKE_NICKS[i % FAKE_NICKS.length],
    })),
    [comments]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0, right: 0,
        top: isMobile ? "28%" : "22%",
        bottom: isMobile ? "10%" : "12%",
        overflow: "hidden",
        zIndex: 4,
        pointerEvents: "none",
        filter: accelerate ? "blur(14px)" : "blur(0px)",
        transform: accelerate ? "translateY(-60px)" : "translateY(0)",
        opacity: active ? 1 : 0,
        transition:
          "filter 0.35s ease-in, transform 0.35s ease-in, opacity 0.4s ease-out",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: isMobile ? "5%" : "8%",
            right: isMobile ? "5%" : "35%",
            bottom: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "oklch(0 0 0 / 0.58)",
            borderLeft: `2px solid ${char.color}`,
            backdropFilter: "blur(6px)",
            fontFamily: "var(--f-body)",
            fontSize: isMobile ? 13 : 14,
            color: "oklch(0.95 0 0)",
            borderRadius: "0 4px 4px 0",
            animation: active
              ? `mmrCommentRise 2500ms ease-out ${item.delay}ms forwards`
              : "none",
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              width: 20, height: 20,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${char.color}, oklch(0.5 0.05 300))`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: char.color,
              fontSize: isMobile ? 11 : 12,
              flexShrink: 0,
              fontWeight: 600,
            }}
          >
            {item.nick}
          </span>
          <span style={{ opacity: 0.92 }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function FlashIntro({ char, isMobile, objectPosition, config, onSkip }) {
  const [beat, setBeat] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const comments = char.introComments || [];
  // Phase 0 전용 정적 이미지 (key.webp 은 animated WebP 라 화질·성능 저하)
  // Phase 1 은 CharDetail.jsx 에서 char.keyVisual 을 그대로 사용
  const introSrc = char.introAssets?.[0] || char.keyVisual;

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat(1), 300),
      setTimeout(() => setBeat(2), 3000),
      setTimeout(() => setBeat(3), 3400),
      setTimeout(() => setBeat(4), 4500),
      setTimeout(() => setBeat(5), 5600),
      setTimeout(() => setBeat(6), 6700),
      setTimeout(() => setFadingOut(true), 8300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const zoom = beat >= 3 && beat <= 5 ? ZOOMS[beat - 3] : null;
  const currentObjPos = zoom ? `${zoom.cx}% ${zoom.cy}%` : objectPosition;
  const currentScale  = beat === 6 ? 1.0 : zoom ? zoom.scale : 2.3;
  const currentBlur   = beat === 2 ? 20 : 0;

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
      {/* ── Brand glow (Beat 0~1) ── */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: `radial-gradient(ellipse at center, ${char.color}20 0%, oklch(0 0 0) 65%)`,
          opacity: beat <= 1 ? 1 : 0,
          transition: "opacity 0.7s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* ── Comment stream (Beat 1~2) ── */}
      <CommentStream
        comments={comments}
        char={char}
        isMobile={isMobile}
        active={beat >= 1 && beat <= 2}
        accelerate={beat === 2}
      />

      {/* ── Intro image: blur peek at Beat 2, zooms Beat 3~5, settle Beat 6 ──
          introAssets[0] (정적) → fallback key.webp (animated). Phase 0 전용. */}
      <img
        src={introSrc}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: currentObjPos,
          transform: `scale(${currentScale})`,
          transformOrigin: currentObjPos,
          filter: `blur(${currentBlur}px)`,
          opacity: beat >= 2 ? 1 : 0,
          transition: beat === 2
            ? "opacity 0.4s ease-out, filter 0.4s ease-out, transform 0.4s ease-out"
            : "object-position 0.18s ease-out, transform 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.35s ease-out",
          zIndex: 2,
        }}
      />

      {/* ── Vignette (Beat 3+) ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at center, oklch(0 0 0 / 0) 30%, oklch(0 0 0 / 0.55) 90%)",
          opacity: beat >= 3 ? 1 : 0,
          transition: "opacity 0.5s ease-out",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── CenteredQuote subtle (Beat 1~5) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="subtle"
        show={beat >= 1 && beat < 6}
        blurred={beat === 2}
      />

      {/* ── CenteredQuote hero (Beat 6+, 1.6s hold) ── */}
      <CenteredQuote
        char={char}
        isMobile={isMobile}
        emphasis="hero"
        show={beat >= 6}
      />

      {/* ── Chapter label (Beat 6+) ── */}
      {char.introLabel && (
        <span
          style={{
            position: "absolute", bottom: "7%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "oklch(0.82 0 0)",
            opacity: beat >= 6 ? 0.6 : 0,
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
