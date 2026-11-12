"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IOrder } from "@/app/types/Order";
import { dateConverter } from "@/app/utility/dateConverter";
import {
  generateOrderInvoice,
  InvoiceAudience,
} from "@/app/utility/generateOrderInvoice";

const InvoiceActionCell = ({ order }: { order: IOrder }) => {
  const pathname = usePathname();
  const audience: InvoiceAudience = pathname?.startsWith("/bursar-dashboard")
    ? "bursar"
    : pathname?.startsWith("/dashboard")
      ? "admin"
      : "donor";

  const label = audience === "bursar" ? "Receipt" : "Invoice";
  const tooltip =
    audience === "bursar"
      ? "Download Campus Delivery Receipt"
      : "Download PDF Invoice";

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex items-center">
      <button
        type="button"
        onClick={() => generateOrderInvoice(order, { audience })}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-subtle bg-white px-2 py-1 min-[1400px]:px-2.5 text-xs font-semibold text-text-ink shadow-sm transition-all hover:bg-surface-bento hover:border-surface-forest/30 active:scale-95"
        title={tooltip}
      >
        <Download className="h-3.5 w-3.5 text-surface-forest" />
        {label}
      </button>
    </div>
  );
};

export const columns: ColumnDef<IOrder>[] = [
  {
    accessorKey: "orderId",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Order ID
      </span>
    ),
    cell: ({ row }) => {
      const displayId =
        row.original.orderId ||
        (row.original._id ? `ORD-${row.original._id.slice(-8).toUpperCase()}` : "N/A");
      return (
        <span className="inline-flex items-center rounded-lg border border-border-subtle bg-surface-bento/60 px-2 py-0.5 min-[1400px]:px-2.5 min-[1400px]:py-1 font-mono text-[11px] min-[1400px]:text-xs font-bold text-text-ink whitespace-nowrap">
          {displayId}
        </span>
      );
    },
  },
  {
    id: "products",
    accessorFn: (row) => row.products?.map((p) => p.title).join(", ") || "",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Products
      </span>
    ),
    cell: ({ row }) => {
      const products = row.original.products;
      return (
        <div className="flex flex-col gap-1 max-w-[160px] min-[1400px]:max-w-[250px]">
          {products?.map((product) => (
            <span
              key={product?._id}
              className="font-semibold text-text-ink truncate text-sm hover:text-surface-forest transition-colors"
              title={product.title}
            >
              {product.title}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 px-2 h-8 text-xs font-semibold text-text-muted hover:text-text-ink hover:bg-surface-bento whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Date
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = dateConverter(row.getValue("createdAt"));
      return <div className="text-xs text-text-muted font-medium">{createdAt}</div>;
    },
  },
  {
    accessorKey: "payMonthly",
    header: () => <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Type</span>,
    cell: ({ row }) => {
      const payMonthly = row.getValue("payMonthly");
      const isMonthly = payMonthly === "yes" || payMonthly === true;
      return (
        <span className="text-xs font-medium text-text-body">
          {isMonthly ? "Monthly Recurring" : "One-Time"}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: () => <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Payment</span>,
    cell: ({ row }) => {
      const status = Boolean(row.getValue("paymentStatus"));
      return status ? (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Paid
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          Unpaid
        </span>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Amount</span>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="font-bold text-text-ink text-sm">{formatted}</div>;
    },
  },
  {
    accessorKey: "orderStatus",
    header: () => <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status</span>,
    cell: ({ row }) => {
      const orderStatus = (row.getValue("orderStatus") as string)?.toLowerCase();

      switch (orderStatus) {
        case "pending":
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          );
        case "processing":
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
              <AlertCircle className="h-3 w-3" />
              Processing
            </span>
          );
        case "on the way":
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
              <Truck className="h-3 w-3" />
              On the Way
            </span>
          );
        case "delivered":
        case "received":
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              {orderStatus === "delivered" ? "Delivered" : "Received"}
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-700 capitalize">
              {orderStatus || "Unknown"}
            </span>
          );
      }
    },
  },
  {
    id: "actions",
    header: () => <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Invoice</span>,
    cell: ({ row }) => {
      const paid = row.original.paymentStatus;
      if (!paid) {
        return null;
      }
      return <InvoiceActionCell order={row.original} />;
    },
  },
];
