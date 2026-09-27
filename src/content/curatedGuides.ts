import type { PropertyGuide } from "@/features/news/types/news";

/**
 * Curated property and legal guides for Bangladesh.
 *
 * Serves as:
 * 1. Initial content for HomeNet's guides & insights.
 * 2. Instant zero-latency fallback whenever backend `/v1/guides` is unavailable.
 *
 * Rules for this file:
 * - Credit "HomeNet Team". Never invent a desk, specialist or credential.
 * - Any statutory fee, tax or rate needs the fee disclaimer, a cited source,
 *   and `updatedAt` set to the date the figure was last checked. Rates change
 *   with every Finance Act.
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
    updatedAt: "2026-09-27T00:00:00.000Z",
    href: "/guides/namzari-mutation-bangladesh-guide",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Namzari", "Mutation", "Land Ministry", "AC Land", "DCR"],
    contentMarkdown: `
# Understanding Namzari (Mutation) in Bangladesh

> **Disclaimer:** Rates cited are for reference only. Verify all statutory fees with
> the relevant Sub-registry, NBR circular, or a qualified lawyer before any transaction.

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
Visit [mutation.land.gov.bd](https://mutation.land.gov.bd) and select "New Application" (*Notun Abedon*). Fill in your NID, mobile number, district, upazila/thana, and mouza details. Upload scanned copies of your deed and tax receipts; the portal lists the accepted file types and sizes. You pay a **Tk 20 court fee** and a **Tk 50 notice fee** online at this stage.

### 2. Application Tracking
Upon submission, an SMS with your **Application ID** and tracking link is sent to your registered mobile number.

### 3. Field Verification
The Union/Circle Land Sub-office (*Tahshil Office*) conducts field verification and submits a report to the AC Land office. Track progress with your Application ID rather than relying on a fixed timeline.

### 4. Hearing & Scrutiny
If required, the AC Land office schedules a hearing where both parties (or representatives) verify original documents.

### 5. Official Order & Fee Payment
Once approved:
- An official approval SMS arrives.
- Pay the **DCR fee of Tk 1,100** online: Tk 1,000 for the record correction and Tk 100 for the mutation khatian.

### 6. Download E-Khatian & DCR
Download your QR-code verified **E-Namzari Khatian** and **Duplicate Carbon Receipt (DCR)** directly from the portal. The QR-coded DCR issued online carries the same legal validity as one issued by the manual method.

---

## Sources

- [e-Mutation portal, Ministry of Land](https://mutation.land.gov.bd)
- [BSS: "Applicant can pay e-mutation fee online" (2 Nov 2021), fee breakdown](https://www.bssnews.net/news/25997)
    `.trim(),
    author: {
      name: "HomeNet Team",
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
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Khatian", "Porcha", "CS", "SA", "RS", "BS", "City Survey"],
    contentMarkdown: `
# How to Verify Khatian (CS, SA, RS, BS) Before Buying

> **Disclaimer:** This guide is general information, not legal advice. Land records and
> procedures vary by district; confirm with the AC Land office, the Sub-registry, or a
> qualified lawyer before any transaction.

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
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-flat-registration-costs",
    slug: "dhaka-flat-registration-costs-breakdown",
    category: "Buying",
    title: "Dhaka Flat Registration Costs & Stamp Duty Breakdown",
    excerpt:
      "What it costs to register a flat in Dhaka: stamp duty, registration fee and local government tax, plus the seller's and developer's taxes under the Income Tax Act 2023.",
    readTime: "5 min read",
    imageUrl: null,
    publishedAt: "2026-08-25T11:00:00.000Z",
    updatedAt: "2026-09-27T00:00:00.000Z",
    href: "/guides/dhaka-flat-registration-costs-breakdown",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Registration", "Stamp Duty", "Transfer Tax", "Taxes", "Dhaka"],
    contentMarkdown: `
# Dhaka Flat Registration Costs & Stamp Duty Breakdown

> **Disclaimer:** Rates cited are for reference only. Verify all statutory fees with
> the relevant Sub-registry, NBR circular, or a qualified lawyer before any transaction.

Registering a flat you have bought in Dhaka involves several statutory charges, collected by the Sub-registry office before the deed is registered. Rates change with Finance Acts and NBR rules, so treat the figures below as a starting point and confirm them before you budget.

---

## Standard Cost Breakdown (City Corporation Areas)

| Charge | Paid by | Rate | Source |
| :--- | :--- | :--- | :--- |
| **Stamp Duty** | Buyer | 1.5% of the deed value | [Finance Act 2022, Schedule I](https://bdlaws.minlaw.gov.bd/act-1409/act-chapter-print-2323.html) |
| **Registration Fee** | Buyer | Set by the Government's fee table. Sub-registry charters list 1% to 2% of the deed value; confirm the current rate | [Registration Act 1908, s.78](https://bdlaws.minlaw.gov.bd/act-90/part-details-293.html) |
| **Local Government Tax** | Buyer | Varies by area: reported as 2% in Dhaka's city corporations; Sub-registry charters elsewhere list 3% | Confirm at your Sub-registry |
| **Transfer Tax (s.125)** | Seller | Set by NBR rules and varies by area. Capped at the higher of Tk 20 lakh per katha of land, Tk 1,000 per sqft of flat, or 10% of the deed value | [Income Tax Act 2023, s.125](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf) |
| **Developer Tax (s.126)** | Developer | Set by NBR rules and varies by area. Capped at Tk 1,600 per square metre of residential floor space, and 5% of the deed value for the land share | [Income Tax Act 2023, s.126](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf) |

The seller's transfer tax is often called "gain tax". Sections 125 and 126 of the Income Tax Act 2023 replaced sections 53H and 53FF of the old Income Tax Ordinance 1984.

---

## Example: 1,500 Sqft Flat at Tk 1.5 Crore in Mirpur

The buyer's registration costs, using the rates above:

1. **Stamp Duty (1.5%)**: Tk 2,25,000
2. **Registration Fee (1% to 2%)**: Tk 1,50,000 to Tk 3,00,000
3. **Local Government Tax (2% to 3%)**: Tk 3,00,000 to Tk 4,50,000
4. **Total**: about Tk 6,75,000 to Tk 9,75,000, plus deed-writing and drafting charges, which vary.

The registration fee and local government tax are given as ranges because the official figures published online disagree and are out of date. Ask your Sub-registry for the current rates before you budget.

The seller's transfer tax and the developer's tax are not in this total. If you are buying from a developer, ask whether the price includes the developer's tax. For 1,500 sqft (about 139 square metres) it can be up to about Tk 2.2 lakh, plus up to 5% of the deed value for the land share.

> **Pro Tip**: Always demand an official receipt (e-Chalan) for every fee paid at the Sub-registry. Never hand over unreceipted cash for statutory fees.

---

## Sources

- [Finance Act 2022: stamp duty on instruments, Schedule I (Conveyance)](https://bdlaws.minlaw.gov.bd/act-1409/act-chapter-print-2323.html)
- [Registration Act 1908, Part XIII: fees for registration](https://bdlaws.minlaw.gov.bd/act-90/part-details-293.html)
- [Income Tax Act 2023 as amended by the Finance Act 2024, sections 125 and 126 (NBR)](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf)
- Registration fee and local government tax as reported for Dhaka by [The Business Standard (27 May 2023)](https://www.tbsnews.net/economy/budget/govt-double-gain-tax-land-flat-registration-638738)
- Sub-registry citizen charters, which list different rates and predate current law: [Kumarkhali, updated 26 Mar 2021](https://sr.kumarkhali.kushtia.gov.bd/pages/static-pages/69811b1ca31054345f1de98b) and [Bheramara, updated 30 Mar 2019](https://sr.bheramara.kushtia.gov.bd/site/page/1b26ca6c-ec53-49f3-bc43-0ceeea7bf2f1)
    `.trim(),
    author: {
      name: "HomeNet Team",
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
    updatedAt: "2026-09-27T00:00:00.000Z",
    href: "/guides/understanding-katha-bigha-decimal-sqft",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Katha", "Bigha", "Decimal", "Measurement", "Land Area"],
    contentMarkdown: `
# Understanding Katha, Bigha, Decimal & Sqft

Property listings in Bangladesh switch fluidly between imperial, metric, and traditional Bengali measurement units. Here is the standard reference table.

---

## Key Land Conversion Benchmarks

- **1 Katha** = **720 Square Feet (sqft)** = **66.89 Square Metres (sqm)** = **1.65 Decimal (Shatangsho)**
- **20 Katha** = **1 Bigha** = **14,400 Square Feet** = **33 Decimal**
- **1 Acre** = **100 Decimal** = **43,560 Square Feet** (about 3 Bighas, which is 43,200 sqft)
- **1 Chhatak** = **45 Square Feet** (1/16th of a Katha)

---

## Carpet Area vs. Super Built-up Area in Apartments
When buying an apartment advertised as "1,800 sqft":
- **Carpet Area**: The actual net usable floor space inside walls (typically ~1,350 sqft).
- **Common Area Share**: Staircases, lift lobby, substation room, and generator space are added (typically 20% to 25% extra).
- **Always ask for the approved structural floor plan** to verify the exact usable carpet area before signing contracts.
    `.trim(),
    author: {
      name: "HomeNet Team",
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
    sourceName: "HomeNet Team",
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
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-direct-listing-saves-broker-commission",
    slug: "direct-listing-saves-broker-commission-dhaka",
    category: "Selling",
    title: "How Direct Property Listing Saves Lakhs in Dhaka",
    excerpt:
      "How a typical 1-2% broker commission can cost each side up to Tk 5 lakh on a Tk 2.5 crore flat, and why direct-owner listings offer cleaner transactions.",
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
- On a **Tk 2.5 Crore flat** in Gulshan or Dhanmondi, a 2% brokerage commission is Tk 5 lakh from each side: **Tk 10 lakh** in total drained from the transaction.
- Beyond fees, intermediaries often inflate asking prices or conceal physical drawbacks to rush deals through.

---

## The HomeNet Advantage
1. **Direct Owner Contact**: Talk directly to the actual title holder.
2. **Verified Listing Details**: Confirmed floor, facing, amenities, and exact coordinates before you travel for an inspection.
3. **Zero Commission**: HomeNet charges zero broker commission to both seekers and owners.
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },
];
