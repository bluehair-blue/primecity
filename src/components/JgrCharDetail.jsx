/* ══════════════════════════════════════════════════════════
   JgrCharDetail — 장그루(JGR) 전용 시네마틱 인트로
   ──────────────────────────────────────────────────────────
   역할: 장그루 캐릭터만의 영화적 인트로(세피아→풀컬러 2비트)와
   크레딧 스타일 프로필을 표시한다.

   왜 독립 컴포넌트인가?
   - JGR은 intro1/intro2 이미지 기반의 레거시 비트 시스템을 사용.
     CinematicCharDetail의 keyVisual + INTRO_COMPONENTS 레지스트리와 구조가 다름.
   - CLAUDE.md 관례: "JGR 이후 모든 시네마틱은 CinematicCharDetail 패턴으로 통일"
     → JGR만 예외적으로 독립 유지 (코드 특수성 + 안정 검증 완료).

   Phase/Beat 상태기계:
     Phase 0  — 초기 (에셋 프리로드 대기)
     Phase 1  — 시네마틱 오버레이 재생 (z:200, 전체 화면)
       Beat 0 — 블랙 스크린
       Beat 1 — intro1 세피아 (Ken Burns + 필름 그레인 + 비네트)
       Beat 2 — intro2 풀컬러 (블룸 이펙트)
     Phase 2  — 크레딧 프로필 (intro2 배경 + 슬라이드인 텍스트)

   시각 레이어 (Phase 1 오버레이):
     z:0  — intro1/intro2 이미지
     z:1  — 필름 그레인 + 비네트 + burn edge
     z:2  — 레터박스 (상하 7%)
     z:3  — Chapter 라벨 + 대사 텍스트

   연계 파일:
   - src/pages/CharDetail.jsx:44 — char.id === "janggru" 일 때 디스패치
   - src/data/characters.js — char.intro1, char.intro2 (CDN 이미지)
   - src/components/CharSign.jsx — 공용 사인 섹션
   - index.html — @keyframes: jgrKenBurns, charGlowPulse
   ══════════════════════════════════════════════════════════ */
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useCharLightbox from "../hooks/useCharLightbox";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Seo from "./Seo";
import CharLightbox from "./CharLightbox";
import CharExpressionsGrid from "./CharExpressionsGrid";
import CharNavigation from "./CharNavigation";
import CharSign from "./CharSign";

