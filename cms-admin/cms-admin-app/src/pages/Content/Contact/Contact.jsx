import { useContact } from "../../../hooks/useContact";
import { useContactForm } from "../../../hooks/useContactForm";
import styles from "./Contact.module.css";

/**
 * Contact - Outer component that handles data fetching.
 * Renders loading/error states before passing data to the form.
 */
export default function Contact() {
  const { contact, loading, error } = useContact();

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error) return <div className={styles.statusError}>Error: {error}</div>;
  if (!contact)
    return <div className={styles.status}>No contact data found.</div>;

  return <ContactForm contact={contact} />;
}

/**
 * ContactForm - Inner component that uses the form hook.
 * Safe to call hooks here because no conditional returns above it.
 */
function ContactForm({ contact }) {
  const { formData, isSubmitting, error, success, handleChange, handleSubmit } =
    useContactForm(contact);

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={styles.success}>Contact info updated successfully!</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Contact Details Section */}
        <section className={styles.section}>
          <h3>Contact Details</h3>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="info@example.com"
              required
            />
            <small>Primary contact email address</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">
              Phone <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              required
            />
            <small>Primary contact phone number</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">
              Address <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State 12345"
              required
            />
            <small>Physical office address</small>
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
              placeholder="Write a brief description for the contact section..."
              rows="5"
              required
            />
            <small>Short description shown in the contact section</small>
          </div>
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
