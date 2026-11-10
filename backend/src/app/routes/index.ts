import express from "express";
import { SubmissionsRoutes } from "../modules/submissions/submissions.route";
import { SchoolRoutes } from "../modules/school/school.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { SchoolInfoRoutes } from "../modules/schoolInfo/schoolInfo.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { SchoolInboxRoutes } from "../modules/schoolInbox/schoolInbox.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { ProductRoutes } from "../modules/product/product.route";
import { DonarRoutes } from "../modules/donar/donar.route";
import { OrderRoutes } from "../modules/order/order.route";
import { BursarRoutes } from "../modules/bursar/bursar.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { CMSRoutes } from "../modules/cms/cms.route";
import { UserRoutes } from "../modules/user/user.route";

const router = express.Router();
const moduleRoutes = [
  {
    path: "/cms",
    route: CMSRoutes,
  },
  {
    path: "/submissions",
    route: SubmissionsRoutes,
  },
  {
    path: "/school",
    route: SchoolRoutes,
  },
  {
    path: "/school-info",
    route: SchoolInfoRoutes,
  },
  {
    path: "/school-inbox",
    route: SchoolInboxRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/edudrop-admin",
    route: AdminRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/bursar",
    route: BursarRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/donar",
    route: DonarRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/notification",
    route: NotificationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
