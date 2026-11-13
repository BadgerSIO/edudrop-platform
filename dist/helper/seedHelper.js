"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sweepOrphanedLiveUploads = exports.collectReferencedUploadUrlsFromDb = exports.resetDatabaseToSeed = exports.parseExtendedJson = exports.DEFAULT_ORPHAN_GRACE_MS = exports.isProtectedSeedUpload = exports.getProtectedSeedUploads = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const mediaCleanupHelper_1 = require("./mediaCleanupHelper");
Object.defineProperty(exports, "getProtectedSeedUploads", { enumerable: true, get: function () { return mediaCleanupHelper_1.getProtectedSeedUploads; } });
Object.defineProperty(exports, "isProtectedSeedUpload", { enumerable: true, get: function () { return mediaCleanupHelper_1.isProtectedSeedUpload; } });
const admin_model_1 = require("../app/modules/admin/admin.model");
const bursar_model_1 = require("../app/modules/bursar/bursar.model");
const donar_model_1 = require("../app/modules/donar/donar.model");
const product_model_1 = require("../app/modules/product/product.model");
const schoolInfo_model_1 = require("../app/modules/schoolInfo/schoolInfo.model");
const cms_model_1 = require("../app/modules/cms/cms.model");
const order_model_1 = require("../app/modules/order/order.model");
exports.DEFAULT_ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;
const SEED_DIR = path_1.default.resolve(__dirname, "../../seed");
let activeResetPromise = null;
/**
 * Recursively converts MongoDB Extended JSON ($oid, $date) into native Mongoose types.
 */
function parseExtendedJson(value) {
    if (Array.isArray(value)) {
        return value.map(parseExtendedJson);
    }
    if (value && typeof value === "object") {
        const obj = value;
        if ("$oid" in obj && typeof obj.$oid === "string") {
            return new mongoose_1.default.Types.ObjectId(obj.$oid);
        }
        if ("$date" in obj && typeof obj.$date === "string") {
            return new Date(obj.$date);
        }
        const result = {};
        for (const [k, v] of Object.entries(obj)) {
            result[k] = parseExtendedJson(v);
        }
        return result;
    }
    return value;
}
exports.parseExtendedJson = parseExtendedJson;
/**
 * Restores all MongoDB collections from `backend/seed/*.json` using an active
 * Mongoose connection and reconciles `backend/uploads/` back to protected seed
 * assets so orphaned temporary/demo uploads do not accumulate on disk.
 * Guarded by an in-memory mutex to prevent overlapping resets.
 */
function resetDatabaseToSeed(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (activeResetPromise) {
            return activeResetPromise;
        }
        const resetStartedAt = Date.now();
        activeResetPromise = (() => __awaiter(this, void 0, void 0, function* () {
            if (mongoose_1.default.connection.readyState !== 1) {
                throw new Error("Cannot reset database: MongoDB connection is not active");
            }
            if (!fs_1.default.existsSync(SEED_DIR)) {
                throw new Error(`Seed directory not found at ${SEED_DIR}`);
            }
            const files = fs_1.default
                .readdirSync(SEED_DIR)
                .filter((file) => file.endsWith(".json"))
                .sort();
            for (const file of files) {
                const collectionName = path_1.default.basename(file, ".json");
                const raw = fs_1.default.readFileSync(path_1.default.join(SEED_DIR, file), "utf-8");
                const docs = parseExtendedJson(JSON.parse(raw));
                const collection = mongoose_1.default.connection.collection(collectionName);
                yield collection.deleteMany({});
                if (Array.isArray(docs) && docs.length > 0) {
                    yield collection.insertMany(docs);
                }
                if (!(options === null || options === void 0 ? void 0 : options.silent)) {
                    console.log(`Seeded collection "${collectionName}" (${Array.isArray(docs) ? docs.length : 0} documents)`);
                }
            }
            const protectedSeeds = (0, mediaCleanupHelper_1.getProtectedSeedUploads)({ refresh: true });
            const cleanup = yield (0, mediaCleanupHelper_1.purgeOrphanedDiskUploads)({
                allowUrls: protectedSeeds,
                maxMtimeMs: resetStartedAt,
            });
            if (!(options === null || options === void 0 ? void 0 : options.silent) && cleanup.removedUploadsCount > 0) {
                console.log(`Cleaned ${cleanup.removedUploadsCount} orphaned upload(s) (${Math.round(cleanup.freedBytes / 1024)} KB)`);
            }
            return {
                seededCollections: files.length,
                removedUploadsCount: cleanup.removedUploadsCount,
                freedBytes: cleanup.freedBytes,
            };
        }))();
        try {
            return yield activeResetPromise;
        }
        finally {
            activeResetPromise = null;
        }
    });
}
exports.resetDatabaseToSeed = resetDatabaseToSeed;
function addNormalizedUploadUrl(set, raw) {
    if (typeof raw !== "string")
        return;
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "/")
        return;
    const clean = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (clean.startsWith("/uploads/")) {
        set.add(clean);
    }
}
/**
 * Queries all Mongoose collections that store image paths and returns the union
 * of actively referenced `/uploads/*` URLs plus protected seed assets.
 */
