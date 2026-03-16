import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CharDetail from "./pages/CharDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters/:name" element={<CharDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
