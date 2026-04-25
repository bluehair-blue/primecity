# 장그루(JGR) CharDetail (plan_sub.md)

> 사용자 승인 후 구현합니다.



## 에이전트 피드백 재검토 (코드베이스 기준)

다른 에이전트가 제안한 `@property + CSS mask-image + SVG feDisplacementMap` 조합은 **브라우저 기능 차원에서는 가능**합니다. 다만 현재 프라임시티의 `JgrCharDetail` 라이브 코드와 성능 목표를 기준으로 보면, 이 제안은 **"돌아갈 수는 있지만 그대로 넣기에는 과하고, 설명도 몇 군데 과장되어 있다"** 쪽에 가깝습니다.

### 결론 요약

| 항목 | 판단 |
|---|---|
| 기술적 가능 여부 | 가능은 함 (현대 브라우저 기준) |
| 현재 코드베이스 적합성 | **as-is 비추천** |
| 주된 이유 | 성능 비용, 현재 구도/타이밍/연출 회귀 리스크, 마스크 수학 자체의 불안정성 |
| 승인 판단 | 메인 플랜으로는 보류. 한다면 **별도 실험안**으로 분리 필요 |

### 왜 "가능"과 "적합"이 다른가

현재 라이브 `CharDetail.jsx`의 JGR 오버레이는 이미 다음 요소를 동시에 돌리고 있습니다.

| 현재 live 오버레이 | 상태 |
|---|---|
| full-screen `intro1` | Beat 1 세피아 + **Ken Burns** 적용 완료 |
| full-screen `intro2` | Beat 2 opacity + scale 전환 |
| 필름 그레인 | data URI + `mixBlendMode: overlay` |
| 비네트 | full-screen gradient |
| 블룸 | Beat 2에서 `blur(40px)` + `charGlowPulse` |
| 레터박스 + 타이포 | 이미 존재 |

여기에 외부 제안대로 아래가 추가됩니다.

| 추가되는 비용 | 설명 |
|---|---|
| full-screen 레이어 1장 추가 | `Base / Ember / Top` 3중 구조가 됨 |
| full-screen SVG filter 2개 | `feTurbulence + feDisplacementMap` 두 벌 |
| full-screen mask 연산 2개 | `mask-image`를 매 프레임 재계산 |
| 강한 filter 체인 | `sepia + hue-rotate + saturate + brightness + contrast + drop-shadow` |

즉 이건 "지금 구조에 작은 효과 1개 추가"가 아니라, **현재 안정화된 JGR 오버레이를 통째로 다른 렌더링 모델로 갈아엎는 수준**입니다.

### 코드베이스 기준으로 구체적으로 걸리는 지점

#### 1. 현재 live 구도와 정면 충돌

현재 라이브 코드는 `intro1`과 `intro2`에 **서로 다른 `objectPosition`** 을 씁니다.

| 레이어 | 현재 live 값 |
|---|---|
| `intro1` Beat 1 | 모바일 `"65% 50%"`, 데스크톱 `"center 40%"` |
| `intro2` Beat 2 / Phase 2 | 모바일 `"50% 40%"`, 데스크톱 `"center 30%"` |

외부 제안은 세 레이어 전부를 한 번에:

```jsx
object-position: ${isMobile ? "50% 40%" : "center 30%"};
```

로 묶습니다. 이건 현재 코드베이스에서 이미 조정해 둔 `intro1` 구도를 버리는 것이므로, **특히 모바일 Beat 1 얼굴 프레이밍이 바로 무너질 가능성**이 큽니다.

#### 2. 이미 구현된 v4.2 Ken Burns를 되려 회귀시킴

현재 live `intro1`에는 이미 아래가 들어가 있습니다.

```jsx
animation: jgrBeat >= 1 ? "jgrKenBurns 3.1s ease-in-out forwards" : "none",
```

외부 제안의 3중 레이어 코드는 이 Ken Burns를 포함하지 않습니다. 즉 이 제안을 그대로 덮어쓰면, **방금 안정화한 Beat 1 움직임이 사라집니다.**

따라서 이 제안은 "버닝 트랜지션 추가"가 아니라 실제로는:

- Beat 1 구도 재설정
- Beat 1 모션 재통합
- Beat 2 전환 방식 교체
- 전체 overlay 재검증

까지 필요합니다.

#### 3. `--burn-x: 55%`는 수학적으로 너무 깊게 들어감

이 제안의 핵심은 `--burn-x`를 키워서 양옆에서 중앙으로 마스크를 좁히는 구조인데, 제시된 stop 값 기준으로는 **55%가 너무 큽니다.**

Top layer의 실질 검은 영역 폭은 대략 아래 식으로 줄어듭니다.

```text
visibleWidth = (100 - burnX - 6) - (burnX + 6) = 88 - 2 * burnX
```

`burnX = 55`면:

$$
88 - 110 = -22
$$

가 되어 stop 순서가 역전됩니다.

Ember layer도 비슷합니다.

```text
visibleWidth = (100 - burnX - 2) - (burnX + 2) = 96 - 2 * burnX
```

`burnX = 55`면:

