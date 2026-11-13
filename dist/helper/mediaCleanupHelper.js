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
exports.purgeOrphanedDiskUploads = exports.cleanupUnsavedTemporaryUpload = exports.computeRemovedUrls = exports.safeUnlinkMulterFile = exports.safeUnlinkUpload = exports.resolveSafeUploadPath = exports.ensureUploadDirExists = exports.isProtectedSeedUpload = exports.getProtectedSeedUploads = exports.UPLOADS_ROOT = exports.VALID_UPLOAD_SUBDIRS = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.VALID_UPLOAD_SUBDIRS = [
    "users",
    "school",
    "products",
    "cms",
];
const VALID_SUBDIRS = new Set(exports.VALID_UPLOAD_SUBDIRS);
exports.UPLOADS_ROOT = path_1.default.resolve(__dirname, "../../uploads");
const SEED_DIR = path_1.default.resolve(__dirname, "../../seed");
let cachedSeedUploads = null;
/**
 * Scans `backend/seed/*.json` and returns all referenced `/uploads/...` URLs
 * so seeded .webp assets on disk are never accidentally unlinked.
 */
const getProtectedSeedUploads = (options) => {
    if (cachedSeedUploads && !(options === null || options === void 0 ? void 0 : options.refresh)) {
        return cachedSeedUploads;
    }
    const protectedUrls = new Set();
    if (!fs_1.default.existsSync(SEED_DIR)) {
        cachedSeedUploads = protectedUrls;
        return cachedSeedUploads;
    }
    const files = fs_1.default
        .readdirSync(SEED_DIR)
        .filter((file) => file.endsWith(".json"));
    for (const file of files) {
        const raw = fs_1.default.readFileSync(path_1.default.join(SEED_DIR, file), "utf-8");
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
exports.getProtectedSeedUploads = getProtectedSeedUploads;
/**
 * Checks whether a relative upload path belongs to a protected seed asset.
 */
const isProtectedSeedUpload = (relativePath) => {
    if (!relativePath || typeof relativePath !== "string") {
        return false;
    }
    const clean = `/${relativePath.trim().replace(/^\/+/, "")}`;
    return (0, exports.getProtectedSeedUploads)().has(clean);
};
exports.isProtectedSeedUpload = isProtectedSeedUpload;
const ensureUploadDirExists = (subdir) => {
    const targetDir = subdir ? path_1.default.join(exports.UPLOADS_ROOT, subdir) : exports.UPLOADS_ROOT;
    if (!fs_1.default.existsSync(targetDir)) {
        fs_1.default.mkdirSync(targetDir, { recursive: true });
    }
    return targetDir;
};
exports.ensureUploadDirExists = ensureUploadDirExists;
/**
 * Resolves a relative `/uploads/<subdir>/<file>` URL to an absolute disk path
 * only if it strictly resides inside `backend/uploads` (and optional subdir).
 */
const resolveSafeUploadPath = (relativePath, allowedSubdir) => {
    if (!relativePath || typeof relativePath !== "string")
        return null;
    const trimmed = relativePath.trim();
    if (!trimmed ||
        trimmed === "/" ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:")) {
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
        ? path_1.default.resolve(exports.UPLOADS_ROOT, allowedSubdir)
        : exports.UPLOADS_ROOT;
    const resolvedTarget = path_1.default.resolve(exports.UPLOADS_ROOT, subRelative);
    if (!resolvedTarget.startsWith(expectedRoot + path_1.default.sep)) {
        return null;
    }
    return resolvedTarget;
};
exports.resolveSafeUploadPath = resolveSafeUploadPath;
/**
 * Safely deletes a single uploaded file within `backend/uploads` (or a specific subdir).
 */
const safeUnlinkUpload = (relativePath, allowedSubdir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((0, exports.isProtectedSeedUpload)(relativePath)) {
            return false;
        }
        const resolvedTarget = (0, exports.resolveSafeUploadPath)(relativePath, allowedSubdir);
        if (!resolvedTarget)
            return false;
        if (fs_1.default.existsSync(resolvedTarget)) {
            yield fs_1.default.promises.unlink(resolvedTarget);
            return true;
        }
        return false;
    }
    catch (err) {
        console.error("Failed to safely delete upload:", relativePath, err);
        return false;
    }
});
exports.safeUnlinkUpload = safeUnlinkUpload;
/**
 * Safely deletes an Express.Multer.File written to disk during rollback.
 */
const safeUnlinkMulterFile = (file, allowedSubdir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(file === null || file === void 0 ? void 0 : file.path))
            return;
        const expectedRoot = allowedSubdir && VALID_SUBDIRS.has(allowedSubdir)
            ? path_1.default.resolve(exports.UPLOADS_ROOT, allowedSubdir)
            : exports.UPLOADS_ROOT;
        const resolvedPath = path_1.default.resolve(file.path);
        if (!resolvedPath.startsWith(expectedRoot + path_1.default.sep)) {
            return;
        }
        if (fs_1.default.existsSync(resolvedPath)) {
            yield fs_1.default.promises.unlink(resolvedPath);
        }
    }
    catch (err) {
        console.error("Failed to rollback uploaded file:", err);
    }
});
exports.safeUnlinkMulterFile = safeUnlinkMulterFile;
/**
 * Computes set difference (oldUrls \ retainedUrls) for safe orphan deletion.
 * Prevents array index-shift bugs when items are deleted or reordered.
 */
