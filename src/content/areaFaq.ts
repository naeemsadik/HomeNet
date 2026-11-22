import type { FaqEntry, ListingIntent } from "@/lib/schema";

/**
 * Questions the area landing pages answer in their own words, for readers and
 * for the answer engines that quote them.
 *
 * Rules for this file, the same ones src/content/curatedGuides.ts follows:
 *
 * - **No price figures.** HomeNet publishes no price index, so a taka range
 *   here would be invented, and an invented number is exactly what a Featured
 *   Snippet or an AI Overview would repeat. The "how much" questions answer
 *   what moves the price in that area and send the reader to the live
 *   listings on the same page, which are the real answer and stay current.
 * - **Direct answer first.** One or two sentences that stand alone if quoted,
 *   then the detail. An answer that opens with throat-clearing is no use to a
 *   snippet.
 * - **Only areas that have something of their own.** An area without a
 *   curated entry renders no FAQ and emits no FAQPage: near-identical FAQ
 *   blocks repeated across forty pages are duplicate content, and Google
 *   treats templated FAQ markup as spam.
 * - Every claim about HomeNet itself must be true of the product as built:
 *   the four verification steps below are the ones in
 *   src/content/landingCopy.ts, not a nicer version of them.
 */

/**
 * `shared` marks an answer that is the same on every area page — how
 * verification works, or that there is no broker commission. Those stay
 * visible, because they are what a reader on an area page actually asks,
 * but they are kept out of the FAQPage markup: the same answer repeated
 * across dozens of pages is what duplicate-content heuristics look for.
 */
type AreaFaqEntry = FaqEntry & { shared?: boolean };

interface AreaFaqContent {
  buy: AreaFaqEntry[];
  rent: AreaFaqEntry[];
}

/** The verification answer, worded per area. The four steps are the product's own. */
function verificationEntry(area: string): AreaFaqEntry {
  return {
    shared: true,
    question: `Are ${area} listings on HomeNet verified?`,
    answer:
      `Yes. A listing in ${area} cannot appear publicly until it passes HomeNet's four verification steps, and an unverified listing returns a 404 rather than sitting half-visible. ` +
      "The owner submits the property with photos; an automated completeness check validates the price, dimensions, map coordinates and photo count; the listing then goes through a verification review; only then does it publish with a Verified badge.",
  };
}

/** The no-commission answer, worded per area. */
function directOwnerEntry(area: string, intent: ListingIntent): AreaFaqEntry {
  const act = intent === "buy" ? "buy" : "rent";
  return {
    shared: true,
    question: `Can I contact the owner directly for a ${area} property, without a broker?`,
    answer:
      `Yes, and there is no commission. Every HomeNet listing is posted by the owner or someone acting for them, and your message goes straight to that person — HomeNet does not take a cut of the ${act}.` +
      " In Dhaka a broker typically takes a fee from both sides of a deal, so going direct removes that cost and the telephone game that comes with it.",
  };
}

