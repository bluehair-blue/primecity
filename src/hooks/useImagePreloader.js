import { useEffect, useState } from "react";

/**
 * Preloads a list of image URLs and tracks loading progress.
 *
 * @param {string[]} urls - Image URLs to preload
 * @param {object} opts
 * @param {number} opts.timeoutMs - Optional timeout (0 = no timeout). Returns ready=true when timeout hits regardless of loaded count, with timedOut=true.
 * @returns {{ loaded: number, total: number, ready: boolean, progress: number, timedOut: boolean }}
 */
export function useImagePreloader(urls, opts = {}) {
  const { timeoutMs = 0 } = opts;
  const [loaded, setLoaded] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // Stringify urls to detect genuine changes (arrays referentially unstable)
  const key = JSON.stringify(urls || []);

  useEffect(() => {
    const list = urls || [];
    if (list.length === 0) {
      setLoaded(0);
      setTimedOut(false);
      return;
    }
    let alive = true;
    setLoaded(0);
    setTimedOut(false);

    let count = 0;
    list.forEach((url) => {
      const img = new Image();
      const done = () => {
        if (!alive) return;
        count++;
        setLoaded(count);
      };
      img.onload = done;
      img.onerror = done; // count errors as "done" to avoid blocking forever
      img.src = url;
    });

    let timer = null;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        if (!alive) return;
        setTimedOut(true);
      }, timeoutMs);
    }

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [key, timeoutMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = (urls || []).length;
  const ready = total === 0 || loaded >= total || timedOut;
  const progress = total === 0 ? 1 : Math.min(loaded / total, 1);

  return { loaded, total, ready, progress, timedOut };
}
