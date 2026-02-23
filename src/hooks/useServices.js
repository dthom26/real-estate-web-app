import { useFetch } from "./useFetch.js";
import { getServices } from "../services/api.js";

export function useServices() {
    return useFetch(getServices, []);
}

