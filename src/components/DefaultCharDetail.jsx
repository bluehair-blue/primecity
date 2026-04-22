/* ══════════════════════════════════════════════════════════
   DefaultCharDetail — 기본 캐릭터 상세 (홀로그램 UI)
   ──────────────────────────────────────────────────────────
   역할: introStyle이 없는 캐릭터(SY, ERK, ELA, NIA, RAY, LPS,
   SIA, NOA, SPA)에 적용되는 사이버펑크 홀로그램 인트로 + 프로필 뷰.

   Phase 상태기계 (3단계):
     Phase 0 — 초기 (100ms 대기, DOM 마운트)
     Phase 1 — 이름+태그라인 중앙 표시 + 홀로그램 이미지 (2.1초)
     Phase 2 — 프로필 카드 전환 (이미지 축소 + 텍스트 슬라이드인)

   시각 레이어 구조 (z-index 순):
     z:0  — Particles 배경 (파티클 애니메이션)
     z:1  — Cyberpunk Background (fixed, 마키 + 그리드 + 워터마크)
     z:2  — Hero 섹션 (홀로그램 이미지 + 프로필 패널)
     z:2  — Lower sections (Expressions → Sign → Navigation → Footer)
     z:5  — Phase 1 오버레이 (이름+태그라인, phase 2에서 0으로 전환)
     top  — Lightbox (이미지 확대 시)

   연계 파일:
   - src/pages/CharDetail.jsx — 디스패처에서 introStyle 없는 캐릭터일 때 이 컴포넌트 렌더
   - src/data/characters.js — char 객체 (image, profile, color, expressions 등)
   - src/hooks/useReveal.js — IntersectionObserver 기반 스크롤 등장 애니메이션
   - src/hooks/useCharLightbox.js — 이미지 확대 라이트박스 상태
   - src/components/CharSign.jsx — 공용 사인 이미지 섹션
   - index.html — 전역 @keyframes: charGlitch, charGlowPulse, charScanline,
                  holoRingSpin, holoRingSpinReverse, bgMarquee, bgMarqueeReverse,
                  scrollPulse
   ══════════════════════════════════════════════════════════ */
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import useCharLightbox from "../hooks/useCharLightbox";
import Navbar from "./Navbar";
import Particles from "./Particles";
import Footer from "./Footer";
import Seo from "./Seo";
import CharLightbox from "./CharLightbox";
import CharExpressionsGrid from "./CharExpressionsGrid";
import CharNavigation from "./CharNavigation";
import CharSign from "./CharSign";

