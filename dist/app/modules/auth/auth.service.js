"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const user_model_1 = require("../user/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jose = __importStar(require("jose"));
const config_1 = __importDefault(require("../../../config"));
const admin_model_1 = require("../admin/admin.model");
const mongoose_1 = __importDefault(require("mongoose"));
const donar_model_1 = require("../donar/donar.model");
const securepass_1 = require("../../../helper/securepass");
const generateResetToken_1 = __importDefault(require("../../../helper/generateResetToken"));
const nodemailer_1 = require("../../../config/nodemailer");
const emailTemplate_1 = __importDefault(require("../../../shared/emailTemplate"));
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const doesUserExist = yield user_model_1.User.findOne({ email: email }, { _id: 1, email: 1, password: 1, role: 1, status: 1, isDeleted: 1 }).lean();
    if (!doesUserExist || (doesUserExist === null || doesUserExist === void 0 ? void 0 : doesUserExist.role) !== "donar") {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid email or credentials");
    }
    if (doesUserExist.isDeleted) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "This account has been deleted or archived");
    }
    if (doesUserExist.status === "suspended") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Your account has been suspended. Please contact platform support");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(password, doesUserExist.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "User email or password does not match");
    }
    let userInfo = yield user_model_1.User.findById(doesUserExist._id)
        .select("-password") // Exclude the 'password' field
        .populate("donar");
    const secret = new TextEncoder().encode(config_1.default.jwt_secret);
    const alg = "HS256";
    const token = yield new jose.SignJWT({ email: email })
        .setProtectedHeader({ alg })
        .setExpirationTime("24h")
        .sign(secret);
    return { accessToken: token, data: userInfo };
});
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const doesUserExist = yield user_model_1.User.findOne({ email }, { _id: 1, role: 1 }).lean();
    if (!doesUserExist || doesUserExist.role === "admin") {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Something went wrong 1 ");
    }
    const resetToken = (0, generateResetToken_1.default)();
    let encryptResetToken = yield (0, securepass_1.securePass)(resetToken);
    const user = yield user_model_1.User.findOneAndUpdate({ email }, {
        $set: {
            passwordResetToken: encryptResetToken,
            passwordResetTokenExpiry: Date.now() + 300000, // Reset token expiry in 5 mintue
        },
    }, { new: true });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Something went wrong 2");
    }
    const admin = yield user_model_1.User.findOne({ role: "admin" }, { email: 1 }).lean();
    if (!admin) {
        throw new Error("admin not found");
    }
    let emailPayload = {
        resetToken,
    };
    const info = yield nodemailer_1.transport.sendMail({
        from: ` ${nodemailer_1.senderMail}`, // sender address
        to: email, // list of receivers
        subject: "Password Reset Token", // Subject line
        text: "Password Reset Token", // plain text body
        html: (0, emailTemplate_1.default)("resetToken", emailPayload),
    });
    return { data: "Reset token sent to user email" };
});
const resetPassword = (email, token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the user with the provided email
    const user = yield user_model_1.User.findOne({ email }, { email: 1, passwordResetToken: 1, passwordResetTokenExpiry: 1 }).lean();
    if (!user || !user.passwordResetToken || !user.passwordResetTokenExpiry) {
        // User not found
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Verify the reset token and its expiry
    const validToken = yield bcrypt_1.default.compare(token, user === null || user === void 0 ? void 0 : user.passwordResetToken);
    if (!validToken || (user === null || user === void 0 ? void 0 : user.passwordResetTokenExpiry) < Date.now()) {
        // Token doesn't match or has expired
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid or expired token");
    }
    // Update the user's password and clear the reset token
    const newPasswordHash = yield (0, securepass_1.securePass)(newPassword);
    yield user_model_1.User.updateOne({ email }, {
        $set: {
            password: newPasswordHash,
        },
        $unset: {
            passwordResetToken: "",
            passwordResetTokenExpiry: "",
        },
    });
    // Password successfully updated
    return "Password updated successfully";
});
const changePass = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    const doesUserExist = yield user_model_1.User.findOne({ email }, { password: 1, role: 1, status: 1, isDeleted: 1 }).lean();
    if (!doesUserExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User account not found");
    }
    if (doesUserExist.role === "admin") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Password changes are disabled for administrator accounts");
    }
    if (doesUserExist.isDeleted || doesUserExist.status === "suspended") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Cannot change password for a suspended or archived account");
    }
    const { password, newPassword } = payload;
    if (!password || !newPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Both current and new passwords are required");
    }
    if (newPassword === password) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "New password must be different from your current password");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(password, doesUserExist === null || doesUserExist === void 0 ? void 0 : doesUserExist.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Current password is incorrect");
    }
    const hashedNewPassword = yield (0, securepass_1.securePass)(newPassword);
    // Update the user's password directly without hashing it again
    const updatedUser = yield user_model_1.User.findOneAndUpdate({ email }, { $set: { password: hashedNewPassword } }, { new: true });
    if (!updatedUser) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update password");
    }
    return { message: "Password updated successfully" };
});
const checkUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const doesUserExist = yield user_model_1.User.findOne({ email: email }, { _id: 1, email: 1 }).lean();
    if (doesUserExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid email address");
    }
    let result = { email: "ok" };
    return { result };
});
const loginBursar = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const doesUserExist = yield user_model_1.User.findOne({ email: email }, { _id: 1, password: 1, role: 1, status: 1, isDeleted: 1 }).lean();
    if (!doesUserExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User does not exist");
    }
    if (doesUserExist.isDeleted) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "This account has been deleted or archived");
    }
    if (doesUserExist.status === "suspended") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Your bursar account has been suspended. Please contact administrator");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(password, doesUserExist.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "User email or password does not match");
    }
    if (doesUserExist.role !== "bursar") {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User does not exist");
    }
    let userInfo = yield user_model_1.User.findById(doesUserExist._id)
        .select("-password") // Exclude the 'password' field
        .populate({
        path: "bursar",
        populate: {
            path: "school",
            select: "name slug schoolLogo amountReceived active",
        },
    });
    const secret = new TextEncoder().encode(config_1.default.jwt_secret);
    const alg = "HS256";
    const token = yield new jose.SignJWT({ email: email })
        .setProtectedHeader({ alg })
        .setExpirationTime("24h")
        .sign(secret);
    return { accessToken: token, data: userInfo };
});
const loginAdmin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const doesUserExist = yield user_model_1.User.findOne({ email: email }, { _id: 1, password: 1, role: 1, status: 1, isDeleted: 1 }).lean();
    if (!doesUserExist || (doesUserExist === null || doesUserExist === void 0 ? void 0 : doesUserExist.role) !== "admin") {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User does not exist");
    }
    if (doesUserExist.isDeleted) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "This account has been deleted or archived");
    }
    if (doesUserExist.status === "suspended") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "This administrator account has been suspended");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(password, doesUserExist.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "User email or password does not match");
    }
    let userInfo = yield user_model_1.User.findById(doesUserExist._id)
        .select("-password") // Exclude the 'password' field
        .populate("admin");
    const secret = new TextEncoder().encode(config_1.default.jwt_secret);
    const alg = "HS256";
    const token = yield new jose.SignJWT({ email: email })
        .setProtectedHeader({ alg })
        .setExpirationTime("48h")
        .sign(secret);
    return { accessToken: token, data: userInfo };
});
const verifyUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized request 1");
    }
    const user = yield user_model_1.User.findOne({ email: payload.email }, { role: 1, status: 1, isDeleted: 1 }).lean();
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized request 2");
    }
    if (user.isDeleted) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Account archived or deleted");
    }
    if (user.status === "suspended") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Account has been suspended");
    }
    let userInfo = null;
    const selectFields = "-password"; // Exclude the 'password' field
    switch (user.role) {
        case "bursar":
            userInfo = yield user_model_1.User.findById(user._id)
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
            userInfo = yield user_model_1.User.findById(user._id)
                .select(selectFields)
                .populate("admin");
            break;
        case "donar":
            userInfo = yield user_model_1.User.findById(user._id)
                .select(selectFields)
                .populate("donar");
            break;
        default:
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized request 3");
    }
    if (!userInfo) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized request 3");
    }
    return { data: userInfo };
});
const createAdmin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let user = {};
    let admin = {};
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
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const newAdmin = yield admin_model_1.Admin.create([admin], { session });
        if (!newAdmin.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create new Admin");
        }
        let adminid = newAdmin[0]._id;
        user.admin = adminid;
        const newUser = yield user_model_1.User.create([user], { session });
        userinfo = newUser;
        yield session.commitTransaction();
        yield session.endSession();
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
    return userinfo;
});
const createDonar = (donarData, userData) => __awaiter(void 0, void 0, void 0, function* () {
    donarData["enabled"] = true;
    donarData["active"] = true;
    donarData["totalDonationAmount"] = 0;
    userData["role"] = "donar";
    userData["email"] = donarData.email;
    userData["status"] = "active";
    userData["isDeleted"] = false;
    const session = yield mongoose_1.default.startSession();
    let newDonarData;
    try {
        session.startTransaction();
        const newDonar = yield donar_model_1.Donar.create([donarData], { session });
        if (!newDonar.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create Donar1");
        }
        userData["donar"] = newDonar[0]._id;
        const newUser = yield user_model_1.User.create([userData], { session });
        if (!newUser.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create Donar2");
        }
        newDonarData = newUser[0];
        // Constructing a new object without 'password'
        yield session.commitTransaction();
        yield session.endSession();
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
    const userWithoutPassword = yield user_model_1.User.findById(newDonarData._id)
        .select("-password")
        .lean();
    if (!userWithoutPassword) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const secret = new TextEncoder().encode(config_1.default.jwt_secret);
    const alg = "HS256";
    const token = yield new jose.SignJWT({ email: userWithoutPassword === null || userWithoutPassword === void 0 ? void 0 : userWithoutPassword.email })
        .setProtectedHeader({ alg })
        .setExpirationTime("24h")
        .sign(secret);
    return { accessToken: token, data: userWithoutPassword };
});
exports.AuthService = {
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
