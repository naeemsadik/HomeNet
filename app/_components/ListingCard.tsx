"use client";

import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Heart, LandPlot, MapPin, ShieldCheck } from "lucide-react";
import type { Property } from "../_lib/properties";

export function ListingCard({
  property,
  saved,
  onSave,
  mode = "buy",
}: {
  property: Property;
  saved: boolean;
  onSave: () => void;
  mode?: "buy" | "rent";
}) {
  return (
    <article className="property-card shared-listing-card">
      <div className="property-image">
        <Link href={`/property/${property.id}`} aria-label={`View ${property.title}`}>
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-width: 600px) 78vw, (max-width: 900px) 42vw, 28vw"
          />
        </Link>
        <span className="property-tag">
          <ShieldCheck size={13} />
          {property.tag}
        </span>
        <button
          className={saved ? "favorite is-active" : "favorite"}
          type="button"
          onClick={onSave}
          aria-label={saved ? "Remove from saved homes" : "Save this home"}
          aria-pressed={saved}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="property-body">
        <div className="property-topline">
          <strong>{mode === "rent" ? property.monthlyPrice : property.price}</strong>
          <span>{property.score}% match</span>
        </div>
        <h3>
          <Link href={`/property/${property.id}`}>{property.title}</Link>
        </h3>
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
    </article>
  );
}
