import { useState, useEffect } from "react";

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    // Reset state at the start of every fetch
    setLoading(true);
    setError(null);

    fetchFn(controller.signal)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        // AbortError is intentional (unmount/dep change) — not a real error
        if (err.name === "AbortError") return;

        if (!cancelled) {
          console.error("[useFetch]", err);
          setError(err.message || "Something went wrong.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