$$
96 - 110 = -14
$$

즉 이 값은 "아주 좁아진다"가 아니라, **브라우저가 stop 역전을 어떻게 접어 처리하느냐에 기대는 영역**입니다. 엔진에 따라 매끄럽게 사라지지 않고, 끝 지점에서 갑자기 붕괴하거나 얇은 슬리버가 남을 가능성이 있습니다.

이건 단순 미세 조정 문제가 아니라, 현재 문서의 핵심 파라미터가 **안전한 범위를 넘었다**는 뜻입니다.

#### 4. "GPU 가속이라 가볍다"는 설명은 현재 코드 기준으로 과장

`transform` 단독 애니메이션은 합성 단계에서 끝나기 쉬워 가볍습니다. 그래서 현재 v4.2 Ken Burns는 부담이 크지 않습니다.

하지만 외부 제안의 핵심 비용은 `transform`이 아니라 아래 조합입니다.

- full-screen `mask-image`의 실시간 재계산
- full-screen HTML 이미지에 대한 `filter: url(#svg-filter) ...`
- 그 위에 다시 일반 CSS filter 체인 중첩

이 조합은 현재 코드베이스에서 **paint-heavy** 쪽입니다. React re-render를 data attribute로 줄인다고 해결되는 문제가 아니라, 브라우저가 **매 프레임 픽셀 단위 처리**를 하게 되는 구간이 늘어나는 쪽에 가깝습니다.

따라서 이 제안을 `AF급 + 안 무거움`의 정답처럼 쓰는 건 맞지 않습니다. 특히 JGR는 이미:

- 2장의 full-screen 이미지
- grain overlay
- vignette
- blur bloom

이 동시에 돌고 있어서, 여기에 displacement filter까지 얹으면 **모바일 저사양 기기에서 가장 먼저 흔들릴 타입**입니다.

#### 5. 브라우저 기능은 되지만, 이 프로젝트가 기대는 baseline보다 더 최신임

브라우저 기능 자체는 다음 정도로 정리할 수 있습니다.

| 기능 | 해석 |
|---|---|
| `mask-image` | 현대 브라우저에선 사용 가능 |
| `filter: url(#svg-filter)` | HTML 요소에도 사용 가능 |
| `@property` | Safari/iOS 16.4+, Firefox 128+ 수준의 비교적 최신 baseline |

즉 "아예 안 됨"은 아닙니다. 다만 현재 live JGR는 plain transition / transform 중심인데, 이 제안은 그보다 **지원 요구사항이 더 최신이고 민감한 축**으로 이동합니다.

프로젝트가 이미 `oklch`, `color-mix` 등 현대 기능을 쓰는 건 맞지만, 그래도 **굳이 가장 민감한 렌더링 경로를 오버레이 핵심으로 바꾸는가**는 별도 판단입니다.

#### 6. "실제 불에 타는 질감"이라고 보기엔 temporal variation이 부족함

이 제안의 `feTurbulence`는 정적 노이즈입니다. 즉 지금 형태로는:

- 불길이 살아 움직인다기보다
- **찢긴 경계선이 안쪽으로 미끄러지는 wipe**

에 가깝습니다.

정말 불처럼 보이려면 보통 아래 중 하나가 더 필요합니다.

- turbulence seed / frequency 자체의 시간 변화
- ember edge의 flicker
- 경계선 두께의 미세 흔들림

문제는 그걸 넣는 순간 지금보다 더 무거워집니다. 즉 현재 제안은 **설명은 매우 화려한데, 실제론 비용 대비 효과가 과장된 쪽**입니다.

#### 7. 프로젝트 컨벤션과도 몇 군데 어긋남

이 코드베이스 기준으로 바로 걸리는 것들:

| 항목 | 문제 |
|---|---|
| `drop-shadow(0 0 12px #ff4500)` | 프로젝트 가이드의 **OKLCH 전용** 원칙과 충돌 |
| `id="burn-tear-light"`, `id="burn-tear-heavy"` | 전역 ID라서 namespace 없이 generic함 |
| `@property --burn-x` | 전역 등록이라 이름이 너무 일반적임. `--jgr-burn-x` 정도로 namespace 필요 |
| `.jgr-layer-*` 전역 class selector | 현재 JGR 구현은 인라인 스타일 중심인데, 이 제안은 전역 style tag 의존도가 높음 |

치명적 버그는 아니지만, "이 프로젝트에 바로 자연스럽게 들어가는 설계"라고 보긴 어렵습니다.

### 현재 코드베이스에 맞춘 현실적 판단

#### 메인 플랜으로는 왜 비추천인가

- 이미 안정화된 v4.1 / v4.2를 크게 흔듭니다.
- 효과 대비 비용이 큽니다.
- 모바일에서 성능보다 먼저 **구도 회귀**가 날 가능성이 큽니다.
- 핵심 수치(`55%`)가 안전하지 않습니다.
- 설명은 "가볍고 프레임 드랍 없음"인데, 실제 비용 축은 그 반대입니다.

#### 그래도 아이디어를 살리고 싶다면

지금 코드베이스에 맞는 축소형은 이쪽입니다.

