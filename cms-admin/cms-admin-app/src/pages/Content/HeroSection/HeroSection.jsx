import { useHero } from "../../../hooks/useHero";
import { useHeroForm } from "../../../hooks/useHeroForm";
import styles from "./HeroSection.module.css";

/**
 * HeroSection - Outer component that handles data fetching.
 */
export default function HeroSection() {
  const { hero, loading, error } = useHero();

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error) return <div className={styles.statusError}>Error: {error}</div>;
  if (!hero) return <div className={styles.status}>No hero data found.</div>;

  return <HeroForm hero={hero} />;
}

/**
 * HeroForm - Inner component that uses the form hook.
 */
function HeroForm({ hero }) {
  const {
    formData,
    imagePreview,
    isSubmitting,
    error,
    success,
    handleChange,
    handleCheckboxChange,
    handleImageChange,
    handleSubmit,
  } = useHeroForm(hero);

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={styles.success}>Hero section updated successfully!</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Main Content */}
        <section className={styles.section}>
          <h3>Content</h3>

          <div className={styles.formGroup}>
            <label htmlFor="title">
              Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Welcome to Our Agency"
              required
            />
            <small>Main heading displayed in the hero</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subtitle">
              Subtitle <span className={styles.required}>*</span>
            </label>
            <textarea
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Find your dream home..."
              rows="3"
              required
            />
            <small>Supporting text displayed below the title</small>
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.section}>
          <h3>Call to Action Button</h3>

          <div className={styles.formGroup}>
            <label htmlFor="ctaText">
              Button Text <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              id="ctaText"
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              placeholder="View Properties"
            />
            <small>Text displayed on the CTA button</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ctaLink">
              Button Link <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              id="ctaLink"
              name="ctaLink"
              value={formData.ctaLink}
              onChange={handleChange}
              placeholder="/properties"
            />
            <small>URL or path the button links to</small>
          </div>
        </section>

        {/* Settings */}
        <section className={styles.section}>
          <h3>Settings</h3>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="showSearch"
                checked={formData.showSearch}
                onChange={handleCheckboxChange}
              />
              <span>Show search bar in hero</span>
            </label>
          </div>
        </section>

        {/* Background Image */}
        <section className={styles.section}>
          <h3>Background Image</h3>

          <div className={styles.formGroup}>
            <label htmlFor="backgroundImage">
              Background Image{" "}
              <span className={styles.optional}>
                (optional — leave empty to keep current)
              </span>
            </label>
            <input
              type="file"
              id="backgroundImage"
              name="backgroundImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>Max file size: 5MB. Formats: JPG, PNG, WebP</small>
          </div>

          {imagePreview && (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="Background preview" />
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
