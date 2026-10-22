/**
 * Notification provider interface.
 *
 * Email is implemented now via Resend.
 * SMS and WhatsApp are structured as no-op providers so they can be plugged
 * in later (Phase 2) without changing booking or reminder jobs.
 *
 * To add SMS or WhatsApp:
 *  1. Store the provider API key as a Supabase secret (never in the frontend).
 *  2. Implement send() on SmsProvider / WhatsAppProvider below.
 *  3. Jobs already use channel = 'email' | 'sms' | 'whatsapp'.
 */

export type Channel = "email" | "sms" | "whatsapp";

export type NotificationMessage = {
  to: string;
  subject?: string;
  html?: string;
  text: string;
};

export interface NotificationProvider {
  channel: Channel;
  send(message: NotificationMessage): Promise<void>;
}

export class EmailProvider implements NotificationProvider {
  channel: Channel = "email";
  constructor(
    private apiKey: string,
    private from: string,
  ) {}

  async send(message: NotificationMessage) {
    if (!this.apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    if (!message.to) {
      throw new Error("No email address");
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject ?? "Mielle L'Amour",
        html: message.html ?? `<p>${message.text}</p>`,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error ${res.status}: ${body}`);
    }
  }
}

/** Placeholder — implement with an SMS gateway later. */
export class SmsProvider implements NotificationProvider {
  channel: Channel = "sms";
  async send(_message: NotificationMessage) {
    throw new Error("SMS provider is not configured yet (Phase 2)");
  }
}

/** Placeholder — implement with the WhatsApp Business API later. */
export class WhatsAppProvider implements NotificationProvider {
  channel: Channel = "whatsapp";
  async send(_message: NotificationMessage) {
    throw new Error("WhatsApp provider is not configured yet (Phase 2)");
  }
}

export function getProvider(channel: Channel): NotificationProvider {
  const from =
    Deno.env.get("FROM_EMAIL") ?? "Mielle L'Amour <booking@example.com>";
  if (channel === "email") {
    return new EmailProvider(Deno.env.get("RESEND_API_KEY") ?? "", from);
  }
  if (channel === "sms") return new SmsProvider();
  return new WhatsAppProvider();
}

export function brandedEmail(title: string, bodyHtml: string, footer = "") {
  return `<!doctype html>
<html><body style="margin:0;background:#FFF8EE;font-family:Georgia,serif;color:#3A2B2E;">
  <div style="max-width:560px;margin:24px auto;padding:32px;background:#fff;border:1px solid #C9A24B;">
    <p style="text-align:center;letter-spacing:.3em;font-size:12px;color:#C9A24B;">MIELLE L'AMOUR</p>
    <h1 style="text-align:center;font-weight:500;">${title}</h1>
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">${bodyHtml}</div>
    <p style="margin-top:32px;font-size:12px;color:#6B565A;">${footer}</p>
  </div>
</body></html>`;
}
