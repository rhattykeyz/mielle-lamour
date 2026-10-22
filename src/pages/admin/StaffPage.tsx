import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compressImage } from "@/lib/compressImage";
import { supabase } from "@/lib/supabase";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminStaffPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: staff } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => (await supabase.from("staff").select("*").order("sort_order")).data ?? [],
  });
  const { data: services } = useQuery({
    queryKey: ["admin-svcs"],
    queryFn: async () => (await supabase.from("services").select("id,name").order("name")).data ?? [],
  });
  const { data: offered } = useQuery({
    queryKey: ["staff-svcs", selected],
    enabled: !!selected,
    queryFn: async () =>
      (await supabase.from("staff_services").select("service_id").eq("staff_id", selected!)).data ?? [],
  });
  const { data: hours } = useQuery({
    queryKey: ["staff-hours", selected],
    enabled: !!selected,
    queryFn: async () =>
      (await supabase.from("staff_working_hours").select("*").eq("staff_id", selected!)).data ?? [],
  });
  const { data: timeOff } = useQuery({
    queryKey: ["staff-off", selected],
    enabled: !!selected,
    queryFn: async () =>
      (await supabase.from("staff_time_off").select("*").eq("staff_id", selected!).order("starts_on")).data ??
      [],
  });

  const create = useMutation({
    mutationFn: async (form: FormData) => {
      const { error } = await supabase.from("staff").insert({
        full_name: form.get("full_name"),
        slug: String(form.get("full_name"))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
        title: form.get("title"),
        bio: form.get("bio"),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-staff"] }),
  });

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await create.mutateAsync(new FormData(e.currentTarget));
    e.currentTarget.reset();
  }

  async function toggleService(serviceId: string, on: boolean) {
    if (!selected) return;
    if (on) await supabase.from("staff_services").insert({ staff_id: selected, service_id: serviceId });
    else
      await supabase.from("staff_services").delete().eq("staff_id", selected).eq("service_id", serviceId);
    qc.invalidateQueries({ queryKey: ["staff-svcs", selected] });
  }

  async function saveHours(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = new FormData(e.currentTarget);
    for (let weekday = 0; weekday < 7; weekday++) {
      await supabase.from("staff_working_hours").upsert(
        {
          staff_id: selected,
          weekday,
          start_time: form.get(`start-${weekday}`),
          end_time: form.get(`end-${weekday}`),
          is_off: form.get(`off-${weekday}`) === "on",
        },
        { onConflict: "staff_id,weekday" },
      );
    }
    qc.invalidateQueries({ queryKey: ["staff-hours", selected] });
  }

  async function addTimeOff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = new FormData(e.currentTarget);
    await supabase.from("staff_time_off").insert({
      staff_id: selected,
      starts_on: form.get("starts_on"),
      ends_on: form.get("ends_on"),
      reason: form.get("reason"),
    });
    e.currentTarget.reset();
    qc.invalidateQueries({ queryKey: ["staff-off", selected] });
  }

  async function uploadPhoto(file: File) {
    if (!selected) return;
    const blob = await compressImage(file, 900, 0.85);
    const path = `${selected}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("staff").upload(path, blob, { upsert: true });
    if (error) throw error;
    await supabase.from("staff").update({ photo_url: path }).eq("id", selected);
    qc.invalidateQueries({ queryKey: ["admin-staff"] });
  }

  const current = (staff ?? []).find((s) => s.id === selected);
  const offeredIds = new Set((offered ?? []).map((o) => o.service_id));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="font-serif text-4xl">Staff</h1>
        <form onSubmit={onCreate} className="card mt-4 space-y-3 rounded-3xl p-5">
          <h2 className="font-serif text-2xl">Add team member</h2>
          <input name="full_name" placeholder="Full name" required />
          <input name="title" placeholder="Title" />
          <textarea name="bio" placeholder="Bio" />
          <button className="btn-gold" type="submit">
            Add
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {(staff ?? []).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`card w-full rounded-2xl p-3 text-left ${selected === s.id ? "ring-1 ring-gold" : ""}`}
                onClick={() => setSelected(s.id)}
              >
                {s.full_name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {current && (
        <div className="space-y-6">
          <h2 className="font-serif text-3xl">{current.full_name}</h2>
          <label className="btn-ghost inline-block cursor-pointer">
            Upload photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPhoto(f);
              }}
            />
          </label>
          <div>
            <h3 className="font-serif text-xl">Services they offer</h3>
            {(services ?? []).map((s) => (
              <label key={s.id} className="mt-1 flex items-center gap-2 normal-case tracking-normal">
                <input
                  type="checkbox"
                  className="w-auto"
                  checked={offeredIds.has(s.id)}
                  onChange={(e) => toggleService(s.id, e.target.checked)}
                />
                {s.name}
              </label>
            ))}
          </div>
          <form onSubmit={saveHours} className="card space-y-2 rounded-3xl p-5">
            <h3 className="font-serif text-xl">Working hours</h3>
            {days.map((label, weekday) => {
              const row = (hours ?? []).find((h) => h.weekday === weekday);
              return (
                <div key={weekday} className="grid grid-cols-[7rem_1fr_1fr_auto] items-center gap-2 text-sm">
                  <span>{label}</span>
                  <input name={`start-${weekday}`} type="time" defaultValue={row?.start_time ?? "09:00"} />
                  <input name={`end-${weekday}`} type="time" defaultValue={row?.end_time ?? "18:00"} />
                  <label className="flex items-center gap-1 normal-case tracking-normal">
                    <input
                      type="checkbox"
                      name={`off-${weekday}`}
                      className="w-auto"
                      defaultChecked={row?.is_off}
                    />
                    Off
                  </label>
                </div>
              );
            })}
            <button className="btn-gold" type="submit">
              Save hours
            </button>
          </form>
          <form onSubmit={addTimeOff} className="card space-y-2 rounded-3xl p-5">
            <h3 className="font-serif text-xl">Days off</h3>
            <input name="starts_on" type="date" required />
            <input name="ends_on" type="date" required />
            <input name="reason" placeholder="Reason" />
            <button className="btn-gold" type="submit">
              Add time off
            </button>
            <ul className="text-sm">
              {(timeOff ?? []).map((t) => (
                <li key={t.id}>
                  {t.starts_on} – {t.ends_on} {t.reason}
                </li>
              ))}
            </ul>
          </form>
        </div>
      )}
    </div>
  );
}
