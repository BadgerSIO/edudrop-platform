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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAvatarUpdate = exports.buildAllowListedSetPayload = exports.parseAndValidateProfileBody = exports.cleanupUploadedFile = exports.safeUnlinkUserImage = exports.unflattenDottedBody = void 0;
const mediaCleanupHelper_1 = require("./mediaCleanupHelper");
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
/**
 * Unflattens multipart dotted keys (e.g. `name.firstName`, `address.city`)
 * into nested objects while guarding against prototype pollution.
 */
const unflattenDottedBody = (rawBody) => {
    const result = {};
    if (!rawBody || typeof rawBody !== "object") {
        return result;
    }
    for (const [rawKey, value] of Object.entries(rawBody)) {
        if (FORBIDDEN_KEYS.has(rawKey))
            continue;
        if (rawKey.includes(".")) {
            const parts = rawKey.split(".");
            if (parts.some((p) => !p || FORBIDDEN_KEYS.has(p)))
                continue;
            let cursor = result;
            for (let i = 0; i < parts.length - 1; i++) {
                const segment = parts[i];
                if (!cursor[segment] || typeof cursor[segment] !== "object") {
                    cursor[segment] = {};
                }
                cursor = cursor[segment];
            }
            cursor[parts[parts.length - 1]] = value;
        }
        else {
            if ((rawKey === "name" || rawKey === "address") &&
                typeof value === "string") {
                try {
                    const parsed = JSON.parse(value);
                    if (parsed && typeof parsed === "object") {
                        result[rawKey] = Object.assign(Object.assign({}, (result[rawKey] || {})), parsed);
                        continue;
                    }
                }
                catch (_a) {
                    // Ignore non-JSON string
                }
            }
            if (typeof value === "object" &&
                value !== null &&
                !Array.isArray(value) &&
                typeof result[rawKey] === "object" &&
                result[rawKey] !== null) {
                result[rawKey] = Object.assign(Object.assign({}, result[rawKey]), value);
            }
            else {
                result[rawKey] = value;
            }
        }
    }
    return result;
};
exports.unflattenDottedBody = unflattenDottedBody;
/**
 * Safely deletes an uploaded user image within `backend/uploads/users`.
 * Enforces strict directory containment to prevent path traversal.
 */
const safeUnlinkUserImage = (relativePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mediaCleanupHelper_1.safeUnlinkUpload)(relativePath, "users");
});
exports.safeUnlinkUserImage = safeUnlinkUserImage;
/**
 * Cleans up a newly written Multer upload if downstream validation or DB write fails.
 */
const cleanupUploadedFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mediaCleanupHelper_1.safeUnlinkMulterFile)(file, "users");
});
exports.cleanupUploadedFile = cleanupUploadedFile;
/**
 * Unflattens multipart request bodies and validates against a Zod schema,
 * rolling back any newly uploaded file if validation fails.
 */
const parseAndValidateProfileBody = (schema, rawBody, file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const normalizedBody = (0, exports.unflattenDottedBody)(rawBody);
        const parsed = yield schema.parseAsync({ body: normalizedBody });
        return parsed.body;
    }
    catch (error) {
        yield (0, exports.cleanupUploadedFile)(file);
        throw error;
    }
});
exports.parseAndValidateProfileBody = parseAndValidateProfileBody;
/**
 * Constructs a flat MongoDB `$set` update payload strictly allow-listed to
 * permissible profile fields, preserving sibling nested keys.
 */
const buildAllowListedSetPayload = (validated, scalarFields, nestedFields) => {
    const setPayload = {};
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
exports.buildAllowListedSetPayload = buildAllowListedSetPayload;
/**
 * Resolves profileImage `$set` value and old-image deletion target safely.
 */
const resolveAvatarUpdate = (existingImage, newProfileImagePath, removeProfileImage) => {
    const shouldRemove = removeProfileImage === true || removeProfileImage === "true";
    if (newProfileImagePath) {
        return {
            nextProfileImage: newProfileImagePath,
            oldImageToDelete: existingImage && existingImage !== newProfileImagePath
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
exports.resolveAvatarUpdate = resolveAvatarUpdate;
