import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import { HeroFilm, homeReel } from "@/components/brand/HeroFilm";
import { Reveal } from "@/components/motion/Reveal";
import { useCategories, usePageContent, usePublicSettings, useServices } from "@/hooks/usePublicData";
import { LocalBusinessJsonLd, Seo } from "@/lib/seo";
import { money, realValue, visibleCopy, waLink } from "@/lib/format";
import { ABOUT_KEY, ABOUT_TAGLINE, aboutBody } from "@/lib/aboutCopy";
import { DISCOUNTS_TEASER } from "@/lib/discountsCopy";
import { localNailPhotos } from "@/lib/localGallery";
import "../site-chrome.css";
import "@/styles/site-redesign.css"; // keep LAST so the redesign wins over older rules

export function HomePage() {
  const { data: settings } = usePublicSettings();
  const { data: page } = usePageContent("home");
  const { data: aboutPage } = usePageContent(ABOUT_KEY);
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const body = page?.body ?? {};
  const about = aboutBody(aboutPage?.body);
  const featured = (services ?? []).slice(0, 6);
  const heroTitle = "Impeccable Care, Unforgettable Luxury";
  const { name: heroName, line: heroLine } = splitHeroSlogan(heroTitle);
  const heroPhoto = localNailPhotos[0];
  const aboutPhotos = localNailPhotos.slice(1);
  const hoursPhoto = localNailPhotos[1] ?? localNailPhotos[0];
  const heroSubtitle = realValue(body.hero_subtitle);
  const hoursNote = realValue(settings?.opening_hours_note);
  const address = realValue(settings?.address);
  const whatsapp = realValue(settings?.whatsapp);

  return (
    <div className="home-page">
      <Seo
        title="Mielle L'Amour | Nail, Beauty & Spa in Accra"
        description={`${ABOUT_TAGLINE}. Book online. Pay in person at the salon.`}
        path="/"
      />
      <LocalBusinessJsonLd settings={settings} />

      {/* ===================================================================
          SECTION 1: HERO  (REDESIGNED)
          Full-screen looping video, dark rose overlay, centred text + 2 buttons.
          CSS: site-redesign.css -> "1. HOME HERO"
          =================================================================== */}
      <section className="home-hero">
        <div className="hero-stage">
          {/* video layer (HeroFilm.tsx). Falls back to the still photo if motion is reduced / video fails */}
          <HeroFilm
            sources={homeReel}
            poster={heroPhoto.src}
            fallback={<img src={heroPhoto.src} alt={heroPhoto.alt} className="hero-film" />}
          />
          {/* text layer sits above the video and the ::after overlay */}
          <div className="hero-stage-copy">
            <p className="page-kicker hero-kicker hero-in hero-in-1">NAIL, BEAUTY &amp; SPA IN ACCRA</p>
            <h1 className="home-hero-title hero-in hero-in-2">
              <span className="hero-name">{heroName}</span>
              {heroLine ? <span className="hero-tagline">{heroLine}</span> : null}
            </h1>
            {heroSubtitle ? (
              <p className="hero-subtitle hero-in hero-in-3">{visibleCopy(heroSubtitle)}</p>
            ) : null}
            <div className="home-hero-actions hero-in hero-in-4">
              <Link to="/book" className="btn-gold">
                {body.hero_cta || "Book Now"}
              </Link>
              <Link to="/services" className="btn-ghost">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 2: ABOUT TEASER + PHOTO COLLAGE + TREATMENT CATEGORY CARDS
          (unchanged, styled by HomePage.css / site-chrome.css)
          =================================================================== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="home-about-grid">
          <Reveal className="home-about-lead">
            <figure className="home-about-perfume">
              <img
                src="/art/perfume-still.jpg"
                alt="Pink perfume, hand cream, and a pearl charm arranged with roses"
              />
            </figure>
            <div className="invite home-about-copy rounded-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">{about.kicker}</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{about.title}</h2>
              <p>{about.welcome_body}</p>
              <p>{about.hygiene_body}</p>
              <p>{about.experience_body}</p>
              <p className="text-ink-muted">{DISCOUNTS_TEASER}</p>
              <p className="flex flex-wrap gap-x-5 gap-y-2">
                <Link to="/about" className="gold-link text-gold-deep">
                  <span>About us</span>
                </Link>
                <Link to="/discounts" className="gold-link text-gold-deep">
                  <span>Discounts</span>
                </Link>
              </p>
            </div>
          </Reveal>
          <Reveal className="home-about-collage" delay={80}>
            <div className="home-about-photos">
              {aboutPhotos.map((photo) => (
                <div key={photo.id} className="home-frame">
                  <img src={photo.src} alt={photo.alt} className="aspect-[3/4] w-full object-cover" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <p className="home-script mt-10">Our services</p>
        <div className={`mx-auto mt-4 grid max-w-5xl gap-6 justify-center ${gridCols(categories?.length ?? 0)}`}>
          {(categories ?? []).map((c, i) => (
            <Reveal key={c.id} className="h-full" delay={Math.min(i, 4) * 80}>
              <Link to="/services" className="card block h-full rounded-3xl p-6 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Category</p>
                <h3 className="mt-2 font-serif text-2xl">{visibleCopy(c.name)}</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {c.description ? visibleCopy(c.description) : null}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 3: GALLERY CAROUSEL (component defined below) */}
      <NailCarousel />

      {/* ===================================================================
          SECTION 4: TESTIMONIALS
          NOTE FOR OWNER: these three reviews are hard-coded. Confirm they are
          real client reviews, or replace them.
          =================================================================== */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="section-head-row">
          <div>
            <p className="home-script">client love</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Testimonials</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { name: "Akosua", quote: "Warm, polished and beautifully calm. The whole experience feels premium from start to finish." },
            { name: "Nana Yaa", quote: "My nails looked immaculate for weeks and the service was so thoughtful and relaxing." },
            { name: "Esi", quote: "The bridal prep was so seamless and beautiful. Every detail felt considered and luxe." },
          ].map((review) => (
            <Reveal key={review.name} className="h-full">
              <article className="card h-full rounded-[1.6rem] p-6">
                <div className="mb-3 flex gap-1 text-lg text-gold-deep" aria-label="Five star review">★★★★★</div>
                <p className="text-base leading-relaxed text-ink">"{review.quote}"</p>
                <p className="mt-5 text-sm uppercase tracking-[0.18em] text-ink-muted">{review.name}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="faq-shell">
          <div className="faq-header">
            <p className="home-script">faq</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Everything you need to know</h2>
          </div>
          <div className="faq-list">
            {[
              ["What is your cancellation policy?", "Please reschedule or cancel at least 24 hours before your appointment."],
              ["What if I am late?", "Arriving late may reduce your appointment time, and we may need to shorten the service to keep the schedule on track."],
              ["Do you take payment in person?", "Yes. All payments are made in person at the salon at the end of your appointment."],
            ].map(([question, answer]) => (
              <div key={question} className="faq-item">
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: FEATURED SERVICES (first 6 services from the database) */}
      <section className="band-field py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="home-script">for you</p>
            <div className="home-featured-header mt-2">
              <h2 className="font-serif text-4xl">Featured services</h2>
              <Link to="/services" className="gold-link text-sm text-ink">
                <span>All services</span>
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map((s, i) => (
              <Reveal key={s.id} className="h-full" delay={Math.min(i, 4) * 80}>
                <article className="card h-full rounded-3xl p-5">
                  <h3 className="font-serif text-2xl">{visibleCopy(s.name)}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{money(s.price_ghs, s.price_from)}</p>
                  <Link to={`/book?service=${s.id}`} className="btn-gold mt-4 !py-2">
                    Book
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: OPENING HOURS + ADDRESS + CONTACT BUTTONS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="home-hours-grid">
          <Reveal>
            <figure className="home-frame">
              <img src={hoursPhoto.src} alt={hoursPhoto.alt} className="aspect-[4/5] w-full object-cover" />
            </figure>
          </Reveal>
          <Reveal delay={80}>
            <div className="invite home-hours-copy rounded-3xl p-6 sm:p-8">
              <p className="home-script">visit</p>
              <h2 className="mt-2 font-serif text-4xl">Opening hours</h2>
              {hoursNote ? <p className="text-sm text-ink-muted">{visibleCopy(hoursNote)}</p> : null}
              <ul className="hours-list mt-4 text-sm">
                {Object.values(settings?.opening_hours ?? {}).map((d) => {
                  const isToday = d.label.toLowerCase() === new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                  return (
                    <li key={d.label} className={isToday ? "is-today" : ""}>
                      <span>{d.label}</span>
                      <span>{d.open ? `${d.start} – ${d.end}` : "Closed"}</span>
                    </li>
                  );
                })}
              </ul>
              <h3 className="mt-6 font-serif text-3xl">Visit Mielle L'Amour</h3>
              {address ? <p>{address}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/book" className="btn-gold">Book now</Link>
                {whatsapp ? (
                  <a href={waLink(whatsapp)} className="btn-ghost">WhatsApp</a>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* Gallery carousel used by SECTION 3 above (unchanged logic) */
function NailCarousel() {
  const photos = localNailPhotos;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(1);
  const [reduce, setReduce] = useState(false);
  const max = Math.max(0, photos.length - visible);

  useLayoutEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setReduce(motion.matches);
    applyMotion();
    motion.addEventListener("change", applyMotion);
    const applyVisible = () => {
      const width = window.innerWidth;
      setVisible(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };
    applyVisible();
    window.addEventListener("resize", applyVisible);
    return () => {
      motion.removeEventListener("change", applyMotion);
      window.removeEventListener("resize", applyVisible);
    };
  }, []);

  useEffect(() => {
    setIndex((current) => Math.min(current, max));
  }, [max]);

  useEffect(() => {
    if (reduce || paused || photos.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current >= max ? 0 : current + 1));
    }, 4200);
    return () => window.clearInterval(id);
  }, [reduce, paused, max, photos.length]);

  function step(dir: -1 | 1) {
    setIndex((current) => {
      const next = current + dir;
      if (next > max) return 0;
      if (next < 0) return max;
      return next;
    });
  }

  return (
    <section className="band-blush py-16" aria-roledescription="carousel" aria-label="Nail sets">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="home-gallery-header">
            <div>
              <p className="home-script">nail sets</p>
              <h2 className="mt-2 font-serif text-4xl">Gallery</h2>
            </div>
            <Link to="/gallery" className="gold-link text-sm text-gold-deep">
              <span>See all</span>
            </Link>
          </div>
        </Reveal>
        <div
          className="nail-carousel mt-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <button type="button" className="nail-arrow" aria-label="Previous nail photo" onClick={() => step(-1)}>‹</button>
          <div className="nail-viewport" style={{ "--visible": visible } as CSSProperties}>
            <div className="nail-track" style={{ transform: `translateX(calc(${index} * -100% / ${visible}))` }}>
              {photos.map((photo) => (
                <div key={photo.id} className="nail-slide">
                  <div className="home-frame">
                    <img src={photo.src} alt={photo.alt} className="aspect-[3/4] w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="nail-arrow" aria-label="Next nail photo" onClick={() => step(1)}>›</button>
        </div>
      </div>
    </section>
  );
}

function splitHeroSlogan(title: string) {
  const text = title.replace(/\s+/g, " ").trim();
  const name = ABOUT_TAGLINE.split(" Impeccable")[0];
  if (text === name || text.startsWith(`${name} `)) {
    return { name, line: text.slice(name.length).trim() };
  }
  return { name: text, line: "" };
}

function gridCols(n: number) {
  if (n <= 1) return "grid-cols-1";
  if (n === 2) return "md:grid-cols-2";
  if (n === 3) return "md:grid-cols-3";
  return "md:grid-cols-2 lg:grid-cols-4";
}
