import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { EDENCHAT_PLAYER_URL } from "../data/links";
import { readPersonaDraftFromUrl, readPersonaRefineFromUrl } from "../utils/personaProgress";
import C, { PERSONA_FORGE_COLORS as F } from "../styles/tokens";

export default function ChatPersonaDraftPage() {
  const [draft, setDraft] = useState(null);
  const [refinePayload, setRefinePayload] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    setDraft(readPersonaDraftFromUrl());
    setRefinePayload(readPersonaRefineFromUrl());
  }, []);

  const handoffText = useMemo(() => {
    if (refinePayload) {
      return JSON.stringify(refinePayload, null, 2);
    }
    if (!draft) return "";
    const opening = draft.openingLine || "첫 장면을 시작한다.";
    return `${opening}\n\n${draft.prompt}`;
  }, [draft, refinePayload]);

  async function handleCopy() {
    if (!handoffText) return;
    setCopyError("");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard_unavailable");
      await navigator.clipboard.writeText(handoffText);
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyError("브라우저 클립보드 권한이 없어 복사하지 못했습니다.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${F.bgDeep}, ${C.bgDeep})`,
        color: F.textWhite,
        padding: "28px 18px",
        fontFamily: "var(--f-body)",
      }}
    >
      <Seo
        path="/chat"
        title="페르소나 챗봇 연결"
        description="Persona Forge에서 만든 초안을 같은 출처 localStorage에서 읽어 채팅 시작 문장으로 준비합니다."
      />
      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <Link
          to="/persona-forge"
          style={{
            color: F.gold,
            textDecoration: "none",
            fontFamily: "var(--f-display-en)",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Persona Forge
        </Link>
        <div
          style={{
            border: `1px solid ${F.goldSoft}`,
            borderRadius: 8,
            background: F.bgPanel,
            padding: "22px",
            display: "grid",
            gap: 14,
          }}
        >
          <h1
            style={{
              margin: 0,
              color: F.textWhite,
              fontFamily: "var(--f-display-kr)",
              fontSize: 28,
              lineHeight: 1.25,
            }}
          >
            {refinePayload ? "AI 다듬기 초안" : "챗봇 시작 초안"}
          </h1>
          <p
            style={{
              margin: 0,
              color: F.textSoft,
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            {draft
              ? `${draft.playerName || "플레이어"} · ${draft.finalArchetype || "페르소나"}`
              : "저장된 페르소나 초안을 찾지 못했습니다."}
          </p>
          <textarea
            value={handoffText}
            readOnly
            rows={18}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: `1px solid ${F.goldSoft}`,
              borderRadius: 8,
              background: "oklch(10% 0.02 265 / 0.88)",
              color: F.textSoft,
              padding: 16,
              fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
              fontSize: 12,
              lineHeight: 1.65,
              resize: "vertical",
            }}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              disabled={!handoffText}
              style={buttonStyle("primary")}
            >
              {copied ? "Copied" : "Copy Prepared Text"}
            </button>
            <a
              href={EDENCHAT_PLAYER_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...buttonStyle("secondary"),
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Open EdenChat
            </a>
          </div>
          {copyError && (
            <p
              role="status"
              style={{
                margin: 0,
                color: F.danger,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {copyError}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function buttonStyle(kind) {
  const primary = kind === "primary";
  return {
    border: primary ? "none" : `1px solid ${F.goldSoft}`,
    borderRadius: 8,
    background: primary ? `linear-gradient(135deg, ${F.gold}, oklch(72% 0.12 72))` : F.bgPanelSoft,
    color: primary ? "oklch(14% 0.03 265)" : F.textSoft,
    cursor: "pointer",
    fontFamily: "var(--f-body)",
    fontWeight: 800,
    fontSize: 13,
    minHeight: 44,
    padding: "12px 16px",
  };
}
