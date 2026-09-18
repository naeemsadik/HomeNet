/**
 * Central copy repository for the HomeNet Product Landing Page.
 *
 * All text is centralized here for consistency, easy review, and swappable market claims.
 */

/**
 * Hero Headline.
 *
 * Fully-verifiable default: "The verified way to find property in Bangladesh."
 *
 * Note on "Bangladesh's first AI-powered property marketplace":
 * Requires confirmation of market precedence and legal review.
 * Swap here once confirmed without touching any component layout.
 */
export const HERO_HEADLINE = "The verified way to find property in Bangladesh.";

// MARKET POSITION CLAIM — DISABLED PENDING BUSINESS APPROVAL.
// Cannot be substantiated from the repository. Set `approved: true` ONLY on
// explicit business confirmation.
export const MARKET_POSITION_CLAIM = {
  approved: false,
  text: "Bangladesh's first AI property marketplace",
} as const;

export const AI_DEMO_SCRIPT = {
  inputText:
    "3 bedroom apartment in Gulshan 2, 1800 sqft, south facing, 4th floor, lift and generator, 2.5 crore",
  parsedOutput: {
    title: "3-Bed Apartment in Gulshan 2",
    description:
      "Well-appointed 3-bedroom, 3-bathroom residential apartment situated on the 4th floor in Gulshan 2, Dhaka. Spanning 1800 sqft with south-facing orientation, featuring dedicated lift access and full standby generator support.",
    type: "residential" as const,
    subtype: "apartment",
    listingType: "sale" as const,
    priceRaw: "2.5 crore",
    priceBDT: "25000000",
    priceDisplay: "BDT 25,000,000",
    areaSize: "1800",
    areaUnit: "sqft" as const,
    bedrooms: "3",
    bathrooms: "3",
    floor: "4",
    facing: "south",
    address: "Gulshan 2, Dhaka",
    amenities: {
      lift: true,
      generator: true,
      parking: false,
      security: false,
      gas: false,
      cctv: false,
    },
    confidence: {
      title: "high" as const,
      description: "high" as const,
      type: "high" as const,
      subtype: "high" as const,
      listingType: "high" as const,
      price: "high" as const,
      areaSize: "high" as const,
      areaUnit: "high" as const,
      bedrooms: "high" as const,
      bathrooms: "high" as const,
      floor: "high" as const,
      facing: "low" as const,
      address: "high" as const,
    },
  },
};

