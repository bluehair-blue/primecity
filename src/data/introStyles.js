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
    duration: 8800,   // v4.1: comments(2700) + blur(400) + 3×zoom(3300) + hero(1600) + fadeOut(500) = 8500+300
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  fog: {
    duration: 7900,   // v6: 7400ms content + 500ms fadeOut (EM signal + flash zoom + contain reveal)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
    fogLayers: 0,    // v6: fog 폐기. 전자기 노이즈(SVG turbulence) + scanlines + crackle bars 로 교체
  },
  wind: {
    duration: 9800,   // v2: 9000ms content + 800ms fadeOut (여유 확보 + flash 전환)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  cardDeal: {
    duration: 3600,   // 3200ms content + 400ms fadeOut
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
    perspective: 1200,
  },
  pageFlip: {
    duration: 8100,   // 7400ms content + 700ms fadeOut (page-sweep reveal)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  embrace: {
    duration: 7000,   // 6500ms content + 500ms fadeOut (warm bloom → gentle zoom)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  neon: {
    duration: 7300,   // 6800ms content + 500ms fadeOut (neon ring → notification pop)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
  silence: {
    duration: 6700,   // 6200ms content + 500ms fadeOut (slit reveal)
    letterbox: false,
    requiresSvgFilter: false,
    mobileFallback: null,
  },
};

/**
 * Per-character preload budget override.
 * MMR previously needed 1200ms but v4.1 comment-stream phase (2700ms)
 * absorbs animated WebP decode time → standard 500ms is sufficient.
 */
export const PRELOAD_BUDGET_OVERRIDE = {};

export const DEFAULT_PRELOAD_BUDGET = 500;
