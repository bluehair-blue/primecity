// ── SVG Template Helpers ──
// ESCAPE CONTRACT: 마크업 조합 변수 → raw ${}, 리프 텍스트(URL param) → escapeXml()
// Preview/runtime asymmetry is intentional: this site helper rejects data: images,
// while deployed Workers may inline images as data URIs for EdenChat <img> rendering.

export function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export const TEMPLATE_CATEGORIES = {
  ALL: "전체",
  SNS: "SNS",
  BROADCAST: "방송",
  UTILITY: "유틸리티",
};

// ── CDN asset mapping: char code → image URLs ──
const SVG_CDN = "https://img.bluehair.blue/ent";
export function charAssets(code) {
  if (!code) return {};
  return {
    avatar: `${SVG_CDN}/${code}/svg/avatar.webp`,
    post:   `${SVG_CDN}/${code}/svg/post.webp`,
    stream: `${SVG_CDN}/${code}/svg/stream.webp`,
    news:   `${SVG_CDN}/${code}/svg/news.webp`,
  };
}

// ── Safe image URL helper ──
export function safeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch (e) {}
  return null;
}

// ── Schedule TYPE_COLORS + typeColor ──
// SYNC: Keep in sync with workers/svg-schedule.js
export const TYPE_COLORS = {
  broadcast: "#d46b8a",
  photo:     "#b07ad4",
  practice:  "#6db87a",
  event:     "#c9a84c",
  meeting:   "#7ba0d4",
  rest:      "#555",
};
export function typeColor(t) { return TYPE_COLORS[t] || "#888"; }

// ── Post body word-wrap helper ──
// SYNC: Keep in sync with workers/svg-post.js
export function wrapBodyPost(text, maxChars, maxLines) {
  if (!text) return [];
  const paragraphs = String(text).split(/\\n|\n/);
  const lines = [];
  for (const para of paragraphs) {
    if (para === "") { lines.push(""); continue; }
    let cur = "";
    for (const ch of para) {
      cur += ch;
      if (cur.length >= maxChars) { lines.push(cur); cur = ""; }
    }
    if (cur) lines.push(cur);
    if (lines.length >= maxLines) break;
  }
  return lines.slice(0, maxLines);
}
