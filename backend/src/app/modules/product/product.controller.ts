import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ProductService } from "./product.services";
import { IProduct } from "./product.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { productFilterableFields } from "./product.constants";
import { Product } from "./product.model";
import {
  cleanupUnsavedTemporaryUpload,
  safeUnlinkMulterFile,
} from "../../../helper/mediaCleanupHelper";

const uploadImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No image file uploaded",
        data: null,
      });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    const previousTemporaryUrl = req.body?.previousTemporaryUrl;
    if (previousTemporaryUrl && previousTemporaryUrl !== imageUrl) {
      await cleanupUnsavedTemporaryUpload(
        previousTemporaryUrl,
        "products",
        async (url) => {
          const exists = await Product.exists({ productImage: url });
          return Boolean(exists);
        }
      );
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  }
);

const createProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = { ...req.body };
    if (req.file) {
      payload.productImage = `/uploads/products/${req.file.filename}`;
    }
    try {
      const result = await ProductService.createProduct(payload);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product created successfully",
        data: result,
      });
    } catch (error) {
      await safeUnlinkMulterFile(req.file, "products");
      throw error;
    }
  }
);

const productsBySlugs: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = await req.body;
    const result = await ProductService.productsBySlugs(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  }
);

const getAllProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await ProductService.getAllProduct(
      filters,
      paginationOptions
    );
    sendResponse<IProduct[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAllProductOptimized: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await ProductService.getAllProductOptimized(
      filters,
      paginationOptions
    );
    sendResponse<IProduct[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getProductBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await ProductService.getProductBySlug(slug);
    sendResponse<IProduct>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  }
);

const getSingleProductBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await ProductService.getSingleProductBySlug(slug);
    sendResponse<IProduct>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  }
);

const updateProductById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = { ...req.body };
    if (req.file) {
      payload.productImage = `/uploads/products/${req.file.filename}`;
    }
    try {
      const result = await ProductService.updateProductById(id, payload);
      sendResponse<IProduct>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product updated successfully",
        data: result,
      });
    } catch (error) {
      await safeUnlinkMulterFile(req.file, "products");
      throw error;
    }
  }
);

const updateProductStatusByIdOrSlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const identifier = req.params.id || req.params.slug;
    const result = await ProductService.updateProductStatusByIdOrSlug(identifier);
    sendResponse<IProduct>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product status updated successfully",
      data: result,
    });
  }
);

const deleteProductById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await ProductService.deleteProductById(id);
    sendResponse<IProduct>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  }
);

export const ProductController = {
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
