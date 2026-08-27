// ✅ IMPORTANT: NO /api here
const DEFAULT_BACKEND_ORIGIN = "https://vydra-backend-v2-production.up.railway.app";

const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN
).replace(/\/$/, "");

const DEFAULT_TIMEOUT_MS = 25000;


// ----------------------------
// Helpers
// ----------------------------

function buildUrl(endpoint) {
  return `${BACKEND_ORIGIN}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}

async function readResponseBody(res) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


// ----------------------------
// Core Request Function
// ----------------------------

export async function request(
  endpoint,
  {
    method = "GET",
    data,
    token = null,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers = {},
  } = {}
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(buildUrl(endpoint), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: controller.signal,
    });

    const payload = await readResponseBody(res);

    // 🔥 IMPORTANT: throw FULL payload (not just string)
    if (!res.ok) {
      throw payload || { error: `HTTP_${res.status}` };
    }

    return payload;

  } catch (err) {
    if (err?.name === "AbortError") {
      throw { error: `timeout`, message: `Request timed out after ${timeoutMs}ms` };
    }

    // already structured
    if (typeof err === "object") {
      throw err;
    }

    // fallback
    throw { error: "unknown_error", message: String(err) };

  } finally {
    clearTimeout(timer);
  }
}


// ----------------------------
// Shortcuts
// ----------------------------

export async function post(endpoint, data = {}, token = null, options = {}) {
  return request(endpoint, { method: "POST", data, token, ...options });
}

export async function get(endpoint, token = null, options = {}) {
  return request(endpoint, { method: "GET", token, ...options });
}


// ----------------------------
// DOWNLOAD API
// ----------------------------

export async function createDownload(payload) {
  return post("/api/download", payload);
}