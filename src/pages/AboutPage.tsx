/**
 * ABOUT PAGE: LAYOUT MAP (top to bottom)
 *   1. HERO ........ title + tagline + buttons | arched portrait + badge (.abt-hero)
 *   2. STORY ....... three paragraphs from the CMS (aboutBody)           (.abt-story)
 *   3. STANDARDS ... four cards, edit the STANDARDS array below          (.abt-standards)
 *   4. PHOTO STRIP . four nail photos                                    (.abt-strip)
 *   5. YOUR VISIT .. four steps, edit the STEPS array below              (.abt-visit)
 *   6. CTA BAND .... "Ready to be spoilt?" + two buttons                 (.abt-cta)
 * CSS: src/styles/site-redesign.css -> "4. ABOUT PAGE"
 * To change the portrait, edit PHOTOS below.
 */
import { Link } from "react-router-dom";
import { Reveal } from "@/components/motion/Reveal";
import { usePageContent } from "@/hooks/usePublicData";
import { ABOUT_KEY, ABOUT_SEO_DESCRIPTION, ABOUT_SEO_TITLE, aboutBody } from "@/lib/aboutCopy";
import { localNailPhotos } from "@/lib/localGallery";
import { Seo } from "@/lib/seo";
import "@/styles/site-redesign.css";

/* Swap these paths for your new photos (put files in /public/brand/). */
const PHOTOS = {
  portrait: { src: "/brand/floral-arch.jpg", alt: "A woman on a pink sofa beneath a flower arch at Mielle L'Amour" },
  // when you have real ones, e.g. "/brand/about-portrait.jpg", "/brand/about-workspace.jpg"
};

/* Edit this copy freely. It is written generally so nothing here is a claim you have to defend. */
const STANDARDS = [
  {
    title: "Hygiene, always",
    text: "Clean tools, clean surfaces and a clean space for every guest, every time.",
  },
  {
    title: "Precision in the detail",
    text: "Even shapes, clean cuticle lines and finishes checked under good light before you leave.",
  },
  {
    title: "Quality you can feel",
    text: "Products chosen for how they wear, how they look and how kind they are to your nails.",
  },
  {
    title: "Calm, from the moment you arrive",
    text: "A relaxed, welcoming space where you can unwind, enjoy the atmosphere and be looked after.",
  },
];

const STEPS = [
  { n: "01", title: "Book online", text: "Choose your treatment and a time that suits you. Pay in person at the salon." },
  { n: "02", title: "Arrive and unwind", text: "Settle in, relax, and take your time. We invite you to enjoy the atmosphere." },
  { n: "03", title: "Be pampered", text: "Your treatment is carried out with patience, precision and care." },
  { n: "04", title: "Pay in person", text: "Settle up at the salon at the end of your visit, and leave feeling wonderful." },
];

export function AboutPage() {
  const { data: page } = usePageContent(ABOUT_KEY);
  const body = aboutBody(page?.body);
  const strip = localNailPhotos.slice(0, 4);

  return (
    <article className="about-page">
      <Seo title={ABOUT_SEO_TITLE} description={ABOUT_SEO_DESCRIPTION} path="/about" />

      {/* ---------- Hero ---------- */}
      <section className="abt-hero">
        <Reveal className="abt-hero-copy">
          <p className="abt-kicker">{body.kicker}</p>
          <h1 className="abt-title">{body.title}</h1>
          <div className="abt-rule" aria-hidden />
          <p className="abt-tagline">{body.tagline}</p>
          <div className="abt-actions">
            <Link to="/book" className="abt-btn-gold">
              Book now
            </Link>
            <Link to="/services" className="abt-btn-ghost">
              View services
            </Link>
          </div>
        </Reveal>
        <Reveal className="abt-hero-visual" delay={100}>
          <figure className="abt-portrait">
            <img src={PHOTOS.portrait.src} alt={PHOTOS.portrait.alt} />
          </figure>
          <div className="abt-badge" aria-hidden>
            <span>Nail · Beauty · Spa</span>
            <strong>Accra</strong>
          </div>
        </Reveal>
      </section>

      {/* ---------- Story ---------- */}
      <section className="abt-story">
        <Reveal>
          <p className="abt-script">our story</p>
          <h2 className="abt-h2">A space made with care</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="abt-story-grid">
            <p className="abt-dropcap">{body.welcome_body}</p>
            <div className="abt-story-cols">
              <p>{body.hygiene_body}</p>
              <p>{body.experience_body}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Standards ---------- */}
      <section className="abt-standards">
        <Reveal>
          <p className="abt-script">our standards</p>
          <h2 className="abt-h2">Nothing leaves until it&apos;s perfect</h2>
        </Reveal>
        <div className="abt-standards-grid">
          {STANDARDS.map((s, i) => (
            <Reveal key={s.title} className="abt-reveal" delay={i * 80}>
              <div className="abt-standard">
                <span className="abt-standard-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Photo strip ---------- */}
      {strip.length ? (
        <section className="abt-strip" aria-label="Recent work">
          {strip.map((p, i) => (
            <Reveal key={p.id} className="abt-strip-item" delay={i * 70}>
              <img src={p.src} alt={p.alt} loading="lazy" />
            </Reveal>
          ))}
        </section>
      ) : null}

      {/* ---------- Your visit ---------- */}
      <section className="abt-visit">
        <Reveal>
          <p className="abt-script">your visit</p>
          <h2 className="abt-h2">From booking to beautiful</h2>
        </Reveal>
        <ol className="abt-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} className="abt-reveal" delay={i * 80}>
              <li className="abt-step">
                <span className="abt-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="abt-cta">
        <Reveal>
          <h2>Ready to be spoilt?</h2>
          <p>Book your appointment online and pay in person at the salon.</p>
          <div className="abt-actions is-center">
            <Link to="/book" className="abt-btn-gold">
              Book now
            </Link>
            <Link to="/gallery" className="abt-btn-light">
              See our work
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  );
}
