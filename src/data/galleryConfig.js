import C from "../styles/tokens";

export const CHAR_CODES = [
  { code: "SY", name: "서윤" }, { code: "NHR", name: "나하린" },
  { code: "JSH", name: "진시혁" }, { code: "ERK", name: "에리카" },
  { code: "LSH", name: "이서하" }, { code: "HSR", name: "한소리" },
  { code: "KHR", name: "강하람" }, { code: "JGR", name: "장그루" },
  { code: "MIL", name: "밀라" }, { code: "ELA", name: "엘라" },
  { code: "MMR", name: "미모리" }, { code: "HSE", name: "하시은" },
  { code: "NIA", name: "니아" }, { code: "RAY", name: "레이" },
  { code: "LPS", name: "라피스" },
  { code: "SIA", name: "시아" }, { code: "NOA", name: "노아" },
];

export const SCENE_CATEGORIES = [
  { label: "감정", en: "Emotion", range: "1–9", count: 9, accent: C.gold },
  { label: "일상", en: "Daily", range: "10–18", count: 9, accent: C.distMid },
  { label: "NSFW", en: "추가 예정!", range: "20–69", count: "추가 예정!", accent: C.distHype },
  { label: "착의", en: "추가 예정!", range: "70–86", count: "추가 예정!", accent: C.distHype },
  { label: "확장", en: "Extended", range: "87–92", count: 6, accent: C.distHype },
  { label: "무대", en: "Stage", range: "93–96", count: 4, accent: C.distMid },
  { label: "SVG", en: "Live UI", range: "10종", count: "10 templates", accent: C.blue },
];
