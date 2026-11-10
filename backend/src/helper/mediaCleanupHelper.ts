import fs from "fs";
import path from "path";

export type UploadSubdir = "users" | "school" | "products" | "cms";

const VALID_SUBDIRS = new Set<UploadSubdir>([
  "users",
  "school",
  "products",
  "cms",
]);

export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

export const ensureUploadDirExists = (subdir?: UploadSubdir): string => {
  const targetDir = subdir ? path.join(UPLOADS_ROOT, subdir) : UPLOADS_ROOT;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
};

/**
 * Resolves a relative `/uploads/<subdir>/<file>` URL to an absolute disk path
 * only if it strictly resides inside `backend/uploads` (and optional subdir).
 */
export const resolveSafeUploadPath = (
  relativePath?: string | null,
  allowedSubdir?: UploadSubdir
): string | null => {
  if (!relativePath || typeof relativePath !== "string") return null;

  const trimmed = relativePath.trim();
  if (
    !trimmed ||
    trimmed === "/" ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return null;
  }

  const cleanRelative = trimmed.replace(/^\/+/, "");
  if (!cleanRelative.startsWith("uploads/")) {
    return null;
  }

  if (allowedSubdir && !cleanRelative.startsWith(`uploads/${allowedSubdir}/`)) {
    return null;
  }

  const subRelative = cleanRelative.slice("uploads/".length);
  const expectedRoot = allowedSubdir
    ? path.resolve(UPLOADS_ROOT, allowedSubdir)
    : UPLOADS_ROOT;
  const resolvedTarget = path.resolve(UPLOADS_ROOT, subRelative);

  if (!resolvedTarget.startsWith(expectedRoot + path.sep)) {
    return null;
  }

  return resolvedTarget;
};

/**
 * Safely deletes a single uploaded file within `backend/uploads` (or a specific subdir).
 */
export const safeUnlinkUpload = async (
  relativePath?: string | null,
  allowedSubdir?: UploadSubdir
): Promise<boolean> => {
  try {
    const resolvedTarget = resolveSafeUploadPath(relativePath, allowedSubdir);
    if (!resolvedTarget) return false;

    if (fs.existsSync(resolvedTarget)) {
      await fs.promises.unlink(resolvedTarget);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to safely delete upload:", relativePath, err);
    return false;
  }
};

/**
 * Safely deletes an Express.Multer.File written to disk during rollback.
 */
export const safeUnlinkMulterFile = async (
  file?: Express.Multer.File,
  allowedSubdir?: UploadSubdir
): Promise<void> => {
  try {
    if (!file?.path) return;
    const expectedRoot =
      allowedSubdir && VALID_SUBDIRS.has(allowedSubdir)
        ? path.resolve(UPLOADS_ROOT, allowedSubdir)
        : UPLOADS_ROOT;
    const resolvedPath = path.resolve(file.path);

    if (!resolvedPath.startsWith(expectedRoot + path.sep)) {
      return;
    }
    if (fs.existsSync(resolvedPath)) {
      await fs.promises.unlink(resolvedPath);
    }
  } catch (err) {
    console.error("Failed to rollback uploaded file:", err);
  }
};

/**
 * Computes set difference (oldUrls \ retainedUrls) for safe orphan deletion.
 * Prevents array index-shift bugs when items are deleted or reordered.
 */
export const computeRemovedUrls = (
  oldUrls: (string | undefined | null)[],
  retainedUrls: (string | undefined | null)[]
): string[] => {
  const normalize = (list: (string | undefined | null)[]) =>
    list
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter(
        (u) =>
          Boolean(u) &&
          u !== "/" &&
          !u.startsWith("http://") &&
          !u.startsWith("https://")
      );

  const retainedSet = new Set(normalize(retainedUrls));
  const oldSet = new Set(normalize(oldUrls));

  return Array.from(oldSet).filter((url) => !retainedSet.has(url));
};

/**
 * Unlinks a superseded temporary upload URL only if it is inside `subdir`
 * and is NOT currently persisted anywhere in MongoDB.
 */
export const cleanupUnsavedTemporaryUpload = async (
  previousTemporaryUrl: string | undefined | null,
  subdir: UploadSubdir,
  isReferencedInDb: (url: string) => Promise<boolean>
): Promise<void> => {
  try {
    const safePath = resolveSafeUploadPath(previousTemporaryUrl, subdir);
    if (!safePath || !previousTemporaryUrl) return;

    const cleanUrl = previousTemporaryUrl.trim().startsWith("/")
      ? previousTemporaryUrl.trim()
      : `/${previousTemporaryUrl.trim()}`;

    const isSaved = await isReferencedInDb(cleanUrl);
    if (!isSaved) {
      await safeUnlinkUpload(cleanUrl, subdir);
    }
  } catch (err) {
    console.error("Failed to cleanup unsaved temporary upload:", err);
  }
};
