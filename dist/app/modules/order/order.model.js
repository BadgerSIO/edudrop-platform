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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../user/user.model");
const nodemailer_1 = require("../../../config/nodemailer");
const emailTemplate_1 = __importDefault(require("../../../shared/emailTemplate"));
const school_model_1 = require("../school/school.model");
const notification_model_1 = require("../notification/notification.model");
const OrderSchema = new mongoose_1.Schema({
    card: { type: String },
    transactionId: { type: String, trim: true, index: true },
    orderId: { type: String, trim: true, unique: true, sparse: true },
    previousOrderId: { type: String },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "Donar" },
    email: { type: String, required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
    },
    presentAddress: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String },
    contactNo: { type: String, required: true },
    schoolId: { type: mongoose_1.Schema.Types.ObjectId, ref: "School" },
    products: [{ type: mongoose_1.Schema.Types.Mixed }], // Define this as per your IProductWithQuantity structure
    totalAmount: { type: Number, required: true },
    payMonthly: { type: String, enum: ["yes", "no"], required: true },
    nextRecurringDate: {
        type: Date,
        // Set the 'required' flag based on the 'payMonthly' value
        required: function () {
            return this.payMonthly === "yes"; // Make 'nextRecurringDate' required only when payMonthly is 'yes'
        },
    },
    orderStatus: {
        type: String,
        enum: ["pending", "processing", "on the way", "received"],
        required: true,
    },
    paymentStatus: { type: Boolean, required: true },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
OrderSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const order = this;
        if (!order.isNew) {
            return next();
        }
        try {
            const findBursar = yield school_model_1.School.findById({ _id: order.schoolId }, { bursar: 1 }).lean();
            const [findBursarUser, findAdmin, findDonarUser] = yield Promise.all([
                (findBursar === null || findBursar === void 0 ? void 0 : findBursar.bursar)
                    ? user_model_1.User.findOne({ bursar: findBursar.bursar }, { _id: 1, email: 1 }).lean()
                    : Promise.resolve(null),
                user_model_1.User.findOne({ role: "admin" }, { _id: 1, email: 1 }).lean(),
                order.user
                    ? user_model_1.User.findOne({ donar: order.user }, { _id: 1 }).lean()
                    : Promise.resolve(null),
            ]);
            const orderLabel = order.orderId || "Sponsorship";
            const routeKey = order.orderId || order._id;
            const notificationPromises = [];
            if (findBursarUser) {
                const notificationPayload = {
                    user: findBursarUser._id,
                    message: `New Order placed: ${orderLabel}`,
                    link: `/bursar-dashboard/my-orders/${routeKey}`,
                    read: false,
                };
                notificationPromises.push(notification_model_1.Notification.create(notificationPayload).catch(console.error));
            }
            if (findAdmin) {
                const notificationPayloadAdmin = {
                    user: findAdmin._id,
                    message: `New Order placed: ${orderLabel}`,
                    link: `/dashboard/orders/${routeKey}`,
                    read: false,
                };
                notificationPromises.push(notification_model_1.Notification.create(notificationPayloadAdmin).catch(console.error));
            }
            if (findDonarUser) {
                const notificationPayloadDonar = {
                    user: findDonarUser._id,
                    message: `Sponsorship order received: ${orderLabel}`,
                    link: `/donar-dashboard/my-orders/${routeKey}`,
                    read: false,
                };
                notificationPromises.push(notification_model_1.Notification.create(notificationPayloadDonar).catch(console.error));
            }
            yield Promise.all(notificationPromises);
            const recipients = [order.email];
            if (findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.email)
                recipients.push(findAdmin.email);
            if (findBursarUser === null || findBursarUser === void 0 ? void 0 : findBursarUser.email)
                recipients.push(findBursarUser.email);
            const emailPayload = { order };
            yield nodemailer_1.transport.sendMail({
                from: `${nodemailer_1.senderMail}`,
                to: recipients,
                subject: `New Sponsorship Order Confirmation: ${order.orderId || ""}`,
                text: "New EduDrop sponsorship order received",
                html: (0, emailTemplate_1.default)("newOrder", emailPayload),
            }).catch(console.error);
        }
        catch (error) {
            console.error("Non-critical error in order post-save hooks:", error);
        }
        next();
    });
});
exports.Order = (0, mongoose_1.model)("Order", OrderSchema);
