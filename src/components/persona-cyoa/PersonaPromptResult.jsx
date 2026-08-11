import { PERSONA_FORGE_COLORS as F } from "../../styles/tokens";

export default function PersonaPromptResult({
  copied,
  isMobile,
  onCopy,
  onRefine,
  onStartChat,
  prompt,
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
          gap: 12,
        }}
      >
        <button type="button" onClick={onStartChat} style={primaryButtonStyle(isMobile)}>
          Start Chatbot with this Persona
        </button>
        <button type="button" onClick={onRefine} style={secondaryButtonStyle(isMobile)}>
          Refine with AI
        </button>
      </div>
      <button type="button" onClick={onCopy} style={copyButtonStyle(isMobile)}>
        {copied ? "Copied" : "Copy Prompt"}
      </button>
      <pre
        style={{
          margin: 0,
          maxHeight: isMobile ? 340 : 420,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          border: `1px solid ${F.goldSoft}`,
          borderRadius: 8,
          background: "oklch(10% 0.02 265 / 0.88)",
          color: F.textSoft,
          padding: isMobile ? "16px" : "20px",
          fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
          fontSize: isMobile ? 12 : 13,
          lineHeight: 1.7,
        }}
      >
        {prompt}
      </pre>
    </div>
  );
}

function primaryButtonStyle(isMobile) {
  return {
    minHeight: isMobile ? 48 : 54,
    border: "none",
    borderRadius: 8,
    background: `linear-gradient(135deg, ${F.gold}, oklch(72% 0.12 72))`,
    color: "oklch(14% 0.03 265)",
    cursor: "pointer",
    fontFamily: "var(--f-body)",
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: "0.04em",
    padding: "14px 16px",
  };
}

function secondaryButtonStyle(isMobile) {
  return {
    minHeight: isMobile ? 48 : 54,
    border: `1px solid ${F.cyan}`,
    borderRadius: 8,
    background: "oklch(17% 0.04 240 / 0.74)",
    color: F.textWhite,
    cursor: "pointer",
    fontFamily: "var(--f-body)",
    fontWeight: 700,
    fontSize: 13,
    padding: "14px 16px",
  };
}

function copyButtonStyle(isMobile) {
  return {
    minHeight: isMobile ? 46 : 50,
    border: `1px solid ${F.goldSoft}`,
    borderRadius: 8,
    background: F.bgPanelSoft,
    color: F.textSoft,
    cursor: "pointer",
    fontFamily: "var(--f-body)",
    fontWeight: 700,
    fontSize: 13,
    padding: "12px 16px",
  };
}
