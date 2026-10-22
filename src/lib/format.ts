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

export function waLink(number: string) {
  const n = number.replace(/[^\d]/g, "");
  return `https://wa.me/${n}`;
}
