import C from "../styles/tokens";

export default function DistrictCard({
  id,
  name,
  en,
  tier,
  agency,
  desc,
  accent,
  index,
  visible,
  isMobile,
}) {
  return (
    <div
      id={id}
      style={{
        position: "relative",
        padding: isMobile ? "24px 20px" : "36px 32px",
        background: C.bgCard,
        border: `1px solid ${C.border06}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s`,
        overflow: "hidden",
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
          background: `linear-gradient(90deg, ${accent}, transparent 70%)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          display: "inline-block",
          padding: "3px 10px",
          marginBottom: isMobile ? 12 : 16,
          background: C.goldDim,
          border: `1px solid ${C.border10}`,
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: C.gold,
          fontFamily: "var(--f-body)",
        }}
      >
        {tier}
      </div>
      <h3
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 20 : 24,
          fontWeight: 600,
          color: C.white,
          margin: "0 0 4px",
        }}
      >
        {name}
      </h3>
      <span
        style={{
          fontFamily: "var(--f-display-en)",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: C.goldText,
          textTransform: "uppercase",
          fontWeight: 300,
        }}
      >
        {en}
      </span>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 11 : 12,
          color: C.text45,
          margin: "14px 0 10px",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}
      >
        <span style={{ color: accent, opacity: 0.7 }}>◆</span> {agency}
      </p>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 12 : 13,
          lineHeight: 1.8,
          color: C.text35,
          margin: 0,
          fontWeight: 300,
          wordBreak: "keep-all",
        }}
      >
        {desc}
      </p>
    </div>
  );
}
