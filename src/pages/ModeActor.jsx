import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const branches = [
  { emoji: "🎭", name: "PRISM Studio", en: "Hype Road", desc: "독립영화·인디 드라마·실험작 중심. 작품성 우선.", accent: "oklch(0.72 0.12 55)" },
  { emoji: "🎬", name: "Blue Moon", en: "Middle Ring", desc: "정통 상업 드라마·메인 스트림. 안정적 캐스팅 풀.", accent: "oklch(0.65 0.10 240)" },
  { emoji: "🎞️", name: "APEX Entertainment", en: "The Core", desc: "대형 영화·해외 진출작. 나하린 캐스팅 영향력.", accent: "oklch(0.76 0.12 80)" },
  { emoji: "📜", name: "Route 0", en: "Terrace", desc: "프리랜서·신생 라인. 자유도 높음, 자기 마케팅 필수.", accent: "oklch(0.65 0.10 140)" },
];

const loop = [
  { title: "오디션", en: "Audition", desc: "공고 확인 → 역할 선택 → 오디션 장면 연기 → 캐스팅 결과" },
  { title: "촬영", en: "Filming", desc: "현장 분위기, 감독/상대 배우 케미, 즉흥 디렉션 대응" },
  { title: "방영/개봉", en: "Premiere", desc: "시청률/흥행 결과, 평론, 대중 반응 — 인지도 변동" },
  { title: "홍보", en: "Promotion", desc: "예능 출연, 인터뷰, SNS 라이브 — 캐릭터 본질 노출 vs 톤 관리" },
  { title: "스캔들", en: "Scandal", desc: "루머·열애설·과거 발언 발굴. 위기 대응이 커리어를 가른다." },
];

const connections = [
  { name: "서윤", role: "연기 선배 (APEX)", desc: "같은 작품에 캐스팅될 수 있다. '...대사를 외우지 마. 느껴.'", accent: "oklch(0.76 0.12 80)" },
  { name: "엘라", role: "모델→배우 전환", desc: "같은 오디션에서 경쟁할 수 있다. 패션/뷰티 크로스오버.", accent: "oklch(0.65 0.12 15)" },
  { name: "나하린", role: "APEX 캐스팅 영향력", desc: "APEX 분기 시 대형 제작 캐스팅에 직접 영향.", accent: "oklch(0.72 0.10 310)" },
  { name: "한소리", role: "PRISM 대표", desc: "PRISM 분기 시 작가주의 작품 매칭 + 캐릭터 분석.", accent: "oklch(0.72 0.12 55)" },
];

export default function ModeActor() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [refBranch, vBranch] = useReveal(0.12);
  const [refLoop, vLoop] = useReveal(0.12);
  const [refConn, vConn] = useReveal(0.12);

  return (
    <PageLayout>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Seo title="배우 모드" description="프라임시티 배우 모드 — 카메라가 돌아간다. 캐스팅, 촬영, 방영의 커리어를 쌓아가세요." path="/modes/actor" />
            <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} style={{ background: "none", border: "none", padding: 0, color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "var(--f-body)" }}>
              &larr; PRIME CITY
            </button>

            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>▷</span>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "oklch(0.65 0.12 340)", display: "block", marginTop: 12, marginBottom: 8 }}>
                Actor
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
                카메라가 돌아간다. 증명할 시간.
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 13 : 15, lineHeight: 1.9, color: C.text45, fontWeight: 300, maxWidth: 520, marginLeft: "auto", marginRight: "auto", wordBreak: "keep-all" }}>
                4기획사 분기 × 5페이즈(오디션·촬영·방영·홍보·스캔들). 분기에 따라 작품성/상업성/규모/자유도가 달라진다.
              </p>
              <div style={{ display: "inline-block", marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "oklch(0.65 0.12 340)", padding: "4px 14px", border: `1px solid oklch(0.65 0.12 340 / 0.3)`, background: "oklch(0.65 0.12 340 / 0.08)" }}>
                !배우모드
              </div>
              <div style={{ width: 56, height: 1, margin: isMobile ? "24px auto 36px" : "32px auto 56px", background: `linear-gradient(90deg, transparent, oklch(0.65 0.12 340), transparent)` }} />
            </div>

            {/* Status */}
            <div style={{ padding: isMobile ? "20px 16px" : "24px 24px", background: C.bgCard, border: `1px solid ${C.border06}`, marginBottom: isMobile ? 36 : 48 }}>
              <div style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Expansion Zone Preview</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: C.text45, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`▷ + 분기 이모지(🎭🎬🎞️📜)
[기획사]: (4기획사 중 1)
[현재 작품]: (제목) — (역할) — (상태: 오디션/촬영중/후반작업/방영/홍보)
[연기력]: ■■□□□ (오디션/촬영 결과로 변동)
[인지도]: ★n (방영 성적/화제성에 따라 변동)`}
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

            {/* Loop */}
            <div ref={refLoop}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 28, fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25 }}>
                Career Phase · 5단계
              </div>
              <div style={{ marginBottom: isMobile ? 40 : 56 }}>
                {loop.map((l, i) => (
                  <div key={l.en} style={{ display: "flex", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 20 : 24, opacity: vLoop ? 1 : 0, transform: vLoop ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s` }}>
                    <div style={{ flexShrink: 0, width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid oklch(0.65 0.12 340 / 0.3)`, fontFamily: "var(--f-display-en)", fontSize: 11, fontWeight: 600, color: "oklch(0.65 0.12 340)" }}>
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
