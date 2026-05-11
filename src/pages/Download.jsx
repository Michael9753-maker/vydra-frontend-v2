import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PremiumContext } from "../context/PremiumContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/apiClient";

/* ================= CONFIG ================= */
const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "https://vydra-backend-v2.onrender.com"
).replace(/\/$/, "");

const HISTORY_TTL_MS = 5 * 60 * 60 * 1000;
const HISTORY_MAX = 5;

const FREE_DAILY_LIMIT = 25;
const PREMIUM_DAILY_LIMIT = 100;

const PREMIUM_VIDEO_QUALITIES = ["1080p", "1440p", "4K"];

/* ================= Icons ================= */
function IconDownload({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3v11.17l3.88-3.88 1.41 1.41L12 18l-5.29-5.29 1.41-1.41L11 14.17V3h1zM5 20h14v2H5z"
      />
    </svg>
  );
}

function IconTrash({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 3h6a2 2 0 0 1 2 2v1h4v2h-1l-1 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8H3V6h4V5a2 2 0 0 1 2-2zm2 0v1h2V3zm-4 5 1 11h8l1-11z"
      />
    </svg>
  );
}

function IconPaste({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 2h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2zm0 3h6V4H9zm1 6h4v2h-4zm0 4h6v2h-6z"
      />
    </svg>
  );
}

function IconClear({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.3 5.7a1 1 0 0 1 0 1.4L13.4 12l4.9 4.9a1 1 0 1 1-1.4 1.4L12 13.4l-4.9 4.9a1 1 0 1 1-1.4-1.4L10.6 12 5.7 7.1a1 1 0 0 1 1.4-1.4L12 10.6l4.9-4.9a1 1 0 0 1 1.4 0z"
      />
    </svg>
  );
}

function IconClock({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 5v5.17l3.59 3.58L15.17 17 11 12.83V7z"
      />
    </svg>
  );
}

function IconPlay({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconTag({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 10.59 13.41 4A2 2 0 0 0 12 3.41H5A2 2 0 0 0 3 5.41v7a2 2 0 0 0 .59 1.41L10 20a2 2 0 0 0 2.83 0l7.17-7.17a2 2 0 0 0 0-2.24zM7.5 9A1.5 1.5 0 1 1 9 7.5 1.5 1.5 0 0 1 7.5 9z"
      />
    </svg>
  );
}

/* ================= Utilities ================= */
const now = () => Date.now();

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

const todayKey = () => new Date().toISOString().slice(0, 10);

const storageKey = (userId) => `vydra_history_${userId}`;
const dailyKey = (userId) => `vydra_daily_${userId}`;
const guestIdKey = "vydra_guest_id";

const safeReadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const safeWriteJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const getOrCreateGuestId = () => {
  try {
    const existing = localStorage.getItem(guestIdKey);
    if (existing) return existing;
    const fresh = `guest_${uid()}`;
    localStorage.setItem(guestIdKey, fresh);
    return fresh;
  } catch {
    return `guest_${uid()}`;
  }
};

const normalizeInputUrl = (input) => {
  const value = String(input || "").trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(value)) {
      return `https://${value}`;
    }
    return null;
  }
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const absoluteDownloadUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;

  const value = String(pathOrUrl).trim().replace(/\\/g, "/");

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const prefixes = [
    "/api/download/file/",
    "/api/download/download/file/",
    "/download/file/",
  ];

  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) {
      const filename = value.slice(prefix.length);
      return `${BACKEND_ORIGIN}/api/download/file/${encodeURIComponent(safeDecode(filename))}`;
    }
  }

  if (value.startsWith("/")) {
    return `${BACKEND_ORIGIN}${value}`;
  }

  return `${BACKEND_ORIGIN}/${value}`;
};

const normalizeHashtags = (input) => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .map((item) => (item.startsWith("#") ? item : `#${item}`))
      .slice(0, 8);
  }

  const text = String(input);
  const matches = text.match(/#[\p{L}\p{N}_]+/gu) || [];
  return [...new Set(matches)].slice(0, 8);
};

