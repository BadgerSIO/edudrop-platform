import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const SEED_DIR = path.resolve(__dirname, "../../seed");

let cachedSeedUploads: ReadonlySet<string> | null = null;
let activeResetPromise: Promise<void> | null = null;

/**
 * Recursively converts MongoDB Extended JSON ($oid, $date) into native Mongoose types.
 */
export function parseExtendedJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(parseExtendedJson);
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("$oid" in obj && typeof obj.$oid === "string") {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if ("$date" in obj && typeof obj.$date === "string") {
      return new Date(obj.$date);
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = parseExtendedJson(v);
    }
    return result;
  }
  return value;
}

/**
 * Scans `backend/seed/*.json` once and returns all referenced `/uploads/...` URLs
 * so seeded .webp assets on disk are never accidentally unlinked.
 */
export function getProtectedSeedUploads(): ReadonlySet<string> {
  if (cachedSeedUploads) {
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
}

/**
 * Checks whether a relative upload path belongs to a protected seed asset.
 */
export function isProtectedSeedUpload(relativePath?: string | null): boolean {
  if (!relativePath || typeof relativePath !== "string") {
    return false;
  }
  const clean = `/${relativePath.trim().replace(/^\/+/, "")}`;
  return getProtectedSeedUploads().has(clean);
}

/**
 * Restores all MongoDB collections from `backend/seed/*.json` using an active
 * Mongoose connection. Guarded by an in-memory mutex to prevent overlapping resets.
 */
export async function resetDatabaseToSeed(options?: {
  silent?: boolean;
}): Promise<void> {
  if (activeResetPromise) {
    return activeResetPromise;
  }

  activeResetPromise = (async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Cannot reset database: MongoDB connection is not active");
    }

    if (!fs.existsSync(SEED_DIR)) {
      throw new Error(`Seed directory not found at ${SEED_DIR}`);
    }

    const files = fs
      .readdirSync(SEED_DIR)
      .filter((file) => file.endsWith(".json"))
      .sort();

    for (const file of files) {
      const collectionName = path.basename(file, ".json");
      const raw = fs.readFileSync(path.join(SEED_DIR, file), "utf-8");
      const docs = parseExtendedJson(JSON.parse(raw));

      const collection = mongoose.connection.collection(collectionName);
      await collection.deleteMany({});
      if (Array.isArray(docs) && docs.length > 0) {
        await collection.insertMany(docs as Record<string, unknown>[]);
      }

      if (!options?.silent) {
        console.log(
          `Seeded collection "${collectionName}" (${Array.isArray(docs) ? docs.length : 0} documents)`
        );
      }
    }
  })();

  try {
    await activeResetPromise;
  } finally {
    activeResetPromise = null;
  }
}
