// src/pages/AiStudio.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { PremiumContext } from "../context/PremiumContext";

const LAST_VIDEO_CACHE_KEY = "vydra_ai_last_video_cache";
const LAST_VIDEO_CACHE_TTL_MS = 10 * 60 * 1000;

export default function AiStudio() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, plan, expiresAt } = useContext(PremiumContext);

  // Thumbnail
  const [thumbDataUrl, setThumbDataUrl] = useState(null);
  const [thumbSize, setThumbSize] = useState("1280x720");
  const [thumbLoading, setThumbLoading] = useState(false);

  // Hashtags
  const [hashtags, setHashtags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Captions
  const [captions, setCaptions] = useState([]);
  const [capLoading, setCapLoading] = useState(false);

  // Last downloaded video
  const [lastVideo, setLastVideo] = useState(null);
  const [lastVideoLoading, setLastVideoLoading] = useState(false);

  // UI helpers
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const fileAnchorRef = useRef(null);

  useEffect(() => {
    if (!authLoading) {
      loadLastDownloadedVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(msg, ms = 1400) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), ms);
  }

  function cacheLastVideo(video) {
    try {
      const payload = {
        time: Date.now(),
        data: video,
      };
      localStorage.setItem(LAST_VIDEO_CACHE_KEY, JSON.stringify(payload));
    } catch {
      // ignore cache failures
    }
  }

  function readCachedLastVideo() {
    try {
      const raw = localStorage.getItem(LAST_VIDEO_CACHE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed?.time || !parsed?.data) return null;

      if (Date.now() - parsed.time > LAST_VIDEO_CACHE_TTL_MS) {
        localStorage.removeItem(LAST_VIDEO_CACHE_KEY);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  }

  function normalizeLastVideo(record) {
    if (!record) return null;

    return {
      id: record.id || null,
      title: record.title || record.filename || "Untitled video",
      filename: record.filename || "",
      thumbnail_url: record.thumbnail_url || null,
      created_at: record.created_at || null,
      user_id: record.user_id || user?.id || null,
    };
  }

  async function loadLastDownloadedVideo() {
    setLastVideoLoading(true);

    try {
      if (!user) {
        setLastVideo(null);
        setLastVideoLoading(false);
        return;
      }

      const cached = readCachedLastVideo();
      if (cached) {
        setLastVideo(normalizeLastVideo(cached));
      }

      // Safe supabase read: fail closed, never break the UI
      const { data, error } = await supabase
        .from("download_history")
        .select("id, title, filename, thumbnail_url, created_at, user_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.warn("AiStudio loadLastDownloadedVideo supabase error:", error);
        if (!cached) setLastVideo(null);
        return;
      }

      const fresh = Array.isArray(data) && data.length ? normalizeLastVideo(data[0]) : null;
      if (fresh) {
        setLastVideo(fresh);
        cacheLastVideo(fresh);
      } else if (!cached) {
        setLastVideo(null);
      }
    } catch (err) {
      console.warn("Failed to load last downloaded video:", err);
      if (!readCachedLastVideo()) setLastVideo(null);
    } finally {
      setLastVideoLoading(false);
    }
  }

  function requirePremiumOrShow() {
    if (!user) {
      showToast("Please log in to use AI Studio");
      return false;
    }

    if (!isPremium) {
      showToast("Upgrade to Premium to unlock AI Studio");
      return false;
    }

    return true;
  }

  function requireLastVideoOrShow() {
    if (!user) {
      showToast("Please log in to use AI Studio");
      return false;
    }

    if (!lastVideo) {
      showToast("Download a video first");
      return false;
    }

    return true;
  }

  function colorFromSeed(seed, shift = 0) {
    let h = 0;
    const text = String(seed || "");
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    h = (h + shift * 997) % 360;
    return `hsl(${h}deg 85% 60%)`;
  }

  function simpleHashtagify(text) {
    const cleaned = (text || "")
      .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!cleaned) return [];

    const words = Array.from(new Set(cleaned.split(" ").filter(Boolean)));
    const top = words.slice(0, 8);
    const tags = top.map((w) => `#${w.replace(/^\d+$/, `num${w}`)}`);

    const extra = [];
    if (words.length > 0) {
      extra.push(`#${words.slice(0, 2).join("")}`);
      extra.push(`#${words.slice(0, 3).join("")}`);
    }

    return Array.from(new Set([...tags, ...extra])).slice(0, 12);
  }

  function buildCaptions(seed) {
    const base = (seed || "Amazing video").toString();
    const templates = [
      `${base} — watch, learn, and share.`,
      `This is ${base}. Clean, fast, and reliable — try VYDRA.`,
      `Experience ${base} with best quality and no clutter.`,
      `${base} • Save it, share it, create with VYDRA.`,
    ];

    const idx = Math.abs(base.length) % templates.length;
    return templates.map((t, i) => (i === 0 ? t : templates[(idx + i) % templates.length]));
  }

  async function generateThumbnail() {
    if (!requireLastVideoOrShow()) return;
    if (!requirePremiumOrShow()) return;

    setThumbLoading(true);
    try {
      const sourceTitle = (lastVideo.title || lastVideo.filename || "VYDRA Studio").toString();
      const [w, h] = thumbSize.split("x").map((s) => parseInt(s, 10) || 1280);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const c1 = colorFromSeed(sourceTitle, 1);
      const c2 = colorFromSeed(sourceTitle, 2);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 0.06;
      for (let i = 0; i < (w * h) / 40000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 3, Math.random() * 3);
      }
      ctx.globalAlpha = 1;

      const title = (sourceTitle || "VYDRA Studio").toUpperCase();
      const fontSize = Math.round(w / Math.max(10, Math.min(12, title.length / 8 + 6)));

      ctx.font = `700 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = Math.max(8, Math.round(w / 120));
      ctx.fillText(title, w / 2, h / 2);

      ctx.shadowBlur = 0;
      ctx.font = `500 ${Math.round(fontSize / 2.8)}px Inter, system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("VYDRA • AI Studio", w / 2, h / 2 + fontSize);

      const dataUrl = canvas.toDataURL("image/png");
      setThumbDataUrl(dataUrl);
      showToast("Thumbnail generated");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate thumbnail");
    } finally {
      setThumbLoading(false);
    }
  }

  function generateHashtags() {
    if (!requireLastVideoOrShow()) return;
    if (!requirePremiumOrShow()) return;

    setTagsLoading(true);
    setTimeout(() => {
      const source = (lastVideo.title || lastVideo.filename || "").toString();
      const out = simpleHashtagify(source);
      setHashtags(out);
      setTagsLoading(false);
      showToast(out.length ? "Hashtags ready" : "No keywords available");
    }, 350);
  }

  function generateCaptions() {
    if (!requireLastVideoOrShow()) return;
    if (!requirePremiumOrShow()) return;

    setCapLoading(true);
    setTimeout(() => {
      const source = (lastVideo.title || lastVideo.filename || "Amazing video").toString();
      const out = buildCaptions(source);
      setCaptions(out);
      setCapLoading(false);
      showToast("Captions generated");
    }, 450);
  }

  async function copyHashtags() {
    const text = (hashtags || []).join(" ");
    if (!text) return showToast("No hashtags to copy");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Hashtags copied");
    } catch {
      showToast("Copy failed");
    }
  }

  async function copyCaption(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Caption copied");
    } catch {
      showToast("Copy failed");
    }
  }

  function downloadThumbnail() {
    if (!thumbDataUrl) return showToast("No thumbnail to download");
    const a = fileAnchorRef.current;
    if (!a) return;
    a.href = thumbDataUrl;
    a.download = `vydra-thumbnail.png`;
    a.click();
  }

  async function copyThumbnailToClipboard() {
    if (!thumbDataUrl) return showToast("No thumbnail to copy");
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast("Image copy not supported in this browser");
      return;
    }

    try {
      const res = await fetch(thumbDataUrl);
      const blob = await res.blob();
      const clipItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipItem]);
      showToast("Image copied to clipboard");
    } catch (err) {
      console.error(err);
      showToast("Failed to copy image");
    }
  }

  function runAllPremiumAI() {
    if (!requireLastVideoOrShow()) return;
    if (!requirePremiumOrShow()) return;
    generateThumbnail();
    generateHashtags();
    generateCaptions();
  }

  useEffect(() => {
    if (lastVideo && isPremium) {
      runAllPremiumAI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastVideo, isPremium]);

  const authHint = authLoading
    ? "Checking account…"
    : !user
    ? "Please log in to access AI Studio"
    : isPremium
    ? `Premium • ${plan}${expiresAt ? ` • Expires ${new Date(expiresAt).toLocaleDateString()}` : ""}`
    : "Limited access • Upgrade to Premium for full features";

  const Card = ({ children, style = {} }) => (
    <div style={{ ...styles.card, ...style }}>{children}</div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "3.5rem 1.5rem" }}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.container}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
          <aside style={styles.sidebar}>
            <h4 style={{ margin: 0, color: "white", fontSize: 16 }}>AI Modules</h4>
            <div style={{ height: 12 }} />

            {[
              { name: "Thumbnail Generator", locked: !isPremium },
              { name: "Caption Generator", locked: !isPremium },
              { name: "Hashtag Generator", locked: !isPremium },
            ].map((t) => (
              <div key={t.name} style={t.locked ? styles.lockedItem : styles.unlockedItem}>
                <span style={{ marginRight: 8 }}>{t.locked ? "🔒" : "⚡"}</span>
                <span style={{ color: "#d7e7ff" }}>{t.name}</span>
              </div>
            ))}

            <div style={{ color: "rgba(200,210,230,0.7)", fontSize: 13, marginTop: 12 }}>
              AI Studio is premium-only. Download a video first, then generate thumbnails, captions, and hashtags from
              that video.
            </div>

            <div style={{ marginTop: 16 }}>
              {!isPremium ? (
                <a href="/premium" style={styles.upgradeBtn}>
                  Upgrade to Premium
                </a>
              ) : (
                <div style={styles.premiumBadge}>Premium Active</div>
              )}
            </div>
          </aside>

          <main style={styles.main}>
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <h1 style={{ margin: 0, color: "white", fontSize: 26 }}>AI Studio</h1>
                  <p style={{ margin: "8px 0 0 0", color: "rgba(200,210,230,0.75)" }}>
                    Small creative lab — thumbnail, caption, and hashtag helpers. It uses your latest downloaded video
                    as the source.
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "rgba(200,210,230,0.75)" }}>
                    {lastVideoLoading
                      ? "Checking download history…"
                      : lastVideo
                      ? "Using last downloaded video"
                      : "Download a video first"}
                  </div>
                  <div style={{ height: 8 }} />
                  <div style={{ fontSize: 13, color: "rgba(200,210,230,0.75)", marginBottom: 8 }}>{authHint}</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={loadLastDownloadedVideo} style={{ ...styles.btnGhost, padding: "8px 10px" }}>
                      Refresh
                    </button>
                    {lastVideo && (
                      <div style={{ color: "rgba(200,210,230,0.75)", fontSize: 13, alignSelf: "center" }}>
                        {lastVideo.title || lastVideo.filename}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={styles.cardTitle}>Generate Thumbnail</div>
                      <div style={styles.cardSub}>Create a quick shareable thumbnail image</div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(200,210,230,0.65)" }}>PNG • client-side</div>
                  </div>

                  <div style={{ height: 12 }} />

                  <label style={styles.label}>Source</label>
                  <div style={{ marginBottom: 8, color: "rgba(200,210,230,0.85)" }}>
                    {lastVideo ? lastVideo.title || lastVideo.filename : "No video"}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <label style={{ fontSize: 13, color: "rgba(200,210,230,0.8)" }}>Size</label>
                    <select value={thumbSize} onChange={(e) => setThumbSize(e.target.value)} style={styles.selectSmall}>
                      <option value="1280x720">1280×720</option>
                      <option value="1920x1080">1920×1080</option>
                      <option value="640x360">640×360</option>
                    </select>

                    <div style={{ flex: 1 }} />

                    <button
                      onClick={generateThumbnail}
                      disabled={!lastVideo || thumbLoading || !isPremium}
                      style={styles.btnPrimary}
                      title={!isPremium ? "Premium required" : undefined}
                    >
                      {thumbLoading ? "Generating…" : "Generate"}
                    </button>
                  </div>

                  <div style={{ height: 10 }} />

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 160,
                        height: 90,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {thumbDataUrl ? (
                        <img
                          alt="thumb preview"
                          src={thumbDataUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ color: "rgba(200,210,230,0.5)" }}>Preview</div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                      <button onClick={downloadThumbnail} disabled={!thumbDataUrl} style={styles.btnGhost}>
                        Download
                      </button>
                      <button onClick={copyThumbnailToClipboard} disabled={!thumbDataUrl} style={styles.btnGhost}>
                        Copy Image
                      </button>
                      <a ref={fileAnchorRef} style={{ display: "none" }} />
                    </div>
                  </div>

                  {!isPremium && (
                    <div style={{ marginTop: 10, color: "rgba(255,200,200,0.85)", fontSize: 13 }}>
                      Thumbnail generation is premium-only. <a href="/premium" style={{ color: "#00ffff" }}>Upgrade</a>.
                    </div>
                  )}
                </Card>

                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={styles.cardTitle}>Generate Hashtags</div>
                      <div style={styles.cardSub}>Create focused hashtags from your last download</div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(200,210,230,0.65)" }}>Text</div>
                  </div>

                  <div style={{ height: 10 }} />

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={generateHashtags} disabled={!lastVideo || tagsLoading || !isPremium} style={styles.btnPrimary}>
                      {tagsLoading ? "Generating…" : "Generate"}
                    </button>
                    <button onClick={copyHashtags} disabled={!(hashtags && hashtags.length)} style={styles.btnGhost}>
                      Copy
                    </button>
                    <div style={{ flex: 1 }} />
                  </div>

                  <div style={{ marginTop: 12, minHeight: 36 }}>
                    {hashtags && hashtags.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {hashtags.map((t) => (
                          <div key={t} style={styles.tag}>
                            {t}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "rgba(200,210,230,0.55)" }}>No hashtags yet</div>
                    )}
                  </div>

                  {!isPremium && (
                    <div style={{ marginTop: 10, color: "rgba(255,200,200,0.85)", fontSize: 13 }}>
                      Hashtags are premium-only. <a href="/premium" style={{ color: "#00ffff" }}>Upgrade</a>.
                    </div>
                  )}
                </Card>

                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={styles.cardTitle}>Generate Caption</div>
                      <div style={styles.cardSub}>Quick caption templates for social posts</div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(200,210,230,0.65)" }}>Text</div>
                  </div>

                  <div style={{ height: 10 }} />

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={generateCaptions} disabled={!lastVideo || capLoading || !isPremium} style={styles.btnPrimary}>
                      {capLoading ? "Generating…" : "Generate"}
                    </button>
                    <div style={{ flex: 1 }} />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    {captions && captions.length ? (
                      captions.map((c, i) => (
                        <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ flex: 1, color: "rgba(230,235,245,0.95)" }}>{c}</div>
                          <button onClick={() => copyCaption(c)} style={styles.btnGhost}>
                            Copy
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "rgba(200,210,230,0.55)" }}>No captions yet</div>
                    )}
                  </div>

                  {!isPremium && (
                    <div style={{ marginTop: 10, color: "rgba(255,200,200,0.85)", fontSize: 13 }}>
                      Captions are premium-only. <a href="/premium" style={{ color: "#00ffff" }}>Upgrade</a>.
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  sidebar: {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(16px)",
    borderRadius: 14,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.06)",
    minHeight: 160,
  },
  lockedItem: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    color: "#d7e7ff",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  unlockedItem: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    color: "#d7e7ff",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  main: {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(18px)",
    borderRadius: 14,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 12,
    boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  cardTitle: { fontSize: 16, fontWeight: 800, color: "white" },
  cardSub: { fontSize: 13, color: "rgba(200,210,230,0.75)" },
  label: { marginBottom: 6, fontSize: 13, color: "rgba(200,210,230,0.85)" },
  selectSmall: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.3)",
    color: "white",
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg,#7c5bff,#3ec7c0)",
    color: "black",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "white",
    cursor: "pointer",
  },
  tag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.03)",
    color: "rgba(220,230,255,0.95)",
    fontWeight: 700,
    fontSize: 13,
  },
  toast: {
    position: "fixed",
    right: 18,
    top: 18,
    zIndex: 9999,
    padding: "10px 14px",
    borderRadius: 10,
    background: "linear-gradient(90deg,#111827,#0b1220)",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
    fontWeight: 700,
  },
  premiumBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    background: "linear-gradient(90deg,#7c5bff,#3ec7c0)",
    color: "black",
    fontWeight: 900,
  },
  upgradeBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    background: "linear-gradient(90deg,#7c5bff,#3ec7c0)",
    color: "black",
    fontWeight: 900,
    textDecoration: "none",
  },
};