const getPlatformLabel = (url, payload) => {
  const candidate = String(
    payload?.platform || payload?.source || payload?.result?.platform || payload?.result?.source || ""
  )
    .trim()
    .toLowerCase();

  if (candidate) {
    if (candidate.includes("youtube")) return "YouTube";
    if (candidate.includes("tiktok")) return "TikTok";
    if (candidate.includes("instagram")) return "Instagram";
    if (candidate.includes("facebook")) return "Facebook";
    if (candidate.includes("vimeo")) return "Vimeo";
    if (candidate.includes("twitter") || candidate.includes("x")) return "X / Twitter";
    return candidate.toUpperCase();
  }

  try {
    const host = new URL(url || "").hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("facebook") || host.includes("fb")) return "Facebook";
    if (host.includes("vimeo")) return "Vimeo";
    if (host.includes("twitter") || host === "x.com") return "X / Twitter";
    return host || "Source";
  } catch {
    return "Source";
  }
};

const extractDownloadMeta = (payload, fallbackUrl = "") => {
  const result = payload?.result || {};
  const title =
    result?.title ||
    payload?.title ||
    result?.name ||
    payload?.name ||
    result?.caption ||
    payload?.caption ||
    "Download";

  const caption =
    result?.description ||
    payload?.description ||
    result?.caption ||
    payload?.caption ||
    title;

  const thumbnail =
    result?.thumbnail ||
    payload?.thumbnail ||
    result?.thumbnail_url ||
    payload?.thumbnail_url ||
    "";

  const uploader =
    result?.uploader ||
    payload?.uploader ||
    result?.channel ||
    payload?.channel ||
    result?.creator ||
    payload?.creator ||
    "";

  const hashtags = normalizeHashtags(
    result?.hashtags ||
      payload?.hashtags ||
      result?.description ||
      payload?.description ||
      result?.caption ||
      payload?.caption
  );

  const platform = getPlatformLabel(fallbackUrl, payload);

  return { title, caption, thumbnail, uploader, hashtags, platform };
};

const buildFileUrlFromJobPayload = (payload) => {
  const direct =
    payload?.download_url ||
    payload?.result?.download_url ||
    payload?.result?.file_url ||
    payload?.result?.fileUrl ||
    payload?.file_url ||
    payload?.fileUrl;

  if (direct) {
    return absoluteDownloadUrl(direct);
  }

  const filePath =
    payload?.result?.file_path ||
    payload?.file_path ||
    payload?.result?.filePath ||
    payload?.filePath;

  if (!filePath) return null;

  const normalized = String(filePath).replace(/\\/g, "/");
  const filename = normalized.split("/").filter(Boolean).pop();
  if (!filename) return null;

  return `${BACKEND_ORIGIN}/api/download/file/${encodeURIComponent(safeDecode(filename))}`;
};

const buildHistoryItem = ({
  url,
  fileUrl,
  title,
  caption,
  mode,
  quality,
  enhanced,
  thumbnail,
  uploader,
  hashtags,
  platform,
}) => {
  const createdAt = now();
  return {
    id: uid(),
    url,
    fileUrl: fileUrl || "",
    title: title || "Download",
    caption: caption || "",
    mode,
    quality,
    enhanced: !!enhanced,
    thumbnail: thumbnail || "",
    uploader: uploader || "",
    hashtags: Array.isArray(hashtags) ? hashtags : [],
    platform: platform || "",
    createdAt,
    expiresAt: createdAt + HISTORY_TTL_MS,
  };
};

const pruneHistoryItems = (items) =>
  (items || [])
    .filter((item) => item?.expiresAt && item.expiresAt > now())
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, HISTORY_MAX);

const loadHistory = (userId) => {
  const stored = safeReadJson(storageKey(userId), []);
  return pruneHistoryItems(Array.isArray(stored) ? stored : []);
};

const loadDailyUsage = (userId) => {
  const defaultUsage = { date: todayKey(), count: 0 };
  const stored = safeReadJson(dailyKey(userId), defaultUsage);

  if (!stored || stored.date !== todayKey()) {
    return defaultUsage;
  }

  return {
    date: stored.date,
    count: Number(stored.count) || 0,
  };
};

