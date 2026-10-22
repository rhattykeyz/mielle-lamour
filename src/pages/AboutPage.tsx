import { FloralDivider } from "@/components/brand/Floral";
import { usePageContent, useStaff } from "@/hooks/usePublicData";
import { Seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export function AboutPage() {
  const { data: page } = usePageContent("about");
  const { data: staff } = useStaff();
  const body = page?.body ?? {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo
        title="About & team"
        description="The story and team behind Mielle L'Amour, a floral luxury salon in Accra."
        path="/about"
      />
      <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Mielle L'Amour</p>
      <h1 className="font-serif text-5xl">{body.story_title || "Our story"}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted">{body.story_body}</p>
      <FloralDivider />
      <h2 className="font-serif text-4xl">{body.team_title || "The team"}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {(staff ?? []).map((s) => {
          const photo = s.photo_url
            ? supabase.storage.from("staff").getPublicUrl(s.photo_url).data.publicUrl
            : null;
          return (
            <article key={s.id} className="card flex gap-5 rounded-3xl p-5">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-pink">
                {photo ? (
                  <img src={photo} alt={s.full_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] uppercase tracking-widest text-gold-deep">
                    Photo
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-serif text-2xl">{s.full_name}</h3>
                <p className="text-sm text-gold-deep">{s.title}</p>
                <p className="mt-2 text-sm text-ink-muted">{s.bio}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
