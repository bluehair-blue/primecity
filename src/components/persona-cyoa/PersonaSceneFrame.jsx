import { PERSONA_FORGE_COLORS as F } from "../../styles/tokens";
import { cdnUrl } from "../../utils/assets";

export default function PersonaSceneFrame({
  currentNode,
  hasStarted,
  isMobile,
  onNameChange,
  onReset,
  onStart,
  playerName,
  progress,
  scenario,
  children,
}) {
  const imagePath = currentNode?.image || scenario?.heroImage || "";
  const sceneImage = cdnUrl(imagePath);

  return (
    <section
      style={{
        minHeight: isMobile ? "auto" : 680,
        border: `1px solid ${F.goldSoft}`,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: F.bgDeep,
        backgroundImage: sceneImage
          ? `linear-gradient(90deg, oklch(9% 0.022 265 / 0.96), oklch(11% 0.03 265 / 0.78), oklch(14% 0.035 265 / 0.52)), url(${sceneImage})`
          : "linear-gradient(135deg, oklch(12% 0.025 265), oklch(18% 0.04 265))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          minHeight: isMobile ? 560 : 680,
          padding: isMobile ? "24px 18px" : "34px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 28,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 4,
                borderRadius: 999,
                background: "oklch(40% 0.04 265 / 0.45)",
                overflow: "hidden",
              }}
              aria-label="Persona Forge progress"
            >
              <div
                style={{
                  width: `${Math.max(4, Math.min(100, progress))}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${F.gold}, ${F.cyan})`,
                  transition: "width 0.28s ease",
                }}
              />
            </div>
            {hasStarted && (
              <button
                type="button"
                onClick={onReset}
                style={{
                  flex: "0 0 auto",
                  border: `1px solid ${F.goldSoft}`,
                  borderRadius: 8,
                  background: "transparent",
                  color: F.textSoft,
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "8px 12px",
                  fontFamily: "var(--f-body)",
                }}
              >
                다시 빚기
              </button>
            )}
          </div>

          <p
            style={{
              margin: "0 0 10px",
              color: F.gold,
              fontFamily: "var(--f-display-en)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Persona Forge
          </p>
          <h1
            style={{
              margin: 0,
              color: F.textWhite,
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? 30 : 46,
              lineHeight: 1.18,
              wordBreak: "keep-all",
            }}
          >
            {hasStarted ? currentNode?.title || scenario?.title : "페르소나 포지"}
          </h1>
          <p
            style={{
              maxWidth: 680,
              margin: "18px 0 0",
              color: F.textSoft,
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.85,
              wordBreak: "keep-all",
              fontFamily: "var(--f-body)",
            }}
          >
            {hasStarted
              ? currentNode?.body || currentNode?.text
              : scenario?.subtitle ||
                "Shape your first destiny before starting the AI Roleplay."}
          </p>
        </div>

        {!hasStarted ? (
          <div
            style={{
              maxWidth: 520,
              display: "grid",
              gap: 12,
            }}
          >
            <label
              htmlFor="persona-player-name"
              style={{
                color: F.textMuted,
                fontSize: 12,
                fontFamily: "var(--f-body)",
              }}
            >
              플레이어 이름
            </label>
            <input
              id="persona-player-name"
              value={playerName}
              maxLength={40}
              onChange={(event) => onNameChange(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: `1px solid ${F.goldSoft}`,
                borderRadius: 8,
                background: F.bgPanel,
                color: F.textWhite,
                padding: "14px 16px",
                fontFamily: "var(--f-body)",
                fontSize: 15,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={onStart}
              style={{
                border: "none",
                borderRadius: 8,
                background: `linear-gradient(135deg, ${F.gold}, oklch(72% 0.12 72))`,
                color: "oklch(14% 0.03 265)",
                cursor: "pointer",
                fontFamily: "var(--f-body)",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.08em",
                padding: "15px 18px",
                textTransform: "uppercase",
              }}
            >
              Create Persona
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
