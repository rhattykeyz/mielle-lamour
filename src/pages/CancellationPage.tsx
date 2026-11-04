import { usePublicSettings } from "@/hooks/usePublicData";
import { realValue, visibleCopy } from "@/lib/format";
import { Seo } from "@/lib/seo";

export function CancellationPage() {
  const { data: settings } = usePublicSettings();
  const policy = realValue(settings?.cancellation_policy);
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <Seo
        title="Cancellation policy"
        description="Please cancel or reschedule at least 24 hours before your appointment."
        path="/cancellation"
      />
      <h1 className="font-serif text-5xl">Cancellation policy</h1>
      <p className="mt-6 whitespace-pre-line">
        {policy ? visibleCopy(policy) : null}
      </p>
    </article>
  );
}
