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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BursarService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const bursar_constants_1 = require("./bursar.constants");
const bursar_model_1 = require("./bursar.model");
const paginationHelper_1 = require("../../../helper/paginationHelper");
const profileUpdateHelper_1 = require("../../../helper/profileUpdateHelper");
const user_model_1 = require("../user/user.model");
const getAllBursar = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = filters, filterableData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: bursar_constants_1.bursarSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filterableData).length) {
        andConditions.push({
            $and: Object.entries(filterableData).map(([fields, value]) => ({
                [fields]: value,
            })),
        });
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    const whereCondition = (andConditions === null || andConditions === void 0 ? void 0 : andConditions.length) > 0 ? { $and: andConditions } : {};
    const result = yield bursar_model_1.Bursar.find(whereCondition)
        .populate("school")
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);
    const total = yield bursar_model_1.Bursar.countDocuments(whereCondition);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleBursar = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bursar_model_1.Bursar.findById(id).populate("school");
    return result;
});
const deleteBursar = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the bursar exists
    const isExist = yield bursar_model_1.Bursar.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Bursar not found !");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // Soft delete user account
        yield user_model_1.User.findOneAndUpdate({ email: isExist === null || isExist === void 0 ? void 0 : isExist.email }, { isDeleted: true, status: "archived" }, { session });
        const bursar = yield bursar_model_1.Bursar.findByIdAndUpdate(id, { active: false, enabled: false }, { session, new: true });
        yield session.commitTransaction();
        yield session.endSession();
        return bursar;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
});
const updateBursar = (id, payload, newProfileImagePath) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield bursar_model_1.Bursar.findById(id, { profileImage: 1 }).lean();
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Bursar not found!");
    }
    const setPayload = (0, profileUpdateHelper_1.buildAllowListedSetPayload)(payload, ["contactNo", "presentAddress", "permanentAddress"], { name: ["firstName", "lastName"] });
    const unsetPayload = {};
    if (payload.gender === "") {
        unsetPayload.gender = 1;
    }
    else if (payload.gender) {
        setPayload.gender = payload.gender;
    }
    const { nextProfileImage, oldImageToDelete } = (0, profileUpdateHelper_1.resolveAvatarUpdate)(isExist.profileImage, newProfileImagePath, payload.removeProfileImage);
    if (nextProfileImage !== undefined) {
        setPayload.profileImage = nextProfileImage;
    }
    const updateQuery = {};
    if (Object.keys(setPayload).length > 0) {
        updateQuery.$set = setPayload;
    }
    if (Object.keys(unsetPayload).length > 0) {
        updateQuery.$unset = unsetPayload;
    }
    if (Object.keys(updateQuery).length === 0) {
        return bursar_model_1.Bursar.findById(id).populate("school");
    }
    const result = yield bursar_model_1.Bursar.findOneAndUpdate({ _id: id }, updateQuery, {
        new: true,
        runValidators: true,
    }).populate("school");
    if (oldImageToDelete) {
        yield (0, profileUpdateHelper_1.safeUnlinkUserImage)(oldImageToDelete);
    }
    return result;
});
exports.BursarService = {
    getAllBursar,
    getSingleBursar,
    deleteBursar,
    updateBursar,
};
