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

## Current State

| Section    | Image field       | Stores               | Widget-ready?                   |
| ---------- | ----------------- | -------------------- | ------------------------------- |
| Properties | `images` (array)  | `{ url, public_id }` | Almost — needs UI               |
| Services   | `image`           | `{ url, public_id }` | Almost — needs UI               |
| Hero       | `backgroundImage` | URL string only      | No — needs model + hook updates |
| About      | `image`           | URL string only      | No — needs model + hook updates |

---

## Phase 1 — Backend: Media Library Signing Endpoint

The ML widget requires a server-generated signature — you cannot sign it client-side
without exposing your `CLOUDINARY_API_SECRET`. This endpoint generates a
short-lived signature and returns it to the admin frontend.

**Why a fresh signature per open:** Cloudinary signatures expire (5–15 minutes).
The frontend must fetch a fresh one each time the admin clicks "Choose from Library".

### 1a — New controller

**Create:** `cms-backend/controllers/cloudinaryController.js`

```js
import crypto from "crypto";
import {
  CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
} from "../config/env.js";

export const signMediaLibrary = (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha256")
    .update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex");

  res.json({
    timestamp,
    signature,
    api_key: CLOUDINARY_API_KEY,
    cloud_name: CLOUDINARY_CLOUD_NAME,
  });
};
```

### 1b — New route

**Create:** `cms-backend/routes/cloudinary.js`

```js
import express from "express";
import { signMediaLibrary } from "../controllers/cloudinaryController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/cloudinary/sign-ml — generate ML widget signature (PROTECTED)
router.get("/sign-ml", authenticateToken, signMediaLibrary);

export default router;
```

### 1c — Register in `app.js`

```js
import cloudinaryRoutes from "./routes/cloudinary.js";
app.use("/api/cloudinary", cloudinaryRoutes);
```

### 1d — Verify `env.js` exports

Check that `CLOUDINARY_API_KEY` and `CLOUDINARY_CLOUD_NAME` are exported from
`cms-backend/config/env.js`. They're already used by the Cloudinary SDK config
(`config/cloudinary.js`) so they should exist — just confirm they're named exports
available for the controller to import.

### 1e — Add to `api.js`

**File:** `cms-admin/cms-admin-app/src/services/api.js`

```js
export function getCloudinarySignature(opts) {
  return get("/api/cloudinary/sign-ml", opts);
}
```

---

## Phase 2 — Upgrade Hero + About Models

Both currently store image fields as plain URL strings. To be consistent with
Properties and Services — and to make the widget output useful — upgrade them to
`{ url, public_id }` objects.

### 2a — Hero model

**File:** `cms-backend/models/hero.js`

**Find:**

```js
backgroundImage: { type: String, required: false },
```

**Replace with:**

```js
backgroundImage: {
  url: { type: String },
  public_id: { type: String },
},
```

### 2b — About model

**File:** `cms-backend/models/about.js`

**Find:**

```js
image: { type: String, required: false },
```

**Replace with:**

```js
image: {
  url: { type: String },
  public_id: { type: String },
},
```

### 2c — Hero + About validators

**Files:** `cms-backend/middleware/validators/heroValidator.js` and `aboutValidator.js`

Check for any `backgroundImage` or `image` validators that check `.isString()` —
if they exist, add `.optional()` and update to validate the object shape or just
remove the image field validation (both fields are optional on their models).

### 2d — Hero + About controllers — serialization for public API

The public frontend reads `hero.backgroundImage` and `about.image` as plain URL
strings (e.g. `<img src={hero.backgroundImage} />`). After this model change,
those fields are objects. You have two choices:

**Option A (Recommended):** Serialize in the controller GET, update public frontend.

- `getHero` — serialize: `backgroundImage: heroData.backgroundImage?.url ?? heroData.backgroundImage ?? null`
  (the fallback chain handles the old string shape during transition)
- `getAboutInfo` — same: `image: aboutData.image?.url ?? aboutData.image ?? null`
- Update the public frontend hooks to expect a URL string (no change needed — they
  already expect a string, and the serialized response gives them a string)
