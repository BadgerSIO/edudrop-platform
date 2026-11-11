export const ALLOWED_RASTER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const IMAGE_ACCEPT_ATTR = ALLOWED_RASTER_IMAGE_TYPES.join(",");

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (
    !ALLOWED_RASTER_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_RASTER_IMAGE_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, or AVIF images are allowed.",
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      error: "Image size must be under 5MB.",
    };
  }

  return { valid: true };
}
