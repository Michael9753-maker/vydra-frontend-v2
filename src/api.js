const DEFAULT_BACKEND_ORIGIN = "https://vydra-backend-v2.onrender.com/api";

const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN
).replace(/\/$/, "");

const api = axios.create({
  baseURL: BACKEND_ORIGIN,
});
const DEFAULT_TIMEOUT_MS = 25000;

function buildUrl(endpoint) {
  return `${BACKEND_ORIGIN}/${String(endpoint).replace(/^\/+/, "")}`;
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

function getErrorMessage(payload, fallback) {
  if (typeof payload === "string") return payload;
  return payload?.message || payload?.error || fallback;
}

export async function request(endpoint, { method = "GET", data, token = null, timeoutMs = DEFAULT_TIMEOUT_MS, headers = {} } = {}) {
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

    if (!res.ok) {
      throw new Error(getErrorMessage(payload, `API request failed with status ${res.status}`));
    }

    return payload;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function post(endpoint, data = {}, token = null, options = {}) {
  return request(endpoint, { method: "POST", data, token, ...options });
}

export async function get(endpoint, token = null, options = {}) {
  return request(endpoint, { method: "GET", token, ...options });
}