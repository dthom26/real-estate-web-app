import { useParams, useNavigate } from "react-router-dom";
import { useService } from "../../hooks/useService";
import { useServiceForm } from "../../hooks/useServiceForm";
import styles from "./ServicesCreate.module.css";

/**
 * ServiceEdit - Outer component that handles data fetching
 */
export default function ServiceEdit() {
  const { id } = useParams();
  const { service, loading, error } = useService(id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!service) return <div>Service not found</div>;

  return <ServiceEditForm service={service} serviceId={id} />;
}

/**
 * ServiceEditForm - Inner component that uses the form hook
 */
function ServiceEditForm({ service, serviceId }) {
  const navigate = useNavigate();

  const {
    formData,
    imagePreview,
    isSubmitting,
    error,
    handleChange,
    handleImageChange,
    handleSubmit,
  } = useServiceForm(service, serviceId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Service</h1>
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
              Service Image (optional - leave empty to keep current)
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
            {isSubmitting ? "Updating..." : "Update Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
