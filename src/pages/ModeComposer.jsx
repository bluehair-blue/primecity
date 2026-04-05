import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const loop = [
  { title: "곡 작업", en: "Compose", desc: "유저가 장르/분위기/가사 방향을 결정 → AI가 결과물 묘사" },
  { title: "아티스트 매칭", en: "Match", desc: "곡을 부를 아티스트를 찾고 설득" },
  { title: "녹음/프로듀싱", en: "Record", desc: "아티스트와 스튜디오에서 공동 작업" },
  { title: "발매", en: "Release", desc: "차트 반응, 대중 평가, 업계 반응" },
  { title: "평판 축적", en: "Reputation", desc: "실력이 쌓이면 → 대형 의뢰 / 본인 명의 발매?" },
];

const connections = [
  { name: "이서하", role: "핵심 관계", desc: "같은 건물에서 작업. 유저의 곡을 듣고 피드백 → '...그 멜로디, 나쁘진 않네.' 미발표곡 아크와 연결.", accent: "oklch(0.70 0.10 240)" },
  { name: "에리카", role: "Blue Moon 프로듀서", desc: "유저의 곡 채택 여부를 결정. 까칠하지만 좋은 곡엔 반응.", accent: "oklch(0.72 0.10 170)" },
  { name: "나하린", role: "최상위 프로듀서", desc: "'음~ 이 곡 재밌는데? 누가 썼어?'", accent: "oklch(0.72 0.10 310)" },
  { name: "서윤", role: "정점의 가능성", desc: "유저의 곡이 서윤에게 닿을 가능성. 서윤이 유저의 곡을 부르는 순간 = 카타르시스.", accent: "oklch(0.76 0.12 80)" },
];

export default function ModeComposer() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [refLoop, vLoop] = useReveal(0.12);
  const [refConn, vConn] = useReveal(0.12);

  return (
    <PageLayout>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Seo title="작곡가 모드" description="프라임시티 작곡가 모드 — 멜로디 하나로 세계를 뒤흔들어라. 작곡 → 매칭 → 발매 → 차트." path="/modes/composer" />
            <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} style={{ background: "none", border: "none", padding: 0, color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "var(--f-body)" }}>
              &larr; PRIME CITY
            </button>

            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>∂</span>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "oklch(0.65 0.10 240)", display: "block", marginTop: 12, marginBottom: 8 }}>
                Composer
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
                멜로디 하나로 세계를 뒤흔들어라.
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 15, lineHeight: 1.9, color: C.text45, fontWeight: 300, maxWidth: 520, marginLeft: "auto", marginRight: "auto", wordBreak: "keep-all" }}>
                Blue Moon 소속 또는 프리랜서 작곡가로 곡 작업, 아티스트 매칭, 발매, 차트 퍼포먼스의 루프를 반복한다.
              </p>
              <div style={{ display: "inline-block", marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "oklch(0.65 0.10 240)", padding: "4px 14px", border: `1px solid oklch(0.65 0.10 240 / 0.3)`, background: "oklch(0.65 0.10 240 / 0.08)" }}>
                !작곡가모드
              </div>
              <div style={{ width: 56, height: 1, margin: isMobile ? "24px auto 36px" : "32px auto 56px", background: `linear-gradient(90deg, transparent, oklch(0.65 0.10 240), transparent)` }} />
            </div>

            {/* Status bar */}
            <div style={{ padding: isMobile ? "20px 16px" : "24px 24px", background: C.bgCard, border: `1px solid ${C.border06}`, marginBottom: isMobile ? 36 : 48 }}>
              <div style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Expansion Zone Preview</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: C.text45, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`∂
[현재 작업]: (곡 제목) — (장르) — (상태: 작곡중/녹음중/믹싱/완성)
[평판]: ★n (차트 결과/아티스트 만족도에 따라 변동)
[미발표곡]: n tracks (유저의 하드드라이브)`}
              </pre>
            </div>

            {/* Loop */}
            <div ref={refLoop}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Creative Loop
              </div>
              <div style={{ marginBottom: isMobile ? 40 : 56 }}>
                {loop.map((l, i) => (
                  <div key={l.en} style={{ display: "flex", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 20 : 24, opacity: vLoop ? 1 : 0, transform: vLoop ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <div style={{ flexShrink: 0, width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid oklch(0.65 0.10 240 / 0.3)`, fontFamily: "var(--f-display-en)", fontSize: 11, fontWeight: 600, color: "oklch(0.65 0.10 240)" }}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "var(--f-display-kr)", fontSize: 15, fontWeight: 600, color: C.white, margin: "0 0 4px" }}>{l.title}</h4>
                      <p style={{ fontFamily: "var(--f-body)", fontSize: 12, lineHeight: 1.7, color: C.text35, margin: 0, fontWeight: 300, wordBreak: "keep-all" }}>{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div ref={refConn}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Key Connections
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 8 : 12 }}>
                {connections.map((c, i) => (
                  <div key={c.name} style={{ padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border06}`, position: "relative", overflow: "hidden", opacity: vConn ? 1 : 0, transform: vConn ? "translateY(0)" : "translateY(16px)", transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s` }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.accent}, transparent 60%)`, opacity: 0.4 }} />
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 14, fontWeight: 600, color: C.white }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: c.accent }}>{c.role}</span>
                    </div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text35, margin: 0, fontWeight: 300, lineHeight: 1.6, wordBreak: "keep-all" }}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </PageLayout>
  );
}
