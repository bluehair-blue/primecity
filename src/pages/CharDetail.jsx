/* ══════════════════════════════════════════════════════════
   CharDetail — 캐릭��� 상세 페이지 디스패처
   ──────────────────────────────────────────────────────────
   역할: URL 파라미터(:name)로 캐릭터를 조회하고, 캐릭터 속성에
   따라 3가지 뷰 중 하나로 라우팅한다. 뷰 렌더링 로직은 0줄.

   분기 기준 (우선순위):
     1) char.id === "janggru" → JgrCharDetail   (레거시 intro1/intro2 시스템)
     2) char.introStyle 존재  → CinematicCharDetail (공용 Phase -1/0/1/2 상태기계)
     3) 그 외                 → DefaultCharDetail   (홀로그램 UI)

   왜 단일 라우트 + 디스패처인가?
   - prevChar/nextChar/sameAgency 계산이 3곳 공통 → 여기서 1번만 계산
   - App.jsx의 lazy 경계가 CharDetail 1개 → 코드 스플리팅 포인트 유지
   - 캐릭터 유형 추가 시 App.jsx를 건드리지 않고 이 파일만 수정

   연계 파일:
   - App.jsx:55 — lazy(() => import("./pages/CharDetail"))로 로딩
   - src/data/characters.js — 20명 캐릭터 데이터 (id, introStyle 등)
   - src/components/JgrCharDetail.jsx — 장그루 전용 뷰 (397줄)
   - src/components/CinematicCharDetail.jsx — 시네마틱 인트로 뷰 (481줄)
   - src/components/DefaultCharDetail.jsx — 기본 홀로그램 뷰 (625줄)
   ══════════════════════════════════════════════════════════ */
import { useParams, Link } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { characters } from "../data/characters";
import C from "../styles/tokens";
import JgrCharDetail from "../components/JgrCharDetail";
import CinematicCharDetail from "../components/CinematicCharDetail";
import DefaultCharDetail from "../components/DefaultCharDetail";

export default function CharDetail() {
  const { name } = useParams();
  const isMobile = useIsMobile();

  /* ── 캐릭터 조회 + 네비게이션 데이터 ──
     characters 배열 순서가 곧 이전/다음 캐릭터 순서.
     sameAgency는 CharNavigation 하단의 "같은 소속" 링크용.
     이 계산은 3개 뷰 모두 동일하게 필요하므로 디스패처에서 1회 수행. */
  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar = charIndex < characters.length - 1 ? characters[charIndex + 1] : null;
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  /* ── 404: 존재하지 않는 캐릭터 ──
     /characters/unknown 등 잘못된 URL 진입 시 표시.
     NotFound.jsx가 아닌 인라인 렌더 — CharDetail 안에서 처리해야
     lazy 경계 안에 머무르고 불필요한 리다이렉트를 피할 수 있다. */
  if (!char) {
    return (
      <div style={{
        background: C.bgDeep, color: C.white, minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-body)",
      }}>
        <p style={{ color: C.text45, fontSize: 16, marginBottom: 24 }}>
          캐릭터를 찾을 수 없습니다.
        </p>
        <Link to="/" style={{
          color: C.gold, textDecoration: "none",
          fontSize: 13, letterSpacing: "0.1em",
        }}>&larr; 메인으로 돌아가기</Link>
      </div>
    );
  }

  /* ── 3갈래 디스패치 ──
     props 객체로 spread하여 5개 공용 prop 전달.
     각 뷰는 이 props만으로 완전히 독립 동작한다. */
  const props = { char, isMobile, prevChar, nextChar, sameAgency };

  if (char.id === "janggru") return <JgrCharDetail {...props} />;
  if (char.introStyle)       return <CinematicCharDetail {...props} />;
  return <DefaultCharDetail {...props} />;
}
