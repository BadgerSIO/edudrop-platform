import { IUser } from "@/app/types/User";
import { StatusTone } from "@/app/sharedComponents/ui/StatusBadge";

export type NormalizedUserStatus = "active" | "suspended" | "archived";

export function resolveAccountStatus(
  user?: Pick<IUser, "status" | "isDeleted"> | null
): NormalizedUserStatus {
  if (!user) return "active";
  if (
    user.status === "active" ||
    user.status === "suspended" ||
    user.status === "archived"
  ) {
    return user.status;
  }
  return user.isDeleted ? "archived" : "active";
}

export function getUserStatusDescriptor(status: NormalizedUserStatus): {
  label: string;
  tone: StatusTone;
} {
  if (status === "suspended") {
    return { label: "Suspended", tone: "danger" };
  }
  if (status === "archived") {
    return { label: "Archived", tone: "neutral" };
  }
  return { label: "Active", tone: "active" };
}
