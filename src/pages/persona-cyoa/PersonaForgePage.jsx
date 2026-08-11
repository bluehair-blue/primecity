import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PersonaForgeEngine from "../../components/persona-cyoa/PersonaForgeEngine";
import Seo from "../../components/Seo";
import useIsMobile from "../../hooks/useIsMobile";
import C, { PERSONA_FORGE_COLORS as F } from "../../styles/tokens";

const scenarioModules = import.meta.glob("../../data/persona-cyoa/*.json");

function scenarioSort(a, b) {
  if (a.id === "default-forge") return -1;
  if (b.id === "default-forge") return 1;
  return a.title.localeCompare(b.title, "ko");
}

export default function PersonaForgePage() {
  const isMobile = useIsMobile(900);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioId, setScenarioId] = useState("default-forge");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadScenarios() {
      try {
        const loaded = await Promise.all(
          Object.values(scenarioModules).map(async (load) => {
            const mod = await load();
            return mod.default || mod;
          })
        );
        if (!mounted) return;
        const sorted = loaded.sort(scenarioSort);
        setScenarios(sorted);
        if (!sorted.some((scenario) => scenario.id === "default-forge")) {
          setScenarioId(sorted[0]?.id || "default-forge");
        }
      } catch {
        if (mounted) setLoadError("페르소나 시나리오를 불러오지 못했습니다.");
      }
    }
    loadScenarios();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === scenarioId) || scenarios[0],
    [scenarioId, scenarios]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${F.bgDeep}, ${C.bgDeep})`,
        color: F.textWhite,
        padding: isMobile ? "18px" : "26px",
        fontFamily: "var(--f-body)",
      }}
    >
      <Seo
        path="/persona-forge"
        title="페르소나 포지"
        description="1분 안에 AI 롤플레이용 플레이어 캐릭터와 시작 프롬프트를 완성하는 페르소나 스타팅 엔진."
      />
      <header
        style={{
          maxWidth: 1240,
          margin: "0 auto 18px",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: 14,
        }}
      >
        <Link
          to="/"
          style={{
            color: F.gold,
            textDecoration: "none",
            fontFamily: "var(--f-display-en)",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Prime City
        </Link>
        {scenarios.length > 1 && (
          <div
            role="tablist"
            aria-label="Persona Forge scenarios"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {scenarios.map((scenario) => {
              const active = scenario.id === selectedScenario?.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setScenarioId(scenario.id)}
                  style={{
                    border: `1px solid ${active ? F.gold : F.goldSoft}`,
                    borderRadius: 8,
                    background: active ? F.goldSoft : "transparent",
                    color: active ? F.textWhite : F.textMuted,
                    cursor: "pointer",
                    fontFamily: "var(--f-body)",
                    fontSize: 12,
                    padding: "9px 12px",
                  }}
                >
                  {scenario.shortTitle || scenario.title}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        {loadError ? (
          <div
            role="status"
            style={{
              border: `1px solid ${F.danger}`,
              borderRadius: 8,
              background: F.bgPanel,
              padding: 24,
              color: F.textSoft,
            }}
          >
            {loadError}
          </div>
        ) : selectedScenario ? (
          <PersonaForgeEngine
            key={selectedScenario.id}
            isMobile={isMobile}
            scenario={selectedScenario}
          />
        ) : (
          <div
            role="status"
            style={{
              border: `1px solid ${F.goldSoft}`,
              borderRadius: 8,
              background: F.bgPanel,
              padding: 24,
              color: F.textSoft,
            }}
          >
            시나리오 로딩 중
          </div>
        )}
      </section>
    </main>
  );
}
