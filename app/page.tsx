"use client";

import Image from "next/image";
import {
  ArrowRight,
  AtSign,
  Bath,
  BedDouble,
  Bell,
  BriefcaseBusiness,
  Building2,
  Camera,
  ChevronDown,
  CircleHelp,
  Compass,
  Heart,
  Home,
  House,
  KeyRound,
  LandPlot,
  MapPin,
  Menu,
  MessageSquareText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trees,
  TrendingUp,
  UserRound,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type Property = {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  tag: string;
  beds: number;
  baths: number;
  area: string;
};

const images = {
  tower:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
  house:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  interior:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  living:
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  bright:
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=85",
  apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85",
  skyline:
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=85",
  lobby:
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=85",
};

const properties: Property[] = [
  {
    id: 1,
    title: "Contemporary duplex with city views",
    location: "Gulshan 2, Dhaka",
    price: "BDT 4.8 Cr",
    image: images.house,
    tag: "AI verified",
    beds: 4,
    baths: 4,
    area: "3,240 sq ft",
  },
  {
    id: 2,
    title: "Quiet residence near the lake",
    location: "Banani, Dhaka",
    price: "BDT 3.2 Cr",
    image: images.interior,
    tag: "Best value",
    beds: 3,
    baths: 3,
    area: "2,150 sq ft",
  },
  {
    id: 3,
    title: "Sunlit family apartment",
    location: "Bashundhara R/A",
    price: "BDT 2.6 Cr",
    image: images.living,
    tag: "New",
    beds: 3,
    baths: 3,
    area: "1,980 sq ft",
  },
  {
    id: 4,
    title: "Modern home with open plan living",
    location: "Dhanmondi, Dhaka",
    price: "BDT 3.9 Cr",
    image: images.bright,
    tag: "Top rated",
    beds: 4,
    baths: 3,
    area: "2,720 sq ft",
  },
  {
    id: 5,
    title: "Smart apartment in a secure community",
    location: "Uttara, Dhaka",
    price: "BDT 1.9 Cr",
    image: images.apartment,
    tag: "High demand",
    beds: 3,
    baths: 2,
    area: "1,650 sq ft",
  },
  {
    id: 6,
    title: "Designer residence with warm interiors",
    location: "Baridhara, Dhaka",
    price: "BDT 5.1 Cr",
    image: images.lobby,
    tag: "Exclusive",
    beds: 4,
    baths: 5,
    area: "3,600 sq ft",
  },
];

const categories: { label: string; icon: LucideIcon }[] = [
  { label: "Apartments", icon: Building2 },
  { label: "Houses", icon: House },
  { label: "Condos", icon: Home },
  { label: "Land", icon: Trees },
  { label: "Commercial", icon: Store },
  { label: "Warehouses", icon: Warehouse },
];

const navItems: { label: string; icon: LucideIcon }[] = [
  { label: "Home", icon: Home },
  { label: "Buy a home", icon: Search },
  { label: "Rent a home", icon: KeyRound },
  { label: "Sell property", icon: LandPlot },
  { label: "AI finder", icon: Sparkles },
];

const neighborhoods = [
  { name: "Gulshan", image: images.tower },
  { name: "Banani", image: images.apartment },
  { name: "Baridhara", image: images.house },
  { name: "Dhanmondi", image: images.living },
  { name: "Uttara", image: images.skyline },
  { name: "Bashundhara", image: images.bright },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="HomeNet home">
      <span className="brand-mark">
        <House size={18} strokeWidth={2.4} />
      </span>
      <span>HomeNet</span>
    </a>
  );
}

