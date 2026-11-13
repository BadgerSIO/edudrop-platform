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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const securepass_1 = require("../../../helper/securepass");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true, select: false },
    bursar: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Bursar",
    },
    donar: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Donar",
    },
    admin: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
    status: {
        type: String,
        enum: ["active", "suspended", "archived"],
        default: "active",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    passwordResetToken: { type: String },
    passwordResetTokenExpiry: { type: Number },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
// Compound indexes for high performance directory querying
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ isDeleted: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // hashing user password if modified
        const user = this;
        if (user.isModified("password")) {
            user.password = yield (0, securepass_1.securePass)(user === null || user === void 0 ? void 0 : user.password);
        }
        next();
    });
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
