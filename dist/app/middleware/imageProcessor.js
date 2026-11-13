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
exports.processUploadedImages = exports.optimizeBufferToWebp = exports.buildWebpFilename = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const mediaCleanupHelper_1 = require("../../helper/mediaCleanupHelper");
const IMAGE_PRESETS = {
    avatar: {
        subdir: "users",
        width: 512,
        height: 512,
        resizeOptions: {
            fit: "cover",
            position: sharp_1.default.strategy.attention,
            withoutEnlargement: true,
        },
        webpOptions: {
            quality: 82,
            alphaQuality: 90,
            effort: 4,
            smartSubsample: true,
        },
    },
    schoolLogo: {
        subdir: "school",
        width: 512,
        height: 512,
        resizeOptions: {
            fit: "inside",
            withoutEnlargement: true,
        },
        webpOptions: {
            quality: 86,
            alphaQuality: 95,
            effort: 4,
            smartSubsample: true,
        },
    },
    schoolMedia: {
        subdir: "school",
        width: 1920,
        height: 1440,
        resizeOptions: {
            fit: "inside",
            withoutEnlargement: true,
        },
        webpOptions: {
            quality: 82,
            effort: 4,
        },
    },
    product: {
        subdir: "products",
        width: 1200,
        height: 1200,
        resizeOptions: {
            fit: "inside",
            withoutEnlargement: true,
        },
        webpOptions: {
            quality: 85,
            alphaQuality: 92,
            effort: 4,
            smartSubsample: true,
        },
    },
    cms: {
        subdir: "cms",
        width: 1920,
        height: 1440,
        resizeOptions: {
            fit: "inside",
            withoutEnlargement: true,
        },
        webpOptions: {
            quality: 82,
            effort: 4,
        },
    },
};
const SUPPORTED_RASTER_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);
const MAX_INPUT_PIXELS = 40000000; // Guard against decompression bombs (~6300x6300)
const buildWebpFilename = (originalName) => {
    const ext = path_1.default.extname(originalName).toLowerCase();
    const baseName = path_1.default
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${uniqueSuffix}-${baseName || "upload"}.webp`;
};
exports.buildWebpFilename = buildWebpFilename;
/**
 * Decodes, validates magic bytes, strips EXIF/GPS metadata, auto-orients,
 * resizes within the preset bounding box, and encodes to visually lossless WebP.
 */
const optimizeBufferToWebp = (buffer, presetName) => __awaiter(void 0, void 0, void 0, function* () {
    const preset = IMAGE_PRESETS[presetName];
    let metadata;
    try {
        metadata = yield (0, sharp_1.default)(buffer, {
            limitInputPixels: MAX_INPUT_PIXELS,
        }).metadata();
    }
    catch (_a) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or corrupted image file. Please upload a valid JPEG, PNG, WebP, or AVIF image.");
    }
    if (!metadata.format || !SUPPORTED_RASTER_FORMATS.has(metadata.format)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Unsupported image data format (${metadata.format || "unknown"}). Allowed formats: JPEG, PNG, WebP, AVIF.`);
    }
    // .rotate() without arguments applies EXIF Orientation to pixel data and removes the EXIF tag.
    // Omitting .withMetadata() strips GPS coordinates, camera serials, and EXIF/IPTC/XMP bloat.
    const { data, info } = yield (0, sharp_1.default)(buffer, {
        limitInputPixels: MAX_INPUT_PIXELS,
    })
        .rotate()
        .resize(preset.width, preset.height, preset.resizeOptions)
        .webp(preset.webpOptions)
        .toBuffer({ resolveWithObject: true });
    return {
        outputBuffer: data,
        width: info.width,
        height: info.height,
    };
});
exports.optimizeBufferToWebp = optimizeBufferToWebp;
/**
 * Middleware factory that converts in-memory Multer upload(s) into WebP files
 * on disk with full rollback if any file in the request fails validation.
 */
const processUploadedImages = (resolvePreset) => {
    return (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const files = [];
        if (req.file) {
            files.push(req.file);
        }
        else if (Array.isArray(req.files)) {
            files.push(...req.files);
        }
        else if (req.files && typeof req.files === "object") {
            Object.values(req.files).forEach((group) => {
                if (Array.isArray(group))
                    files.push(...group);
            });
        }
        if (files.length === 0) {
            return next();
        }
        const writtenPaths = [];
        try {
            const prepared = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                if (!file.buffer || file.buffer.length === 0) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Uploaded image buffer is empty.");
                }
                const presetName = typeof resolvePreset === "function"
                    ? resolvePreset(req, file)
                    : resolvePreset;
                const preset = IMAGE_PRESETS[presetName];
                const targetDir = (0, mediaCleanupHelper_1.ensureUploadDirExists)(preset.subdir);
                const filename = (0, exports.buildWebpFilename)(file.originalname);
                const targetPath = path_1.default.join(targetDir, filename);
                const { outputBuffer } = yield (0, exports.optimizeBufferToWebp)(file.buffer, presetName);
                return {
                    file,
                    targetDir,
                    filename,
                    targetPath,
                    outputBuffer,
                };
            })));
            for (const item of prepared) {
                yield fs_1.default.promises.writeFile(item.targetPath, item.outputBuffer);
                writtenPaths.push(item.targetPath);
                item.file.destination = item.targetDir;
                item.file.filename = item.filename;
                item.file.path = item.targetPath;
                item.file.mimetype = "image/webp";
                item.file.size = item.outputBuffer.length;
                // Release raw upload buffer immediately from heap
                item.file.buffer = undefined;
            }
            return next();
        }
        catch (error) {
            // Atomic rollback of any files written in this request batch
            for (const p of writtenPaths) {
                try {
                    if (fs_1.default.existsSync(p)) {
                        yield fs_1.default.promises.unlink(p);
                    }
                }
                catch (unlinkErr) {
                    console.error("Failed to rollback partial WebP write:", p, unlinkErr);
                }
            }
            return next(error);
        }
    });
};
exports.processUploadedImages = processUploadedImages;
