import { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function ContentPage() {
  const qc = useQueryClient();
  const { data: pages } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => (await supabase.from("page_content").select("*")).data ?? [],
  });
  const { data: reviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () =>
      (await supabase.from("reviews").select("*").order("sort_order")).data ?? [],
  });

  const savePage = useMutation({
    mutationFn: async ({ key, body }: { key: string; body: Record<string, string> }) => {
      const { error } = await supabase.from("page_content").update({ body }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pages"] }),
  });

  const addReview = useMutation({
    mutationFn: async (form: FormData) => {
      const { error } = await supabase.from("reviews").insert({
        author_name: form.get("author_name"),
        rating: Number(form.get("rating")),
        quote: form.get("quote"),
        is_sample: false,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-4xl">Content & reviews</h1>
      {(pages ?? []).map((p) => (
        <form
          key={p.key}
          className="card space-y-3 rounded-3xl p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const body: Record<string, string> = {};
            for (const [k, v] of form.entries()) body[k] = String(v);
            savePage.mutate({ key: p.key, body });
          }}
        >
          <h2 className="font-serif text-2xl">{p.title}</h2>
          {Object.entries((p.body ?? {}) as Record<string, string>).map(([k, v]) => (
            <div key={k}>
              <label htmlFor={`${p.key}-${k}`}>{k.replace(/_/g, " ")}</label>
              <textarea id={`${p.key}-${k}`} name={k} defaultValue={v} rows={k.includes("body") ? 5 : 2} />
            </div>
          ))}
          <button className="btn-gold" type="submit">
            Save {p.title}
          </button>
        </form>
      ))}

      <form
        className="card space-y-3 rounded-3xl p-5"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          addReview.mutate(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <h2 className="font-serif text-2xl">Add review</h2>
        <input name="author_name" placeholder="Name" required />
        <input name="rating" type="number" min={1} max={5} defaultValue={5} />
        <textarea name="quote" placeholder="Quote" required />
        <button className="btn-gold" type="submit">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {(reviews ?? []).map((r) => (
          <li key={r.id} className="card rounded-2xl p-3 text-sm">
            {r.author_name} · {r.rating}★ — {r.quote}
          </li>
        ))}
      </ul>
    </div>
  );
}