| 방향 | 이유 |
|---|---|
| 현재 2-layer 구조 유지 | `intro1` / `intro2` 구도와 타이밍을 보존 가능 |
| Ken Burns 유지 | 방금 안정화한 v4.2 회귀 방지 |
| `feDisplacementMap`는 전면 도입하지 않음 | 가장 비싼 축 제거 |
| burn 느낌은 **edge accent layer 1장**으로 한정 | 무게를 가장 덜 늘림 |
| mask 진행값은 40~45%대에서 끝내고, 나머지는 overlay fade로 마감 | stop 역전 구간 회피 |

즉 "진짜 종이 타는 듯한 완전한 burn simulation"이 아니라,

**현재 cinematic overlay 위에 얇은 burn edge를 얹는 방향**이 이 코드베이스에는 더 맞습니다.

### 최종 판단

- **기술 검증용 프로토타입**으로는 가능
- **현재 mainline JGR 플랜**으로는 비추천
- 승인하려면 최소한 아래가 선행되어야 함:

| 승인 조건 | 이유 |
|---|---|
| `intro1` / `intro2`별 `objectPosition` 분리 유지 | 현재 라이브 구도 보존 |
| v4.2 Ken Burns 재통합 명시 | 회귀 방지 |
| `--burn-x` 종단값 재설계 | stop 역전 방지 |
| hex 제거, ID/property namespace 적용 | 프로젝트 컨벤션 정합 |
| 성능 검증 대상에 모바일 실기기 포함 | 이 효과의 가장 큰 리스크가 모바일 paint cost이기 때문 |

### 피드백 정리

- **실현 가능성 자체는 있음**: `mask-image`, SVG filter reference, `@property` 모두 현대 브라우저에선 동작 가능.
- **하지만 현재 코드베이스에서 "잘 돌아갈" 가능성은 높지 않음**: 이유는 브라우저 지원 부족보다도, 현재 JGR overlay가 이미 충분히 무거운 상태에서 full-screen mask + displacement filter를 2중으로 얹는 구조이기 때문.
- **가장 큰 실무 리스크는 두 가지**:
  1. `intro1` 구도와 v4.2 Ken Burns 회귀
  2. `--burn-x: 55%`로 인한 마스크 stop 역전
- **따라서 이 문서는 현 상태로 승인하지 않는 편이 맞음**. 한다면 "메인 구현안"이 아니라 "별도 실험안"으로 분리하고, 효과 범위를 현재 overlay 위의 경량 burn accent 수준으로 축소하는 쪽을 권장.


## v4.3 — Beat 1 경량 burn edge accent

### 목적

Beat 1 세피아 구간의 양 옆에 **갈색 노이즈 질감**을 살짝 얹어 필름 버닝 느낌을 부여. feDisplacementMap/mask-image/@property 등 무거운 기법은 사용하지 않음 — 에이전트 피드백 검토 결과 현재 overlay 부하(6레이어 동시)에서 full-screen filter 추가는 부적합.

### 설계 원칙

| 원칙 | 이유 |
|---|---|
| 현재 2-layer 구조 유지 | intro1/intro2 objectPosition + Ken Burns 회귀 방지 |
| 추가 레이어 최대 1장 | 기존 overlay 위 경량 accent만 |
| full-screen SVG filter 사용 안 함 | paint-heavy 회피 |
| 그래디언트 단독 사용 안 함 | 이전 시도에서 "주황색 그래디언트"로만 보인다는 피드백 |

### 접근 방식: 기존 필름 그레인 패턴 재활용

현재 220행의 필름 그레인은 `feTurbulence(baseFrequency 0.9)` SVG를 data URI로 **배경 이미지**로 사용. 이 패턴은 이미 검증됐고 성능 부담이 낮음 (정적 래스터 타일링, filter 아님).

동일 구조로 **burn edge 전용 노이즈 레이어 1장**을 추가하되:
- `baseFrequency`를 낮춰(0.4) 더 거친 입자감 (불씨/그을음 느낌)
- `backgroundColor`로 따뜻한 갈색 톤 배합
- `mask-image`로 양 옆에서만 보이도록 제한 (중앙은 완전 투명)
- Beat 1에서만 표시, Beat 2 전환 시 기존 opacity transition으로 자연 소멸

### 코드 스니펫

