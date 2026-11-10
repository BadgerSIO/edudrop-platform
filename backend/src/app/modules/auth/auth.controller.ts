import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";
import jwt from "jsonwebtoken";
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgetPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  const result = await AuthService.resetPassword(email, token, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const changePass = catchAsync(async (req: Request, res: Response) => {
  const email = await res.locals.email;
  const payload = await req.body;
  const result = await AuthService.changePass(payload, email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Changed successfully !",
    data: result,
  });
});
const checkUser = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.checkUser(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const loginBursar = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.loginBursar(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.loginAdmin(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = await req.body;
  const result = await AuthService.createAdmin(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin found successfully !",
    data: result,
  });
});
const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const bearertoken = req.headers["authorization"] as string;
  const token = bearertoken?.split(" ")[1];
  const payload = jwt.decode(token) as { email: string };
  const result = await AuthService.verifyUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User found successfully !",
    data: result,
  });
});
const createDonar: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { password, ...donarData } = await req.body;
    const result = await AuthService.createDonar(donarData, {
      password,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donar created Successfully",
      data: result,
    });
  }
);

export const AuthController = {
  loginUser,
  verifyUser,
  createAdmin,
  loginAdmin,
  createDonar,
  loginBursar,
  checkUser,
  changePass,
  forgetPassword,
  resetPassword,
};
