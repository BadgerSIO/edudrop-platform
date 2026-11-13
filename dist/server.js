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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const seedHelper_1 = require("./helper/seedHelper");
let server;
let demoResetTimer = null;
let orphanCleanupTimer = null;
let isShuttingDown = false;
const clearBackgroundTimers = () => {
    if (demoResetTimer) {
        clearInterval(demoResetTimer);
        demoResetTimer = null;
    }
    if (orphanCleanupTimer) {
        clearInterval(orphanCleanupTimer);
        orphanCleanupTimer = null;
    }
};
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Promise Rejection:", reason);
    // Optionally, you can also log the stack trace for debugging purposes.
    console.log("Promise Stack Trace:", promise);
    if (!isShuttingDown && !String(reason).includes("Duplicate order ID")) {
        // If the server is not already shutting down and the error is not a duplicate order ID,
        // initiate a graceful shutdown.
        isShuttingDown = true;
        clearBackgroundTimers();
        if (server) {
            server.close(() => {
                console.log("Server closed gracefully");
                process.exit(1);
            });
        }
        else {
            process.exit(1);
        }
    }
});
function validateStartupConfig() {
    if (!config_1.default.databaseUrl) {
        throw new Error("DATABASE_URL is required");
    }
    if (!config_1.default.jwt_secret ||
        (config_1.default.env === "production" &&
            (config_1.default.jwt_secret === "change-me" || config_1.default.jwt_secret.length < 16))) {
        throw new Error("JWT_SECRET must be configured with at least 16 characters (and not 'change-me') in production");
    }
    if (config_1.default.env === "production" &&
        config_1.default.corsOrigins.length === 0 &&
        !config_1.default.allowVercelPreviews) {
        console.warn("[Config Warning] FRONTEND/CORS_ORIGINS is empty in production; browser CORS requests will be rejected unless ALLOW_VERCEL_PREVIEWS=true.");
    }
}
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            validateStartupConfig();
            yield mongoose_1.default.connect(config_1.default.databaseUrl, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            console.log("Database connected");
            if (config_1.default.demoMode) {
                const initSummary = yield (0, seedHelper_1.resetDatabaseToSeed)({ silent: true });
                console.log(`Demo Mode enabled: seeded clean baseline (auto-reset every ${config_1.default.demoResetIntervalMinutes}m${initSummary.removedUploadsCount > 0
                    ? `, purged ${initSummary.removedUploadsCount} orphaned upload(s)`
                    : ""})`);
                const intervalMs = config_1.default.demoResetIntervalMinutes * 60 * 1000;
                demoResetTimer = setInterval(() => {
                    (0, seedHelper_1.resetDatabaseToSeed)({ silent: true })
                        .then((summary) => {
                        console.log(`[Demo Mode] Auto-reset completed at ${new Date().toISOString()}${summary.removedUploadsCount > 0
                            ? ` (purged ${summary.removedUploadsCount} orphaned upload(s))`
                            : ""}`);
                    })
                        .catch((err) => {
                        console.error("[Demo Mode] Auto-reset failed:", err);
                    });
                }, intervalMs);
                demoResetTimer.unref();
            }
            else {
                orphanCleanupTimer = setInterval(() => {
                    (0, seedHelper_1.sweepOrphanedLiveUploads)({ minAgeMs: seedHelper_1.DEFAULT_ORPHAN_GRACE_MS })
                        .then((summary) => {
                        if (summary.removedUploadsCount > 0) {
                            console.log(`[Storage GC] Swept ${summary.removedUploadsCount} orphaned upload(s) (${Math.round(summary.freedBytes / 1024)} KB)`);
                        }
                    })
                        .catch((err) => {
                        console.error("[Storage GC] Periodic sweep failed:", err);
                    });
                }, seedHelper_1.DEFAULT_ORPHAN_GRACE_MS);
                orphanCleanupTimer.unref();
            }
            const port = config_1.default.port || 5000;
            server = app_1.default.listen(port, () => {
                console.log(`App listening on port ${port}`);
            });
            process.on("SIGTERM", () => {
                console.log("SIGTERM IS RECEIVED");
                if (!isShuttingDown) {
                    isShuttingDown = true;
                    clearBackgroundTimers();
                    server.close(() => {
                        console.log("Server closed gracefully");
                        process.exit(0);
                    });
                }
            });
        }
        catch (error) {
            console.error("Error during bootstrap:", error);
            process.exit(1);
        }
    });
}
bootstrap();
