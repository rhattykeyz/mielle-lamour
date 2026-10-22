import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json, optionsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const body = await req.json().catch(() => ({}));
  const { service_ids, staff_id, date } = body as {
    service_ids?: string[];
    staff_id?: string | null;
    date?: string;
  };

  if (!service_ids?.length || !date) {
    return json({ error: "service_ids and date are required" }, 400);
  }

  const { data, error } = await supabase.rpc("get_available_slots", {
    p_service_ids: service_ids,
    p_staff_id: staff_id ?? null,
    p_date: date,
  });

  if (error) return json({ error: error.message }, 400);
  return json({ slots: data ?? [] });
});