const getSourceLabel = (item) => {
  if (item?.platform) return item.platform;
  if (item?.uploader) return item.uploader;

  try {
    return new URL(item?.url || "").hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
};

function formatTimeAgo(timestamp) {
  const diff = Math.max(0, now() - Number(timestamp || 0));
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return "just now";
  if (seconds < 90) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;

  if (hours < 24) {
    const remMinutes = minutes % 60;
    if (hours === 1 && remMinutes > 0) return `1 hour ${remMinutes} mins ago`;
    if (hours === 1) return "1 hour ago";
    if (remMinutes > 0) return `${hours} hours ${remMinutes} mins ago`;
    return `${hours} hours ago`;
  }

  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

async function downloadFileFromUrl(fileUrl, filename = "vydra-download.mp4") {
  const resolved = absoluteDownloadUrl(fileUrl);
  if (!resolved) return false;

  try {
    const response = await fetch(resolved, { method: "GET" });
    if (!response.ok) throw new Error(`Download failed (${response.status})`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    return true;
  } catch {
    const link = document.createElement("a");
    link.href = resolved;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return false;
  }
}

function makeSafeFilename(title = "vydra-download", quality = "", mode = "video") {
  const base = String(title || "vydra-download")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const q = quality ? `-${quality}` : "";
  const m = mode ? `-${mode}` : "";
  return `${base}${q}${m}.mp4` || "vydra-download.mp4";
}

/* ================= Referral helpers ================= */
function getReferrerId() {
  try {
    const referrer = localStorage.getItem("vydra_referrer");
    const expiry = localStorage.getItem("vydra_referrer_expiry");
    if (!referrer || !expiry) return null;

    if (Date.now() > Number(expiry)) {
      localStorage.removeItem("vydra_referrer");
      localStorage.removeItem("vydra_referrer_expiry");
      return null;
    }

    return referrer;
  } catch {
    return null;
  }
}

function clearReferrer() {
  try {
    localStorage.removeItem("vydra_referrer");
    localStorage.removeItem("vydra_referrer_expiry");
  } catch {
    // ignore
  }
}

/* ================= Component ================= */
export default function Download() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const premiumContext = useContext(PremiumContext);
  const isPremium = !!premiumContext?.isPremium;

  const activeUserId = user?.id || getOrCreateGuestId();
  const prefillFromHome = String(location.state?.prefillUrl || "").trim();

  const [url, setUrl] = useState(prefillFromHome);
  const [mode, setMode] = useState("video");
  const [quality, setQuality] = useState("720p");
  const [enhanceAudio, setEnhanceAudio] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [statusText, setStatusText] = useState(prefillFromHome ? "Link received from homepage" : "Ready");
  const [latestFileUrl, setLatestFileUrl] = useState("");
  const [latestTitle, setLatestTitle] = useState("");
  const [latestCaption, setLatestCaption] = useState("");

  const [history, setHistory] = useState(() => loadHistory(activeUserId));
  const [dailyUsage, setDailyUsage] = useState(() => loadDailyUsage(activeUserId));

  const [rippleActive, setRippleActive] = useState(false);
  const [successActive, setSuccessActive] = useState(false);

  const abortRef = useRef(null);
  const autoStartTimerRef = useRef(null);
  const autoPrefillTriggeredRef = useRef(false);

  const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const dailyRemaining = Math.max(0, dailyLimit - (dailyUsage.count || 0));
  const hasUrl = Boolean(String(url || "").trim());

  useEffect(() => {
    setHistory(loadHistory(activeUserId));
    setDailyUsage(loadDailyUsage(activeUserId));
  }, [activeUserId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const pruned = pruneHistoryItems(loadHistory(activeUserId));
      setHistory(pruned);
      safeWriteJson(storageKey(activeUserId), pruned);
      setDailyUsage(loadDailyUsage(activeUserId));
    }, 60_000);

    return () => clearInterval(timer);
  }, [activeUserId]);

  useEffect(() => {
    return () => {
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const validQualities = getVideoQualities();
    if (mode === "video" && !validQualities.includes(quality)) {
      setQuality(validQualities[validQualities.length - 1]);
    }

    if (mode === "audio" && enhanceAudio && !isPremium) {
      setEnhanceAudio(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPremium]);

  useEffect(() => {
    if (!prefillFromHome || autoPrefillTriggeredRef.current) return;

    autoPrefillTriggeredRef.current = true;
    setUrl(prefillFromHome);
    setStatusText("Link received from homepage");

    autoStartTimerRef.current = window.setTimeout(() => {
      queueAutoDownload(prefillFromHome);
    }, 500);

    return () => {
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillFromHome]);

  function persistHistory(nextHistory) {
    const pruned = pruneHistoryItems(nextHistory);
    setHistory(pruned);
    safeWriteJson(storageKey(activeUserId), pruned);
  }

  function addHistory(entry) {
    const item = buildHistoryItem(entry);

    setHistory((prev) => {
      const next = pruneHistoryItems([item, ...prev]);
      safeWriteJson(storageKey(activeUserId), next);
      return next;
    });
  }

  function removeHistoryItem(id) {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWriteJson(storageKey(activeUserId), next);
      return next;
    });
  }

  function clearAllHistory() {
    persistHistory([]);
  }

  function updateDailyUsage(count, date = todayKey()) {
    const next = { date, count: Number(count) || 0 };
    setDailyUsage(next);
    safeWriteJson(dailyKey(activeUserId), next);
  }

  function incrementDailyUsage() {
    const base = loadDailyUsage(activeUserId);
    const next = {
      date: todayKey(),
      count: (Number(base.count) || 0) + 1,
    };
    updateDailyUsage(next.count, next.date);
    return next;
  }

  function getVideoQualities() {
    return isPremium ? ["360p", "480p", "720p", "1080p", "1440p", "4K"] : ["360p", "480p", "720p"];
  }

  function requirePremium(featureLabel = "this feature") {
    setStatusText(`${featureLabel} requires Premium — redirecting...`);
    setTimeout(() => {
      navigate("/premium");
    }, 500);
  }

  function queueAutoDownload(nextUrl) {
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    autoStartTimerRef.current = window.setTimeout(() => {
      const normalized = normalizeInputUrl(nextUrl);
      if (!normalized || isDownloading) return;
      startDownload(undefined, normalized);
    }, 350);
  }

  function clearInput() {
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }
    setUrl("");
    setStatusText("Ready");
    setLatestFileUrl("");
    setLatestTitle("");
    setLatestCaption("");
  }

  async function startDownload(e, overrideUrl = null) {
    if (e?.preventDefault) e.preventDefault();

    const sourceUrl = overrideUrl ?? url;
    const normalizedUrl = normalizeInputUrl(sourceUrl);

    if (!normalizedUrl) {
      setStatusText("Please paste a valid URL.");
      return;
    }

    if (dailyRemaining <= 0) {
      setStatusText("Daily limit reached");
      return;
    }

    if (mode === "audio" && enhanceAudio && !isPremium) {
      requirePremium("Audio enhancement");
      return;
    }

    if (mode === "video" && PREMIUM_VIDEO_QUALITIES.includes(quality) && !isPremium) {
      requirePremium(`Quality ${quality}`);
      return;
    }

    setUrl(normalizedUrl);
    setLatestFileUrl("");
    setLatestTitle("");
    setLatestCaption("");
    setIsDownloading(true);
    setStatusText("Sending request...");
    setProgressPct(0);

    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 700);

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const meta = { mode: mode === "audio" ? "audio" : "video" };
    if (mode === "video") meta.quality = quality;
    if (mode === "audio") meta.enhance_audio = !!enhanceAudio;

    const referrerId = getReferrerId();
    if (referrerId) meta.referrer_id = referrerId;

    const payload = {
      url: normalizedUrl,
      user_id: activeUserId,
      meta,
    };

    try {
      const { data } = await api.post("/api/download", payload, {
        signal: controller.signal,
      });

      const status = String(data?.status || data?.result?.status || "").toLowerCase();

      const used = Number(data?.used);
      if (Number.isFinite(used)) {
        updateDailyUsage(used, todayKey());
      } else {
        incrementDailyUsage();
      }

      if (status === "blocked") {
        setIsDownloading(false);
        setProgressPct(0);
        setStatusText(data?.message || "YouTube is blocking this request (bot detection)");
        return;
      }

      if (status === "failure" || status === "failed" || status === "error") {
        setIsDownloading(false);
        setProgressPct(0);
        setStatusText(data?.error || data?.message || "Download failed");
        return;
      }

      const fileUrl = buildFileUrlFromJobPayload(data);
      const { title, caption, thumbnail, uploader, hashtags, platform } =
        extractDownloadMeta(data, normalizedUrl);

      const finalTitle = title || "Download";
      const finalCaption = caption || "";

      setLatestFileUrl(fileUrl || "");
      setLatestTitle(finalTitle);
      setLatestCaption(finalCaption);
      setProgressPct(100);
      setStatusText("Download ready");
      setIsDownloading(false);
      setSuccessActive(true);

      if (fileUrl) {
        const filename = makeSafeFilename(finalTitle, mode === "video" ? quality : "audio", mode);
        setTimeout(() => {
          void downloadFileFromUrl(fileUrl, filename);
        }, 250);
      }

      setTimeout(() => setSuccessActive(false), 1800);

      addHistory({
        url: normalizedUrl,
        fileUrl: fileUrl || "",
        title: finalTitle,
        caption: finalCaption,
        mode,
        quality: mode === "video" ? quality : "audio",
        enhanced: mode === "audio" ? !!enhanceAudio : false,
        thumbnail,
        uploader,
        hashtags,
        platform,
      });

      clearReferrer();
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data || {};
      const message = body?.error || body?.message || err?.message || "Request failed";

      if (status === 403 && body?.error === "daily_limit_reached") {
        const used = Number(body?.used);
        const limit = Number(body?.limit);

        if (Number.isFinite(used) && Number.isFinite(limit)) {
          updateDailyUsage(used, todayKey());
          setStatusText(`Daily limit reached (${used}/${limit})`);
        } else {
          setStatusText("Daily limit reached");
        }
      } else {
        setStatusText(message);
      }

      setIsDownloading(false);
      setProgressPct(0);
    }
  }

  async function pasteClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.length > 5) {
          const next = text.trim();
          setUrl(next);
          setStatusText("Pasted from clipboard");
          queueAutoDownload(next);
          return;
        }
      }

      setStatusText("Clipboard not available or empty");
      setTimeout(() => setStatusText(""), 1200);
    } catch {
      setStatusText("Clipboard access denied");
      setTimeout(() => setStatusText(""), 1200);
    }
  }

  async function handleHistoryDownload(item) {
    if (!item?.fileUrl) {
      setStatusText("File not available");
      return;
    }

    const filename = makeSafeFilename(item.title, item.quality, item.mode);
    await downloadFileFromUrl(item.fileUrl, filename);
  }

  const normalizedUrl = normalizeInputUrl(url);
  const startDisabled = isDownloading || !normalizedUrl || dailyRemaining <= 0;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes vydraRipple {
          0% { transform: scale(0.12); opacity: 0.55; }
          60% { transform: scale(1.1); opacity: 0.35; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .vydra-ripple {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 90;
          background: radial-gradient(circle at center, rgba(124,91,255,0.14), rgba(62,199,192,0.05) 30%, rgba(0,0,0,0) 60%);
          animation: vydraRipple 700ms cubic-bezier(.2,.9,.3,1);
        }
        @keyframes successPop {
          0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
          40% { transform: translateX(-50%) scale(1.12); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .vydra-success {
          position: fixed;
          left: 50%;
          top: 20%;
          transform: translateX(-50%);
          z-index: 100;
          background: rgba(12,14,20,0.88);
          padding: 18px 26px;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: successPop 650ms cubic-bezier(.2,.9,.3,1);
        }
        .vydra-success .check {
          width: 44px;
          height: 44px;
          background: linear-gradient(90deg,#7c5bff,#3ec7c0);
          border-radius: 999px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:black;
          font-weight:800;
          box-shadow: 0 8px 24px rgba(124,91,255,0.28);
        }
        .premium-note {
          display: inline-block;
          padding: 6px 8px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          color: rgba(200,210,230,0.9);
          font-size: 13px;
        }
        .premium-action {
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg,#7c5bff,#3ec7c0);
          color: black;
          font-weight: 800;
          cursor: pointer;
        }
        .thumb-fade {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .vydra-input-shell {
          position: relative;
          border-radius: 999px;
          padding: 1px;
          background: linear-gradient(
            90deg,
            rgba(124, 91, 255, 0.34),
            rgba(62, 199, 192, 0.28),
            rgba(225, 48, 108, 0.18),
            rgba(124, 91, 255, 0.34)
          );
          background-size: 300% 100%;
          animation: glowShift 8s linear infinite, glowPulse 3.2s ease-in-out infinite;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 14px 40px rgba(0, 0, 0, 0.34);
        }

        .vydra-input-shell::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(12, 15, 24, 0.92), rgba(8, 10, 16, 0.92));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -12px 28px rgba(62, 199, 192, 0.03),
            inset 0 0 28px rgba(124, 91, 255, 0.06);
          pointer-events: none;
        }

        .vydra-input-shell::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: radial-gradient(circle at 30% 50%, rgba(124,91,255,0.12), transparent 40%);
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.7;
          animation: innerGlowDim 4s ease-in-out infinite;
        }

        .vydra-input-shell:focus-within {
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 0 0 3px rgba(124, 91, 255, 0.10),
            0 20px 50px rgba(0, 0, 0, 0.40);
        }

        .vydra-input-shell:focus-within::after {
          opacity: 1;
        }

        .vydra-smart-input {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 62px;
          padding: 0 128px 0 22px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: rgba(245, 248, 255, 0.98);
          font-size: 15px;
          outline: none;
          box-shadow: none;
        }

        .vydra-smart-input::placeholder {
          color: rgba(196, 205, 224, 0.44);
        }

        .vydra-smart-action {
          position: absolute;
          z-index: 2;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          height: 46px;
          min-width: 104px;
          padding: 0 18px;
          border: none;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(90deg, rgba(124,91,255,0.96), rgba(62,199,192,0.96));
          color: #081018;
          font-weight: 900;
          font-size: 14px;
          box-shadow:
            0 12px 26px rgba(62,199,192,0.18),
            0 2px 10px rgba(124,91,255,0.18);
          cursor: pointer;
          transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
        }

        .vydra-smart-action:hover {
          transform: translateY(-50%) scale(1.02);
          filter: brightness(1.05);
        }

        .vydra-smart-action:active {
          transform: translateY(-50%) scale(0.98);
        }

        @keyframes glowShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        @keyframes glowPulse {
          0%, 100% {
            filter: saturate(1.05) brightness(0.92);
            opacity: 0.92;
          }
          50% {
            filter: saturate(1.25) brightness(1.06);
            opacity: 1;
          }
        }

        @keyframes innerGlowDim {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.88; }
        }
      `}</style>

      {rippleActive && <div className="vydra-ripple" />}

      {successActive && (
        <div className="vydra-success" role="status" aria-live="polite">
          <div className="check">✓</div>
          <div style={{ color: "white" }}>
            <div style={{ fontWeight: 700 }}>Download ready</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              Saved to recent downloads
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <header style={styles.hero}>
          <h1 style={styles.h1}>VYDRA — Download</h1>
          <p style={styles.lead}>
            Paste a link, auto-start the job, and keep the recent feed looking clean and alive.
          </p>
        </header>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleWrap}>
              <span style={styles.sectionIcon}>
                <IconPaste size={16} />
              </span>
              <div>
                <div style={styles.sectionTitle}>Paste link</div>
                <div style={styles.sectionSubtext}>
                  Smart paste starts automatically. Clear when you need to reset.
                </div>
              </div>
            </div>
          </div>

          <div style={styles.inputRow}>
            <div className="vydra-input-shell">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData("text") || "";
                  if (pasted) {
                    const next = pasted.trim();
                    if (!next) return;
                    setTimeout(() => {
                      setUrl(next);
                      setStatusText("Pasted from clipboard");
                      queueAutoDownload(next);
                    }, 0);
                  }
                }}
                placeholder="https://..."
                disabled={isDownloading}
                inputMode="url"
                spellCheck="false"
                autoComplete="off"
                className="vydra-smart-input"
              />

              <button
                type="button"
                onClick={hasUrl ? clearInput : pasteClipboard}
                disabled={isDownloading}
                className="vydra-smart-action"
                aria-label={hasUrl ? "Clear link" : "Paste from clipboard"}
                title={hasUrl ? "Clear" : "Paste"}
              >
                {hasUrl ? <IconClear size={16} /> : <IconPaste size={16} />}
                <span>{hasUrl ? "Clear" : "Paste"}</span>
              </button>
            </div>
          </div>

          <div style={styles.controlsRow}>
            <div style={styles.modeGroup}>
              <button
                onClick={() => setMode("video")}
                disabled={isDownloading}
                style={{ ...styles.modeBtn, ...(mode === "video" ? styles.modeBtnActive : {}) }}
              >
                Video
              </button>
              <button
                onClick={() => setMode("audio")}
                disabled={isDownloading}
                style={{ ...styles.modeBtn, ...(mode === "audio" ? styles.modeBtnActive : {}) }}
              >
                Audio
              </button>
            </div>

            {mode === "video" && (
              <div style={styles.qualityBlock}>
                <label style={styles.label}>Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isDownloading}
                  style={styles.select}
                >
                  {getVideoQualities().map((q) => (
                    <option key={q} value={q}>
                      {q}
                      {PREMIUM_VIDEO_QUALITIES.includes(q) ? " (Premium)" : ""}
                    </option>
                  ))}
                </select>

                {!isPremium && <div style={styles.helperPill}>Higher qualities require Premium</div>}
              </div>
            )}

            {mode === "audio" && (
              <div style={styles.audioBlock}>
                {isPremium ? (
                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={enhanceAudio}
                      onChange={(e) => setEnhanceAudio(e.target.checked)}
                      disabled={isDownloading}
                    />
                    <span>Enhance audio (Premium)</span>
                  </label>
                ) : (
                  <div style={styles.upgradeRow}>
                    <span style={styles.mutedText}>Enhance audio available for Premium</span>
                    <button className="premium-action" onClick={() => navigate("/premium")}>
                      Upgrade
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section style={{ ...styles.card, marginTop: 16, textAlign: "center" }}>
          <button
            onClick={startDownload}
            disabled={startDisabled}
            style={{
              ...styles.cta,
              opacity: startDisabled ? 0.6 : 1,
              cursor: startDisabled ? "not-allowed" : "pointer",
            }}
            aria-disabled={startDisabled}
          >
            <IconDownload size={18} />
            {isDownloading ? "Downloading…" : "Start Download"}
          </button>

          <div style={{ marginTop: 14 }}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
              <div style={styles.progressLabel}>{progressPct}%</div>
            </div>

            <div style={{ marginTop: 10, color: "rgba(200,210,230,0.78)", fontSize: 13 }}>
              {statusText}
            </div>

            <div style={{ marginTop: 8, color: "rgba(200,210,230,0.55)", fontSize: 12 }}>
              Today: {dailyUsage.count || 0}/{dailyLimit} downloads used
            </div>
          </div>

          {latestFileUrl && (
            <div style={{ marginTop: 14 }}>
              <a href={latestFileUrl} target="_blank" rel="noreferrer" style={styles.openBtn}>
                <IconDownload size={16} />
                Open latest file
              </a>
              {latestTitle ? (
                <div style={{ marginTop: 8, color: "rgba(200,210,230,0.65)", fontSize: 12 }}>
                  {latestTitle}
                </div>
              ) : null}
              {latestCaption ? (
                <div style={{ marginTop: 6, color: "rgba(200,210,230,0.5)", fontSize: 12 }}>
                  {latestCaption}
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section style={{ ...styles.card, marginTop: 16 }}>
          <div style={styles.feedHeader}>
            <h2 style={styles.feedTitle}>Recent Downloads ({history.length})</h2>
            <button onClick={clearAllHistory} style={styles.clearAllBtn}>
              <IconTrash size={16} />
              Delete All
            </button>
          </div>

          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyEmoji}>🎬</div>
              <div style={styles.emptyTitle}>No downloads yet</div>
              <div style={styles.emptySubtext}>Paste a link to build your media feed.</div>
            </div>
          ) : (
            <div style={styles.feedList}>
              {history.map((item) => {
                const source = getSourceLabel(item);
                const timeAgo = formatTimeAgo(item.createdAt);

                return (
                  <article key={item.id} style={styles.feedCard}>
                    <div style={styles.feedThumbWrap}>
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || "thumbnail"}
                          style={styles.feedThumb}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div style={styles.feedThumbFallback}>
                          <IconPlay size={24} />
                        </div>
                      )}
                    </div>

                    <div style={styles.feedBody}>
                      <div style={styles.feedTitleRow}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={styles.feedItemTitle}>{item.title || "(no title)"}</h3>
                          {item.caption ? (
                            <div style={styles.feedCaption} className="thumb-fade">
                              {item.caption}
                            </div>
                          ) : null}
                        </div>

                        <div style={styles.feedActions}>
                          {item.fileUrl ? (
                            <button
                              type="button"
                              onClick={() => handleHistoryDownload(item)}
                              style={styles.iconActionBtn}
                              title="Download"
                              aria-label="Download"
                            >
                              <IconDownload size={16} />
                            </button>
                          ) : (
                            <span
                              style={{ ...styles.iconActionBtn, opacity: 0.45, pointerEvents: "none" }}
                              title="Unavailable"
                            >
                              <IconDownload size={16} />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeHistoryItem(item.id)}
                            style={styles.iconActionBtn}
                            title="Remove"
                            aria-label="Remove"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={styles.feedSource}>{source}</div>

                      {item.hashtags?.length ? (
                        <div style={styles.tagsRow}>
                          {item.hashtags.map((tag) => (
                            <span key={tag} style={styles.tagPill}>
                              <IconTag size={11} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div style={styles.feedMeta}>
                        <span style={styles.metaPill}>
                          <IconClock size={12} />
                          Downloaded {timeAgo}
                        </span>
                        <span style={styles.metaPill}>{item.platform || item.mode?.toUpperCase?.() || "VIDEO"}</span>
                        {item.mode === "video" && item.quality ? (
                          <span style={styles.metaPill}>{item.quality}</span>
                        ) : null}
                        {item.enhanced ? <span style={styles.metaPill}>Enhanced</span> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= Styles ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    color: "white",
    padding: "24px 18px 64px",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: {
    maxWidth: 1120,
    margin: "0 auto",
    position: "relative",
    zIndex: 10,
  },
  hero: {
    marginBottom: 14,
  },
  h1: { margin: 0, fontSize: 28, lineHeight: 1.05 },
  lead: { color: "rgba(200,210,230,0.74)", marginTop: 8, fontSize: 13, maxWidth: 760 },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: 18,
    borderRadius: 20,
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  sectionTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#cbbcff",
    flex: "0 0 auto",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },
  sectionSubtext: {
    color: "rgba(200,210,230,0.66)",
    fontSize: 12,
    marginTop: 4,
  },
  inputRow: {
    position: "relative",
  },
  controlsRow: {
    marginTop: 14,
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  modeGroup: {
    display: "flex",
    gap: 12,
  },
  modeBtn: {
    padding: "12px 20px",
    borderRadius: 14,
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
  },
  modeBtnActive: {
    background: "linear-gradient(90deg,#5b6cff,#8e5fff)",
    color: "white",
    boxShadow: "0 12px 32px rgba(89,78,255,0.18)",
  },
  qualityBlock: {
    marginLeft: "auto",
    minWidth: 220,
  },
  label: {
    display: "block",
    color: "rgba(200,210,230,0.8)",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 700,
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(10,12,18,0.6)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.06)",
    outline: "none",
  },
  helperPill: {
    display: "inline-flex",
    marginTop: 8,
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(200,210,230,0.88)",
    fontSize: 12,
  },
  audioBlock: {
    marginLeft: "auto",
    color: "rgba(200,210,230,0.85)",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  },
  upgradeRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  mutedText: {
    fontSize: 13,
    color: "rgba(200,210,230,0.64)",
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "14px 34px",
    borderRadius: 999,
    background: "linear-gradient(90deg,#7c5bff,#3ec7c0)",
    color: "black",
    fontWeight: 900,
    fontSize: 18,
    boxShadow: "0 16px 50px rgba(62,199,192,0.12)",
    border: "none",
  },
  progressTrack: {
    position: "relative",
    height: 28,
    background: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#10b981,#06b6d4)",
    transition: "width 350ms linear",
  },
  progressLabel: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "white",
  },
  openBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 12,
    background: "#10b981",
    color: "black",
    fontWeight: 800,
    textDecoration: "none",
  },
  feedHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  feedTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    color: "white",
    letterSpacing: "-0.02em",
  },
  clearAllBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 14,
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  },
  emptyState: {
    padding: "20px 8px 6px",
    textAlign: "center",
    color: "rgba(220,228,240,0.8)",
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: 900,
  },
  emptySubtext: {
    color: "rgba(200,210,230,0.65)",
    marginTop: 6,
    fontSize: 13,
  },
  feedList: {
    display: "grid",
    gap: 12,
  },
  feedCard: {
    display: "grid",
    gridTemplateColumns: "132px 1fr",
    gap: 14,
    padding: 12,
    borderRadius: 18,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 10px 34px rgba(0,0,0,0.22)",
  },
  feedThumbWrap: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 14,
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  feedThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  feedThumbFallback: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.7)",
    background: "linear-gradient(180deg, rgba(124,91,255,0.15), rgba(62,199,192,0.08))",
  },
  feedBody: {
    minWidth: 0,
  },
  feedTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  feedItemTitle: {
    margin: 0,
    color: "white",
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
  },
  feedCaption: {
    marginTop: 6,
    color: "rgba(200,210,230,0.72)",
    fontSize: 12,
    lineHeight: 1.45,
  },
  feedActions: {
    display: "flex",
    gap: 8,
    flex: "0 0 auto",
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "none",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    cursor: "pointer",
    textDecoration: "none",
  },
  feedSource: {
    marginTop: 6,
    color: "rgba(200,210,230,0.72)",
    fontSize: 13,
  },
  tagsRow: {
    marginTop: 10,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(240,244,255,0.95)",
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  feedMeta: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  metaPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(220,228,240,0.85)",
    fontSize: 12,
  },
};