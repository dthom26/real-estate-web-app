import { useRef, useState } from "react";
import styles from "./ImageUpload.module.css";
import { useMediaLibrary } from "../../hooks/useMediaLibrary";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB — must match Cloudinary and multer limits

export default function ImageUpload({ images, onChange, onAddLibraryImages }) {
  // Hook to open the media library
  const { openLibrary } = useMediaLibrary();

  // Local state for drag-and-drop and size errors

  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [sizeError, setSizeError] = useState(null);

  // Build new image objects from selected files, then add them all at once
  const handleFileSelect = (event) => {
    const all = Array.from(event.target.files);

    // Split into valid and oversized
    const oversized = all.filter((f) => f.size > MAX_FILE_SIZE);
    const valid = all.filter((f) => f.size <= MAX_FILE_SIZE);

    // Warn about rejected files but still add the valid ones
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      setSizeError(`Skipped (over 10MB): ${names}`);
    } else {
      setSizeError(null);
    }

    if (valid.length === 0) {
      event.target.value = "";
      return;
    }

    const newItems = valid.map((file) => ({
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...newItems]);
    event.target.value = "";
  };

  // Remove item at the given index, leave everything else in place
  const handleRemoveImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Drag stubs — will fill in during Task 5
  const handleDragStart = (index) => {
    dragIndex.current = index;
  };
  const handleDrop = (index) => {
    if (dragIndex.current === null) return;
    const reordered = [...images];
    const [movedItem] = reordered.splice(dragIndex.current, 1);
    reordered.splice(index, 0, movedItem);
    onChange(reordered);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className={styles.wrapper}>
      {/* Size validation error */}
      {sizeError && <div className={styles.sizeError}>{sizeError}</div>}

      {/* Thumbnail grid */}
      <div className={styles.grid}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.thumb}${dragOverIndex === index ? ` ${styles.thumbDragOver}` : ""}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={() => handleDrop(index)}
          >
            <img
              src={
                image.type === "existing" || image.type === "library"
                  ? image.url
                  : image.preview
              }
              alt={`Property image ${index + 1}`}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemoveImage(index)}
              aria-label={`Remove image ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Hidden file input triggered by the label */}
      <label className={styles.addLabel}>
        + Add Images
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />
      </label>
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
    </div>
  );
}
