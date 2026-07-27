"use client";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  House,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppChrome } from "../_components/AppChrome";

const areaRows = [
  ["Gulshan", "BDT 19,800", "+6.2%", "Very high"],
  ["Banani", "BDT 17,450", "+4.8%", "High"],
  ["Baridhara", "BDT 18,900", "+5.1%", "High"],
  ["Dhanmondi", "BDT 14,200", "+3.7%", "Moderate"],
  ["Uttara", "BDT 10,850", "+2.9%", "Growing"],
];

export default function MarketPage() {
  const [period, setPeriod] = useState("6 months");

  return (
    <AppChrome active="market">
      <section className="page-intro market-page-intro">
        <div>
          <p className="page-eyebrow">HomeNet intelligence</p>
          <h1>Dhaka market pulse</h1>
          <p>Current pricing, demand, and neighborhood movement, made easier to read.</p>
        </div>
        <span className="market-update">
          <CalendarDays size={15} /> Updated July 28, 2026
        </span>
      </section>

      <section className="market-stat-grid">
        {[
          [CircleDollarSign, "Average asking price", "BDT 12,480", "per sq ft", "+4.8%"],
          [Building2, "Active verified homes", "1,284", "across Dhaka", "+8.1%"],
          [Clock3, "Median time listed", "34 days", "before agreement", "-3 days"],
          [House, "Sale-to-list ratio", "96.4%", "prime neighborhoods", "+1.2%"],
        ].map(([Icon, label, value, detail, change]) => {
          const StatIcon = Icon as typeof House;
          return (
            <article key={label as string}>
              <span>
                <StatIcon size={19} />
              </span>
              <p>{label as string}</p>
              <strong>{value as string}</strong>
              <div>
                <small>{detail as string}</small>
                <em className={(change as string).startsWith("-") ? "down" : ""}>
                  {(change as string).startsWith("-") ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {change as string}
                </em>
              </div>
            </article>
          );
        })}
      </section>

      <section className="market-dashboard-grid">
        <article className="market-chart-card">
          <div className="market-card-heading">
            <div>
              <p className="page-eyebrow">Price movement</p>
              <h2>Average asking price</h2>
            </div>
            <div className="segmented-control">
              {["3 months", "6 months", "1 year"].map((value) => (
                <button
                  type="button"
                  className={period === value ? "active" : ""}
                  onClick={() => setPeriod(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="market-line-chart" aria-label={`${period} price trend`}>
            <div className="chart-y-labels">
              <span>14k</span>
              <span>12k</span>
              <span>10k</span>
              <span>8k</span>
            </div>
            <svg viewBox="0 0 700 230" role="img" aria-label="Rising average price trend">
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#087a5b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#087a5b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,190 C65,176 92,188 145,150 C195,116 235,142 286,115 C338,87 382,100 430,73 C475,49 515,69 558,42 C610,17 648,32 700,15 L700,230 L0,230 Z"
                fill="url(#areaFill)"
              />
              <path
                d="M0,190 C65,176 92,188 145,150 C195,116 235,142 286,115 C338,87 382,100 430,73 C475,49 515,69 558,42 C610,17 648,32 700,15"
                fill="none"
                stroke="#087a5b"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
            <div className="market-chart-x">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </article>

        <aside className="market-demand-card">
          <div className="market-card-heading">
            <div>
              <p className="page-eyebrow">Demand signal</p>
              <h2>Buyer activity</h2>
            </div>
            <Info size={16} />
          </div>
          <div className="demand-orbit" aria-label="High buyer demand">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <div>
              <TrendingUp size={22} />
              <strong>High</strong>
              <small>Current demand</small>
            </div>
          </div>
          <div className="demand-bars">
            {[
              ["Apartments", 88],
              ["Houses", 66],
              ["Condos", 73],
            ].map(([label, value]) => (
              <div key={label as string}>
                <span>{label as string}</span>
                <i>
                  <b style={{ width: `${value}%` }} />
                </i>
                <strong>{value as number}%</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="area-market-section">
        <div className="section-heading">
          <div>
            <p>Neighborhood comparison</p>
            <h2>Where the market is moving</h2>
          </div>
          <Link className="text-link" href="/buy">
            Explore homes <ArrowRight size={15} />
          </Link>
        </div>
        <div className="area-market-table">
          <div className="area-row area-row-head">
            <span>Area</span>
            <span>Average per sq ft</span>
            <span>12-month change</span>
            <span>Buyer demand</span>
            <span />
          </div>
          {areaRows.map(([area, price, change, demand]) => (
            <Link href={`/buy?area=${area}`} className="area-row" key={area}>
              <strong>{area}</strong>
              <span>{price}</span>
              <em>
                <TrendingUp size={12} /> {change}
              </em>
              <span>
                <i className={`demand-dot ${demand.toLowerCase().replace(" ", "-")}`} /> {demand}
              </span>
              <ChevronRight size={15} />
            </Link>
          ))}
        </div>
      </section>

      <aside className="market-ai-note">
        <span>
          <Sparkles size={20} />
        </span>
        <div>
          <strong>What this means for your search</strong>
          <p>
            Prices are rising steadily, but verified listings in Uttara and Dhanmondi still show room to
            negotiate. HomeNet flags those opportunities in your results.
          </p>
        </div>
        <Link href="/ai-finder">
          Find my best area <ArrowRight size={15} />
        </Link>
      </aside>
    </AppChrome>
  );
}
