import { useState } from "react";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import { gamemodes } from "../data/gamemodes";

export default function GameModes({ isMobile }) {
  const [ref, visible] = useReveal(0.12);
  const [activeIdx, setActiveIdx] = useState(0);
  const mode = gamemodes[activeIdx];

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
        {gamemodes.map((m, i) => {
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
        {/* Icon */}
        <div
          style={{
            fontSize: isMobile ? 40 : 56,
            marginBottom: isMobile ? 16 : 24,
          }}
        >
          {mode.icon}
        </div>

        {/* English label */}
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

        {/* Tagline */}
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

        {/* Description */}
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

        {/* Detail link placeholder */}
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 10 : 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.text25,
            borderBottom: `1px solid ${C.border10}`,
            paddingBottom: 4,
            cursor: "default",
          }}
        >
          Coming Soon
        </span>
      </div>
    </section>
  );
}
