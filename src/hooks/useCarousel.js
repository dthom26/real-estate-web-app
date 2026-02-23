import { useFetch } from "./useFetch";
import { getCarousel } from "../services/api";

export function useCarousel(limit = 5) {
  const fetchFn = (signal) => getCarousel(signal, limit);
  return useFetch(fetchFn, [limit]);
}
