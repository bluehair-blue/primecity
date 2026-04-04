// ─── CDN Image Utilities ──────────────────────────────────────
// 이미지 에셋 업데이트 시 ASSET_VERSION을 올리면
// 브라우저 + CDN 캐시가 자동으로 갱신됩니다.

const CDN_BASE = "https://img.bluehair.blue/ent";
const ASSET_VERSION = 5;

export function cdnUrl(path) {
  return `${CDN_BASE}/${path}?v=${ASSET_VERSION}`;
}

// ── 상황코드 → 숫자 매핑 (챗봇 프롬프트 기준) ──
// CDN 파일명: {cdnId}/{숫자}.webp
export const SCENE_CODE_MAP = {
  // 감정 (1-8)
  angry: 1, contempt: 2, happy: 3, sad: 4, shy: 5, smirk: 6, surprised: 7, troubled: 8,
  // 사이트 전용 (감정 확장)
  neutral: 9,
  // 일상 (10-18)
  "normal-chat": 10, "undressing-seduction": 11, drinking: 12, "dining-chat": 13,
  "cafe-chat": 14, "cinema-chat": 15, "christmas-date": 16, wedding: 17, pregnant: 18,
  // 비삽입 (20-42)
  cunnilingus: 20, kiss: 21, "nude-kiss": 22, "breast-grope": 23, "breast-sucking": 24,
  fingering: 25, "fingering-climax": 26, "ass-spanking": 27, "ass-grabbing": 28,
  paizuri: 29, "paizuri-cum": 30, "fellatio-pov": 31, "fellatio-climax-pov": 32,
  "fellatio-3rd-person": 33, "fellatio-climax-3rd-person": 34,
  deepthroat: 35, "deepthroat-climax": 36, handjob: 37, "handjob-cum": 38,
  rimjob: 39, "rimjob-cum": 40, footjob: 41, "footjob-cum": 42,
  // 삽입 (50-67)
  "nude-conversation": 50, "missionary-sex": 51, "missionary-climax": 52,
  "doggystyle-sex": 53, "doggystyle-climax": 54, "cowgirl-sex": 55, "cowgirl-climax": 56,
  "spooning-sex": 57, "spooning-climax": 58, "full-nelson": 59, "full-nelson-climax": 60,
  "anal-sex": 61, "anal-sex-cum": 62, "after-sex": 63, "facial-cum": 64,
  "pregnant-sex": 65, "pregnant-sex-cum": 66, "pregnant-after-sex": 67,
  // 착의-침실 (70-78)
  "clothed-missionary-sex-bedroom": 70, "clothed-missionary-climax-bedroom": 71,
  "clothed-full-nelson-bedroom": 72, "clothed-full-nelson-climax-bedroom": 73,
  "clothed-cowgirl-sex": 74, "clothed-cowgirl-climax": 75,
  "clothed-fellatio-bedroom": 76, "clothed-fellatio-climax-bedroom": 77,
  "clothed-after-sex-bedroom": 78,
  // 착의-화장실 (80-86)
  "clothed-doggystyle-sex-toilet": 80, "clothed-doggystyle-climax-toilet": 81,
  "clothed-full-nelson-toilet": 82, "clothed-full-nelson-climax-toilet": 83,
  "clothed-fellatio-toilet": 84, "clothed-fellatio-climax-toilet": 85,
  "clothed-after-sex-toilet": 86,
};

// 표정/상황 에셋 경로: cdnExprUrl("SY", "happy") → ".../SY/3.webp?v=1"
export function cdnExprUrl(charId, sceneCode) {
  const num = SCENE_CODE_MAP[sceneCode];
  if (num === undefined) {
    // fallback: 직접 숫자가 들어온 경우
    return `${CDN_BASE}/${charId}/${sceneCode}.webp?v=${ASSET_VERSION}`;
  }
  return `${CDN_BASE}/${charId}/${num}.webp?v=${ASSET_VERSION}`;
}

// 감정 표현 키 (사이트에서 사용하는 9종)
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
