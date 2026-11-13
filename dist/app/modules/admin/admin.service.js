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
exports.AdminService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const admin_model_1 = require("./admin.model");
const user_model_1 = require("../user/user.model");
const product_model_1 = require("../product/product.model");
const donar_model_1 = require("../donar/donar.model");
const school_model_1 = require("../school/school.model");
const order_model_1 = require("../order/order.model");
const category_model_1 = require("../category/category.model");
const submissions_model_1 = require("../submissions/submissions.model");
const order_constants_1 = require("../order/order.constants");
const profileUpdateHelper_1 = require("../../../helper/profileUpdateHelper");
const getSingleAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_model_1.Admin.findById(id);
    return result;
});
const deleteAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the admin is exist
    const isExist = yield admin_model_1.Admin.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Admin not found !");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const admin = yield admin_model_1.Admin.findByIdAndDelete(id, { session });
        if (!admin) {
            throw new ApiError_1.default(404, "Failed to delete admin");
        }
        yield user_model_1.User.findOneAndDelete({ admin: id }, { session });
        yield session.commitTransaction();
        yield session.endSession();
        return admin;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
});
const updateAdmin = (id, payload, newProfileImagePath) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield admin_model_1.Admin.findById(id, { profileImage: 1 }).lean();
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Admin not found !");
    }
    const setPayload = (0, profileUpdateHelper_1.buildAllowListedSetPayload)(payload, ["contactNo", "presentAddress", "permanentAddress"], { name: ["firstName", "lastName"] });
    const { nextProfileImage, oldImageToDelete } = (0, profileUpdateHelper_1.resolveAvatarUpdate)(isExist.profileImage, newProfileImagePath, payload.removeProfileImage);
    if (nextProfileImage !== undefined) {
        setPayload.profileImage = nextProfileImage;
    }
    if (Object.keys(setPayload).length === 0) {
        return admin_model_1.Admin.findById(id);
    }
    const result = yield admin_model_1.Admin.findOneAndUpdate({ _id: id }, { $set: setPayload }, {
        new: true,
        runValidators: true,
    });
    if (oldImageToDelete) {
        yield (0, profileUpdateHelper_1.safeUnlinkUserImage)(oldImageToDelete);
    }
    return result;
});
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
];
const formatYearMonth = (year, month1To12) => `${year}-${String(month1To12).padStart(2, "0")}`;
const formatMonthLabel = (year, month1To12) => `${MONTH_SHORT_NAMES[month1To12 - 1]} ${year}`;
const roundMoney = (val) => Math.round(val * 100) / 100;
const buildMonthSeriesWindow = (paidOrders, range, now) => {
    const bucketMap = new Map();
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (const order of paidOrders) {
        if (!order.createdAt)
            continue;
        const d = new Date(order.createdAt);
        if (Number.isNaN(d.getTime()))
            continue;
        const t = d.getTime();
        if (t < minTime)
            minTime = t;
        if (t > maxTime)
            maxTime = t;
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
        }
        else {
            existing.oneTimeRevenue += amt;
        }
        existing.orderCount += 1;
        bucketMap.set(key, existing);
    }
    const orderedMonthKeys = [];
    if (range === "all") {
        if (bucketMap.size > 0 && Number.isFinite(minTime) && Number.isFinite(maxTime)) {
            const minDate = new Date(minTime);
            const maxDate = new Date(maxTime);
            let cursorYear = minDate.getFullYear();
            let cursorMonth = minDate.getMonth() + 1;
            const endYear = maxDate.getFullYear();
            const endMonth = maxDate.getMonth() + 1;
            const totalMonthsSpan = (endYear - cursorYear) * 12 + (endMonth - cursorMonth) + 1;
            if (totalMonthsSpan <= 36) {
                while (cursorYear < endYear ||
                    (cursorYear === endYear && cursorMonth <= endMonth)) {
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
            }
            else {
                const sortedActive = Array.from(bucketMap.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(-36);
                for (const [key, item] of sortedActive) {
                    orderedMonthKeys.push({ year: item.year, month: item.month, key });
                }
            }
        }
    }
    else {
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
    const points = orderedMonthKeys.map(({ year, month, key }) => {
        const entry = bucketMap.get(key);
        const oneTime = roundMoney((entry === null || entry === void 0 ? void 0 : entry.oneTimeRevenue) || 0);
        const recurring = roundMoney((entry === null || entry === void 0 ? void 0 : entry.recurringRevenue) || 0);
        return {
            monthLabel: formatMonthLabel(year, month),
            yearMonth: key,
            oneTimeRevenue: oneTime,
            recurringRevenue: recurring,
            totalRevenue: roundMoney(oneTime + recurring),
            orderCount: (entry === null || entry === void 0 ? void 0 : entry.orderCount) || 0,
        };
    });
    const activePoints = points.filter((p) => p.orderCount > 0);
    const windowOrderCount = activePoints.reduce((acc, p) => acc + p.orderCount, 0);
    const windowRevenue = roundMoney(activePoints.reduce((acc, p) => acc + p.totalRevenue, 0));
    let spanLabel = null;
    if (activePoints.length === 1) {
        spanLabel = activePoints[0].monthLabel;
    }
    else if (activePoints.length > 1) {
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
const resolveItemCategoryId = (item, productCategoryMap) => {
    const rawCat = item === null || item === void 0 ? void 0 : item.category;
    if (rawCat && typeof rawCat === "object") {
        const objId = rawCat._id || rawCat.id;
        if (objId)
            return String(objId);
    }
    else if (rawCat) {
        return String(rawCat);
    }
    const productKey = (item === null || item === void 0 ? void 0 : item.slug) || ((item === null || item === void 0 ? void 0 : item._id) ? String(item._id) : "");
    return productKey ? productCategoryMap.get(productKey) || null : null;
};
const getCounts = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const startOfPreviousMonth = new Date(previousYear, previousMonth - 1, 1);
        const endOfPreviousMonth = new Date(previousYear, previousMonth, 0, 23, 59, 59, 999);
        const [productCount, donarCount, schoolCount, donarCountLastMonthCount, paidOrders, unpaidPendingCount, categories, products, unreadInquiriesCount,] = yield Promise.all([
            product_model_1.Product.countDocuments({ active: true }).lean(),
            donar_model_1.Donar.countDocuments({ active: true }).lean(),
            school_model_1.School.countDocuments({ active: true }).lean(),
            donar_model_1.Donar.countDocuments({
                createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
            }).lean(),
            order_model_1.Order.find({ paymentStatus: true })
                .select("totalAmount payMonthly orderStatus schoolId products createdAt")
                .populate("schoolId", "name slug amountReceived")
                .sort({ createdAt: 1 })
                .lean(),
            order_model_1.Order.countDocuments({
                paymentStatus: false,
                orderStatus: "pending",
            }).lean(),
            category_model_1.Category.find({}, { _id: 1, title: 1 }).lean(),
            product_model_1.Product.find({}, { _id: 1, slug: 1, category: 1 }).lean(),
            submissions_model_1.Submissions.countDocuments({
                isDeleted: { $ne: true },
                seen: false,
            }).lean(),
        ]);
        const categoryTitleMap = new Map();
        for (const cat of categories) {
            categoryTitleMap.set(String(cat._id), cat.title);
        }
        const productCategoryMap = new Map();
        for (const prod of products) {
            if (prod.category) {
                const catId = String(prod.category);
                if (prod.slug)
                    productCategoryMap.set(prod.slug, catId);
                if (prod._id)
                    productCategoryMap.set(String(prod._id), catId);
            }
        }
        let currentMonthRevenue = 0;
        let previousMonthRevenue = 0;
        let totalRevenue = 0;
        let recurringOrderCount = 0;
        let recurringRevenue = 0;
        let oneTimeRevenue = 0;
        const pipelineTotals = {
            pending: { count: 0, amount: 0 },
            processing: { count: 0, amount: 0 },
            "on the way": { count: 0, amount: 0 },
            received: { count: 0, amount: 0 },
        };
        const schoolAcc = new Map();
        const categoryAcc = new Map();
        for (const order of paidOrders) {
            const amount = Number(order.totalAmount || 0);
            totalRevenue += amount;
            const createdAt = order.createdAt ? new Date(order.createdAt) : null;
            if (createdAt) {
                if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
                    currentMonthRevenue += amount;
                }
                else if (createdAt >= startOfPreviousMonth &&
                    createdAt <= endOfPreviousMonth) {
                    previousMonthRevenue += amount;
                }
            }
            if (order.payMonthly === "yes") {
                recurringOrderCount += 1;
                recurringRevenue += amount;
            }
            else {
                oneTimeRevenue += amount;
            }
            const stage = (0, order_constants_1.normalizeOrderStatus)(order.orderStatus);
            pipelineTotals[stage].count += 1;
            pipelineTotals[stage].amount += amount;
            const schoolObj = order.schoolId && typeof order.schoolId === "object"
                ? order.schoolId
                : null;
            const schoolKey = (schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj._id)
                ? String(schoolObj._id)
                : order.schoolId
                    ? String(order.schoolId)
                    : "unassigned";
            const existingSchool = schoolAcc.get(schoolKey) || {
                schoolId: schoolKey,
                schoolName: (schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.name) || "Unassigned Campus",
                slug: (schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.slug) || "",
                orderRevenue: 0,
                orderCount: 0,
                cumulativeBalance: Number((schoolObj === null || schoolObj === void 0 ? void 0 : schoolObj.amountReceived) || 0),
            };
            existingSchool.orderRevenue += amount;
            existingSchool.orderCount += 1;
            schoolAcc.set(schoolKey, existingSchool);
            const orderItems = Array.isArray(order.products) ? order.products : [];
            const orderOrderKey = String(order._id);
            if (orderItems.length === 0) {
                const entry = categoryAcc.get("uncategorized") || {
                    categoryId: "uncategorized",
                    title: "Uncategorized",
                    revenue: 0,
                    units: 0,
                    orderIds: new Set(),
                };
                entry.revenue += amount;
                entry.orderIds.add(orderOrderKey);
                categoryAcc.set("uncategorized", entry);
                continue;
            }
            const lineAmounts = orderItems.map((item) => {
                const unitPrice = (item === null || item === void 0 ? void 0 : item.sale) && Number(item === null || item === void 0 ? void 0 : item.salePrice) > 0
                    ? Number(item.salePrice)
                    : Number(item === null || item === void 0 ? void 0 : item.price) || 0;
                const qty = Number(item === null || item === void 0 ? void 0 : item.quantity) || 1;
                return {
                    item,
                    qty,
                    rawLine: unitPrice * qty,
                };
            });
            const rawOrderSum = lineAmounts.reduce((s, li) => s + li.rawLine, 0);
            for (const li of lineAmounts) {
                const catId = resolveItemCategoryId(li.item, productCategoryMap) || "uncategorized";
                const catTitle = (typeof ((_a = li.item) === null || _a === void 0 ? void 0 : _a.category) === "object" && ((_c = (_b = li.item) === null || _b === void 0 ? void 0 : _b.category) === null || _c === void 0 ? void 0 : _c.title)) ||
                    categoryTitleMap.get(catId) ||
                    "Uncategorized";
                const apportionedRevenue = rawOrderSum > 0
                    ? (li.rawLine / rawOrderSum) * amount
                    : amount / lineAmounts.length;
                const entry = categoryAcc.get(catId) || {
                    categoryId: catId,
                    title: catTitle,
                    revenue: 0,
                    units: 0,
                    orderIds: new Set(),
                };
                entry.revenue += apportionedRevenue;
                entry.units += li.qty;
                entry.orderIds.add(orderOrderKey);
                categoryAcc.set(catId, entry);
            }
        }
        const hasMoMBaseline = currentMonthRevenue > 0 && previousMonthRevenue > 0;
        const percentageChange = previousMonthRevenue > 0
            ? Math.round((((currentMonthRevenue - previousMonthRevenue) /
                previousMonthRevenue) *
                100) *
                10) / 10
            : 0;
        const seriesAll = buildMonthSeriesWindow(paidOrders, "all", currentDate);
        const series12m = buildMonthSeriesWindow(paidOrders, "12m", currentDate);
        const series6m = buildMonthSeriesWindow(paidOrders, "6m", currentDate);
        const defaultRange = series12m.windowOrderCount > 0 ? "12m" : "all";
        const orderPipeline = order_constants_1.CANONICAL_ORDER_STAGES.map((stage) => ({
            status: stage,
            count: pipelineTotals[stage].count,
            amount: roundMoney(pipelineTotals[stage].amount),
        }));
        const schoolBreakdown = Array.from(schoolAcc.values())
            .map((item) => (Object.assign(Object.assign({}, item), { orderRevenue: roundMoney(item.orderRevenue), cumulativeBalance: roundMoney(item.cumulativeBalance) })))
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
    }
    catch (error) {
        console.error("Error fetching admin analytics:", error);
        throw error;
    }
});
exports.AdminService = {
    getSingleAdmin,
    deleteAdmin,
    updateAdmin,
    getCounts,
};
