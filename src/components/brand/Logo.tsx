import { Link } from "react-router-dom";

export function Monogram({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="31" fill="#F8D7E0" />
      <circle cx="32" cy="32" r="27" fill="none" stroke="#C9A24B" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#C9A24B" strokeWidth="0.8" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="18"
        fontWeight="700"
        fill="#C9A24B"
      >
        ML
      </text>
    </svg>
  );
}

export function Logo({
  logoUrl,
  compact = false,
}: {
  logoUrl?: string | null;
  compact?: boolean;
}) {
  return (
    <Link to="/" className="flex items-center gap-3 no-underline text-ink">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Mielle L'Amour"
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <Monogram className="h-12 w-12" />
      )}
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
