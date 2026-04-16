# 프롬프트 상호작용 태그 전수 조사
> tools/asset_config.json scenes 기준 | 2026-04-11

---

## §1 태깅 시스템

```
source# (태그)  — 행위의 주체 (doing)
target# (태그)  — 행위의 수신 (receiving)
mutual# (태그)  — 상호 동시 행위 (both doing to each other)
```

**Female파트** = 여성 캐릭터 시점, **Male파트** = 남성 캐릭터 시점

---

## §2 현재 적용 현황 (이미 태깅됨)

| 씬 | 태그 | F파트 | M파트 | 상태 |
|----|------|-------|-------|------|
| 23 breast-grope | grabbing another's breast | target# | source# | ✓ |
| 24 breast-sucking | breast sucking | target# | source# | ✓ |
| 25 fingering | fingering | target# | source# | ✓ |
| 26 fingering-climax | fingering | target# | source# | ✓ |
| 26 fingering-climax | hug from behind | target# | source# | ✓ |
| 28 ass-grabbing | grabbing another's ass | target# | source# | ✓ |
| 28 ass-grabbing | spread ass | target# | source# | ✓ |
| 32 fellatio-climax-pov | grabbing another's hair | target# | source# | ✓ |
| 34 fellatio-climax-3rd | grabbing another's hair | target# | source# | ✓ |
| 36 deepthroat-climax | grabbing another's hair | target# | source# | ✓ |
| 37 handjob | handjob | source# | target# | ✓ |
| 38 handjob-cum | handjob | source# | target# | ✓ |
| 54 doggystyle-climax | grabbing another's hair | — | source# | △ F에 target# 누락 |
| 62 anal-sex-cum | grabbing another's hair | — | source# | △ F에 target# 누락 |

---

## §3 미적용 태그 전수 분석

### A. `source#` / `target#` 적용 가능 (행위 주체가 명확)

---

#### A-1. `cunnilingus` (씬 20)
- 행위 주체: **남성** (M does cunnilingus on F)
- **F파트 추가**: `target# cunnilingus`
- **M파트 수정**: `cunnilingus` → `source# cunnilingus`

---

#### A-2. `fellatio` (씬 31, 32, 33, 34, 36, 76, 77, 84, 85)
- 행위 주체: **여성** (F performs fellatio on M)
- **F파트 수정**: `fellatio` → `source# fellatio`
- **M파트 추가**: `target# fellatio`
- ※ 씬 32, 34, 36: M파트에 large penis/cum 있으나 `target# fellatio` 없음

---

