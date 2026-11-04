import { Helmet } from "react-helmet-async";
import { realValue } from "@/lib/format";

export function Seo({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}) {
  const site = (import.meta.env.VITE_SITE_URL || "https://example.com").replace(/\/$/, "");
  const url = `${site}${path}`;
  const full = title.includes("Mielle") ? title : `${title} | Mielle L'Amour`;
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Mielle L'Amour" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}

export function LocalBusinessJsonLd({
  settings,
}: {
  settings?: {
    address?: string;
    phone?: string;
    email?: string;
  } | null;
}) {
  const site = (import.meta.env.VITE_SITE_URL || "https://example.com").replace(/\/$/, "");
  const streetAddress = realValue(settings?.address);
  const telephone = realValue(settings?.phone);
  const email = realValue(settings?.email);
  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Mielle L'Amour",
    url: site,
    image: `${site}/logo.jpg`,
    ...(streetAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress,
            addressLocality: "Accra",
            addressCountry: "GH",
          },
        }
      : {}),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    priceRange: "GHS",
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
