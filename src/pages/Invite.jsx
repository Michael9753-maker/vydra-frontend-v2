import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const MILESTONES = [
  { id: 1, label: "Starter", requirement: 1, reward: "+5 downloads" },
  { id: 5, label: "Momentum", requirement: 5, reward: "+20 downloads" },
  { id: 10, label: "Power User", requirement: 10, reward: "3 days premium" },
  { id: 25, label: "VIP", requirement: 25, reward: "7 days premium" },
];

function fmt(n) {
  return n != null ? Number(n).toLocaleString() : "-";
}

export default function Invite() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState({
    invites: 0,
    visits_total: 0,
    visits_today: 0,
    visits_month: 0,
  });
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  const [copyUniversalSuccess, setCopyUniversalSuccess] = useState("");
  const [sharing, setSharing] = useState(false);

  const universalLink = `${window.location.origin}/download`;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (!ref) return;

      localStorage.setItem("vydra_referrer", ref);
      localStorage.setItem("vydra_referrer_expiry", String(Date.now() + 7 * 24 * 60 * 60 * 1000));

      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.toString());

      if (!userId || userId !== ref) {
        navigate("/download");
      }
    } catch {
      // ignore
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (!authLoading && userId) {
      fetchInvite();
    } else if (!authLoading && !userId) {
      buildFallbackLink(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userId]);

  async function fetchInvite() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/invite/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        buildFallbackLink(userId);
        return;
      }

      const data = await res.json().catch(() => null);
      if (!data) {
        buildFallbackLink(userId);
        return;
      }

      if (data.referral_link) setReferralLink(data.referral_link);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError("Unable to load referral data right now.");
      buildFallbackLink(userId);
    } finally {
      setLoading(false);
    }
  }

  function buildFallbackLink(id) {
    const uid = id || "guest";
    const link = `${window.location.origin}/invite?ref=${encodeURIComponent(uid)}`;
    setReferralLink(link);
  }

  async function copyLink() {
    try {
      if (!referralLink) return;
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess("Copied");
    } catch {
      setCopySuccess("Copy failed");
    } finally {
      setTimeout(() => setCopySuccess(""), 1800);
    }
  }

  async function copyUniversal() {
    try {
      await navigator.clipboard.writeText(universalLink);
      setCopyUniversalSuccess("Copied");
    } catch {
      setCopyUniversalSuccess("Copy failed");
    } finally {
      setTimeout(() => setCopyUniversalSuccess(""), 1800);
    }
  }

  function shareWhatsApp() {
    const text = `🔥 Download videos cleanly with VYDRA — no ads, no watermark.\n\nTry it here: ${universalLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  function shareTwitter() {
    const text = `🔥 Download videos cleanly with VYDRA — no ads, no watermark. Try it: ${universalLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  function sharePersonalGeneric() {
    if (!referralLink) return;
    if (!navigator.share) {
      copyLink();
      return;
    }
    setSharing(true);
    navigator
      .share({
        title: "Join VYDRA",
        text: `🔥 Download videos cleanly with VYDRA — no ads, no watermark.\n\nUse my invite link: ${referralLink}`,
        url: referralLink,
      })
      .catch(() => {})
      .finally(() => setSharing(false));
  }

  const invites = stats?.invites || 0;
  const nextMilestone = useMemo(
    () => MILESTONES.find((m) => invites < m.requirement) || MILESTONES[MILESTONES.length - 1],
    [invites]
  );

  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((invites / nextMilestone.requirement) * 100))
    : 100;

  const progressTo25 = Math.min(100, Math.round((invites / 25) * 100));

  return (
    <main className="page-container">
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Invite & Share</h1>
          <p className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
            Share VYDRA with friends. Use the universal link to promote broadly, or share your personal invite to earn rewards.
          </p>
        </header>

        <div className="hero-card invite-panel" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "rgba(200,210,230,0.9)", marginBottom: 8 }}>
                Universal link (open to everyone)
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input className="ref-input" readOnly value={universalLink} aria-label="Universal invite link" />
                <button className="btn copy-btn" onClick={copyUniversal}>
                  {copyUniversalSuccess || "Copy"}
                </button>
                <button className="btn btn-ghost" onClick={shareWhatsApp}>
                  WhatsApp
                </button>
                <button className="btn btn-ghost" onClick={shareTwitter}>
                  Twitter
                </button>
              </div>

              <div style={{ marginTop: 10, color: "rgba(200,210,230,0.75)" }}>
                This universal link points to the Download page and is ideal for broad promotion.
                <strong> Visits via this link will not be attributed to any user.</strong>
              </div>
            </div>

            <div style={{ minWidth: 240 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Quick tips</div>
              <ul style={{ marginTop: 8, color: "rgba(200,210,230,0.8)" }}>
                <li>Use this in social bios or pinned comments.</li>
                <li>Works whether the visitor is logged in or not.</li>
                <li>No rewards are credited for this link.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="hero-card invite-panel">
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "rgba(200,210,230,0.9)", marginBottom: 8 }}>
                Personal invite (earn rewards)
              </div>

              {userId ? (
                <>
                  <div className="ref-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      className="ref-input"
                      readOnly
                      value={referralLink || (loading ? "Loading..." : "")}
                      aria-label="Personal referral link"
                    />
                    <button className="btn copy-btn" onClick={copyLink}>
                      {copySuccess || "Copy"}
                    </button>
                    <button className="btn btn-ghost" onClick={sharePersonalGeneric}>
                      {sharing ? "Sharing..." : "Share"}
                    </button>
                  </div>

                  <div style={{ marginTop: 8, color: "rgba(200,210,230,0.8)" }}>
                    Invite friends using your unique link. When a referred user completes their first successful download,
                    you’ll earn the listed reward.
                    <div style={{ marginTop: 8 }}>
                      <strong>Your stats:</strong>
                      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                        <div className="stat-card">
                          <div className="stat-label">Invites</div>
                          <div className="stat-value">{fmt(invites)}</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-label">Total Visits</div>
                          <div className="stat-value">{fmt(stats.visits_total)}</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-label">Today</div>
                          <div className="stat-value">{fmt(stats.visits_today)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color: "rgba(200,210,230,0.85)" }}>
                    Personal invites are only available to signed-in users. Sign in to generate your unique invite link and earn rewards.
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <a className="btn btn-primary" href="/login">
                      Sign in / Register
                    </a>
                    <button className="btn btn-ghost" onClick={() => buildFallbackLink(null)}>
                      Preview personal link
                    </button>
                  </div>
                </>
              )}
            </div>

            <div style={{ minWidth: 280 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Milestones & rewards</div>
              <div style={{ marginTop: 8, color: "rgba(200,210,230,0.9)" }}>
                Bring real users. Each new user who completes their first download counts.
              </div>

              <div style={{ marginTop: 12 }}>
                {MILESTONES.map((m) => {
                  const achieved = invites >= m.requirement;
                  return (
                    <div
                      key={m.id}
                      className={`milestone-row ${achieved ? "achieved" : ""}`}
                      style={{
                        marginBottom: 8,
                        padding: 10,
                        borderRadius: 8,
                        background: achieved
                          ? "linear-gradient(90deg,#07202a,#0b1720)"
                          : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {m.label}{" "}
                        <span style={{ color: "rgba(200,210,230,0.7)", fontSize: 12 }}>
                          ({m.requirement})
                        </span>
                      </div>
                      <div style={{ color: achieved ? "#84E3B3" : "rgba(200,210,230,0.7)" }}>
                        {m.reward}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                  Progress to next reward
                </div>
                <div className="progress-track" aria-label="Referral progress">
                  <div className="progress-fill" style={{ width: `${progressToNext}%` }} />
                </div>
                <div style={{ marginTop: 8, color: "rgba(200,210,230,0.75)", fontSize: 13 }}>
                  {invites}/{nextMilestone.requirement} invites to {nextMilestone.reward}
                </div>
                <div style={{ marginTop: 10, color: "rgba(200,210,230,0.6)", fontSize: 12 }}>
                  {progressTo25}% of the way to the top reward tier.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, color: "rgba(200,210,230,0.8)" }}>
          <div style={{ marginBottom: 8 }}>
            Universal link is for broad promotion. Personal links are required for referral credit.
          </div>
        </div>
      </section>

      {copySuccess && <div className="toast">{copySuccess}</div>}
      {copyUniversalSuccess && <div className="toast">{copyUniversalSuccess}</div>}
      {error && <div className="toast toast-error">{String(error)}</div>}

      <style>{`
        .invite-panel { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ref-row { display:flex; gap:8px; align-items:center; margin-top:6px; }
        .ref-input { flex:1; min-width:200px; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); background: rgba(10,12,18,0.6); color: white; }
        .copy-btn { padding:10px 14px; border-radius:10px; background: linear-gradient(90deg,#7c5bff,#3ec7c0); color:black; font-weight:700; border:none; cursor:pointer; }
        .stats-row { margin-top:8px; display:flex; gap:12px; flex-wrap:wrap; }
        .stat-card { min-width:120px; padding:12px; border-radius:10px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); }
        .stat-label { color: rgba(200,210,230,0.75); font-size:12px; }
        .stat-value { font-weight: 800; font-size:18px; margin-top:6px; }
        .milestone-row { display:flex; align-items:center; justify-content:space-between; padding:12px; border-radius:10px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); }
        .toast { position: fixed; right: 20px; bottom: 20px; background: rgba(0,0,0,0.75); color: white; padding: 10px 14px; border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,0.6); z-index: 200; }
        .toast-error { background: #7c2d2d; }
        .progress-track { height: 16px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.03); }
        .progress-fill { height: 100%; background: linear-gradient(90deg,#7c5bff,#3ec7c0); transition: width 360ms linear; }
      `}</style>
    </main>
  );
}