- The CMS admin calls the same endpoints but for editing purposes needs the full
  object — add a `?full=true` query param check in the controllers, or create
  separate `/admin` prefixed endpoints

**Option B (Simpler):** Always return full objects, update public frontend.

- Change `hero.backgroundImage` → `hero.backgroundImage?.url` in `src/hooks/useHero.js`
  and wherever it renders in the public site
- No serialization needed in the controllers
- One less moving part

Option B is less code — only a few lines in the public frontend. Recommended.

**Files to update in the public frontend (Option B):**

- `src/hooks/useHero.js` — if it passes `backgroundImage` directly to a component,
  change to `backgroundImage?.url`
- `src/features/Hero/` — wherever `backgroundImage` is used as `<img src>` or
  inline style `backgroundImage: url(...)`
- `src/hooks/useAbout.js` — same for `image`
- `src/features/About/` — wherever `image` is used as `<img src>`

### 2e — Migration

Hero and About are singletons containing a single document each. After the model
change, the existing document has `backgroundImage: "https://..."` (a plain string
at the wrong path for Mongoose). The field is not `required`, so the app won't
crash — the image just won't load until the admin resaves the form.

**Simplest migration:** The admin opens Hero Settings and About Settings in the CMS,
and saves each form once. This re-uploads (or reselects from library) the image in
the new `{ url, public_id }` shape. No migration script needed.

> **If you want a migration script anyway** (to avoid the image disappearing even
> briefly), use the same raw MongoDB driver pattern as the propert/service migration
> plan: `mongoose.connection.collection("heroes").updateMany(...)` where
> `backgroundImage` is a string → convert to `{ url: backgroundImage, public_id: "legacy/unknown" }`.

---

## Phase 3 — Media Library Widget Script

The Cloudinary ML widget is distributed as a hosted script. Load it once in the
admin app's `index.html`.

**File:** `cms-admin/cms-admin-app/index.html`

Add before `</body>`:

```html
<script src="https://media-library.cloudinary.com/global/all.js"></script>
```

This makes `window.cloudinary` available globally. The script is loaded from
Cloudinary's CDN — it does not require installation via npm.

---

## Phase 4 — `useMediaLibrary` Hook

Create a single hook that handles the full signature-fetch + widget-open flow.
Every image input that needs library access imports this hook.

**Create:** `cms-admin/cms-admin-app/src/hooks/useMediaLibrary.js`

```js
import { getCloudinarySignature } from "../services/api";

/**
 * Hook that exposes openLibrary() — fetches a fresh signature and opens
 * the Cloudinary Media Library widget.
 *
 * @returns {{ openLibrary: Function, isLoading: boolean }}
 */
export function useMediaLibrary() {
  const openLibrary = async ({ onSelect, multiple = false }) => {
    const { timestamp, signature, api_key, cloud_name } =
      await getCloudinarySignature();

    window.cloudinary.openMediaLibrary(
      {
        cloud_name,
        api_key,
        timestamp,
        signature,
        multiple,
      },
      {
        insertHandler: (data) => {
          const assets = data.assets.map((a) => ({
            url: a.secure_url,
            public_id: a.public_id,
          }));
          onSelect(multiple ? assets : assets[0]);
        },
      },
    );
  };

  return { openLibrary };
}
```

> **`multiple: false`** — used for Hero, About, Service (single image)  
> **`multiple: true`** — used for Properties (multi-image array)

---

## Phase 5 — Update Image Input Components

### 5a — `ImageUpload.jsx` (multi-image, Properties)

**File:** `cms-admin/cms-admin-app/src/components/ImageUpload/ImageUpload.jsx`

Add an "Add from Library" button next to the existing file input button.

- Import `useMediaLibrary`
- Call `openLibrary({ multiple: true, onSelect })` when the button is clicked
- In `onSelect`, receive an array of `{ url, public_id }` objects and append them
  to the images list as `{ type: "library", url, public_id }`
- Thumbnails render correctly because they already check `image.url` for existing items —
  `type: "library"` images also have `.url` so the same path works

