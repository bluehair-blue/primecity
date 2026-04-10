import { Link } from "react-router-dom";
import C from "../styles/tokens";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ══════════════════════════════════════════════════════════
   CharNavigation — Same-agency chips + prev/next char links
   ------------------------------------------------------------
   Shared between JgrCharDetail and default CharDetail.
   Uses the Default (richer) visual variant with gold hover +
   agency boxShadow.
   ------------------------------------------------------------
   Props:
     prevChar, nextChar, sameAgency, isMobile
     sectionRef   — callback ref applied to outer <section>
                    (parent may combine with useReveal/content refs)
     sectionStyle — extra style overrides (opacity/transform for reveal)
   ══════════════════════════════════════════════════════════ */
export default function CharNavigation({
  prevChar,
  nextChar,
  sameAgency,
  isMobile,
  sectionRef,
  sectionStyle,
}) {
  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "32px 24px 48px" : "48px 64px 80px",
        maxWidth: 1100,
        margin: "0 auto",
        ...sectionStyle,
      }}
    >
      {sameAgency.length > 0 && (
        <div style={{ marginBottom: isMobile ? 32 : 48 }}>
          <h3 style={{
            fontFamily: "var(--f-display-en)",
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.goldText,
            marginBottom: isMobile ? 16 : 20,
          }}>
            Same Agency
          </h3>
          <div style={{ display: "flex", gap: isMobile ? 10 : 16, flexWrap: "wrap" }}>
            {sameAgency.map((c) => (
              <Link
                key={c.id}
                to={`/characters/${c.id}`}
                style={{
                  textDecoration: "none",
                  padding: isMobile ? "10px 16px" : "12px 20px",
                  background: C.bgCard,
                  border: `1px solid ${C.border06}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = c.color;
                  e.currentTarget.style.boxShadow = `0 0 16px ${`color-mix(in oklch, ${c.color} 20%, transparent)`}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border06;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ color: c.color, fontSize: 8 }}>●</span>
                <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text55 }}>
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        paddingTop: 20,
        borderTop: `1px solid ${C.border06}`,
      }}>
        {prevChar ? (
          <Link
            to={`/characters/${prevChar.id}`}
            style={{
              textDecoration: "none",
              color: C.text35,
              fontSize: 12,
              fontFamily: "var(--f-body)",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}
          >
            &larr; {prevChar.name}
          </Link>
        ) : <span />}
        {nextChar ? (
          <Link
            to={`/characters/${nextChar.id}`}
            style={{
              textDecoration: "none",
              color: C.text35,
              fontSize: 12,
              fontFamily: "var(--f-body)",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.text35)}
          >
            {nextChar.name} &rarr;
          </Link>
        ) : <span />}
      </div>
    </section>
  );
}
