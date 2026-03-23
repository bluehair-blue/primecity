import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import C from "./styles/tokens";

const CharDetail = lazy(() => import("./pages/CharDetail"));
const SvgIntro = lazy(() => import("./pages/SvgIntro"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Updates = lazy(() => import("./pages/Updates"));
const Contact = lazy(() => import("./pages/Contact"));
const Works = lazy(() => import("./pages/Works"));
const ModeAudition = lazy(() => import("./pages/ModeAudition"));
const ModeFreeplay = lazy(() => import("./pages/ModeFreeplay"));
const ModeProducer = lazy(() => import("./pages/ModeProducer"));
const DistrictDetail = lazy(() => import("./pages/DistrictDetail"));
const SvgGallery = lazy(() => import("./pages/SvgGallery"));
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
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
          <Route path="/updates" element={<Updates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/works" element={<Works />} />
          <Route path="/modes/audition" element={<ModeAudition />} />
          <Route path="/modes/freeplay" element={<ModeFreeplay />} />
          <Route path="/modes/producer" element={<ModeProducer />} />
          <Route path="/districts/:id" element={<DistrictDetail />} />
          <Route path="/svg-gallery" element={<SvgGallery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
