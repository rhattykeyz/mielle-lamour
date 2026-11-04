import { useEffect, useRef, useState } from "react";
import { localNailPhotos } from "@/lib/localGallery";

const slides = [
  ...localNailPhotos.map((photo) => ({ src: photo.src })),
  { src: "/flowers/bouquet.jpg" },
  { src: "/flowers/garland.jpg" },
  { src: "/flowers/cascade.jpg" },
];

const ALT = "Mielle L'Amour nail art";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduce;
}

function loopMetrics(track: HTMLDivElement) {
  const setEl = track.querySelector<HTMLElement>(".nav-carousel-set");
  const frames = setEl?.querySelectorAll<HTMLElement>(".nav-carousel-slide");
  if (!setEl || !frames || frames.length < 2) return null;
  const step = frames[1].offsetLeft - frames[0].offsetLeft;
  const loop = setEl.offsetWidth;
  if (step <= 0 || loop <= 0) return null;
  return { step, loop };
}

export function NavCarousel() {
  const reduce = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const markActive = (index: number) => {
    const next = ((index % slides.length) + slides.length) % slides.length;
    if (activeRef.current === next) return;
    activeRef.current = next;
    setActive(next);
  };

  const jumpTo = (index: number) => {
    const track = trackRef.current;
    if (!track) {
      markActive(index);
      return;
    }
    const metrics = loopMetrics(track);
    if (!metrics) {
      markActive(index);
      return;
    }
    const duration = parseFloat(getComputedStyle(track).animationDuration) || 48;
    const progress = (index * metrics.step) / metrics.loop;
    track.style.animationDelay = `${-progress * duration}s`;
    markActive(index);
  };

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const motion = getComputedStyle(track);
      if (motion.animationName === "none" || motion.animationPlayState === "paused") return;
      if (!motion.transform || motion.transform === "none") return;
      const metrics = loopMetrics(track);
      if (!metrics) return;
      const matrix = new DOMMatrix(motion.transform);
      const offset = ((-matrix.m41) % metrics.loop + metrics.loop) % metrics.loop;
      if (offset < metrics.step * slides.length) markActive(Math.round(offset / metrics.step));
    }, 700);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  const held = paused || reduce;

  return (
    <section
      className={`nav-carousel${paused ? " is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="Mielle L'Amour nail art"
    >
      {reduce ? (
        <div className="nav-carousel-window nav-carousel-window-still">
          <img src={slides[active].src} alt={ALT} className="nav-carousel-still" />
        </div>
      ) : (
        <div className="nav-carousel-window">
          <div className="nav-carousel-track" ref={trackRef}>
            {[0, 1].map((copy) => (
              <div key={copy} className="nav-carousel-set" aria-hidden={copy === 1 || undefined}>
                {slides.map((slide) => (
                  <img
                    key={`${copy}-${slide.src}`}
                    src={slide.src}
                    alt={copy === 0 ? ALT : ""}
                    className="nav-carousel-slide"
                    draggable={false}
                    loading={copy === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="nav-carousel-controls">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className="nav-carousel-dot"
            aria-label={`Show photo ${index + 1}`}
            aria-current={active === index ? "true" : undefined}
            onClick={() => jumpTo(index)}
          />
        ))}
        <button
          type="button"
          className="nav-carousel-pause"
          aria-pressed={held}
          disabled={reduce}
          aria-label={reduce ? "Slideshow paused" : paused ? "Play slideshow" : "Pause slideshow"}
          onClick={() => setPaused((value) => !value)}
        >
          {held ? (
            <svg viewBox="0 0 12 12" aria-hidden>
              <path d="M3.2 1.6v8.8L10 6 3.2 1.6Z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" aria-hidden>
              <path d="M2.4 1.4h2.3v9.2H2.4zM7.3 1.4h2.3v9.2H7.3z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
