import C from "../../styles/tokens";

export default function InfoTag({ label, value, accent }) {
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
