import { useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";
import { cdnUrl } from "../utils/cdn";

const rounds = [
  {
    num: "1R",
    title: "등급 평가",
    en: "Grade Evaluation",
    shared: "8명(참가 모드는 9명)의 개인 무대. 심사위원 3인이 등급 부여. 탈락 없음.",
    producerDesc: "참가자의 무대를 평가하고 등급을 매긴다. 세 심사위원의 기준이 충돌하는 자리.",
    contestantDesc: "첫 무대에 오른다. 프로듀서 3인의 심사 시선을 전부 받아내야 한다.",
    result: "전원 유지",
  },
  {
    num: "2R",
    title: "프로듀서 픽 & 쟁탈전",
    en: "Producer Pick",
    shared: "지명과 쟁탈전. 겹치는 참가자 발생 시 공개 어필·역질문·블라인드 선택까지.",
    producerDesc: "원하는 참가자를 지명한다. 겹치면 쟁탈전 — 말이 곧 무기.",
    contestantDesc: "지명을 받을지, 역으로 프로듀서를 탐색할지. 탈락 가능성이 처음 열리는 라운드.",
    result: "2명 탈락",
  },
  {
    num: "3R",
    title: "팀 대항전",
    en: "Team Battle",
    shared: "3팀 대결로 순위 결정. 1위 팀은 2명 생존 확정. 패자부활 토너먼트로 최종 3명.",
    producerDesc: "팀을 이끌고 무대 전략을 지휘. 곡·포지션·리허설까지 직접 개입.",
    contestantDesc: "팀원과 무대를 완성한다. 패자부활전에서 끝까지 버틴다.",
    result: "파이널 3명 확정",
  },
  {
    num: "4R",
    title: "최종 선택",
    en: "Final Choice",
    shared: "권력 역전. 참가자가 프로듀서를 선택. 과거 발언이 되돌아오고 진심이 드러난다.",
    producerDesc: "그동안의 언행이 심판받는 자리. 참가자의 선택을 받는 쪽.",
    contestantDesc: "운명을 손에 쥔다. 누구와 함께 데뷔할지 결정하는 마지막 순간.",
    result: "결과 확정",
  },
];

const perspectives = [
  {
    key: "producer",
    emoji: "🎤",
    command: "!오디션모드",
    label: "Producer",
    role: "프로듀서 · 심사위원",
    line: "재능을 발굴하고, 무대를 평가하고, 전략을 세운다.",
    accent: "gold",
  },
  {
    key: "contestant",
    emoji: "🎪",
    command: "!오디션참가모드",
    label: "Contestant",
    role: "9번째 참가자",
    line: "8명의 NPC와 함께 무대에 오른다. 탈락이 가능하다.",
    accent: "blue",
  },
];

const WEBTOON_PAGES = [1, 2, 3, 4, 5];

function WebtoonSection({ isMobile }) {
  const [open, setOpen] = useState(false);
  const [refWt, vWt] = useReveal(0.1);

  return (
    <div
      ref={refWt}
      style={{
        marginBottom: isMobile ? 40 : 56,
        opacity: vWt ? 1 : 0,
        transform: vWt ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Section label */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 16 : 24 }}>
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: 9,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: C.goldText,
          }}
        >
          Opening Webtoon
        </span>
        <h3
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 16 : 18,
            fontWeight: 600,
            color: C.white,
            margin: "6px 0 0",
          }}
        >
          시작 웹툰
        </h3>
      </div>

      {!open ? (
        /* Collapsed: preview + expand button */
        <div style={{ position: "relative" }}>
          <div
            style={{
              maxHeight: 400,
              overflow: "hidden",
              border: `1px solid ${C.border06}`,
            }}
          >
            <img
              src={cdnUrl("audition1.webp")}
              alt="오디션 오프닝 웹툰"
              style={{ width: "100%", display: "block" }}
            />
          </div>
          {/* Fade overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 160,
              background: `linear-gradient(transparent, ${C.bgDeep})`,
              pointerEvents: "none",
            }}
          />
          <div style={{ textAlign: "center", marginTop: -40, position: "relative", zIndex: 1 }}>
            <button
              onClick={() => setOpen(true)}
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 13,
                fontWeight: 500,
                color: C.gold,
                background: C.bgCard,
                border: `1px solid ${C.goldMuted}`,
                padding: "10px 32px",
                cursor: "pointer",
                transition: "background 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s cubic-bezier(0.22,1,0.36,1), color 0.3s cubic-bezier(0.22,1,0.36,1)",
                letterSpacing: "0.04em",
              }}
            >
              웹툰 전체 보기
            </button>
          </div>
        </div>
      ) : (
        /* Expanded: all pages, seamless */
        <div>
          <div
            style={{
              border: `1px solid ${C.border06}`,
              overflow: "hidden",
              lineHeight: 0,
            }}
          >
            {WEBTOON_PAGES.map((n) => (
              <img
                key={n}
                src={cdnUrl(`audition${n}.webp`)}
                alt={`오디션 오프닝 ${n}/5`}
                loading="lazy"
                style={{ width: "100%", display: "block" }}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => {
                setOpen(false);
                const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                document.getElementById("webtoon-top")?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
              }}
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 12,
                color: C.text35,
                background: "transparent",
                border: `1px solid ${C.border06}`,
                padding: "8px 24px",
                cursor: "pointer",
                transition: "border-color 0.3s, color 0.3s",
              }}
            >
              접기
            </button>
          </div>
        </div>
      )}
      <div id="webtoon-top" />
    </div>
  );
}

