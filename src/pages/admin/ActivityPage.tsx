import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/format";

export function ActivityPage() {
  const { data } = useQuery({
    queryKey: ["activity"],
    queryFn: async () =>
      (
        await supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200)
      ).data ?? [],
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Activity log</h1>
      <ul className="mt-6 divide-y divide-gold/20 card rounded-3xl">
        {(data ?? []).map((row) => (
          <li key={row.id} className="p-4 text-sm">
            <p>
              {formatDateTime(row.created_at)} · {row.action} · {row.entity} {row.entity_id}
            </p>
            <pre className="mt-1 overflow-auto text-xs text-ink-muted">
              {JSON.stringify(row.meta)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
