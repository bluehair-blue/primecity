/* ══════════════════════════════════════════════════════════
   CharSign — 캐릭터 사인(서명) 이미지 공용 컴포넌트
   ──────────────────────────────────────────────────────────
   역할: 캐릭터의 손글씨 사인 이미지를 gold 라벨 + 캐릭터색
   글로우와 함께 표시한다.

   왜 별도 컴포넌트인가?
   - DefaultCharDetail, JgrCharDetail, CinematicCharDetail
     3곳에서 동일한 Sign 섹션이 복붙되어 있었다.
   - 단일 소스로 통합하여, Sign 스타일 변경 시 한 곳만 수정.

   사용처 (3곳):
   - DefaultCharDetail.jsx    — Expressions 아래, Navigation 위
   - JgrCharDetail.jsx        — bgDeep 커버 섹션 내부
   - CinematicCharDetail.jsx  — Lower sections 내부

   char.sign이 null이면 아무것도 렌더하지 않는다 (early return).
   sign 이미지는 CDN에서 제공: cdnUrl("{CHAR}/sign.webp")
   → src/data/characters.js에서 각 캐릭터에 등록.
   ═════��════════════════════════════════════════════════════ */
import C from "../styles/tokens";

export default function CharSign({ char, isMobile }) {
  if (!char.sign) return null;
  return (
    <section style={{
      padding: isMobile ? "32px 24px 48px" : "48px 64px",
      maxWidth: 1100, margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* gold 라벨 — 프로젝트 디자인 시스템의 goldText 토큰 사용 */}
      <p style={{
        fontFamily: "var(--f-display-en)", fontSize: 10,
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: C.goldText, margin: "0 0 20px",
      }}>Sign</p>
      {/* 사인 이미지 — drop-shadow에 캐릭터 고유색(char.color) 글로우 적용 */}
      <img
        src={char.sign}
        alt={`${char.name} signature`}
        style={{
          maxWidth: isMobile ? 220 : 300, height: "auto",
          opacity: 0.9,
          filter: `drop-shadow(0 2px 18px ${char.color}77)`,
        }}
      />
    </section>
  );
}
