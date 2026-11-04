/**
 * SERVICES PAGE: LAYOUT MAP (top to bottom)
 *   1. HERO ........ "Our Services" + tagline                 (.svc-hero)
 *   2. TABS ........ sticky pill bar, active tab follows scroll (.svc-tabs / .svc-tab)
 *   3. SECTIONS .... one per category: heading (+ round photo on Nail Treatments) (.svc-section)
 *   4. CARD GRID ... one card per treatment (.svc-grid > .svc-card)
 *        each card = name + notes, then Basic / VIP price blocks (.svc-offer)
 *        each block = tier, price, Book button
 *        durations and deposits stay off the public cards (scheduling still uses duration_minutes)
 * CSS: src/styles/site-redesign.css -> "2. SERVICES PAGE"
 * Data logic (menuLines, Basic/VIP pairing) is unchanged from the original.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/motion/Reveal";
import { useCategories, useServices } from "@/hooks/usePublicData";
import { localNailPhotos } from "@/lib/localGallery";
import "@/styles/site-redesign.css";
import { visibleCopy } from "@/lib/format";
import { PRICE_LIST_TAGLINE, serviceBaseName, serviceTier } from "@/lib/priceList";
import { Seo } from "@/lib/seo";
import type { Service } from "@/types";

const accent = localNailPhotos[0];

type MenuLine = {
  key: string;
  name: string;
  sort: number;
  basic: Service | null;
  vip: Service | null;
  solo: Service | null;
};

function menuMoney(value: number | string, from = false) {
  const n = typeof value === "string" ? Number(value) : value;
  const amount = Number.isFinite(n) ? n : 0;
  const whole = Math.abs(amount - Math.round(amount)) < 0.001;
  const shown = whole ? Math.round(amount) : amount;
  const formatted = new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(shown);
  return { prefix: from ? "from " : "", amount: `GHS ${formatted}` };
}

function menuLines(items: Service[]): MenuLine[] {
  const paired = new Map<string, MenuLine>();
  const solos: MenuLine[] = [];

  for (const service of items) {
    const tier = serviceTier(service.name);
    if (!tier) {
      solos.push({
        key: service.id,
        name: service.name,
        sort: service.sort_order,
        basic: null,
        vip: null,
        solo: service,
      });
      continue;
    }

    const name = serviceBaseName(service.name);
    const line = paired.get(name);
    if (!line) {
      paired.set(name, {
        key: name,
        name,
        sort: service.sort_order,
        basic: tier === "Basic" ? service : null,
        vip: tier === "VIP" ? service : null,
        solo: null,
      });
      continue;
    }

    if (tier === "Basic") line.basic = service;
    else line.vip = service;
    line.sort = Math.min(line.sort, service.sort_order);
  }

  return [...paired.values(), ...solos].sort(
    (a, b) => a.sort - b.sort || a.name.localeCompare(b.name),
  );
}

function lineNotes(line: MenuLine) {
  const raw = [line.basic?.description, line.vip?.description, line.solo?.description];
  return [...new Set(raw.map((note) => note?.trim()).filter((note): note is string => Boolean(note)))];
}

export function ServicesPage() {
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const [active, setActive] = useState<string>("");

  const sections = [...(categories ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      category,
      lines: menuLines((services ?? []).filter((service) => service.category_id === category.id)),
    }))
    .filter((section) => section.lines.length > 0);

  const firstSlug = sections[0]?.category.slug ?? "";
  const slugKey = sections.map((s) => s.category.slug).join("|");

  // highlight the tab for the section currently in view
  useEffect(() => {
    if (!sections.length) return;
    setActive((current) => current || firstSlug);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("menu-", ""));
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    sections.forEach(({ category }) => {
      const el = document.getElementById(`menu-${category.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugKey]);

  function jumpTo(slug: string) {
    setActive(slug);
    document.getElementById(`menu-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="services-page">
      <Seo
        title="Services & prices"
        description="Nail treatments, footcare and massage at Mielle L'Amour in Accra. Basic and VIP prices in Ghana cedis. Book online, pay in person."
        path="/services"
      />

      <header className="svc-hero">
        <p className="svc-kicker">Mielle L&apos;Amour</p>
        <h1 className="svc-title">Our Services</h1>
        <p className="svc-tagline">{PRICE_LIST_TAGLINE}</p>
        <p className="svc-sub">Basic and VIP prices in Ghana cedis. Book online, pay in person at the salon.</p>
      </header>

      {sections.length ? (
        <nav className="svc-tabs" aria-label="Service categories">
          <div className="svc-tabs-inner">
            {sections.map(({ category }) => (
              <button
                key={category.id}
                type="button"
                className={active === category.slug ? "svc-tab is-active" : "svc-tab"}
                aria-current={active === category.slug ? "true" : undefined}
                onClick={() => jumpTo(category.slug)}
              >
                {visibleCopy(category.name)}
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="svc-sections">
        {sections.map(({ category, lines }) => {
          const showAccent = category.slug === "nail-treatments" && accent;
          return (
            <section key={category.id} id={`menu-${category.slug}`} className="svc-section">
              <Reveal>
                <div className="svc-section-head">
                  {showAccent ? <img src={accent.src} alt={accent.alt} className="svc-accent" /> : null}
                  <div>
                    <h2 className="svc-section-title">{visibleCopy(category.name)}</h2>
                    {category.description ? (
                      <p className="svc-section-copy">{visibleCopy(category.description)}</p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
              <div className="svc-grid">
                {lines.map((line, i) => (
                  <Reveal key={line.key} className="svc-reveal" delay={Math.min(i, 5) * 70}>
                    <ServiceCard line={line} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ServiceCard({ line }: { line: MenuLine }) {
  const notes = lineNotes(line);
  const treatment = visibleCopy(line.name);
  const offers: { tier: "Basic" | "VIP" | null; service: Service }[] = [];
  if (line.basic) offers.push({ tier: "Basic", service: line.basic });
  if (line.vip) offers.push({ tier: "VIP", service: line.vip });
  if (line.solo) offers.push({ tier: null, service: line.solo });

  return (
    <article className="svc-card">
      <div className="svc-card-top">
        <h3 className="svc-card-name">{treatment}</h3>
        {notes.map((note) => (
          <p key={note} className="svc-card-note">
            {visibleCopy(note)}
          </p>
        ))}
      </div>
      <div className={offers.length > 1 ? "svc-offers is-duo" : "svc-offers"}>
        {offers.map(({ tier, service }) => {
          const price = menuMoney(service.price_ghs, service.price_from);
          return (
            <div key={service.id} className={tier === "VIP" ? "svc-offer is-vip" : "svc-offer"}>
              {tier ? <span className="svc-tier">{tier}</span> : null}
              <p className="svc-price">
                {price.prefix ? <small>{price.prefix}</small> : null}
                {price.amount}
              </p>
              <Link
                to={`/book?service=${service.id}`}
                className="svc-book"
                aria-label={`Book ${tier ? tier + " " : ""}${treatment}`}
              >
                Book
              </Link>
            </div>
          );
        })}
      </div>
    </article>
  );
}