function collectReferencedUploadUrlsFromDb() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (mongoose_1.default.connection.readyState !== 1) {
            throw new Error("Cannot scan media references: MongoDB connection is not active");
        }
        const urls = new Set((0, mediaCleanupHelper_1.getProtectedSeedUploads)({ refresh: true }));
        const [admins, bursars, donars, products, schoolInfos, siteContents, orders] = yield Promise.all([
            admin_model_1.Admin.find({}, { profileImage: 1 }).lean(),
            bursar_model_1.Bursar.find({}, { profileImage: 1 }).lean(),
            donar_model_1.Donar.find({}, { profileImage: 1 }).lean(),
            product_model_1.Product.find({}, { productImage: 1 }).lean(),
            schoolInfo_model_1.SchoolInfo.find({}, {
                featuredImage: 1,
                heroBackgroundImage: 1,
                sectionOneImage: 1,
                schoolLogo: 1,
                "gallery.imageUrl": 1,
            }).lean(),
            cms_model_1.SiteContent.find({}, {
                "whyEduDrop.image": 1,
                "ourWorks.imageUrl": 1,
                "testimonials.imageUrl": 1,
            }).lean(),
            order_model_1.Order.find({}, { "products.productImage": 1 }).lean(),
        ]);
        for (const doc of admins)
            addNormalizedUploadUrl(urls, doc.profileImage);
        for (const doc of bursars)
            addNormalizedUploadUrl(urls, doc.profileImage);
        for (const doc of donars)
            addNormalizedUploadUrl(urls, doc.profileImage);
        for (const doc of products)
            addNormalizedUploadUrl(urls, doc.productImage);
        for (const info of schoolInfos) {
            addNormalizedUploadUrl(urls, info.featuredImage);
            addNormalizedUploadUrl(urls, info.heroBackgroundImage);
            addNormalizedUploadUrl(urls, info.sectionOneImage);
            addNormalizedUploadUrl(urls, info.schoolLogo);
            if (Array.isArray(info.gallery)) {
                for (const item of info.gallery) {
                    addNormalizedUploadUrl(urls, item === null || item === void 0 ? void 0 : item.imageUrl);
                }
            }
        }
        for (const cms of siteContents) {
            addNormalizedUploadUrl(urls, (_a = cms === null || cms === void 0 ? void 0 : cms.whyEduDrop) === null || _a === void 0 ? void 0 : _a.image);
            if (Array.isArray(cms === null || cms === void 0 ? void 0 : cms.ourWorks)) {
                for (const work of cms.ourWorks) {
                    addNormalizedUploadUrl(urls, work === null || work === void 0 ? void 0 : work.imageUrl);
                }
            }
            if (Array.isArray(cms === null || cms === void 0 ? void 0 : cms.testimonials)) {
                for (const t of cms.testimonials) {
                    addNormalizedUploadUrl(urls, t === null || t === void 0 ? void 0 : t.imageUrl);
                }
            }
        }
        for (const order of orders) {
            if (Array.isArray(order === null || order === void 0 ? void 0 : order.products)) {
                for (const item of order.products) {
                    addNormalizedUploadUrl(urls, item === null || item === void 0 ? void 0 : item.productImage);
                }
            }
        }
        return urls;
    });
}
exports.collectReferencedUploadUrlsFromDb = collectReferencedUploadUrlsFromDb;
/**
 * Mark-and-sweep garbage collection for live non-demo deployments:
 * unlinks files under `backend/uploads/` that are neither referenced by MongoDB
 * nor protected seed assets, after a safe grace window (`minAgeMs`, default 24h).
 */
function sweepOrphanedLiveUploads(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const minAgeMs = Math.max(0, (_a = options === null || options === void 0 ? void 0 : options.minAgeMs) !== null && _a !== void 0 ? _a : exports.DEFAULT_ORPHAN_GRACE_MS);
        const dryRun = Boolean(options === null || options === void 0 ? void 0 : options.dryRun);
        const allowUrls = yield collectReferencedUploadUrlsFromDb();
        const maxMtimeMs = Date.now() - minAgeMs;
        const purge = yield (0, mediaCleanupHelper_1.purgeOrphanedDiskUploads)({
            allowUrls,
            maxMtimeMs,
            dryRun,
        });
        return Object.assign(Object.assign({}, purge), { activeReferencesCount: allowUrls.size, minAgeMs });
    });
}
exports.sweepOrphanedLiveUploads = sweepOrphanedLiveUploads;
