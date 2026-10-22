/** Lightweight botanical line art. Keep these SVGs inline so they stay sharp and tiny. */

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

export function FloralDivider() {
  return (
    <div className="flex items-center gap-4 py-8" aria-hidden>
      <div className="gold-line flex-1" />
      <svg viewBox="0 0 48 24" className="h-6 w-12">
        <path
          d="M2 12c8-10 14-10 22 0 8 10 14 10 22 0"
          fill="none"
          stroke="#C9A24B"
          strokeWidth="1.2"
        />
        <circle cx="24" cy="12" r="2.5" fill="#F1B8C8" stroke="#C9A24B" />
      </svg>
      <div className="gold-line flex-1" />
    </div>
  );
}

export function HeroBloom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <circle cx="200" cy="200" r="180" fill="#F8D7E0" />
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
