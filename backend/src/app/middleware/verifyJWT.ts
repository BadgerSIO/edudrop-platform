import { NextFunction, Request, Response } from "express";
import * as jose from "jose";
import config from "../../config";
import { User } from "../modules/user/user.model";

const resolveVerifiedUser = async (bearerToken?: string) => {
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    return { error: "Unauthorized: Bearer token required" } as const;
  }

  const token = bearerToken.split(" ")[1];
  if (!token) {
    return { error: "Unauthorized: Token not found" } as const;
  }

  const secret = new TextEncoder().encode(config.jwt_secret);
  const { payload } = await jose.jwtVerify(token, secret);

  const email = payload.email as string;
  if (!email) {
    return { error: "Unauthorized: Invalid token payload" } as const;
  }

  const user = await User.findOne({ email }).lean();
  if (!user) {
    return { error: "Unauthorized: User not found" } as const;
  }

  return { email, user } as const;
};

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resolved = await resolveVerifiedUser(req.headers["authorization"] as string);
    if ("error" in resolved) {
      return res.status(401).json({ success: false, message: resolved.error });
    }

    res.locals.email = resolved.email;
    res.locals.user = resolved.user;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export const verifyOptionalJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearerToken = req.headers["authorization"] as string | undefined;
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return next();
    }
    const resolved = await resolveVerifiedUser(bearerToken);
    if (!("error" in resolved)) {
      res.locals.email = resolved.email;
      res.locals.user = resolved.user;
    }
  } catch {
    // Non-fatal on optional auth routes: proceed as unauthenticated guest
  }
  next();
};

export default verifyJWT;
