# Cloudinary Media Library Widget — Implementation Plan

**Feature:** Add a Cloudinary Media Library widget to the CMS admin so the admin
can browse all uploaded images, select any for reuse across sections, and manually
delete stale assets directly from Cloudinary.

**Scope:** All image inputs in the CMS — Properties, Services, Hero, About  
**Foundational prerequisite:** `CLOUDINARY_PUBLIC_ID_PLAN.md` must be complete ✅

---

## Design Decision — No Auto-Deletion on Update

This is a deliberate choice made before writing this plan:

- **Property delete** → destroys all Cloudinary images ✅ (already implemented)
- **Service delete** → destroys the Cloudinary image ✅ (already implemented)
- **Any section update** (swap image, remove from list) → does **NOT** destroy the
  old Cloudinary asset

**Reason:** Property images are likely professional photography. An accidental
removal + save would permanently destroy an irreplaceable file with no undo.
The library is the intentional cleanup tool — the admin decides what to delete
on their own schedule. One consistent mental model across the whole CMS:
_editing never destroys storage, deleting a record does_.

---

## What the Widget Gives You

1. **Browse all uploaded images** in the Cloudinary `real-estate/` folder in a grid UI
2. **Select any image** and it comes back as `{ url, public_id }` — available anywhere in the CMS
3. **Delete images** directly from Cloudinary via the library UI
4. **Re-use images** across sections without re-uploading (saves Cloudinary bandwidth and storage)

Every image input in the CMS gets two paths:

- **Upload** — upload a file from your machine (existing flow, unchanged)
- **Library** — open the widget, pick an image that's already in Cloudinary

---

## API Shape Decision — Option B (Always Return Full Objects)

Since we are in development and have no legacy data, we go with **Option B**:
the API always returns the full `{ url, public_id }` object for image fields. The
public frontend is updated to read `.url` from the object wherever it renders an
image. There is no serialization logic in the backend controllers, and no legacy
string fallbacks anywhere in the codebase.

**Why Option B wins here:**

- No migration scripts, no defensive fallback chains in controllers
- The API shape is consistent and self-documenting
- If you ever want to display alt text or other image metadata later, it's already
  in the object — no API change required
- The number of public frontend lines to change is tiny (two files, two lines each)

---

## Current State

| Section    | Image field       | Stores               | Status                      |
| ---------- | ----------------- | -------------------- | --------------------------- |
| Properties | `images` (array)  | `{ url, public_id }` | ✅ Model + forms done       |
| Services   | `image`           | `{ url, public_id }` | ✅ Model + forms done       |
| Hero       | `backgroundImage` | `{ url, public_id }` | ✅ Model done, forms remain |
| About      | `image`           | `{ url, public_id }` | ✅ Model done, forms remain |

---

## Phase 1 — Backend: Media Library Signing Endpoint ✅ COMPLETE

The Cloudinary Media Library widget cannot be opened without a server-generated
signature. This is a security requirement — the `CLOUDINARY_API_SECRET` must never
leave the server, so the frontend asks your own backend to sign the request.

**How it works:**

1. Admin clicks "Choose from Library"
2. Frontend calls `GET /api/cloudinary/sign-ml`
3. Backend generates a cryptographic signature using `CLOUDINARY_API_SECRET` and
   the current Unix timestamp, then returns `{ timestamp, signature, api_key, cloud_name }`
4. Frontend passes these to `window.cloudinary.openMediaLibrary(...)` — Cloudinary
   verifies the signature server-side before allowing the widget to open

The signature includes a timestamp so it expires in minutes. A fresh one is fetched
every time the admin opens the widget.

### 1a — Controller ✅

**File:** `cms-backend/controllers/cloudinaryController.js`

> ⚠️ **Import path bug to fix:** The file currently imports from
> `"../config/cloudinaryConfig.js"` which does not exist. Change to `"../config/env.js"`.

