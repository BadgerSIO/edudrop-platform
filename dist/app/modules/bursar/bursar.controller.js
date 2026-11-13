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
exports.BursarController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../constants/pagination");
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const profileUpdateHelper_1 = require("../../../helper/profileUpdateHelper");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const bursar_constants_1 = require("./bursar.constants");
const bursar_service_1 = require("./bursar.service");
const bursar_validation_1 = require("./bursar.validation");
const executeBursarUpdate = (id, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = yield (0, profileUpdateHelper_1.parseAndValidateProfileBody)(bursar_validation_1.BursarValidation.updateBursarZodSchema, req.body, req.file);
    const newProfileImagePath = req.file
        ? `/uploads/users/${req.file.filename}`
        : undefined;
    try {
        const result = yield bursar_service_1.BursarService.updateBursar(id, validatedData, newProfileImagePath);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Bursar profile updated successfully!",
            data: result,
        });
    }
    catch (error) {
        yield (0, profileUpdateHelper_1.cleanupUploadedFile)(req.file);
        throw error;
    }
});
const getAllBursar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, bursar_constants_1.bursarFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield bursar_service_1.BursarService.getAllBursar(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Bursars retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const bursarId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.bursar;
    if (!bursarId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Bursar profile not linked to user");
    }
    const result = yield bursar_service_1.BursarService.getSingleBursar(String(bursarId));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Bursar profile fetched successfully!",
        data: result,
    });
}));
const getSingleBursar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield bursar_service_1.BursarService.getSingleBursar(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Bursar fetched successfully!",
        data: result,
    });
}));
const deleteBursar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield bursar_service_1.BursarService.deleteBursar(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Bursar deleted successfully!",
        data: result,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const bursarId = (_b = res.locals.user) === null || _b === void 0 ? void 0 : _b.bursar;
    if (!bursarId) {
        yield (0, profileUpdateHelper_1.cleanupUploadedFile)(req.file);
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Bursar profile not linked to user");
    }
    yield executeBursarUpdate(String(bursarId), req, res);
}));
const updateBursar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield executeBursarUpdate(req.params.id, req, res);
}));
exports.BursarController = {
    getAllBursar,
    getMyProfile,
    getSingleBursar,
    deleteBursar,
    updateMyProfile,
    updateBursar,
};
