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
exports.SchoolInfoService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schoolInfo_model_1 = require("./schoolInfo.model");
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("../user/user.model");
const school_model_1 = require("../school/school.model");
const notification_model_1 = require("../notification/notification.model");
const mediaCleanupHelper_1 = require("../../../helper/mediaCleanupHelper");
const getAllSchool = () => __awaiter(void 0, void 0, void 0, function* () {
    const activeSchools = yield school_model_1.School.find({ active: true }, "_id").lean();
    const activeSchoolIds = activeSchools.map((school) => school === null || school === void 0 ? void 0 : school._id);
    const schoolInfo = yield schoolInfo_model_1.SchoolInfo.find({
        school: { $in: activeSchoolIds },
    }, {
        featuredImage: 1,
        schoolLogo: 1,
        schoolName: 1,
        shortDescription: 1,
        school: 1,
        slug: 1,
        campusNeeds: 1,
    });
    return {
        data: schoolInfo,
    };
});
const updateSchoolInfoById = (id, payload, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Try finding by bursar ID first, then school ID, then _id
    let existingSchoolInfo = yield schoolInfo_model_1.SchoolInfo.findOne({ bursar: id });
    if (!existingSchoolInfo && mongoose_1.default.Types.ObjectId.isValid(id)) {
        existingSchoolInfo = yield schoolInfo_model_1.SchoolInfo.findOne({
            $or: [{ _id: id }, { school: id }],
        });
    }
    if (!existingSchoolInfo) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "School info not found");
    }
    // Bursar ownership check
    if (currentUser && currentUser.role === "bursar") {
        if (String(currentUser.bursar) !== String(existingSchoolInfo.bursar)) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: You can only edit your own school profile");
        }
    }
    // Collect existing image URLs before update for set-difference cleanup
    const singleImageFields = [
        "featuredImage",
        "schoolLogo",
        "heroBackgroundImage",
        "sectionOneImage",
    ];
    const oldImageUrls = [
        ...singleImageFields.map((field) => existingSchoolInfo[field]),
        ...(existingSchoolInfo.gallery || []).map((item) => item === null || item === void 0 ? void 0 : item.imageUrl),
    ];
    // Parse JSON fields if passed as serialized strings via multipart/form-data
    if (typeof payload.campusNeeds === "string") {
        try {
            payload.campusNeeds = JSON.parse(payload.campusNeeds);
        }
        catch (_c) {
            // ignore
        }
    }
    if (typeof payload.schoolStats === "string") {
        try {
            payload.schoolStats = JSON.parse(payload.schoolStats);
        }
        catch (_d) {
            // ignore
        }
    }
    if (typeof payload.achievements === "string") {
        try {
            payload.achievements = JSON.parse(payload.achievements);
        }
        catch (_e) {
            // ignore
        }
    }
    const fieldsToUpdate = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined &&
            Object.prototype.hasOwnProperty.call(payload, key)) {
            fieldsToUpdate[key] = value;
        }
    }
    // Preserve existing gallery image URLs if only title was edited via multipart
    if (((_a = existingSchoolInfo.gallery) === null || _a === void 0 ? void 0 : _a.length) && ((_b = payload.gallery) === null || _b === void 0 ? void 0 : _b.length)) {
        for (let i = 0; i < payload.gallery.length; i++) {
            const item = payload.gallery[i];
            if ((!item.imageUrl || item.imageUrl.trim() === "") && existingSchoolInfo.gallery[i]) {
                item.imageUrl = existingSchoolInfo.gallery[i].imageUrl;
            }
        }
        fieldsToUpdate.gallery = payload.gallery;
    }
    const result = yield schoolInfo_model_1.SchoolInfo.findByIdAndUpdate(existingSchoolInfo._id, { $set: fieldsToUpdate }, {
        new: true,
        runValidators: true,
    });
    if (result) {
        const retainedGallery = Array.isArray(fieldsToUpdate.gallery)
            ? fieldsToUpdate.gallery
            : existingSchoolInfo.gallery || [];
        const retainedImageUrls = [
            ...singleImageFields.map((field) => {
                const nextVal = fieldsToUpdate[field];
                return nextVal !== undefined
                    ? nextVal
                    : existingSchoolInfo[field];
            }),
            ...retainedGallery.map((item) => item === null || item === void 0 ? void 0 : item.imageUrl),
        ];
        const removedUrls = (0, mediaCleanupHelper_1.computeRemovedUrls)(oldImageUrls, retainedImageUrls);
        yield Promise.all(removedUrls.map((url) => (0, mediaCleanupHelper_1.safeUnlinkUpload)(url, "school")));
        // Notify admin asynchronously without blocking
        user_model_1.User.findOne({ role: "admin" }, { _id: 1 })
            .lean()
            .then((findAdmin) => {
            if (findAdmin) {
                const notificationPayloadAdmin = {
                    user: findAdmin._id,
                    message: `School info changed for ${result.schoolName || result.slug}`,
                    link: `/dashboard/schools-list/${result.slug}`,
                    read: false,
                };
                notification_model_1.Notification.create(notificationPayloadAdmin).catch(console.error);
            }
        })
            .catch(console.error);
    }
    return result;
});
const getSingleSchoolInfoById = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized request");
    }
    const user = yield user_model_1.User.findOne({ email }).lean();
    if (!user || !user.bursar) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "School bursar record not found");
    }
    const result = yield schoolInfo_model_1.SchoolInfo.findOne({ bursar: user.bursar }).populate("school");
    return result;
});
const getSingleSchoolInfoBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schoolInfo_model_1.SchoolInfo.findOne({ slug }).populate("school");
    return result;
});
const getSingleSchoolInfoBySlugOptimized = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.School.findOne({ slug }, { active: 1 }).lean();
    if (!(school === null || school === void 0 ? void 0 : school.active)) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "School is not currently active");
    }
    const schoolInfo = yield schoolInfo_model_1.SchoolInfo.findOne({ slug }).populate("bursar school");
    return schoolInfo;
});
exports.SchoolInfoService = {
    updateSchoolInfoById,
    getSingleSchoolInfoById,
    getSingleSchoolInfoBySlug,
    getAllSchool,
    getSingleSchoolInfoBySlugOptimized,
};