```js
import crypto from "crypto";
import {
  CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
} from "../config/env.js"; // ← was ../config/cloudinaryConfig.js — fix this
```

The signing logic itself is correct — just the import path needs updating.

### 1b — Route ✅

**File:** `cms-backend/routes/cloudinary.js`

> ⚠️ **Import path bug to fix:** The file currently imports from
> `"../middleware/authMiddleware.js"` which does not exist. Change to `"../middleware/auth.js"`.

```js
import { authenticateToken } from "../middleware/auth.js"; // ← was authMiddleware.js — fix this
```

The route itself (`GET /sign-ml` protected by `authenticateToken`) is correct.

### 1c — Registered in `app.js` ✅

`app.use("/api/cloudinary", cloudinaryRoutes)` is already in `app.js`.

### 1d — `env.js` exports ✅

`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_CLOUD_NAME` are all
exported from `cms-backend/config/env.js`. No changes needed.

### 1e — Admin `api.js` ✅

`getCloudinarySignature()` is already exported from
`cms-admin/cms-admin-app/src/services/api.js`.

---

## Phase 2 — Upgrade Hero + About Models ✅ COMPLETE

### Why both fields needed upgrading

Properties and Services already stored their images as `{ url, public_id }` objects
because they were built during the `CLOUDINARY_PUBLIC_ID_PLAN` phase. Hero and About
were built earlier and stored image URLs as plain strings. For consistency — and
because the Media Library widget returns `{ url, public_id }` — both were upgraded.

### 2a — Hero model ✅

**File:** `cms-backend/models/hero.js`

`backgroundImage` is now a nested object schema:

```js
backgroundImage: {
  url: { type: String },
  public_id: { type: String },
},
```

Neither sub-field is `required`, so saving the hero without an image (or before
the admin uploads one) will not throw a validation error.

### 2b — About model ✅

**File:** `cms-backend/models/about.js`

Same change — `image` is now `{ url: String, public_id: String }`.

### 2c — Validators ✅

**Files:** `cms-backend/middleware/validators/heroValidator.js` and `aboutValidator.js`

Both validators use a custom validator that accepts the `{ url, public_id }` object
shape. They currently still allow the old string shape as a fallback — since we have
no legacy data, you can remove the string fallback at any time:

```js
// Current (keeps legacy string support — safe to clean up)
body("backgroundImage")
  .optional()
  .custom((value) => {
    if (typeof value === "string") return true; // ← remove this line when ready
    if (
      typeof value === "object" &&
      value !== null &&
      typeof value.url === "string" &&
      typeof value.public_id === "string"
    ) {
      return true;
    }
    throw new Error("...");
  }),
```

Not blocking — clean up when convenient.

### 2d — Controllers ✅ (Option B — return full objects)

**Files:** `cms-backend/controllers/heroController.js` and `aboutController.js`

Both controllers already return the raw database document with no serialization.
Under Option B this is exactly what we want — the full `{ url, public_id }` object
is returned to any caller (both the public site and the admin). No changes needed.

### 2e — No migration needed

We are in development. All test images will be deleted and re-uploaded from scratch
in the new `{ url, public_id }` shape. No migration scripts are required.

---

## Phase 3 — Media Library Widget Script ✅ TODO

**File:** `cms-admin/cms-admin-app/index.html`

The Cloudinary Media Library widget is not an npm package — Cloudinary distributes
it as a hosted script that you load from their CDN. When the page loads, this script
attaches itself to `window.cloudinary`, which is what your hook will call when the
admin clicks "Choose from Library".

Add the script tag before `</body>`:

```html
<script src="https://media-library.cloudinary.com/global/all.js"></script>
```

**Why before `</body>` (not `<head>`)?** Scripts in `<head>` block the page from
rendering until they download. Placing it before `</body>` lets the React app mount
and display its UI immediately. The library widget script loads in parallel and will
be ready long before the admin has a chance to click "Choose from Library".

