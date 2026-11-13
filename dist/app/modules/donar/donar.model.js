"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Donar = exports.DonarSchema = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../../../constants/common");
exports.DonarSchema = new mongoose_1.Schema({
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
        required: true,
    },
    address: {
        type: {
            presentAddress: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            street: {
                type: String,
            },
            zipCode: {
                type: String,
            },
            country: {
                type: String,
            },
        },
    },
    enabled: { type: Boolean },
    active: { type: Boolean },
    profileImage: {
        type: String,
    },
    totalDonationAmount: { type: Number },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
exports.Donar = (0, mongoose_1.model)("Donar", exports.DonarSchema);
