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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const paginationHelper_1 = require("../../../helper/paginationHelper");
const product_constants_1 = require("./product.constants");
const product_model_1 = require("./product.model");
const slugify_1 = require("../../../helper/slugify");
const mediaCleanupHelper_1 = require("../../../helper/mediaCleanupHelper");
const safeUnlink = (relativePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mediaCleanupHelper_1.safeUnlinkUpload)(relativePath, "products");
});
const generateUniqueSlug = (baseSlug, currentId) => __awaiter(void 0, void 0, void 0, function* () {
    let slug = (0, slugify_1.slugify)(baseSlug);
    let counter = 1;
    while (true) {
        const query = { slug, isDeleted: { $ne: true } };
        if (currentId) {
            query._id = { $ne: currentId };
        }
        const existing = yield product_model_1.Product.findOne(query);
        if (!existing) {
            return slug;
        }
        slug = `${(0, slugify_1.slugify)(baseSlug)}-${counter}`;
        counter++;
    }
});
const normalizeProductPayload = (payload) => {
    const normalized = Object.assign({}, payload);
    // Parse arrays if sent as bracket notation (e.g. from FormData: benefits[0], benefits[1])
    if (!normalized.benefits || !Array.isArray(normalized.benefits)) {
        const benefitsList = [];
        Object.keys(payload).forEach((key) => {
            const match = key.match(/^benefits\[(\d+)\]$/);
            if (match) {
                benefitsList[parseInt(match[1], 10)] = payload[key];
            }
        });
        if (benefitsList.length > 0) {
            normalized.benefits = benefitsList.filter(Boolean);
        }
    }
    if (!normalized.productDetails || !Array.isArray(normalized.productDetails)) {
        const detailsList = [];
        Object.keys(payload).forEach((key) => {
            const match = key.match(/^productDetails\[(\d+)\]$/);
            if (match) {
                detailsList[parseInt(match[1], 10)] = payload[key];
            }
        });
        if (detailsList.length > 0) {
            normalized.productDetails = detailsList.filter(Boolean);
        }
    }
    // Filter out any empty strings from arrays
    if (Array.isArray(normalized.benefits)) {
        normalized.benefits = normalized.benefits
            .map((b) => String(b).trim())
            .filter(Boolean);
    }
    if (Array.isArray(normalized.productDetails)) {
        normalized.productDetails = normalized.productDetails
            .map((d) => String(d).trim())
            .filter(Boolean);
    }
    // Convert numeric strings
    if (normalized.price !== undefined && normalized.price !== "") {
        normalized.price = Number(normalized.price);
    }
    if (normalized.salePrice !== undefined && normalized.salePrice !== "") {
        normalized.salePrice = Number(normalized.salePrice);
    }
    else if (normalized.salePrice === "") {
        normalized.salePrice = undefined;
    }
    if (normalized.quantityPerCase !== undefined &&
        normalized.quantityPerCase !== "") {
        normalized.quantityPerCase = Number(normalized.quantityPerCase);
    }
    if (normalized.refillPrice !== undefined && normalized.refillPrice !== "") {
        normalized.refillPrice = Number(normalized.refillPrice);
    }
    if (normalized.stockQuantity !== undefined &&
        normalized.stockQuantity !== "") {
        normalized.stockQuantity = Number(normalized.stockQuantity);
    }
    // Booleans
    if (typeof normalized.sale === "string") {
        normalized.sale = normalized.sale === "true";
    }
    if (typeof normalized.active === "string") {
        normalized.active = normalized.active === "true";
    }
    // Sync active and status
    if (normalized.status) {
        normalized.active = normalized.status === "active";
    }
    else if (normalized.active !== undefined) {
        normalized.status = normalized.active ? "active" : "draft";
    }
    return normalized;
};
const createProduct = (rawPayload) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = normalizeProductPayload(rawPayload);
    const baseSlug = payload.slug || payload.title;
    payload.slug = yield generateUniqueSlug(baseSlug);
    if (payload.active === undefined) {
        payload.active = true;
    }
    if (!payload.status) {
        payload.status = payload.active ? "active" : "draft";
    }
    payload.isDeleted = false;
    const result = yield product_model_1.Product.create(payload);
    return result;
});
const productsBySlugs = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.Product.find({
        slug: { $in: payload },
        isDeleted: { $ne: true },
    });
    return result;
});
const getAllProduct = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerms } = filters, filterableData = __rest(filters, ["searchTerms"]);
    const andConditions = [{ isDeleted: { $ne: true } }];
    if (searchTerms) {
        andConditions.push({
            $or: product_constants_1.productSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerms,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filterableData).length) {
        andConditions.push({
            $and: Object.entries(filterableData).map(([fields, value]) => {
                if (fields === "active") {
                    return { [fields]: value === "true" || value === true };
                }
                return { [fields]: value };
            }),
        });
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = yield product_model_1.Product.find(whereCondition)
        .populate("category")
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);
    const total = yield product_model_1.Product.countDocuments(whereCondition);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getAllProductOptimized = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerms } = filters, filterableData = __rest(filters, ["searchTerms"]);
    const andConditions = [
        { isDeleted: { $ne: true } },
        { active: { $ne: false } },
        { status: { $nin: ["draft", "archived"] } },
    ];
    if (searchTerms) {
        andConditions.push({
            $or: product_constants_1.productSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerms,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filterableData).length) {
        andConditions.push({
            $and: Object.entries(filterableData).map(([fields, value]) => {
                if (fields === "active") {
                    return { [fields]: value === "true" || value === true };
                }
                return { [fields]: value };
            }),
        });
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = yield product_model_1.Product.find(whereCondition)
        .select("title price sale salePrice productImage category slug description packagingType stockQuantity refillPrice quantityPerCase")
        .populate("category")
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);
    const total = yield product_model_1.Product.countDocuments(whereCondition);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getProductBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.Product.findOne({
        slug,
        isDeleted: { $ne: true },
        active: { $ne: false },
        status: { $nin: ["draft", "archived"] },
    })
        .select("-active")
        .populate("category");
    return result;
});
const getSingleProductBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.Product.findOne({
        slug,
        isDeleted: { $ne: true },
    }).populate("category");
    return result;
});
const updateProductById = (id, rawPayload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProduct = yield product_model_1.Product.findById(id);
    if (!existingProduct) {
        throw new Error("Product not found");
    }
    const payload = normalizeProductPayload(rawPayload);
    // If slug is changing or title changed, ensure unique slug
    if (payload.slug && payload.slug !== existingProduct.slug) {
        payload.slug = yield generateUniqueSlug(payload.slug, id);
    }
    else if (!payload.slug &&
        payload.title &&
        payload.title !== existingProduct.title) {
        payload.slug = yield generateUniqueSlug(payload.title, id);
    }
    const fieldsToUpdate = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined) {
            fieldsToUpdate[key] = value;
        }
    }
    const result = yield product_model_1.Product.findByIdAndUpdate(id, { $set: fieldsToUpdate }, {
        new: true,
        runValidators: true,
    }).populate("category");
    // Clean up old product image only after DB write succeeds
    if (result &&
        payload.productImage &&
        payload.productImage !== existingProduct.productImage &&
        existingProduct.productImage) {
        yield safeUnlink(existingProduct.productImage);
    }
    return result;
});
const updateProductStatusByIdOrSlug = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    const existingProduct = yield product_model_1.Product.findOne(query);
    if (!existingProduct) {
        throw new Error("Product not found");
    }
    const newActive = !existingProduct.active;
    const newStatus = newActive ? "active" : "draft";
    const result = yield product_model_1.Product.findOneAndUpdate(query, { active: newActive, status: newStatus }, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Soft delete: mark as archived and isDeleted: true
    const result = yield product_model_1.Product.findByIdAndUpdate(id, { isDeleted: true, status: "archived", active: false }, { new: true });
    return result;
});
exports.ProductService = {
    createProduct,
    getAllProduct,
    getSingleProductBySlug,
    deleteProductById,
    updateProductById,
    updateProductBySlug: updateProductById, // Alias for backward compatibility
    updateProductStatusBySlug: updateProductStatusByIdOrSlug,
    updateProductStatusByIdOrSlug,
    getAllProductOptimized,
    productsBySlugs,
    getProductBySlug,
};
