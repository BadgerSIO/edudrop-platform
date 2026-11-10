import { Response } from "express";

type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
    [key: string]: any;
  };
  data: T | null;
  additionalData?: any;
};

const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta || null || undefined,
    data: data.data || null,
    additionalData: data.additionalData || undefined,
  });
};

export default sendResponse;
