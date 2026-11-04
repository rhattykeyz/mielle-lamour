import { usePublicSettings } from "@/hooks/usePublicData";
import { realValue, visibleCopy } from "@/lib/format";
import { Seo } from "@/lib/seo";

export function PrivacyPage() {
  const { data: settings } = usePublicSettings();
  const notice =
    realValue(settings?.privacy_notice) ||
    "Mielle L'Amour collects your name, phone number and optional email to confirm and remind you of your appointment.";
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <Seo title="Privacy notice" description="How Mielle L'Amour uses your information." path="/privacy" />
      <h1 className="font-serif text-5xl">Privacy notice</h1>
      <p className="mt-6 whitespace-pre-line text-ink-muted">
        {visibleCopy(notice)}
      </p>
      <p className="mt-8 text-sm">
        Ghana has a Data Protection Act (2012). Before launch, have a legal professional review this
        notice, your consent wording, how long you keep records, and whether you need to register as
        a data controller.
      </p>
    </article>
  );
}
