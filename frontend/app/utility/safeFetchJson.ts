/**
 * Fetches and parses JSON safely inside Server Components/utilities without
 * letting non-OK statuses or non-JSON upstream payloads escape as unhandled rejections.
 */
export async function safeFetchJson<T>(
  url: string,
  init: RequestInit | undefined,
  fallback: T
): Promise<T> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return fallback;
    }
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export default safeFetchJson;
