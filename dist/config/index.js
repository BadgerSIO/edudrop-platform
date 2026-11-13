"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
const parsedResetMinutes = Number(process.env.DEMO_RESET_INTERVAL_MINUTES);
const resolveDemoMode = () => {
    if (process.env.DEMO_MODE === "true")
        return true;
    if (process.env.DEMO_MODE === "false")
        return false;
    return process.env.NODE_ENV === "production";
};
const parseOriginList = (...rawValues) => {
    const origins = new Set();
    for (const raw of rawValues) {
        if (!raw)
            continue;
        for (const entry of raw.split(",")) {
            const cleaned = entry.trim().replace(/\/+$/, "");
            if (cleaned) {
                origins.add(cleaned);
            }
        }
    }
    return Array.from(origins);
};
exports.default = {
    env: process.env.NODE_ENV,
    frontend: (_a = process.env.FRONTEND) === null || _a === void 0 ? void 0 : _a.trim().replace(/\/+$/, ""),
    corsOrigins: parseOriginList(process.env.FRONTEND, process.env.CORS_ORIGINS),
    allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === "true",
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    bcrypt_salt: process.env.BCRYPT_SALT,
    jwt_secret: process.env.JWT_SECRET,
    demoMode: resolveDemoMode(),
    demoResetIntervalMinutes: Number.isFinite(parsedResetMinutes) && parsedResetMinutes > 0
        ? parsedResetMinutes
        : 30,
    ownerBypassKey: ((_b = process.env.OWNER_BYPASS_KEY) === null || _b === void 0 ? void 0 : _b.trim()) || "",
    cronSecret: ((_c = process.env.CRON_SECRET) === null || _c === void 0 ? void 0 : _c.trim()) || "",
    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.MAIL_FROM || "no-reply@edudrop.org",
    },
};
