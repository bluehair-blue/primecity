import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import { characters } from "../data/characters";
import "./LoreSection.css";

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

function RevealRecord({ id, number, eyebrow, title, variant, children }) {
  const [ref, visible] = useReveal(0.08);

  return (
    <div id={id} className="lore-anchor">
      <article
        ref={ref}
        className={`lore-record lore-record--${variant}${visible ? " is-visible" : ""}`}
        aria-labelledby={`${id}-title`}
      >
        <span className="lore-record__watermark" aria-hidden="true">{number}</span>
        <header className="lore-record__header">
          <span className="lore-record__eyebrow">{eyebrow}</span>
          <h3 id={`${id}-title`} className="lore-record__title">{title}</h3>
        </header>
        <div className="lore-record__body">{children}</div>
      </article>
    </div>
  );
}

function CharacterRecord({ character }) {
  if (!character) return null;

  return (
    <Link
      to={character.detailPath}
      className="lore-character-record"
      aria-label={`${character.name} 상세 기록 보기`}
    >
      <span className="lore-character-record__portrait" aria-hidden="true">
        <img src={character.thumbnail || character.image} alt="" loading="lazy" />
      </span>
      <span className="lore-character-record__copy">
        <strong>{character.name}</strong>
        <span>{character.role} · {character.agency}</span>
      </span>
      <span className="lore-character-record__arrow" aria-hidden="true">→</span>
    </Link>
  );
}

