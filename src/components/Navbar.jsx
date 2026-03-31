import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import C from "../styles/tokens";

export default function Navbar({ scrolled, isMobile }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { label: "소개", href: "/#intro" },
    { label: "캐릭터", href: "/#characters" },
    { label: "세계관", href: "/#world" },
    { label: "갤러리", href: "/gallery", route: true },
    { label: "더 알아보기", href: "/#explore" },
    { label: "문의", href: "/contact", route: true },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  function handleAnchorClick(e, href, extraOnClick) {
    e.preventDefault();
    const hash = href.replace("/", "");
    if (extraOnClick) extraOnClick();

    if (location.pathname === "/") {
      // Already on home — just scroll
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home, then scroll after mount
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  function renderLink(l, style, onClick) {
    if (l.route) {
      return (
        <Link
          key={l.href}
          to={l.href}
          onClick={onClick}
          style={style}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primeBlue)}
          onMouseLeave={(e) => (e.currentTarget.style.color = style.color)}
        >
          {l.label}
        </Link>
      );
    }
    return (
      <a
        key={l.href}
        href={l.href}
        onClick={(e) => handleAnchorClick(e, l.href, onClick)}
        style={style}
        onMouseEnter={(e) => (e.target.style.color = C.primeBlue)}
        onMouseLeave={(e) => (e.target.style.color = style.color)}
      >
        {l.label}
      </a>
    );
  }

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: isMobile ? "0 20px" : "0 48px",
          height: isMobile ? 56 : 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled || open ? C.bgOverlay : "transparent",
          backdropFilter: scrolled || open ? "blur(20px)" : "none",
          borderBottom:
            scrolled || open
              ? `1px solid ${C.border10}`
              : "1px solid transparent",
          transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
          fontFamily: "var(--f-body)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.55 0.12 80) 100%)`,
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
          <span
            style={{
              fontSize: isMobile ? 13 : 15,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: C.gold,
              textTransform: "uppercase",
              fontFamily: "var(--f-display-en)",
            }}
          >
            Prime City
          </span>
        </Link>

        {!isMobile && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {links.map((l) =>
              renderLink(l, {
                color: C.text45,
                fontSize: 13,
                letterSpacing: "0.08em",
                textDecoration: "none",
                transition: "color 0.3s",
              })
            )}
            <button
              style={{
                padding: "7px 22px",
                background: "transparent",
                border: `1px solid ${C.goldMuted}`,
                color: C.gold,
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "var(--f-body)",
                fontWeight: 500,
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.background = C.primeBlueDim)}
              onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
              }
            >
              플레이
            </button>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setOpen(!open)}
            aria-label="메뉴"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              zIndex: 110,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 20,
                  height: 1.5,
                  background: C.gold,
                  transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                  transform: open
                    ? i === 0
                      ? "rotate(45deg) translate(4.5px,4.5px)"
                      : i === 2
                        ? "rotate(-45deg) translate(4.5px,-4.5px)"
                        : "none"
                    : "none",
                  opacity: open && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        )}
      </nav>

      {/* Mobile overlay menu */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "oklch(0.06 0.01 280 / 0.97)",
            backdropFilter: "blur(30px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {links.map((l, i) =>
            renderLink(
              l,
              {
                color: C.text70,
                fontSize: 17,
                letterSpacing: "0.2em",
                textDecoration: "none",
                fontFamily: "var(--f-body)",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.07}s`,
              },
              () => setOpen(false)
            )
          )}
          <div
            style={{ width: 36, height: 1, background: C.goldText }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{
              padding: "11px 32px",
              background: `linear-gradient(135deg, ${C.gold} 0%, oklch(0.65 0.12 75) 100%)`,
              border: "none",
              color: C.black,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--f-body)",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(16px)",
              transition:
                "all 0.5s cubic-bezier(0.22,1,0.36,1) 0.35s",
            }}
          >
            플레이
          </button>
        </div>
      )}
    </>
  );
}