const computeRemovedUrls = (oldUrls, retainedUrls) => {
    const normalize = (list) => list
        .filter((u) => typeof u === "string")
        .map((u) => u.trim())
        .filter((u) => Boolean(u) &&
        u !== "/" &&
        !u.startsWith("http://") &&
        !u.startsWith("https://"));
    const retainedSet = new Set(normalize(retainedUrls));
    const oldSet = new Set(normalize(oldUrls));
    return Array.from(oldSet).filter((url) => !retainedSet.has(url));
};
exports.computeRemovedUrls = computeRemovedUrls;
/**
 * Unlinks a superseded temporary upload URL only if it is inside `subdir`
 * and is NOT currently persisted anywhere in MongoDB.
 */
const cleanupUnsavedTemporaryUpload = (previousTemporaryUrl, subdir, isReferencedInDb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const safePath = (0, exports.resolveSafeUploadPath)(previousTemporaryUrl, subdir);
        if (!safePath || !previousTemporaryUrl)
            return;
        const cleanUrl = previousTemporaryUrl.trim().startsWith("/")
            ? previousTemporaryUrl.trim()
            : `/${previousTemporaryUrl.trim()}`;
        const isSaved = yield isReferencedInDb(cleanUrl);
        if (!isSaved) {
            yield (0, exports.safeUnlinkUpload)(cleanUrl, subdir);
        }
    }
    catch (err) {
        console.error("Failed to cleanup unsaved temporary upload:", err);
    }
});
exports.cleanupUnsavedTemporaryUpload = cleanupUnsavedTemporaryUpload;
/**
 * Walks managed upload subdirectories and unlinks (or previews when `dryRun` is true)
 * files not present in `allowUrls` whose modification time predates or equals `maxMtimeMs`.
 */
const purgeOrphanedDiskUploads = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const dryRun = Boolean(options.dryRun);
    let removedUploadsCount = 0;
    let freedBytes = 0;
    const deletedUrls = [];
    for (const subdir of exports.VALID_UPLOAD_SUBDIRS) {
        const dirPath = path_1.default.join(exports.UPLOADS_ROOT, subdir);
        if (!fs_1.default.existsSync(dirPath)) {
            continue;
        }
        const entries = yield fs_1.default.promises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isFile() || entry.name.startsWith(".")) {
                continue;
            }
            const uploadUrl = `/uploads/${subdir}/${entry.name}`;
            if (options.allowUrls.has(uploadUrl)) {
                continue;
            }
            const resolvedTarget = (0, exports.resolveSafeUploadPath)(uploadUrl, subdir);
            if (!resolvedTarget) {
                continue;
            }
            try {
                const stat = yield fs_1.default.promises.stat(resolvedTarget);
                if (stat.mtimeMs > options.maxMtimeMs) {
                    continue;
                }
                if (!dryRun) {
                    yield fs_1.default.promises.unlink(resolvedTarget);
                }
                removedUploadsCount += 1;
                freedBytes += stat.size;
                deletedUrls.push(uploadUrl);
            }
            catch (err) {
                if ((err === null || err === void 0 ? void 0 : err.code) !== "ENOENT") {
                    console.error("Failed to purge orphaned upload:", uploadUrl, err);
                }
            }
        }
    }
    return { dryRun, removedUploadsCount, freedBytes, deletedUrls };
});
exports.purgeOrphanedDiskUploads = purgeOrphanedDiskUploads;
