import { Link } from "react-router-dom";

const DEFAULT_LOGO = "/logo.jpg";

export function Logo({
  logoUrl,
  compact = false,
}: {
  logoUrl?: string | null;
  compact?: boolean;
}) {
  const src = logoUrl && logoUrl.trim() ? logoUrl : DEFAULT_LOGO;
  return (
    <Link to="/" className="flex items-center gap-3 no-underline text-ink">
      <img
        src={src}
        alt="Mielle L'Amour"
        className="h-16 w-16 rounded-full object-cover ring-1 ring-gold/50"
      />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-serif text-xl tracking-wide">Mielle L'Amour</span>
          <span className="block text-[10px] uppercase tracking-[0.28em] text-gold-deep">
            Nail · Beauty · Spa
          </span>
        </span>
      )}
    </Link>
  );
}
