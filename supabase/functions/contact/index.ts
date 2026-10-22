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

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { data: allowed } = await supabase.rpc("consume_rate_limit", {
    p_key: `contact:${ip}`,
    p_limit: 8,
    p_window_seconds: 3600,
  });
  // consume_rate_limit is not granted to the role by default; ignore if missing.
  void allowed;

  const { data, error } = await supabase.rpc("submit_contact", {
    p_name: body.name,
    p_email: body.email ?? "",
    p_phone: body.phone ?? "",
    p_message: body.message,
    p_honeypot: body.website ?? "",
  });
  if (error) return json({ error: error.message }, 400);
  return json(data);
});
