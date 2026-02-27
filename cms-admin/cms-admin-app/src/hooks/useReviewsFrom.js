import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReview, updateReview } from "../services/api";

/**
 * Custom hook for review form logic (used by both Create and Edit pages)
 *
 * @param {Object|null} initialData - Existing review data for edit mode, null for create
 * @param {string|null} reviewId - Review ID for edit mode, null for create
 * @returns {Object} Form state and handlers
 */
export function useReviewForm(initialData = null, reviewId = null) {
  const navigate = useNavigate();
  const isEditMode = !!reviewId;

  // Form state - initialize with existing data or empty values
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    title: initialData?.title || "",
    rating: initialData?.rating || "",
    comment: initialData?.comment || "",
    status: initialData?.status || "published",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert rating to integer before submitting
      const submitData = {
        ...formData,
        rating: parseInt(formData.rating, 10),
      };

      console.log("Submitting review data:", submitData);

      if (isEditMode) {
        await updateReview(reviewId, submitData);
      } else {
        await createReview(submitData);
      }
      navigate("/admin/reviews");
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    handleChange,
    handleSubmit,
  };
}
