import express from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";
import verifyJWT from "../../middleware/verifyJWT";
import requireRole from "../../middleware/requireRole";
const router = express.Router();
router.get("/", verifyJWT, AuthController.verifyUser);
router.post("/forget-password-user", AuthController.forgetPassword);
router.post("/reset-password-user", AuthController.resetPassword);
router.post(
  "/login-bursar",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginBursar
);
router.post(
  "/login",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);
router.post(
  "/signup",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.createDonar
);
router.post(
  "/admin-login",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginAdmin
);
router.post("/checkuser", AuthController.checkUser);
router.patch(
  "/change-password",
  verifyJWT,
  requireRole("donar", "bursar", "admin"),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePass
);
router.patch(
  "/change-donar-pass",
  verifyJWT,
  requireRole("donar"),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePass
);
router.patch(
  "/change-bursar-pass",
  verifyJWT,
  requireRole("bursar"),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePass
);
// router.post("/create-admin", AuthController.createAdmin);

export const AuthRoutes = router;
