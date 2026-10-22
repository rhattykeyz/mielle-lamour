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
  const { action, token } = body as { action?: string; token?: string };
  if (!token) return json({ error: "Missing token" }, 400);

  if (action === "get") {
    const { data, error } = await supabase.rpc("get_booking_by_token", {
      p_token: token,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ booking: data });
  }

  if (action === "cancel") {
    const { data, error } = await supabase.rpc("cancel_booking_by_token", {
      p_token: token,
      p_reason: body.reason ?? null,
    });
    if (error) {
      if (error.message.includes("INSIDE_WINDOW")) {
        return json({
          error: "INSIDE_WINDOW",
          message:
            "It is within 24 hours of your appointment. Please contact the salon to cancel.",
        }, 400);
      }
      return json({ error: error.message }, 400);
    }
    return json({ result: data });
  }

  if (action === "reschedule") {
    const { data, error } = await supabase.rpc("reschedule_booking_by_token", {
      p_token: token,
      p_starts_at: body.starts_at,
      p_staff_id: body.staff_id ?? null,
    });
    if (error) {
      if (error.message.includes("INSIDE_WINDOW")) {
        return json({
          error: "INSIDE_WINDOW",
          message:
            "It is within 24 hours of your appointment. Please contact the salon to reschedule.",
        }, 400);
      }
      return json({ error: error.message }, 400);
    }
    return json({ result: data });
  }

  return json({ error: "Unknown action" }, 400);
});
