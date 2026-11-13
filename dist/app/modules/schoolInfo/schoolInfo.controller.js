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
exports.SchoolInfoController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const schoolInfo_service_1 = require("./schoolInfo.service");
const updateSchoolInfoById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const schoolInfo = req.body;
    const currentUser = res.locals.user;
    if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
            if (file.fieldname &&
                file.fieldname.startsWith("gallery") &&
                file.filename) {
                const indexMatch = file.fieldname.match(/\d+/);
                const index = indexMatch ? Number(indexMatch[0]) : -1;
                if (index >= 0) {
                    schoolInfo.gallery = schoolInfo.gallery || [];
                    schoolInfo.gallery[index] = Object.assign(Object.assign({}, (schoolInfo.gallery[index] || {})), { imageUrl: `/uploads/school/${file.filename}` });
                }
            }
            else if (file.fieldname === "schoolLogo" && file.filename) {
                schoolInfo.schoolLogo = `/uploads/school/${file.filename}`;
            }
            else if (file.fieldname === "featuredImage" && file.filename) {
                schoolInfo.featuredImage = `/uploads/school/${file.filename}`;
            }
            else if (file.fieldname === "heroBackgroundImage" && file.filename) {
                schoolInfo.heroBackgroundImage = `/uploads/school/${file.filename}`;
            }
            else if (file.fieldname === "sectionOneImage" && file.filename) {
                schoolInfo.sectionOneImage = `/uploads/school/${file.filename}`;
            }
        });
    }
    const result = yield schoolInfo_service_1.SchoolInfoService.updateSchoolInfoById(id, schoolInfo, currentUser);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School info updated successfully",
        data: result,
    });
}));
const getSingleSchoolInfoById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const result = yield schoolInfo_service_1.SchoolInfoService.getSingleSchoolInfoById(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School retrieved successfully",
        data: result,
    });
}));
const getSingleSchoolInfoBySlug = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield schoolInfo_service_1.SchoolInfoService.getSingleSchoolInfoBySlug(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School retrieved successfully",
        data: result,
    });
}));
const getSingleSchoolInfoBySlugOptimized = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield schoolInfo_service_1.SchoolInfoService.getSingleSchoolInfoBySlugOptimized(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School retrieved successfully",
        data: result,
    });
}));
const getAllSchool = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schoolInfo_service_1.SchoolInfoService.getAllSchool();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schools retrieved successfully",
        data: result.data,
    });
}));
exports.SchoolInfoController = {
    updateSchoolInfoById,
    getSingleSchoolInfoById,
    getSingleSchoolInfoBySlug,
    getAllSchool,
    getSingleSchoolInfoBySlugOptimized,
};
