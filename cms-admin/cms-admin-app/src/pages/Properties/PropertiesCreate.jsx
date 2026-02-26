import { useNavigate } from 'react-router-dom';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import styles from './PropertiesCreate.module.css';

export default function PropertiesCreate() {
  const navigate = useNavigate();
  
  // All form logic is now in the custom hook!
  const {
    formData,
    imagePreview,
    isSubmitting,
    error,
    handleChange,
    handleCheckboxChange,
    handleImageChange,
    handleSubmit,
  } = usePropertyForm(); // No args = create mode

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create New Property</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/properties')}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
          <h2>Image</h2>

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

          <div className={styles.formGroup}>
            <label htmlFor="image">
              Property Image <span className={styles.required}>*</span>
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            <small>Max file size: 5MB. Formats: JPG, PNG, WebP</small>
          </div>

          {imagePreview && (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </section>

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
            <small>When checked, this property will appear in the homepage carousel</small>
          </div>
        </section>

        {/* Submit Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
