"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  KeyRound,
  Lock,
  ArrowLeft,
  Building,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { IUser } from "@/app/types/User";
import { SERVERURL } from "@/lib/constants";
import { dateConverter } from "@/app/utility/dateConverter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
import useUser from "@/app/hooks/useUser";
import { generatePassword } from "@/app/utility/passwordGenerator";
import toast from "react-hot-toast";
import { AuthenticationContext } from "@/app/context/AuthContext";
import StatusBadge from "@/app/sharedComponents/ui/StatusBadge";
import StatusChangeDialog from "@/app/sharedComponents/ui/StatusChangeDialog";
import {
  getUserStatusDescriptor,
  resolveAccountStatus,
} from "@/app/utility/statusHelpers";

interface UserDetailHubProps {
  user: IUser;
}

export default function UserDetailHub({ user }: UserDetailHubProps) {
  const { data: currentUser } = useContext(AuthenticationContext);
  const { handleUserStatus, handleResetPassword, handleDeleteUser, loadingUser } =
    useUser();

  const [activeTab, setActiveTab] = useState("profile");
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const isSelf = Boolean(
    currentUser &&
      (currentUser.email === user.email || currentUser._id === user._id)
  );
  const isProtectedAdmin = isSelf || user.role === "admin";

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

  const resolvedStatus = resolveAccountStatus(user);
  const statusDescriptor = getUserStatusDescriptor(resolvedStatus);
  const isActive = resolvedStatus === "active";
  const targetStatus: "active" | "suspended" = isActive ? "suspended" : "active";

  const handleGeneratePassword = () => {
    const pass = generatePassword();
    setNewPassword(pass);
    navigator.clipboard.writeText(pass);
    toast.success("Strong password generated & copied to clipboard!");
  };

  const onResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    const success = await handleResetPassword(user._id, newPassword);
    setResetting(false);
    if (success) {
      setNewPassword("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-border-subtle/80">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/manage-users"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted hover:text-text-ink hover:bg-surface-bento/50 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-3.5">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface-bento/40 font-bold text-lg text-surface-forest overflow-hidden flex-shrink-0">
                {fullImageUrl ? (
                  <Image
                    src={fullImageUrl}
                    alt={fullName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                    {fullName}
                  </h1>
                  {isSelf && (
                    <span className="rounded-md bg-surface-forest/10 px-2 py-0.5 text-xs font-semibold text-surface-forest">
                      You
                    </span>
                  )}
                  <StatusBadge
                    label={
                      resolvedStatus === "active"
                        ? "Active Account"
                        : statusDescriptor.label
                    }
                    tone={statusDescriptor.tone}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                  <span className="capitalize font-medium bg-surface-bento/60 px-2 py-0.5 rounded-md">
                    {user.role} Account
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {isProtectedAdmin ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-bento/40 px-3.5 py-2 text-xs font-semibold text-text-muted">
                <Lock className="h-3.5 w-3.5" />
                Protected Admin Account
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(true)}
                  disabled={loadingUser}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-all ${
                    isActive
                      ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border border-surface-forest/20 bg-surface-forest/10 text-surface-forest hover:bg-surface-forest/20"
                  }`}
                >
                  {isActive ? (
                    <Ban className="h-3.5 w-3.5" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {isActive ? "Suspend Account..." : "Activate Account..."}
                  </span>
                </button>

                <CustomAlertDialouge
                  triggerText="Archive Account"
                  triggerClass="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 transition-colors"
                  onConfirm={() => handleDeleteUser(user._id)}
                  alertDescription={`This will archive the account for ${user.email} and revoke login access while preserving historic orders and donor records.`}
                />
              </>
            )}
          </div>
        </div>

        <StatusChangeDialog
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          title="Confirm Account Status Change"
          entityName={fullName}
          entitySubtitle={user.email}
          entityMetaBadge={user.role === "donar" ? "Donor" : user.role}
          currentStatus={statusDescriptor}
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

        {/* Tabbed Navigation */}
        <div className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-surface-bento/40 p-1 rounded-xl gap-1">
              <TabsTrigger
                value="profile"
                className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-surface-forest data-[state=active]:shadow-sm"
              >
                Profile & Contact
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-surface-forest data-[state=active]:shadow-sm"
              >
                Role Activity & History
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-surface-forest data-[state=active]:shadow-sm"
              >
                Security & Credentials
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Profile & Contact */}
            <TabsContent value="profile" className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal & Account Information */}
                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink border-b border-border-subtle pb-3">
                    Personal & Account Attributes
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-text-muted block">Full Name</span>
                      <span className="font-semibold text-text-ink text-sm">
                        {fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Email Address</span>
                      <span className="font-semibold text-text-ink">
                        {user.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Contact Phone</span>
                      <span className="font-semibold text-text-ink">
                        {profile?.contactNo || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Assigned Role</span>
                      <span className="capitalize font-semibold text-text-ink">
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Unique Account ID</span>
                      <span className="font-mono text-text-muted text-[11px]">
                        {user._id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Physical Delivery Address */}
                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink border-b border-border-subtle pb-3">
                    Location & Physical Address
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-text-muted block">Street Address</span>
                      <span className="font-semibold text-text-ink">
                        {(profile as any)?.address?.street || (profile as any)?.presentAddress || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">City</span>
                      <span className="font-semibold text-text-ink">
                        {(profile as any)?.address?.city || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">State / Region</span>
                      <span className="font-semibold text-text-ink">
                        {(profile as any)?.address?.state || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Postal / Zip Code</span>
                      <span className="font-semibold text-text-ink">
                        {(profile as any)?.address?.zipCode || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Country</span>
                      <span className="font-semibold text-text-ink">
                        {(profile as any)?.address?.country || "USA"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Metadata */}
              <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-surface-forest" />
                  Account Registered: {dateConverter(user.createdAt)}
                </span>
                <span>
                  Last Updated: {user.updatedAt ? dateConverter(user.updatedAt) : "Never"}
                </span>
              </div>
            </TabsContent>

            {/* TAB 2: Role Activity & History */}
            <TabsContent value="activity" className="pt-6 space-y-6">
              {user.role === "donar" && (
                <div className="space-y-6">
                  {/* Donation KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Total Contributions
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lime/20 text-surface-forest">
                          <DollarSign className="h-4 w-4" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold tracking-tight text-surface-forest block mt-2">
                        ${(user.donationStats?.totalDonated || (profile as any)?.totalDonationAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Total Sips Placed
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-bento text-text-body">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold tracking-tight text-text-ink block mt-2">
                        {user.donationStats?.totalOrders || user.recentOrders?.length || 0} orders
                      </span>
                    </div>
                  </div>

                  {/* Recent Orders History Table */}
                  <div className="rounded-xl border border-border-subtle bg-white shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border-subtle bg-surface-bento/10 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-ink">
                        Recent Sips & Donations History
                      </h3>
                      <span className="text-xs text-text-muted">
                        Showing latest {user.recentOrders?.length || 0} transactions
                      </span>
                    </div>

                    {user.recentOrders && user.recentOrders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-bento/30 font-bold uppercase text-text-muted border-b border-border-subtle">
                            <tr>
                              <th className="p-3">Order ID</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Partner Campus</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle">
                            {user.recentOrders.map((ord: any) => (
                              <tr key={ord._id} className="hover:bg-surface-bento/10 transition-colors">
                                <td className="p-3 font-mono font-medium">
                                  {ord.orderId || ord._id.substring(0, 8)}
                                </td>
                                <td className="p-3 text-text-muted">
                                  {dateConverter(ord.createdAt)}
                                </td>
                                <td className="p-3 font-semibold text-text-ink">
                                  {ord.schoolId?.name || "Community Campus"}
                                </td>
                                <td className="p-3 font-bold text-surface-forest">
                                  ${ord.totalAmount?.toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {ord.orderStatus}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <Link
                                    href={`/dashboard/orders/${ord._id}`}
                                    className="inline-flex items-center gap-1 text-surface-forest hover:underline font-semibold"
                                  >
                                    <span>Inspect</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-text-muted">
                        No recorded donation transactions found for this supporter.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.role === "bursar" && (
                <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                    <GraduationCap className="h-5 w-5 text-surface-forest" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                      Associated School Institution
                    </h3>
                  </div>

                  {(profile as any)?.school ? (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-surface-bento/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border-subtle font-bold text-surface-forest">
                          <Building className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-ink">
                            {(profile as any)?.school?.name}
                          </h4>
                          <span className="font-mono text-xs text-text-muted">
                            /schools/{(profile as any)?.school?.slug}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/schools-list/${(profile as any)?.school?.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow hover:bg-surface-forest-light"
                      >
                        <span>Manage Campus Hub</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">
                      No school campus currently mapped to this bursar administrator.
                    </p>
                  )}
                </div>
              )}

              {user.role === "admin" && (
                <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                    <Shield className="h-5 w-5 text-surface-forest" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                      Platform Administration Scope
                    </h3>
                  </div>
                  <p className="text-xs text-text-body">
                    This account holds full administrative rights across the Edudrop platform, including financial reconciliation, product inventory management, school verification, and security controls.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: Security & Credentials */}
            <TabsContent value="security" className="pt-6 space-y-6">
              {isProtectedAdmin ? (
                <div className="rounded-xl border border-border-subtle bg-surface-bento/25 p-6 space-y-2">
                  <div className="flex items-center gap-2 text-text-ink">
                    <Lock className="h-4 w-4 text-surface-forest" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Protected Administrative Account
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Administrative credentials, suspension controls, and account archiving are locked in the web dashboard to prevent accidental privilege loss or self-lockout.
                  </p>
                </div>
              ) : (
                <>
                  {/* Reset Password Card */}
                  <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                      <KeyRound className="h-5 w-5 text-surface-forest" />
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                          Administrative Password Reset
                        </h3>
                        <p className="text-xs text-text-muted">
                          Assign a new secure password directly to this user account.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={onResetPasswordSubmit} className="space-y-4 max-w-lg">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-text-ink">
                            New Password
                          </label>
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline"
                          >
                            <Sparkles className="h-3 w-3 text-brand-lime fill-brand-lime" />
                            Generate Strong Password
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 font-mono text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={resetting || newPassword.length < 8}
                        className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-surface-forest-light transition-all disabled:opacity-50"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>{resetting ? "Applying..." : "Reset Account Password"}</span>
                      </button>
                    </form>
                  </div>

                  {/* Danger Zone: Archiving */}
                  <div className="rounded-xl border border-red-200 bg-red-50/40 p-6 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-700">
                      Account Lifecycle & Archiving
                    </h3>
                    <p className="text-xs text-red-600/90 leading-relaxed">
                      Archiving an account revokes authentication access immediately. Historic donations, receipts, and order histories are safely preserved in compliance with audit standards.
                    </p>
                    <div className="pt-2">
                      <CustomAlertDialouge
                        triggerText="Archive User Account"
                        triggerClass="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700 transition-colors"
                        onConfirm={() => handleDeleteUser(user._id)}
                        alertDescription={`Are you sure you want to archive ${user.email}? This action can only be reversed by a database administrator.`}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
