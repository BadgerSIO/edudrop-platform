import mongoose, { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { orderSearchableFields } from "./order.constants";
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

const getAllOrder = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IOrder[]>> => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions = [];
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
        [fields]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }
  const whereCondition =
    andConditions?.length > 0 ? { $and: andConditions } : {};
  const result = await Order.find(whereCondition)
    .populate("schoolId")
    .populate("user")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments(whereCondition);
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
  const { searchTerms, ...filterableData } = filters;
  const andConditions = [];
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
        [fields]: value,
      })),
    });
  }
  if (email) {
    andConditions.push({ email: email }); // Replace 'email' with the correct field name in your Order schema
  }
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }
  const whereCondition =
    andConditions?.length > 0 ? { $and: andConditions } : {};
  const result = await Order.find(whereCondition)
    .populate("schoolId")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments(whereCondition);
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
  const { searchTerms, ...filterableData } = filters;
  const andConditions = [];
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
        [fields]: value,
      })),
    });
  }
  if (schoolId) {
    andConditions.push({ schoolId }); // Replace 'email' with the correct field name in your Order schema
  }
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }
  const whereCondition =
    andConditions?.length > 0 ? { $and: andConditions } : {};
  const result = await Order.find(whereCondition)
    .populate("schoolId")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments(whereCondition);
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

export const OrderService = {
  createOrder,
  getAllOrder,
  getSingleOrderById,
  deleteOrderById,
  updateOrderStatusById,
  getAllDonarOrder,
  getAllBursarOrder,
  updateOrderPaymentById,
};
