const ART = {
  woman: "/art/woman-hat.jpg",
  bow: "/art/bow.jpg",
  perfume: "/art/perfume.jpg",
  lipstick: "/art/lipstick.jpg",
  rose: "/art/rose.jpg",
  pearl: "/art/pearl.jpg",
} as const;

type Kind = keyof typeof ART;
type AccentProps = {
  kind?: Kind;
  motif?: Kind;
  className?: string;
};

/** Decorative illustration. The soft mask fades the cream paper so it sits on the page. */
export function ArtAccent({ kind, motif, className = "" }: AccentProps) {
  const accentKind = kind ?? motif ?? "rose";
  return (
    <img
      src={ART[accentKind]}
      alt=""
      aria-hidden
      draggable={false}
      className={`pointer-events-none select-none [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_78%)] ${className}`}
    />
  );
}
