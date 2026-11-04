/**
 * HeroFilm: background video for the Home hero.
 *  - two stacked <video> layers crossfade between clips (no flash)
 *  - skips clips that fail to load; shows `fallback` if motion is reduced or all clips fail
 *  - optional `poster` image shows while the first clip loads
 *  - pauses when the browser tab is hidden
 * Clips live in /public/hero/ (manicure.mp4, pedicure.mp4, care.mp4, finish.mp4).
 * Styling: src/styles/site-redesign.css -> "1. HOME HERO"
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

export const heroFilms = {
  manicure: "/hero/manicure.mp4",
  pedicure: "/hero/pedicure.mp4",
  care: "/hero/care.mp4",
  finish: "/hero/finish.mp4",
} as const;

export const homeReel = [
  heroFilms.manicure,
  heroFilms.pedicure,
  heroFilms.care,
  heroFilms.finish,
];

const FADE_MS = 900;

/**
 * A silent film for a hero. Plays the clips in order with a soft crossfade
 * (two stacked videos, so there is no blank flash between clips).
 * Skips clips that fail to load, shows `fallback` (or the poster) when motion
 * is reduced, and pauses when the tab is hidden.
 */
export function HeroFilm({
  sources,
  fallback = null,
  poster,
  className = "",
}: {
  sources: string[];
  fallback?: ReactNode;
  poster?: string;
  className?: string;
}) {
  const n = sources.length;
  const many = n > 1;

  const [reduce, setReduce] = useState(false);
  const [failed, setFailed] = useState(false);
  const [front, setFront] = useState<0 | 1>(0);
  // which clip each of the two video layers currently holds
  const [slots, setSlots] = useState<[number, number]>([0, many ? 1 : 0]);

  const frontRef = useRef<0 | 1>(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([null, null]);
  const errors = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  // start the first clip
  useEffect(() => {
    if (reduce || failed || n === 0) return;
    refs.current[0]?.play().catch(() => {});
    return () => window.clearTimeout(timer.current);
  }, [reduce, failed, n]);

  // pause while the tab is hidden
  useEffect(() => {
    const onVisibility = () => {
      const video = refs.current[frontRef.current];
      if (!video) return;
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function advance() {
    if (!many) return;
    const from = frontRef.current;
    const to = (from ^ 1) as 0 | 1;
    const incoming = refs.current[to];
    if (incoming) {
      incoming.currentTime = 0;
      incoming.play().catch(() => {});
    }
    frontRef.current = to;
    setFront(to);
    // once the fade is done, preload the following clip into the hidden layer
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      refs.current[from]?.pause();
      setSlots((current) => {
        const next: [number, number] = [current[0], current[1]];
        next[from] = (current[to] + 1) % n;
        return next;
      });
    }, FADE_MS);
  }

  function handleError(layer: 0 | 1) {
    errors.current += 1;
    if (errors.current > n * 2) {
      setFailed(true);
      return;
    }
    if (layer === frontRef.current) advance();
  }

  if (reduce || failed || n === 0) {
    return <>{fallback}</>;
  }

  const layers: (0 | 1)[] = many ? [0, 1] : [0];

  return (
    <>
      {layers.map((layer) => (
        <video
          key={layer}
          ref={(el) => {
            refs.current[layer] = el;
          }}
          className={`hero-film ${className}`.trim()}
          src={sources[slots[layer]]}
          poster={poster}
          muted
          playsInline
          loop={!many}
          preload="auto"
          aria-hidden
          tabIndex={-1}
          style={{
            opacity: front === layer ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
          onEnded={many && layer === frontRef.current ? advance : undefined}
          onError={() => handleError(layer)}
        />
      ))}
    </>
  );
}
