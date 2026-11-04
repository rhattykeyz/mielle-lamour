import { Seo } from "@/lib/seo";

export function LuxuryPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Seo
        title="Luxury"
        description="Private, elevated beauty rituals and gifting experiences at Mielle L'Amour."
        path="/luxury"
      />

      <div className="luxury-shell">
        <div className="luxury-intro">
          <p className="page-kicker text-[0.72rem] font-medium uppercase tracking-[0.32em] text-ink-muted">
            Private experiences
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl">Luxury, tailored for your moment.</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
            Elevated nail rituals, intimate beauty appointments, and beautifully considered gifting moments for audiences who value detail.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/book" className="btn-gold">Book an appointment</a>
            <a href="/contact" className="btn-ghost">Inquire</a>
          </div>
        </div>

        <div className="luxury-showcase">
          <figure className="luxury-feature luxury-feature-large">
            <img
              src="/brand/coming-soon.jpg"
              alt="Pink butterflies beside gold lettering that reads Mielle L'Amour, Coming Soon"
            />
          </figure>
          <figure className="luxury-feature">
            <img
              src="/brand/gifts.jpg"
              alt="Pink gift boxes and bags printed with Mielle L'Amour"
            />
          </figure>
        </div>
      </div>

      <div className="luxury-grid mt-8">
        <div className="card p-6">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-ink-muted">Private rituals</p>
          <h2 className="mt-3 font-serif text-3xl">For celebrations and quiet luxury.</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Curated beauty moments for birthdays, bridal prep, gifting, and intimate salon experiences designed around comfort and elegance.
          </p>
        </div>
        <div className="card p-6">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-ink-muted">Personal detail</p>
          <h2 className="mt-3 font-serif text-3xl">Tailored to your pace.</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Exceptional care, soft textures, polished finishes, and a mood of ease from the moment you arrive.
          </p>
        </div>
      </div>
    </article>
  );
}
