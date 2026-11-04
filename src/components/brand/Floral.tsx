import { Reveal } from "@/components/motion/Reveal";

/** Lightweight botanical line art. Cream petals read on the pink page. */

export function Blossom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="40"
          cy="18"
          rx="9"
          ry="16"
          fill="#FFF8EE"
          stroke="#C9A24B"
          strokeWidth="0.8"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      <circle cx="40" cy="40" r="6" fill="#C9A24B" />
      <circle cx="40" cy="40" r="2.5" fill="#FFF8EE" />
    </svg>
  );
}

export function FloralSprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 180" className={className} fill="none" aria-hidden>
      <path d="M70 170 C68 110 60 70 70 16" stroke="#C9A24B" strokeWidth="1" />
      <path d="M70 130 C40 118 28 96 24 78" stroke="#A8832F" strokeWidth="0.8" />
      <path d="M70 100 C102 88 116 64 118 42" stroke="#A8832F" strokeWidth="0.8" />
      <ellipse cx="22" cy="70" rx="14" ry="8" fill="#FFF8EE" stroke="#C9A24B" transform="rotate(-30 22 70)" />
      <ellipse cx="120" cy="38" rx="14" ry="8" fill="#FFF8EE" stroke="#C9A24B" transform="rotate(24 120 38)" />
      <ellipse cx="54" cy="48" rx="12" ry="7" fill="#F1B8C8" stroke="#C9A24B" transform="rotate(-18 54 48)" />
      <g transform="translate(46 4) scale(0.42)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="40"
            cy="18"
            rx="9"
            ry="16"
            fill="#FFF8EE"
            stroke="#C9A24B"
            strokeWidth="1.4"
            transform={`rotate(${deg} 40 40)`}
          />
        ))}
        <circle cx="40" cy="40" r="6" fill="#C9A24B" />
      </g>
    </svg>
  );
}

const field = [
  { top: "4%", left: "-1%", size: "w-24 md:w-32", rotate: "-18deg" },
  { top: "12%", right: "1%", size: "w-16 md:w-24", rotate: "16deg" },
  { top: "28%", left: "4%", size: "w-14", rotate: "8deg" },
  { top: "36%", right: "-2%", size: "w-28 md:w-40", rotate: "12deg", sprig: true },
  { top: "48%", left: "-3%", size: "w-24 md:w-36", rotate: "-8deg", sprig: true },
  { top: "58%", right: "6%", size: "w-16", rotate: "-20deg" },
  { top: "70%", left: "8%", size: "w-20", rotate: "22deg" },
  { top: "78%", right: "-1%", size: "w-24 md:w-32", rotate: "-14deg" },
  { top: "88%", left: "2%", size: "w-16 md:w-20", rotate: "10deg" },
  { top: "94%", right: "12%", size: "w-14", rotate: "-6deg" },
];

export function FloralField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {field.map((item, i) => (
        <div
          key={i}
          className={`absolute opacity-80 ${item.size}`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            transform: `rotate(${item.rotate})`,
          }}
        >
          {item.sprig ? <FloralSprig className="h-auto w-full" /> : <Blossom className="h-auto w-full" />}
        </div>
      ))}
    </div>
  );
}

export function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M8 112c28-8 48-32 52-60M20 100c18 4 36-12 40-30"
        stroke="#C9A24B"
        strokeWidth="1"
      />
      <path
        d="M58 28c-8 14-6 28 4 38 12-8 16-22 10-36-2 0-8 2-14-2z"
        stroke="#F1B8C8"
        strokeWidth="1.2"
        fill="rgba(248,215,224,0.35)"
      />
      <circle cx="72" cy="22" r="3" fill="#C9A24B" />
      <path d="M40 70c10-18 28-22 42-14" stroke="#C9A24B" strokeWidth="0.8" />
    </svg>
  );
}

export function RibbonBow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 56" className={className} fill="none" aria-hidden>
      <path
        d="M44 24c-2-12-16-20-28-16C6 12 8 26 20 28c8 1 18-1 24-4z"
        fill="#F6C3CC"
        stroke="#C9A24B"
        strokeWidth="1.2"
      />
      <path
        d="M44 24c2-12 16-20 28-16 10 4 8 18-4 20-8 1-18-1-24-4z"
        fill="#F4ABB4"
        stroke="#C9A24B"
        strokeWidth="1.2"
      />
      <path d="M44 26c-1 8-6 16-14 24" stroke="#C9A24B" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M44 26c1 8 6 16 14 24" stroke="#C9A24B" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="44" cy="25" r="4" fill="#C9A24B" />
      <circle cx="44" cy="25" r="1.6" fill="#FFF8EE" />
    </svg>
  );
}

const sparks = ["sp-a", "sp-b", "sp-c", "sp-d", "sp-e", "sp-f"];

export function SparkleField() {
  return (
    <div className="sparkle-field" aria-hidden>
      {sparks.map((id, i) => (
        <span key={id} className={`sparkle ${id}`} style={{ animationDelay: `${i * 0.55}s` }} />
      ))}
    </div>
  );
}

export function FloralDivider() {
  return (
    <Reveal>
      <div className="floral-rule flex items-center gap-4 py-8" aria-hidden>
        <div className="gold-line flex-1" />
        <RibbonBow className="h-9 w-14 shrink-0" />
        <div className="gold-line flex-1" />
      </div>
    </Reveal>
  );
}

export function HeroBloom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <circle cx="200" cy="200" r="180" fill="#FFF8EE" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#C9A24B" strokeWidth="1" />
      <circle cx="200" cy="200" r="128" fill="none" stroke="#C9A24B" strokeWidth="0.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse
          key={deg}
          cx="200"
          cy="118"
          rx="28"
          ry="52"
          fill="rgba(255,248,238,0.55)"
          stroke="#C9A24B"
          strokeWidth="0.8"
          transform={`rotate(${deg} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="28" fill="#C9A24B" />
      <circle cx="200" cy="200" r="12" fill="#FFF8EE" />
    </svg>
  );
}
