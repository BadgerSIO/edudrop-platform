import express from "express";
import { BursarController } from "./bursar.controller";
import { usersImageUpload } from "../../middleware/multerUpload";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import requireRole from "../../middleware/requireRole";
import requireSelfOrAdmin from "../../middleware/requireSelfOrAdmin";

const router = express.Router();

router.get("/", verifyJWT, verifyAdmin, BursarController.getAllBursar);

router.get(
  "/me",
  verifyJWT,
  requireRole("bursar"),
  BursarController.getMyProfile
);

router.patch(
  "/me",
  verifyJWT,
  requireRole("bursar"),
  usersImageUpload,
  BursarController.updateMyProfile
);

router.get(
  "/:id",
  verifyJWT,
  requireSelfOrAdmin("bursar"),
  BursarController.getSingleBursar
);

router.patch(
  "/:id",
  verifyJWT,
  requireSelfOrAdmin("bursar"),
  usersImageUpload,
  BursarController.updateBursar
);

router.delete("/:id", verifyJWT, verifyAdmin, BursarController.deleteBursar);

export const BursarRoutes = router;
