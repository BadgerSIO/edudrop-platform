"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i;
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        const normalized = origin.trim().replace(/\/+$/, "");
        if (config_1.default.corsOrigins.includes(normalized)) {
            return callback(null, true);
        }
        if (config_1.default.allowVercelPreviews && VERCEL_PREVIEW_ORIGIN.test(normalized)) {
            return callback(null, true);
        }
        if (config_1.default.env !== "production" && LOCAL_DEV_ORIGIN.test(normalized)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-edudrop-owner-token",
        "x-cron-secret",
    ],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const sendHealthResponse = (_req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
    return res.status(dbConnected ? 200 : 503).json({
        success: dbConnected,
        status: dbConnected ? "ok" : "degraded",
        database: dbConnected ? "connected" : "disconnected",
        demoMode: config_1.default.demoMode,
        timestamp: new Date().toISOString(),
    });
};
app.get("/", (req, res) => {
    res.send("EduDrop server running 🥳");
});
app.get("/health", sendHealthResponse);
app.get("/api/v1/health", sendHealthResponse);
app.use("/api/v1", routes_1.default);
// Serve static uploaded media with immutable caching and hardened content headers
const uploadDirectory = path_1.default.join(__dirname, "../uploads");
const staticUploadOptions = {
    maxAge: "365d",
    immutable: true,
    etag: true,
    setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
};
app.use("/uploads/users", express_1.default.static(path_1.default.join(uploadDirectory, "users"), staticUploadOptions));
app.use("/uploads/school", express_1.default.static(path_1.default.join(uploadDirectory, "school"), staticUploadOptions));
app.use("/uploads/products", express_1.default.static(path_1.default.join(uploadDirectory, "products"), staticUploadOptions));
app.use("/uploads/cms", express_1.default.static(path_1.default.join(uploadDirectory, "cms"), staticUploadOptions));
app.use("/uploads", express_1.default.static(uploadDirectory, staticUploadOptions));
//global error handler
app.use(globalErrorHandler_1.default);
exports.default = app;
