import { useFetch } from "./useFetch.js";
import { getReviews } from "../services/api.js";

export function useReviews() {
    return useFetch(getReviews, []);
}