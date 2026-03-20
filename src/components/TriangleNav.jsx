import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";

const navItems = [
  {
    id: "svg-intro",
    label: "SVG 소개",
    en: "SVG Gallery",
    accent: "oklch(0.72 0.10 310)",
    path: "/svg",
  },
  {
    id: "art-gallery",
    label: "아트 갤러리",
    en: "Art Gallery",
    accent: "oklch(0.76 0.12 80)",
    path: "/gallery",
  },
  {
    id: "update-log",
    label: "업데이트 로그",
    en: "Update Log",
    accent: "oklch(0.65 0.10 240)",
    path: "/updates",
  },
  {
    id: "contact",
    label: "문의 창구",
    en: "Contact",
    accent: "oklch(0.65 0.12 340)",
    path: "/contact",
  },
  {
    id: "other-works",
    label: "작가의 다른 작품",
    en: "Other Works",
    accent: "oklch(0.65 0.10 140)",
    path: "/works",
  },
];

/*
  Desktop layout: 5 triangles tessellated in a row.
  Odd index = upward triangle, even index = downward triangle (alternating).
  They share edges so they tile perfectly.

  Mobile layout: stacked diagonal slashes (parallelogram strips).
*/

function DesktopTriangleNav({ visible }) {
  const [hovered, setHovered] = useState(null);

  // Each triangle occupies a column in a grid.
  // We use clip-path polygons for the triangular shapes.
  // Row 1 (top): items 0,1,2 — alternating up/down triangles
  // Row 2 (bottom): items 3,4 — alternating

  // Simpler approach: a single SVG viewBox with tessellated triangles
  const W = 1000;
  const H = 400;
  const cols = 5;
  const colW = W / cols;

  // Triangle definitions: each column gets a triangle
  // Even cols: point up (top-center, bottom-left, bottom-right)
  // Odd cols: point down (top-left, top-right, bottom-center)
  function getTrianglePath(i) {
    const x = i * colW;
    if (i % 2 === 0) {
      // point up
      return `${x + colW / 2},20 ${x + colW},${H - 20} ${x},${H - 20}`;
    }
    // point down
    return `${x},20 ${x + colW},20 ${x + colW / 2},${H - 20}`;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {navItems.map((item, i) => {
          const isHov = hovered === i;
          const points = getTrianglePath(i);
          return (
            <g
              key={item.id}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <Link to={item.path}>
                {/* Background fill */}
                <polygon
                  points={points}
                  fill={isHov ? item.accent : "transparent"}
                  fillOpacity={isHov ? 0.15 : 0}
                  stroke={isHov ? item.accent : C.border10}
                  strokeWidth={isHov ? 2 : 1}
                  style={{
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    filter: isHov
                      ? `drop-shadow(0 0 18px ${item.accent})`
                      : "none",
                  }}
                />
                {/* Label — centered in triangle */}
                <text
                  x={i * colW + colW / 2}
                  y={i % 2 === 0 ? H * 0.58 : H * 0.42}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHov ? item.accent : C.text35}
                  fontFamily="var(--f-display-kr)"
                  fontSize={isHov ? 28 : 26}
                  fontWeight="600"
                  style={{
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    pointerEvents: "none",
                  }}
                >
                  {item.label}
                </text>
                {/* English sub-label */}
                <text
                  x={i * colW + colW / 2}
                  y={(i % 2 === 0 ? H * 0.58 : H * 0.42) + 30}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHov ? item.accent : C.text15}
                  fontFamily="var(--f-display-en)"
                  fontSize={11}
                  letterSpacing="0.15em"
                  style={{
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    pointerEvents: "none",
                    textTransform: "uppercase",
                  }}
                >
                  {item.en}
                </text>
              </Link>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MobileTriangleNav({ visible }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {navItems.map((item, i) => {
        const isHov = hovered === i;
        // Diagonal slash: parallelogram via clip-path
        const clipEven = "polygon(0 0, 100% 12%, 100% 100%, 0 88%)";
        const clipOdd = "polygon(0 12%, 100% 0, 100% 88%, 0 100%)";
        return (
          <Link
            key={item.id}
            to={item.path}
            onTouchStart={() => setHovered(i)}
            onTouchEnd={() => setHovered(null)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              textDecoration: "none",
              display: "block",
              position: "relative",
              padding: "28px 24px",
              clipPath: i % 2 === 0 ? clipEven : clipOdd,
              marginTop: i > 0 ? -12 : 0,
              background: isHov
                ? `linear-gradient(135deg, ${item.accent.replace(")", " / 0.12)")}, transparent)`
                : C.bgCard,
              border: "none",
              transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--f-display-en)",
                    fontSize: 8,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: isHov ? item.accent : C.text15,
                    display: "block",
                    marginBottom: 4,
                    transition: "color 0.3s",
                  }}
                >
                  {item.en}
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-display-kr)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: isHov ? item.accent : C.text45,
                    transition: "color 0.3s",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: 16,
                  color: isHov ? item.accent : C.text15,
                  transition: "all 0.3s",
                  transform: isHov ? "translateX(4px)" : "translateX(0)",
                }}
              >
                →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function TriangleNav({ isMobile }) {
  const [ref, visible] = useReveal(0.1);

  return (
    <section
      id="explore"
      ref={ref}
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "48px 20px 56px" : "80px 48px 100px",
      }}
    >
      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 28 : 52,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
        }}
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
          Explore
        </span>
        <h2
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile
              ? "clamp(22px,6vw,30px)"
              : "clamp(28px,3.5vw,44px)",
            fontWeight: 600,
            color: C.white,
            margin: 0,
          }}
        >
          더 알아보기
        </h2>
        <div
          style={{
            width: visible ? 56 : 0,
            height: 1,
            margin: isMobile ? "16px auto 0" : "24px auto 0",
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
          }}
        />
      </div>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s",
        }}
      >
        {isMobile ? (
          <MobileTriangleNav visible={visible} />
        ) : (
          <DesktopTriangleNav visible={visible} />
        )}
      </div>
    </section>
  );
}
