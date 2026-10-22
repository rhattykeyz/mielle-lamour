export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type Service = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price_ghs: number | string;
  price_from: boolean;
  requires_deposit: boolean;
  deposit_kind: "amount" | "percent";
  deposit_value: number | string;
  is_visible: boolean;
  sort_order: number;
};

export type StaffMember = {
  id: string;
  full_name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type PublicSettings = {
  business_name: string;
  tagline: string;
  address: string;
  area: string;
  city: string;
  map_embed_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  opening_hours: Record<
    string,
    { label: string; open: boolean; start: string; end: string }
  >;
  opening_hours_note: string;
  cancellation_policy: string;
  privacy_notice: string;
  logo_url: string;
  currency: string;
  timezone: string;
};

export type Slot = {
  staff_id: string;
  staff_name: string;
  starts_at: string;
  ends_at: string;
};

export type BookingStatus =
  | "pending_deposit"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Profile = {
  id: string;
  role: "owner" | "staff";
  staff_id: string | null;
  full_name: string | null;
};
