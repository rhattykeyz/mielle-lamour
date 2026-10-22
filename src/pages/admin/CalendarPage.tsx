import { useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

const statuses = ["pending_deposit", "confirmed", "completed", "cancelled", "no_show"] as const;

export function CalendarPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState<"day" | "week" | "list">("week");
  const [anchor, setAnchor] = useState(new Date());
  const [staffFilter, setStaffFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const range = useMemo(() => {
    if (view === "day") {
      const s = new Date(anchor);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: addDays(s, 1) };
    }
    const s = startOfWeek(anchor, { weekStartsOn: 1 });
    return { start: s, end: addDays(s, 7) };
  }, [view, anchor]);

  const { data: staff } = useQuery({
    queryKey: ["staff-all"],
    queryFn: async () => (await supabase.from("staff").select("*").order("sort_order")).data ?? [],
  });

  const { data: bookings } = useQuery({
    queryKey: ["cal", range.start.toISOString(), staffFilter, profile?.staff_id],
    queryFn: async () => {
      let q = supabase
        .from("bookings")
        .select(
          "*, clients(full_name, phone), staff(full_name), booking_services(name_snapshot)",
        )
        .gte("starts_at", range.start.toISOString())
        .lt("starts_at", range.end.toISOString())
        .order("starts_at");
      if (profile?.role === "staff" && profile.staff_id) q = q.eq("staff_id", profile.staff_id);
      else if (staffFilter !== "all") q = q.eq("staff_id", staffFilter);
      return (await q).data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.rpc("admin_set_booking_status", {
        p_id: id,
        p_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cal"] }),
  });

  const deposit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("mark_deposit_received", { p_booking_id: id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cal"] }),
  });

  const selected = (bookings ?? []).find((b) => b.id === open);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Calendar</h1>
        <div className="flex gap-2">
          {(["day", "week", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${view === v ? "bg-gold" : "bg-pink"}`}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-ghost !py-2" onClick={() => setAnchor(addDays(anchor, view === "day" ? -1 : -7))}>
          Previous
        </button>
        <p className="py-2">{format(range.start, "d MMM yyyy")}</p>
        <button type="button" className="btn-ghost !py-2" onClick={() => setAnchor(addDays(anchor, view === "day" ? 1 : 7))}>
          Next
        </button>
        {profile?.role === "owner" && (
          <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
            <option value="all">All staff</option>
            {(staff ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        )}
      </div>
      <ul className="mt-6 space-y-2">
        {(bookings ?? []).map((b) => (
          <li key={b.id}>
            <button
              type="button"
              className="card w-full rounded-2xl p-4 text-left"
              onClick={() => setOpen(b.id)}
            >
              <span className="font-medium">{formatTime(b.starts_at)}</span> {b.reference} ·{" "}
              {b.status.replace("_", " ")} · {staffName(b.staff)}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="card mt-6 space-y-3 rounded-3xl p-6">
          <h2 className="font-serif text-2xl">{selected.reference}</h2>
          <p>{format(new Date(selected.starts_at), "PPpp")}</p>
          <p>Status: {selected.status}</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                className="btn-ghost !py-2 text-sm"
                onClick={() => update.mutate({ id: selected.id, status: s })}
              >
                {s.replace("_", " ")}
              </button>
            ))}
            {selected.status === "pending_deposit" && profile?.role === "owner" && (
              <button type="button" className="btn-gold !py-2" onClick={() => deposit.mutate(selected.id)}>
                Mark deposit received
              </button>
            )}
          </div>
          {profile?.role === "owner" && (
            <form
              className="mt-4 flex flex-wrap gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const local = `${form.get("when")}`;
                const { error } = await supabase.rpc("admin_reschedule_booking", {
                  p_id: selected.id,
                  p_starts_at: new Date(local).toISOString(),
                  p_staff_id: form.get("staff_id"),
                });
                if (error) alert(error.message);
                else qc.invalidateQueries({ queryKey: ["cal"] });
              }}
            >
              <input name="when" type="datetime-local" required />
              <select name="staff_id" defaultValue={selected.staff_id}>
                {(staff ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
              <button className="btn-gold !py-2" type="submit">
                Reschedule
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function staffName(s: unknown) {
  if (Array.isArray(s)) return s[0]?.full_name ?? "";
  return (s as { full_name?: string } | null)?.full_name ?? "";
}
