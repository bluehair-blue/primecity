import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import C from "../styles/tokens";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import { galleryItems, CATEGORIES, CHARACTER_TAGS } from "../data/gallery";
import { characters } from "../data/characters";
import { EXPRESSION_LABELS } from "../utils/cdn";
import Seo from "../components/Seo";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(CATEGORIES.ALL);
  const [charFilter, setCharFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [nsfwModal, setNsfwModal] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const touchRef = useRef({ startX: 0 });

  // Parse query params on mount
  useEffect(() => {
    const charParam = searchParams.get("character");
    if (charParam) {
      setCategory(CATEGORIES.CHARACTER);
      setCharFilter(charParam);
    }
  }, [searchParams]);

  // Sync filters to URL
  function updateCategory(cat) {
    setCategory(cat);
    if (cat !== CATEGORIES.CHARACTER) {
      setCharFilter(null);
      setTagFilter(null);
      setSearchParams({});
    }
  }

  function updateCharFilter(id) {
    setCharFilter(id);
    if (id) {
      setSearchParams({ character: id });
    } else {
      setSearchParams({});
    }
  }

  // Filter items
  const filtered = galleryItems.filter((item) => {
    if (category !== CATEGORIES.ALL && item.category !== category) return false;
    if (charFilter && item.characterId && item.characterId !== charFilter) return false;
    if (charFilter && !item.characterId && category === CATEGORIES.CHARACTER) return false;
    if (tagFilter && !item.tags.includes(tagFilter)) return false;
    if (!nsfwEnabled && item.isNsfw) return false;
    // Hide items with load errors
    if (imgErrors[item.src]) return false;
    return true;
  });

  // Lightbox navigation
  function openLightbox(idx) { setLightboxIdx(idx); }
  function closeLightbox() { setLightboxIdx(null); }
  function prevLightbox() {
    if (lightboxIdx === null) return;
    setLightboxIdx(lightboxIdx > 0 ? lightboxIdx - 1 : filtered.length - 1);
  }
  function nextLightbox() {
    if (lightboxIdx === null) return;
    setLightboxIdx(lightboxIdx < filtered.length - 1 ? lightboxIdx + 1 : 0);
  }

  // Lightbox keyboard
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, filtered.length]);

  // Touch swipe
  function handleTouchStart(e) {
    touchRef.current.startX = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prevLightbox();
      else nextLightbox();
    }
  }

  // NSFW toggle handler
  function handleNsfwToggle() {
    if (nsfwEnabled) {
      setNsfwEnabled(false);
    } else {
      setNsfwModal(true);
    }
  }

  // Agency groups for accordion
  const [openAgencies, setOpenAgencies] = useState({});
  function toggleAgency(agency) {
    setOpenAgencies((prev) => ({ ...prev, [agency]: !prev[agency] }));
  }
  const agencyGroups = [
    { name: "APEX Entertainment", short: "APEX" },
    { name: "Blue Moon Entertainment", short: "Blue Moon" },
    { name: "PRISM Studio", short: "PRISM" },
    { name: "Route 0", short: "Route 0" },
    { name: "무소속", short: "무소속" },
  ];

  // Category tabs
  const tabs = [
    { key: CATEGORIES.ALL, label: "전체" },
    { key: CATEGORIES.CITY, label: "도시" },
    { key: CATEGORIES.CHARACTER, label: "캐릭터" },
  ];

  // Tag chips (only when character category active)
  const tagChips = [
    { key: null, label: "전체" },
    { key: CHARACTER_TAGS.EXPRESSION, label: "감정표현" },
    { key: CHARACTER_TAGS.DAILY, label: "일상" },
    { key: CHARACTER_TAGS.CONCEPT, label: "컨셉아트" },
    ...(nsfwEnabled ? [{ key: CHARACTER_TAGS.NSFW, label: "NSFW" }] : []),
  ];

  return (
    <PageLayout>
      {({ isMobile }) => {
        const [ref, v] = useReveal(0.05);

        return (
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Seo title="갤러리" description="프라임시티 아트 갤러리 — 도시 배경, 캐릭터 일러스트, 컨셉아트 모음." path="/gallery" />
            {/* Back link */}
            <Link to="/" style={{ color: C.text35, textDecoration: "none", fontSize: 12, letterSpacing: "0.08em" }}>
              &larr; PRIME CITY
            </Link>

            {/* Header */}
            <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 9 : 10, letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, display: "block", marginBottom: isMobile ? 10 : 16 }}>
                Art Gallery
              </span>
              <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(24px,6vw,32px)" : "clamp(30px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: 0 }}>
                아트 갤러리
              </h1>
              <div style={{ width: 56, height: 1, margin: isMobile ? "20px auto 28px" : "28px auto 40px", background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
            </div>

            {/* ══════════ Filter Bar ══════════ */}
            <div style={{ marginBottom: isMobile ? 24 : 36 }}>
              {/* Category tabs */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { updateCategory(tab.key); setTagFilter(null); }}
                    style={{
                      padding: isMobile ? "8px 16px" : "8px 20px",
                      fontFamily: "var(--f-body)", fontSize: 12,
                      color: category === tab.key ? C.bgDeep : C.text55,
                      background: category === tab.key ? C.gold : C.bgCard,
                      border: `1px solid ${category === tab.key ? C.gold : C.border06}`,
                      cursor: "pointer",
                      transition: `all 0.3s ${EASE}`,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}

                {/* NSFW toggle */}
                <button
                  onClick={handleNsfwToggle}
                  style={{
                    padding: isMobile ? "8px 14px" : "8px 18px",
                    fontFamily: "var(--f-body)", fontSize: 12,
                    color: nsfwEnabled ? "oklch(0.85 0.12 15)" : C.text35,
                    background: nsfwEnabled ? "oklch(0.85 0.12 15 / 0.1)" : C.bgCard,
                    border: `1px solid ${nsfwEnabled ? "oklch(0.85 0.12 15 / 0.3)" : C.border06}`,
                    cursor: "pointer",
                    transition: `all 0.3s ${EASE}`,
                  }}
                >
                  {nsfwEnabled ? "🔓 NSFW" : "🔒 NSFW"}
                </button>
              </div>

              {/* Character filter — agency accordion */}
              {category === CATEGORIES.CHARACTER && (
                <div style={{ marginBottom: 12 }}>
                  {/* "All characters" reset button */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                    <button
                      onClick={() => updateCharFilter(null)}
                      style={{
                        padding: "6px 14px", fontSize: 11, fontFamily: "var(--f-body)",
                        color: !charFilter ? C.gold : C.text45,
                        background: !charFilter ? `color-mix(in oklch, ${C.gold} 10%, transparent)` : "transparent",
                        border: `1px solid ${!charFilter ? C.gold : C.border06}`,
                        cursor: "pointer", transition: `all 0.3s ${EASE}`,
                      }}
                    >
                      전체 캐릭터
                    </button>
                  </div>
                  {/* Agency accordion groups */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 600, margin: "0 auto" }}>
                    {agencyGroups.map((ag) => {
                      const members = characters.filter((c) => c.agency === ag.name);
                      if (members.length === 0) return null;
                      const isOpen = openAgencies[ag.name];
                      const hasActive = members.some((c) => c.id === charFilter);
                      return (
                        <div key={ag.name}>
                          <button
                            onClick={() => toggleAgency(ag.name)}
                            style={{
                              width: "100%", padding: "8px 14px",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              fontFamily: "var(--f-display-en)", fontSize: 11, letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: hasActive ? C.gold : C.text45,
                              background: C.bgCard,
                              border: `1px solid ${hasActive ? C.goldText : C.border06}`,
                              cursor: "pointer", transition: `all 0.3s ${EASE}`,
                            }}
                          >
                            <span>{ag.short} <span style={{ fontFamily: "var(--f-body)", fontSize: 10, color: C.text25, letterSpacing: 0, textTransform: "none" }}>({members.length})</span></span>
                            <span style={{ fontSize: 10, color: C.text35, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: `transform 0.3s ${EASE}` }}>▾</span>
                          </button>
                          {isOpen && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 0 4px 12px" }}>
                              {members.map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => updateCharFilter(c.id)}
                                  style={{
                                    padding: "5px 12px", fontSize: 11, fontFamily: "var(--f-body)",
                                    color: charFilter === c.id ? c.color : C.text45,
                                    background: charFilter === c.id ? `color-mix(in oklch, ${c.color} 10%, transparent)` : "transparent",
                                    border: `1px solid ${charFilter === c.id ? c.color : C.border06}`,
                                    cursor: "pointer", transition: `all 0.3s ${EASE}`,
                                    display: "flex", alignItems: "center", gap: 6,
                                  }}
                                >
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tag filter (when CHARACTER category) */}
              {category === CATEGORIES.CHARACTER && (
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                  {tagChips.map((chip) => (
                    <button
                      key={chip.key || "all"}
                      onClick={() => setTagFilter(chip.key)}
                      style={{
                        padding: "5px 12px", fontSize: 10, fontFamily: "var(--f-display-en)",
                        letterSpacing: "0.1em",
                        color: tagFilter === chip.key ? C.white : C.text35,
                        background: tagFilter === chip.key ? `color-mix(in oklch, ${C.gold} 15%, transparent)` : "transparent",
                        border: `1px solid ${tagFilter === chip.key ? C.goldText : C.border05}`,
                        cursor: "pointer", transition: `all 0.3s ${EASE}`,
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ══════════ Masonry Grid ══════════ */}
            <div
              ref={ref}
              style={{
                columnCount: isMobile ? 2 : 3,
                columnGap: isMobile ? 8 : 14,
                opacity: v ? 1 : 0,
                transform: v ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s ${EASE}`,
              }}
            >
              {filtered.length === 0 ? (
                <div style={{ columnSpan: "all", textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: C.text35 }}>
                    해당 조건의 에셋이 없습니다.
                  </p>
                </div>
              ) : (
                filtered.map((item, i) => (
                  <div
                    key={`${item.src}-${i}`}
                    onClick={() => openLightbox(i)}
                    style={{
                      breakInside: "avoid",
                      marginBottom: isMobile ? 8 : 14,
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `1px solid ${item.isNsfw ? "oklch(0.85 0.12 15 / 0.2)" : C.border06}`,
                      transition: `border-color 0.3s ${EASE}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.characterId
                        ? (characters.find((c) => c.id === item.characterId)?.color || C.gold)
                        : C.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = item.isNsfw ? "oklch(0.85 0.12 15 / 0.2)" : C.border06;
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.caption}
                      loading="lazy"
                      onError={() => setImgErrors((prev) => ({ ...prev, [item.src]: true }))}
                      style={{
                        width: "100%",
                        display: "block",
                        transition: `transform 0.6s ${EASE}`,
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "24px 10px 8px",
                      background: `linear-gradient(transparent, ${C.bgDeep})`,
                    }}>
                      <span style={{ fontFamily: "var(--f-body)", fontSize: 11, color: C.text55 }}>
                        {item.caption}
                      </span>
                      {item.tags && item.tags.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                          {item.tags.map((tag) => (
                            <span key={tag} style={{
                              fontSize: 9, fontFamily: "var(--f-body)",
                              color: C.text25, padding: "1px 6px",
                              border: `1px solid ${C.border05}`,
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ══════════ NSFW Confirmation Modal ══════════ */}
            {nsfwModal && (
              <div
                onClick={() => setNsfwModal(false)}
                style={{
                  position: "fixed", inset: 0, zIndex: 9998,
                  background: C.bgOverlay,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: 400, padding: isMobile ? "32px 24px" : "40px 36px",
                    background: C.bgDeep,
                    border: `1px solid oklch(0.85 0.12 15 / 0.3)`,
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontFamily: "var(--f-display-en)", fontSize: 11, letterSpacing: "0.3em", color: "oklch(0.85 0.12 15)", marginBottom: 16, textTransform: "uppercase" }}>
                    Age Restriction
                  </p>
                  <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: C.text55, lineHeight: 1.7, marginBottom: 28, wordBreak: "keep-all" }}>
                    이 섹션에는 성인용 콘텐츠가 포함되어 있습니다.<br />
                    계속 진행하시겠습니까?
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button
                      onClick={() => { setNsfwEnabled(true); setNsfwModal(false); }}
                      style={{
                        padding: "10px 28px", fontFamily: "var(--f-body)", fontSize: 13,
                        color: C.white, background: "oklch(0.85 0.12 15 / 0.15)",
                        border: "1px solid oklch(0.85 0.12 15 / 0.4)",
                        cursor: "pointer", transition: `all 0.3s ${EASE}`,
                      }}
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setNsfwModal(false)}
                      style={{
                        padding: "10px 28px", fontFamily: "var(--f-body)", fontSize: 13,
                        color: C.text45, background: "transparent",
                        border: `1px solid ${C.border06}`,
                        cursor: "pointer", transition: `all 0.3s ${EASE}`,
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ Lightbox ══════════ */}
            {lightboxIdx !== null && filtered[lightboxIdx] && (
              <div
                onClick={closeLightbox}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  position: "fixed", inset: 0, zIndex: 9999,
                  background: "oklch(0.04 0.01 280 / 0.95)",
                  backdropFilter: "blur(20px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: isMobile ? "92vw" : "70vw", maxHeight: "85vh" }}>
                  <img
                    src={filtered[lightboxIdx].src}
                    alt={filtered[lightboxIdx].caption}
                    style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }}
                  />

                  {/* Info panel */}
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: C.text55, margin: "0 0 4px" }}>
                      {filtered[lightboxIdx].caption}
                    </p>
                    {filtered[lightboxIdx].tags && filtered[lightboxIdx].tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        {filtered[lightboxIdx].tags.map((tag) => (
                          <span key={tag} style={{ fontSize: 10, color: C.text35, fontFamily: "var(--f-body)" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={closeLightbox}
                    style={{
                      position: "absolute", top: -16, right: -16,
                      width: 36, height: 36, background: C.bgDeep,
                      border: `1px solid ${C.border10}`, borderRadius: "50%",
                      color: C.text55, fontSize: 16, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>

                  {/* Prev button */}
                  {!isMobile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                      style={{
                        position: "absolute", left: isMobile ? -8 : -56, top: "50%",
                        transform: "translateY(-50%)",
                        width: 40, height: 40, background: C.bgCard,
                        border: `1px solid ${C.border06}`, borderRadius: "50%",
                        color: C.text55, fontSize: 18, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: `border-color 0.3s ${EASE}`,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border06)}
                    >
                      ‹
                    </button>
                  )}

                  {/* Next button */}
                  {!isMobile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                      style={{
                        position: "absolute", right: isMobile ? -8 : -56, top: "50%",
                        transform: "translateY(-50%)",
                        width: 40, height: 40, background: C.bgCard,
                        border: `1px solid ${C.border06}`, borderRadius: "50%",
                        color: C.text55, fontSize: 18, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: `border-color 0.3s ${EASE}`,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border06)}
                    >
                      ›
                    </button>
                  )}

                  {/* Counter */}
                  <p style={{
                    position: "absolute", top: -16, left: 0,
                    fontFamily: "var(--f-display-en)", fontSize: 10, letterSpacing: "0.2em",
                    color: C.text25,
                  }}>
                    {lightboxIdx + 1} / {filtered.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </PageLayout>
  );
}
