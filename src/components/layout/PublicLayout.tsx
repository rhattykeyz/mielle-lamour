import { Outlet } from "react-router-dom";
import { usePublicSettings } from "@/hooks/usePublicData";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function PublicLayout() {
  const { data: settings } = usePublicSettings();
  return (
    <div className="min-h-screen bg-cream">
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
  );
}
