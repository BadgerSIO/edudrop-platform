import countriesJson from "@/public/countries.json";

export interface CountryOption {
  value: string;
  label: string;
}

export const CANONICAL_US_COUNTRY = "🇺🇸 United States";

const COUNTRY_LIST: CountryOption[] = (countriesJson?.countries || []).filter(
  (c): c is CountryOption => Boolean(c?.value && c?.label)
);

const stripFlagPrefix = (label: string) =>
  label.replace(/^(?:\uD83C[\uDDE6-\uDDFF]){2}\s*/, "").trim().toLowerCase();

const BY_EXACT = new Map<string, string>();
const BY_PLAIN_NAME = new Map<string, string>();

for (const c of COUNTRY_LIST) {
  BY_EXACT.set(c.label.toLowerCase(), c.label);
  BY_PLAIN_NAME.set(stripFlagPrefix(c.label), c.label);
}

/**
 * Normalizes plain or legacy country strings (e.g. "United States", "USA", "US")
 * to the canonical flag-prefixed label from countries.json so dropdowns never
 * display duplicate entries.
 */
export const normalizeCountryValue = (country?: string | null): string => {
  if (!country) return "";
  const trimmed = country.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (lower === "usa" || lower === "us" || lower === "united states of america") {
    return CANONICAL_US_COUNTRY;
  }

  return (
    BY_EXACT.get(lower) ||
    BY_PLAIN_NAME.get(stripFlagPrefix(trimmed)) ||
    trimmed
  );
};

/**
 * Returns deduplicated country options with United States pinned once at the top.
 */
export const getCountryOptions = (
  currentCountry?: string | null
): {
  featured: CountryOption;
  rest: CountryOption[];
  extraValue: string | null;
} => {
  const featured =
    COUNTRY_LIST.find((c) => c.label === CANONICAL_US_COUNTRY) || {
      value: "US",
      label: CANONICAL_US_COUNTRY,
    };

  const rest = COUNTRY_LIST.filter((c) => c.label !== CANONICAL_US_COUNTRY);
  const normalized = normalizeCountryValue(currentCountry);

  const isListed =
    !normalized ||
    normalized === CANONICAL_US_COUNTRY ||
    rest.some((c) => c.label === normalized);

  return {
    featured,
    rest,
    extraValue: !isListed ? normalized : null,
  };
};
