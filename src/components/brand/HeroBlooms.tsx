/** Real flower photos at the hero edges. They stay out of the slogan. */

const blooms = [
  { src: "/flowers/bouquet.jpg", className: "hero-bloom hero-bloom-tl" },
  { src: "/flowers/cascade.jpg", className: "hero-bloom hero-bloom-tr" },
  { src: "/flowers/garland.jpg", className: "hero-bloom hero-bloom-bl" },
  { src: "/flowers/arch.png", className: "hero-bloom hero-bloom-br" },
];

export function HeroBlooms() {
  return (
    <div className="hero-corners" aria-hidden>
      {blooms.map((bloom) => (
        <img key={bloom.src} src={bloom.src} alt="" className={bloom.className} />
      ))}
    </div>
  );
}

/** Painted clip art for the hero corners. Not a photo layer. */

function Rose({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden>
      <path d="M28 118c18 8 34-6 42-22 6 18 28 30 46 16" fill="none" stroke="#7d9a62" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="34" cy="108" rx="16" ry="8" fill="#9cba78" transform="rotate(-28 34 108)" />
      <ellipse cx="118" cy="112" rx="18" ry="9" fill="#86a86a" transform="rotate(24 118 112)" />
      <g transform="translate(30 8)">
        <ellipse cx="50" cy="46" rx="28" ry="22" fill="#f4a7b8" transform="rotate(-18 50 46)" />
        <ellipse cx="50" cy="46" rx="26" ry="18" fill="#f7c5d2" transform="rotate(32 50 46)" />
        <ellipse cx="50" cy="48" rx="22" ry="16" fill="#e9899f" transform="rotate(70 50 48)" />
        <ellipse cx="50" cy="50" rx="16" ry="12" fill="#fde8ef" />
        <circle cx="50" cy="50" r="6" fill="#c9a24b" />
        <circle cx="48" cy="48" r="2" fill="#fff6ea" />
      </g>
    </svg>
  );
}

function Peony({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 150" className={className} aria-hidden>
      <ellipse cx="28" cy="108" rx="16" ry="7" fill="#8eaf6e" transform="rotate(-40 28 108)" />
      <ellipse cx="118" cy="96" rx="18" ry="8" fill="#a3c484" transform="rotate(30 118 96)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse
          key={deg}
          cx="75"
          cy="42"
          rx="16"
          ry="28"
          fill={deg % 90 === 0 ? "#f6b7c6" : "#f8d0dc"}
          transform={`rotate(${deg} 75 72)`}
        />
      ))}
      <circle cx="75" cy="72" r="14" fill="#f4c56a" />
      <circle cx="70" cy="68" r="3" fill="#fff8ee" />
      <circle cx="80" cy="74" r="2.2" fill="#a8832f" />
    </svg>
  );
}

function BowBloom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden>
      <path d="M80 58c-22-28-62-22-62 8 0 22 28 26 62 6" fill="#e9899f" />
      <path d="M80 58c22-28 62-22 62 8 0 22-28 26-62 6" fill="#f4a7b8" />
      <circle cx="80" cy="62" r="8" fill="#c9a24b" />
      <path d="M74 68c-6 18-16 32-22 42" fill="none" stroke="#e9899f" strokeWidth="7" strokeLinecap="round" />
      <path d="M86 68c6 18 16 32 22 42" fill="none" stroke="#f4a7b8" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="46" cy="118" rx="10" ry="7" fill="#f7c5d2" transform="rotate(-20 46 118)" />
      <circle cx="46" cy="118" r="3" fill="#c9a24b" />
    </svg>
  );
}

function ButterflySprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 120" className={className} aria-hidden>
      <ellipse cx="22" cy="96" rx="14" ry="6" fill="#9cba78" transform="rotate(-20 22 96)" />
      <g transform="translate(28 8)">
        <ellipse cx="28" cy="36" rx="26" ry="18" fill="#f4a7b8" transform="rotate(-24 28 36)" />
        <ellipse cx="62" cy="36" rx="26" ry="18" fill="#f7c5d2" transform="rotate(24 62 36)" />
        <ellipse cx="30" cy="58" rx="16" ry="12" fill="#e9899f" transform="rotate(12 30 58)" />
        <ellipse cx="60" cy="58" rx="16" ry="12" fill="#f6b7c6" transform="rotate(-12 60 58)" />
        <path d="M45 22v48" stroke="#3a2b2e" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="45" cy="20" r="3.2" fill="#3a2b2e" />
      </g>
    </svg>
  );
}

function Pearls({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 120" className={className} aria-hidden>
      <path d="M18 78c22-10 36-6 48 2" fill="none" stroke="#7d9a62" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="24" cy="70" rx="16" ry="8" fill="#9cba78" transform="rotate(-28 24 70)" />
      <ellipse cx="42" cy="52" rx="18" ry="15" fill="#fff7f2" stroke="#f4c9d4" strokeWidth="1.4" />
      <ellipse cx="38" cy="48" rx="7" ry="4" fill="#fff" />
      <ellipse cx="74" cy="44" rx="22" ry="18" fill="#fff6ee" stroke="#f0c3d0" strokeWidth="1.4" />
      <ellipse cx="68" cy="39" rx="8" ry="5" fill="#fff" />
      <ellipse cx="108" cy="54" rx="20" ry="16" fill="#fde8ef" stroke="#e9899f" strokeWidth="1.5" />
      <ellipse cx="103" cy="49" rx="7" ry="4" fill="#fff" />
      <circle cx="88" cy="74" r="7" fill="#e9899f" />
      <circle cx="86" cy="72" r="2.2" fill="#fff6ea" />
    </svg>
  );
}

export type ClipMotif = "rose" | "peony" | "bow" | "butterfly" | "pearl";

const CLIPS = {
  rose: Rose,
  peony: Peony,
  bow: BowBloom,
  butterfly: ButterflySprig,
  pearl: Pearls,
};

/** One painted motif. Sway lives on `.table-clip` and turns off for reduced motion. */
export function TableClip({ motif, className = "" }: { motif: ClipMotif; className?: string }) {
  const Graphic = CLIPS[motif];
  return <Graphic className={className} />;
}

/** Corner motifs for a price table or offer board. Empty corners are skipped. */
export function TableCorners({
  tl,
  tr,
  bl,
  br,
}: {
  tl?: ClipMotif;
  tr?: ClipMotif;
  bl?: ClipMotif;
  br?: ClipMotif;
}) {
  const spots = [
    ["tl", tl, "d1"],
    ["tr", tr, "d2"],
    ["bl", bl, "d3"],
    ["br", br, "d4"],
  ] as const;

  return (
    <>
      {spots.map(([place, motif, delay]) =>
        motif ? (
          <span key={place} className={`table-clip-slot table-clip-${place}`} aria-hidden>
            <TableClip motif={motif} className={`table-clip table-clip-${delay}`} />
          </span>
        ) : null,
      )}
    </>
  );
}
