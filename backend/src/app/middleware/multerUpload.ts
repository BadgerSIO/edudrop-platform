import multer from "multer";
import path from "path";
import { Request, RequestHandler } from "express";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";
import { processUploadedImages } from "./imageProcessor";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB raw upload cap (re-encoded to lightweight WebP)
const ALLOWED_SCHOOL_MULTI_FIELD =
  /^(schoolLogo|featuredImage|heroBackgroundImage|sectionOneImage|gallery(\[\d+\].*)?)$/;

const memoryStorage = multer.memoryStorage();

const createImageFileFilter = (allowedFieldPattern?: RegExp) => {
  return (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedFieldPattern && !allowedFieldPattern.test(file.fieldname)) {
      return cb(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Unexpected upload field: ${file.fieldname}`
        )
      );
    }

    const ext = path.extname(file.originalname || "").toLowerCase();
    const mimeAllowed = ALLOWED_MIME_TYPES.has(file.mimetype);
    const extAllowed = ext === "" || ALLOWED_EXTENSIONS.has(ext);

    if (mimeAllowed && extAllowed) {
      return cb(null, true);
    }

    return cb(
      new ApiError(
        httpStatus.BAD_REQUEST,
        `Unsupported file format (${file.mimetype || ext}). Allowed formats: JPEG, PNG, WebP, AVIF.`
      )
    );
  };
};

const usersImageUpload: RequestHandler[] = [
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: createImageFileFilter(),
  }).single("profileImage"),
  processUploadedImages("avatar"),
];

const productUpload: RequestHandler[] = [
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: createImageFileFilter(),
  }).single("productImage"),
  processUploadedImages("product"),
];

const schoolImageUpload: RequestHandler[] = [
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_FILE_SIZE, files: 12 },
    fileFilter: createImageFileFilter(ALLOWED_SCHOOL_MULTI_FIELD),
  }).any(),
  processUploadedImages((_req, file) =>
    file.fieldname === "schoolLogo" ? "schoolLogo" : "schoolMedia"
  ),
];

const schoolSingleUpload: RequestHandler[] = [
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: createImageFileFilter(),
  }).single("image"),
  processUploadedImages((req) =>
    req.body?.type === "logo" || req.query?.type === "logo"
      ? "schoolLogo"
      : "schoolMedia"
  ),
];

const cmsImageUpload: RequestHandler[] = [
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: createImageFileFilter(),
  }).single("image"),
  processUploadedImages("cms"),
];

export {
  schoolImageUpload,
  schoolSingleUpload,
  productUpload,
  usersImageUpload,
  cmsImageUpload,
};
