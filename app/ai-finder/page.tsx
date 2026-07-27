"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Home,
  KeyRound,
  MapPin,
  RotateCcw,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { AppChrome } from "../_components/AppChrome";
import { ListingCard } from "../_components/ListingCard";
import { allProperties, savedPropertyIds } from "../_lib/properties";

const steps = ["Goal", "Location", "Budget", "Matches"];

export default function AiFinderPage() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("Buy a home");
  const [area, setArea] = useState("Gulshan & Banani");
  const [budget, setBudget] = useState("BDT 2–4 Cr");
  const [savedIds, setSavedIds] = useState(savedPropertyIds);

  function toggleSaved(id: number) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  }

  return (
    <AppChrome active="ai">
      <section className="ai-finder-intro">
        <span>
          <Sparkles size={23} />
        </span>
        <p className="page-eyebrow">Personalized search</p>
        <h1>Tell us what home feels right.</h1>
        <p>HomeNet will rank verified options around your priorities and explain every match.</p>
      </section>

      <section className="finder-shell">
        <div className="finder-progress">
          {steps.map((label, index) => (
            <div className={index <= step ? "active" : ""} key={label}>
              <span>{index < step ? <Check size={12} /> : index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="finder-question">
            <div className="finder-question-title">
              <Home size={19} />
              <div>
                <span>First, the big decision</span>
                <h2>What are you looking to do?</h2>
              </div>
            </div>
            <div className="finder-choice-grid two-columns">
              {[
                ["Buy a home", "Build equity in a place of your own", Home],
                ["Rent a home", "Stay flexible with a verified rental", KeyRound],
              ].map(([label, copy, Icon]) => {
                const ChoiceIcon = Icon as typeof Home;
                return (
                  <button
                    type="button"
                    className={goal === label ? "selected" : ""}
                    onClick={() => setGoal(label as string)}
                    key={label as string}
                  >
                    <span>
                      <ChoiceIcon size={21} />
                    </span>
                    <strong>{label as string}</strong>
                    <small>{copy as string}</small>
                    <i>
                      <Check size={12} />
                    </i>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="finder-question">
            <div className="finder-question-title">
              <MapPin size={19} />
              <div>
                <span>Your everyday radius</span>
                <h2>Where would you like to live?</h2>
              </div>
            </div>
            <div className="finder-choice-grid">
              {[
                ["Gulshan & Banani", "Central, connected, established"],
                ["Baridhara", "Quiet streets and diplomatic zone"],
                ["Dhanmondi", "Lakeside culture and city access"],
                ["Uttara", "Planned neighborhoods and more space"],
              ].map(([label, copy]) => (
                <button
                  type="button"
                  className={area === label ? "selected" : ""}
                  onClick={() => setArea(label)}
                  key={label}
                >
                  <span>
                    <Building2 size={21} />
                  </span>
                  <strong>{label}</strong>
                  <small>{copy}</small>
                  <i>
                    <Check size={12} />
                  </i>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="finder-question">
            <div className="finder-question-title">
              <WalletCards size={19} />
              <div>
                <span>A comfortable range</span>
                <h2>What budget should we work within?</h2>
              </div>
            </div>
            <div className="finder-choice-grid">
              {(goal === "Rent a home"
                ? ["Under BDT 70k", "BDT 70k–120k", "BDT 120k–180k", "BDT 180k+"]
                : ["Under BDT 2 Cr", "BDT 2–4 Cr", "BDT 4–6 Cr", "BDT 6 Cr+"]
              ).map((label) => (
                <button
                  type="button"
                  className={budget === label ? "selected compact" : "compact"}
                  onClick={() => setBudget(label)}
                  key={label}
                >
                  <strong>{label}</strong>
                  <small>Show homes in this range</small>
                  <i>
                    <Check size={12} />
                  </i>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="finder-results">
            <div className="finder-result-summary">
              <span>
                <Sparkles size={22} />
              </span>
              <div>
                <p className="page-eyebrow">Your strongest matches</p>
                <h2>Homes aligned with your priorities</h2>
                <p>
                  {goal} around {area}, within {budget}. Ranked by value, verification, and livability.
                </p>
              </div>
              <button type="button" onClick={() => setStep(0)}>
                <RotateCcw size={14} /> Start over
              </button>
            </div>
            <div className="property-grid">
              {allProperties.slice(0, 3).map((property) => (
                <ListingCard
                  key={property.id}
                  property={property}
                  mode={goal === "Rent a home" ? "rent" : "buy"}
                  saved={savedIds.includes(property.id)}
                  onSave={() => toggleSaved(property.id)}
                />
              ))}
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="finder-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={() => setStep((current) => Math.min(3, current + 1))}
            >
              {step === 2 ? "Build my matches" : "Continue"} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>
    </AppChrome>
  );
}
