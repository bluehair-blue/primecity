import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const loop = [
  { title: "일과", en: "Daily Routine", desc: "보컬 레슨 / 댄스 레슨 / 작곡 연습 / 체력 훈련" },
  { title: "평가", en: "Evaluation", desc: "주간 평가 → 등급 변동 (D~S)" },
  { title: "이벤트", en: "Events", desc: "소규모 오디션, 합동 공연, 연습생 대회" },
  { title: "관계", en: "Relationships", desc: "강하람과의 우정/라이벌리, 다른 연습생과의 교류" },
  { title: "목표", en: "Goal", desc: "데뷔 요건 충족 → 데뷔" },
];

const connections = [
  { name: "강하람", role: "동기 연습생", desc: "함께 연습하고, 함께 고민한다. 가장 가까운 관계.", accent: "oklch(0.65 0.12 20)" },
  { name: "한소리", role: "기획사 대표", desc: "유저의 성장을 지켜보며 조언을 건넨다.", accent: "oklch(0.72 0.12 55)" },
  { name: "이서하", role: "외부 작곡가", desc: "가끔 방문하는 작곡가. 작곡 연습에 피드백을 줄 수 있다.", accent: "oklch(0.70 0.10 240)" },
  { name: "밀라", role: "Route 0 근처 조우", desc: "자유로운 음악 스타일에서 영감을 받을 수 있다.", accent: "oklch(0.72 0.12 65)" },
];

export default function ModeTrainee() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [refLoop, vLoop] = useReveal(0.12);
  const [refConn, vConn] = useReveal(0.12);

  return (
    <PageLayout>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Seo title="연습생 모드" description="프라임시티 연습생 모드 — Route 0 소속 연습생으로 데뷔를 향한 성장 서사." path="/modes/trainee" />
            <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} style={{ background: "none", border: "none", padding: 0, color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "var(--f-body)" }}>
              &larr; PRIME CITY
            </button>

            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>✿</span>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "oklch(0.65 0.10 140)", display: "block", marginTop: 12, marginBottom: 8 }}>
                Trainee
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
                데뷔라는 이름의 먼 약속.
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 15, lineHeight: 1.9, color: C.text45, fontWeight: 300, maxWidth: 520, marginLeft: "auto", marginRight: "auto", wordBreak: "keep-all" }}>
                Route 0 소속 연습생으로 일상 훈련, 주간 평가, 데뷔 게이지를 쌓아간다. 강하람과 함께 연습실에서 시작하는 성장 서사.
              </p>
              <div style={{ display: "inline-block", marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "oklch(0.65 0.10 140)", padding: "4px 14px", border: `1px solid oklch(0.65 0.10 140 / 0.3)`, background: "oklch(0.65 0.10 140 / 0.08)" }}>
                !연습생모드
              </div>
              <div style={{ width: 56, height: 1, margin: isMobile ? "24px auto 36px" : "32px auto 56px", background: `linear-gradient(90deg, transparent, oklch(0.65 0.10 140), transparent)` }} />
            </div>

            {/* Status bar preview */}
            <div style={{ padding: isMobile ? "20px 16px" : "24px 24px", background: C.bgCard, border: `1px solid ${C.border06}`, marginBottom: isMobile ? 36 : 48 }}>
              <div style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Expansion Zone Preview</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: C.text45, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`✿
[실력]: 보컬 ■■□□□ | 댄스 ■□□□□ | 작곡 □□□□□ | 체력 ■■■□□
[평가 등급]: D → (주간 평가로 변동)
[데뷔 게이지]: ▓▓░░░░░░░░ 20%`}
              </pre>
            </div>

            {/* Gameplay loop */}
            <div ref={refLoop}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Gameplay Loop
              </div>
              <div style={{ marginBottom: isMobile ? 40 : 56 }}>
                {loop.map((l, i) => (
                  <div key={l.en} style={{ display: "flex", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 20 : 24, opacity: vLoop ? 1 : 0, transform: vLoop ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <div style={{ flexShrink: 0, width: isMobile ? 44 : 52, textAlign: "center" }}>
                      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.65 0.10 140)" }}>{l.en}</span>
                    </div>
                    <div style={{ borderLeft: `1px solid oklch(0.65 0.10 140 / 0.2)`, paddingLeft: isMobile ? 14 : 20 }}>
                      <h4 style={{ fontFamily: "var(--f-display-kr)", fontSize: 15, fontWeight: 600, color: C.white, margin: "0 0 4px" }}>{l.title}</h4>
                      <p style={{ fontFamily: "var(--f-body)", fontSize: 12, lineHeight: 1.7, color: C.text35, margin: 0, fontWeight: 300, wordBreak: "keep-all" }}>{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Character connections */}
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
