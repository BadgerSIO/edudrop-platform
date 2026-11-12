import mongoose, { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import {
  CANONICAL_ORDER_STAGES,
  CanonicalOrderStage,
  normalizeOrderStatus,
  orderSearchableFields,
} from "./order.constants";
import { IOrder, IOrderFilters } from "./order.interface";
import { Order } from "./order.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";
import { Bursar } from "../bursar/bursar.model";
import { User } from "../user/user.model";
import { Donar } from "../donar/donar.model";
import { IDonar } from "../donar/donar.interface";
import { IUser } from "../user/user.interface";
import { senderMail, transport } from "../../../config/nodemailer";
import emailTemplate from "../../../shared/emailTemplate";
import { INotification } from "../notification/notification.interface";
import { School } from "../school/school.model";
import { SchoolInfo } from "../schoolInfo/schoolInfo.model";
import { SchoolInbox } from "../schoolInbox/schoolInbox.model";
import { NotificationService } from "../notification/notification.services";
import { Product } from "../product/product.model";
import crypto from "crypto";
import generateOrderID from "../../../helper/generateOrderId";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildOrderIdentifierQuery = (idOrCode: string) => {
  const trimmed = String(idOrCode || "").trim();
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return {
      $or: [{ _id: trimmed }, { orderId: trimmed }],
    };
  }
  return {
    orderId: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
  };
};

