import { useState } from "react";
import { Link } from "react-router-dom";
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
    desc: "개인 무대 + 심사위원 등급 부여. 8명 전원 유지, 탈락 없음. 유저는 심사위원으로서 참가자의 무대를 평가하고 등급을 매긴다.",
    result: "8명 유지",
  },
  {
    num: "2R",
    title: "프로듀서 픽 & 쟁탈전",
    en: "Producer Pick",
    desc: "프로듀서가 순서대로 참가자를 지명. 겹치는 참가자 발생 시 쟁탈전 돌입 — 공개 어필, 역질문, 블라인드 선택까지.",
    result: "8명 → 6명 (2명 탈락)",
  },
  {
    num: "3R",
    title: "팀 대항전",
    en: "Team Battle",
    desc: "3팀 대결로 순위 결정. 1위 팀은 2명 생존 확정. 패자부활 토너먼트를 거쳐 최종 3명이 결승에 진출.",
    result: "6명 → 3명",
  },
  {
    num: "4R",
    title: "최종 선택",
    en: "Final Choice",
    desc: "권력이 역전된다 — 참가자가 프로듀서를 선택. 과거 발언이 되돌아오고, 비공개 대화에서 진심이 드러나는 마지막 라운드.",
    result: "최종 결과 확정",
  },
];

const WEBTOON_PAGES = [1, 2, 3, 4, 5, 6];

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
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
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
                transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
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
                alt={`오디션 오프닝 ${n}/6`}
                loading="lazy"
                style={{ width: "100%", display: "block" }}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => {
                setOpen(false);
                document.getElementById("webtoon-top")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 12,
                color: C.text35,
                background: "transparent",
                border: `1px solid ${C.border06}`,
                padding: "8px 24px",
                cursor: "pointer",
                transition: "all 0.3s",
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
            color: C.text35,
            margin: "0 0 12px",
            fontWeight: 300,
            wordBreak: "keep-all",
          }}
        >
          {round.desc}
        </p>
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
  const isMobile = useIsMobile();

  return (
    <PageLayout>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Seo title="오디션 모드" description="프라임시티 오디션 모드 — 8명의 참가자, 4라운드 서바이벌 무대 상세 안내." path="/modes/audition" />
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
            <span style={{ fontSize: isMobile ? 36 : 48, display: "block" }}>
              🎤
            </span>
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: isMobile ? 10 : 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "oklch(0.76 0.12 80)",
                display: "block",
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              Audition
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
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                wordBreak: "keep-all",
              }}
            >
              프라임시티 최대 규모의 서바이벌 오디션. 8명의 참가자, 4라운드의
              무대. 연습, 미션, 심사를 거치며 정상을 향해 올라가는 메인 스토리.
            </p>
            <div
              style={{
                width: 56,
                height: 1,
                margin: isMobile ? "24px auto 36px" : "32px auto 56px",
                background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
              }}
            />
          </div>

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
