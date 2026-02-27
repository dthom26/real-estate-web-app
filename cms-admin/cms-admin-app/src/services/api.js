const BASE =
  import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || "";

// In-memory token store for short-lived access tokens (avoids localStorage for sensitive tokens)
let _inMemoryToken = null;
const tokenProvider = {
  get: () => _inMemoryToken,
  set: (t) => {
    _inMemoryToken = t;
  },
  remove: () => {
    _inMemoryToken = null;
  },
};

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

async function request(
  path,
  { method = "GET", body, headers = {}, signal, _isRetry = false } = {},
) {
  const opts = {
    method,
    signal,
    credentials: "include", // include cookies for httpOnly auth
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };

  // Attach Authorization header if we have an access token stored (optional)
  const token = tokenProvider.get();
  if (token) opts.headers.Authorization = `Bearer ${token}`;

  // Add CSRF token header for non-GET requests (double-submit cookie pattern)
  if (method !== "GET" && typeof window !== "undefined") {
    const csrf = readCookie("csrfToken");
    if (csrf) opts.headers["X-CSRF-Token"] = csrf;
  }

  const res = await fetch(BASE + path, opts);
  const json = await res.json().catch(() => null);

  // If we get a 401 and haven't retried yet, try to refresh the token
  if (res.status === 401 && !_isRetry && path !== "/api/auth/refresh") {
    try {
      // Try to refresh the token
      const refreshRes = await fetch(BASE + "/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken =
          refreshData?.data?.accessToken || refreshData?.accessToken;

        if (newToken) {
          // Store the new token
          tokenProvider.set(newToken);

          // Retry the original request with the new token
          return request(path, {
            method,
            body,
            headers,
            signal,
            _isRetry: true,
          });
        }
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      // Fall through to throw the original error
    }
  }

  if (!res.ok) {
    const msg =
      json?.error?.message || json?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return json?.data ?? json;
}

export const api = { request };

export function post(path, body, opts) {
  return request(path, { method: "POST", body, ...opts });
}
export function get(path, opts) {
  return request(path, { method: "GET", ...opts });
}
export function put(path, body, opts) {
  return request(path, { method: "PUT", body, ...opts });
}
export function del(path, opts) {
  return request(path, { method: "DELETE", ...opts });
}
export const tokenStore = tokenProvider;

// ========================================
// Upload helper for file uploads
// ========================================

export async function uploadImage(file, opts = {}) {
  const formData = new FormData();
  formData.append("image", file);

  const token = tokenProvider.get();
  const csrf = readCookie("csrfToken");

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers["X-CSRF-Token"] = csrf;

  const res = await fetch(BASE + "/api/upload", {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
    signal: opts.signal,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.error?.message || json?.message || `Upload failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return json?.data ?? json;
}

// ========================================
// Resource-specific API helpers
// ========================================

// Properties
export function getProperties(opts) {
  return get("/api/properties", opts);
}
export function getProperty(id, opts) {
  return get(`/api/properties/${id}`, opts);
}
export function createProperty(data, opts) {
  return post("/api/properties", data, opts);
}
export function updateProperty(id, data, opts) {
  return put(`/api/properties/${id}`, data, opts);
}
export function deleteProperty(id, opts) {
  return del(`/api/properties/${id}`, opts);
}

// Reviews
export function getReviews(opts) {
  return get("/api/reviews", opts);
}
export function getReview(id, opts) {
  return get(`/api/reviews/${id}`, opts);
}
export function createReview(data, opts) {
  return post("/api/reviews", data, opts);
}
export function updateReview(id, data, opts) {
  return put(`/api/reviews/${id}`, data, opts);
}
export function deleteReview(id, opts) {
  return del(`/api/reviews/${id}`, opts);
}

// Services
export function getServices(opts) {
  return get("/api/services", opts);
}
export function getService(id, opts) {
  return get(`/api/services/${id}`, opts);
}
export function createService(data, opts) {
  return post("/api/services", data, opts);
}
export function updateService(id, data, opts) {
  return put(`/api/services/${id}`, data, opts);
}
export function deleteService(id, opts) {
  return del(`/api/services/${id}`, opts);
}
