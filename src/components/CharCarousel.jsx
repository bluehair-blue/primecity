import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import { characters } from "../data/characters";

function Thumbnail({ char, selected, onClick, index, isMobile }) {
  const size = isMobile ? 48 : 60;
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
          ? `${char.color}`.replace(")", " / 0.12)")
          : C.bgCard,
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: selected ? `0 0 16px ${char.color}`.replace(")", " / 0.25)") : "none",
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

export default function CharCarousel({ isMobile }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const char = characters[idx];

  function switchTo(i) {
    if (i === idx) return;
    setFade(false);
    setTimeout(() => {
      setIdx(i);
      setFade(true);
    }, 250);
  }

  function prev() {
    switchTo(idx === 0 ? characters.length - 1 : idx - 1);
  }
  function next() {
    switchTo(idx === characters.length - 1 ? 0 : idx + 1);
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (isMobile) {
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

        {/* Horizontal thumbnail row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {characters.map((c, i) => (
            <Thumbnail
              key={c.id}
              char={c}
              selected={i === idx}
              onClick={() => switchTo(i)}
              index={i}
              isMobile
            />
          ))}
        </div>

        {/* Character content */}
        <div
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
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
                <img
                  src={char.image}
                  alt={char.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 20%",
                    display: "block",
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

  // ── Desktop Layout ──
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
      {/* ── Character illustration (full section background, right-aligned) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "65%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: fade ? 1 : 0,
          transform: fade ? "scale(1) translateX(0)" : "scale(0.97) translateX(20px)",
          transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {char.image ? (
          <img
            src={char.image}
            alt={char.name}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-45%, -50%)",
              height: "100%",
              width: "auto",
              maxWidth: "none",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          /* Placeholder — 이미지 에셋 미완성 캐릭터용 */
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

        {/* Edge fade overlays */}
        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: `linear-gradient(to top, ${C.bgDeep}, transparent)`,
            pointerEvents: "none",
          }}
        />
        {/* Left fade — blends illustration into text area */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "35%",
            background: `linear-gradient(to right, ${C.bgDeep}, transparent)`,
            pointerEvents: "none",
          }}
        />
        {/* Top fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "15%",
            background: `linear-gradient(to bottom, ${C.bgDeep}, transparent)`,
            pointerEvents: "none",
          }}
        />
        {/* Accent glow */}
        {char.image && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${char.color.replace(")", " / 0.06)")}, transparent 70%)`,
              pointerEvents: "none",
              filter: "blur(60px)",
            }}
          />
        )}
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
          zIndex: 1,
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
          {/* Up arrow */}
          <button
            onClick={prev}
            aria-label="이전 캐릭터"
            style={{
              background: "none",
              border: `1px solid ${C.border10}`,
              color: C.text35,
              cursor: "pointer",
              width: 36,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = C.border10)
            }
          >
            ▲
          </button>

          {characters.map((c, i) => (
            <Thumbnail
              key={c.id}
              char={c}
              selected={i === idx}
              onClick={() => switchTo(i)}
              index={i}
            />
          ))}

          {/* Down arrow */}
          <button
            onClick={next}
            aria-label="다음 캐릭터"
            style={{
              background: "none",
              border: `1px solid ${C.border10}`,
              color: C.text35,
              cursor: "pointer",
              width: 36,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = C.border10)
            }
          >
            ▼
          </button>
        </div>

        {/* ── Center: Character info ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 480,
            opacity: fade ? 1 : 0,
            transform: fade ? "translateX(0)" : "translateX(-16px)",
            transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
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
              background: `linear-gradient(90deg, ${char.color}, oklch(0.65 0.12 340), oklch(0.72 0.10 170), transparent)`,
              margin: "8px 0 20px",
              transition: "background 0.4s",
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
              color: C.text35,
              fontWeight: 300,
              wordBreak: "keep-all",
              margin: "0 0 24px",
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            자세히 보기 &rarr;
          </Link>
        </div>

        {/* Right side is now absolute-positioned at section level */}
      </div>
    </section>
  );
}
