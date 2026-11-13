"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const auth_service_1 = require("./auth.service");
const jose = __importStar(require("jose"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const user_model_1 = require("../user/user.model");
const seedHelper_1 = require("../../../helper/seedHelper");
const ownerBypassHelper_1 = require("../../../helper/ownerBypassHelper");
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield auth_service_1.AuthService.loginUser(email, password);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const forgetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield auth_service_1.AuthService.forgetPassword(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token, newPassword } = req.body;
    const result = yield auth_service_1.AuthService.resetPassword(email, token, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const changePass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = yield res.locals.email;
    const payload = yield req.body;
    const result = yield auth_service_1.AuthService.changePass(payload, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Changed successfully !",
        data: result,
    });
}));
const checkUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield auth_service_1.AuthService.checkUser(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const loginBursar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield auth_service_1.AuthService.loginBursar(email, password);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const loginAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield auth_service_1.AuthService.loginAdmin(email, password);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const createAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield req.body;
    const result = yield auth_service_1.AuthService.createAdmin(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Admin found successfully !",
        data: result,
    });
}));
const verifyUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const result = yield auth_service_1.AuthService.verifyUser({ email });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User found successfully !",
        data: result,
    });
}));
const createDonar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = yield req.body, { password } = _a, donarData = __rest(_a, ["password"]);
    const result = yield auth_service_1.AuthService.createDonar(donarData, {
        password,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donar created Successfully",
        data: result,
    });
}));
const getDemoStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownerToken = (0, ownerBypassHelper_1.extractOwnerBypassToken)(req);
    const ownerBypassActive = yield (0, ownerBypassHelper_1.verifyOwnerBypassToken)(ownerToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Demo status fetched successfully",
        data: {
            demoMode: config_1.default.demoMode,
            ownerBypassActive,
            ownerUnlockConfigured: Boolean(config_1.default.ownerBypassKey),
            resetIntervalMinutes: config_1.default.demoResetIntervalMinutes,
        },
    });
}));
const ownerUnlock = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!config_1.default.ownerBypassKey) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Owner unlock key is not configured on this server");
    }
    const clientIp = (0, ownerBypassHelper_1.getClientIp)(req);
    (0, ownerBypassHelper_1.checkOwnerUnlockRateLimit)(clientIp);
    const { passkey } = req.body;
    if (!(0, ownerBypassHelper_1.verifyOwnerPasskey)(String(passkey || ""))) {
        (0, ownerBypassHelper_1.recordFailedOwnerUnlock)(clientIp);
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid owner passkey");
    }
    (0, ownerBypassHelper_1.clearOwnerUnlockFailures)(clientIp);
    const { token, expiresInSeconds } = yield (0, ownerBypassHelper_1.issueOwnerBypassToken)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Owner Mode unlocked for this browser session",
        data: {
            ownerBypassToken: token,
            expiresInSeconds,
        },
    });
}));
const requireAdminBearer = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const bearer = req.headers["authorization"];
    const jwtToken = typeof bearer === "string" && bearer.startsWith("Bearer ")
        ? bearer.split(" ")[1]
        : "";
    if (!jwtToken) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const secret = new TextEncoder().encode(config_1.default.jwt_secret);
    const { payload } = yield jose.jwtVerify(jwtToken, secret);
    const email = payload.email;
    const caller = email ? yield user_model_1.User.findOne({ email }).lean() : null;
    if (!caller || caller.role !== "admin") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: Admin access required");
    }
    return caller;
});
const demoReset = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownerToken = (0, ownerBypassHelper_1.extractOwnerBypassToken)(req);
    const hasOwnerBypass = yield (0, ownerBypassHelper_1.verifyOwnerBypassToken)(ownerToken);
    const hasCronBypass = (0, ownerBypassHelper_1.verifyCronSecret)(req);
    if (!hasOwnerBypass && !hasCronBypass) {
        if (config_1.default.demoMode) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Demo Mode: Manual database reset requires Owner Mode unlock.");
        }
        yield requireAdminBearer(req);
    }
    const resetSummary = yield (0, seedHelper_1.resetDatabaseToSeed)({ silent: true });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Demo database restored to clean seed snapshot",
        data: {
            resetAt: new Date().toISOString(),
            removedUploadsCount: resetSummary.removedUploadsCount,
            freedBytes: resetSummary.freedBytes,
        },
    });
}));
const cleanupUploads = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g;
    const ownerToken = (0, ownerBypassHelper_1.extractOwnerBypassToken)(req);
    const hasOwnerBypass = yield (0, ownerBypassHelper_1.verifyOwnerBypassToken)(ownerToken);
    const hasCronBypass = (0, ownerBypassHelper_1.verifyCronSecret)(req);
    if (!hasCronBypass) {
        if (config_1.default.demoMode && !hasOwnerBypass) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Demo Mode: Storage cleanup requires Owner Mode unlock or Reset Demo DB.");
        }
        yield requireAdminBearer(req);
    }
    const rawMinAgeHours = (_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.minAgeHours) !== null && _c !== void 0 ? _c : (_d = req.query) === null || _d === void 0 ? void 0 : _d.minAgeHours;
    const parsedHours = Number(rawMinAgeHours);
    const minAgeHours = rawMinAgeHours !== undefined && Number.isFinite(parsedHours)
        ? Math.min(8760, Math.max(0, parsedHours))
        : 24;
    const dryRun = ((_e = req.body) === null || _e === void 0 ? void 0 : _e.dryRun) === true ||
        ((_f = req.body) === null || _f === void 0 ? void 0 : _f.dryRun) === "true" ||
        ((_g = req.query) === null || _g === void 0 ? void 0 : _g.dryRun) === "true";
    const result = yield (0, seedHelper_1.sweepOrphanedLiveUploads)({
        minAgeMs: minAgeHours * 60 * 60 * 1000,
        dryRun,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: dryRun
            ? `Dry run complete: found ${result.removedUploadsCount} unreferenced upload(s)`
            : `Cleaned ${result.removedUploadsCount} unreferenced upload(s)`,
        data: Object.assign({ cleanedAt: new Date().toISOString(), minAgeHours }, result),
    });
}));
exports.AuthController = {
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
