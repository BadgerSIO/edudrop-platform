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
exports.SchoolController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const school_services_1 = require("./school.services");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../constants/pagination");
const school_constants_1 = require("./school.constants");
const schoolInfo_model_1 = require("../schoolInfo/schoolInfo.model");
const mediaCleanupHelper_1 = require("../../../helper/mediaCleanupHelper");
const uploadImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = req.file ||
        (Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null);
    if (!file) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "No image file uploaded",
            data: null,
        });
    }
    const imageUrl = `/uploads/school/${file.filename}`;
    const previousTemporaryUrl = (_a = req.body) === null || _a === void 0 ? void 0 : _a.previousTemporaryUrl;
    if (previousTemporaryUrl && previousTemporaryUrl !== imageUrl) {
        yield (0, mediaCleanupHelper_1.cleanupUnsavedTemporaryUpload)(previousTemporaryUrl, "school", (url) => __awaiter(void 0, void 0, void 0, function* () {
            const exists = yield schoolInfo_model_1.SchoolInfo.exists({
                $or: [
                    { schoolLogo: url },
                    { featuredImage: url },
                    { heroBackgroundImage: url },
                    { sectionOneImage: url },
                    { "gallery.imageUrl": url },
                ],
            });
            return Boolean(exists);
        }));
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Image uploaded successfully",
        data: {
            imageUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
        },
    });
}));
const createSchool = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _b = req.body, { bursar } = _b, schoolinfo = __rest(_b, ["bursar"]);
    const _c = yield bursar, { password } = _c, bursarData = __rest(_c, ["password"]);
    const result = yield school_services_1.SchoolService.createSchool(schoolinfo, bursarData, {
        password,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School created successfully",
        data: result,
    });
}));
const getAllSchool = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, school_constants_1.schoolFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield school_services_1.SchoolService.getAllSchool(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schools retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getSingleSchoolBySlug = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield school_services_1.SchoolService.getSingleSchoolBySlug(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School retrieved successfully",
        data: result,
    });
}));
const getSchoolStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const result = yield school_services_1.SchoolService.getSchoolStatus(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School status retrieved successfully",
        data: result,
    });
}));
const updateSchoolById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const school = req.body;
    const result = yield school_services_1.SchoolService.updateSchoolById(id, school);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School updated successfully",
        data: result,
    });
}));
const updateSchoolStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const adminemail = res.locals.email;
    const result = yield school_services_1.SchoolService.updateSchoolStatus(slug, adminemail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School status updated successfully",
        data: result,
    });
}));
const deleteSchoolById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield school_services_1.SchoolService.deleteSchoolById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "School deleted successfully",
        data: result,
    });
}));
exports.SchoolController = {
    uploadImage,
    createSchool,
    getAllSchool,
    getSingleSchoolBySlug,
    deleteSchoolById,
    updateSchoolById,
    updateSchoolStatus,
    getSchoolStatus,
};
