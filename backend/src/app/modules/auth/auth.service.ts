import httpStatus from "http-status";
import ApiError from "../../../error/ApiError";
import { User } from "../user/user.model";
import bcrypt from "bcrypt";
import * as jose from "jose";
import config from "../../../config";
import { IAdmin } from "../admin/admin.interface";
import { Admin } from "../admin/admin.model";
import { IUser } from "../user/user.interface";
import mongoose from "mongoose";
import { Donar } from "../donar/donar.model";
import { IDonar } from "../donar/donar.interface";
import { securePass } from "../../../helper/securepass";
import generateResetToken from "../../../helper/generateResetToken";
import { senderMail, transport } from "../../../config/nodemailer";
import emailTemplate from "../../../shared/emailTemplate";
const loginUser = async (email: string, password: string) => {
  const doesUserExist = await User.findOne(
    { email: email },
    { _id: 1, email: 1, password: 1, role: 1, status: 1, isDeleted: 1 }
  ).lean();
  if (!doesUserExist || doesUserExist?.role !== "donar") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email or credentials");
  }
  if (doesUserExist.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, "This account has been deleted or archived");
  }
  if (doesUserExist.status === "suspended") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact platform support");
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    doesUserExist.password
  );
  if (!isPasswordMatched) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "User email or password does not match"
    );
  }
  let userInfo = await User.findById(doesUserExist._id)
    .select("-password") // Exclude the 'password' field
    .populate("donar");
  const secret = new TextEncoder().encode(config.jwt_secret);
  const alg = "HS256";
  const token = await new jose.SignJWT({ email: email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);
  return { accessToken: token, data: userInfo };
};
const forgetPassword = async (email: string) => {
  const doesUserExist = await User.findOne(
    { email },
    { _id: 1, role: 1 }
  ).lean();
  if (!doesUserExist || doesUserExist.role === "admin") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong 1 ");
  }
  const resetToken = generateResetToken();
  let encryptResetToken = await securePass(resetToken);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        passwordResetToken: encryptResetToken,
        passwordResetTokenExpiry: Date.now() + 300000, // Reset token expiry in 5 mintue
      },
    },
    { new: true }
  );
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong 2");
  }
  const admin = await User.findOne({ role: "admin" }, { email: 1 }).lean();
  if (!admin) {
    throw new Error("admin not found");
  }
  let emailPayload = {
    resetToken,
  };
  const info = await transport.sendMail({
    from: ` ${senderMail}`, // sender address
    to: email, // list of receivers
    subject: "Password Reset Token", // Subject line
    text: "Password Reset Token", // plain text body
    html: emailTemplate("resetToken", emailPayload),
  });
  return { data: "Reset token sent to user email" };
};
const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  // Find the user with the provided email
  const user = await User.findOne(
    { email },
    { email: 1, passwordResetToken: 1, passwordResetTokenExpiry: 1 }
  ).lean();

  if (!user || !user.passwordResetToken || !user.passwordResetTokenExpiry) {
    // User not found
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Verify the reset token and its expiry
  const validToken = await bcrypt.compare(token, user?.passwordResetToken);

  if (!validToken || user?.passwordResetTokenExpiry < Date.now()) {
    // Token doesn't match or has expired
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }

  // Update the user's password and clear the reset token
  const newPasswordHash = await securePass(newPassword);
  await User.updateOne(
    { email },
    {
      $set: {
        password: newPasswordHash,
      },
      $unset: {
        passwordResetToken: "",
        passwordResetTokenExpiry: "",
      },
    }
  );

  // Password successfully updated
  return "Password updated successfully";
};
const changePass = async (payload: any, email: string) => {
  const doesUserExist = await User.findOne(
    { email },
    { password: 1, role: 1, status: 1, isDeleted: 1 }
  ).lean();
  if (!doesUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User account not found");
  }
  if (doesUserExist.role === "admin") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Password changes are disabled for administrator accounts"
    );
  }
  if (doesUserExist.isDeleted || doesUserExist.status === "suspended") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Cannot change password for a suspended or archived account"
    );
  }

  const { password, newPassword } = payload;
  if (!password || !newPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Both current and new passwords are required"
    );
  }
  if (newPassword === password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "New password must be different from your current password"
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    doesUserExist?.password
  );

  if (!isPasswordMatched) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect"
    );
  }
  const hashedNewPassword = await securePass(newPassword);
  // Update the user's password directly without hashing it again
  const updatedUser = await User.findOneAndUpdate(
    { email },
    { $set: { password: hashedNewPassword } },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update password"
    );
  }

  return { message: "Password updated successfully" };
};
const checkUser = async (email: string) => {
  const doesUserExist = await User.findOne(
    { email: email },
    { _id: 1, email: 1 }
  ).lean();
  if (doesUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email address");
  }
  let result = { email: "ok" };

  return { result };
};
const loginBursar = async (email: string, password: string) => {
  const doesUserExist = await User.findOne(
    { email: email },
    { _id: 1, password: 1, role: 1, status: 1, isDeleted: 1 }
  ).lean();
  if (!doesUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (doesUserExist.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, "This account has been deleted or archived");
  }
  if (doesUserExist.status === "suspended") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your bursar account has been suspended. Please contact administrator");
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    doesUserExist.password
  );
  if (!isPasswordMatched) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "User email or password does not match"
    );
  }
  if (doesUserExist.role !== "bursar") {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  let userInfo = await User.findById(doesUserExist._id)
    .select("-password") // Exclude the 'password' field
    .populate({
      path: "bursar",
      populate: {
        path: "school",
        select: "name slug schoolLogo amountReceived active",
      },
    });

  const secret = new TextEncoder().encode(config.jwt_secret);
  const alg = "HS256";
  const token = await new jose.SignJWT({ email: email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);
  return { accessToken: token, data: userInfo };
};
const loginAdmin = async (email: string, password: string) => {
  const doesUserExist = await User.findOne(
    { email: email },
    { _id: 1, password: 1, role: 1, status: 1, isDeleted: 1 }
  ).lean();
  if (!doesUserExist || doesUserExist?.role !== "admin") {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (doesUserExist.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, "This account has been deleted or archived");
  }
  if (doesUserExist.status === "suspended") {
    throw new ApiError(httpStatus.FORBIDDEN, "This administrator account has been suspended");
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    doesUserExist.password
  );
  if (!isPasswordMatched) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "User email or password does not match"
    );
  }

  let userInfo = await User.findById(doesUserExist._id)
    .select("-password") // Exclude the 'password' field
    .populate("admin");

  const secret = new TextEncoder().encode(config.jwt_secret);
  const alg = "HS256";
  const token = await new jose.SignJWT({ email: email })
    .setProtectedHeader({ alg })
    .setExpirationTime("48h")
    .sign(secret);
  return { accessToken: token, data: userInfo };
};
const verifyUser = async (payload: any) => {
  if (!payload.email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request 1");
  }

  const user = await User.findOne(
    { email: payload.email },
    { role: 1, status: 1, isDeleted: 1 }
  ).lean();
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request 2");
  }

  if (user.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, "Account archived or deleted");
  }

  if (user.status === "suspended") {
    throw new ApiError(httpStatus.FORBIDDEN, "Account has been suspended");
  }

  let userInfo = null;
  const selectFields = "-password"; // Exclude the 'password' field

  switch (user.role) {
    case "bursar":
      userInfo = await User.findById(user._id)
        .select(selectFields)
        .populate({
          path: "bursar",
          populate: {
            path: "school",
            select: "name slug schoolLogo amountReceived active",
          },
        });
      break;
    case "admin":
      userInfo = await User.findById(user._id)
        .select(selectFields)
        .populate("admin");
      break;
    case "donar":
      userInfo = await User.findById(user._id)
        .select(selectFields)
        .populate("donar");
      break;
    default:
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request 3");
  }

  if (!userInfo) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request 3");
  }

  return { data: userInfo };
};

