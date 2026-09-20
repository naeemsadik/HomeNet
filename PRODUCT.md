# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

**Primary — property seekers.** People in Bangladesh looking for a flat, house, land plot, commercial space or parking to buy or rent, mostly across Dhaka. They arrive not knowing which listings are real: the alternative is scattered Facebook groups, expired broker ads, and posts missing photos or an actual address. They are comparing options before committing to a physical visit, so they need enough verified detail — full photo set, exact coordinates, floor, facing, amenities, price per sqft — to decide whether a property is worth the trip, and then a way to reach the owner.

**Primary — individual property owners listing directly.** Owners putting up their own property without an agent. They are not real-estate professionals and will abandon a twenty-minute form. They think and write in Bangladeshi property language ("2.5 crore", "1800 sqft", "katha", "4th floor, lift and generator") and expect the product to understand it.

**Secondary (confirmed, not the design target).** Repeat/volume listers working through the Seller Studio dashboard and verification flow; platform admins moderating listings, users, roles and areas. These surfaces exist and are built, but design decisions optimize for seekers and owners first.

## Product Purpose

HomeNet is a property marketplace for Bangladesh where owners list directly, listings are verified before they appear publicly, and seekers contact owners with no intermediary and no broker commission.

Success is a seeker trusting a listing enough to contact the owner, and an owner getting a complete listing published without professional help.

## Positioning

Two mechanisms a neighboring marketplace could not truthfully copy today:

1. **A verification gate with enforced completeness.** A listing cannot reach `active` status without photos, a full address, GPS coordinates and confirmed specs. Incomplete entries never publish. Verification is a publishing precondition, not a badge bought after the fact.
2. **Listing intake that speaks Bangladeshi property language.** An owner pastes a plain description and the product extracts ~14 structured fields from it — converting crore and lakh into figures (1 crore = 10,000,000; 1 lakh = 100,000), parsing katha and bigha alongside sqft and sqm, recognising Dhaka-specific amenities (standby generator, lift, gas line, servant quarter, rooftop, CCTV) and Dhaka neighbourhoods. It returns a per-field confidence level and flags what it is less sure about, and every field stays inline-editable before anything is applied.

Direct owner contact with zero broker commission is the standing commercial position. Listing is free.

## Operating Context

- **Market and geography:** Bangladesh, concentrated on Dhaka. Location runs on a structured two-level area hierarchy covering 26 Dhaka neighbourhoods (Gulshan → Gulshan-1, Banani, Dhanmondi, Uttara, Mirpur and others), plus radius search from 1–50 km against map coordinates.
- **Money and measurement:** prices in BDT by default. Area in `sqft`, `katha`, `bigha` or `sqm`. Colloquial crore/lakh input is expected and converted.
- **Seeker workflow:** search or filter by area/category/price/radius → compare verified listings → open full detail (all photos, coordinates, floor, amenities) → contact the owner directly.
- **Owner workflow:** describe the property in plain words → AI extraction fills the fields → review and add photos, floor, facing, amenities → submit for verification → publish free.
- **Device reality:** used on phones and on the web. The same Expo Router route and component tree serves Android, iOS and web.

## Capabilities and Constraints

**Confirmed functionality:** property search, browse and map/list toggle; advanced filtering and sorting; property detail with photo carousel, amenities, highlights and seller card; saved properties; AI-assisted listing intake; a five-step owner creation wizard plus edit; media upload and delete; seller dashboard with verification; buyer and seller profiles; messaging; notifications; admin screens for users, roles, properties and areas; authentication with role-based permissions.

**Domain taxonomy (backend-governed, not a design choice):**
- `type`: `residential` · `commercial` · `land` · `parking`
- `listing_type`: `sale` · `rent`
- `status`: `draft` · `active` · `pending` · `sold` · `archived`
- `subtype` is an open string; documented values live in `PROPERTY_TYPES_SPECIFICATION.md`, which is the source of truth for taxonomy, amenity sets per type, and payload shape.

