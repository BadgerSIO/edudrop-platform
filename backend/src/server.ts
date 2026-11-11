import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import {
  DEFAULT_ORPHAN_GRACE_MS,
  resetDatabaseToSeed,
  sweepOrphanedLiveUploads,
} from "./helper/seedHelper";

let server: Server;
let demoResetTimer: NodeJS.Timeout | null = null;
let orphanCleanupTimer: NodeJS.Timeout | null = null;
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
    } else {
      process.exit(1);
    }
  }
});

function validateStartupConfig() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (
    !config.jwt_secret ||
    (config.env === "production" &&
      (config.jwt_secret === "change-me" || config.jwt_secret.length < 16))
  ) {
    throw new Error(
      "JWT_SECRET must be configured with at least 16 characters (and not 'change-me') in production"
    );
  }

  if (
    config.env === "production" &&
    config.corsOrigins.length === 0 &&
    !config.allowVercelPreviews
  ) {
    console.warn(
      "[Config Warning] FRONTEND/CORS_ORIGINS is empty in production; browser CORS requests will be rejected unless ALLOW_VERCEL_PREVIEWS=true."
    );
  }
}

async function bootstrap() {
  try {
    validateStartupConfig();
    await mongoose.connect(config.databaseUrl as string, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("Database connected");

    if (config.demoMode) {
      const initSummary = await resetDatabaseToSeed({ silent: true });
      console.log(
        `Demo Mode enabled: seeded clean baseline (auto-reset every ${config.demoResetIntervalMinutes}m${
          initSummary.removedUploadsCount > 0
            ? `, purged ${initSummary.removedUploadsCount} orphaned upload(s)`
            : ""
        })`
      );

      const intervalMs = config.demoResetIntervalMinutes * 60 * 1000;
      demoResetTimer = setInterval(() => {
        resetDatabaseToSeed({ silent: true })
          .then((summary) => {
            console.log(
              `[Demo Mode] Auto-reset completed at ${new Date().toISOString()}${
                summary.removedUploadsCount > 0
                  ? ` (purged ${summary.removedUploadsCount} orphaned upload(s))`
                  : ""
              }`
            );
          })
          .catch((err) => {
            console.error("[Demo Mode] Auto-reset failed:", err);
          });
      }, intervalMs);
      demoResetTimer.unref();
    } else {
      orphanCleanupTimer = setInterval(() => {
        sweepOrphanedLiveUploads({ minAgeMs: DEFAULT_ORPHAN_GRACE_MS })
          .then((summary) => {
            if (summary.removedUploadsCount > 0) {
              console.log(
                `[Storage GC] Swept ${summary.removedUploadsCount} orphaned upload(s) (${Math.round(summary.freedBytes / 1024)} KB)`
              );
            }
          })
          .catch((err) => {
            console.error("[Storage GC] Periodic sweep failed:", err);
          });
      }, DEFAULT_ORPHAN_GRACE_MS);
      orphanCleanupTimer.unref();
    }

    const port = config.port || 5000;
    server = app.listen(port, () => {
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
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

bootstrap();
