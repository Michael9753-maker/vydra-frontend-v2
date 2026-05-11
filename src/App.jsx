import { Outlet } from "react-router-dom";
import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      {/* 🔥 Background System (stable + layered) */}
      <div className="vydra-bg" aria-hidden="true">
        <div className="vydra-bg__base" />
        <div className="vydra-bg__aurora" />
        <div className="vydra-bg__ripple" />
        <div className="vydra-bg__stars" />
        <div className="vydra-bg__noise" />
      </div>

      {/* 🔥 App Layer */}
      <div className="vydra-app">
        <Header
          user={user}
          onOpenLogin={() => setLoginOpen(true)}
          onLogout={signOut}
        />

        <main className="vydra-main" role="main">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* 🔥 Modal Layer */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setLoginOpen(false)}
      />
    </>
  );
}