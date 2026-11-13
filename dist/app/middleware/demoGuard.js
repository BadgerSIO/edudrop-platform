"use strict";
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
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const ownerBypassHelper_1 = require("../../helper/ownerBypassHelper");
const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const SAFE_SANDBOX_MUTATIONS = [
    // Authentication, owner unlock & read-only POST lookups
    { method: "POST", pattern: /^\/auth\/login$/ },
    { method: "POST", pattern: /^\/auth\/login-bursar$/ },
    { method: "POST", pattern: /^\/auth\/admin-login$/ },
    { method: "POST", pattern: /^\/auth\/signup$/ },
    { method: "POST", pattern: /^\/auth\/checkuser$/ },
    { method: "POST", pattern: /^\/auth\/owner-unlock$/ },
    { method: "POST", pattern: /^\/product\/productsBySlugs$/ },
    // Sandbox checkout & delivery status progression
    { method: "POST", pattern: /^\/order\/create$/ },
    { method: "PATCH", pattern: /^\/order\/status\/[^/]+$/ },
    { method: "PATCH", pattern: /^\/order\/payment-update\/[^/]+$/ },
    // Contact forms & inbox read/replied toggles
    { method: "POST", pattern: /^\/submissions\/create$/ },
    { method: "POST", pattern: /^\/school-inbox\/create$/ },
    { method: "PATCH", pattern: /^\/submissions\/[^/]+$/ },
    { method: "PATCH", pattern: /^\/school-inbox\/[^/]+$/ },
    // Notification bell interactions
    { method: "PATCH", pattern: /^\/notification\/mark-all-read$/ },
    { method: "PATCH", pattern: /^\/notification\/[^/]+$/ },
    { method: "DELETE", pattern: /^\/notification\/[^/]+$/ },
];
const DEMO_MESSAGES = {
    accountLock: "Demo Mode: Account credentials and user statuses are locked so all visitors can access the demo accounts.",
    mediaLock: "Demo Mode: Image uploads and profile edits are disabled on the live showcase to keep media clean.",
    catalogLock: "Demo Mode: Creating, editing, or deleting core schools and catalog data is disabled in the public demo.",
    resetLock: "Demo Mode: Manual database reset requires Owner Mode unlock.",
};
function resolveBlockedDemoMessage(method, path) {
    if (path === "/auth/demo-reset") {
        return DEMO_MESSAGES.resetLock;
    }
    if (path.startsWith("/auth/") ||
        path.startsWith("/user") ||
        path.startsWith("/donar/status-update") ||
        (method === "DELETE" &&
            (path.startsWith("/donar") ||
                path.startsWith("/bursar") ||
                path.startsWith("/edudrop-admin")))) {
        return DEMO_MESSAGES.accountLock;
    }
    if (path.endsWith("/upload-image") ||
        path.endsWith("/upload") ||
        ((method === "PATCH" || method === "PUT") &&
            (path.startsWith("/bursar") || path.startsWith("/donar")))) {
        return DEMO_MESSAGES.mediaLock;
    }
    return DEMO_MESSAGES.catalogLock;
}
/**
 * Protects public portfolio deployments by blocking destructive mutations,
 * arbitrary file uploads, and credential/status modifications while allowing
 * safe sandbox flows or authenticated Owner Mode bypass sessions.
 */
const demoGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!config_1.default.demoMode) {
        return next();
    }
    const method = req.method.toUpperCase();
    if (READ_ONLY_METHODS.has(method)) {
        return next();
    }
    const ownerToken = (0, ownerBypassHelper_1.extractOwnerBypassToken)(req);
    if (yield (0, ownerBypassHelper_1.verifyOwnerBypassToken)(ownerToken)) {
        res.locals.ownerBypass = true;
        return next();
    }
    const normalizedPath = req.path.replace(/\/+$/, "") || "/";
    if (method === "POST" &&
        normalizedPath === "/auth/demo-reset" &&
        (0, ownerBypassHelper_1.verifyCronSecret)(req)) {
        res.locals.cronBypass = true;
        return next();
    }
    const isAllowed = SAFE_SANDBOX_MUTATIONS.some((rule) => rule.method === method && rule.pattern.test(normalizedPath));
    if (isAllowed) {
        return next();
    }
    const message = resolveBlockedDemoMessage(method, normalizedPath);
    return next(new ApiError_1.default(http_status_1.default.FORBIDDEN, message));
});
exports.default = demoGuard;
