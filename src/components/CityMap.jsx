import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import { districts } from "../data/districts";
import useReveal from "../hooks/useReveal";
import { cdnUrl } from "../utils/cdn";
import DistrictTooltip from "./DistrictTooltip";
import {
  ZONES,
  INDUSTRIAL_INFO,
  ringPath,
  industrialPolygon,
  hypeTopPolygon,
  terraceExtensionPolygon,
  terraceRightOverride,
} from "../data/cityMapGeometry";

const BASE_SRC = cdnUrl("Citybase(1).webp");

const CENTER_X = 0.50;
const CENTER_Y = 0.47;
const RATIO = 0.54;

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
      setTapped(tapped === id ? null : id);
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
        transition: "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)",
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

          {/* 2.5) Holographic blue grid underlay */}
          <svg
            viewBox={`0 0 ${vw} ${vh}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 3,
              pointerEvents: "none",
              opacity: activeId ? 0.12 : 0.04,
              transition: "opacity 0.4s ease",
            }}
          >
            <defs>
              <pattern
                id="holo-grid"
                width={isMobile ? vw / 10 : vw / 20}
                height={isMobile ? vh / 6 : vh / 12}
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2={isMobile ? vw / 10 : vw / 20} y2="0" stroke="oklch(0.62 0.20 252 / 0.3)" strokeWidth="0.5" />
                <line x1="0" y1="0" x2="0" y2={isMobile ? vh / 6 : vh / 12} stroke="oklch(0.62 0.20 252 / 0.3)" strokeWidth="0.5" />
                <animateTransform
                  attributeName="patternTransform"
                  type="translate"
                  from="0 0"
                  to={`${isMobile ? vw / 10 : vw / 20} ${isMobile ? vh / 6 : vh / 12}`}
                  dur="12s"
                  repeatCount="indefinite"
                />
              </pattern>
            </defs>
            <rect width={vw} height={vh} fill="url(#holo-grid)" />
          </svg>

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
              if (!isMobile && tooltipRef.current && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                tooltipRef.current.style.transform = `translate3d(${x + 20}px, ${y + 20}px, 0)`;
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

            {/* Terrace 우측+하단 확장 */}
            <polygon
              points={terraceExtensionPolygon(vw, vh)}
              fill="transparent"
              pointerEvents="visibleFill"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => handleZoneEnter("terrace")}
              onMouseLeave={handleZoneLeave}
              onClick={() => handleClick("terrace")}
            />

            {/* Hype Road 상단 확장 — Terrace 링 위에 렌더하여 우선 히트 */}
            <polygon
              points={hypeTopPolygon(vw, vh)}
              fill="transparent"
              pointerEvents="visibleFill"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => handleZoneEnter("hype")}
              onMouseLeave={handleZoneLeave}
              onClick={() => handleClick("hype")}
            />

            {/* Terrace 우측 수로 오버라이드 — Hype 상단 폴리곤 위 최상위 렌더 */}
            <polygon
              points={terraceRightOverride(vw, vh)}
              fill="transparent"
              pointerEvents="visibleFill"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => handleZoneEnter("terrace")}
              onMouseLeave={handleZoneLeave}
              onClick={() => handleClick("terrace")}
            />
          </svg>
        </div>
      </div>

      {/* 4) 데스크톱 커서 추적 툴팁 */}
      {!isMobile && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
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
            <DistrictTooltip
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
          <DistrictTooltip
            district={activeDistrict}
            accent={activeAccent}
            isMobile
            onNavigate={() => navigateToDistrict(activeId)}
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
          구역을 탭하세요
        </div>
      )}
    </div>
  );
}
