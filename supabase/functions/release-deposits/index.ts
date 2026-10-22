import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json, optionsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const secret = Deno.env.get("CRON_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (secret && auth !== `Bearer ${secret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase.rpc("release_expired_deposits");
  if (error) return json({ error: error.message }, 500);

  // Send the queued deposit_expired emails in the same pass.
  await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-reminders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
  }).catch(() => null);

  return json({ released: data ?? 0 });
});
