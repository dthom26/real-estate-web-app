import { useFetch } from "./useFetch";

export function useContact() {
  const { data, loading, error } = useFetch("/api/contact");

  return {
    contact: data,
    loading,
    error,
  };
}
