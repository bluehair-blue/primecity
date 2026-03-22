import { cdnUrl, cdnExprUrl, EXPRESSION_KEYS } from "../utils/cdn";
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

// ── City background items (실제 이미지 존재) ──
const cityItems = [
  { src: cdnUrl("bg3.png"), caption: "프라임시티 전경 I", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg4.png"), caption: "프라임시티 전경 II", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg5.png"), caption: "프라임시티 전경 III", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg6.png"), caption: "더 코어", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg7.png"), caption: "미들 링", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg8.png"), caption: "하입 로드", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg9.png"), caption: "테라스", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg10.png"), caption: "야경", category: CATEGORIES.CITY, tags: [], isNsfw: false },
  { src: cdnUrl("bg11.png"), caption: "스카이라인", category: CATEGORIES.CITY, tags: [], isNsfw: false },
];

// ── Character expression items (구조만 — 이미지 미업로드) ──
// 이미지가 CDN에 업로드되면 자동으로 표시됩니다.
function generateExpressionItems(char) {
  return EXPRESSION_KEYS.map((key) => ({
    src: cdnExprUrl(char.cdnId, key),
    caption: `${char.name} — ${key}`,
    category: CATEGORIES.CHARACTER,
    tags: [CHARACTER_TAGS.EXPRESSION],
    isNsfw: false,
    characterId: char.id,
    characterName: char.name,
    expressionKey: key,
  }));
}

// 이미지가 있는 캐릭터만 갤러리에 표정 아이템 생성
const charsWithImages = characters.filter((c) => c.image && !c.image.includes("/assets/"));
const characterExpressionItems = charsWithImages.flatMap(generateExpressionItems);

// ── Combined gallery data ──
export const galleryItems = [...cityItems, ...characterExpressionItems];
