import { useParams, Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import { districts } from "../data/districts";
import { characters } from "../data/characters";

const INDUSTRIAL_INFO = {
  id: "industrial",
  name: "산업단지",
  en: "Industrial Complex",
  tier: "물류와 생산의 심장부",
  agency: "",
  desc: "프라임시티를 지탱하는 물류와 생산의 중심지. 항만 시설과 물류 센터가 밀집한 구역. 화려한 무대 뒤에서 도시를 실질적으로 움직이는 곳.",
  accent: C.distIndustrial,
  characters: [],
};

const ALL_DISTRICTS = [...districts, INDUSTRIAL_INFO];

export default function DistrictDetail() {
  const { id } = useParams();
  const dist = ALL_DISTRICTS.find((d) => d.id === id);

  if (!dist) {
    return (
      <PageLayout>
        {() => (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <p style={{ color: C.text45, fontSize: 16, marginBottom: 24, fontFamily: "var(--f-body)" }}>
              구역을 찾을 수 없습니다.
            </p>
            <Link to="/" style={{ color: C.gold, textDecoration: "none", fontSize: 13 }}>
              &larr; 메인으로 돌아가기
            </Link>
          </div>
        )}
      </PageLayout>
    );
  }

  const accent = dist.accent;
  const relatedChars = dist.characters
    ? characters.filter((c) => dist.characters.includes(c.name))
    : [];

  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.12);

        return (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
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
                  fontSize: isMobile ? 10 : 12,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: accent,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                {dist.en}
              </span>
              <h1
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile
                    ? "clamp(28px,7vw,36px)"
                    : "clamp(34px,4vw,50px)",
                  fontWeight: 700,
                  color: C.white,
                  margin: "0 0 12px",
                }}
              >
                {dist.name}
              </h1>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  background: C.goldDim,
                  border: `1px solid ${C.border10}`,
                  fontFamily: "var(--f-body)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: C.gold,
                }}
              >
                {dist.tier}
              </span>
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: isMobile ? "24px auto 36px" : "32px auto 48px",
                  background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}
              />
            </div>

            <div
              ref={ref}
              style={{
                opacity: v ? 1 : 0,
                transform: v ? "translateY(0)" : "translateY(24px)",
                transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* Description */}
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: isMobile ? 14 : 16,
                  lineHeight: 1.9,
                  color: C.text45,
                  fontWeight: 300,
                  wordBreak: "keep-all",
                  textAlign: "center",
                  margin: "0 0 40px",
                }}
              >
                {dist.desc}
              </p>

              {/* Agency */}
              {dist.agency && (
                <div
                  style={{
                    padding: isMobile ? "20px 16px" : "24px 28px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    borderLeft: `2px solid ${accent}`,
                    marginBottom: 24,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: C.goldText,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Agency
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: isMobile ? 14 : 15,
                      color: C.text70,
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {dist.agency}
                  </p>
                </div>
              )}

              {/* Related characters */}
              {relatedChars.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <h3
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 10,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: C.goldText,
                      marginBottom: isMobile ? 16 : 20,
                    }}
                  >
                    Characters
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: isMobile ? 10 : 16,
                      flexWrap: "wrap",
                    }}
                  >
                    {relatedChars.map((c) => (
                      <Link
                        key={c.id}
                        to={`/characters/${c.id}`}
                        style={{
                          textDecoration: "none",
                          padding: isMobile ? "10px 16px" : "12px 20px",
                          background: C.bgCard,
                          border: `1px solid ${C.border06}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          transition: "border-color 0.3s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = c.color)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = C.border06)
                        }
                      >
                        <span style={{ color: c.color, fontSize: 8 }}>●</span>
                        <span
                          style={{
                            fontFamily: "var(--f-body)",
                            fontSize: 13,
                            color: C.text55,
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--f-body)",
                            fontSize: 11,
                            color: C.text25,
                          }}
                        >
                          {c.role}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Other districts navigation */}
              <div
                style={{
                  marginTop: isMobile ? 40 : 56,
                  paddingTop: 20,
                  borderTop: `1px solid ${C.border06}`,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--f-display-en)",
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: C.goldText,
                    marginBottom: isMobile ? 12 : 16,
                  }}
                >
                  Other Districts
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: isMobile ? 8 : 12,
                    flexWrap: "wrap",
                  }}
                >
                  {ALL_DISTRICTS.filter((d) => d.id !== id).map((d) => (
                    <Link
                      key={d.id}
                      to={`/districts/${d.id}`}
                      style={{
                        textDecoration: "none",
                        padding: isMobile ? "8px 14px" : "10px 18px",
                        background: C.bgCard,
                        border: `1px solid ${C.border06}`,
                        fontFamily: "var(--f-body)",
                        fontSize: 12,
                        color: C.text45,
                        transition: "border-color 0.3s, color 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = d.accent;
                        e.currentTarget.style.color = d.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border06;
                        e.currentTarget.style.color = C.text45;
                      }}
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </PageLayout>
  );
}
