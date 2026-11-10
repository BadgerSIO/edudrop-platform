import { NextFunction, Request, Response } from "express";
import { User } from "../modules/user/user.model";

export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user =
        res.locals.user ||
        (res.locals.email ? await User.findOne({ email: res.locals.email }).lean() : null);

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access requires one of [${roles.join(", ")}]`,
        });
      }

      if (user.isDeleted || user.status === "suspended") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Account is suspended or archived",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error in role verification",
      });
    }
  };
};

export default requireRole;
