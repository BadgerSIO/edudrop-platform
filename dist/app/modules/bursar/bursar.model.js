"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bursar = exports.BursarSchema = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../../../constants/common");
exports.BursarSchema = new mongoose_1.Schema({
    name: {
        type: {
            firstName: {
                type: String,
                required: true,
            },
            lastName: {
                type: String,
                required: true,
            },
        },
        required: true,
    },
    gender: {
        type: String,
        enum: common_1.gender,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    contactNo: {
        type: String,
        unique: true,
        required: true,
    },
    presentAddress: {
        type: String,
    },
    permanentAddress: {
        type: String,
    },
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "School",
    },
    enabled: { type: Boolean },
    active: { type: Boolean },
    profileImage: {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
exports.Bursar = (0, mongoose_1.model)("Bursar", exports.BursarSchema);
