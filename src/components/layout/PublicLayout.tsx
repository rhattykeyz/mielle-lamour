import { Outlet } from "react-router-dom";
import { Butterflies } from "@/components/brand/Butterflies";
import { SparkleField } from "@/components/brand/Floral";
import { usePublicSettings } from "@/hooks/usePublicData";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function PublicLayout() {
  const { data: settings } = usePublicSettings();
  return (
    <div className="public-site relative min-h-screen">
      <div className="page-scene" aria-hidden />
      <Butterflies />
      <SparkleField />
      <div className="relative z-10">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 btn-gold">
        Skip to content
      </a>
      <Header settings={settings} />
      <main id="main">
        <Outlet />
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat number={settings?.whatsapp} />
      </div>
    </div>
  );
}
