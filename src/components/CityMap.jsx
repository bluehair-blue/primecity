import { useState, useRef, useCallback, useEffect } from "react";
import C from "../styles/tokens";
import { districts } from "../data/districts";
import useReveal from "../hooks/useReveal";

/* ── Ring zone definitions ──
   Radii are percentages of the shorter image dimension.
   Adjust these values to match the actual map artwork.        */
const RINGS = [
  { id: "core",    innerR: 0,    outerR: 0.105 },
  { id: "middle",  innerR: 0.105, outerR: 0.21 },
  { id: "hype",    innerR: 0.21, outerR: 0.33 },
  { id: "terrace", innerR: 0.33, outerR: 0.48 },
];

/* Map centre as fraction of image dimensions (tune to artwork) */
const CENTER_X = 0.5;
const CENTER_Y = 0.5;

const ACCENT_MAP = {
  core: C.distCore,
  middle: C.distMid,
  hype: C.distHype,
  terrace: C.distTer,
};

/* SVG arc-based ring path (evenodd fill for donut) */
function ringPath(cx, cy, rInner, rOuter) {
  const o = (r) =>
    `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}Z`;
  if (rInner === 0) return o(rOuter);
  /* Outer CW + Inner CCW → evenodd donut */
  const inner = `M${cx},${cy - rInner} A${rInner},${rInner} 0 1,0 ${cx},${cy + rInner} A${rInner},${rInner} 0 1,0 ${cx},${cy - rInner}Z`;
  return `${o(rOuter)} ${inner}`;
}

/* ── Tooltip sub-component ── */
function MapTooltip({ district, pos, isMobile, accent }) {
  if (!district) return null;

  const style = isMobile
    ? {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 12,
        zIndex: 20,
      }
    : {
        position: "fixed",
        left: pos.x + 16,
        top: pos.y + 16,
        zIndex: 9999,
        maxWidth: 280,
        pointerEvents: "none",
      };

  return (
    <div
      style={{
        ...style,
        background: C.bgOverlay,
        border: `1px solid ${accent}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: isMobile ? "14px 16px" : "16px 20px",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      <span
        style={{
          fontFamily: "var(--f-display-en)",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {district.en}
      </span>
      <h4
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 17 : 19,
          fontWeight: 600,
          color: C.white,
          margin: "4px 0 2px",
        }}
      >
        {district.name}
      </h4>
      <span
        style={{
          fontFamily: "var(--f-body)",
          fontSize: 10,
          color: C.text45,
          letterSpacing: "0.08em",
        }}
      >
        {district.tier}
      </span>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 11 : 12,
          color: C.text45,
          margin: "8px 0 6px",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}
      >
        <span style={{ color: accent, opacity: 0.7 }}>◆</span> {district.agency}
      </p>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 11 : 12,
          lineHeight: 1.7,
          color: C.text35,
          margin: 0,
          fontWeight: 300,
          wordBreak: "keep-all",
        }}
      >
        {district.desc}
      </p>
      {isMobile && (
        <span
          style={{
            display: "inline-block",
            marginTop: 10,
            fontFamily: "var(--f-body)",
            fontSize: 11,
            color: accent,
            letterSpacing: "0.04em",
          }}
        >
          한번 더 탭하여 자세히 보기 ▸
        </span>
      )}
    </div>
  );
}

/* ── Main CityMap component ── */
export default function CityMap({ isMobile }) {
  const [mapRef, mapVisible] = useReveal(0.1);
  const [hovered, setHovered] = useState(null);
  const [tapped, setTapped] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 1920, h: 1080 });
  const containerRef = useRef(null);

  const activeId = isMobile ? tapped : hovered;
  const activeDistrict = activeId
    ? districts.find((d) => d.id === activeId)
    : null;

  /* Clamp tooltip to viewport on desktop */
  const clampedPos = useCallback(() => {
    if (isMobile || !activeId) return tooltipPos;
    const tw = 280;
    const th = 200;
    let x = tooltipPos.x + 16;
    let y = tooltipPos.y + 16;
    if (x + tw > window.innerWidth - 8) x = tooltipPos.x - tw - 16;
    if (y + th > window.innerHeight - 8) y = tooltipPos.y - th - 16;
    return { x, y };
  }, [tooltipPos, activeId, isMobile]);

  function handleImgLoad(e) {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  }

  function scrollToDistrict(id) {
    const el = document.getElementById(`district-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleClick(id) {
    if (isMobile) {
      if (tapped === id) {
        scrollToDistrict(id);
        setTapped(null);
      } else {
        setTapped(id);
      }
    } else {
      scrollToDistrict(id);
    }
  }

  /* Dismiss mobile tooltip when tapping outside */
  useEffect(() => {
    if (!isMobile || !tapped) return;
    function onTouch(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setTapped(null);
      }
    }
    document.addEventListener("pointerdown", onTouch);
    return () => document.removeEventListener("pointerdown", onTouch);
  }, [isMobile, tapped]);

  /* Compute SVG coordinates */
  const vw = imgSize.w;
  const vh = imgSize.h;
  const cx = vw * CENTER_X;
  const cy = vh * CENTER_Y;
  const unit = Math.min(vw, vh);

  return (
    <div
      ref={(el) => {
        mapRef.current = el;
        containerRef.current = el;
      }}
      style={{
        position: "relative",
        maxWidth: 960,
        margin: isMobile ? "0 auto 28px" : "0 auto 48px",
        opacity: mapVisible ? 1 : 0,
        transform: mapVisible ? "translateY(0)" : "translateY(24px)",
        transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
        border: `1px solid ${C.border06}`,
      }}
    >
      {/* Map image */}
      <img
        src="https://img.bluehair.blue/ent/1773889391806.png"
        alt="프라임시티 탑뷰 맵"
        loading="lazy"
        onLoad={handleImgLoad}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />

      {/* SVG overlay */}
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          touchAction: "manipulation",
        }}
      >
        {RINGS.map((ring) => {
          const isActive = activeId === ring.id;
          const accent = ACCENT_MAP[ring.id];
          return (
            <path
              key={ring.id}
              d={ringPath(cx, cy, ring.innerR * unit, ring.outerR * unit)}
              fillRule="evenodd"
              fill={isActive ? accent : "transparent"}
              fillOpacity={isActive ? 0.18 : 0}
              stroke={isActive ? accent : "transparent"}
              strokeWidth={isActive ? 2 : 0}
              strokeOpacity={isActive ? 0.35 : 0}
              style={{
                cursor: "pointer",
                transition: "fill-opacity 0.3s, stroke-opacity 0.3s",
              }}
              onMouseEnter={() => !isMobile && setHovered(ring.id)}
              onMouseLeave={() => !isMobile && setHovered(null)}
              onMouseMove={(e) =>
                !isMobile && setTooltipPos({ x: e.clientX, y: e.clientY })
              }
              onClick={() => handleClick(ring.id)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {activeDistrict && (
        <MapTooltip
          district={activeDistrict}
          pos={isMobile ? { x: 0, y: 0 } : clampedPos()}
          isMobile={isMobile}
          accent={ACCENT_MAP[activeId]}
        />
      )}

      {/* Mobile instruction */}
      {isMobile && !tapped && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "var(--f-body)",
            fontSize: 10,
            color: C.text35,
            letterSpacing: "0.06em",
            pointerEvents: "none",
          }}
        >
          구역을 탭하여 자세히 보기
        </div>
      )}
    </div>
  );
}