**Technical constraints:**
- Universal Expo app — React Native 0.86 / React 19 / Expo Router with `react-native-web`. Anything designed must render on React Native primitives, not DOM-only CSS. Web export is static (`expo export --platform web` → `dist/`), deployed via Vercel.
- State architecture is fixed and enforced in `AGENTS.md`: TanStack Query for all server state, Zustand for global client state, local state otherwise. No Redux, no Context for frequently-updating state.
- Forms use React Hook Form + Zod. Icons are `lucide-react-native`. Vector work uses `react-native-svg`.
- Fonts already installed: Inter, Manrope, Plus Jakarta Sans (via `@expo-google-fonts`).
- `userInterfaceStyle` is currently `light`; no dark mode is implemented.

**Explicitly undecided:** dark mode; whether the app ships to the native stores before or after the web launch.

## Brand Commitments

- Name: **HomeNet**. Android package `com.homenet.app`, scheme `homenet`.
- The existing token system in `src/theme/` is the incumbent visual authority: green primary `#04cf92`, near-black warm-green ink `#0B1A17`, white canvas, blue `#2251D6` reserved for the verified badge, orange `#F4823A` for notification/warning/error. Tokens are annotated as matching a Figma source.
- Voice, as committed in `src/content/landingCopy.ts`: plain, specific, verifiable. It names the problem directly and avoids superlatives. Landing copy is centralised in that one file deliberately so claims can be reviewed and swapped without touching layout.
- `MARKET_POSITION_CLAIM` ("Bangladesh's first AI property marketplace") is **disabled in code pending business and legal approval** and must not be used until someone with authority flips it.

## Evidence on Hand

- Real product surfaces exist and are built — the landing showcase renders live components with preview data rather than mockup images.
- `PROPERTY_TYPES_SPECIFICATION.md` — authoritative taxonomy, amenity sets and API payload contract.
- `docs/homenet-prompt-library.md` and `homenet_frontend_integration_guide/` — existing internal documentation.
- A real, working AI extraction demo script with a genuine Gulshan-2 example and per-field confidence values (`AI_DEMO_SCRIPT` in `src/content/landingCopy.ts`).
- Logo/brand assets in `assets/` and `public/`.

**Absences future work must not fabricate.** HomeNet is pre-launch and still in development; a limited amount of real listing inventory exists, but there is **no** verified user count, transaction volume, growth metric, testimonial, case study, press mention or named customer. The landing page already has a deliberate qualitative fallback for the scale section — use it rather than inventing numbers. Do not restore the market-precedence claim. Do not invent pricing tiers, licensing or deployment claims.

## Product Principles

1. **Verification is the product, not a badge.** Anything that weakens the completeness gate — letting a thin listing through, implying verification where there is none — attacks the one reason a seeker trusts this over a Facebook group.
2. **Meet Bangladeshi property language where it already is.** Crore, lakh, katha, bigha, Dhaka neighbourhood names and Dhaka amenities are the native vocabulary. Never force a user to translate into a foreign format first.
3. **Automation states its own uncertainty.** AI-extracted values are shown with confidence, flagged when weak, and always editable before they commit. Never present a machine guess as a settled fact.
4. **No intermediary, in the interface too.** Owner contact is direct and visible on the listing. Nothing in the UI should reintroduce a gatekeeper or imply a fee where there is none.
5. **Claim only what can be substantiated.** Copy stays centralised and verifiable; unproven positioning stays switched off until approved.

## Accessibility & Inclusion

- **WCAG AA contrast is an established working commitment.** `src/theme/colors.ts` documents measured ratios and ships a dedicated `primaryOnLight` (`#0F6D55`, 6.29:1 on white) because the brand green `#04cf92` measures only 2.03:1 and must not carry text or small icons. Preserve this split: brand green for fills, borders and large artwork; `primaryOnLight` for text-size green.
- Touch targets must hold up on phones — this is a hand-held product first, whatever the surface.
- Users span a wide range of technical confidence; owners listing a property are not assumed to be professionals.
- Not yet established: a formal conformance target (AA vs AAA), screen-reader testing coverage, and whether Bengali-language UI is required.
