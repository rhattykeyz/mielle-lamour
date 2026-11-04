import { Link } from "react-router-dom";
import { Reveal } from "@/components/motion/Reveal";
import { usePageContent } from "@/hooks/usePublicData";
import { Seo } from "@/lib/seo";
import { DISCOUNTS_KEY, DISCOUNTS_SEO_DESCRIPTION, discountLines, discountsBody } from "@/lib/discountsCopy";

/**
 * Saved page content comes from the public page-content hook.
 * Without a saved body, the owner copy in the content module is used.
 */
export function DiscountsPage() {
  const { data: page } = usePageContent(DISCOUNTS_KEY);
  const body = discountsBody(page?.body);
  const items = discountLines(body.discounts_body).map((item) => {
    // Pull a headline figure like "15%" or "50%" out of the detail text.
    const figure = /(\d+)\s*%/.exec(item.detail)?.[0] ?? null;
    return { ...item, figure };
  });

  return (
    <div className="discounts-page mx-auto max-w-6xl px-4 pb-20 pt-12">
      <Seo title="Discounts" description={DISCOUNTS_SEO_DESCRIPTION} path="/discounts" />

      <Reveal>
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold-deep">{body.kicker}</p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl">{body.title}</h1>
          <div className="gold-line mx-auto mt-5 max-w-[6.5rem]" aria-hidden />
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">{body.lead_body}</p>
          <p className="mt-4 leading-relaxed text-ink-muted">{body.offer_body}</p>
        </header>
      </Reveal>

      <section className="mt-14" aria-labelledby="discounts-heading">
        <Reveal>
          <h2 id="discounts-heading" className="text-center font-serif text-3xl sm:text-4xl">
            {body.discounts_title}
          </h2>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.line} delay={Math.min(i, 6) * 40}>
              <li className="group flex h-full flex-col rounded-[1.25rem] border border-[color:var(--pink-line)] bg-white/70 p-6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(180,110,120,0.45)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-deep">{item.label}</p>
                  {item.figure ? (
                    <span className="rounded-full bg-cream px-3 py-1 font-serif text-lg text-gold-deep">
                      {item.figure}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 font-serif text-xl leading-snug">{item.name}</h3>
                {item.detail ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.detail}</p> : null}
              </li>
            </Reveal>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-ink-muted">Valid ID may be required where stated.</p>
      </section>

      <Reveal delay={60}>
        <section className="mt-16 rounded-[1.75rem] bg-cream px-6 py-12 text-center sm:px-12">
          <h2 className="font-serif text-3xl sm:text-4xl">{body.atmosphere_title}</h2>
          <div className="gold-line mx-auto mt-4 max-w-[5rem]" aria-hidden />
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-ink-muted">{body.atmosphere_body}</p>
          <Link to="/contact" className="btn-gold mt-8 inline-block">
            Book your pamper session
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
