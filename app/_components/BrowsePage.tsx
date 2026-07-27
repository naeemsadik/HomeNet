"use client";

import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppChrome } from "./AppChrome";
import { ListingCard } from "./ListingCard";
import { allProperties, savedPropertyIds } from "../_lib/properties";

export function BrowsePage({ mode }: { mode: "buy" | "rent" }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [beds, setBeds] = useState(0);
  const [savedIds, setSavedIds] = useState(savedPropertyIds);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allProperties.filter((property) => {
      const matchesQuery =
        !normalized || `${property.title} ${property.location}`.toLowerCase().includes(normalized);
      const matchesType = type === "All types" || property.type === type;
      const matchesBeds = beds === 0 || property.beds >= beds;
      return matchesQuery && matchesType && matchesBeds;
    });
  }, [beds, query, type]);

  function toggleSaved(id: number) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  }

  function resetFilters() {
    setQuery("");
    setType("All types");
    setBeds(0);
  }

  const title = mode === "buy" ? "Homes for sale" : "Homes for rent";
  const description =
    mode === "buy"
      ? "Explore verified properties with AI-backed price guidance."
      : "Find a verified rental with clear monthly pricing and local context.";

  return (
    <AppChrome active={mode}>
      <section className="page-intro browse-intro">
        <div>
          <p className="page-eyebrow">Verified across Dhaka</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Link className="button-secondary" href={mode === "buy" ? "/rent" : "/buy"}>
          {mode === "buy" ? "View rentals" : "View homes for sale"}
        </Link>
      </section>

      <form className="browse-search-panel" onSubmit={(event) => event.preventDefault()}>
        <label>
          <MapPin size={18} />
          <span className="sr-only">Search by location</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search area, neighborhood, or property"
          />
        </label>
        <label>
          <Building2 size={17} />
          <span className="sr-only">Property type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option>All types</option>
            <option>Apartment</option>
            <option>House</option>
            <option>Condo</option>
          </select>
          <ChevronDown size={14} />
        </label>
        <button type="submit" className="button-primary">
          <Search size={16} /> Search
        </button>
      </form>

      <div className="browse-toolbar">
        <div>
          <strong>{results.length} properties</strong>
          <span>AI-ranked for trust and fair value</span>
        </div>
        <div>
          <button
            type="button"
            className="mobile-filter-button"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
          <div className="view-toggle" aria-label="Result layout">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <Grid2X2 size={15} />
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="browse-layout">
        <button
          type="button"
          className={filtersOpen ? "filter-overlay is-open" : "filter-overlay"}
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
        />
        <aside className={filtersOpen ? "filter-panel is-open" : "filter-panel"}>
          <div className="filter-panel-heading">
            <strong>Filter homes</strong>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X size={17} />
            </button>
          </div>
          <div className="filter-group">
            <span>Bedrooms</span>
            <div className="option-row">
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  type="button"
                  key={count}
                  className={beds === count ? "active" : ""}
                  onClick={() => setBeds(count)}
                >
                  {count === 0 ? "Any" : `${count}+`}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span>{mode === "buy" ? "Price range" : "Monthly rent"}</span>
            <div className="price-inputs">
              <label>
                <span>Minimum</span>
                <input placeholder={mode === "buy" ? "BDT 80 Lac" : "BDT 35,000"} />
              </label>
              <label>
                <span>Maximum</span>
                <input placeholder={mode === "buy" ? "BDT 6 Cr" : "BDT 250,000"} />
              </label>
            </div>
          </div>
          <div className="filter-group filter-checks">
            <span>Property confidence</span>
            {["AI verified price", "Verified ownership", "Ready to move"].map((label) => (
              <label key={label}>
                <input type="checkbox" defaultChecked={label === "AI verified price"} />
                <span className="check-box">
                  <Check size={11} />
                </span>
                {label}
              </label>
            ))}
          </div>
          <button type="button" className="reset-filter" onClick={resetFilters}>
            Reset all filters
          </button>
        </aside>

        <section className={view === "list" ? "browse-results is-list" : "browse-results"}>
          {results.length ? (
            results.map((property) => (
              <ListingCard
                key={property.id}
                property={property}
                mode={mode}
                saved={savedIds.includes(property.id)}
                onSave={() => toggleSaved(property.id)}
              />
            ))
          ) : (
            <div className="browse-empty">
              <Search size={26} />
              <h2>No homes match these filters</h2>
              <p>Try a nearby area or clear one of your filters.</p>
              <button type="button" className="button-primary" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </AppChrome>
  );
}
