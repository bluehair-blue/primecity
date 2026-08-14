import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import C from "./styles/tokens";

const CharDetail = lazy(() => import("./pages/CharDetail"));
const SvgIntro = lazy(() => import("./pages/SvgIntro"));
const Gallery = lazy(() => import("./pages/Gallery"));
const PhotoBooth = lazy(() => import("./pages/PhotoBooth"));
const Updates = lazy(() => import("./pages/Updates"));
const Contact = lazy(() => import("./pages/Contact"));
const Works = lazy(() => import("./pages/Works"));
const PrismPriorityTest = lazy(() => import("./pages/PrismPriorityTest"));
const PersonaForgePage = lazy(() => import("./pages/persona-cyoa/PersonaForgePage"));
const ChatPersonaDraftPage = lazy(() => import("./pages/ChatPersonaDraftPage"));
const ModeAudition = lazy(() => import("./pages/ModeAudition"));
const ModeFreeplay = lazy(() => import("./pages/ModeFreeplay"));
const ModeProducer = lazy(() => import("./pages/ModeProducer"));
const ModeManager = lazy(() => import("./pages/ModeManager"));
const ModeTrainee = lazy(() => import("./pages/ModeTrainee"));
const ModeComposer = lazy(() => import("./pages/ModeComposer"));
const ModeActor = lazy(() => import("./pages/ModeActor"));
const ModeInfluencer = lazy(() => import("./pages/ModeInfluencer"));
const ModeCeo = lazy(() => import("./pages/ModeCeo"));
const DistrictDetail = lazy(() => import("./pages/DistrictDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Fallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: C.bgDeep,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: `2px solid ${C.goldDim}`,
          borderTop: `2px solid ${C.gold}`,
          borderRadius: "50%",
          animation: "spinLoader 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spinLoader { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/characters/:name" element={<CharDetail />} />
          <Route path="/svg" element={<SvgIntro />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/photo-booth" element={<PhotoBooth />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/works" element={<Works />} />
          <Route path="/prism-priority-test" element={<PrismPriorityTest />} />
          <Route path="/persona-forge" element={<PersonaForgePage />} />
          <Route path="/persona-cyoa" element={<PersonaForgePage />} />
          <Route path="/chat" element={<ChatPersonaDraftPage />} />
          <Route path="/modes/audition" element={<ModeAudition />} />
          <Route path="/modes/freeplay" element={<ModeFreeplay />} />
          <Route path="/modes/producer" element={<ModeProducer />} />
          <Route path="/modes/manager" element={<ModeManager />} />
          <Route path="/modes/trainee" element={<ModeTrainee />} />
          <Route path="/modes/composer" element={<ModeComposer />} />
          <Route path="/modes/actor" element={<ModeActor />} />
          <Route path="/modes/influencer" element={<ModeInfluencer />} />
          <Route path="/modes/ceo" element={<ModeCeo />} />
          <Route path="/districts/:id" element={<DistrictDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
