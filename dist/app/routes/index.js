"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const demoGuard_1 = __importDefault(require("../middleware/demoGuard"));
const submissions_route_1 = require("../modules/submissions/submissions.route");
const school_route_1 = require("../modules/school/school.route");
const auth_route_1 = require("../modules/auth/auth.route");
const schoolInfo_route_1 = require("../modules/schoolInfo/schoolInfo.route");
const admin_route_1 = require("../modules/admin/admin.route");
const schoolInbox_route_1 = require("../modules/schoolInbox/schoolInbox.route");
const category_route_1 = require("../modules/category/category.route");
const product_route_1 = require("../modules/product/product.route");
const donar_route_1 = require("../modules/donar/donar.route");
const order_route_1 = require("../modules/order/order.route");
const bursar_route_1 = require("../modules/bursar/bursar.route");
const notification_route_1 = require("../modules/notification/notification.route");
const cms_route_1 = require("../modules/cms/cms.route");
const user_route_1 = require("../modules/user/user.route");
const router = express_1.default.Router();
router.use(demoGuard_1.default);
const moduleRoutes = [
    {
        path: "/cms",
        route: cms_route_1.CMSRoutes,
    },
    {
        path: "/submissions",
        route: submissions_route_1.SubmissionsRoutes,
    },
    {
        path: "/school",
        route: school_route_1.SchoolRoutes,
    },
    {
        path: "/school-info",
        route: schoolInfo_route_1.SchoolInfoRoutes,
    },
    {
        path: "/school-inbox",
        route: schoolInbox_route_1.SchoolInboxRoutes,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/edudrop-admin",
        route: admin_route_1.AdminRoutes,
    },
    {
        path: "/categories",
        route: category_route_1.CategoryRoutes,
    },
    {
        path: "/product",
        route: product_route_1.ProductRoutes,
    },
    {
        path: "/bursar",
        route: bursar_route_1.BursarRoutes,
    },
    {
        path: "/user",
        route: user_route_1.UserRoutes,
    },
    {
        path: "/donar",
        route: donar_route_1.DonarRoutes,
    },
    {
        path: "/order",
        route: order_route_1.OrderRoutes,
    },
    {
        path: "/notification",
        route: notification_route_1.NotificationRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
