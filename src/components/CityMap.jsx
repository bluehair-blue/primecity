import { useState, useRef, useCallback, useEffect } from "react";
import C from "../styles/tokens";
import { districts } from "../data/districts";
import useReveal from "../hooks/useReveal";

/* ── Map image assets ──
   모든 구역 이미지는 베이스맵과 동일 캔버스 크기(투명 PNG).
   재export 후 CDN URL 업데이트 필요.                          */
const BASE_SRC = "https://img.bluehair.blue/ent/Citybase(1).png";

/* ── Zone definitions ──
   districts.js에 없는 industrial은 여기서 직접 정의.
   hitbox: 타원 링은 ringPath로, industrial은 polygon 좌표로. */
const CENTER_X = 0.50;
const CENTER_Y = 0.47;
const RATIO = 0.54;

const ZONES = [
  {
    id: "core",
    src: "https://img.bluehair.blue/ent/The%20Core.png",
    accent: C.distCore,
    innerR: 0, outerR: 0.18,
    type: "ring",
  },
  {
    id: "middle",
    src: "https://img.bluehair.blue/ent/Middle%20Ring.png",
    accent: C.distMid,
    innerR: 0.18, outerR: 0.30,
    type: "ring",
  },
  {
    id: "hype",
    src: "https://img.bluehair.blue/ent/Hype%20Road.png",
    accent: C.distHype,
    innerR: 0.30, outerR: 0.42,
    type: "ring",
  },
  {
    id: "terrace",
    src: "https://img.bluehair.blue/ent/Terrace.png",
    accent: C.distTer,
    innerR: 0.42, outerR: 0.60,
    type: "ring",
  },
  {
    id: "industrial",
    src: "https://img.bluehair.blue/ent/industrial%20complex.png",
    accent: C.distIndustrial,
    type: "polygon",
  },
];

/* 산업단지 전용 데이터 (districts.js에 없음) */
const INDUSTRIAL_INFO = {
  id: "industrial",
  name: "산업단지",
  en: "Industrial Complex",
  tier: "물류와 생산의 심장부",
  agency: "",
  desc: "프라임시티를 지탱하는 물류와 생산의 중심지. 항만 시설과 물류 센터가 밀집한 구역.",
};

/* ── SVG 타원형 링 경로 (히트박스용) ── */
function ringPath(cx, cy, rInner, rOuter, ratio) {
  const rxO = rOuter;
  const ryO = rOuter * ratio;
  const outer = `M${cx},${cy - ryO} A${rxO},${ryO} 0 1,1 ${cx},${cy + ryO} A${rxO},${ryO} 0 1,1 ${cx},${cy - ryO}Z`;
  if (rInner === 0) return outer;
  const rxI = rInner;
  const ryI = rInner * ratio;
  const inner = `M${cx},${cy - ryI} A${rxI},${ryI} 0 1,0 ${cx},${cy + ryI} A${rxI},${ryI} 0 1,0 ${cx},${cy - ryI}Z`;
  return `${outer} ${inner}`;
}

/* 산업단지 히트박스 polygon (좌하단 항만 영역, vw 기준 비율 좌표) */
function industrialPolygon(vw, vh) {
  const pts = [
    [0.00, 0.42], [0.18, 0.42], [0.30, 0.55],
    [0.38, 0.72], [0.42, 1.00], [0.00, 1.00],
  ];
  return pts.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}

