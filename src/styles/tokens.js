// ─── OKLCH Color Tokens ─────────────────────────────────────────
const C = {
  // Backgrounds (hue 265: cool navy shift)
  bgDeep:    "oklch(0.08 0.01 265)",
  bgCard:    "oklch(0.12 0.005 265 / 0.4)",
  bgOverlay: "oklch(0.06 0.01 265 / 0.92)",

  // Gold / Amber (primary accent — brand, labels, titles)
  gold:      "oklch(0.76 0.12 80)",
  goldMuted: "oklch(0.76 0.12 80 / 0.4)",
  goldDim:   "oklch(0.76 0.12 80 / 0.15)",
  goldGlow:  "oklch(0.76 0.12 80 / 0.2)",
  goldText:  "oklch(0.76 0.12 80 / 0.35)",

  // Electric Blue (secondary accent — system, interactive, atmosphere)
  primeBlue:      "oklch(0.62 0.20 252)",
  primeBlueMuted: "oklch(0.62 0.20 252 / 0.4)",
  primeBlueDim:   "oklch(0.62 0.20 252 / 0.15)",
  primeBlueGlow:  "oklch(0.62 0.20 252 / 0.25)",
  blueDeep:       "oklch(0.18 0.06 255)",

  // White / Text
  white:     "oklch(1.0 0 0)",
  text90:    "oklch(1.0 0 0 / 0.9)",
  text70:    "oklch(1.0 0 0 / 0.7)",
  text55:    "oklch(1.0 0 0 / 0.55)",
  text45:    "oklch(1.0 0 0 / 0.45)",
  text35:    "oklch(1.0 0 0 / 0.35)",
  text25:    "oklch(1.0 0 0 / 0.25)",
  text15:    "oklch(1.0 0 0 / 0.15)",

  // Border (gold-based, unchanged)
  border10:  "oklch(0.76 0.12 80 / 0.10)",
  border06:  "oklch(0.76 0.12 80 / 0.06)",
  border05:  "oklch(0.76 0.12 80 / 0.05)",

  // Character accent colors
  charApex:  "oklch(0.76 0.12 80)",
  charNaha:  "oklch(0.72 0.10 310)",
  charJin:   "oklch(0.55 0.01 0)",
  charEri:   "oklch(0.72 0.10 170)",
  charSeo:   "oklch(0.70 0.10 240)",
  charHan:   "oklch(0.72 0.12 55)",
  charHaram: "oklch(0.65 0.12 20)",
  charGru:   "oklch(0.72 0.10 300)",
  charMila:  "oklch(0.72 0.12 65)",
  charElla:  "oklch(0.65 0.12 15)",
  charMimori:"oklch(0.72 0.10 220)",
  charSieun: "oklch(0.72 0.10 85)",
  charNia:   "oklch(0.65 0.10 200)",
  charRay:   "oklch(0.72 0.10 290)",
  charLapis: "oklch(0.60 0.12 260)",

  // District accent colors
  distCore:  "oklch(0.76 0.12 80)",
  distMid:   "oklch(0.65 0.10 240)",
  distHype:  "oklch(0.65 0.12 340)",
  distTer:   "oklch(0.65 0.10 140)",
  distIndustrial: "oklch(0.60 0.08 220)",

  // Utility
  black:     "oklch(0.08 0.01 265)",
};

export const PERSONA_FORGE_COLORS = {
  bgDeep: "oklch(12% 0.025 265)",
  bgPanel: "oklch(16% 0.035 265 / 0.82)",
  bgPanelSoft: "oklch(20% 0.04 265 / 0.58)",
  textWhite: "oklch(98% 0.006 95)",
  textSoft: "oklch(87% 0.018 90)",
  textMuted: "oklch(68% 0.018 90)",
  gold: "oklch(82% 0.14 82)",
  goldSoft: "oklch(82% 0.11 82 / 0.34)",
  cyan: "oklch(78% 0.12 215)",
  danger: "oklch(67% 0.18 28)",
};

export default C;
