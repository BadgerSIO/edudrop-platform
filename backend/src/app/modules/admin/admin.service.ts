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
import { Category } from "../category/category.model";
import { Submissions } from "../submissions/submissions.model";
import {
  CANONICAL_ORDER_STAGES,
  CanonicalOrderStage,
  normalizeOrderStatus,
} from "../order/order.constants";
import {
  buildAllowListedSetPayload,
  resolveAvatarUpdate,
  safeUnlinkUserImage,
} from "../../../helper/profileUpdateHelper";

const getSingleAdmin = async (id: string): Promise<IAdmin | null> => {
  const result = await Admin.findById(id);
  return result;
};
const deleteAdmin = async (id: string): Promise<IAdmin | null> => {
  // check if the admin is exist
  const isExist = await Admin.findById(id);

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found !");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const admin = await Admin.findByIdAndDelete(id, { session });
    if (!admin) {
      throw new ApiError(404, "Failed to delete admin");
    }

    await User.findOneAndDelete({ admin: id }, { session });

    await session.commitTransaction();
    await session.endSession();

    return admin;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const updateAdmin = async (
  id: string,
  payload: Partial<IAdmin> & { removeProfileImage?: boolean | string },
  newProfileImagePath?: string
): Promise<IAdmin | null> => {
  const isExist = await Admin.findById(id, { profileImage: 1 }).lean();
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found !");
  }

  const setPayload = buildAllowListedSetPayload(
    payload as Record<string, any>,
    ["contactNo", "presentAddress", "permanentAddress"],
    { name: ["firstName", "lastName"] }
  );

  const { nextProfileImage, oldImageToDelete } = resolveAvatarUpdate(
    isExist.profileImage,
    newProfileImagePath,
    payload.removeProfileImage
  );

  if (nextProfileImage !== undefined) {
    setPayload.profileImage = nextProfileImage;
  }

  if (Object.keys(setPayload).length === 0) {
    return Admin.findById(id);
  }

  const result = await Admin.findOneAndUpdate(
    { _id: id },
    { $set: setPayload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (oldImageToDelete) {
    await safeUnlinkUserImage(oldImageToDelete);
  }

  return result;
};
const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type TimeRangeKey = "all" | "12m" | "6m";

interface MonthlySeriesPoint {
  monthLabel: string;
  yearMonth: string;
  oneTimeRevenue: number;
  recurringRevenue: number;
  totalRevenue: number;
  orderCount: number;
}

interface RangeSeriesSummary {
  points: MonthlySeriesPoint[];
  activeMonthsCount: number;
  windowOrderCount: number;
  windowRevenue: number;
  spanLabel: string | null;
}

const formatYearMonth = (year: number, month1To12: number): string =>
  `${year}-${String(month1To12).padStart(2, "0")}`;

const formatMonthLabel = (year: number, month1To12: number): string =>
  `${MONTH_SHORT_NAMES[month1To12 - 1]} ${year}`;

const roundMoney = (val: number): number => Math.round(val * 100) / 100;

const buildMonthSeriesWindow = (
  paidOrders: Array<{
    totalAmount?: number;
    payMonthly?: string;
    createdAt?: Date;
  }>,
  range: TimeRangeKey,
  now: Date
): RangeSeriesSummary => {
  const bucketMap = new Map<
    string,
    {
      year: number;
      month: number;
      oneTimeRevenue: number;
      recurringRevenue: number;
      orderCount: number;
    }
  >();

  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const order of paidOrders) {
    if (!order.createdAt) continue;
    const d = new Date(order.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const t = d.getTime();
    if (t < minTime) minTime = t;
    if (t > maxTime) maxTime = t;

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = formatYearMonth(year, month);
    const existing = bucketMap.get(key) || {
      year,
      month,
      oneTimeRevenue: 0,
      recurringRevenue: 0,
      orderCount: 0,
    };

    const amt = Number(order.totalAmount || 0);
    if (order.payMonthly === "yes") {
      existing.recurringRevenue += amt;
    } else {
      existing.oneTimeRevenue += amt;
    }
    existing.orderCount += 1;
    bucketMap.set(key, existing);
  }

  const orderedMonthKeys: Array<{ year: number; month: number; key: string }> =
    [];

  if (range === "all") {
    if (bucketMap.size > 0 && Number.isFinite(minTime) && Number.isFinite(maxTime)) {
      const minDate = new Date(minTime);
      const maxDate = new Date(maxTime);
      let cursorYear = minDate.getFullYear();
      let cursorMonth = minDate.getMonth() + 1;
      const endYear = maxDate.getFullYear();
      const endMonth = maxDate.getMonth() + 1;

      const totalMonthsSpan =
        (endYear - cursorYear) * 12 + (endMonth - cursorMonth) + 1;
      if (totalMonthsSpan <= 36) {
        while (
          cursorYear < endYear ||
          (cursorYear === endYear && cursorMonth <= endMonth)
        ) {
          orderedMonthKeys.push({
            year: cursorYear,
            month: cursorMonth,
            key: formatYearMonth(cursorYear, cursorMonth),
          });
          cursorMonth += 1;
          if (cursorMonth > 12) {
            cursorMonth = 1;
            cursorYear += 1;
          }
        }
      } else {
        const sortedActive = Array.from(bucketMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-36);
        for (const [key, item] of sortedActive) {
          orderedMonthKeys.push({ year: item.year, month: item.month, key });
        }
      }
    }
  } else {
    const windowMonths = range === "6m" ? 6 : 12;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    for (let i = windowMonths - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      orderedMonthKeys.push({
        year,
        month,
        key: formatYearMonth(year, month),
      });
    }
  }

  const points: MonthlySeriesPoint[] = orderedMonthKeys.map(({ year, month, key }) => {
    const entry = bucketMap.get(key);
    const oneTime = roundMoney(entry?.oneTimeRevenue || 0);
    const recurring = roundMoney(entry?.recurringRevenue || 0);
    return {
      monthLabel: formatMonthLabel(year, month),
      yearMonth: key,
      oneTimeRevenue: oneTime,
      recurringRevenue: recurring,
      totalRevenue: roundMoney(oneTime + recurring),
      orderCount: entry?.orderCount || 0,
    };
  });

  const activePoints = points.filter((p) => p.orderCount > 0);
  const windowOrderCount = activePoints.reduce((acc, p) => acc + p.orderCount, 0);
  const windowRevenue = roundMoney(
    activePoints.reduce((acc, p) => acc + p.totalRevenue, 0)
  );

  let spanLabel: string | null = null;
  if (activePoints.length === 1) {
    spanLabel = activePoints[0].monthLabel;
  } else if (activePoints.length > 1) {
    spanLabel = `${activePoints[0].monthLabel} – ${activePoints[activePoints.length - 1].monthLabel}`;
  }

  return {
    points,
    activeMonthsCount: activePoints.length,
    windowOrderCount,
    windowRevenue,
    spanLabel,
  };
};

const resolveItemCategoryId = (
  item: Record<string, any>,
  productCategoryMap: Map<string, string>
): string | null => {
  const rawCat = item?.category;
  if (rawCat && typeof rawCat === "object") {
    const objId = rawCat._id || rawCat.id;
    if (objId) return String(objId);
  } else if (rawCat) {
    return String(rawCat);
  }

  const productKey = item?.slug || (item?._id ? String(item._id) : "");
  return productKey ? productCategoryMap.get(productKey) || null : null;
};

const getCounts = async () => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

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

    const [
      productCount,
      donarCount,
      schoolCount,
      donarCountLastMonthCount,
      paidOrders,
      unpaidPendingCount,
      categories,
      products,
      unreadInquiriesCount,
    ] = await Promise.all([
      Product.countDocuments({ active: true }).lean(),
      Donar.countDocuments({ active: true }).lean(),
      School.countDocuments({ active: true }).lean(),
      Donar.countDocuments({
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      }).lean(),
      Order.find({ paymentStatus: true })
        .select("totalAmount payMonthly orderStatus schoolId products createdAt")
        .populate("schoolId", "name slug amountReceived")
        .sort({ createdAt: 1 })
        .lean(),
      Order.countDocuments({
        paymentStatus: false,
        orderStatus: "pending",
      }).lean(),
      Category.find({}, { _id: 1, title: 1 }).lean(),
      Product.find({}, { _id: 1, slug: 1, category: 1 }).lean(),
      Submissions.countDocuments({
        isDeleted: { $ne: true },
        seen: false,
      }).lean(),
    ]);

    const categoryTitleMap = new Map<string, string>();
    for (const cat of categories) {
      categoryTitleMap.set(String(cat._id), cat.title);
    }

    const productCategoryMap = new Map<string, string>();
    for (const prod of products) {
      if (prod.category) {
        const catId = String(prod.category);
        if (prod.slug) productCategoryMap.set(prod.slug, catId);
        if (prod._id) productCategoryMap.set(String(prod._id), catId);
      }
    }

    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;
    let totalRevenue = 0;
    let recurringOrderCount = 0;
    let recurringRevenue = 0;
    let oneTimeRevenue = 0;

    const pipelineTotals: Record<
      CanonicalOrderStage,
      { count: number; amount: number }
    > = {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      "on the way": { count: 0, amount: 0 },
      received: { count: 0, amount: 0 },
    };

    const schoolAcc = new Map<
      string,
      {
        schoolId: string;
        schoolName: string;
        slug: string;
        orderRevenue: number;
        orderCount: number;
        cumulativeBalance: number;
      }
    >();

    const categoryAcc = new Map<
      string,
      { categoryId: string; title: string; revenue: number; units: number; orderIds: Set<string> }
    >();

    for (const order of paidOrders as any[]) {
      const amount = Number(order.totalAmount || 0);
      totalRevenue += amount;

      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      if (createdAt) {
        if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
          currentMonthRevenue += amount;
        } else if (
          createdAt >= startOfPreviousMonth &&
          createdAt <= endOfPreviousMonth
        ) {
          previousMonthRevenue += amount;
        }
      }

      if (order.payMonthly === "yes") {
        recurringOrderCount += 1;
        recurringRevenue += amount;
      } else {
        oneTimeRevenue += amount;
      }

      const stage = normalizeOrderStatus(order.orderStatus);
      pipelineTotals[stage].count += 1;
      pipelineTotals[stage].amount += amount;

      const schoolObj =
        order.schoolId && typeof order.schoolId === "object"
          ? order.schoolId
          : null;
      const schoolKey = schoolObj?._id
        ? String(schoolObj._id)
        : order.schoolId
          ? String(order.schoolId)
          : "unassigned";
      const existingSchool = schoolAcc.get(schoolKey) || {
        schoolId: schoolKey,
        schoolName: schoolObj?.name || "Unassigned Campus",
        slug: schoolObj?.slug || "",
        orderRevenue: 0,
        orderCount: 0,
        cumulativeBalance: Number(schoolObj?.amountReceived || 0),
      };
      existingSchool.orderRevenue += amount;
      existingSchool.orderCount += 1;
      schoolAcc.set(schoolKey, existingSchool);

      const orderItems: any[] = Array.isArray(order.products) ? order.products : [];
      const orderOrderKey = String(order._id);
      if (orderItems.length === 0) {
        const entry = categoryAcc.get("uncategorized") || {
          categoryId: "uncategorized",
          title: "Uncategorized",
          revenue: 0,
          units: 0,
          orderIds: new Set<string>(),
        };
        entry.revenue += amount;
        entry.orderIds.add(orderOrderKey);
        categoryAcc.set("uncategorized", entry);
        continue;
      }

      const lineAmounts = orderItems.map((item) => {
        const unitPrice =
          item?.sale && Number(item?.salePrice) > 0
            ? Number(item.salePrice)
            : Number(item?.price) || 0;
        const qty = Number(item?.quantity) || 1;
        return {
          item,
          qty,
          rawLine: unitPrice * qty,
        };
      });

      const rawOrderSum = lineAmounts.reduce((s, li) => s + li.rawLine, 0);
      for (const li of lineAmounts) {
        const catId =
          resolveItemCategoryId(li.item, productCategoryMap) || "uncategorized";
        const catTitle =
          (typeof li.item?.category === "object" && li.item?.category?.title) ||
          categoryTitleMap.get(catId) ||
          "Uncategorized";

        const apportionedRevenue =
          rawOrderSum > 0
            ? (li.rawLine / rawOrderSum) * amount
            : amount / lineAmounts.length;

        const entry = categoryAcc.get(catId) || {
          categoryId: catId,
          title: catTitle,
          revenue: 0,
          units: 0,
          orderIds: new Set<string>(),
        };
        entry.revenue += apportionedRevenue;
        entry.units += li.qty;
        entry.orderIds.add(orderOrderKey);
        categoryAcc.set(catId, entry);
      }
    }

    const hasMoMBaseline =
      currentMonthRevenue > 0 && previousMonthRevenue > 0;
    const percentageChange =
      previousMonthRevenue > 0
        ? Math.round(
            (((currentMonthRevenue - previousMonthRevenue) /
              previousMonthRevenue) *
              100) *
              10
          ) / 10
        : 0;

    const seriesAll = buildMonthSeriesWindow(paidOrders as any[], "all", currentDate);
    const series12m = buildMonthSeriesWindow(paidOrders as any[], "12m", currentDate);
    const series6m = buildMonthSeriesWindow(paidOrders as any[], "6m", currentDate);

    const defaultRange: TimeRangeKey =
      series12m.windowOrderCount > 0 ? "12m" : "all";

    const orderPipeline = CANONICAL_ORDER_STAGES.map((stage) => ({
      status: stage,
      count: pipelineTotals[stage].count,
      amount: roundMoney(pipelineTotals[stage].amount),
    }));

    const schoolBreakdown = Array.from(schoolAcc.values())
      .map((item) => ({
        ...item,
        orderRevenue: roundMoney(item.orderRevenue),
        cumulativeBalance: roundMoney(item.cumulativeBalance),
      }))
      .sort((a, b) => b.orderRevenue - a.orderRevenue);

    const categoryBreakdown = Array.from(categoryAcc.values())
      .map((item) => ({
        categoryId: item.categoryId,
        title: item.title,
        revenue: roundMoney(item.revenue),
        units: item.units,
        orderCount: item.orderIds.size,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Preserve legacy monthlyRevenue shape for existing consumers
    const monthlyRevenue = series12m.points.map((p) => ({
      month: p.monthLabel.split(" ")[0],
      revenue: Math.round(p.totalRevenue),
    }));

    return {
      totalRevenue: roundMoney(totalRevenue),
      percentageChange,
      hasMoMBaseline,
      productCount,
      donarCount,
      donarCountLastMonth: donarCountLastMonthCount,
      schoolCount,
      monthlyRevenue,
      paidOrderCount: paidOrders.length,
      recurringOrderCount,
      recurringRevenue: roundMoney(recurringRevenue),
      oneTimeRevenue: roundMoney(oneTimeRevenue),
      unpaidPendingCount,
      unreadInquiriesCount,
      activeSpanLabel: seriesAll.spanLabel,
      defaultRange,
      seriesByRange: {
        all: seriesAll,
        "12m": series12m,
        "6m": series6m,
      },
      orderPipeline,
      schoolBreakdown,
      categoryBreakdown,
    };
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    throw error;
  }
};

export const AdminService = {
  getSingleAdmin,
  deleteAdmin,
  updateAdmin,
  getCounts,
};
