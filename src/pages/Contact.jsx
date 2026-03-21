import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";

const contacts = [
  {
    label: "이메일",
    en: "Email",
    value: "contact@bluehair.blue",
    icon: "✉",
  },
  {
    label: "웹사이트",
    en: "Website",
    value: "bluehair.blue",
    icon: "🌐",
  },
];

export default function Contact() {
  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.15);

        return (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
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
                Contact
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
                문의 창구
              </h1>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: isMobile ? 13 : 15,
                  lineHeight: 1.9,
                  color: C.text45,
                  fontWeight: 300,
                  marginTop: isMobile ? 16 : 24,
                  wordBreak: "keep-all",
                }}
              >
                프라임시티에 대한 문의, 제안, 협업 요청은 아래 채널을 통해
                연락해주세요.
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

            <div
              ref={ref}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 12 : 16,
              }}
            >
              {contacts.map((c, i) => (
                <div
                  key={c.en}
                  style={{
                    padding: isMobile ? "24px 20px" : "32px 28px",
                    background: C.bgCard,
                    border: `1px solid ${C.border06}`,
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? 16 : 24,
                    opacity: v ? 1 : 0,
                    transform: v ? "translateY(0)" : "translateY(20px)",
                    transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
                  }}
                >
                  <span style={{ fontSize: isMobile ? 24 : 32 }}>
                    {c.icon}
                  </span>
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--f-display-en)",
                        fontSize: 9,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: C.goldText,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {c.en}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--f-body)",
                        fontSize: isMobile ? 14 : 16,
                        color: C.text70,
                        fontWeight: 400,
                      }}
                    >
                      {c.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </PageLayout>
  );
}
