import { uploadImage, putAboutInfo } from "../services/api";
import { useState } from "react";

export function useAboutForm(initialData = null) {
  // Form state - initialize with existing data or empty values
  const [formData, setFormData] = useState({
    header: initialData?.header || "",
    textContent: initialData?.textContent || "",
    buttonText: initialData?.buttonText || "",
    buttonLink: initialData?.buttonLink || "",
  });

  // Image handling state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSuccess(false); // reset toast when user starts editing again
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Step 1: Upload new image if a new file was selected
      let imageUrl = initialData?.image; // keep existing image by default
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      // Step 2: Prepare about data
      const aboutData = {
        header: formData.header,
        textContent: formData.textContent,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        image: imageUrl,
      };

      // Step 3: Send update to API
      await putAboutInfo(aboutData);

      // Success — show toast
      setSuccess(true);
    } catch (err) {
      console.error("Error updating about:", err);
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
    handleImageChange,
    handleSubmit,
  };
}
