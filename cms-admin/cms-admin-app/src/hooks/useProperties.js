import { useFetch } from "./useFetch";
import { deleteProperty } from "../services/api";

export function useProperties() {
  const { data, loading, error, refetch } = useFetch('/api/properties');

  const deletePropertyById = async (id) => {
    try{
        await deleteProperty(id);
        refetch();
    } catch(err) {
        console.error("Failed to delete property:", err);
        alert("Failed to delete property: " + err.message);
    }
  };

  return {
    properties: data || [],
    loading,
    error,
    deletePropertyById,
  };
}