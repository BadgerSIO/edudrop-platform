import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { CategoryService } from "./category.services";
import { ICategory } from "./category.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { categoryFilterableFields } from "./category.constants";
import { slugify } from "../../../helper/slugify";

const createCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const category = await req.body;
    let payload;
    if (!category.slug) {
      const slug = await slugify(category.title);
      payload = { slug, ...category };
    } else {
      payload = category;
    }
    const result = await CategoryService.createCategory(payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category created Successfully",
      data: result,
    });
  }
);
const getAllCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CategoryService.getAllCategory(
      filters,
      paginationOptions
    );
    sendResponse<ICategory[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const getSingleCategoryBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await CategoryService.getSingleCategoryBySlug(slug);
    sendResponse<ICategory>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  }
);
const updateCategoryBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const category = req.body;
    const result = await CategoryService.updateCategoryBySlug(slug, category);
    sendResponse<ICategory>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  }
);
const deleteCategoryById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await CategoryService.deleteCategoryById(id);
    sendResponse<ICategory>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category deleted",
      data: result,
    });
  }
);

export const CategoryController = {
  createCategory,
  getAllCategory,
  getSingleCategoryBySlug,
  deleteCategoryById,
  updateCategoryBySlug,
};
