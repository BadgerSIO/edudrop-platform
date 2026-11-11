import fs from "fs";
import path from "path";

export type UploadSubdir = "users" | "school" | "products" | "cms";

export const VALID_UPLOAD_SUBDIRS: readonly UploadSubdir[] = [
  "users",
  "school",
  "products",
  "cms",
];

const VALID_SUBDIRS = new Set<UploadSubdir>(VALID_UPLOAD_SUBDIRS);

export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");
const SEED_DIR = path.resolve(__dirname, "../../seed");

let cachedSeedUploads: ReadonlySet<string> | null = null;

/**
 * Scans `backend/seed/*.json` and returns all referenced `/uploads/...` URLs
 * so seeded .webp assets on disk are never accidentally unlinked.
 */
export const getProtectedSeedUploads = (options?: {
  refresh?: boolean;
}): ReadonlySet<string> => {
  if (cachedSeedUploads && !options?.refresh) {
    return cachedSeedUploads;
  }

  const protectedUrls = new Set<string>();
  if (!fs.existsSync(SEED_DIR)) {
    cachedSeedUploads = protectedUrls;
    return cachedSeedUploads;
  }

  const files = fs
    .readdirSync(SEED_DIR)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(SEED_DIR, file), "utf-8");
    const matches = raw.matchAll(/"(\/uploads\/[^"]+)"/g);
    for (const match of matches) {
      if (match[1]) {
        protectedUrls.add(match[1].trim());
      }
    }
  }

  cachedSeedUploads = protectedUrls;
  return cachedSeedUploads;
};

/**
 * Checks whether a relative upload path belongs to a protected seed asset.
 */
export const isProtectedSeedUpload = (
  relativePath?: string | null
): boolean => {
  if (!relativePath || typeof relativePath !== "string") {
    return false;
  }
  const clean = `/${relativePath.trim().replace(/^\/+/, "")}`;
  return getProtectedSeedUploads().has(clean);
};

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
    if (isProtectedSeedUpload(relativePath)) {
      return false;
    }

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

export interface OrphanPurgeResult {
  dryRun: boolean;
  removedUploadsCount: number;
  freedBytes: number;
  deletedUrls: string[];
}

/**
 * Walks managed upload subdirectories and unlinks (or previews when `dryRun` is true)
 * files not present in `allowUrls` whose modification time predates or equals `maxMtimeMs`.
 */
export const purgeOrphanedDiskUploads = async (options: {
  allowUrls: ReadonlySet<string>;
  maxMtimeMs: number;
  dryRun?: boolean;
}): Promise<OrphanPurgeResult> => {
  const dryRun = Boolean(options.dryRun);
  let removedUploadsCount = 0;
  let freedBytes = 0;
  const deletedUrls: string[] = [];

  for (const subdir of VALID_UPLOAD_SUBDIRS) {
    const dirPath = path.join(UPLOADS_ROOT, subdir);
    if (!fs.existsSync(dirPath)) {
      continue;
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith(".")) {
        continue;
      }

      const uploadUrl = `/uploads/${subdir}/${entry.name}`;
      if (options.allowUrls.has(uploadUrl)) {
        continue;
      }

      const resolvedTarget = resolveSafeUploadPath(uploadUrl, subdir);
      if (!resolvedTarget) {
        continue;
      }

      try {
        const stat = await fs.promises.stat(resolvedTarget);
        if (stat.mtimeMs > options.maxMtimeMs) {
          continue;
        }
        if (!dryRun) {
          await fs.promises.unlink(resolvedTarget);
        }
        removedUploadsCount += 1;
        freedBytes += stat.size;
        deletedUrls.push(uploadUrl);
      } catch (err: any) {
        if (err?.code !== "ENOENT") {
          console.error("Failed to purge orphaned upload:", uploadUrl, err);
        }
      }
    }
  }

  return { dryRun, removedUploadsCount, freedBytes, deletedUrls };
};
