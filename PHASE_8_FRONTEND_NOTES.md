# Phase 8 — Frontend Integration: Detailed Notes and Patterns

This document summarizes what we implemented, why each part matters, common patterns used, pitfalls we hit and fixed, and concrete examples you can reuse when connecting a React frontend to an Express/Mongo backend.

---

## Overview

Goal: Replace static frontend data with live backend data while keeping code clean, testable, and maintainable. We built a small, production-minded integration following a three-layer architecture:

- API Service Layer (`src/services/api.js`) — handles HTTP and error parsing
- Hooks Layer (`src/hooks/useFetch.js` + resource hooks) — manages async state, aborts, stale-guards
- Component Layer (features) — only renders UI and skeletons; receives data via hooks

We also handled dev infra (env variables and Codespaces proxy/CORS) and UX issues (loading, animations, hover states).

---

## What we created (quick listing)

- `.env.development.local` — `VITE_API_URL` (frontend base URL)
- `src/services/api.js` — central request helper + resource functions
- `src/hooks/useFetch.js` — generic async hook with AbortController
- `src/hooks/useAbout.js`, `useServices.js`, `useReviews.js`, `useContact.js` — thin resource hooks
- Migrated `Services.jsx` and `ServicesHero.jsx` to use `useServices()` (live data)
- CSS tweak: made hover effects apply to `.featureItem` so cards animate even when `link` is absent
- Backend seeding/testing via `curl` (login + create service)

---

## Key Concepts, Patterns & Examples

### 1) API Service Layer (single source of truth)

Why: Keeps the base URL, common headers, error parsing, and any auth logic centralized.

Core pattern (example):

```js
// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error('VITE_API_URL not set');

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getServices(signal) { return request('/services', { signal }); }
export function submitInquiry(data) { return request('/contact/submit', { method: 'POST', body: JSON.stringify(data) }); }
```

Notes:
- Always check `res.ok` because `fetch` only throws on network errors, not HTTP status codes.
- Merge headers defensively: callers can add `Authorization` without removing `Content-Type`.
- Export small, named functions per endpoint — easy to mock and test.

### 2) Generic `useFetch` Hook

Why: Avoid repeating loading/error/abort patterns across components.

Core pattern (example):

```js
// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn(controller.signal)
      .then(result => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (!cancelled) { console.error('[useFetch]', err); setError(err.message || 'Error'); setLoading(false); }
      });

    return () => { cancelled = true; controller.abort(); };
  }, deps);

  return { data, loading, error };
}
```

Notes:
- `AbortController` prevents setState after unmount and cancels network usage.
- `cancelled` boolean avoids race conditions where an earlier request resolves after a later one.
- Hook accepts `fetchFn` (function referencing an API function) and `deps` for re-fetch control.

### 3) Thin Resource Hooks

Why: Keep components decoupled from `api.js` specifics. If you add caching or pagination you change the hook only.

Example:

```js
// src/hooks/useServices.js
import { useFetch } from './useFetch';
import { getServices } from '../services/api';
export function useServices() { return useFetch(getServices, []); }
```

### 4) Component Usage (safe pattern)

- Always call hooks at top of component
- Do not early-return before declaring hooks
- Render skeletons or placeholder DOM if observers/animations need the DOM present

Example:

```jsx
function Services() {
  const { data, loading, error } = useServices();
  const sectionRef = useRef(null);

  useEffect(() => { /* IntersectionObserver code */ }, [loading]);

  if (loading) return null; // or render skeleton while ensuring sectionRef exists earlier
  if (error) return <div>Sorry, something went wrong.</div>;

  return <div ref={sectionRef}>{data.map(s => <Card key={s._id} ... />)}</div>;
}
```

Important: if you return `null` while loading and you rely on an observer or CSS animation that requires the DOM node on mount, ensure the observer is (re)initialized after load (e.g., `[loading]` dep) or render a placeholder DOM while loading.

---

## Practical Troubleshooting We Did (and why)

### CORS + Codespaces

Problem observed: browser fetch to backend failed with preflight blocked (no Access-Control-Allow-Origin). `curl` worked because it's server-to-server.

Diagnoses & fixes:
- Add the actual frontend origin to backend `ALLOWED_ORIGINS` in `cms-backend/.env.development.local`.
- Ensure `VITE_API_URL` points to the correct Codespace host for the backend (the host contains the codespace name and port, e.g. `https://<codespace>-5000.app.github.dev/api`).
- Forward port 5000 in VS Code and set it to **Public** so the GitHub port proxy does not intercept preflight (otherwise proxy blocks OPTIONS). After changes, restart both backend and frontend services.

How to check preflight and CORS headers with curl:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://<your-frontend-host>" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:5000/api/services
```

Look for `Access-Control-Allow-Origin` header in the response.

### Animation race with IntersectionObserver

Problem: after migrating to async data, cards rendered but stayed invisible (CSS started `opacity:0` and needed `fadeInUp` class applied when observer detected the section). Observer ran on mount before DOM existed (we returned `null` while loading), so it never saw the element.

Fixes:
- Re-run observer after `loading` finishes by adding `loading` to the `useEffect` deps array, or render a placeholder DOM during loading so the observer sees the node on mount.

### Hover/interactive styling

Problem: hover styles were applied only when `FeatureGrid.Item` had `.interactive` class (set when `link` or `onClick` exists). API data lacked `link` so hover didn't apply.

Options:
- Add `link` to the model and seed data (long-term) or
- Scope hover styles to the base item class (`.featureItem`) — we chose to change hover selectors so hover shows regardless of `link` presence.

---

## Testing & Seeding Utilities (commands)

Login to get token (backend running on localhost or Codespace host):

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourSecurePassword123!"}'
```

Seed a service with token:

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Buying Homes","description":"...","image":"https://picsum.photos/400/300"}'
```

Verify API returns data:

```bash
curl http://localhost:5000/api/services
```

Frontend validation:
- Open DevTools → Network → filter `Fetch/XHR` → reload page → inspect `GET /api/services` response.

---

## Common Patterns (quick reference)

- Centralize HTTP: `api.js` (base + request helper)
- Use `useFetch` for generic async handling
- Wrap with resource hooks `useXxx` so components only import hooks
- Allow `signal` injection for cancelation (`fetch(signal)`)
- Merge headers safely: `headers: { 'Content-Type': 'application/json', ...options.headers }
- Keep components dumb: render logic + skeletons only

---

## Migration Checklist (next steps)

1. Migrate `About.jsx` (single object) → `useAbout()`
2. Migrate `Reviews.jsx` (array + carousel) → `useReviews()` and preserve carousel state
3. Wire contact form: add `POST /api/contact/submit` backend route and `useSubmitInquiry()` hook
4. Migrate Gallery after seeding property documents with Cloudinary image URLs
5. Improve loading UI (skeletons) and add opt-in caching or SWR-style revalidation

---

## Teaching Notes & Exercises

- Exercise: change `useFetch` to add a `retry` option and test with a temporary endpoint that fails intermittently.
- Exercise: implement optimistic UI for creating a review: local state update before receiving backend confirmation.
- Exercise: add a `link` field to `Service` model, update seeds, and restore interactive `FeatureGrid.Item` semantics.

---

If you want I can:
- Migrate `About.jsx` now and show the patch, or
- Walk you step-by-step through `About.jsx` migration while you code it.

File created: [PHASE_8_FRONTEND_NOTES.md](PHASE_8_FRONTEND_NOTES.md)
