import { Link, useParams, useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import { districts } from "../data/districts";
import { characters } from "../data/characters";
import Seo from "../components/Seo";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function DistrictDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dist = districts.find((d) => d.id === id);
  const isMobile = useIsMobile();

  if (!dist) {
    return (
      <PageLayout>
          <div style={{ textAlign: "center", padding: "120px 24px", color: C.text45 }}>
            <p style={{ fontSize: 16, marginBottom: 24 }}>구역을 찾을 수 없습니다.</p>
            <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} style={{ background: "none", border: "none", padding: 0, color: C.gold, textDecoration: "none", cursor: "pointer", fontFamily: "var(--f-body)" }}>&larr; 메인으로</button>
          </div>
      </PageLayout>
    );
  }

  const relatedChars = dist.characters
    ? characters.filter((c) => dist.characters.includes(c.name))
    : [];
  const otherDistricts = districts.filter((d) => d.id !== dist.id);

  return (
    <PageLayout>
        <div>
          <Seo title={`${dist.name} — ${dist.en}`} description={dist.desc} path={`/districts/${dist.id}`} />
          <HeroSection dist={dist} isMobile={isMobile} navigate={navigate} />
          <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "0 20px" : "0 32px" }}>
            <OverviewSection dist={dist} isMobile={isMobile} />
            {dist.landmarks?.length > 0 && <LandmarkSection dist={dist} isMobile={isMobile} />}
            <LoreSection dist={dist} isMobile={isMobile} />
            {relatedChars.length > 0 && <CharacterSection chars={relatedChars} accent={dist.accent} isMobile={isMobile} />}
            <OtherDistrictsSection districts={otherDistricts} isMobile={isMobile} />
          </div>
        </div>
    </PageLayout>
  );
}

