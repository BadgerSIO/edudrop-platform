import express from "express";
import validateRequest from "../../middleware/validateRequest";
import verifyAdmin from "../../middleware/verifyAdmin";
import verifyJWT from "../../middleware/verifyJWT";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.get("/", verifyJWT, verifyAdmin, UserController.getAllUsers);

router.get("/:id", verifyJWT, verifyAdmin, UserController.getSingleUser);

router.patch(
  "/:id/status",
  verifyJWT,
  verifyAdmin,
  validateRequest(UserValidation.updateUserStatusZodSchema),
  UserController.updateUserStatus
);

router.patch(
  "/:id/reset-password",
  verifyJWT,
  verifyAdmin,
  validateRequest(UserValidation.resetPasswordZodSchema),
  UserController.resetUserPassword
);

router.delete("/:id", verifyJWT, verifyAdmin, UserController.deleteUser);

export const UserRoutes = router;
