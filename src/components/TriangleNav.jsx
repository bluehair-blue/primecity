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

// Shared vertices for the prism mesh (on a 1000×440 canvas)
const V = {
  tl: [0, 0],
  t1: [220, 0],
  t2: [480, 0],
  t3: [720, 0],
  tr: [1000, 0],
  m1: [140, 180],
  m2: [360, 150],
  m3: [540, 220],
  m4: [750, 160],
  m5: [500, 380],
  bl: [0, 440],
  b1: [260, 440],
  b2: [520, 440],
  b3: [780, 440],
  br: [1000, 440],
};

const shards = [
  { keys: ["tl", "t1", "m2", "m1"], item: 0 },
  { keys: ["t1", "t2", "m2"], item: 1 },
  { keys: ["t2", "t3", "m4", "m3"], item: 2 },
  { keys: ["t3", "tr", "br", "m4"], item: 3 },
  { keys: ["tl", "m1", "bl"], item: -1 },
  { keys: ["m1", "m2", "m3", "m5", "b1", "bl"], item: -1 },
  { keys: ["m3", "m4", "br", "b3", "b2", "m5"], item: 4 },
  { keys: ["bl", "b1", "m5", "b2", "b3", "br"], item: -1 },
];

function centroid(keys) {
  let sx = 0, sy = 0;
  for (const k of keys) {
    sx += V[k][0];
    sy += V[k][1];
  }
  return [sx / keys.length, sy / keys.length];
}

function alpha(color, pct) {
  return `color-mix(in oklch, ${color} ${Math.round(pct * 100)}%, transparent)`;
}

function DesktopPrismNav() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
      <svg
        viewBox="0 0 1000 440"
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── SVG Defs: filters & gradients ── */}
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="text-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="glass-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.border10} />
            <stop offset="100%" stopColor={C.bgDeep} />
          </linearGradient>

          {navItems.map((item, i) => (
            <linearGradient
              key={`hover-grad-${i}`}
              id={`hover-grad-${i}`}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={C.bgDeep} />
              <stop offset="100%" stopColor={alpha(item.accent, 0.3)} />
            </linearGradient>
          ))}
        </defs>

        {/* ── Background glass shards ── */}
        {shards.map((s, i) => {
          const pts = s.keys.map((k) => V[k].join(",")).join(" ");
          return (
            <polygon
              key={`bg-${i}`}
              points={pts}
              fill="url(#glass-base)"
              fillOpacity={0.3}
              stroke="oklch(0.62 0.20 252 / 0.05)"
              strokeWidth={1}
            />
          );
        })}

        {/* ── Interactive shards ── */}
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
                  {/* Glass facet */}
                  <polygon
                    points={pts}
                    fill={isHov ? `url(#hover-grad-${s.item})` : "transparent"}
                    stroke={isHov ? item.accent : "oklch(0.62 0.20 252 / 0.12)"}
                    strokeWidth={isHov ? 2 : 1}
                    strokeLinejoin="round"
                    style={{
                      transition: "fill 0.5s cubic-bezier(0.25, 1, 0.5, 1), stroke 0.5s cubic-bezier(0.25, 1, 0.5, 1), stroke-width 0.5s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                      filter: isHov ? "url(#neon-glow)" : "none",
                      transformOrigin: `${cx}px ${cy}px`,
                      transform: isHov ? "scale(1.015)" : "scale(1)",
                    }}
                  />

                  {/* Inner highlight — glass edge refraction */}
                  <polygon
                    points={pts}
                    fill="none"
                    stroke={C.white}
                    strokeWidth={1}
                    strokeOpacity={isHov ? 0.35 : 0}
                    style={{
                      pointerEvents: "none",
                      transition: "stroke-opacity 0.4s",
                    }}
                    transform="translate(1, 1)"
                  />

                  {/* Chromatic aberration — blue offset (prism light refraction) */}
                  <polygon
                    points={pts}
                    fill="none"
                    stroke={C.primeBlue}
                    strokeWidth={0.5}
                    strokeOpacity={isHov ? 0.4 : 0}
                    style={{
                      pointerEvents: "none",
                      transition: "stroke-opacity 0.4s",
                    }}
                    transform="translate(-1.5, 0.5)"
                  />

                  {/* Korean label */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHov ? C.white : C.text55}
                    fontFamily="var(--f-display-kr)"
                    fontSize={isHov ? 26 : 24}
                    fontWeight="700"
                    filter={isHov ? "url(#text-glow)" : undefined}
                    style={{
                      transition: "fill 0.4s cubic-bezier(0.22,1,0.36,1), font-size 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.4s cubic-bezier(0.22,1,0.36,1)",
                      pointerEvents: "none",
                    }}
                  >
                    {item.label}
                  </text>

                  {/* English sub-label */}
                  <text
                    x={cx}
                    y={cy + 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHov ? item.accent : C.text25}
                    fontFamily="var(--f-display-en)"
                    fontSize={11}
                    letterSpacing="0.2em"
                    style={{
                      transition: "fill 0.4s",
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

        {/* ── Decorative text on empty shards ── */}
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
              padding: "28px 24px",
              clipPath: clips[i],
              marginTop: i > 0 ? -10 : 0,
              background: isHov
                ? `linear-gradient(${120 + i * 30}deg, ${alpha(item.accent, 0.25)}, oklch(0 0 0 / 0.5) 80%)`
                : "oklch(0 0 0 / 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "background 0.4s cubic-bezier(0.22,1,0.36,1), z-index 0.4s cubic-bezier(0.22,1,0.36,1)",
              zIndex: isHov ? 10 : i,
              willChange: "transform",
            }}
          >
            {/* Glass edge highlight */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${isHov ? item.accent : C.border10}, transparent)`,
                opacity: 0.8,
                pointerEvents: "none",
              }}
            />
            {/* Diagonal accent glow */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isHov
                  ? `linear-gradient(${135 + i * 15}deg, ${alpha(item.accent, 0.06)}, transparent 40%)`
                  : "none",
                pointerEvents: "none",
                transition: "background 0.4s",
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
                  transition: "color 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s cubic-bezier(0.22,1,0.36,1)",
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
      <div
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 28 : 52,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)",
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
          transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s",
        }}
      >
        {isMobile ? <MobilePrismNav /> : <DesktopPrismNav />}
      </div>
    </section>
  );
}
