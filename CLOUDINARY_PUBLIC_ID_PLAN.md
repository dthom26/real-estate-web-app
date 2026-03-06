# Cloudinary `public_id` Storage & Deletion — Implementation Plan

**Feature:** Store Cloudinary `public_id` alongside image URLs so images can be
properly deleted from Cloudinary (not just MongoDB) when a property or service is
removed.

**Scope:** Properties (multi-image array) + Services (single image)  
**Does NOT touch:** Hero, About (no delete routes — separate problem for later)

---

## Before You Start — Understand the Problem

Right now, when you upload an image through the CMS, your backend calls Cloudinary
and gets back a big result object that looks like this:

```json
{
  "public_id": "real-estate/abc123xyz",
  "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/real-estate/abc123xyz.jpg",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  ...
}
```

Your `uploadController.js` currently takes that result and throws away everything
except `secure_url`, returning only `{ url: "https://..." }` to the frontend.

The `public_id` is Cloudinary's internal key for that file — you need it to call
`cloudinary.uploader.destroy(public_id)` later. Without it, you can delete the
MongoDB document but the image file lives on in Cloudinary forever, costing you
storage.

**The fix:** Store `{ url, public_id }` as a pair everywhere an image is saved.

---

## The Full Map — What Changes and Why

Here's every file that needs to change and the reason it's on the list:

| #   | File                                                     | Why it changes                                                                                                                                     |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `cms-backend/repositories/propertyRepository.js`         | Latent bug: `findFeatured` select has `image` (singular — doesn't exist) instead of `images`                                                       |
| 2   | `cms-backend/controllers/uploadController.js`            | Currently drops `public_id` from Cloudinary's response                                                                                             |
| 3   | `cms-backend/models/property.js`                         | `images: [String]` → `images: [{ url, public_id }]`                                                                                                |
| 4   | `cms-backend/models/service.js`                          | `image: String` → `image: { url, public_id }`                                                                                                      |
| 5   | `cms-backend/middleware/validators/propertyValidator.js` | `images.*` is validated as a string — will reject objects                                                                                          |
| 6   | `cms-backend/middleware/validators/serviceValidator.js`  | Same problem for `image` field                                                                                                                     |
| 7   | `cms-backend/controllers/propertyController.js`          | `deleteProperty` needs Cloudinary cleanup; `getCarousel` needs updating for new shape; public API responses need to serialize back to URL strings  |
| 8   | `cms-backend/controllers/serviceController.js`           | `deleteService` needs Cloudinary cleanup                                                                                                           |
| 9   | Migration script (new file)                              | Existing MongoDB docs have `images: ["https://..."]` — must be converted or the app breaks                                                         |
| 10  | `cms-admin/.../services/api.js`                          | `uploadImages()` strips to URL strings; `uploadImage()` wrapper drops `public_id`                                                                  |
| 11  | `cms-admin/.../hooks/usePropertyForm.js`                 | Maps existing images as `url => ({ type, url })` and rebuilds as URL strings — both need to carry `public_id`                                      |
| 12  | `cms-admin/.../pages/Properties/PropertyEdit.jsx`        | Featured image picker stores and compares `featuredImage` as a URL string — needs to stay a URL string but be derived correctly from the new shape |
| 13  | `cms-admin/.../hooks/useServiceForm.js`                  | Stores `image: imageUrl` (string) — needs to store `{ url, public_id }`                                                                            |

---

## Step 1 — Fix the Latent `findFeatured` Bug First

**File:** `cms-backend/repositories/propertyRepository.js`

This is a pre-existing bug completely unrelated to the main feature, but it's
affecting your carousel right now. The `select` string asks for `image` (the old
singular field that no longer exists). You need to fix this before anything else
so the carousel actually works.

**Find this in `findFeatured`:**

```js
.select('_id image alt address price bedrooms bathrooms sqft link featuredImage featuredOrder')
```

**Change it to:**

