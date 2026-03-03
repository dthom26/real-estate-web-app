import { useFetch } from "./useFetch";

export function useHero() {
  const { data, loading, error } = useFetch("/api/hero");

  return {
    hero: data,
    loading,
    error,
  };
}
