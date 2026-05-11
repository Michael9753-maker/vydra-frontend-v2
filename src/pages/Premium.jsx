import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PremiumContext } from "../context/PremiumContext";
import LoginModal from "../components/LoginModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const VERIFY_ENDPOINT =
  import.meta.env.VITE_PAYSTACK_VERIFY_ENDPOINT || `${API_BASE}/payments/verify`;
const SALE_DEADLINE_KEY = "vydra_premium_sale_deadline";

const PLANS = [
  {
    id: "weekly",
    label: "Weekly",
    originalPrice: 3000,
    price: 1499,
    duration_days: 7,
    discountPercent: 50,
    popular: false,
    badge: "Starter",
    features: ["25 downloads/day", "AI Studio access", "Priority support"],
    accent: "cyan",
  },
  {
    id: "monthly",
    label: "Monthly",
    originalPrice: 13000,
    price: 6499,
    duration_days: 30,
    discountPercent: 50,
    popular: true,
    badge: "Most Popular",
    features: ["100 downloads/day", "AI Studio access", "Priority support", "Faster queue"],
    accent: "purple",
  },
  {
    id: "quarter",
    label: "Quarter",
    originalPrice: 20000,
    price: 20000,
    duration_days: 60,
    discountPercent: 0,
    popular: false,
    badge: "Power User",
    features: ["100 downloads/day", "AI Studio access", "Priority support", "Best for heavy use"],
    accent: "blue",
  },
];

function getSaleDeadline() {
  try {
    const existing = localStorage.getItem(SALE_DEADLINE_KEY);
    if (existing) return Number(existing);

    const deadline = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem(SALE_DEADLINE_KEY, String(deadline));
    return deadline;
  } catch {
    return Date.now() + 48 * 60 * 60 * 1000;
  }
}

function formatCurrency(n) {
  try {
    return `₦${Number(n).toLocaleString()}`;
  } catch {
    return `₦${n}`;
  }
}

function formatCountdown(ms) {
  if (ms <= 0) return "Offer ended";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function getPlanLabel(planId) {
  return PLANS.find((p) => p.id === planId)?.label || "Free";
}

function IconCheck({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4z" />
    </svg>
  );
}

function IconSpark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13 2l-1 5-5 1 5 1 1 5 1-5 5-1-5-1-1-5zM2 20l20-1-4 3-3 2-3-2-4-2z"
      />
    </svg>
  );
}

function IconArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M13 5l7 7-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5z" />
    </svg>
  );
}

