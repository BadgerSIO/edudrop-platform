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

async function bootstrap() {
  try {
    await mongoose.connect(config.databaseUrl as string);
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

    server = app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
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
    console.log("Error during bootstrap:", error);
  }
}

bootstrap();
