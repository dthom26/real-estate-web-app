import { useFetch } from "./useFetch";

export function useAbout() {
    const {data, loading, error} = useFetch("/api/about");

    return {
        about: data,
        loading,
        error
    }
}