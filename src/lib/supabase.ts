import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

if (!supabaseConfigured) {
  console.warn(
    "Supabase env vars are missing. Copy .env.example to .env.local and add your project keys.",
  );
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "public-anon-key",
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function functionsUrl(name: string) {
  return `${url}/functions/v1/${name}`;
}

export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(functionsUrl(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anon ?? "",
      Authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || "Request failed");
  }
  return json as T;
}
