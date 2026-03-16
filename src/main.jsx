import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const globalStyles = `
  :root {
    --f-display-kr: 'Noto Serif KR', serif;
    --f-display-en: 'Crimson Pro', serif;
    --f-body: 'Noto Sans KR', sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { overflow-x: hidden; background: oklch(0.08 0.01 280); }

  @keyframes spin {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(360deg); }
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.3; transform: scaleY(1); }
    50%      { opacity: 0.7; transform: scaleY(1.2); }
  }

  ::selection { background: oklch(0.76 0.12 80 / 0.2); color: oklch(1.0 0 0); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: oklch(0.08 0.01 280); }
  ::-webkit-scrollbar-thumb { background: oklch(0.76 0.12 80 / 0.2); border-radius: 2px; }

  @media (hover: none) { button:active { opacity: 0.85; } }
`;

const styleEl = document.createElement("style");
styleEl.textContent = globalStyles;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
