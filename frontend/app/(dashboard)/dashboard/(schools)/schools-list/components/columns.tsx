"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Building2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ISchool } from "@/app/types/School";
import Link from "next/link";
import Image from "next/image";
import useSchool from "@/app/hooks/useSchool";
import { dateConverter } from "@/app/utility/dateConverter";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
import { SERVERURL } from "@/lib/constants";

// 1-Click Interactive Status Pill
const StatusCell = ({ school }: { school: ISchool }) => {
  const { handleSchoolStatus, loadingSchool } = useSchool();
  const isActive = school.active || school.status === "active";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleSchoolStatus(school.slug);
      }}
      disabled={loadingSchool}
      title="Click to toggle status"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
        isActive
          ? "border border-surface-forest/20 bg-surface-forest/10 text-surface-forest hover:bg-surface-forest/20"
          : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-surface-forest" : "bg-amber-500"
        }`}
      />
      <span>{isActive ? "Active" : "Inactive"}</span>
    </button>
  );
};

export const columns: ColumnDef<ISchool>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider text-text-muted"
        >
          Campus & Partner
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const school = row.original;
      const logo = school.schoolLogo;
      let logoUrl = "";
      if (logo) {
        logoUrl = logo.startsWith("http") ? logo : `${SERVERURL}${logo}`;
      }

      return (
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-bento/30 overflow-hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={school.name}
                fill
                className="object-contain p-1"
              />
            ) : (
              <Building2 className="h-5 w-5 text-surface-forest" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/schools-list/${school.slug}`}
              className="font-bold text-sm text-text-ink hover:text-surface-forest transition-colors block truncate"
            >
              {school.name}
            </Link>
            <span className="font-mono text-[11px] text-text-muted truncate block">
              /schools/{school.slug}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address.city",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
        Location
      </span>
    ),
    cell: ({ row }) => {
      const addr = row.original.address;
      const city = addr?.city;
      const state = addr?.state;
      return (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <MapPin className="h-3.5 w-3.5 text-surface-forest flex-shrink-0" />
          <span className="font-medium text-text-body">
            {city ? `${city}${state ? `, ${state}` : ""}` : "Not specified"}
          </span>
        </div>
      );
    },
  },
  {
    id: "bursar",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
        Bursar Contact
      </span>
    ),
    cell: ({ row }) => {
      const bursar = row.original.bursar;
      if (!bursar) {
        return <span className="text-xs text-text-muted italic">Unassigned</span>;
      }
      const fullName = `${bursar.name?.firstName || ""} ${bursar.name?.lastName || ""}`.trim();
      return (
        <div className="text-xs">
          <span className="font-semibold text-text-ink block">
            {fullName || "Assigned Bursar"}
          </span>
          <span className="text-text-muted block truncate max-w-[160px]">
            {bursar.email || bursar.contactNo || "—"}
          </span>
        </div>
      );
    },
  },
  {
    id: "campusNeeds",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted text-center block">
        Campus Needs
      </span>
    ),
    cell: ({ row }) => {
      const count = (row.original as any).campusNeeds?.length || 0;
      return (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-bento/60 px-2 py-0.5 text-xs font-semibold text-text-ink">
            {count} {count === 1 ? "need" : "needs"}
          </span>
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider text-text-muted"
        >
          Partner Since
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="text-xs text-text-muted">
          {dateConverter(row.getValue("createdAt"))}
        </span>
      );
    },
  },
  {
    accessorKey: "active",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted text-center block">
        Status
      </span>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <StatusCell school={row.original} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { handleSchoolStatus, handleDeleteSchool } = useSchool();
      const school = row.original;
      const isActive = school.active || school.status === "active";

      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-text-muted hover:text-text-ink rounded-lg"
              >
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white border border-border-subtle shadow-bento rounded-xl p-1.5 space-y-1"
            >
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50">
                <Link href={`/dashboard/schools-list/${school.slug}`}>
                  Manage Campus Hub
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50">
                <a
                  href={`/schools/${school.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3 w-3 text-text-muted" />
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
                onSelect={() => handleSchoolStatus(school.slug)}
              >
                Mark as {isActive ? "Inactive" : "Active"}
              </DropdownMenuItem>

              <div className="my-1 border-t border-border-subtle/80" />

              <div className="px-1 py-0.5">
                <CustomAlertDialouge
                  triggerText="Archive Campus"
                  onConfirm={() => handleDeleteSchool(school._id)}
                  alertDescription="This will archive the school campus and suspend bursar credentials. Historic donor transactions and orders will remain safely preserved."
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
