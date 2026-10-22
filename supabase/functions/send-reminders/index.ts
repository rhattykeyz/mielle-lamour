import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { brandedEmail, getProvider } from "../_shared/notifications.ts";
import { json, optionsResponse } from "../_shared/cors.ts";

const TZ = "Africa/Accra";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  const site = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");

  const { data: jobs, error } = await supabase.rpc("claim_due_notifications", {
    p_limit: 40,
  });
  if (error) return json({ error: error.message }, 500);

  let sent = 0;
  let failed = 0;

  for (const job of jobs ?? []) {
    const { data: booking } = await supabase
      .from("bookings")
      .select(
        "id, reference, starts_at, ends_at, status, total_price, deposit_amount, deposit_required, deposit_hold_until, clients(full_name, email, phone), staff(full_name), booking_services(name_snapshot)",
      )
      .eq("id", job.booking_id)
      .maybeSingle();

    const client = Array.isArray(booking?.clients)
      ? booking?.clients[0]
      : booking?.clients;
    const staff = Array.isArray(booking?.staff) ? booking?.staff[0] : booking?.staff;
    const token = job.payload?.manage_token as string | undefined;
    const manageUrl = token ? `${site}/manage/${token}` : site;
    const to = client?.email as string | undefined;

    const services = ((booking?.booking_services as { name_snapshot: string }[]) ?? [])
      .map((s) => s.name_snapshot)
      .join(", ");

    const copy = letter(job.kind, {
      name: client?.full_name ?? "there",
      reference: booking?.reference ?? "",
      when: booking?.starts_at ? fmt(booking.starts_at) : "",
      staff: staff?.full_name ?? "",
      services,
      manageUrl,
      deposit: booking?.deposit_amount,
      holdUntil: booking?.deposit_hold_until
        ? fmt(booking.deposit_hold_until)
        : "",
    });

    try {
      if (job.channel === "email" && !to) {
        await supabase
          .from("notification_jobs")
          .update({ status: "skipped", error: "No email on file" })
          .eq("id", job.id);
        continue;
      }
      const provider = getProvider(job.channel);
      await provider.send({
        to: to ?? "",
        subject: copy.subject,
        html: brandedEmail(copy.title, copy.html),
        text: copy.text,
      });
      await supabase
        .from("notification_jobs")
        .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
        .eq("id", job.id);
      sent++;
    } catch (err) {
      failed++;
      await supabase
        .from("notification_jobs")
        .update({
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        })
        .eq("id", job.id);
    }
  }

  return json({ processed: (jobs ?? []).length, sent, failed });
});

function letter(
  kind: string,
  ctx: {
    name: string;
    reference: string;
    when: string;
    staff: string;
    services: string;
    manageUrl: string;
    deposit?: number;
    holdUntil?: string;
  },
) {
  const policy =
    "Please cancel or reschedule at least 24 hours before your appointment.";
  if (kind === "reminder") {
    return {
      subject: `Reminder: Mielle L'Amour — ${ctx.reference}`,
      title: "See you tomorrow",
      html: `<p>Dear ${ctx.name},</p><p>This is a reminder of your appointment at <strong>Mielle L'Amour</strong>.</p>
        <p>${ctx.services}<br/>${ctx.when}<br/>with ${ctx.staff}<br/>Ref: ${ctx.reference}</p>
        <p><a href="${ctx.manageUrl}">Cancel or reschedule</a></p><p>${policy}</p>`,
      text: `Reminder for ${ctx.reference} on ${ctx.when}. Manage: ${ctx.manageUrl}`,
    };
  }
  if (kind === "cancelled") {
    return {
      subject: `Cancelled: ${ctx.reference} | Mielle L'Amour`,
      title: "Booking cancelled",
      html: `<p>Dear ${ctx.name},</p><p>Your booking ${ctx.reference} has been cancelled. We hope to see you another time.</p>`,
      text: `Booking ${ctx.reference} cancelled.`,
    };
  }
  if (kind === "rescheduled") {
    return {
      subject: `Rescheduled: ${ctx.reference} | Mielle L'Amour`,
      title: "Your new time",
      html: `<p>Dear ${ctx.name},</p><p>Your booking ${ctx.reference} is now ${ctx.when} with ${ctx.staff}.</p>
        <p><a href="${ctx.manageUrl}">Manage booking</a></p>`,
      text: `Rescheduled ${ctx.reference} to ${ctx.when}.`,
    };
  }
  if (kind === "deposit_expired") {
    return {
      subject: `Hold released: ${ctx.reference} | Mielle L'Amour`,
      title: "Deposit hold ended",
      html: `<p>Dear ${ctx.name},</p><p>We did not receive a deposit for ${ctx.reference} in time, so the slot has been released. You are welcome to book again.</p>`,
      text: `Deposit hold for ${ctx.reference} expired.`,
    };
  }
  if (kind === "deposit_received") {
    return {
      subject: `Deposit received: ${ctx.reference} | Mielle L'Amour`,
      title: "You are confirmed",
      html: `<p>Dear ${ctx.name},</p><p>Thank you — your deposit for ${ctx.reference} is marked as received. We will see you ${ctx.when}.</p>
        <p><a href="${ctx.manageUrl}">Manage booking</a></p>`,
      text: `Deposit received for ${ctx.reference}.`,
    };
  }
  // confirmation
  const depositBlock = ctx.deposit
    ? `<p>This booking is <strong>pending deposit</strong> of GHS ${ctx.deposit}. Please send Mobile Money using your reference <strong>${ctx.reference}</strong> before ${ctx.holdUntil}. Details are on your confirmation page. Pay the remaining balance in person at the salon.</p>`
    : `<p>Please pay in person at the salon. There is no online payment for this booking.</p>`;
  return {
    subject: `Booking ${ctx.reference} | Mielle L'Amour`,
    title: "You are booked",
    html: `<p>Dear ${ctx.name},</p><p>Thank you for booking with <strong>Mielle L'Amour</strong>.</p>
      <p>${ctx.services}<br/>${ctx.when}<br/>with ${ctx.staff}<br/>Ref: ${ctx.reference}</p>
      ${depositBlock}
      <p><a href="${ctx.manageUrl}">Cancel or reschedule</a></p><p>${policy}</p>`,
    text: `Booked ${ctx.reference} on ${ctx.when}. Manage: ${ctx.manageUrl}`,
  };
}