const createAdmin = async (payload: any) => {
  let user = {} as IUser;
  let admin = {} as IAdmin;
  user["role"] = "admin";
  user["email"] = payload.email;
  user["password"] = payload.password;
  admin["email"] = payload.email;
  admin["name"] = payload.name;
  admin["contactNo"] = payload.contactNo;
  admin["presentAddress"] = "";
  admin["permanentAddress"] = "";
  admin["deviceCount"] = 0;
  admin["ipAddress"] = [];
  let userinfo = null;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const newAdmin = await Admin.create([admin], { session });
    if (!newAdmin.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create new Admin");
    }
    let adminid = newAdmin[0]._id;
    user.admin = adminid;
    const newUser = await User.create([user], { session });
    userinfo = newUser;
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
  return userinfo;
};
const createDonar = async (
  donarData: Partial<IDonar>,
  userData: Partial<IUser>
) => {
  donarData["enabled"] = true;
  donarData["active"] = true;
  donarData["totalDonationAmount"] = 0;
  userData["role"] = "donar";
  userData["email"] = donarData.email;
  userData["status"] = "active";
  userData["isDeleted"] = false;
  const session = await mongoose.startSession();
  let newDonarData;
  try {
    session.startTransaction();
    const newDonar = await Donar.create([donarData], { session });
    if (!newDonar.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create Donar1");
    }
    userData["donar"] = newDonar[0]._id;
    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create Donar2");
    }

    newDonarData = newUser[0];
    // Constructing a new object without 'password'
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
  const userWithoutPassword = await User.findById(newDonarData._id)
    .select("-password")
    .lean();
  if (!userWithoutPassword) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const secret = new TextEncoder().encode(config.jwt_secret);
  const alg = "HS256";
  const token = await new jose.SignJWT({ email: userWithoutPassword?.email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);
  return { accessToken: token, data: userWithoutPassword };
};

export const AuthService = {
  loginUser,
  loginBursar,
  verifyUser,
  createAdmin,
  loginAdmin,
  createDonar,
  checkUser,
  changePass,
  forgetPassword,
  resetPassword,
};