/* ── Tooltip ── */
function MapTooltip({ district, pos, isMobile, accent, hasCard }) {
  if (!district) return null;

  const style = isMobile
    ? { position: "relative", margin: "12px 0 0", zIndex: 20 }
    : { position: "fixed", left: pos.x, top: pos.y, zIndex: 9999, maxWidth: 280, pointerEvents: "none" };

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
        boxShadow: `0 8px 32px oklch(0 0 0 / 0.5), 0 0 16px oklch(0 0 0 / 0.25)`,
        borderRadius: 4,
      }}
    >
      <span
        style={{
          fontFamily: "var(--f-display-en)",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: accent,
          display: "block",
          marginBottom: 4,
        }}
      >
        {district.en}
      </span>
      <h4
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 18 : 20,
          fontWeight: 600,
          color: C.white,
          margin: "0 0 4px",
        }}
      >
        {district.name}
      </h4>
      <span
        style={{
          display: "inline-block",
          padding: "2px 6px",
          background: C.goldDim,
          border: `1px solid ${C.border10}`,
          fontFamily: "var(--f-body)",
          fontSize: 9,
          color: C.gold,
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        {district.tier}
      </span>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 12 : 13,
          lineHeight: 1.6,
          color: C.text35,
          margin: 0,
          fontWeight: 300,
          wordBreak: "keep-all",
        }}
      >
        {district.desc}
      </p>
      {isMobile && hasCard && (
        <span
          style={{
            display: "inline-block",
            marginTop: 12,
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
  const [imgSize, setImgSize] = useState({ w: 1380, h: 752 });
  const containerRef = useRef(null);

  const activeId = isMobile ? tapped : hovered;

  /* 활성 구역 데이터 (districts.js 또는 industrial 전용) */
  const activeDistrict = activeId
    ? activeId === "industrial"
      ? INDUSTRIAL_INFO
      : districts.find((d) => d.id === activeId)
    : null;

  /* 활성 구역에 DistrictCard가 있는지 (scroll 대상 존재 여부) */
  const hasCard = activeId && activeId !== "industrial";

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
    if (id === "industrial") return;
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

  /* Dismiss mobile tooltip on outside tap */
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

  const vw = imgSize.w;
  const vh = imgSize.h;
  const cx = vw * CENTER_X;
  const cy = vh * CENTER_Y;
  const unit = vw;

  return (
    <div
      ref={(el) => {
        mapRef.current = el;
        containerRef.current = el;
      }}
      style={{
        position: "relative",
        maxWidth: 1080,
        margin: isMobile ? "0 auto 36px" : "0 auto 64px",
        opacity: mapVisible ? 1 : 0,
        transform: mapVisible ? "translateY(0)" : "translateY(24px)",
        transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Sci-fi 프레임 장식 */}
      <div style={{ position: "absolute", top: -4, left: -4, width: 24, height: 24, borderTop: `2px solid ${C.gold}`, borderLeft: `2px solid ${C.gold}`, zIndex: 10 }} />
      <div style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderBottom: `2px solid ${C.gold}`, borderRight: `2px solid ${C.gold}`, zIndex: 10 }} />
      <div style={{ position: "absolute", top: -4, right: -4, width: 6, height: 6, background: C.gold, zIndex: 10 }} />
      <div style={{ position: "absolute", bottom: -4, left: -4, width: 6, height: 6, background: C.gold, zIndex: 10 }} />

      {/* 내부 컨테이너 */}
      <div
        style={{
          position: "relative",
          padding: isMobile ? 6 : 10,
          background: `linear-gradient(135deg, ${C.border10}, ${C.bgDeep})`,
          border: `1px solid ${C.border06}`,
          boxShadow: "0 24px 48px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* 맵 영역 */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: C.black,
            border: `1px solid ${C.border10}`,
          }}
        >
          {/* 1) 베이스맵 — 활성 시 dim */}
          <img
            src={BASE_SRC}
            alt="프라임시티 탑뷰 맵"
            loading="lazy"
            onLoad={handleImgLoad}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              filter: activeId
                ? "brightness(0.3) saturate(0.5)"
                : "brightness(1) saturate(1)",
              transition: "filter 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
          />

          {/* 2) 구역 이미지 레이어 — 활성 시 떠오름 */}
          {ZONES.map((zone) => {
            const isActive = activeId === zone.id;
            return (
              <img
                key={zone.id}
                src={zone.src}
                alt={zone.id}
                loading="lazy"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateY(-12px) scale(1.025)"
                    : "translateY(0) scale(1)",
                  transformOrigin: "center center",
                  filter: isActive
                    ? `drop-shadow(0 16px 12px oklch(0 0 0 / 0.8)) drop-shadow(0 0 6px ${zone.accent}) drop-shadow(0 0 18px ${zone.accent})`
                    : "none",
                  transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              />
            );
          })}

          {/* 3) SVG 히트박스 — 투명, 이벤트 캡처 전용 */}
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
            {ZONES.map((zone) => {
              const hitPath =
                zone.type === "ring"
                  ? ringPath(cx, cy, zone.innerR * unit, zone.outerR * unit, RATIO)
                  : undefined;

              if (zone.type === "polygon") {
                return (
                  <polygon
                    key={zone.id}
                    points={industrialPolygon(vw, vh)}
                    fill="transparent"
                    pointerEvents="visibleFill"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      if (isMobile) return;
                      setHovered(zone.id);
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => !isMobile && setHovered(null)}
                    onMouseMove={(e) =>
                      !isMobile && setTooltipPos({ x: e.clientX, y: e.clientY })
                    }
                    onClick={() => handleClick(zone.id)}
                  />
                );
              }

              return (
                <path
                  key={zone.id}
                  d={hitPath}
                  fillRule="evenodd"
                  fill="transparent"
                  pointerEvents="visibleFill"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    if (isMobile) return;
                    setHovered(zone.id);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => !isMobile && setHovered(null)}
                  onMouseMove={(e) =>
                    !isMobile && setTooltipPos({ x: e.clientX, y: e.clientY })
                  }
                  onClick={() => handleClick(zone.id)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4) 툴팁 */}
      {activeDistrict && (
        <MapTooltip
          district={activeDistrict}
          pos={isMobile ? { x: 0, y: 0 } : clampedPos()}
          isMobile={isMobile}
          accent={ZONES.find((z) => z.id === activeId)?.accent}
          hasCard={hasCard}
        />
      )}

      {/* 5) 모바일 안내 */}
      {isMobile && !tapped && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "var(--f-body)",
            fontSize: 11,
            color: C.text55,
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
