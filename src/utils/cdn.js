// ─── CDN Image Utilities ──────────────────────────────────────
// 이미지 에셋 업데이트 시 ASSET_VERSION을 올리면
// 브라우저 + CDN 캐시가 자동으로 갱신됩니다.

const CDN_BASE = "https://img.bluehair.blue/ent";
const ASSET_VERSION = 1;

export function cdnUrl(path) {
  return `${CDN_BASE}/${path}?v=${ASSET_VERSION}`;
}

export default CDN_BASE;
