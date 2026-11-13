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
exports.verifyOwnerBypassToken = exports.issueOwnerBypassToken = exports.verifyCronSecret = exports.extractCronSecret = exports.verifyOwnerPasskey = exports.clearOwnerUnlockFailures = exports.recordFailedOwnerUnlock = exports.checkOwnerUnlockRateLimit = exports.getClientIp = exports.extractOwnerBypassToken = exports.CRON_SECRET_HEADER = exports.OWNER_BYPASS_HEADER = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jose = __importStar(require("jose"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../error/ApiError"));
exports.OWNER_BYPASS_HEADER = "x-edudrop-owner-token";
exports.CRON_SECRET_HEADER = "x-cron-secret";
const OWNER_BYPASS_EXPIRY_SECONDS = 4 * 60 * 60; // 4 hours
const OWNER_TOKEN_TYPE = "edudrop-owner-bypass";
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map();
function sha256(value) {
    return crypto_1.default.createHash("sha256").update(value, "utf8").digest();
}
function extractOwnerBypassToken(req) {
    var _a;
    const raw = req.headers[exports.OWNER_BYPASS_HEADER];
    if (Array.isArray(raw))
        return ((_a = raw[0]) === null || _a === void 0 ? void 0 : _a.trim()) || undefined;
    return typeof raw === "string" ? raw.trim() || undefined : undefined;
}
exports.extractOwnerBypassToken = extractOwnerBypassToken;
function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
}
exports.getClientIp = getClientIp;
function checkOwnerUnlockRateLimit(ip) {
    const record = failedAttempts.get(ip);
    if (!record)
        return;
    if (Date.now() - record.windowStart > RATE_LIMIT_WINDOW_MS) {
        failedAttempts.delete(ip);
        return;
    }
    if (record.count >= MAX_FAILED_ATTEMPTS) {
        throw new ApiError_1.default(http_status_1.default.TOO_MANY_REQUESTS, "Too many failed unlock attempts. Please try again in 15 minutes.");
    }
}
exports.checkOwnerUnlockRateLimit = checkOwnerUnlockRateLimit;
function recordFailedOwnerUnlock(ip) {
    if (failedAttempts.size > 1000) {
        failedAttempts.clear();
    }
    const now = Date.now();
    const existing = failedAttempts.get(ip);
    if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
        failedAttempts.set(ip, { count: 1, windowStart: now });
        return;
    }
    existing.count += 1;
}
exports.recordFailedOwnerUnlock = recordFailedOwnerUnlock;
function clearOwnerUnlockFailures(ip) {
    failedAttempts.delete(ip);
}
exports.clearOwnerUnlockFailures = clearOwnerUnlockFailures;
function verifyOwnerPasskey(input) {
    const configured = config_1.default.ownerBypassKey;
    if (!configured || !input)
        return false;
    return crypto_1.default.timingSafeEqual(sha256(input), sha256(configured));
}
exports.verifyOwnerPasskey = verifyOwnerPasskey;
function extractCronSecret(req) {
    var _a;
    const headerVal = req.headers[exports.CRON_SECRET_HEADER];
    if (Array.isArray(headerVal) && ((_a = headerVal[0]) === null || _a === void 0 ? void 0 : _a.trim())) {
        return headerVal[0].trim();
    }
    if (typeof headerVal === "string" && headerVal.trim()) {
        return headerVal.trim();
    }
    const authHeader = req.headers["authorization"];
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.slice("Bearer ".length).trim() || undefined;
    }
    return undefined;
}
exports.extractCronSecret = extractCronSecret;
function verifyCronSecret(req) {
    const configured = config_1.default.cronSecret;
    const provided = extractCronSecret(req);
    if (!configured || !provided)
        return false;
    return crypto_1.default.timingSafeEqual(sha256(provided), sha256(configured));
}
exports.verifyCronSecret = verifyCronSecret;
function issueOwnerBypassToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.default.jwt_secret) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "JWT secret is not configured");
        }
        const secret = new TextEncoder().encode(config_1.default.jwt_secret);
        const token = yield new jose.SignJWT({
            ownerBypass: true,
            typ: OWNER_TOKEN_TYPE,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(`${OWNER_BYPASS_EXPIRY_SECONDS}s`)
            .sign(secret);
        return { token, expiresInSeconds: OWNER_BYPASS_EXPIRY_SECONDS };
    });
}
exports.issueOwnerBypassToken = issueOwnerBypassToken;
function verifyOwnerBypassToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!token || !config_1.default.ownerBypassKey || !config_1.default.jwt_secret) {
            return false;
        }
        try {
            const secret = new TextEncoder().encode(config_1.default.jwt_secret);
            const { payload } = yield jose.jwtVerify(token, secret);
            return (payload.ownerBypass === true && payload.typ === OWNER_TOKEN_TYPE);
        }
        catch (_a) {
            return false;
        }
    });
}
exports.verifyOwnerBypassToken = verifyOwnerBypassToken;
