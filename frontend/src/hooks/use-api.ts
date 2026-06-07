import { useEffect, useState } from "react";

import { getJson } from "@/lib/api";
import type { ApiPayload } from "@/types/api";

interface ApiState<T> {
  data: T;
  loading: boolean;
  initialLoading: boolean;
  error: string;
}

export function useApi<T extends ApiPayload>(path: string, fallback: T): ApiState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    getJson<T>(path, { signal: controller.signal })
      .then((result) => {
        setData(result);
        setError(result.error ?? "");
        setHasLoaded(true);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setError(
          requestError instanceof Error ? requestError.message : "Permintaan data gagal.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [path]);

  return {
    data,
    loading,
    initialLoading: loading && !hasLoaded,
    error,
  };
}
