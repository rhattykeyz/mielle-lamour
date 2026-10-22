import { useMemo, useState } from "react";
import { useGallery } from "@/hooks/usePublicData";
import { Seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export function GalleryPage() {
  const { data } = useGallery();
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<string | null>(null);

  const images = useMemo(() => {
    const list = data?.images ?? [];
    if (filter === "all") return list;
    return list.filter((i) => i.category_id === filter);
  }, [data, filter]);

  function src(path: string) {
    return supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo
        title="Gallery"
        description="Nail art, beauty and spa work from Mielle L'Amour in Accra."
        path="/gallery"
      />
      <h1 className="font-serif text-5xl">Gallery</h1>
      <p className="mt-3 text-ink-muted">
        Portrait and square photos are cropped consistently. Upload real work from Admin → Gallery.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm ${filter === "all" ? "bg-gold text-ink" : "bg-pink"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {(data?.categories ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            className={`rounded-full px-4 py-2 text-sm ${filter === c.id ? "bg-gold text-ink" : "bg-pink"}`}
            onClick={() => setFilter(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      {images.length === 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-3xl bg-pink grid place-items-center text-center text-xs uppercase tracking-widest text-gold-deep"
            >
              [PLACEHOLDER PHOTO]
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              className="overflow-hidden rounded-3xl"
              onClick={() => setActive(src(img.storage_path))}
            >
              <img
                src={src(img.storage_path)}
                alt={img.alt || "Mielle L'Amour gallery"}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      )}
      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <img src={active} alt="" className="max-h-[90vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}
