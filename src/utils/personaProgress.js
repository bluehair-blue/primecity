import { buildRefinePayload, compilePersonaPrompt, getFinalArchetype, wrapPersonaPrompt } from "./personaCompiler";
import { PERSONA_STRING_LIMITS, sanitizePersonaInput } from "./personaSchema";

const DRAFT_PREFIX = "personaDraft:";
const REFINE_PREFIX = "personaRefine:";
const DRAFT_ID_RE = /^persona-[a-z0-9-]+$/i;

export function createPersonaDraftId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return `persona-${cryptoApi.randomUUID()}`;
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    return `persona-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }
  return `persona-${Date.now().toString(36)}`;
}

export function savePersonaDraft({ scenario, playerName, build, stats }) {
  const safePlayerName = sanitizePersonaInput(playerName, PERSONA_STRING_LIMITS.playerName) || "이름 미정";
  const prompt = compilePersonaPrompt({ scenario, playerName: safePlayerName, build, stats });
  const draftId = createPersonaDraftId();
  const payload = {
    draftId,
    scenarioId: scenario?.id || "unknown",
    scenarioTitle: scenario?.title || "Persona Forge",
    playerName: safePlayerName,
    targetCharacter: build?.targetCharacter || "",
    targetCharacterLabel: build?.targetCharacterLabel || "",
    finalArchetype: getFinalArchetype(stats, build),
    build,
    stats,
    prompt: wrapPersonaPrompt(prompt),
    openingLine: build?.openingLines?.[0] || "",
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(`${DRAFT_PREFIX}${draftId}`, JSON.stringify(payload));
  return payload;
}

export function savePersonaRefinePayload({ scenario, playerName, build, stats }) {
  const safePlayerName = sanitizePersonaInput(playerName, PERSONA_STRING_LIMITS.playerName) || "이름 미정";
  const prompt = compilePersonaPrompt({ scenario, playerName: safePlayerName, build, stats });
  const draft = savePersonaDraft({ scenario, playerName: safePlayerName, build, stats });
  const refinePayload = buildRefinePayload({ scenario, playerName: safePlayerName, build, stats, prompt });
  localStorage.setItem(`${REFINE_PREFIX}${draft.draftId}`, JSON.stringify(refinePayload));
  return { draft, refinePayload };
}

export function readPersonaDraftFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const draftId = params.get("personaDraft");
  if (!draftId || !DRAFT_ID_RE.test(draftId)) return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${draftId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readPersonaRefineFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const draftId = params.get("personaDraft");
  if (!draftId || !DRAFT_ID_RE.test(draftId)) return null;
  try {
    const raw = localStorage.getItem(`${REFINE_PREFIX}${draftId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function postPersonaCtaTelemetry(event) {
  return fetch("/api/persona-cyoa/cta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario_id: event.scenarioId,
      selected_target_character: event.targetCharacter,
      final_archetype: event.finalArchetype,
      clicked_cta: event.clickedCta,
    }),
  }).catch(() => null);
}
