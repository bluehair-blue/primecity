import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const updates = [
  {
    date: "2026.03.30",
    title: "직업군 모드 & 이미지 시스템",
    items: [
      "직업군 모드 5종 추가 (매니저, 연습생, 작곡가, 배우, 인플루언서)",
      "게임 모드 UI 개편 — 메인 탭 + 직업군 카드 그리드",
      "오디션 페이지 시작 웹툰 섹션 (6파트, 접기/펼치기)",
      "갤러리 이미지 시스템 안내 패널 (CDN 경로 + 상황코드)",
      "태블릿 SVG 확장 — 8모드 그리드 + Image Output System",
      "챗봇 소개 HTML 모드·이미지 규칙 반영",
    ],
  },
  {
    date: "2026.03",
    title: "메인 페이지 완성",
    items: [
      "히어로 슬라이더 (CDN 배경 9장)",
      "캐릭터 캐러셀 15명 구현",
      "인터랙티브 세계관 맵",
      "게임 모드 탭 UI",
      "프리즘 모자이크 네비게이션",
    ],
  },
  {
    date: "2026.02",
    title: "디자인 시스템 구축",
    items: [
      "OKLCH 색상 토큰 정의",
      "폰트 체계 확립 (Noto Serif KR, Crimson Pro, Noto Sans KR)",
      "다크 + 골드 테마 디자인",
      "반응형 기준점 설정 (768px)",
    ],
  },
  {
    date: "2026.01",
    title: "세계관 & 캐릭터 설계",
    items: [
      "프라임시티 4구역 세계관 확정",
      "캐릭터 15명 프로필 완성",
      "4개 기획사 설정",
      "오디션 4라운드 시스템 설계",
    ],
  },
];

function TimelineItem({ update, index, isMobile }) {
  const [ref, v] = useReveal(0.15);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: isMobile ? 16 : 32,
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(28px)",
        transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s`,
      }}
    >
      {/* Timeline line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: 20,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            background: C.gold,
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            width: 1,
            flex: 1,
            background: `linear-gradient(${C.border10}, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isMobile ? 32 : 48, flex: 1 }}>
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: C.gold,
          }}
        >
          {update.date}
        </span>
        <h3
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 18 : 22,
            fontWeight: 600,
            color: C.white,
            margin: "8px 0 16px",
          }}
        >
          {update.title}
        </h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {update.items.map((item, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 12 : 13,
                color: C.text35,
                fontWeight: 300,
                lineHeight: 1.6,
                paddingLeft: 16,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: C.goldText,
                }}
              >
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Updates() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <PageLayout>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Seo title="업데이트" description="프라임시티 업데이트 로그 — 개발 진행 상황과 변경 이력." path="/updates" />
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
              Update Log
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
              업데이트 로그
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

          {updates.map((u, i) => (
            <TimelineItem
              key={u.date}
              update={u}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>
    </PageLayout>
  );
}
