import { PERSONA_FORGE_COLORS as F } from "../../styles/tokens";

export default function PersonaChoiceList({ choices, disabled, isMobile, onChoose }) {
  if (!Array.isArray(choices) || choices.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          disabled={disabled}
          onClick={() => onChoose(choice)}
          style={{
            minHeight: isMobile ? 118 : 136,
            padding: isMobile ? "16px" : "18px",
            border: `1px solid ${F.goldSoft}`,
            borderRadius: 8,
            background: F.bgPanelSoft,
            color: F.textWhite,
            cursor: disabled ? "not-allowed" : "pointer",
            textAlign: "left",
            fontFamily: "var(--f-body)",
            transition: "border-color 0.2s ease, background 0.2s ease, transform 0.2s ease",
          }}
          onMouseEnter={(event) => {
            if (disabled) return;
            event.currentTarget.style.borderColor = F.gold;
            event.currentTarget.style.background = "oklch(24% 0.048 265 / 0.74)";
            event.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor = F.goldSoft;
            event.currentTarget.style.background = F.bgPanelSoft;
            event.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: isMobile ? 15 : 16,
              fontWeight: 700,
              lineHeight: 1.45,
              wordBreak: "keep-all",
            }}
          >
            {choice.label}
          </span>
          <span
            style={{
              display: "block",
              marginTop: 10,
              color: F.textSoft,
              fontSize: isMobile ? 12 : 13,
              lineHeight: 1.65,
              wordBreak: "keep-all",
            }}
          >
            {choice.description}
          </span>
        </button>
      ))}
    </div>
  );
}
