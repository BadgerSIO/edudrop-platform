import fs from "fs";
import path from "path";
import { AnyZodObject, ZodEffects } from "zod";

const ALLOWED_USERS_UPLOAD_DIR = path.resolve(
  __dirname,
  "../../uploads/users"
);

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Unflattens multipart dotted keys (e.g. `name.firstName`, `address.city`)
 * into nested objects while guarding against prototype pollution.
 */
export const unflattenDottedBody = (
  rawBody: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {};
  if (!rawBody || typeof rawBody !== "object") {
    return result;
  }

  for (const [rawKey, value] of Object.entries(rawBody)) {
    if (FORBIDDEN_KEYS.has(rawKey)) continue;

    if (rawKey.includes(".")) {
      const parts = rawKey.split(".");
      if (parts.some((p) => !p || FORBIDDEN_KEYS.has(p))) continue;

      let cursor = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const segment = parts[i];
        if (!cursor[segment] || typeof cursor[segment] !== "object") {
          cursor[segment] = {};
        }
        cursor = cursor[segment];
      }
      cursor[parts[parts.length - 1]] = value;
    } else {
      if (
        (rawKey === "name" || rawKey === "address") &&
        typeof value === "string"
      ) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === "object") {
            result[rawKey] = { ...(result[rawKey] || {}), ...parsed };
            continue;
          }
        } catch {
          // Ignore non-JSON string
        }
      }

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof result[rawKey] === "object" &&
        result[rawKey] !== null
      ) {
        result[rawKey] = { ...result[rawKey], ...value };
      } else {
        result[rawKey] = value;
      }
    }
  }

  return result;
};

/**
 * Safely deletes an uploaded user image within `backend/uploads/users`.
 * Enforces strict directory containment to prevent path traversal.
 */
export const safeUnlinkUserImage = async (
  relativePath?: string | null
): Promise<void> => {
  try {
    if (!relativePath || typeof relativePath !== "string") return;
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return;
    }

    const cleanRelative = relativePath.replace(/^\/+/, "");
    if (!cleanRelative.startsWith("uploads/users/")) {
      return;
    }

    const resolvedTarget = path.resolve(__dirname, "../..", cleanRelative);
    if (!resolvedTarget.startsWith(ALLOWED_USERS_UPLOAD_DIR + path.sep)) {
      return;
    }

    if (fs.existsSync(resolvedTarget)) {
      await fs.promises.unlink(resolvedTarget);
    }
  } catch (err) {
    console.error("Failed to safely delete user image:", relativePath, err);
  }
};

/**
 * Cleans up a newly written Multer upload if downstream validation or DB write fails.
 */
export const cleanupUploadedFile = async (
  file?: Express.Multer.File
): Promise<void> => {
  try {
    if (!file?.path) return;
    const resolvedPath = path.resolve(file.path);
    if (!resolvedPath.startsWith(ALLOWED_USERS_UPLOAD_DIR + path.sep)) {
      return;
    }
    if (fs.existsSync(resolvedPath)) {
      await fs.promises.unlink(resolvedPath);
    }
  } catch (err) {
    console.error("Failed to rollback orphaned upload:", err);
  }
};

/**
 * Unflattens multipart request bodies and validates against a Zod schema,
 * rolling back any newly uploaded file if validation fails.
 */
export const parseAndValidateProfileBody = async <T>(
  schema: AnyZodObject | ZodEffects<AnyZodObject>,
  rawBody: Record<string, any>,
  file?: Express.Multer.File
): Promise<T> => {
  try {
    const normalizedBody = unflattenDottedBody(rawBody);
    const parsed = await schema.parseAsync({ body: normalizedBody });
    return parsed.body as T;
  } catch (error) {
    await cleanupUploadedFile(file);
    throw error;
  }
};

/**
 * Constructs a flat MongoDB `$set` update payload strictly allow-listed to
 * permissible profile fields, preserving sibling nested keys.
 */
export const buildAllowListedSetPayload = (
  validated: Record<string, any>,
  scalarFields: string[],
  nestedFields: Record<string, string[]>
): Record<string, any> => {
  const setPayload: Record<string, any> = {};

  for (const field of scalarFields) {
    if (validated[field] !== undefined) {
      setPayload[field] = validated[field];
    }
  }

  for (const [parentKey, subKeys] of Object.entries(nestedFields)) {
    const parentObj = validated[parentKey];
    if (parentObj && typeof parentObj === "object") {
      for (const subKey of subKeys) {
        if (parentObj[subKey] !== undefined) {
          setPayload[`${parentKey}.${subKey}`] = parentObj[subKey];
        }
      }
    }
  }

  return setPayload;
};

/**
 * Resolves profileImage `$set` value and old-image deletion target safely.
 */
export const resolveAvatarUpdate = (
  existingImage: string | undefined,
  newProfileImagePath?: string,
  removeProfileImage?: boolean | string
): { nextProfileImage?: string; oldImageToDelete?: string } => {
  const shouldRemove =
    removeProfileImage === true || removeProfileImage === "true";

  if (newProfileImagePath) {
    return {
      nextProfileImage: newProfileImagePath,
      oldImageToDelete:
        existingImage && existingImage !== newProfileImagePath
          ? existingImage
          : undefined,
    };
  }

  if (shouldRemove) {
    return {
      nextProfileImage: "",
      oldImageToDelete: existingImage || undefined,
    };
  }

  return {};
};
