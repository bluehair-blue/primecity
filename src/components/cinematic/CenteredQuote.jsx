/* ══════════════════════════════════════════════════════════
   CenteredQuote — shared quote overlay for all Intro components
   ------------------------------------------------------------
   Props:
     char       : character object (quoteSequence, name, agency, color)
     isMobile   : boolean
     emphasis   : "subtle" | "hero"
                  subtle = medium size, char.color text, opacity 0.82
                  hero   = large, shows agency + name + quote
     show       : boolean — opacity/transform gate
     quoteIndex : number (default 0) — for 2-beat sequences (NHR/HSR/HSE)
     glitch     : boolean (default false) — LSH: applies cinemaGlitchText animation
     blurred    : boolean (default false) — MMR Beat 2: blur + translateY
   ══════════════════════════════════════════════════════════ */
export default function CenteredQuote({
  char,
  isMobile,
  emphasis = "subtle",
  show,
  quoteIndex = 0,
  glitch = false,
  blurred = false,
}) {
  const quote =
    char.quoteSequence?.[quoteIndex] ||
    char.quoteSequence?.[0] ||
    char.tagline ||
    "";
  const isHero = emphasis === "hero";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isMobile ? "0 24px" : "0 48px",
        pointerEvents: "none",
        opacity: show ? 1 : 0,
        transform: show
          ? blurred ? "translateY(-12px) scale(1)" : "translateY(0) scale(1)"
          : "translateY(16px) scale(0.96)",
        filter: blurred ? "blur(8px)" : "none",
        transition:
          "opacity 0.8s ease-out, transform 1.0s ease-out, filter 0.35s ease-out",
        animation: glitch && show ? "cinemaGlitchText 2.4s ease-out" : "none",
      }}
    >
      {/* agency — hero only */}
      {isHero && (
        <p
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: isMobile ? 11 : 14,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: char.color,
            margin: "0 0 14px",
            textShadow: "0 2px 20px oklch(0 0 0 / 0.85)",
          }}
        >
          {char.agency}
        </p>
      )}

      {/* name — hero only */}
      {isHero && (
        <h1
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile
              ? "clamp(58px,16vw,84px)"
              : "clamp(84px,10vw,144px)",
            fontWeight: 700,
            color: "oklch(0.99 0 0)",
            margin: "0 0 20px",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: "0 6px 48px oklch(0 0 0 / 0.9)",
          }}
        >
          {char.name}
        </h1>
      )}

      {/* quote */}
      <p
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isHero
            ? (isMobile ? 17 : 24)
            : (isMobile ? "clamp(14px,4vw,18px)" : "clamp(16px,1.8vw,22px)"),
          fontStyle: "italic",
          fontWeight: isHero ? 500 : 400,
          color: "oklch(0.99 0 0)",
          margin: 0,
          wordBreak: "keep-all",
          textShadow: isHero
            ? "0 2px 24px oklch(0 0 0 / 0.9)"
            : "0 0 2px oklch(0 0 0), 0 0 8px oklch(0 0 0 / 0.9), 0 3px 20px oklch(0 0 0 / 0.85)",
          opacity: 1,
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
