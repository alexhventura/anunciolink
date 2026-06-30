import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { bootstrapAdFromUrl } from "./lib/adBootstrap";

bootstrapAdFromUrl();

const root = document.getElementById("root");
if (root) {
  void import("./App.tsx").then(({ default: App }) => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}