---

## Phase 4 — `useMediaLibrary` Hook ✅ TODO

**Create:** `cms-admin/cms-admin-app/src/hooks/useMediaLibrary.js`

This is the single piece of code that every image input in the CMS will share. It
handles the two-step open sequence: fetch a fresh signature → open the widget.

```js
import { getCloudinarySignature } from "../services/api";

export function useMediaLibrary() {
  const openLibrary = async ({ onSelect, multiple = false }) => {
    // Step 1: Get a fresh signed token from your backend.
    // The widget will not open without this — Cloudinary rejects unsigned requests.
    const { timestamp, signature, api_key, cloud_name } =
      await getCloudinarySignature();

    // Step 2: Open the widget. Cloudinary renders it as a full-screen overlay.
    window.cloudinary.openMediaLibrary(
      {
        cloud_name,
        api_key,
        timestamp,
        signature,
        multiple, // true = multi-select (Properties), false = single (Hero/About/Service)
      },
      {
        // insertHandler fires when the admin clicks "Insert" inside the widget.
        insertHandler: (data) => {
          // data.assets is always an array, even in single-select mode.
          const assets = data.assets.map((a) => ({
            url: a.secure_url, // always use secure_url — http URLs are deprecated
            public_id: a.public_id,
          }));
          // For single-select, unwrap the array so callers get a single object.
          onSelect(multiple ? assets : assets[0]);
        },
      },
    );
  };

  return { openLibrary };
}
```

**Key design point:** `openLibrary` takes an `onSelect` callback. Each form decides
what to do with the selected asset(s) — `useMediaLibrary` stays generic and reusable.

> **`multiple: false`** — Hero, About, Service (single image fields)  
> **`multiple: true`** — Properties (`images` array)

---

## Phase 5 — Update Image Input Components

### 5a — `ImageUpload.jsx` (Properties — multi-image) ✅ TODO

**File:** `cms-admin/cms-admin-app/src/components/ImageUpload/ImageUpload.jsx`

This component handles the image list for property forms. It currently only supports
uploading files from disk. Add an "Add from Library" button beside the file input.

**What to add:**

- Import `useMediaLibrary` and call `const { openLibrary } = useMediaLibrary()` at
  the top of the component
- Add a second button next to the existing file input:
  ```jsx
  <button
    type="button"
    onClick={() =>
      openLibrary({
        multiple: true,
        onSelect: (assets) => {
          // assets is an array of { url, public_id }
          // Wrap each one in a "library" type so the form knows it doesn't need uploading
          const libraryImages = assets.map((a) => ({
            type: "library",
            url: a.url,
            public_id: a.public_id,
          }));
          onAddLibraryImages(libraryImages); // pass up to the form
        },
      })
    }
  >
    Add from Library
  </button>
  ```

**Why `type: "library"`?** The images array in `usePropertyForm` tracks each image's
origin. `type: "existing"` means it came from the database, `type: "new"` means it's
a local file pending upload, and `type: "library"` means it was picked from Cloudinary
and already has a URL — no upload step needed when the form submits.

### 5b — Single-image sections (Hero, About, Services) ✅ TODO

For Hero, About, and both Service forms, the library button is a simpler addition —
one button, one selected image. Add it directly in each form's JSX.

**Pattern (same for all four):**

```jsx
import { useMediaLibrary } from "../../../hooks/useMediaLibrary";

// Inside the component:
const { openLibrary } = useMediaLibrary();

// In the image section of the form:
<input type="file" onChange={handleImageChange} />
<button
  type="button"
  onClick={() =>
    openLibrary({
      multiple: false,
      onSelect: (asset) => handleLibrarySelect(asset),
    })
  }
>
  Choose from Library
</button>
```

`handleLibrarySelect` is added in the form hooks (Phase 6). The JSX just wires the
button click to the hook's callback.

---

## Phase 6 — Update Form Hooks

