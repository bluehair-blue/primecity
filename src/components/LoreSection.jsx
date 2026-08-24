import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import { characters } from "../data/characters";

const chapters = [
  ["archive-intro", "도시 개요"],
  ["archive-rings", "경력 구역"],
  ["archive-rank", "업계 등급"],
  ["archive-ppp", "PPP"],
  ["archive-people", "인물 기록"],
  ["archive-bonds", "주요 관계"],
  ["archive-clue", "공개 범위"],
];

const rings = [
  { name: "Terrace", ko: "테라스", note: "입문자와 소규모 기획사가 모이는 외곽", color: C.distTer },
  { name: "Hype Road", ko: "하입 로드", note: "신인·인디 아티스트와 실험적 작업의 중심", color: C.distHype },
  { name: "Middle Ring", ko: "미들 링", note: "검증된 전문가와 유망주가 일하는 구역", color: C.distMid },
  { name: "The Core", ko: "더 코어", note: "대형 프로젝트와 최상위 자원이 모이는 중심부", color: C.distCore },
];

const themes = [
  {
    id: "summit",
    question: "APEX의 정상권",
    answer: "서윤은 APEX의 톱 아티스트다. 나하린은 치프 프로듀서로 오디션을 총괄한다. 진시혁은 프로듀서와 심사위원을 맡는다.",
    characterIds: ["seoyun", "naharin", "jinshihyuk"],
  },
  {
    id: "wounds",
    question: "Blue Moon의 세 사람",
    answer: "에리카와 이서하는 각자의 실패 이후에도 작업을 이어간다. 은퇴한 에르피는 Blue Moon에서 두 사람을 발굴하고 후배를 키운다.",
    characterIds: ["erika", "leeseha", "erpi"],
  },
  {
    id: "small-studios",
    question: "PRISM과 Route 0의 생존 방식",
    answer: "재정난에 빠진 PRISM은 PPP를 마지막 기회로 삼았다. Route 0는 테라스의 작은 연습실에서 소속 아티스트의 데뷔와 활동을 준비한다.",
    characterIds: ["hansori", "kangharam", "sia", "noa"],
  },
  {
    id: "audition",
    question: "PPP 참가자 여덟 명",
    answer: "여덟 참가자는 모두 무소속으로 PPP에 들어온다. 같은 오디션 구조 안에서 각자의 강점과 약점을 평가받는다.",
    characterIds: ["janggru", "mila", "ella", "mimori", "hasieun", "nia", "ray", "lapis"],
  },
  {
    id: "independent",
    question: "소속 밖에서 일하는 아피리아와 사피아",
    answer: "아피리아는 무소속 아티스트로 활동한다. 사피아는 APPAIREL & DESIGN을 운영하며 아피리아의 의상과 이미지를 맡는다.",
    characterIds: ["apiria", "sapphire"],
  },
];

const relationships = [
  {
    ids: ["erpi", "naharin"],
    title: "친구이자 라이벌",
    copy: "에르피는 사람을 직접 이끈다. 나하린은 관찰과 시스템으로 프로젝트를 설계한다.",
  },
  {
    ids: ["erika", "leeseha"],
    title: "상처를 캐묻지 않는 동료",
    copy: "에리카와 이서하는 서로의 실패를 캐묻지 않는다. 필요할 때 말없이 곁을 지킨다.",
  },
  {
    ids: ["sia", "noa"],
    title: "Route 0의 흑백쌍둥이",
    copy: "시아가 대화를 이끌면 노아는 일정과 컨디션을 챙긴다. 검은색과 흰색 헤어클립은 두 사람의 표식이다.",
  },
  {
    ids: ["apiria", "sapphire"],
    title: "서로의 유일한 예외",
    copy: "아피리아는 사피아 앞에서만 경계를 푼다. 사피아는 언니의 활동과 안전을 챙긴다.",
  },
];

function getCharacter(id) {
  return characters.find((character) => character.id === id);
}

