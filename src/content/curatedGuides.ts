import type { PropertyGuide } from "@/features/news/types/news";

/**
 * Authoritative, curated property and legal guides for Bangladesh.
 *
 * Serves as:
 * 1. Initial high-quality content for HomeNet's guides & insights.
 * 2. Instant zero-latency fallback whenever backend `/v1/guides` is unavailable.
 */
export const CURATED_PROPERTY_GUIDES: PropertyGuide[] = [
  {
    id: "guide-namzari-mutation",
    slug: "namzari-mutation-bangladesh-guide",
    category: "Legal",
    title: "Understanding Namzari (Mutation) in Bangladesh: Step-by-Step Guide",
    excerpt:
      "Why registering a deed at the Sub-registry is not enough — how to complete online Namzari via mutation.land.gov.bd and secure government revenue records.",
    readTime: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2026-08-15T09:00:00.000Z",
    href: "/guides/namzari-mutation-bangladesh-guide",
    sourceType: "internal",
    sourceName: "HomeNet Legal Desk",
    sourceUrl: null,
    tags: ["Namzari", "Mutation", "Land Ministry", "AC Land", "DCR"],
    contentMarkdown: `
# Understanding Namzari (Mutation) in Bangladesh

Many property buyers in Bangladesh mistakenly believe that completing a purchase deed (*Saf-Kabala*) at the Sub-registry office is the final step in establishing ownership. **It is not.**

Until you mutate the land record in your name through **Namzari** (Mutation), the official government revenue record (*Khatian*) remains under the previous owner's name. This means:
- The previous owner can unlawfully attempt to sell or mortgage the land using old records.
- You cannot legally pay land development tax (*Khajna*) in your own name.
- You cannot secure a bank mortgage or obtain construction plan approvals from development authorities like RAJUK or CDA.

---

## What is Namzari?
Namzari is the legal procedure where the Assistant Commissioner of Land (AC Land) replaces the seller's name with the buyer's name in the government's Record of Rights (ROR/Khatian) and registers it in the Land Office Register-II (*Jamabandi*).

---

## Required Documents for Online Namzari
Applications are filed online through **mutation.land.gov.bd**:

1. **National ID Card (NID)** of the applicant.
2. **Original Sale Deed (*Saf-Kabala*)** or certified copy.
3. **Chain of Deeds (*Via Dolil*)** tracing ownership history.
4. **Latest Recorded Khatian** (RS / BS / City Survey).
5. **Up-to-date Land Development Tax Receipt (*Khajna Dakhila*)**.
6. **Inheritance Certificate (*Waris Sanad*)**, if the property was inherited.

---

## Step-by-Step Procedure

### 1. Online Application
Visit [mutation.land.gov.bd](https://mutation.land.gov.bd) and select "New Application" (*Notun Abedon*). Fill in your NID, mobile number, district, upazila/thana, and mouza details. Upload scanned copies of your deed and tax receipts (PDF or JPEG, under 25MB total).

### 2. Application Tracking
Upon submission, an SMS with your **Application ID** and tracking link is sent to your registered mobile number.

### 3. Field Verification
The Union/Circle Land Sub-office (*Tahshil Office*) conducts field verification and submits a report to the AC Land office within 7 to 15 working days.

### 4. Hearing & Scrutiny
If required, the AC Land office schedules a hearing where both parties (or representatives) verify original documents.

### 5. Official Order & Fee Payment
Once approved:
- An official approval SMS arrives.
- Pay the official government **DCR fee (Tk 1,100)** via online payment (bKash, Nagad, Rocket, or cards).

### 6. Download E-Khatian & DCR
Download your QR-code verified **E-Namzari Khatian** and **Duplicate Carbon Receipt (DCR)** directly from the portal. These online documents have full legal validity across all courts, sub-registries, and banks.
    `.trim(),
    author: {
      name: "HomeNet Legal Desk",
      role: "Property & Land Law Advisory",
    },
  },

  {
    id: "guide-verify-khatian",
    slug: "how-to-verify-khatian-cs-sa-rs-bs",
    category: "Legal",
    title: "How to Verify Khatian (CS, SA, RS, BS) Before Buying Land or Flats",
    excerpt:
      "Learn the four major land surveys in Bangladesh, how to trace the chain of ownership via deed history, and how to verify records on eporcha.gov.bd.",
    readTime: "6 min read",
    imageUrl: null,
    publishedAt: "2026-08-20T10:30:00.000Z",
    href: "/guides/how-to-verify-khatian-cs-sa-rs-bs",
    sourceType: "internal",
    sourceName: "HomeNet Legal Desk",
    sourceUrl: null,
    tags: ["Khatian", "Porcha", "CS", "SA", "RS", "BS", "City Survey"],
    contentMarkdown: `
# How to Verify Khatian (CS, SA, RS, BS) Before Buying

In Bangladesh, real estate disputes usually originate from defective land titles or forged Khatians (*Porchas*). Understanding the progression of historical land surveys is essential for every property buyer.

---

## The Four Major Land Surveys in Bangladesh

### 1. CS (Cadastral Survey) — 1888 to 1940
The foundational survey conducted under the British colonial administration. CS records establish the historical benchmark of land ownership.

### 2. SA (State Acquisition Survey) — 1956 to 1962
Conducted following the abolition of the Zamindari system under the East Bengal State Acquisition and Tenancy Act of 1950. It recorded tenant farmers as direct owners under the government.

### 3. RS (Revisional Survey) — 1965 to 1990
Initiated to rectify errors in the SA survey. In many parts of Bangladesh outside Dhaka, RS remains the most legally robust reference survey.

### 4. BS / City Survey (Bangladesh Survey) — 1998 to Present
The modern survey. In Dhaka, it is commonly designated as **Dhaka City Survey**. If City Survey is complete in an area, all new registrations and mutations must reference the City Survey Khatian.

---

## 3 Critical Verification Steps

1. **Verify the Chain of Ownership (*Via Dolil*)**:
   Ensure there is an unbroken chain of registered deeds connecting the current seller back to the recorded owner in the RS or City Survey Khatian.

2. **Online Verification via E-Porcha**:
   Visit [eporcha.gov.bd](https://www.eporcha.gov.bd). Search by Division, District, Upazila, and Mouza to verify that the Khatian number and Dag (plot) number match the government database.

3. **Check for Injunctions & Vested Property Lists**:
   Confirm at the Sub-registry and AC Land office that the property is not classified as *Khas* (government land), *Arpita* (vested property), or encumbered by bank liens or ongoing court injunctions.
    `.trim(),
    author: {
      name: "HomeNet Legal Desk",
      role: "Property & Land Law Advisory",
    },
  },

  {
    id: "guide-flat-registration-costs",
    slug: "dhaka-flat-registration-costs-breakdown",
    category: "Buying",
    title: "Dhaka Flat Registration Costs & Stamp Duty Breakdown",
    excerpt:
      "A complete calculation guide for stamp duty, registration fees, local government taxes, and AIT (Section 53FF) when buying a flat in Dhaka.",
    readTime: "4 min read",
    imageUrl: null,
    publishedAt: "2026-08-25T11:00:00.000Z",
    href: "/guides/dhaka-flat-registration-costs-breakdown",
    sourceType: "internal",
    sourceName: "HomeNet Advisory",
    sourceUrl: null,
    tags: ["Registration", "Stamp Duty", "AIT", "Taxes", "Dhaka"],
    contentMarkdown: `
# Dhaka Flat Registration Costs & Stamp Duty Breakdown

Registering a newly purchased flat or apartment in Dhaka involves several statutory fees payable to the Sub-registry office and the National Board of Revenue (NBR).

---

## Standard Cost Breakdown (Dhaka City Corporation)

| Fee Type | Rate | Description |
| :--- | :--- | :--- |
| **Stamp Duty** | 1.5% | Payable via Treasury Chalan or e-stamp. |
| **Registration Fee** | 1.0% | Paid to the Sub-registry office. |
| **Local Government Tax** | 2.0% | Paid to Dhaka North (DNCC) or Dhaka South (DSCC). |
| **Advance Income Tax (AIT)** | Fixed per sqft | Under Section 53FF, varies by location (e.g. Gulshan/Banani vs. Mirpur/Uttara). |
| **Gain Tax (53C)** | 4.0% - 8.0% | Paid by the seller / developer; ensure proof of payment is attached. |

---

## Example Calculation: 1,500 Sqft Flat at Tk 1.5 Crore in Mirpur

1. **Stamp Duty (1.5%)**: Tk 2,25,000
2. **Registration Fee (1.0%)**: Tk 1,50,000
3. **Local Govt Tax (2.0%)**: Tk 3,00,000
4. **Section 53FF AIT**: Varies by zone (~Tk 300–600 per sqft in general Dhaka zones).
5. **Estimated Incidental Costs**: Legal drafting, clerk dues, and stamp vendor fees (~Tk 20,000–35,000).

> **Pro Tip**: Always demand an official e-Chalan receipt for every fee paid at the Sub-registry. Never hand over unreceipted cash for statutory fees.
    `.trim(),
    author: {
      name: "HomeNet Advisory",
      role: "Finance & Taxation Specialist",
    },
  },

  {
    id: "guide-katha-bigha-decimal",
    slug: "understanding-katha-bigha-decimal-sqft",
    category: "Buying",
    title: "Understanding Katha, Bigha, Decimal & Sqft in Bangladesh",
    excerpt:
      "Demystifying land measurement units used across Dhaka, Chittagong, and rural Bangladesh, with quick formulas to convert katha to square feet.",
    readTime: "4 min read",
    imageUrl: null,
    publishedAt: "2026-09-01T08:15:00.000Z",
    href: "/guides/understanding-katha-bigha-decimal-sqft",
    sourceType: "internal",
    sourceName: "HomeNet Advisory",
    sourceUrl: null,
    tags: ["Katha", "Bigha", "Decimal", "Measurement", "Land Area"],
    contentMarkdown: `
# Understanding Katha, Bigha, Decimal & Sqft

Property listings in Bangladesh switch fluidly between imperial, metric, and traditional Bengali measurement units. Here is the standard reference table.

---

## Key Land Conversion Benchmarks

- **1 Katha** = **720 Square Feet (sqft)** = **66.89 Square Metres (sqm)** = **1.65 Decimal (Shatangsho)**
- **20 Katha** = **1 Bigha** = **14,400 Square Feet** = **33 Decimal**
- **3 Bighas** = **1 Acre** = **100 Decimal** = **43,560 Square Feet**
- **1 Chhatak** = **45 Square Feet** (1/16th of a Katha)

---

## Carpet Area vs. Super Built-up Area in Apartments
When buying an apartment advertised as "1,800 sqft":
- **Carpet Area**: The actual net usable floor space inside walls (typically ~1,350 sqft).
- **Common Area Share**: Staircases, lift lobby, substation room, and generator space are added (typically 20% to 25% extra).
- **Always ask for the approved structural floor plan** to verify the exact usable carpet area before signing contracts.
    `.trim(),
    author: {
      name: "HomeNet Advisory",
      role: "Real Estate Research",
    },
  },

  {
    id: "guide-apartment-inspection-checklist",
    slug: "dhaka-apartment-buyer-inspection-checklist",
    category: "Buying",
    title: "Pre-Purchase Checklist: 7 Things to Inspect in a Dhaka Apartment",
    excerpt:
      "Essential checks before buying an apartment in Dhaka: RAJUK plan approval, standby generator backup limits, sub-station specs, and parking allocation.",
    readTime: "5 min read",
    imageUrl: null,
    publishedAt: "2026-09-05T12:00:00.000Z",
    href: "/guides/dhaka-apartment-buyer-inspection-checklist",
    sourceType: "internal",
    sourceName: "HomeNet Editorial",
    sourceUrl: null,
    tags: ["Checklist", "Inspection", "Dhaka", "RAJUK", "Amenities"],
    contentMarkdown: `
# Pre-Purchase Checklist: 7 Things to Inspect in a Dhaka Apartment

Before signing a deed or transferring a booking deposit for a Dhaka flat, run through this inspection checklist:

1. **RAJUK Approved Plan vs. Built Reality**:
   Check if the building matches the sanctioned setback rules and floor count. Deviation from the RAJUK approved design exposes the building to demolition notices or utility disconnection.

2. **Occupancy Certificate (*Shonod*)**:
   Under building construction rules, buildings constructed in Dhaka require an official Occupancy Certificate from RAJUK before residents move in.

3. **Dedicated Generator Load Capacity**:
   Ask specifically: *Does the standby generator support air conditioning and refrigerators during load-shedding, or only lights and fans?*

4. **Gas Connection vs. LPG Reticulation**:
   With new pipeline connections paused, confirm whether the building has a centralized LPG cylinder manifold system or requires individual 12kg cylinder hauling.

5. **Car Parking Allocation in Deed**:
   Verify whether your parking spot is explicitly earmarked with a number on the ground plan in the deed, rather than sold on a vague "common allocation" basis.

6. **Sub-station & Transformer Capacity**:
   For buildings over 6 stories, confirm the presence of a dedicated electrical sub-station and DESCO/DPDC sanctioned transformer capacity.

7. **Solar Panel Compliance**:
   Ensure rooftop solar setups meet utility net-metering standards where applicable.
    `.trim(),
    author: {
      name: "HomeNet Editorial",
      role: "Quality & Standards",
    },
  },

  {
    id: "guide-direct-listing-saves-broker-commission",
    slug: "direct-listing-saves-broker-commission-dhaka",
    category: "Selling",
    title: "How Direct Property Listing Saves Lakhs in Dhaka",
    excerpt:
      "How typical 1-2% intermediary broker commissions cost buyers and sellers up to 5 lakh BDT, and why direct-owner listings offer cleaner transactions.",
    readTime: "3 min read",
    imageUrl: null,
    publishedAt: "2026-09-10T14:30:00.000Z",
    href: "/guides/direct-listing-saves-broker-commission-dhaka",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Direct Listing", "Zero Commission", "Broker Fee", "Dhaka Owners"],
    contentMarkdown: `
# How Direct Property Listing Saves Lakhs in Dhaka

In Dhaka's traditional property market, informal brokers (*Dalals*) frequently insert themselves between owners and seekers.

---

## The Hidden Cost of Intermediaries
- On a **Tk 2.5 Crore flat** in Gulshan or Dhanmondi, a 2% brokerage commission from both sides totals **Tk 10 Lakhs** drained from the transaction.
- Beyond fees, intermediaries often inflate asking prices or conceal physical drawbacks to rush deals through.

---

## The HomeNet Advantage
1. **Direct Owner Contact**: Talk directly to the actual title holder.
2. **Verified Listing Details**: Confirmed floor, facing, amenities, and exact coordinates before you travel for an inspection.
3. **Zero Commission**: HomeNet charges zero broker commission to both seekers and owners.
    `.trim(),
    author: {
      name: "HomeNet Team",
      role: "Platform Advisory",
    },
  },
];
