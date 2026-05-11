// src/api/premium.js

const API_BASE = "http://127.0.0.1:8000";

export async function checkPremiumStatus(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/user/status/${userId}`);
    const data = await res.json();

    return {
      isPremium: data.is_premium || false,
      plan: data.plan || "free",
      expiresAt: data.expires_at || null,
      source: "backend",
    };
  } catch (err) {
    console.error("Premium check failed:", err);

    return {
      isPremium: false,
      plan: "free",
      expiresAt: null,
      source: "fallback",
    };
  }
}