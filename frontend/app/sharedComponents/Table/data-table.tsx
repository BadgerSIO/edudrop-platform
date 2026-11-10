"use client";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  enableExport?: boolean;
  variant?: "card" | "embedded";
}

export function DataTable<TData extends { _id: string; slug?: string }, TValue>({
  columns,
  data = [],
  searchPlaceholder = "Search records...",
  enableExport = true,
  variant = "card",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleRouting = (rowItem: any) => {
    if (pathname === "/dashboard") {
      router.push(`${pathname}/orders/${rowItem?._id}`);
    } else if (
      pathname === "/dashboard/product-list" ||
      pathname === "/dashboard/schools-list"
    ) {
      router.push(`${pathname}/${rowItem?.slug || rowItem?._id}`);
    } else {
      router.push(`${pathname}/${rowItem?._id}`);
    }
  };

  useEffect(() => {
    if (data?.length > 0) {
      data.forEach((row) => {
        const idOrSlug = row.slug || row._id;
        if (idOrSlug) {
          router.prefetch(`${pathname}/${idOrSlug}`);
        }
      });
    }
  }, [data, pathname, router]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const rows = table.getFilteredRowModel().rows.map((row) => {
      const rowData: Record<string, any> = {};
      row.getVisibleCells().forEach((cell) => {
        const header = cell.column.id;
        const val = cell.getValue();
        rowData[header] = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      });
      return rowData;
    });

    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const escaped = String(r[h] ?? "").replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `edudrop_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerClass =
    variant === "card"
      ? "w-full overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento"
      : "w-full bg-white";

  return (
    <div className={containerClass}>
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle bg-white px-4 py-3.5 sm:px-5">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-border-subtle bg-white py-2 pl-9 pr-4 text-xs font-medium text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:outline-none focus:ring-1 focus:ring-surface-forest/20"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-border-subtle bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-text-ink focus:border-surface-forest focus:outline-none cursor-pointer"
            >
              {[10, 20, 30, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          {enableExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="h-8 rounded-xl border-border-subtle text-xs font-semibold text-surface-forest hover:bg-surface-bento"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Borderless Table Grid inside Card */}
      <Table>
        <TableHeader className="bg-surface-bento/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="cursor-pointer transition-colors hover:bg-surface-bento/40"
                onClick={() => handleRouting(row.original)}
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3.5 text-sm text-text-body">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-sm text-text-muted"
              >
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border-subtle bg-surface-bento/20 px-4 py-3 sm:px-5">
        <div className="text-xs text-text-muted font-medium">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 rounded-lg border-border-subtle text-xs font-semibold text-text-ink hover:bg-surface-bento"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 rounded-lg border-border-subtle text-xs font-semibold text-text-ink hover:bg-surface-bento"
          >
            Next
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