const createOrder = async (
  payload: IOrder,
  currentUser?: Partial<IUser> | null
): Promise<IOrder | null> => {
  if (currentUser && currentUser.role !== "donar") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "School Bursar and Platform Admin accounts cannot place sponsorship orders. Please sign out and continue as a Donor or Guest."
    );
  }

  payload.email = String(payload.email || "").trim().toLowerCase();
  payload.orderId = payload.orderId
    ? String(payload.orderId).trim()
    : generateOrderID();

  // Idempotency check: if an order with this orderId or transactionId already exists, return it
  if (payload.orderId) {
    const existingOrder = await Order.findOne({ orderId: payload.orderId });
    if (existingOrder) {
      return existingOrder;
    }
  }
  if (payload.transactionId) {
    const existingOrderByTx = await Order.findOne({
      transactionId: payload.transactionId,
    });
    if (existingOrderByTx) {
      return existingOrderByTx;
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Authoritative server-side price recalculation from database products
    if (payload.products && Array.isArray(payload.products) && payload.products.length > 0) {
      let authoritativeTotal = 0;
      for (const item of payload.products) {
        if (item.slug) {
          const dbProduct = await Product.findOne({ slug: item.slug }).session(session);
          if (dbProduct) {
            const unitPrice =
              dbProduct.sale && dbProduct.salePrice && dbProduct.salePrice > 0
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

    if (payload?.payMonthly === "yes") {
      const today = new Date();
      const oneMonthLater = new Date(today.setMonth(today.getMonth() + 1));
      payload["nextRecurringDate"] = oneMonthLater;
    }
    payload["orderStatus"] = "processing";
    payload["paymentStatus"] = true;

    let newAccountCredentials: { email: string; password: string } | null = null;

    // Fetch the donor and user by email (case-insensitive) to prevent duplicate registration
    // and protect non-donor staff accounts from silent hybrid corruption
    const emailMatcher = {
      email: { $regex: `^${escapeRegex(payload.email)}$`, $options: "i" },
    };

    const existingUser = await User.findOne(emailMatcher).session(session);
    if (existingUser && existingUser.role !== "donar") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "This email belongs to a School Bursar or Platform Admin account and cannot be used for sponsorship checkout. Please sign out and use a Donor email address."
      );
    }

    let donor = await Donar.findOne(
      emailMatcher,
      { totalDonationAmount: 1 }
    ).session(session);

    if (donor) {
      // Increment the donor's totalDonationAmount by the order's totalAmount
      donor.totalDonationAmount =
        (donor.totalDonationAmount || 0) + payload.totalAmount;
      payload["user"] = donor._id;
      await donor.save({ session });
    } else {
      let donarData: Partial<IDonar> = {
        email: payload.email,
        contactNo: payload.contactNo,
        name: {
          firstName: payload?.name?.firstName,
          lastName: payload?.name?.lastName,
        },
        enabled: true,
        active: true,
        totalDonationAmount: payload.totalAmount || 0,
        address: {
          presentAddress: payload?.presentAddress || "",
          city: payload?.city || "",
          country: payload?.country || "",
          zipCode: payload?.zipCode || "",
        },
      };
      const newDonar = await Donar.create([donarData], { session });
      payload["user"] = newDonar[0]._id;

      if (!existingUser) {
        const randomSecret = crypto.randomBytes(4).toString("hex");
        const generatedPass = `Edu#${randomSecret}A1!`;
        let userData: IUser = {
          role: "donar",
          email: payload?.email,
          password: generatedPass,
          donar: newDonar[0]._id,
        };
        newAccountCredentials = {
          email: payload.email,
          password: userData.password,
        };
        const newUser = await User.create([userData], { session });
        if (!newUser.length) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create Donar user");
        }

        let emailPayloadDonar = {
          username: payload.email,
          password: userData.password,
        };
        transport.sendMail({
          from: `${senderMail}`,
          to: payload.email,
          subject: "EduDrop Donor Account Created",
          text: `Donor account created! Username: ${payload.email} | Temporary Password: ${userData.password}`,
          html: emailTemplate("donarAccount", emailPayloadDonar),
        }).catch((mailError) => {
          console.error("Failed to send donor welcome email:", mailError);
        });
      } else {
        if (!existingUser.donar) {
          existingUser.donar = newDonar[0]._id;
          await existingUser.save({ session });
        }
      }
    }

    // Increment school's amountReceived
    if (payload.schoolId) {
      await School.findByIdAndUpdate(
        payload.schoolId,
        { $inc: { amountReceived: payload.totalAmount } },
        { session }
      );
    }

    const result = await Order.create([payload], { session });
    await session.commitTransaction();
    session.endSession();

    const populated = await Order.findById(result[0]._id).populate(
      "schoolId",
      "name contactNo address"
    );
    const orderDoc: Record<string, any> = (populated || result[0]).toObject();
    if (newAccountCredentials) {
      orderDoc.newAccountCredentials = newAccountCredentials;
    }
    return orderDoc as unknown as IOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // If a transient concurrency error occurred, check if the order was created by a concurrent request
    if (!(error instanceof ApiError) && payload.orderId) {
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const existingOrder = await Order.findOne({ orderId: payload.orderId }).populate(
          "schoolId",
          "name contactNo address"
        );
        if (existingOrder) {
          return existingOrder;
        }
      }
    }
    throw error; // Propagate the error upwards for handling
  }
};

const buildOrderQuery = (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions,
  extraConditions: Record<string, any>[] = []
) => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions: Record<string, any>[] = [];

  if (searchTerms) {
    andConditions.push({
      $or: orderSearchableFields.map((field) => ({
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
        [fields]:
          fields === "orderStatus" && value === "received"
            ? { $in: ["received", "delivered"] }
            : value,
      })),
    });
  }

  for (const condition of extraConditions) {
    andConditions.push(condition);
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  return { whereCondition, sortCondition, page, limit, skip };
};

