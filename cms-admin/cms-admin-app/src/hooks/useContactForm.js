import { useState } from "react";
import { putContact } from "../services/api";

/**
 * Custom hook for contact form logic.
 * Contact is a singleton — no image, no create mode, always a PUT update.
 *
 * @param {Object|null} initialData - Existing contact data loaded from the API
 * @returns {Object} Form state and handlers
 */
export function useContactForm(initialData = null) {
  // Form state - initialize with existing data or empty values
  const [formData, setFormData] = useState({
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle text input changes — also resets the success toast
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSuccess(false);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // No image upload needed — send data directly
      const contactData = {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
      };

      await putContact(contactData);

      // Success — show toast
      setSuccess(true);
    } catch (err) {
      console.error("Error updating contact:", err);
      setError(err.message || "Failed to update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    success,
    handleChange,
    handleSubmit,
  };
}
