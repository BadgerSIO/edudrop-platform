import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";

let server: Server;
let isShuttingDown = false;

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Promise Rejection:", reason);
  // Optionally, you can also log the stack trace for debugging purposes.
  console.log("Promise Stack Trace:", promise);

  if (!isShuttingDown && !String(reason).includes("Duplicate order ID")) {
    // If the server is not already shutting down and the error is not a duplicate order ID,
    // initiate a graceful shutdown.
    isShuttingDown = true;
    server.close(() => {
      console.log("Server closed gracefully");
      process.exit(1);
    });
  }
});

async function bootstrap() {
  try {
    await mongoose.connect(config.databaseUrl as string);
    console.log("Database connected");
    server = app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM IS RECEIVED");
      if (!isShuttingDown) {
        isShuttingDown = true;
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
