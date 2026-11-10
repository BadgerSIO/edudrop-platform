import { SERVERURL } from "@/lib/constants";

export const handleBuildImage = (
  profileImage: string | undefined | null,
  fallback: string
) => {
  if (!profileImage) {
    return fallback;
  }
  if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
    return profileImage;
  }
  if (profileImage.startsWith("/uploads") || profileImage.startsWith("/images")) {
    return `${SERVERURL}${profileImage}`;
  }
  if (profileImage.startsWith("/")) {
    return profileImage;
  }
  return `${SERVERURL}/${profileImage}`;
};

export default handleBuildImage;
