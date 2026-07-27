import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app.js";
import "./app/styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément racine #root introuvable.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
