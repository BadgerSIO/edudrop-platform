import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {
  getProtectedSeedUploads,
  isProtectedSeedUpload,
  OrphanPurgeResult,
  purgeOrphanedDiskUploads,
} from "./mediaCleanupHelper";
import { Admin } from "../app/modules/admin/admin.model";
import { Bursar } from "../app/modules/bursar/bursar.model";
import { Donar } from "../app/modules/donar/donar.model";
import { Product } from "../app/modules/product/product.model";
import { SchoolInfo } from "../app/modules/schoolInfo/schoolInfo.model";
import { SiteContent } from "../app/modules/cms/cms.model";
import { Order } from "../app/modules/order/order.model";

export { getProtectedSeedUploads, isProtectedSeedUpload };

export const DEFAULT_ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

export interface ResetDatabaseResult {
  seededCollections: number;
  removedUploadsCount: number;
  freedBytes: number;
}

export interface LiveOrphanSweepResult extends OrphanPurgeResult {
  activeReferencesCount: number;
  minAgeMs: number;
}

const SEED_DIR = path.resolve(__dirname, "../../seed");

let activeResetPromise: Promise<ResetDatabaseResult> | null = null;

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
 * Restores all MongoDB collections from `backend/seed/*.json` using an active
 * Mongoose connection and reconciles `backend/uploads/` back to protected seed
 * assets so orphaned temporary/demo uploads do not accumulate on disk.
 * Guarded by an in-memory mutex to prevent overlapping resets.
 */
export async function resetDatabaseToSeed(options?: {
  silent?: boolean;
}): Promise<ResetDatabaseResult> {
  if (activeResetPromise) {
    return activeResetPromise;
  }

  const resetStartedAt = Date.now();

  activeResetPromise = (async (): Promise<ResetDatabaseResult> => {
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

    const protectedSeeds = getProtectedSeedUploads({ refresh: true });
    const cleanup = await purgeOrphanedDiskUploads({
      allowUrls: protectedSeeds,
      maxMtimeMs: resetStartedAt,
    });

    if (!options?.silent && cleanup.removedUploadsCount > 0) {
      console.log(
        `Cleaned ${cleanup.removedUploadsCount} orphaned upload(s) (${Math.round(cleanup.freedBytes / 1024)} KB)`
      );
    }

    return {
      seededCollections: files.length,
      removedUploadsCount: cleanup.removedUploadsCount,
      freedBytes: cleanup.freedBytes,
    };
  })();

  try {
    return await activeResetPromise;
  } finally {
    activeResetPromise = null;
  }
}

function addNormalizedUploadUrl(set: Set<string>, raw?: unknown): void {
  if (typeof raw !== "string") return;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "/") return;
  const clean = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (clean.startsWith("/uploads/")) {
    set.add(clean);
  }
}

/**
 * Queries all Mongoose collections that store image paths and returns the union
 * of actively referenced `/uploads/*` URLs plus protected seed assets.
 */
export async function collectReferencedUploadUrlsFromDb(): Promise<Set<string>> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Cannot scan media references: MongoDB connection is not active");
  }

  const urls = new Set<string>(getProtectedSeedUploads({ refresh: true }));

  const [admins, bursars, donars, products, schoolInfos, siteContents, orders] =
    await Promise.all([
      Admin.find({}, { profileImage: 1 }).lean(),
      Bursar.find({}, { profileImage: 1 }).lean(),
      Donar.find({}, { profileImage: 1 }).lean(),
      Product.find({}, { productImage: 1 }).lean(),
      SchoolInfo.find(
        {},
        {
          featuredImage: 1,
          heroBackgroundImage: 1,
          sectionOneImage: 1,
          schoolLogo: 1,
          "gallery.imageUrl": 1,
        }
      ).lean(),
      SiteContent.find(
        {},
        {
          "whyEduDrop.image": 1,
          "ourWorks.imageUrl": 1,
          "testimonials.imageUrl": 1,
        }
      ).lean(),
      Order.find({}, { "products.productImage": 1 }).lean(),
    ]);

  for (const doc of admins) addNormalizedUploadUrl(urls, doc.profileImage);
  for (const doc of bursars) addNormalizedUploadUrl(urls, doc.profileImage);
  for (const doc of donars) addNormalizedUploadUrl(urls, doc.profileImage);
  for (const doc of products) addNormalizedUploadUrl(urls, doc.productImage);

  for (const info of schoolInfos) {
    addNormalizedUploadUrl(urls, info.featuredImage);
    addNormalizedUploadUrl(urls, info.heroBackgroundImage);
    addNormalizedUploadUrl(urls, info.sectionOneImage);
    addNormalizedUploadUrl(urls, info.schoolLogo);
    if (Array.isArray(info.gallery)) {
      for (const item of info.gallery) {
        addNormalizedUploadUrl(urls, item?.imageUrl);
      }
    }
  }

  for (const cms of siteContents) {
    addNormalizedUploadUrl(urls, cms?.whyEduDrop?.image);
    if (Array.isArray(cms?.ourWorks)) {
      for (const work of cms.ourWorks) {
        addNormalizedUploadUrl(urls, work?.imageUrl);
      }
    }
    if (Array.isArray(cms?.testimonials)) {
      for (const t of cms.testimonials) {
        addNormalizedUploadUrl(urls, t?.imageUrl);
      }
    }
  }

  for (const order of orders) {
    if (Array.isArray(order?.products)) {
      for (const item of order.products) {
        addNormalizedUploadUrl(urls, item?.productImage);
      }
    }
  }

  return urls;
}

/**
 * Mark-and-sweep garbage collection for live non-demo deployments:
 * unlinks files under `backend/uploads/` that are neither referenced by MongoDB
 * nor protected seed assets, after a safe grace window (`minAgeMs`, default 24h).
 */
export async function sweepOrphanedLiveUploads(options?: {
  minAgeMs?: number;
  dryRun?: boolean;
}): Promise<LiveOrphanSweepResult> {
  const minAgeMs = Math.max(0, options?.minAgeMs ?? DEFAULT_ORPHAN_GRACE_MS);
  const dryRun = Boolean(options?.dryRun);
  const allowUrls = await collectReferencedUploadUrlsFromDb();
  const maxMtimeMs = Date.now() - minAgeMs;

  const purge = await purgeOrphanedDiskUploads({
    allowUrls,
    maxMtimeMs,
    dryRun,
  });

  return {
    ...purge,
    activeReferencesCount: allowUrls.size,
    minAgeMs,
  };
}
