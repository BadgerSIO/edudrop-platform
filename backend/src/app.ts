import express, { Application, Request, Response } from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import config from "./config";
import routes from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";

const app: Application = express();

app.set("trust proxy", 1);

const VERCEL_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i;
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalized = origin.trim().replace(/\/+$/, "");
      if (config.corsOrigins.includes(normalized)) {
        return callback(null, true);
      }
      if (config.allowVercelPreviews && VERCEL_PREVIEW_ORIGIN.test(normalized)) {
        return callback(null, true);
      }
      if (config.env !== "production" && LOCAL_DEV_ORIGIN.test(normalized)) {
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
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sendHealthResponse = (_req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  return res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? "ok" : "degraded",
    database: dbConnected ? "connected" : "disconnected",
    demoMode: config.demoMode,
    timestamp: new Date().toISOString(),
  });
};

app.get("/", (req: Request, res: Response) => {
  res.send("EduDrop server running 🥳");
});
app.get("/health", sendHealthResponse);
app.get("/api/v1/health", sendHealthResponse);
app.use("/api/v1", routes);
// Serve static uploaded media with immutable caching and hardened content headers
const uploadDirectory = path.join(__dirname, "../uploads");
const staticUploadOptions = {
  maxAge: "365d",
  immutable: true,
  etag: true,
  setHeaders: (res: Response) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
};

app.use(
  "/uploads/users",
  express.static(path.join(uploadDirectory, "users"), staticUploadOptions)
);
app.use(
  "/uploads/school",
  express.static(path.join(uploadDirectory, "school"), staticUploadOptions)
);
app.use(
  "/uploads/products",
  express.static(path.join(uploadDirectory, "products"), staticUploadOptions)
);
app.use(
  "/uploads/cms",
  express.static(path.join(uploadDirectory, "cms"), staticUploadOptions)
);
app.use("/uploads", express.static(uploadDirectory, staticUploadOptions));

//global error handler
app.use(globalErrorHandler);
export default app;
