import { useState, useEffect } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import Particles from "../components/Particles";
import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import CharCarousel from "../components/CharCarousel";
import CityMap from "../components/CityMap";
import DistrictCard from "../components/DistrictCard";
import { districts } from "../data/districts";
import GameModes from "../components/GameModes";
import TriangleNav from "../components/TriangleNav";
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


function WorldSection({ isMobile }) {
  const [tRef, tV] = useReveal(0.12);

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
      <CityMap isMobile={isMobile} />

      {/* District detail cards */}
      <DistrictCards isMobile={isMobile} />
    </section>
  );
}

function DistrictCards({ isMobile }) {
  const [ref, v] = useReveal(0.1);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 12 : 16,
        marginTop: isMobile ? 32 : 48,
        maxWidth: 900,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {districts.map((d, i) => (
        <DistrictCard
          key={d.id}
          {...d}
          index={i}
          visible={v}
          isMobile={isMobile}
        />
      ))}
    </div>
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
      <CharCarousel isMobile={isMobile} />
      <WorldSection isMobile={isMobile} />
      <GameModes isMobile={isMobile} />
      <TriangleNav isMobile={isMobile} />
      <Footer isMobile={isMobile} />
    </div>
  );
}
