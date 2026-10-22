import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { addDays, format } from "date-fns";
import { useCategories, usePublicSettings, useServices, useStaff } from "@/hooks/usePublicData";
import { callFunction } from "@/lib/supabase";
import { formatTime, money } from "@/lib/format";
import { Seo } from "@/lib/seo";
import type { Slot } from "@/types";

type Created = {
  id: string;
  reference: string;
  status: string;
  starts_at: string;
  ends_at: string;
  total_price: number;
  deposit_required: boolean;
  deposit_amount: number;
  deposit_hold_until: string | null;
  manage_token: string;
  mobile_money: { network?: string; name?: string; number?: string; instructions?: string } | null;
};

export function BookPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const { data: staff } = useStaff();
  const { data: settings } = usePublicSettings();

  const [selected, setSelected] = useState<string[]>(() => {
    const s = params.get("service");
    return s ? [s] : [];
  });
  const [staffId, setStaffId] = useState<string>("any");
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const chosen = (services ?? []).filter((s) => selected.includes(s.id));
  const duration = chosen.reduce((a, s) => a + s.duration_minutes, 0);
  const total = chosen.reduce((a, s) => a + Number(s.price_ghs), 0);

  const grouped = useMemo(() => {
    return (categories ?? [])
      .map((c) => ({ cat: c, items: (services ?? []).filter((s) => s.category_id === c.id) }))
      .filter((g) => g.items.length);
  }, [categories, services]);

  async function loadSlots() {
    setError(null);
    setSlot(null);
    if (!selected.length) {
      setError("Choose at least one service.");
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await callFunction<{ slots: Slot[] }>("availability", {
        service_ids: selected,
        staff_id: staffId === "any" ? null : staffId,
        date,
      });
      setSlots(res.slots);
      if (!res.slots.length) setError("No free times on that day. Try another date or stylist.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load times");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) {
      setError("Please choose a time.");
      return;
    }
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      const res = await callFunction<{ booking: Created }>("create-booking", {
        service_ids: selected,
        staff_id: staffId === "any" ? null : slot.staff_id,
        starts_at: slot.starts_at,
        client_name: form.get("name"),
        client_phone: form.get("phone"),
        client_email: form.get("email"),
        notes: form.get("notes"),
        consent: form.get("consent") === "on",
        policy_agreed: form.get("policy") === "on",
        website: form.get("website"),
      });
      navigate("/book/confirmed", { state: { booking: res.booking } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete booking");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Seo
        title="Book an appointment"
        description="Book nails, beauty or spa at Mielle L'Amour in Accra. Pay in person."
        path="/book"
      />
      <h1 className="font-serif text-5xl">Book with Mielle L'Amour</h1>
      <p className="mt-3 text-ink-muted">
        Payment is made in person at the salon. No account needed.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">1. Services</h2>
        {grouped.map(({ cat, items }) => (
          <fieldset key={cat.id} className="mt-4">
            <legend className="text-sm uppercase tracking-widest text-gold-deep">{cat.name}</legend>
            <div className="mt-2 space-y-2">
              {items.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3 normal-case tracking-normal">
                  <input
                    type="checkbox"
                    className="mt-1 w-auto"
                    checked={selected.includes(s.id)}
                    onChange={() =>
                      setSelected((cur) =>
                        cur.includes(s.id) ? cur.filter((id) => id !== s.id) : [...cur, s.id],
                      )
                    }
                  />
                  <span>
                    <span className="block font-medium">{s.name}</span>
                    <span className="text-sm text-ink-muted">
                      {s.duration_minutes} min · {money(s.price_ghs, s.price_from)}
                      {s.requires_deposit ? " · deposit required" : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {!!chosen.length && (
          <p className="mt-3 text-sm">
            {duration} min together · {money(total)}
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">2. Team member</h2>
        <select className="mt-3" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          <option value="any">Any available</option>
          {(staff ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">3. Date & time</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button type="button" className="btn-gold" onClick={loadSlots} disabled={loadingSlots}>
            {loadingSlots ? "Checking…" : "Show times"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              key={`${s.staff_id}-${s.starts_at}`}
              type="button"
              onClick={() => setSlot(s)}
              className={`rounded-full px-4 py-2 text-sm ${
                slot?.starts_at === s.starts_at && slot.staff_id === s.staff_id
                  ? "bg-gold"
                  : "bg-pink"
              }`}
            >
              {formatTime(s.starts_at)}
              {staffId === "any" ? ` · ${s.staff_name.split(" ")[0]}` : ""}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 rounded-3xl p-6">
        <h2 className="font-serif text-2xl">4. Your details</h2>
        <p className="hidden" aria-hidden>
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label htmlFor="email">Email (optional, for confirmation & reminders)</label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} />
        </div>
        <label className="flex items-start gap-3 normal-case tracking-normal">
          <input type="checkbox" name="policy" className="mt-1 w-auto" required />
          <span>
            Please cancel or reschedule at least 24 hours before your appointment.{" "}
            <Link to="/cancellation" className="underline">
              Read the policy
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-3 normal-case tracking-normal">
          <input type="checkbox" name="consent" className="mt-1 w-auto" required />
          <span>
            I agree to Mielle L'Amour storing my name, phone and optional email to manage this
            booking.{" "}
            <Link to="/privacy" className="underline">
              Privacy notice
            </Link>
          </span>
        </label>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        <p className="text-xs text-ink-muted">{settings?.cancellation_policy}</p>
        <button type="submit" className="btn-gold" disabled={submitting}>
          {submitting ? "Booking…" : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}
