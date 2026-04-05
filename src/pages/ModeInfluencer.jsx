import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const loop = [
  { title: "콘텐츠 기획", en: "Plan", desc: "주제/형식/타겟 결정 (브이로그/리뷰/챌린지/라이브 등)" },
  { title: "제작 & 업로드", en: "Create", desc: "AI가 콘텐츠 결과 묘사 (조회수/댓글/바이럴 여부)" },
  { title: "팔로워 관리", en: "Community", desc: "팬 소통, 악플 대응, 커뮤니티 반응" },
  { title: "브랜드 딜", en: "Brand", desc: "광고 제안 수락/거절, 이미지 유지 vs 수익" },
  { title: "성장", en: "Growth", desc: "팔로워 증가 → 방송 출연, 기획사 접촉, 콜라보 기회" },
];

const events = [
  { name: "바이럴", desc: "트렌드 챌린지, 밈 라이딩, 깜짝 라이브" },
  { name: "콜라보", desc: "미모리/다른 인플루언서 합동, 아이돌 게스트" },
  { name: "위기", desc: "악성 팬, 표절 의혹, 개인정보 유출, 광고 논란" },
  { name: "성장 기회", desc: "방송 출연 제안, 기획사 접촉, 해외 팬덤 형성" },
  { name: "딜레마", desc: "팔로워가 원하는 콘텐츠 vs 유저가 만들고 싶은 콘텐츠" },
];

const connections = [
  { name: "미모리", role: "핵심 관계 · 인플루언서 선배", desc: "'같이 하면 대박인데~! 해봐해봐~! ✨' 콜라보 파트너이자 라이벌.", accent: "oklch(0.72 0.10 220)" },
  { name: "한소리", role: "기획사 접촉", desc: "하입 로드에 위치한 PRISM. 인플루언서 유저를 에이전시 소속으로 영입 시도.", accent: "oklch(0.72 0.12 55)" },
  { name: "엘라", role: "비주얼 크로스오버", desc: "패션/뷰티 콘텐츠 콜라보 가능.", accent: "oklch(0.65 0.12 15)" },
  { name: "나하린", role: "레이더", desc: "충분히 성장하면 나하린의 레이더에 포착. 'SNS에서 요즘 뜨는 애가 있다며~?'", accent: "oklch(0.72 0.10 310)" },
];

export default function ModeInfluencer() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [refLoop, vLoop] = useReveal(0.12);
  const [refEvent, vEvent] = useReveal(0.12);
  const [refConn, vConn] = useReveal(0.12);

  return (
    <PageLayout>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Seo title="인플루언서 모드" description="프라임시티 인플루언서 모드 — 팔로워가 곧 무대. 콘텐츠 기획부터 브랜드 딜까지." path="/modes/influencer" />
            <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} style={{ background: "none", border: "none", padding: 0, color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "var(--f-body)" }}>
              &larr; PRIME CITY
            </button>

            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>◐</span>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "oklch(0.72 0.10 220)", display: "block", marginTop: 12, marginBottom: 8 }}>
                Influencer
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
                팔로워가 곧 무대다.
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 15, lineHeight: 1.9, color: C.text45, fontWeight: 300, maxWidth: 520, marginLeft: "auto", marginRight: "auto", wordBreak: "keep-all" }}>
                하입 로드 기반 인플루언서/크리에이터로 콘텐츠 기획, 바이럴, 브랜드 딜을 관리한다. 유저의 창의적 인풋이 가장 중요한 모드.
              </p>
              <div style={{ display: "inline-block", marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "oklch(0.72 0.10 220)", padding: "4px 14px", border: `1px solid oklch(0.72 0.10 220 / 0.3)`, background: "oklch(0.72 0.10 220 / 0.08)" }}>
                !인플루언서모드
              </div>
              <div style={{ width: 56, height: 1, margin: isMobile ? "24px auto 36px" : "32px auto 56px", background: `linear-gradient(90deg, transparent, oklch(0.72 0.10 220), transparent)` }} />
            </div>

            {/* Status */}
            <div style={{ padding: isMobile ? "20px 16px" : "24px 24px", background: C.bgCard, border: `1px solid ${C.border06}`, marginBottom: isMobile ? 36 : 48 }}>
              <div style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Expansion Zone Preview</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: C.text45, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`◐
[팔로워]: n (콘텐츠 퍼포먼스에 따라 변동)
[트렌드]: (1~2개 현재 유행 키워드 — 사용 시 조회수 부스트)
[브랜드 호감도]: ★n (일관된 이미지로 상승, 논란 시 하락)`}
              </pre>
            </div>

            {/* Loop */}
            <div ref={refLoop}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Content Loop
              </div>
              <div style={{ marginBottom: isMobile ? 40 : 56 }}>
                {loop.map((l, i) => (
                  <div key={l.en} style={{ display: "flex", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 20 : 24, opacity: vLoop ? 1 : 0, transform: vLoop ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <div style={{ flexShrink: 0, width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid oklch(0.72 0.10 220 / 0.3)`, fontFamily: "var(--f-display-en)", fontSize: 11, fontWeight: 600, color: "oklch(0.72 0.10 220)" }}>
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

            {/* Events */}
            <div ref={refEvent}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Events
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 8 : 12, marginBottom: isMobile ? 40 : 56 }}>
                {events.map((ev, i) => (
                  <div key={ev.name} style={{ padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border06}`, opacity: vEvent ? 1 : 0, transform: vEvent ? "translateY(0)" : "translateY(16px)", transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s` }}>
                    <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 14, fontWeight: 600, color: C.white }}>{ev.name}</span>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text35, margin: "4px 0 0", fontWeight: 300, lineHeight: 1.6, wordBreak: "keep-all" }}>{ev.desc}</p>
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
