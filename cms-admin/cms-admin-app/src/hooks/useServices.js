import { useFetch } from "./useFetch";
import { deleteService } from "../services/api";

/**
 * Custom hook to fetch all services with delete functionality
 * @returns {Object} { services, loading, error, deleteServiceById }
 */
export function useServices() {
  const { data, loading, error, refetch } = useFetch("/api/services");

  const deleteServiceById = async (id) => {
    try {
      await deleteService(id);
      refetch();
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert("Failed to delete service: " + err.message);
    }
  };

  return {
    services: data || [],
    loading,
    error,
    deleteServiceById,
  };
}
