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
exports.ProductController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const product_services_1 = require("./product.services");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../constants/pagination");
const product_constants_1 = require("./product.constants");
const product_model_1 = require("./product.model");
const mediaCleanupHelper_1 = require("../../../helper/mediaCleanupHelper");
const uploadImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.file) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "No image file uploaded",
            data: null,
        });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    const previousTemporaryUrl = (_a = req.body) === null || _a === void 0 ? void 0 : _a.previousTemporaryUrl;
    if (previousTemporaryUrl && previousTemporaryUrl !== imageUrl) {
        yield (0, mediaCleanupHelper_1.cleanupUnsavedTemporaryUpload)(previousTemporaryUrl, "products", (url) => __awaiter(void 0, void 0, void 0, function* () {
            const exists = yield product_model_1.Product.exists({ productImage: url });
            return Boolean(exists);
        }));
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Image uploaded successfully",
        data: {
            imageUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        },
    });
}));
const createProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign({}, req.body);
    if (req.file) {
        payload.productImage = `/uploads/products/${req.file.filename}`;
    }
    try {
        const result = yield product_services_1.ProductService.createProduct(payload);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Product created successfully",
            data: result,
        });
    }
    catch (error) {
        yield (0, mediaCleanupHelper_1.safeUnlinkMulterFile)(req.file, "products");
        throw error;
    }
}));
const productsBySlugs = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield req.body;
    const result = yield product_services_1.ProductService.productsBySlugs(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result,
    });
}));
const getAllProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, product_constants_1.productFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield product_services_1.ProductService.getAllProduct(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Products retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getAllProductOptimized = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, product_constants_1.productFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield product_services_1.ProductService.getAllProductOptimized(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Products retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getProductBySlug = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield product_services_1.ProductService.getProductBySlug(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
}));
const getSingleProductBySlug = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield product_services_1.ProductService.getSingleProductBySlug(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
}));
const updateProductById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const payload = Object.assign({}, req.body);
    if (req.file) {
        payload.productImage = `/uploads/products/${req.file.filename}`;
    }
    try {
        const result = yield product_services_1.ProductService.updateProductById(id, payload);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Product updated successfully",
            data: result,
        });
    }
    catch (error) {
        yield (0, mediaCleanupHelper_1.safeUnlinkMulterFile)(req.file, "products");
        throw error;
    }
}));
const updateProductStatusByIdOrSlug = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const identifier = req.params.id || req.params.slug;
    const result = yield product_services_1.ProductService.updateProductStatusByIdOrSlug(identifier);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product status updated successfully",
        data: result,
    });
}));
const deleteProductById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield product_services_1.ProductService.deleteProductById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product deleted successfully",
        data: result,
    });
}));
exports.ProductController = {
    uploadImage,
    createProduct,
    getAllProduct,
    getAllProductOptimized,
    getSingleProductBySlug,
    deleteProductById,
    updateProductById,
    updateProductBySlug: updateProductById, // Alias for backward compatibility
    updateProductStatusBySlug: updateProductStatusByIdOrSlug,
    updateProductStatusByIdOrSlug,
    productsBySlugs,
    getProductBySlug,
};
