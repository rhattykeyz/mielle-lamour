import { Link } from "react-router-dom";
import { FloralDivider } from "@/components/brand/Floral";
import { useCategories, useServices } from "@/hooks/usePublicData";
import { money } from "@/lib/format";
import { Seo } from "@/lib/seo";

export function ServicesPage() {
  const { data: categories } = useCategories();
  const { data: services } = useServices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo
        title="Services & prices"
        description="Nail, beauty and spa services at Mielle L'Amour in Accra. Book online, pay in person."
        path="/services"
      />
      <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Mielle L'Amour</p>
      <h1 className="font-serif text-5xl">Services & prices</h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Categories and treatments are managed from the admin panel, so this page stays balanced as
        the menu grows. Sample prices are marked for replacement.
      </p>
      <FloralDivider />
      {(categories ?? []).map((cat) => {
        const items = (services ?? []).filter((s) => s.category_id === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id} className="mb-14">
            <h2 className="font-serif text-3xl">{cat.name}</h2>
            <p className="text-sm text-ink-muted">{cat.description}</p>
            <div className="mt-6 divide-y divide-gold/20 card overflow-hidden rounded-3xl">
              {items.map((s) => (
                <article key={s.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-2xl">{s.name}</h3>
                    <p className="text-sm text-ink-muted">{s.description}</p>
                    <p className="mt-1 text-sm">
                      {s.duration_minutes} min · {money(s.price_ghs, s.price_from)}
                      {s.requires_deposit ? " · deposit required" : ""}
                    </p>
                  </div>
                  <Link to={`/book?service=${s.id}`} className="btn-gold !py-2">
                    Book
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
