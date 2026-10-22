import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export function DashboardPage() {
  const { profile } = useAuth();
  const { data } = useQuery({
    queryKey: ["dashboard", profile?.staff_id],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const upcomingEnd = new Date(today);
      upcomingEnd.setDate(today.getDate() + 7);

      let q = supabase
        .from("bookings")
        .select("id, reference, starts_at, status, deposit_received, clients(full_name), staff(full_name)")
        .gte("starts_at", today.toISOString())
        .in("status", ["confirmed", "pending_deposit"])
        .order("starts_at");
      if (profile?.role === "staff" && profile.staff_id) q = q.eq("staff_id", profile.staff_id);

      const { data: upcoming } = await q.lt("starts_at", upcomingEnd.toISOString());
      const todayList = (upcoming ?? []).filter(
        (b) => b.starts_at >= today.toISOString() && b.starts_at < tomorrow.toISOString(),
      );
      const pending = (upcoming ?? []).filter((b) => b.status === "pending_deposit");
      return { upcoming: upcoming ?? [], todayList, pending };
    },
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Today at Mielle L'Amour</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="Today" value={data?.todayList.length ?? 0} />
        <Stat label="Next 7 days" value={data?.upcoming.length ?? 0} />
        <Stat label="Pending deposit" value={data?.pending.length ?? 0} />
      </div>
      <h2 className="mt-10 font-serif text-2xl">Upcoming</h2>
      <ul className="mt-4 divide-y divide-gold/20 card rounded-3xl">
        {(data?.upcoming ?? []).map((b) => (
          <li key={b.id} className="flex flex-wrap justify-between gap-2 p-4 text-sm">
            <span>
              {b.reference} · {formatDateTime(b.starts_at)}
            </span>
            <span>
              {(b.clients as { full_name: string } | { full_name: string }[] | null) &&
                clientName(b.clients)}{" "}
              · {b.status.replace("_", " ")}
            </span>
          </li>
        ))}
        {!data?.upcoming.length && <li className="p-4 text-ink-muted">No upcoming bookings.</li>}
      </ul>
      <Link to="/admin/calendar" className="btn-gold mt-6">
        Open calendar
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card rounded-3xl p-5">
      <p className="text-xs uppercase tracking-widest text-gold-deep">{label}</p>
      <p className="font-serif text-4xl">{value}</p>
    </div>
  );
}

function clientName(c: unknown) {
  if (Array.isArray(c)) return c[0]?.full_name ?? "";
  return (c as { full_name?: string } | null)?.full_name ?? "";
}
