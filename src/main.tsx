import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WidgetProvider } from "./constexts/WidgetContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WidgetProvider agent_id="1" schema="1" type="dynamic">
      <App />
    </WidgetProvider>
  </StrictMode>
);
