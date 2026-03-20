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
  Prism / shattered-glass mosaic layout.
  Desktop: irregular triangular shards tessellated inside a rectangle, SVG-based.
  Mobile: angular shard strips stacked vertically.

  The shard vertices are hand-tuned so every edge is shared — no gaps, no overlaps.
*/

// Shared vertices for the prism mesh (on a 1000×440 canvas)
const V = {
  // Top edge
  tl: [0, 0],
  t1: [220, 0],
  t2: [480, 0],
  t3: [720, 0],
  tr: [1000, 0],
  // Interior points — offset irregularly for organic feel
  m1: [140, 180],
  m2: [360, 150],
  m3: [540, 220],
  m4: [750, 160],
  m5: [500, 380],
  // Bottom edge
  bl: [0, 440],
  b1: [260, 440],
  b2: [520, 440],
  b3: [780, 440],
  br: [1000, 440],
};

// Each shard: array of vertex keys forming a polygon, + index into navItems
const shards = [
  { keys: ["tl", "t1", "m2", "m1"], item: 0 },
  { keys: ["t1", "t2", "m2"], item: 1 },
  { keys: ["t2", "t3", "m4", "m3"], item: 2 },
  { keys: ["t3", "tr", "br", "m4"], item: 3 },
  { keys: ["tl", "m1", "bl"], item: -1 },       // decorative
  { keys: ["m1", "m2", "m3", "m5", "b1", "bl"], item: -1 }, // decorative
  { keys: ["m3", "m4", "br", "b3", "b2", "m5"], item: 4 },
  { keys: ["bl", "b1", "m5", "b2", "b3", "br"], item: -1 }, // decorative
];

function centroid(keys) {
  let sx = 0, sy = 0;
  for (const k of keys) {
    sx += V[k][0];
    sy += V[k][1];
  }
  return [sx / keys.length, sy / keys.length];
}

function DesktopPrismNav() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
      <svg
        viewBox="0 0 1000 440"
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Decorative crack lines — all edges */}
        {shards.map((s, i) => {
          const pts = s.keys.map((k) => V[k].join(",")).join(" ");
          return (
            <polygon
              key={`bg-${i}`}
              points={pts}
              fill="none"
              stroke={C.border06}
              strokeWidth={1}
            />
          );
        })}

        {/* Interactive shards */}
        {shards
          .filter((s) => s.item >= 0)
          .map((s) => {
            const item = navItems[s.item];
            const isHov = hovered === s.item;
            const pts = s.keys.map((k) => V[k].join(",")).join(" ");
            const [cx, cy] = centroid(s.keys);

            return (
              <g
                key={item.id}
                onMouseEnter={() => setHovered(s.item)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <Link to={item.path}>
                  {/* Shard fill */}
                  <polygon
                    points={pts}
                    fill={isHov ? item.accent : C.bgDeep}
                    fillOpacity={isHov ? 0.18 : 0.4}
                    stroke={isHov ? item.accent : C.border10}
                    strokeWidth={isHov ? 1.5 : 0.8}
                    strokeLinejoin="bevel"
                    style={{
                      transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                      filter: isHov
                        ? `drop-shadow(0 0 24px ${item.accent})`
                        : "none",
                    }}
                  />
                  {/* Refraction line — subtle inner glow on hover */}
                  {isHov && (
                    <polygon
                      points={pts}
                      fill="none"
                      stroke={item.accent}
                      strokeWidth={0.5}
                      strokeOpacity={0.3}
                      strokeDasharray="6 4"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  {/* Korean label */}
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHov ? item.accent : C.text35}
                    fontFamily="var(--f-display-kr)"
                    fontSize={isHov ? 26 : 24}
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
                    x={cx}
                    y={cy + 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHov ? item.accent : C.text15}
                    fontFamily="var(--f-display-en)"
                    fontSize={10}
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

        {/* Decorative shard numbers on empty shards */}
        {shards
          .filter((s) => s.item < 0)
          .map((s, i) => {
            const [cx, cy] = centroid(s.keys);
            return (
              <text
                key={`deco-${i}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={C.text15}
                fontFamily="var(--f-display-en)"
                fontSize={8}
                letterSpacing="0.2em"
                opacity={0.4}
                style={{ pointerEvents: "none" }}
              >
                PRIME CITY
              </text>
            );
          })}
      </svg>
    </div>
  );
}

function MobilePrismNav() {
  const [hovered, setHovered] = useState(null);

  // Irregular angular clips for each item — like shattered glass shards
  const clips = [
    "polygon(0% 0%, 100% 3%, 100% 92%, 0% 100%)",
    "polygon(0% 6%, 100% 0%, 100% 100%, 0% 90%)",
    "polygon(0% 0%, 100% 8%, 100% 95%, 0% 100%)",
    "polygon(0% 5%, 100% 0%, 100% 100%, 0% 92%)",
    "polygon(0% 0%, 100% 6%, 100% 100%, 0% 100%)",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        padding: "0 4px",
      }}
    >
      {navItems.map((item, i) => {
        const isHov = hovered === i;
        return (
          <Link
            key={item.id}
            to={item.path}
            onTouchStart={() => setHovered(i)}
            onTouchEnd={() => setTimeout(() => setHovered(null), 300)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              textDecoration: "none",
              display: "block",
              position: "relative",
              padding: "24px 20px",
              clipPath: clips[i],
              marginTop: i > 0 ? -8 : 0,
              background: isHov
                ? `linear-gradient(${120 + i * 30}deg, ${item.accent.replace(")", " / 0.14)")}, transparent 70%)`
                : C.bgCard,
              transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Diagonal accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isHov
                  ? `linear-gradient(${135 + i * 15}deg, ${item.accent.replace(")", " / 0.06)")}, transparent 40%)`
                  : "none",
                pointerEvents: "none",
                transition: "all 0.4s",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
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
                    fontSize: 17,
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
                  fontFamily: "var(--f-display-en)",
                  fontSize: 14,
                  color: isHov ? item.accent : C.text15,
                  transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
                  transform: isHov ? "translateX(4px)" : "translateX(0)",
                  opacity: isHov ? 1 : 0.5,
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
        padding: isMobile ? "48px 16px 56px" : "80px 48px 100px",
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
        {isMobile ? <MobilePrismNav /> : <DesktopPrismNav />}
      </div>
    </section>
  );
}
