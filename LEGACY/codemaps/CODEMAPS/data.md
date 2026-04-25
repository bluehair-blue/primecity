<!-- Generated: 2026-04-11 | Token estimate: ~600 -->

# Prime City — Data Structures

## characters.js 스키마 (15명)

```js
{
  id: "seoyun",           // URL slug (/characters/:name)
  name: "서윤",
  cdnId: "SY",            // CDN 경로 접두사
  color: "oklch(...)",    // 캐릭터 대표색
  agency: "APEX Entertainment",
  group: "APEX",
  district: "더코어",
  thumbnail: cdnUrl("SY/thumbnail.webp"),
  profile: cdnUrl("SY/profile.webp"),
  keyVisual: cdnUrl("SY/key.webp"),   // 있으면 CinematicCharDetail
  sign: cdnUrl("SY/sign.webp"),        // 15명 전원
  introStyle: "cutaway",               // INTRO_COMPONENTS 키
  keyVisualFit: "contain",             // Phase 1 objectFit
  focusBox: { x, y, w, h },            // 원안 +10% (v4)
  introAssets: [...],                  // 인트로에서 사전로드할 CDN URL
  quoteSequence: ["대사1", "대사2"],    // CenteredQuote 순서
  bio: "...",
  expressions: { contempt: cdnExprUrl(...), ... }  // 9종
}
```

## 15명 캐릭터 CDN 코드

```
SY(서윤) NHR(나하린) JSH(진시혁) ERK(에리카) LSH(이서하)
HSR(한소리) KHR(강하람) JGR(장그루) MIL(밀라) ELA(엘라)
MMR(미모리) HSE(하시은) NIA(니아) RAY(레이) LPS(라피스)
```

## 상황코드 매핑 (SCENE_CODE_MAP, cdn.js)

```
감정(1-9):   angry contempt happy sad shy smirk surprised troubled neutral
일상(10-18): normal-chat undressing-seduction drinking dining-chat cafe-chat
             cinema-chat christmas-date wedding pregnant
NSFW 비삽입(20-42): cunnilingus~footjob-cum
NSFW 삽입(50-67):   nude-conversation~pregnant-after-sex
착의-침실(70-78): clothed-missionary~clothed-after-sex-bedroom
착의-화장실(80-86): clothed-doggystyle-toilet~clothed-after-sex-toilet
```

## districts.js (5구역)

```
더코어(APEX) / 미들링(Blue Moon) / 하입로드(PRISM) / 테라스(Route 0) / 산업단지
```

## gamemodes.js

```
3가지 메인 모드 + 5가지 서브모드 (오디션·프리플레이·매니저·연습생·작곡가·배우·인플루언서)
```

## introStyles.js (INTRO_STYLE_CONFIG)

```js
{
  cutaway: { duration: 6400, letterbox: true },    // JSH
  sunrise: { duration: 4900 },                      // KHR
  ripple:  { duration: 6000 },                      // MIL
  glitch:  { duration: 7000 },                      // LSH
  flash:   { duration: 7000 },                      // MMR
}
// duration = Phase 0 총시간 (fadeOut 500ms 포함)
```

## generation_state.json 스키마 (tools/)

```json
{
  "completed": { "SY": [1,2,3,...], "NHR": [...] },
  "failed": { "SY": { "45": "reason" } },
  "started_at": "2026-...",
  "last_updated": "2026-..."
}
```

## asset_config.json 스키마 (tools/)

```json
{
  "base": { "base_prompt": "...", "negative_prompt": "...", "model": "nai-diffusion-4-5-full", ... },
  "scene_variant_map": { "1": "clothed", "20": "nude", ... },
  "characters": { "SY": { "name": "서윤", "clothed": "...", "nude": "..." } },
  "scenes": { "1": { "name": "angry", "prompt": "...", "width": 832, "height": 1216 } },
  "character_scene_overrides": { "JSH": { "remove_tags": ["double v"] } }
}
```
