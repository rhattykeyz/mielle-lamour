const TZ = "Africa/Accra";

export function money(value: number | string, from = false) {
  const n = typeof value === "string" ? Number(value) : value;
  const formatted = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
  return from ? `from ${formatted}` : formatted;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function digitsOnlyPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function hasValue(value?: string | null) {
  if (!value) return false;
  const v = value.trim();
  return v.length > 0 && !v.startsWith("[") && v !== "[NUMBER, TO BE DECIDED]";
}

/**
 * Returns the text only if it is real content.
 * Empty values and placeholders such as "[ADDRESS, AREA, ACCRA]" or "[HOURS] — edit this in Admin"
 * come back as "", so the page can skip them instead of showing them to visitors.
 */
export function realValue(text?: string | null): string {
  const t = (text ?? "").trim();
  if (!t || /^\[.*\]$/.test(t)) return "";
  if (/^\[[^\]]*\]/.test(t) && /\b(?:edit this in admin|placeholder|sample text)\b/i.test(t)) return "";
  return t;
}

export function waLink(number: string) {
  const n = number.replace(/[^\d]/g, "");
  return `https://wa.me/${n}`;
}

const OWNER_SLOGAN = "Mielle L'Amour Impeccable Care, Unforgettable Luxury";

/** Visitor sentences only. A hyphen between words becomes a space. An em dash pause becomes a colon. The owner slogan keeps a space where the dash was. */
export function visibleCopy(text: string) {
  const withoutSloganDash = text
    .split("Mielle L'Amour — Impeccable Care, Unforgettable Luxury")
    .join(OWNER_SLOGAN)
    .split("Mielle L'Amour: Impeccable Care, Unforgettable Luxury")
    .join(OWNER_SLOGAN);
  if (withoutSloganDash.trim() === OWNER_SLOGAN) return OWNER_SLOGAN;
  return withoutSloganDash
    .replace(/([A-Za-z])-(?=[A-Za-z])/g, "$1 ")
    .replace("full of joy — a place", "full of joy, a place")
    .replace(/ — /g, ": ")
    .replace(/—/g, " ");
}
