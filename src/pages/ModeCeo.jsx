import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";
import { careerModes } from "../data/gamemodes";

const ceoMode = careerModes.find((mode) => mode.id === "ceo");

const pillars = [
  {
    en: "Roster",
    title: "소속 아티스트 운영",
    desc: "강하람, 시아, 노아의 일정과 성장 방향을 조율하며 Route 0의 첫 라인업을 구축한다.",
  },
  {
    en: "Business",
    title: "계약과 평판 관리",
    desc: "캐스팅, 협상, 위기 대응을 통해 자금과 평판을 동시에 관리하는 경영형 루프.",
  },
  {
    en: "Expansion",
    title: "테라스에서 더 코어까지",
    desc: "작은 사무실에서 출발해 프라임시티의 중심부로 영향력을 확장한다.",
  },
];

export default function ModeCeo() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [ref, visible] = useReveal(0.12);
  const accent = ceoMode?.accent || "oklch(0.65 0.10 140)";

  return (
    <PageLayout>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Seo
          title="CEO 모드"
          description="프라임시티 CEO 모드 - Route 0의 신임 대표로 소속 아티스트와 회사를 운영하는 경영형 모드."
          path="/modes/ceo"
        />
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: C.text35,
            textDecoration: "none",
            fontSize: 12,
            letterSpacing: "0.08em",
            cursor: "pointer",
            fontFamily: "var(--f-body)",
          }}
        >
          &larr; PRIME CITY
        </button>

        <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
          <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>
            {ceoMode?.icon || "🏢"}
          </span>
          <span
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? 10 : 12,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: accent,
              display: "block",
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            CEO
          </span>
          <h1
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)",
              fontWeight: 700,
              color: C.white,
              margin: "0 0 12px",
            }}
          >
            {ceoMode?.tagline || "남을 위해 깎는 길이 결국 자신의 길이 된다."}
          </h1>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: isMobile ? 13 : 15,
              lineHeight: 1.9,
              color: C.text45,
              fontWeight: 300,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
              wordBreak: "keep-all",
            }}
          >
            {ceoMode?.desc}
          </p>
          <div
            style={{
              display: "inline-block",
              marginTop: 16,
              fontFamily: "monospace",
              fontSize: 12,
              color: accent,
              padding: "4px 14px",
              border: `1px solid oklch(0.65 0.10 140 / 0.3)`,
              background: "oklch(0.65 0.10 140 / 0.08)",
            }}
          >
            {ceoMode?.trigger || "!CEO모드"}
          </div>
          <div
            style={{
              width: 56,
              height: 1,
              margin: isMobile ? "24px auto 36px" : "32px auto 56px",
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />
        </div>

        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? 12 : 16,
          }}
        >
          {pillars.map((item, i) => (
            <div
              key={item.en}
              style={{
                padding: isMobile ? "22px 18px" : "26px 22px",
                background: C.bgCard,
                border: `1px solid ${C.border06}`,
                position: "relative",
                overflow: "hidden",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${accent}, transparent 70%)`,
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 9,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: accent,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                {item.en}
              </span>
              <h3
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile ? 17 : 19,
                  fontWeight: 600,
                  color: C.white,
                  margin: "0 0 10px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: 12,
                  lineHeight: 1.75,
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
    </PageLayout>
  );
}
