import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { OrderService } from "./order.services";
import { IOrder } from "./order.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { orderFilterableFields } from "./order.constants";
import jwt from "jsonwebtoken";
const createOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = await req.body;
    const currentUser = res.locals.user;
    const result = await OrderService.createOrder(payload, currentUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order created Successfully",
      data: result,
    });
  }
);

const getAllOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, orderFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await OrderService.getAllOrder(filters, paginationOptions);
    sendResponse<IOrder[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const getAllDonarOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const filters = pick(req.query, orderFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await OrderService.getAllDonarOrder(
      filters,
      paginationOptions,
      email
    );
    sendResponse<IOrder[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const getAllBursarOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const filters = pick(req.query, orderFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await OrderService.getAllBursarOrder(
      filters,
      paginationOptions,
      email
    );
    sendResponse<IOrder[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const getSingleOrderById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const currentUser = res.locals.user;
    const result = await OrderService.getSingleOrderById(id, currentUser);
    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  }
);

const updateOrderStatusById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = await req.body;
    const id = await req.params.id;
    const email = res.locals.email;
    const result = await OrderService.updateOrderStatusById(id, email, payload);
    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order updated successfully",
      data: result,
    });
  }
);
const updateOrderPaymentById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = await req.body;
    const id = await req.params.id;
    const email = res.locals.email;
    const result = await OrderService.updateOrderPaymentById(
      id,
      email,
      payload
    );
    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order updated successfully",
      data: result,
    });
  }
);
const deleteOrderById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await OrderService.deleteOrderById(id);
    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order deleted",
      data: result,
    });
  }
);

export const OrderController = {
  createOrder,
  getAllOrder,
  getSingleOrderById,
  deleteOrderById,
  updateOrderStatusById,
  getAllDonarOrder,
  getAllBursarOrder,
  updateOrderPaymentById,
};