```jsx
{/* burn edge accent — Beat 1 전용, 비네트 뒤 Letterbox 앞 */}
{jgrBeat === 1 && (
  <div style={{
    position: "absolute", inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' opacity='0.5'/%3E%3C/svg%3E")`,
    backgroundSize: "160px 160px",
    backgroundColor: "oklch(0.2 0.06 40)",
    backgroundBlendMode: "overlay",
    WebkitMaskImage: "linear-gradient(to right, black, transparent 25%, transparent 75%, black)",
    maskImage: "linear-gradient(to right, black, transparent 25%, transparent 75%, black)",
    opacity: 0.45,
    mixBlendMode: "multiply",
    pointerEvents: "none",
    animation: "splashFadeIn 1.5s ease-out",
  }} />
)}
```

### 각 속성 선택 근거

| 속성 | 값 | 이유 |
|---|---|---|
| `baseFrequency` | 0.4 | 기존 그레인(0.9)보다 거칠어서 "노이즈 입자" 느낌. 불씨처럼 보임 |
| `backgroundColor` | `oklch(0.2 0.06 40)` | 어두운 갈색 (OKLCH 컨벤션 준수). 밝기 0.2 = 거의 검정에 가까운 따뜻함 |
| `backgroundBlendMode` | `overlay` | 노이즈 텍스처와 갈색 배경이 자연스럽게 섞임 |
| `maskImage` | 좌 0→25% 투명, 75→100% 투명 | 양 옆 25%에서만 효과 보임. 중앙 50%는 완전 투명 = 캐릭터 가리지 않음 |
| `opacity` | 0.45 | 미묘하지만 인지 가능. 세피아 톤과 조화 |
| `mixBlendMode` | `multiply` | 어두운 부분을 강조하여 "그을림" 느낌. overlay는 밝은 부분도 올려서 과할 수 있음 |
| `backgroundSize` | `160px 160px` | 기존 그레인보다 큰 타일 = 더 거친 질감 |
| `animation` | `splashFadeIn 1.5s` | 기존 keyframe 재활용. 부드러운 등장 |

### 모바일 vs 데스크톱

동일한 코드 사용. `mask-image`의 25%/75% 비율이 vw 기준이 아닌 요소 기준이라 화면 크기에 자동 적응. 모바일에서 burn edge가 과하게 넓으면 비율을 `20%/80%`로 조정 가능.

### 배치 위치

비네트(228행) 뒤, Letterbox(230행) 앞. z-order:
```
intro1 (Ken Burns) → intro2 → 필름 그레인 → 비네트 → burn edge → Letterbox → 텍스트
```

### 이전 시도와의 차이

| | 1차 시도 (revert됨) | 2차 시도 (revert됨) | 이번 v4.3 |
|---|---|---|---|
| 구조 | 좌/우 분리 div 2장 | 좌/우 분리 + 모바일 노이즈 | full-screen 1장 + mask |
| 색상 | 앰버 그래디언트 | 모바일: 노이즈, 데스크톱: 그래디언트 | 노이즈 + 갈색 배경 (통일) |
| mask | 없음 | 좌/우 각각 mask | 양방향 mask 1개 |
| 문제점 | "주황색 그래디언트" | 데스크톱도 여전히 그래디언트 | 그래디언트 단독 사용 없음 |

### 변경 파일

- `src/pages/CharDetail.jsx` — burn edge div 1개 추가 (비네트 뒤, Letterbox 앞)

### 연쇄 영향

| 대상 | 영향 |
|---|---|
| Ken Burns (v4.2) | 없음 — intro1 img 자체에 적용, burn edge는 별도 레이어 |
| intro1/intro2 구도 | 없음 — objectPosition 건드리지 않음 |
| 기존 필름 그레인 | 없음 — 별도 레이어, 다른 baseFrequency |
| skip | jgrBeat=0 → 조건부 렌더링으로 자동 제거 |
| reduced-motion | splashFadeIn이 전역 규칙으로 이미 비활성화됨 |
| 성능 | 정적 배경 타일 + CSS mask (filter 아님) — 기존 그레인과 동급 부하 |

### 검증

| 케이스 | 확인 항목 |
|---|---|
| JGR 데스크톱 | 양 옆에 갈색 노이즈 질감이 보이고, 중앙 캐릭터는 가려지지 않는지 |
| JGR 모바일 | 동일. 효과가 과하지 않은지 (과하면 opacity 또는 mask 비율 조정) |
| Beat 2 전환 | burn edge가 자연스럽게 사라지는지 (jgrBeat !== 1 → unmount) |
| skip | 즉시 제거 |
| 다른 캐릭터 | 영향 없음 |

### 미세 조정 가능 파라미터

| 파라미터 | 현재 | 더 미묘하게 | 더 강하게 |
|---|---|---|---|
| `opacity` | 0.45 | 0.3 | 0.6 |
| `mask 비율` | 25%/75% | 20%/80% | 30%/70% |
| `baseFrequency` | 0.4 | 0.6 (더 곱게) | 0.3 (더 거칠게) |
| `backgroundColor L` | 0.2 | 0.15 (더 어둡게) | 0.25 (좀 더 밝게) |

<!-- ✅ 승인 완료, v4.3 구현 완료 (0b11516). plan 대비 변경점: jgrBeat === 1 조건부 렌더링 → 항상 렌더 + opacity transition 방식으로 수정 (Beat 2 전환 시 부드러운 소멸 보장) -->

---

## v4.2 — Beat 1 Ken Burns 효과 (슬로우 줌+패닝)

### 목적

Beat 1(세피아) 구간에서 intro1 정지 이미지에 **느린 줌+패닝**을 적용하여 영화적 움직임 부여. 현재 Beat 1은 이미지가 완전 정지 상태 → 3.1초간 화면이 멈춰 보이는 문제.

### 접근 방식: CSS @keyframes

`objectFit: cover` + `position: absolute; inset: 0` 구조에서는 `transform: scale()` + `transform-origin` 조합으로 Ken Burns 구현. 부모 overlay가 `position: fixed; inset: 0`이라 확대된 부분이 자동 클리핑됨.

**방법 A (CSS keyframes, 추천)**:

`index.html`에 전역 keyframes 추가 → intro1 `<img>`에 `animation` 적용.

```css
/* index.html <style> 태그에 추가 */
@keyframes jgrKenBurns {
  0%   { transform: scale(1.0);  transform-origin: 30% 40%; }
  40%  { transform: scale(1.12); transform-origin: 60% 35%; }
  100% { transform: scale(1.18); transform-origin: 45% 55%; }
}
```

```jsx
// Beat 1 intro1 img (205행)
<img src={char.intro1} alt="" style={{
  position: "absolute", inset: 0, width: "100%", height: "100%",
  objectFit: "cover", objectPosition: isMobile ? "65% 50%" : "center 40%",
  filter: jgrBeat === 1 ? "sepia(0.8) brightness(0.7) contrast(1.1)" : "sepia(0) brightness(0)",
  opacity: jgrBeat === 1 ? 1 : 0,
  transition: "filter 1.5s ease-out, opacity 1s ease-out",
  // ▼ 추가: Ken Burns (>= 1 — Beat 2에서도 forwards 유지하여 스냅 방지)
  animation: jgrBeat >= 1 ? "jgrKenBurns 3.1s ease-in-out forwards" : "none",
}} />
```

**설계 근거**:

| 결정 | 이유 |
|---|---|
| CSS keyframes | JS rAF 불필요, GPU 가속 (transform만 사용), reduced-motion 미디어쿼리로 자동 비활성화 (③에서 추가한 전역 규칙) |
| `scale(1.0 → 1.18)` | 18% 확대가 영화적 움직임의 스위트 스팟. 20% 이상은 화질 저하 가능 |
| `transform-origin` 이동 | scale만으로는 줌인만 되고 패닝이 없음. origin을 `30%→60%→45%`로 이동시키면 시선이 이미지 위를 훑는 효과 |
| `forwards` | 마지막 프레임 유지 → Beat 2 전환 시 자연스러운 위치 |
| `jgrBeat >= 1` | Beat 2 진입 시 animation 제거 → forwards 스냅 방지. `>= 1`이면 Beat 2에서 opacity=0으로 페이드아웃되는 동안 마지막 프레임 유지 |
| 3.1초 | Beat 1 체류 시간(300ms→3400ms = 3.1초)과 정확히 일치 |

**방법 B (CSS transition, 대안)**:

keyframes 없이 `jgrBeat === 1`일 때 `transform`과 `transformOrigin`을 인라인으로 분기. 단점: 중간 경유점(40%)을 표현할 수 없어 직선적 움직임만 가능.

→ **방법 A 추천** (3점 경유 패닝이 영화적)

### 모바일 분기

**공용 keyframes 우선 적용** → 실제 테스트 후 얼굴 이탈이나 프레이밍 붕괴가 보일 때만 `jgrKenBurnsMobile` 분기. 처음부터 모바일 분기를 고정하지 않음 (과잉 설계 방지).

### reduced-motion 대응

기존 ③에서 추가한 `@media (prefers-reduced-motion: reduce)` 전역 규칙이 `animation-duration: 0.01ms !important`로 이미 대응. 추가 작업 없음.

### skip 대응

`skipIntro()` 호출 시 `jgrBeat`가 0으로 리셋 → `animation: "none"` 자동 적용. 추가 처리 불필요.

### 변경 파일

| 파일 | 변경 |
|---|---|
| `index.html` | `@keyframes jgrKenBurns` 1개 추가 (기존 10개 → 11개) |
| `src/pages/CharDetail.jsx` | intro1 `<img>`에 `animation` 속성 1줄 추가 |

### 연쇄 영향

| 대상 | 영향 |
|---|---|
| 다른 캐릭터 | 없음 (JgrCharDetail 내부) |
| Beat 2 / Phase 2 | 없음 (intro1만 대상, intro2는 기존 scale transition 유지) |
| reduced-motion | 기존 전역 규칙으로 자동 비활성화 |
| skip | jgrBeat=0 → animation: none 자동 |
| 성능 | transform+opacity만 사용 → GPU 합성, 리페인트 없음 |

### 검증

| 케이스 | 확인 항목 |
|---|---|
| JGR 데스크톱 | Beat 1에서 이미지가 느리게 줌인+패닝되는지, Beat 2 전환 시 끊김 없는지 |
| JGR 모바일 | 모바일 구도(65% 50%)에서 패닝이 자연스러운지, 캐릭터가 프레임 밖으로 나가지 않는지 |
| JGR skip | 클릭 시 즉시 정지, 잔여 애니메이션 없음 |
| reduced-motion | 애니메이션 비활성화 확인 |
| 다른 캐릭터 | 영향 없음 |

### 디자인 판단 사항

- `transform-origin` 경유점 값(`30%→60%→45%`)은 intro1 이미지 구도에 따라 미세 조정 필요 — 캐릭터 얼굴이 중심에서 벗어나면 어색
- 모바일에서 별도 keyframes 필요 여부는 실제 테스트 후 판단
- scale 최대값(1.18) 조정 가능: 더 극적이면 1.25, 더 미묘하면 1.1

### 피드백 (코드베이스 기준)

- **실현 가능성 높음**: 현재 `JgrCharDetail` 구조에서는 Beat 1 `intro1` 이미지가 독립 레이어라서, 전역 `@keyframes` 1개 추가 + 해당 `<img>`의 `animation` 속성 보강만으로 구현 가능. 무게도 낮은 편이며, 현재 Beat 1에서 더 무거운 축은 `filter` 전환이지 `transform` 자체가 아님.
- **현 플랜 코드 그대로는 `forwards` 유지가 깨질 수 있음**: 실제 구현 코드에서 Beat 2 진입 시점은 `3400ms`이므로, `animation: jgrBeat === 1 ? "jgrKenBurns 3.1s ease-in-out forwards" : "none"`로 두면 Beat 2 진입 순간 애니메이션이 제거되어 마지막 프레임 유지가 취소될 수 있음. 이 경우 Beat 1 이미지가 페이드아웃 직전에 원위치로 스냅될 가능성이 있음.
- **권장 수정 포인트**: `animation` 조건은 `jgrBeat === 1`보다 `jgrBeat >= 1` 쪽이 안전함. 이렇게 두면 Beat 2에서 `opacity`는 0으로 내려가더라도 Ken Burns의 마지막 프레임은 유지됨. 대안은 Beat 2에도 종료 상태의 `transform` / `transformOrigin`을 별도로 넘겨주는 방식이지만, 현재 구조에서는 조건식 보정이 더 단순하고 가벼움.

```jsx
animation: jgrBeat >= 1 ? "jgrKenBurns 3.1s ease-in-out forwards" : "none",
```

- **모바일은 성능보다 구도 리스크가 큼**: 공용 keyframes로 먼저 검증한 뒤, 얼굴 이탈이나 프레이밍 붕괴가 보일 때만 `jgrKenBurnsMobile`을 분기하는 순서가 안전함. 처음부터 모바일 분기를 고정하는 것은 과할 수 있음.
- **reduced-motion 대응은 현재도 최소 요건 충족**: 전역 규칙상 애니메이션이 사실상 즉시 종료되므로 접근성 측면에서는 충분함. 다만 정말 완전한 정지 화면이 목표라면, 나중에 JGR 전용 override를 추가하는 편이 더 정확함.
- **문서 내 stale 정보 재확인 필요**: 하단 `타이밍 (v4 정합)`의 `5000ms / 9000ms` 표기는 현재 코드와 어긋남. 현재 구현 기준 Beat 1 체류 구간은 `300ms → 3400ms`, dissolve 시작은 `7400ms`임. // 이는 트랜지션 구현에 따라 적절히 늘려도 상관 없음.
- **최종 판단**: CSS로 AF급에 가까운 슬로우 줌+패닝을 구현하려는 목적에는 적합. 다만 승인 전제는 `animation` 조건식 보정 포함임.

<!-- ✅ 승인 완료, v4.2 구현 완료 (5401a7e) -->

---

## v4.1 — 크레딧 리빌 속도 향상 + 모바일 intro2 이미지 위치 보정

### 목적

Phase 2 크레딧 프로필이 순차 리빌될 때 **간격이 너무 느리다**는 체감 개선 + 모바일에서 **intro2 배경 이미지가 우측으로 치우쳐** 캐릭터가 중앙에 오지 않는 문제 수정.

### 1. 리빌 딜레이 단축

**현재 타이밍** (각 `d(초)` 값):

| 요소 | 현재 딜레이 | 간격 |
|---|---|---|
| Chapter label | `d(0)` | — |
| Name | `d(0.3)` | 0.3초 |
| Accent line | `d(0.5)` | 0.2초 |
| Role | `d(0.7)` | 0.2초 |
| Tagline | `d(1)` | 0.3초 |
| Brief | `d(1.3)` | 0.3초 |
| Fields (4개) | `d(1.6)` ~ `d(2.05)` | 각 0.15초 |
| Traits | `d(2.2)` | 0.15초 |

**총 소요: ~2.2초 + 마지막 애니메이션 0.8초 = ~3초**

**변경 타이밍** (전체 약 40% 단축):

| 요소 | 변경 딜레이 | 간격 |
|---|---|---|
| Chapter label | `d(0)` | — |
| Name | `d(0.15)` | 0.15초 |
| Accent line | `d(0.25)` | 0.1초 |
| Role | `d(0.35)` | 0.1초 |
| Tagline | `d(0.5)` | 0.15초 |
| Brief | `d(0.7)` | 0.2초 |
| Fields (4개) | `d(0.85)` ~ `d(1.15)` | 각 0.1초 |
| Traits | `d(1.25)` | 0.1초 |

**총 소요: ~1.25초 + 마지막 애니메이션 0.6~0.8초 = ~2초** (기존 대비 약 1초 절감)

**설계 근거**:
- 첫 3개(Chapter→Name→Accent)가 빠르게 확립되면 "인물 소개" 프레임이 즉시 잡힘
- Fields 간격을 0.15→0.1초로 줄여 4개가 거의 동시에 나타나는 인상 (개별 순차감은 유지)
- skip 경로는 기존과 동일 (모든 딜레이 0)

### 2. 모바일 intro2 이미지 위치 보정

**현재 문제**:
- intro2 `objectPosition`이 모바일에서 `"45% 40%"` → 캐릭터가 우측으로 치우침
- X값을 상향 조정하여 이미지를 왼쪽으로 이동 필요 (= 뷰포트 기준 캐릭터를 중앙으로)

**현재 값 → 변경 값**:

| 위치 | 행 | 현재 모바일 값 | 변경 값 | 효과 |
|---|---|---|---|---|
| Cinematic overlay (Beat 2) | 214행 | `"45% 40%"` | `"55% 40%"` | 이미지 왼쪽 이동 |
| Fixed 배경 (Phase 2) | 274행 | `"45% 40%"` | `"55% 40%"` | 동일하게 맞춤 |

> `objectPosition` X값 ↑ = 이미지의 더 오른쪽 부분을 보여줌 = 이미지 전체가 왼쪽으로 이동
> 두 곳의 값을 동일하게 맞춰야 Beat 2 → Phase 2 전환 시 이미지 점프 없음

**텍스트/크레딧 블록**: `textAlign: left` 유지. 변경 없음.

**디자인 판단 사항**:
- 55%가 적절한지는 실제 이미지 구도에 따라 다름 → 미세 조정 가능 (50~60% 범위)
- Beat 1 intro1의 모바일 값(`"65% 50%"`)은 별도 이미지이므로 이번 변경 대상 아님 (필요 시 별도 요청)

### 변경 파일

- `src/pages/CharDetail.jsx` — JgrCharDetail 내부만 (parent 영향 0)

### 연쇄 영향

| 대상 | 영향 |
|---|---|
| 다른 캐릭터 | 없음 (JgrCharDetail module scope 분리) |
| skip 경로 | 없음 (딜레이 0 유지) |
| Expressions/Navigation | 없음 (bgDeep 커버 이후) |

### 검증

| 케이스 | 확인 항목 |
|---|---|
| JGR 데스크톱 | 크레딧 리빌 속도 체감 빨라졌는지, 이미지/텍스트 레이아웃 기존과 동일 |
| JGR 모바일 | intro2 이미지에서 캐릭터가 중앙에 위치하는지, Beat 2→Phase 2 전환 시 이미지 점프 없는지 |
| JGR 모바일 리빌 | 크레딧 텍스트 left 정렬 유지, 리빌 속도 체감 개선 |
| JGR skip | 즉시 전체 표시 (딜레이 0 유지) |
| 다른 캐릭터 | 영향 없음 확인 |

<!-- ✅ 승인 완료, v4.1 구현 완료 -->

---

## v4 아키텍처 (기존, 참조용)

## 아키텍처: 완전 분리

```
CharDetail.jsx (module scope)
├── function JgrCharDetail({ ... })   ← JGR 전용 (state/effect/JSX 전부 여기)
└── function CharDetail()             ← 공통 (JGR 코드 0줄)
      if (isJGR) return <JgrCharDetail ... />;
      // 이하 기존 100%
