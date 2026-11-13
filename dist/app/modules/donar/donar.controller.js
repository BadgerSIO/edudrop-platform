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
exports.DonarController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../constants/pagination");
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const profileUpdateHelper_1 = require("../../../helper/profileUpdateHelper");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const donar_constants_1 = require("./donar.constants");
const donar_service_1 = require("./donar.service");
const donar_validation_1 = require("./donar.validation");
const executeDonarUpdate = (id, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = yield (0, profileUpdateHelper_1.parseAndValidateProfileBody)(donar_validation_1.DonarValidation.updateDonarZodSchema, req.body, req.file);
    const newProfileImagePath = req.file
        ? `/uploads/users/${req.file.filename}`
        : undefined;
    try {
        const result = yield donar_service_1.DonarService.updateDonar(id, validatedData, newProfileImagePath);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Donor profile updated successfully!",
            data: result,
        });
    }
    catch (error) {
        yield (0, profileUpdateHelper_1.cleanupUploadedFile)(req.file);
        throw error;
    }
});
const getAllDonar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, donar_constants_1.donarFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield donar_service_1.DonarService.getAllDonar(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donars retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const donarId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.donar;
    if (!donarId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Donor profile not linked to user");
    }
    const result = yield donar_service_1.DonarService.getSingleDonar(String(donarId));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donor profile fetched successfully!",
        data: result,
    });
}));
const getSingleDonar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield donar_service_1.DonarService.getSingleDonar(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donar fetched successfully!",
        data: result,
    });
}));
const deleteDonar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield donar_service_1.DonarService.deleteDonar(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donar deleted successfully!",
        data: result,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const donarId = (_b = res.locals.user) === null || _b === void 0 ? void 0 : _b.donar;
    if (!donarId) {
        yield (0, profileUpdateHelper_1.cleanupUploadedFile)(req.file);
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Donor profile not linked to user");
    }
    yield executeDonarUpdate(String(donarId), req, res);
}));
const updateDonar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield executeDonarUpdate(req.params.id, req, res);
}));
const updateDonarStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const adminemail = res.locals.email;
    const result = yield donar_service_1.DonarService.updateDonarStatus(id, adminemail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donar updated successfully",
        data: result,
    });
}));
exports.DonarController = {
    getAllDonar,
    getMyProfile,
    getSingleDonar,
    deleteDonar,
    updateMyProfile,
    updateDonar,
    updateDonarStatus,
};
