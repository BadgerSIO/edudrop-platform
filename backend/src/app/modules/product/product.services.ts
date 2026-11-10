import { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { productSearchableFields } from "./product.constants";
import { IProduct, IProductFilters } from "./product.interface";
import { Product } from "./product.model";
import path from "path";
import fs from "fs";
import { slugify } from "../../../helper/slugify";

const safeUnlink = async (relativePath: string) => {
  try {
    if (!relativePath || relativePath.startsWith("http")) return;
    const cleanPath = relativePath.startsWith("/")
      ? relativePath.slice(1)
      : relativePath;
    const fullPath = path.join(process.cwd(), cleanPath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (err) {
    console.error("Failed to delete product file:", relativePath, err);
  }
};

const generateUniqueSlug = async (
  baseSlug: string,
  currentId?: string
): Promise<string> => {
  let slug = slugify(baseSlug);
  let counter = 1;
  while (true) {
    const query: any = { slug, isDeleted: { $ne: true } };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Product.findOne(query);
    if (!existing) {
      return slug;
    }
    slug = `${slugify(baseSlug)}-${counter}`;
    counter++;
  }
};

const normalizeProductPayload = (payload: any) => {
  const normalized = { ...payload };

  // Parse arrays if sent as bracket notation (e.g. from FormData: benefits[0], benefits[1])
  if (!normalized.benefits || !Array.isArray(normalized.benefits)) {
    const benefitsList: string[] = [];
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
    const detailsList: string[] = [];
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
      .map((b: any) => String(b).trim())
      .filter(Boolean);
  }
  if (Array.isArray(normalized.productDetails)) {
    normalized.productDetails = normalized.productDetails
      .map((d: any) => String(d).trim())
      .filter(Boolean);
  }

  // Convert numeric strings
  if (normalized.price !== undefined && normalized.price !== "") {
    normalized.price = Number(normalized.price);
  }
  if (normalized.salePrice !== undefined && normalized.salePrice !== "") {
    normalized.salePrice = Number(normalized.salePrice);
  } else if (normalized.salePrice === "") {
    normalized.salePrice = undefined;
  }
  if (
    normalized.quantityPerCase !== undefined &&
    normalized.quantityPerCase !== ""
  ) {
    normalized.quantityPerCase = Number(normalized.quantityPerCase);
  }
  if (normalized.refillPrice !== undefined && normalized.refillPrice !== "") {
    normalized.refillPrice = Number(normalized.refillPrice);
  }
  if (
    normalized.stockQuantity !== undefined &&
    normalized.stockQuantity !== ""
  ) {
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
  } else if (normalized.active !== undefined) {
    normalized.status = normalized.active ? "active" : "draft";
  }

  return normalized;
};

const createProduct = async (rawPayload: IProduct): Promise<IProduct | null> => {
  const payload = normalizeProductPayload(rawPayload);
  const baseSlug = payload.slug || payload.title;
  payload.slug = await generateUniqueSlug(baseSlug);

  if (payload.active === undefined) {
    payload.active = true;
  }
  if (!payload.status) {
    payload.status = payload.active ? "active" : "draft";
  }
  payload.isDeleted = false;

  const result = await Product.create(payload);
  return result;
};

const productsBySlugs = async (
  payload: string[]
): Promise<IProduct[] | null> => {
  const result = await Product.find({
    slug: { $in: payload },
    isDeleted: { $ne: true },
  });
  return result;
};

const getAllProduct = async (
  filters: IProductFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IProduct[]>> => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions: any[] = [{ isDeleted: { $ne: true } }];

  if (searchTerms) {
    andConditions.push({
      $or: productSearchableFields.map((field) => ({
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
          return { [fields]: value === "true" || (value as any) === true };
        }
        return { [fields]: value };
      }),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  } else {
    sortCondition["createdAt"] = "desc";
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Product.find(whereCondition)
    .populate("category")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(whereCondition);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getAllProductOptimized = async (
  filters: IProductFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IProduct[]>> => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions: any[] = [
    { isDeleted: { $ne: true } },
    { active: { $ne: false } },
    { status: { $nin: ["draft", "archived"] } },
  ];

  if (searchTerms) {
    andConditions.push({
      $or: productSearchableFields.map((field) => ({
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
          return { [fields]: value === "true" || (value as any) === true };
        }
        return { [fields]: value };
      }),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Product.find(whereCondition)
    .select(
      "title price sale salePrice productImage category slug description packagingType stockQuantity refillPrice quantityPerCase"
    )
    .populate("category")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(whereCondition);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getProductBySlug = async (slug: string): Promise<IProduct | null> => {
  const result = await Product.findOne({
    slug,
    isDeleted: { $ne: true },
    active: { $ne: false },
    status: { $nin: ["draft", "archived"] },
  })
    .select("-active")
    .populate("category");
  return result;
};

const getSingleProductBySlug = async (
  slug: string
): Promise<IProduct | null> => {
  const result = await Product.findOne({
    slug,
    isDeleted: { $ne: true },
  }).populate("category");
  return result;
};

const updateProductById = async (
  id: string,
  rawPayload: Partial<IProduct>
): Promise<IProduct | null> => {
  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const payload = normalizeProductPayload(rawPayload);

  // If slug is changing or title changed, ensure unique slug
  if (payload.slug && payload.slug !== existingProduct.slug) {
    payload.slug = await generateUniqueSlug(payload.slug, id);
  } else if (
    !payload.slug &&
    payload.title &&
    payload.title !== existingProduct.title
  ) {
    payload.slug = await generateUniqueSlug(payload.title, id);
  }

  // If a new image is provided, delete the old image asynchronously
  if (
    payload.productImage &&
    payload.productImage !== existingProduct.productImage &&
    existingProduct.productImage
  ) {
    await safeUnlink(existingProduct.productImage);
  }

  const fieldsToUpdate: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      fieldsToUpdate[key] = value;
    }
  }

  const result = await Product.findByIdAndUpdate(
    id,
    { $set: fieldsToUpdate },
    {
      new: true,
      runValidators: true,
    }
  ).populate("category");

  return result;
};

const updateProductStatusByIdOrSlug = async (
  identifier: string
): Promise<IProduct | null> => {
  const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const existingProduct = await Product.findOne(query);

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const newActive = !existingProduct.active;
  const newStatus = newActive ? "active" : "draft";

  const result = await Product.findOneAndUpdate(
    query,
    { active: newActive, status: newStatus },
    {
      new: true,
      runValidators: true,
    }
  );
  return result;
};

const deleteProductById = async (id: string): Promise<IProduct | null> => {
  // Soft delete: mark as archived and isDeleted: true
  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true, status: "archived", active: false },
    { new: true }
  );
  return result;
};

export const ProductService = {
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
