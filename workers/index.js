const ALLOWED_CTAS = new Set(["start_chatbot", "copy_prompt", "refine_ai"]);

// See docs/persona-forge.md: this Worker records aggregate CTA analytics only.
function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

function sanitizeText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function readJsonBody(request) {
  const body = await request.text();
  if (body.length > 4096) throw new Error("payload_too_large");
  return JSON.parse(body || "{}");
}

function normalizeCtaEvent(payload) {
  const clickedCta = sanitizeText(payload.clicked_cta, 40);
  if (!ALLOWED_CTAS.has(clickedCta)) throw new Error("invalid_cta");

  return {
    scenarioId: sanitizeText(payload.scenario_id, 80) || "unknown",
    targetCharacter: sanitizeText(payload.selected_target_character, 80) || "unknown",
    finalArchetype: sanitizeText(payload.final_archetype, 80) || "unknown",
    clickedCta,
    createdAt: new Date().toISOString(),
  };
}

function hasSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function insertCtaEvent(db, event) {
  await db
    .prepare(
      `INSERT INTO persona_cyoa_events
        (scenario_id, selected_target_character, final_archetype, clicked_cta, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      event.scenarioId,
      event.targetCharacter,
      event.finalArchetype,
      event.clickedCta,
      event.createdAt
    )
    .run();
}

async function handlePersonaCta(request, env, ctx) {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, { status: 405 });
  if (!hasSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, { status: 403 });
  if (!env.DB) return json({ ok: false, error: "telemetry_unavailable" }, { status: 503 });

  try {
    const event = normalizeCtaEvent(await readJsonBody(request));
    ctx.waitUntil(insertCtaEvent(env.DB, event).catch((error) => console.error("persona_cyoa_telemetry_failed", error)));
    return json({ ok: true }, { status: 202 });
  } catch (error) {
    const knownError = error instanceof Error ? error.message : "bad_request";
    return json({ ok: false, error: knownError }, { status: 400 });
  }
}

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/persona-cyoa/cta") {
      return handlePersonaCta(request, env, ctx);
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  },
};
