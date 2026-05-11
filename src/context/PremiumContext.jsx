import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { checkPremiumStatus } from "../api/premium";

export const PremiumContext = createContext();

export function PremiumProvider({ children }) {
  const { user } = useAuth(); // Get the logged-in user
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setPlan("free");
      setExpiresAt(null);
      return;
    }

    async function load() {
      const res = await checkPremiumStatus(user.id);
      setIsPremium(res.isPremium);
      setPlan(res.plan || "free");
      setExpiresAt(res.expiresAt || null);
    }

    load();
  }, [user]);

  return (
    <PremiumContext.Provider value={{ isPremium, plan, expiresAt }}>
      {children}
    </PremiumContext.Provider>
  );
}
