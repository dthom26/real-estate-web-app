import { useFetch } from "./useFetch.js";
import { getContact } from "../services/api.js";

export function useContact() {
    return useFetch(getContact, []);
}