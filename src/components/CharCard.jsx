import C from "../styles/tokens";

function CharSilhouette({ color }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      style={{ width: "100%", height: "100%" }}
    >
      <ellipse
        cx="60"
        cy="42"
        rx="18"
        ry="20"
        fill={color}
        fillOpacity="0.06"
        stroke={color}
        strokeOpacity="0.15"
        strokeWidth="1"
      />
      <path
        d="M38 70 Q40 58 60 56 Q80 58 82 70 L88 130 Q88 145 60 148 Q32 145 32 130 Z"
        fill={color}
        fillOpacity="0.03"
        stroke={color}
        strokeOpacity="0.1"
        strokeWidth="1"
      />
      <line
        x1="60"
        y1="82"
        x2="60"
        y2="118"
        stroke={color}
        strokeOpacity="0.08"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <circle cx="60" cy="42" r="2" fill={color} opacity="0.35">
        <animate
          attributeName="opacity"
          values="0.15;0.5;0.15"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

export default function CharCard({
  name,
  agency,
  role,
  tagline,
  color,
  index,
  visible,
  isMobile,
}) {
  return (
    <div
      style={{
        position: "relative",
        textAlign: "center",
        padding: isMobile ? "20px 14px 18px" : "28px 20px 24px",
        background: C.bgCard,
        border: `1px solid ${C.border05}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: isMobile ? 76 : 96,
          height: isMobile ? 102 : 128,
          margin: "0 auto 14px",
        }}
      >
        <CharSilhouette color={color} />
      </div>
      <h4
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 16 : 18,
          fontWeight: 600,
          color: C.white,
          margin: "0 0 4px",
        }}
      >
        {name}
      </h4>
      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: 10,
          letterSpacing: "0.06em",
          color: C.text35,
          margin: "0 0 8px",
        }}
      >
        <span style={{ color, opacity: 0.7 }}>●</span> {agency} · {role}
      </p>
      <p
        style={{
          fontFamily: "var(--f-display-kr)",
          fontSize: isMobile ? 11 : 12,
          color: C.text25,
          fontStyle: "italic",
          margin: 0,
          lineHeight: 1.6,
          wordBreak: "keep-all",
        }}
      >
        &ldquo;{tagline}&rdquo;
      </p>
    </div>
  );
}
