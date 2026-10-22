import { hasValue, waLink } from "@/lib/format";

export function WhatsAppFloat({ number }: { number?: string }) {
  if (!hasValue(number)) return null;
  return (
    <a
      href={waLink(number!)}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M20 11.5A8.5 8.5 0 1 1 8.7 19.3L4 21l1.8-4.6A8.5 8.5 0 0 1 20 11.5Zm-3.2 4.3c-.2.6-1.2 1.1-1.7 1.1-.4 0-.9.2-3-.8-2.6-1.2-4.3-4-4.4-4.2-.2-.3-1.2-1.6-1.2-3 0-1.4.7-2 1-2.3.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2 0 .4-.1.6l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.2c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.4 0 .2 0 1.2-.6 1.8Z" />
      </svg>
    </a>
  );
}