#### A-3. `deepthroat` (씬 35, 36)
- 행위 주체: **남성** (M forces deep into F's throat)
- **F파트 수정**: `deepthroat` → `target# deepthroat`
- **M파트 추가**: `source# deepthroat`

---

#### A-4. `head grab` (씬 35)
- 행위 주체: **남성** (M grabs F's head)
- **F파트 추가**: `target# head grab`
- **M파트 수정**: `head grab` → `source# head grab`

---

#### A-5. `paizuri` / `clothed paizuri` / `naizuri` (씬 29, 30)
- 행위 주체: **여성** (F performs paizuri on M)
- **F파트 수정**: `paizuri, clothed paizuri, naizuri` → `source# paizuri, source# clothed paizuri, source# naizuri`
- **M파트 추가**: `target# paizuri`

---

#### A-6. `anilingus` (씬 39, 40)
- 행위 주체: **여성** (F performs anilingus on M)
- **F파트 수정**: `anilingus` → `source# anilingus`
- **M파트 추가**: `target# anilingus`

---

#### A-7. `reverse paizuri` (씬 39, 40)
- F가 anilingus 중 M이 위에서 역방향 paizuri
- 행위 주체: **여성** (F receives M's thrusting between breasts from reverse angle)
- **F파트 수정**: `reverse paizuri` → `target# reverse paizuri`
- **M파트 추가**: `source# reverse paizuri`

---

#### A-8. `footjob` (씬 41, 42)
- 행위 주체: **여성** (F performs footjob on M — POV, no male prompt)
- **F파트 수정**: `footjob` → `source# footjob`
- ※ M파트 없음 (POV) → 추가 불필요

---

#### A-9. `hug from behind` (씬 44)
- 행위 주체: **남성** (M hugs F from behind)
- **F파트 수정**: `hug from behind` → `target# hug from behind`
- **M파트 추가**: `source# hug from behind`
- ※ 씬 26은 이미 올바르게 태깅됨

---

#### A-10. `forehead kiss` (씬 45)
- 행위 주체: **남성** (M kisses F's forehead)
- **F파트 수정**: `forehead kiss` → `target# forehead kiss`
- ※ M파트 없음 (POV implied) → 추후 M파트 추가 시 `source# forehead kiss`

---

#### A-11. `neck kiss` (씬 46)
- 행위 주체: **남성** (M kisses F's neck)
- **F파트 수정**: `neck kiss` → `target# neck kiss`
- ※ M파트 없음 → 추후 `source# neck kiss`

---

#### A-12. `spanking` / `spanked` (씬 27)
- 행위 주체: **남성** (M spanks F)
- 현재: F에 `spanked`, M에 `spanking` — 태그 형태 불통일
- **F파트 수정**: `spanked` → `target# spanking`
- **M파트 수정**: `spanking` → `source# spanking`

---

#### A-13. `grabbing another's ass` (씬 61, 62)
- 행위 주체: **남성** (M grabs F's ass)
- 현재: M에 `grabbing another's ass` (태그 없음)
- **F파트 추가**: `target# grabbing another's ass`
- **M파트 수정**: `grabbing another's ass` → `source# grabbing another's ass`

---

#### A-14. `target# grabbing another's hair` 누락 (씬 54, 62)
- M파트에 `source# grabbing another's hair` 있으나 F파트에 `target#` 없음
- **씬 54 F파트 추가**: `target# grabbing another's hair`
- **씬 62 F파트 추가**: `target# grabbing another's hair`

---

#### A-15. `chokehold` (씬 81)
- 행위 주체: **남성** (M chokes F)
- 현재: M에 `chokehold` (태그 없음)
- **F파트 추가**: `target# chokehold`
- **M파트 수정**: `chokehold` → `source# chokehold`

---

#### A-16. `leg grab` (씬 59, 60, 72, 73, 82, 83 — full-nelson 변형)
- 행위 주체: **남성** (M grabs F's legs)
- 현재: F파트에 `leg grab` (태그 없음)
- **F파트 수정**: `leg grab` → `target# leg grab`
- **M파트 추가**: `source# leg grab`

---

### B. `mutual#` 적용 가능 (상호 동시 행위)

---

#### B-1. `kiss` (씬 21, 22)
- 상호 행위 — 둘 다 입맞춤
- **F파트 수정**: `2::kiss::` → `mutual# 2::kiss::` (또는 `2::mutual# kiss::`)
- ※ NAI weight 구문과 mutual# 조합 시 `mutual# kiss` + 별도 weight 적용 권장

---

#### B-2. `oral` + `69` (씬 49)
- 서로 오럴 동시 수행
- **F파트 수정**: `oral` → `mutual# oral`
- **M파트 추가**: `mutual# oral, mutual# cunnilingus`
- F파트: `mutual# oral, mutual# fellatio`

---

### C. 태깅 불필요 (위치/상태/표정 묘사)

아래 태그들은 행위의 주체가 없거나 포지션/결과 묘사이므로 source#/target# 불필요.

| 태그 | 이유 |
|------|------|
| `sex`, `clothed sex` | 성행위 자체 묘사, 포지션 수식어 역할 |
| `penis` | 신체 부위 묘사 |
| `missionary`, `doggystyle`, `cowgirl position`, `spooning`, `reverse suspended congress` | 체위 묘사 (상호 참여) |
| `cum in pussy`, `cum in mouth`, `cum in ass`, `facial`, `cum on body` | 결과 상태 묘사 |
| `wet body`, `ahegao`, `trembling`, `heart-shaped pupils` | 반응/표정 묘사 |
| `leg lift` | 여성 자신의 동작 |
| `spread legs`, `arms behind head`, `arched back` | 여성 자신의 자세 |
| `covering breasts`, `covering crotch` | 여성 자신의 동작 |
| `spreading own pussy` | 여성 자신의 동작 |
| `pov` | 시점 설명자 |

---

## §4 씬별 수정 계획 (전체)

수정 필요 씬: **20, 21, 22, 27, 29, 30, 31, 32, 33, 34, 35, 36, 39, 40, 41, 42, 44, 45, 46, 49, 54, 59, 60, 61, 62, 72, 73, 76, 77, 81, 82, 83, 84, 85**

| 씬 | 이름 | 수정 내용 요약 |
|----|------|---------------|
| 20 | cunnilingus | F +`target# cunnilingus`, M `source#` |
| 21 | kiss | F `mutual# kiss` |
| 22 | nude-kiss | F `mutual# kiss` |
| 27 | ass-spanking | F `target# spanking`, M `source# spanking` |
| 29 | paizuri | F `source# paizuri/clothed paizuri/naizuri`, M +`target# paizuri` |
| 30 | paizuri-cum | 위와 동일 |
| 31 | fellatio-pov | F `source# fellatio`, M +`target# fellatio` |
| 32 | fellatio-climax-pov | F +`source# fellatio`, M +`target# fellatio` |
| 33 | fellatio-3rd | F `source# fellatio`, M +`target# fellatio` |
| 34 | fellatio-climax-3rd | F +`source# fellatio`, M +`target# fellatio` |
| 35 | deepthroat | F `target# deepthroat, target# head grab`, M `source# deepthroat, source# head grab` |
| 36 | deepthroat-climax | F +`target# deepthroat, source# fellatio`, M +`source# deepthroat, target# fellatio` |
| 39 | rimjob | F `source# anilingus, target# reverse paizuri`, M +`target# anilingus, source# reverse paizuri` |
| 40 | rimjob-cum | 위와 동일 |
| 41 | footjob | F `source# footjob` |
| 42 | footjob-cum | F `source# footjob` |
| 44 | hug-from-behind | F `target# hug from behind`, M +`source# hug from behind` |
| 45 | forehead-kiss | F `target# forehead kiss` |
| 46 | neck-kiss | F `target# neck kiss` |
| 49 | 69 | F +`mutual# fellatio, mutual# oral`, M +`mutual# cunnilingus, mutual# oral` |
| 54 | doggystyle-climax | F +`target# grabbing another's hair` |
| 59 | full-nelson | F `target# leg grab`, M +`source# leg grab` |
| 60 | full-nelson-climax | F `target# leg grab`, M +`source# leg grab` |
| 61 | anal-sex | F +`target# grabbing another's ass`, M `source# grabbing another's ass` |
| 62 | anal-sex-cum | F +`target# grabbing another's ass, target# grabbing another's hair`, M `source# grabbing another's ass` |
| 72 | clothed-fullnelson-bedroom | F `target# leg grab`, M +`source# leg grab` |
| 73 | clothed-fullnelson-climax-bedroom | F `target# leg grab`, M +`source# leg grab` |
| 76 | clothed-fellatio-bedroom | F `source# fellatio`, M +`target# fellatio` |
| 77 | clothed-fellatio-climax-bedroom | F `source# fellatio`, M +`target# fellatio` |
| 81 | clothed-doggystyle-climax-toilet | F +`target# chokehold`, M `source# chokehold` |
| 82 | clothed-fullnelson-toilet | F `target# leg grab`, M +`source# leg grab` |
| 83 | clothed-fullnelson-climax-toilet | F `target# leg grab`, M +`source# leg grab` |
| 84 | clothed-fellatio-toilet | F `source# fellatio`, M +`target# fellatio` |
| 85 | clothed-fellatio-climax-toilet | F `source# fellatio`, M +`target# fellatio` |

**총 34개 씬, 약 65개 태그 수정**

---

## §5 미결 사항

1. **`kiss` NAI weight 구문 처리**: `2::kiss::` weight 표현과 `mutual#` 조합 방식 결정 필요
   - 옵션 A: `mutual# 2::kiss::` (weight 안쪽)
   - 옵션 B: `2::mutual# kiss::` (mutual# 안쪽)
   - 현재 다른 weighted 태그 중 source#/target# 혼용 없음 → 테스트 필요

2. **씬 43-50 (lap-pillow, hug, forehead-kiss 등) M파트 없음**: POV씬은 M 행위도 F파트에 내포됨. M파트 추가할 경우 source# 적용 가능.

3. **`sex` / `clothed sex` / `penis` 태깅 여부**: 순수 체위 묘사 태그를 mutual#로 처리할지 결정 대기.
