import { useState } from "react";
import C from "../styles/tokens";
import { CHAR_CODES, SCENE_CATEGORIES } from "../data/galleryConfig";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function ImageSystemInfo({ isMobile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ margin: isMobile ? "20px 0 28px" : "28px 0 40px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          width: "100%", padding: "10px 0",
          fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.2em",
          textTransform: "uppercase", color: C.text25,
          background: "transparent", border: "none", cursor: "pointer",
          transition: `color 0.3s ${EASE}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.gold; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.text25; }}
      >
        Image System {expanded ? "▾" : "▸"}
      </button>

      {expanded && (
        <div style={{
          padding: isMobile ? "16px 14px" : "24px 28px",
          background: C.bgCard, border: `1px solid ${C.border06}`,
          animation: "fadeSlideDown 0.3s ease",
        }}>
          <style>{`@keyframes fadeSlideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

          {/* URL format */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>
              CDN Path
            </span>
            <pre style={{
              fontFamily: "monospace", fontSize: isMobile ? 10 : 12,
              color: C.text55, margin: "6px 0 0", padding: "8px 12px",
              background: C.bgDeep, border: `1px solid ${C.border05}`,
              overflowX: "auto", whiteSpace: "pre",
            }}>
              img.bluehair.blue/ent/<span style={{ color: C.gold }}>{"{"}</span>캐릭터코드<span style={{ color: C.gold }}>{"}"}</span>/<span style={{ color: C.gold }}>{"{"}</span>상황코드<span style={{ color: C.gold }}>{"}"}</span>.webp
            </pre>
          </div>

          {/* Character codes */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>
              Character Codes — {CHAR_CODES.length}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {CHAR_CODES.map((c) => (
                <span key={c.code} style={{
                  fontSize: 10, padding: "3px 8px",
                  background: C.bgDeep, border: `1px solid ${C.border05}`,
                  color: C.text45, fontFamily: "var(--f-body)",
                }}>
                  <span style={{ fontFamily: "monospace", color: C.text55 }}>{c.code}</span>
                  <span style={{ color: C.text25, margin: "0 4px" }}>·</span>
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Scene code categories */}
          <div>
            <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>
              Scene Codes — 75 per character + SVG 4
            </span>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
              {SCENE_CATEGORIES.map((sc) => (
                <div key={sc.range} style={{
                  padding: "8px 12px",
                  background: C.bgDeep, border: `1px solid ${C.border05}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--f-body)", fontSize: 12, fontWeight: 500, color: C.white }}>{sc.label}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: sc.accent }}>{sc.range}</span>
                  </div>
                  <div style={{ fontFamily: "var(--f-display-en)", fontSize: 9, color: C.text25, marginTop: 2 }}>
                    {sc.en} · {sc.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
