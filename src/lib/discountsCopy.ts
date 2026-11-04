import { visibleCopy } from "@/lib/format";

/** Owner copy for /discounts. Keep in sync with supabase/migrations/0010_discounts_page.sql. */

export const DISCOUNTS_KEY = "discounts";

export const DISCOUNTS_BODY: Record<string, string> = {
  kicker: "Mielle L'Amour",
  title: "Luxury For Everyone",
  lead_body:
    "At Mielle L'Amour, we believe pampering is for everyone. Luxury should be accessible, enjoyable and shared, because every person deserves to feel beautiful, valued and spoiled.",
  offer_body:
    "We offer a range of perks for everyday pampering and celebrations. We also host intimate events such as bridal showers, brunches and small birthday dinners from 8pm to midnight.",
  discounts_title: "Our Discounts",
  discounts_body: [
    "Student Discount — enjoy 15% off with a valid student ID",
    "Bring-a-Friend Discount — come with someone and both save 5%",
    "Teacher Discount — appreciation for those who teach and inspire",
    "Nurse, Police & Emergency Services Discount — with valid ID",
    "New-to-Ghana & Holiday Discount — a warm welcome to Ghana",
    "Couples, Siblings & Mothers Discount — enjoy 5% off",
    "Pensioner Discount — luxury at every age",
    "Banking Staff Discount — enjoy 15% off with valid ID",
    "Children's First-Time Pedicure Discount — gentle pampering for little ones",
    "Birthday Discount — enjoy 10% off on your special day",
    "Social Media Discount — take pictures, tag us, follow us, and enjoy an extra 10% off",
    "Loyalty Reward — visit 6 times and your 7th pamper session is 50% off",
  ].join("\n"),
  atmosphere_title: "Our Atmosphere",
  atmosphere_body:
    "Mielle L'Amour is fun, sociable and welcoming. We encourage you to relax, enjoy the space, take pictures, and let us spoil you. Every visit is designed to feel luxurious, memorable and full of joy.",
};

export const DISCOUNTS_SEO_DESCRIPTION = DISCOUNTS_BODY.lead_body;

/** First sentence, used as the short home-page teaser. */
export const DISCOUNTS_TEASER =
  "At Mielle L'Amour, we believe pampering is for everyone.";

export function discountsBody(source?: Record<string, string> | null) {
  const body = { ...DISCOUNTS_BODY };
  if (source) {
    for (const key of Object.keys(body)) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) body[key] = value;
    }
    const savedOffers = source.discounts_body ?? "";
    const stillUsesLegacyOffers = /Teacher Discount|Nurse, Police|Pensioner Discount|Loyalty Reward/i.test(savedOffers);
    if (stillUsesLegacyOffers) body.discounts_body = DISCOUNTS_BODY.discounts_body;
  }
  for (const key of Object.keys(body)) body[key] = visibleCopy(body[key]);
  return body;
}

/** Scan labels only. They do not replace the sentences in discounts_body. */
const LABEL_RULES: { test: RegExp; label: string }[] = [
  { test: /^Student\b/, label: "Students" },
  { test: /^Bring-a-Friend\b/, label: "Bring a friend" },
  { test: /^Teacher\b/, label: "Teachers" },
  { test: /^Nurse, Police\b/, label: "Essential services" },
  { test: /^New-to-Ghana\b/, label: "Visitors" },
  { test: /^Couples\b/, label: "Couples & families" },
  { test: /^Pensioner\b/, label: "Pensioners" },
  { test: /^Banking\b/, label: "Bankers" },
  { test: /^Birthday\b/, label: "Birthday" },
  { test: /^Social Media\b/, label: "Social media" },
  { test: /^Loyalty\b/, label: "Loyalty reward" },
];

export function discountLabel(name: string) {
  const cleaned = visibleCopy(name);
  if (/Children|Children's|Children’s/.test(cleaned)) return "Children's first visit";
  const found = LABEL_RULES.find((rule) => rule.test.test(cleaned));
  if (found) return found.label;
  return cleaned.replace(/\s+(Discount|Reward)$/u, "");
}

export function discountLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const spoken = visibleCopy(line);
      const match = /^(.*?):\s*(.*)$/u.exec(spoken) ?? /^(.+?)\s*[—–]\s*(.*)$/u.exec(spoken);
      const name = match ? match[1].trim() : spoken;
      const detail = match ? match[2].trim() : "";
      return { line: spoken, name, detail, label: discountLabel(name) };
    });
}
