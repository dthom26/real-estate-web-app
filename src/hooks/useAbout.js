import { useFetch } from "./useFetch.js";
import { getAbout } from "../services/api.js";

export function useAbout() {
    return useFetch(getAbout, []);
}