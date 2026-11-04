import { NavLink } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { realValue, visibleCopy } from "@/lib/format";
import type { PublicSettings } from "@/types";
import { SocialCard } from "@/components/brand/SocialCard";

export function Footer({ settings }: { settings?: PublicSettings }) {
  const address = realValue(settings?.address);
  const hoursNote = realValue(settings?.opening_hours_note);
  const tagline = realValue(settings?.tagline);
  const mapUrl = realValue(settings?.map_embed_url);
  const directions = mapUrl
    ? mapUrl.replace("output=embed", "output=classic")
    : "https://maps.google.com/?q=Accra%20Ghana";

  return (
    <footer className="relative mt-8 border-t bg-pink">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1.1fr]">
          <div>
            <Logo logoUrl={settings?.logo_url} />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              {tagline ? visibleCopy(tagline) : "Nail · Beauty · Spa"} in Accra.
              Payment is made in person at the salon.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl">Visit</h2>
            {address ? <p className="mt-2 text-sm font-medium text-ink">{address}</p> : null}
            {hoursNote ? <p className="mt-1 text-sm text-ink-muted">{hoursNote}</p> : null}
            <a
              href={directions}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-4"
            >
              Get directions
            </a>
          </div>

          <div>
            <SocialCard />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          <NavLink to="/privacy" className={({ isActive }) => (isActive ? "gold-link is-active" : "gold-link")}>
            <span>Privacy notice</span>
          </NavLink>
          <NavLink to="/cancellation" className={({ isActive }) => (isActive ? "gold-link is-active" : "gold-link")}>
            <span>Cancellation policy</span>
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "gold-link is-active" : "gold-link")}>
            <span className="staff-login-link">Staff login</span>
          </NavLink>
          <span>© {new Date().getFullYear()} Mielle L'Amour</span>
        </div>
      </div>
    </footer>
  );
}
