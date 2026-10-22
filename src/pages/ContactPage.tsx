import { FormEvent, useState } from "react";
import { usePublicSettings } from "@/hooks/usePublicData";
import { callFunction } from "@/lib/supabase";
import { hasValue, waLink } from "@/lib/format";
import { Seo } from "@/lib/seo";

export function ContactPage() {
  const { data: settings } = usePublicSettings();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await callFunction("contact", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        website: form.get("website"),
      });
      setStatus("Thank you — Mielle L'Amour has received your message.");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <Seo
        title="Contact"
        description="Find Mielle L'Amour in Accra. Hours, map, WhatsApp and a contact form."
        path="/contact"
      />
      <div>
        <h1 className="font-serif text-5xl">Contact</h1>
        <p className="mt-4">{settings?.address || "[ADDRESS, AREA, ACCRA]"}</p>
        <p className="mt-2 text-sm text-ink-muted">{settings?.opening_hours_note || "[HOURS]"}</p>
        <div className="mt-6 flex flex-col gap-2 text-sm">
          {hasValue(settings?.phone) ? (
            <a href={`tel:${settings!.phone}`}>Call {settings!.phone}</a>
          ) : (
            <span className="text-ink-muted">Phone [NUMBER, TO BE DECIDED]</span>
          )}
          {hasValue(settings?.whatsapp) ? (
            <a href={waLink(settings!.whatsapp)}>WhatsApp</a>
          ) : (
            <span className="text-ink-muted">WhatsApp [NUMBER, TO BE DECIDED]</span>
          )}
          {hasValue(settings?.email) && !settings!.email.startsWith("[") ? (
            <a href={`mailto:${settings!.email}`}>{settings!.email}</a>
          ) : (
            <span className="text-ink-muted">Email [EMAIL]</span>
          )}
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl bg-pink aspect-[4/3] grid place-items-center text-sm text-gold-deep">
          {hasValue(settings?.map_embed_url) ? (
            <iframe
              title="Map of Mielle L'Amour"
              src={settings!.map_embed_url}
              className="h-full w-full border-0"
              loading="lazy"
            />
          ) : (
            "[MAP PLACEHOLDER — add an embed URL in Admin → Settings]"
          )}
        </div>
      </div>
      <form onSubmit={onSubmit} className="card space-y-4 rounded-3xl p-6">
        <h2 className="font-serif text-3xl">Write to us</h2>
        <p className="hidden" aria-hidden>
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" />
        </div>
        <div>
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={5} required />
        </div>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        {status && <p className="text-sm text-[var(--success)]">{status}</p>}
        <button type="submit" className="btn-gold">
          Send
        </button>
      </form>
    </div>
  );
}
