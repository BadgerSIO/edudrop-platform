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
exports.CMSController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const cms_service_1 = require("./cms.service");
const cms_model_1 = require("./cms.model");
const mediaCleanupHelper_1 = require("../../../helper/mediaCleanupHelper");
const getSiteContent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield cms_service_1.CMSService.getSiteContent();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Site content retrieved successfully",
        data: result,
    });
}));
const updateSiteContent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield cms_service_1.CMSService.updateSiteContent(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Site content updated successfully",
        data: result,
    });
}));
const uploadMedia = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = req.file;
    if (!file) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ success: false, message: "No file uploaded" });
    }
    const fileUrl = `/uploads/cms/${file.filename}`;
    const previousTemporaryUrl = (_a = req.body) === null || _a === void 0 ? void 0 : _a.previousTemporaryUrl;
    if (previousTemporaryUrl && previousTemporaryUrl !== fileUrl) {
        yield (0, mediaCleanupHelper_1.cleanupUnsavedTemporaryUpload)(previousTemporaryUrl, "cms", (url) => __awaiter(void 0, void 0, void 0, function* () {
            const exists = yield cms_model_1.SiteContent.exists({
                $or: [
                    { "whyEduDrop.image": url },
                    { "ourWorks.imageUrl": url },
                    { "testimonials.imageUrl": url },
                ],
            });
            return Boolean(exists);
        }));
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "File uploaded successfully",
        data: {
            url: fileUrl,
            imageUrl: fileUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
        },
    });
}));
// Works
const addOurWork = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield cms_service_1.CMSService.addOurWork(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Work item added successfully",
        data: result,
    });
}));
const updateOurWork = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const payload = req.body;
    const result = yield cms_service_1.CMSService.updateOurWork(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Work item updated successfully",
        data: result,
    });
}));
const deleteOurWork = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield cms_service_1.CMSService.deleteOurWork(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Work item deleted successfully",
        data: result,
    });
}));
// Testimonials
const addTestimonial = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield cms_service_1.CMSService.addTestimonial(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Testimonial added successfully",
        data: result,
    });
}));
const updateTestimonial = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const payload = req.body;
    const result = yield cms_service_1.CMSService.updateTestimonial(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Testimonial updated successfully",
        data: result,
    });
}));
const deleteTestimonial = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield cms_service_1.CMSService.deleteTestimonial(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Testimonial deleted successfully",
        data: result,
    });
}));
exports.CMSController = {
    getSiteContent,
    updateSiteContent,
    uploadMedia,
    addOurWork,
    updateOurWork,
    deleteOurWork,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
};