export default function Premium() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, plan: currentPlan, expiresAt } = useContext(PremiumContext);

  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [processingPlan, setProcessingPlan] = useState(null);

  const toastTimer = useRef(null);
  const deadlineRef = useRef(getSaleDeadline());

  const currentPlanLabel = useMemo(() => getPlanLabel(currentPlan), [currentPlan]);
  const isCurrentPlan = (planId) => isPremium && currentPlan === planId;

  useEffect(() => {
    const tick = () => {
      const remaining = deadlineRef.current - Date.now();
      setTimeLeft(formatCountdown(remaining));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(toastTimer.current);
  }, [toast]);

  function showToast(msg) {
    setToast(msg);
  }

  async function verifyPaymentOnServer(payload) {
    try {
      const res = await fetch(VERIFY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          ok: false,
          message: data?.message || data?.error || "Verification failed",
        };
      }

      const verified =
        data?.verified === true ||
        data?.status === "verified" ||
        data?.status === "success" ||
        data?.success === true;

      return {
        ok: verified,
        message: data?.message || (verified ? "Payment verified" : "Verification pending"),
        data,
      };
    } catch (err) {
      return {
        ok: false,
        message: err?.message || "Verification service unavailable",
      };
    }
  }

  async function handlePaystackSuccess(plan, response) {
    showToast("Payment complete — verifying...");

    const verification = await verifyPaymentOnServer({
      reference: response?.reference,
      plan_id: plan.id,
      user_id: user?.id,
      email: user?.email,
      amount: plan.price,
      currency: "NGN",
      source: "vydra-premium",
    });

    if (verification.ok) {
      showToast("Premium activated successfully");
      navigate("/download");
      return;
    }

    showToast(verification.message || "Verification pending");
  }

  function openPaystackCheckout(plan) {
    if (!window.PaystackPop) {
      showToast("Payment system not loaded");
      return;
    }

    const reference = `vydra_${user.id}_${plan.id}_${Date.now()}`;

    const payload = {
      key: PAYSTACK_KEY,
      email: user.email,
      amount: plan.price * 100,
      currency: "NGN",
      ref: reference,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        duration_days: plan.duration_days,
        source: "vydra-premium",
        original_price: plan.originalPrice,
        payable_price: plan.price,
      },
      callback: async (response) => {
        try {
          await handlePaystackSuccess(plan, response);
        } catch (err) {
          showToast(err?.message || "Payment verification failed");
        } finally {
          setProcessingPlan(null);
        }
      },
      onClose: () => {
        setProcessingPlan(null);
        showToast("Payment cancelled");
      },
    };

    try {
      if (typeof window.PaystackPop.setup === "function") {
        const handler = window.PaystackPop.setup(payload);
        handler.openIframe();
        return;
      }

      if (typeof window.PaystackPop === "function") {
        const paystack = new window.PaystackPop();
        if (typeof paystack.newTransaction === "function") {
          paystack.newTransaction(payload);
          return;
        }
      }

      showToast("Payment flow unavailable");
      setProcessingPlan(null);
    } catch (err) {
      setProcessingPlan(null);
      console.error("Paystack open failed", err);
      showToast("Payment initialization failed");
    }
  }

  function startPay(plan) {
    if (authLoading) {
      showToast("Checking session...");
      return;
    }

    if (!user) {
      setShowLogin(true);
      return;
    }

    if (processingPlan) {
      showToast("Payment is already processing");
      return;
    }

    if (!PAYSTACK_KEY) {
      showToast("Payment key missing");
      return;
    }

    setProcessingPlan(plan.id);
    openPaystackCheckout(plan);
  }

  const featureComparison = [
    { feature: "Downloads/day", free: "25", premium: "100" },
    { feature: "AI Studio", free: "Locked", premium: "Unlocked" },
    { feature: "Priority queue", free: "No", premium: "Yes" },
    { feature: "Ads", free: "Low priority", premium: "No" },
    { feature: "Support", free: "Standard", premium: "Priority" },
  ];

  const activePlanText = isPremium
    ? `Current plan: ${currentPlanLabel}${expiresAt ? ` • Expires ${new Date(expiresAt).toLocaleDateString()}` : ""}`
    : "Free plan active";

  return (
    <main className="vydra-premium" aria-live="polite">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-8px) translateX(6px) scale(1.03); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        @keyframes drift {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(18px, -14px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes shimmerMove {
          0% { transform: translateX(-30%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes softPulse {
          0% { box-shadow: 0 14px 40px rgba(124,91,255,0.12); }
          50% { box-shadow: 0 24px 60px rgba(62,199,192,0.18); }
          100% { box-shadow: 0 14px 40px rgba(124,91,255,0.12); }
        }
        @keyframes glowSweep {
          0% { transform: translateX(-30%) rotate(10deg); opacity: 0; }
          25% { opacity: 0.45; }
          100% { transform: translateX(130%) rotate(10deg); opacity: 0; }
        }

        .vydra-premium {
          min-height: 100vh;
          padding: 36px 18px 60px;
          color: white;
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .vydra-premium::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 15% 10%, rgba(124,91,255,0.16), transparent 24%),
            radial-gradient(circle at 85% 15%, rgba(62,199,192,0.15), transparent 22%),
            radial-gradient(circle at 50% 85%, rgba(225,48,108,0.12), transparent 26%),
            linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.03) 48%, transparent 60%);
          animation: glowSweep 10s linear infinite;
          z-index: 0;
        }

        .premium-shell {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
        }

        .premium-hero {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 34px 28px 30px;
          background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 18px 60px rgba(0,0,0,0.36);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          text-align: center;
          isolation: isolate;
        }

        .premium-hero::after {
          content: "";
          position: absolute;
          inset: -2px;
          padding: 2px;
          border-radius: 32px;
          background: linear-gradient(120deg, rgba(124,91,255,0.95), rgba(62,199,192,0.9), rgba(225,48,108,0.9), rgba(124,91,255,0.95));
          background-size: 300% 300%;
          animation: borderSpin 10s linear infinite;
          z-index: 0;
          opacity: 0.7;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(20px);
          pointer-events: none;
          z-index: 0;
        }

        .orb-1 {
          inset: -8% auto auto -8%;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(124,91,255,0.24) 0%, rgba(124,91,255,0.08) 38%, transparent 72%);
          animation: floatUp 8s ease-in-out infinite;
        }

        .orb-2 {
          inset: auto -10% 12% auto;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(62,199,192,0.2) 0%, rgba(62,199,192,0.06) 36%, transparent 72%);
          animation: floatUp 10s ease-in-out infinite;
        }

        .orb-3 {
          inset: 26% 18% auto auto;
          width: 160px;
          height: 160px;
          background: radial-gradient(circle, rgba(225,48,108,0.18) 0%, rgba(225,48,108,0.05) 36%, transparent 72%);
          animation: floatUp 11s ease-in-out infinite;
        }

        .hero-sweep {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.04) 48%, transparent 60%);
          transform: translateX(-40%);
          animation: glowSweep 12s linear infinite;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 940px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(240,244,255,0.95);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 18px;
          animation: floatUp 5.5s ease-in-out infinite;
        }

        .eyebrow-dot {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(124,91,255,0.18);
          color: #d9d0ff;
        }

        .title {
          margin: 0;
          font-size: clamp(2.8rem, 6vw, 4.9rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
        }

        .title-main {
          color: #fff;
        }

        .title-gradient {
          background: linear-gradient(90deg, #7c5bff, #e1306c, #1ab7ea);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .subtitle {
          margin-top: 14px;
          max-width: 780px;
          color: rgba(220,228,240,0.92);
          font-size: 18px;
          line-height: 1.6;
        }

        .inline-highlight {
          color: #8fe4df;
          font-weight: 800;
        }

        .hero-urgency {
          margin-top: 16px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(240,244,255,0.92);
          font-size: 13px;
          font-weight: 700;
        }

        .hero-actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 22px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(90deg, #7c5bff, #3ec7c0);
          color: #081018;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 16px 50px rgba(62,199,192,0.15);
          transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
          overflow: hidden;
        }

        .cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 50%, transparent 70%);
          transform: translateX(-60%);
          animation: shimmerMove 4.8s ease-in-out infinite;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 65px rgba(62,199,192,0.24);
          filter: saturate(1.08);
        }

        .price-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .plan-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 22px 20px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 16px 44px rgba(0,0,0,0.22);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          text-align: left;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          animation: softPulse 6s ease-in-out infinite;
        }

        .plan-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 24px 64px rgba(0,0,0,0.35);
          border-color: rgba(124,91,255,0.28);
        }

        .plan-card::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(124,91,255,0.9), rgba(62,199,192,0.82), rgba(225,48,108,0.82));
          background-size: 300% 300%;
          animation: borderSpin 8s linear infinite;
          z-index: 0;
          opacity: 0.55;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .plan-card > * {
          position: relative;
          z-index: 1;
        }

        .plan-card--featured {
          transform: translateY(-6px);
        }

        .plan-card--featured:hover {
          transform: translateY(-10px) scale(1.015);
        }

        .plan-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #ffd400 0%, #ff8a00 100%);
          color: #b30000;
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.15) inset,
            0 10px 30px rgba(255, 212, 0, 0.35);
          text-shadow: 0 1px 0 rgba(255,255,255,0.55);
        }

        .discount-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 999px;
          background: linear-gradient(90deg, #ffd400 0%, #ffea75 100%);
          color: #c00000;
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.18) inset,
            0 10px 25px rgba(255, 212, 0, 0.28);
        }

        .current-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .plan-topline {
          font-size: 12px;
          color: rgba(200,210,230,0.78);
          margin-top: 4px;
        }

        .plan-title {
          margin: 8px 0 8px;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .old-price {
          color: rgba(200,210,230,0.52);
          text-decoration: line-through;
          margin-bottom: 2px;
        }

        .plan-price {
          font-size: 38px;
          font-weight: 950;
          letter-spacing: -0.05em;
          color: #fff;
        }

        .plan-duration {
          margin-top: 4px;
          color: rgba(220,228,240,0.78);
          font-size: 14px;
        }

        .save-line {
          margin-top: 10px;
          color: rgba(200,210,230,0.9);
          font-size: 13px;
        }

        .feature-list {
          margin: 16px 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(240,244,255,0.92);
          font-size: 14px;
        }

        .feature-icon {
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(62,199,192,0.14);
          color: #8fe4df;
          flex: 0 0 auto;
        }

        .plan-btn {
          width: 100%;
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(90deg, #7c5bff, #3ec7c0);
          color: #081018;
          font-weight: 900;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
          box-shadow: 0 16px 44px rgba(62,199,192,0.14);
        }

        .plan-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 22px 60px rgba(62,199,192,0.22);
        }

        .plan-btn:disabled {
          opacity: 0.68;
          cursor: not-allowed;
        }

        .micro-proof {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          color: rgba(200,210,230,0.68);
          font-size: 13px;
        }

        .glass-block {
          margin: 18px auto 0;
          max-width: 1080px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 16px 46px rgba(0,0,0,0.22);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .comparison {
          width: 100%;
          border-collapse: collapse;
          overflow: hidden;
        }

        .comparison th,
        .comparison td {
          padding: 12px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 13px;
          text-align: left;
        }

        .comparison th {
          color: rgba(235,240,250,0.95);
        }

        .comparison td {
          color: rgba(220,230,245,0.9);
        }

        .footer-note {
          margin-top: 18px;
          color: rgba(180,190,210,0.78);
          font-size: 13px;
          text-align: center;
        }

        .toast {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(10,12,18,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff;
          box-shadow: 0 18px 48px rgba(0,0,0,0.36);
          backdrop-filter: blur(12px);
        }

        .status-strip {
          margin: 18px auto 0;
          max-width: 980px;
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(240,244,255,0.92);
          font-size: 13px;
          font-weight: 700;
        }

        .reveal {
          animation: floatUp 6s ease-in-out infinite;
        }

        @media (max-width: 960px) {
          .price-grid {
            grid-template-columns: 1fr;
          }

          .premium-hero {
            padding: 28px 18px 24px;
          }

          .title {
            letter-spacing: -0.045em;
          }
        }
      `}</style>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <div className="premium-shell">
        <section className="premium-hero">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-sweep" />

          <div className="hero-content">
            <div className="eyebrow reveal">
              <span className="eyebrow-dot">
                <IconSpark size={14} />
              </span>
              VYDRA Premium
            </div>

            <h1 className="title">
              <span className="title-main">Upgrade your</span>{" "}
              <span className="title-gradient">video power</span>
            </h1>

            <p className="subtitle">
              Unlock AI tools, higher download limits, priority access, and a smoother creator workflow. Everything is
              built to feel fast, focused, and premium.
            </p>

            <div className="hero-urgency">
              <span style={{ color: "#8fe4df" }}>•</span>
              Limited-time 50% offer ends in <strong>{timeLeft}</strong>
            </div>

            <div className="hero-actions">
              <button className="cta-btn" onClick={() => navigate("/download")}>
                Download Hub
                <IconArrowRight size={16} />
              </button>
            </div>

            <div className="status-strip">
              <span className="status-chip">✓ Secure payment with Paystack</span>
              <span className="status-chip">✓ Instant access after verification</span>
              <span className="status-chip">✓ Cancel anytime</span>
              <span className="status-chip">✓ {activePlanText}</span>
            </div>
          </div>
        </section>

        {isPremium && (
          <div className="glass-block" style={{ marginTop: 18, textAlign: "center" }}>
            You are already on <strong>{currentPlanLabel}</strong>. You can extend your access by choosing another plan.
          </div>
        )}

        <section className="price-grid" aria-label="Pricing plans" role="list">
          {PLANS.map((plan) => {
            const isDiscounted = plan.discountPercent > 0 && plan.originalPrice > plan.price;
            const save = isDiscounted ? plan.originalPrice - plan.price : 0;
            const busy = processingPlan === plan.id;
            const current = isCurrentPlan(plan.id);

            return (
              <article
                key={plan.id}
                role="listitem"
                aria-labelledby={`plan-${plan.id}-title`}
                className={`plan-card ${plan.popular ? "plan-card--featured" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!busy) startPay(plan);
                  }
                }}
              >
                {plan.popular && <div className="plan-badge popular-badge">Most Popular</div>}
                {current && <div className="current-badge">Current Plan</div>}

                <div className="plan-topline">{plan.badge}</div>

                <h3 id={`plan-${plan.id}-title`} className="plan-title">
                  {plan.label}
                </h3>

                {isDiscounted && (
                  <div className="discount-badge">
                    🔥 {plan.discountPercent}% OFF
                  </div>
                )}

                {isDiscounted && <div className="old-price">{formatCurrency(plan.originalPrice)}</div>}

                <div className="plan-price">{formatCurrency(plan.price)}</div>
                <div className="plan-duration">{plan.duration_days} days access</div>

                {isDiscounted && <div className="save-line">Save {formatCurrency(save)} today</div>}

                <ul className="feature-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="feature-item">
                      <span className="feature-icon">
                        <IconCheck size={11} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="plan-btn"
                  onClick={() => startPay(plan)}
                  disabled={authLoading || busy}
                  aria-disabled={authLoading || busy}
                  title={!user ? "You must be logged in to purchase" : `Buy ${plan.label}`}
                >
                  {!user
                    ? "Continue to secure checkout"
                    : busy
                    ? "Processing..."
                    : current
                    ? "Extend current plan"
                    : "Upgrade Now"}
                </button>

                <div className="micro-proof">
                  <span>✓ Secure payment</span>
                  <span>✓ Instant access</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="glass-block" style={{ marginTop: 18 }}>
          <h2 style={{ marginTop: 0, marginBottom: 14, textAlign: "center" }}>Free vs Premium</h2>

          <div style={{ overflowX: "auto" }}>
            <table className="comparison">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row) => (
                  <tr key={row.feature}>
                    <td style={{ fontWeight: 800 }}>{row.feature}</td>
                    <td>{row.free}</td>
                    <td>{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-block" style={{ marginTop: 18, textAlign: "center" }}>
          <div style={{ color: "rgba(220,230,245,0.92)", fontWeight: 800, marginBottom: 10 }}>
            Why people upgrade here
          </div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <div>
              <strong style={{ display: "block", marginBottom: 6 }}>Faster workflow</strong>
              Less waiting, more creating.
            </div>
            <div>
              <strong style={{ display: "block", marginBottom: 6 }}>More headroom</strong>
              Higher daily limits and AI access.
            </div>
            <div>
              <strong style={{ display: "block", marginBottom: 6 }}>Trust layer</strong>
              Paystack checkout plus server verification.
            </div>
          </div>
        </section>

        <div className="footer-note">
          Payments are processed through Paystack. If you are building the backend verification route, keep your secret
          key on the server and verify the transaction reference there before activating access.
        </div>
      </div>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
          showToast("Signed in. Choose your plan.");
        }}
      />
    </main>
  );
}