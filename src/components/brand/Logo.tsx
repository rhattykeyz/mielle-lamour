import { Link } from "react-router-dom";

const DEFAULT_LOGO = "/logo.png";

function markSrc(logoUrl?: string | null) {
  const trimmed = logoUrl?.trim() ?? "";
  if (!trimmed || /logo\.(jpe?g|png|svg)(?:[?#]|$)/i.test(trimmed)) return DEFAULT_LOGO;
  return trimmed;
}

export function Logo({
  logoUrl,
  compact = false,
  slim = false,
  center = false,
}: {
  logoUrl?: string | null;
  compact?: boolean;
  slim?: boolean;
  center?: boolean;
}) {
  const src = markSrc(logoUrl);
  return (
    <Link
      to="/"
      className={
        center
          ? "chanel-logo"
          : `flex items-center no-underline text-ink ${slim ? "gap-2.5" : "gap-3"}`
      }
    >
      <img
        src={src}
        alt=""
        className={
          center
            ? "brand-mark"
            : slim
              ? "brand-mark h-14 w-14 rounded-full object-cover"
              : "brand-mark h-16 w-16 rounded-full object-cover"
        }
      />
      {!compact && (
        <span className="leading-none">
          <span className={`brand-wordmark block whitespace-nowrap ${center ? "" : `tracking-wide ${slim ? "text-[1.35rem]" : "text-xl"}`}`}>
            Mielle L'Amour
          </span>
          {!slim && !center && (
            <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-gold-deep">
              Nail · Beauty · Spa
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
