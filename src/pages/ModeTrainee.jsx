import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const branches = [
  { emoji: "💎", name: "PRISM Studio", en: "Hype Road", desc: "개성 폭발형. 트렌드 최전선, 자율 강도 높음.", accent: "oklch(0.72 0.12 55)" },
  { emoji: "🌙", name: "Blue Moon", en: "Middle Ring", desc: "체계적·정통파. 마망 에르피와 까칠한 에리카의 코칭.", accent: "oklch(0.65 0.10 240)" },
  { emoji: "🔻", name: "APEX Entertainment", en: "The Core", desc: "도태 룰 + 나하린 흥미 시스템(0~100%). 정점 또는 도태.", accent: "oklch(0.76 0.12 80)" },
  { emoji: "🌱", name: "Route 0", en: "Terrace", desc: "신생 에이전시. 강하람·시아·노아 동기. 무한 가능성.", accent: "oklch(0.65 0.10 140)" },
];

const entry = [
  { label: "신인", desc: "맨바닥부터 시작. 기본기 다지기 단계 → 첫 평가 → 동기 형성." },
  { label: "경력직", desc: "타 기획사 출신 / 자체 단련 출신. 시작 등급 + 평가에 즉시 반영." },
];

const subEvents = [
  { name: "공개 평가", desc: "월간 공개 무대 — 등급 변동 + 외부 인사 노출" },
  { name: "멘토링", desc: "선배 캐릭터의 시그니처 코칭 (에리카·이서하·서윤·한소리 등)" },
  { name: "퇴소", desc: "도태 또는 자진 퇴소 분기. 퇴소 후의 길도 존재." },
  { name: "부상", desc: "연습 중 부상. 회복 / 무리 / 포지션 변경 선택." },
  { name: "그룹 매칭", desc: "그룹 데뷔 후보. 멤버 간 케미·갈등·리더 결정." },
  { name: "데뷔", desc: "데뷔 게이지 충족 시 본격 데뷔 시퀀스. 솔로/그룹 분기." },
];

const loop = [
  { title: "일과", en: "Daily Routine", desc: "보컬 레슨 / 댄스 레슨 / 작곡 연습 / 체력 훈련" },
  { title: "평가", en: "Evaluation", desc: "주간 평가 → 등급 변동 (D~S)" },
  { title: "이벤트", en: "Events", desc: "공개평가 · 멘토링 · 그룹매칭 · 부상 · 퇴소" },
  { title: "관계", en: "Relationships", desc: "분기별 동기 연습생 + 분기 고유 코칭 캐릭터" },
  { title: "목표", en: "Goal", desc: "데뷔 요건 충족 → 데뷔 (솔로/그룹)" },
];

const connections = [
  { name: "강하람", role: "Route 0 동기", desc: "Route 0 분기 시 가장 가까운 동기. 함께 연습하고 함께 고민한다.", accent: "oklch(0.65 0.12 20)" },
  { name: "에리카", role: "Blue Moon 코칭", desc: "Blue Moon 분기 시 까칠한 독설로 실력을 끌어올린다.", accent: "oklch(0.72 0.10 170)" },
  { name: "진시혁", role: "APEX 도태 결정자", desc: "APEX 분기 시 매주 도태 룰을 집행. 결과만이 답.", accent: "oklch(0.55 0.01 0)" },
  { name: "한소리", role: "PRISM 대표", desc: "PRISM 분기 시 유저의 개성을 살리는 방향으로 조언.", accent: "oklch(0.72 0.12 55)" },
];

export default function ModeTrainee() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [refBranch, vBranch] = useReveal(0.12);
  const [refEntry, vEntry] = useReveal(0.12);
  const [refLoop, vLoop] = useReveal(0.12);
  const [refSub, vSub] = useReveal(0.12);
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
                4기획사 중 하나에 소속된 연습생으로 일상 훈련, 주간 평가, 데뷔 게이지를 쌓아간다. 신인/경력직 진입 분기 + 분기별 고유 코칭 캐릭터.
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
{`✿ + 분기 이모지(💎🌙🔻🌱)
[기획사]: (4기획사 중 1) — (신인/경력직)
[실력]: 보컬 ■■□□□ | 댄스 ■□□□□ | 작곡 □□□□□ | 체력 ■■■□□
[평가 등급]: D → (주간 평가로 변동)
[데뷔 게이지]: ▓▓░░░░░░░░ 20%`}
              </pre>
            </div>

            {/* Agency Branches */}
            <div ref={refBranch}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Agency Branches · 4기획사 분기
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 14, marginBottom: isMobile ? 36 : 48 }}>
                {branches.map((b, i) => (
                  <div key={b.name} style={{ padding: "16px 18px", background: C.bgCard, border: `1px solid ${C.border06}`, position: "relative", overflow: "hidden", opacity: vBranch ? 1 : 0, transform: vBranch ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${b.accent}, transparent 70%)`, opacity: 0.5 }} />
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>{b.emoji}</span>
                      <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 15, fontWeight: 600, color: C.white }}>{b.name}</span>
                      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: b.accent }}>{b.en}</span>
                    </div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text35, margin: 0, fontWeight: 300, lineHeight: 1.7, wordBreak: "keep-all" }}>{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry Stage */}
            <div ref={refEntry}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Entry Stage · 신인 / 경력직
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 14, marginBottom: isMobile ? 36 : 48 }}>
                {entry.map((e, i) => (
                  <div key={e.label} style={{ padding: "14px 18px", background: C.bgCard, border: `1px solid ${C.border06}`, opacity: vEntry ? 1 : 0, transform: vEntry ? "translateY(0)" : "translateY(16px)", transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 14, fontWeight: 600, color: "oklch(0.65 0.10 140)" }}>{e.label}</span>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text35, margin: "4px 0 0", fontWeight: 300, lineHeight: 1.6, wordBreak: "keep-all" }}>{e.desc}</p>
                  </div>
                ))}
              </div>
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

            {/* Sub Events */}
            <div ref={refSub}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Sub Events · 6종
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 8 : 12, marginBottom: isMobile ? 40 : 56 }}>
                {subEvents.map((s, i) => (
                  <div key={s.name} style={{ padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border06}`, opacity: vSub ? 1 : 0, transform: vSub ? "translateY(0)" : "translateY(16px)", transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s` }}>
                    <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 14, fontWeight: 600, color: C.white }}>{s.name}</span>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text35, margin: "4px 0 0", fontWeight: 300, lineHeight: 1.6, wordBreak: "keep-all" }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Character connections */}
            <div ref={refConn}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Key Connections · 분기별 핵심
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
