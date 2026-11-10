import { NextFunction, Request, Response } from "express";
import * as jose from "jose";
import config from "../../config";
import { User } from "../modules/user/user.model";

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearerToken = req.headers["authorization"] as string;
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Bearer token required" });
    }

    const token = bearerToken.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Token not found" });
    }

    const secret = new TextEncoder().encode(config.jwt_secret);
    const { payload } = await jose.jwtVerify(token, secret);

    const email = payload.email as string;
    if (!email) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token payload" });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User not found" });
    }

    res.locals.email = email;
    res.locals.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export default verifyJWT;
