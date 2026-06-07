import type { ApiPayload } from "@/types/api";

export async function getJson<T extends ApiPayload>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(path, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
