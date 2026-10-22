import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { hasValue, waLink } from "@/lib/format";
import type { PublicSettings } from "@/types";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/book", label: "Book" },
  { to: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings?: PublicSettings }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo logoUrl={settings?.logo_url} />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide ${isActive ? "text-gold-deep" : "text-ink hover:text-gold-deep"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/book" className="btn-gold !py-2 !px-5">
            Book now
          </NavLink>
        </nav>
        <button
          type="button"
          className="md:hidden btn-ghost !px-3 !py-2"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-gold/20 px-4 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-1">
                {l.label}
              </NavLink>
            ))}
            {hasValue(settings?.whatsapp) && (
              <a href={waLink(settings!.whatsapp)} className="btn-gold mt-2">
                WhatsApp
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
