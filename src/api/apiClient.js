import axios from "axios";

// ✅ Single source of truth
const DEFAULT_BACKEND_ORIGIN = "https://vydra-backend-v2.onrender.com/api";

const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN
).replace(/\/$/, "");

// ✅ Axios instance
const apiClient = axios.create({
  baseURL: BACKEND_ORIGIN,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// =========================
// 🔥 WARM-UP FUNCTION
// =========================
let hasWarmedUp = false;

async function warmUpBackend() {
  if (hasWarmedUp) return;

  try {
    console.log("🔥 Warming up backend...");

    const res = await fetch(
      "https://vydra-backend-v2.onrender.com/health",
      { cache: "no-store" }
    );

    if (res.ok) {
      console.log("✅ Backend is awake");
      hasWarmedUp = true;
    } else {
      throw new Error("Backend not ready");
    }
  } catch (err) {
    console.warn("⚠️ Warm-up failed, backend may still be sleeping");
  }
}

// =========================
// 🔁 RETRY LOGIC
// =========================
async function retryRequest(error, retries = 2) {
  if (retries <= 0) {
    return Promise.reject(error);
  }

  console.warn(`🔁 Retrying request... (${3 - retries}/2)`);

  try {
    await new Promise((res) => setTimeout(res, 3000)); // wait 3s before retry
return await apiClient.request(error.config);
  } catch (err) {
    return retryRequest(err, retries - 1);
  }
}

// =========================
// ✅ Request interceptor
// =========================
apiClient.interceptors.request.use(
  async (config) => {
    await warmUpBackend(); // 🔥 ensure backend is awake

    const token = localStorage.getItem("vydra_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// ✅ Response interceptor
// =========================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 🔥 Handle timeout / network (Render cold start)
    if (error.code === "ECONNABORTED" || !error.response) {
      console.warn("⏱️ Timeout or network issue detected");

      return retryRequest(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        localStorage.removeItem("vydra_token");
        break;
      case 403:
        alert("Access denied.");
        break;
      case 429:
        alert("Too many requests.");
        break;
      case 500:
        alert("Server error.");
        break;
      default:
        console.error("API Error:", data?.message || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ✅ Optional helpers
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
};