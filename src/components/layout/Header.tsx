import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { realValue, waLink } from "@/lib/format";
import type { PublicSettings } from "@/types";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/discounts", label: "Discounts" },
  { to: "/contact", label: "Contact" },
];

function linkClass(isActive: boolean) {
  return isActive ? "nav-link is-active" : "nav-link";
}

export function Header({ settings }: { settings?: PublicSettings }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const linksRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [hoverEl, setHoverEl] = useState<HTMLAnchorElement | null>(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, on: false });
  const [isScrolled, setIsScrolled] = useState(false);

  const syncIndicator = useCallback(() => {
    const root = linksRef.current;
    if (!root) return;
    const hovered = hoverEl && root.contains(hoverEl) ? hoverEl : null;
    const active = root.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
    const target = hovered ?? active;
    if (!target) {
      setIndicator((current) => (current.on ? { x: 0, w: 0, on: false } : current));
      return;
    }
    const next = { x: target.offsetLeft, w: target.offsetWidth, on: true };
    setIndicator((current) =>
      current.x === next.x && current.w === next.w && current.on ? current : next
    );
  }, [hoverEl]);

  useLayoutEffect(() => {
    syncIndicator();
  }, [syncIndicator, location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = linksRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => syncIndicator());
    observer.observe(root);
    document.fonts?.ready.then(() => syncIndicator()).catch(() => undefined);
    return () => observer.disconnect();
  }, [syncIndicator]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useLayoutEffect(() => {
    const nav = mobileRef.current;
    if (!nav) return;
    if (open) nav.removeAttribute("inert");
    else nav.setAttribute("inert", "");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header sticky top-0 z-40${isScrolled ? " is-scrolled" : ""}`}>
      <div className="chanel-bar">
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle chanel-menu lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <Logo logoUrl={settings?.logo_url} center />
        <nav className="chanel-nav" aria-label="Primary">
          <div
            ref={linksRef}
            className="nav-links relative flex items-center"
            onMouseLeave={() => setHoverEl(null)}
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => linkClass(isActive)}
                onMouseEnter={(event) => setHoverEl(event.currentTarget)}
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/book"
              className="btn-gold nav-book"
              onMouseEnter={(event) => setHoverEl(event.currentTarget)}
            >
              <span>Book now</span>
            </NavLink>
            <span
              className="nav-indicator"
              style={{
                width: indicator.w,
                transform: `translate3d(${indicator.x}px, 0, 0)`,
                opacity: indicator.on ? 1 : 0,
              }}
              aria-hidden="true"
            />
          </div>
        </nav>
      </div>
      <div className={`site-menu-panel lg:hidden${open ? " is-open" : ""}`}>
        <div className="site-menu-clip">
          <nav
            ref={mobileRef}
            id="mobile-nav"
            className="site-menu"
            aria-label="Mobile"
            aria-hidden={open ? undefined : true}
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) => linkClass(isActive)}
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/book"
              onClick={() => setOpen(false)}
              className="btn-gold nav-book"
            >
              <span>Book now</span>
            </NavLink>
            {realValue(settings?.whatsapp) ? (
              <a href={waLink(realValue(settings?.whatsapp))} className="nav-link">
                WhatsApp
              </a>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