**In `usePropertyForm.js`**, the `finalImages` builder already handles this
correctly because library images have `url` and `public_id` — treat them the same
as `type: "existing"`:

```js
const finalImages = images.map((img) => {
  if (img.type === "existing" || img.type === "library")
    return { url: img.url, public_id: img.public_id };
  return newUrls[newIndex++];
});
```

### 5b — Single-image sections (Hero, About, Services)

For these three sections the library button is simpler — one button, one selected
image. The cleanest approach is to add the button directly in each form's JSX with
the hook, rather than creating a new wrapper component. This keeps the surface area
small.

**Pattern for each section:**

In the form JSX (e.g. `HeroSection.jsx`):

```jsx
const { openLibrary } = useMediaLibrary();

// In the image section:
<input type="file" onChange={handleImageChange} />
<button
  type="button"
  onClick={() => openLibrary({
    multiple: false,
    onSelect: (asset) => handleLibrarySelect(asset),
  })}
>
  Choose from Library
</button>
```

Add `handleLibrarySelect` to each form hook (Hero, About, Service):

```js
const handleLibrarySelect = (asset) => {
  // asset = { url, public_id }
  setImageFile(null); // clear any pending file upload
  setImagePreview(asset.url);
  // store the full object for submission:
  setSelectedLibraryImage(asset);
};
```

On submit, check `selectedLibraryImage` before `imageFile`:

```js
let imageData = formData.image; // existing { url, public_id }
if (selectedLibraryImage) {
  imageData = selectedLibraryImage; // picked from library
} else if (imageFile) {
  imageData = await uploadImage(imageFile); // uploaded from disk
}
```

---

## Phase 6 — Update Form Hooks

### 6a — `useHeroForm.js`

Changes needed:

1. **Preview init** — backward compatible with old string shape:
   ```js
   const [imagePreview, setImagePreview] = useState(
     initialData?.backgroundImage?.url || initialData?.backgroundImage || null,
   );
   ```
2. **New state** — `const [selectedLibraryImage, setSelectedLibraryImage] = useState(null);`
3. **`handleLibrarySelect`** — sets preview + stores asset object, clears `imageFile`
4. **Submit logic** — priority: `selectedLibraryImage` > `imageFile` > existing
5. **Send `{ url, public_id }`** to `putHero` instead of a URL string

### 6b — `useAboutForm.js`

Same changes as `useHeroForm.js` but for the `image` field.

Current submit code:

```js
let imageUrl = initialData?.image;
if (imageFile) {
  const uploadResult = await uploadImage(imageFile);
  imageUrl = uploadResult.url; // ← this loses public_id
}
```

Updated submit code:

```js
let imageData = initialData?.image?.url
  ? initialData.image // already { url, public_id }
  : { url: initialData?.image, public_id: "legacy/unknown" }; // old string shape
if (selectedLibraryImage) {
  imageData = selectedLibraryImage;
} else if (imageFile) {
  imageData = await uploadImage(imageFile); // returns { url, public_id }
}
```

Send `image: imageData` to `putAboutInfo`.

### 6c — `useServiceForm.js`

Already uses `{ url, public_id }` for the upload path. Just add:

- `selectedLibraryImage` state
- `handleLibrarySelect` function
- Priority check in `handleSubmit` (`selectedLibraryImage` before `imageFile`)

### 6d — `usePropertyForm.js`

Update `finalImages` builder as described in Phase 5a:

```js
if (img.type === "existing" || img.type === "library")
  return { url: img.url, public_id: img.public_id };
```

---

## Phase 7 — Update Public Frontend (if using Option B from Phase 2d)

**Files to check and update in `src/`:**

- `src/hooks/useHero.js` — check how `backgroundImage` is returned/passed
- `src/features/Hero/` components — change `hero.backgroundImage` to `hero.backgroundImage?.url`
  wherever it's used as `src` or in a CSS `background-image` style
- `src/hooks/useAbout.js` — same for `image`
- `src/features/About/` components — change `about.image` to `about.image?.url`

These are read-only changes on the public site — no form logic to update.

---

## File Change Summary

