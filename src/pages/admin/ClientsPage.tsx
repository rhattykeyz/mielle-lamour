import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/format";

export function AdminClientsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const { data: clients } = useQuery({
    queryKey: ["clients", q],
    queryFn: async () => {
      let req = supabase.from("clients").select("*").order("full_name").limit(200);
      const term = q.trim().replace(/[%(),]/g, "");
      if (term) req = req.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);
      return (await req).data ?? [];
    },
  });
  const { data: history } = useQuery({
    queryKey: ["client-hist", open],
    enabled: !!open,
    queryFn: async () =>
      (
        await supabase
          .from("bookings")
          .select("reference, starts_at, status, total_price")
          .eq("client_id", open!)
          .order("starts_at", { ascending: false })
      ).data ?? [],
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Clients</h1>
      <input
        className="mt-4 max-w-md"
        placeholder="Search name or phone"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <ul className="mt-6 divide-y divide-gold/20 card rounded-3xl">
        {(clients ?? []).map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="flex w-full flex-wrap justify-between gap-2 p-4 text-left"
              onClick={() => setOpen(c.id)}
            >
              <span>
                {c.full_name} · {c.phone}
              </span>
              <span className="text-sm text-ink-muted">No-shows {c.no_show_count}</span>
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <div className="card mt-6 rounded-3xl p-5">
          <h2 className="font-serif text-2xl">History</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {(history ?? []).map((b) => (
              <li key={b.reference}>
                {b.reference} · {formatDateTime(b.starts_at)} · {b.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