function PerspectiveCards({ isMobile }) {
  const [ref, v] = useReveal(0.1);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 12 : 16,
        marginBottom: isMobile ? 36 : 48,
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {perspectives.map((p) => {
        const isGold = p.accent === "gold";
        const accent = isGold ? C.gold : "oklch(0.62 0.20 252)";
        const accentBg = isGold ? C.goldDim : "oklch(0.62 0.20 252 / 0.08)";
        return (
          <div
            key={p.key}
            style={{
              padding: isMobile ? "16px 18px" : "20px 22px",
              border: `1px solid ${accent}`,
              background: accentBg,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: isMobile ? 22 : 26, lineHeight: 1 }}>{p.emoji}</span>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: isMobile ? 10 : 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: accent,
                }}
              >
                {p.label}
              </span>
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: isMobile ? 13 : 14,
                color: accent,
                padding: "3px 8px",
                border: `1px solid ${accent}`,
                background: "oklch(1.0 0 0 / 0.02)",
                alignSelf: "flex-start",
                letterSpacing: "0.02em",
              }}
            >
              {p.command}
            </div>
            <div
              style={{
                fontFamily: "var(--f-display-kr)",
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: C.white,
                marginTop: 2,
              }}
            >
              {p.role}
            </div>
            <div
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 12 : 13,
                lineHeight: 1.8,
                color: C.text45,
                fontWeight: 300,
                wordBreak: "keep-all",
              }}
            >
              {p.line}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoundCard({ round, index, isMobile }) {
  const [ref, v] = useReveal(0.15);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: isMobile ? 16 : 24,
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(28px)",
        transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.08}s`,
      }}
    >
      {/* Round number */}
      <div
        style={{
          flexShrink: 0,
          width: isMobile ? 44 : 56,
          height: isMobile ? 44 : 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${C.goldMuted}`,
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 16 : 20,
          fontWeight: 600,
          color: C.gold,
        }}
      >
        {round.num}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isMobile ? 24 : 32 }}>
        <span
          style={{
            fontFamily: "var(--f-display-en)",
            fontSize: 9,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: C.goldText,
            display: "block",
            marginBottom: 4,
          }}
        >
          {round.en}
        </span>
        <h3
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 18 : 22,
            fontWeight: 600,
            color: C.white,
            margin: "0 0 10px",
          }}
        >
          {round.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--f-body)",
            fontSize: isMobile ? 12 : 13,
            lineHeight: 1.8,
            color: C.text45,
            margin: "0 0 10px",
            fontWeight: 400,
            wordBreak: "keep-all",
          }}
        >
          {round.shared}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 6 : 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderLeft: `2px solid ${C.gold}`,
              background: C.goldDim,
            }}
          >
            <div
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: C.gold,
                marginBottom: 4,
              }}
            >
              🎤 Producer
            </div>
            <div
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 11 : 12,
                lineHeight: 1.7,
                color: C.text35,
                fontWeight: 300,
                wordBreak: "keep-all",
              }}
            >
              {round.producerDesc}
            </div>
          </div>
          <div
            style={{
              padding: "8px 10px",
              borderLeft: `2px solid oklch(0.62 0.20 252)`,
              background: "oklch(0.62 0.20 252 / 0.08)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "oklch(0.62 0.20 252)",
                marginBottom: 4,
              }}
            >
              🎪 Contestant
            </div>
            <div
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 11 : 12,
                lineHeight: 1.7,
                color: C.text35,
                fontWeight: 300,
                wordBreak: "keep-all",
              }}
            >
              {round.contestantDesc}
            </div>
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--f-body)",
            fontSize: 11,
            color: C.gold,
            padding: "3px 10px",
            background: C.goldDim,
            border: `1px solid ${C.border10}`,
          }}
        >
          {round.result}
        </span>
      </div>
    </div>
  );
}

