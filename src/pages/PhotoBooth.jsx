import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";
import { characters } from "../data/characters";

/*
  PhotoBooth - 캐릭터별 네컷 프레임 생성 페이지.
  역할: TriangleNav에서 진입한 사용자가 로컬 사진을 브라우저 안에서만 합성하고 다운로드/마크다운 data URL을 얻는다.
  이유: 사용자 생성 이미지를 서버나 CMS에 쓰지 않는 것이 기능의 핵심 안전 계약이므로, 캔버스와 object URL만 사용한다.
  연계: App.jsx route, TriangleNav.jsx nav item, characters.js metadata, public/photobooth/characters assets.
  상세 설계와 금지사항은 반드시 ../../docs/photobooth-frame.md 를 함께 읽을 것.
*/

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const EASE = "cubic-bezier(0.22,1,0.36,1)";
const OUTPUT_FORMATS = [
  { label: "PNG", mime: "image/png", ext: "png" },
  { label: "WEBP", mime: "image/webp", ext: "webp" },
];

function alphaOklch(color, opacity) {
  if (color.includes("/")) return color;
  return color.replace(")", ` / ${opacity})`);
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${src}`));
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h, anchorX = 0.5, anchorY = 0.5) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = Math.max(0, Math.min(img.naturalWidth - sw, (img.naturalWidth - sw) * anchorX));
  const sy = Math.max(0, Math.min(img.naturalHeight - sh, (img.naturalHeight - sh) * anchorY));
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawContain(ctx, img, x, y, w, h) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function writeLabel(ctx, text, x, y, options = {}) {
  ctx.save();
  ctx.font = `${options.weight || 500} ${options.size || 28}px ${options.font || "serif"}`;
  ctx.fillStyle = options.color || C.white;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  ctx.letterSpacing = `${options.tracking || 0}px`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function getBoothCharacters() {
  return characters.map((char) => ({
    ...char,
    frameSrc: `/photobooth/characters/${char.cdnId}.webp`,
  }));
}

function getDownloadName(char, format) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  return `primecity-fourcut-${char.cdnId.toLowerCase()}-${stamp}.${format.ext}`;
}

export default function PhotoBooth() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [ref, visible] = useReveal(0.08);
  const canvasRef = useRef(null);
  const objectUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  const boothCharacters = useMemo(() => getBoothCharacters(), []);
  const [selectedId, setSelectedId] = useState("SY");
  const [userPhotoUrl, setUserPhotoUrl] = useState("");
  const [userPhotoName, setUserPhotoName] = useState("");
  const [formatMime, setFormatMime] = useState("image/png");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState("");

  const selectedChar = boothCharacters.find((char) => char.cdnId === selectedId) || boothCharacters[0];
  const selectedFormat = OUTPUT_FORMATS.find((f) => f.mime === formatMime) || OUTPUT_FORMATS[0];

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    drawFrame({ exportImage: false }).catch((err) => setMessage(err.message));
  }, [selectedId, userPhotoUrl, formatMime]);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 사용할 수 있습니다.");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setUserPhotoUrl(nextUrl);
    setUserPhotoName(file.name);
    setResult(null);
    setMessage("사진은 서버로 전송되지 않고 현재 브라우저 메모리에서만 열렸습니다.");
    setCopyState("");
  }

  function clearPhoto() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUserPhotoUrl("");
    setUserPhotoName("");
    setResult(null);
    setCopyState("");
    setMessage("사진과 생성 결과를 이 브라우저 화면에서 제거했습니다.");
  }

  async function drawFrame({ exportImage }) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const [characterImage, userImage] = await Promise.all([
      loadCanvasImage(selectedChar.frameSrc),
      userPhotoUrl ? loadCanvasImage(userPhotoUrl) : Promise.resolve(null),
    ]);

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = C.bgDeep;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const accent = selectedChar.color || C.gold;
    const pad = 72;
    const innerX = pad;
    const innerY = 190;
    const innerW = CANVAS_W - pad * 2;
    const slotH = 342;
    const gap = 28;
    const sideW = 284;

    const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bgGradient.addColorStop(0, alphaOklch(accent, 0.28));
    bgGradient.addColorStop(0.44, C.bgDeep);
    bgGradient.addColorStop(1, alphaOklch(C.primeBlue, 0.22));
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.strokeStyle = alphaOklch(C.gold, 0.48);
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, CANVAS_W - 72, CANVAS_H - 72);
    ctx.strokeStyle = alphaOklch(accent, 0.34);
    ctx.lineWidth = 2;
    ctx.strokeRect(54, 54, CANVAS_W - 108, CANVAS_H - 108);

    writeLabel(ctx, "PRIME CITY", CANVAS_W / 2, 92, {
      size: 34,
      weight: 700,
      color: C.gold,
      align: "center",
      font: "Georgia, serif",
      tracking: 4,
    });
    writeLabel(ctx, "FOUR CUT PHOTO FRAME", CANVAS_W / 2, 136, {
      size: 22,
      color: C.text70,
      align: "center",
      font: "Arial, sans-serif",
      tracking: 5,
    });

    const anchors = [
      [0.5, 0.42],
      [0.5, 0.5],
      [0.5, 0.58],
      [0.48, 0.5],
    ];

    for (let i = 0; i < 4; i += 1) {
      const y = innerY + i * (slotH + gap);
      const characterLeft = i % 2 === 1;
      const photoX = characterLeft ? innerX + sideW : innerX;
      const charX = characterLeft ? innerX : innerX + innerW - sideW;
      const photoW = innerW - sideW;

      ctx.fillStyle = C.white;
      ctx.fillRect(innerX, y, innerW, slotH);
      ctx.strokeStyle = alphaOklch(C.gold, 0.34);
      ctx.lineWidth = 2;
      ctx.strokeRect(innerX, y, innerW, slotH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, y, photoW, slotH);
      ctx.clip();
      if (userImage) {
        drawCover(ctx, userImage, photoX, y, photoW, slotH, anchors[i][0], anchors[i][1]);
      } else {
        ctx.fillStyle = "oklch(0.18 0.02 265)";
        ctx.fillRect(photoX, y, photoW, slotH);
        ctx.strokeStyle = alphaOklch(C.gold, 0.26);
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 14]);
        ctx.strokeRect(photoX + 28, y + 28, photoW - 56, slotH - 56);
        ctx.setLineDash([]);
        writeLabel(ctx, "UPLOAD", photoX + photoW / 2, y + slotH / 2 - 8, {
          size: 36,
          weight: 700,
          align: "center",
          color: C.gold,
          font: "Arial, sans-serif",
          tracking: 3,
        });
        writeLabel(ctx, "YOUR PHOTO", photoX + photoW / 2, y + slotH / 2 + 34, {
          size: 22,
          align: "center",
          color: C.text55,
          font: "Arial, sans-serif",
          tracking: 2,
        });
      }
      const wash = ctx.createLinearGradient(photoX, y, photoX + photoW, y + slotH);
      wash.addColorStop(0, "oklch(0 0 0 / 0)");
      wash.addColorStop(1, alphaOklch(accent, 0.12));
      ctx.fillStyle = wash;
      ctx.fillRect(photoX, y, photoW, slotH);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(charX, y, sideW, slotH);
      ctx.clip();
      ctx.fillStyle = alphaOklch(accent, 0.22);
      ctx.fillRect(charX, y, sideW, slotH);
      drawCover(ctx, characterImage, charX, y, sideW, slotH, 0.5, 0.35);
      const charShade = ctx.createLinearGradient(charX, y, charX, y + slotH);
      charShade.addColorStop(0, "oklch(0 0 0 / 0)");
      charShade.addColorStop(1, "oklch(0 0 0 / 0.48)");
      ctx.fillStyle = charShade;
      ctx.fillRect(charX, y, sideW, slotH);
      ctx.restore();

      ctx.fillStyle = characterLeft ? "oklch(0 0 0 / 0.54)" : "oklch(0 0 0 / 0.44)";
      ctx.fillRect(charX, y + slotH - 66, sideW, 66);
      writeLabel(ctx, selectedChar.name, charX + sideW / 2, y + slotH - 36, {
        size: 30,
        weight: 700,
        align: "center",
        color: C.white,
        font: "serif",
      });
      writeLabel(ctx, selectedChar.cdnId, charX + sideW / 2, y + slotH - 12, {
        size: 15,
        align: "center",
        color: C.gold,
        font: "Arial, sans-serif",
        tracking: 4,
      });

      ctx.fillStyle = alphaOklch(accent, 0.72);
      ctx.fillRect(characterLeft ? photoX + photoW - 6 : photoX, y, 6, slotH);
      ctx.fillStyle = "oklch(0 0 0 / 0.32)";
      ctx.fillRect(photoX, y + slotH - 38, photoW, 38);
      writeLabel(ctx, `${String(i + 1).padStart(2, "0")}  ${selectedChar.tagline}`, photoX + 20, y + slotH - 13, {
        size: 18,
        color: C.text90,
        font: "Arial, sans-serif",
      });
    }

    const footerY = innerY + 4 * (slotH + gap) + 30;
    ctx.fillStyle = alphaOklch(accent, 0.12);
    ctx.fillRect(72, footerY, CANVAS_W - 144, 118);
    ctx.strokeStyle = alphaOklch(accent, 0.34);
    ctx.strokeRect(72, footerY, CANVAS_W - 144, 118);

    writeLabel(ctx, `${selectedChar.name} / ${selectedChar.agency}`, 104, footerY + 42, {
      size: 26,
      weight: 700,
      color: C.white,
      font: "serif",
    });
    writeLabel(ctx, "LOCAL BROWSER CACHE ONLY - NOT UPLOADED - NOT STORED", 104, footerY + 82, {
      size: 18,
      color: C.gold,
      font: "Arial, sans-serif",
      tracking: 2,
    });
    drawContain(ctx, characterImage, CANVAS_W - 214, footerY + 16, 104, 88);

    if (!exportImage) return null;

    const dataUrl = canvas.toDataURL(selectedFormat.mime, 0.94);
    const actualFormat = dataUrl.startsWith(`data:${selectedFormat.mime}`)
      ? selectedFormat
      : OUTPUT_FORMATS[0];
    const markdown = `![](${dataUrl})`;
    return {
      href: dataUrl,
      markdown,
      downloadName: getDownloadName(selectedChar, actualFormat),
      actualLabel: actualFormat.label,
    };
  }

  async function generateImage() {
    if (!userPhotoUrl) {
      setMessage("먼저 본인 사진을 선택해 주세요.");
      return;
    }
    setBusy(true);
    setCopyState("");
    try {
      const nextResult = await drawFrame({ exportImage: true });
      setResult(nextResult);
      setMessage(
        nextResult.actualLabel === selectedFormat.label
          ? `${selectedFormat.label} 결과를 이 브라우저 안에서 생성했습니다.`
          : "이 브라우저가 WEBP 내보내기를 지원하지 않아 PNG로 생성했습니다."
      );
    } catch (err) {
      setMessage(err.message || "이미지 생성에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function copyMarkdown() {
    if (!result?.markdown) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopyState("복사 완료");
    } catch {
      setCopyState("아래 텍스트를 직접 선택해 복사해 주세요.");
    }
  }

  const panelStyle = {
    background: C.bgCard,
    border: `1px solid ${C.border06}`,
    position: "relative",
    overflow: "hidden",
  };

  const buttonBase = {
    fontFamily: "var(--f-body)",
    cursor: "pointer",
    transition: `background 0.3s ${EASE}, border-color 0.3s ${EASE}, color 0.3s ${EASE}, opacity 0.3s ${EASE}`,
  };

  return (
    <PageLayout>
      <Seo
        title="네컷 포토부스"
        description="프라임시티 캐릭터와 함께 찍는 로컬 전용 네컷 사진 프레임."
        path="/photo-booth"
      />
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: C.text35,
            fontSize: 12,
            letterSpacing: "0.08em",
            cursor: "pointer",
            fontFamily: "var(--f-body)",
          }}
        >
          &larr; PRIME CITY
        </button>

        <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48, marginBottom: isMobile ? 28 : 42 }}>
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
            Four Cut Photo Frame
          </span>
          <h1
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(24px,7vw,34px)" : "clamp(34px,4vw,56px)",
              fontWeight: 700,
              color: C.white,
              margin: 0,
            }}
          >
            프라임 네컷 포토부스
          </h1>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: isMobile ? 12 : 13,
              color: C.text45,
              lineHeight: 1.8,
              maxWidth: 680,
              margin: "14px auto 0",
              wordBreak: "keep-all",
            }}
          >
            캐릭터를 고르고 사진을 한 장 올리면, 네컷 프레임이 현재 브라우저 안에서만 합성됩니다.
            사진은 절대 수집하지 않고 서버, DB, 운영자에게 전송되지 않으며, 오직 현재 브라우저 캐시와 메모리에서만 처리됩니다.
          </p>
          <div
            style={{
              width: 64,
              height: 1,
              margin: isMobile ? "20px auto 0" : "28px auto 0",
              background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            }}
          />
        </div>

        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(320px, 390px) minmax(0, 1fr)",
            gap: isMobile ? 20 : 28,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
          }}
        >
          <aside style={{ ...panelStyle, padding: isMobile ? 18 : 22 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${alphaOklch(selectedChar.color, 0.08)}, transparent 56%)`,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: selectedChar.color,
                }}
              >
                Step 1
              </span>
              <h2
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile ? 22 : 25,
                  color: C.white,
                  margin: "10px 0 16px",
                  fontWeight: 650,
                }}
              >
                캐릭터 선택
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {boothCharacters.map((char) => {
                  const active = char.cdnId === selectedId;
                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        setSelectedId(char.cdnId);
                        setResult(null);
                        setCopyState("");
                      }}
                      aria-label={`${char.name} 프레임 선택`}
                      style={{
                        ...buttonBase,
                        padding: 0,
                        aspectRatio: "1 / 1.18",
                        background: active ? alphaOklch(char.color, 0.18) : "oklch(0 0 0 / 0.22)",
                        border: `1px solid ${active ? char.color : C.border06}`,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={char.frameSrc}
                        alt=""
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: active ? 1 : 0.68 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: "16px 4px 5px",
                          background: "linear-gradient(transparent, oklch(0 0 0 / 0.82))",
                          color: active ? C.white : C.text70,
                          fontFamily: "var(--f-body)",
                          fontSize: 10,
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {char.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: C.gold,
                }}
              >
                Step 2
              </span>
              <h2
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile ? 22 : 25,
                  color: C.white,
                  margin: "10px 0 14px",
                  fontWeight: 650,
                }}
              >
                사진 업로드
              </h2>
              <label
                style={{
                  ...buttonBase,
                  display: "block",
                  padding: "14px 16px",
                  textAlign: "center",
                  border: `1px solid ${C.goldMuted}`,
                  color: C.gold,
                  background: C.goldDim,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}
              >
                사진 선택
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>
              {userPhotoName && (
                <p
                  style={{
                    margin: "0 0 10px",
                    fontFamily: "var(--f-body)",
                    fontSize: 11,
                    color: C.text45,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  선택됨: {userPhotoName}
                </p>
              )}
              <button
                onClick={clearPhoto}
                disabled={!userPhotoUrl}
                style={{
                  ...buttonBase,
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${C.border06}`,
                  background: "transparent",
                  color: userPhotoUrl ? C.text55 : C.text25,
                  opacity: userPhotoUrl ? 1 : 0.55,
                  fontSize: 12,
                  marginBottom: 22,
                }}
              >
                사진 지우기
              </button>

              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: C.gold,
                }}
              >
                Step 3
              </span>
              <h2
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: isMobile ? 22 : 25,
                  color: C.white,
                  margin: "10px 0 14px",
                  fontWeight: 650,
                }}
              >
                저장 포맷
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {OUTPUT_FORMATS.map((format) => {
                  const active = format.mime === formatMime;
                  return (
                    <button
                      key={format.mime}
                      onClick={() => {
                        setFormatMime(format.mime);
                        setResult(null);
                        setCopyState("");
                      }}
                      style={{
                        ...buttonBase,
                        padding: "11px 10px",
                        border: `1px solid ${active ? C.gold : C.border06}`,
                        background: active ? C.goldDim : "transparent",
                        color: active ? C.gold : C.text45,
                        fontSize: 12,
                        letterSpacing: "0.12em",
                      }}
                    >
                      {format.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={generateImage}
                disabled={!userPhotoUrl || busy}
                style={{
                  ...buttonBase,
                  width: "100%",
                  padding: "14px 18px",
                  border: "none",
                  background: userPhotoUrl && !busy
                    ? `linear-gradient(135deg, ${C.gold}, oklch(0.65 0.12 75))`
                    : C.border06,
                  color: userPhotoUrl && !busy ? C.black : C.text25,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  opacity: userPhotoUrl && !busy ? 1 : 0.65,
                }}
              >
                {busy ? "생성 중" : "네컷 이미지 생성"}
              </button>
            </div>
          </aside>

          <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 280px", gap: 18 }}>
            <div style={{ ...panelStyle, padding: isMobile ? 14 : 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--f-display-en)",
                      fontSize: 10,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: selectedChar.color,
                    }}
                  >
                    Preview
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--f-display-kr)",
                      color: C.white,
                      fontSize: isMobile ? 20 : 24,
                      margin: "7px 0 0",
                    }}
                  >
                    {selectedChar.name} 프레임
                  </h2>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    color: C.text35,
                    fontFamily: "var(--f-display-en)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                  }}
                >
                  1080 x 1920
                </span>
              </div>
              <div
                style={{
                  maxWidth: isMobile ? 420 : 520,
                  margin: "0 auto",
                  background: "oklch(0 0 0 / 0.32)",
                  border: `1px solid ${C.border06}`,
                  padding: isMobile ? 8 : 12,
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  aria-label="네컷 포토부스 미리보기"
                  style={{
                    width: "100%",
                    aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
                    display: "block",
                    background: C.bgDeep,
                  }}
                />
              </div>
            </div>

            <div style={{ ...panelStyle, padding: isMobile ? 18 : 20 }}>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 10,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: C.gold,
                }}
              >
                Local Safety
              </span>
              <h2
                style={{
                  fontFamily: "var(--f-display-kr)",
                  fontSize: 21,
                  color: C.white,
                  margin: "10px 0 12px",
                }}
              >
                사진 보관 없음
              </h2>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: C.text45,
                  margin: "0 0 16px",
                  wordBreak: "keep-all",
                }}
              >
                이 페이지는 업로드 API를 호출하지 않습니다. 선택한 사진은 브라우저 메모리의 임시 객체 URL로만 열리고, 생성 결과도 data URL로만 만들어져 오직 현재 브라우저 캐시에만 남습니다.
              </p>
              <div
                style={{
                  padding: "12px 12px",
                  border: `1px solid ${alphaOklch(selectedChar.color, 0.28)}`,
                  background: alphaOklch(selectedChar.color, 0.08),
                  marginBottom: 16,
                }}
              >
                <p style={{ margin: 0, color: C.text70, fontFamily: "var(--f-body)", fontSize: 12, lineHeight: 1.7 }}>
                  {message || "사진을 선택하면 자동으로 미리보기가 갱신됩니다."}
                </p>
              </div>

              {result ? (
                <>
                  <a
                    href={result.href}
                    download={result.downloadName}
                    style={{
                      ...buttonBase,
                      display: "block",
                      textAlign: "center",
                      textDecoration: "none",
                      padding: "12px 14px",
                      background: C.goldDim,
                      border: `1px solid ${C.goldMuted}`,
                      color: C.gold,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    {result.actualLabel} 다운로드
                  </a>
                  <button
                    onClick={copyMarkdown}
                    style={{
                      ...buttonBase,
                      width: "100%",
                      padding: "12px 14px",
                      background: "transparent",
                      border: `1px solid ${C.border10}`,
                      color: C.text70,
                      fontSize: 12,
                      marginBottom: 10,
                    }}
                  >
                    ![](링크) 복사
                  </button>
                  {copyState && (
                    <p style={{ margin: "0 0 10px", fontFamily: "var(--f-body)", color: C.text45, fontSize: 11 }}>
                      {copyState}
                    </p>
                  )}
                  <textarea
                    readOnly
                    value={result.markdown}
                    aria-label="챗봇 세션에 붙여 넣을 마크다운 이미지 링크"
                    style={{
                      width: "100%",
                      minHeight: 128,
                      boxSizing: "border-box",
                      resize: "vertical",
                      background: "oklch(0 0 0 / 0.28)",
                      border: `1px solid ${C.border06}`,
                      color: C.text55,
                      fontFamily: "monospace",
                      fontSize: 10,
                      lineHeight: 1.5,
                      padding: 10,
                    }}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </>
              ) : (
                <div
                  style={{
                    border: `1px dashed ${C.border10}`,
                    padding: "18px 14px",
                    textAlign: "center",
                    color: C.text35,
                    fontFamily: "var(--f-body)",
                    fontSize: 12,
                    lineHeight: 1.7,
                  }}
                >
                  사진 선택 후 생성하면 다운로드와 마크다운 링크가 여기에 표시됩니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
