import C from "../styles/tokens";
import { cdnUrl } from "../utils/cdn";

export const ZONES = [
  {
    id: "core",
    src: cdnUrl("The%20Core.webp"),
    accent: C.distCore,
    glowColor: "oklch(0.85 0.16 80)",
    innerR: 0, outerR: 0.18,
    type: "ring",
  },
  {
    id: "middle",
    src: cdnUrl("Middle%20Ring.webp"),
    accent: C.distMid,
    glowColor: "oklch(0.75 0.14 240)",
    innerR: 0.18, outerR: 0.30,
    type: "ring",
  },
  {
    id: "hype",
    src: cdnUrl("Hype%20Road.webp"),
    accent: C.distHype,
    glowColor: "oklch(0.78 0.16 340)",
    innerR: 0.30, outerR: 0.44,
    type: "ring",
  },
  {
    id: "terrace",
    src: cdnUrl("Terrace.webp"),
    accent: C.distTer,
    glowColor: "oklch(0.78 0.14 140)",
    innerR: 0.44, outerR: 0.56,
    type: "ring",
  },
  {
    id: "industrial",
    src: cdnUrl("industrial%20complex.webp"),
    accent: C.distIndustrial,
    glowColor: "oklch(0.72 0.12 220)",
    type: "polygon",
  },
];

export const INDUSTRIAL_INFO = {
  id: "industrial",
  name: "산업단지",
  en: "Industrial Complex",
  tier: "물류와 생산의 심장부",
  agency: "",
  desc: "눈부신 무대 뒤편, 거대한 도시를 물리적으로 지탱하는 숨겨진 핏줄. 철골과 물류 라인 속에 육중한 생존의 리듬이 흐른다.",
};

/* ── SVG 타원형 링 경로 (히트박스용) ── */
export function ringPath(cx, cy, rInner, rOuter, ratio) {
  const rxO = rOuter;
  const ryO = rOuter * ratio;
  const outer = `M${cx},${cy - ryO} A${rxO},${ryO} 0 1,1 ${cx},${cy + ryO} A${rxO},${ryO} 0 1,1 ${cx},${cy - ryO}Z`;
  if (rInner === 0) return outer;
  const rxI = rInner;
  const ryI = rInner * ratio;
  const inner = `M${cx},${cy - ryI} A${rxI},${ryI} 0 1,0 ${cx},${cy + ryI} A${rxI},${ryI} 0 1,0 ${cx},${cy - ryI}Z`;
  return `${outer} ${inner}`;
}

export function industrialPolygon(vw, vh) {
  const pts = [
    [0.00, 0.42], [0.18, 0.42], [0.30, 0.55],
    [0.38, 0.72], [0.42, 1.00], [0.00, 1.00],
  ];
  return pts.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}

/* ── Hype Road 상단 확장 폴리곤 (등각 뷰 보정) ──
   타원 링 바깥이지만 이미지상 Hype Road인 상단 영역을 커버.
   좌표: 사용자 피드백 기반 경계점을 곡선으로 이은 영역 + 이미지 상단 모서리. */
export function hypeTopPolygon(vw, vh) {
  // 경계점 (normalized) — 프레임 가장자리까지 확장
  // 좌측 하단: Terrace 링 innerR 경계에 맞춤 (수로 영역을 Terrace에 양보)
  const pts = [
    [0.00, 0.42], [0.04, 0.38], [0.106, 0.231],
    [0.338, 0.049], [0.715, 0.049],
    [0.802, 0.130], [0.875, 0.193],
    [0.945, 0.515], [1.00, 0.636],
    [1.00, 0.00], [0.00, 0.00],  // 상단 모서리로 닫기
  ];
  return pts.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}

/* ── Terrace 우측+하단 확장 (타원 링 바깥, Hype 링 위에 렌더) ──
   우측 수로~하단 수로~우측 하단 모서리를 커버. */
export function terraceExtensionPolygon(vw, vh) {
  // 하단 수로 + 우측 하단 프레임만 커버. 우측 상단으로 올라가지 않음.
  const pts = [
    // 하단 수로 경계
    [0.399, 0.714], [0.411, 0.757], [0.406, 0.836],
    // 하단+우측 프레임
    [0.42, 1.00], [1.00, 1.00], [1.00, 0.636],
    // 우측에서 수로 높이까지만 (상단으로 올라가지 않음)
    [0.999, 0.628], [0.923, 0.569],
    // 하단 수로 끝으로 연결
    [0.807, 0.741], [0.742, 0.711], [0.702, 0.668],
  ];
  return pts.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}

/* ── Terrace 우측 수로 오버라이드 (Hype 상단 폴리곤 위에 렌더) ──
   사용자 좌표 기반: 이 경계 안쪽(우하 방향)은 Terrace.
   SVG 최하단에 렌더하여 Hype 상단 폴리곤보다 우선. */
export function terraceRightOverride(vw, vh) {
  const pts = [
    // 좌변 (곡면): 수로 남쪽 경계만 — 상단 제거
    [0.729, 0.654], [0.780, 0.552],
    // 우변 (곡면): 우측 수로 남쪽만
    [0.923, 0.569], [0.999, 0.628],
    // 우측 프레임 → 하단 프레임으로 닫기
    [1.00, 1.00], [0.42, 1.00],
    // 하단 수로 경계를 따라 좌변 시작점으로
    [0.406, 0.836], [0.411, 0.757], [0.399, 0.714],
    [0.702, 0.668], [0.742, 0.711],
  ];
  return pts.map(([x, y]) => `${x * vw},${y * vh}`).join(" ");
}
