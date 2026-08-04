import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { App } from "./app/App";
import "./lib/i18n";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);
