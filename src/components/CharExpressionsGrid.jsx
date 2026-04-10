import { Link } from "react-router-dom";
import C from "../styles/tokens";
import { cdnExprUrl, EXPRESSION_LABELS } from "../utils/cdn";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ══════════════════════════════════════════════════════════
   CharExpressionsGrid — Concept art & expressions preview
   ------------------------------------------------------------
   Shared between JgrCharDetail and default CharDetail.
   Renders first 4 expressions as a clickable grid that opens
   the lightbox. Uses the Default (richer) visual variant.
   ------------------------------------------------------------
   Props:
     char          — character data (expressions, color, cdnId)
     isMobile
     sectionRef    — callback ref applied to the outer <section>
                     (parent may combine with useReveal/IO refs)
     sectionStyle  — extra style overrides (opacity/transform for reveal)
     exprErrors    — { [key]: boolean } broken-image flags
     setExprErrors — setter for above
     onOpen        — (key, src) => void  called on valid tile click
   ══════════════════════════════════════════════════════════ */
export default function CharExpressionsGrid({
  char,
  isMobile,
  sectionRef,
  sectionStyle,
  exprErrors,
  setExprErrors,
  onOpen,
}) {
  if (!char.expressions || char.expressions.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "48px 24px" : "64px 64px",
        maxWidth: 1100,
        margin: "0 auto",
        ...sectionStyle,
      }}
    >
      <h3 style={{
        fontFamily: "var(--f-display-en)",
        fontSize: 10,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: C.goldText,
        marginBottom: 6,
      }}>
        Concept Art &amp; Expressions
      </h3>
      <p style={{
        fontFamily: "var(--f-body)",
        fontSize: 12,
        color: C.text35,
        margin: `0 0 ${isMobile ? 20 : 28}px`,
      }}>
        미리보기 · 전체 에셋은 갤러리에서 확인하세요
      </p>

      {/* Preview grid — show first 4 expressions only */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: isMobile ? 8 : 14,
      }}>
        {char.expressions.slice(0, 4).map((key) => {
          const exprSrc = cdnExprUrl(char.cdnId, key);
          const hasError = exprErrors[key];
          return (
            <button
              key={key}
              onClick={() => !hasError && onOpen(key, exprSrc)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                color: "inherit",
                cursor: hasError ? "default" : "pointer",
                textAlign: "left",
                outline: "none",
                aspectRatio: "1/1",
                backgroundColor: C.bgCard,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: C.border06,
                overflow: "hidden",
                position: "relative",
                transition: `border-color 0.3s ${EASE}`,
              }}
              onMouseEnter={(e) => { if (!hasError) e.currentTarget.style.borderColor = char.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; }}
            >
              {!hasError ? (
                <img
                  src={exprSrc}
                  alt={EXPRESSION_LABELS[key]}
                  onError={() => setExprErrors((prev) => ({ ...prev, [key]: true }))}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: `radial-gradient(circle, ${`color-mix(in oklch, ${char.color} 8%, transparent)`}, transparent)`,
                }}>
                  <span style={{
                    fontSize: isMobile ? 11 : 13,
                    color: C.text25,
                    fontFamily: "var(--f-body)",
                  }}>
                    {EXPRESSION_LABELS[key]}
                  </span>
                </div>
              )}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                padding: isMobile ? "4px 6px" : "6px 10px",
                background: `linear-gradient(to top, ${C.bgDeep}, transparent)`,
              }}>
                <span style={{
                  fontFamily: "var(--f-body)",
                  fontSize: isMobile ? 9 : 10,
                  color: C.text45,
                  letterSpacing: "0.05em",
                }}>
                  {EXPRESSION_LABELS[key]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* View all in Gallery button */}
      <div style={{ marginTop: isMobile ? 20 : 28, textAlign: "center" }}>
        <Link
          to={`/gallery?character=${char.id}`}
          style={{
            display: "inline-block",
            padding: isMobile ? "12px 28px" : "14px 36px",
            fontFamily: "var(--f-display-en)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: char.color,
            textDecoration: "none",
            border: `1px solid ${`color-mix(in oklch, ${char.color} 30%, transparent)`}`,
            background: C.bgCard,
            transition: `border-color 0.3s ${EASE}, box-shadow 0.3s ${EASE}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = char.color;
            e.currentTarget.style.boxShadow = `0 0 20px ${`color-mix(in oklch, ${char.color} 15%, transparent)`}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `color-mix(in oklch, ${char.color} 30%, transparent)`;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          View All in Gallery &rarr;
        </Link>
      </div>
    </section>
  );
}
