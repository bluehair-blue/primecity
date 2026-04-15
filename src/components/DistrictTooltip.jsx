import C from "../styles/tokens";

/* ── Tooltip content (shared between mobile fixed and desktop floating) ── */
export default function DistrictTooltip({ district, accent, isMobile, onNavigate }) {
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
      {isMobile && onNavigate && (
        <button
          onClick={onNavigate}
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "8px 18px",
            fontFamily: "var(--f-body)",
            fontSize: 11,
            color: accent,
            letterSpacing: "0.06em",
            background: "transparent",
            border: `1px solid ${accent}`,
            cursor: "pointer",
            transition: "border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          자세히 보기 →
        </button>
      )}
    </>
  );
}
