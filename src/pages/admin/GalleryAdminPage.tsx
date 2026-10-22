import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compressImage } from "@/lib/compressImage";
import { supabase } from "@/lib/supabase";

export function GalleryAdminPage() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data: cats } = useQuery({
    queryKey: ["gal-cats"],
    queryFn: async () =>
      (await supabase.from("gallery_categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: images } = useQuery({
    queryKey: ["gal-imgs"],
    queryFn: async () =>
      (await supabase.from("gallery_images").select("*").order("sort_order")).data ?? [],
  });

  const addCat = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("gallery_categories").insert({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gal-cats"] }),
  });

  async function uploadMany(files: FileList, categoryId: string) {
    setBusy(true);
    try {
      const start = (images?.length ?? 0) + 1;
      let i = 0;
      for (const file of Array.from(files)) {
        const blob = await compressImage(file);
        const path = `${categoryId}/${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage.from("gallery").upload(path, blob, {
          contentType: "image/jpeg",
        });
        if (error) throw error;
        await supabase.from("gallery_images").insert({
          category_id: categoryId || null,
          storage_path: path,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sort_order: start + i,
        });
        i += 1;
      }
      qc.invalidateQueries({ queryKey: ["gal-imgs"] });
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const list = [...(images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const idx = list.findIndex((x) => x.id === id);
    const swap = list[idx + dir];
    if (!swap) return;
    await supabase.from("gallery_images").update({ sort_order: swap.sort_order }).eq("id", id);
    await supabase.from("gallery_images").update({ sort_order: list[idx].sort_order }).eq("id", swap.id);
    qc.invalidateQueries({ queryKey: ["gal-imgs"] });
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl">Gallery</h1>
      <p className="text-sm text-ink-muted">
        Phone photos are compressed automatically. Portrait and square images crop neatly on the
        public gallery.
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const name = String(new FormData(e.currentTarget).get("name") || "");
          if (name) addCat.mutate(name);
          e.currentTarget.reset();
        }}
      >
        <input name="name" placeholder="New gallery category" />
        <button className="btn-gold" type="submit">
          Add
        </button>
      </form>
      <label className="card block space-y-3 rounded-3xl p-5">
        <span className="font-serif text-xl">Upload many photos</span>
        <select id="gal-cat" name="category">
          {(cats ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={(e) => {
            const files = e.target.files;
            const cat = (document.getElementById("gal-cat") as HTMLSelectElement | null)?.value ?? "";
            if (files?.length) uploadMany(files, cat);
          }}
        />
        {busy && <p>Compressing and uploading…</p>}
      </label>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(images ?? []).map((img) => {
          const url = supabase.storage.from("gallery").getPublicUrl(img.storage_path).data.publicUrl;
          return (
            <li key={img.id} className="card overflow-hidden rounded-2xl">
              <img src={url} alt={img.alt} className="aspect-[3/4] w-full object-cover" />
              <div className="flex justify-between p-2 text-xs">
                <button type="button" onClick={() => move(img.id, -1)}>
                  Up
                </button>
                <button type="button" onClick={() => move(img.id, 1)}>
                  Down
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
