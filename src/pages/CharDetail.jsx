import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import { characters } from "../data/characters";
import { cdnExprUrl, EXPRESSION_LABELS } from "../utils/cdn";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ══════════════════════════════════════════════════════════
   JGR — 완전 분리 렌더 블록 (module scope)
   state/effect/JSX 전부 여기. parent에 JGR 코드 0줄.
   ══════════════════════════════════════════════════════════ */
function JgrCharDetail({ char, isMobile, prevChar, nextChar, sameAgency }) {
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
  const [lightbox, setLightbox] = useState(null);
  const [exprErrors, setExprErrors] = useState({});
  const timerRefs = useRef([]);
  const exprSectionRef = useRef(null);

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

  // Preload
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

  // Beat timing (after preload)
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

  // Lightbox popstate + ESC
  const jgrClosedByButton = useRef(false);
  useEffect(() => {
    if (!lightbox) return;
    jgrClosedByButton.current = false;
    window.history.pushState({ lightbox: true }, "");
    function onPop() {
      if (!jgrClosedByButton.current) setLightbox(null);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [!!lightbox]);

  function closeJgrLightbox() {
    jgrClosedByButton.current = true;
    setLightbox(null);
    window.history.back();
  }

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") closeJgrLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  function skipIntro() {
    timerRefs.current.forEach(clearTimeout);
    setJgrBeat(0); setJgrFadingOut(false);
    setPhase(2); setSkipped(true);
    window.scrollTo(0, 0);
    document.body.style.overflow = "";
  }

  // Skip listeners
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

      {/* ══════════ bgDeep 커버 (cinematic 종료) ══════════ */}
      <div style={{ position: "relative", zIndex: 2, background: C.bgDeep }}>
        {/* Expressions */}
        {char.expressions && char.expressions.length > 0 && (
          <section ref={exprSectionRef} style={{ padding: isMobile ? "48px 24px" : "64px 64px", maxWidth: 1100, margin: "0 auto" }}>
            <h3 style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, marginBottom: 6 }}>Concept Art &amp; Expressions</h3>
            <p style={{ fontFamily: "var(--f-body)", fontSize: 12, color: C.text35, margin: `0 0 ${isMobile ? 20 : 28}px` }}>미리보기 · 전체 에셋은 갤러리에서 확인하세요</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 14 }}>
              {char.expressions.slice(0, 4).map((key) => {
                const exprSrc = cdnExprUrl(char.cdnId, key);
                const hasError = exprErrors[key];
                return (
                  <button key={key} onClick={() => !hasError && setLightbox({ key, src: exprSrc })} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: hasError ? "default" : "pointer", textAlign: "left", outline: "none", aspectRatio: "1/1", backgroundColor: C.bgCard, borderWidth: 1, borderStyle: "solid", borderColor: C.border06, overflow: "hidden", position: "relative", transition: `border-color 0.3s ${EASE}` }}
                    onMouseEnter={(e) => { if (!hasError) e.currentTarget.style.borderColor = char.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; }}>
                    {!hasError ? (
                      <img src={exprSrc} alt={EXPRESSION_LABELS[key]} onError={() => setExprErrors((prev) => ({ ...prev, [key]: true }))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 13, color: C.text25 }}>{EXPRESSION_LABELS[key]}</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: `linear-gradient(to top, ${C.bgDeep}, transparent)` }}>
                      <span style={{ fontFamily: "var(--f-body)", fontSize: 10, color: C.text45 }}>{EXPRESSION_LABELS[key]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: isMobile ? 20 : 28, textAlign: "center" }}>
              <Link to={`/gallery?character=${char.id}`} style={{
                display: "inline-block", padding: isMobile ? "12px 28px" : "14px 36px",
                fontFamily: "var(--f-display-en)", fontSize: 11, letterSpacing: "0.2em",
                textTransform: "uppercase", color: char.color, textDecoration: "none",
                border: `1px solid ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
                background: C.bgCard, transition: `border-color 0.3s ${EASE}`,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = char.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `color-mix(in oklch, ${char.color} 30%, transparent)`; }}>
                View All in Gallery &rarr;
              </Link>
            </div>
          </section>
        )}

        {/* Navigation */}
        <section style={{ padding: isMobile ? "32px 24px 48px" : "48px 64px 80px", maxWidth: 1100, margin: "0 auto" }}>
          {sameAgency.length > 0 && (
            <div style={{ marginBottom: isMobile ? 32 : 48 }}>
              <h3 style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, marginBottom: isMobile ? 16 : 20 }}>Same Agency</h3>
              <div style={{ display: "flex", gap: isMobile ? 10 : 16, flexWrap: "wrap" }}>
                {sameAgency.map((c) => (
                  <Link key={c.id} to={`/characters/${c.id}`} style={{ textDecoration: "none", padding: isMobile ? "10px 16px" : "12px 20px", background: C.bgCard, border: `1px solid ${C.border06}`, display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; }}>
                    <span style={{ color: c.color, fontSize: 8 }}>●</span>
                    <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text55 }}>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: `1px solid ${C.border06}` }}>
            {prevChar ? <Link to={`/characters/${prevChar.id}`} style={{ textDecoration: "none", color: C.text35, fontSize: 12, fontFamily: "var(--f-body)" }}>&larr; {prevChar.name}</Link> : <span />}
            {nextChar ? <Link to={`/characters/${nextChar.id}`} style={{ textDecoration: "none", color: C.text35, fontSize: 12, fontFamily: "var(--f-body)" }}>{nextChar.name} &rarr;</Link> : <span />}
          </div>
        </section>

        <Footer isMobile={isMobile} />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label="이미지 상세보기" onClick={closeJgrLightbox} style={{ position: "fixed", inset: 0, zIndex: 9999, background: C.bgOverlay, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: isMobile ? "90vw" : "60vw", maxHeight: "80vh", position: "relative" }}>
            <img src={lightbox.src} alt={EXPRESSION_LABELS[lightbox.key]} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", border: `1px solid ${C.border10}` }} />
            <p style={{ textAlign: "center", fontFamily: "var(--f-body)", fontSize: 13, color: C.text55, marginTop: 12 }}>{char.name} — {EXPRESSION_LABELS[lightbox.key]}</p>
            <button onClick={closeJgrLightbox} style={{ position: "absolute", top: -12, right: -12, width: 32, height: 32, background: C.bgDeep, border: `1px solid ${C.border10}`, borderRadius: "50%", color: C.text55, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CharDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [glitchDone, setGlitchDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [exprErrors, setExprErrors] = useState({});
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [contentReached, setContentReached] = useState(false);
  const timerRefs = useRef([]);
  const imgRef = useRef(null);
  const contentRef = useRef(null);

  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar = charIndex < characters.length - 1 ? characters[charIndex + 1] : null;
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  // Reset + animation sequence
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

  // Lightbox popstate + ESC
  const mainClosedByButton = useRef(false);
  useEffect(() => {
    if (!lightbox) return;
    mainClosedByButton.current = false;
    window.history.pushState({ lightbox: true }, "");
    function onPop() {
      if (!mainClosedByButton.current) setLightbox(null);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [!!lightbox]);

  function closeMainLightbox() {
    mainClosedByButton.current = true;
    setLightbox(null);
    window.history.back();
  }

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") closeMainLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // Content section observer (seam cue dismissal)
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setContentReached(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [name]);

  // Mouse tilt (desktop only, phase 2)
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

  const [exprRef, exprV] = useReveal(0.1);
  const [navRef, navV] = useReveal(0.1);

  const showPhase2Cue = phase === 2 && !contentReached;
  const cueCopy = char
    ? (char.expressions?.length ? "Expressions Below" : "Continue Below")
    : "";

  if (!char) {
    return (
      <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-body)" }}>
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>캐릭터를 찾을 수 없습니다.</p>
        <Link to="/" style={{ color: C.gold, textDecoration: "none", fontSize: 13, letterSpacing: "0.1em" }}>&larr; 메인으로 돌아가기</Link>
      </div>
    );
  }

  // JGR → 완전 분리 렌더 블록
  if (char.id === "janggru") {
    return <JgrCharDetail char={char} isMobile={isMobile} prevChar={prevChar} nextChar={nextChar} sameAgency={sameAgency} />;
  }

  const hasImage = char.image && !imgError;
  const profileSrc = char.profile || char.image; // Phase 2 uses profile if available
  const t = (delay) => `all 1s ${EASE} ${delay}s`;

  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  // Image container styles
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
          <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 15 : 18, color: C.text70, fontStyle: "italic", margin: 0, lineHeight: 1.6, textAlign: "center", opacity: uiReady ? 1 : 0, transform: uiReady ? "translateY(0)" : "translateY(16px)", transition: t(0.6) }}>
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

            {/* Signature — below profile image */}
            {char.sign && phase === 2 && (
              <div style={{
                marginTop: 16, textAlign: "center",
                opacity: phase === 2 ? 1 : 0,
                transition: `opacity 0.8s ${EASE} 0.5s`,
              }}>
                <img
                  src={char.sign}
                  alt={`${char.name} signature`}
                  style={{
                    maxWidth: isMobile ? 160 : 220,
                    height: "auto",
                    opacity: 0.85,
                    filter: "drop-shadow(0 2px 12px oklch(0 0 0 / 0.5))",
                  }}
                />
              </div>
            )}
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
            <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 16 : 17, color: char.color, fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.7, wordBreak: "keep-all" }}>
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

      {/* ══════════ Concept Art & Expressions Preview ══════════ */}
      {char.expressions && char.expressions.length > 0 && (
        <section ref={(el) => { exprRef.current = el; contentRef.current = el; }} style={{ position: "relative", zIndex: 2, padding: isMobile ? "48px 24px" : "64px 64px", maxWidth: 1100, margin: "0 auto", opacity: exprV ? 1 : 0, transform: exprV ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}` }}>
          <h3 style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, marginBottom: 6 }}>
            Concept Art &amp; Expressions
          </h3>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 12, color: C.text35, margin: `0 0 ${isMobile ? 20 : 28}px` }}>
            미리보기 · 전체 에셋은 갤러리에서 확인하세요
          </p>

          {/* Preview grid — show first 4 expressions only */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 14 }}>
            {char.expressions.slice(0, 4).map((key) => {
              const exprSrc = cdnExprUrl(char.cdnId, key);
              const hasError = exprErrors[key];
              return (
                <button key={key} onClick={() => !hasError && setLightbox({ key, src: exprSrc })} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: hasError ? "default" : "pointer", textAlign: "left", outline: "none", aspectRatio: "1/1", backgroundColor: C.bgCard, borderWidth: 1, borderStyle: "solid", borderColor: C.border06, overflow: "hidden", position: "relative", transition: `border-color 0.3s ${EASE}` }}
                  onMouseEnter={(e) => { if (!hasError) e.currentTarget.style.borderColor = char.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; }}
                >
                  {!hasError ? (
                    <img src={exprSrc} alt={EXPRESSION_LABELS[key]} onError={() => setExprErrors((prev) => ({ ...prev, [key]: true }))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: `radial-gradient(circle, ${`color-mix(in oklch, ${char.color} 8%, transparent)`}, transparent)` }}>
                      <span style={{ fontSize: isMobile ? 11 : 13, color: C.text25, fontFamily: "var(--f-body)" }}>{EXPRESSION_LABELS[key]}</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "4px 6px" : "6px 10px", background: `linear-gradient(to top, ${C.bgDeep}, transparent)` }}>
                    <span style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 9 : 10, color: C.text45, letterSpacing: "0.05em" }}>{EXPRESSION_LABELS[key]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* View all in Gallery button */}
          <div style={{ marginTop: isMobile ? 20 : 28, textAlign: "center" }}>
            <Link
              to={`/gallery?character=${char.id}`}
              style={{
                display: "inline-block",
                padding: isMobile ? "12px 28px" : "14px 36px",
                fontFamily: "var(--f-display-en)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: char.color,
                textDecoration: "none",
                border: `1px solid ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
                background: C.bgCard,
                transition: `border-color 0.3s ${EASE}, box-shadow 0.3s ${EASE}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = char.color;
                e.currentTarget.style.boxShadow = `0 0 20px ${`color-mix(in oklch, ${char.color} 15%, transparent)`}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `color-mix(in oklch, ${char.color} 30%, transparent)`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              View All in Gallery &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* ══════════ Navigation ══════════ */}
      <section ref={(el) => { navRef.current = el; if (!(char.expressions?.length)) contentRef.current = el; }} style={{ position: "relative", zIndex: 2, padding: isMobile ? "32px 24px 48px" : "48px 64px 80px", maxWidth: 1100, margin: "0 auto", opacity: navV ? 1 : 0, transform: navV ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}` }}>
        {sameAgency.length > 0 && (
          <div style={{ marginBottom: isMobile ? 32 : 48 }}>
            <h3 style={{ fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldText, marginBottom: isMobile ? 16 : 20 }}>Same Agency</h3>
            <div style={{ display: "flex", gap: isMobile ? 10 : 16, flexWrap: "wrap" }}>
              {sameAgency.map((c) => (
                <Link key={c.id} to={`/characters/${c.id}`} style={{ textDecoration: "none", padding: isMobile ? "10px 16px" : "12px 20px", background: C.bgCard, border: `1px solid ${C.border06}`, display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 0 16px ${`color-mix(in oklch, ${c.color} 20%, transparent)`}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ color: c.color, fontSize: 8 }}>●</span>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text55 }}>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: `1px solid ${C.border06}` }}>
          {prevChar ? (
            <Link to={`/characters/${prevChar.id}`} style={{ textDecoration: "none", color: C.text35, fontSize: 12, fontFamily: "var(--f-body)", transition: "color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}>
              &larr; {prevChar.name}
            </Link>
          ) : <span />}
          {nextChar ? (
            <Link to={`/characters/${nextChar.id}`} style={{ textDecoration: "none", color: C.text35, fontSize: 12, fontFamily: "var(--f-body)", transition: "color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}>
              {nextChar.name} &rarr;
            </Link>
          ) : <span />}
        </div>
      </section>

      {/* ══════════ Lightbox ══════════ */}
      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label="이미지 상세보기" onClick={closeMainLightbox} style={{ position: "fixed", inset: 0, zIndex: 9999, background: C.bgOverlay, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: isMobile ? "90vw" : "60vw", maxHeight: "80vh", position: "relative" }}>
            <img src={lightbox.src} alt={EXPRESSION_LABELS[lightbox.key]} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", border: `1px solid ${C.border10}` }} />
            <p style={{ textAlign: "center", fontFamily: "var(--f-body)", fontSize: 13, color: C.text55, marginTop: 12 }}>{char.name} — {EXPRESSION_LABELS[lightbox.key]}</p>
            <button onClick={closeMainLightbox} style={{ position: "absolute", top: -12, right: -12, width: 32, height: 32, background: C.bgDeep, border: `1px solid ${C.border10}`, borderRadius: "50%", color: C.text55, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
      )}

      <Footer isMobile={isMobile} />
    </div>
  );
}