function RevealRecord({ id, eyebrow, title, children, isMobile }) {
  const [ref, visible] = useReveal(0.1);

  return (
    <div id={id}>
      <article
        ref={ref}
        style={{
          minHeight: isMobile ? "auto" : "72vh",
          padding: isMobile ? "56px 0" : "96px 0",
          borderTop: `1px solid ${C.border06}`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: 14,
            color: C.gold,
            fontFamily: "var(--f-display-en)",
            fontSize: 10,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
        <h3
          style={{
            maxWidth: 760,
            margin: "0 0 28px",
            color: C.white,
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(25px, 8vw, 36px)" : "clamp(34px, 4vw, 56px)",
            fontWeight: 500,
            lineHeight: 1.35,
            wordBreak: "keep-all",
          }}
        >
          {title}
        </h3>
        {children}
      </article>
    </div>
  );
}

function CharacterRecord({ character, isMobile }) {
  if (!character) return null;

  return (
    <Link
      to={character.detailPath}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "76px 1fr" : "112px 1fr auto",
        alignItems: "center",
        gap: isMobile ? 16 : 24,
        padding: isMobile ? "18px 0" : "22px 0",
        color: C.text90,
        textDecoration: "none",
        borderTop: `1px solid ${C.border10}`,
      }}
      aria-label={`${character.name} 상세 기록 보기`}
    >
      <img
        src={character.thumbnail || character.image}
        alt=""
        loading="lazy"
        style={{
          width: isMobile ? 76 : 112,
          aspectRatio: "1 / 1",
          objectFit: "cover",
          border: `1px solid ${C.goldMuted}`,
        }}
      />
      <span>
        <strong
          style={{
            display: "block",
            marginBottom: 5,
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 17 : 20,
            fontWeight: 600,
          }}
        >
          {character.name}
        </strong>
        <span style={{ display: "block", color: C.text45, fontFamily: "var(--f-body)", fontSize: 12, lineHeight: 1.7 }}>
          {character.role} · {character.agency}
        </span>
      </span>
      {!isMobile && (
        <span aria-hidden="true" style={{ color: C.gold, fontFamily: "var(--f-display-en)", fontSize: 18 }}>
          →
        </span>
      )}
    </Link>
  );
}

