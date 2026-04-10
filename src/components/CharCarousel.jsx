import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import { characters } from "../data/characters";

/* oklch 색상에 투명도를 안전하게 적용 */
function alpha(color, pct) {
  return `color-mix(in oklch, ${color} ${Math.round(pct * 100)}%, transparent)`;
}

function Thumbnail({ char, selected, onClick, index, isMobile }) {
  const size = isMobile ? 40 : 60;
  return (
    <button
      onClick={onClick}
      aria-label={char.name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: selected
          ? `2px solid ${char.color}`
          : `1px solid ${C.border10}`,
        background: selected
          ? alpha(char.color, 0.12)
          : C.bgCard,
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: selected ? `0 0 16px ${alpha(char.color, 0.25)}` : "none",
        flexShrink: 0,
        opacity: selected ? 1 : 0.5,
      }}
    >
      {char.thumbnail ? (
        <img
          src={char.thumbnail}
          alt={char.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 14 : 16,
            fontWeight: 600,
            color: selected ? char.color : C.text35,
            transition: "color 0.3s",
          }}
        >
          {char.name[0]}
        </span>
      )}
    </button>
  );
}

function InfoTag({ label, value, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <span
        style={{
          fontFamily: "var(--f-body)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: C.black,
          background: accent,
          padding: "3px 10px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--f-body)",
          fontSize: 11,
          fontWeight: 400,
          color: C.text55,
          padding: "3px 12px",
          border: `1px solid ${C.border10}`,
          borderLeft: "none",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const PAGE_SIZE = 5;

export default function CharCarousel({ isMobile }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const timeoutRef = useRef(null);
  const char = characters[idx];

  // Reset imgLoaded when character changes (so skeleton shows during swap)
  useEffect(() => {
    setImgLoaded(false);
  }, [char.id]);

  // Preload selected + neighbors immediately
  useEffect(() => {
    const neighbors = [idx - 1, idx, idx + 1]
      .map((i) => characters[((i % characters.length) + characters.length) % characters.length])
      .filter((c) => c?.image);
    neighbors.forEach((c) => {
      const img = new Image();
      img.src = c.image;
    });
  }, [idx]);

  // Idle preload for the rest (all characters)
  useEffect(() => {
    const preloadAll = () => {
      characters.forEach((c) => {
        if (c.image) {
          const img = new Image();
          img.src = c.image;
        }
      });
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preloadAll, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(preloadAll, 500);
    return () => clearTimeout(timer);
  }, []);

  // Thumbnail pagination
  const totalPages = Math.ceil(characters.length / PAGE_SIZE);
  const currentPage = Math.floor(idx / PAGE_SIZE);
  const pageChars = characters.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  function switchTo(i) {
    if (i === idx) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFade(false);
    timeoutRef.current = setTimeout(() => {
      setIdx(i);
      setFade(true);
    }, 250);
  }

  function prevPage() {
    const newPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    switchTo(newPage * PAGE_SIZE);
  }
  function nextPage() {
    const newPage = currentPage === totalPages - 1 ? 0 : currentPage + 1;
    switchTo(newPage * PAGE_SIZE);
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") {
        switchTo(idx === 0 ? characters.length - 1 : idx - 1);
      }
      if (e.key === "ArrowRight") {
        switchTo(idx === characters.length - 1 ? 0 : idx + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx]);

  const carouselProps = {
    idx, fade, char, switchTo, prevPage, nextPage,
    pageChars, totalPages, currentPage,
    imgLoaded, setImgLoaded,
  };

  return isMobile
    ? <MobileCarousel {...carouselProps} />
    : <DesktopCarousel {...carouselProps} />;
}

function MobileCarousel({ idx, fade, char, switchTo, prevPage, nextPage, pageChars, totalPages, imgLoaded, setImgLoaded }) {
  return (
      <section
        id="characters"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "64px 20px 56px",
          overflow: "hidden",
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: 9,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: C.gold,
              display: "block",
              marginBottom: 10,
            }}
          >
            Characters
          </span>
          <h2
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: "clamp(22px,6vw,30px)",
              fontWeight: 600,
              color: C.white,
              margin: 0,
            }}
          >
            이 무대의 주인공들
          </h2>
        </div>

        {/* Horizontal thumbnail row with pagination */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            maxWidth: "100%",
            padding: "0 12px",
          }}
        >
          <button
            onClick={prevPage}
            aria-label="이전 그룹"
            style={{
              background: "none",
              border: `1px solid ${totalPages > 1 ? C.border10 : C.border06}`,
              color: totalPages > 1 ? C.text35 : C.text15,
              cursor: totalPages > 1 ? "pointer" : "default",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              flexShrink: 0,
              borderRadius: "50%",
            }}
          >
            ◀
          </button>
          {pageChars.map((c) => {
            const globalIdx = characters.indexOf(c);
            return (
              <Thumbnail
                key={c.id}
                char={c}
                selected={globalIdx === idx}
                onClick={() => switchTo(globalIdx)}
                index={globalIdx}
                isMobile
              />
            );
          })}
          <button
            onClick={nextPage}
            aria-label="다음 그룹"
            style={{
              background: "none",
              border: `1px solid ${totalPages > 1 ? C.border10 : C.border06}`,
              color: totalPages > 1 ? C.text35 : C.text15,
              cursor: totalPages > 1 ? "pointer" : "default",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              flexShrink: 0,
              borderRadius: "50%",
            }}
          >
            ▶
          </button>
        </div>

        {/* Character content */}
        <div
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Character image */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1/1",
              maxWidth: 320,
              margin: "0 auto 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {char.image ? (
              <>
                {!imgLoaded && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${alpha(char.color, 0.12)}, ${C.bgCard})`,
                    }}
                  />
                )}
                <img
                  src={char.image}
                  alt={char.name}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 20%",
                    display: "block",
                    opacity: imgLoaded ? 1 : 0,
                    transition: "opacity 0.3s ease-out",
                  }}
                />
                {/* Bottom fade */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "35%",
                    background: `linear-gradient(to top, ${C.bgDeep}, transparent)`,
                    pointerEvents: "none",
                  }}
                />
                {/* Left/Right fade */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "15%",
                    background: `linear-gradient(to right, ${C.bgDeep}, transparent)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "15%",
                    background: `linear-gradient(to left, ${C.bgDeep}, transparent)`,
                    pointerEvents: "none",
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: C.bgCard,
                  border: `1px solid ${C.border06}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: C.text15,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                  }}
                >
                  CHARACTER IMAGE
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ maxWidth: 340, margin: "0 auto" }}>
            <div
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: 26,
                fontWeight: 700,
                color: C.white,
                marginBottom: 12,
              }}
            >
              <span style={{ color: C.text25, fontWeight: 300 }}>[ </span>
              {char.name}
              <span style={{ color: C.text25, fontWeight: 300 }}> ]</span>
            </div>

            {/* Tags */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 16,
              }}
            >
              <InfoTag label="소속" value={char.agency} accent={char.color} />
              <InfoTag label="직업" value={char.role} accent={char.color} />
            </div>

            {/* Sign */}
            {char.sign && (
              <div style={{ margin: "0 0 14px" }}>
                <img
                  src={char.sign}
                  alt={`${char.name} signature`}
                  style={{
                    maxWidth: 160,
                    height: "auto",
                    opacity: 0.85,
                    filter: "drop-shadow(0 2px 8px oklch(0 0 0 / 0.4))",
                  }}
                />
              </div>
            )}

            {/* Tagline */}
            <p
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: 13,
                color: C.gold,
                fontStyle: "italic",
                lineHeight: 1.6,
                margin: "0 0 14px",
                wordBreak: "keep-all",
              }}
            >
              &ldquo;{char.tagline}&rdquo;
            </p>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 12,
                lineHeight: 1.85,
                color: C.text35,
                fontWeight: 300,
                wordBreak: "keep-all",
                margin: "0 0 16px",
              }}
            >
              {char.brief}
            </p>

            <Link
              to={char.detailPath}
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 11,
                color: char.color,
                textDecoration: "none",
                letterSpacing: "0.06em",
                transition: "opacity 0.3s",
              }}
            >
              자세히 보기 &rarr;
            </Link>
          </div>
        </div>
      </section>
  );
}

function DesktopCarousel({ idx, fade, char, switchTo, prevPage, nextPage, pageChars, totalPages, imgLoaded, setImgLoaded }) {
  const accentFaint = alpha(char.color, 0.06);
  const accentMid = alpha(char.color, 0.15);

  return (
    <section
      id="characters"
      style={{
        position: "relative",
        zIndex: 2,
        padding: "100px 0",
        overflow: "hidden",
        minHeight: 720,
      }}
    >
      {/* ── Character illustration (expanded, overlaps text) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "85%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: fade ? 1 : 0,
          transform: fade ? "scale(1) translateX(0)" : "scale(0.97) translateX(20px)",
          transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {char.image ? (
          <>
            {!imgLoaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${alpha(char.color, 0.12)}, ${C.bgCard})`,
                }}
              />
            )}
            <img
              src={char.image}
              alt={char.name}
              onLoad={() => setImgLoaded(true)}
              style={{
                position: "absolute",
                top: "50%",
                left: "55%",
                transform: "translate(-45%, -50%)",
                height: "105%",
                width: "auto",
                maxWidth: "none",
                objectFit: "contain",
                display: "block",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-out",
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: 72,
                color: char.color,
                opacity: 0.08,
              }}
            >
              {char.name}
            </span>
            <span
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 10,
                color: C.text15,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Character Image
            </span>
          </div>
        )}

        {/* ── 4-edge fade (vignette) ── */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: `linear-gradient(to top, ${C.bgDeep}, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "40%", background: `linear-gradient(to right, ${C.bgDeep}, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "18%", background: `linear-gradient(to bottom, ${C.bgDeep}, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "15%", background: `linear-gradient(to left, ${C.bgDeep}, transparent)`, pointerEvents: "none" }} />

        {/* ── Scanline effect ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent 10%, ${alpha(char.color, 0.3)}, transparent 90%)`,
              animation: "charScanline 4s linear infinite",
              boxShadow: `0 0 20px 4px ${alpha(char.color, 0.12)}`,
            }}
          />
        </div>

        {/* ── Accent glow pulse ── */}
        {char.image && (
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "55%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accentFaint}, transparent 70%)`,
              pointerEvents: "none",
              filter: "blur(60px)",
              animation: "charGlowPulse 5s ease-in-out infinite",
            }}
          />
        )}

        {/* ── Corner frame decorations ── */}
        <div style={{ position: "absolute", top: 24, right: 24, width: 28, height: 28, borderTop: `2px solid ${alpha(char.color, 0.4)}`, borderRight: `2px solid ${alpha(char.color, 0.4)}`, pointerEvents: "none", transition: "border-color 0.4s" }} />
        <div style={{ position: "absolute", bottom: 24, right: 24, width: 28, height: 28, borderBottom: `2px solid ${alpha(char.color, 0.4)}`, borderRight: `2px solid ${alpha(char.color, 0.4)}`, pointerEvents: "none", transition: "border-color 0.4s" }} />
        <div style={{ position: "absolute", top: 24, right: 24, width: 5, height: 5, background: alpha(char.color, 0.5), pointerEvents: "none", transition: "background 0.4s" }} />
      </div>

      {/* Background typography */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-2%",
          transform: "translateY(-50%)",
          fontFamily: "var(--f-display-en)",
          fontSize: "clamp(120px, 14vw, 220px)",
          fontWeight: 700,
          color: C.text15,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0.3,
          lineHeight: 0.9,
        }}
      >
        PRIME
        <br />
        CITY
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
          display: "flex",
          gap: 40,
          alignItems: "stretch",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── Left: Thumbnail column ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            onClick={prevPage}
            aria-label="이전 그룹"
            style={{
              background: "none",
              border: `1px solid ${totalPages > 1 ? C.border10 : C.border06}`,
              color: totalPages > 1 ? C.text35 : C.text15,
              cursor: totalPages > 1 ? "pointer" : "default",
              width: 36,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              transition: "border-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (totalPages > 1) e.currentTarget.style.borderColor = C.gold;
            }}
            onMouseLeave={(e) => {
              if (totalPages > 1) e.currentTarget.style.borderColor = C.border10;
            }}
          >
            ▲
          </button>

          {pageChars.map((c) => {
            const globalIdx = characters.indexOf(c);
            return (
              <Thumbnail
                key={c.id}
                char={c}
                selected={globalIdx === idx}
                onClick={() => switchTo(globalIdx)}
                index={globalIdx}
              />
            );
          })}

          <button
            onClick={nextPage}
            aria-label="다음 그룹"
            style={{
              background: "none",
              border: `1px solid ${totalPages > 1 ? C.border10 : C.border06}`,
              color: totalPages > 1 ? C.text35 : C.text15,
              cursor: totalPages > 1 ? "pointer" : "default",
              width: 36,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              transition: "border-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (totalPages > 1) e.currentTarget.style.borderColor = C.gold;
            }}
            onMouseLeave={(e) => {
              if (totalPages > 1) e.currentTarget.style.borderColor = C.border10;
            }}
          >
            ▼
          </button>
        </div>

        {/* ── Center: Character info (overlaps illustration) ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 480,
            position: "relative",
            opacity: fade ? 1 : 0,
            transform: fade ? "translateX(0)" : "translateX(-16px)",
            transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Readability gradient behind text */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: -40,
              bottom: -40,
              width: "140%",
              background: `linear-gradient(to right, ${C.bgDeep} 20%, oklch(0.08 0.01 280 / 0.7) 60%, transparent 100%)`,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />

          {/* Section label + counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: C.gold,
                textShadow: "0 0 12px oklch(0 0 0 / 0.8)",
              }}
            >
              Characters
            </span>
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 11,
                color: C.text25,
                letterSpacing: "0.1em",
                textShadow: "0 0 8px oklch(0 0 0 / 0.6)",
              }}
            >
              {idx + 1} / {characters.length}
            </span>
          </div>

          {/* Name */}
          <h2
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              color: C.white,
              margin: "0 0 6px",
              lineHeight: 1.2,
              textShadow: "0 2px 16px oklch(0 0 0 / 0.7), 0 0 4px oklch(0 0 0 / 0.5)",
            }}
          >
            <span
              style={{
                color: C.text25,
                fontWeight: 300,
                fontFamily: "var(--f-display-en)",
              }}
            >
              [{" "}
            </span>
            {char.name}
            <span
              style={{
                color: C.text25,
                fontWeight: 300,
                fontFamily: "var(--f-display-en)",
              }}
            >
              {" "}]
            </span>
          </h2>

          {/* Color accent line */}
          <div
            style={{
              width: 120,
              height: 2,
              background: `linear-gradient(90deg, ${char.color}, ${alpha(char.color, 0.3)}, transparent)`,
              margin: "8px 0 20px",
              transition: "background 0.4s",
              boxShadow: `0 0 8px ${accentMid}`,
            }}
          />

          {/* Info tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <InfoTag label="소속" value={char.agency} accent={char.color} />
            <InfoTag label="직업" value={char.role} accent={char.color} />
          </div>

          {/* Sign */}
          {char.sign && (
            <div style={{ margin: "0 0 16px" }}>
              <img
                src={char.sign}
                alt={`${char.name} signature`}
                style={{
                  maxWidth: 220,
                  height: "auto",
                  opacity: 0.85,
                  filter: "drop-shadow(0 2px 12px oklch(0 0 0 / 0.5))",
                }}
              />
            </div>
          )}

          {/* Tagline */}
          <p
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: 15,
              color: C.gold,
              fontStyle: "italic",
              lineHeight: 1.7,
              margin: "0 0 20px",
              wordBreak: "keep-all",
              textShadow: "0 0 12px oklch(0 0 0 / 0.7)",
            }}
          >
            &ldquo;{char.tagline}&rdquo;
          </p>

          {/* Brief description */}
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: 13,
              lineHeight: 1.9,
              color: C.text45,
              fontWeight: 300,
              wordBreak: "keep-all",
              margin: "0 0 24px",
              textShadow: "0 0 8px oklch(0 0 0 / 0.6)",
            }}
          >
            {char.brief}
          </p>

          {/* Detail link */}
          <Link
            to={char.detailPath}
            style={{
              fontFamily: "var(--f-body)",
              fontSize: 12,
              color: char.color,
              textDecoration: "none",
              letterSpacing: "0.08em",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "opacity 0.3s",
              textShadow: "0 0 8px oklch(0 0 0 / 0.5)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            자세히 보기 &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
