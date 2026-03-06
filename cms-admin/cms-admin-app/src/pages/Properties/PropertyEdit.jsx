import { useNavigate, useParams } from "react-router-dom";
import { useProperty } from "../../hooks/useProperty";
import { usePropertyForm } from "../../hooks/usePropertyForm";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import styles from "./PropertiesCreate.module.css";

function PropertyEditForm({ property, id }) {
  const navigate = useNavigate();

  const {
    formData,
    images,
    setImages,
    isSubmitting,
    error: formError,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  } = usePropertyForm(property, id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Property</h1>
        <button
          type="button"
          onClick={() => navigate("/admin/properties")}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>

      {formError && <div className={styles.error}>{formError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info Section */}
        <section className={styles.section}>
          <h2>Basic Information</h2>

          <div className={styles.formGroup}>
            <label htmlFor="address">
              Address <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">
              Price <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="$500,000"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="3"
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                placeholder="2"
                onChange={handleChange}
                min="0"
                step="0.5"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sqft">Square Feet</label>
              <input
                type="text"
                id="sqft"
                name="sqft"
                value={formData.sqft}
                onChange={handleChange}
                placeholder="2000"
              />
            </div>
          </div>
        </section>

        {/* Image Section */}
        <section className={styles.section}>
          <h2>Images</h2>

          <ImageUpload images={images} onChange={setImages} />

          <div className={styles.formGroup}>
            <label htmlFor="alt">
              Image Alt Text <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="alt"
              name="alt"
              value={formData.alt}
              onChange={handleChange}
              placeholder="Beautiful home exterior"
              required
            />
            <small>Describe the image for accessibility</small>
          </div>
        </section>

        {/* Featured Image Picker — only shown when "Feature on Homepage" is checked */}
        {formData.featured && images.length > 0 && (
          <section className={styles.section}>
            <h2>Featured Image</h2>
            <p>
              <small>
                Click an image to use it as the homepage carousel thumbnail.
              </small>
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {images.map((image, index) => {
                const src =
                  image.type === "existing" ? image.url : image.preview;
                const isSelected = formData.featuredImage === src;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "featuredImage",
                          value: isSelected ? "" : src,
                        },
                      })
                    }
                    style={{
                      padding: 0,
                      border: isSelected
                        ? "3px solid #2563eb"
                        : "3px solid transparent",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: "none",
                    }}
                  >
                    <img
                      src={src}
                      alt={`Option ${index + 1}`}
                      width={100}
                      height={75}
                      style={{
                        objectFit: "cover",
                        borderRadius: "4px",
                        display: "block",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Additional Info Section */}
        <section className={styles.section}>
          <h2>Additional Information</h2>

          <div className={styles.formGroup}>
            <label htmlFor="link">Link (optional)</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://..."
            />
            <small>External link for more details</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
              />
              <span>Feature on Homepage</span>
            </label>
            <small>
              When checked, this property will appear in the homepage carousel
            </small>
          </div>
        </section>

        {/* Submit Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate("/admin/properties")}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Updating..." : "Update Property"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Outer component that handles data fetching and loading states
export default function PropertyEdit() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id);

  // Show loading/error states
  if (loading)
    return <div className={styles.container}>Loading property...</div>;
  if (error)
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  if (!property)
    return (
      <div className={styles.container}>
        <div className={styles.error}>Property not found</div>
      </div>
    );

  // Only render form after data is loaded
  return <PropertyEditForm property={property} id={id} />;
}