```

**분리 범위**: JSX + state + effect + skip handler 전부 `JgrCharDetail`로 이동. parent에 JGR 관련 코드 잔류 없음.

**중첩 선언 금지**: `JgrCharDetail`은 module scope에 선언. CharDetail 내부 중첩 시 매 render마다 remount 리스크.

---

## Fallback 주체: JgrCharDetail 내부

```jsx
function JgrCharDetail({ char, isMobile }) {
  const [jgrBeat, setJgrBeat] = useState(0);
  const [jgrAssetsReady, setJgrAssetsReady] = useState(false);
  const [jgrFallback, setJgrFallback] = useState(false);
  const [jgrFadingOut, setJgrFadingOut] = useState(false);
  const [phase, setPhase] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timerRefs = useRef([]);
  const exprSectionRef = useRef(null);

  // ... preload, beat timing, skip, etc.

  // Fallback: preload 실패 시 자체 fallback 화면
  if (jgrFallback) {
    return (
      <div style={{ background: C.bgDeep, ... }}>
        <Navbar scrolled={scrolled} isMobile={isMobile} />
        {/* 공통 인트로와 유사: 이름 + 태그라인 중앙 */}
        <section style={{ minHeight: "100vh", display: "flex", ... }}>
          <h1>{char.name}</h1>
          <p>&ldquo;{char.tagline}&rdquo;</p>
        </section>
        {/* Expressions, Navigation, Footer — 공통 */}
      </div>
    );
  }
}
```

> parent로 돌려보내기 ❌. early return 구조 유지.

---

## 타이밍 (v4 정합)

```
0ms      : 검은 화면 (char.image 미사용)
300ms    : jgrBeat 1 — intro1 세피아 페이드인 + Ken Burns + "보고있어? 이게―..."
3400ms   : jgrBeat 2 — intro2 풀컬러 페이드인 + "내 마지막 꿈이야."
7400ms   : jgrFadingOut=true — overlay opacity→0 (500ms)
7900ms   : phase 2 — 크레딧 순차 리빌 시작
```

---

## intro2 배경 종료 — bgDeep 커버 방식

`position: fixed` 배경은 viewport 기준이라 스크롤해도 사라지지 않음. 해결:

```jsx
{/* intro2 fixed 배경 */}
<div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
  <img src={char.intro2} ... style={{ objectFit: "cover" }} />
  <div style={{ /* 좌측/하단 그라데이션 */ }} />
