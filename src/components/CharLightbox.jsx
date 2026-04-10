import C from "../styles/tokens";
import { EXPRESSION_LABELS } from "../utils/cdn";

/* ══════════════════════════════════════════════════════════
   CharLightbox — Shared image lightbox dialog
   ------------------------------------------------------------
   Used by both JgrCharDetail and default CharDetail.
   Preserves the original caption + sizing behavior.
   ══════════════════════════════════════════════════════════ */
export default function CharLightbox({ lightbox, onClose, charName, isMobile }) {
  if (!lightbox) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="이미지 상세보기"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: C.bgOverlay,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: isMobile ? "90vw" : "60vw",
          maxHeight: "80vh",
          position: "relative",
        }}
      >
        <img
          src={lightbox.src}
          alt={EXPRESSION_LABELS[lightbox.key]}
          style={{
            maxWidth: "100%", maxHeight: "80vh",
            objectFit: "contain",
            border: `1px solid ${C.border10}`,
          }}
        />
        <p style={{
          textAlign: "center",
          fontFamily: "var(--f-body)",
          fontSize: 13,
          color: C.text55,
          marginTop: 12,
        }}>
          {charName} — {EXPRESSION_LABELS[lightbox.key]}
        </p>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: -12, right: -12,
            width: 32, height: 32,
            background: C.bgDeep,
            border: `1px solid ${C.border10}`,
            borderRadius: "50%",
            color: C.text55, fontSize: 14,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
