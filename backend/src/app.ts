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
// Serve static files from the 'uploads' directory
const uploadDirectory = path.join(__dirname, "../uploads");

app.use("/uploads/users", express.static(path.join(uploadDirectory, "users")));
app.use(
  "/uploads/school",
  express.static(path.join(uploadDirectory, "school"))
);
app.use(
  "/uploads/products",
  express.static(path.join(uploadDirectory, "products"))
);
app.use(
  "/uploads/cms",
  express.static(path.join(uploadDirectory, "cms"))
);
app.use(
  "/uploads",
  express.static(uploadDirectory)
);

//global error handler
app.use(globalErrorHandler);
export default app;
