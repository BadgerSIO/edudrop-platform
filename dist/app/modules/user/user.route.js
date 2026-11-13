"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.get("/", verifyJWT_1.default, verifyAdmin_1.default, user_controller_1.UserController.getAllUsers);
router.get("/:id", verifyJWT_1.default, verifyAdmin_1.default, user_controller_1.UserController.getSingleUser);
router.patch("/:id/status", verifyJWT_1.default, verifyAdmin_1.default, (0, validateRequest_1.default)(user_validation_1.UserValidation.updateUserStatusZodSchema), user_controller_1.UserController.updateUserStatus);
router.patch("/:id/reset-password", verifyJWT_1.default, verifyAdmin_1.default, (0, validateRequest_1.default)(user_validation_1.UserValidation.resetPasswordZodSchema), user_controller_1.UserController.resetUserPassword);
router.delete("/:id", verifyJWT_1.default, verifyAdmin_1.default, user_controller_1.UserController.deleteUser);
exports.UserRoutes = router;