const getAllOrder = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IOrder[]>> => {
  const { whereCondition, sortCondition, page, limit, skip } =
    buildOrderQuery(filters, paginationOptions);
  const [result, total] = await Promise.all([
    Order.find(whereCondition)
      .populate("schoolId")
      .populate("user")
      .sort(sortCondition)
      .skip(skip)
      .limit(limit),
    Order.countDocuments(whereCondition),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getAllDonarOrder = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions,
  email: string
): Promise<IGenericResponse<IOrder[]>> => {
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const { whereCondition, sortCondition, page, limit, skip } =
    buildOrderQuery(filters, paginationOptions, [{ email }]);
  const [result, total] = await Promise.all([
    Order.find(whereCondition)
      .populate("schoolId")
      .sort(sortCondition)
      .skip(skip)
      .limit(limit),
    Order.countDocuments(whereCondition),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getAllBursarOrder = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions,
  email: string
): Promise<IGenericResponse<IOrder[]>> => {
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const bursar = await Bursar.findOne({ email });
  if (!bursar) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const schoolId = bursar?.school;
  if (!schoolId) {
    const { page, limit } =
      paginationHelper.calculatePagination(paginationOptions);
    return {
      meta: { page, limit, total: 0 },
      data: [],
    };
  }
  const { whereCondition, sortCondition, page, limit, skip } =
    buildOrderQuery(filters, paginationOptions, [{ schoolId }]);
  const [result, total] = await Promise.all([
    Order.find(whereCondition)
      .populate("schoolId")
      .sort(sortCondition)
      .skip(skip)
      .limit(limit),
    Order.countDocuments(whereCondition),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getSingleOrderById = async (
  id: string,
  currentUser?: Partial<IUser> | null
): Promise<IOrder | null> => {
  const result = await Order.findOne(buildOrderIdentifierQuery(id)).populate({
    path: "schoolId",
    select: "name contactNo address",
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (currentUser && currentUser.role !== "admin") {
    if (currentUser.role === "donar") {
      const ownsByEmail =
        result.email?.toLowerCase() === currentUser.email?.toLowerCase();
      const ownsByDonorId =
        currentUser.donar &&
        result.user &&
        String(result.user) === String(currentUser.donar);

      if (!ownsByEmail && !ownsByDonorId) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden: You do not have access to this order"
        );
      }
    } else if (currentUser.role === "bursar") {
      const bursar = await Bursar.findOne({ email: currentUser.email })
        .select("school")
        .lean();
      const orderSchoolId =
        typeof result.schoolId === "object" && result.schoolId !== null
          ? (result.schoolId as any)._id
          : result.schoolId;

      if (
        !bursar?.school ||
        !orderSchoolId ||
        String(bursar.school) !== String(orderSchoolId)
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden: This order is not assigned to your school"
        );
      }
    } else {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Forbidden: Unauthorized role"
      );
    }
  }

  return result;
};

const updateOrderStatusById = async (
  id: string,
  email: string,
  payload: Partial<IOrder>
): Promise<IOrder | null> => {
  const existingOrder = await Order.findOne(buildOrderIdentifierQuery(id))
    .select("orderStatus payMonthly orderId schoolId")
    .lean();

  if (!existingOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const user = await User.findOne({ email }).select("role").lean();
  if (!user || (user.role !== "admin" && user.role !== "bursar")) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden: Unauthorized request");
  }

  if (user.role === "bursar") {
    const bursar = await Bursar.findOne({ email }).select("school").lean();
    if (
      !bursar?.school ||
      String(bursar.school) !== String(existingOrder.schoolId) ||
      payload?.orderStatus !== "received" ||
      existingOrder.orderStatus !== "on the way"
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Forbidden: Bursars can only confirm delivery received on their own school's in-transit orders"
      );
    }
  }

  let payMonthly = existingOrder.payMonthly;

  if (payMonthly === "yes" && payload.orderStatus === "received") {
    const orderCreatedAlready = await Order.findOne({
      previousOrderId: { $exists: true, $eq: existingOrder.orderId },
    });
    if (!orderCreatedAlready?.previousOrderId) {
      const previousOrderData = await Order.findById(existingOrder?._id).lean();
      if (!previousOrderData) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Previous order data not found"
        );
      }
      const {
        _id,
        transactionId,
        card,
        orderId,
        createdAt,
        updatedAt,
        ...basicOrder
      } = previousOrderData;

      let nextRecurring = new Date(basicOrder.nextRecurringDate);
      nextRecurring.setMonth(nextRecurring.getMonth() + 1);
      basicOrder.nextRecurringDate = nextRecurring;
      basicOrder.paymentStatus = false;
      basicOrder.orderStatus = "pending";
      basicOrder["previousOrderId"] = orderId;
      let newOrderId = generateOrderID();
      let makeNewOrder = { orderId: newOrderId, ...basicOrder };

      try {
        const newOrder = await Order.create(makeNewOrder);
        if (!newOrder) {
          throw new Error("Failed to create new order");
        }
      } catch (error: any) {
        if (error.code === 11000 && error.name === "MongoServerError") {
          // Handle duplicate key error here
          throw new ApiError(httpStatus.BAD_REQUEST, "Duplicate order ID");
        } else {
          // Handle other errors
          throw new ApiError(httpStatus.NOT_MODIFIED, `${error}`);
        }
      }
    }
  }

  const result = await Order.findOneAndUpdate(
    { _id: existingOrder._id },
    { orderStatus: payload?.orderStatus },
    {
      new: true,
      runValidators: true,
    }
  );
  // Non-blocking order status notifications & email
  if (result) {
    try {
      const orderLabel = result.orderId || String(result._id).slice(-6);
      const routeKey = result.orderId || String(result._id);
      const findDonar = result.user
        ? await User.findOne({ donar: result.user }, { _id: 1 }).lean()
        : null;

      if (findDonar?._id) {
        await NotificationService.createNotificationSafe({
          user: findDonar._id,
          message: `Order ${orderLabel} status changed to ${payload.orderStatus}`,
          link: `/donar-dashboard/my-orders/${routeKey}`,
          read: false,
        });
      }

      let counterpartyEmail: string | undefined;
      if (user.role === "admin") {
        const findSchool = result.schoolId
          ? await School.findById(result.schoolId, { bursar: 1 }).lean()
          : null;
        const findBursarUser = findSchool?.bursar
          ? await User.findOne(
              { bursar: findSchool.bursar },
              { _id: 1, email: 1 }
            ).lean()
          : null;

        if (findBursarUser?._id) {
          counterpartyEmail = findBursarUser.email;
          await NotificationService.createNotificationSafe({
            user: findBursarUser._id,
            message: `Order ${orderLabel} status: ${payload.orderStatus}`,
            link: `/bursar-dashboard/my-orders/${routeKey}`,
            read: false,
          });
        }
      } else {
        const findAdmin = await User.findOne(
          { role: "admin" },
          { _id: 1, email: 1 }
        ).lean();
        if (findAdmin?._id) {
          counterpartyEmail = findAdmin.email;
          await NotificationService.createNotificationSafe({
            user: findAdmin._id,
            message: `Order ${orderLabel} status changed to ${payload?.orderStatus}`,
            link: `/dashboard/orders/${routeKey}`,
            read: false,
          });
        }
      }

      const mailRecipients = [counterpartyEmail, result.email].filter(
        (addr): addr is string => Boolean(addr)
      );
      if (mailRecipients.length > 0) {
        const emailPayload = {
          orderId: result.orderId,
          orderStatus: result.orderStatus,
        };
        await transport
          .sendMail({
            from: `${senderMail}`,
            to: mailRecipients,
            subject: "Order status changed",
            text: "Order status changed",
            html: emailTemplate("orderStatus", emailPayload),
          })
          .catch(console.error);
      }
    } catch (notifyErr) {
      console.error("Non-critical order status notification error:", notifyErr);
    }
  }

  return result;
};
const updateOrderPaymentById = async (
  id: string,
  email: string,
  payload: Partial<IOrder>
): Promise<IOrder | null> => {
  const existingOrder = await Order.findOne(buildOrderIdentifierQuery(id))
    .select("orderStatus payMonthly email orderId")
    .lean();
  if (!existingOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  const user = await User.findOne({ email }).select("role email").lean();
  if (
    !user ||
    (user.role !== "admin" &&
      !(
        user.role === "donar" &&
        existingOrder.email?.toLowerCase() === user.email?.toLowerCase()
      ))
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Forbidden: Only the owning donor or an admin can update order payment"
    );
  }

  const updateFields: Partial<IOrder> = {};
  if (payload.card !== undefined) updateFields.card = payload.card;
  if (payload.transactionId !== undefined)
    updateFields.transactionId = payload.transactionId;
  if (payload.paymentStatus !== undefined)
    updateFields.paymentStatus = payload.paymentStatus;
  if (payload.orderId && !existingOrder.orderId)
    updateFields.orderId = payload.orderId;

  const result = await Order.findOneAndUpdate(
    { _id: existingOrder._id },
    updateFields,
    {
      new: true,
      runValidators: true,
    }
  ).populate("schoolId", "name contactNo address");
  if (result) {
    try {
      const orderLabel = result.orderId || String(result._id).slice(-6);
      const routeKey = result.orderId || String(result._id);
      const findAdmin = await User.findOne(
        { role: "admin" },
        { _id: 1, email: 1 }
      ).lean();

      if (findAdmin?._id) {
        await NotificationService.createNotificationSafe({
          user: findAdmin._id,
          message: `Payment received for order ${orderLabel}`,
          link: `/dashboard/orders/${routeKey}`,
          read: false,
        });
      }

      if (findAdmin?.email) {
        const emailPayload = {
          orderId: result.orderId,
          paymentStatus: result.paymentStatus,
        };
        await transport
          .sendMail({
            from: `${senderMail}`,
            to: findAdmin.email,
            subject: "Payment status changed",
            text: "Payment status changed",
            html: emailTemplate("paymentStatus", emailPayload),
          })
          .catch(console.error);
      }
    } catch (notifyErr) {
      console.error("Non-critical payment notification error:", notifyErr);
    }
  }
  return result;
};

const deleteOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findOneAndDelete(buildOrderIdentifierQuery(id));
  return result as unknown as IOrder | null; // Explicitly cast to IOrder or null
};

const roundMoney = (val: number): number => Math.round(val * 100) / 100;

const PRIORITY_RANK: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const summarizePipeline = (orders: Array<{ orderStatus?: string; totalAmount?: number }>) => {
  const buckets: Record<CanonicalOrderStage, { count: number; amount: number }> = {
    pending: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    "on the way": { count: 0, amount: 0 },
    received: { count: 0, amount: 0 },
  };

  for (const order of orders) {
    const stage = normalizeOrderStatus(order.orderStatus);
    buckets[stage].count += 1;
    buckets[stage].amount += Number(order.totalAmount || 0);
  }

  return CANONICAL_ORDER_STAGES.map((stage) => ({
    status: stage,
    count: buckets[stage].count,
    amount: roundMoney(buckets[stage].amount),
  }));
};

const getBursarOrderSummary = async (email: string) => {
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const normalizedEmail = String(email).trim();
  const bursar = await Bursar.findOne({
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
  })
    .select("_id school")
    .lean();

  if (!bursar?.school) {
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

  const [school, schoolInfo, orders, unreadInboxCount, totalInboxCount] =
    await Promise.all([
      School.findById(bursar.school)
        .select("name slug amountReceived")
        .lean(),
      SchoolInfo.findOne({ school: bursar.school })
        .select("campusNeeds schoolName slug")
        .lean(),
      Order.find({ schoolId: bursar.school })
        .select("totalAmount orderStatus paymentStatus payMonthly createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      SchoolInbox.countDocuments({
        bursar: bursar._id,
        seen: false,
        isDeleted: { $ne: true },
      }),
      SchoolInbox.countDocuments({
        bursar: bursar._id,
        isDeleted: { $ne: true },
      }),
    ]);

  const paidOrders = orders.filter((o) => Boolean(o.paymentStatus));
  const unpaidPendingCount = orders.filter(
    (o) => !o.paymentStatus && normalizeOrderStatus(o.orderStatus) === "pending"
  ).length;
  const verifiedOrderTotal = roundMoney(
    paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
  );
  const recurringOrdersCount = paidOrders.filter(
    (o) => o.payMonthly === "yes"
  ).length;

  const pipelineBreakdown = summarizePipeline(paidOrders);
  const receivedCount =
    pipelineBreakdown.find((s) => s.status === "received")?.count || 0;
  const inFlightCount = paidOrders.length - receivedCount;

  const campusNeeds = Array.isArray(schoolInfo?.campusNeeds)
    ? [...schoolInfo.campusNeeds]
        .sort(
          (a, b) =>
            (PRIORITY_RANK[String(a.priority || "medium")] ?? 1) -
            (PRIORITY_RANK[String(b.priority || "medium")] ?? 1)
        )
        .map((need) => ({
          itemTitle: need.itemTitle,
          productSlug: need.productSlug || "",
          targetQuantity: Number(need.targetQuantity || 0),
          fulfilledQuantity: Number(need.fulfilledQuantity || 0),
          priority: (need.priority || "medium") as "high" | "medium" | "low",
        }))
    : [];

  return {
    hasSchool: Boolean(school),
    schoolId: String(bursar.school),
    schoolName: schoolInfo?.schoolName || school?.name || "Partner School",
    schoolSlug: schoolInfo?.slug || school?.slug || "",
    cumulativeBalance: roundMoney(Number(school?.amountReceived || 0)),
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
};

const getDonarOrderSummary = async (email: string) => {
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const normalizedEmail = String(email).trim();
  const emailMatcher = {
    $regex: `^${escapeRegex(normalizedEmail)}$`,
    $options: "i",
  };
  const donar = await Donar.findOne({ email: emailMatcher })
    .select("_id totalDonationAmount")
    .lean();

  const orderFilter = donar?._id
    ? { $or: [{ email: emailMatcher }, { user: donar._id }] }
    : { email: emailMatcher };

  const orders = await Order.find(orderFilter)
    .select(
      "totalAmount orderStatus paymentStatus payMonthly nextRecurringDate schoolId createdAt"
    )
    .populate("schoolId", "name slug address")
    .sort({ createdAt: -1 })
    .lean();

  const paidOrders = orders.filter((o) => Boolean(o.paymentStatus));
  const unpaidPendingCount = orders.filter(
    (o) => !o.paymentStatus && normalizeOrderStatus(o.orderStatus) === "pending"
  ).length;
  const verifiedOrderTotal = roundMoney(
    paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
  );
  const activeMonthlyOrders = paidOrders.filter((o) => o.payMonthly === "yes");

  let upcomingRenewalDate: string | null = null;
  const nowMs = Date.now();
  const recurringDates = activeMonthlyOrders
    .map((o) => (o.nextRecurringDate ? new Date(o.nextRecurringDate) : null))
    .filter((d): d is Date => Boolean(d && !Number.isNaN(d.getTime())))
    .sort((a, b) => a.getTime() - b.getTime());

  if (recurringDates.length > 0) {
    const nextFuture = recurringDates.find((d) => d.getTime() >= nowMs);
    upcomingRenewalDate = (nextFuture || recurringDates[0]).toISOString();
  }

  const schoolAcc = new Map<
    string,
    {
      schoolId: string;
      schoolName: string;
      slug: string;
      city: string;
      state: string;
      amount: number;
      orderCount: number;
      recurringCount: number;
    }
  >();

  for (const order of paidOrders as any[]) {
    const schoolObj =
      order.schoolId && typeof order.schoolId === "object"
        ? order.schoolId
        : null;
    const key = schoolObj?._id
      ? String(schoolObj._id)
      : order.schoolId
        ? String(order.schoolId)
        : "unassigned";

    const existing = schoolAcc.get(key) || {
      schoolId: key,
      schoolName: schoolObj?.name || "Partner Campus",
      slug: schoolObj?.slug || "",
      city: schoolObj?.address?.city || "",
      state: schoolObj?.address?.state || "",
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
    .map((entry) => ({
      ...entry,
      amount: roundMoney(entry.amount),
    }))
    .sort((a, b) => b.amount - a.amount);

  const pipelineBreakdown = summarizePipeline(paidOrders);
  const receivedCount =
    pipelineBreakdown.find((s) => s.status === "received")?.count || 0;
  const inFlightCount = paidOrders.length - receivedCount;

  return {
    totalDonationAmount: roundMoney(
      Number(donar?.totalDonationAmount || verifiedOrderTotal || 0)
    ),
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
};

export const OrderService = {
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
