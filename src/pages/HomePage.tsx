import { Link } from "react-router-dom";
import { FloralCorner, FloralDivider, HeroBloom } from "@/components/brand/Floral";
import { useCategories, useGallery, usePageContent, usePublicSettings, useReviews, useServices } from "@/hooks/usePublicData";
import { supabase } from "@/lib/supabase";
import { LocalBusinessJsonLd, Seo } from "@/lib/seo";
import { hasValue, money, waLink } from "@/lib/format";

export function HomePage() {
  const { data: settings } = usePublicSettings();
  const { data: page } = usePageContent("home");
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const { data: reviews } = useReviews();
  const { data: gallery } = useGallery();
  const body = page?.body ?? {};
  const preview = (gallery?.images ?? []).slice(0, 4);
  const featured = (services ?? []).slice(0, 6);

  return (
    <>
      <Seo
        title="Mielle L'Amour | Nail, Beauty & Spa in Accra"
        description="Soft, floral luxury for nails, facials, massage and bridal packages. Book online. Pay in person at the salon."
        path="/"
      />
      <LocalBusinessJsonLd settings={settings} />

      <section className="relative overflow-hidden bg-floral-fade">
        <FloralCorner className="pointer-events-none absolute -left-4 -top-4 h-40 w-40 opacity-80" />
        <FloralCorner className="pointer-events-none absolute -right-6 bottom-0 h-40 w-40 rotate-180 opacity-70" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold-deep">
              {body.hero_kicker || "Accra · Nail, beauty & spa"}
            </p>
            <h1 className="script mt-4 text-5xl text-ink md:text-7xl">
              {body.hero_title || "Soft luxury, made for you."}
            </h1>
            <p className="mt-6 max-w-md text-ink-muted">{body.hero_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book" className="btn-gold">
                {body.hero_cta || "Book now"}
              </Link>
              <Link to="/services" className="btn-ghost">
                View services
              </Link>
            </div>
          </div>
          <div className="relative mx-auto max-w-sm">
            <HeroBloom className="w-full" />
            <p className="absolute inset-x-0 bottom-8 text-center text-xs uppercase tracking-[0.3em] text-gold-deep">
              [PLACEHOLDER HERO]
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-4xl">{body.intro_title || "A pretty pause in your day"}</h2>
        <p className="mt-4 max-w-2xl text-ink-muted">{body.intro_body}</p>
        <FloralDivider />
        <div className={`grid gap-6 ${gridCols(categories?.length ?? 0)}`}>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/services"
              className="card rounded-3xl p-6 transition hover:-translate-y-0.5"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Category</p>
              <h3 className="mt-2 font-serif text-2xl">{c.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-pink/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl">Featured services</h2>
            <Link to="/services" className="text-sm text-gold-deep">
              All services
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map((s) => (
              <article key={s.id} className="card rounded-3xl p-5">
                <h3 className="font-serif text-2xl">{s.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {s.duration_minutes} min · {money(s.price_ghs, s.price_from)}
                </p>
                <Link to={`/book?service=${s.id}`} className="btn-gold mt-4 !py-2">
                  Book
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-4xl">Gallery</h2>
          <Link to="/gallery" className="text-sm text-gold-deep">
            See all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {preview.length
            ? preview.map((img) => (
                <img
                  key={img.id}
                  src={supabase.storage.from("gallery").getPublicUrl(img.storage_path).data.publicUrl}
                  alt={img.alt || "Mielle L'Amour gallery"}
                  className="aspect-[3/4] w-full rounded-3xl object-cover"
                  loading="lazy"
                />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="grid aspect-[3/4] place-items-center rounded-3xl bg-pink text-center text-[10px] uppercase tracking-widest text-gold-deep"
                >
                  [PLACEHOLDER PHOTO]
                </div>
              ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-4xl">Kind words</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(reviews ?? []).map((r) => (
            <blockquote key={r.id} className="card rounded-3xl p-6">
              <p className="text-gold">{"★".repeat(r.rating)}</p>
              <p className="mt-3 font-serif text-xl leading-snug">“{r.quote}”</p>
              <footer className="mt-4 text-sm text-ink-muted">— {r.author_name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 md:grid-cols-2">
        <div className="card rounded-3xl p-8">
          <h2 className="font-serif text-3xl">Opening hours</h2>
          <p className="mt-2 text-sm text-ink-muted">{settings?.opening_hours_note || "[HOURS]"}</p>
          <ul className="mt-4 space-y-1 text-sm">
            {Object.values(settings?.opening_hours ?? {}).map((d) => (
              <li key={d.label} className="flex justify-between gap-4">
                <span>{d.label}</span>
                <span>{d.open ? `${d.start} – ${d.end}` : "Closed"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card rounded-3xl bg-pink p-8">
          <h2 className="font-serif text-3xl">Visit Mielle L'Amour</h2>
          <p className="mt-2">{settings?.address || "[ADDRESS, AREA, ACCRA]"}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/book" className="btn-gold">
              Book now
            </Link>
            {hasValue(settings?.whatsapp) && (
              <a href={waLink(settings!.whatsapp)} className="btn-ghost">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function gridCols(n: number) {
  if (n <= 1) return "grid-cols-1";
  if (n === 2) return "md:grid-cols-2";
  if (n === 3) return "md:grid-cols-3";
  return "md:grid-cols-2 lg:grid-cols-4";
}
