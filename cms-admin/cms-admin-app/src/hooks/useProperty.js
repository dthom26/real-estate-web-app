import { useFetch } from "./useFetch";

export function useProperty(id) {
  // Pass the path directly, not a function
  const { data, loading, error } = useFetch(`/api/properties/${id}`);
  return {
    property: data || null,
    loading,
    error,
  };
}
