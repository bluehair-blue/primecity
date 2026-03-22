import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

function SvgShowcase({ isMobile }) {
  const [ref, v] = useReveal(0.12);

  const items = [
    {
      title: "동심원 구조",
      en: "Concentric Structure",
      desc: "프라임시티는 중심부일수록 자원과 기회가 집중되는 동심원 도시. 더 코어에서 테라스까지, 위치가 곧 위상을 말한다.",
      accent: C.distCore,
    },
    {
      title: "네 개의 기획사",
      en: "Four Agencies",
      desc: "APEX, Blue Moon, PRISM, Route 0 — 각기 다른 철학과 전략으로 프라임시티의 엔터테인먼트를 지배한다.",
      accent: C.distMid,
    },
    {
      title: "오디션 시스템",
      en: "Audition System",
      desc: "4라운드에 걸친 서바이벌. 등급 평가, 프로듀서 픽, 팀 대항전, 최종 선택까지 — 실력과 전략이 교차하는 무대.",
      accent: C.distHype,
    },
    {
      title: "관계의 그물",
      en: "Web of Relations",
      desc: "소속사 간 경쟁, 프로듀서와 연습생의 긴장, 참가자 사이의 유대와 라이벌 — 모든 관계가 결과를 바꾼다.",
      accent: C.distTer,
    },
  ];

  return (
    <div ref={ref} style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 16 : 24,
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.en}
            style={{
              padding: isMobile ? "24px 20px" : "32px 28px",
              background: C.bgCard,
              border: `1px solid ${C.border06}`,
              opacity: v ? 1 : 0,
              transform: v ? "translateY(0)" : "translateY(28px)",
              transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: item.accent,
                display: "block",
                marginBottom: 8,
              }}
            >
              {item.en}
            </span>
            <h3
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: isMobile ? 18 : 20,
                fontWeight: 600,
                color: C.white,
                margin: "0 0 12px",
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 12 : 13,
                lineHeight: 1.8,
                color: C.text35,
                margin: 0,
                fontWeight: 300,
                wordBreak: "keep-all",
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SvgIntro() {
  return (
    <PageLayout>
      {({ isMobile }) => (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Seo title="세계관" description="프라임시티의 구조, 기획사, 오디션 시스템을 한눈에 살펴보는 비주얼 가이드." path="/svg" />
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

          <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? 9 : 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: C.gold,
                display: "block",
                marginBottom: isMobile ? 10 : 16,
              }}
            >
              Visual Guide
            </span>
            <h1
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: isMobile
                  ? "clamp(24px,6vw,32px)"
                  : "clamp(30px,3.5vw,44px)",
                fontWeight: 700,
                color: C.white,
                margin: 0,
              }}
            >
              프라임시티 비주얼 가이드
            </h1>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 13 : 15,
                lineHeight: 1.9,
                color: C.text45,
                fontWeight: 300,
                marginTop: isMobile ? 16 : 24,
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                wordBreak: "keep-all",
              }}
            >
              프라임시티의 구조, 기획사, 오디션 시스템을 한눈에 살펴보세요.
            </p>
            <div
              style={{
                width: 56,
                height: 1,
                margin: isMobile ? "20px auto 36px" : "28px auto 56px",
                background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
              }}
            />
          </div>

          <SvgShowcase isMobile={isMobile} />
        </div>
      )}
    </PageLayout>
  );
}
