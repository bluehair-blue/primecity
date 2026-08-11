import { cdnUrl as projectCdnUrl } from "./cdn.js";

export const SAFE_PERSONA_ASSET_PATH_RE = /^\/[a-z0-9/_-]+\.(webp|png|jpg|jpeg)$/i;

export function isSafePersonaAssetPath(path) {
  return typeof path === "string" && SAFE_PERSONA_ASSET_PATH_RE.test(path) && !path.includes("..");
}

export function cdnUrl(path) {
  if (!isSafePersonaAssetPath(path)) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) return "";

  const normalized = path.startsWith("/") ? path.slice(1) : path;
  if (!normalized || normalized.includes("..")) return "";
  return projectCdnUrl(normalized);
}
