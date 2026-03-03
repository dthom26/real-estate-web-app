import { useState } from "react";
import { uploadImage, putHero } from "../services/api";

/**
 * Custom hook for hero form logic.
 * Hero is a singleton — always a PUT update, no create mode.
 * Has a background image and a boolean toggle (showSearch).
 *
 * @param {Object|null} initialData - Existing hero data loaded from the API
 * @returns {Object} Form state and handlers
 */
export function useHeroForm(initialData = null) {
  // Form state - initialize with existing data or empty values
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    ctaText: initialData?.ctaText || "",
    ctaLink: initialData?.ctaLink || "",
    showSearch: initialData?.showSearch ?? false,
  });

  // Image handling state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.backgroundImage || null,
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle text/select input changes — resets success toast
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSuccess(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes (showSearch)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSuccess(false);
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle background image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Step 1: Upload new background image if a new file was selected
      let backgroundImage = initialData?.backgroundImage;
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        backgroundImage = uploadResult.url;
      }

      // Step 2: Prepare hero data
      const heroData = {
        title: formData.title,
        subtitle: formData.subtitle,
        ctaText: formData.ctaText || undefined,
        ctaLink: formData.ctaLink || undefined,
        showSearch: formData.showSearch,
        backgroundImage,
      };

      // Step 3: Send update to API
      await putHero(heroData);

      // Success — show toast
      setSuccess(true);
    } catch (err) {
      console.error("Error updating hero:", err);
      setError(err.message || "Failed to update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    imagePreview,
    isSubmitting,
    error,
    success,
    handleChange,
    handleCheckboxChange,
    handleImageChange,
    handleSubmit,
  };
}
