/* ══════════════════════════════════════════════════════════
   INTRO_STYLE_CONFIG — CinematicCharDetail capability table
   ------------------------------------------------------------
   Character content (quotes, focus, etc) lives in characters.js.
   This file holds style representation settings only:
   duration, mobile fallback flags, letterbox, etc.
   ══════════════════════════════════════════════════════════ */

export const INTRO_STYLE_CONFIG = {
  cutaway: {
    duration: 6400,
    letterbox: true,   // v4: 상하 7% 레터박스 활성
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  sunrise: {
    duration: 4900,  // v4.2: camera concept (was 2500)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  glitch: {
    duration: 6100,   // v4.4: Beat2 extended to 1800ms + hero 1.4s (was 5300)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  ripple: {
    duration: 6000,   // v4.2: zoom 2-beat + ripple + 1s hero hold (was 3000)
    letterbox: false,
    requiresSvgFilter: true,
    mobileFallback: "simpleRipple",
  },
  flash: {
    duration: 2000,
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
    flashes: 3,
    commentOverlay: true,
    commentDuration: 900,
    commentRows: 5,
  },
  fog: {
    duration: 3500,
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
    fogLayers: 2,
  },
  cardDeal: {
    duration: 2000,
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
    perspective: 1200,
  },
  pageFlip: {
    duration: 2200,
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
    direction: "ltr",
  },
};

/**
 * Per-character preload budget override.
 * MMR's keyVisual is animated WebP (heavier) → extended budget.
 * Default budget is 500ms (in CinematicCharDetail), this map overrides
 * for specific character cdnIds.
 */
export const PRELOAD_BUDGET_OVERRIDE = {
  MMR: 1200,
};

export const DEFAULT_PRELOAD_BUDGET = 500;
