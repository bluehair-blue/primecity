import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import { characters } from "../data/characters";
import { cdnExprUrl, EXPRESSION_KEYS, EXPRESSION_LABELS } from "../utils/cdn";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Footer from "../components/Footer";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function CharDetail() {
  const { name } = useParams();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [exprErrors, setExprErrors] = useState({});
  const parallaxRef = useRef(null);
  const rafRef = useRef(null);

  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar =
    charIndex < characters.length - 1 ? characters[charIndex + 1] : null;
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  // Reset on character change
  useEffect(() => {
    window.scrollTo(0, 0);
    setImgError(false);
    setUiReady(false);
    setExprErrors({});
    setLightbox(null);
    const timer = setTimeout(() => setUiReady(true), 100);
    return () => clearTimeout(timer);
  }, [name]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Parallax effect (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          const y = window.scrollY * 0.3;
          parallaxRef.current.style.transform = `translateY(${y}px) scale(1.05)`;
        }
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  // Lightbox ESC key
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // Reveal refs for sections
  const [profileRef, profileV] = useReveal(0.1);
  const [exprRef, exprV] = useReveal(0.1);
  const [navRef, navV] = useReveal(0.1);

  if (!char) {
    return (
      <div
        style={{
          background: C.bgDeep,
          color: C.white,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--f-body)",
        }}
      >
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>
          캐릭터를 찾을 수 없습니다.
        </p>
        <Link
          to="/"
          style={{
            color: C.gold,
            textDecoration: "none",
            fontSize: 13,
            letterSpacing: "0.1em",
          }}
        >
          &larr; 메인으로 돌아가기
        </Link>
      </div>
    );
  }

  const hasImage = char.image && !imgError;
  const t = (delay) => `all 1s ${EASE} ${delay}s`;

  // Profile fields
  const profileFields = [
    { label: "직업", en: "JOB", value: char.job },
    { label: "배경", en: "BACKGROUND", value: char.background },
    { label: "취향", en: "TASTE", value: char.taste },
    { label: "목표", en: "GOAL", value: char.goal },
  ].filter((f) => f.value);

  return (
    <div
      style={{
        background: C.bgDeep,
        color: C.white,
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <Particles isMobile={isMobile} />
      <Navbar scrolled={scrolled} isMobile={isMobile} />

      {/* ══════════ Section 1: Fullscreen Splash ══════════ */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: isMobile ? 560 : 680,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
        }}
      >
        {/* Background image or gradient fallback */}
        {hasImage ? (
          <div
            ref={parallaxRef}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${char.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              transform: "scale(1.05)",
              willChange: isMobile ? "auto" : "transform",
            }}
          >
            <img
              src={char.image}
              alt=""
              onError={() => setImgError(true)}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 50% 30%, ${char.color}, ${C.bgDeep})`,
            }}
          >
            {/* Large typography fallback */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "var(--f-display-kr)",
                fontSize: isMobile ? 100 : 180,
                fontWeight: 700,
                color: `color-mix(in oklch, ${char.color} 15%, transparent)`,
                whiteSpace: "nowrap",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              {char.name}
            </div>
          </div>
        )}

        {/* Overlay gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, ${C.bgDeep} 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to right, ${C.bgDeep} 0%, transparent 60%)`,
            opacity: isMobile ? 0.6 : 0.8,
            pointerEvents: "none",
          }}
        />

        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, transparent 50%, ${char.color} 50%, transparent 51%)`,
            backgroundSize: "100% 4px",
            opacity: 0.02,
            pointerEvents: "none",
            animation: "charScanline 8s linear infinite",
          }}
        />

        {/* Glow pulse */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: isMobile ? "50%" : "30%",
            width: isMobile ? 300 : 500,
            height: isMobile ? 300 : 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${char.color}, transparent 70%)`,
            animation: "charGlowPulse 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Text content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            padding: isMobile ? "0 24px 80px" : "0 64px 100px",
            maxWidth: 700,
          }}
        >
          {/* Agency label */}
          <span
            style={{
              display: "block",
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? 10 : 12,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: char.color,
              opacity: uiReady ? 1 : 0,
              transform: uiReady ? "translateY(0)" : "translateY(16px)",
              transition: t(0.4),
              marginBottom: 12,
            }}
          >
            {char.agency}
          </span>

          {/* Character name */}
          <h1
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile
                ? "clamp(42px, 12vw, 56px)"
                : "clamp(56px, 7vw, 80px)",
              fontWeight: 700,
              color: C.white,
              margin: "0 0 8px",
              lineHeight: 1.1,
              opacity: uiReady ? 1 : 0,
              transform: uiReady ? "translateY(0)" : "translateY(20px)",
              transition: t(0.6),
              textShadow: `0 0 60px ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
            }}
          >
            {char.name}
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? 15 : 18,
              color: C.text70,
              fontStyle: "italic",
              margin: "0 0 24px",
              lineHeight: 1.6,
              opacity: uiReady ? 1 : 0,
              transform: uiReady ? "translateY(0)" : "translateY(16px)",
              transition: t(0.8),
            }}
          >
            &ldquo;{char.tagline}&rdquo;
          </p>

          {/* Role + Age */}
          <p
            style={{
              fontSize: 13,
              color: C.text45,
              fontFamily: "var(--f-body)",
              margin: 0,
              opacity: uiReady ? 1 : 0,
              transform: uiReady ? "translateY(0)" : "translateY(12px)",
              transition: t(1.0),
            }}
          >
            {char.role}
            {char.age && ` · ${char.age}`}
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? 24 : 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: uiReady ? 1 : 0,
            transition: t(1.2),
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: 9,
              letterSpacing: "0.3em",
              color: C.text25,
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: `linear-gradient(to bottom, ${char.color}, transparent)`,
              animation: "scrollPulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* ══════════ Section 2: Profile ══════════ */}
      <section
        ref={profileRef}
        style={{
          position: "relative",
          zIndex: 2,
          padding: isMobile ? "48px 24px" : "80px 64px",
          maxWidth: 1100,
          margin: "0 auto",
          opacity: profileV ? 1 : 0,
          transform: profileV ? "translateY(0)" : "translateY(30px)",
          transition: `all 0.8s ${EASE}`,
        }}
      >
        {/* Back link */}
        <Link
          to="/"
          style={{
            color: C.text35,
            textDecoration: "none",
            fontSize: 12,
            letterSpacing: "0.08em",
            transition: "color 0.3s",
            display: "inline-block",
            marginBottom: isMobile ? 32 : 48,
          }}
        >
          &larr; PRIME CITY
        </Link>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 32 : 56,
          }}
        >
          {/* Character portrait */}
          <div
            style={{
              width: isMobile ? "100%" : 320,
              aspectRatio: "2/3",
              background: C.bgCard,
              border: `1px solid ${C.border06}`,
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {hasImage ? (
              <img
                src={char.image}
                alt={char.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: `1px solid ${C.border10}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: char.color, fontSize: 20 }}>
                    {char.name[0]}
                  </span>
                </div>
                <span
                  style={{
                    color: C.text15,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                  }}
                >
                  IMAGE COMING SOON
                </span>
              </div>
            )}
          </div>

          {/* Profile content */}
          <div style={{ flex: 1 }}>
            {/* Description */}
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 14 : 15,
                lineHeight: 1.9,
                color: C.text55,
                fontWeight: 300,
                wordBreak: "keep-all",
                margin: "0 0 24px",
              }}
            >
              {char.description}
            </p>

            {/* Brief */}
            {char.brief && (
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: C.text35,
                  fontWeight: 300,
                  wordBreak: "keep-all",
                  margin: "0 0 32px",
                  padding: "16px",
                  background: C.bgCard,
                  border: `1px solid ${C.border06}`,
                  borderLeft: `2px solid ${char.color}`,
                }}
              >
                {char.brief}
              </p>
            )}

            {/* Profile fields (job, background, taste, goal) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {profileFields.map((field) => (
                <div
                  key={field.en}
                  style={{
                    padding: "14px 16px",
                    borderLeft: `2px solid ${char.color}`,
                    background: C.bgCard,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 9,
                      letterSpacing: "0.25em",
                      color: char.color,
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {field.en}
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: C.text45,
                      margin: 0,
                      wordBreak: "keep-all",
                    }}
                  >
                    {field.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Traits */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "16px 0",
                borderTop: `1px solid ${C.border06}`,
              }}
            >
              {char.signature && (
                <p
                  style={{
                    fontSize: 12,
                    color: C.text35,
                    fontFamily: "var(--f-body)",
                    margin: 0,
                  }}
                >
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span>{" "}
                  시그니처: {char.signature}
                </p>
              )}
              {char.personality && (
                <p
                  style={{
                    fontSize: 12,
                    color: C.text35,
                    fontFamily: "var(--f-body)",
                    margin: 0,
                  }}
                >
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span>{" "}
                  성격: {char.personality}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ Section 3: Expression Gallery ══════════ */}
      {char.expressions && char.expressions.length > 0 && (
        <section
          ref={exprRef}
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? "48px 24px" : "64px 64px",
            maxWidth: 1100,
            margin: "0 auto",
            opacity: exprV ? 1 : 0,
            transform: exprV ? "translateY(0)" : "translateY(30px)",
            transition: `all 0.8s ${EASE}`,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: C.goldText,
              marginBottom: isMobile ? 20 : 28,
            }}
          >
            Expressions
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: isMobile ? 8 : 14,
            }}
          >
            {char.expressions.map((key) => {
              const exprSrc = cdnExprUrl(char.cdnId, key);
              const hasError = exprErrors[key];
              return (
                <div
                  key={key}
                  onClick={() => !hasError && setLightbox({ key, src: exprSrc })}
                  style={{
                    aspectRatio: "1/1",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    overflow: "hidden",
                    position: "relative",
                    cursor: hasError ? "default" : "pointer",
                    transition: `border-color 0.3s ${EASE}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!hasError) e.currentTarget.style.borderColor = char.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border06;
                  }}
                >
                  {!hasError ? (
                    <img
                      src={exprSrc}
                      alt={EXPRESSION_LABELS[key]}
                      onError={() =>
                        setExprErrors((prev) => ({ ...prev, [key]: true }))
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: `radial-gradient(circle, ${`color-mix(in oklch, ${char.color} 8%, transparent)`}, transparent)`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: isMobile ? 11 : 13,
                          color: C.text25,
                          fontFamily: "var(--f-body)",
                        }}
                      >
                        {EXPRESSION_LABELS[key]}
                      </span>
                    </div>
                  )}

                  {/* Label overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: isMobile ? "4px 6px" : "6px 10px",
                      background: `linear-gradient(to top, ${C.bgDeep}, transparent)`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--f-body)",
                        fontSize: isMobile ? 9 : 10,
                        color: C.text45,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {EXPRESSION_LABELS[key]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════ Section 4: Navigation ══════════ */}
      <section
        ref={navRef}
        style={{
          position: "relative",
          zIndex: 2,
          padding: isMobile ? "32px 24px 48px" : "48px 64px 80px",
          maxWidth: 1100,
          margin: "0 auto",
          opacity: navV ? 1 : 0,
          transform: navV ? "translateY(0)" : "translateY(20px)",
          transition: `all 0.8s ${EASE}`,
        }}
      >
        {/* Same agency */}
        {sameAgency.length > 0 && (
          <div style={{ marginBottom: isMobile ? 32 : 48 }}>
            <h3
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: C.goldText,
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Same Agency
            </h3>
            <div
              style={{
                display: "flex",
                gap: isMobile ? 10 : 16,
                flexWrap: "wrap",
              }}
            >
              {sameAgency.map((c) => (
                <Link
                  key={c.id}
                  to={`/characters/${c.id}`}
                  style={{
                    textDecoration: "none",
                    padding: isMobile ? "10px 16px" : "12px 20px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: `border-color 0.3s, box-shadow 0.3s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.color;
                    e.currentTarget.style.boxShadow = `0 0 16px ${`color-mix(in oklch, ${c.color} 20%, transparent)`}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border06;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={{ color: c.color, fontSize: 8 }}>●</span>
                  <span
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: 13,
                      color: C.text55,
                    }}
                  >
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: `1px solid ${C.border06}`,
          }}
        >
          {prevChar ? (
            <Link
              to={`/characters/${prevChar.id}`}
              style={{
                textDecoration: "none",
                color: C.text35,
                fontSize: 12,
                fontFamily: "var(--f-body)",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}
            >
              &larr; {prevChar.name}
            </Link>
          ) : (
            <span />
          )}
          {nextChar ? (
            <Link
              to={`/characters/${nextChar.id}`}
              style={{
                textDecoration: "none",
                color: C.text35,
                fontSize: 12,
                fontFamily: "var(--f-body)",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}
            >
              {nextChar.name} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>

      {/* ══════════ Lightbox ══════════ */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: C.bgOverlay,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: isMobile ? "90vw" : "60vw",
              maxHeight: "80vh",
              position: "relative",
            }}
          >
            <img
              src={lightbox.src}
              alt={EXPRESSION_LABELS[lightbox.key]}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                border: `1px solid ${C.border10}`,
              }}
            />
            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--f-body)",
                fontSize: 13,
                color: C.text55,
                marginTop: 12,
              }}
            >
              {char.name} — {EXPRESSION_LABELS[lightbox.key]}
            </p>
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: "absolute",
                top: -12,
                right: -12,
                width: 32,
                height: 32,
                background: C.bgDeep,
                border: `1px solid ${C.border10}`,
                borderRadius: "50%",
                color: C.text55,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Footer isMobile={isMobile} />
    </div>
  );
}
