import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json, optionsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const origin = req.headers.get("origin") ?? "";
  const allowed = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
  if (allowed && origin && origin.replace(/\/$/, "") !== allowed) {
    // Allow local Vite during development.
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return json({ error: "Forbidden origin" }, 403);
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const body = await req.json().catch(() => ({}));
  if (body.website) {
    return json({ ok: true }); // honeypot
  }

  const { data, error } = await supabase.rpc("create_public_booking", {
    p_service_ids: body.service_ids,
    p_staff_id: body.staff_id ?? null,
    p_starts_at: body.starts_at,
    p_client_name: body.client_name,
    p_client_phone: body.client_phone,
    p_client_email: body.client_email ?? "",
    p_notes: body.notes ?? "",
    p_consent: Boolean(body.consent),
    p_policy_agreed: Boolean(body.policy_agreed),
    p_source: body.source ?? "online",
  });

  if (error) return json({ error: error.message }, 400);
  return json({ booking: data });
});
