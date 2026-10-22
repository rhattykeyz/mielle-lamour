import { FormEvent, useState } from "react";
import { addDays, format } from "date-fns";
import { useServices, useStaff } from "@/hooks/usePublicData";
import { callFunction } from "@/lib/supabase";
import { formatTime } from "@/lib/format";
import type { Slot } from "@/types";

export function NewBookingPage() {
  const { data: services } = useServices();
  const { data: staff } = useStaff();
  const [selected, setSelected] = useState<string[]>([]);
  const [staffId, setStaffId] = useState("any");
  const [date, setDate] = useState(format(addDays(new Date(), 0), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadSlots() {
    const res = await callFunction<{ slots: Slot[] }>("availability", {
      service_ids: selected,
      staff_id: staffId === "any" ? null : staffId,
      date,
    });
    setSlots(res.slots);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    const form = new FormData(e.currentTarget);
    const res = await callFunction<{ booking: { reference: string } }>("create-booking", {
      service_ids: selected,
      staff_id: staffId === "any" ? null : slot.staff_id,
      starts_at: slot.starts_at,
      client_name: form.get("name"),
      client_phone: form.get("phone"),
      client_email: form.get("email"),
      notes: form.get("notes"),
      consent: true,
      policy_agreed: true,
      source: "admin",
    });
    setMsg(`Saved ${res.booking.reference}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-4xl">Walk-in / phone booking</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <fieldset>
          <legend className="text-sm uppercase tracking-widest text-gold-deep">Services</legend>
          {(services ?? []).map((s) => (
            <label key={s.id} className="mt-2 flex items-center gap-2 normal-case tracking-normal">
              <input
                type="checkbox"
                className="w-auto"
                checked={selected.includes(s.id)}
                onChange={() =>
                  setSelected((c) => (c.includes(s.id) ? c.filter((i) => i !== s.id) : [...c, s.id]))
                }
              />
              {s.name}
            </label>
          ))}
        </fieldset>
        <div>
          <label>Staff</label>
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            <option value="any">Any available</option>
            {(staff ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn-ghost !py-2" onClick={loadSlots}>
            Times
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              type="button"
              key={`${s.staff_id}${s.starts_at}`}
              className={`rounded-full px-3 py-1 text-sm ${slot === s ? "bg-gold" : "bg-pink"}`}
              onClick={() => setSlot(s)}
            >
              {formatTime(s.starts_at)}
            </button>
          ))}
        </div>
        <input name="name" placeholder="Client name" required />
        <input name="phone" placeholder="Phone" required />
        <input name="email" placeholder="Email (optional)" />
        <textarea name="notes" placeholder="Notes" />
        {msg && <p>{msg}</p>}
        <button className="btn-gold" type="submit">
          Save booking
        </button>
      </form>
    </div>
  );
}
