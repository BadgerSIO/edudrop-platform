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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOptionalJWT = void 0;
const jose = __importStar(require("jose"));
const config_1 = __importDefault(require("../../config"));
const user_model_1 = require("../modules/user/user.model");
const resolveVerifiedUser = (bearerToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return { error: "Unauthorized: Bearer token required" };
    }
    const token = bearerToken.split(" ")[1];
    if (!token) {
        return { error: "Unauthorized: Token not found" };
    }
    const secret = new TextEncoder().encode(config_1.default.jwt_secret);
    const { payload } = yield jose.jwtVerify(token, secret);
    const email = payload.email;
    if (!email) {
        return { error: "Unauthorized: Invalid token payload" };
    }
    const user = yield user_model_1.User.findOne({ email }).lean();
    if (!user) {
        return { error: "Unauthorized: User not found" };
    }
    return { email, user };
});
const verifyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resolved = yield resolveVerifiedUser(req.headers["authorization"]);
        if ("error" in resolved) {
            return res.status(401).json({ success: false, message: resolved.error });
        }
        res.locals.email = resolved.email;
        res.locals.user = resolved.user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }
});
const verifyOptionalJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerToken = req.headers["authorization"];
        if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
            return next();
        }
        const resolved = yield resolveVerifiedUser(bearerToken);
        if (!("error" in resolved)) {
            res.locals.email = resolved.email;
            res.locals.user = resolved.user;
        }
    }
    catch (_a) {
        // Non-fatal on optional auth routes: proceed as unauthenticated guest
    }
    next();
});
exports.verifyOptionalJWT = verifyOptionalJWT;
exports.default = verifyJWT;
