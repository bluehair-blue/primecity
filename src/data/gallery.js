import { cdnUrl, cdnExprUrl, EXPRESSION_KEYS, SCENE_CODE_MAP } from "../utils/cdn";
import { characters } from "./characters";

// ── Gallery Categories ──
export const CATEGORIES = {
  ALL: "all",
  CITY: "city",
  CHARACTER: "character",
};

export const CHARACTER_TAGS = {
  EXPRESSION: "감정표현",
  DAILY: "일상",
  CONCEPT: "컨셉아트",
  NSFW: "NSFW",
};

// ── Situation Code DB (챗봇 이미지 출력 규칙 기반) ──
// 경로: cdnExprUrl(cdnId, code) → ent/{cdnId}/{code}.webp

const DAILY_CODES = [
  { code: "normal-chat", label: "일상 대화" },
  { code: "undressing-seduction", label: "유혹" },
  { code: "drinking", label: "음주" },
  { code: "dining-chat", label: "식사 대화" },
  { code: "cafe-chat", label: "카페 대화" },
  { code: "cinema-chat", label: "영화관 대화" },
  { code: "christmas-date", label: "크리스마스 데이트" },
  { code: "wedding", label: "웨딩" },
  { code: "pregnant", label: "임신" },
];

const NSFW_CODES = [
  // 비삽입
  { code: "cunnilingus", label: "커닐링구스" },
  { code: "kiss", label: "키스" },
  { code: "nude-kiss", label: "누드 키스" },
  { code: "breast-grope", label: "가슴 애무" },
  { code: "breast-sucking", label: "가슴 빨기" },
  { code: "fingering", label: "핑거링" },
  { code: "fingering-climax", label: "핑거링 절정" },
  { code: "ass-spanking", label: "엉덩이 스팽킹" },
  { code: "ass-grabbing", label: "엉덩이 잡기" },
  { code: "paizuri", label: "파이즈리" },
  { code: "paizuri-cum", label: "파이즈리 사정" },
  { code: "fellatio-pov", label: "펠라치오 (1인칭)" },
  { code: "fellatio-climax-pov", label: "펠라치오 절정 (1인칭)" },
  { code: "fellatio-3rd-person", label: "펠라치오 (3인칭)" },
  { code: "fellatio-climax-3rd-person", label: "펠라치오 절정 (3인칭)" },
  { code: "deepthroat", label: "딥스롯" },
  { code: "deepthroat-climax", label: "딥스롯 절정" },
  { code: "handjob", label: "핸드잡" },
  { code: "handjob-cum", label: "핸드잡 사정" },
  { code: "rimjob", label: "림잡" },
  { code: "rimjob-cum", label: "림잡 사정" },
  { code: "footjob", label: "풋잡" },
  { code: "footjob-cum", label: "풋잡 사정" },
  // 삽입
  { code: "nude-conversation", label: "누드 대화" },
  { code: "missionary-sex", label: "정상위" },
  { code: "missionary-climax", label: "정상위 절정" },
  { code: "doggystyle-sex", label: "후배위" },
  { code: "doggystyle-climax", label: "후배위 절정" },
  { code: "cowgirl-sex", label: "기승위" },
  { code: "cowgirl-climax", label: "기승위 절정" },
  { code: "spooning-sex", label: "측위" },
  { code: "spooning-climax", label: "측위 절정" },
  { code: "full-nelson", label: "풀넬슨" },
  { code: "full-nelson-climax", label: "풀넬슨 절정" },
  { code: "anal-sex", label: "애널" },
  { code: "anal-sex-cum", label: "애널 사정" },
  { code: "after-sex", label: "사후" },
  { code: "facial-cum", label: "안면 사정" },
  { code: "pregnant-sex", label: "임신 중 성행위" },
  { code: "pregnant-sex-cum", label: "임신 중 사정" },
  { code: "pregnant-after-sex", label: "임신 중 사후" },
  // 착의-침실
  { code: "clothed-missionary-sex-bedroom", label: "착의 정상위 (침실)" },
  { code: "clothed-missionary-climax-bedroom", label: "착의 정상위 절정 (침실)" },
  { code: "clothed-full-nelson-bedroom", label: "착의 풀넬슨 (침실)" },
  { code: "clothed-full-nelson-climax-bedroom", label: "착의 풀넬슨 절정 (침실)" },
  { code: "clothed-cowgirl-sex", label: "착의 기승위" },
  { code: "clothed-cowgirl-climax", label: "착의 기승위 절정" },
  { code: "clothed-fellatio-bedroom", label: "착의 펠라치오 (침실)" },
  { code: "clothed-fellatio-climax-bedroom", label: "착의 펠라치오 절정 (침실)" },
  { code: "clothed-after-sex-bedroom", label: "착의 사후 (침실)" },
  // 착의-화장실
  { code: "clothed-doggystyle-sex-toilet", label: "착의 후배위 (화장실)" },
  { code: "clothed-doggystyle-climax-toilet", label: "착의 후배위 절정 (화장실)" },
  { code: "clothed-full-nelson-toilet", label: "착의 풀넬슨 (화장실)" },
  { code: "clothed-full-nelson-climax-toilet", label: "착의 풀넬슨 절정 (화장실)" },
  { code: "clothed-fellatio-toilet", label: "착의 펠라치오 (화장실)" },
  { code: "clothed-fellatio-climax-toilet", label: "착의 펠라치오 절정 (화장실)" },
  { code: "clothed-after-sex-toilet", label: "착의 사후 (화장실)" },
];

