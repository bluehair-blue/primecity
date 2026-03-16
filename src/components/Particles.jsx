import { useRef, useEffect } from "react";

export default function Particles({ isMobile }) {
  const ref = useRef(null);
  const anim = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height =
      document.documentElement.scrollHeight || window.innerHeight * 5);
    const N = isMobile ? 35 : 80;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.1 - 0.06,
      o: Math.random() * 0.45 + 0.08,
      p: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.dx;
        p.y += p.dy;
        p.p += 0.005;
        const a = p.o * (0.5 + Math.sin(p.p) * 0.5);
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.76 0.12 80 / ${a})`;
        ctx.fill();
      }
      anim.current = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height =
        document.documentElement.scrollHeight || window.innerHeight * 5;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(anim.current);
      window.removeEventListener("resize", onResize);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.5,
      }}
    />
  );
}
