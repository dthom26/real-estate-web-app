const BASE = import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || '';

// In-memory token store for short-lived access tokens (avoids localStorage for sensitive tokens)
let _inMemoryToken = null;
const tokenProvider = {
  get: () => _inMemoryToken,
  set: (t) => { _inMemoryToken = t; },
  remove: () => { _inMemoryToken = null; },
};

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const opts = {
    method,
    signal,
    credentials: 'include', // include cookies for httpOnly auth
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };

  // Attach Authorization header if we have an access token stored (optional)
  const token = tokenProvider.get();
  if (token) opts.headers.Authorization = `Bearer ${token}`;

  // Add CSRF token header for non-GET requests (double-submit cookie pattern)
  if (method !== 'GET' && typeof window !== 'undefined') {
    const csrf = readCookie('csrfToken');
    if (csrf) opts.headers['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(BASE + path, opts);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.error?.message || json?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return json?.data ?? json;
}

export const api = { request };

export function post(path, body, opts) {
  return request(path, { method: 'POST', body, ...opts });
}
export function get(path, opts) {
  return request(path, { method: 'GET', ...opts });
}
export const tokenStore = tokenProvider;