import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty, updateProperty, uploadImages } from "../services/api";

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
    featuredImage: initialData?.featuredImage || "",
  });

  // Images array — each item is either:
  //   { type: 'existing', url: 'https://...' }  — already uploaded, just a URL
  //   { type: 'new', file: File, preview: 'blob:...' } — selected locally, not yet uploaded
  const [images, setImages] = useState(
    (initialData?.images || []).map((url) => ({ type: "existing", url })),
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle text/select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes (for boolean fields like featured)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate: must have at least one image
    if (images.length === 0) {
      setError("Please add at least one image");
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
      // Step 1: Split images into two groups
      const existingItems = images.filter((img) => img.type === "existing");
      const newItems = images.filter((img) => img.type === "new");

      // Step 2: Upload any new files in one batch request
      let newUrls = [];
      if (newItems.length > 0) {
        const files = newItems.map((img) => img.file);
        newUrls = await uploadImages(files); // returns array of URL strings in order
      }

      // Step 3: Rebuild the final ordered URL array, preserving the user's drag order.
      // We walk the original images array and replace each item with its final URL.
      let newUrlIndex = 0;
      const finalImages = images.map((img) => {
        if (img.type === "existing") return img.url;
        return newUrls[newUrlIndex++]; // consume new URLs in order
      });

      // Step 4: Build full property payload
      const propertyData = {
        images: finalImages,
        alt: formData.alt,
        price: formData.price,
        address: formData.address || undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        sqft: formData.sqft || undefined,
        link: formData.link || undefined,
        status: formData.status,
        featured: formData.featured,
        featuredImage: formData.featuredImage || undefined,
      };

      // Step 5: Create or update
      if (isEditMode) {
        await updateProperty(propertyId, propertyData);
      } else {
        await createProperty(propertyData);
      }

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
    images, // pass to <ImageUpload images={images} onChange={setImages} />
    setImages,
    isSubmitting,
    error,
    isEditMode,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  };
}
