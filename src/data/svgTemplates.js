// ── SVG Templates — slim re-export ──
// Source split into:
//   src/data/svgTemplates/helpers.js           — escapeXml, charAssets, safeImageUrl, TYPE_COLORS, typeColor, wrapBodyPost
//   src/data/svgTemplates/templates-sns.js     — generateSnsPost, generateTweet, generateMessenger
//   src/data/svgTemplates/templates-broadcast.js — generateLivestream, generateNews, generateTablet, generateSchedule
//   src/data/svgTemplates/templates-utility.js — generateChart, generateCommunity, generatePost

export { TEMPLATE_CATEGORIES } from "./svgTemplates/helpers.js";
import { snsSvgTemplates } from "./svgTemplates/templates-sns.js";
import { broadcastSvgTemplates } from "./svgTemplates/templates-broadcast.js";
import { utilitySvgTemplates } from "./svgTemplates/templates-utility.js";

export const svgTemplates = [
  ...snsSvgTemplates,
  ...broadcastSvgTemplates,
  ...utilitySvgTemplates,
];
