import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";

const updates = [
  {
    date: "2026.04.14",
    tag: "Content",
    title: "시아 · 노아 추가 · 대표모드 · NSFW 로어북",
    items: [
      "흑백쌍둥이 시아(SIA) · 노아(NOA) — Route 0 소속 17명 체제 확장",
      "이미지 에셋 1,670장+ — 17명 × 102장 (SIA · NOA 204장 신규 생성)",
      "대표모드(!대표모드) 신설 — Route 0 에이전시 경영 시뮬레이션",
      "매니저모드 B분기 강화 — 6캐릭터별 매니저 로어북 분리",
      "전 캐릭터 NSFW 반응 로어북 12종 신규",
      "쌍둥이 전용 로어북 — 질투 · 위기방패 · 하렘 스파크",
      "소꿉친구모드 기폭제/유지제 분리",
    ],
  },
  {
    date: "2026.04.14",
    tag: "Feature",
    title: "일정표 SVG · 디버그 모드 · 모드 개편",
    items: [
      "일정표 SVG 워커 신규 — 범용 스케줄 보드 (8슬롯 + 향후 일정 + 상태), 모든 모드에서 사용",
      "SVG 이미지 엑박 수정 — base64 data URI 인라인 변환 (에덴챗 <img> 컨텍스트 대응)",
      "!디버그 모드 추가 — 캐릭터 연기 중단 + 기술적 수정 즉시 처리 (인젝션 가드 내장)",
      "직업군 모드 5종 규칙/시작 분리 — 토큰 절약 + 트리거 !명령어 병행 지원",
      "메인 프롬프트 상태창에 3줄 일정 요약 (✓완료 → ●현재 → ○다음)",
      "워커 라우트 자동 등록 (deploy.sh --route 플래그)",
    ],
  },
  {
    date: "2026.04.12",
    tag: "Feature",
    title: "시네마틱 디테일 · NSFW 갤러리",
    items: [
      "캐릭터 디테일 시네마틱 인트로 8종 완성 — JSH 컷어웨이 · KHR 카메라 · LSH 글리치 · MIL 물결 · MMR 댓글 스트림 · NHR 전자기 신호 · HSR 바람 · HSE 페이지 넘김",
      "Phase 상태기계 (로딩 → 인트로 → 히어로 → 콘텐츠) + 이미지 프리로드 + reduced-motion 대응",
      "캐릭터별 키비주얼 contain 리빌 · 마우스 틸트 · 반사 · bgMarquee 이펙트",
      "NSFW 갤러리 탭 해금 — 18세 이상 연령 확인 팝업",
    ],
  },
  {
    date: "2026.04.09",
    tag: "Content",
    title: "이미지 에셋 확장 · 프롬프트 대개편",
    items: [
      "이미지 에셋 1,110장 → 1,670장+ — 15명 × 74장 → 17명 × 102장 (v2 확장)",
      "챗봇 프롬프트 Phase 5 전면 개편 — 103개 로어북, POV/3인칭 분리, 상호작용 태그 체계",
      "에덴챗 플랫폼 로어북 102개 자동 삽입 (pyautogui 매크로)",
      "NovelAI v4 검열 파이프라인 — YOLOv11s-seg 자동 검열 252장 처리",
    ],
  },
  {
    date: "2026.03.30",
    tag: "Feature",
    title: "직업군 모드 · 이미지 시스템",
    items: [
      "직업군 모드 5종 추가 — 매니저 · 연습생 · 작곡가 · 배우 · 인플루언서",
      "게임 모드 UI 개편 — 메인 3종 + 직업군 5종 카드 그리드",
      "태블릿 SVG 10섹션 · 13모드 확장 + 에덴챗 소개 HTML 전면 개편",
    ],
  },
  {
    date: "2026.03.19",
    tag: "Launch",
    title: "사이트 런칭 · 메인 페이지",
    items: [
      "히어로 슬라이더 (CDN 배경 9장) + 캐릭터 캐러셀 17명",
      "인터랙티브 세계관 맵 (5구역 SVG 히트박스) + 프리즘 네비게이션",
      "Cloudflare Pages 자동 배포 + R2 CDN + SVG Workers 8종",
    ],
  },
  {
    date: "2026.01 – 02",
    tag: "Design",
    title: "세계관 · 디자인 시스템",
    items: [
      "프라임시티 5구역 세계관 + 캐릭터 17명 · 기획사 4곳 설정",
      "OKLCH 색상 토큰 + Gold & Azure 이원 테마 + 다크 모드",
      "오디션 4라운드 시스템 설계 + 반응형 768px 기준점",
    ],
  },
];

const TAG_COLORS = {
  Feature: "oklch(0.72 0.12 252)",
  Content: "oklch(0.72 0.10 160)",
  Launch:  C.gold,
  Design:  "oklch(0.72 0.10 310)",
};

function TimelineItem({ update, index, isMobile, isLatest }) {
  const [ref, v] = useReveal(0.15);
  const tagColor = TAG_COLORS[update.tag] || C.gold;

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
            width: isLatest ? 10 : 8,
            height: isLatest ? 10 : 8,
            background: tagColor,
            borderRadius: "50%",
            flexShrink: 0,
            boxShadow: isLatest ? `0 0 8px ${tagColor}88, 0 0 16px ${tagColor}44` : "none",
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
          {update.tag && (
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: tagColor,
                background: `color-mix(in oklch, ${tagColor} 12%, transparent)`,
                border: `1px solid color-mix(in oklch, ${tagColor} 25%, transparent)`,
                padding: "2px 8px",
                lineHeight: 1.6,
              }}
            >
              {update.tag}
            </span>
          )}
        </div>
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
              isLatest={i === 0}
            />
          ))}
        </div>
    </PageLayout>
  );
}
