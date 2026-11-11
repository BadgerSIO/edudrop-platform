import { NextFunction, Request, RequestHandler, Response } from "express";
import fs from "fs";
import path from "path";
import sharp, { Metadata, ResizeOptions, WebpOptions } from "sharp";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
import {
  ensureUploadDirExists,
  UploadSubdir,
} from "../../helper/mediaCleanupHelper";

export type ImagePresetName =
  | "avatar"
  | "schoolLogo"
  | "schoolMedia"
  | "product"
  | "cms";

interface ImagePresetConfig {
  subdir: UploadSubdir;
  width: number;
  height: number;
  resizeOptions: ResizeOptions;
  webpOptions: WebpOptions;
}

const IMAGE_PRESETS: Record<ImagePresetName, ImagePresetConfig> = {
  avatar: {
    subdir: "users",
    width: 512,
    height: 512,
    resizeOptions: {
      fit: "cover",
      position: sharp.strategy.attention,
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
const MAX_INPUT_PIXELS = 40_000_000; // Guard against decompression bombs (~6300x6300)

export const buildWebpFilename = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${uniqueSuffix}-${baseName || "upload"}.webp`;
};

/**
 * Decodes, validates magic bytes, strips EXIF/GPS metadata, auto-orients,
 * resizes within the preset bounding box, and encodes to visually lossless WebP.
 */
export const optimizeBufferToWebp = async (
  buffer: Buffer,
  presetName: ImagePresetName
): Promise<{
  outputBuffer: Buffer;
  width?: number;
  height?: number;
}> => {
  const preset = IMAGE_PRESETS[presetName];

  let metadata: Metadata;
  try {
    metadata = await sharp(buffer, {
      limitInputPixels: MAX_INPUT_PIXELS,
    }).metadata();
  } catch {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid or corrupted image file. Please upload a valid JPEG, PNG, WebP, or AVIF image."
    );
  }

  if (!metadata.format || !SUPPORTED_RASTER_FORMATS.has(metadata.format)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Unsupported image data format (${metadata.format || "unknown"}). Allowed formats: JPEG, PNG, WebP, AVIF.`
    );
  }

  // .rotate() without arguments applies EXIF Orientation to pixel data and removes the EXIF tag.
  // Omitting .withMetadata() strips GPS coordinates, camera serials, and EXIF/IPTC/XMP bloat.
  const { data, info } = await sharp(buffer, {
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
};

export type PresetResolver = (
  req: Request,
  file: Express.Multer.File
) => ImagePresetName;

/**
 * Middleware factory that converts in-memory Multer upload(s) into WebP files
 * on disk with full rollback if any file in the request fails validation.
 */
export const processUploadedImages = (
  resolvePreset: ImagePresetName | PresetResolver
): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const files: Express.Multer.File[] = [];

    if (req.file) {
      files.push(req.file);
    } else if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else if (req.files && typeof req.files === "object") {
      Object.values(req.files).forEach((group) => {
        if (Array.isArray(group)) files.push(...group);
      });
    }

    if (files.length === 0) {
      return next();
    }

    const writtenPaths: string[] = [];

    try {
      const prepared = await Promise.all(
        files.map(async (file) => {
          if (!file.buffer || file.buffer.length === 0) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "Uploaded image buffer is empty."
            );
          }

          const presetName =
            typeof resolvePreset === "function"
              ? resolvePreset(req, file)
              : resolvePreset;
          const preset = IMAGE_PRESETS[presetName];
          const targetDir = ensureUploadDirExists(preset.subdir);
          const filename = buildWebpFilename(file.originalname);
          const targetPath = path.join(targetDir, filename);

          const { outputBuffer } = await optimizeBufferToWebp(
            file.buffer,
            presetName
          );

          return {
            file,
            targetDir,
            filename,
            targetPath,
            outputBuffer,
          };
        })
      );

      for (const item of prepared) {
        await fs.promises.writeFile(item.targetPath, item.outputBuffer);
        writtenPaths.push(item.targetPath);

        item.file.destination = item.targetDir;
        item.file.filename = item.filename;
        item.file.path = item.targetPath;
        item.file.mimetype = "image/webp";
        item.file.size = item.outputBuffer.length;
        // Release raw upload buffer immediately from heap
        item.file.buffer = undefined as unknown as Buffer;
      }

      return next();
    } catch (error) {
      // Atomic rollback of any files written in this request batch
      for (const p of writtenPaths) {
        try {
          if (fs.existsSync(p)) {
            await fs.promises.unlink(p);
          }
        } catch (unlinkErr) {
          console.error("Failed to rollback partial WebP write:", p, unlinkErr);
        }
      }
      return next(error);
    }
  };
};