</div>

{/* Hero 콘텐츠 (relative, z-index 2) */}
<section style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
  {/* 크레딧 블록 */}
</section>

{/* bgDeep 커버 — hero 끝에서 intro2를 물리적으로 가림 */}
<div style={{
  position: "relative", zIndex: 2,
  background: C.bgDeep,
  marginTop: 0,  // hero 바로 다음
}}>
  {/* Expressions, Navigation, Footer */}
</div>
```

스크롤하면 relative 콘텐츠가 fixed 배경 위를 지나감. bgDeep div가 위로 올라오면서 intro2를 완전히 가림 (자연스러운 parallax 종료).

---

## Navbar 복귀 — Expressions IntersectionObserver

```jsx
useEffect(() => {
  if (!exprSectionRef.current) return;
  const obs = new IntersectionObserver(
    ([entry]) => setNavbarVisible(entry.isIntersecting),
    { threshold: 0.1 }
  );
  obs.observe(exprSectionRef.current);
  return () => obs.disconnect();
}, []);
```

hero에서는 back link만. Navbar는 `navbarVisible` 시 opacity 1로 fade-in.

---

## Skip — 리빌 딜레이 압축

```jsx
const [skipped, setSkipped] = useState(false);

function skipIntro() {
  timerRefs.current.forEach(clearTimeout);
  setJgrBeat(0); setJgrFadingOut(false);
  setPhase(2); setSkipped(true);
  window.scrollTo(0, 0);
  document.body.style.overflow = "";
}

