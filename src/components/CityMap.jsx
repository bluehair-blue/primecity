import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import { districts } from "../data/districts";
import useReveal from "../hooks/useReveal";
import { cdnUrl } from "../utils/cdn";

const BASE_SRC = cdnUrl("Citybase(1).png");

const CENTER_X = 0.50;
const CENTER_Y = 0.47;
const RATIO = 0.54;

const ZONES = [
  {
    id: "core",
    src: cdnUrl("The%20Core.png"),
    accent: C.distCore,
    glowColor: "oklch(0.85 0.16 80)",
    innerR: 0, outerR: 0.18,
    type: "ring",
  },
  {
    id: "middle",
    src: cdnUrl("Middle%20Ring.png"),
    accent: C.distMid,
    glowColor: "oklch(0.75 0.14 240)",
    innerR: 0.18, outerR: 0.30,
    type: "ring",
  },
  {
    id: "hype",
    src: cdnUrl("Hype%20Road.png"),
    accent: C.distHype,
    glowColor: "oklch(0.78 0.16 340)",
    innerR: 0.30, outerR: 0.42,
    type: "ring",
  },
  {
    id: "terrace",
    src: cdnUrl("Terrace.png"),
    accent: C.distTer,
    glowColor: "oklch(0.78 0.14 140)",
    innerR: 0.42, outerR: 0.60,
    type: "ring",
  },
  {
    id: "industrial",
    src: cdnUrl("industrial%20complex.png"),
    accent: C.distIndustrial,
    glowColor: "oklch(0.72 0.12 220)",
    type: "polygon",
  },
];

const INDUSTRIAL_INFO = {
  id: "industrial",
  name: "산업단지",
  en: "Industrial Complex",
  tier: "물류와 생산의 심장부",
  agency: "",
  desc: "눈부신 무대 뒤편, 거대한 도시를 물리적으로 지탱하는 숨겨진 핏줄. 철골과 물류 라인 속에 육중한 생존의 리듬이 흐른다.",
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

function industrialPolygon(vw, vh) {
  const pts = [
    [0.00, 0.42], [0.18, 0.42], [0.30, 0.55],
    [0.38, 0.72], [0.42, 1.00], [0.00, 1.00],
  ];
  return pts.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}

/* ── Tooltip content (shared between mobile fixed and desktop floating) ── */
function TooltipContent({ district, accent, isMobile }) {
  return (
    <>
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
      {isMobile && (
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
          한번 더 탭하여 상세 페이지로 이동 ▸
        </span>
      )}
    </>
  );
}

/* ── Main CityMap component ── */
export default function CityMap({ isMobile }) {
  const [mapRef, mapVisible] = useReveal(0.1);
  const [hovered, setHovered] = useState(null);
  const [tapped, setTapped] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 1380, h: 752 });
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const activeId = isMobile ? tapped : hovered;

  const activeDistrict = activeId
    ? activeId === "industrial"
      ? INDUSTRIAL_INFO
      : districts.find((d) => d.id === activeId)
    : null;

  const activeAccent = ZONES.find((z) => z.id === activeId)?.accent || C.distIndustrial;

  function handleImgLoad(e) {
    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  }

  const navigate = useNavigate();

  function navigateToDistrict(id) {
    navigate(`/districts/${id}`);
  }

  function handleClick(id) {
    if (isMobile) {
      if (tapped === id) {
        navigateToDistrict(id);
        setTapped(null);
      } else {
        setTapped(id);
      }
    } else {
      navigateToDistrict(id);
    }
  }

  function handleZoneEnter(id) {
    if (isMobile) return;
    setHovered(id);
    if (tooltipRef.current) tooltipRef.current.style.opacity = "1";
  }

  function handleZoneLeave() {
    if (isMobile) return;
    setHovered(null);
    if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
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
        pointerEvents: mapVisible ? "auto" : "none",
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
          {/* 1) 베이스맵 */}
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
              transition: "filter 0.15s ease-out",
            }}
          />

          {/* 2) 구역 이미지 레이어 */}
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
                  transform: isActive ? "translateY(-14px)" : "translateY(0)",
                  transformOrigin: "center center",
                  filter: isActive
                    ? `brightness(1.1) drop-shadow(0 20px 12px oklch(0 0 0 / 0.9)) drop-shadow(0 0 6px ${zone.glowColor}) drop-shadow(0 0 24px ${zone.glowColor})`
                    : "brightness(1) drop-shadow(0 0 0 transparent)",
                  transition: "opacity 0.05s ease, filter 0.05s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  pointerEvents: "none",
                  willChange: "transform, opacity, filter",
                  zIndex: isActive ? 5 : 1,
                }}
              />
            );
          })}

          {/* 3) SVG 히트박스 */}
          <svg
            viewBox={`0 0 ${vw} ${vh}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              touchAction: "manipulation",
              zIndex: 10,
            }}
            onMouseMove={(e) => {
              if (!isMobile && tooltipRef.current) {
                tooltipRef.current.style.transform = `translate3d(${e.clientX + 20}px, ${e.clientY - 20}px, 0)`;
              }
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
                    onMouseEnter={() => handleZoneEnter(zone.id)}
                    onMouseLeave={handleZoneLeave}
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
                  onMouseEnter={() => handleZoneEnter(zone.id)}
                  onMouseLeave={handleZoneLeave}
                  onClick={() => handleClick(zone.id)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4) 데스크톱 커서 추적 툴팁 */}
      {!isMobile && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
            pointerEvents: "none",
            opacity: 0,
            willChange: "transform, opacity",
            transition: "opacity 0.15s ease-out",
            background: C.bgOverlay,
            border: `1px solid ${activeAccent}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "20px 24px",
            boxShadow: `0 8px 32px oklch(0 0 0 / 0.6)`,
            borderRadius: 4,
            maxWidth: 320,
          }}
        >
          {activeDistrict && (
            <TooltipContent
              district={activeDistrict}
              accent={activeAccent}
              isMobile={false}
            />
          )}
        </div>
      )}

      {/* 5) 모바일 하단 고정 툴팁 */}
      {isMobile && activeDistrict && (
        <div
          style={{
            position: "relative",
            margin: "12px 0 0",
            zIndex: 20,
            background: C.bgOverlay,
            border: `1px solid ${activeAccent}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "14px 16px",
            boxShadow: `0 8px 32px oklch(0 0 0 / 0.5)`,
            borderRadius: 4,
          }}
        >
          <TooltipContent
            district={activeDistrict}
            accent={activeAccent}
            isMobile
          />
        </div>
      )}

      {/* 6) 모바일 안내 */}
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
