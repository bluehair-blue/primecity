import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PERSONA_ALLOWED_SLOTS,
  PERSONA_STRING_LIMITS,
  PERSONA_VECTOR_KEYS,
} from "../src/utils/personaSchema.js";
import { isSafePersonaAssetPath } from "../src/utils/assets.js";

// See docs/persona-forge.md for the scenario/compiler/storage contract this enforces.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const scenarioDir = path.join(repoRoot, "src", "data", "persona-cyoa");
const allowedSlots = new Set(PERSONA_ALLOWED_SLOTS);
const allowedVectorKeys = new Set(PERSONA_VECTOR_KEYS);
const VECTOR_LIMIT = 30;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function checkLength(errors, file, pointer, value, max) {
  if (typeof value !== "string") return;
  if (value.length > max) {
    errors.push(`${file}: ${pointer} is ${value.length} chars; max ${max}`);
  }
}

function checkImagePath(errors, file, pointer, value) {
  if (typeof value !== "string" || !value) return;
  if (!isSafePersonaAssetPath(value)) {
    errors.push(`${file}: ${pointer} must be a safe relative image path like /assets/scene.webp`);
  }
}

function validateAddObject(errors, file, pointer, add, characters) {
  if (!isPlainObject(add)) return;
  for (const [slot, value] of Object.entries(add)) {
    if (!allowedSlots.has(slot)) {
      errors.push(`${file}: ${pointer}.${slot} is not an allowed persona slot`);
      continue;
    }

    if (slot === "targetCharacter") {
      if (typeof value !== "string" || !characters[value]) {
        errors.push(`${file}: ${pointer}.targetCharacter "${value}" is not defined in characters`);
      }
      continue;
    }

    const values = Array.isArray(value) ? value : [value];
    for (const [index, item] of values.entries()) {
      if (typeof item !== "string") {
        errors.push(`${file}: ${pointer}.${slot}[${index}] must be a string`);
        continue;
      }
      checkLength(errors, file, `${pointer}.${slot}[${index}]`, item, PERSONA_STRING_LIMITS.slotText);
    }
  }
}

function validateVector(errors, file, pointer, vector) {
  if (vector === undefined) return;
  if (!isPlainObject(vector)) {
    errors.push(`${file}: ${pointer} must be an object`);
    return;
  }

  for (const [key, value] of Object.entries(vector)) {
    if (!allowedVectorKeys.has(key)) {
      errors.push(`${file}: ${pointer}.${key} is not an allowed vector key`);
      continue;
    }
    if (!Number.isFinite(value)) {
      errors.push(`${file}: ${pointer}.${key} must be a finite number`);
      continue;
    }
    if (Math.abs(value) > VECTOR_LIMIT) {
      errors.push(`${file}: ${pointer}.${key} must be between -${VECTOR_LIMIT} and ${VECTOR_LIMIT}`);
    }
  }
}

function reachableNodes(nodes, startNodeId) {
  const visited = new Set();
  const stack = [startNodeId];
  while (stack.length) {
    const nodeId = stack.pop();
    if (!nodeId || visited.has(nodeId)) continue;
    const node = nodes[nodeId];
    if (!node) continue;
    visited.add(nodeId);
    for (const choice of node.choices || []) {
      if (choice.next && !visited.has(choice.next)) stack.push(choice.next);
    }
  }
  return visited;
}