/* 프로젝트 전역 이징 — CLAUDE.md 디자인 시스템 규칙.
   모든 CharDetail 뷰(Default/JGR/Cinematic)에서 동일한 값 사용. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function DefaultCharDetail({ char, isMobile, prevChar, nextChar, sameAgency }) {
  const { name } = useParams();   // URL의 :name 파라미터 (캐릭터 id)
  const navigate = useNavigate();

  /* ── State ──
     scrolled       — Navbar 배경 전환용 (50px 기준)
     uiReady        — 100ms 후 true → Phase 1 진입 트리거
     phase          — 0(초기) → 1(홀로그램) → 2(프로필 카드). 전체 UX 흐름 제어
     glitchDone     — 600ms 후 true → 프로필 이미지의 charGlitch 애니메이션 종료
     imgError       — 이미지 로드 실패 시 "IMAGE COMING SOON" 폴백
     tilt           — 데스크톱 Phase 2에서 마우스 위치 → 3D 기울기 (perspective)
     contentReached — Phase 2 seam cue 표시/숨김 (Expressions 진입 시 해제) */
  const [scrolled, setScrolled] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [glitchDone, setGlitchDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { lightbox, setLightbox, close: closeLightbox } = useCharLightbox();
  const [exprErrors, setExprErrors] = useState({});
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [contentReached, setContentReached] = useState(false);
  const timerRefs = useRef([]);  // 타이머 정리용 — cleanup에서 forEach(clearTimeout)
  const imgRef = useRef(null);   // 이미지 컨테이너 — 마우스 틸트 좌표 계산용
  const contentRef = useRef(null); // Expressions/Navigation 섹션 — seam cue IntersectionObserver용

  /* ── 캐릭터 전환 시 전체 리셋 + Phase 타이밍 시퀀스 ──
     [name] 의존 → /characters/seoyun → /characters/ella 이동 시 재실행.
     t1(100ms): Phase 0→1 (홀로그램 표시), t2(600ms): 글리치 종료,
     t3(2200ms): Phase 1→2 (프로필 카드 전환).
     cleanup에서 모든 타이머 해제 → 빠른 페이지 이동 시 메모리 누수 방지. */
  useEffect(() => {
    window.scrollTo(0, 0);
    setImgError(false); setUiReady(false); setPhase(0);
    setGlitchDone(false); setExprErrors({}); setLightbox(null);
    setTilt({ x: 0, y: 0 }); setContentReached(false);
    timerRefs.current.forEach(clearTimeout);
    const t1 = setTimeout(() => { setUiReady(true); setPhase(1); }, 100);
    const t2 = setTimeout(() => setGlitchDone(true), 600);
    const t3 = setTimeout(() => setPhase(2), 2200);
    timerRefs.current = [t1, t2, t3];

    return () => timerRefs.current.forEach(clearTimeout);
  }, [name]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── Seam cue 해제 옵저버 ──
     Phase 2에서 "Expressions Below" 안내 문구가 표시되는데,
     사용자가 스크롤하여 콘텐츠(Expressions 또는 Navigation)에 도달하면
     contentReached=true → 안내 문구 fade-out.
     → contentRef는 CharExpressionsGrid 또는 CharNavigation에 할당됨 (L586, L606) */
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setContentReached(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [name]);

  /* ─�� 마우스 틸트 (데스크톱, Phase 2 전용) ──
     이미지 컨테이너 중심으로부터의 거리를 ±3도로 변환.
     perspective(1000px) + rotateX/Y로 3D 카드 효과.
     모바일/Phase 1에서는 무시 → 홀로그램 표시 중 개입 방지. */
  function handleMouseMove(e) {
    if (isMobile || phase !== 2 || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientY - cy) / (rect.height / 2)) * -3;
    const y = ((e.clientX - cx) / (rect.width / 2)) * 3;
    setTilt({ x, y });
  }
  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  /* ── 스크롤 등장 애니메이션 (useReveal) ──
     IntersectionObserver로 요소가 뷰포트에 진입하면 exprV/navV = true.
     → opacity 0→1, translateY 30px→0 전환. threshold 0.1 = 10% 노출 시 트리거.
     연계: src/hooks/useReveal.js */
  const [exprRef, exprV] = useReveal(0.1);
  const [navRef, navV] = useReveal(0.1);

  /* showPhase2Cue: Phase 2 진입 후, 사용자가 아직 콘텐츠에 도달하지 않았을 때
     "Expressions Below" 또는 "Continue Below" 안내 표시 */
  const showPhase2Cue = phase === 2 && !contentReached;
  const cueCopy = char.expressions?.length ? "Expressions Below" : "Continue Below";

  const hasImage = char.image && !imgError;
  /* profileSrc: Phase 2에서 프로필 카드용 이미지. profile이 있으면 얼굴 클로즈업,
     없으면 key 이미지(전신)를 objectFit:cover로 사용. */
  const profileSrc = char.profile || char.image;
  /* t(): Phase 1 오버레이의 staggered 등장 애니메이션 딜레이 생성 헬퍼.
     agency→name→tagline 순서로 0.2s, 0.4s, 0.6s 딜레이. */
  const t = (delay) => `all 1s ${EASE} ${delay}s`;

  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  /* ── 이미지 컨테이너 반응형 스타일 ──
     Phase 1: 큰 홀로그램 (70vw / clamp), Phase 2: 프로필 카드 (280px / 300px).
     aspectRatio 2:3 — 캐릭터 이미지의 표준 비율.
     transition으로 Phase 전환 시 크기 애니메이션. */
  const imgContainerStyle = isMobile
    ? {
        width: "100%",
        maxWidth: phase === 2 ? 280 : "70vw",
        aspectRatio: "2/3",
        margin: phase === 2 ? "0 auto 32px" : "0 auto",
        transition: `max-width 1.2s ${EASE}, margin 1.2s ${EASE}`,
      }
    : {
        width: phase === 2 ? 300 : "clamp(320px, 40vw, 500px)",
        aspectRatio: "2/3",
        flexShrink: 0,
        transition: `width 1.2s ${EASE}`,
      };

  return (
    <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Seo title={char.name} description={`${char.name} — ${char.role}. 프라임시티 캐릭터 상세 프로필.`} path={`/characters/${name}`} />
      <Particles isMobile={isMobile} />
      <Navbar scrolled={scrolled} isMobile={isMobile} />

      {/* ══════════ Dynamic Cyberpunk Background ══════════ */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        {/* Vertical data grid */}
        <div style={{
          position: "absolute", inset: 0,
          background: `repeating-linear-gradient(90deg, transparent, transparent calc(10% - 1px), ${`color-mix(in oklch, ${char.color} 4%, transparent)`} 10%)`,
          maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        }} />

        {/* Floating name — right-aligned, slow drift */}
        <div style={{
          position: "absolute", top: isMobile ? "22%" : "30%", left: 0, right: 0,
          overflow: "hidden", pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(80px, 22vw, 120px)" : "clamp(160px, 18vw, 280px)",
            fontWeight: 900, color: char.color, opacity: 0.045,
            whiteSpace: "nowrap", lineHeight: 1,
            textAlign: "right",
            paddingBottom: "0.1em",
            animation: "nameFloat 25s ease-in-out infinite",
            willChange: "transform",
          }}>
            {char.name}
          </div>
        </div>
        <style>{`
          @keyframes nameFloat {
            0%, 100% { transform: translateX(5%); }
            50% { transform: translateX(-15%); }
          }
        `}</style>

        {/* Marquee line 1 — archive data (blurred for depth) */}
        <div style={{
          position: "absolute", top: isMobile ? "12%" : "16%", left: 0,
          display: "flex", width: "200%",
          animation: "bgMarquee 80s linear infinite",
          willChange: "transform",
        }}>
          {[1, 2].map((k) => (
            <div key={k} style={{
              flex: "0 0 50%",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? "clamp(36px, 9vw, 50px)" : "clamp(70px, 7vw, 100px)",
              fontWeight: 900, color: char.color, opacity: 0.025,
              whiteSpace: "nowrap", textTransform: "uppercase",
              letterSpacing: "0.08em", lineHeight: 0.8,
              filter: "blur(1px)",
            }}>
              {char.agency} ◆ PRIME CITY ARCHIVE ◆ DATA ID: {char.cdnId} ◆ {char.role} ◆&nbsp;
            </div>
          ))}
        </div>

        {/* Marquee line 2 — reverse, deeper blur */}
        <div style={{
          position: "absolute", top: isMobile ? "58%" : "62%", left: 0,
          display: "flex", width: "200%",
          animation: "bgMarqueeReverse 100s linear infinite",
          willChange: "transform",
        }}>
          {[1, 2].map((k) => (
            <div key={k} style={{
              flex: "0 0 50%",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? "clamp(36px, 9vw, 50px)" : "clamp(70px, 7vw, 100px)",
              fontWeight: 900, color: char.color, opacity: 0.018,
              whiteSpace: "nowrap", textTransform: "uppercase",
              letterSpacing: "0.08em", lineHeight: 0.9,
              filter: "blur(1.5px)",
            }}>
              SECTOR: {char.cdnId} ◆ CLASSIFICATION: CONFIDENTIAL ◆ PRIME CITY ◆&nbsp;
            </div>
          ))}
        </div>

        {/* Ghost watermark (large faded character portrait) */}
        {hasImage && (
          <img
            src={char.image} alt=""
            style={{
              position: "absolute",
              right: isMobile ? "-40%" : "-10%",
              bottom: "-10%",
              height: "120vh",
              objectFit: "contain",
              opacity: 0.035,
              filter: "grayscale(100%) contrast(150%)",
              mixBlendMode: "screen",
              transform: phase === 2 ? "translateX(0)" : "translateX(5%)",
              transition: `transform 2s ${EASE}`,
            }}
          />
        )}
      </div>

      {/* ══════════ Unified Hero + Profile ══════════ */}
      <section
        style={{
          position: "relative", zIndex: 2, minHeight: "100vh",
          display: "flex", flexDirection: "column",
          justifyContent: phase === 2 ? "flex-start" : "center",
          alignItems: "center",
          padding: phase === 2
            ? (isMobile ? "100px 24px 48px" : "120px 64px 80px")
            : (isMobile ? "80px 24px" : "80px 64px"),
          transition: `padding 1.2s ${EASE}`,
        }}
      >
        {/* Ambient glow — FIXED position, animated via transform */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: isMobile ? "50%" : "20%",
            width: isMobile ? 300 : 500,
            height: isMobile ? 300 : 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${char.color}, transparent 70%)`,
            animation: "charGlowPulse 4s ease-in-out infinite",
            pointerEvents: "none",
            transform: phase === 2
              ? "translate(-50%, -50%)"
              : `translate(${isMobile ? "-50%" : "150%"}, 75%)`,
            transition: `transform 1.2s ${EASE}`,
            willChange: "transform",
          }}
        />

        {/* Scanline */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom, transparent 50%, ${char.color} 50%, transparent 51%)`,
            backgroundSize: "100% 4px", opacity: 0.02,
            pointerEvents: "none", animation: "charScanline 8s linear infinite",
          }}
        />

        {/* ── Phase 1 overlay: Name + tagline ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            zIndex: phase === 2 ? 0 : 5,
            opacity: phase === 1 ? 1 : 0,
            pointerEvents: phase === 2 ? "none" : "auto",
            transition: `opacity 0.8s ${EASE}`,
          }}
        >
          <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: char.color, opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)", transition: t(0.2), marginBottom: 12 }}>
            {char.agency}
          </span>
          <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(48px, 14vw, 64px)" : "clamp(64px, 8vw, 96px)", fontWeight: 700, color: C.white, margin: "0 0 12px", lineHeight: 1.1, textAlign: "center", opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(24px)", transition: t(0.4), textShadow: `0 0 80px ${`color-mix(in oklch, ${char.color} 40%, transparent)`}` }}>
            {char.name}
          </h1>
          <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 15 : 18, color: C.text70, fontStyle: "italic", margin: 0, lineHeight: 1.6, textAlign: "center", whiteSpace: "pre-line", opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)", transition: t(0.6) }}>
            &ldquo;{char.tagline}&rdquo;
          </p>
        </div>

        {/* ── Back link (phase 2) ── */}
        <div style={{ width: "100%", maxWidth: 1100, opacity: phase === 2 ? 1 : 0, transition: `opacity 0.6s ${EASE} 0.3s`, marginBottom: isMobile ? 24 : 40 }}>
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
            style={{ background: "none", border: "none", padding: 0, color: C.text35, fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "var(--f-body)", transition: "color 0.3s" }}>
            &larr; PRIME CITY
          </button>
        </div>

        {/* ── Main content: Image + Profile panels ── */}
        <div
          style={{
            width: "100%", maxWidth: 1100,
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            gap: isMobile ? 0 : (phase === 2 ? 56 : 0),
            justifyContent: phase === 2 ? "flex-start" : "center",
            transition: `gap 1.2s ${EASE}`,
          }}
        >
          {/* Character image with hologram rings + tilt + glitch */}
          <div style={{ ...imgContainerStyle, position: "relative" }}>
            {/* Hologram ring 1 */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: "120%", height: "120%",
              border: `1px solid ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
              borderRadius: "50%",
              animation: "holoRingSpin 20s linear infinite",
              opacity: phase === 1 ? 0.6 : (phase === 2 ? 0.15 : 0),
              transition: `opacity 1s ${EASE}`,
              pointerEvents: "none",
              marginTop: "-60%", marginLeft: "-60%",
            }} />
            {/* Hologram ring 2 */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: "140%", height: "140%",
              border: `1px solid ${`color-mix(in oklch, ${char.color} 20%, transparent)`}`,
              borderRadius: "50%",
              animation: "holoRingSpinReverse 30s linear infinite",
              opacity: phase === 1 ? 0.4 : (phase === 2 ? 0.08 : 0),
              transition: `opacity 1s ${EASE}`,
              pointerEvents: "none",
              marginTop: "-70%", marginLeft: "-70%",
            }} />

            {/* Image container: Ghost Echo + SVG HUD Lock-on */}
            <div
              ref={imgRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%", height: "100%",
                background: phase === 2 ? C.bgCard : "transparent",
                border: `1px solid ${phase === 2 ? C.border06 : "transparent"}`,
                overflow: "hidden", position: "relative",
                opacity: uiReady ? 1 : 0,
                transform: `scale(${phase === 2 ? 1 : 1.05}) perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: `background 0.8s ${EASE}, border-color 0.8s ${EASE}, opacity 0.8s ${EASE} 0.1s, transform 0.6s ${EASE}`,
                willChange: "transform",
              }}
            >
              {hasImage ? (
                <>
                  {/* Ghost echo left (cyan silhouette) */}
                  <img
                    src={char.image} alt=""
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", pointerEvents: "none", mixBlendMode: "screen",
                      filter: `drop-shadow(0 0 12px oklch(0.7 0.15 200)) brightness(1.2)`,
                      opacity: phase === 2 ? 0 : 0.6,
                      transform: phase === 2 ? "scale(0.9) translateX(0)" : "scale(1) translateX(-12%)",
                      transition: `opacity 0.9s ${EASE}, transform 0.9s ${EASE}`,
                    }}
                  />
                  {/* Ghost echo right (character accent silhouette) */}
                  <img
                    src={char.image} alt=""
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", pointerEvents: "none", mixBlendMode: "screen",
                      filter: `drop-shadow(0 0 12px ${char.color}) brightness(1.2)`,
                      opacity: phase === 2 ? 0 : 0.6,
                      transform: phase === 2 ? "scale(0.9) translateX(0)" : "scale(1) translateX(12%)",
                      transition: `opacity 0.9s ${EASE}, transform 0.9s ${EASE}`,
                    }}
                  />
                  {/* Central hologram (Phase 1) */}
                  <img
                    src={char.image} alt={`${char.name} hologram`}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", pointerEvents: "none",
                      filter: `drop-shadow(0 0 20px ${`color-mix(in oklch, ${char.color} 50%, transparent)`})`,
                      opacity: phase === 2 ? 0 : 1,
                      transform: phase === 2 ? "scale(0.95)" : "scale(1)",
                      transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                    }}
                  />
                  {/* Profile card (Phase 2): focus lock-on with blur clear */}
                  <img
                    src={profileSrc} alt={char.name}
                    onError={() => setImgError(true)}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover",
                      opacity: phase === 2 ? 1 : 0,
                      filter: phase === 2 ? "blur(0px) brightness(1)" : "blur(8px) brightness(1.5)",
                      transform: phase === 2 ? "scale(1)" : "scale(1.1)",
                      transition: `opacity 0.8s ${EASE} 0.1s, filter 0.8s ${EASE} 0.1s, transform 0.8s ${EASE} 0.1s`,
                      animation: !glitchDone && uiReady ? "charGlitch 0.5s ease-out forwards" : "none",
                    }}
                  />
                  {/* Vignette — Phase 2 only, lighter on mobile */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(ellipse at center, transparent ${isMobile ? "50%" : "40%"}, ${C.bgDeep} 100%)`,
                    opacity: phase === 2 ? (isMobile ? 0.3 : 0.4) : 0,
                    transition: `opacity 1s ${EASE}`,
                    pointerEvents: "none",
                  }} />
                  {/* SVG HUD overlay: scan line + crosshair + corner brackets */}
                  <svg
                    viewBox="0 0 100 100" preserveAspectRatio="none"
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      pointerEvents: "none", zIndex: 5,
                      opacity: phase === 2 ? 1 : 0,
                      transition: `opacity 0.4s ${EASE} 0.2s`,
                    }}
                  >
                    {/* Scan line sweep */}
                    <line x1="0" y1="0" x2="100" y2="0"
                      stroke={char.color} strokeWidth="0.8" opacity={phase === 2 ? 0 : 0.8}
                      style={{
                        transform: phase === 2 ? "translateY(100px)" : "translateY(0)",
                        transition: phase === 2 ? "transform 1.2s linear 0.2s, opacity 0.2s ease 1.2s" : "none",
                      }}
                    />
                    {/* Crosshair lines */}
                    <line x1="50" y1="0" x2="50" y2="100"
                      stroke={`color-mix(in oklch, ${C.white} 20%, transparent)`} strokeWidth="0.3" strokeDasharray="2 2"
                      style={{ transformOrigin: "center", transform: phase === 2 ? "scaleY(1)" : "scaleY(0)", transition: `transform 1s ${EASE} 0.4s` }}
                    />
                    <line x1="0" y1="50" x2="100" y2="50"
                      stroke={`color-mix(in oklch, ${C.white} 20%, transparent)`} strokeWidth="0.3" strokeDasharray="2 2"
                      style={{ transformOrigin: "center", transform: phase === 2 ? "scaleX(1)" : "scaleX(0)", transition: `transform 1s ${EASE} 0.4s` }}
                    />
                    {/* Corner brackets (stroke-dashoffset draw) */}
                    {[
                      "M 0 15 L 0 0 L 15 0",
                      "M 85 0 L 100 0 L 100 15",
                      "M 100 85 L 100 100 L 85 100",
                      "M 15 100 L 0 100 L 0 85",
                    ].map((d, i) => (
                      <path key={i} d={d} fill="none" stroke={char.color} strokeWidth="0.8"
                        strokeDasharray="30" strokeDashoffset={phase === 2 ? 0 : 30}
                        style={{ transition: `stroke-dashoffset 0.8s ${EASE} 0.5s` }}
                      />
                    ))}
                  </svg>
                </>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: `radial-gradient(ellipse at 50% 30%, ${char.color}, ${C.bgDeep})` }}>
                  <span style={{ fontFamily: "var(--f-display-kr)", fontSize: phase === 2 ? 48 : (isMobile ? 80 : 120), fontWeight: 700, color: `color-mix(in oklch, ${char.color} 25%, transparent)`, transition: `font-size 1.2s ${EASE}`, lineHeight: 1 }}>
                    {char.name}
                  </span>
                  <span style={{ color: C.text15, fontSize: 10, letterSpacing: "0.1em", opacity: phase === 2 ? 1 : 0, transition: `opacity 0.6s ${EASE}` }}>
                    IMAGE COMING SOON
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Profile panels — slide in */}
          <div
            style={{
              flex: 1, minWidth: 0,
              opacity: phase === 2 ? 1 : 0,
              transform: phase === 2 ? "translateX(0)" : (isMobile ? "translateY(30px)" : "translateX(60px)"),
              transition: `opacity 1s ${EASE} 0.3s, transform 1s ${EASE} 0.3s`,
              pointerEvents: phase === 2 ? "auto" : "none",
            }}
          >
            {/* Signature tagline */}
            <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 16 : 17, color: char.color, fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.7, wordBreak: "keep-all", whiteSpace: "pre-line" }}>
              &ldquo;{char.tagline}&rdquo;
            </p>

            {/* Role + Age */}
            <p style={{ fontSize: 13, color: C.text45, fontFamily: "var(--f-body)", margin: "0 0 20px" }}>
              {char.role}{char.age && ` · ${char.age}`}
            </p>

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${char.color}, transparent)`, marginBottom: 20 }} />

            {/* Brief */}
            {char.brief && (
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 14, lineHeight: 1.9, color: C.text55, fontWeight: 300, wordBreak: "keep-all", margin: "0 0 28px" }}>
                {char.brief}
              </p>
            )}

            {/* Profile fields with animated border-left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {profileFields.map((field, i) => (
                <div
                  key={field.en}
                  style={{
                    position: "relative",
                    paddingLeft: 18,
                    opacity: phase === 2 ? 1 : 0,
                    transform: phase === 2 ? "translateX(0)" : "translateX(30px)",
                    transition: `opacity 0.8s ${EASE} ${0.5 + i * 0.12}s, transform 0.8s ${EASE} ${0.5 + i * 0.12}s`,
                  }}
                >
                  {/* Animated border-left line (scaleY 0→1) */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 2,
                    background: char.color,
                    transformOrigin: "top",
                    transform: phase === 2 ? "scaleY(1)" : "scaleY(0)",
                    transition: `transform 0.6s ${EASE} ${0.5 + i * 0.12}s`,
                  }} />
                  {/* Content — fades in after border draws */}
                  <div style={{
                    padding: "14px 16px",
                    background: C.bgCard,
                    opacity: phase === 2 ? 1 : 0,
                    transition: `opacity 0.5s ${EASE} ${0.65 + i * 0.12}s`,
                  }}>
                    <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", color: char.color, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      {field.en}
                    </span>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.7, color: C.text45, margin: 0, wordBreak: "keep-all" }}>
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Traits */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 0", borderTop: `1px solid ${C.border06}` }}>
              {char.signature && (
                <p style={{ fontSize: 12, color: C.text35, fontFamily: "var(--f-body)", margin: 0 }}>
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span> 시그니처: {char.signature}
                </p>
              )}
              {char.personality && (
                <p style={{ fontSize: 12, color: C.text35, fontFamily: "var(--f-body)", margin: 0 }}>
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span> 성격: {char.personality}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator (phase 1) */}
        <div style={{ position: "absolute", bottom: isMobile ? 24 : 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: phase === 1 ? 1 : 0, transition: `opacity 0.6s ${EASE}`, pointerEvents: "none" }}>
          <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.3em", color: C.text25, textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${char.color}, transparent)`, animation: "scrollPulse 2s ease-in-out infinite" }} />
        </div>

        {/* ── Phase 2 seam cue ── */}
        <div style={{ width: "100%", maxWidth: 1100, marginTop: isMobile ? 48 : 80 }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            opacity: showPhase2Cue ? 1 : 0,
            transform: showPhase2Cue ? "translateY(0)" : "translateY(-10px)",
            transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
            pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: "var(--f-display-en)", fontSize: 13,
              letterSpacing: "0.35em", textTransform: "uppercase", color: C.text35,
            }}>
              {cueCopy}
            </span>
            <div style={{
              width: isMobile ? 200 : 400, height: 1,
              background: `linear-gradient(90deg, transparent, ${char.color}, transparent)`,
              boxShadow: `0 0 12px ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
            }} />
            <div style={{
              width: 1, height: 48,
              background: `linear-gradient(to bottom, ${char.color}, transparent)`,
              animation: "scrollPulse 2s ease-in-out 2",
            }} />
          </div>
        </div>
      </section>

      {/* ══════════ 하단 섹션 ══════════
           Expressions → Sign → Navigation → Footer 순서.
           이 순서는 JgrCharDetail, CinematicCharDetail과 동일 (프로젝트 관례).
           sectionRef에 exprRef + contentRef를 동시 할당 → useReveal + seam cue 동시 동작. */}
      <CharExpressionsGrid
        char={char}
        isMobile={isMobile}
        sectionRef={(el) => { exprRef.current = el; contentRef.current = el; }}
        sectionStyle={{
          opacity: exprV ? 1 : 0,
          transform: exprV ? "translateY(0)" : "translateY(30px)",
          transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
        }}
        exprErrors={exprErrors}
        setExprErrors={setExprErrors}
        onOpen={(key, src) => setLightbox({ key, src })}
      />

      {/* ══════════ Sign ══════════ */}
      <CharSign char={char} isMobile={isMobile} />

      {/* ══════════ Navigation ══════════ */}
      <CharNavigation
        prevChar={prevChar}
        nextChar={nextChar}
        sameAgency={sameAgency}
        isMobile={isMobile}
        sectionRef={(el) => { navRef.current = el; if (!(char.expressions?.length)) contentRef.current = el; }}
        sectionStyle={{
          opacity: navV ? 1 : 0,
          transform: navV ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
        }}
      />

      {/* ══════════ Lightbox ══════════ */}
      <CharLightbox
        lightbox={lightbox}
        onClose={closeLightbox}
        charName={char.name}
        isMobile={isMobile}
      />

      <Footer isMobile={isMobile} />
    </div>
  );
}
