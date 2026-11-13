"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsImageUpload = exports.usersImageUpload = exports.productUpload = exports.schoolSingleUpload = exports.schoolImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const imageProcessor_1 = require("./imageProcessor");
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB raw upload cap (re-encoded to lightweight WebP)
const ALLOWED_SCHOOL_MULTI_FIELD = /^(schoolLogo|featuredImage|heroBackgroundImage|sectionOneImage|gallery(\[\d+\].*)?)$/;
const memoryStorage = multer_1.default.memoryStorage();
const createImageFileFilter = (allowedFieldPattern) => {
    return (_req, file, cb) => {
        if (allowedFieldPattern && !allowedFieldPattern.test(file.fieldname)) {
            return cb(new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Unexpected upload field: ${file.fieldname}`));
        }
        const ext = path_1.default.extname(file.originalname || "").toLowerCase();
        const mimeAllowed = ALLOWED_MIME_TYPES.has(file.mimetype);
        const extAllowed = ext === "" || ALLOWED_EXTENSIONS.has(ext);
        if (mimeAllowed && extAllowed) {
            return cb(null, true);
        }
        return cb(new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Unsupported file format (${file.mimetype || ext}). Allowed formats: JPEG, PNG, WebP, AVIF.`));
    };
};
const usersImageUpload = [
    (0, multer_1.default)({
        storage: memoryStorage,
        limits: { fileSize: MAX_FILE_SIZE, files: 1 },
        fileFilter: createImageFileFilter(),
    }).single("profileImage"),
    (0, imageProcessor_1.processUploadedImages)("avatar"),
];
exports.usersImageUpload = usersImageUpload;
const productUpload = [
    (0, multer_1.default)({
        storage: memoryStorage,
        limits: { fileSize: MAX_FILE_SIZE, files: 1 },
        fileFilter: createImageFileFilter(),
    }).single("productImage"),
    (0, imageProcessor_1.processUploadedImages)("product"),
];
exports.productUpload = productUpload;
const schoolImageUpload = [
    (0, multer_1.default)({
        storage: memoryStorage,
        limits: { fileSize: MAX_FILE_SIZE, files: 12 },
        fileFilter: createImageFileFilter(ALLOWED_SCHOOL_MULTI_FIELD),
    }).any(),
    (0, imageProcessor_1.processUploadedImages)((_req, file) => file.fieldname === "schoolLogo" ? "schoolLogo" : "schoolMedia"),
];
exports.schoolImageUpload = schoolImageUpload;
const schoolSingleUpload = [
    (0, multer_1.default)({
        storage: memoryStorage,
        limits: { fileSize: MAX_FILE_SIZE, files: 1 },
        fileFilter: createImageFileFilter(),
    }).single("image"),
    (0, imageProcessor_1.processUploadedImages)((req) => {
        var _a, _b;
        return ((_a = req.body) === null || _a === void 0 ? void 0 : _a.type) === "logo" || ((_b = req.query) === null || _b === void 0 ? void 0 : _b.type) === "logo"
            ? "schoolLogo"
            : "schoolMedia";
    }),
];
exports.schoolSingleUpload = schoolSingleUpload;
const cmsImageUpload = [
    (0, multer_1.default)({
        storage: memoryStorage,
        limits: { fileSize: MAX_FILE_SIZE, files: 1 },
        fileFilter: createImageFileFilter(),
    }).single("image"),
    (0, imageProcessor_1.processUploadedImages)("cms"),
];
exports.cmsImageUpload = cmsImageUpload;
