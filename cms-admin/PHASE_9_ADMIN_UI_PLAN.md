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

- [ ] Scaffold `cms-admin` folder as a standalone React app (Vite recommended).
- [ ] Install dependencies: `react-router-dom`, `axios`.
- [ ] Set up basic folder structure:
  - `src/components/` (shared UI)
  - `src/pages/` (feature pages)
  - `src/services/` (API logic)
  - `src/hooks/` (custom hooks)
  - `src/context/` (auth context)
  - `src/App.jsx`, `src/main.jsx`

### 2. Authentication

- [ ] Create Login page with username/password form.
- [ ] Connect to backend `/api/auth/login` endpoint.
- [ ] Store JWT in localStorage.
- [ ] Set up AuthContext for global auth state.
- [ ] Implement protected routes (redirect to login if not authenticated).
- [ ] **Token refresh logic**: Auto-refresh JWT before expiry or extend JWT expiry to 8-12 hours to avoid mid-work interruptions.

### 3. Layout & Navigation

- [ ] Build Layout component with sidebar and header.
- [ ] Sidebar: links to Dashboard, Properties, Reviews, Services, Content.
- [ ] Header: show logged-in user, logout button.

### 4. Properties Management (CRUD)

- [ ] Properties List page: table of properties (address, price, actions).
- [ ] Property Create page: form for new property (address, price, image, etc.).
- [ ] Property Edit page: form pre-filled with existing data.
- [ ] Delete property: confirmation modal, remove from list.
- [ ] Use reusable form components for common UI patterns.
- [ ] **Pagination (defer if <50 items)**: Add page navigation when dataset grows large.

### 5. Reviews Management (CRUD)

- [ ] Reviews List page: table of reviews.
- [ ] Review Create/Edit page: form for review fields (name, rating, comment).
- [ ] Delete review: confirmation modal.

### 6. Services Management (CRUD)

- [ ] Services List page: table of services.
- [ ] Service Create/Edit page: form for service fields (title, description, image).
- [ ] Delete service: confirmation modal.

### 7. Content Management (Singletons)

- [ ] About page: form for header, textContent, image.
- [ ] Contact page: form for email, phone, address, description.

### 8. Error Handling & Feedback

- [ ] Show API errors in red banner.
- [ ] Show form validation errors below fields.
- [ ] Show success messages (green banner or toast).
- [ ] **Unsaved changes warning**: Prompt user before navigating away from forms with unsaved data.

### 9. File Uploads

- [ ] Integrate image upload in property/service forms.
- [ ] Preview image before upload.
- [ ] Handle upload errors gracefully.

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