### 6a — `useHeroForm.js` ✅ TODO

**File:** `cms-admin/cms-admin-app/src/hooks/useHeroForm.js`

There are two bugs here and one new feature to add:

**Bug 1 — imagePreview is broken with the new model shape.**  
Currently:

```js
const [imagePreview, setImagePreview] = useState(
  initialData?.backgroundImage || null, // ← backgroundImage is now { url, public_id }, not a string
);
```

A `src` attribute set to `"[object Object]"` will show a broken image. Fix:

```js
const [imagePreview, setImagePreview] = useState(
  initialData?.backgroundImage?.url || null,
);
```

**Bug 2 — handleSubmit sends a URL string instead of `{ url, public_id }`.**  
Currently:

```js
let backgroundImage = initialData?.backgroundImage; // ← this is now { url, public_id } — OK as fallback
if (imageFile) {
  const uploadResult = await uploadImage(imageFile);
  backgroundImage = uploadResult.url; // ← BUG: discards public_id, sends string
}
```

Fix:

```js
let backgroundImage = initialData?.backgroundImage ?? null; // already { url, public_id }
if (selectedLibraryImage) {
  backgroundImage = selectedLibraryImage; // { url, public_id } from widget
} else if (imageFile) {
  backgroundImage = await uploadImage(imageFile); // { url, public_id } from upload endpoint
}
```

**New feature — library select state and handler:**

```js
const [selectedLibraryImage, setSelectedLibraryImage] = useState(null);

const handleLibrarySelect = (asset) => {
  setImageFile(null); // discard any pending file upload
  setImagePreview(asset.url); // show the library image as preview
  setSelectedLibraryImage(asset); // store for submission
  setSuccess(false);
};
```

Return `handleLibrarySelect` from the hook so `HeroSection.jsx` can wire it to the
"Choose from Library" button.

### 6b — `useAboutForm.js` ✅ TODO

**File:** `cms-admin/cms-admin-app/src/hooks/useAboutForm.js`

Same bugs and same fix pattern as `useHeroForm.js`, but for the `image` field:

**Bug 1 — imagePreview:**

```js
// Before:
const [imagePreview, setImagePreview] = useState(initialData?.image || null);
// After:
const [imagePreview, setImagePreview] = useState(
  initialData?.image?.url || null,
);
```

**Bug 2 — handleSubmit loses public_id:**

```js
// Before:
let imageUrl = initialData?.image; // raw string stored in old shape
if (imageFile) {
  const uploadResult = await uploadImage(imageFile);
  imageUrl = uploadResult.url; // ← loses public_id
}
// send: image: imageUrl (string)

// After:
let imageData = initialData?.image ?? null; // now { url, public_id } from DB
if (selectedLibraryImage) {
  imageData = selectedLibraryImage;
} else if (imageFile) {
  imageData = await uploadImage(imageFile); // returns { url, public_id }
}
// send: image: imageData (object)
```

**New state and handler** (same pattern as Hero):

```js
const [selectedLibraryImage, setSelectedLibraryImage] = useState(null);

const handleLibrarySelect = (asset) => {
  setImageFile(null);
  setImagePreview(asset.url);
  setSelectedLibraryImage(asset);
  setSuccess(false);
};
```

### 6c — `useServiceForm.js` ✅ TODO

**File:** `cms-admin/cms-admin-app/src/hooks/useServiceForm.js`

The service form already sends `{ url, public_id }` on the upload path — no bugs to
fix. Just add the library path alongside:

```js
const [selectedLibraryImage, setSelectedLibraryImage] = useState(null);

const handleLibrarySelect = (asset) => {
  setImageFile(null);
  setImagePreview(asset.url);
  setSelectedLibraryImage(asset);
};
```

In `handleSubmit`, add the priority check before the existing `if (imageFile)` block:

