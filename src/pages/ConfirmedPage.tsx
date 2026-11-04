import { Link, useLocation } from "react-router-dom";
import { formatDateTime, money, realValue } from "@/lib/format";
import { Seo } from "@/lib/seo";

type Booking = {
  reference: string;
  status: string;
  starts_at: string;
  total_price: number;
  deposit_required: boolean;
  deposit_amount: number;
  deposit_hold_until: string | null;
  manage_token: string;
  mobile_money: { network?: string; name?: string; number?: string; instructions?: string } | null;
};

export function ConfirmedPage() {
  const booking = (useLocation().state as { booking?: Booking } | null)?.booking;

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl">No booking to show</h1>
        <Link to="/book" className="btn-gold mt-6">
          Book now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Seo title="Booking confirmed" description="Your Mielle L'Amour appointment details." path="/book/confirmed" />
      <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Mielle L'Amour</p>
      <h1 className="font-serif text-5xl">
        {booking.status === "pending_deposit" ? "Almost yours" : "You are booked"}
      </h1>
      <div className="card mt-8 space-y-2 rounded-3xl p-6">
        <p>
          Reference <strong>{booking.reference}</strong>
        </p>
        <p>{formatDateTime(booking.starts_at)}</p>
        <p>Total {money(booking.total_price)}</p>
        <p className="text-sm text-ink-muted">Pay the balance in person at the salon.</p>
        {booking.deposit_required && (
          <div className="mt-4 rounded-2xl bg-pink p-4 text-sm">
            <p>
              Status: <strong>Pending deposit</strong> of {money(booking.deposit_amount)}. Hold until{" "}
              {booking.deposit_hold_until ? formatDateTime(booking.deposit_hold_until) : "not set"}.
            </p>
            <p className="mt-2">Mobile Money</p>
            {realValue(booking.mobile_money?.network) || realValue(booking.mobile_money?.name) ? (
              <p>
                {[realValue(booking.mobile_money?.network), realValue(booking.mobile_money?.name)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
            {realValue(booking.mobile_money?.number) ? <p>{realValue(booking.mobile_money?.number)}</p> : null}
            <p>Use reference {booking.reference}.</p>
            {realValue(booking.mobile_money?.instructions) ? (
              <p className="mt-2">{realValue(booking.mobile_money?.instructions)}</p>
            ) : null}
          </div>
        )}
      </div>
      <p className="mt-6 text-sm">
        We emailed a confirmation if you left an email. You can{" "}
        <Link className="underline" to={`/manage/${booking.manage_token}`}>
          cancel or reschedule
        </Link>{" "}
        with your private link.
      </p>
    </div>
  );
}
