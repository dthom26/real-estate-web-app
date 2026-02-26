import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty, updateProperty, uploadImage } from "../services/api";

/**
 * Custom hook for property form logic (used by both Create and Edit pages)
 *
 * @param {Object|null} initialData - Existing property data for edit mode, null for create
 * @param {string|null} propertyId - Property ID for edit mode, null for create
 * @returns {Object} Form state and handlers
 */
export function usePropertyForm(initialData = null, propertyId = null) {
  const navigate = useNavigate();
  const isEditMode = !!propertyId;

  // Form state - initialize with existing data or empty values
  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    price: initialData?.price || "",
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    sqft: initialData?.sqft || "",
    alt: initialData?.alt || "",
    link: initialData?.link || "",
    status: initialData?.status || "published",
    featured: initialData?.featured ?? false,
  });

  // Image state
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

  // Handle checkbox changes (for boolean fields)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    // In edit mode, image is optional (only required if no existing image)
    if (!isEditMode && !imageFile) {
      setError("Please select an image");
      return;
    }
    if (!formData.alt.trim()) {
      setError("Please provide alt text for the image");
      return;
    }
    if (!formData.price.trim()) {
      setError("Please provide a price");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload new image if file was selected
      let imageUrl = initialData?.image; // Keep existing image by default
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      // Step 2: Prepare property data
      const propertyData = {
        image: imageUrl,
        alt: formData.alt,
        price: formData.price,
        address: formData.address || undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        sqft: formData.sqft || undefined,
        link: formData.link || undefined,
        status: formData.status,
        featured: formData.featured,
      };

      // Step 3: Create or update
      if (isEditMode) {
        await updateProperty(propertyId, propertyData);
      } else {
        await createProperty(propertyData);
      }

      // Success! Navigate back to list
      navigate("/admin/properties");
    } catch (err) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} property:`,
        err,
      );
      setError(
        err.message ||
          `Failed to ${isEditMode ? "update" : "create"} property. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    imageFile,
    imagePreview,
    isSubmitting,
    error,
    isEditMode,
    handleChange,
    handleCheckboxChange,
    handleImageChange,
    handleSubmit,
  };
}