export const landingCopy = {
  hero: {
    eyebrow: "Property marketplace · Bangladesh",
    headline: HERO_HEADLINE,
    subtitle:
      "Search verified apartments, houses, land and commercial space with direct owner contact. Or list in under a minute — paste a plain description, and HomeNet fills 14 fields for you.",
    primaryCta: "Explore properties",
    secondaryCta: "List your property",
    reassurance:
      "Free to browse · Free to list · Paste your description to list in seconds",
    previewLabel: "Live platform interface preview",
  },
  identity: {
    statement:
      "HomeNet is a property marketplace for Bangladesh. Owners list directly, listings are verified before they appear, and seekers contact owners with no intermediary.",
    cards: [
      {
        title: "Search",
        description:
          "Apartments, houses, land, commercial space and parking. Available for sale or to rent across Dhaka.",
      },
      {
        title: "Verified",
        description:
          "Listings are checked before they go live. Incomplete entries with missing photos or coordinates never publish.",
      },
      {
        title: "Direct",
        description:
          "Genuine owner contact details on every listing. Connect straight to the owner with zero broker commission.",
      },
    ],
  },
  scale: {
    eyebrow: "Platform Scale",
    title: "A growing marketplace built on real inventory",
    qualitativeFallback:
      "Every listing verified before publication · Complete photos and exact location required · Direct owner contact · Free to list",
  },
  problem: {
    eyebrow: "The Problem We Solve",
    title: "Property discovery in Bangladesh is broken. HomeNet fixes it.",
    withoutTitle: "Without HomeNet",
    withoutItems: [
      "Listings scattered across disorganized Facebook groups and unverified broker lists",
      "No way to distinguish genuine listings from expired, fake, or ghost ads",
      "Incomplete posts missing floor plans, clear photos, or accurate addresses",
      "Every single inquiry routed through a broker demanding high commissions",
    ],
    withTitle: "With HomeNet",
    withItems: [
      "One centralized, structured database with precise neighborhood filtering",
      "Strict verification gate — unverified properties are never published publicly",
      "Mandatory completeness: clear photos, exact coordinates, and verified amenities",
      "Direct owner contact on every card — zero intermediary fees or commissions",
    ],
  },
  howItWorks: {
    eyebrow: "How HomeNet Works",
    title: "Simple, transparent workflows for seekers and owners",
    seekers: {
      title: "For Property Seekers",
      steps: [
        {
          num: "01",
          title: "Search your target area",
          desc: "Filter by 26 Dhaka areas, property category, price range, or map radius.",
        },
        {
          num: "02",
          title: "Compare verified options",
          desc: "Inspect verified badges, view counts, photo galleries, and price per sqft.",
        },
        {
          num: "03",
          title: "Examine full details",
          desc: "Access exact GPS coordinates, all photos, floor level, and listed amenities.",
        },
        {
          num: "04",
          title: "Contact the owner directly",
          desc: "Reach the property owner straight from the listing without any broker.",
        },
      ],
    },
    owners: {
      title: "For Property Owners",
      steps: [
        {
          num: "01",
          title: "Describe in your own words",
          desc: "Type or paste a plain description. HomeNet converts crore and lakh into figures, detects katha and sqft, and extracts 14 fields in seconds.",
        },
        {
          num: "02",
          title: "Review details & media",
          desc: "Add high-resolution photos, confirm floor, facing, and specific amenities.",
        },
        {
          num: "03",
          title: "Submit for verification",
          desc: "Our automated completeness check validates address, coordinates, and media.",
        },
        {
          num: "04",
          title: "Go live with zero fee",
          desc: "Your listing goes active to thousands of seekers with 0 BDT listing fee.",
        },
      ],
    },
  },
  features: {
    eyebrow: "Platform Capabilities",
    title: "Engineered specifically for Bangladeshi real estate",
    items: [
      {
        tag: "Location Intelligence",
        title: "Area-aware Dhaka hierarchy",
        desc: "Structured two-level hierarchy covering 26 Dhaka neighborhoods from Gulshan down to Gulshan-1, Banani, Dhanmondi, and Uttara.",
      },
      {
        tag: "Proximity Search",
        title: "Exact radius distance filtering",
        desc: "Search within 1 to 50 km of any coordinate on the map using fast Haversine calculations.",
      },
      {
        tag: "Custom Filters",
        title: "Filters that match how you think",
        desc: "Filter by intent (sale/rent), category, price bands, area size, verified status, or sort by views and price.",
      },
      {
        tag: "Quality Enforced",
        title: "Mandatory listing completeness",
        desc: "A listing cannot reach active status without photos, full address, GPS coordinates, and verified specs.",
      },
      {
        tag: "Instant Listing",
        title: "Understands Bangladeshi property language",
        desc: "Paste a natural description — HomeNet converts crore and lakh into figures, parses katha and bigha, and extracts Dhaka amenities without manual form filling.",
      },
      {
        tag: "Versatile Taxonomy",
        title: "Four distinct property categories",
        desc: "Support for residential apartments, commercial offices, land plots, and dedicated parking spaces.",
      },
    ],
  },
  showcase: {
    eyebrow: "Interface Showcase",
    title: "Experience the HomeNet product",
    subtitle:
      "Explore live components from the HomeNet application rendered with preview data.",
    tabs: [
      { id: "browse", label: "Search & Browse" },
      { id: "detail", label: "Property Detail" },
      { id: "create", label: "Owner Wizard" },
      { id: "dashboard", label: "Seller Studio" },
    ],
  },
  aiFlagship: {
    eyebrow: "Bangladeshi Property Intelligence",
    title: "Skip the 14-field form. Just describe your property.",
    subtitle:
      "Listing a property usually means twenty minutes of repetitive typing. Instead, paste or type a description in your own words. HomeNet extracts the specs, formats the figures, and populates your listing in seconds.",
    demoInputPlaceholder:
      "e.g. 3 bedroom apartment in Gulshan 2, 1800 sqft, south facing, 4th floor, lift and generator, 2.5 crore",
    analyzeBtn: "Analyze with AI",
    analyzingState: "AI is reading your description…",
    applyBtn: "Apply & Continue",
    tryAgainBtn: "Try again",
    disclaimer: "AI may make mistakes — you can edit before submitting",
    lowConfidenceNotice: "AI is less certain — please verify",
    priceConversionBadge: "2.5 crore → BDT 25,000,000",
    headlines: [
      {
        num: "01",
        title: "It speaks Bangladeshi property language",
        tag: "Local Vocabulary",
        desc: "Purpose-built for Bangladesh. It translates crore and lakh directly into figures (1 crore = 10,000,000; 1 lakh = 100,000), understands katha and bigha alongside sqft and sqm, and recognizes the amenities that matter in Dhaka — standby generator, lift, gas line, servant quarter, nearby mosque, rooftop, and CCTV.",
        examples: [
          "Crore & Lakh: 2.5 crore converts to BDT 25,000,000 automatically",
          "Land units: Understands katha and bigha without conversion errors",
          "Dhaka amenities: Detects generator, lift, gas line, and servant quarters",
          "Neighborhoods: Recognizes Gulshan, Banani, Dhanmondi, Uttara, Mirpur",
        ],
      },
      {
        num: "02",
        title: "It tells you how sure it is, field by field",
        tag: "Field Transparency",
        desc: "Honesty before automation. HomeNet returns a confidence level for every single extracted field and flags anything it is less certain about. You only spend time checking the fields that actually need human review.",
        examples: [
          "High confidence on standard specs: price, bedrooms, size, and area",
          "Flags ambiguous entries with a clear notice: 'AI is less certain — please verify'",
          "Saves you from re-checking verified details",
        ],
      },
      {
        num: "03",
        title: "You stay in control",
        tag: "Zero Lock-In",
        desc: "Every single extracted field is inline-editable right inside the preview before anything is applied. One tap on 'Apply & Continue' carries your confirmed details directly into the listing wizard.",
        examples: [
          "Inline-editable fields: Tap any row to adjust text or numbers instantly",
          "Seamless handover: 'Apply & Continue' populates the 5-step wizard",
          "Zero manual duplication: Start with your draft and finish in minutes",
        ],
      },
    ],
  },
  seekersSection: {
    eyebrow: "For Seekers",
    title: "Find a home you can trust, without the runaround",
    benefits: [
      "Comprehensive search across residential, commercial, plots, and parking",
      "Every single photo and the exact location on the map before you visit",
      "Only verified active listings appear in search — no expired or ghost ads",
      "Direct owner contact information with 0% broker commission",
    ],
    primaryCta: "Explore properties",
    secondaryCta: "Browse rentals",
  },
  ownersSection: {
    eyebrow: "For Owners",
    title: "List directly. Reach verified seekers. 0 BDT fee.",
    benefits: [
      "100% free to list — no upfront costs, no hidden listing fees, no commissions",
      "AI-assisted listing — describe your flat in a sentence and skip tedious forms",
      "Guided 5-step wizard with auto-saved drafts so you can finish anytime",
      "Direct seeker inquiries delivered straight to your email without middlemen",
      "One unified account manages both your searches and your listings",
    ],
    primaryCta: "List your property",
    secondaryCta: "Why list with HomeNet",
  },
  trust: {
    eyebrow: "Trust & Verification",
    title: "How we verify every property before it publishes",
    subtitle:
      "If a listing hasn't passed verification, it is completely unreachable on HomeNet.",
    steps: [
      {
        title: "1. Submission",
        desc: "Owner drafts property details and uploads authentic photos.",
      },
      {
        title: "2. Completeness Check",
        desc: "Automated engine validates price, dimensions, coordinates, and photo count.",
      },
      {
        title: "3. Verification Gate",
        desc: "Listing undergoes verification review before status changes to active.",
      },
      {
        title: "4. Public Publication",
        desc: "Active listing publishes with a Verified badge. Unverified entries return 404.",
      },
    ],
  },
  tech: {
    eyebrow: "Engineering & Architecture",
    title: "Built on modern, robust technology",
    aiTitle: "AI Property Listing Assistant",
    aiDesc:
      "Our AI parser translates natural Bangladeshi property descriptions into structured database records — extracting bedrooms, price in crore/lakh, floor level, and 18 distinct amenities.",
    locationTitle: "Geospatial & Area Taxonomy",
    locationDesc:
      "Two-level hierarchical indexing of Dhaka wards paired with Haversine radius math for point-based spatial search.",
    schemaTitle: "Enforced Relational Integrity",
    schemaDesc:
      "Typed PostgreSQL schema on Prisma 6 ensuring strict relational integrity, verified statuses, and zero orphaned media.",
  },
  ecosystem: {
    eyebrow: "The Platform",
    title: "An interconnected ecosystem for Bangladesh",
    subtitle:
      "Connecting genuine property owners with serious buyers and tenants through transparent technology.",
  },
  finalCta: {
    seekerTitle: "Looking for your next home?",
    seekerCopy:
      "Browse hundreds of verified apartments, plots, and offices across Dhaka with direct owner contact.",
    seekerBtn: "Explore properties",
    ownerTitle: "Have a property to sell or rent?",
    ownerCopy:
      "List it for free in minutes. Use our AI assistant to skip the form and reach genuine seekers without broker spam.",
    ownerBtn: "List your property",
    appLink: "Open HomeNet App",
  },
  footer: {
    brandTagline: "The verified property marketplace for Bangladesh.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    copyright: `© ${new Date().getFullYear()} HomeNet Bangladesh. All rights reserved.`,
    disclaimer:
      "HomeNet connects property owners with seekers directly. All published listings are verified for completeness prior to publication.",
  },
} as const;
