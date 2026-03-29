import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import { mainModes, careerModes } from "../data/gamemodes";

export default function GameModes({ isMobile }) {
  const [ref, visible] = useReveal(0.12);
  const [activeIdx, setActiveIdx] = useState(0);
  const mode = mainModes[activeIdx];

  const [refCareer, vCareer] = useReveal(0.12);

  return (
    <section
      id="modes"
      ref={ref}
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "64px 20px 56px" : "100px 48px",
      }}
    >
      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 32 : 56,
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
          Game Modes
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
          당신의 무대를 선택하세요
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

      {/* ═══ Main Story Modes ═══ */}
      <div
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 8 : 12,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.text25,
          }}
        >
          Main Story
        </span>
      </div>

      {/* Tab buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: isMobile ? 6 : 12,
          marginBottom: isMobile ? 28 : 44,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s",
        }}
      >
        {mainModes.map((m, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={m.id}
              onClick={() => setActiveIdx(i)}
              style={{
                background: active ? m.accent : "transparent",
                color: active ? C.black : C.text45,
                border: `1px solid ${active ? m.accent : C.border10}`,
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 12 : 14,
                fontWeight: active ? 600 : 400,
                padding: isMobile ? "8px 16px" : "10px 28px",
                borderRadius: 100,
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                letterSpacing: "0.02em",
              }}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {/* Active mode content */}
      <div
        key={mode.id}
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 40 : 56,
            marginBottom: isMobile ? 16 : 24,
          }}
        >
          {mode.icon}
        </div>
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: mode.accent,
            display: "block",
            marginBottom: 8,
          }}
        >
          {mode.en}
        </span>
        <h3
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 18 : 24,
            fontWeight: 600,
            color: C.white,
            margin: "0 0 16px",
            lineHeight: 1.4,
          }}
        >
          {mode.tagline}
        </h3>
        <p
          style={{
            fontFamily: "var(--f-body)",
            fontSize: isMobile ? 13 : 15,
            lineHeight: 1.9,
            color: C.text45,
            fontWeight: 300,
            wordBreak: "keep-all",
            margin: "0 0 28px",
          }}
        >
          {mode.desc}
        </p>
        <Link
          to={mode.detailPath}
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: mode.accent,
            borderBottom: `1px solid ${mode.accent}`,
            paddingBottom: 4,
            textDecoration: "none",
            transition: "opacity 0.3s",
          }}
        >
          자세히 보기 →
        </Link>
      </div>

      {/* ═══ Career Modes (직업군) ═══ */}
      <div
        ref={refCareer}
        style={{
          marginTop: isMobile ? 56 : 80,
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Sub-header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: isMobile ? 24 : 36,
            opacity: vCareer ? 1 : 0,
            transform: vCareer ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: C.gold,
              display: "block",
              marginBottom: 8,
            }}
          >
            Career Modes
          </span>
          <h3
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? 18 : 22,
              fontWeight: 600,
              color: C.white,
              margin: 0,
            }}
          >
            직업군 모드
          </h3>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: 12,
              color: C.text35,
              margin: "8px 0 0",
              fontWeight: 300,
            }}
          >
            프라임시티에서 또 다른 커리어를 시작하세요.
          </p>
        </div>

        {/* Career cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? 12 : 16,
          }}
        >
          {careerModes.map((cm, i) => (
            <Link
              key={cm.id}
              to={cm.detailPath}
              style={{
                textDecoration: "none",
                padding: isMobile ? "20px 18px" : "24px 22px",
                background: C.bgCard,
                border: `1px solid ${C.border06}`,
                position: "relative",
                overflow: "hidden",
                opacity: vCareer ? 1 : 0,
                transform: vCareer ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`,
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cm.accent;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border06;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${cm.accent}, transparent 70%)`,
                  opacity: 0.6,
                }}
              />

              {/* Icon + title row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 22 }}>{cm.icon}</span>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: cm.accent,
                      display: "block",
                    }}
                  >
                    {cm.en}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--f-display-kr)",
                      fontSize: isMobile ? 15 : 16,
                      fontWeight: 600,
                      color: C.white,
                    }}
                  >
                    {cm.name}
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: 12,
                  color: C.text45,
                  margin: "0 0 10px",
                  lineHeight: 1.6,
                  fontWeight: 300,
                  wordBreak: "keep-all",
                }}
              >
                {cm.tagline}
              </p>

              {/* Location + key character */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    background: C.bgDeep,
                    border: `1px solid ${C.border05}`,
                    color: C.text25,
                    fontFamily: "var(--f-body)",
                  }}
                >
                  {cm.location}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    background: C.bgDeep,
                    border: `1px solid ${C.border05}`,
                    color: C.text25,
                    fontFamily: "var(--f-body)",
                  }}
                >
                  {cm.keyChar}
                </span>
              </div>

              {/* Trigger command */}
              <div
                style={{
                  marginTop: 10,
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: cm.accent,
                  opacity: 0.7,
                }}
              >
                {cm.trigger}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
