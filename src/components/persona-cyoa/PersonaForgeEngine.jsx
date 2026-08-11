import { useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonaBuildPreview from "./PersonaBuildPreview";
import PersonaChoiceList from "./PersonaChoiceList";
import PersonaPromptResult from "./PersonaPromptResult";
import PersonaSceneFrame from "./PersonaSceneFrame";
import {
  compilePersonaPrompt,
  getFinalArchetype,
  mergePersonaBuild,
  mergePersonaVector,
  wrapPersonaPrompt,
} from "../../utils/personaCompiler";
import {
  createEmptyPersonaBuild,
  createEmptyPersonaStats,
  sanitizePersonaInput,
} from "../../utils/personaSchema";
import {
  postPersonaCtaTelemetry,
  savePersonaDraft,
  savePersonaRefinePayload,
} from "../../utils/personaProgress";

// See docs/persona-forge.md before changing reducer slots, storage, or prompt handoff.
function createInitialState(scenario) {
  const playerName = sanitizePersonaInput(scenario.defaultPlayerName, 40) || "프라임시티 신입";
  return {
    build: createEmptyPersonaBuild(),
    copied: false,
    currentNodeId: scenario.startNodeId,
    hasStarted: false,
    path: [],
    playerName,
    stats: createEmptyPersonaStats(),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "start":
      return { ...state, hasStarted: true, copied: false };
    case "name":
      return {
        ...state,
        playerName: sanitizePersonaInput(action.value, 40),
      };
    case "choose":
      return {
        ...state,
        build: mergePersonaBuild(state.build, action.choice.add),
        copied: false,
        currentNodeId: action.choice.next,
        path: [...state.path, action.choice.id],
        stats: mergePersonaVector(state.stats, action.choice.vector),
      };
    case "copied":
      return { ...state, copied: true };
    case "reset":
      return createInitialState(action.scenario);
    default:
      return state;
  }
}

function countPlayableNodes(scenario) {
  return Object.values(scenario.nodes || {}).filter((node) => node.id !== scenario.resultNodeId).length || 1;
}

export default function PersonaForgeEngine({ isMobile, scenario }) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, scenario, createInitialState);
  const [actionError, setActionError] = useState("");
  const currentNode = scenario.nodes?.[state.currentNodeId] || scenario.nodes?.[scenario.startNodeId];
  const isResult = currentNode?.id === scenario.resultNodeId;
  const playableNodeCount = useMemo(() => countPlayableNodes(scenario), [scenario]);
  const progress = isResult ? 100 : Math.round((state.path.length / playableNodeCount) * 100);

  // Scenario JSON feeds this reducer, while personaCompiler owns deterministic prompt assembly.
  const prompt = useMemo(
    () =>
      compilePersonaPrompt({
        scenario,
        playerName: state.playerName,
        build: state.build,
        stats: state.stats,
      }),
    [scenario, state.build, state.playerName, state.stats]
  );

  function telemetry(clickedCta) {
    return postPersonaCtaTelemetry({
      clickedCta,
      finalArchetype: getFinalArchetype(state.stats, state.build),
      scenarioId: scenario.id,
      targetCharacter: state.build.targetCharacter || "",
    });
  }

  function handleChoice(choice) {
    if (!choice?.next || !scenario.nodes?.[choice.next]) return;
    dispatch({ type: "choose", choice });
  }

  async function handleCopy() {
    setActionError("");
    try {
      await navigator.clipboard.writeText(wrapPersonaPrompt(prompt));
      dispatch({ type: "copied" });
      void telemetry("copy_prompt");
    } catch {
      setActionError("클립보드에 접근할 수 없어 복사하지 못했습니다.");
    }
  }

  function handleStartChat() {
    setActionError("");
    try {
      const draft = savePersonaDraft({
        scenario,
        playerName: state.playerName,
        build: state.build,
        stats: state.stats,
      });
      void telemetry("start_chatbot");
      navigate(`/chat?personaDraft=${encodeURIComponent(draft.draftId)}`);
    } catch {
      setActionError("페르소나 초안을 저장하지 못했습니다.");
    }
  }

  function handleRefine() {
    setActionError("");
    try {
      const { draft } = savePersonaRefinePayload({
        scenario,
        playerName: state.playerName,
        build: state.build,
        stats: state.stats,
      });
      void telemetry("refine_ai");
      navigate(`/chat?personaDraft=${encodeURIComponent(draft.draftId)}&refine=1`);
    } catch {
      setActionError("AI 다듬기 초안을 저장하지 못했습니다.");
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(320px, 380px)",
        gap: isMobile ? 16 : 22,
        alignItems: "start",
      }}
    >
      <PersonaSceneFrame
        currentNode={currentNode}
        hasStarted={state.hasStarted}
        isMobile={isMobile}
        onNameChange={(value) => dispatch({ type: "name", value })}
        onReset={() => dispatch({ type: "reset", scenario })}
        onStart={() => dispatch({ type: "start" })}
        playerName={state.playerName}
        progress={progress}
        scenario={scenario}
      >
        {isResult ? (
          <PersonaPromptResult
            copied={state.copied}
            isMobile={isMobile}
            onCopy={handleCopy}
            onRefine={handleRefine}
            onStartChat={handleStartChat}
            prompt={prompt}
          />
        ) : (
          <PersonaChoiceList
            choices={currentNode?.choices || []}
            disabled={!state.hasStarted}
            isMobile={isMobile}
            onChoose={handleChoice}
          />
        )}
        {actionError && (
          <p
            role="status"
            style={{
              margin: "14px 0 0",
              color: "oklch(67% 0.18 28)",
              fontFamily: "var(--f-body)",
              fontSize: 13,
            }}
          >
            {actionError}
          </p>
        )}
      </PersonaSceneFrame>
      <PersonaBuildPreview
        build={state.build}
        isMobile={isMobile}
        playerName={state.playerName}
        stats={state.stats}
      />
    </div>
  );
}
