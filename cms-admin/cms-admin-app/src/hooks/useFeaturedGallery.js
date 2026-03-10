import { useFetch } from "./useFetch";
import { patchFeaturedProperty } from "../services/api";

export function useFeaturedGallery() {
  const { data, loading, error, refetch } = useFetch("/api/properties");

  const allProperties = data || [];
  const featured = allProperties
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

  async function addToFeatured(id) {
    const nextOrder =
      featured.length > 0
        ? Math.max(...featured.map((p) => p.featuredOrder ?? 0)) + 1
        : 1;
    try {
      await patchFeaturedProperty(id, {
        featured: true,
        featuredOrder: nextOrder,
      });
      refetch();
    } catch (err) {
      console.error("Failed to add to featured:", err);
      alert("Failed to add listing: " + err.message);
    }
  }

  async function removeFromFeatured(id) {
    try {
      await patchFeaturedProperty(id, { featured: false, featuredOrder: 0 });
      refetch();
    } catch (err) {
      console.error("Failed to remove from featured:", err);
      alert("Failed to remove listing: " + err.message);
    }
  }

  async function updateOrder(id, featuredOrder) {
    try {
      await patchFeaturedProperty(id, { featuredOrder });
      refetch();
    } catch (err) {
      console.error("Failed to update order:", err);
      alert("Failed to update order: " + err.message);
    }
  }

  return {
    featured,
    allProperties,
    loading,
    error,
    addToFeatured,
    removeFromFeatured,
    updateOrder,
    refetch,
  };
}
