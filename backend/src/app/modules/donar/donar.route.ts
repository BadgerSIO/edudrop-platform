import express from "express";
import { DonarController } from "./donar.controller";
import { usersImageUpload } from "../../middleware/multerUpload";
import verifyAdmin from "../../middleware/verifyAdmin";
import verifyJWT from "../../middleware/verifyJWT";
import requireRole from "../../middleware/requireRole";
import requireSelfOrAdmin from "../../middleware/requireSelfOrAdmin";

const router = express.Router();

router.get("/", verifyJWT, verifyAdmin, DonarController.getAllDonar);

router.get(
  "/me",
  verifyJWT,
  requireRole("donar"),
  DonarController.getMyProfile
);

router.patch(
  "/me",
  verifyJWT,
  requireRole("donar"),
  usersImageUpload,
  DonarController.updateMyProfile
);

router.patch(
  "/status-update/:id",
  verifyJWT,
  verifyAdmin,
  DonarController.updateDonarStatus
);

router.get(
  "/:id",
  verifyJWT,
  requireSelfOrAdmin("donar"),
  DonarController.getSingleDonar
);

router.patch(
  "/:id",
  verifyJWT,
  requireSelfOrAdmin("donar"),
  usersImageUpload,
  DonarController.updateDonar
);

router.delete("/:id", verifyJWT, verifyAdmin, DonarController.deleteDonar);

export const DonarRoutes = router;
