"use client";

import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  Bell,
  BriefcaseBusiness,
  Building2,
  Camera,
  ChartNoAxesCombined,
  CircleHelp,
  Heart,
  Home,
  House,
  KeyRound,
  LandPlot,
  MapPin,
  Menu,
  MessageSquareText,
  Search,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type ActivePage = "home" | "buy" | "rent" | "saved" | "sell" | "ai" | "market" | "property";

const shellNav: { label: string; href: string; icon: LucideIcon; key: ActivePage }[] = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Buy a home", href: "/buy", icon: Search, key: "buy" },
  { label: "Rent a home", href: "/rent", icon: KeyRound, key: "rent" },
  { label: "Saved homes", href: "/saved", icon: Heart, key: "saved" },
  { label: "Sell property", href: "/sell", icon: LandPlot, key: "sell" },
  { label: "AI finder", href: "/ai-finder", icon: Sparkles, key: "ai" },
];

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="HomeNet home">
      <span className="brand-mark">
        <House size={18} strokeWidth={2.4} />
      </span>
      <span>HomeNet</span>
    </Link>
  );
}

export function AppChrome({ children, active }: { children: ReactNode; active: ActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="app-shell">
      <button
        type="button"
        className={menuOpen ? "mobile-overlay is-open" : "mobile-overlay"}
        aria-label="Close navigation"
        onClick={() => setMenuOpen(false)}
      />
      <aside className={menuOpen ? "sidebar is-open" : "sidebar"}>
        <div className="sidebar-top">
          <Brand />
          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>
        <nav className="side-nav" aria-label="Primary navigation">
          <p>Explore</p>
          {shellNav.map(({ label, href, icon: Icon, key }) => (
            <Link
              className={active === key ? "active" : ""}
              href={href}
              key={key}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {key === "ai" && <span className="nav-badge">New</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="ai-side-card">
          <Sparkles size={19} />
          <strong>Know the fair price</strong>
          <p>Our AI checks 20+ market signals before you make an offer.</p>
          <Link href="/ai-finder">
            Check a property <ArrowRight size={14} />
          </Link>
        </div>
        <Link className="support-link" href="/about">
          <CircleHelp size={18} /> Help &amp; support
        </Link>
      </aside>

      <div className="page-column">
        <header className="topbar">
          <div className="mobile-brand-row">
            <button
              type="button"
              className="icon-button menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <Brand />
          </div>
          <div className="location-switcher">
            <MapPin size={16} />
            <span>Dhaka, Bangladesh</span>
          </div>
          <nav className="top-links" aria-label="Account actions">
            <Link href="/buy">For buyers</Link>
            <Link href="/market">Market insights</Link>
            <Link href="/sell" className="list-button">
              List property
            </Link>
            <div className="notification-wrap">
              <button
                type="button"
                className="icon-button notification-button"
                aria-label="Open notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={19} />
                <span />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <strong>Property update</strong>
                  <p>A saved home in Banani has a newly verified price.</p>
                </div>
              )}
            </div>
            <Link className="avatar" href="/saved" aria-label="Open profile">
              <UserRound size={18} />
            </Link>
          </nav>
        </header>

        <main className="inner-page-main">{children}</main>

        <footer id="footer">
          <div className="footer-grid">
            <div className="footer-about">
              <Brand />
              <p>Property decisions, backed by clearer data and local expertise.</p>
              <div className="social-links">
                <a href="#footer" aria-label="Community">
                  <AtSign size={17} />
                </a>
                <a href="#footer" aria-label="Photo updates">
                  <Camera size={17} />
                </a>
                <a href="#footer" aria-label="Professional network">
                  <BriefcaseBusiness size={17} />
                </a>
                <a href="#footer" aria-label="Chat with HomeNet">
                  <MessageSquareText size={17} />
                </a>
              </div>
            </div>
            {[
              ["Discover", ["Buy a home", "/buy"], ["Rent a home", "/rent"], ["Saved homes", "/saved"]],
              ["Resources", ["Market insights", "/market"], ["AI finder", "/ai-finder"], ["Sell property", "/sell"]],
              ["Company", ["About HomeNet", "/about"], ["Contact", "/about"], ["Privacy", "/about"]],
            ].map(([heading, ...links]) => (
              <div className="footer-column" key={heading as string}>
                <strong>{heading as string}</strong>
                {(links as string[][]).map(([label, href]) => (
                  <Link href={href} key={label}>
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span>Copyright 2026 HomeNet. All rights reserved.</span>
            <span>Made for better property decisions.</span>
          </div>
        </footer>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/" className={active === "home" ? "active" : ""}>
            <Home size={19} />
            <span>Home</span>
          </Link>
          <Link href="/buy" className={active === "buy" || active === "rent" ? "active" : ""}>
            <Search size={19} />
            <span>Search</span>
          </Link>
          <Link href="/market" className={active === "market" ? "active" : ""}>
            <ChartNoAxesCombined size={19} />
            <span>Market</span>
          </Link>
          <Link href="/saved" className={active === "saved" ? "active" : ""}>
            <Heart size={19} />
            <span>Saved</span>
          </Link>
          <Link href="/sell" className={active === "sell" ? "active" : ""}>
            <Building2 size={19} />
            <span>List</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
