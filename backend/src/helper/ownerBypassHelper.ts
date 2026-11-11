import crypto from "crypto";
import { Request } from "express";
import * as jose from "jose";
import httpStatus from "http-status";
import config from "../config";
import ApiError from "../error/ApiError";

export const OWNER_BYPASS_HEADER = "x-edudrop-owner-token";
export const CRON_SECRET_HEADER = "x-cron-secret";
const OWNER_BYPASS_EXPIRY_SECONDS = 4 * 60 * 60; // 4 hours
const OWNER_TOKEN_TYPE = "edudrop-owner-bypass";

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

interface FailureRecord {
  count: number;
  windowStart: number;
}

const failedAttempts = new Map<string, FailureRecord>();

function sha256(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

export function extractOwnerBypassToken(req: Request): string | undefined {
  const raw = req.headers[OWNER_BYPASS_HEADER];
  if (Array.isArray(raw)) return raw[0]?.trim() || undefined;
  return typeof raw === "string" ? raw.trim() || undefined : undefined;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function checkOwnerUnlockRateLimit(ip: string): void {
  const record = failedAttempts.get(ip);
  if (!record) return;

  if (Date.now() - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    failedAttempts.delete(ip);
    return;
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      "Too many failed unlock attempts. Please try again in 15 minutes."
    );
  }
}

export function recordFailedOwnerUnlock(ip: string): void {
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

export function clearOwnerUnlockFailures(ip: string): void {
  failedAttempts.delete(ip);
}

export function verifyOwnerPasskey(input: string): boolean {
  const configured = config.ownerBypassKey;
  if (!configured || !input) return false;
  return crypto.timingSafeEqual(sha256(input), sha256(configured));
}

export function extractCronSecret(req: Request): string | undefined {
  const headerVal = req.headers[CRON_SECRET_HEADER];
  if (Array.isArray(headerVal) && headerVal[0]?.trim()) {
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

export function verifyCronSecret(req: Request): boolean {
  const configured = config.cronSecret;
  const provided = extractCronSecret(req);
  if (!configured || !provided) return false;
  return crypto.timingSafeEqual(sha256(provided), sha256(configured));
}

export async function issueOwnerBypassToken(): Promise<{
  token: string;
  expiresInSeconds: number;
}> {
  if (!config.jwt_secret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "JWT secret is not configured"
    );
  }

  const secret = new TextEncoder().encode(config.jwt_secret);
  const token = await new jose.SignJWT({
    ownerBypass: true,
    typ: OWNER_TOKEN_TYPE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${OWNER_BYPASS_EXPIRY_SECONDS}s`)
    .sign(secret);

  return { token, expiresInSeconds: OWNER_BYPASS_EXPIRY_SECONDS };
}

export async function verifyOwnerBypassToken(
  token?: string | null
): Promise<boolean> {
  if (!token || !config.ownerBypassKey || !config.jwt_secret) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(config.jwt_secret);
    const { payload } = await jose.jwtVerify(token, secret);
    return (
      payload.ownerBypass === true && payload.typ === OWNER_TOKEN_TYPE
    );
  } catch {
    return false;
  }
}