```js
.select('_id images alt address price bedrooms bathrooms sqft link featuredImage featuredOrder')
```

That's the only change in this file. One character, but it matters.

---

## Step 2 — Update the Upload Controller

**File:** `cms-backend/controllers/uploadController.js`

This is the cleanest change in the whole project. Cloudinary already gives you
`public_id` — you're just not returning it. No schema changes needed yet.

**Find this block:**

```js
res.status(201).json({
  success: true,
  data: results.map((result) => ({ url: result.secure_url })),
  message: "Images uploaded successfully",
});
```

**Change it to:**

```js
res.status(201).json({
  success: true,
  data: results.map((result) => ({
    url: result.secure_url,
    public_id: result.public_id,
  })),
  message: "Images uploaded successfully",
});
```

That's it. The upload endpoint now returns `{ url, public_id }` pairs. Every
consumer of this endpoint will need to handle that going forward — which is what
the next steps cover.

> **Why this step is second:** You fix the output of the source (the upload API)
> before fixing the consumers. This way you can trace the data flow top-down.

---

## Step 3 — Update the Mongoose Models

### 3a — Property Model

**File:** `cms-backend/models/property.js`

The `images` field changes from a flat array of strings to an array of objects.
Each object has exactly two required fields: `url` and `public_id`.

**Find:**

```js
images: { type: [String], required: true,
  validate: {
    validator: (arr) => arr.length >= 1,
    message: 'At least one image is required'
  }
},
```

**Replace with:**

```js
images: {
  type: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }
  ],
  required: true,
  validate: {
    validator: (arr) => arr.length >= 1,
    message: 'At least one image is required',
  },
},
```

**Leave `featuredImage: { type: String }` alone.** The featured image is a URL
string that's derived from one of the images in the array. It doesn't need its
own `public_id` because when you delete a property you're already deleting all
images in the `images` array — `featuredImage` is just a display alias, not a
separate asset.

### 3b — Service Model

**File:** `cms-backend/models/service.js`

**Find:**

```js
image: { type: String, required: true },
```

**Replace with:**

```js
image: {
  url: { type: String, required: true },
  public_id: { type: String, required: true },
},
```

> **Think about it:** You've just told MongoDB what shape data should be, but
> your existing documents in the database are still plain strings (or URL strings
> in the images array). That mismatch will cause validation errors and query
> failures. That's what Step 5 (migration) fixes. Don't run the app between Step
> 3 and Step 5 unless you're okay with things being temporarily broken.

---

## Step 4 — Update the Validators

These run _before_ data hits your controllers. If they still expect strings, they'll
reject the new `{ url, public_id }` objects immediately with a 400 error.

### 4a — Property Validator

**File:** `cms-backend/middleware/validators/propertyValidator.js`

**Find:**

```js
body("images")
  .isArray({ min: 1 })
  .withMessage("At least one image is required"),

body("images.*").isString().withMessage("Each image must be a string"),
```

**Replace with:**

```js
body("images")
  .isArray({ min: 1 })
  .withMessage("At least one image is required"),

body("images.*.url")
  .isString()
  .notEmpty()
  .withMessage("Each image must have a url"),

body("images.*.public_id")
  .isString()
  .notEmpty()
  .withMessage("Each image must have a public_id"),
```

### 4b — Service Validator

**File:** `cms-backend/middleware/validators/serviceValidator.js`

Find wherever `image` is validated as a string and replace it with:

```js
body("image.url")
  .isString()
  .notEmpty()
  .withMessage("Image URL is required"),

body("image.public_id")
  .isString()
  .notEmpty()
  .withMessage("Image public_id is required"),
```

---

## Step 5 — Write and Run the Migration Script

**This is the most important step.** If you skip it, every existing property and
service in MongoDB will fail Mongoose validation because their `images` field
contains strings instead of `{ url, public_id }` objects.

