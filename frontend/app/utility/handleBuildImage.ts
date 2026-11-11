import { SERVERURL } from "@/lib/constants";

export const handleBuildImage = (
  profileImage: string | undefined | null,
  fallback: string
) => {
  if (!profileImage) {
    return fallback;
  }
  const trimmed = profileImage.trim();
  if (!trimmed) {
    return fallback;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const baseUrl = (SERVERURL || "").replace(/\/+$/, "");

  if (trimmed.startsWith("/uploads") || trimmed.startsWith("/images")) {
    return baseUrl ? `${baseUrl}${trimmed}` : fallback;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return baseUrl ? `${baseUrl}/${trimmed}` : fallback;
};

export default handleBuildImage;
