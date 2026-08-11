export const PERSONA_ALLOWED_SLOTS = [
  "appearance",
  "traits",
  "strengths",
  "flaws",
  "backstory",
  "startPoint",
  "targetCharacter",
  "targetCharacterLabel",
  "goals",
  "openingLines",
  "promptNotes",
  "tags",
];

export const PERSONA_SLOT_LABELS = {
  appearance: "외형",
  traits: "성격과 말투",
  strengths: "장점",
  flaws: "단점",
  backstory: "과거사",
  startPoint: "현재 시작점",
  targetCharacter: "주로 만날 캐릭터",
  goals: "반드시 완수해야 할 목표",
  openingLines: "첫 메시지 예시",
  promptNotes: "프롬프트 노트",
  tags: "태그",
};

export const PERSONA_ARRAY_SLOTS = [
  "appearance",
  "traits",
  "strengths",
  "flaws",
  "backstory",
  "startPoint",
  "goals",
  "openingLines",
  "promptNotes",
  "tags",
];

export const PERSONA_VECTOR_KEYS = [
  "mystery",
  "tension",
  "intimacy",
  "ambition",
  "empathy",
  "discipline",
  "spotlight",
];

export const PERSONA_STRING_LIMITS = {
  playerName: 40,
  slotText: 160,
  nodeText: 520,
  label: 96,
  description: 240,
  archetype: 80,
};

export function sanitizePersonaInput(value, maxLength = PERSONA_STRING_LIMITS.slotText) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
export function createEmptyPersonaBuild() {
  return {
    appearance: [],
    traits: [],
    strengths: [],
    flaws: [],
    backstory: [],
    startPoint: [],
    targetCharacter: "",
    targetCharacterLabel: "",
    goals: [],
    openingLines: [],
    promptNotes: [],
    tags: [],
  };
}

export function createEmptyPersonaStats() {
  const stats = {};
  for (const key of PERSONA_VECTOR_KEYS) stats[key] = 0;
  return stats;
}

export function isAllowedPersonaSlot(key) {
  return PERSONA_ALLOWED_SLOTS.includes(key);
}
