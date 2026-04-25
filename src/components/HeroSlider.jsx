import { useState, useEffect, useCallback, useRef } from "react";
import C from "../styles/tokens";
import { EDENCHAT_PLAYER_URL } from "../data/links";
import { cdnUrl } from "../utils/cdn";

const BG_IMAGES = Array.from({ length: 9 }, (_, i) =>
  cdnUrl(`bg${i + 3}.webp`)
);
const SLIDE_INTERVAL = 6000;
const FADE_MS = 1200;

export default function HeroSlider({ isMobile }) {
  const [uiReady, setUiReady] = useState(false);
  const [loadedSet, setLoadedSet] = useState(new Set());
  const [anyLoaded, setAnyLoaded] = useState(false);
  const [autoplayReady, setAutoplayReady] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const loadedRef = useRef(new Set());

  const markLoaded = useCallback((idx) => {
    loadedRef.current.add(idx);
    setLoadedSet((prev) => {
      const s = new Set(prev);
      s.add(idx);
      return s;
    });
    setAnyLoaded(true);
  }, []);

  /* ── Staged preload: first 2 images, then rest sequentially ── */
  useEffect(() => {
    let cancelled = false;

    function preloadImage(src, idx) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => { markLoaded(idx); resolve(); };
        img.onerror = () => { markLoaded(idx); resolve(); };
      });
    }

    async function run() {
      /* Phase 1: load first 2 images (current + next) */
      await Promise.all([
        preloadImage(BG_IMAGES[0], 0),
        preloadImage(BG_IMAGES[1], 1),
      ]);
      if (cancelled) return;
      setAutoplayReady(true);

      /* Phase 2: sequentially preload remaining images */
      for (let i = 2; i < BG_IMAGES.length; i++) {
        if (cancelled) return;
        await preloadImage(BG_IMAGES[i], i);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [markLoaded]);

  useEffect(() => {
    const t = setTimeout(() => setUiReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!autoplayReady) return;
    /* reduced-motion: keep static image, no autoplay */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => {
        const next = (prev + 1) % BG_IMAGES.length;
        /* If next image hasn't loaded yet, stay on current slide */
        if (!loadedRef.current.has(next)) return prev;
        return next;
      });
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [autoplayReady]);

  const t = (delay) => `opacity 1s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`;

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: isMobile ? 560 : 680,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isMobile ? "0 24px" : "0 48px",
        overflow: "hidden",
        backgroundColor: C.bgDeep,
      }}
    >
      {/* ── Background Images (Pure CSS Crossfade) ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {anyLoaded &&
          BG_IMAGES.map((url, idx) => (
            <div
              key={`bg-${idx}`}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: loadedSet.has(idx) ? `url(${url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: currentIdx === idx ? (isMobile ? 0.5 : 0.45) : 0,
                transition: `opacity ${FADE_MS}ms cubic-bezier(0.22,1,0.36,1)`,
                filter: isMobile ? "brightness(0.7) saturate(0.85)" : "brightness(0.65) saturate(0.85)",
                willChange: "opacity",
              }}
            />
          ))}
        {/* Images are preloaded via staged useEffect (first 2, then rest sequentially) */}
        {/* Fallback gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(
              ellipse at 50% 40%,
              oklch(0.18 0.04 80 / 0.6) 0%,
              oklch(0.12 0.02 260 / 0.4) 40%,
              ${C.bgDeep} 80%
            )`,
            opacity: !anyLoaded ? 1 : 0,
            transition: "opacity 2s ease",
            pointerEvents: "none",
          }}
        />
        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isMobile
              ? `linear-gradient(180deg, oklch(0.08 0.01 265 / 0.15) 0%, oklch(0.08 0.01 265 / 0.05) 30%, oklch(0.08 0.01 265 / 0.35) 70%, ${C.bgDeep} 100%)`
              : `linear-gradient(180deg, oklch(0.08 0.01 265 / 0.2) 0%, oklch(0.08 0.01 265 / 0.1) 30%, oklch(0.08 0.01 265 / 0.4) 70%, ${C.bgDeep} 100%)`,
          }}
        />
        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isMobile
              ? "radial-gradient(ellipse at center, transparent 40%, oklch(0.08 0.01 265 / 0.35) 70%, oklch(0.12 0.06 252 / 0.4) 100%)"
              : "radial-gradient(ellipse at center, transparent 35%, oklch(0.08 0.01 265 / 0.4) 70%, oklch(0.12 0.06 252 / 0.5) 100%)",
          }}
        />
      </div>

      {/* ── Orbit ring ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: isMobile ? 220 : 420,
          height: isMobile ? 220 : 420,
          borderRadius: "50%",
          border: `1px solid ${C.border05}`,
          animation: "spin 80s linear infinite",
          pointerEvents: "none",
          transform: "translate(-50%,-50%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -3,
            left: "50%",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: C.gold,
            boxShadow: `0 0 10px ${C.goldGlow}`,
          }}
        />
      </div>

      {/* ── Blue orbit ring (larger, reverse) ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: isMobile ? 280 : 540,
          height: isMobile ? 280 : 540,
          borderRadius: "50%",
          border: `1px solid ${C.primeBlueDim}`,
          animation: "spin 120s linear infinite reverse",
          pointerEvents: "none",
          transform: "translate(-50%,-50%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -2,
            left: "50%",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: C.primeBlue,
            boxShadow: `0 0 8px ${C.primeBlueGlow}`,
          }}
        />
      </div>

      {/* ── Sub label ── */}
      <p
        style={{
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 10 : 11,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: isMobile ? 14 : 20,
          opacity: uiReady ? 1 : 0,
          transform: uiReady ? "translateY(0)" : "translateY(16px)",
          transition: t(0.4),
          position: "relative",
          zIndex: 2,
        }}
      >
        Produce · Prism · Priority
      </p>

      {/* ── Title ── */}
      <h1
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile
            ? "clamp(38px,12vw,54px)"
            : "clamp(52px,7vw,92px)",
          fontWeight: 700,
          lineHeight: 1.1,
          color: C.white,
          margin: 0,
          opacity: uiReady ? 1 : 0,
          transform: uiReady ? "translateY(0)" : "translateY(30px)",
          transition: t(0.6),
          position: "relative",
          zIndex: 2,
          textShadow: `0 0 60px ${C.goldGlow}`,
        }}
      >
        프라임시티
        <span
          style={{
            display: "block",
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile
              ? "clamp(11px,3.5vw,15px)"
              : "clamp(14px,1.8vw,20px)",
            fontWeight: 300,
            letterSpacing: isMobile ? "0.35em" : "0.6em",
            color: C.text25,
            marginTop: isMobile ? 8 : 14,
            textTransform: "uppercase",
            textShadow: "none",
          }}
        >
          Prime City
        </span>
      </h1>

      {/* ── Divider ── */}
      <div
        style={{
          width: uiReady ? (isMobile ? 48 : 72) : 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          margin: isMobile ? "24px 0" : "36px 0",
          transition: "width 1.4s cubic-bezier(0.22,1,0.36,1) 0.9s",
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* ── Catchphrase ── */}
      <p
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 14 : 17,
          lineHeight: 1.9,
          color: C.text55,
          maxWidth: isMobile ? 300 : 520,
          margin: 0,
          fontWeight: 400,
          wordBreak: "keep-all",
          opacity: uiReady ? 1 : 0,
          transform: uiReady ? "translateY(0)" : "translateY(16px)",
          transition: t(1.1),
          position: "relative",
          zIndex: 2,
        }}
      >
        전 세계가 주목하는 단 하나의 무대.
        <br />
        <span style={{ color: C.gold, fontWeight: 500 }}>증명하라.</span>{" "}
        세계가 당신을 알게 된다.
      </p>

      {/* ── CTA ── */}
      <div
        style={{
          marginTop: isMobile ? 28 : 44,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 10 : 14,
          alignItems: "center",
          width: isMobile ? "100%" : "auto",
          maxWidth: isMobile ? 260 : "none",
          opacity: uiReady ? 1 : 0,
          transform: uiReady ? "translateY(0)" : "translateY(16px)",
          transition: t(1.3),
          position: "relative",
          zIndex: 2,
        }}
      >
        <a
          href={EDENCHAT_PLAYER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: isMobile ? "13px 0" : "13px 38px",
            width: isMobile ? "100%" : "auto",
            background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.65 0.12 75) 100%)`,
            border: "none",
            color: C.black,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "var(--f-body)",
            boxShadow: `0 0 28px ${C.goldGlow}`,
            transition: "box-shadow 0.4s, opacity 0.4s",
            textDecoration: "none",
            textAlign: "center",
            display: "inline-block",
          }}
        >
          플레이 시작
        </a>
        <a
          href="#world"
          style={{
            display: "inline-block",
            width: isMobile ? "100%" : "auto",
            textDecoration: "none",
            padding: isMobile ? "13px 0" : "13px 38px",
            background: "transparent",
            border: `1px solid ${C.text15}`,
            color: C.text45,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "var(--f-body)",
            transition: "border-color 0.4s, color 0.4s",
            textAlign: "center",
          }}
        >
          세계관 보기
        </a>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? 20 : 36,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: uiReady ? 0.3 : 0,
          transition: "opacity 1.5s ease 2.4s",
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-body)",
            fontSize: 8,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.gold,
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: isMobile ? 24 : 36,
            background: `linear-gradient(180deg, ${C.gold}, transparent)`,
            animation: "scrollPulse 2s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
