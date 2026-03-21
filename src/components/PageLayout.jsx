import { useState, useEffect } from "react";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import Particles from "./Particles";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageLayout({ children }) {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      <main
        style={{
          position: "relative",
          zIndex: 2,
          padding: isMobile ? "80px 24px 48px" : "120px 48px 80px",
        }}
      >
        {typeof children === "function" ? children({ isMobile }) : children}
      </main>
      <Footer isMobile={isMobile} />
    </div>
  );
}
