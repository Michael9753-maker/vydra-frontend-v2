import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * LoginModal
 * - open: boolean
 * - onClose: () => void
 * - onLoginSuccess: (user) => void
 *
 * Behavior:
 * - sends magic link via supabase.auth.signInWithOtp
 * - while open, listens for auth state changes (magic-link completed in same tab)
 *   and calls onLoginSuccess(session.user) then onClose()
 */

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    // Listen for auth state changes while modal is open.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (user) {
        try {
          onLoginSuccess?.(user);
        } catch (e) {
          // ignore handler errors
        }
        try {
          onClose?.();
        } catch (e) {}
      }
    });

    return () => {
      try {
        if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === "function") {
          authListener.subscription.unsubscribe();
        } else if (authListener && typeof authListener.unsubscribe === "function") {
          authListener.unsubscribe();
        }
      } catch (e) {
        // ignore
      }
    };
    // only run while open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  async function sendMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: import.meta.env.VITE_MAGIC_LINK_REDIRECT || `${window.location.origin}`,
        },
      });

      if (signError) {
        setError(signError.message || String(signError));
      } else {
        setSent(true);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal} role="dialog" aria-modal="true">
        <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>

        <h2 style={{ marginBottom: 8 }}>Login to Continue</h2>
        <p style={{ color: "#aaa", marginBottom: 20 }}>
          Enter your email to receive a secure login link.
        </p>

        {sent ? (
          <p style={{ color: "#00ffff" }}>Magic link sent. Check your email.</p>
        ) : (
          <form onSubmit={sendMagicLink}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
              aria-label="Email address"
            />
            <button type="submit" disabled={loading} style={btn}>
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(6px)",
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  position: "relative",
  width: "100%",
  maxWidth: 420,
  background: "#0f0f1a",
  padding: "28px",
  borderRadius: 16,
  color: "#fff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const input = {
  width: "100%",
  padding: 14,
  borderRadius: 8,
  border: "none",
  marginBottom: 12,
};

const btn = {
  width: "100%",
  padding: 14,
  borderRadius: 999,
  border: "none",
  background: "#00ffff",
  fontWeight: 800,
  cursor: "pointer",
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 14,
  background: "none",
  border: "none",
  color: "#aaa",
  fontSize: 18,
  cursor: "pointer",
};
