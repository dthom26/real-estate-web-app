import { useAbout } from "../../../hooks/useAbout";
import { useAboutForm } from "../../../hooks/useAboutForm";
import styles from "./About.module.css";

/**
 * About - Outer component that handles data fetching.
 * Renders loading/error states before passing data to the form.
 */
export default function About() {
  const { about, loading, error } = useAbout();

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error) return <div className={styles.statusError}>Error: {error}</div>;
  if (!about) return <div className={styles.status}>No about data found.</div>;

  return <AboutForm about={about} />;
}

/**
 * AboutForm - Inner component that uses the form hook.
 * Safe to call hooks here because no conditional returns above it.
 */
function AboutForm({ about }) {
  const {
    formData,
    imagePreview,
    isSubmitting,
    error,
    success,
    handleChange,
    handleImageChange,
    handleSubmit,
  } = useAboutForm(about);

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={styles.success}>
          About section updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Content Section */}
        <section className={styles.section}>
          <h3>Content</h3>

          <div className={styles.formGroup}>
            <label htmlFor="header">
              Header <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="header"
              name="header"
              value={formData.header}
              onChange={handleChange}
              placeholder="About us heading"
              required
            />
            <small>Main heading displayed in the about section</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="textContent">
              Text Content <span className={styles.required}>*</span>
            </label>
            <textarea
              id="textContent"
              name="textContent"
              value={formData.textContent}
              onChange={handleChange}
              placeholder="Write about section content here..."
              rows="6"
              required
            />
            <small>Main body text for the about section</small>
          </div>
        </section>

        {/* Button Section */}
        <section className={styles.section}>
          <h3>Call to Action Button</h3>

          <div className={styles.formGroup}>
            <label htmlFor="buttonText">
              Button Text <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
              placeholder="Learn More"
              required
            />
            <small>Text displayed on the button</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="buttonLink">
              Button Link <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              id="buttonLink"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              placeholder="/contact"
            />
            <small>URL or path the button links to</small>
          </div>
        </section>

        {/* Image Section */}
        <section className={styles.section}>
          <h3>Image</h3>

          <div className={styles.formGroup}>
            <label htmlFor="image">
              About Image{" "}
              <span className={styles.optional}>
                (optional — leave empty to keep current)
              </span>
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>Max file size: 5MB. Formats: JPG, PNG, WebP</small>
          </div>

          {imagePreview && (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </section>

        {/* Submit Actions */}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
