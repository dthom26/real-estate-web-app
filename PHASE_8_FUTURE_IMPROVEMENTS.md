# Phase 8 — Future Improvements

This file collects small, testable improvements and TODOs we can pick up after the core Phase 8 migration is complete.

**Carousel & Properties**

- Add `GET /api/properties/carousel?limit=N` (already implemented). Allow `limit` and clamp server-side.
- Server-side mapping: return `image: featuredImage || image` so clients receive a consistent shape.
- Add `featured` toggle + `featuredOrder` on `Property` and expose a compact projection via the repo (`.select(...)` + `.lean()`).
- Consider a separate `Carousel` collection only if slides need independent scheduling, captions, or marketing-only entries.

**API / Controller**

- Validate query params with `express-validator` for endpoints that accept `limit`, page, or filters.
- Add short TTL caching for high-read endpoints (carousel, hero) to reduce DB load (e.g. `apicache` or simple in-memory TTL).
- Keep DB query logic in repositories; controller should parse/validate `req.*` and map DB shape to API shape.

**Security & Reliability**

- Add rate limiting for public endpoints (`express-rate-limit`).
- Add response compression (gzip/Brotli) and enable cache headers where appropriate.

**Frontend**

- Add `getCarousel(signal, limit)` to `src/services/api.js` and `useCarousel` hook wrapping `useFetch`.
- Render an accessible empty state if there are no slides; disable navigation when `total === 0`.
- Use `loading` in IntersectionObserver `useEffect` deps to avoid animation race conditions.

**Developer ergonomics**

- add a few seed scripts to `cms-backend/seed` for properties, hero, about, and reviews for easy local testing.
- Document `VITE_API_URL` and Codespaces port visibility quirks in `QUICK_START.md` or the README.

Pick any of the above and I can scaffold the change and add tests or example curl commands.

**Image Upload Size Handling**

- Problem: Multer may reject uploads that exceed the configured `fileSize` limit with a `MulterError: File too large` (seen as a 500 in development if not mapped). This commonly happens when admins try to upload high-resolution photos taken by modern cameras/phones.

- Short-term fixes (no server change):
  - Upload a smaller image or compress/resize locally before sending (e.g. ImageMagick or Preview). Example:
    ```bash
    magick input.jpg -resize 1600 output.jpg
    ```

- Server-side options:
  - Increase the Multer limit by reading `MAX_FILE_SIZE` from env and applying it in `config/multer.js`:
    ```js
    import { MAX_FILE_SIZE } from "../config/env.js";
    const maxSize = Number(MAX_FILE_SIZE) || 5 * 1024 * 1024;
    const upload = multer({
      storage,
      limits: { fileSize: maxSize },
      fileFilter,
    });
    ```
  - Keep the size reasonable for your app; very large uploads increase memory and network usage.

- Recommended production approach:
  - Prefer client-side resizing/compression or direct-to-Cloudinary (unsigned/signed) uploads from the admin UI. This avoids routing large files through your server and improves UX.

- Error handling improvement (server): map Multer errors to a clear 413 response in `middleware/errorHandler.js` so clients get a friendly message instead of a generic 500:
  ```js
  if (err.code === "LIMIT_FILE_SIZE" || err.name === "MulterError") {
    statusCode = 413;
    message = "File too large. Reduce image size and try again.";
  }
  ```

These additions help reduce confusion for admins and make the upload flow more resilient and user-friendly.
