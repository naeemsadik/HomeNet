import { ArrowRight, DatabaseZap, HeartHandshake, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppChrome } from "../_components/AppChrome";

export default function AboutPage() {
  return (
    <AppChrome active="home">
      <section className="ai-finder-intro about-intro">
        <p className="page-eyebrow">About HomeNet</p>
        <h1>More clarity for every move.</h1>
        <p>
          HomeNet brings verified property information, local market context, and practical AI guidance
          into one calmer home-search experience.
        </p>
      </section>
      <section className="sell-step-grid about-value-grid">
        {[
          [ShieldCheck, "Verified where it matters", "Clear listing details, ownership checks, and accountable advisors."],
          [DatabaseZap, "Data with an explanation", "Pricing guidance that shows the market signals behind each range."],
          [HeartHandshake, "Human help stays close", "Local support from first shortlist through viewing and negotiation."],
        ].map(([Icon, title, copy]) => {
          const ValueIcon = Icon as typeof ShieldCheck;
          return (
            <article key={title as string}>
              <span className="step-icon">
                <ValueIcon size={21} />
              </span>
              <h3>{title as string}</h3>
              <p>{copy as string}</p>
            </article>
          );
        })}
      </section>
      <aside className="market-ai-note about-contact-card">
        <span>
          <HeartHandshake size={20} />
        </span>
        <div>
          <strong>Need help with a property decision?</strong>
          <p>Our Dhaka property team can help you plan the next practical step.</p>
        </div>
        <Link href="mailto:hello@homenet.example">
          Contact HomeNet <ArrowRight size={15} />
        </Link>
      </aside>
    </AppChrome>
  );
}
