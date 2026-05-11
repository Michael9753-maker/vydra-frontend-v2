import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./styles/globals.css";

import router from "./router";
import { AuthProvider } from "./context/AuthContext";
import { PremiumProvider } from "./context/PremiumContext";

// ✅ Ensure root never collapses (prevents white background flashes)
const rootElement = document.getElementById("root");
rootElement.style.minHeight = "100vh";

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <PremiumProvider>
        <RouterProvider router={router} />
      </PremiumProvider>
    </AuthProvider>
  </React.StrictMode>
);