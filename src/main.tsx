import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LearningOS } from "@/components/learning-os/app";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LearningOS />
  </StrictMode>,
);
