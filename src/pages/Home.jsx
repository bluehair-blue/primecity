import { useState, useEffect } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import Particles from "../components/Particles";
import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import CharCard from "../components/CharCard";
import DistrictCard from "../components/DistrictCard";
import Footer from "../components/Footer";

function IntroSection({ isMobile }) {
  const [ref, v] = useReveal(0.15);
  return (
    <section
      id="intro"
      ref={ref}
      style={{
        position: "relative",
        zIndex: 2,
        padding: isMobile ? "72px 24px" : "120px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--f-display-en)",
          fontSize: isMobile ? 9 : 10,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: isMobile ? 12 : 18,
          opacity: v ? 1 : 0,
          transform: v ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        About
      </span>
      <h2
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile
            ? "clamp(20px,5.5vw,28px)"
            : "clamp(26px,3vw,40px)",
          fontWeight: 600,
          color: C.white,
          margin: 0,
          lineHeight: 1.4,
          opacity: v ? 1 : 0,
          transform: v ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
          wordBreak: "keep-all",
        }}
      >
        재능과 야망이 교차하는
        <br />
        초거대 엔터테인먼트 특별자치구
      </h2>
      <div
        style={{
          width: v ? 56 : 0,
          height: 1,
          margin: isMobile ? "20px 0" : "28px 0",
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
        }}
      />
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 13 : 15,
          lineHeight: 1.9,
          color: C.text45,
          maxWidth: isMobile ? 340 : 560,
          fontWeight: 300,
          wordBreak: "keep-all",
          opacity: v ? 1 : 0,
          transform: v ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s",
        }}
      >
        자동화가 모든 것을 대체한 근미래. 사람이 자신의 가치를 증명할 수 있는
        무대는 단 하나 — 엔터테인먼트.
        <br />
        <br />
        프라임시티는 그 정점에 있다. 이곳에 입성한다는 것 자체가, 업계에서
        인정받았다는 의미.
      </p>
    </section>
  );
}

function CharactersSection({ isMobile }) {
  const [tRef, tV] = useReveal(0.12);
  const [gRef, gV] = useReveal(0.05);

  const chars = [
    { name: "서윤", agency: "APEX", role: "톱 아이돌", tagline: "영점, 그리고 정점.", color: C.charApex },
    { name: "나하린", agency: "APEX", role: "치프 프로듀서", tagline: "안녕~. 네 이름 많이 들었어.", color: C.charNaha },
    { name: "진시혁", agency: "APEX", role: "프로듀서", tagline: "탈락, 다음.", color: C.charJin },
    { name: "에리카", agency: "Blue Moon", role: "프로듀서", tagline: "만만하게 보면 큰코다친다?", color: C.charEri },
    { name: "이서하", agency: "Blue Moon", role: "싱어송라이터", tagline: "하아… 귀찮으니 빨리 끝내.", color: C.charSeo },
    { name: "한소리", agency: "PRISM", role: "기획사 대표", tagline: "이게 마지막 기회야.", color: C.charHan },
  ];

  return (
    <section
      id="characters"
      style={{
        position: "relative",
        padding: isMobile ? "64px 20px 56px" : "100px 48px 100px",
        zIndex: 2,
      }}
    >
      <div
        ref={tRef}
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 30 : 52,
          opacity: tV ? 1 : 0,
          transform: tV ? "translateY(0)" : "translateY(24px)",
          transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
        }}
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
          Characters
        </span>
        <h2
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile
              ? "clamp(22px,6vw,30px)"
              : "clamp(28px,3.5vw,44px)",
            fontWeight: 600,
            color: C.white,
            margin: 0,
          }}
        >
          이 무대의 주인공들
        </h2>
        <div
          style={{
            width: tV ? 56 : 0,
            height: 1,
            margin: isMobile ? "14px auto 0" : "24px auto 0",
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
          }}
        />
      </div>
      <div
        ref={gRef}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: isMobile ? 10 : 18,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {chars.map((c, i) => (
          <CharCard
            key={i}
            {...c}
            index={i}
            visible={gV}
            isMobile={isMobile}
          />
        ))}
      </div>
    </section>
  );
}

function WorldSection({ isMobile }) {
  const [tRef, tV] = useReveal(0.12);
  const [gRef, gV] = useReveal(0.05);

  const districtData = [
    { name: "더 코어", en: "The Core", tier: "정상 · 지배층", agency: "APEX Entertainment — 업계 1위", desc: "프라임 돔과 방송국 본사가 자리한 정점. 화려하지만 숨 막히는 긴장감이 감도는 곳.", accent: C.distCore },
    { name: "미들 링", en: "Middle Ring", tier: "검증된 실력자", agency: "Blue Moon Entertainment — 업계 2위", desc: "스튜디오가 밀집한 실력의 구역. 실력으로 말하는 사람들이 모이는 곳.", accent: C.distMid },
    { name: "하입 로드", en: "Hype Road", tier: "트렌드 최전선", agency: "PRISM Studio — 개성으로 승부", desc: "유행이 태어나고 죽는 곳. 라이브 클럽과 공유 스튜디오가 에너지를 뿜는 거리.", accent: C.distHype },
    { name: "테라스", en: "Terrace", tier: "시작과 안주의 경계", agency: "Route 0 — 무한 가능성, 무한 불확실", desc: "처음 오는 사람에게는 희망. 밀려온 사람에게는 어중간한 안락함의 유혹.", accent: C.distTer },
  ];

  return (
    <section
      id="world"
      style={{
        position: "relative",
        padding: isMobile ? "64px 20px 56px" : "100px 48px 100px",
        zIndex: 2,
      }}
    >
      <div
        ref={tRef}
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 36 : 60,
          opacity: tV ? 1 : 0,
          transform: tV ? "translateY(0)" : "translateY(24px)",
          transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
        }}
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
          World Building
        </span>
        <h2
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile
              ? "clamp(22px,6vw,30px)"
              : "clamp(28px,3.5vw,44px)",
            fontWeight: 600,
            color: C.white,
            margin: 0,
          }}
        >
          프라임시티의 구역들
        </h2>
        <p
          style={{
            fontFamily: "var(--f-body)",
            fontSize: isMobile ? 12 : 14,
            color: C.text35,
            marginTop: isMobile ? 10 : 16,
            maxWidth: 460,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.7,
            fontWeight: 300,
            wordBreak: "keep-all",
          }}
        >
          중심부일수록 자원과 기회가 집중되는 동심원 구조.
        </p>
        <div
          style={{
            width: tV ? 56 : 0,
            height: 1,
            margin: isMobile ? "16px auto 0" : "24px auto 0",
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s",
          }}
        />
      </div>
      <div
        ref={gRef}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: isMobile ? 12 : 18,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {districtData.map((d, i) => (
          <DistrictCard
            key={i}
            {...d}
            index={i}
            visible={gV}
            isMobile={isMobile}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      style={{
        background: C.bgDeep,
        color: C.white,
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <Particles isMobile={isMobile} />
      <Navbar scrolled={scrolled} isMobile={isMobile} />
      <HeroSlider isMobile={isMobile} />
      <IntroSection isMobile={isMobile} />
      <CharactersSection isMobile={isMobile} />
      <WorldSection isMobile={isMobile} />
      <Footer isMobile={isMobile} />
    </div>
  );
}