// 리빌 딜레이: skip 시 0, 일반 시 순차
const revealDelay = (s) => skipped ? "0s" : `${s}s`;
```

---

## 순차 리빌 (JgrCreditBlock)

```jsx
function JgrCreditBlock({ char, phase, isMobile, profileFields, skipped }) {
  const show = phase === 2;
  const d = (s) => skipped ? "0s" : `${s}s`;

  return (
    <div style={{ ... justifyContent: "flex-end", padding: ... }}>
      {/* Chapter label — d(0) */}
      <span style={{ opacity: show ? 1 : 0, transition: `all 0.8s ${EASE} ${d(0)}` }}>
        Jang Gru / Retake
      </span>

      {/* Name — d(0.3) */}
      <h1 style={{ opacity: show ? 1 : 0, transition: `all 0.8s ${EASE} ${d(0.3)}` }}>
        {char.name}
      </h1>

      {/* Accent line — d(0.5) */}
      <div style={{ transform: show ? "scaleX(1)" : "scaleX(0)", transition: `transform 0.6s ${EASE} ${d(0.5)}` }} />

      {/* Role — d(0.7) */}
      {/* Tagline — d(1) */}
      {/* Brief — d(1.3) */}
      {/* Fields — d(1.6+) */}
    </div>
  );
}
```

---

## 모바일 seam 검증 기준

hero `minHeight: 100vh`에서 크레딧 블록이 `justifyContent: flex-end`로 하단에 위치. 스크롤 시:
- hero 하단 20~30%에서 bgDeep 커버의 상단이 보여야 함
- bgDeep 커버 안의 Expressions eyebrow("Concept Art & Expressions")가 **살짝 예고**되어야 함
- 안 보이면: hero `minHeight`를 `90vh`로 줄이거나 Expressions 상단 여백 축소

---

## 변경 파일

| 파일 | 변경 |
|---|---|
| `src/pages/CharDetail.jsx` | 기존 JGR state/effect 전부 제거 + module scope `JgrCharDetail` 함수 추가 + `isJGR` early return |

## 검증

| 케이스 | 확인 |
|---|---|
| JGR 정상 | 검은 화면→Beat 1(4.7초)→Beat 2(4초)→dissolve→크레딧 순차 리빌→bgDeep 커버→Expressions |
| JGR skip | 클릭/wheel/ESC → 즉시 phase 2, 리빌 딜레이 0 |
| SY (기존) | 100% 정상 (parent에 JGR 코드 0줄) |
| 배경 종료 | Expressions 스크롤 시 intro2가 bgDeep 커버 뒤로 가려짐 |
| Navbar | Expressions 10% 진입 시 fade-in |
| 모바일 seam | hero 하단에서 Expressions eyebrow 살짝 예고 |
| 에셋 실패 | JgrCharDetail 내부 fallback (이름+태그라인) |
| parent 정결 | CharDetail에서 JGR state/effect 잔류 0줄 |
