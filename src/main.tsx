import { createRoot } from "react-dom/client";

import App from "./app/App";
import { AppProviders } from "./app/providers";
import { initMotionQuality } from "@hooks/useAnimationQuality";
import "./styles.css";

// initMotionQuality debe correr antes del render para que data-motion
// esté en el <html> cuando GSAP lea los elementos por primera vez.
initMotionQuality();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>,
);
