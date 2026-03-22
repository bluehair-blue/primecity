import { Link } from "react-router-dom";
import C from "../styles/tokens";
import PageLayout from "../components/PageLayout";

export default function NotFound() {
  return (
    <PageLayout>
      {({ isMobile }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            gap: isMobile ? 16 : 24,
          }}
        >
          {/* Glitch 404 */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? "6rem" : "10rem",
                fontWeight: 700,
                lineHeight: 1,
                color: C.gold,
                letterSpacing: "0.05em",
                textShadow: `0 0 40px ${C.goldGlow}, 0 0 80px ${C.goldDim}`,
              }}
            >
              404
            </span>
          </div>

          {/* Label */}
          <span
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? "0.75rem" : "0.85rem",
              fontWeight: 400,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: C.text45,
            }}
          >
            Signal Lost
          </span>

          {/* Message */}
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: isMobile ? "0.95rem" : "1.1rem",
              color: C.text70,
              maxWidth: 420,
              lineHeight: 1.7,
            }}
          >
            요청하신 페이지를 찾을 수 없습니다.
            <br />
            프라임시티의 어느 구역에도 존재하지 않는 경로입니다.
          </p>

          {/* CTA */}
          <Link
            to="/"
            style={{
              marginTop: isMobile ? 8 : 16,
              display: "inline-block",
              padding: isMobile ? "10px 28px" : "12px 36px",
              background: C.goldDim,
              border: `1px solid ${C.border10}`,
              borderRadius: 4,
              color: C.gold,
              fontFamily: "var(--f-body)",
              fontSize: isMobile ? "0.85rem" : "0.95rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "background 0.3s, border-color 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.goldGlow;
              e.currentTarget.style.borderColor = C.goldMuted;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.goldDim;
              e.currentTarget.style.borderColor = C.border10;
            }}
          >
            메인으로 돌아가기
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
