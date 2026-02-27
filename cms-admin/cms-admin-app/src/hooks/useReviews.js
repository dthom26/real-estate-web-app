import { useFetch } from "./useFetch";
import { deleteReview } from "../services/api";

export function useReviews() {
  const { data, loading, error, refetch } = useFetch('/api/reviews');

  const deleteReviewById = async (id) => {
    try{
        await deleteReview(id);
        refetch();
    } catch(err) {
        console.error("Failed to delete review:", err);
        alert("Failed to delete review: " + err.message);
    }
  };

  return {
    reviews: data || [],
    loading,
    error,
    deleteReviewById,
  };
}