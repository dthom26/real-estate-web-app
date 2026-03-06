# Phase 9: Admin UI Development Plan

## Why Start With a Basic Admin UI?

Building a basic admin UI first allows you to:

- Validate core workflows (CRUD, authentication, navigation) before adding complexity.
- Catch architectural issues early and iterate quickly.
- Avoid over-engineering features you may not need.
- Ship a usable product faster, then layer on advanced features as requirements become clearer.
- Make future enhancements easier, since you’ll have a solid foundation.

---

## Detailed Plan Outline

### 1. Project Setup

- [x] Scaffold `cms-admin` folder as a standalone React app (Vite recommended).
- [x] Install dependencies: `react-router-dom`, `axios`.
- [x] Set up basic folder structure:
  - `src/components/` (shared UI)
  - `src/pages/` (feature pages)
  - `src/services/` (API logic)
  - `src/hooks/` (custom hooks)
  - `src/context/` (auth context)
  - `src/App.jsx`, `src/main.jsx`

### 2. Authentication

- [x] Create Login page with username/password form.
- [x] Connect to backend `/api/auth/login` endpoint.
- [x] Store JWT in memory (in-memory token store used instead of localStorage — more secure).
- [x] Set up AuthContext for global auth state.
- [x] Implement protected routes (redirect to login if not authenticated).
- [x] **Token refresh logic**: Auto-refresh JWT on 401 response via `api.js` interceptor; session bootstrapped from httpOnly cookie on load.

### 3. Layout & Navigation

- [x] Build Layout component with sidebar and header.
- [x] Sidebar: links to Dashboard, Properties, Reviews, Services, Content.
- [x] Header: show logged-in user, logout button.

### 4. Properties Management (CRUD)

- [x] Properties List page: table of properties (address, price, actions).
- [x] Property Create page: form for new property (address, price, image, etc.).
- [x] Property Edit page: form pre-filled with existing data.
- [ ] Delete property: confirmation modal, remove from list. _(Delete is wired but fires immediately — no confirmation modal yet.)_
- [x] Use reusable form components for common UI patterns (`PropertyForm` component).
- [ ] **Pagination (defer if <50 items)**: Add page navigation when dataset grows large.

### 5. Reviews Management (CRUD)

- [x] Reviews List page: table of reviews.
- [x] Review Create/Edit page: form for review fields (name, rating, comment).
- [ ] Delete review: confirmation modal. _(Delete is wired but no confirmation modal yet.)_

### 6. Services Management (CRUD)

- [x] Services List page: table of services.
- [x] Service Create/Edit page: form for service fields (title, description, image).
- [ ] Delete service: confirmation modal. _(Delete is wired but no confirmation modal yet.)_

### 7. Content Management (Singletons)

- [x] About page: form for header, textContent, image.
- [x] Contact page: form for email, phone, address, description.
- [x] **Hero Section** _(bonus — not in original plan)_: form for hero content, managed in the same accordion UI.

### 8. Error Handling & Feedback

- [x] Show API errors in red banner (`ErrorBanner` component built; inline error divs used on list pages).
- [x] Show form validation errors below fields (reusable `Input` component handles this).
- [x] Show success messages (green success banners implemented on all Content/singleton forms).
- [ ] **Unsaved changes warning**: Prompt user before navigating away from forms with unsaved data. _(Not implemented.)_

### 9. File Uploads

- [x] Integrate image upload in property/service forms. (Multi-image upload built for properties; single image for services/hero/about unchanged.)
- [x] Preview image before upload. (Thumbnails shown via `URL.createObjectURL`.)
- [x] Handle upload errors gracefully. (10MB client-side size validation; server-side multer limit aligned to Cloudinary.)
- [x] **Bonus — multi-image support**: Properties support multiple images with drag-to-reorder.
- [x] **Bonus — featured image picker**: Edit page lets admin pick which image appears in the homepage carousel.

### 10. Testing & Polish

- [ ] Test all CRUD flows.
- [ ] Test authentication and protected routes.
- [ ] Test error scenarios (API down, invalid input).
- [ ] Polish UI for clarity and usability.

### 11. Deployment Essentials

- [ ] Set JWT expiry appropriate for single-admin use (8-12 hours).
- [ ] Generate strong JWT_SECRET for production (long random string).
- [ ] Setup automated database backups (daily minimum).
- [ ] Enable HTTPS for production deployment.
- [ ] Secure admin URL (not easily guessable path).
- [ ] Configure environment variables properly (.env for production).
- [ ] Document backup/restore procedure.
- [ ] Test recovery from backup.

---

## Next Steps After Basic Admin UI

Once the basic admin UI is stable:

- Add drag-drop reordering for properties/services.
- Implement draft/publish status and preview mode.
- Enhance image handling (crop, optimize).
- Build section layout editor for homepage.
- Add advanced filtering, search, and pagination.

---

**Summary:**
Start simple, validate the foundation, then iterate and expand. This approach keeps development focused, reduces risk, and makes future enhancements easier.
