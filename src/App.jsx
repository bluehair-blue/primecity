import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CharDetail from "./pages/CharDetail";
import SvgIntro from "./pages/SvgIntro";
import Gallery from "./pages/Gallery";
import Updates from "./pages/Updates";
import Contact from "./pages/Contact";
import Works from "./pages/Works";
import ModeAudition from "./pages/ModeAudition";
import ModeFreeplay from "./pages/ModeFreeplay";
import ModeProducer from "./pages/ModeProducer";
import DistrictDetail from "./pages/DistrictDetail";

export default function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}
