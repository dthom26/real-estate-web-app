# Phase 8 — Frontend API Integration

Replace static data files with live API calls. The goal is a clean, maintainable
architecture that scales — not just swapping `import` for `fetch`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Environment Setup](#2-environment-setup)
3. [Step 1 — API Service Layer](#3-step-1--api-service-layer)
4. [Step 2 — Generic useFetch Hook](#4-step-2--generic-usefetch-hook)
5. [Step 3 — Resource Hooks](#5-step-3--resource-hooks)
6. [Step 4 — Migrate Features One by One](#6-step-4--migrate-features-one-by-one)
7. [Step 5 — Contact Form Submission](#7-step-5--contact-form-submission)
8. [Step 6 — Gallery / Properties](#8-step-6--gallery--properties)
9. [What We Are NOT Changing](#9-what-we-are-not-changing)
10. [File Structure After Phase 8](#10-file-structure-after-phase-8)
11. [Definition of Done](#11-definition-of-done)

---

## 1. Architecture Overview

**The three-layer rule:** a component should never know where its data comes from.

```
Component          Custom Hook          API Service
(renders UI)  →   (owns state)    →    (handles HTTP)
About.jsx          useAbout.js          api.js
Services.jsx       useServices.js       api.js
Reviews.jsx        useReviews.js        api.js
Contact.jsx        useContact.js        api.js
```

### Why this matters

| Concern                          | Lives in    |
| -------------------------------- | ----------- |
| Base URL, headers, error parsing | `api.js`    |
| loading / error / data state     | custom hook |
| Loading skeleton markup          | component   |
| Rendering data                   | component   |

Changing the API base URL in production requires editing **one file**, not every component.
Adding a retry strategy requires editing **one hook pattern**, not every component.

---

## 2. Environment Setup

Create a `.env.development.local` file **in the root of the React app** (not in `cms-backend`).

```
# /workspaces/real-estate-web-app/.env.development.local
VITE_API_URL=http://localhost:5000/api
```

**Why `VITE_` prefix?**
Vite only exposes env variables prefixed with `VITE_` to the browser bundle.
Variables without it are invisible to client-side code — a security guard, not a convention.

In code you access it as:

```js
import.meta.env.VITE_API_URL;
```

In production you set `VITE_API_URL=https://your-real-api.com/api` in your
hosting provider's environment config. Zero code changes required.

---

## 3. Step 1 — API Service Layer

**File to create:** `src/services/api.js`

This is the only file in the entire frontend that knows the API base URL.
It exports thin functions — one per backend resource.

### Responsibilities

- Read `import.meta.env.VITE_API_URL`
- Provide a central `request()` helper that handles:
  - Setting `Content-Type` header
  - Throwing a proper `Error` when `res.ok` is false (not just on network failure)
  - Returning parsed JSON
- Export one named function per endpoint group (`getServices`, `getReviews`, etc.)

### Key concept — why `res.ok` matters

`fetch` only throws on **network failure**. A `404` or `500` response does NOT throw.
Without checking `res.ok`, your app silently renders nothing and you never know why.

```js
// Bad — a 500 looks like success
const data = await fetch(url).then((res) => res.json());

// Good — a 500 throws and your error state catches it
if (!res.ok) throw new Error(`API error: ${res.status}`);
```

---

## 4. Step 2 — Generic `useFetch` Hook

**File to create:** `src/hooks/useFetch.js`

A single reusable hook that manages the three async states for any API call.

### Signature

```js
const { data, loading, error } = useFetch(fetchFn, dependencies);
```

- `fetchFn` — any function that returns a Promise (one of the functions from `api.js`)
- `dependencies` — array passed to the internal `useEffect` (same as `useEffect`'s second arg)
- Returns `{ data, loading, error }`

### State shape rules

- `loading` starts as `true`, becomes `false` when the call resolves or rejects
- `error` is `null` on success, a string message on failure
- `data` is `null` until a successful response

### Production considerations to build in

- **Abort on unmount** — use `AbortController` to cancel in-flight requests when the
  component unmounts. Prevents "can't update state on unmounted component" warnings.
- **Stale fetch guard** — if `fetchFn` changes mid-request, ignore the old response.

---

## 5. Step 3 — Resource Hooks

**Files to create:** one per API resource that needs data.

```
src/hooks/useAbout.js
src/hooks/useServices.js
src/hooks/useReviews.js
src/hooks/useContact.js
```

These are thin wrappers. Each one calls `useFetch` with the right function from `api.js`.
They exist so components never import from `api.js` directly — the hook is
the component's only dependency.

```js
// The entire file is ~5 lines
import { useFetch } from "./useFetch";
import { getServices } from "../services/api";

export function useServices() {
  return useFetch(getServices, []);
}
```

**Why not just use `useFetch` directly in the component?**
If you later add caching, pagination, or polling to services, you change `useServices.js`
in one place — not every component that renders services.

---

## 6. Step 4 — Migrate Features One by One

Migrate in this order, from simplest to most complex.

### Migration order

| #   | Feature        | Data source now    | New data source     | Notes                           |
| --- | -------------- | ------------------ | ------------------- | ------------------------------- |
| 1   | `About`        | `data/about.js`    | `GET /api/about`    | Single object, simplest case    |
| 2   | `Services`     | `data/services.js` | `GET /api/services` | Array, already maps over data   |
| 3   | `Reviews`      | `data/reviews.js`  | `GET /api/reviews`  | Array, has in-component state   |
| 4   | `Contact` info | `data/contact.js`  | `GET /api/contact`  | Display only (form is separate) |

### For each feature, the migration checklist

- [ ] Replace the static `import` from `data/` with the custom hook
- [ ] Add a loading state — render a skeleton or `null` while `loading === true`
- [ ] Add an error state — render a fallback message when `error` is set
- [ ] Verify the component still works with the same data shape the static file had
- [ ] Leave the static data file in place until verified (delete in cleanup step)

### Loading and error patterns to follow

**Loading:** keep it proportional. A full-page spinner for a text section is bad UX.
Use a content skeleton (grey placeholder boxes matching the layout shape) or
render `null` — never block the entire page for one section's data.

**Error:** never expose raw error messages to users. Log to console in development,
show a generic friendly message in the UI.

---

## 7. Step 5 — Contact Form Submission

**This is a separate concern from the contact info migration above.**

### Important distinction

The backend has two different contact-related responsibilities:

| Endpoint               | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `GET /api/contact`     | Returns the business's contact info (email, address, phone) |
| _(does not exist yet)_ | Receives a submitted form from a site visitor               |

The contact form currently has **no `onSubmit` handler** — it does nothing.
This step gives it real behavior.

### Decision to make before building

Form submissions can be handled two ways:

**Option A — Store in MongoDB**
Add a new model (`Submission` or `Inquiry`), route (`POST /api/contact/submit`),
and controller. Submissions are visible in the admin panel later (Phase 9).
This is the full CMS approach.

**Option B — Email only**
Use a third-party service (Resend, SendGrid, EmailJS) to send the submission
directly to an inbox. No new model needed, but submissions aren't stored.

**Recommended for Phase 8:** Option A. It fits the architecture already built,
and you can always add email notifications on top later.

### What to build (Option A)

**Backend additions:**

- New model: `Inquiry` (`firstName`, `lastName`, `email`, `phone`, `message`, `createdAt`)
- New route: `POST /api/contact/submit` — **public** (no auth required)
- New controller: validates input, saves to MongoDB, returns `201`

**Frontend additions:**

- Controlled form state in `Contact.jsx` (inputs wired to `useState`)
- A `submitInquiry(formData)` function in `api.js`
- A `useSubmitInquiry()` hook that manages `submitting`, `success`, `error` states
- After success: clear form, show confirmation message
- After error: show error message, keep form filled so user doesn't retype everything

---

## 8. Step 6 — Gallery / Properties

**This step is deliberately last.** The gallery is currently driven by **local imported
image assets**, not by API data. This migration requires:

1. Properties with real data (title, price, address, images) seeded in MongoDB
2. Images uploaded to Cloudinary and the URL stored in the property document
3. `GET /api/properties` returning that data

### Why it's more complex

The other features (About, Services, Reviews) only change _where_ the data comes from.
The gallery changes both the data source AND the data format — from local file paths
to Cloudinary HTTPS URLs. The `PropertyInfoOverlay` component and `GalleryCarousel3D`
will need review to ensure they accept the new shape.

### Prerequisite before starting this step

Seed at least 3–4 real property documents into MongoDB with Cloudinary image URLs.
Phase 8 cannot fully complete this step without real data in the database.

---

## 9. What We Are NOT Changing

- Component markup and CSS — data migration is not a redesign
- The `TextImageSection`, `BaseCard`, `FeatureGrid` components — they are already
  data-agnostic; they accept props, they don't care where the data came from
- Animation logic (IntersectionObserver) in `About.jsx` and `Services.jsx`
- The 3D gallery carousel implementation

---

## 10. File Structure After Phase 8

```
src/
  services/
    api.js                  ← NEW: base URL + all fetch functions
  hooks/
    useFetch.js             ← NEW: generic async state hook
    useAbout.js             ← NEW
    useServices.js          ← NEW
    useReviews.js           ← NEW
    useContact.js           ← NEW
    useSubmitInquiry.js     ← NEW
  data/
    about.js                ← keep until verified, then delete
    services.js             ← keep until verified, then delete
    reviews.js              ← keep until verified, then delete
    contact.js              ← keep until verified, then delete
    gallery.js              ← keep — local images still used as fallback
  features/
    About/About.jsx         ← UPDATED: uses useAbout()
    Services/Services.jsx   ← UPDATED: uses useServices()
    Reviews/Reviews.jsx     ← UPDATED: uses useReviews()
    Contact/Contact.jsx     ← UPDATED: controlled form + uses useContact() + useSubmitInquiry()
    Gallery/...             ← UPDATED: uses useProperties() (Step 6)
```

**New file in project root:**

```
.env.development.local      ← VITE_API_URL (already gitignored)
```

---

## 11. Definition of Done

Phase 8 is complete when:

- [ ] `src/services/api.js` exists and is the only file that references `VITE_API_URL`
- [ ] `useFetch.js` handles loading, error, abort-on-unmount
- [ ] `About`, `Services`, `Reviews`, `Contact` info sections render live data from the API
- [ ] Each section shows a loading state and a graceful error fallback
- [ ] The contact form submits to the backend and shows success/error feedback
- [ ] No raw API URLs appear in any component file
- [ ] Static data files in `src/data/` are removed (or clearly marked deprecated)
- [ ] The frontend `.env.development.local` is documented and gitignored

<!-- suggestions for reviews ui and edge cases -->

Short answers and why each matters:

Protect UI from crashes: accessing data[0] or data.length when data is null/[] throws. Checking total === 0 avoids runtime TypeErrors and broken JSX.

Example: const items = data || []; const total = items.length;
Good UX when no content: an empty state (friendly message + no arrows) is clearer than a broken carousel or blank area. It communicates intent and is accessible (announce with aria-live).

Prevent out-of-bounds index after data changes: if the list shrinks (or is re-fetched), current can exceed total - 1. Clamping ensures current always points to a valid item and avoids undefined renders.

Example:
useEffect(() => { if (current >= total) setCurrent(0); }, [total]);
Avoid animation / interaction glitches: disabling nav buttons when total === 0 or during isAnimating prevents clicks that would compute invalid indices or queue extra state updates.

Small recommended guards:

Render empty state early:
if (!loading && total === 0) return <div>No reviews yet.</div>;
Disable nav:
<button disabled={isAnimating || total === 0}>…</button>
Use safe indexing:
items[current]?.comment ?? ""
