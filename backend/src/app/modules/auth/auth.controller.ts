import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";
import * as jose from "jose";
import config from "../../../config";
import ApiError from "../../../error/ApiError";
import { User } from "../user/user.model";
import {
  resetDatabaseToSeed,
  sweepOrphanedLiveUploads,
} from "../../../helper/seedHelper";
import {
  checkOwnerUnlockRateLimit,
  clearOwnerUnlockFailures,
  extractOwnerBypassToken,
  getClientIp,
  issueOwnerBypassToken,
  recordFailedOwnerUnlock,
  verifyCronSecret,
  verifyOwnerBypassToken,
  verifyOwnerPasskey,
} from "../../../helper/ownerBypassHelper";
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
  const email = res.locals.email as string;
  const result = await AuthService.verifyUser({ email });
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

const getDemoStatus = catchAsync(async (req: Request, res: Response) => {
  const ownerToken = extractOwnerBypassToken(req);
  const ownerBypassActive = await verifyOwnerBypassToken(ownerToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Demo status fetched successfully",
    data: {
      demoMode: config.demoMode,
      ownerBypassActive,
      ownerUnlockConfigured: Boolean(config.ownerBypassKey),
      resetIntervalMinutes: config.demoResetIntervalMinutes,
    },
  });
});

const ownerUnlock = catchAsync(async (req: Request, res: Response) => {
  if (!config.ownerBypassKey) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Owner unlock key is not configured on this server"
    );
  }

  const clientIp = getClientIp(req);
  checkOwnerUnlockRateLimit(clientIp);

  const { passkey } = req.body;
  if (!verifyOwnerPasskey(String(passkey || ""))) {
    recordFailedOwnerUnlock(clientIp);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid owner passkey");
  }

  clearOwnerUnlockFailures(clientIp);
  const { token, expiresInSeconds } = await issueOwnerBypassToken();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Owner Mode unlocked for this browser session",
    data: {
      ownerBypassToken: token,
      expiresInSeconds,
    },
  });
});

const requireAdminBearer = async (req: Request) => {
  const bearer = req.headers["authorization"];
  const jwtToken =
    typeof bearer === "string" && bearer.startsWith("Bearer ")
      ? bearer.split(" ")[1]
      : "";
  if (!jwtToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const secret = new TextEncoder().encode(config.jwt_secret);
  const { payload } = await jose.jwtVerify(jwtToken, secret);
  const email = payload.email as string;
  const caller = email ? await User.findOne({ email }).lean() : null;
  if (!caller || caller.role !== "admin") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Forbidden: Admin access required"
    );
  }
  return caller;
};

const demoReset = catchAsync(async (req: Request, res: Response) => {
  const ownerToken = extractOwnerBypassToken(req);
  const hasOwnerBypass = await verifyOwnerBypassToken(ownerToken);
  const hasCronBypass = verifyCronSecret(req);

  if (!hasOwnerBypass && !hasCronBypass) {
    if (config.demoMode) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Demo Mode: Manual database reset requires Owner Mode unlock."
      );
    }

    await requireAdminBearer(req);
  }

  const resetSummary = await resetDatabaseToSeed({ silent: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Demo database restored to clean seed snapshot",
    data: {
      resetAt: new Date().toISOString(),
      removedUploadsCount: resetSummary.removedUploadsCount,
      freedBytes: resetSummary.freedBytes,
    },
  });
});

const cleanupUploads = catchAsync(async (req: Request, res: Response) => {
  const ownerToken = extractOwnerBypassToken(req);
  const hasOwnerBypass = await verifyOwnerBypassToken(ownerToken);
  const hasCronBypass = verifyCronSecret(req);

  if (!hasCronBypass) {
    if (config.demoMode && !hasOwnerBypass) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Demo Mode: Storage cleanup requires Owner Mode unlock or Reset Demo DB."
      );
    }
    await requireAdminBearer(req);
  }

  const rawMinAgeHours = req.body?.minAgeHours ?? req.query?.minAgeHours;
  const parsedHours = Number(rawMinAgeHours);
  const minAgeHours =
    rawMinAgeHours !== undefined && Number.isFinite(parsedHours)
      ? Math.min(8760, Math.max(0, parsedHours))
      : 24;
  const dryRun =
    req.body?.dryRun === true ||
    req.body?.dryRun === "true" ||
    req.query?.dryRun === "true";

  const result = await sweepOrphanedLiveUploads({
    minAgeMs: minAgeHours * 60 * 60 * 1000,
    dryRun,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: dryRun
      ? `Dry run complete: found ${result.removedUploadsCount} unreferenced upload(s)`
      : `Cleaned ${result.removedUploadsCount} unreferenced upload(s)`,
    data: {
      cleanedAt: new Date().toISOString(),
      minAgeHours,
      ...result,
    },
  });
});

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
  getDemoStatus,
  ownerUnlock,
  demoReset,
  cleanupUploads,
};
