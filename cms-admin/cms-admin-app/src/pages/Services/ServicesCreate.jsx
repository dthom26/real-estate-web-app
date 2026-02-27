import { useNavigate } from "react-router-dom";
import { useServiceForm } from "../../hooks/useServiceForm";
import styles from "./ServicesCreate.module.css";

export default function ServicesCreate() {
  const navigate = useNavigate();

  const {
    formData,
    imagePreview,
    isSubmitting,
    error,
    handleChange,
    handleImageChange,
    handleSubmit,
  } = useServiceForm();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create New Service</h1>
        <button
          type="button"
          onClick={() => navigate("/admin/services")}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info Section */}
        <section className={styles.section}>
          <h2>Service Information</h2>

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
              placeholder="Property Management"
              required
            />
            <small>Service name or title</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the service..."
              rows="6"
              required
            />
            <small>Full description of the service</small>
          </div>
        </section>

        {/* Image Section */}
        <section className={styles.section}>
          <h2>Service Image</h2>

          <div className={styles.formGroup}>
            <label htmlFor="image">
              Service Image <span className={styles.required}>*</span>
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
          <h2>Additional Options</h2>

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
        </section>

        {/* Submit Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate("/admin/services")}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Creating..." : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
