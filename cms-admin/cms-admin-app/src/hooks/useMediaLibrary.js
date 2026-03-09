import { getCloudinarySignature } from "../services/api.js";

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
        folder: { path: "real-estate", resource_type: "image" },
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