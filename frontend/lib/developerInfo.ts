import { IContactInfo } from "@/app/types/ContactInfo";

export const DEVELOPER_INFO = {
  name: "Saad Ibne Omar",
  role: "Full-Stack Developer",
  portfolioUrl: "https://www.saadportfolio.xyz/",
  linkedinUrl: "https://www.linkedin.com/in/saad-ibne-omar/",
} as const;

const LEGACY_INVALID_SOCIAL_URLS = new Set([
  "https://www.facebook.com/edudrop",
  "https://facebook.com/edudrop",
  "https://www.instagram.com/edudrop",
  "https://instagram.com/edudrop",
  "https://www.youtube.com/@edudrop",
  "https://youtube.com/@edudrop",
  "https://www.tiktok.com/@edudrop",
  "https://tiktok.com/@edudrop",
]);

export type SocialPlatformId =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok";

export interface SocialLinkItem {
  id: SocialPlatformId;
  label: string;
  href: string;
}

function normalizeUrlKey(url: URL): string {
  return `${url.origin.toLowerCase()}${url.pathname.toLowerCase().replace(/\/+$/, "")}`;
}

/**
 * Validates that a social URL is HTTP(S) and not a legacy placeholder channel.
 */
export function resolveValidSocialUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (LEGACY_INVALID_SOCIAL_URLS.has(normalizeUrlKey(parsed))) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Builds active social links from CMS contact info, defaulting to the
 * developer's LinkedIn profile instead of invalid placeholder URLs.
 */
export function buildSocialLinks(
  contactInfo?: Partial<IContactInfo> | null
): SocialLinkItem[] {
  const linkedinHref =
    resolveValidSocialUrl(contactInfo?.linkedin) ?? DEVELOPER_INFO.linkedinUrl;

  const candidates: Array<{
    id: SocialPlatformId;
    label: string;
    href?: string;
  }> = [
    { id: "linkedin", label: "LinkedIn", href: linkedinHref },
    { id: "facebook", label: "Facebook", href: contactInfo?.facebook },
    { id: "instagram", label: "Instagram", href: contactInfo?.instagram },
    { id: "youtube", label: "YouTube", href: contactInfo?.youtube },
    { id: "tiktok", label: "TikTok", href: contactInfo?.tiktok },
  ];

  const seen = new Set<string>();
  const links: SocialLinkItem[] = [];

  for (const item of candidates) {
    const validHref = resolveValidSocialUrl(item.href);
    if (!validHref) continue;

    const key = normalizeUrlKey(new URL(validHref));
    if (seen.has(key)) continue;
    seen.add(key);

    links.push({
      id: item.id,
      label: item.label,
      href: validHref,
    });
  }

  return links;
}
