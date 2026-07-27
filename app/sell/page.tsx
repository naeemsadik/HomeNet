"use client";

import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AppChrome } from "../_components/AppChrome";

export default function SellPage() {
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppChrome active="sell">
      <section className="sell-hero">
        <div className="sell-hero-copy">
          <p className="hero-kicker">
            <Sparkles size={14} /> AI-assisted selling
          </p>
          <h1>Sell with a price buyers can trust.</h1>
          <p>
            Get a clear valuation, reach verified buyers, and manage every step from one place.
          </p>
          <div className="sell-proof-row">
            <span>
              <ShieldCheck size={16} /> Verified inquiries
            </span>
            <span>
              <Clock3 size={16} /> Faster shortlists
            </span>
          </div>
        </div>
        <form
          className="valuation-card"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <span className="valuation-icon">
              <BarChart3 size={20} />
            </span>
            <div>
              <strong>Start with a free valuation</strong>
              <p>See a data-backed range in under a minute.</p>
            </div>
          </div>
          <label>
            <span>Property address</span>
            <div>
              <MapPin size={16} />
              <input
                required
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Area, road, or building"
              />
            </div>
          </label>
          <label>
            <span>Property type</span>
            <div>
              <Building2 size={16} />
              <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
                <option>Commercial</option>
              </select>
              <ChevronDown size={14} />
            </div>
          </label>
          <button type="submit" className="button-primary">
            Get my estimate <ArrowRight size={15} />
          </button>
          {submitted && (
            <p className="valuation-result" role="status">
              <CheckCircle2 size={15} /> We found recent matches near {address}. Your valuation is ready
              for review.
            </p>
          )}
        </form>
      </section>

      <section className="sell-process">
        <div className="section-heading">
          <div>
            <p>A clearer path to sold</p>
            <h2>How HomeNet helps</h2>
          </div>
        </div>
        <div className="sell-step-grid">
          {[
            [BarChart3, "Price with evidence", "Compare recent sales, location demand, and property condition."],
            [BadgeCheck, "Publish a verified listing", "Present complete details that serious buyers can rely on."],
            [ShieldCheck, "Meet qualified buyers", "Organize viewings and offers from identity-checked prospects."],
          ].map(([Icon, title, copy], index) => {
            const StepIcon = Icon as typeof BarChart3;
            return (
              <article key={title as string}>
                <span className="step-number">0{index + 1}</span>
                <span className="step-icon">
                  <StepIcon size={21} />
                </span>
                <h3>{title as string}</h3>
                <p>{copy as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="seller-insight-card">
        <div>
          <p className="page-eyebrow">Seller intelligence</p>
          <h2>Know what is moving in your neighborhood</h2>
          <p>
            Track comparable listings, buyer interest, and average time on market before choosing your
            launch price.
          </p>
          <a className="button-secondary" href="/market">
            Open market insights <ArrowRight size={15} />
          </a>
        </div>
        <div className="seller-stat-stack">
          <div>
            <span>Average sale window</span>
            <strong>34 days</strong>
            <small>Dhaka prime areas</small>
          </div>
          <div>
            <span>Verified buyer reach</span>
            <strong>12.4k</strong>
            <small>Active this month</small>
          </div>
          <div>
            <span>AI valuation accuracy</span>
            <strong>94%</strong>
            <small>Within final sale range</small>
          </div>
        </div>
      </section>
    </AppChrome>
  );
}
