---
name: new-page
description: 프라임시티 프로젝트에 새 페이지를 생성하고 App.jsx에 라우트를 등록합니다
---

# 새 페이지 생성

## 인자

사용자가 다음을 제공해야 합니다:
- **파일명** (PascalCase, 예: `NewFeature`)
- **경로** (예: `/new-feature`)
- **한국어 제목** (예: `새로운 기능`)
- **영문 라벨** (예: `New Feature`)
- **페이지 설명** (한 줄)

## 절차

1. `src/pages/{파일명}.jsx` 생성 — 아래 템플릿 사용
2. `src/App.jsx`에 import 추가 + `<Route>` 등록
3. `npm run build`로 빌드 검증

## 템플릿

```jsx
import { Link } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";

export default function {파일명}() {
  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.15);

        return (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Link
              to="/"
              style={{
                color: C.text35,
                textDecoration: "none",
                fontSize: 12,
                letterSpacing: "0.08em",
              }}
            >
              &larr; PRIME CITY
            </Link>

            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: isMobile ? 9 : 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: C.gold,
                  display: "block",
                  marginBottom: isMobile ? 10 : 16,
                }}
              >
                {영문 라벨}
              </span>
              <h1
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile
                    ? "clamp(24px,6vw,32px)"
                    : "clamp(30px,3.5vw,44px)",
                  fontWeight: 700,
                  color: C.white,
                  margin: 0,
                }}
              >
                {한국어 제목}
              </h1>
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: isMobile ? "20px auto 36px" : "28px auto 56px",
                  background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                }}
              />
            </div>

            <div ref={ref} style={{
              opacity: v ? 1 : 0,
              transform: v ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}>
              {/* 콘텐츠 */}
            </div>
          </div>
        );
      }}
    </PageLayout>
  );
}
```

## 규칙

- 색상은 반드시 `src/styles/tokens.js`의 OKLCH 토큰 사용 (hex/rgb 금지)
- 폰트는 CSS 변수만 사용 (`--f-display-kr`, `--f-display-en`, `--f-body`)
- 반응형은 `isMobile` (PageLayout에서 제공) 사용
- 스크롤 애니메이션은 `useReveal` 훅 사용
- 이징 통일: `cubic-bezier(0.22, 1, 0.36, 1)`