```js
let imageData = formData.image; // existing { url, public_id }
if (selectedLibraryImage) {
  imageData = selectedLibraryImage;
} else if (imageFile) {
  imageData = await uploadImage(imageFile);
}
```

### 6d — `usePropertyForm.js` ✅ TODO

**File:** `cms-admin/cms-admin-app/src/hooks/usePropertyForm.js`

The `finalImages` builder currently only handles `type: "existing"` and `type: "new"`.
Library images (`type: "library"`) are already in Cloudinary and must be treated the
same as existing images — pass through their `url` and `public_id` directly, with no
upload step. Update the map:

```js
// Before:
const finalImages = images.map((img) => {
  if (img.type === "existing")
    return { url: img.url, public_id: img.public_id };
  return newUrls[newIndex++];
});

// After:
const finalImages = images.map((img) => {
  if (img.type === "existing" || img.type === "library")
    return { url: img.url, public_id: img.public_id };
  return newUrls[newIndex++];
});
```

You also need to expose an `addLibraryImages` handler to be called from `ImageUpload.jsx`
when the admin selects images from the widget:

```js
const addLibraryImages = (libraryImages) => {
  // libraryImages = [{ type: "library", url, public_id }, ...]
  setImages((prev) => [...prev, ...libraryImages]);
};
```

Return `addLibraryImages` from the hook so `ImageUpload.jsx` can call it.

---

## Phase 7 — Update Public Frontend  TODO

**Decision: Option B.** The API returns the full `{ url, public_id }` object. The
public site just needs to read `.url` from it wherever it renders an image.

### 7a — `src/features/Hero/Hero.jsx`

**File:** `src/features/Hero/Hero.jsx`

Currently:

```jsx
style={
  data.backgroundImage
    ? { "--hero-bg": `url(${data.backgroundImage})` } // ← Object renders as "[object Object]"
    : undefined
}
```

Fix:

```jsx
style={
  data.backgroundImage?.url
    ? { "--hero-bg": `url(${data.backgroundImage.url})` }
    : undefined
}
```

`src/hooks/useHero.js` does not need to change — it just fetches and returns `data`
as-is. The component is the only consumer that renders the image.

### 7b — `src/features/About/About.jsx`

**File:** `src/features/About/About.jsx`

Currently:

```jsx
<TextImageSection.Image
  src={data.image} // ← passes { url, public_id } object as src — broken
  alt={data.header}
/>
```

Fix:

```jsx
<TextImageSection.Image src={data.image?.url} alt={data.header} />
```

`src/hooks/useAbout.js` does not need to change.

---

## File Change Summary

