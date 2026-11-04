/** Always-loading replacement for a social embed. Renders nothing until a link is set. */

// Set your real profile link here, e.g. "https://www.instagram.com/yourhandle"
export const SOCIAL_URL = "";
// Optional display name, without the @, e.g. "mielle.lamour"
export const SOCIAL_HANDLE = "";

export function SocialCard({ href = SOCIAL_URL, handle = SOCIAL_HANDLE }: { href?: string; handle?: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="social-card">
      <span className="social-card-kicker">Follow along</span>
      <span className="social-card-title">{handle ? `@${handle}` : "Follow us"}</span>
      <span className="social-card-copy">Nail sets, salon moments and offers.</span>
      <span className="social-card-cta">View profile →</span>
    </a>
  );
}
