import C from "../styles/tokens";

export default function CharSign({ char, isMobile }) {
  if (!char.sign) return null;
  return (
    <section style={{
      padding: isMobile ? "32px 24px 48px" : "48px 64px",
      maxWidth: 1100, margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <p style={{
        fontFamily: "var(--f-display-en)", fontSize: 10,
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: C.goldText, margin: "0 0 20px",
      }}>Sign</p>
      <img
        src={char.sign}
        alt={`${char.name} signature`}
        style={{
          maxWidth: isMobile ? 220 : 300, height: "auto",
          opacity: 0.9,
          filter: `drop-shadow(0 2px 18px ${char.color}77)`,
        }}
      />
    </section>
  );
}
