import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════════════════════════
   useCharLightbox — Lightbox state + popstate/ESC handling
   ------------------------------------------------------------
   open(item):  pushState → setLightbox
   close():     history.back() → popstate triggers close via flag
   ESC:         same as close()
   Browser back: popstate auto-closes (without extra back() call)
   ══════════════════════════════════════════════════════════ */
export default function useCharLightbox() {
  const [lightbox, setLightbox] = useState(null);
  const closedByButton = useRef(false);

  // popstate: pushState on open, browser back → close lightbox
  useEffect(() => {
    if (!lightbox) return;
    closedByButton.current = false;
    window.history.pushState({ lightbox: true }, "");
    function onPop() {
      if (!closedByButton.current) setLightbox(null);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [!!lightbox]);

  // ESC key
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  function close() {
    closedByButton.current = true;
    setLightbox(null);
    window.history.back();
  }

  return { lightbox, setLightbox, close };
}
