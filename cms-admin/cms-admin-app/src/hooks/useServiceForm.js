import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createService, updateService, uploadImage } from "../services/api";

/**
 * Custom hook for service form logic (used by both Create and Edit pages)
 *
 * @param {Object|null} initialData - Existing service data for edit mode, null for create
 * @param {string|null} serviceId - Service ID for edit mode, null for create
 * @returns {Object} Form state and handlers
 */
export function useServiceForm(initialData = null, serviceId = null) {
  const navigate = useNavigate();
  const isEditMode = !!serviceId;

  // Form state - initialize with existing data or empty values
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    status: initialData?.status || "published",
  });

  // Image handling state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = formData.image;

      // If a new image file was selected, upload it first
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      // Prepare submission data
      const submitData = {
        title: formData.title,
        description: formData.description,
        image: imageUrl,
        status: formData.status,
      };

      if (isEditMode) {
        await updateService(serviceId, submitData);
      } else {
        await createService(submitData);
      }

      navigate("/admin/services");
    } catch (err) {
      console.error("Service submission error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    imagePreview,
    isSubmitting,
    error,
    handleChange,
    handleImageChange,
    handleSubmit,
  };
}
