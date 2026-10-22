import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PublicSettings, Service, ServiceCategory, StaffMember } from "@/types";

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
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
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as ServiceCategory[];
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Service[];
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

export function usePageContent(key: string) {
  return useQuery({
    queryKey: ["page", key],
    queryFn: async () => {
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
