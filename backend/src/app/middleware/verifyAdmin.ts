import { NextFunction, Request, Response } from "express";
import { User } from "../modules/user/user.model";

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user =
      res.locals.user ||
      (res.locals.email ? await User.findOne({ email: res.locals.email }).lean() : null);

    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error in admin authorization" });
  }
};

export default verifyAdmin;
