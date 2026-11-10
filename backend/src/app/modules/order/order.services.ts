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
import { Notification } from "../notification/notification.model";
import { Product } from "../product/product.model";
import crypto from "crypto";
import generateOrderID from "../../../helper/generateOrderId";

const createOrder = async (payload: IOrder): Promise<IOrder | null> => {
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

    // Fetch the donor and user by email to prevent duplicate registration
    let donor = await Donar.findOne(
      { email: payload.email },
      { totalDonationAmount: 1 }
    ).session(session);

    const existingUser = await User.findOne({ email: payload.email }).session(
      session
    );

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

    // If an error occurred (e.g. concurrent race condition / WriteConflict), check if the order was created by the concurrent request
    if (payload.orderId) {
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
const getSingleOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findById(id).populate({
    path: "schoolId",
    select: "name contactNo address",
  });
  return result;
};

const updateOrderStatusById = async (
  id: string,
  email: string,
  payload: Partial<IOrder>
): Promise<IOrder | null> => {
  const existingOrder = await Order.findOne({ _id: id })
    .select("orderStatus payMonthly orderId")
    .lean();

  if (!existingOrder) {
    throw new Error("Order not found");
  }
  const user = await User.findOne({ email }).select("role").lean();
  if (
    !user ||
    (user.role !== "admin" && user.role !== "bursar") ||
    (user.role === "bursar" &&
      payload?.orderStatus !== "received" &&
      existingOrder.orderStatus !== "on the way")
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request");
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
    { _id: id },
    { orderStatus: payload?.orderStatus },
    {
      new: true,
      runValidators: true,
    }
  );
  //notification
  if (result) {
    const findDonar = await User.findOne(
      { donar: result.user },
      { _id: 1 }
    ).lean();
    if (!findDonar) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found Noti");
    }
    let notificationPayloadDonar: INotification = {
      user: findDonar?._id,
      message: `Order Status changed to ${payload.orderStatus}`,
      link: `/donar-dashboard/my-orders/${result?._id}`,
      read: false,
    };
    const notifyDonar = await Notification.create(notificationPayloadDonar);
    let getEmail;
    if (user.role === "admin") {
      const findBursar = await School.findById(
        { _id: result.schoolId },
        { bursar: 1 }
      ).lean();
      const findBursarUser = await User.findOne(
        { bursar: findBursar?.bursar },
        {
          _id: 1,
          email: 1,
        }
      ).lean();

      if (!findBursarUser) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found Noti");
      }
      getEmail = findBursarUser?.email;
      let notificationPayload: INotification = {
        user: findBursarUser?._id,
        message: `Order status ${payload.orderStatus}`,
        link: `/bursar-dashboard/my-orders/${result?._id}`,
        read: false,
      };

      const notifyBursar = await Notification.create(notificationPayload);
    } else {
      const findAdmin = await User.findOne(
        { role: "admin" },
        { _id: 1, email: 1 }
      ).lean();
      getEmail = findAdmin?.email;
      if (!findAdmin) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found Noti");
      }
      let notificationPayloadAdmin: INotification = {
        user: findAdmin?._id,
        message: `Order status changed to ${payload?.orderStatus}`,
        link: `/dashboard/orders/${result?._id}`,
        read: false,
      };
      const notifyAdmin = await Notification.create(notificationPayloadAdmin);
    }

    let emailPayload = {
      orderId: result?.orderId,
      orderStatus: result?.orderStatus,
    };
    const info = await transport.sendMail({
      from: `${senderMail}`, // sender address
      to: [getEmail as string, result?.email], // list of receivers
      subject: "Order status changed", // Subject line
      text: "Order status changed", // plain text body
      html: emailTemplate("orderStatus", emailPayload),
    });
  }

  return result;
};
const updateOrderPaymentById = async (
  id: string,
  email: string,
  payload: Partial<IOrder>
): Promise<IOrder | null> => {
  const existingOrder = await Order.findOne({ _id: id })
    .select("orderStatus payMonthly")
    .lean();
  if (!existingOrder) {
    throw new Error("Order not found");
  }
  const user = await User.findOne({ email }).select("role").lean();
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request 3");
  }

  const result = await Order.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  }).populate("schoolId", "name contactNo address");
  if (result) {
    const findAdmin = await User.findOne(
      { role: "admin" },
      { _id: 1, email: 1 }
    ).lean();
    if (!findAdmin) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found Noti");
    }
    let notificationPayloadAdmin: INotification = {
      user: findAdmin?._id,
      message: `Payment made for order`,
      link: `/dashboard/orders/${result?._id}`,
      read: false,
    };
    const notifyAdmin = await Notification.create(notificationPayloadAdmin);
    let emailPayload = {
      orderId: result?.orderId,
      paymentStatus: result?.paymentStatus,
    };
    const info = await transport.sendMail({
      from: `${senderMail}`, // sender address
      to: findAdmin?.email, // list of receivers
      subject: "Payment status changed", // Subject line
      text: "Payment status changed", // plain text body
      html: emailTemplate("paymentStatus", emailPayload),
    });
  }
  return result;
};

const deleteOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findByIdAndDelete(id);
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