function HeroSection({ dist, isMobile, navigate }) {
  return (
    <section style={{
      position: "relative", minHeight: isMobile ? 360 : 480,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
      textAlign: "center", padding: isMobile ? "80px 24px 48px" : "100px 48px 64px", overflow: "hidden",
    }}>
      {dist.bgImage && <div style={{
        position: "absolute", inset: 0, backgroundImage: `url(${dist.bgImage})`,
        backgroundSize: "cover", backgroundPosition: "center", opacity: 0.3, filter: "brightness(0.6) saturate(0.8)",
      }} />}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, oklch(0.08 0.01 265 / 0.4) 0%, oklch(0.08 0.01 265 / 0.1) 30%, oklch(0.08 0.01 265 / 0.6) 70%, ${C.bgDeep} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, transparent 30%, ${dist.accent} 200%)`, opacity: 0.08 }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} style={{ background: "none", border: "none", padding: 0, color: C.text35, textDecoration: "none", fontSize: 11, letterSpacing: "0.1em", display: "block", marginBottom: isMobile ? 24 : 36, cursor: "pointer", fontFamily: "var(--f-body)" }}>&larr; PRIME CITY</button>
        <span style={{ fontFamily: "var(--f-display-en)", fontSize: isMobile ? 10 : 12, letterSpacing: "0.35em", textTransform: "uppercase", color: dist.accent, display: "block", marginBottom: 8 }}>{dist.en}</span>
        <h1 style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? "clamp(32px,8vw,44px)" : "clamp(40px,5vw,60px)", fontWeight: 700, color: C.white, margin: "0 0 12px", textShadow: `0 0 40px ${dist.accent}` }}>{dist.name}</h1>
        <span style={{ fontSize: 11, padding: "4px 14px", background: `color-mix(in oklch, ${dist.accent} 12%, transparent)`, border: `1px solid color-mix(in oklch, ${dist.accent} 25%, transparent)`, color: dist.accent, fontFamily: "var(--f-display-en)", letterSpacing: "0.1em" }}>{dist.tier}</span>
        {dist.quote && <p style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 13 : 15, fontStyle: "italic", color: C.text45, marginTop: 20, maxWidth: 400, lineHeight: 1.8, wordBreak: "keep-all" }}>&ldquo;{dist.quote}&rdquo;</p>}
      </div>
    </section>
  );
}

function OverviewSection({ dist, isMobile }) {
  const [ref, v] = useReveal(0.12);
  return (
    <section ref={ref} style={{ padding: isMobile ? "36px 0" : "56px 0", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `all 0.8s ${EASE}` }}>
      <p style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 16, lineHeight: 1.9, color: C.text45, fontWeight: 300, wordBreak: "keep-all", textAlign: "center" }}>{dist.desc}</p>
      {dist.vibe && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
          {dist.vibe.map((tag) => (
            <span key={tag} style={{ fontSize: 10, padding: "3px 10px", background: C.bgCard, border: `1px solid ${C.border06}`, color: dist.accent, fontFamily: "var(--f-body)", letterSpacing: "0.05em" }}>{tag}</span>
          ))}
        </div>
      )}
      {dist.agency && (
        <div style={{ marginTop: 28, padding: isMobile ? "16px 18px" : "20px 24px", background: C.bgCard, border: `1px solid ${C.border06}`, borderLeft: `3px solid ${dist.accent}` }}>
          <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.text25, display: "block", marginBottom: 6 }}>Agency</span>
          <span style={{ fontFamily: "var(--f-body)", fontSize: isMobile ? 14 : 15, color: C.text55 }}>{dist.agency}</span>
        </div>
      )}
    </section>
  );
}

function LandmarkSection({ dist, isMobile }) {
  const [ref, v] = useReveal(0.12);
  return (
    <section ref={ref} style={{ paddingBottom: isMobile ? 36 : 48, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `all 0.8s ${EASE}` }}>
      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: dist.accent, display: "block", textAlign: "center", marginBottom: 20 }}>Landmarks</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dist.landmarks.map((lm, i) => (
          <div key={lm.name} style={{
            padding: isMobile ? "14px 16px" : "16px 20px", background: C.bgCard,
            border: `1px solid ${C.border06}`, borderLeft: `2px solid ${dist.accent}`,
            opacity: v ? 1 : 0, transform: v ? "translateX(0)" : "translateX(-12px)",
            transition: `all 0.6s ${EASE} ${i * 0.08}s`,
          }}>
            <span style={{ fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 14 : 15, fontWeight: 600, color: C.white, display: "block", marginBottom: 4 }}>{lm.name}</span>
            <span style={{ fontFamily: "var(--f-body)", fontSize: 12, color: C.text35, lineHeight: 1.6, wordBreak: "keep-all" }}>{lm.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoreSection({ dist, isMobile }) {
  return (
    <section style={{ paddingBottom: isMobile ? 36 : 48 }}>
      <div style={{ width: 40, height: 1, margin: "0 auto 28px", background: `linear-gradient(90deg, transparent, ${dist.accent}, transparent)` }} />
      {dist.lore?.map((text, i) => <LoreParagraph key={i} text={text} index={i} accent={dist.accent} isMobile={isMobile} />)}
    </section>
  );
}

function LoreParagraph({ text, index, accent, isMobile }) {
  const [ref, v] = useReveal(0.15);
  return (
    <p ref={ref} style={{
      fontFamily: "var(--f-display-kr)", fontSize: isMobile ? 13 : 14, lineHeight: 2.0,
      color: C.text35, fontWeight: 300, wordBreak: "keep-all", textAlign: "justify",
      marginBottom: 24, paddingLeft: 16,
      borderLeft: `1px solid color-mix(in oklch, ${accent} 20%, transparent)`,
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
      transition: `all 0.8s ${EASE} ${index * 0.1}s`,
    }}>
      {text}
    </p>
  );
}

function CharacterSection({ chars, accent, isMobile }) {
  const [ref, v] = useReveal(0.12);
  return (
    <section ref={ref} style={{ paddingBottom: isMobile ? 36 : 48, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `all 0.8s ${EASE}` }}>
      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: accent, display: "block", textAlign: "center", marginBottom: 20 }}>Related Characters</span>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
        {chars.map((c, i) => (
          <Link key={c.id} to={c.detailPath} style={{
            textDecoration: "none", display: "flex", gap: 14, alignItems: "center",
            padding: isMobile ? "14px 16px" : "16px 20px", background: C.bgCard,
            border: `1px solid ${C.border06}`, transition: `all 0.3s ${EASE}`,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 0 12px color-mix(in oklch, ${c.color} 15%, transparent)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; e.currentTarget.style.boxShadow = "none"; }}
          >
            {c.thumbnail ? (
              <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, backgroundImage: `url(${c.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center top", border: `2px solid color-mix(in oklch, ${c.color} 30%, transparent)` }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: `color-mix(in oklch, ${c.color} 15%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display-kr)", fontSize: 16, fontWeight: 700, color: c.color }}>{c.name[0]}</div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--f-display-kr)", fontSize: 15, fontWeight: 600, color: C.white }}>{c.name}</span>
                <span style={{ fontSize: 11, color: C.text25 }}>{c.role}</span>
              </div>
              <div style={{ fontFamily: "var(--f-display-kr)", fontSize: 11, color: c.color, fontStyle: "italic", marginTop: 3, opacity: 0.7 }}>&ldquo;{c.tagline}&rdquo;</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OtherDistrictsSection({ districts: others, isMobile }) {
  const [ref, v] = useReveal(0.12);
  return (
    <section ref={ref} style={{ paddingBottom: isMobile ? 40 : 56, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: `all 0.8s ${EASE}` }}>
      <span style={{ fontFamily: "var(--f-display-en)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.text25, display: "block", textAlign: "center", marginBottom: 16 }}>Other Districts</span>
      <div style={{ display: "flex", gap: isMobile ? 8 : 12, flexWrap: "wrap", justifyContent: "center" }}>
        {others.map((d) => (
          <Link key={d.id} to={`/districts/${d.id}`} style={{
            textDecoration: "none", padding: isMobile ? "8px 14px" : "10px 18px",
            border: `1px solid ${C.border06}`, fontFamily: "var(--f-body)", fontSize: isMobile ? 11 : 12,
            color: C.text35, transition: `all 0.3s ${EASE}`, display: "flex", alignItems: "center", gap: 8,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = d.accent; e.currentTarget.style.color = d.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border06; e.currentTarget.style.color = C.text35; }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.accent, flexShrink: 0 }} />
            {d.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
