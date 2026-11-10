import express, { Application, Request, Response } from "express";
import path from "path";
import cors from "cors";
import routes from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req: Request, res: Response) => {
  res.send("EduDrop server running 🥳");
});
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
