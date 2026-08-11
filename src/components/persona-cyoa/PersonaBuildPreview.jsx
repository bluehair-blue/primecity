import { PERSONA_FORGE_COLORS as F } from "../../styles/tokens";
import { PERSONA_SLOT_LABELS, PERSONA_VECTOR_KEYS } from "../../utils/personaSchema";
import { getFinalArchetype } from "../../utils/personaCompiler";

const PREVIEW_SLOTS = [
  "appearance",
  "traits",
  "strengths",
  "flaws",
  "backstory",
  "startPoint",
  "goals",
  "promptNotes",
];

function SlotPreview({ build, slot }) {
  const value = build?.[slot];
  const lines = Array.isArray(value) ? value.slice(0, 3) : value ? [value] : [];

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <strong
        style={{
          color: F.gold,
          fontSize: 11,
          letterSpacing: "0.08em",
          fontFamily: "var(--f-body)",
        }}
      >
        {PERSONA_SLOT_LABELS[slot]}
      </strong>
      <div style={{ display: "grid", gap: 4 }}>
        {lines.length ? (
          lines.map((line) => (
            <span
              key={line}
              style={{
                color: F.textSoft,
                fontSize: 12,
                lineHeight: 1.55,
                wordBreak: "keep-all",
              }}
            >
              {line}
            </span>
          ))
        ) : (
          <span style={{ color: F.textMuted, fontSize: 12 }}>아직 비어 있음</span>
        )}
      </div>
    </div>
  );
}

export default function PersonaBuildPreview({ build, isMobile, playerName, stats }) {
  const archetype = getFinalArchetype(stats, build);
  const targetLabel = build?.targetCharacterLabel || "미정";
  const maxStat = Math.max(12, ...PERSONA_VECTOR_KEYS.map((key) => Math.abs(stats?.[key] || 0)));

  return (
    <aside
      aria-label="My Persona Card"
      style={{
        border: `1px solid ${F.goldSoft}`,
        borderRadius: 8,
        background: F.bgPanel,
        padding: isMobile ? "18px" : "22px",
        position: isMobile ? "static" : "sticky",
        top: isMobile ? "auto" : 24,
        maxHeight: isMobile ? "none" : "calc(100vh - 48px)",
        overflowY: "auto",
        fontFamily: "var(--f-body)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: F.cyan,
          fontFamily: "var(--f-display-en)",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        My Persona Card
      </p>
      <h2
        style={{
          margin: "10px 0 6px",
          color: F.textWhite,
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 22 : 26,
          lineHeight: 1.25,
        }}
      >
        {playerName || "이름 미정"}
      </h2>
      <p style={{ margin: 0, color: F.textMuted, fontSize: 13 }}>
        {archetype} · {targetLabel}
      </p>

      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, ${F.goldSoft}, transparent)`,
          margin: "18px 0",
        }}
      />

      <div style={{ display: "grid", gap: 9 }}>
        {PERSONA_VECTOR_KEYS.map((key) => {
          const value = stats?.[key] || 0;
          const width = `${Math.min(100, Math.round((Math.abs(value) / maxStat) * 100))}%`;
          return (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "92px 1fr 30px", gap: 8, alignItems: "center" }}>
              <span style={{ color: F.textMuted, fontSize: 11 }}>{key}</span>
              <div style={{ height: 6, borderRadius: 999, background: "oklch(42% 0.04 265 / 0.36)", overflow: "hidden" }}>
                <div
                  style={{
                    width,
                    height: "100%",
                    background: value >= 0 ? F.gold : F.danger,
                    transition: "width 0.24s ease",
                  }}
                />
              </div>
              <span style={{ color: F.textSoft, fontSize: 11, textAlign: "right" }}>{value}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, ${F.goldSoft}, transparent)`,
          margin: "18px 0",
        }}
      />

      <div style={{ display: "grid", gap: 16 }}>
        {PREVIEW_SLOTS.map((slot) => (
          <SlotPreview key={slot} build={build} slot={slot} />
        ))}
      </div>
    </aside>
  );
}
