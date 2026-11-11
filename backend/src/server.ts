import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { resetDatabaseToSeed } from "./helper/seedHelper";

let server: Server;
let demoResetTimer: NodeJS.Timeout | null = null;
let isShuttingDown = false;

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Promise Rejection:", reason);
  // Optionally, you can also log the stack trace for debugging purposes.
  console.log("Promise Stack Trace:", promise);

  if (!isShuttingDown && !String(reason).includes("Duplicate order ID")) {
    // If the server is not already shutting down and the error is not a duplicate order ID,
    // initiate a graceful shutdown.
    isShuttingDown = true;
    if (demoResetTimer) {
      clearInterval(demoResetTimer);
      demoResetTimer = null;
    }
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
      await resetDatabaseToSeed({ silent: true });
      console.log(
        `Demo Mode enabled: seeded clean baseline (auto-reset every ${config.demoResetIntervalMinutes}m)`
      );

      const intervalMs = config.demoResetIntervalMinutes * 60 * 1000;
      demoResetTimer = setInterval(() => {
        resetDatabaseToSeed({ silent: true })
          .then(() => {
            console.log(
              `[Demo Mode] Auto-reset completed at ${new Date().toISOString()}`
            );
          })
          .catch((err) => {
            console.error("[Demo Mode] Auto-reset failed:", err);
          });
      }, intervalMs);
      demoResetTimer.unref();
    }

    const port = config.port || 5000;
    server = app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM IS RECEIVED");
      if (!isShuttingDown) {
        isShuttingDown = true;
        if (demoResetTimer) {
          clearInterval(demoResetTimer);
          demoResetTimer = null;
        }
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
