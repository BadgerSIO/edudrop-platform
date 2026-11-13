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
exports.CategoryService = void 0;
const paginationHelper_1 = require("../../../helper/paginationHelper");
const category_constants_1 = require("./category.constants");
const category_model_1 = require("./category.model");
const product_model_1 = require("../product/product.model");
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.create(payload);
    return result;
});
const getAllCategory = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerms } = filters, filterableData = __rest(filters, ["searchTerms"]);
    const andConditions = [];
    if (searchTerms) {
        andConditions.push({
            $or: category_constants_1.categorySearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerms,
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
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const categories = yield category_model_1.Category.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);
    const categoryIds = categories.map((c) => c._id);
    const counts = yield product_model_1.Product.aggregate([
        {
            $match: {
                category: { $in: categoryIds },
                isDeleted: { $ne: true },
            },
        },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
            },
        },
    ]);
    const countMap = new Map();
    counts.forEach((c) => countMap.set(c._id.toString(), c.count));
    const data = categories.map((cat) => {
        const obj = cat.toObject();
        return Object.assign(Object.assign({}, obj), { productCount: countMap.get(cat._id.toString()) || 0 });
    });
    const total = yield category_model_1.Category.countDocuments(whereCondition);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
});
const getSingleCategoryBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.findOne({ slug });
    if (result) {
        const productCount = yield product_model_1.Product.countDocuments({
            category: result._id,
            isDeleted: { $ne: true },
        });
        const obj = result.toObject();
        return Object.assign(Object.assign({}, obj), { productCount });
    }
    return result;
});
const updateCategoryBySlug = (slug, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield category_model_1.Category.findOne({ slug });
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    const result = yield category_model_1.Category.findOneAndUpdate({ slug }, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteCategoryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const productCount = yield product_model_1.Product.countDocuments({
        category: id,
        isDeleted: { $ne: true },
    });
    if (productCount > 0) {
        throw new Error(`Cannot delete category: ${productCount} active products are currently assigned to this category. Please reassign or delete these products first.`);
    }
    const result = yield category_model_1.Category.findByIdAndDelete(id);
    return result;
});
exports.CategoryService = {
    createCategory,
    getAllCategory,
    getSingleCategoryBySlug,
    deleteCategoryById,
    updateCategoryBySlug,
};