/* 프로젝트 전역 이징 — CLAUDE.md 디자인 시스템 규칙 */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function JgrCharDetail({ char, isMobile, prevChar, nextChar, sameAgency }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [phase, setPhase] = useState(0);
  const [jgrBeat, setJgrBeat] = useState(0);
  const [jgrAssetsReady, setJgrAssetsReady] = useState(false);
  const [jgrFallback, setJgrFallback] = useState(false);
  const [jgrFadingOut, setJgrFadingOut] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const { lightbox, setLightbox, close: closeLightbox } = useCharLightbox();
  const [exprErrors, setExprErrors] = useState({});
  const timerRefs = useRef([]);
  const exprSectionRef = useRef(null);

  /* showJgrIntro: 에셋 준비 + Phase 2 미진입 + 폴백 아님 → 인트로 오버레이 표시
     showJgrOverlay: fadeOut 중에도 오버레이 DOM 유지 (opacity 전환용) */
  const showJgrIntro = jgrAssetsReady && phase < 2 && !jgrFallback;
  const showJgrOverlay = showJgrIntro || jgrFadingOut;

  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  // Reset
  useEffect(() => {
    window.scrollTo(0, 0);
    setPhase(0); setJgrBeat(0); setJgrAssetsReady(false);
    setJgrFallback(false); setJgrFadingOut(false); setSkipped(false);
    setNavbarVisible(false); setLightbox(null); setExprErrors({});
    document.body.style.overflow = "";
    timerRefs.current.forEach(clearTimeout);
    return () => { timerRefs.current.forEach(clearTimeout); document.body.style.overflow = ""; };
  }, [name]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── intro1/intro2 이미지 프리로드 ──
     두 이미지 모두 로드 성공 → jgrAssetsReady=true → Phase 1 진입.
     하나라도 실패 → jgrFallback=true → 이름+태그라인만 표시하는 폴백 렌더.
     alive 플래그: 컴포넌트 언마운트 후 setState 방지. */
  useEffect(() => {
    if (!char?.intro1 || !char?.intro2) { setJgrFallback(true); return; }
    let alive = true;
    Promise.allSettled(
      [char.intro1, char.intro2].map(
        (src) => new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        })
      )
    ).then((results) => {
      if (!alive) return;
      if (results.every((r) => r.status === "fulfilled")) setJgrAssetsReady(true);
      else setJgrFallback(true);
    });
    return () => { alive = false; };
  }, [char?.intro1, char?.intro2]);

  // Fallback → simple intro
  useEffect(() => {
    if (!jgrFallback) return;
    const t = setTimeout(() => setPhase(2), 600);
    timerRefs.current = [t];
    return () => clearTimeout(t);
  }, [jgrFallback]);

  /* ── 비트 타이밍 시퀀스 ──
     에셋 준비 완료 후:
       300ms  → Beat 1 (세피아 이미지 + "보고있어? 이게―...")
       3400ms → Beat 2 (풀컬러 + "내 마지막 꿈이야.")
       7400ms → fadeOut 시작 → Phase 2 (크레딧 프로필)
     document.body.overflow = "hidden" → 인트로 중 스크롤 차단 */
  useEffect(() => {
    if (!jgrAssetsReady) return;
    setPhase(1);
    document.body.style.overflow = "hidden";
    const tb1 = setTimeout(() => setJgrBeat(1), 300);
    const tb2 = setTimeout(() => setJgrBeat(2), 3400);
    const tb3 = setTimeout(() => {
      setJgrFadingOut(true);
      setPhase(2);
      setTimeout(() => { setJgrFadingOut(false); document.body.style.overflow = ""; }, 500);
    }, 7400);
    timerRefs.current = [tb1, tb2, tb3];
    return () => timerRefs.current.forEach(clearTimeout);
  }, [jgrAssetsReady]);

  // Navbar visibility (Expressions)
  useEffect(() => {
    if (!exprSectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setNavbarVisible(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { threshold: 0.1 }
    );
    obs.observe(exprSectionRef.current);
    return () => obs.disconnect();
  }, []);

  function skipIntro() {
    timerRefs.current.forEach(clearTimeout);
    setJgrBeat(0); setJgrFadingOut(false);
    setPhase(2); setSkipped(true);
    window.scrollTo(0, 0);
    document.body.style.overflow = "";
  }

  /* ── 인트로 스킵 리스너 ──
     오버레이 표시 중 wheel/touchmove/Escape → skipIntro() 호출.
     passive:false → preventDefault()로 스크롤 차단 유지. */
  useEffect(() => {
    if (!showJgrOverlay) return;
    function onWheel(e) { e.preventDefault(); skipIntro(); }
    function onTouch(e) { e.preventDefault(); skipIntro(); }
    function onKey(e) { if (e.key === "Escape") skipIntro(); }
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, [showJgrOverlay]);

  /* d(): 스킵 시 모든 transition-delay를 0s로 → 즉시 Phase 2 프로필 표시.
     정상 재생 시에는 각 요소에 stagger delay 적용. */
  const d = (s) => skipped ? "0s" : `${s}s`;
  const show = phase === 2;

  // ── Fallback render ──
  if (jgrFallback) {
    return (
      <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", position: "relative" }}>
        <Seo title={char.name} description={`${char.name} — ${char.role}`} path={`/characters/${name}`} />
        <Navbar scrolled={scrolled} isMobile={isMobile} />
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <span style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: char.color, marginBottom: 12 }}>{char.agency}</span>
          <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(48px,14vw,64px)" : "clamp(64px,8vw,96px)", fontWeight: 700, color: C.white, margin: "0 0 12px", textAlign: "center" }}>{char.name}</h1>
          <p style={{ fontFamily: "var(--f-display-kr)", fontSize: 17, color: C.text70, fontStyle: "italic", textAlign: "center" }}>&ldquo;{char.tagline}&rdquo;</p>
        </section>
        <Footer isMobile={isMobile} />
      </div>
    );
  }

  // ── Main JGR render ──
  return (
    <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Seo title={char.name} description={`${char.name} — ${char.role}`} path={`/characters/${name}`} />

      {/* Navbar — Expressions 진입 후에만 표시 */}
      <div style={{ opacity: navbarVisible && !showJgrOverlay ? 1 : 0, transition: `opacity 0.5s ${EASE}`, pointerEvents: navbarVisible && !showJgrOverlay ? "auto" : "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Navbar scrolled={scrolled} isMobile={isMobile} />
      </div>

      {/* ══════════ Cinematic Intro Overlay ══════════ */}
      {showJgrOverlay && (
        <div onClick={skipIntro} style={{
          position: "fixed", inset: 0, zIndex: 200, background: "oklch(0 0 0)",
          opacity: jgrFadingOut ? 0 : 1, transition: "opacity 0.5s ease-out", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Beat 1: intro1 세피아 */}
          <img src={char.intro1} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: isMobile ? "65% 50%" : "center 40%",
            filter: jgrBeat === 1 ? "sepia(0.8) brightness(0.7) contrast(1.1)" : "sepia(0) brightness(0)",
            opacity: jgrBeat === 1 ? 1 : 0, transition: "filter 1.5s ease-out, opacity 1s ease-out",
            animation: jgrBeat >= 1 ? "jgrKenBurns 3.1s ease-in-out forwards" : "none",
          }} />
          {/* Beat 2: intro2 풀컬러 */}
          <img src={char.intro2} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: isMobile ? "50% 40%" : "center 30%",
            opacity: jgrBeat === 2 ? 1 : 0, transform: jgrBeat === 2 ? "scale(1)" : "scale(1.05)",
            transition: "opacity 1.2s ease-out, transform 3s ease-out",
          }} />
          {/* 필름 그레인 */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
            opacity: jgrBeat === 1 ? 0.35 : 0.08, mixBlendMode: "overlay",
            transition: "opacity 1.5s ease-out", pointerEvents: "none",
          }} />
          {/* 비네트 */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, oklch(0 0 0 / 0.7) 100%)", pointerEvents: "none" }} />
          {/* burn edge accent */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: isMobile ? "120px 120px" : "160px 160px",
            backgroundColor: "oklch(0.2 0.06 40)",
            backgroundBlendMode: "overlay",
            WebkitMaskImage: isMobile
              ? "linear-gradient(to right, black, transparent 35%, transparent 65%, black)"
              : "linear-gradient(to right, black, transparent 22%, transparent 78%, black)",
            maskImage: isMobile
              ? "linear-gradient(to right, black, transparent 35%, transparent 65%, black)"
              : "linear-gradient(to right, black, transparent 22%, transparent 78%, black)",
            opacity: jgrBeat === 1 ? (isMobile ? 0.55 : 0.45) : 0,
            mixBlendMode: "multiply",
            transition: "opacity 1s ease-out",
            pointerEvents: "none",
          }} />
          {/* Letterbox */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "7%", background: "oklch(0 0 0)", zIndex: 2 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "7%", background: "oklch(0 0 0)", zIndex: 2 }} />
          {/* Chapter label */}
          <span style={{
            position: "absolute", bottom: isMobile ? "10%" : "12%", left: isMobile ? 20 : 48,
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 11,
            letterSpacing: "0.25em", textTransform: "uppercase",
            color: "oklch(0.6 0 0)", opacity: jgrBeat >= 1 ? 0.6 : 0,
            transition: "opacity 1s ease-out", pointerEvents: "none", zIndex: 3,
          }}>Jang Gru / Retake</span>
          {/* 대사 */}
          <p style={{
            position: "relative", zIndex: 3, textAlign: "center",
            padding: isMobile ? "0 24px" : "0 48px",
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(20px,6vw,28px)" : "clamp(28px,3.5vw,42px)",
            fontWeight: 400, fontStyle: "italic",
            color: jgrBeat === 1 ? "oklch(0.85 0.03 80)" : "oklch(0.95 0 0)",
            margin: 0, lineHeight: 1.6,
            opacity: jgrBeat >= 1 ? 1 : 0, transform: jgrBeat >= 1 ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1s ease-out, transform 1s ease-out, color 1.2s ease-out",
            textShadow: "0 2px 24px oklch(0 0 0 / 0.8)",
          }}>
            {jgrBeat === 1 ? "보고있어? 이게―..." : "내 마지막 꿈이야."}
          </p>
          {/* Beat 2 블룸 */}
          {jgrBeat === 2 && (
            <div style={{
              position: "absolute", top: "15%", left: "50%",
              width: isMobile ? 200 : 400, height: isMobile ? 200 : 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, oklch(0.85 0.12 300 / 0.25), transparent 70%)",
              transform: "translate(-50%, -50%)", filter: "blur(40px)",
              animation: "charGlowPulse 3s ease-in-out infinite", pointerEvents: "none",
            }} />
          )}
        </div>
      )}

      {/* ══════════ Phase 2: intro2 배경 + 크레딧 프로필 ══════════ */}
      {/* intro2 fixed 배경 */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src={char.intro2} alt="" style={{
          width: "100%", height: "100%", objectFit: "cover",
          objectPosition: isMobile ? "50% 40%" : "center 30%",
          opacity: phase === 2 ? 1 : 0, transition: `opacity 0.8s ${EASE}`,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? "linear-gradient(to top, oklch(0 0 0 / 0.85) 30%, oklch(0 0 0 / 0.3) 60%, transparent)"
            : "linear-gradient(to right, oklch(0 0 0 / 0.8) 25%, oklch(0 0 0 / 0.3) 50%, transparent 70%)",
        }} />
      </div>

      {/* Hero 크레딧 블록 */}
      <section style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: isMobile ? "0 24px 80px" : "0 64px 100px" }}>
        {/* Back link */}
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          style={{
            position: "absolute", top: isMobile ? 24 : 40, left: isMobile ? 24 : 64,
            background: "none", border: "none", padding: 0,
            color: C.text35, fontSize: 12, letterSpacing: "0.08em",
            cursor: "pointer", fontFamily: "var(--f-body)",
            opacity: show ? 1 : 0, transition: `opacity 0.6s ${EASE} ${d(0)}`,
          }}>&larr; PRIME CITY</button>

        <div style={{ maxWidth: isMobile ? "100%" : 520 }}>
          {/* Chapter label */}
          <span style={{
            fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em",
            textTransform: "uppercase", color: char.color, display: "block", marginBottom: 12,
            opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)",
            transition: `opacity 0.8s ${EASE} ${d(0)}, transform 0.8s ${EASE} ${d(0)}`,
          }}>Jang Gru / Retake</span>

          {/* Name */}
          <h1 style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(32px,10vw,48px)" : "clamp(48px,5vw,64px)",
            fontWeight: 700, color: C.white, margin: "0 0 8px", lineHeight: 1.2,
            opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 0.8s ${EASE} ${d(0.15)}, transform 0.8s ${EASE} ${d(0.15)}`,
          }}>{char.name}</h1>

          {/* Accent line */}
          <div style={{
            width: 80, height: 2, marginBottom: 16,
            background: `linear-gradient(90deg, ${char.color}, transparent)`,
            transformOrigin: "left", transform: show ? "scaleX(1)" : "scaleX(0)",
            transition: `transform 0.6s ${EASE} ${d(0.25)}`,
          }} />

          {/* Role */}
          <p style={{
            fontFamily: "var(--f-body)", fontSize: 13, color: C.text55, margin: "0 0 16px",
            opacity: show ? 1 : 0, transition: `opacity 0.6s ${EASE} ${d(0.35)}`,
          }}>{char.role}{char.age && ` · ${char.age}`}</p>

          {/* Tagline */}
          <p style={{
            fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 15 : 17,
            color: char.color, fontStyle: "italic", margin: "0 0 20px",
            lineHeight: 1.7, wordBreak: "keep-all",
            opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
            transition: `opacity 0.8s ${EASE} ${d(0.5)}, transform 0.8s ${EASE} ${d(0.5)}`,
          }}>&ldquo;{char.tagline}&rdquo;</p>

          {/* Brief */}
          <p style={{
            fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 14,
            lineHeight: 1.9, color: C.text55, fontWeight: 300,
            wordBreak: "keep-all", margin: "0 0 28px",
            opacity: show ? 1 : 0, transition: `opacity 0.6s ${EASE} ${d(0.7)}`,
          }}>{char.brief}</p>

          {/* Profile fields */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {profileFields.map((field, i) => (
              <div key={field.en} style={{
                paddingLeft: 12, borderLeft: `2px solid ${char.color}`,
                opacity: show ? 1 : 0, transform: show ? "translateX(0)" : "translateX(20px)",
                transition: `opacity 0.6s ${EASE} ${d(0.85 + i * 0.1)}, transform 0.6s ${EASE} ${d(0.85 + i * 0.1)}`,
              }}>
                <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", color: char.color, textTransform: "uppercase" }}>{field.en}</span>
                <p style={{ fontFamily: "var(--f-body)", fontSize: 12, color: C.text45, margin: "4px 0 0", lineHeight: 1.6, wordBreak: "keep-all" }}>{field.value}</p>
              </div>
            ))}
          </div>

          {/* Traits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: show ? 1 : 0, transition: `opacity 0.6s ${EASE} ${d(1.25)}` }}>
            {char.signature && <p style={{ fontSize: 11, color: C.text35, fontFamily: "var(--f-body)", margin: 0 }}><span style={{ color: char.color }}>●</span> 시그니처: {char.signature}</p>}
            {char.personality && <p style={{ fontSize: 11, color: C.text35, fontFamily: "var(--f-body)", margin: 0 }}><span style={{ color: char.color }}>●</span> 성격: {char.personality}</p>}
          </div>
        </div>
      </section>

      {/* ══════════ 하단 섹션 (bgDeep 커버) ══════════
           background: C.bgDeep로 fixed intro2 배경을 덮는다.
           Expressions → Sign → Navigation → Footer 순서 (프로젝트 관례).
           Navbar는 exprSectionRef IntersectionObserver 트리거 후에만 표시. */}
      <div style={{ position: "relative", zIndex: 2, background: C.bgDeep }}>
        {/* Expressions */}
        <CharExpressionsGrid
          char={char}
          isMobile={isMobile}
          sectionRef={exprSectionRef}
          sectionStyle={{ position: "static" }}
          exprErrors={exprErrors}
          setExprErrors={setExprErrors}
          onOpen={(key, src) => setLightbox({ key, src })}
        />

        <CharSign char={char} isMobile={isMobile} />

        {/* Navigation */}
        <CharNavigation
          prevChar={prevChar}
          nextChar={nextChar}
          sameAgency={sameAgency}
          isMobile={isMobile}
          sectionStyle={{ position: "static" }}
        />

        <Footer isMobile={isMobile} />
      </div>

      {/* Lightbox */}
      <CharLightbox
        lightbox={lightbox}
        onClose={closeLightbox}
        charName={char.name}
        isMobile={isMobile}
      />
    </div>
  );
}
