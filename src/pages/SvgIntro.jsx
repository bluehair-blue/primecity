import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import { svgTemplates, TEMPLATE_CATEGORIES } from "../data/svgTemplates";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// NOTE: dangerouslySetInnerHTML is safe here because SVG content is generated
// exclusively by our own generate() functions in svgTemplates.js — no user input
// is ever injected without going through these controlled template functions.

export default function SvgIntro() {
  const [category, setCategory] = useState(TEMPLATE_CATEGORIES.ALL);
  const [selected, setSelected] = useState(null);
  const [modalTab, setModalTab] = useState("params");
  const closedByButton = useRef(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  // ESC key
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // Popstate: back button closes modal instead of navigating away
  useEffect(() => {
    if (!selected) return;
    closedByButton.current = false;
    window.history.pushState({ svgModal: true }, "");
    const onPop = () => {
      if (!closedByButton.current) setSelected(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [selected]);

  function closeModal() {
    closedByButton.current = true;
    setSelected(null);
    window.history.back();
  }

  const filtered = category === TEMPLATE_CATEGORIES.ALL
    ? svgTemplates
    : svgTemplates.filter((t) => t.category === category);

  const tabs = [
    TEMPLATE_CATEGORIES.ALL,
    TEMPLATE_CATEGORIES.SNS,
    TEMPLATE_CATEGORIES.BROADCAST,
    TEMPLATE_CATEGORIES.UTILITY,
  ];

  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.05);

        return (
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Link to="/" style={{ color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em" }}>
              &larr; PRIME CITY
            </Link>

            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10, letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, display: "block", marginBottom: isMobile ? 10 : 16 }}>
                SVG Template Gallery
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(22px,6vw,30px)" : "clamp(28px,3.5vw,40px)", fontWeight: 700, color: C.white, margin: 0 }}>
                동적 SVG 템플릿
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text35, margin: "12px 0 0", lineHeight: 1.6, wordBreak: "keep-all" }}>
                챗봇에서 사용되는 동적 SVG 템플릿 컬렉션. Cloudflare Workers로 배포되며, URL 파라미터로 콘텐츠를 주입합니다.
              </p>
              <div style={{ width: 56, height: 1, margin: isMobile ? "20px auto 28px" : "28px auto 40px", background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: isMobile ? 24 : 36, flexWrap: "wrap" }}>
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setCategory(tab)} style={{ padding: isMobile ? "8px 16px" : "8px 20px", fontFamily: "var(--f-body)", fontSize: 12, color: category === tab ? C.bgDeep : C.text55, background: category === tab ? C.gold : C.bgCard, border: `1px solid ${category === tab ? C.gold : C.border06}`, cursor: "pointer", transition: `all 0.3s ${EASE}`, letterSpacing: "0.05em" }}>
                  {tab}
                </button>
              ))}
            </div>

            <div ref={ref} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 16 : 24, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `all 0.6s ${EASE}` }}>
              {filtered.map((tmpl) => (
                <div key={tmpl.id} onClick={() => { setSelected(tmpl); setModalTab("params"); }} style={{ background: C.bgCard, border: `1px solid ${C.border06}`, overflow: "hidden", cursor: "pointer", transition: `border-color 0.3s ${EASE}, transform 0.3s ${EASE}`, position: "relative" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ padding: 16, background: C.bgDeep, overflow: "hidden", maxHeight: 260 }} dangerouslySetInnerHTML={{ __html: tmpl.generate(tmpl.sampleParams) }} />
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600, color: C.white }}>{tmpl.name}</span>
                      {tmpl.animated && (
                        <span style={{ fontSize: 9, padding: "2px 6px", background: `color-mix(in oklch, ${C.gold} 15%, transparent)`, border: `1px solid ${C.goldText}`, color: C.gold, fontFamily: "var(--f-display-en)", letterSpacing: "0.1em" }}>ANIM</span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", background: C.bgDeep, border: `1px solid ${C.border05}`, color: C.text35, fontFamily: "var(--f-body)" }}>{tmpl.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ══════════ Detail Modal ══════════ */}
            {selected && (
              <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 9999, background: C.bgOverlay, display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "center", padding: isMobile ? "0" : "32px", overflowY: isMobile ? "auto" : "hidden" }}>
                <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 700, maxHeight: isMobile ? "none" : "90vh", overflowY: isMobile ? "visible" : "auto", background: C.bgDeep, border: isMobile ? "none" : `1px solid ${C.border06}`, position: "relative", minHeight: isMobile ? "100vh" : "auto" }}>

                  {/* Close button — below navbar on mobile, top-right on desktop */}
                  <button onClick={(e) => { e.stopPropagation(); closeModal(); }} style={{
                    position: "sticky", top: isMobile ? 64 : 12,
                    float: "right", marginRight: isMobile ? 12 : 12, marginTop: isMobile ? 12 : 12,
                    width: isMobile ? 44 : 32, height: isMobile ? 44 : 32,
                    background: C.bgCard, border: `1px solid ${C.border10}`, borderRadius: "50%",
                    color: C.text55, fontSize: isMobile ? 18 : 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
                  }}>✕</button>

                  <div style={{ padding: isMobile ? 16 : 32, paddingTop: isMobile ? 16 : 32, background: C.bgDeep, clear: "right" }} dangerouslySetInnerHTML={{ __html: selected.generate(selected.sampleParams) }} />

                  <div style={{ padding: isMobile ? "16px 16px 0" : "24px 32px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <h2 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: C.white, margin: 0 }}>{selected.name}</h2>
                      <span style={{ fontSize: 10, padding: "2px 8px", background: C.bgCard, border: `1px solid ${C.border05}`, color: C.text35, fontFamily: "var(--f-body)" }}>{selected.category}</span>
                      {selected.animated && (
                        <span style={{ fontSize: 9, padding: "2px 6px", background: `color-mix(in oklch, ${C.gold} 15%, transparent)`, border: `1px solid ${C.goldText}`, color: C.gold, fontFamily: "var(--f-display-en)" }}>ANIMATED</span>
                      )}
                    </div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text45, lineHeight: 1.6, margin: "0 0 20px", wordBreak: "keep-all" }}>{selected.desc}</p>
                  </div>

                  {/* Tabs */}
                  <div style={{ padding: isMobile ? "0 16px" : "0 32px" }}>
                    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border06}` }}>
                      {[{ key: "params", label: "파라미터" }, { key: "worker", label: "Worker 코드" }, { key: "prompt", label: "프롬프트" }].map((tab) => (
                        <button key={tab.key} onClick={() => setModalTab(tab.key)} style={{ padding: "10px 20px", fontFamily: "var(--f-body)", fontSize: 12, color: modalTab === tab.key ? C.gold : C.text35, background: "transparent", border: "none", borderBottom: modalTab === tab.key ? `2px solid ${C.gold}` : "2px solid transparent", cursor: "pointer", transition: `all 0.3s ${EASE}` }}>{tab.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tab content */}
                  <div style={{ padding: isMobile ? "16px 16px 24px" : "20px 32px 32px" }}>
                    {modalTab === "params" && (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--f-body)", fontSize: 12, minWidth: 400 }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: "left", padding: "8px 12px", color: C.gold, borderBottom: `1px solid ${C.border06}`, fontSize: 10, letterSpacing: "0.1em", fontFamily: "var(--f-display-en)" }}>PARAM</th>
                              <th style={{ textAlign: "left", padding: "8px 12px", color: C.gold, borderBottom: `1px solid ${C.border06}`, fontSize: 10, letterSpacing: "0.1em", fontFamily: "var(--f-display-en)" }}>설명</th>
                              <th style={{ textAlign: "left", padding: "8px 12px", color: C.gold, borderBottom: `1px solid ${C.border06}`, fontSize: 10, letterSpacing: "0.1em", fontFamily: "var(--f-display-en)" }}>EXAMPLE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.params.map((param) => (
                              <tr key={param.name}>
                                <td style={{ padding: "8px 12px", color: C.text55, borderBottom: `1px solid ${C.border05}`, fontFamily: "monospace", fontSize: 11 }}>{param.name}</td>
                                <td style={{ padding: "8px 12px", color: C.text45, borderBottom: `1px solid ${C.border05}` }}>{param.desc}</td>
                                <td style={{ padding: "8px 12px", color: C.text35, borderBottom: `1px solid ${C.border05}`, fontFamily: "monospace", fontSize: 11 }}>{param.example}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {modalTab === "worker" && (
                      <pre style={{ background: C.bgDeep, padding: 16, border: `1px solid ${C.border06}`, overflowX: "auto", fontSize: 11, fontFamily: "monospace", color: C.text55, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{selected.workerCode}</pre>
                    )}
                    {modalTab === "prompt" && (
                      <pre style={{ background: C.bgDeep, padding: 16, border: `1px solid ${C.border06}`, overflowX: "auto", fontSize: 12, fontFamily: "var(--f-body)", color: C.text55, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{selected.promptExample}</pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </PageLayout>
  );
}
