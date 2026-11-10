"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreVertical,
  User as UserIcon,
  Shield,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  ExternalLink,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { IUser } from "@/app/types/User";
import Link from "next/link";
import Image from "next/image";
import useUser from "@/app/hooks/useUser";
import { dateConverter } from "@/app/utility/dateConverter";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
import { SERVERURL } from "@/lib/constants";
import { generatePassword } from "@/app/utility/passwordGenerator";
import toast from "react-hot-toast";

// 1-Click Interactive Status Pill
const StatusCell = ({ user }: { user: IUser }) => {
  const { handleUserStatus, loadingUser } = useUser();
  const isActive = user.status === "active";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleUserStatus(user._id, user.status, e);
      }}
      disabled={loadingUser}
      title="Click to toggle user status"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
        isActive
          ? "border border-surface-forest/20 bg-surface-forest/10 text-surface-forest hover:bg-surface-forest/20"
          : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-surface-forest" : "bg-red-500"
        }`}
      />
      <span>{isActive ? "Active" : "Suspended"}</span>
    </button>
  );
};

// Role Badge Helper
const RoleBadge = ({ role }: { role: string }) => {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
        <Shield className="h-3 w-3" />
        Admin
      </span>
    );
  }
  if (role === "bursar") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
        <GraduationCap className="h-3 w-3" />
        Bursar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
      <HeartHandshake className="h-3 w-3" />
      Donor
    </span>
  );
};

// Actions Cell with Reset Password Modal
const ActionsCell = ({ user }: { user: IUser }) => {
  const { handleUserStatus, handleResetPassword, handleDeleteUser, loadingUser } =
    useUser();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleGenerate = () => {
    const pass = generatePassword();
    setNewPassword(pass);
    navigator.clipboard.writeText(pass);
    toast.success("Password generated & copied to clipboard!");
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    const success = await handleResetPassword(user._id, newPassword);
    setResetting(false);
    if (success) {
      setResetModalOpen(false);
      setNewPassword("");
    }
  };

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
            <Link href={`/dashboard/manage-users/${user._id}`}>
              View User Hub & History
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
            onSelect={() => handleUserStatus(user._id, user.status)}
          >
            Mark as {user.status === "active" ? "Suspended" : "Active"}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
            onSelect={() => setResetModalOpen(true)}
          >
            Reset Password
          </DropdownMenuItem>

          <div className="my-1 border-t border-border-subtle/80" />

          <div className="px-1 py-0.5">
            <CustomAlertDialouge
              triggerText="Archive Account"
              onConfirm={() => handleDeleteUser(user._id)}
              alertDescription={`This will archive the account for ${user.email} and revoke authentication access. Historic transactions and orders will remain safely preserved.`}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Admin Reset Password Dialog */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-border-subtle rounded-2xl shadow-bento">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-text-ink">
              <KeyRound className="h-5 w-5 text-surface-forest" />
              Reset Account Password
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Assign a temporary password for{" "}
              <span className="font-semibold text-text-ink">{user.email}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-ink">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs font-semibold text-surface-forest hover:underline"
                >
                  Generate Strong
                </button>
              </div>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2.5 font-mono text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setResetModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReset}
              disabled={resetting || newPassword.length < 8}
              className="rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white hover:bg-surface-forest/90"
            >
              {resetting ? "Resetting..." : "Apply New Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider text-text-muted"
        >
          User Account
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const profile = user.profile;
      const firstName = profile?.name?.firstName || "";
      const lastName = profile?.name?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || user.email.split("@")[0];
      const image = profile?.profileImage;
      const fullImageUrl = image
        ? image.startsWith("http")
          ? image
          : `${SERVERURL}${image}`
        : null;

      const initials =
        (firstName[0] || "") + (lastName[0] || "") ||
        user.email.substring(0, 2).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-bento/40 overflow-hidden font-bold text-xs text-surface-forest">
            {fullImageUrl ? (
              <Image
                src={fullImageUrl}
                alt={fullName}
                fill
                className="object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/manage-users/${user._id}`}
              className="font-bold text-sm text-text-ink hover:text-surface-forest transition-colors block truncate"
            >
              {fullName}
            </Link>
            <span className="font-mono text-[11px] text-text-muted truncate block">
              {user.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
        Role
      </span>
    ),
    cell: ({ row }) => {
      return <RoleBadge role={row.original.role} />;
    },
  },
  {
    id: "association",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
        Entity / Activity
      </span>
    ),
    cell: ({ row }) => {
      const user = row.original;
      if (user.role === "bursar") {
        const school = user.profile?.school;
        if (school) {
          return (
            <Link
              href={`/dashboard/schools-list/${school.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-forest hover:underline"
            >
              <Building className="h-3.5 w-3.5 text-surface-forest/70" />
              <span className="truncate max-w-[150px]">{school.name}</span>
            </Link>
          );
        }
        return <span className="text-xs text-text-muted italic">No school assigned</span>;
      }

      if (user.role === "donar") {
        const total = user.profile?.totalDonationAmount || 0;
        return (
          <div className="text-xs">
            <span className="font-bold text-text-ink">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-text-muted block">lifetime donations</span>
          </div>
        );
      }

      return (
        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
          Platform Admin
        </span>
      );
    },
  },
  {
    accessorKey: "profile.contactNo",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
        Phone
      </span>
    ),
    cell: ({ row }) => {
      const phone = row.original.profile?.contactNo;
      return (
        <span className="text-xs text-text-muted">
          {phone || "—"}
        </span>
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
          Joined
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
    accessorKey: "status",
    header: () => (
      <span className="font-bold text-xs uppercase tracking-wider text-text-muted text-center block">
        Status
      </span>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <StatusCell user={row.original} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionsCell user={row.original} />;
    },
  },
];