const AREA_FAQ: Record<string, AreaFaqContent> = {
  dhaka: {
    buy: [
      {
        question: "What should I check before buying a flat in Dhaka?",
        answer:
          "Check the title and the building approval before you discuss price — those are the two things that cost buyers most when they go wrong. " +
          "Trace the khatian and the chain of deeds, confirm the building is RAJUK-approved and that the floors on site match the approved plan, then budget the registration costs. After purchase you still need Namzari (mutation) to get the record into your name; registering the deed alone does not do it.",
      },
      {
        question: "Which areas of Dhaka are best to buy in?",
        answer:
          "Gulshan, Banani and Baridhara are the most expensive and the most central; Bashundhara R/A, Uttara and Mirpur give the most floor area for the money. " +
          "Dhanmondi sits between the two on both counts and is chosen mostly for schools and hospitals. HomeNet has a page for each area, and a guide comparing Gulshan, Banani and Bashundhara R/A side by side.",
      },
      {
        question: "How much does it cost to register a flat in Dhaka?",
        answer:
          "A buyer in a Dhaka city corporation area pays stamp duty at 1.5% of the deed value, a registration fee that Sub-registry charters list at 1% to 2%, and local government tax reported at 2% — commonly around 4.5% to 6.5% in total. " +
          "Deed-writing and drafting charges come on top and vary. Rates change with every Finance Act, so confirm them at your Sub-registry before budgeting.",
      },
      verificationEntry("Dhaka"),
    ],
    rent: [
      {
        question: "What should I check before renting a flat in Dhaka?",
        answer:
          "Agree the advance and the refund terms in writing before you pay anything — that is where most Dhaka tenancy disputes start. " +
          "Then check the practical things: generator backup and how long it runs, the water supply, the lift, parking, the Titas gas connection, and the monthly service charge, which is usually separate from rent.",
      },
      {
        question: "How much advance rent can a landlord demand in Dhaka?",
        answer:
          "Under the Premises Rent Control Act 1991 a landlord may not take more than one month's rent in advance without the Rent Controller's prior written permission, and security deposits are barred outright. " +
          "Three to six months is routinely demanded anyway. Knowing what the Act says is what gives you room to negotiate; HomeNet's guide to rent advances sets out the position in full.",
      },
      {
        question: "Which areas of Dhaka are cheapest to rent in?",
        answer:
          "Mirpur, Mohammadpur, Badda and Banasree generally ask the lowest rents of the well-connected areas, with Bashundhara R/A and Uttara a step above them. " +
          "Gulshan, Banani and Baridhara are the most expensive. What you are usually trading is commute time against rent, so check the journey at the hour you would actually travel before deciding.",
      },
      directOwnerEntry("Dhaka", "rent"),
    ],
  },

  gulshan: {
    buy: [
      {
        question: "What should I check before buying a flat in Gulshan?",
        answer:
          "Check that the building is RAJUK-approved and that the land title is clean before anything else — Gulshan plots are valuable enough that title disputes and unapproved extra floors are both worth ruling out. " +
          "Ask for the approved building plan, confirm the floor count on site matches it, and trace the khatian and chain of deeds. Then check the practical things that move value here: lift and generator backup, a piped Titas gas connection, parking, and whether the flat is south-facing.",
      },
      {
        question: "How much does a flat in Gulshan cost?",
        answer:
          "Gulshan is the most expensive residential address in Dhaka, and the asking prices on this page are the current answer — they move too often for a fixed figure to be useful. " +
          "What separates one asking price from another here is the block (Gulshan 2 generally asks more than Gulshan 1), the size in square feet, the building's age, the floor, facing, and whether parking is included. Flats are priced per square foot of the unit; land is priced per katha.",
      },
      {
        question: "Is Gulshan 1 or Gulshan 2 better to buy in?",
        answer:
          "Gulshan 2 is the quieter and more expensive of the two, Gulshan 1 the busier and better connected. " +
          "Gulshan 2 holds most of the diplomatic missions and the newer high-specification apartment buildings, around the lake and Gulshan Avenue. Gulshan 1 sits closer to Mohakhali and the commercial strip, with more mixed-use buildings and shorter runs to Banani and Tejgaon. HomeNet has a separate page for each.",
      },
      verificationEntry("Gulshan"),
    ],
    rent: [
      {
        question: "What is renting a flat in Gulshan like?",
        answer:
          "Gulshan is where most of Dhaka's expatriate and diplomatic tenancies sit, so the stock skews towards large, fully-fitted flats and serviced apartments. " +
          "Expect lift, generator backup and parking as standard in the newer buildings, and expect landlords to ask for a larger advance than elsewhere in the city. Short-let and serviced options are common here in a way they are not in most Dhaka neighbourhoods.",
      },
      {
        question: "How much is rent in Gulshan?",
        answer:
          "Gulshan asks the highest rents in Dhaka, and the live listings on this page are the current figure rather than an average that would be out of date by the time you read it. " +
          "The things that move a Gulshan rent are size in square feet, the block, whether the flat is furnished or serviced, the floor and lift, generator backup, parking, and facing.",
      },
      {
        question: "How much advance do landlords ask for in Gulshan?",
        answer:
          "In practice Gulshan landlords ask for several months, but the law is stricter than the custom: under the Premises Rent Control Act 1991 a landlord may not take more than one month's rent in advance without the Rent Controller's prior written permission. " +
          "Larger advances are still routinely demanded, particularly for furnished and serviced flats. Agree the figure and the refund terms in writing before you pay anything, and see HomeNet's guide to rent advances and tenant rights for what the Act actually says.",
      },
      directOwnerEntry("Gulshan", "rent"),
    ],
  },

  banani: {
    buy: [
      {
        question: "What should I know before buying a flat in Banani?",
        answer:
          "Banani is a mixed residential and commercial area, so check what the floors above and below you are used to before you buy. " +
          "Plenty of Banani buildings carry offices, restaurants or showrooms on the lower floors, which affects noise, lift traffic and resale. Confirm the RAJUK approval and the approved floor count, check the khatian and chain of deeds, and look at parking, generator backup and the Titas gas connection.",
      },
      {
        question: "How much does a flat in Banani cost?",
        answer:
          "Banani generally asks less than Gulshan and more than most of the rest of Dhaka; the listings on this page carry the current asking prices. " +
          "What moves a Banani price is the road (the 11 and 12 blocks differ from the commercial stretch near Kemal Ataturk Avenue), size, building age, floor, facing and parking.",
      },
      {
        question: "Is Banani or Gulshan better value?",
        answer:
          "Banani usually asks less per square foot than Gulshan for a comparable flat, which is the trade most buyers are weighing. " +
          "What you give up is quiet: Banani is more commercial and its main roads carry more traffic. What you gain, besides price, is position — it sits between Gulshan, Mohakhali and the airport road, and Banani DOHS nearby is quieter again.",
      },
      verificationEntry("Banani"),
    ],
    rent: [
      {
        question: "What is renting in Banani like?",
        answer:
          "Banani suits tenants who want a central address at less than a Gulshan rent, and the stock runs from family flats to serviced apartments and office space. " +
          "Because the area is mixed-use, check what occupies the rest of your building before signing — a restaurant or showroom below changes the evenings considerably. Lift, generator backup and parking are usual in the newer blocks.",
      },
      {
        question: "How much is rent in Banani?",
        answer:
          "Banani rents sit below Gulshan and above most of Dhaka, and the live listings here are the current answer rather than a figure that ages. " +
          "Size, the block, furnished or unfurnished, floor, lift, generator backup and parking are what separate one asking rent from another.",
      },
      {
        question: "Which part of Banani is quietest to live in?",
        answer:
          "The numbered residential roads away from Kemal Ataturk Avenue are the quietest part of Banani, and Banani DOHS quieter still. " +
          "The commercial stretch carries restaurants, offices and showrooms, with the traffic and evening noise that come with them. If quiet matters, filter towards the inner roads and check the building's other tenants.",
      },
      directOwnerEntry("Banani", "rent"),
    ],
  },

  "bashundhara-ra": {
    buy: [
      {
        question: "Is Bashundhara R/A a good place to buy a flat?",
        answer:
          "Bashundhara R/A is where buyers go for more square feet per taka than Gulshan or Banani, on a planned grid with wide roads. " +
          "It is a large planned residential area organised into numbered blocks, with a lot of newer construction. Before buying, confirm the RAJUK approval and the plot's title, and check the block: the ones nearer the main entrance and the commercial spine are better served than the newer outer blocks.",
      },
      {
        question: "How much does a flat in Bashundhara R/A cost?",
        answer:
          "Bashundhara R/A generally asks less per square foot than Gulshan, Banani or Baridhara, and the listings on this page hold the current figures. " +
          "Block and road width, the building's age, floor, lift, generator backup, parking and facing are what move the price. Plots here are priced per katha.",
      },
      {
        question: "Which block in Bashundhara R/A should I look at?",
        answer:
          "The lettered blocks differ mainly in how built-up and how well-served they are, so pick by access rather than by name. " +
          "Blocks closer to the main gate and the commercial roads have more shops, schools and transport, and are more fully built out. The outer blocks are newer and quieter, often with more space for the money, but check what is actually finished around a building before committing.",
      },
      verificationEntry("Bashundhara R/A"),
    ],
    rent: [
      {
        question: "What is renting in Bashundhara R/A like?",
        answer:
          "Bashundhara R/A is a common choice for families and students who want more room than inner Dhaka offers at the same rent. " +
          "The planned grid means wider roads and more parking than older neighbourhoods, and there is a lot of relatively new stock. Access to the rest of the city runs through a few main entrances, so check your commute at the hour you would actually travel.",
      },
      {
        question: "How much is rent in Bashundhara R/A?",
        answer:
          "Rents here are generally lower than Gulshan, Banani or Baridhara for the same floor area, and the live listings on this page are the current answer. " +
          "Block, size, floor, lift, generator backup, parking and whether the flat is furnished are what move an asking rent.",
      },
      {
        question: "Is Bashundhara R/A suitable for bachelors or students?",
        answer:
          "Yes — it is one of the more realistic Dhaka areas for bachelor and student tenancies, helped by the universities nearby. " +
          "Many Dhaka landlords restrict bachelor tenants, so filter and ask early rather than at viewing. Sublets and shared flats are more common here than in Gulshan or Baridhara.",
      },
      directOwnerEntry("Bashundhara R/A", "rent"),
    ],
  },

  dhanmondi: {
    buy: [
      {
        question: "What should I check before buying a flat in Dhanmondi?",
        answer:
          "Check the building's age and its approved plan first: Dhanmondi has a lot of older stock, and some of it carries floors or extensions that were never approved. " +
          "Ask for the RAJUK approval and compare it with what stands. Then check lift and generator backup, the Titas gas line, parking (older Dhanmondi buildings often have too little), and the khatian and chain of deeds.",
      },
      {
        question: "How much does a flat in Dhanmondi cost?",
        answer:
          "Dhanmondi asks less than Gulshan and more than Mirpur or Mohammadpur, with a wide spread driven by building age; the listings here carry the current prices. " +
          "A newer building on a quiet road asks considerably more per square foot than an older one on Satmasjid Road. Size, floor, facing, lift, parking and generator backup do the rest.",
      },
      {
        question: "Is Dhanmondi a good area to live in?",
        answer:
          "Dhanmondi is one of Dhaka's most established residential areas, and it is chosen mostly for schools, hospitals and being central. " +
          "The trade-off is traffic and density: Satmasjid Road and Mirpur Road are busy, and the area is far more built-up than when it was laid out. The quieter roads sit inside the grid, away from the two main arteries, and Lalmatia next door is quieter again.",
      },
      verificationEntry("Dhanmondi"),
    ],
    rent: [
      {
        question: "What is renting in Dhanmondi like?",
        answer:
          "Dhanmondi suits tenants who want to be central and close to schools and hospitals, with stock ranging from older walk-ups to newer lift buildings. " +
          "Rents vary widely with the building's age on the same road. Check parking and generator backup specifically — the older buildings are where both are most often missing.",
      },
      {
        question: "How much is rent in Dhanmondi?",
        answer:
          "Dhanmondi rents sit below Gulshan and Banani and above Mirpur and Mohammadpur, and the live listings on this page are the current figure. " +
          "Building age is the biggest single factor here, then size, floor, lift, parking, generator backup and whether the flat is furnished.",
      },
      {
        question: "Which part of Dhanmondi is quietest?",
        answer:
          "The inner numbered roads are the quietest part of Dhanmondi; Satmasjid Road and Mirpur Road are the busiest. " +
          "Lalmatia and Kalabagan, both adjoining, are generally quieter and cheaper than central Dhanmondi, and HomeNet has a page for each.",
      },
      directOwnerEntry("Dhanmondi", "rent"),
    ],
  },

  uttara: {
    buy: [
      {
        question: "Is Uttara a good place to buy a flat?",
        answer:
          "Uttara suits buyers who want a planned layout and more space for the money than central Dhaka, and it is now the best-connected outer area thanks to the metro. " +
          "It is organised into numbered sectors, each with its own roads, markets and schools. Confirm the RAJUK approval and the title as anywhere, and pick the sector by what is around it — they differ a great deal.",
      },
      {
        question: "How much does a flat in Uttara cost?",
        answer:
          "Uttara generally asks less per square foot than Gulshan, Banani or Dhanmondi, and the listings on this page hold the current figures. " +
          "Sector is the biggest factor, then size, building age, floor, lift, generator backup, parking and facing. Plots are priced per katha.",
      },
      {
        question: "Which sector of Uttara is best?",
        answer:
          "Sectors 3, 4, 6 and 7 are the most established and best served; the higher-numbered sectors are newer, quieter and generally cheaper. " +
          "The established sectors have the schools, markets and hospitals, and sit closest to the metro line and the airport road. The newer sectors offer more space for the money but check what is actually built and running nearby.",
      },
      verificationEntry("Uttara"),
    ],
    rent: [
      {
        question: "What is renting in Uttara like?",
        answer:
          "Uttara gives tenants more floor area for the rent than central Dhaka, on a planned sector grid, with the metro making the commute far more predictable than it used to be. " +
          "It is a common choice for families and for anyone working near the airport or in the northern part of the city. Stock is mostly newer than Dhanmondi or Mohammadpur.",
      },
      {
        question: "How much is rent in Uttara?",
        answer:
          "Uttara rents are generally below Gulshan, Banani and Dhanmondi for comparable space, and the live listings here are the current answer. " +
          "Sector, size, floor, lift, generator backup, parking and furnishing are what move an asking rent.",
      },
      {
        question: "Is Uttara well connected to the rest of Dhaka?",
        answer:
          "Yes — the MRT Line 6 metro runs from Uttara North into the centre, which is the single biggest change to living here. " +
          "Uttara also sits on the airport road, so Banani, Mohakhali and the airport are straightforward. The sectors nearest the metro stations and the main road are the best connected; the outer ones add a local leg at each end.",
      },
      directOwnerEntry("Uttara", "rent"),
    ],
  },

  "mirpur-dohs": {
    buy: [
      {
        question: "What is Mirpur DOHS like to buy in?",
        answer:
          "Mirpur DOHS is a planned, gated residential enclave, and it is quieter and more orderly than the Mirpur around it — which is what buyers are paying for. " +
          "It is laid out in numbered roads and avenues with controlled access, low traffic and consistent building standards. Confirm the approval and title as anywhere, and check parking, lift and generator backup.",
      },
      {
        question: "How much does a flat in Mirpur DOHS cost?",
        answer:
          "Mirpur DOHS asks more than surrounding Mirpur and generally less than Gulshan, Banani or Baridhara; the listings on this page carry the current prices. " +
          "Size, building age, floor, facing, lift, generator backup and parking are what move the figure.",
      },
      {
        question: "How is Mirpur DOHS different from Mirpur?",
        answer:
          "Mirpur DOHS is a separate planned enclave with controlled access, wider roads and far less traffic than the surrounding Mirpur. " +
          "That is reflected in the price: expect to pay more per square foot inside DOHS than immediately outside it. HomeNet lists Mirpur and Mirpur DOHS as separate areas for this reason.",
      },
      verificationEntry("Mirpur DOHS"),
    ],
    rent: [
      {
        question: "What is renting in Mirpur DOHS like?",
        answer:
          "Mirpur DOHS appeals to tenants who want quiet and security at well below a Gulshan rent, inside a gated, planned layout. " +
          "Roads are wide, traffic is light and building standards are consistent. Access is controlled, which is the main practical difference from renting in the surrounding Mirpur.",
      },
      {
        question: "How much is rent in Mirpur DOHS?",
        answer:
          "Rents here sit above surrounding Mirpur and well below Gulshan or Banani, and the live listings on this page are the current figure. " +
          "Size, floor, lift, generator backup, parking and furnishing move the asking rent.",
      },
      {
        question: "Is Mirpur DOHS good for families?",
        answer:
          "Yes — the low traffic, controlled access and planned roads are the reason most families choose it over the surrounding area. " +
          "Schools and markets sit within and just outside the enclave. Check the commute to your workplace at the hour you would travel: Mirpur's main roads are congested even when DOHS itself is calm.",
      },
      directOwnerEntry("Mirpur DOHS", "rent"),
    ],
  },
};

/**
 * The FAQ for one area page, or an empty list where the area has no curated
 * entry. The caller renders nothing and emits no FAQPage for an empty list.
 */
export function areaFaq(slug: string | undefined, intent: ListingIntent): AreaFaqEntry[] {
  if (!slug) return [];
  const content = AREA_FAQ[slug];
  if (!content) return [];
  return intent === "buy" ? content.buy : content.rent;
}

/**
 * The entries worth putting in FAQPage markup: the ones written for this area
 * and no other.
 *
 * Google withdrew FAQ rich results for commercial sites, so this markup earns
 * no snippet either way; what it still does is tell an answer engine which
 * question a passage answers. That is only worth saying where the answer is
 * specific to the page, which is why the shared platform answers are dropped
 * here while staying on screen.
 */
export function areaFaqForSchema(slug: string | undefined, intent: ListingIntent): FaqEntry[] {
  return areaFaq(slug, intent).filter((entry) => !entry.shared);
}

/** Slugs with curated FAQ content, for tests and for anything that needs the list. */
export const AREAS_WITH_FAQ = Object.keys(AREA_FAQ);
