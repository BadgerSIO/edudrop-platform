import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../../error/ApiError";
import { IAdmin } from "./admin.interface";
import { Admin } from "./admin.model";
import { User } from "../user/user.model";
import { Product } from "../product/product.model";
import { Donar } from "../donar/donar.model";
import { School } from "../school/school.model";
import { Order } from "../order/order.model";

const getSingleAdmin = async (id: string): Promise<IAdmin | null> => {
  const result = await Admin.findOne({ id }).populate("school");
  return result;
};
const deleteAdmin = async (id: string): Promise<IAdmin | null> => {
  // check if the admin is exist
  const isExist = await Admin.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found !");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const admin = await Admin.findOneAndDelete({ id }, { session });
    if (!admin) {
      throw new ApiError(404, "Failed to delete admin");
    }

    await User.findOneAndDelete({ id }, { session });

    await session.commitTransaction();
    await session.endSession();

    return admin;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};
const updateAdmin = async (
  id: string,
  payload: Partial<IAdmin>
): Promise<IAdmin | null> => {
  const isExist = await Admin.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found !");
  }
  // const { name, guardian, localGuardian, ...adminData } = payload
  // const updatedAdminData: Partial<IAdmin> = { ...adminData }
  // if (name && Object.keys(name).length > 0) {
  //   Object.keys(name).forEach(key => {
  //     const nameKey = `name.${key}` as keyof Partial<IAdmin>
  //     ;(updatedAdminData as any)[nameKey] = name[key as keyof typeof name]
  //   })
  // }
  // if (guardian && Object.keys(guardian).length > 0) {
  //   Object.keys(guardian).forEach(key => {
  //     const guardianKey = `guardian.${key}` as keyof Partial<IAdmin> // `guardian.fisrtguardian`
  //     ;(updatedAdminData as any)[guardianKey] =
  //       guardian[key as keyof typeof guardian]
  //   })
  // }
  // if (localGuardian && Object.keys(localGuardian).length > 0) {
  //   Object.keys(localGuardian).forEach(key => {
  //     const localGuradianKey = `localGuardian.${key}` as keyof Partial<IAdmin> // `localGuardian.fisrtName`
  //     ;(updatedAdminData as any)[localGuradianKey] =
  //       localGuardian[key as keyof typeof localGuardian]
  //   })
  // }
  const result = await Admin.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};
const getCounts = async () => {
  try {
    const productCount = await Product.countDocuments({
      active: true,
    }).lean();
    const donarCount = await Donar.countDocuments({
      active: true,
    }).lean();
    const schoolCount = await School.countDocuments({
      active: true,
    }).lean();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Month is zero-indexed

    // Calculate the date range for the current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Calculate the date range for the previous month
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const startOfPreviousMonth = new Date(previousYear, previousMonth - 1, 1);
    const endOfPreviousMonth = new Date(
      previousYear,
      previousMonth,
      0,
      23,
      59,
      59,
      999
    );
    //donar count last month
    const donarCountLastMonth = await Donar.find(
      {
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      },
      { _id: 1 }
    ).lean();
    // Find orders within the current month
    const currentMonthOrders = await Order.find(
      {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        paymentStatus: true,
      },
      { totalAmount: 1 }
    ).lean();

    // Find orders within the previous month
    const previousMonthOrders = await Order.find(
      {
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
        paymentStatus: true,
      },
      { totalAmount: 1 }
    ).lean();

    // Calculate total revenue for the current and previous months
    const currentMonthRevenue = currentMonthOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );
    const previousMonthRevenue = previousMonthOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    // Calculate the percentage change (avoid division by zero)
    let percentageChange = 0;
    if (previousMonthRevenue !== 0) {
      percentageChange =
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100;
    }

    // Find orders with paymentStatus as true
    const orders = await Order.find(
      { paymentStatus: true },
      { totalAmount: 1 }
    ).lean();

    // Calculate total revenue from these orders
    const totalRevenue = orders.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);

    // Calculate 12-month revenue trend using real database records
    const twelveMonthsAgo = new Date(currentYear, currentMonth - 12, 1);
    const monthlyAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: true,
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = monthlyAgg.find(
        (item) => item._id.year === y && item._id.month === m
      );
      monthlyRevenue.push({
        month: monthNames[m - 1],
        revenue: found ? Math.round(found.revenue) : 0,
      });
    }

    return {
      totalRevenue,
      percentageChange: Math.round(percentageChange * 10) / 10,
      productCount,
      donarCount,
      donarCountLastMonth: donarCountLastMonth.length,
      schoolCount,
      monthlyRevenue,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error; // Handle the error as per your application's needs
  }
};

export const AdminService = {
  getSingleAdmin,
  deleteAdmin,
  updateAdmin,
  getCounts,
};