export default function LoreSection() {
  const isMobile = useIsMobile(768);
  const [selectedTheme, setSelectedTheme] = useState(themes[0].id);
  const activeTheme = themes.find((theme) => theme.id === selectedTheme);

  function selectTheme(index) {
    const theme = themes[index];
    setSelectedTheme(theme.id);
    document.getElementById(`lore-tab-${theme.id}`)?.focus();
  }

  function handleThemeKeyDown(event, index) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") selectTheme(0);
    else if (event.key === "End") selectTheme(themes.length - 1);
    else selectTheme((index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + themes.length) % themes.length);
  }

  return (
    <section
      id="setting-book"
      aria-labelledby="setting-book-title"
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "72px 20px 96px" : "120px 48px 160px",
        background: `linear-gradient(180deg, transparent, ${C.bgCard} 18%, ${C.bgDeep} 82%, transparent)`,
      }}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(90deg, ${C.bgDeep}, transparent 22%, transparent 78%, ${C.bgDeep})` }} />

      <header style={{ position: "relative", maxWidth: 1120, margin: "0 auto", paddingBottom: isMobile ? 48 : 88 }}>
        <span style={{ display: "block", marginBottom: 16, color: C.gold, fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase" }}>
          Prime City Archive
        </span>
        <h2 id="setting-book-title" style={{ margin: "0 0 22px", color: C.white, fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(38px, 13vw, 58px)" : "clamp(62px, 8vw, 104px)", fontWeight: 500, lineHeight: 1.06 }}>
          설정집
        </h2>
        <p style={{ maxWidth: 640, margin: 0, color: C.text55, fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 17, fontWeight: 300, lineHeight: 1.9, wordBreak: "keep-all" }}>
          프라임시티의 구역과 업계 규칙, PPP, 주요 인물과 관계를 정리한 공개 기록이다.
        </p>
      </header>

      <div style={{ position: "relative", display: isMobile ? "block" : "grid", gridTemplateColumns: "160px minmax(0, 860px)", gap: 72, maxWidth: 1120, margin: "0 auto" }}>
        {!isMobile && (
          <nav aria-label="설정집 장" style={{ position: "sticky", top: 112, alignSelf: "start", paddingTop: 96 }}>
            <span aria-hidden="true" style={{ display: "block", width: 1, height: 52, marginBottom: 22, background: `linear-gradient(${C.gold}, transparent)` }} />
            {chapters.map(([id, label], index) => (
              <a key={id} href={`#${id}`} style={{ display: "block", padding: "9px 0", color: C.text35, fontFamily: "var(--f-body)", fontSize: 11, letterSpacing: "0.05em", textDecoration: "none" }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: 24, color: C.goldText, fontFamily: "var(--f-display-en)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </a>
            ))}
          </nav>
        )}

        <div>
          <RevealRecord id="archive-intro" eyebrow="Record 01" title="도시에 들어온 뒤에도 기회는 고르게 주어지지 않는다." isMobile={isMobile}>
            <p style={{ maxWidth: 700, margin: 0, color: C.text55, fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 17, lineHeight: 2, wordBreak: "keep-all" }}>
              프라임시티는 재능과 야망이 교차하는 초거대 엔터테인먼트 특별자치구다. 오디션, 스카우트, 초대처럼 들어오는 길은 여럿이지만 도시 안의 기회와 자원은 같은 속도로 주어지지 않는다.
            </p>
          </RevealRecord>

          <RevealRecord id="archive-rings" eyebrow="Record 02" title="프라임시티의 경력 구역은 네 개의 링으로 나뉜다." isMobile={isMobile}>
            <div style={{ maxWidth: 760 }}>
              {rings.map((ring, index) => (
                <div key={ring.name} style={{ display: "grid", gridTemplateColumns: isMobile ? "42px 1fr" : "72px 180px 1fr", gap: isMobile ? 12 : 20, alignItems: "baseline", padding: isMobile ? "18px 0" : "22px 0", borderTop: `1px solid ${C.border10}` }}>
                  <span aria-hidden="true" style={{ color: ring.color, fontFamily: "var(--f-display-en)", fontSize: isMobile ? 18 : 24 }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong style={{ color: C.white, fontFamily: "var(--f-display-en)", fontSize: isMobile ? 17 : 21, fontWeight: 500 }}>
                    {ring.name}
                  </strong>
                  <span style={{ gridColumn: isMobile ? "2" : "auto", color: C.text45, fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.7 }}>
                    {ring.ko} · {ring.note}
                  </span>
                </div>
              ))}
              <aside style={{ marginTop: 26, padding: isMobile ? "22px 0 0" : "26px 30px", borderTop: `1px solid ${C.distIndustrial}`, borderLeft: isMobile ? "none" : `1px solid ${C.distIndustrial}` }}>
                <strong style={{ display: "block", marginBottom: 8, color: C.distIndustrial, fontFamily: "var(--f-display-en)", fontSize: 16, letterSpacing: "0.08em" }}>
                  Industrial · 산업단지
                </strong>
                <p style={{ margin: 0, color: C.text45, fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.8, wordBreak: "keep-all" }}>
                  다섯 번째 경력 단계가 아니다. 장비·의상·세트·인력의 이동을 맡아 화려한 무대를 실제로 움직이는 별도의 기반시설이다.
                </p>
              </aside>
            </div>
          </RevealRecord>

          <RevealRecord id="archive-rank" eyebrow="Record 03" title="공식 등급표 없이도 자원 접근 격차가 생긴다." isMobile={isMobile}>
            <p style={{ maxWidth: 700, margin: "0 0 32px", color: C.text55, fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 17, lineHeight: 2, wordBreak: "keep-all" }}>
              소속, 전적, 팬덤, 미디어 노출, 담당자의 네트워크가 접근 가능한 자원을 바꾼다. 이 차이에 따라 정상권·검증권·신인권·소진권이 비공식적으로 갈린다.
            </p>
            <blockquote style={{ maxWidth: 680, margin: 0, padding: isMobile ? "20px 0 20px 22px" : "26px 0 26px 34px", borderLeft: `1px solid ${C.gold}`, color: C.text90, fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 18 : 24, lineHeight: 1.7, wordBreak: "keep-all" }}>
              실패는 발표되지 않는다. 섭외가 끊긴다. 연습실의 시간이 줄고 연락하던 사람은 다른 이름을 부른다.
            </blockquote>
          </RevealRecord>

          <RevealRecord id="archive-ppp" eyebrow="Record 04" title="PPP는 프라임시티 최대 규모의 서바이벌 오디션이다." isMobile={isMobile}>
            <p style={{ maxWidth: 700, margin: "0 0 38px", color: C.text55, fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 17, lineHeight: 2, wordBreak: "keep-all" }}>
              Produce · Prime · Priority. 기본 진행은 8명의 참가자로 시작해 6명, 3명으로 좁혀진다. 마지막 무대 뒤에는 참가자가 함께할 프로듀서를 선택한다.
            </p>
            <ol aria-label="PPP 진행 흐름" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: isMobile ? 6 : 14, maxWidth: 720, margin: 0, padding: 0, listStyle: "none" }}>
              {["8", "6", "3", "선택"].map((stage, index) => (
                <li key={stage} style={{ position: "relative", padding: isMobile ? "18px 4px" : "24px 12px", textAlign: "center", borderTop: `1px solid ${index === 3 ? C.gold : C.border10}` }}>
                  <span style={{ display: "block", minHeight: isMobile ? 32 : 48, color: index === 3 ? C.gold : C.white, fontFamily: index === 3 ? "var(--f-display-kr)" : "var(--f-display-en)", fontSize: index === 3 ? (isMobile ? 21 : 30) : (isMobile ? 32 : 48), fontWeight: index === 3 ? 600 : 400, lineHeight: 1 }}>
                    {stage}
                  </span>
                  <span style={{ display: "block", marginTop: 9, color: C.text35, fontFamily: "var(--f-body)", fontSize: 10 }}>
                    {index === 0 ? "시작" : index === 3 ? "최종 선택" : "생존"}
                  </span>
                  {index < 3 && <span aria-hidden="true" style={{ position: "absolute", top: "31%", right: isMobile ? -6 : -12, color: C.goldMuted }}>→</span>}
                </li>
              ))}
            </ol>
          </RevealRecord>

          <RevealRecord id="archive-people" eyebrow="Record 05" title="주요 인물의 현재 위치를 살펴본다." isMobile={isMobile}>
            <div role="tablist" aria-label="주요 인물을 읽는 다섯 주제" aria-orientation="vertical" style={{ display: "grid", gap: 6, marginBottom: 34 }}>
              {themes.map((theme, index) => {
                const selected = theme.id === selectedTheme;
                return (
                  <button
                    key={theme.id}
                    id={`lore-tab-${theme.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="lore-theme-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setSelectedTheme(theme.id)}
                    onKeyDown={(event) => handleThemeKeyDown(event, index)}
                    style={{
                      padding: isMobile ? "12px 14px" : "13px 18px",
                      color: selected ? C.gold : C.text55,
                      background: selected ? C.goldDim : C.bgCard,
                      border: `1px solid ${selected ? C.gold : C.border10}`,
                      fontFamily: "var(--f-body)",
                      fontSize: isMobile ? 11 : 12,
                      lineHeight: 1.5,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")} · {theme.question}
                  </button>
                );
              })}
            </div>
            <div id="lore-theme-panel" role="tabpanel" aria-labelledby={`lore-tab-${activeTheme.id}`} tabIndex={0}>
              <h4 style={{ maxWidth: 680, margin: "0 0 14px", color: C.white, fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 21 : 28, fontWeight: 500, lineHeight: 1.55, wordBreak: "keep-all" }}>
                {activeTheme.question}
              </h4>
              <p style={{ maxWidth: 680, margin: "0 0 28px", color: C.text45, fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.9, wordBreak: "keep-all" }}>
                {activeTheme.answer}
              </p>
              <div>
                {activeTheme.characterIds.map((id) => (
                  <CharacterRecord key={id} character={getCharacter(id)} isMobile={isMobile} />
                ))}
              </div>
            </div>
          </RevealRecord>

          <RevealRecord id="archive-bonds" eyebrow="Record 06" title="네 쌍의 주요 관계를 기록한다." isMobile={isMobile}>
            <div>
              {relationships.map((relationship, index) => {
                const pair = relationship.ids.map(getCharacter);
                return (
                  <div key={relationship.ids.join("-")} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "180px 1fr", gap: isMobile ? 10 : 32, padding: isMobile ? "24px 0" : "30px 0", borderTop: `1px solid ${C.border10}` }}>
                    <span style={{ color: C.gold, fontFamily: "var(--f-display-en)", fontSize: 11, letterSpacing: "0.18em" }}>
                      RELATION {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 style={{ margin: "0 0 10px", color: C.white, fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 19 : 23, fontWeight: 500 }}>
                        <Link to={pair[0].detailPath} style={{ color: C.white, textDecorationColor: C.goldMuted }}>{pair[0].name}</Link>
                        <span aria-hidden="true" style={{ padding: "0 8px", color: C.goldMuted }}>×</span>
                        <Link to={pair[1].detailPath} style={{ color: C.white, textDecorationColor: C.goldMuted }}>{pair[1].name}</Link>
                      </h4>
                      <strong style={{ display: "block", marginBottom: 8, color: C.text70, fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 500 }}>{relationship.title}</strong>
                      <p style={{ margin: 0, color: C.text45, fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.8, wordBreak: "keep-all" }}>{relationship.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealRecord>

          <RevealRecord id="archive-clue" eyebrow="Record 07" title="공개 기록은 여기까지다." isMobile={isMobile}>
            <p style={{ maxWidth: 720, margin: 0, color: C.text90, fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(22px, 7vw, 30px)" : "clamp(30px, 4vw, 46px)", lineHeight: 1.7, wordBreak: "keep-all" }}>
              인물과 관계의 자세한 기록은 각 캐릭터 페이지에서 이어진다.
            </p>
          </RevealRecord>
        </div>
      </div>
    </section>
  );
}
