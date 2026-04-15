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

  const char = characters.find((c) => c.id === name);
  const charIndex = characters.findIndex((c) => c.id === name);
  const prevChar = charIndex > 0 ? characters[charIndex - 1] : null;
  const nextChar = charIndex < characters.length - 1 ? characters[charIndex + 1] : null;
  const sameAgency = char
    ? characters.filter((c) => c.agency === char.agency && c.id !== char.id)
    : [];

  // ── Not found ──
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

  // ── Dispatch ──
  const props = { char, isMobile, prevChar, nextChar, sameAgency };

  if (char.id === "janggru") return <JgrCharDetail {...props} />;
  if (char.introStyle)       return <CinematicCharDetail {...props} />;
  return <DefaultCharDetail {...props} />;
}
