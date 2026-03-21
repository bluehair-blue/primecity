import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";

const galleryItems = [
  { src: "https://img.bluehair.blue/ent/bg3.png", caption: "프라임시티 전경 I" },
  { src: "https://img.bluehair.blue/ent/bg4.png", caption: "프라임시티 전경 II" },
  { src: "https://img.bluehair.blue/ent/bg5.png", caption: "프라임시티 전경 III" },
  { src: "https://img.bluehair.blue/ent/bg6.png", caption: "더 코어" },
  { src: "https://img.bluehair.blue/ent/bg7.png", caption: "미들 링" },
  { src: "https://img.bluehair.blue/ent/bg8.png", caption: "하입 로드" },
  { src: "https://img.bluehair.blue/ent/bg9.png", caption: "테라스" },
  { src: "https://img.bluehair.blue/ent/bg10.png", caption: "야경" },
  { src: "https://img.bluehair.blue/ent/bg11.png", caption: "스카이라인" },
];

export default function Gallery() {
  const [selected, setSelected] = useState(null);

  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.08);

        return (
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <Link
              to="/"
              style={{
                color: C.text35,
                textDecoration: "none",
                fontSize: 12,
                letterSpacing: "0.08em",
              }}
            >
              &larr; PRIME CITY
            </Link>

            <div
              style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}
            >
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: isMobile ? 9 : 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: C.gold,
                  display: "block",
                  marginBottom: isMobile ? 10 : 16,
                }}
              >
                Art Gallery
              </span>
              <h1
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile
                    ? "clamp(24px,6vw,32px)"
                    : "clamp(30px,3.5vw,44px)",
                  fontWeight: 700,
                  color: C.white,
                  margin: 0,
                }}
              >
                아트 갤러리
              </h1>
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: isMobile ? "20px auto 36px" : "28px auto 56px",
                  background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                }}
              />
            </div>

            <div
              ref={ref}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(3, 1fr)",
                gap: isMobile ? 12 : 16,
              }}
            >
              {galleryItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    position: "relative",
                    aspectRatio: "16/9",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: `1px solid ${C.border06}`,
                    opacity: v ? 1 : 0,
                    transform: v ? "translateY(0)" : "translateY(24px)",
                    transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`,
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "24px 12px 8px",
                      background:
                        "linear-gradient(transparent, oklch(0.08 0.01 280 / 0.8))",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--f-body)",
                        fontSize: 11,
                        color: C.text55,
                      }}
                    >
                      {item.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox */}
            {selected !== null && (
              <div
                onClick={() => setSelected(null)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 200,
                  background: "oklch(0.04 0.01 280 / 0.95)",
                  backdropFilter: "blur(20px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <img
                  src={galleryItems[selected].src}
                  alt={galleryItems[selected].caption}
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "85vh",
                    objectFit: "contain",
                  }}
                />
                <p
                  style={{
                    position: "absolute",
                    bottom: 32,
                    fontFamily: "var(--f-body)",
                    fontSize: 13,
                    color: C.text45,
                  }}
                >
                  {galleryItems[selected].caption}
                </p>
              </div>
            )}
          </div>
        );
      }}
    </PageLayout>
  );
}
