import { useParams, Link } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import { characters } from "../data/characters";

export default function CharDetail() {
  const { name } = useParams();
  const isMobile = useIsMobile();
  const char = characters.find((c) => c.id === name);

  if (!char) {
    return (
      <div
        style={{
          background: C.bgDeep,
          color: C.white,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--f-body)",
        }}
      >
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>
          캐릭터를 찾을 수 없습니다.
        </p>
        <Link
          to="/"
          style={{
            color: C.gold,
            textDecoration: "none",
            fontSize: 13,
            letterSpacing: "0.1em",
          }}
        >
          &larr; 메인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.bgDeep,
        color: C.white,
        minHeight: "100vh",
        padding: isMobile ? "80px 24px 48px" : "120px 48px 80px",
        fontFamily: "var(--f-body)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          to="/"
          style={{
            color: C.text35,
            textDecoration: "none",
            fontSize: 12,
            letterSpacing: "0.08em",
            transition: "color 0.3s",
          }}
        >
          &larr; PRIME CITY
        </Link>

        <div
          style={{
            marginTop: isMobile ? 32 : 48,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 28 : 48,
          }}
        >
          {/* Character image placeholder */}
          <div
            style={{
              width: isMobile ? "100%" : 280,
              aspectRatio: "2/3",
              background: C.bgCard,
              border: `1px solid ${C.border06}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: C.text15,
                fontSize: 11,
                letterSpacing: "0.1em",
              }}
            >
              IMAGE
            </span>
          </div>

          {/* Character info */}
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: char.color,
              }}
            >
              {char.agency}
            </span>
            <h1
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: isMobile ? 32 : 42,
                fontWeight: 700,
                color: C.white,
                margin: "8px 0 4px",
              }}
            >
              {char.name}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: C.text45,
                margin: "0 0 20px",
              }}
            >
              {char.role}
              {char.age && ` · ${char.age}`}
            </p>

            <div
              style={{
                width: 40,
                height: 1,
                background: `linear-gradient(90deg, ${char.color}, transparent)`,
                marginBottom: 20,
              }}
            />

            <p
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: 15,
                color: C.gold,
                fontStyle: "italic",
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              &ldquo;{char.tagline}&rdquo;
            </p>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.9,
                color: C.text45,
                fontWeight: 300,
                wordBreak: "keep-all",
                margin: "0 0 20px",
              }}
            >
              {char.description}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "16px 0",
                borderTop: `1px solid ${C.border06}`,
              }}
            >
              {char.signature && (
                <p style={{ fontSize: 12, color: C.text35 }}>
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span>{" "}
                  시그니처: {char.signature}
                </p>
              )}
              {char.personality && (
                <p style={{ fontSize: 12, color: C.text35 }}>
                  <span style={{ color: char.color, opacity: 0.7 }}>●</span>{" "}
                  성격: {char.personality}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