> **The honest truth about this step:** Your existing Cloudinary images were
> uploaded before you were storing `public_id`. That means for _existing_ records,
> you won't have the `public_id` anymore — Cloudinary doesn't give it back if you
> didn't save it. You have two options:
>
> **Option A (Recommended for development):** Use a placeholder `public_id` like
> `"legacy/unknown"` for all existing records. This tells you "this image predates
> the feature." You won't be able to auto-delete these old ones via the API, but
> new uploads going forward will work perfectly. Deletion of legacy records can be
> done manually in the Cloudinary dashboard.
>
> **Option B:** If you have a small number of properties, go into your Cloudinary
> dashboard, find each image in the `real-estate/` folder, copy its `public_id`,
> and manually update each MongoDB document. Time-consuming but clean.

**Create a new file:** `cms-backend/migrateImages.js`

```js
import mongoose from "mongoose";
import { DB_URI } from "./config/env.js";
import Property from "./models/property.js";
import Service from "./models/service.js";

const migrate = async () => {
  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB");

  // --- Migrate Properties ---
  // Find all properties where images contains plain strings (old format)
  const properties = await mongoose.connection
    .collection("properties")
    .find({})
    .toArray();

  for (const prop of properties) {
    if (!prop.images || prop.images.length === 0) continue;

    // Check if the first image is already an object (already migrated)
    if (typeof prop.images[0] === "object" && prop.images[0].url) {
      console.log(`Property ${prop._id} already migrated, skipping.`);
      continue;
    }

    // It's still a plain string array — convert to objects
    const migratedImages = prop.images.map((url) => ({
      url,
      public_id: "legacy/unknown", // placeholder — see note above
    }));

    await mongoose.connection
      .collection("properties")
      .updateOne({ _id: prop._id }, { $set: { images: migratedImages } });
    console.log(`Migrated property ${prop._id}`);
  }

  // --- Migrate Services ---
  const services = await mongoose.connection
    .collection("services")
    .find({})
    .toArray();

  for (const svc of services) {
    // Check if already migrated
    if (typeof svc.image === "object" && svc.image?.url) {
      console.log(`Service ${svc._id} already migrated, skipping.`);
      continue;
    }

    if (!svc.image) continue;

    await mongoose.connection.collection("services").updateOne(
      { _id: svc._id },
      {
        $set: {
          image: {
            url: svc.image,
            public_id: "legacy/unknown",
          },
        },
      },
    );
    console.log(`Migrated service ${svc._id}`);
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

**Run it:**

```bash
cd cms-backend
node migrateImages.js
```

> **Important:** Use the raw MongoDB driver (`mongoose.connection.collection(...)`)
> rather than the Mongoose models for the migration. This bypasses the new
> validator on write, letting you read the old shape and update it without
> Mongoose throwing validation errors mid-migration. After the migration runs,
> all documents match the new schema and your Mongoose models work normally.

---

## Step 6 — Update the Property Controller

**File:** `cms-backend/controllers/propertyController.js`

Two things need updating here.

### 6a — The `deleteProperty` function

This is the whole reason we're doing this. Add Cloudinary deletion before
(or after) removing the MongoDB document.

```js
import cloudinary from "../config/cloudinary.js";
import propertyRepository from "../repositories/propertyRepository.js";

// delete property
export const deleteProperty = async (req, res, next) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Delete all images from Cloudinary before removing the DB record
    const deletions = property.images
      .filter((img) => img.public_id && img.public_id !== "legacy/unknown")
      .map((img) => cloudinary.uploader.destroy(img.public_id));

    await Promise.allSettled(deletions);
    // Note: allSettled (not Promise.all) — if one Cloudinary deletion fails,
    // we still want to remove the MongoDB document. Don't let a failed CDN
    // call leave a zombie record in your database.

    await propertyRepository.deleteById(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};