| #   | File                                                                    | Status  | What changes                                                      |
| --- | ----------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| 1   | `cms-backend/controllers/cloudinaryController.js`                       | ⚠️ Fix  | Fix import path: `cloudinaryConfig.js` → `env.js`                 |
| 2   | `cms-backend/routes/cloudinary.js`                                      | ⚠️ Fix  | Fix import path: `authMiddleware.js` → `auth.js`                  |
| 3   | `cms-backend/app.js`                                                    | ✅ Done | cloudinary route already registered                               |
| 4   | `cms-backend/config/env.js`                                             | ✅ Done | All Cloudinary vars exported                                      |
| 5   | `cms-backend/models/hero.js`                                            | ✅ Done | `backgroundImage: { url, public_id }`                             |
| 6   | `cms-backend/models/about.js`                                           | ✅ Done | `image: { url, public_id }`                                       |
| 7   | `cms-backend/middleware/validators/heroValidator.js`                    | ✅ Done | Accepts object shape (legacy string fallback can be cleaned up)   |
| 8   | `cms-backend/middleware/validators/aboutValidator.js`                   | ✅ Done | Same                                                              |
| 9   | `cms-admin/cms-admin-app/index.html`                                    | ❌ TODO | Add Cloudinary ML widget script tag before `</body>`              |
| 10  | `cms-admin/cms-admin-app/src/services/api.js`                           | ✅ Done | `getCloudinarySignature()` already added                          |
| 11  | `cms-admin/cms-admin-app/src/hooks/useMediaLibrary.js`                  | ❌ TODO | **NEW** — widget open logic (Phase 4)                             |
| 12  | `cms-admin/cms-admin-app/src/components/ImageUpload/ImageUpload.jsx`    | ❌ TODO | Add "Add from Library" button, call `addLibraryImages` (Phase 5a) |
| 13  | `cms-admin/cms-admin-app/src/hooks/usePropertyForm.js`                  | ❌ TODO | Handle `type: "library"`, expose `addLibraryImages` (Phase 6d)    |
| 14  | `cms-admin/cms-admin-app/src/hooks/useHeroForm.js`                      | ❌ TODO | Fix preview init, fix submit, add library select path (Phase 6a)  |
| 15  | `cms-admin/cms-admin-app/src/hooks/useAboutForm.js`                     | ❌ TODO | Fix preview init, fix submit, add library select path (Phase 6b)  |
| 16  | `cms-admin/cms-admin-app/src/hooks/useServiceForm.js`                   | ❌ TODO | Add library select path (Phase 6c)                                |
| 17  | `cms-admin/cms-admin-app/src/pages/Content/HeroSection/HeroSection.jsx` | ❌ TODO | "Choose from Library" button (Phase 5b)                           |
| 18  | `cms-admin/cms-admin-app/src/pages/Content/About/About.jsx`             | ❌ TODO | "Choose from Library" button (Phase 5b)                           |
| 19  | `cms-admin/cms-admin-app/src/pages/Services/ServicesCreate.jsx`         | ❌ TODO | "Choose from Library" button (Phase 5b)                           |
| 20  | `cms-admin/cms-admin-app/src/pages/Services/ServiceEdit.jsx`            | ❌ TODO | "Choose from Library" button (Phase 5b)                           |
| 21  | `src/features/Hero/Hero.jsx`                                            | ❌ TODO | `data.backgroundImage` → `data.backgroundImage?.url` (Phase 7a)   |
| 22  | `src/features/About/About.jsx`                                          | ❌ TODO | `data.image` → `data.image?.url` (Phase 7b)                       |

---

## Testing Checklist

- [ ] `GET /api/cloudinary/sign-ml` returns `{ timestamp, signature, api_key, cloud_name }` (test with Postman or browser while logged in — should 401 if not authenticated)
- [ ] Click "Choose from Library" on the Hero form — widget opens, select an image, preview updates, save → MongoDB `hero` document stores `backgroundImage: { url, public_id }`
- [ ] Click "Choose from Library" on the About form — same, `about` document stores `image: { url, public_id }`
- [ ] Click "Choose from Library" on Service Create — same
- [ ] Click "Choose from Library" on Service Edit — existing image replaced
- [ ] Click "Add from Library" on Property Create — widget opens in multi-select, selected images appear in the grid alongside uploaded ones
- [ ] Click "Add from Library" on Property Edit — library images add to existing list, form saves with correct `{ url, public_id }` for all
- [ ] Public Hero section renders background image correctly (CSS var resolved from `backgroundImage.url`)
- [ ] Public About section renders image correctly (`data.image?.url` used as `<img src>`)
- [ ] File upload ("Upload" path) still works on all sections — no regression
- [ ] Delete an image from within the Cloudinary widget UI — image removed from Cloudinary dashboard

---

## What's Out of Scope (Future)

- **Custom branded library UI** — the Cloudinary widget has its own look. A fully
  custom image browser would require calling the Cloudinary Admin API directly and
  building your own grid UI. More control, much more work.
- **Folder filtering** — the widget shows all folders in the account. You can add
  `folder: "real-estate"` to `openMediaLibrary` options to default to your folder.
  Not blocking, worth adding as a small quality-of-life improvement.
- **Review images** — reviews currently have no images, so out of scope.
