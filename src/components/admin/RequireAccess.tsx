import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccess, type StaffPermission } from "@/lib/staffPermissions";

export function RequireAccess({
  permission,
  ownerOnly,
  children,
}: {
  permission?: StaffPermission;
  ownerOnly?: boolean;
  children: ReactNode;
}) {
  const { profile, loading } = useAuth();
  if (loading || !profile) return <p className="p-8">Loading…</p>;
  const allowed = ownerOnly
    ? profile.role === "owner"
    : permission
      ? canAccess(profile, permission)
      : true;
  if (!allowed) return <Navigate to="/admin" replace />;
  return children;
}
