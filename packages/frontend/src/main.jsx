// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <Router>
          <App />
        </Router>
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element with id "root" not found.');
}
