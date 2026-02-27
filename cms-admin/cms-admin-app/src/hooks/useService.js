import { useFetch } from "./useFetch";

/**
 * Custom hook to fetch a single service by ID
 * @param {string} id - Service ID
 * @returns {Object} { service, loading, error }
 */
export function useService(id) {
  const { data, loading, error } = useFetch(`/api/services/${id}`);

  return {
    service: data,
    loading,
    error,
  };
}
