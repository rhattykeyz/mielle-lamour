import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HomePage } from "@/pages/HomePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { AboutPage } from "@/pages/AboutPage";
import { DiscountsPage } from "@/pages/DiscountsPage";
import { LuxuryPage } from "@/pages/LuxuryPage";
import { BookPage } from "@/pages/BookPage";
import { ConfirmedPage } from "@/pages/ConfirmedPage";
import { ContactPage } from "@/pages/ContactPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { CancellationPage } from "@/pages/CancellationPage";
import { ManageBookingPage } from "@/pages/ManageBookingPage";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { LoginPage } from "@/pages/admin/LoginPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { CalendarPage } from "@/pages/admin/CalendarPage";
import { NewBookingPage } from "@/pages/admin/NewBookingPage";
import { AdminServicesPage } from "@/pages/admin/ServicesPage";
import { AdminStaffPage } from "@/pages/admin/StaffPage";
import { AdminClientsPage } from "@/pages/admin/ClientsPage";
import { GalleryAdminPage } from "@/pages/admin/GalleryAdminPage";
import { ContentPage } from "@/pages/admin/ContentPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { ExportPage } from "@/pages/admin/ExportPage";
import { ActivityPage } from "@/pages/admin/ActivityPage";
import { RequireAccess } from "@/components/admin/RequireAccess";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/discounts" element={<DiscountsPage />} />
        <Route path="/luxury" element={<LuxuryPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/book/confirmed" element={<ConfirmedPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cancellation" element={<CancellationPage />} />
        <Route path="/manage/:token" element={<ManageBookingPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="calendar" element={<RequireAccess permission="calendar"><CalendarPage /></RequireAccess>} />
        <Route path="bookings/new" element={<RequireAccess permission="bookings"><NewBookingPage /></RequireAccess>} />
        <Route path="services" element={<RequireAccess permission="services"><AdminServicesPage /></RequireAccess>} />
        <Route path="staff" element={<RequireAccess ownerOnly><AdminStaffPage /></RequireAccess>} />
        <Route path="clients" element={<RequireAccess permission="clients"><AdminClientsPage /></RequireAccess>} />
        <Route path="gallery" element={<RequireAccess permission="gallery"><GalleryAdminPage /></RequireAccess>} />
        <Route path="content" element={<RequireAccess permission="content"><ContentPage /></RequireAccess>} />
        <Route path="settings" element={<RequireAccess permission="settings"><SettingsPage /></RequireAccess>} />
        <Route path="export" element={<RequireAccess permission="export"><ExportPage /></RequireAccess>} />
        <Route path="activity" element={<RequireAccess permission="activity"><ActivityPage /></RequireAccess>} />
      </Route>
    </Routes>
  );
}
