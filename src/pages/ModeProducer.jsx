import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const aspects = [
  {
    title: "스케줄 관리",
    en: "Schedule",
    desc: "연습, 녹음, 방송 출연, 휴식 — 아이돌의 일정을 직접 배분하고 컨디션을 관리하세요.",
  },
  {
    title: "곡 선택 & 프로듀싱",
    en: "Music",
    desc: "콘셉트에 맞는 곡을 선택하고, 편곡 방향을 결정하세요. 선택이 무대의 완성도를 좌우합니다.",
  },
  {
    title: "이미지 메이킹",
    en: "Image",
    desc: "비주얼 콘셉트, 의상, 무대 연출 — 아이돌의 공적 이미지를 전략적으로 구축하세요.",
  },
  {
    title: "위기 관리",
    en: "Crisis",
    desc: "스캔들, 부상, 팀 갈등 — 예상치 못한 상황에 대처하는 것도 프로듀서의 역할입니다.",
  },
  {
    title: "팬덤 육성",
    en: "Fandom",
    desc: "SNS 전략, 팬미팅, 콘텐츠 기획으로 팬덤을 키우고 대중적 인지도를 확보하세요.",
  },
  {
    title: "기획사 운영",
    en: "Agency",
    desc: "예산, 인프라, 소속 아티스트 관리까지 — 기획사 대표로서의 경영 감각이 필요합니다.",
  },
];

export default function ModeProducer() {
  const isMobile = useIsMobile();
  const [ref, v] = useReveal(0.12);

  return (
    <PageLayout>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Seo title="프로듀서 모드" description="프라임시티 프로듀서 모드 — 아이돌 육성과 기획사 운영을 경험하는 모드." path="/modes/producer" />
            <Link
              to="/"
              style={{
                color: C.text35,
                textDecoration: "none",
                fontSize: 12,
                letterSpacing: "0.08em",
              }}
            >
              &larr; PRIME CITY
            </Link>

            <div
              style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}
            >
              <span
                style={{ fontSize: isMobile ? 36 : 48, display: "block" }}
              >
                🎬
              </span>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: isMobile ? 10 : 12,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "oklch(0.72 0.10 310)",
                  display: "block",
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                Producer
              </span>
              <h1
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile
                    ? "clamp(24px,6vw,32px)"
                    : "clamp(30px,3.5vw,44px)",
                  fontWeight: 700,
                  color: C.white,
                  margin: "0 0 12px",
                }}
              >
                재능을 발굴하고, 스타를 만들어라.
              </h1>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: isMobile ? 13 : 15,
                  lineHeight: 1.9,
                  color: C.text45,
                  fontWeight: 300,
                  maxWidth: 520,
                  marginLeft: "auto",
                  marginRight: "auto",
                  wordBreak: "keep-all",
                }}
              >
                직접 프로듀서가 되어 아이돌을 육성하고 전략적으로 성장시키는
                모드. 기획사 운영의 모든 것을 경험하세요.
              </p>
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: isMobile ? "24px auto 36px" : "32px auto 56px",
                  background: `linear-gradient(90deg, transparent, oklch(0.72 0.10 310), transparent)`,
                }}
              />
            </div>

            <div
              ref={ref}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: isMobile ? 12 : 16,
              }}
            >
              {aspects.map((a, i) => (
                <div
                  key={a.en}
                  style={{
                    padding: isMobile ? "24px 20px" : "28px 24px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    opacity: v ? 1 : 0,
                    transform: v ? "translateY(0)" : "translateY(24px)",
                    transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 9,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "oklch(0.72 0.10 310)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {a.en}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--f-display-kr)",
                      fontSize: isMobile ? 16 : 18,
                      fontWeight: 600,
                      color: C.white,
                      margin: "0 0 8px",
                    }}
                  >
                    {a.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: isMobile ? 11 : 12,
                      lineHeight: 1.8,
                      color: C.text35,
                      margin: 0,
                      fontWeight: 300,
                      wordBreak: "keep-all",
                    }}
                  >
                    {a.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
    </PageLayout>
  );
}
