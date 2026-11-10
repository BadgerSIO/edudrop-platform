import express from "express";
import { AdminController } from "./admin.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";

const router = express.Router();

router.get("/get-counts", verifyJWT, verifyAdmin, AdminController.getCounts);
router.get("/:id", verifyJWT, verifyAdmin, AdminController.getSingleAdmin);
router.delete("/:id", verifyJWT, verifyAdmin, AdminController.deleteAdmin);
router.patch("/:id", verifyJWT, verifyAdmin, AdminController.updateAdmin);

export const AdminRoutes = router;
