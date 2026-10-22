import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ownerLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/bookings/new", label: "New booking" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/admin/export", label: "Export" },
  { to: "/admin/activity", label: "Activity" },
];

const staffLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/bookings/new", label: "New booking" },
];

export function AdminLayout() {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) return <p className="p-8">Loading…</p>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!profile) {
    return (
      <div className="p-8">
        <p>This login is not linked to a staff profile yet. Ask the owner to add you.</p>
      </div>
    );
  }

  const links = profile.role === "owner" ? ownerLinks : staffLinks;

  return (
    <div className="min-h-screen bg-cream md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-gold/30 bg-pink/40 p-4 md:border-b-0 md:border-r">
        <p className="font-serif text-xl">Mielle L'Amour</p>
        <p className="text-xs uppercase tracking-widest text-gold-deep">{profile.role}</p>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 ${isActive ? "bg-gold" : "hover:bg-white"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn-ghost mt-8 !px-3 !py-2 text-sm" onClick={() => signOut()}>
          Log out
        </button>
      </aside>
      <div className="p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
