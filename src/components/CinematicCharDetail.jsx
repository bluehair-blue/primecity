/* ══════════════════════════════════════════════════════════
   CinematicCharDetail — 시네마틱 인트로 공용 뼈대
   ─────────────────────────────────────────────��────────────
   역할: introStyle을 가진 캐릭터(NHR, JSH, LSH, HSR, KHR,
   MIL, MMR, HSE — 8명)의 시네마틱 인트로 + KeyVisual 히어로
   + 하단 콘텐츠를 렌더한다.

   Phase 상태기계:
     Phase -1  LoadingShell — 프로그레스 바 (keyVisual + introAssets 프리로드)
     Phase  0  Intro overlay — INTRO_COMPONENTS 레지스트리에서 스타일별 컴포넌트 로드
     Phase  1  KeyVisual hero — fixed 배경 + 프로필 텍스트 + 마우스 틸트 + 반사
     Phase  2  하단 콘텐츠 — Expressions → Sign → Navigation → Footer

   Phase 전환 우선순위 (Phase -1에서):
     1) prefers-reduced-motion → Phase 1 직행 (인트로 건너뜀)
     2) 에셋 로드 완료 → Phase 0 (���트로 재생)
     3) 타임아웃 (500ms 기본) → Phase 1 (fall-open 안전장치)

   시각 레이어 (Phase 0+):
     z:0   — fixed keyVisual 배경 (틸트 + 반사 + 그래디언트 오버레이)
     z:2   — Phase 1 히어로 섹션 (이름 + 프로필 + bgMarquee)
     z:2   — 하단 섹션 (bgDeep 커버)
     z:100 — Navbar (Phase 2 IntersectionObserver 트리거 후)
     z:150 — Back 버튼 (Phase 1+)
     z:200 — Phase 0 인트로 오버레이 (StyleComponent)

   연계 파일:
   - src/pages/CharDetail.jsx:45 — char.introStyle 존재 시 디스패치
   - src/data/introStyles.js — INTRO_STYLE_CONFIG (duration, letterbox 등)
   - src/components/cinematic/index.js — INTRO_COMPONENTS 레지스트리
   - src/components/cinematic/*.jsx — 8개 스타일별 인트로 (CutawayIntro, SunriseIntro 등)
   - src/hooks/useImagePreloader.js — keyVisual + introAssets 프리로드
   - src/data/characters.js — keyVisual, introStyle, focusBox, quoteSequence 등
   - src/components/CharSign.jsx — 공용 사인 섹션
   - index.html — @keyframes: bgMarquee, bgMarqueeReverse, scrollPulse
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
import { useImagePreloader } from "../hooks/useImagePreloader";
import { INTRO_STYLE_CONFIG, PRELOAD_BUDGET_OVERRIDE, DEFAULT_PRELOAD_BUDGET } from "../data/introStyles";
import { INTRO_COMPONENTS } from "./cinematic";

/* 프로젝트 전역 이징 — CLAUDE.md 디자인 시스템 규칙 */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export default function CinematicCharDetail({ char, isMobile, prevChar, nextChar, sameAgency }) {
  const { name } = useParams();
  const navigate = useNavigate();

  /* ── 인트로 스타일 설정 ──
     config.duration: Phase 0 총 시간 (fadeOut 500ms 포함). 예: cutaway=6400ms
     preloadBudget: 에셋 로��� 타임아웃. 초과 시 Phase 1 직행 (fall-open).
     → src/data/introStyles.js에서 스타일별 설정 관리 */
  const config = INTRO_STYLE_CONFIG[char.introStyle] || {};
  const preloadBudget = PRELOAD_BUDGET_OVERRIDE[char.cdnId] ?? DEFAULT_PRELOAD_BUDGET;

  // ── Phase state machine ──
  const [phase, setPhase] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const { lightbox, setLightbox, close: closeLightbox } = useCharLightbox();
  const [exprErrors, setExprErrors] = useState({});
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const phase1Ref = useRef(null);
  const exprSectionRef = useRef(null);

  /* ── 이미지 프리로드 (Phase -1 LoadingShell) ──
     keyVisual + introAssets를 병렬 로드. progress(0~1)는 프로그레스 바에 반영.
     전부 로드 완료 → Phase 0, 타임아웃 → Phase 1 (fall-open).
     → src/hooks/useImagePreloader.js */
  const preloadUrls = [char.keyVisual, ...(char.introAssets || [])].filter(Boolean);
  const { loaded, total, timedOut, progress } = useImagePreloader(preloadUrls, { timeoutMs: preloadBudget });

  // ── Detect reduced-motion ──
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // ── Reset on character change ──
  useEffect(() => {
    window.scrollTo(0, 0);
    setPhase(-1);
    setNavbarVisible(false);
    setExprErrors({});
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [name]);

  // ── Shell → Phase transition ──
  // Priority:
  //   1) reduced-motion   → always skip cinematic → Phase 1
  //   2) all assets loaded in time → Phase 0 (cinematic plays)
  //   3) timedOut before fully loaded → fall-open to Phase 1
  useEffect(() => {
    if (phase !== -1) return;
    if (reducedMotion) {
      setPhase(1);
      return;
    }
    const fullyLoaded = loaded >= total;
    if (fullyLoaded) {
      setPhase(0);
      document.body.style.overflow = "hidden";
      return;
    }
    if (timedOut) {
      setPhase(1);
      return;
    }
    // still loading, wait
  }, [phase, loaded, total, timedOut, reducedMotion]);

  // ── Phase 0 → Phase 1 auto-advance ──
  useEffect(() => {
    if (phase !== 0) return;
    const duration = config.duration || 2000;
    const t = setTimeout(() => {
      setPhase(1);
      document.body.style.overflow = "";
    }, duration);
    return () => clearTimeout(t);
  }, [phase, config.duration]);

  // ── Skip on click/touch during Phase 0 ──
  const skipIntro = () => {
    if (phase !== 0) return;
    setPhase(1);
    document.body.style.overflow = "";
  };

  // ── Phase 1 → Phase 2 (scroll triggers navbar visibility state) ──
  useEffect(() => {
    if (phase !== 1) return;
    const handler = () => {
      if (window.scrollY > 80) {
        setPhase(2);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [phase]);

  // ── Scroll tracking for Navbar (Phase 2+) ──
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Mouse tilt (desktop Phase 1, ±1.5deg) ──
  useEffect(() => {
    if (isMobile || phase < 1) return;
    const handleMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setTilt({ x: ((e.clientY - cy) / cy) * -1.5, y: ((e.clientX - cx) / cx) * 1.5 });
    };
    const handleLeave = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [isMobile, phase]);

  // ── Navbar IntersectionObserver (show after Expressions visible) ──
  useEffect(() => {
    if (phase < 2 || !exprSectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNavbarVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(exprSectionRef.current);
    return () => obs.disconnect();
  }, [phase]);

  /* ── focusBox → objectPosition 변환 ──
     characters.js의 focusBox(cx/cy %)를 CSS objectPosition으로 변환.
     모바일/데스크톱 각각 다른 크롭 포인트 사용 가능.
     keyVisualFit:"contain" 캐릭터(JSH/KHR/MIL/NHR)는
     CinematicCharDetail 내부에서 objectPosition을 "50% 50%"로 오버라이드.
     → CLAUDE.md "focusBox 규칙" 참조 */
  const fb = char.focusBox || {};
  const focus = isMobile ? (fb.mobile || fb.desktop) : (fb.desktop || fb.mobile);
  const objectPosition = focus ? `${focus.cx}% ${focus.cy}%` : "center 30%";

  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  // ════════ PHASE -1: LoadingShell ════════
  if (phase === -1) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: C.bgDeep,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <Seo title={char.name} description={`${char.name} — ${char.role}`} path={`/characters/${name}`} />
        <div style={{
          fontFamily: "var(--f-display-en)", fontSize: 11,
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: C.text45, marginBottom: 16,
        }}>
          Loading {char.introLabel || char.name}
        </div>
        {/* Progress bar */}
        <div style={{
          width: 200, height: 2,
          background: C.border06,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${Math.round(progress * 100)}%`,
            background: char.color,
            transition: "width 0.3s ease-out",
          }} />
        </div>
      </div>
    );
  }

  /* ════════ PHASE 0+: Hero + (conditional) cinematic overlay ════════
     핵심 설계: Phase 0에서 인트로 오버레이를 Phase 1 히어로 위에 렌더.
     이렇게 하면 오버레이가 fadeOut될 때 자연스럽게 아래의 keyVisual이 드러남.
     (JGR 패턴에서 차용한 "overlay layer, not separate render branch" 접근)

     StyleComponent: INTRO_COMPONENTS 레지스트리에서 introStyle로 조회.
     미등록 스타일 → StyleComponent = undefined → Phase 0 건너뜀 (안전장치).
     → src/components/cinematic/index.js */
  const StyleComponent = INTRO_COMPONENTS[char.introStyle];

  return (
    <div style={{ background: C.bgDeep, color: C.white, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Seo title={char.name} description={`${char.name} — ${char.role}`} path={`/characters/${name}`} />

      {/* Navbar — visible after Phase 2 IntersectionObserver trigger */}
      <div style={{
        opacity: navbarVisible ? 1 : 0,
        pointerEvents: navbarVisible ? "auto" : "none",
        transition: "opacity 0.5s",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <Navbar scrolled={scrolled} isMobile={isMobile} />
      </div>

      {/* Fixed keyVisual 배경 (z:0) — 3개 레이어:
           1) keyVisual 이미지 (cover/contain, focusBox 기반 objectPosition)
           2) 반사 스트립 (scaleY(-1) + mask gradient, Phase 1+ 시 opacity 0.18)
           3) 그래디언트 오버레이 (모바일: 하단→상단, 데스크톱: 좌→우)
           마우스 틸트: perspective(1400px) + rotateX/Y ±1.5도 (데스크톱 전용) */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          transform: !isMobile
            ? `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : "none",
          transition: "transform 0.45s ease-out",
        }}
      >
        <img
          src={char.keyVisual}
          alt=""
          style={{
            width: "100%",
            height: char.keyVisualStage ? "70%" : "100%",
            objectFit: char.keyVisualFit || "cover",
            objectPosition: char.keyVisualFit === "contain" ? "50% 50%" : objectPosition,
          }}
        />
        {/* Reflection strip — adjacent to image bottom
            Fix: transformOrigin "bottom" → "center" (이전 코드는 모든 콘텐츠가
            element 밖으로 렌더링돼 overflow:hidden에 완전 클리핑됨)
            Fix: mask white (alpha=1) + element opacity 0.18 (이전: mask alpha 0.18 cap) */}
        <div
          style={{
            position: "absolute",
            ...(char.keyVisualStage ? { top: "70%" } : { bottom: 0 }),
            left: 0, right: 0,
            height: char.keyVisualStage ? "22%" : "28%",
            overflow: "hidden",
          }}
        >
          <img
            src={char.keyVisual}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: char.keyVisualFit || "cover",
              objectPosition: char.keyVisualFit === "contain" ? "50% 50%" : objectPosition,
              transform: "scaleY(-1)",
              transformOrigin: "center",
              WebkitMaskImage: "linear-gradient(to top, white 0%, transparent 65%)",
              maskImage: "linear-gradient(to top, white 0%, transparent 65%)",
              opacity: phase >= 1 ? (char.keyVisualStage ? 0.28 : 0.18) : 0,
              transition: "opacity 1s ease-out",
            }}
          />
        </div>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? "linear-gradient(to top, oklch(0 0 0 / 0.88) 25%, oklch(0 0 0 / 0.35) 55%, transparent 75%)"
            : "linear-gradient(to right, oklch(0 0 0 / 0.82) 28%, oklch(0 0 0 / 0.35) 55%, transparent 75%)",
        }} />
      </div>

      {/* Back button — Phase 1+ only, top-right to avoid Navbar logo */}
      {phase >= 1 && (
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          aria-label="Back"
          style={{
            position: "fixed", top: isMobile ? 68 : 84, right: 16, zIndex: 150,
            width: 40, height: 40,
            background: "oklch(0 0 0 / 0.6)",
            border: `1px solid ${C.border10}`,
            borderRadius: "50%",
            color: C.white, fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >←</button>
      )}

      {/* Phase 1 hero: name + tagline + profile */}
      <section ref={phase1Ref} style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        padding: isMobile ? "0 24px 80px" : "0 0 0 64px",
        overflow: "hidden",
      }}>
        {/* bgMarquee line 1 */}
        {phase >= 1 && (
          <div style={{
            position: "absolute", top: isMobile ? "12%" : "18%", left: 0,
            display: "flex", width: "200%",
            animation: "bgMarquee 80s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }}>
            {[1, 2].map((k) => (
              <div key={k} style={{
                flex: "0 0 50%",
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? "clamp(36px,9vw,50px)" : "clamp(70px,7vw,100px)",
                fontWeight: 900, color: char.color, opacity: 0.025,
                whiteSpace: "nowrap", textTransform: "uppercase",
                letterSpacing: "0.08em", lineHeight: 0.8,
                filter: "blur(1px)",
              }}>
                {char.agency} ◆ PRIME CITY ◆ {char.cdnId} ◆ {char.role} ◆&nbsp;
              </div>
            ))}
          </div>
        )}
        {/* bgMarquee line 2 — reverse */}
        {phase >= 1 && (
          <div style={{
            position: "absolute", bottom: isMobile ? "12%" : "16%", left: 0,
            display: "flex", width: "200%",
            animation: "bgMarqueeReverse 100s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }}>
            {[1, 2].map((k) => (
              <div key={k} style={{
                flex: "0 0 50%",
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? "clamp(36px,9vw,50px)" : "clamp(70px,7vw,100px)",
                fontWeight: 900, color: char.color, opacity: 0.018,
                whiteSpace: "nowrap", textTransform: "uppercase",
                letterSpacing: "0.08em", lineHeight: 0.9,
                filter: "blur(1.5px)",
              }}>
                SECTOR: {char.cdnId} ◆ CLASSIFICATION: CONFIDENTIAL ◆ PRIME CITY ◆&nbsp;
              </div>
            ))}
          </div>
        )}

        <div style={{
          maxWidth: isMobile ? "100%" : 520,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s",
        }}>
          <p style={{
            fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: char.color, marginBottom: 12,
          }}>{char.introLabel || char.agency}</p>
          <h1 style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(44px,12vw,60px)" : "clamp(56px,6vw,88px)",
            fontWeight: 700, color: C.white,
            margin: "0 0 8px", lineHeight: 1.1,
          }}>{char.name}</h1>
          <p style={{
            fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 16,
            color: C.text55, marginBottom: 20,
          }}>{char.role}</p>
          <p style={{
            fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 17 : 20,
            fontStyle: "italic", color: char.color,
            lineHeight: 1.6, marginBottom: 28, wordBreak: "keep-all", whiteSpace: "pre-line",
          }}>&ldquo;{char.tagline}&rdquo;</p>
          {profileFields.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profileFields.map((f) => (
                <div key={f.en}>
                  <div style={{
                    fontFamily: "var(--f-display-en)", fontSize: 9,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: char.color, marginBottom: 3,
                  }}>{f.en} · {f.label}</div>
                  <div style={{
                    fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 14,
                    color: C.text70, lineHeight: 1.7, wordBreak: "keep-all",
                  }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Scroll hint */}
        {phase >= 1 && (
          <div style={{
            position: "absolute",
            bottom: 32, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: "var(--f-display-en)", fontSize: isMobile ? 18 : 22,
              letterSpacing: "0.45em", textTransform: "uppercase",
              color: C.goldText,
              textShadow: `0 0 20px ${C.goldText}88`,
            }}>Scroll</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 3, background: C.goldText,
                animation: "scrollPulse 1.6s ease-in-out infinite",
                boxShadow: `0 0 8px ${C.goldText}99`,
              }} />
              <div style={{
                width: 36, height: 3, background: C.goldText,
                animation: "scrollPulse 1.6s ease-in-out infinite 0.15s",
                boxShadow: `0 0 8px ${C.goldText}99`,
              }} />
            </div>
          </div>
        )}
      </section>

      {/* ══════════ 하단 섹션 ══════════
           항상 렌더됨 — Phase 0에서도 DOM에 존재해야
           인트로 오버레이가 fadeOut될 때 아래 콘텐츠가 즉시 보임.
           Expressions → Sign → Navigation → Footer 순서 (프로젝트 관례).
           paddingTop:80 → Phase 1 히어로와 하단 콘텐츠 사이 여백. */}
      <div style={{ position: "relative", zIndex: 2, background: C.bgDeep, paddingTop: 80 }}>
        <CharExpressionsGrid
          char={char}
          isMobile={isMobile}
          sectionRef={exprSectionRef}
          exprErrors={exprErrors}
          setExprErrors={setExprErrors}
          onOpen={(key, src) => setLightbox({ key, src })}
        />
        <CharSign char={char} isMobile={isMobile} />
        <CharNavigation
          prevChar={prevChar}
          nextChar={nextChar}
          sameAgency={sameAgency}
          isMobile={isMobile}
        />
        <Footer isMobile={isMobile} />
      </div>
      <CharLightbox
        lightbox={lightbox}
        onClose={closeLightbox}
        charName={char.name}
        isMobile={isMobile}
      />

      {/* Phase 0: 시네마틱 인트로 오버레이 (z:200, 전체 화면)
           StyleComponent는 INTRO_COMPONENTS 레지스트리에서 조회한 인트로 컴포넌트.
           예: cutaway → CutawayIntro, sunrise → SunriseIntro.
           onSkip → skipIntro(): Phase 0을 즉시 종료하고 Phase 1로 전환.
           config.duration만큼 재생 후 자동으로 Phase 1 전환 (Phase 0→1 auto-advance). */}
      {phase === 0 && StyleComponent && (
        <StyleComponent
          char={char}
          isMobile={isMobile}
          objectPosition={objectPosition}
          config={config}
          onSkip={skipIntro}
        />
      )}
    </div>
  );
}
