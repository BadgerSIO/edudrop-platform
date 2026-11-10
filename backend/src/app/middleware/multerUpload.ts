import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFileName = (originalName: string) => {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}-${baseName || "upload"}${ext}`;
};

const generateStorage = (destination: string) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, `../../../uploads/${destination}`);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(null, sanitizeFileName(file.originalname));
    },
  });

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        httpStatus.BAD_REQUEST,
        `Unsupported file format: ${file.mimetype}. Allowed: WebP, PNG, JPEG, AVIF, SVG`
      )
    );
  }
};

// Storage configurations
const schoolImageStorage = generateStorage("school");
const productImageStorage = generateStorage("products");
const usersImageStorage = generateStorage("users");
const cmsImageStorage = generateStorage("cms");

const usersImageUpload = multer({
  storage: usersImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("profileImage");

const productUpload = multer({
  storage: productImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("productImage");

const schoolImageUpload = multer({
  storage: schoolImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).any();

const schoolSingleUpload = multer({
  storage: schoolImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("image");

const cmsImageUpload = multer({
  storage: cmsImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("image");

export {
  schoolImageUpload,
  schoolSingleUpload,
  productUpload,
  usersImageUpload,
  cmsImageUpload,
};
