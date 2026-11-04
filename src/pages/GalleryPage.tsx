/**
 * GALLERY PAGE: LAYOUT MAP (top to bottom)
 *   1. HERO ........ "The Gallery"                          (.gal-hero)
 *   2. FILTERS ..... pills: All + categories                 (.gal-filters / .gal-pill)
 *   3. MASONRY ..... 2 / 3 / 4 column photo grid             (.gal-masonry > .gal-item > .gal-tile)
 *   4. LIGHTBOX .... full-screen viewer, prev/next, counter, close (.gal-lightbox)
 *        keyboard: arrows + Esc.  touch: swipe left/right.
 * CSS: src/styles/site-redesign.css -> "3. GALLERY PAGE"
 * Data logic (Supabase images, local fallback photos, categories) is unchanged.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { useGallery } from "@/hooks/usePublicData";
import { localNailPhotos } from "@/lib/localGallery";
import { visibleCopy } from "@/lib/format";
import { Seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import "@/styles/site-redesign.css";

type Photo = { id: string; url: string; alt: string };

export function GalleryPage() {
  const { data } = useGallery();
  const [filter, setFilter] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const uploaded = data?.images ?? [];
  const usingLocal = uploaded.length === 0;

  function publicUrl(path: string) {
    return supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
  }

  const photos: Photo[] = useMemo(() => {
    if (usingLocal) {
      if (filter === "beauty" || filter === "spa") return [];
      return localNailPhotos.map((p) => ({ id: String(p.id), url: p.src, alt: p.alt }));
    }
    const list = filter === "all" ? uploaded : uploaded.filter((i) => i.category_id === filter);
    return list.map((i) => ({
      id: String(i.id),
      url: publicUrl(i.storage_path),
      alt: i.alt || "Mielle L'Amour gallery",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, uploaded, usingLocal]);

  const categories = usingLocal
    ? [
        { id: "nails", name: "Nails" },
        { id: "beauty", name: "Beauty" },
        { id: "spa", name: "Spa" },
      ]
    : (data?.categories ?? []);

  const open = activeIndex !== null;
  const count = photos.length;

  const step = useCallback(
    (dir: -1 | 1) => {
      setActiveIndex((i) => (i === null || count === 0 ? i : (i + dir + count) % count));
    },
    [count],
  );

  // keyboard, scroll lock, focus
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step]);

  // close lightbox if the filter changes
  useEffect(() => setActiveIndex(null), [filter]);

  const current = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <div className="gallery-page">
      <Seo title="Gallery" description="Nail art, beauty and spa work from Mielle L'Amour in Accra." path="/gallery" />

      <Reveal>
        <header className="gal-hero">
          <p className="gal-kicker">Mielle L&apos;Amour</p>
          <h1 className="gal-title">The Gallery</h1>
          <div className="gal-rule" aria-hidden />
          <p className="gal-sub">Every set is made by hand, with precision and care. Tap a photo to see it up close.</p>
        </header>
      </Reveal>

      <div className="gal-filters" role="tablist" aria-label="Gallery categories">
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          className={filter === "all" ? "gal-pill is-active" : "gal-pill"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={filter === c.id}
            className={filter === c.id ? "gal-pill is-active" : "gal-pill"}
            onClick={() => setFilter(c.id)}
          >
            {visibleCopy(c.name)}
          </button>
        ))}
      </div>

      {count === 0 ? (
        <p className="gal-empty">New photos in this category are coming soon.</p>
      ) : (
        <div className="gal-masonry">
          {photos.map((photo, i) => (
            <Reveal key={photo.id} className="gal-item" delay={(i % 4) * 70}>
              <button
                type="button"
                className="gal-tile"
                onClick={() => setActiveIndex(i)}
                aria-label={`Open photo ${i + 1} of ${count}`}
              >
                <img src={photo.url} alt={visibleCopy(photo.alt)} loading="lazy" />
                <span className="gal-tile-shade" aria-hidden />
                <span className="gal-tile-zoom" aria-hidden>
                  View
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {current ? (
        <div
          className="gal-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setActiveIndex(null)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className="gal-close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(null);
            }}
          >
            ×
          </button>
          {count > 1 ? (
            <button
              type="button"
              className="gal-nav is-prev"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
            >
              ‹
            </button>
          ) : null}
          <figure className="gal-stage" onClick={(e) => e.stopPropagation()}>
            <img src={current.url} alt={visibleCopy(current.alt)} />
            <figcaption>
              {(activeIndex ?? 0) + 1} / {count}
            </figcaption>
          </figure>
          {count > 1 ? (
            <button
              type="button"
              className="gal-nav is-next"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
