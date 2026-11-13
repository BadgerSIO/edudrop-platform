"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../modules/user/user.model");
/**
 * Enforces ownership on `:id` routes so a caller can only access or modify
 * their own Bursar or Donor profile unless they hold the `admin` role.
 */
const requireSelfOrAdmin = (profileType) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = res.locals.user ||
                (res.locals.email
                    ? yield user_model_1.User.findOne({ email: res.locals.email }).lean()
                    : null);
            if (!user) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized: User not found" });
            }
            if (user.isDeleted || user.status === "suspended") {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Account is suspended or archived",
                });
            }
            if (user.role === "admin") {
                return next();
            }
            const targetId = req.params.id;
            const ownedProfileId = user[profileType] ? String(user[profileType]) : "";
            if (user.role !== profileType ||
                !ownedProfileId ||
                ownedProfileId !== targetId) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You can only manage your own profile",
                });
            }
            return next();
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server error in ownership verification",
            });
        }
    });
};
exports.default = requireSelfOrAdmin;
