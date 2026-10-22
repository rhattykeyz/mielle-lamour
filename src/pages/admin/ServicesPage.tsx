import { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function AdminServicesPage() {
  const qc = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () =>
      (await supabase.from("service_categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: services } = useQuery({
    queryKey: ["admin-svcs"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });

  const saveCat = useMutation({
    mutationFn: async (form: FormData) => {
      const { error } = await supabase.from("service_categories").insert({
        name: form.get("name"),
        slug: slug(String(form.get("name"))),
        description: form.get("description"),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cats"] }),
  });

  const saveSvc = useMutation({
    mutationFn: async (form: FormData) => {
      const { error } = await supabase.from("services").insert({
        name: form.get("name"),
        slug: slug(String(form.get("name"))),
        category_id: form.get("category_id"),
        description: form.get("description"),
        duration_minutes: Number(form.get("duration_minutes")),
        price_ghs: Number(form.get("price_ghs")),
        price_from: form.get("price_from") === "on",
        requires_deposit: form.get("requires_deposit") === "on",
        deposit_kind: form.get("deposit_kind"),
        deposit_value: Number(form.get("deposit_value") || 0),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-svcs"] }),
  });

  async function toggleVisible(table: "services" | "service_categories", id: string, is_visible: boolean) {
    await supabase.from(table).update({ is_visible }).eq("id", id);
    qc.invalidateQueries();
  }

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-4xl">Services & categories</h1>
      <p className="text-sm text-ink-muted">
        Add anything new here — the public site never hard-codes the menu.
      </p>

      <form
        className="card space-y-3 rounded-3xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          saveCat.mutate(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <h2 className="font-serif text-2xl">New category</h2>
        <input name="name" placeholder="Name" required />
        <input name="description" placeholder="Description" />
        <button className="btn-gold" type="submit">
          Add category
        </button>
      </form>

      <ul className="space-y-2">
        {(categories ?? []).map((c) => (
          <li key={c.id} className="flex justify-between card rounded-2xl p-3">
            <span>{c.name}</span>
            <button type="button" onClick={() => toggleVisible("service_categories", c.id, !c.is_visible)}>
              {c.is_visible ? "Hide" : "Show"}
            </button>
          </li>
        ))}
      </ul>

      <form className="card space-y-3 rounded-3xl p-5" onSubmit={onSvc(saveSvc.mutate)}>
        <h2 className="font-serif text-2xl">New service</h2>
        <input name="name" placeholder="Name" required />
        <select name="category_id" required>
          <option value="">Category</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="description" placeholder="Description" />
        <input name="duration_minutes" type="number" placeholder="Duration (minutes)" required />
        <input name="price_ghs" type="number" step="0.01" placeholder="Price GHS" required />
        <label className="flex items-center gap-2 normal-case tracking-normal">
          <input type="checkbox" name="price_from" className="w-auto" /> Price is “from”
        </label>
        <label className="flex items-center gap-2 normal-case tracking-normal">
          <input type="checkbox" name="requires_deposit" className="w-auto" /> Requires deposit
        </label>
        <select name="deposit_kind">
          <option value="amount">Amount (GHS)</option>
          <option value="percent">Percent</option>
        </select>
        <input name="deposit_value" type="number" step="0.01" placeholder="Deposit value" />
        <button className="btn-gold" type="submit">
          Add service
        </button>
      </form>

      <ul className="space-y-2">
        {(services ?? []).map((s) => (
          <li key={s.id} className="flex justify-between card rounded-2xl p-3">
            <span>
              {s.name} · {s.duration_minutes} min · GHS {s.price_ghs}
            </span>
            <button type="button" onClick={() => toggleVisible("services", s.id, !s.is_visible)}>
              {s.is_visible ? "Hide" : "Show"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function onSvc(mutate: (f: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(new FormData(e.currentTarget));
    e.currentTarget.reset();
  };
}
