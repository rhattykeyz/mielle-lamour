export const staffPermissions = [
  { key: "calendar", label: "Calendar" },
  { key: "bookings", label: "New booking" },
  { key: "clients", label: "Clients" },
  { key: "services", label: "Services" },
  { key: "gallery", label: "Gallery" },
  { key: "content", label: "Content" },
  { key: "settings", label: "Settings" },
  { key: "export", label: "Export" },
  { key: "activity", label: "Activity" },
] as const;

export type StaffPermission = (typeof staffPermissions)[number]["key"];

export function canAccess(
  profile: { role: string; permissions?: string[] | null },
  permission: StaffPermission,
) {
  return profile.role === "owner" || (profile.permissions ?? []).includes(permission);
}
