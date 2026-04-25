# Tag Audit — Danbooru Validity + Style Risk

> Claude의 Danbooru 태그 지식 기반 분류. 최종 검증은 Danbooru 사이트에서 직접 확인 권장.

## Classification
- **GHOST**: Danbooru에 없거나 post_count 0. 모델이 해석 못함.
- **LOW**: 존재하나 사용량 적음 (<500). 해석이 불안정.
- **OK**: 검증된 태그 (1000+).
- **STYLE-RISK**: 존재하더라도 **화면 전체 톤을 바꿀 위험** (색감·분위기·조명).

---

## 🔴 GHOST 태그 (즉시 교체 필요)

| 태그 | 사용 위치 | 교체 제안 | 이유 |
|------|----------|----------|------|
| `warm` | (직접 사용 없음 — 수정 완료 추정) | — | 독립 단어로는 ghost |
| `warm smile` | arch:gentle.kiss | `light smile` | ghost, smile 계열 중 light smile이 검증됨 |
| `warm glow` | ovr:HSR.93 | `soft lighting` 또는 제거 | ghost |
| `warm light` | ovr:MIL.93, ovr:ERP.96 | `soft lighting` | ghost |
| `warm aura` | ovr:ERP.93 | 제거 (다른 표정 태그로 대체) | ghost, 추상 |
| `warm embrace` | arch:gentle.hug | `hug` | ghost. hug 자체가 OK |
| `gentle smile` | ovr:LSH.93, ovr:ERP.93/96 | `light smile` | ghost. light smile(~40k posts)로 치환 |
| `gentle kiss` | arch:gentle.kiss | `kiss, closed eyes` | ghost. kiss 단독 사용 |
| `heartfelt` | arch:passionate.* | 제거 | 추상 감정, 해석 불가 |
| `caring` | arch:gentle.paizuri/fellatio* | 제거 | 추상, ghost |
| `loving` | arch:passionate.pregnant* | 제거 | 추상 |
| `maternal` | arch:gentle.pregnant*, lap_pillow | `mother-like` 또는 제거 | ghost |
| `devoted` | arch:passionate.* (여러 씬) | `focused` 또는 표정 구체화 | 추상, ghost |
| `accepting` | arch:gentle.* | 제거 | 추상 |
| `loving gaze` | arch:passionate.doggystyle | `gaze, half-closed eyes` | ghost |
| `mysterious aura` | ovr:NHR.93 | 제거 | ghost |
| `soft glow` | ovr:NHR/JSH/SY.93 | `soft lighting` | ghost |
| `sparkling light` | ovr:*.93 | `light particles` 또는 `bloom` | ghost |
| `soft focus background` | scene:911.f | `blurry background, bokeh` | ghost |
| `subtle lens flare` | ovr:*.93 | `lens flare` (검증됨) | subtle 수식어로 ghost화 |
| `volumetric lighting` | ovr:*.93 | `sunbeam, god rays` 또는 제거 | ghost |

## 🟡 LOW/주의 태그 (해석 불안정)

| 태그 | 사용 위치 | 교체 제안 | 이유 |
|------|----------|----------|------|
| `gentle` | arch:gentle.fullnelson/fingering/spanking | 제거 또는 `relaxed` | LOW, 추상 |
| `tender` | arch:gentle.kiss | 제거 | LOW, 추상 |
| `content` | arch:passionate.after_sex/lap_pillow | `smile` | 추상 |
| `serene` | char:JGR, RAY | `calm, closed eyes` | LOW |
| `peaceful` | arch:aloof.pregnant_after, aloof_tsun.* | `relaxed` 또는 `closed eyes` | LOW |
| `peaceful smile` | arch:aloof_tsun.pregnant_after | `light smile` | ghost 조합 |
| `ethereal` | ovr:RAY.93 | `glowing, angel-like` | LOW, 추상 |
| `candid` | scene:902.f, ovr:*.93 | `natural pose` 또는 제거 | LOW |
| `dreamlike` | ovr:*.93 | 제거 | LOW, 추상 |
| `cinematic` | ovr:*.93 | `cinematic lighting` (검증됨) | `cinematic` 단독은 불안정 |
| `flustered` | scene:90/91/92.f | `embarrassed, blush` | LOW |

## 🟢 OK 태그 (검증됨 — 변경 불필요)

| 태그 | 비고 |
|------|------|
| `afterglow` | after-sex 씬에서 검증 |
| `moaning` | NSFW 검증 |
| `sparkling eyes` | 흔한 태그 |
| `bokeh` | 배경 처리 검증 |
| `backlight` | lighting 계열 |

---

## 💡 사용자가 강조한 `warm`의 위험성

`warm`은 독립 단어로 쓰면 **화면 전체 색조를 warm color tone으로 바꿔버리는** 위험이 있음.
Caption에 있으면 모델이 "warm photo", "warm palette"로 해석해서 원래 의도와 다르게 **그림체 자체가 바뀔 수 있음**.

**대체 전략**:
- 조명 표현이면: `warm lighting` → 그래도 ghost. `backlighting`, `soft lighting` 사용.
- 감정 표현이면: 포옹·쓰다듬기 등 **행동 태그**로 치환 (e.g., `hug`, `head pat`).
- 색상 표현이면: `pink light`, `orange light` 등 구체적 색상.

