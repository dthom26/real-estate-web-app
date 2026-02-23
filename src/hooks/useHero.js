import { useFetch } from "./useFetch";
import { getHero } from "../services/api";

export function useHero() {
  return useFetch(getHero, []);
}
