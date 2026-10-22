import { Link } from "react-router-dom";
import { FloralDivider } from "@/components/brand/Floral";
import { Logo } from "@/components/brand/Logo";
import { hasValue } from "@/lib/format";
import type { PublicSettings } from "@/types";

export function Footer({ settings }: { settings?: PublicSettings }) {
  return (
    <footer className="mt-16 border-t border-gold/30 bg-pink/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <FloralDivider />
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo logoUrl={settings?.logo_url} />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              {settings?.tagline || "Nail · Beauty · Spa"} in Accra. Payment is made in person at
              the salon.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl">Visit</h2>
            <p className="mt-2 text-sm">{settings?.address || "[ADDRESS, AREA, ACCRA]"}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {settings?.opening_hours_note || "[HOURS]"}
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl">Follow</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {hasValue(settings?.instagram) ? (
                <li>
                  <a href={`https://instagram.com/${settings!.instagram.replace("@", "")}`}>
                    Instagram @{settings!.instagram.replace("@", "")}
                  </a>
                </li>
              ) : (
                <li className="text-ink-muted">Instagram [HANDLE]</li>
              )}
              {hasValue(settings?.tiktok) ? (
                <li>
                  <a href={`https://www.tiktok.com/@${settings!.tiktok.replace("@", "")}`}>
                    TikTok @{settings!.tiktok.replace("@", "")}
                  </a>
                </li>
              ) : (
                <li className="text-ink-muted">TikTok [HANDLE]</li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-ink-muted">
          <Link to="/privacy">Privacy notice</Link>
          <Link to="/cancellation">Cancellation policy</Link>
          <Link to="/admin">Staff login</Link>
          <span>© {new Date().getFullYear()} Mielle L'Amour</span>
        </div>
      </div>
    </footer>
  );
}
