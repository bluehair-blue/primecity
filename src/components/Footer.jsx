import C from "../styles/tokens";

export default function Footer({ isMobile }) {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "28px 20px 22px" : "48px 48px 36px",
        borderTop: `1px solid ${C.border06}`,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "center" : "space-between",
        alignItems: "center",
        gap: isMobile ? 10 : 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 16,
            height: 16,
            background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.55 0.12 80) 100%)`,
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: 11,
            color: C.text25,
            letterSpacing: "0.08em",
          }}
        >
          PRIME CITY
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: 10,
          color: C.text15,
          margin: 0,
        }}
      >
        &copy; 2026 bluehair.blue &mdash; All rights reserved.
      </p>
    </footer>
  );
}
