import { useNavigate } from "react-router-dom";
import { useReviewForm } from "../../hooks/useReviewsFrom";
import styles from "./ReviewsCreate.module.css";

export default function ReviewsCreate() {
  const navigate = useNavigate();

  // All form logic is now in the custom hook!
  const { formData, isSubmitting, error, handleChange, handleSubmit } =
    useReviewForm(); // No args = create mode

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create New Review</h1>
        <button
          type="button"
          onClick={() => navigate("/admin/reviews")}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info Section */}
        <section className={styles.section}>
          <h2>Review Information</h2>

          <div className={styles.formGroup}>
            <label htmlFor="name">
              Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <small>Reviewer's name</small>
          </div>

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
              placeholder="Great experience!"
              required
            />
            <small>Brief title for the review</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rating">
              Rating <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="5"
              min="1"
              max="5"
              required
            />
            <small>Rating from 1 to 5 stars</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment">
              Comment <span className={styles.required}>*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Write the review comment here..."
              rows="6"
              required
              minLength="10"
            />
            <small>The full review text (minimum 10 characters)</small>
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
        </section>

        {/* Submit Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate("/admin/reviews")}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Creating..." : "Create Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
