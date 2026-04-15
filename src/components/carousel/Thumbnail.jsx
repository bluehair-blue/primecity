import C from "../../styles/tokens";

/* oklch 색상에 투명도를 안전하게 적용 */
function alpha(color, pct) {
  return `color-mix(in oklch, ${color} ${Math.round(pct * 100)}%, transparent)`;
}

export default function Thumbnail({ char, selected, onClick, index, isMobile }) {
  const size = isMobile ? 40 : 60;
  return (
    <button
      onClick={onClick}
      aria-label={char.name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: selected
          ? `2px solid ${char.color}`
          : `1px solid ${C.border10}`,
        background: selected
          ? alpha(char.color, 0.12)
          : C.bgCard,
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: selected ? `0 0 16px ${alpha(char.color, 0.25)}` : "none",
        flexShrink: 0,
        opacity: selected ? 1 : 0.5,
      }}
    >
      {char.thumbnail ? (
        <img
          src={char.thumbnail}
          alt={char.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? 14 : 16,
            fontWeight: 600,
            color: selected ? char.color : C.text35,
            transition: "color 0.3s",
          }}
        >
          {char.name[0]}
        </span>
      )}
    </button>
  );
}
