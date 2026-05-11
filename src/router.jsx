import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import App from "./App";
import { useAuth } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Download = lazy(() => import("./pages/Download"));
const Premium = lazy(() => import("./pages/Premium"));
const AiStudio = lazy(() => import("./pages/AiStudio"));
const Login = lazy(() => import("./pages/Login"));
const Invite = lazy(() => import("./pages/Invite"));
const Legal = lazy(() => import("./pages/Legal")); // ✅ ADDED

function Loader({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "4rem", textAlign: "center", color: "#fff" }}>
          Loading...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#fff" }}>
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

const NotFound = () => (
  <div style={{ padding: "4rem", textAlign: "center", color: "#fff" }}>
    <h1 style={{ fontSize: "3rem" }}>404</h1>
    <p>Page not found.</p>
    <a href="/" style={{ color: "#00ffff" }}>
      Go Home
    </a>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Loader><Home /></Loader> },
      { path: "download", element: <Loader><Download /></Loader> },
      { path: "premium", element: <Loader><Premium /></Loader> },
      { path: "ai-studio", element: <Loader><AiStudio /></Loader> },
      { path: "login", element: <Loader><Login /></Loader> },

      // ✅ NEW LEGAL ROUTE
      { path: "legal", element: <Loader><Legal /></Loader> },

      // Invite / referral routes
      { path: "invite", element: <Loader><Invite /></Loader> },
      { path: "invite/:code", element: <Loader><Invite /></Loader> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;