```

> **Why `allSettled` instead of `all`?** A Cloudinary API call could time out or
> return an error for an image that was already manually deleted from the dashboard.
> `Promise.all` would throw and abort the whole deletion, leaving the MongoDB record
> orphaned. `allSettled` lets all deletions attempt and only the MongoDB removal
> is your single point of truth.

### 6b — The `getCarousel` function

`getCarousel` currently does:

```js
images: s.featuredImage ? [s.featuredImage] : s.images,
```

With the new schema, `s.images` is `[{ url, public_id }]` — if you return it as-is,
the public frontend (which expects a URL string at `images[0]`) will break. You
need to serialize it back to a plain URL string array:

```js
const payload = slides.map((s) => ({
  _id: s._id,
  images: s.featuredImage ? [s.featuredImage] : s.images.map((img) => img.url),
  alt: s.alt,
  address: s.address,
  price: s.price,
  bedrooms: s.bedrooms,
  bathrooms: s.bathrooms,
  sqft: s.sqft,
  link: s.link,
  order: s.featuredOrder ?? 0,
}));
```

### 6c — The `getAllProperties` and `getPropertyById` functions

The public site (`/api/properties`) doesn't need `public_id` — that's internal
CMS data. Serialize the images array to URLs for the public endpoints:

```js
export const getAllProperties = async (req, res, next) => {
  try {
    const properties = await propertyRepository.findAll();
    const serialized = properties.map((p) => ({
      ...p.toObject(),
      images: p.images.map((img) => img.url),
    }));
    res.json(serialized);
  } catch (error) {
    next(error);
  }
};
```

Apply the same `.images.map(img => img.url)` pattern to `getPropertyById`.

> **Why serialize for the public API?** The public frontend uses
> `item.images?.[0]` expecting a string. Keeping the public response as URL
> strings means absolutely nothing changes on the public site. Only the CMS
> admin — which you fully control — needs to know about `public_id`.

---

## Step 7 — Update the Service Controller

**File:** `cms-backend/controllers/serviceController.js`

Same pattern as properties but simpler — single image, not an array.

```js
import cloudinary from "../config/cloudinary.js";
import serviceRepository from "../repositories/serviceRepository.js";

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Delete the image from Cloudinary
    if (
      service.image?.public_id &&
      service.image.public_id !== "legacy/unknown"
    ) {
      await cloudinary.uploader
        .destroy(service.image.public_id)
        .catch(() => {});
      // .catch(() => {}) — same reasoning as allSettled above
    }

    await serviceRepository.deleteById(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};
```

Also update `getAllServices` and `getServiceById` to serialize `image.url` for the
public frontend:

```js
export const getAllServices = async (req, res, next) => {
  try {
    const services = await serviceRepository.findAll();
    const serialized = services.map((s) => ({
      ...s.toObject(),
      image: s.image?.url ?? null,
    }));
    res.json(serialized);
  } catch (error) {
    next(error);
  }
};
```

---

## Step 8 — Update the CMS Admin API Service

**File:** `cms-admin/cms-admin-app/src/services/api.js`

Two functions need updating.

### 8a — `uploadImages` (multi-file, used by properties)

**Find:**

```js
const data = json?.data ?? json;
return Array.isArray(data) ? data.map((item) => item.url) : [];
```

**Replace with:**

```js
const data = json?.data ?? json;
// Return full { url, public_id } objects — callers now need to handle objects
return Array.isArray(data)
  ? data.map((item) => ({ url: item.url, public_id: item.public_id }))
  : [];