// ── City background items ──
const cityItems = [
  { src: cdnUrl("bg3.webp"), caption: "프라임시티 전경 I", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg4.webp"), caption: "프라임시티 전경 II", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg5.webp"), caption: "프라임시티 전경 III", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg6.webp"), caption: "더 코어", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg7.webp"), caption: "미들 링", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg8.webp"), caption: "하입 로드", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg9.webp"), caption: "테라스", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg10.webp"), caption: "야경", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg11.webp"), caption: "스카이라인", category: CATEGORIES.CITY, tags: [], isNsfw: false },
];

// ── Character items generator ──
function generateCharItems(char) {
  const items = [];

  // 감정표현 (EXPRESSION_KEYS from cdn.js)
  EXPRESSION_KEYS.forEach((key) => {
    items.push({
      src: cdnExprUrl(char.cdnId, key),
      caption: `${char.name} — ${key}`,
      sceneNum: SCENE_CODE_MAP[key],
      category: CATEGORIES.CHARACTER,
      tags: [CHARACTER_TAGS.EXPRESSION],
      isNsfw: false,
      characterId: char.id,
      characterName: char.name,
    });
  });

  // JSH: 감정표현만 허용 (긴급패치)
  if (char.cdnId === "JSH") return items;

  // 일상
  DAILY_CODES.forEach(({ code, label }) => {
    items.push({
      src: cdnExprUrl(char.cdnId, code),
      caption: `${char.name} — ${label}`,
      sceneNum: SCENE_CODE_MAP[code],
      category: CATEGORIES.CHARACTER,
      tags: [CHARACTER_TAGS.DAILY],
      isNsfw: false,
      characterId: char.id,
      characterName: char.name,
    });
  });

  // NSFW
  NSFW_CODES.forEach(({ code, label }) => {
    items.push({
      src: cdnExprUrl(char.cdnId, code),
      caption: `${char.name} — ${label}`,
      sceneNum: SCENE_CODE_MAP[code],
      category: CATEGORIES.CHARACTER,
      tags: [CHARACTER_TAGS.NSFW],
      isNsfw: true,
      characterId: char.id,
      characterName: char.name,
    });
  });

  return items;
}

// 전체 캐릭터 아이템 생성 (이미지 미업로드 시 Gallery에서 imgErrors로 처리)
const characterItems = characters.flatMap(generateCharItems);

// ── Combined gallery data ──
export const galleryItems = [...cityItems, ...characterItems];
