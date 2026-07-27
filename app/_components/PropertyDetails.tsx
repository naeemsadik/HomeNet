"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarCheck2,
  Check,
  ChevronRight,
  Heart,
  LandPlot,
  MapPin,
  MessageSquareText,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AppChrome } from "./AppChrome";
import { ListingCard } from "./ListingCard";
import { allProperties, propertyImages, savedPropertyIds } from "../_lib/properties";

export function PropertyDetails({ propertyId }: { propertyId: number }) {
  const property = allProperties.find((item) => item.id === propertyId) ?? allProperties[0];
  const [savedIds, setSavedIds] = useState(savedPropertyIds);
  const [messageSent, setMessageSent] = useState(false);
  const saved = savedIds.includes(property.id);
  const gallery = [property.image, propertyImages.interior, propertyImages.living, propertyImages.kitchen, propertyImages.lobby];

  function toggleSaved(id: number) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  }

  return (
    <AppChrome active="property">
      <nav className="property-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/buy">Homes for sale</Link>
        <ChevronRight size={13} />
        <Link href="/buy">{property.location.split(",")[0]}</Link>
        <ChevronRight size={13} />
        <span>{property.title}</span>
      </nav>

      <section className="property-gallery">
        {gallery.map((image, index) => (
          <button type="button" key={image} aria-label={`Open property image ${index + 1}`}>
            <Image
              src={image}
              alt={index === 0 ? property.title : "Property interior"}
              fill
              priority={index === 0}
              sizes={index === 0 ? "(max-width: 820px) 100vw, 60vw" : "22vw"}
            />
            {index === 4 && <span>View all photos</span>}
          </button>
        ))}
      </section>

      <div className="property-detail-layout">
        <article className="property-detail-content">
          <div className="property-detail-head">
            <div>
              <span className="property-detail-tag">
                <ShieldCheck size={14} /> {property.tag}
              </span>
              <h1>{property.title}</h1>
              <p>
                <MapPin size={14} /> {property.location}
              </p>
            </div>
            <div className="property-detail-actions">
              <button type="button" aria-label="Share property">
                <Share2 size={17} />
              </button>
              <button
                type="button"
                className={saved ? "is-saved" : ""}
                onClick={() => toggleSaved(property.id)}
                aria-label={saved ? "Remove from saved homes" : "Save property"}
              >
                <Heart size={17} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="property-key-details">
            <div>
              <span>Asking price</span>
              <strong>{property.price}</strong>
            </div>
            <div>
              <BedDouble size={18} />
              <strong>{property.beds}</strong>
              <span>Bedrooms</span>
            </div>
            <div>
              <Bath size={18} />
              <strong>{property.baths}</strong>
              <span>Bathrooms</span>
            </div>
            <div>
              <LandPlot size={18} />
              <strong>{property.area.replace(" sq ft", "")}</strong>
              <span>Square feet</span>
            </div>
          </div>

          <aside className="property-ai-score">
            <span>
              <Sparkles size={21} />
            </span>
            <div>
              <p className="page-eyebrow">HomeNet price intelligence</p>
              <strong>This property is priced within its fair-value range</strong>
              <p>Compared with 46 verified homes nearby and current neighborhood demand.</p>
            </div>
            <div className="score-ring">
              <strong>{property.score}</strong>
              <span>AI score</span>
            </div>
          </aside>

          <section className="property-copy-section">
            <h2>About this home</h2>
            <p>
              A carefully planned residence with generous natural light, quiet bedrooms, and a flowing
              living area designed for everyday family life. The building combines secure access with
              practical amenities and close links to schools, parks, and neighborhood services.
            </p>
            <p>
              Recent maintenance and verified documents make this a strong option for buyers looking to
              move with fewer unknowns.
            </p>
          </section>

          <section className="property-copy-section">
            <h2>Features and amenities</h2>
            <div className="amenities-grid">
              {[
                "Backup power",
                "Secure parking",
                "24-hour security",
                "Passenger lift",
                "Service lift",
                "Rooftop access",
                "Natural gas",
                "Verified ownership",
              ].map((amenity) => (
                <span key={amenity}>
                  <Check size={13} /> {amenity}
                </span>
              ))}
            </div>
          </section>
        </article>

        <aside className="inquiry-card">
          <p className="page-eyebrow">Speak with a property advisor</p>
          <h2>Interested in this home?</h2>
          <p>Ask a question or schedule a private viewing with a verified advisor.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessageSent(true);
            }}
          >
            <label>
              <span>Name</span>
              <input required placeholder="Your full name" />
            </label>
            <label>
              <span>Phone</span>
              <input required type="tel" placeholder="Phone number" />
            </label>
            <label>
              <span>Message</span>
              <textarea defaultValue={`I would like to know more about ${property.title}.`} />
            </label>
            <button type="submit" className="button-primary">
              <MessageSquareText size={15} /> Send inquiry
            </button>
          </form>
          {messageSent && (
            <p className="inquiry-success" role="status">
              <Check size={14} /> Inquiry sent. An advisor will contact you shortly.
            </p>
          )}
          <div className="inquiry-divider">
            <span>or</span>
          </div>
          <a href="tel:+8801700000000" className="button-secondary">
            <Phone size={15} /> Call property advisor
          </a>
          <button type="button" className="schedule-button">
            <CalendarCheck2 size={15} /> Schedule a viewing <ArrowRight size={14} />
          </button>
        </aside>
      </div>

      <section className="content-section similar-property-section">
        <div className="section-heading">
          <div>
            <p>Compare nearby</p>
            <h2>Similar verified homes</h2>
          </div>
          <Link className="text-link" href="/buy">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="property-grid">
          {allProperties
            .filter((item) => item.id !== property.id)
            .slice(0, 3)
            .map((item) => (
              <ListingCard
                key={item.id}
                property={item}
                saved={savedIds.includes(item.id)}
                onSave={() => toggleSaved(item.id)}
              />
            ))}
        </div>
      </section>

      <Link className="back-to-results" href="/buy">
        <ArrowLeft size={14} /> Back to search results
      </Link>
    </AppChrome>
  );
}