```

### 8b — `uploadImage` (single-file wrapper, used by services and about)

**Find:**

```js
export async function uploadImage(file, opts = {}) {
  const urls = await uploadImages([file], opts);
  return { url: urls[0] };
}
```

**Replace with:**

```js
export async function uploadImage(file, opts = {}) {
  const results = await uploadImages([file], opts);
  return results[0]; // { url, public_id }
}
```

> **Notice:** `uploadImages` now returns an array of `{ url, public_id }` objects,
> so `results[0]` gives you the full object directly. No need to reconstruct it.

---

## Step 9 — Update `usePropertyForm.js`

**File:** `cms-admin/cms-admin-app/src/hooks/usePropertyForm.js`

This hook has two places that need updating.

### 9a — Initializing existing images from the API

**Find:**

```js
const [images, setImages] = useState(
  (initialData?.images || []).map((url) => ({ type: "existing", url })),
);
```

**Replace with:**

```js
const [images, setImages] = useState(
  (initialData?.images || []).map((img) => ({
    type: "existing",
    url: img.url,
    public_id: img.public_id,
  })),
);
```

> **Wait — but Step 6c says the public API serializes images back to URL strings.**
> Correct — but the CMS admin uses `getProperty(id)` to load a single property for
> editing, not `getAllProperties`. You need to make `getPropertyById` return the
> full `{ url, public_id }` objects for CMS admin use, but serialize to URLs for
> the public `getAllProperties`. The cleanest way to do this: keep `getPropertyById`
> returning full objects (it's protected by auth middleware anyway), and only
> serialize in `getAllProperties` and `getCarousel`. This is a small but important
> distinction.

### 9b — Rebuilding the final images array before submitting

**Find:**

```js
let newUrlIndex = 0;
const finalImages = images.map((img) => {
  if (img.type === "existing") return img.url;
  return newUrls[newUrlIndex++]; // consume new URLs in order
});
```

**Replace with:**

```js
let newIndex = 0;
const finalImages = images.map((img) => {
  if (img.type === "existing")
    return { url: img.url, public_id: img.public_id };
  return newUrls[newIndex++]; // { url, public_id } objects from Step 8a
});
```

---

## Step 10 — Update `useServiceForm.js`

**File:** `cms-admin/cms-admin-app/src/hooks/useServiceForm.js`

### 10a — Initialize image state in edit mode

**Find:**

```js
const [formData, setFormData] = useState({
  ...
  image: initialData?.image || "",
  ...
});
const [imagePreview, setImagePreview] = useState(initialData?.image || null);
```

The `initialData.image` will now be `{ url, public_id }` when editing an existing
service (since `getServiceById` returns the full object). Update:

```js
const [formData, setFormData] = useState({
  ...
  image: initialData?.image || null,  // null instead of "" for object
  ...
});
const [imagePreview, setImagePreview] = useState(initialData?.image?.url || null);
```

### 10b — Build the submission payload

**Find:**

```js
let imageUrl = formData.image;

if (imageFile) {
  const uploadResult = await uploadImage(imageFile);
  imageUrl = uploadResult.url;
}

const submitData = {
  ...
  image: imageUrl,
  ...
};
```

**Replace with:**

```js
let imageData = formData.image; // { url, public_id } if existing

if (imageFile) {
  imageData = await uploadImage(imageFile); // { url, public_id } from Step 8b
}