function PropertyCard({
  property,
  favorite,
  onFavorite,
  feature = false,
}: {
  property: Property;
  favorite: boolean;
  onFavorite: () => void;
  feature?: boolean;
}) {
  return (
    <article className={feature ? "property-card property-card--feature" : "property-card"}>
      <div className="property-image">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes={feature ? "(max-width: 720px) 92vw, 42vw" : "(max-width: 720px) 82vw, 28vw"}
        />
        <span className="property-tag">
          <ShieldCheck size={13} />
          {property.tag}
        </span>
        <button
          className={favorite ? "favorite is-active" : "favorite"}
          type="button"
          onClick={onFavorite}
          aria-label={favorite ? "Remove from saved homes" : "Save this home"}
          aria-pressed={favorite}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
        {feature && (
          <div className="feature-caption">
            <span>{property.location}</span>
            <strong>{property.title}</strong>
            <span>{property.price}</span>
          </div>
        )}
      </div>
      {!feature && (
        <div className="property-body">
          <div className="property-topline">
            <strong>{property.price}</strong>
            <span>Est. fair</span>
          </div>
          <h3>{property.title}</h3>
          <p>
            <MapPin size={13} /> {property.location}
          </p>
          <div className="property-meta">
            <span>
              <BedDouble size={14} /> {property.beds} beds
            </span>
            <span>
              <Bath size={14} /> {property.baths} baths
            </span>
            <span>
              <LandPlot size={14} /> {property.area}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      <button type="button" className="text-link">
        View all <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("Buy");
  const [activeCategory, setActiveCategory] = useState("Apartments");
  const [searchMessage, setSearchMessage] = useState("");

  const visibleProperties = useMemo(() => {
    if (!query.trim()) return properties;
    const normalized = query.toLowerCase();
    return properties.filter((property) =>
      `${property.title} ${property.location}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id],
    );
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resultCount = visibleProperties.length;
    setSearchMessage(
      query.trim()
        ? `${resultCount} ${propertyType.toLowerCase()} option${resultCount === 1 ? "" : "s"} found near ${query}.`
        : `Showing AI-ranked homes available to ${propertyType.toLowerCase()}.`,
    );
    document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-shell" id="top">
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
          {navItems.map(({ label, icon: Icon }, index) => (
            <a
              className={index === 0 ? "active" : ""}
              href={index === 0 ? "#top" : "#recommendations"}
              key={label}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "AI finder" && <span className="nav-badge">New</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="ai-side-card">
          <Sparkles size={19} />
          <strong>Know the fair price</strong>
          <p>Our AI checks 20+ market signals before you make an offer.</p>
          <button type="button">
            Check a property <ArrowRight size={14} />
          </button>
        </div>
        <a className="support-link" href="#footer">
          <CircleHelp size={18} /> Help &amp; support
        </a>
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
            <ChevronDown size={15} />
          </div>
          <nav className="top-links" aria-label="Account actions">
            <a href="#recommendations">For buyers</a>
            <a href="#market">Market insights</a>
            <button type="button" className="list-button">
              List property
            </button>
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
                  <p>A saved home in Banani has a new verified price.</p>
                </div>
              )}
            </div>
            <button className="avatar" type="button" aria-label="Open profile">
              <UserRound size={18} />
            </button>
          </nav>
        </header>

        <main>
          <section className="hero" aria-labelledby="hero-title">
            <Image
              src={images.tower}
              alt="Modern city architecture"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 720px) 100vw, 85vw"
            />
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="hero-kicker">
                <Sparkles size={14} /> AI-powered home search
              </p>
              <h1 id="hero-title">Find a home you can trust, priced by AI.</h1>
              <p className="hero-copy">
                Search verified properties, compare fair values, and move with confidence.
              </p>
              <form className="search-box" onSubmit={handleSearch}>
                <label className="search-field">
                  <MapPin size={19} />
                  <span className="sr-only">Search location</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Area, neighborhood, or property"
                  />
                </label>
                <label className="type-field">
                  <span className="sr-only">Property transaction type</span>
                  <select
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                  >
                    <option>Buy</option>
                    <option>Rent</option>
                  </select>
                  <ChevronDown size={15} />
                </label>
                <button type="submit" className="search-button">
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </form>
              <div className="quick-searches">
                <span>Popular:</span>
                {[
                  "Gulshan",
                  "Banani",
                  "Dhanmondi",
                ].map((area) => (
                  <button type="button" key={area} onClick={() => setQuery(area)}>
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="category-strip" aria-label="Property categories">
            {categories.map(({ label, icon: Icon }) => (
              <button
                type="button"
                key={label}
                className={activeCategory === label ? "is-active" : ""}
                onClick={() => setActiveCategory(label)}
              >
                <span>
                  <Icon size={20} />
                </span>
                {label}
              </button>
            ))}
          </section>

          <section className="content-section featured-section">
            <SectionHeader eyebrow="Handpicked for you" title="Featured properties" />
            <div className="featured-grid">
              {properties.slice(0, 2).map((property) => (
                <PropertyCard
                  feature
                  key={property.id}
                  property={property}
                  favorite={favorites.includes(property.id)}
                  onFavorite={() => toggleFavorite(property.id)}
                />
              ))}
            </div>
          </section>

          <aside className="trust-banner">
            <span className="trust-icon">
              <Sparkles size={20} />
            </span>
            <div>
              <strong>Buy with a clearer view of value</strong>
              <p>
                HomeNet compares location, amenities, demand, and recent sales to flag fair prices.
              </p>
            </div>
            <button type="button">
              How AI pricing works <ArrowRight size={15} />
            </button>
          </aside>

          <section className="content-section" id="recommendations">
            <SectionHeader eyebrow={`Selected category: ${activeCategory}`} title="Recommended for you" />
            {searchMessage && (
              <p className="search-result" role="status">
                <SlidersHorizontal size={15} /> {searchMessage}
              </p>
            )}
            <div className="property-grid">
              {(visibleProperties.length ? visibleProperties.slice(0, 3) : properties.slice(0, 3)).map(
                (property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    favorite={favorites.includes(property.id)}
                    onFavorite={() => toggleFavorite(property.id)}
                  />
                ),
              )}
            </div>
          </section>

          <section className="content-section">
            <SectionHeader eyebrow="Homes moving this week" title="Trending near you" />
            <div className="property-grid">
              {properties.slice(3, 6).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  favorite={favorites.includes(property.id)}
                  onFavorite={() => toggleFavorite(property.id)}
                />
              ))}
            </div>
          </section>

          <section className="content-section">
            <SectionHeader eyebrow="Explore the city" title="Popular neighborhoods" />
            <div className="neighborhood-row">
              {neighborhoods.map((neighborhood) => (
                <button type="button" className="neighborhood" key={neighborhood.name}>
                  <Image
                    src={neighborhood.image}
                    alt=""
                    fill
                    sizes="160px"
                  />
                  <span>{neighborhood.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="market-section" id="market">
            <div className="market-heading">
              <div>
                <p>HomeNet intelligence</p>
                <h2>Dhaka market pulse</h2>
              </div>
              <span>Updated this week</span>
            </div>
            <div className="market-grid">
              <div className="trend-card">
                <div className="trend-topline">
                  <div>
                    <span>Average asking price</span>
                    <strong>BDT 12,480</strong>
                    <small>per sq ft</small>
                  </div>
                  <span className="trend-up">
                    <TrendingUp size={15} /> 4.8%
                  </span>
                </div>
                <div className="chart" aria-label="Six month market price chart">
                  {[38, 48, 45, 62, 72, 88, 81, 96, 106, 120, 132, 146].map((height, index) => (
                    <span key={index} style={{ height: `${height}px` }} />
                  ))}
                </div>
                <div className="chart-labels">
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>
              <div className="market-list">
                {[
                  ["Homes for sale", "1,284", Compass],
                  ["Median time listed", "34 days", Bell],
                  ["Buyer competition", "High", TrendingUp],
                  ["AI fair-price matches", "86%", ShieldCheck],
                ].map(([label, value, Icon]) => {
                  const MarketIcon = Icon as LucideIcon;
                  return (
                    <div key={label as string}>
                      <span className="market-list-icon">
                        <MarketIcon size={17} />
                      </span>
                      <span>{label as string}</span>
                      <strong>{value as string}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="content-section article-section">
            <SectionHeader eyebrow="Learn before you move" title="Latest property guides" />
            <div className="article-grid">
              {[
                ["A practical guide to buying your first apartment", images.apartment, "8 min read"],
                ["Five details to check before making an offer", images.interior, "6 min read"],
                ["What Dhaka home values are telling us now", images.skyline, "5 min read"],
              ].map(([title, image, readTime]) => (
                <article className="article-card" key={title}>
                  <div className="article-image">
                    <Image src={image} alt="" fill sizes="(max-width: 720px) 82vw, 28vw" />
                  </div>
                  <div>
                    <span>{readTime}</span>
                    <h3>{title}</h3>
                    <a href="#top" aria-label={`Read ${title}`}>
                      Read guide <ArrowRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer id="footer">
          <div className="footer-grid">
            <div className="footer-about">
              <Brand />
              <p>Property decisions, backed by clearer data and local expertise.</p>
              <div className="social-links">
                <a href="#top" aria-label="Facebook">
                  <AtSign size={17} />
                </a>
                <a href="#top" aria-label="Instagram">
                  <Camera size={17} />
                </a>
                <a href="#top" aria-label="LinkedIn">
                  <BriefcaseBusiness size={17} />
                </a>
                <a href="#top" aria-label="Chat with HomeNet">
                  <MessageSquareText size={17} />
                </a>
              </div>
            </div>
            {[
              ["Discover", "Buy a home", "Rent a home", "New projects", "Neighborhoods"],
              ["Resources", "Market insights", "Buyer guide", "Seller guide", "Home valuation"],
              ["Company", "About HomeNet", "Careers", "Contact", "Privacy"],
            ].map(([heading, ...links]) => (
              <div className="footer-column" key={heading}>
                <strong>{heading}</strong>
                {links.map((link) => (
                  <a href="#top" key={link}>
                    {link}
                  </a>
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
          <a href="#top" className="active">
            <Home size={19} />
            <span>Home</span>
          </a>
          <a href="#recommendations">
            <Search size={19} />
            <span>Search</span>
          </a>
          <a href="#market">
            <TrendingUp size={19} />
            <span>Market</span>
          </a>
          <button type="button" onClick={() => setNotificationsOpen((open) => !open)}>
            <Heart size={19} />
            <span>Saved</span>
          </button>
          <button type="button">
            <UserRound size={19} />
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
