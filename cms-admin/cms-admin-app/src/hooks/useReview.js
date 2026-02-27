import { useFetch } from "./useFetch";

/**
 * Custom hook to fetch a single review by ID
 * @param {string} id - Review ID
 * @returns {Object} { review, loading, error }
 */
export function useReview(id) {
  const { data, loading, error } = useFetch(`/api/reviews/${id}`);

  return {
    review: data,
    loading,
    error,
  };
}
