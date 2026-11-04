import { visibleCopy } from "@/lib/format";

/** Owner copy for /about. Keep in sync with supabase/migrations/0011_about_page.sql. */

export const ABOUT_KEY = "about";

export const ABOUT_BODY: Record<string, string> = {
  kicker: "About us",
  title: "Mielle L'Amour Experience",
  tagline: "Mielle L'Amour Impeccable Care, Unforgettable Luxury",
  welcome_body:
    "Mielle L'Amour is fun, sociable and welcoming. We invite you to relax, enjoy the atmosphere, take beautiful pictures, and let us spoil you from the moment you arrive.",
  hygiene_body:
    "We are extremely particular about hygiene, maintaining the highest standards of cleanliness and care throughout every service.",
  experience_body:
    "Our team is trained in exceptional customer service and experience delivery, ensuring every visit feels luxurious, memorable and full of joy, a place where pampering becomes an experience, not just a service.",
};

export const ABOUT_SEO_TITLE = "Mielle L'Amour Experience: About us";

/** Her opening line, plus the Accra salon facts already used on the site. */
export const ABOUT_SEO_DESCRIPTION =
  "Mielle L'Amour is fun, sociable and welcoming. Nail, beauty and spa in Accra. Pay in person at the salon.";

export const ABOUT_TAGLINE = ABOUT_BODY.tagline;

export function aboutBody(source?: Record<string, string> | null) {
  const body = { ...ABOUT_BODY };
  if (source) {
    for (const key of Object.keys(body)) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) body[key] = value;
    }
  }
  for (const key of Object.keys(body)) body[key] = visibleCopy(body[key]);
  return body;
}
