import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { compressImage } from "@/lib/compressImage";
import { supabase } from "@/lib/supabase";

type Settings = Record<string, unknown>;

export function SettingsPage() {
  const qc = useQueryClient();
  const [data, setData] = useState<Settings>({});
  const { data: row } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_settings").select("data").eq("id", 1).single();
      if (error) throw error;
      return (data?.data ?? {}) as Settings;
    },
  });
  const { data: closures } = useQuery({
    queryKey: ["closures"],
    queryFn: async () => (await supabase.from("closures").select("*").order("starts_on")).data ?? [],
  });

  useEffect(() => {
    if (row) setData(row);
  }, [row]);

  function set(path: string, value: unknown) {
    setData((d) => ({ ...d, [path]: value }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("business_settings").update({ data, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["settings"] });
    qc.invalidateQueries({ queryKey: ["public-settings"] });
  }

  async function addClosure(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("closures").insert({
      starts_on: form.get("starts_on"),
      ends_on: form.get("ends_on"),
      reason: form.get("reason"),
    });
    e.currentTarget.reset();
    qc.invalidateQueries({ queryKey: ["closures"] });
  }

  async function uploadLogo(file: File) {
    const blob = await compressImage(file, 800, 0.92);
    const path = `logo-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("branding").upload(path, blob, { upsert: true });
    if (error) throw error;
    const url = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
    const next = { ...data, logo_url: url };
    setData(next);
    await supabase.from("business_settings").update({ data: next }).eq("id", 1);
  }

  const mm = (data.mobile_money ?? {}) as Record<string, string>;
  const hours = (data.opening_hours ?? {}) as Record<string, { label: string; open: boolean; start: string; end: string }>;

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <h1 className="font-serif text-4xl">Business settings</h1>
      <Field label="Address" value={str(data.address)} onChange={(v) => set("address", v)} />
      <Field label="Opening hours note" value={str(data.opening_hours_note)} onChange={(v) => set("opening_hours_note", v)} />
      <Field label="Phone (leave empty to hide)" value={str(data.phone)} onChange={(v) => set("phone", v)} />
      <Field label="WhatsApp (leave empty to hide)" value={str(data.whatsapp)} onChange={(v) => set("whatsapp", v)} />
      <Field label="Email" value={str(data.email)} onChange={(v) => set("email", v)} />
      <Field label="Instagram handle" value={str(data.instagram)} onChange={(v) => set("instagram", v)} />
      <Field label="TikTok handle" value={str(data.tiktok)} onChange={(v) => set("tiktok", v)} />
      <Field label="Map embed URL" value={str(data.map_embed_url)} onChange={(v) => set("map_embed_url", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Buffer minutes" type="number" value={str(data.buffer_minutes)} onChange={(v) => set("buffer_minutes", Number(v))} />
        <Field label="Min notice (minutes)" type="number" value={str(data.min_notice_minutes)} onChange={(v) => set("min_notice_minutes", Number(v))} />
        <Field label="Max advance (days)" type="number" value={str(data.max_advance_days)} onChange={(v) => set("max_advance_days", Number(v))} />
        <Field label="Cancellation window (hours)" type="number" value={str(data.cancellation_hours)} onChange={(v) => set("cancellation_hours", Number(v))} />
        <Field label="Reminder hours before" type="number" value={str(data.reminder_hours)} onChange={(v) => set("reminder_hours", Number(v))} />
        <Field label="Deposit hold (hours)" type="number" value={str(data.deposit_hold_hours)} onChange={(v) => set("deposit_hold_hours", Number(v))} />
      </div>
      <h2 className="font-serif text-2xl">Mobile Money (for deposits)</h2>
      <Field label="Network" value={mm.network ?? ""} onChange={(v) => set("mobile_money", { ...mm, network: v })} />
      <Field label="Account name" value={mm.name ?? ""} onChange={(v) => set("mobile_money", { ...mm, name: v })} />
      <Field label="Number" value={mm.number ?? ""} onChange={(v) => set("mobile_money", { ...mm, number: v })} />
      <div>
        <label htmlFor="policy">Cancellation policy</label>
        <textarea id="policy" rows={4} value={str(data.cancellation_policy)} onChange={(e) => set("cancellation_policy", e.target.value)} />
      </div>
      <div>
        <label htmlFor="privacy">Privacy notice</label>
        <textarea id="privacy" rows={5} value={str(data.privacy_notice)} onChange={(e) => set("privacy_notice", e.target.value)} />
      </div>
      <div>
        <p className="mb-2 text-sm uppercase tracking-widest text-gold-deep">Weekly hours</p>
        {Object.entries(hours).map(([k, d]) => (
          <div key={k} className="mb-2 grid grid-cols-[7rem_auto_1fr_1fr] items-center gap-2 text-sm">
            <span>{d.label}</span>
            <label className="flex items-center gap-1 normal-case tracking-normal">
              <input
                type="checkbox"
                className="w-auto"
                checked={d.open}
                onChange={(e) => set("opening_hours", { ...hours, [k]: { ...d, open: e.target.checked } })}
              />
              Open
            </label>
            <input
              type="time"
              value={d.start}
              onChange={(e) => set("opening_hours", { ...hours, [k]: { ...d, start: e.target.value } })}
            />
            <input
              type="time"
              value={d.end}
              onChange={(e) => set("opening_hours", { ...hours, [k]: { ...d, end: e.target.value } })}
            />
          </div>
        ))}
      </div>
      <label className="btn-ghost inline-block cursor-pointer">
        Upload logo (PNG or JPG)
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadLogo(f);
          }}
        />
      </label>
      <button className="btn-gold" type="submit">
        Save settings
      </button>

      <div className="card space-y-3 rounded-3xl p-5">
        <h2 className="font-serif text-2xl">Holidays & closures</h2>
        <form onSubmit={addClosure} className="space-y-2">
          <input name="starts_on" type="date" required />
          <input name="ends_on" type="date" required />
          <input name="reason" placeholder="Reason" />
          <button className="btn-gold" type="submit">
            Add closure
          </button>
        </form>
        <ul className="text-sm">
          {(closures ?? []).map((c) => (
            <li key={c.id}>
              {c.starts_on} – {c.ends_on} {c.reason}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}

function str(v: unknown) {
  return v == null ? "" : String(v);
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