const submitData = {
  ...
  image: imageData, // full object
  ...
};
```

---

## Step 11 — Update `PropertyEdit.jsx` Featured Image Picker

**File:** `cms-admin/cms-admin-app/src/pages/Properties/PropertyEdit.jsx`

The featured image picker currently works by comparing the selected URL string to
`formData.featuredImage`. Since the images in state now carry `{ url, public_id }`,
you need to derive the URL correctly when building the picker thumbnails.

**Find this section (around the featured image selection block):**

```js
{images.map((image, index) => {
  const src = image.type === "existing" ? image.url : image.preview;
  const isSelected = formData.featuredImage === src;
```

The `featuredImage` field in `formData` is still a URL string — that's fine.
The logic here already extracts `image.url` for existing images, so `src` is still
a URL string. **This section actually doesn't need to change** as long as `image.url`
is available on the state object (which it will be after Step 9a).

Double-check by reading through the comparison: `formData.featuredImage === src`.
Both sides are URL strings. ✓

---

## Step 12 — Verify the Full Flow End-to-End

After all changes are made, trace the data through the system manually before testing:

**Upload (new image):**

1. User picks a file in `ImageUpload.jsx`
2. `usePropertyForm` holds it as `{ type: "new", file, preview }`
3. On submit, `uploadImages([file])` calls `POST /api/upload`
4. `uploadController` uploads to Cloudinary, returns `{ url, public_id }`
5. `api.js` returns `[{ url, public_id }]`
6. `usePropertyForm` builds `finalImages` as `[{ url: "...", public_id: "..." }]`
7. `createProperty(propertyData)` sends `images: [{ url, public_id }]` to `POST /api/properties`
8. Validator accepts objects, Mongoose saves successfully ✓

**Delete (property):**

1. Admin clicks delete in the CMS
2. `deleteProperty(id)` calls `DELETE /api/properties/:id`
3. Controller fetches the property, iterates `property.images`
4. Calls `cloudinary.uploader.destroy(img.public_id)` for each
5. Calls `propertyRepository.deleteById(id)`
6. MongoDB document gone, Cloudinary files gone ✓

**Public site (gallery carousel):**

1. `useCarousel` calls `GET /api/properties/carousel`
2. `getCarousel` maps `s.images.map(img => img.url)` → plain URL strings
3. `GalleryCarousel3D` receives `item.images[0]` as a string → `<img src>` works ✓

---

## Common Mistakes to Watch For

**1. Running the app between Step 3 and Step 5**
The model schema change (Step 3) makes existing DB documents invalid before
migration runs (Step 5). If you start the server in that window, every read of
a property or service will either fail Mongoose validation or return malformed data.
Do Steps 3–5 as a tight sequence.

**2. Forgetting `getPropertyById` vs `getAllProperties` serialization**

- `getAllProperties` → serialize to URL strings (public site)
- `getCarousel` → serialize to URL strings (public site)
- `getPropertyById` → return full objects with `public_id` (CMS admin edit page needs them)
- Services: same distinction applies

**3. The `Promise.allSettled` vs `Promise.all` choice on deletion**
Always use `allSettled` when deleting from Cloudinary. A `public_id` that no longer
exists in Cloudinary returns an error from their API — `Promise.all` would cause
your delete endpoint to throw a 500 and leave the MongoDB record alive.

**4. Not importing `cloudinary` in the controllers**
Easy to miss — both `propertyController.js` and `serviceController.js` need
`import cloudinary from "../config/cloudinary.js";` at the top.

---

## Testing Checklist

Work through these manually in the CMS admin once all changes are deployed:

- [ ] Create a new property with 2+ images — check MongoDB, both images stored as `{ url, public_id }`
- [ ] Edit the property, remove one image, re-save — MongoDB updated, removed image gone from Cloudinary  
       _(Note: you're not yet implementing update-time deletion in this plan — the image stays in Cloudinary until you build that feature. This checklist item is a future reminder.)_
- [ ] Delete the property — MongoDB document gone, all Cloudinary images gone
- [ ] Public gallery carousel still shows images correctly
- [ ] Create a new service with an image — stored as `{ url, public_id }`
- [ ] Delete the service — Cloudinary image deleted
- [ ] Open an existing property in the edit page — images load and display correctly
- [ ] Featured image picker still works on edit page

---

## What's Not Covered Here (Future Work)

- **Update-time orphan cleanup for properties** — when editing a property and removing an image from the array, the removed image currently stays in Cloudinary. The fix is to diff the old `images` array against the new one in `updateProperty` and destroy any `public_id` values that are no longer present.

- **Update-time image replacement for Services, Hero, About** — same idea: when the admin uploads a new image to replace an existing one, destroy the old `public_id` from Cloudinary.

- **Cloudinary Media Library widget (Option A)** — this plan's changes are the required prerequisite. Once `{ url, public_id }` is stored everywhere, adding the widget is purely additive: new backend endpoint for signing ML sessions, new tab/toggle in `ImageUpload.jsx`.

- **`test-property.js` cleanup** — this test file still uses the old `image` (singular) field and will fail. It's not blocking this feature but should be updated to use the new `images: [{ url, public_id }]` shape.
