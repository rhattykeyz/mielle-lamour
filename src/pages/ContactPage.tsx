import { FormEvent, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { usePublicSettings } from "@/hooks/usePublicData";
import { callFunction } from "@/lib/supabase";
import { realValue, visibleCopy, waLink } from "@/lib/format";
import { Seo } from "@/lib/seo";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[color:var(--pink-line)] bg-white/80 px-4 py-3 text-base outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold-deep/20";
const labelClass = "text-xs font-medium uppercase tracking-[0.14em] text-gold-deep";

export function ContactPage() {
  const { data: settings } = usePublicSettings();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const address = realValue(settings?.address);
  const hoursNote = realValue(settings?.opening_hours_note);
  const phone = realValue(settings?.phone);
  const whatsapp = realValue(settings?.whatsapp);
  const email = realValue(settings?.email);
  const mapUrl = realValue(settings?.map_embed_url);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Capture now: currentTarget is null once we await.
    const formEl = e.currentTarget;
    setError(null);
    setStatus(null);
    setSending(true);
    const form = new FormData(formEl);
    try {
      await callFunction("contact", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        website: form.get("website"),
      });
      setStatus("Thank you, Mielle L'Amour has received your message. We'll be in touch soon.");
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Please try again or reach us on WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page mx-auto max-w-6xl px-4 pb-20 pt-12">
      <Seo
        title="Contact"
        description="Find Mielle L'Amour in Accra. Hours, map, WhatsApp and a contact form."
        path="/contact"
      />

      <Reveal>
        <header className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold-deep">Mielle L'Amour</p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Come and be spoiled</h1>
          <div className="gold-line mt-5 max-w-[6.5rem]" aria-hidden />
          <p className="mt-5 text-lg text-ink-muted">
            Book a pamper session, ask about an event, or simply say hello. We reply quickly.
          </p>
        </header>
      </Reveal>

      <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[color:var(--pink-line)] bg-cream/60">
            <img
              src="/brand/storefront.jpg"
              alt="Mielle L'Amour storefront with a pink floral entrance"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
              {address ? (
                <div>
                  <p className={labelClass}>Visit</p>
                  <p className="mt-2 font-serif text-2xl leading-snug">{address}</p>
                  {hoursNote ? <p className="mt-2 text-sm text-ink-muted">{visibleCopy(hoursNote)}</p> : null}
                </div>
              ) : null}

              {phone || whatsapp || email ? (
                <div>
                  <p className={labelClass}>Reach us</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {whatsapp ? (
                      <a className="btn-gold" href={waLink(whatsapp)} rel="noopener">
                        WhatsApp us
                      </a>
                    ) : null}
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="rounded-full border border-gold-deep/40 px-5 py-2.5 text-gold-deep transition hover:bg-white"
                      >
                        Call {phone}
                      </a>
                    ) : null}
                  </div>
                  {email ? (
                    <a href={`mailto:${email}`} className="mt-4 block text-sm text-ink-muted underline-offset-4 hover:underline">
                      {email}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={60}>
          <form
            onSubmit={onSubmit}
            aria-busy={sending}
            className="h-full space-y-5 rounded-[1.5rem] border border-[color:var(--pink-line)] bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(180,110,120,0.35)] sm:p-8"
          >
            <div>
              <h2 className="font-serif text-3xl">Write to us</h2>
              <p className="mt-1 text-sm text-ink-muted">Tell us what you have in mind and we'll take it from there.</p>
            </div>

            {/* Honeypot */}
            <p className="hidden" aria-hidden>
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className={labelClass}>Name</label>
                <input id="name" name="name" required autoComplete="name" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input id="email" name="email" type="email" autoComplete="email" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className={labelClass}>Message</label>
                <textarea id="message" name="message" rows={5} required className={fieldClass} />
              </div>
            </div>

            <div aria-live="polite" className="min-h-[1.25rem]">
              {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
              {status ? <p className="text-sm text-[var(--success)]">{status}</p> : null}
            </div>

            <button type="submit" className="btn-gold disabled:cursor-not-allowed disabled:opacity-60" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>

      {mapUrl ? (
        <Reveal delay={80}>
          <div className="mt-8 aspect-[16/7] min-h-56 overflow-hidden rounded-[1.5rem] border border-[color:var(--pink-line)] bg-cream">
            <iframe title="Map of Mielle L'Amour" src={mapUrl} className="h-full w-full border-0" loading="lazy" />
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
