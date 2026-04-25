#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════
   Tag cleanup — asset_config.json + character_pose_overrides.json

   Rules (per user instruction 2026-04-16):
   1. warm 들어간 태그 전부 삭제 (모든 위치)
   2. light(빛) 관련 태그 전부 삭제 (예외: light smile 등 '가벼운/옅은' 의미)
   3. hug → reaching towards viewer (POV만 사용)
   4. 추상 감정 전부 삭제/교체 (heartfelt, caring, loving 등)
   5. gaze → sideways glance (명확한 태그로 교체)
   6. peaceful/serene/content 등 불안정 분위기 → 삭제 (스테이지 93/94 제외)
   ══════════════════════════════════════════════════════════ */

const fs = require('fs');

// ─── 삭제 대상 (모든 위치) ─────────────────────────────────
const DELETE_ALWAYS = new Set([
  // 1. warm 계열
  'warm', 'warm smile', 'warm glow', 'warm light', 'warm aura', 'warm embrace',
  // 2. light(빛) 계열 — light smile 등은 자동 제외됨 (exact match)
  'sparkling light', 'soft glow', 'soft light',
  'volumetric lighting', 'dynamic lighting', 'backlight',
  'subtle lens flare', 'lens flare',
  // 4. 추상 감정
  'heartfelt', 'caring', 'loving', 'maternal', 'devoted', 'accepting', 'tender', 'gentle',
  'mysterious aura', 'ethereal',
]);

// ─── 교체 대상 ─────────────────────────────────────────────
const REPLACE_ALWAYS = {
  'gentle smile': 'light smile',
  'gentle kiss': 'closed eyes',
  'peaceful smile': 'light smile',
  'loving gaze': 'sideways glance',
  'gaze': 'sideways glance',
  'hug': 'reaching towards viewer',
  'flustered': 'embarrassed',
  'soft focus background': 'blurry background',
};

// ─── 스테이지 제외 (93/94 에서만 유지) ─────────────────────
const DELETE_UNLESS_STAGE = new Set([
  'peaceful', 'serene', 'content', 'dreamlike', 'cinematic', 'candid',
]);

// ─── 통계 ──────────────────────────────────────────────────
const stats = { deleted: 0, replaced: 0, byTag: {} };
function log(tag, action) {
  stats[action]++;
  stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
}

/* processPrompt: 콤마로 구분된 프롬프트 문자열을 정제
   - NAI weight syntax (2::tag::, 0.6::artist::) 보존
   - tag 매칭은 weight prefix/suffix 제거 후 소문자로 수행 */
function processPrompt(prompt, isStage = false) {
  if (!prompt || typeof prompt !== 'string') return prompt;

  const tags = prompt.split(',').map(t => t.trim()).filter(Boolean);
  const result = [];

  for (let tag of tags) {
    // Weight syntax 제거해서 매칭: "2::white censored penis ::" → "white censored penis"
    let cleanTag = tag
      .replace(/^-?\d+\.?\d*::/, '')   // 시작 weight: 2::, 0.6::, -3::
      .replace(/::$/, '')               // 끝 ::
      .trim()
      .toLowerCase();

    // 규칙 적용 순서: DELETE_ALWAYS → REPLACE_ALWAYS → DELETE_UNLESS_STAGE
    if (DELETE_ALWAYS.has(cleanTag)) {
      log(cleanTag, 'deleted');
      continue;
    }
    if (REPLACE_ALWAYS[cleanTag]) {
      const replacement = REPLACE_ALWAYS[cleanTag];
      log(cleanTag + ' → ' + replacement, 'replaced');
      result.push(replacement);
      continue;
    }
    if (DELETE_UNLESS_STAGE.has(cleanTag) && !isStage) {
      log(cleanTag + ' (non-stage)', 'deleted');
      continue;
    }
    result.push(tag);
  }

  return result.join(', ');
}

/* processTags: 배열 형태의 태그 리스트를 정제 (pose_overrides 용) */
function processTags(tags, isStage = false) {
  if (!Array.isArray(tags)) return tags;
  const result = [];
  for (let tag of tags) {
    let cleanTag = tag.trim().toLowerCase();
    if (DELETE_ALWAYS.has(cleanTag)) { log(cleanTag, 'deleted'); continue; }
    if (REPLACE_ALWAYS[cleanTag]) {
      const replacement = REPLACE_ALWAYS[cleanTag];
      log(cleanTag + ' → ' + replacement, 'replaced');
      result.push(replacement);
      continue;
    }
    if (DELETE_UNLESS_STAGE.has(cleanTag) && !isStage) {
      log(cleanTag + ' (non-stage)', 'deleted');
      continue;
    }
    result.push(tag);
  }
  return result;
}

// ═══ asset_config.json ═══════════════════════════════════
const ac = JSON.parse(fs.readFileSync('tools/asset_config.json','utf8'));

// 캐릭터 프롬프트 (전체 씬에 적용되므로 non-stage 취급)
for (const char of Object.values(ac.characters)) {
  if (char.clothed) char.clothed = processPrompt(char.clothed, false);
  if (char.nude)    char.nude    = processPrompt(char.nude, false);
}

// 씬 프롬프트 (93/94 는 stage)
for (const [num, scene] of Object.entries(ac.scenes)) {
  const isStage = num === '93' || num === '94';
  if (scene.female_prompt) scene.female_prompt = processPrompt(scene.female_prompt, isStage);
  if (scene.male_prompt)   scene.male_prompt   = processPrompt(scene.male_prompt, isStage);
}

// 캐릭터 씬 오버라이드 (key 가 "93" 이면 stage)
for (const ovr of Object.values(ac.character_scene_overrides || {})) {
  for (const [key, val] of Object.entries(ovr)) {
    if (typeof val !== 'object' || val === null) continue;
    const isStage = key === '93' || key === '94';
    if (val.female_prompt) val.female_prompt = processPrompt(val.female_prompt, isStage);
    if (val.male_prompt)   val.male_prompt   = processPrompt(val.male_prompt, isStage);
  }
}

fs.writeFileSync('tools/asset_config.json', JSON.stringify(ac, null, 2));

// ═══ character_pose_overrides.json ═══════════════════════
const po = JSON.parse(fs.readFileSync('tools/character_pose_overrides.json','utf8'));

// 아키타입 포즈 (체위별 태그 — non-stage 취급)
for (const spec of Object.values(po._archetypes || {})) {
  for (const cat of Object.keys(spec.poses || {})) {
    spec.poses[cat] = processTags(spec.poses[cat], false);
  }
}

// 캐릭터 오버라이드 (체위별 태그 — non-stage 취급)
for (const ovr of Object.values(po._character_overrides || {})) {
  for (const [cat, val] of Object.entries(ovr)) {
    if (Array.isArray(val)) ovr[cat] = processTags(val, false);
  }
}

fs.writeFileSync('tools/character_pose_overrides.json', JSON.stringify(po, null, 2));

// ═══ Summary ═════════════════════════════════════════════
console.log('\n=== Cleanup Summary ===');
console.log('Deleted:  ' + stats.deleted);
console.log('Replaced: ' + stats.replaced);
console.log('\n=== Per-tag count ===');
const sorted = Object.entries(stats.byTag).sort((a,b) => b[1]-a[1]);
for (const [tag, count] of sorted) {
  console.log('  ' + count.toString().padStart(3) + '  ' + tag);
}
