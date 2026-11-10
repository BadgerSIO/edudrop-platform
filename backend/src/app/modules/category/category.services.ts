import { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { categorySearchableFields } from "./category.constants";
import { ICategory, ICategoryFilters } from "./category.interface";
import { Category } from "./category.model";
import { Product } from "../product/product.model";

const createCategory = async (
  payload: ICategory
): Promise<ICategory | null> => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategory = async (
  filters: ICategoryFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<ICategory[]>> => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions = [];
  if (searchTerms) {
    andConditions.push({
      $or: categorySearchableFields.map((field) => ({
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

  const categories = await Category.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);

  const categoryIds = categories.map((c) => c._id);
  const counts = await Product.aggregate([
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

  const countMap = new Map<string, number>();
  counts.forEach((c: any) => countMap.set(c._id.toString(), c.count));

  const data: ICategory[] = categories.map((cat) => {
    const obj = cat.toObject();
    return {
      ...obj,
      productCount: countMap.get(cat._id.toString()) || 0,
    };
  });

  const total = await Category.countDocuments(whereCondition);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data,
  };
};

const getSingleCategoryBySlug = async (
  slug: string
): Promise<ICategory | null> => {
  const result = await Category.findOne({ slug });
  if (result) {
    const productCount = await Product.countDocuments({
      category: result._id,
      isDeleted: { $ne: true },
    });
    const obj = result.toObject();
    return {
      ...obj,
      productCount,
    };
  }
  return result;
};

const updateCategoryBySlug = async (
  slug: string,
  payload: Partial<ICategory>
): Promise<ICategory | null> => {
  const existingCategory = await Category.findOne({ slug });

  if (!existingCategory) {
    throw new Error("Category not found");
  }
  const result = await Category.findOneAndUpdate({ slug }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteCategoryById = async (id: string): Promise<ICategory | null> => {
  const productCount = await Product.countDocuments({
    category: id,
    isDeleted: { $ne: true },
  });

  if (productCount > 0) {
    throw new Error(
      `Cannot delete category: ${productCount} active products are currently assigned to this category. Please reassign or delete these products first.`
    );
  }

  const result = await Category.findByIdAndDelete(id);
  return result as unknown as ICategory | null;
};

export const CategoryService = {
  createCategory,
  getAllCategory,
  getSingleCategoryBySlug,
  deleteCategoryById,
  updateCategoryBySlug,
};
