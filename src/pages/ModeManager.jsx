import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const branches = [
  {
    label: "A",
    title: "유저가 매니저",
    en: "User is Manager",
    desc: "소속사가 유저를 아티스트 전담 매니저로 배정. 아티스트와의 첫 만남부터 시작.",
    candidates: "서윤 · 강하람 · 장그루 · 밀라 · 엘라",
    accent: "oklch(0.76 0.12 80)",
  },
  {
    label: "B",
    title: "캐릭터가 매니저",
    en: "Character is Manager",
    desc: "유저가 아티스트, NPC가 매니저로 배정. 매니저의 성격에 따라 서포트 스타일이 달라진다.",
    candidates: "한소리 · 에리카",
    accent: "oklch(0.72 0.12 55)",
  },
];

const loop = [
  { time: "아침", en: "Morning", desc: "스케줄 확인 → 진행 / 변경 / 취소 결정" },
  { time: "낮", en: "Day", desc: "스케줄 수행 (방송, 연습, 촬영, 팬미팅 등)" },
  { time: "저녁", en: "Evening", desc: "결과 반영 (컨디션/평판 변동) + 아티스트와 대화" },
  { time: "밤", en: "Night", desc: "다음 날 스케줄 조정 + 이벤트 트리거" },
];

const events = [
  { name: "방송", desc: "음악 방송, 예능 게스트, 라디오 라이브" },
  { name: "스케줄 충돌", desc: "더블 부킹, 컨디션 vs 기회 딜레마" },
  { name: "스캔들", desc: "루머, SNS 논란, 파파라치" },
  { name: "팬 이벤트", desc: "팬사인회, 온라인 라이브, 깜짝 이벤트" },
  { name: "브랜드", desc: "광고 촬영, 브랜드딜 협상, 이미지 전략" },
  { name: "위기", desc: "건강 문제, 슬럼프, 대인 갈등, 블랙컨슈머" },
];

export default function ModeManager() {
  return (
    <PageLayout>
      {({ isMobile }) => {
        const [refBranch, vBranch] = useReveal(0.12);
        const [refLoop, vLoop] = useReveal(0.12);
        const [refEvent, vEvent] = useReveal(0.12);

        return (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Seo title="매니저 모드" description="프라임시티 매니저 모드 — 아티스트의 전담 매니저가 되어 스케줄, 위기, 관계를 관리합니다." path="/modes/manager" />
            <Link to="/" style={{ color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em" }}>
              &larr; PRIME CITY
            </Link>

            {/* Hero */}
            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>📋</span>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "oklch(0.72 0.12 55)", display: "block", marginTop: 12, marginBottom: 8 }}>
                Manager
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
                스케줄 뒤에서 스타를 만드는 사람.
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 15, lineHeight: 1.9, color: C.text45, fontWeight: 300, maxWidth: 520, marginLeft: "auto", marginRight: "auto", wordBreak: "keep-all" }}>
                아티스트의 전담 매니저가 되어 스케줄 관리, 위기 대응, 관계 관리를 수행한다. 유저의 결정이 아티스트의 커리어를 직접 좌우한다.
              </p>
              <div style={{ display: "inline-block", marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "oklch(0.72 0.12 55)", padding: "4px 14px", border: `1px solid oklch(0.72 0.12 55 / 0.3)`, background: "oklch(0.72 0.12 55 / 0.08)" }}>
                !매니저모드
              </div>
              <div style={{ width: 56, height: 1, margin: isMobile ? "24px auto 36px" : "32px auto 56px", background: `linear-gradient(90deg, transparent, oklch(0.72 0.12 55), transparent)` }} />
            </div>

            {/* Branch selection */}
            <div ref={refBranch}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Branch Selection
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 40 : 56 }}>
                {branches.map((b, i) => (
                  <div key={b.label} style={{ padding: isMobile ? "24px 20px" : "28px 24px", background: C.bgCard, border: `1px solid ${C.border06}`, position: "relative", overflow: "hidden", opacity: vBranch ? 1 : 0, transform: vBranch ? "translateY(0)" : "translateY(24px)", transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s` }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${b.accent}, transparent 70%)`, opacity: 0.5 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 20, fontWeight: 600, color: b.accent }}>{b.label}</span>
                      <div>
                        <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: b.accent, display: "block" }}>{b.en}</span>
                        <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 16, fontWeight: 600, color: C.white }}>{b.title}</span>
                      </div>
                    </div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 12, lineHeight: 1.8, color: C.text35, margin: "0 0 12px", fontWeight: 300, wordBreak: "keep-all" }}>{b.desc}</p>
                    <span style={{ fontSize: 10, padding: "2px 8px", background: C.bgDeep, border: `1px solid ${C.border05}`, color: C.text25, fontFamily: "var(--f-body)" }}>{b.candidates}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily loop */}
            <div ref={refLoop}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Daily Loop
              </div>
              <div style={{ marginBottom: isMobile ? 40 : 56 }}>
                {loop.map((l, i) => (
                  <div key={l.en} style={{ display: "flex", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 20 : 24, opacity: vLoop ? 1 : 0, transform: vLoop ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <div style={{ flexShrink: 0, width: isMobile ? 40 : 48, textAlign: "center" }}>
                      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.72 0.12 55)" }}>{l.en}</span>
                      <div style={{ fontFamily: "var(--f-display-kr)", fontSize: 14, fontWeight: 600, color: C.white, marginTop: 2 }}>{l.time}</div>
                    </div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 12 : 13, lineHeight: 1.8, color: C.text35, margin: 0, fontWeight: 300, wordBreak: "keep-all", borderLeft: `1px solid oklch(0.72 0.12 55 / 0.2)`, paddingLeft: isMobile ? 14 : 20 }}>{l.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            <div ref={refEvent}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Events
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 8 : 12 }}>
                {events.map((ev, i) => (
                  <div key={ev.name} style={{ padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border06}`, opacity: vEvent ? 1 : 0, transform: vEvent ? "translateY(0)" : "translateY(16px)", transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s` }}>
                    <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 14, fontWeight: 600, color: C.white }}>{ev.name}</span>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text35, margin: "4px 0 0", fontWeight: 300, lineHeight: 1.6 }}>{ev.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status bar preview */}
            <div style={{ marginTop: isMobile ? 36 : 48, padding: isMobile ? "20px 16px" : "24px 24px", background: C.bgCard, border: `1px solid ${C.border06}` }}>
              <div style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Expansion Zone Preview</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: C.text45, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`📋
[스케줄]: 오늘 (시간/내용) / 내일 (시간/내용)
[컨디션]: ■■■■□ (5단계)
[평판]: ★n (0~100)`}
              </pre>
            </div>
          </div>
        );
      }}
    </PageLayout>
  );
}
