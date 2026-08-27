import { useState, useEffect } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";

const sections = [
  { id: "hero", label: "히어로", en: "Hero" },
  { id: "intro", label: "소개", en: "About" },
  { id: "characters", label: "캐릭터", en: "Characters" },
  { id: "world", label: "세계관", en: "World" },
  { id: "setting-book", label: "설정집", en: "Archive" },
  { id: "modes", label: "게임 모드", en: "Modes" },
  { id: "explore", label: "더 보기", en: "Explore" },
];

export default function ScrollNav({ isMobile }) {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);
  const compact = useIsMobile(900) || isMobile;

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);

      const offsets = sections
        .map((s) => {
          const el = document.getElementById(s.id);
          if (!el) return { id: s.id, top: Infinity };
          return { id: s.id, top: el.getBoundingClientRect().top };
        })
        .filter((o) => o.top < window.innerHeight * 0.5);

      if (offsets.length > 0) {
        setActive(offsets[offsets.length - 1].id);
      } else {
        setActive("hero");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  }

  if (!visible) return null;

  if (compact) {
    if (active === "setting-book") return null;

    return (
      <nav
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            aria-label={s.label}
            style={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 44,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                outlineOffset: -2,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: isActive ? 10 : 6,
                  height: isActive ? 10 : 6,
                  borderRadius: "50%",
                  background: isActive ? C.primeBlue : C.text25,
                  transition: "width 0.25s ease-out, height 0.25s ease-out, background 0.25s ease-out, box-shadow 0.25s ease-out",
                  boxShadow: isActive
                    ? `0 0 8px oklch(0.62 0.20 252 / 0.5)`
                    : "none",
                }}
              />
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      style={{
        position: "fixed",
        right: 24,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s",
      }}
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 0",
              transition: "opacity 0.2s ease-out",
            }}
          >
            <span
              style={{
                fontFamily: "var(--f-display-en)",
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: isActive ? C.primeBlue : C.text25,
                opacity: isActive ? 1 : 0.7,
                transform: isActive ? "translateX(0)" : "translateX(4px)",
                transition: "color 0.2s ease-out, opacity 0.2s ease-out, transform 0.2s ease-out",
              }}
            >
              {s.en}
            </span>
            <div
              style={{
                width: isActive ? 20 : 12,
                height: 1.5,
                background: isActive ? C.primeBlue : C.text15,
                borderRadius: 1,
                transition: "width 0.2s ease-out, background 0.2s ease-out, box-shadow 0.2s ease-out",
                boxShadow: isActive
                  ? `0 0 6px oklch(0.62 0.20 252 / 0.4)`
                  : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
