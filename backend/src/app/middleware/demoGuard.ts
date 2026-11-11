import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import ApiError from "../../error/ApiError";
import {
  extractOwnerBypassToken,
  verifyCronSecret,
  verifyOwnerBypassToken,
} from "../../helper/ownerBypassHelper";

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const SAFE_SANDBOX_MUTATIONS: Array<{ method: string; pattern: RegExp }> = [
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
  accountLock:
    "Demo Mode: Account credentials and user statuses are locked so all visitors can access the demo accounts.",
  mediaLock:
    "Demo Mode: Image uploads and profile edits are disabled on the live showcase to keep media clean.",
  catalogLock:
    "Demo Mode: Creating, editing, or deleting core schools and catalog data is disabled in the public demo.",
  resetLock:
    "Demo Mode: Manual database reset requires Owner Mode unlock.",
};

function resolveBlockedDemoMessage(method: string, path: string): string {
  if (path === "/auth/demo-reset") {
    return DEMO_MESSAGES.resetLock;
  }

  if (
    path.startsWith("/auth/") ||
    path.startsWith("/user") ||
    path.startsWith("/donar/status-update") ||
    (method === "DELETE" &&
      (path.startsWith("/donar") ||
        path.startsWith("/bursar") ||
        path.startsWith("/edudrop-admin")))
  ) {
    return DEMO_MESSAGES.accountLock;
  }

  if (
    path.endsWith("/upload-image") ||
    path.endsWith("/upload") ||
    ((method === "PATCH" || method === "PUT") &&
      (path.startsWith("/bursar") || path.startsWith("/donar")))
  ) {
    return DEMO_MESSAGES.mediaLock;
  }

  return DEMO_MESSAGES.catalogLock;
}

/**
 * Protects public portfolio deployments by blocking destructive mutations,
 * arbitrary file uploads, and credential/status modifications while allowing
 * safe sandbox flows or authenticated Owner Mode bypass sessions.
 */
const demoGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!config.demoMode) {
    return next();
  }

  const method = req.method.toUpperCase();
  if (READ_ONLY_METHODS.has(method)) {
    return next();
  }

  const ownerToken = extractOwnerBypassToken(req);
  if (await verifyOwnerBypassToken(ownerToken)) {
    res.locals.ownerBypass = true;
    return next();
  }

  const normalizedPath = req.path.replace(/\/+$/, "") || "/";
  if (
    method === "POST" &&
    normalizedPath === "/auth/demo-reset" &&
    verifyCronSecret(req)
  ) {
    res.locals.cronBypass = true;
    return next();
  }

  const isAllowed = SAFE_SANDBOX_MUTATIONS.some(
    (rule) => rule.method === method && rule.pattern.test(normalizedPath)
  );

  if (isAllowed) {
    return next();
  }

  const message = resolveBlockedDemoMessage(method, normalizedPath);
  return next(new ApiError(httpStatus.FORBIDDEN, message));
};

export default demoGuard;
