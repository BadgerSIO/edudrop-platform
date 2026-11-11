import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";

/**
 * Fetches live Demo Mode state on the server without throwing when the API
 * is unavailable (e.g., offline build environments), keeping SSR clean.
 */
export async function getServerDemoMode(): Promise<boolean> {
  const json = await safeFetchJson<{ data?: { demoMode?: boolean } } | null>(
    `${SERVERURLAPI}/auth/demo-status`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    },
    null
  );

  return Boolean(json?.data?.demoMode);
}
