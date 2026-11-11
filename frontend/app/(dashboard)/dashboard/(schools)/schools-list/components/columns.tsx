"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreVertical,
  Building2,
  MapPin,
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ISchool } from "@/app/types/School";
import Link from "next/link";
import Image from "next/image";
import useSchool from "@/app/hooks/useSchool";
import { dateConverter } from "@/app/utility/dateConverter";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import StatusBadge from "@/app/sharedComponents/ui/StatusBadge";
import StatusChangeDialog from "@/app/sharedComponents/ui/StatusChangeDialog";

// Read-only Status Indicator
const SchoolStatusCell = ({ school }: { school: ISchool }) => {
  const isActive = Boolean(school.active || school.status === "active");
  return (
    <StatusBadge
      label={isActive ? "Active" : "Inactive"}
      tone={isActive ? "active" : "warning"}
    />
  );
};

// Actions Cell with Lifted Confirmation Dialogs
const SchoolActionsCell = ({ school }: { school: ISchool }) => {
  const { handleSchoolStatus, handleDeleteSchool, loadingSchool } = useSchool();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const isActive = Boolean(school.active || school.status === "active");

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
          className="w-52 bg-white border border-border-subtle shadow-bento rounded-xl p-1.5 space-y-1"
        >
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
          >
            <Link href={`/dashboard/schools-list/${school.slug}`}>
              Manage Campus Hub
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
          >
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
            className={`cursor-pointer rounded-lg text-xs font-medium ${
              isActive
                ? "text-amber-700 hover:bg-amber-50 focus:bg-amber-50"
                : "text-surface-forest hover:bg-surface-forest/10 focus:bg-surface-forest/10"
            }`}
            onSelect={() => setStatusModalOpen(true)}
          >
            {isActive ? (
              <PauseCircle className="mr-2 h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
            )}
            <span>{isActive ? "Pause Campus..." : "Activate Campus..."}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border-subtle/80" />

          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
            onSelect={() => setArchiveModalOpen(true)}
          >
            <ShieldAlert className="mr-2 h-3.5 w-3.5" />
            <span>Archive Campus...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusChangeDialog
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        title="Confirm Campus Visibility Change"
        entityName={school.name}
        entitySubtitle={`/schools/${school.slug}`}
        entityMetaBadge="Partner School"
        currentStatus={{
          label: isActive ? "Active" : "Inactive",
          tone: isActive ? "active" : "warning",
        }}
        targetStatus={{
          label: isActive ? "Inactive" : "Active",
          tone: isActive ? "warning" : "active",
        }}
        impactDescription={
          isActive
            ? "Pausing this campus hides it from the public donor directory and temporarily pauses new sponsorships. Historic donations and bursar records remain preserved."
            : "Activating this campus publishes it to the public EduDrop directory so donors can browse and sponsor campus needs."
        }
        confirmLabel={isActive ? "Pause Campus" : "Activate Campus"}
        confirmTone={isActive ? "amber" : "forest"}
        loading={loadingSchool}
        onConfirm={() => handleSchoolStatus(school.slug)}
      />

      <AlertDialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Partner Campus?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive{" "}
              <span className="font-semibold text-text-ink">{school.name}</span>{" "}
              and suspend its associated bursar credentials. Historic donor
              transactions and orders will remain safely preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleDeleteSchool(school._id)}
            >
              Archive Campus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
      const logoUrl = logo ? handleBuildImage(logo, "") : "";

      return (
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-bento/30 overflow-hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={school.name}
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            ) : (
              <Building2 className="h-5 w-5 text-surface-forest" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/schools-list/${school.slug}`}
              onClick={(e) => e.stopPropagation()}
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
          <SchoolStatusCell school={row.original} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SchoolActionsCell school={row.original} />,
  },
];
