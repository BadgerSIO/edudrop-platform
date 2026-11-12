export type TimeRangeKey = "all" | "12m" | "6m";

export type CanonicalOrderStage =
  | "pending"
  | "processing"
  | "on the way"
  | "received";

export interface IMonthlySeriesPoint {
  monthLabel: string;
  yearMonth: string;
  oneTimeRevenue: number;
  recurringRevenue: number;
  totalRevenue: number;
  orderCount: number;
}

export interface IRangeSeriesSummary {
  points: IMonthlySeriesPoint[];
  activeMonthsCount: number;
  windowOrderCount: number;
  windowRevenue: number;
  spanLabel: string | null;
}

export interface IOrderPipelineStage {
  status: CanonicalOrderStage;
  count: number;
  amount: number;
}

export interface ISchoolBreakdownItem {
  schoolId: string;
  schoolName: string;
  slug: string;
  orderRevenue: number;
  orderCount: number;
  cumulativeBalance: number;
}

export interface ICategoryBreakdownItem {
  categoryId: string;
  title: string;
  revenue: number;
  units: number;
  orderCount: number;
}

export interface IAdminAnalyticsData {
  totalRevenue: number;
  percentageChange: number;
  hasMoMBaseline: boolean;
  productCount: number;
  donarCount: number;
  donarCountLastMonth: number;
  schoolCount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  paidOrderCount: number;
  recurringOrderCount: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  unpaidPendingCount: number;
  unreadInquiriesCount: number;
  activeSpanLabel: string | null;
  defaultRange: TimeRangeKey;
  seriesByRange: Record<TimeRangeKey, IRangeSeriesSummary>;
  orderPipeline: IOrderPipelineStage[];
  schoolBreakdown: ISchoolBreakdownItem[];
  categoryBreakdown: ICategoryBreakdownItem[];
}

export interface IBursarCampusNeedItem {
  itemTitle: string;
  productSlug: string;
  targetQuantity: number;
  fulfilledQuantity: number;
  priority: "high" | "medium" | "low";
}

export interface IBursarSummaryData {
  hasSchool: boolean;
  schoolId: string | null;
  schoolName: string | null;
  schoolSlug: string | null;
  cumulativeBalance: number;
  verifiedOrderTotal: number;
  totalOrders: number;
  paidOrdersCount: number;
  recurringOrdersCount: number;
  receivedCount: number;
  inFlightCount: number;
  unpaidPendingCount: number;
  pipelineBreakdown: IOrderPipelineStage[];
  campusNeeds: IBursarCampusNeedItem[];
  unreadInboxCount: number;
  totalInboxCount: number;
}

export interface IDonorSchoolAllocationItem {
  schoolId: string;
  schoolName: string;
  slug: string;
  city: string;
  state: string;
  amount: number;
  orderCount: number;
  recurringCount: number;
}

export interface IDonorSummaryData {
  totalDonationAmount: number;
  verifiedOrderTotal: number;
  totalOrders: number;
  paidOrdersCount: number;
  schoolsSupportedCount: number;
  activeMonthlyCount: number;
  upcomingRenewalDate: string | null;
  unpaidPendingCount: number;
  inFlightCount: number;
  receivedCount: number;
  schoolAllocation: IDonorSchoolAllocationItem[];
  pipelineBreakdown: IOrderPipelineStage[];
}
