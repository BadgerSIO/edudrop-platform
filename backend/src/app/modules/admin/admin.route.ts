import express from "express";
import { AdminController } from "./admin.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import requireRole from "../../middleware/requireRole";

const router = express.Router();

router.get("/get-counts", verifyJWT, verifyAdmin, AdminController.getCounts);
router.get("/me", verifyJWT, requireRole("admin"), AdminController.getMyProfile);
router.get("/:id", verifyJWT, verifyAdmin, AdminController.getSingleAdmin);
router.delete("/:id", verifyJWT, verifyAdmin, AdminController.deleteAdmin);

export const AdminRoutes = router;