function validateScenario(file, scenario) {
  const errors = [];
  if (!isPlainObject(scenario)) return [`${file}: root must be an object`];

  const nodes = scenario.nodes;
  const characters = isPlainObject(scenario.characters) ? scenario.characters : {};
  if (!isPlainObject(nodes)) errors.push(`${file}: nodes must be an object`);
  if (!isPlainObject(scenario.characters)) errors.push(`${file}: characters must be an object`);

  checkLength(errors, file, "id", scenario.id, PERSONA_STRING_LIMITS.label);
  checkLength(errors, file, "title", scenario.title, PERSONA_STRING_LIMITS.label);
  checkLength(errors, file, "publicTitle", scenario.publicTitle, 180);
  checkLength(errors, file, "subtitle", scenario.subtitle, PERSONA_STRING_LIMITS.description);
  checkLength(errors, file, "defaultPlayerName", scenario.defaultPlayerName, PERSONA_STRING_LIMITS.playerName);
  checkImagePath(errors, file, "heroImage", scenario.heroImage);

  if (!isPlainObject(nodes)) return errors;

  if (!scenario.startNodeId || !nodes[scenario.startNodeId]) {
    errors.push(`${file}: startNodeId "${scenario.startNodeId}" does not exist`);
  }

  const resultNodeId = scenario.resultNodeId || "result";
  if (!nodes[resultNodeId]) {
    errors.push(`${file}: result node "${resultNodeId}" does not exist`);
  }

  for (const [characterId, character] of Object.entries(characters)) {
    checkLength(errors, file, `characters.${characterId}.label`, character?.label, PERSONA_STRING_LIMITS.label);
    checkLength(errors, file, `characters.${characterId}.role`, character?.role, PERSONA_STRING_LIMITS.slotText);
  }

  for (const [nodeId, node] of Object.entries(nodes)) {
    if (!isPlainObject(node)) {
      errors.push(`${file}: nodes.${nodeId} must be an object`);
      continue;
    }
    checkLength(errors, file, `nodes.${nodeId}.id`, node.id, PERSONA_STRING_LIMITS.label);
    checkLength(errors, file, `nodes.${nodeId}.stage`, node.stage, PERSONA_STRING_LIMITS.label);
    checkLength(errors, file, `nodes.${nodeId}.title`, node.title, 120);
    checkLength(errors, file, `nodes.${nodeId}.body`, node.body, PERSONA_STRING_LIMITS.nodeText);
    checkImagePath(errors, file, `nodes.${nodeId}.image`, node.image);

    if (!Array.isArray(node.choices)) {
      errors.push(`${file}: nodes.${nodeId}.choices must be an array`);
      continue;
    }

    for (const [choiceIndex, choice] of node.choices.entries()) {
      const pointer = `nodes.${nodeId}.choices[${choiceIndex}]`;
      checkLength(errors, file, `${pointer}.id`, choice?.id, PERSONA_STRING_LIMITS.label);
      checkLength(errors, file, `${pointer}.label`, choice?.label, PERSONA_STRING_LIMITS.label);
      checkLength(errors, file, `${pointer}.description`, choice?.description, PERSONA_STRING_LIMITS.description);

      if (choice?.next && !nodes[choice.next]) {
        errors.push(`${file}: ${pointer}.next "${choice.next}" does not exist`);
      }
      validateAddObject(errors, file, `${pointer}.add`, choice?.add, characters);
      validateVector(errors, file, `${pointer}.vector`, choice?.vector);
    }
  }

  if (scenario.startNodeId && nodes[scenario.startNodeId]) {
    const reachable = reachableNodes(nodes, scenario.startNodeId);
    for (const nodeId of Object.keys(nodes)) {
      if (!reachable.has(nodeId)) errors.push(`${file}: nodes.${nodeId} is not reachable from startNodeId`);
    }
    if (!reachable.has(resultNodeId)) {
      errors.push(`${file}: no valid path reaches result node "${resultNodeId}"`);
    }
  }

  return errors;
}

async function main() {
  const files = (await readdir(scenarioDir)).filter((file) => file.endsWith(".json")).sort();
  const errors = [];
  for (const file of files) {
    const absolutePath = path.join(scenarioDir, file);
    try {
      const scenario = JSON.parse(await readFile(absolutePath, "utf8"));
      errors.push(...validateScenario(file, scenario));
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  }

  if (errors.length) {
    console.error(`Persona CYOA validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Persona CYOA validation passed for ${files.length} scenario(s).`);
}

main();
