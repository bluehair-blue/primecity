// ─── CDN Image Utilities ──────────────────────────────────────
// 이미지 에셋 업데이트 시 ASSET_VERSION을 올리면
// 브라우저 + CDN 캐시가 자동으로 갱신됩니다.

const CDN_BASE = "https://img.bluehair.blue/ent";
const ASSET_VERSION = 1;

export function cdnUrl(path) {
  return `${CDN_BASE}/${path}?v=${ASSET_VERSION}`;
}

// 표정 에셋 경로: cdnExprUrl("SY", "happy") → ".../SY/happy.png?v=1"
export function cdnExprUrl(charId, expression) {
  return `${CDN_BASE}/${charId}/${expression}.png?v=${ASSET_VERSION}`;
}

// 추후 확장 가능 (Expandable — add new keys as assets are created)
export const EXPRESSION_KEYS = [
  "contempt", "troubled", "neutral", "surprised",
  "shy", "smirk", "sad", "happy", "angry",
];

export const EXPRESSION_LABELS = {
  contempt: "경멸",
  troubled: "곤란한",
  neutral: "기본",
  surprised: "놀람",
  shy: "부끄러운",
  smirk: "비웃음",
  sad: "슬픈",
  happy: "웃음",
  angry: "화남",
};

export default CDN_BASE;