| #   | File                                                                    | What changes                                                   |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | `cms-backend/controllers/cloudinaryController.js`                       | **NEW** — signing endpoint                                     |
| 2   | `cms-backend/routes/cloudinary.js`                                      | **NEW** — route for signing endpoint                           |
| 3   | `cms-backend/app.js`                                                    | Register new cloudinary route                                  |
| 4   | `cms-backend/config/env.js`                                             | Verify `CLOUDINARY_API_KEY` + `CLOUDINARY_CLOUD_NAME` exported |
| 5   | `cms-backend/models/hero.js`                                            | `backgroundImage: String` → `{ url, public_id }`               |
| 6   | `cms-backend/models/about.js`                                           | `image: String` → `{ url, public_id }`                         |
| 7   | `cms-backend/middleware/validators/heroValidator.js`                    | Remove/update backgroundImage string check                     |
| 8   | `cms-backend/middleware/validators/aboutValidator.js`                   | Remove/update image string check                               |
| 9   | `cms-admin/cms-admin-app/index.html`                                    | Add Cloudinary ML widget script tag                            |
| 10  | `cms-admin/cms-admin-app/src/services/api.js`                           | Add `getCloudinarySignature()`                                 |
| 11  | `cms-admin/cms-admin-app/src/hooks/useMediaLibrary.js`                  | **NEW** — widget open logic                                    |
| 12  | `cms-admin/cms-admin-app/src/components/ImageUpload/ImageUpload.jsx`    | Add "Add from Library" button                                  |
| 13  | `cms-admin/cms-admin-app/src/hooks/usePropertyForm.js`                  | Handle `type: "library"` in `finalImages`                      |
| 14  | `cms-admin/cms-admin-app/src/hooks/useHeroForm.js`                      | Library select + `{ url, public_id }` submission               |
| 15  | `cms-admin/cms-admin-app/src/hooks/useAboutForm.js`                     | Library select + `{ url, public_id }` submission               |
| 16  | `cms-admin/cms-admin-app/src/hooks/useServiceForm.js`                   | Add library select path                                        |
| 17  | `cms-admin/cms-admin-app/src/pages/Content/HeroSection/HeroSection.jsx` | "Choose from Library" button                                   |
| 18  | `cms-admin/cms-admin-app/src/pages/Content/About/About.jsx`             | "Choose from Library" button                                   |
| 19  | `cms-admin/cms-admin-app/src/pages/Services/ServicesCreate.jsx`         | "Choose from Library" button                                   |
| 20  | `cms-admin/cms-admin-app/src/pages/Services/ServiceEdit.jsx`            | "Choose from Library" button                                   |
| 21  | `src/hooks/useHero.js` + Hero components                                | `.url` extraction for public site                              |
| 22  | `src/hooks/useAbout.js` + About components                              | `.url` extraction for public site                              |

---

## Testing Checklist

- [ ] Click "Choose from Library" on the Hero form — widget opens, select an image, preview updates, save → MongoDB stores `{ url, public_id }`
- [ ] Click "Choose from Library" on the About form — same
- [ ] Click "Choose from Library" on Service Create — same
- [ ] Click "Choose from Library" on Service Edit — existing image replaced
- [ ] Click "Add from Library" on Property Create — widget opens in multi-select, selected images appear in the grid alongside uploaded ones
- [ ] Click "Add from Library" on Property Edit — library images add to existing list, form saves with `{ url, public_id }` for all
- [ ] Public hero section still renders correctly after Hero model migration
- [ ] Public about section still renders correctly after About model migration
- [ ] Delete an image from within the Cloudinary widget UI — image removed from Cloudinary dashboard
- [ ] File upload ("Upload" path) still works on all sections — no regression

---

## What's Out of Scope (Future)

- **Custom branded library UI** — the Cloudinary widget has its own look. A fully
  custom image browser would require calling the Cloudinary Admin API directly and
  building your own grid UI. More control, much more work.
- **Folder filtering** — the widget shows all folders in the account. You can add
  `folder: "real-estate"` to `openMediaLibrary` options to default to your folder.
  Not blocking, worth adding as a small quality-of-life improvement.
- **Review images** — reviews currently have no images, so out of scope.