export default function LoreSection() {
  const [selectedTheme, setSelectedTheme] = useState(themes[0].id);
  const [activeChapter, setActiveChapter] = useState(chapters[0][0]);
  const activeTheme = themes.find((theme) => theme.id === selectedTheme) || themes[0];
  const activeChapterIndex = Math.max(0, chapters.findIndex(([id]) => id === activeChapter));
  const activeChapterNumber = String(activeChapterIndex + 1).padStart(2, "0");

  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    const hasChapterHash = chapters.some(([id]) => id === hashId);
    if (hasChapterHash) setActiveChapter(hashId);

    const targets = chapters
      .map(([id]) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setActiveChapter(current.target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: 0 }
    );

    targets.forEach((target) => observer.observe(target));

    let hashFrame;
    if (hasChapterHash) {
      hashFrame = window.requestAnimationFrame(() => {
        hashFrame = window.requestAnimationFrame(() => {
          const target = document.getElementById(hashId);
          if (!target) return;

          const root = document.documentElement;
          const previousBehavior = root.style.scrollBehavior;
          root.style.scrollBehavior = "auto";
          target.scrollIntoView({ block: "start" });
          window.requestAnimationFrame(() => {
            root.style.scrollBehavior = previousBehavior;
          });
        });
      });
    }

    return () => {
      observer.disconnect();
      if (hashFrame) window.cancelAnimationFrame(hashFrame);
    };
  }, []);

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

  function handleChapterChange(event) {
    const id = event.target.value;
    const target = document.getElementById(id);
    if (!target) return;

    setActiveChapter(id);
    window.history.replaceState(window.history.state, "", `#${id}`);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section
      id="setting-book"
      className="lore-section"
      aria-labelledby="setting-book-title"
      style={{
        "--lore-bg": C.bgDeep,
        "--lore-bg-card": C.bgCard,
        "--lore-bg-overlay": C.bgOverlay,
        "--lore-gold": C.gold,
        "--lore-gold-muted": C.goldMuted,
        "--lore-gold-dim": C.goldDim,
        "--lore-gold-text": C.goldText,
        "--lore-blue": C.primeBlue,
        "--lore-blue-muted": C.primeBlueMuted,
        "--lore-blue-dim": C.primeBlueDim,
        "--lore-white": C.white,
        "--lore-text-90": C.text90,
        "--lore-text-70": C.text70,
        "--lore-text-55": C.text55,
        "--lore-text-45": C.text45,
        "--lore-text-35": C.text35,
        "--lore-text-25": C.text25,
        "--lore-text-15": C.text15,
        "--lore-border-10": C.border10,
        "--lore-border-06": C.border06,
        "--lore-industrial": C.distIndustrial,
      }}
    >
      <div className="lore-section__atmosphere" aria-hidden="true" />

      <header className="lore-hero">
        <div className="lore-hero__registry" aria-hidden="true">
          <span>PRIME CITY</span>
          <span>01—07</span>
        </div>
        <div className="lore-hero__copy">
          <span className="lore-kicker">Prime City Archive</span>
          <h2 id="setting-book-title">설정집</h2>
          <p>프라임시티의 구역과 업계 규칙, PPP, 주요 인물과 관계를 정리한 공개 기록이다.</p>
        </div>
        <a className="lore-hero__enter" href="#archive-intro">
          <span>Record 01</span>
          <strong>도시 개요</strong>
          <span className="lore-hero__enter-arrow" aria-hidden="true">↓</span>
        </a>
      </header>

      <nav className="lore-mobile-index" aria-label="설정집 장 이동">
        <label htmlFor="lore-chapter-select">
          <span>현재 기록</span>
          <strong>{activeChapterNumber} / {String(chapters.length).padStart(2, "0")}</strong>
        </label>
        <span className="lore-mobile-index__select">
          <select id="lore-chapter-select" value={activeChapter} onChange={handleChapterChange}>
            {chapters.map(([id, label], index) => (
              <option key={id} value={id}>{String(index + 1).padStart(2, "0")} · {label}</option>
            ))}
          </select>
          <span aria-hidden="true">⌄</span>
        </span>
      </nav>

      <div className="lore-layout">
        <aside className="lore-rail">
          <nav aria-label="설정집 장">
            <div className="lore-rail__status" aria-hidden="true">
              <span>Record</span>
              <strong>{activeChapterNumber}</strong>
              <small>/ {String(chapters.length).padStart(2, "0")}</small>
            </div>
            <div className="lore-rail__navigation">
              <span className="lore-rail__track" aria-hidden="true">
                <span
                  className="lore-rail__fill"
                  style={{ transform: `scaleY(${(activeChapterIndex + 1) / chapters.length})` }}
                />
              </span>
              <div className="lore-rail__links">
                {chapters.map(([id, label], index) => {
                  const active = id === activeChapter;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={active ? "is-active" : undefined}
                      aria-current={active ? "location" : undefined}
                      onClick={() => setActiveChapter(id)}
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{label}</strong>
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        <div className="lore-records">
          <RevealRecord id="archive-intro" number="01" eyebrow="Record 01" title="도시에 들어온 뒤에도 기회는 고르게 주어지지 않는다." variant="intro">
            <p className="lore-copy lore-copy--lead">
              프라임시티는 재능과 야망이 교차하는 초거대 엔터테인먼트 특별자치구다. 오디션, 스카우트, 초대처럼 들어오는 길은 여럿이지만 도시 안의 기회와 자원은 같은 속도로 주어지지 않는다.
            </p>
          </RevealRecord>

          <RevealRecord id="archive-rings" number="02" eyebrow="Record 02" title="프라임시티의 경력 구역은 네 개의 링으로 나뉜다." variant="rings">
            <div className="lore-rings">
              {rings.map((ring, index) => (
                <div key={ring.name} className="lore-ring" style={{ "--ring-color": ring.color }}>
                  <span className="lore-ring__marker" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <strong>{ring.name}</strong>
                  <span>{ring.ko} · {ring.note}</span>
                </div>
              ))}
              <aside className="lore-industrial">
                <strong>Industrial · 산업단지</strong>
                <p>다섯 번째 경력 단계가 아니다. 장비·의상·세트·인력의 이동을 맡아 화려한 무대를 실제로 움직이는 별도의 기반시설이다.</p>
              </aside>
            </div>
          </RevealRecord>

          <RevealRecord id="archive-rank" number="03" eyebrow="Record 03" title="공식 등급표 없이도 자원 접근 격차가 생긴다." variant="rank">
            <div className="lore-rank-layout">
              <p className="lore-copy">
                소속, 전적, 팬덤, 미디어 노출, 담당자의 네트워크가 접근 가능한 자원을 바꾼다. 이 차이에 따라 정상권·검증권·신인권·소진권이 비공식적으로 갈린다.
              </p>
              <blockquote>실패는 발표되지 않는다. 섭외가 끊긴다. 연습실의 시간이 줄고 연락하던 사람은 다른 이름을 부른다.</blockquote>
            </div>
          </RevealRecord>

          <RevealRecord id="archive-ppp" number="04" eyebrow="Record 04" title="PPP는 프라임시티 최대 규모의 서바이벌 오디션이다." variant="ppp">
            <p className="lore-copy">
              Produce · Prime · Priority. 기본 진행은 8명의 참가자로 시작해 6명, 3명으로 좁혀진다. 마지막 무대 뒤에는 참가자가 함께할 프로듀서를 선택한다.
            </p>
            <ol className="lore-ppp-flow" aria-label="PPP 진행 흐름">
              {["8", "6", "3", "선택"].map((stage, index) => (
                <li key={stage} className={index === 3 ? "is-final" : undefined}>
                  <span>{stage}</span>
                  <small>{index === 0 ? "시작" : index === 3 ? "최종 선택" : "생존"}</small>
                </li>
              ))}
            </ol>
          </RevealRecord>

          <RevealRecord id="archive-people" number="05" eyebrow="Record 05" title="주요 인물의 현재 위치를 살펴본다." variant="people">
            <div className="lore-people-layout">
              <div
                className="lore-theme-tabs"
                role="tablist"
                aria-label="주요 인물을 읽는 다섯 주제"
                aria-orientation="vertical"
              >
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
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{theme.question}</strong>
                    </button>
                  );
                })}
              </div>
              <div
                id="lore-theme-panel"
                className="lore-theme-panel"
                role="tabpanel"
                aria-labelledby={`lore-tab-${activeTheme.id}`}
                tabIndex={0}
              >
                <header>
                  <span>Character Record</span>
                  <h4>{activeTheme.question}</h4>
                  <p>{activeTheme.answer}</p>
                </header>
                <div className="lore-character-list">
                  {activeTheme.characterIds.map((id) => (
                    <CharacterRecord key={id} character={getCharacter(id)} />
                  ))}
                </div>
              </div>
            </div>
          </RevealRecord>

          <RevealRecord id="archive-bonds" number="06" eyebrow="Record 06" title="네 쌍의 주요 관계를 기록한다." variant="bonds">
            <div className="lore-relationships">
              {relationships.map((relationship, index) => {
                const pair = relationship.ids.map(getCharacter).filter(Boolean);
                if (pair.length < 2) return null;

                return (
                  <div key={relationship.ids.join("-")} className="lore-relationship">
                    <div className="lore-relationship__portraits">
                      {pair.map((character) => (
                        <Link
                          key={character.id}
                          to={character.detailPath}
                          aria-label={`${character.name} 상세 기록 보기`}
                        >
                          <img src={character.thumbnail || character.image} alt="" loading="lazy" />
                        </Link>
                      ))}
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="lore-relationship__copy">
                      <span>Relation {String(index + 1).padStart(2, "0")}</span>
                      <h4>
                        <Link to={pair[0].detailPath}>{pair[0].name}</Link>
                        <span aria-hidden="true">×</span>
                        <Link to={pair[1].detailPath}>{pair[1].name}</Link>
                      </h4>
                      <strong>{relationship.title}</strong>
                      <p>{relationship.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealRecord>

          <RevealRecord id="archive-clue" number="07" eyebrow="Record 07" title="공개 기록은 여기까지다." variant="clue">
            <div className="lore-closing">
              <span aria-hidden="true">07 / 07</span>
              <p>인물과 관계의 자세한 기록은 각 캐릭터 페이지에서 이어진다.</p>
            </div>
          </RevealRecord>
        </div>
      </div>
    </section>
  );
}
