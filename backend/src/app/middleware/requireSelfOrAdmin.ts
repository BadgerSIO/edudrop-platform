import { NextFunction, Request, Response } from "express";
import { User } from "../modules/user/user.model";

/**
 * Enforces ownership on `:id` routes so a caller can only access or modify
 * their own Bursar or Donor profile unless they hold the `admin` role.
 */
const requireSelfOrAdmin = (profileType: "bursar" | "donar") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user =
        res.locals.user ||
        (res.locals.email
          ? await User.findOne({ email: res.locals.email }).lean()
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

      if (
        user.role !== profileType ||
        !ownedProfileId ||
        ownedProfileId !== targetId
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only manage your own profile",
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error in ownership verification",
      });
    }
  };
};

export default requireSelfOrAdmin;
