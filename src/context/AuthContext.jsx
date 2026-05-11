import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(data?.session?.user ?? null);
    } catch (err) {
      console.warn("Auth session refresh failed:", err?.message || err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setUser(data?.session?.user ?? null);
      } catch (err) {
        if (mounted) {
          console.warn("AuthContext getSession error:", err?.message || err);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      try {
        if (listener?.subscription && typeof listener.subscription.unsubscribe === "function") {
          listener.subscription.unsubscribe();
        } else if (typeof listener?.unsubscribe === "function") {
          listener.unsubscribe();
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout failed:", err?.message || err);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signOut,
      refreshSession,
    }),
    [user, loading, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}