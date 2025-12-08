import Forkartik from "./components/Forkartik";
import RavanVoiceAI from "./components/Ravan";
import { useEffect } from "react";
import Zol from "./components/zol";
import { useWidgetContext } from "./constexts/WidgetContext";
import ZolOrange from "./components/zolOrange";
import RavanFormAI from "./components/FormRavan";
import Maya from "./components/maya";
import Dynamic from "./components/Dynamic";
import DemoExperienceSection from "./components/DynamicForm";
function App() {
  // const { type } = useWidgetContext();
  const type = "dynamic";
  useEffect(() => {
    if (type === "zol") {
      // Apply the CSS variables when the type is 'zol'
      const root = document.documentElement;
      root.style.setProperty("--primary", "#233dff");
      root.style.setProperty("--primary-light", "#3a63ff");
      root.style.setProperty("--primary-dark", "#1a2e9b");
      root.style.setProperty("--accent", "#FFD700");
      root.style.setProperty("--surface", "#FFFFFF");
      root.style.setProperty("--surface-alpha", "rgba(255, 255, 255, 0.98)");
      root.style.setProperty("--glass", "rgba(255, 255, 255, 0.1)");
      root.style.setProperty("--glass-strong", "rgba(255, 255, 255, 0.2)");
      root.style.setProperty("--border", "rgba(35, 61, 255, 0.15)");
      root.style.setProperty("--shadow", "rgba(35, 61, 255, 0.2)");
      root.style.setProperty(
        "--gradient-primary",
        "linear-gradient(135deg, #233dff 0%, #3a63ff 50%, #5f82ff 100%)"
      );
      root.style.setProperty(
        "--gradient-accent",
        "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
      );
      root.style.setProperty(
        "--gradient-surface",
        "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)"
      );
      root.style.setProperty(
        "--gradient-glass",
        "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"
      );
      root.style.setProperty(
        "--gradient-glow",
        "radial-gradient(circle at center, #3a63ff 0%, transparent 70%)"
      );
      root.style.setProperty("--text-color", "#ffffffff");
      root.style.setProperty(
        "--safe-bottom",
        "env(safe-area-inset-bottom, 0px)"
      );
    }
  }, [type]);
  return (
    <>
      {type === "zol" ? (
        <Zol />
      ) : type === "zolorange" ? (
        <ZolOrange />
      ) : type === "formravan" ? (
        <RavanFormAI />
      ) : type === "maya" ? (
        <Maya />
      ) : type === "dynamic" ? (
        <DemoExperienceSection />
      ) : (
        <RavanVoiceAI />
      )}
      {/* <Forkartik /> */}
      {/* <RavanFormAI /> */}

      {/* <Dynamic /> */}
    </>
  );
}

export default App;
