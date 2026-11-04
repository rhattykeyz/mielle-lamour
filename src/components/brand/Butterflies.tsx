/** A few gold and blush butterflies. They fly along the margins, behind the page. */

type Tone = "gold" | "blush";

const tones: Record<Tone, { fill: string; veil: string; line: string }> = {
  gold: { fill: "#C9A24B", veil: "#FFF8EE", line: "#8C6A24" },
  blush: { fill: "#E89AAB", veil: "#FFF8EE", line: "#A8832F" },
};

function ButterflyMark({ tone }: { tone: Tone }) {
  const c = tones[tone];
  return (
    <svg viewBox="0 0 80 64" fill="none" aria-hidden>
      <g className="wing wing-left">
        <path
          d="M38 27C33 14 18 7 10 13 3 18 4 30 14 35 22 39 32 35 38 30Z"
          fill={c.fill}
          stroke={c.line}
          strokeWidth="0.7"
        />
        <path
          d="M37 31C31 39 20 49 12 47 5 45 6 35 16 33 24 31 32 31 37 33Z"
          fill={c.fill}
          opacity="0.9"
          stroke={c.line}
          strokeWidth="0.7"
        />
        <path d="M34 24C26 20 18 20 14 24" stroke={c.veil} strokeWidth="0.8" strokeLinecap="round" />
      </g>
      <g className="wing wing-right">
        <path
          d="M42 27C47 14 62 7 70 13 77 18 76 30 66 35 58 39 48 35 42 30Z"
          fill={c.fill}
          stroke={c.line}
          strokeWidth="0.7"
        />
        <path
          d="M43 31C49 39 60 49 68 47 75 45 74 35 64 33 56 31 48 31 43 33Z"
          fill={c.fill}
          opacity="0.9"
          stroke={c.line}
          strokeWidth="0.7"
        />
        <path d="M46 24C54 20 62 20 66 24" stroke={c.veil} strokeWidth="0.8" strokeLinecap="round" />
      </g>
      <path d="M40 18c-.3 8-.3 18 0 28" stroke={c.line} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="40" cy="33" r="1.8" fill={c.veil} />
      <circle cx="40" cy="33" r="0.7" fill={c.fill} />
      <path d="M39 20C33 13 27 9 23 7" stroke={c.line} strokeWidth="0.65" strokeLinecap="round" />
      <path d="M41 20C47 13 53 9 57 7" stroke={c.line} strokeWidth="0.65" strokeLinecap="round" />
    </svg>
  );
}

const marks: { id: string; tone: Tone }[] = [
  { id: "bf-a", tone: "gold" },
  { id: "bf-b", tone: "blush" },
  { id: "bf-c", tone: "gold" },
  { id: "bf-d", tone: "blush" },
];

export function Butterflies() {
  return (
    <div className="butterfly-layer" aria-hidden>
      {marks.map((item) => (
        <span key={item.id} className={`bf ${item.id}`}>
          <ButterflyMark tone={item.tone} />
        </span>
      ))}
    </div>
  );
}
