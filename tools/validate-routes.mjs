import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const navSource = readFileSync(
  new URL("../src/components/TriangleNav.jsx", import.meta.url),
  "utf8",
);
const redirectsSource = readFileSync(
  new URL("../public/_redirects", import.meta.url),
  "utf8",
);

const routes = new Set(
  [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]),
);
const navigationPaths = [
  ...navSource.matchAll(/\bpath:\s*"([^"]+)"/g),
].map((match) => match[1]);
const missingRoutes = navigationPaths.filter((path) => !routes.has(path));

if (missingRoutes.length > 0) {
  console.error(`Navigation routes missing from App.jsx: ${missingRoutes.join(", ")}`);
  process.exit(1);
}

const redirectRules = new Set(
  redirectsSource
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean),
);
const requiredRedirects = ["/ent / 307", "/ent/* /:splat 307"];
const missingRedirects = requiredRedirects.filter((rule) => !redirectRules.has(rule));

if (missingRedirects.length > 0) {
  console.error(`Missing Cloudflare redirects: ${missingRedirects.join(", ")}`);
  process.exit(1);
}

console.log(
  `Validated ${navigationPaths.length} frontend routes and ${requiredRedirects.length} /ent redirects.`,
);
