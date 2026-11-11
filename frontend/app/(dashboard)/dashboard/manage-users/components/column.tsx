"use client";

import React, { useContext, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreVertical,
  Shield,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Building,
  ShieldAlert,
  CheckCircle2,
  Ban,
  Lock,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { IUser } from "@/app/types/User";
import Link from "next/link";
import Image from "next/image";
import useUser from "@/app/hooks/useUser";
import { dateConverter } from "@/app/utility/dateConverter";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import { generatePassword } from "@/app/utility/passwordGenerator";
import toast from "react-hot-toast";
import { AuthenticationContext } from "@/app/context/AuthContext";
import StatusBadge from "@/app/sharedComponents/ui/StatusBadge";
import StatusChangeDialog from "@/app/sharedComponents/ui/StatusChangeDialog";
import {
  getUserStatusDescriptor,
  resolveAccountStatus,
} from "@/app/utility/statusHelpers";

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

// Account Cell (shows `(You)` indicator for currently signed-in admin)
const UserAccountCell = ({ user }: { user: IUser }) => {
  const { data: currentUser } = useContext(AuthenticationContext);
  const isSelf = Boolean(
    currentUser &&
      (currentUser.email === user.email || currentUser._id === user._id)
  );

  const profile = user.profile;
  const firstName = profile?.name?.firstName || "";
  const lastName = profile?.name?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || user.email.split("@")[0];
  const image = profile?.profileImage;
  const fullImageUrl = image ? handleBuildImage(image, "") || null : null;

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
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/manage-users/${user._id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-sm text-text-ink hover:text-surface-forest transition-colors truncate"
          >
            {fullName}
          </Link>
          {isSelf && (
            <span className="shrink-0 rounded bg-surface-forest/10 px-1.5 py-0.5 text-[10px] font-semibold text-surface-forest">
              You
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-text-muted truncate block">
          {user.email}
        </span>
      </div>
    </div>
  );
};

// Actions Cell with Lifted Modals for Explicit Status Change, Reset Password & Archive
const ActionsCell = ({ user }: { user: IUser }) => {
  const { data: currentUser } = useContext(AuthenticationContext);
  const { handleUserStatus, handleResetPassword, handleDeleteUser, loadingUser } =
    useUser();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const isSelf = Boolean(
    currentUser &&
      (currentUser.email === user.email || currentUser._id === user._id)
  );
  const isProtectedAdmin = isSelf || user.role === "admin";
  const resolvedStatus = resolveAccountStatus(user);
  const isActive = resolvedStatus === "active";
  const targetStatus: "active" | "suspended" = isActive ? "suspended" : "active";

  const fullName =
    `${user.profile?.name?.firstName || ""} ${user.profile?.name?.lastName || ""}`.trim() ||
    user.email.split("@")[0];

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
          className="w-52 bg-white border border-border-subtle shadow-bento rounded-xl p-1.5 space-y-1"
        >
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
          >
            <Link href={`/dashboard/manage-users/${user._id}`}>
              View User Hub & History
            </Link>
          </DropdownMenuItem>

          {isProtectedAdmin ? (
            <DropdownMenuItem
              disabled
              className="rounded-lg text-xs font-medium text-text-muted opacity-70"
            >
              <Lock className="mr-2 h-3.5 w-3.5" />
              <span>Admin Access Protected</span>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem
                className={`cursor-pointer rounded-lg text-xs font-medium ${
                  isActive
                    ? "text-amber-700 hover:bg-amber-50 focus:bg-amber-50"
                    : "text-surface-forest hover:bg-surface-forest/10 focus:bg-surface-forest/10"
                }`}
                onSelect={() => setStatusModalOpen(true)}
              >
                {isActive ? (
                  <Ban className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                )}
                <span>
                  {isActive ? "Suspend Account..." : "Activate Account..."}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
                onSelect={() => setResetModalOpen(true)}
              >
                <KeyRound className="mr-2 h-3.5 w-3.5 text-surface-forest" />
                <span>Reset Password...</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border-subtle/80" />

              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                onSelect={() => setArchiveModalOpen(true)}
              >
                <ShieldAlert className="mr-2 h-3.5 w-3.5" />
                <span>Archive Account...</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Explicit Status Transition Confirmation Dialog */}
      <StatusChangeDialog
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        title="Confirm Account Status Change"
        entityName={fullName}
        entitySubtitle={user.email}
        entityMetaBadge={user.role === "donar" ? "Donor" : user.role}
        currentStatus={getUserStatusDescriptor(resolvedStatus)}
        targetStatus={getUserStatusDescriptor(targetStatus)}
        impactDescription={
          targetStatus === "suspended"
            ? "Suspending this account immediately revokes sign-in access across EduDrop. Past donations, receipts, and order histories remain preserved."
            : "Activating this account immediately restores normal sign-in and portal permissions for this user."
        }
        confirmLabel={
          targetStatus === "suspended"
            ? "Confirm Suspension"
            : "Restore Active Access"
        }
        confirmTone={targetStatus === "suspended" ? "amber" : "forest"}
        loading={loadingUser}
        onConfirm={() => handleUserStatus(user._id, targetStatus)}
      />

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

      {/* Archive Account Confirmation Dialog (lifted outside DropdownMenu) */}
      <AlertDialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the account for{" "}
              <span className="font-semibold text-text-ink">{user.email}</span>{" "}
              and permanently revoke authentication access. Historic
              transactions and orders will remain safely preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleDeleteUser(user._id)}
            >
              Archive Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    cell: ({ row }) => <UserAccountCell user={row.original} />,
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
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-forest hover:underline"
            >
              <Building className="h-3.5 w-3.5 text-surface-forest/70" />
              <span className="truncate max-w-[150px]">{school.name}</span>
            </Link>
          );
        }
        return (
          <span className="text-xs text-text-muted italic">
            No school assigned
          </span>
        );
      }

      if (user.role === "donar") {
        const total = user.profile?.totalDonationAmount || 0;
        return (
          <div className="text-xs">
            <span className="font-bold text-text-ink">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-text-muted block">
              lifetime donations
            </span>
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
      return <span className="text-xs text-text-muted">{phone || "—"}</span>;
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
      const status = resolveAccountStatus(row.original);
      const descriptor = getUserStatusDescriptor(status);
      return (
        <div className="flex justify-center">
          <StatusBadge label={descriptor.label} tone={descriptor.tone} />
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
