import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import { characters } from "../data/characters";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Footer from "../components/Footer";

export default function CharDetail() {
  const { name } = useParams();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [ref, v] = useReveal(0.1);

  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar =
    charIndex < characters.length - 1 ? characters[charIndex + 1] : null;

  // Same agency characters (excluding self)
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgError(false);
  }, [name]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

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

      <main
        style={{
          position: "relative",
          zIndex: 2,
          padding: isMobile ? "80px 24px 48px" : "120px 48px 80px",
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <Link
            to="/"
            style={{
              color: C.text35,
              textDecoration: "none",
              fontSize: 12,
              letterSpacing: "0.08em",
              transition: "color 0.3s",
            }}
          >
            &larr; PRIME CITY
          </Link>

          <div
            ref={ref}
            style={{
              marginTop: isMobile ? 32 : 48,
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 28 : 48,
              opacity: v ? 1 : 0,
              transform: v ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Character image */}
            <div
              style={{
                width: isMobile ? "100%" : 300,
                aspectRatio: "2/3",
                background: C.bgCard,
                border: `1px solid ${C.border06}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {char.image && !imgError ? (
                <img
                  src={char.image}
                  alt={char.name}
                  onError={() => setImgError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
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

            {/* Character info */}
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: char.color,
                }}
              >
                {char.agency}
              </span>
              <h1
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile ? 32 : 42,
                  fontWeight: 700,
                  color: C.white,
                  margin: "8px 0 4px",
                }}
              >
                {char.name}
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: C.text45,
                  margin: "0 0 20px",
                  fontFamily: "var(--f-body)",
                }}
              >
                {char.role}
                {char.age && ` · ${char.age}`}
              </p>

              <div
                style={{
                  width: 40,
                  height: 1,
                  background: `linear-gradient(90deg, ${char.color}, transparent)`,
                  marginBottom: 20,
                }}
              />

              <p
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: 15,
                  color: C.gold,
                  fontStyle: "italic",
                  margin: "0 0 24px",
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{char.tagline}&rdquo;
              </p>

              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: C.text45,
                  fontWeight: 300,
                  wordBreak: "keep-all",
                  margin: "0 0 20px",
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
                    margin: "0 0 20px",
                    padding: "16px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    borderLeft: `2px solid ${char.color}`,
                  }}
                >
                  {char.brief}
                </p>
              )}

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

          {/* Same agency characters */}
          {sameAgency.length > 0 && (
            <div style={{ marginTop: isMobile ? 40 : 64 }}>
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
                      transition: "border-color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = c.color)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = C.border06)
                    }
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

          {/* Prev / Next navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: isMobile ? 40 : 64,
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
                onMouseEnter={(e) => (e.target.style.color = C.gold)}
                onMouseLeave={(e) => (e.target.style.color = C.text35)}
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
                onMouseEnter={(e) => (e.target.style.color = C.gold)}
                onMouseLeave={(e) => (e.target.style.color = C.text35)}
              >
                {nextChar.name} &rarr;
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>

      <Footer isMobile={isMobile} />
    </div>
  );
}
