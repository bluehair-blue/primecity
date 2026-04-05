import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const works = [
  {
    title: "프라임시티",
    en: "Prime City",
    desc: "전 세계가 주목하는 엔터테인먼트 특별자치구. 연예계 시뮬레이션 챗봇.",
    accent: C.gold,
    status: "진행 중",
  },
];

export default function Works() {
  const isMobile = useIsMobile();
  const [ref, v] = useReveal(0.15);

  return (
    <PageLayout>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <Seo title="작가의 작품" description="프라임시티 작가의 다른 작품 소개." path="/works" />
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
                Other Works
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
                작가의 다른 작품
              </h1>
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: isMobile ? "20px auto 36px" : "28px auto 56px",
                  background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                }}
              />
            </div>

            <div
              ref={ref}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 16 : 20,
              }}
            >
              {works.map((w, i) => (
                <div
                  key={w.en}
                  style={{
                    padding: isMobile ? "28px 20px" : "36px 32px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    position: "relative",
                    overflow: "hidden",
                    opacity: v ? 1 : 0,
                    transform: v ? "translateY(0)" : "translateY(24px)",
                    transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, ${w.accent}, transparent 70%)`,
                      opacity: 0.5,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--f-display-en)",
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: w.accent,
                      }}
                    >
                      {w.en}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--f-body)",
                        fontSize: 10,
                        padding: "2px 10px",
                        background: C.goldDim,
                        border: `1px solid ${C.border10}`,
                        color: C.gold,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {w.status}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--f-display-kr)",
                      fontSize: isMobile ? 22 : 26,
                      fontWeight: 600,
                      color: C.white,
                      margin: "0 0 12px",
                    }}
                  >
                    {w.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: 1.8,
                      color: C.text35,
                      margin: 0,
                      fontWeight: 300,
                      wordBreak: "keep-all",
                    }}
                  >
                    {w.desc}
                  </p>
                </div>
              ))}

              {/* Placeholder for future works */}
              <div
                style={{
                  padding: isMobile ? "28px 20px" : "36px 32px",
                  border: `1px dashed ${C.border10}`,
                  textAlign: "center",
                  opacity: v ? 1 : 0,
                  transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--f-body)",
                    fontSize: 13,
                    color: C.text25,
                    margin: 0,
                  }}
                >
                  더 많은 작품이 준비 중입니다.
                </p>
              </div>
            </div>
          </div>
    </PageLayout>
  );
}
