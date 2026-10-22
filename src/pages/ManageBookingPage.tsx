import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addDays, format } from "date-fns";
import { callFunction } from "@/lib/supabase";
import { formatDateTime, formatTime } from "@/lib/format";
import { Seo } from "@/lib/seo";
import type { Slot } from "@/types";

type Booking = {
  reference: string;
  status: string;
  starts_at: string;
  staff_name: string;
  service_ids?: string[];
  services: { id?: string; name: string }[];
};

export function ManageBookingPage() {
  const { token } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    callFunction<{ booking: Booking }>("manage-booking", { action: "get", token })
      .then((r) => setBooking(r.booking))
      .catch((e) => setError(e.message));
  }, [token]);

  function explain(message: string) {
    if (message.includes("INSIDE_WINDOW")) {
      setError("INSIDE_WINDOW");
      return;
    }
    setError(message);
  }

  async function cancel() {
    if (!token) return;
    try {
      await callFunction("manage-booking", { action: "cancel", token });
      setDone("Your booking has been cancelled.");
    } catch (e) {
      explain(e instanceof Error ? e.message : "Could not cancel");
    }
  }

  async function loadSlots() {
    if (!booking) return;
    const res = await callFunction<{ slots: Slot[] }>("availability", {
      service_ids:
        booking.service_ids ?? booking.services.map((s) => s.id).filter((id): id is string => Boolean(id)),
      date,
    });
    setSlots(res.slots);
    if (!res.slots.length) setError("No free times on that day.");
    else setError(null);
  }

  async function reschedule(slot: Slot) {
    if (!token) return;
    try {
      await callFunction("manage-booking", {
        action: "reschedule",
        token,
        starts_at: slot.starts_at,
        staff_id: slot.staff_id,
      });
      setDone(`Your new time is ${formatDateTime(slot.starts_at)}.`);
    } catch (e) {
      explain(e instanceof Error ? e.message : "Could not reschedule");
    }
  }

  if (error === "INSIDE_WINDOW") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl">Please contact the salon</h1>
        <p className="mt-4 text-ink-muted">
          It is within 24 hours of your appointment. Please call or WhatsApp Mielle L'Amour instead
          of changing this booking online.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl">Done</h1>
        <p className="mt-4">{done}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Seo
        title="Manage booking"
        description="Cancel or reschedule your Mielle L'Amour appointment."
        path="/manage"
      />
      <h1 className="font-serif text-4xl">Manage booking</h1>
      {!booking && !error && <p className="mt-4">Loading…</p>}
      {error && error !== "INSIDE_WINDOW" && <p className="mt-4 text-[var(--error)]">{error}</p>}
      {booking && (
        <div className="card mt-6 space-y-2 rounded-3xl p-6">
          <p>
            {booking.reference} · {booking.status.replace("_", " ")}
          </p>
          <p>
            {formatDateTime(booking.starts_at)} with {booking.staff_name}
          </p>
          <p className="text-sm">{booking.services.map((s) => s.name).join(", ")}</p>
          <button type="button" className="btn-ghost mt-4" onClick={cancel}>
            Cancel booking
          </button>
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-serif text-2xl">Reschedule</h2>
        <div className="mt-3 flex gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn-gold" onClick={loadSlots}>
            Show times
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              key={`${s.staff_id}-${s.starts_at}`}
              type="button"
              className="rounded-full bg-pink px-4 py-2 text-sm"
              onClick={() => reschedule(s)}
            >
              {formatTime(s.starts_at)} · {s.staff_name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
