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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paginationHelper_1 = require("../../../helper/paginationHelper");
const order_constants_1 = require("./order.constants");
const order_model_1 = require("./order.model");
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const bursar_model_1 = require("../bursar/bursar.model");
const user_model_1 = require("../user/user.model");
const donar_model_1 = require("../donar/donar.model");
const nodemailer_1 = require("../../../config/nodemailer");
const emailTemplate_1 = __importDefault(require("../../../shared/emailTemplate"));
const school_model_1 = require("../school/school.model");
const schoolInfo_model_1 = require("../schoolInfo/schoolInfo.model");
const schoolInbox_model_1 = require("../schoolInbox/schoolInbox.model");
const notification_services_1 = require("../notification/notification.services");
const product_model_1 = require("../product/product.model");
const crypto_1 = __importDefault(require("crypto"));
const generateOrderId_1 = __importDefault(require("../../../helper/generateOrderId"));
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildOrderIdentifierQuery = (idOrCode) => {
    const trimmed = String(idOrCode || "").trim();
    if (mongoose_1.default.Types.ObjectId.isValid(trimmed)) {
        return {
            $or: [{ _id: trimmed }, { orderId: trimmed }],
        };
    }
    return {
        orderId: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
    };
};
const createOrder = (payload, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (currentUser && currentUser.role !== "donar") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "School Bursar and Platform Admin accounts cannot place sponsorship orders. Please sign out and continue as a Donor or Guest.");
    }
    payload.email = String(payload.email || "").trim().toLowerCase();
    payload.orderId = payload.orderId
        ? String(payload.orderId).trim()
        : (0, generateOrderId_1.default)();
    // Idempotency check: if an order with this orderId or transactionId already exists, return it
    if (payload.orderId) {
        const existingOrder = yield order_model_1.Order.findOne({ orderId: payload.orderId });
        if (existingOrder) {
            return existingOrder;
        }
    }
    if (payload.transactionId) {
        const existingOrderByTx = yield order_model_1.Order.findOne({
            transactionId: payload.transactionId,
        });
        if (existingOrderByTx) {
            return existingOrderByTx;
        }
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Authoritative server-side price recalculation from database products
        if (payload.products && Array.isArray(payload.products) && payload.products.length > 0) {
            let authoritativeTotal = 0;
            for (const item of payload.products) {
                if (item.slug) {
                    const dbProduct = yield product_model_1.Product.findOne({ slug: item.slug }).session(session);
                    if (dbProduct) {
                        const unitPrice = dbProduct.sale && dbProduct.salePrice && dbProduct.salePrice > 0
                            ? dbProduct.salePrice
                            : dbProduct.price;
                        const quantity = Number(item.quantity) || 1;
                        authoritativeTotal += unitPrice * quantity;
                    }
                }
            }
            if (authoritativeTotal > 0) {
                payload.totalAmount = authoritativeTotal;
            }
        }
        // Mask card details for PCI compliance (never store full PAN)
        if (payload.card) {
            const cleanCard = String(payload.card).replace(/\s+/g, "");
            payload.card =
                cleanCard.length > 4 ? `**** **** **** ${cleanCard.slice(-4)}` : "****";
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.payMonthly) === "yes") {
            const today = new Date();
            const oneMonthLater = new Date(today.setMonth(today.getMonth() + 1));
            payload["nextRecurringDate"] = oneMonthLater;
        }
        payload["orderStatus"] = "processing";
        payload["paymentStatus"] = true;
        let newAccountCredentials = null;
        // Fetch the donor and user by email (case-insensitive) to prevent duplicate registration
        // and protect non-donor staff accounts from silent hybrid corruption
        const emailMatcher = {
            email: { $regex: `^${escapeRegex(payload.email)}$`, $options: "i" },
        };
        const existingUser = yield user_model_1.User.findOne(emailMatcher).session(session);
        if (existingUser && existingUser.role !== "donar") {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "This email belongs to a School Bursar or Platform Admin account and cannot be used for sponsorship checkout. Please sign out and use a Donor email address.");
        }
        let donor = yield donar_model_1.Donar.findOne(emailMatcher, { totalDonationAmount: 1 }).session(session);
        if (donor) {
            // Increment the donor's totalDonationAmount by the order's totalAmount
            donor.totalDonationAmount =
                (donor.totalDonationAmount || 0) + payload.totalAmount;
            payload["user"] = donor._id;
            yield donor.save({ session });
        }
        else {
            let donarData = {
                email: payload.email,
                contactNo: payload.contactNo,
                name: {
                    firstName: (_a = payload === null || payload === void 0 ? void 0 : payload.name) === null || _a === void 0 ? void 0 : _a.firstName,
                    lastName: (_b = payload === null || payload === void 0 ? void 0 : payload.name) === null || _b === void 0 ? void 0 : _b.lastName,
                },
                enabled: true,
                active: true,
                totalDonationAmount: payload.totalAmount || 0,
                address: {
                    presentAddress: (payload === null || payload === void 0 ? void 0 : payload.presentAddress) || "",
                    city: (payload === null || payload === void 0 ? void 0 : payload.city) || "",
                    country: (payload === null || payload === void 0 ? void 0 : payload.country) || "",
                    zipCode: (payload === null || payload === void 0 ? void 0 : payload.zipCode) || "",
                },
            };
            const newDonar = yield donar_model_1.Donar.create([donarData], { session });
            payload["user"] = newDonar[0]._id;
            if (!existingUser) {
                const randomSecret = crypto_1.default.randomBytes(4).toString("hex");
                const generatedPass = `Edu#${randomSecret}A1!`;
                let userData = {
                    role: "donar",
                    email: payload === null || payload === void 0 ? void 0 : payload.email,
                    password: generatedPass,
                    donar: newDonar[0]._id,
                };
                newAccountCredentials = {
                    email: payload.email,
                    password: userData.password,
                };
                const newUser = yield user_model_1.User.create([userData], { session });
                if (!newUser.length) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create Donar user");
                }
                let emailPayloadDonar = {
                    username: payload.email,
                    password: userData.password,
                };
                nodemailer_1.transport.sendMail({
                    from: `${nodemailer_1.senderMail}`,
                    to: payload.email,
                    subject: "EduDrop Donor Account Created",
                    text: `Donor account created! Username: ${payload.email} | Temporary Password: ${userData.password}`,
                    html: (0, emailTemplate_1.default)("donarAccount", emailPayloadDonar),
                }).catch((mailError) => {
                    console.error("Failed to send donor welcome email:", mailError);
                });
            }
            else {
                if (!existingUser.donar) {
                    existingUser.donar = newDonar[0]._id;
                    yield existingUser.save({ session });
                }
            }
        }
        // Increment school's amountReceived
        if (payload.schoolId) {
            yield school_model_1.School.findByIdAndUpdate(payload.schoolId, { $inc: { amountReceived: payload.totalAmount } }, { session });
        }
        const result = yield order_model_1.Order.create([payload], { session });
        yield session.commitTransaction();
        session.endSession();
        const populated = yield order_model_1.Order.findById(result[0]._id).populate("schoolId", "name contactNo address");
        const orderDoc = (populated || result[0]).toObject();
        if (newAccountCredentials) {
            orderDoc.newAccountCredentials = newAccountCredentials;
        }
        return orderDoc;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        // If a transient concurrency error occurred, check if the order was created by a concurrent request
        if (!(error instanceof ApiError_1.default) && payload.orderId) {
            for (let attempt = 0; attempt < 5; attempt++) {
                yield new Promise((resolve) => setTimeout(resolve, 300));
                const existingOrder = yield order_model_1.Order.findOne({ orderId: payload.orderId }).populate("schoolId", "name contactNo address");
                if (existingOrder) {
                    return existingOrder;
                }
            }
        }
        throw error; // Propagate the error upwards for handling
    }
});
const buildOrderQuery = (filters, paginationOptions, extraConditions = []) => {
    const { searchTerms } = filters, filterableData = __rest(filters, ["searchTerms"]);
    const andConditions = [];
    if (searchTerms) {
        andConditions.push({
            $or: order_constants_1.orderSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerms,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filterableData).length) {
        andConditions.push({
            $and: Object.entries(filterableData).map(([fields, value]) => ({
                [fields]: fields === "orderStatus" && value === "received"
                    ? { $in: ["received", "delivered"] }
                    : value,
            })),
        });
    }
    for (const condition of extraConditions) {
        andConditions.push(condition);
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    return { whereCondition, sortCondition, page, limit, skip };
};
const getAllOrder = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { whereCondition, sortCondition, page, limit, skip } = buildOrderQuery(filters, paginationOptions);
    const [result, total] = yield Promise.all([
        order_model_1.Order.find(whereCondition)
            .populate("schoolId")
            .populate("user")
            .sort(sortCondition)
            .skip(skip)
            .limit(limit),
        order_model_1.Order.countDocuments(whereCondition),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getAllDonarOrder = (filters, paginationOptions, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const { whereCondition, sortCondition, page, limit, skip } = buildOrderQuery(filters, paginationOptions, [{ email }]);
    const [result, total] = yield Promise.all([
        order_model_1.Order.find(whereCondition)
            .populate("schoolId")
            .sort(sortCondition)
            .skip(skip)
            .limit(limit),
        order_model_1.Order.countDocuments(whereCondition),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getAllBursarOrder = (filters, paginationOptions, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const bursar = yield bursar_model_1.Bursar.findOne({ email });
    if (!bursar) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const schoolId = bursar === null || bursar === void 0 ? void 0 : bursar.school;
    if (!schoolId) {
        const { page, limit } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
        return {
            meta: { page, limit, total: 0 },
            data: [],
        };
    }
    const { whereCondition, sortCondition, page, limit, skip } = buildOrderQuery(filters, paginationOptions, [{ schoolId }]);
    const [result, total] = yield Promise.all([
        order_model_1.Order.find(whereCondition)
            .populate("schoolId")
            .sort(sortCondition)
            .skip(skip)
            .limit(limit),
        order_model_1.Order.countDocuments(whereCondition),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleOrderById = (id, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const result = yield order_model_1.Order.findOne(buildOrderIdentifierQuery(id)).populate({
        path: "schoolId",
        select: "name contactNo address",
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    if (currentUser && currentUser.role !== "admin") {
        if (currentUser.role === "donar") {
            const ownsByEmail = ((_c = result.email) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === ((_d = currentUser.email) === null || _d === void 0 ? void 0 : _d.toLowerCase());
            const ownsByDonorId = currentUser.donar &&
                result.user &&
                String(result.user) === String(currentUser.donar);
            if (!ownsByEmail && !ownsByDonorId) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: You do not have access to this order");
            }
        }
        else if (currentUser.role === "bursar") {
            const bursar = yield bursar_model_1.Bursar.findOne({ email: currentUser.email })
                .select("school")
                .lean();
            const orderSchoolId = typeof result.schoolId === "object" && result.schoolId !== null
                ? result.schoolId._id
                : result.schoolId;
            if (!(bursar === null || bursar === void 0 ? void 0 : bursar.school) ||
                !orderSchoolId ||
                String(bursar.school) !== String(orderSchoolId)) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: This order is not assigned to your school");
            }
        }
        else {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: Unauthorized role");
        }
    }
    return result;
});
const updateOrderStatusById = (id, email, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingOrder = yield order_model_1.Order.findOne(buildOrderIdentifierQuery(id))
        .select("orderStatus payMonthly orderId schoolId")
        .lean();
    if (!existingOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    const user = yield user_model_1.User.findOne({ email }).select("role").lean();
    if (!user || (user.role !== "admin" && user.role !== "bursar")) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: Unauthorized request");
    }
    if (user.role === "bursar") {
        const bursar = yield bursar_model_1.Bursar.findOne({ email }).select("school").lean();
        if (!(bursar === null || bursar === void 0 ? void 0 : bursar.school) ||
            String(bursar.school) !== String(existingOrder.schoolId) ||
            (payload === null || payload === void 0 ? void 0 : payload.orderStatus) !== "received" ||
            existingOrder.orderStatus !== "on the way") {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: Bursars can only confirm delivery received on their own school's in-transit orders");
        }
    }
    let payMonthly = existingOrder.payMonthly;
    if (payMonthly === "yes" && payload.orderStatus === "received") {
        const orderCreatedAlready = yield order_model_1.Order.findOne({
            previousOrderId: { $exists: true, $eq: existingOrder.orderId },
        });
        if (!(orderCreatedAlready === null || orderCreatedAlready === void 0 ? void 0 : orderCreatedAlready.previousOrderId)) {
            const previousOrderData = yield order_model_1.Order.findById(existingOrder === null || existingOrder === void 0 ? void 0 : existingOrder._id).lean();
            if (!previousOrderData) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Previous order data not found");
            }
            const { _id, transactionId, card, orderId, createdAt, updatedAt } = previousOrderData, basicOrder = __rest(previousOrderData, ["_id", "transactionId", "card", "orderId", "createdAt", "updatedAt"]);
            let nextRecurring = new Date(basicOrder.nextRecurringDate);
            nextRecurring.setMonth(nextRecurring.getMonth() + 1);
            basicOrder.nextRecurringDate = nextRecurring;
            basicOrder.paymentStatus = false;
            basicOrder.orderStatus = "pending";
            basicOrder["previousOrderId"] = orderId;
            let newOrderId = (0, generateOrderId_1.default)();
            let makeNewOrder = Object.assign({ orderId: newOrderId }, basicOrder);
            try {
                const newOrder = yield order_model_1.Order.create(makeNewOrder);
                if (!newOrder) {
                    throw new Error("Failed to create new order");
                }
            }
            catch (error) {
                if (error.code === 11000 && error.name === "MongoServerError") {
                    // Handle duplicate key error here
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Duplicate order ID");
                }
                else {
                    // Handle other errors
                    throw new ApiError_1.default(http_status_1.default.NOT_MODIFIED, `${error}`);
                }
            }
        }
    }
    const result = yield order_model_1.Order.findOneAndUpdate({ _id: existingOrder._id }, { orderStatus: payload === null || payload === void 0 ? void 0 : payload.orderStatus }, {
        new: true,
        runValidators: true,
    });
    // Non-blocking order status notifications & email
    if (result) {
        try {
            const orderLabel = result.orderId || String(result._id).slice(-6);
            const routeKey = result.orderId || String(result._id);
            const findDonar = result.user
                ? yield user_model_1.User.findOne({ donar: result.user }, { _id: 1 }).lean()
                : null;
            if (findDonar === null || findDonar === void 0 ? void 0 : findDonar._id) {
                yield notification_services_1.NotificationService.createNotificationSafe({
                    user: findDonar._id,
                    message: `Order ${orderLabel} status changed to ${payload.orderStatus}`,
                    link: `/donar-dashboard/my-orders/${routeKey}`,
                    read: false,
                });
            }
            let counterpartyEmail;
            if (user.role === "admin") {
                const findSchool = result.schoolId
                    ? yield school_model_1.School.findById(result.schoolId, { bursar: 1 }).lean()
                    : null;
                const findBursarUser = (findSchool === null || findSchool === void 0 ? void 0 : findSchool.bursar)
                    ? yield user_model_1.User.findOne({ bursar: findSchool.bursar }, { _id: 1, email: 1 }).lean()
                    : null;
                if (findBursarUser === null || findBursarUser === void 0 ? void 0 : findBursarUser._id) {
                    counterpartyEmail = findBursarUser.email;
                    yield notification_services_1.NotificationService.createNotificationSafe({
                        user: findBursarUser._id,
                        message: `Order ${orderLabel} status: ${payload.orderStatus}`,
                        link: `/bursar-dashboard/my-orders/${routeKey}`,
                        read: false,
                    });
                }
            }
            else {
                const findAdmin = yield user_model_1.User.findOne({ role: "admin" }, { _id: 1, email: 1 }).lean();
                if (findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin._id) {
                    counterpartyEmail = findAdmin.email;
                    yield notification_services_1.NotificationService.createNotificationSafe({
                        user: findAdmin._id,
                        message: `Order ${orderLabel} status changed to ${payload === null || payload === void 0 ? void 0 : payload.orderStatus}`,
                        link: `/dashboard/orders/${routeKey}`,
                        read: false,
                    });
                }
            }
            const mailRecipients = [counterpartyEmail, result.email].filter((addr) => Boolean(addr));
            if (mailRecipients.length > 0) {
                const emailPayload = {
                    orderId: result.orderId,
                    orderStatus: result.orderStatus,
                };
                yield nodemailer_1.transport
                    .sendMail({
                    from: `${nodemailer_1.senderMail}`,
                    to: mailRecipients,
                    subject: "Order status changed",
                    text: "Order status changed",
                    html: (0, emailTemplate_1.default)("orderStatus", emailPayload),
                })
                    .catch(console.error);
            }
        }
        catch (notifyErr) {
            console.error("Non-critical order status notification error:", notifyErr);
        }
    }
    return result;
});
const updateOrderPaymentById = (id, email, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const existingOrder = yield order_model_1.Order.findOne(buildOrderIdentifierQuery(id))
        .select("orderStatus payMonthly email orderId")
        .lean();
    if (!existingOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    const user = yield user_model_1.User.findOne({ email }).select("role email").lean();
    if (!user ||
        (user.role !== "admin" &&
            !(user.role === "donar" &&
                ((_e = existingOrder.email) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === ((_f = user.email) === null || _f === void 0 ? void 0 : _f.toLowerCase())))) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: Only the owning donor or an admin can update order payment");
    }
    const updateFields = {};
    if (payload.card !== undefined)
        updateFields.card = payload.card;
    if (payload.transactionId !== undefined)
        updateFields.transactionId = payload.transactionId;
    if (payload.paymentStatus !== undefined)
        updateFields.paymentStatus = payload.paymentStatus;
    if (payload.orderId && !existingOrder.orderId)
        updateFields.orderId = payload.orderId;
    const result = yield order_model_1.Order.findOneAndUpdate({ _id: existingOrder._id }, updateFields, {
        new: true,
        runValidators: true,
    }).populate("schoolId", "name contactNo address");
    if (result) {
        try {
            const orderLabel = result.orderId || String(result._id).slice(-6);
            const routeKey = result.orderId || String(result._id);
            const findAdmin = yield user_model_1.User.findOne({ role: "admin" }, { _id: 1, email: 1 }).lean();
            if (findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin._id) {
                yield notification_services_1.NotificationService.createNotificationSafe({
                    user: findAdmin._id,
                    message: `Payment received for order ${orderLabel}`,
                    link: `/dashboard/orders/${routeKey}`,
                    read: false,
                });
            }
            if (findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.email) {
                const emailPayload = {
                    orderId: result.orderId,
                    paymentStatus: result.paymentStatus,
                };
                yield nodemailer_1.transport
                    .sendMail({
                    from: `${nodemailer_1.senderMail}`,
                    to: findAdmin.email,
                    subject: "Payment status changed",
                    text: "Payment status changed",
                    html: (0, emailTemplate_1.default)("paymentStatus", emailPayload),
                })
                    .catch(console.error);
            }
        }
        catch (notifyErr) {
            console.error("Non-critical payment notification error:", notifyErr);
        }
    }
    return result;
});
const deleteOrderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_model_1.Order.findOneAndDelete(buildOrderIdentifierQuery(id));
    return result; // Explicitly cast to IOrder or null
});
const roundMoney = (val) => Math.round(val * 100) / 100;
const PRIORITY_RANK = {
    high: 0,
    medium: 1,
    low: 2,
};
const summarizePipeline = (orders) => {
    const buckets = {
        pending: { count: 0, amount: 0 },
        processing: { count: 0, amount: 0 },
        "on the way": { count: 0, amount: 0 },
        received: { count: 0, amount: 0 },
    };
    for (const order of orders) {
        const stage = (0, order_constants_1.normalizeOrderStatus)(order.orderStatus);
        buckets[stage].count += 1;
        buckets[stage].amount += Number(order.totalAmount || 0);
    }
    return order_constants_1.CANONICAL_ORDER_STAGES.map((stage) => ({
        status: stage,
        count: buckets[stage].count,
        amount: roundMoney(buckets[stage].amount),
    }));
};
const getBursarOrderSummary = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const normalizedEmail = String(email).trim();
    const bursar = yield bursar_model_1.Bursar.findOne({
        email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    })
        .select("_id school")
        .lean();
    if (!(bursar === null || bursar === void 0 ? void 0 : bursar.school)) {
        return {
            hasSchool: false,
            schoolId: null,
            schoolName: null,
            schoolSlug: null,
            cumulativeBalance: 0,
            verifiedOrderTotal: 0,
            totalOrders: 0,
            paidOrdersCount: 0,
            recurringOrdersCount: 0,
            receivedCount: 0,
            inFlightCount: 0,
            unpaidPendingCount: 0,
            pipelineBreakdown: summarizePipeline([]),
            campusNeeds: [],
            unreadInboxCount: 0,
            totalInboxCount: 0,
        };
    }
    const [school, schoolInfo, orders, unreadInboxCount, totalInboxCount] = yield Promise.all([
        school_model_1.School.findById(bursar.school)
            .select("name slug amountReceived")
            .lean(),
        schoolInfo_model_1.SchoolInfo.findOne({ school: bursar.school })
            .select("campusNeeds schoolName slug")
            .lean(),
        order_model_1.Order.find({ schoolId: bursar.school })
            .select("totalAmount orderStatus paymentStatus payMonthly createdAt")
            .sort({ createdAt: -1 })
            .lean(),
        schoolInbox_model_1.SchoolInbox.countDocuments({
            bursar: bursar._id,
            seen: false,
            isDeleted: { $ne: true },
        }),
        schoolInbox_model_1.SchoolInbox.countDocuments({
            bursar: bursar._id,
            isDeleted: { $ne: true },
        }),
    ]);
    const paidOrders = orders.filter((o) => Boolean(o.paymentStatus));
    const unpaidPendingCount = orders.filter((o) => !o.paymentStatus && (0, order_constants_1.normalizeOrderStatus)(o.orderStatus) === "pending").length;
    const verifiedOrderTotal = roundMoney(paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0));
    const recurringOrdersCount = paidOrders.filter((o) => o.payMonthly === "yes").length;
    const pipelineBreakdown = summarizePipeline(paidOrders);
    const receivedCount = ((_g = pipelineBreakdown.find((s) => s.status === "received")) === null || _g === void 0 ? void 0 : _g.count) || 0;
    const inFlightCount = paidOrders.length - receivedCount;
    const campusNeeds = Array.isArray(schoolInfo === null || schoolInfo === void 0 ? void 0 : schoolInfo.campusNeeds)
        ? [...schoolInfo.campusNeeds]
            .sort((a, b) => {
            var _a, _b;
            return ((_a = PRIORITY_RANK[String(a.priority || "medium")]) !== null && _a !== void 0 ? _a : 1) -
                ((_b = PRIORITY_RANK[String(b.priority || "medium")]) !== null && _b !== void 0 ? _b : 1);
        })
            .map((need) => ({
            itemTitle: need.itemTitle,
            productSlug: need.productSlug || "",
            targetQuantity: Number(need.targetQuantity || 0),
            fulfilledQuantity: Number(need.fulfilledQuantity || 0),
            priority: (need.priority || "medium"),
        }))
        : [];
    return {
        hasSchool: Boolean(school),
        schoolId: String(bursar.school),
        schoolName: (schoolInfo === null || schoolInfo === void 0 ? void 0 : schoolInfo.schoolName) || (school === null || school === void 0 ? void 0 : school.name) || "Partner School",
        schoolSlug: (schoolInfo === null || schoolInfo === void 0 ? void 0 : schoolInfo.slug) || (school === null || school === void 0 ? void 0 : school.slug) || "",
        cumulativeBalance: roundMoney(Number((school === null || school === void 0 ? void 0 : school.amountReceived) || 0)),
        verifiedOrderTotal,
        totalOrders: orders.length,
        paidOrdersCount: paidOrders.length,
        recurringOrdersCount,
        receivedCount,
        inFlightCount,
        unpaidPendingCount,
        pipelineBreakdown,
        campusNeeds,
        unreadInboxCount,
        totalInboxCount,
    };
});
const getDonarOrderSummary = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k;
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const normalizedEmail = String(email).trim();
    const emailMatcher = {
        $regex: `^${escapeRegex(normalizedEmail)}$`,
        $options: "i",
    };
    const donar = yield donar_model_1.Donar.findOne({ email: emailMatcher })
        .select("_id totalDonationAmount")
        .lean();
    const orderFilter = (donar === null || donar === void 0 ? void 0 : donar._id)
        ? { $or: [{ email: emailMatcher }, { user: donar._id }] }
        : { email: emailMatcher };
    const orders = yield order_model_1.Order.find(orderFilter)
        .select("totalAmount orderStatus paymentStatus payMonthly nextRecurringDate schoolId createdAt")
        .populate("schoolId", "name slug address")
        .sort({ createdAt: -1 })
        .lean();
    const paidOrders = orders.filter((o) => Boolean(o.paymentStatus));
    const unpaidPendingCount = orders.filter((o) => !o.paymentStatus && (0, order_constants_1.normalizeOrderStatus)(o.orderStatus) === "pending").length;
    const verifiedOrderTotal = roundMoney(paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0));
    const activeMonthlyOrders = paidOrders.filter((o) => o.payMonthly === "yes");
    let upcomingRenewalDate = null;
    const nowMs = Date.now();
    const recurringDates = activeMonthlyOrders
        .map((o) => (o.nextRecurringDate ? new Date(o.nextRecurringDate) : null))
        .filter((d) => Boolean(d && !Number.isNaN(d.getTime())))
        .sort((a, b) => a.getTime() - b.getTime());
    if (recurringDates.length > 0) {
        const nextFuture = recurringDates.find((d) => d.getTime() >= nowMs);
        upcomingRenewalDate = (nextFuture || recurringDates[0]).toISOString();
    }
    const schoolAcc = new Map();
    for (const order of paidOrders) {
        const schoolObj = order.schoolId && typeof order.schoolId === "object"
            ? order.schoolId
            : null;
        const key = (schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj._id)
            ? String(schoolObj._id)
            : order.schoolId
                ? String(order.schoolId)
                : "unassigned";
        const existing = schoolAcc.get(key) || {
            schoolId: key,
            schoolName: (schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.name) || "Partner Campus",
            slug: (schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.slug) || "",
            city: ((_h = schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.address) === null || _h === void 0 ? void 0 : _h.city) || "",
            state: ((_j = schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.address) === null || _j === void 0 ? void 0 : _j.state) || "",
            amount: 0,
            orderCount: 0,
            recurringCount: 0,
        };
        existing.amount += Number(order.totalAmount || 0);
        existing.orderCount += 1;
        if (order.payMonthly === "yes") {
            existing.recurringCount += 1;
        }
        schoolAcc.set(key, existing);
    }
    const schoolAllocation = Array.from(schoolAcc.values())
        .map((entry) => (Object.assign(Object.assign({}, entry), { amount: roundMoney(entry.amount) })))
        .sort((a, b) => b.amount - a.amount);
    const pipelineBreakdown = summarizePipeline(paidOrders);
    const receivedCount = ((_k = pipelineBreakdown.find((s) => s.status === "received")) === null || _k === void 0 ? void 0 : _k.count) || 0;
    const inFlightCount = paidOrders.length - receivedCount;
    return {
        totalDonationAmount: roundMoney(Number((donar === null || donar === void 0 ? void 0 : donar.totalDonationAmount) || verifiedOrderTotal || 0)),
        verifiedOrderTotal,
        totalOrders: orders.length,
        paidOrdersCount: paidOrders.length,
        schoolsSupportedCount: schoolAllocation.length,
        activeMonthlyCount: activeMonthlyOrders.length,
        upcomingRenewalDate,
        unpaidPendingCount,
        inFlightCount,
        receivedCount,
        schoolAllocation,
        pipelineBreakdown,
    };
});
exports.OrderService = {
    createOrder,
    getAllOrder,
    getSingleOrderById,
    deleteOrderById,
    updateOrderStatusById,
    getAllDonarOrder,
    getAllBursarOrder,
    updateOrderPaymentById,
    getBursarOrderSummary,
    getDonarOrderSummary,
};
