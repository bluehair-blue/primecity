import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";

const features = [
  {
    title: "도시 탐색",
    en: "Explore",
    desc: "프라임시티의 4구역을 자유롭게 돌아다니며 숨겨진 장소와 이벤트를 발견하세요.",
    accent: C.distTer,
  },
  {
    title: "캐릭터 교류",
    en: "Interact",
    desc: "오디션 밖에서 캐릭터들과 일상적인 대화, 식사, 산책 — 새로운 면모를 발견할 수 있습니다.",
    accent: C.distMid,
  },
  {
    title: "사이드 스토리",
    en: "Side Story",
    desc: "메인 스토리에서는 볼 수 없었던 캐릭터들의 과거, 비밀, 숨겨진 관계를 파헤치세요.",
    accent: C.distHype,
  },
  {
    title: "자유 활동",
    en: "Free Action",
    desc: "연습, 작곡, 버스킹, SNS 활동 — 오디션 없이도 프라임시티에서의 삶을 만들어갈 수 있습니다.",
    accent: C.distCore,
  },
];

export default function ModeFreeplay() {
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

            <div
              style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}
            >
              <span
                style={{ fontSize: isMobile ? 36 : 48, display: "block" }}
              >
                🌆
              </span>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: isMobile ? 10 : 12,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "oklch(0.65 0.10 240)",
                  display: "block",
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                Free Play
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
                무대 밖에도 이야기는 계속된다.
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
                오디션 밖에서 프라임시티를 자유롭게 탐색하는 모드. 캐릭터들과의
                일상적인 교류, 숨겨진 장소 발견, 사이드 스토리를 즐길 수
                있습니다.
              </p>
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: isMobile ? "24px auto 36px" : "32px auto 56px",
                  background: `linear-gradient(90deg, transparent, oklch(0.65 0.10 240), transparent)`,
                }}
              />
            </div>

            <div
              ref={ref}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? 12 : 20,
              }}
            >
              {features.map((f, i) => (
                <div
                  key={f.en}
                  style={{
                    padding: isMobile ? "24px 20px" : "32px 28px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    position: "relative",
                    overflow: "hidden",
                    opacity: v ? 1 : 0,
                    transform: v ? "translateY(0)" : "translateY(24px)",
                    transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, ${f.accent}, transparent 70%)`,
                      opacity: 0.5,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: f.accent,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {f.en}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--f-display-kr)",
                      fontSize: isMobile ? 18 : 20,
                      fontWeight: 600,
                      color: C.white,
                      margin: "0 0 10px",
                    }}
                  >
                    {f.title}
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
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </PageLayout>
  );
}