export default function ModeAudition() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <PageLayout>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Seo title="오디션 모드" description="프라임시티 오디션 모드 — 프로듀서와 참가자, 두 관점으로 진입하는 4라운드 서바이벌 무대." path="/modes/audition" />
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
            <div
              style={{
                display: "flex",
                gap: isMobile ? 12 : 20,
                justifyContent: "center",
                fontSize: isMobile ? 32 : 44,
                lineHeight: 1,
              }}
            >
              <span>🎤</span>
              <span style={{ color: C.text25, fontSize: isMobile ? 20 : 28, alignSelf: "center" }}>/</span>
              <span>🎪</span>
            </div>
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? 10 : 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "oklch(0.76 0.12 80)",
                display: "block",
                marginTop: 14,
                marginBottom: 8,
              }}
            >
              Audition · Two Perspectives
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
              증명하라. 세계가 당신을 알게 된다.
            </h1>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: isMobile ? 13 : 15,
                lineHeight: 1.9,
                color: C.text45,
                fontWeight: 300,
                maxWidth: 540,
                marginLeft: "auto",
                marginRight: "auto",
                wordBreak: "keep-all",
              }}
            >
              프라임시티 최대 규모의 서바이벌 오디션. 4라운드, 두 가지 관점으로
              진입할 수 있다 — 심사하는 <b style={{ color: C.gold, fontWeight: 500 }}>프로듀서</b>,
              혹은 무대에 오르는 <b style={{ color: "oklch(0.62 0.20 252)", fontWeight: 500 }}>참가자</b>.
            </p>
            <div
              style={{
                width: 56,
                height: 1,
                margin: isMobile ? "24px auto 28px" : "32px auto 40px",
                background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
              }}
            />
          </div>

          {/* ═══ Two Perspective Cards ═══ */}
          <PerspectiveCards isMobile={isMobile} />

          {/* ═══ Opening Webtoon ═══ */}
          <WebtoonSection isMobile={isMobile} />

          {/* Round progression */}
          <div
            style={{
              textAlign: "center",
              marginBottom: isMobile ? 28 : 40,
              fontFamily: "var(--f-display-en)",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: C.text25,
            }}
          >
            8명 → 6명 → 3명 → 최종
          </div>

          {rounds.map((r, i) => (
            <RoundCard
              key={r.num}
              round={r}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>
    </PageLayout>
  );
}
