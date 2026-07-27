"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, Search, SlidersHorizontal } from "lucide-react";
import { AppChrome } from "../_components/AppChrome";
import { ListingCard } from "../_components/ListingCard";
import { allProperties, savedPropertyIds } from "../_lib/properties";
import { useMemo, useState } from "react";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState(savedPropertyIds);
  const [tab, setTab] = useState<"all" | "sale" | "rent">("all");
  const [sort, setSort] = useState("Recently saved");

  const savedHomes = useMemo(
    () => allProperties.filter((property) => savedIds.includes(property.id)),
    [savedIds],
  );
  const suggestions = allProperties.filter((property) => !savedIds.includes(property.id)).slice(0, 3);

  function toggleSaved(id: number) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  }

  return (
    <AppChrome active="saved">
      <section className="page-intro saved-intro">
        <div>
          <p className="page-eyebrow">Your collection</p>
          <h1>Saved homes</h1>
          <p>Keep your shortlist together and compare the homes that feel right.</p>
        </div>
        <div className="page-actions">
          <Link className="button-secondary" href="/">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <Link className="button-primary" href="/buy">
            Browse homes <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {savedHomes.length > 0 && (
        <section className="saved-preview-strip" aria-label="Saved home preview">
          {savedHomes.slice(0, 3).map((property) => (
            <Link href={`/property/${property.id}`} key={property.id}>
              <Image src={property.image} alt="" fill sizes="240px" />
              <span>{property.location}</span>
              <strong>{property.price}</strong>
            </Link>
          ))}
          <div className="saved-count">
            <Heart size={18} fill="currentColor" />
            <strong>{savedHomes.length}</strong>
            <span>saved homes</span>
          </div>
        </section>
      )}

      <section className="saved-content-section">
        <div className="section-heading saved-section-heading">
          <div>
            <p>Shortlisted by you</p>
            <h2>Saved properties</h2>
          </div>
          <div className="saved-tools">
            <div className="segmented-control" aria-label="Saved property type">
              {(["all", "sale", "rent"] as const).map((value) => (
                <button
                  type="button"
                  className={tab === value ? "active" : ""}
                  onClick={() => setTab(value)}
                  key={value}
                >
                  {value === "all" ? "All" : value === "sale" ? "For sale" : "For rent"}
                </button>
              ))}
            </div>
            <label className="sort-select">
              <SlidersHorizontal size={14} />
              <span className="sr-only">Sort saved homes</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option>Recently saved</option>
                <option>Price: low to high</option>
                <option>Best AI match</option>
              </select>
            </label>
          </div>
        </div>

        {savedHomes.length ? (
          <div className="saved-property-grid">
            {savedHomes.map((property) => (
              <ListingCard
                key={property.id}
                property={property}
                mode={tab === "rent" ? "rent" : "buy"}
                saved={savedIds.includes(property.id)}
                onSave={() => toggleSaved(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="saved-empty-state">
            <span>
              <Heart size={28} />
            </span>
            <h2>Your shortlist is ready for a first home</h2>
            <p>Save properties while you browse and they will appear here for easy comparison.</p>
            <Link className="button-primary" href="/buy">
              <Search size={16} /> Find a home
            </Link>
          </div>
        )}
      </section>

      <section className="content-section saved-recommendations">
        <div className="section-heading">
          <div>
            <p>Based on your shortlist</p>
            <h2>You may also like</h2>
          </div>
          <Link className="text-link" href="/buy">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="property-grid">
          {suggestions.map((property) => (
            <ListingCard
              key={property.id}
              property={property}
              saved={savedIds.includes(property.id)}
              onSave={() => toggleSaved(property.id)}
            />
          ))}
        </div>
      </section>
    </AppChrome>
  );
}
