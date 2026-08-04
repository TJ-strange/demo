import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { App } from "./app/App";
import "./lib/i18n";
import "./styles.css";

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router base={routerBase}>
      <App />
    </Router>
  </React.StrictMode>,
);
