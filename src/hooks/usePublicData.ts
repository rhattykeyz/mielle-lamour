import { useQuery } from "@tanstack/react-query";
import { ABOUT_BODY, ABOUT_KEY } from "@/lib/aboutCopy";
import { DISCOUNTS_BODY, DISCOUNTS_KEY } from "@/lib/discountsCopy";
import { localCategories, localServices } from "@/lib/priceList";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { PublicSettings, Service, ServiceCategory, StaffMember } from "@/types";

const localSettings: PublicSettings = {
  business_name: "Mielle L'Amour",
  tagline: "Nail · Beauty · Spa",
  address: "Add your salon address in Admin → Settings",
  area: "Add your area in Admin → Settings",
  city: "Accra",
  map_embed_url: "https://www.google.com/maps?q=Accra%20Ghana&output=embed",
  phone: "",
  whatsapp: "",
  email: "Add your email in Admin → Settings",
  instagram: "",
  tiktok: "",
  logo_url: "",
  currency: "GHS",
  timezone: "Africa/Accra",
  opening_hours_note: "Add your opening hours in Admin → Settings",
  opening_hours: {
    "0": { label: "Sunday", open: false, start: "10:00", end: "16:00" },
    "1": { label: "Monday", open: true, start: "09:00", end: "18:00" },
    "2": { label: "Tuesday", open: true, start: "09:00", end: "18:00" },
    "3": { label: "Wednesday", open: true, start: "09:00", end: "18:00" },
    "4": { label: "Thursday", open: true, start: "09:00", end: "18:00" },
    "5": { label: "Friday", open: true, start: "09:00", end: "18:00" },
    "6": { label: "Saturday", open: true, start: "09:00", end: "17:00" },
  },
  cancellation_policy:
    "Please cancel or reschedule at least 24 hours before your appointment. [POLICY WORDING — edit in Admin]",
  privacy_notice:
    "Mielle L'Amour collects your name, phone number and optional email so we can confirm and remind you of your appointment. We do not sell your information. [LEGAL REVIEW RECOMMENDED — Ghana Data Protection Act, 2012]",
};

const localReviews = [
  {
    id: "local-review-1",
    author_name: "[SAMPLE] Akosua",
    rating: 5,
    quote: "Soft, pretty and so calming. I cannot wait for the salon doors to open.",
  },
  {
    id: "local-review-2",
    author_name: "[SAMPLE] Nana Yaa",
    rating: 5,
    quote: "The gel set lasted beautifully and the whole feeling is luxe.",
  },
  {
    id: "local-review-3",
    author_name: "[SAMPLE] Esi",
    rating: 5,
    quote: "Bridal trial was unhurried and the details were perfect.",
  },
];

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      if (!supabaseConfigured) return localSettings;
      const { data, error } = await supabase.rpc("get_public_settings");
      if (error) throw error;
      return data as PublicSettings;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!supabaseConfigured) return localCategories;
      try {
        const { data, error } = await supabase
          .from("service_categories")
          .select("*")
          .eq("is_visible", true)
          .order("sort_order");
        if (error) return localCategories;
        return (data?.length ? data : localCategories) as ServiceCategory[];
      } catch {
        return localCategories;
      }
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      if (!supabaseConfigured) return localServices;
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_visible", true)
          .order("sort_order");
        if (error) return localServices;
        return (data?.length ? data : localServices) as Service[];
      } catch {
        return localServices;
      }
    },
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as StaffMember[];
    },
  });
}

function localPage(key: string) {
  if (key === DISCOUNTS_KEY) {
    return {
      key,
      title: DISCOUNTS_BODY.title,
      body: { ...DISCOUNTS_BODY },
    };
  }
  if (key === ABOUT_KEY) {
    return {
      key,
      title: ABOUT_BODY.title,
      body: { ...ABOUT_BODY },
    };
  }
  return null;
}

export function usePageContent(key: string) {
  return useQuery({
    queryKey: ["page", key],
    queryFn: async () => {
      if (!supabaseConfigured) return localPage(key);
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return data as { key: string; title: string; body: Record<string, string> } | null;
    },
  });
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!supabaseConfigured) return localReviews;
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const [{ data: cats }, { data: images }] = await Promise.all([
        supabase.from("gallery_categories").select("*").eq("is_visible", true).order("sort_order"),
        supabase.from("gallery_images").select("*").eq("is_visible", true).order("sort_order"),
      ]);
      return { categories: cats ?? [], images: images ?? [] };
    },
  });
}
