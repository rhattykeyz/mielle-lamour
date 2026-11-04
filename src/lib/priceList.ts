import type { Service, ServiceCategory } from "@/types";

/**
 * Mielle L'Amour price list, transcribed from the owner's menu (GHS).
 * Basic and VIP are separate bookable services. A dash on the sheet means
 * that tier is omitted. duration_minutes is a scheduling estimate only;
 * her sheet does not print times.
 *
 * Keep supabase/migrations/0004_seed.sql and 0009_price_list.sql in sync.
 */

export const PRICE_LIST_TAGLINE = "Where Elegance Meets Artistry";

const NAILS = "11111111-1111-1111-1111-111111111001";
const FOOT = "11111111-1111-1111-1111-111111111005";
const MASSAGE = "11111111-1111-1111-1111-111111111003";

type MenuRow = {
  name: string;
  slug: string;
  /** Scheduling estimate in minutes. Same for Basic and VIP. */
  duration: number;
  description?: string | null;
  basic: number | null;
  vip: number | null;
};

const nailRows: MenuRow[] = [
  {
    name: "Gel Removal with Serv.",
    slug: "gel-removal-with-serv",
    duration: 20,
    description: "When booked with a new set.",
    basic: 25,
    vip: 50,
  },
  {
    name: "Gel Removal",
    slug: "gel-removal",
    duration: 30,
    description: "Full removal for a fresh start.",
    basic: 45,
    vip: 90,
  },
  {
    name: "Dissolve",
    slug: "dissolve",
    duration: 45,
    description: "A gentle reset for old gel or acrylic before a new set.",
    basic: 60,
    vip: 120,
  },
  { name: "Classic Acrylic Full Set", slug: "classic-acrylic-full-set", duration: 90, description: "A strong, polished finish with a clean sculpted look.", basic: 200, vip: 400 },
  { name: "Chrome Full Set", slug: "chrome-full-set", duration: 120, basic: 380, vip: 760 },
  { name: "Gel Manicure", slug: "gel-manicure", duration: 60, basic: 240, vip: 480 },
  { name: "French Gel Polish", slug: "french-gel-polish", duration: 75, basic: 200, vip: 400 },
  { name: "Hard Gel Sculpt with Gel", slug: "hard-gel-sculpt-with-gel", duration: 150, basic: 480, vip: 960 },
  { name: "Poly Gel with Gel Polish", slug: "poly-gel-with-gel-polish", duration: 120, basic: 400, vip: 800 },
  { name: "Full Set with Cat Eye", slug: "full-set-with-cat-eye", duration: 120, basic: 380, vip: 760 },
];

const footRows: MenuRow[] = [
  { name: "Classic Pedi", slug: "classic-pedi", duration: 60, basic: 200, vip: 400 },
  { name: "VIP Classic Pedi", slug: "vip-classic-pedi", duration: 75, basic: 380, vip: 760 },
  { name: "Gel Mani/Pedi Comb", slug: "gel-mani-pedi-comb", duration: 120, basic: 380, vip: 760 },
  { name: "Hot Stone Pedi", slug: "hot-stone-pedi", duration: 75, basic: 360, vip: 720 },
  { name: "Turbo Pedi", slug: "turbo-pedi", duration: 45, basic: 400, vip: 800 },
  { name: "VIP Hot Stone Pedi", slug: "vip-hot-stone-pedi", duration: 90, basic: 450, vip: 900 },
  {
    name: "Koko Spl. Gel Polish (+ Massage)",
    slug: "koko-spl-gel-polish-massage",
    duration: 90,
    basic: 450,
    vip: 960,
  },
];

const massageRows: MenuRow[] = [
  { name: "Massage", slug: "massage", duration: 60, basic: null, vip: 990 },
];

export const localCategories: ServiceCategory[] = [
  {
    id: NAILS,
    name: "Nail treatments",
    slug: "nail-treatments",
    description: "Removal, gel manicures, acrylic, chrome, sculpted gel and cat eye.",
    sort_order: 1,
    is_visible: true,
  },
  {
    id: FOOT,
    name: "Footcare & pedicures",
    slug: "footcare-pedicures",
    description: "Classic, hot stone and turbo pedicures, plus mani pedi combinations.",
    sort_order: 2,
    is_visible: true,
  },
  {
    id: MASSAGE,
    name: "Massage",
    slug: "massage",
    description: "VIP massage.",
    sort_order: 3,
    is_visible: true,
  },
];

function serviceId(n: number) {
  return `22222222-2222-2222-2222-${String(222222220000 + n)}`;
}

function expand(categoryId: string, rows: MenuRow[]): Omit<Service, "id" | "sort_order">[] {
  const basics: Omit<Service, "id" | "sort_order">[] = [];
  const vips: Omit<Service, "id" | "sort_order">[] = [];
  for (const row of rows) {
    if (row.basic != null) {
      basics.push(toService(categoryId, row, "Basic", row.basic));
    }
    if (row.vip != null) {
      vips.push(toService(categoryId, row, "VIP", row.vip));
    }
  }
  return [...basics, ...vips];
}

function toService(
  categoryId: string,
  row: MenuRow,
  tier: "Basic" | "VIP",
  price: number,
): Omit<Service, "id" | "sort_order"> {
  const slugTier = tier === "Basic" ? "basic" : "vip";
  return {
    category_id: categoryId,
    name: `${row.name} — ${tier}`,
    slug: `${row.slug}-${slugTier}`,
    description: row.description ?? null,
    duration_minutes: row.duration,
    price_ghs: price,
    price_from: false,
    requires_deposit: false,
    deposit_kind: "amount",
    deposit_value: 0,
    is_visible: true,
  };
}

export const localServices: Service[] = [
  ...expand(NAILS, nailRows),
  ...expand(FOOT, footRows),
  ...expand(MASSAGE, massageRows),
].map((service, index) => ({
  ...service,
  id: serviceId(101 + index),
  sort_order: index + 1,
}));

export function serviceTier(name: string): "Basic" | "VIP" | null {
  if (name.endsWith(" — Basic")) return "Basic";
  if (name.endsWith(" — VIP")) return "VIP";
  return null;
}

export function serviceBaseName(name: string) {
  return name.replace(/ — (Basic|VIP)$/, "");
}
