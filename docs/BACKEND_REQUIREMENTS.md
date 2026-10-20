# Backend Requirements — Frontend-Driven

> Contracts the HomeNet app already depends on, or needs next, that the API
> (`homenet-api`) must provide. Each section says what the client does today so
> the two sides can't drift.
>
> Envelope and auth conventions are the same as the module guides
> (`docs/01-auth-module.md`): `{ success, message, data, error_code? }`, and 🔒
> means `Authorization: Bearer <access_token>`.

---

## 1. 🔒 POST /v1/ai/parse-property — Quick listing

> **Status (2026-10-05): not implemented.** The `grok_api_key` branch has no
> `/v1/ai/parse-property`. Its `smart-listing` does something different (§1d).
> The "List with AI" sheet that calls this route therefore shows "Quick listing
> isn't available right now" and offers the step-by-step form.

Turns an owner's free-text description into structured listing fields. Used by
the "List with AI" sheet (`src/features/property/components/AiListingSheet.tsx`
→ `src/services/aiApi.ts`).

**Why server-side:** the AI provider key must never reach the client. Any
`EXPO_PUBLIC_*` variable is inlined into the public JavaScript bundle, so a key
there is published to every visitor. The provider and model are the API's
choice; the client never names a vendor.

### Request

```json
{ "description": "3 bed flat for sale in Dhanmondi, 1650 sqft, 4th floor, south facing, Tk 1.8 crore" }
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `description` | string | Yes | The client sends ≥ 20 characters. Server should cap length (suggest 2,000). |

The client allows a 30 s timeout for this call.

### Success — 200

`data` is an object with any subset of these fields. Every field is optional:
omit what the model couldn't extract rather than guessing.

| Field | Type | Allowed values |
|---|---|---|
| `title`, `description`, `subtype`, `facing`, `address` | string | free text |
| `type` | string | `residential` · `commercial` · `land` · `parking` |
| `listingType` | string | `sale` · `rent` |
| `price`, `areaSize`, `bedrooms`, `bathrooms`, `floor` | string or number | numeric |
| `areaUnit` | string | `sqft` · `katha` · `bigha` · `sqm` |
| `amenities` | object | `{ [amenity]: boolean }` |
| `confidence` | object | `{ [field]: "high" \| "medium" \| "low" }` |

The client validates each field on its own (zod, `aiApi.ts`) and drops only the
fields that fail, so one bad value doesn't discard the rest.

### Errors — the client maps status codes to owner-facing messages

| Status | When | What the owner sees |
|---|---|---|
| 401 | No or expired token | "Please log in to use quick listing." |
| 429 | Per-user daily quota used | Quota message + "Use step-by-step form" button |
| 400 / 422 | Description too short, too long, or unparseable | "We couldn't read that description…" |
| 404 / 5xx | Endpoint not deployed, or every provider down | "Quick listing isn't available right now" + "Use step-by-step form" button |

### Server requirements

- Hold the provider key in server env only; never echo it or a vendor error in `message`.
- Rate-limit per user (a daily quota → 429).
- Validate the model output against the table above before returning it.
- Don't log full descriptions at info level; they can contain phone numbers and addresses.

---

## 1b. POST /v1/properties/smart-search — AI search

**Implemented on branch `grok_api_key`** (`modules/property/smart-searching`);
the frontend is built against it (`src/services/aiApi.ts` → `smartSearch`,
`src/components/AiDescribeSearch.tsx`). One call does everything: the model
turns the query into filters, the API runs them over verified active listings,
and the model writes up to three "why it matches" badges per listing.

**Auth:** public. **Throttle:** 20 requests a minute. **Body:**
`{ query: string (3–300), page?: 1–100, limit?: 1–20 }`.

**Success 200** — `data`:

| Field | Notes |
|---|---|
| `query` | The sanitised query. |
| `filters` | `{ area, listing_type, type, min_price, max_price, bedrooms, bathrooms, amenities[] }`; `null` / `[]` when the query didn't say. Shown to the seeker as "What we understood". |
| `listings[]` | A slim card (not a full Property): `id, title, type, subtype, listing_type, price, price_currency, area_size, area_unit, address, amenities, is_verified, published_at, area{id,name,city}, media[0]` plus `ai_badges: string[]` (empty if the model failed). |
| `pagination` | `{ total, page, limit, total_pages }` — the app's "Show more". |

The client validates every field on its own and drops only what fails; a
malformed listing is skipped, not fatal. `listing_type` may be `short_let`; the
app shows it as a rental.

**Errors the app handles:** 400 (query too short or invalid) → asks for more
words; 429 (throttle) → "Lots of people are searching right now…"; 503 / 502 /
404 → "AI search is busy or unavailable" + a button to the guided questions.

**Turning it on:** the finder shows the box only when the web build has
`EXPO_PUBLIC_AI_SEARCH_ENABLED=true` (`src/lib/features.ts`). Once this route
is live in production, set it in the web project's environment and redeploy —
the web build is static, so it is fixed at build time.

### Findings for the API team (read from the code, not yet run)

1. **"Gulshan 2" finds nothing.** The area filter is
   `a.name ILIKE '%<area>%'` and the area is stored as `Gulshan-2`. People type
   "Gulshan 2", "Gulshan-2", "Gulshan2". Normalise both sides (strip spaces and
   hyphens), or match by token.
2. **"Uttara" misses its sectors.** Sub-areas are named `Sector-7` etc., which
   don't contain "Uttara", so a search for Uttara returns only listings filed
   under the parent itself (none today). Match a parent's children by
   `parent_area_id`, as in §1c. (`Gulshan` and `Mirpur` do work, because their
   children's names contain the parent's.)
3. **The throttle is probably one bucket for the whole site.** Behind nginx
   without `trust proxy`, every visitor shares one IP, so "20 a minute" is 20
   AI searches a minute across all users. Set `trust proxy` and have nginx
   overwrite `X-Forwarded-For`.
4. **Badges can contain wrong numbers.** `SEARCH_BADGES_PROMPT` allows
   examples like "12% under budget"; models are unreliable at arithmetic. Either
   compute such badges in code, or forbid numeric claims in the prompt. The app
   labels badges as AI-written.
5. **A query with no recognisable filter returns every verified listing.** The
   app hides them (an unfiltered list isn't an answer), but the API could return
   an empty list or a flag.
6. **Optional:** accept `filters` in the body to skip the model, so the app
   could let a seeker remove a chip without a new AI call.
7. `llm-client.service.ts` still explains its 25 s budget as "Vercel's 30 s
   maxDuration"; the API is on a VPS now (the budget is still sensible).

## 1c. `area_id` on GET /v1/properties doesn't include sub-areas

Observed against `https://api.homenetbd.com` on 2026-10-05:

| Request | `total` |
|---|---|
| `?status=active&area_id=<Gulshan>` | **0** |
| `…&area_id=<Gulshan-1>` | 1 |
| `…&area_id=<Gulshan-2>` | 1 |
| `…&area_id=<Mirpur>` / `<Uttara>` | **0** (listings are under Mirpur-10, Sector-7…) |

Listings are attached to the sub-area, so filtering by the parent a seeker
actually names ("Gulshan") finds nothing. The app works around it by sending
one request per sub-area and merging (`getPropertiesInAreas`,
`src/services/propertyApi.ts`). Better: make a parent `area_id` match its
children as well. The app's merge de-duplicates by id, so it keeps working
either way.

Also: `GET /v1/areas` returns six test rows ("Postman Area …", "Postman Geo
…") in production data. Anything that lists all areas, such as the area picker, can show them.

---

## 1d. POST /v1/properties/smart-listing — listing copy

**Implemented on branch `grok_api_key`; the frontend does not call it yet.**
It is not the free-text parser of §1: it takes the facts the owner already
filled in and writes the copy.

🔒 Body: `{ area_id, type, listing_type, price (BDT), area_size (sqft),
bedrooms?, bathrooms?, notes? (≤1000) }`. Returns `{ headline, description_en,
description_bn, amenity_tags[], price_analysis{ your_price_per_sqft,
area_avg_price_per_sqft, sample_size, diff_pct, summary } }`. Throttle 20 a minute.

Planned use: a "Write my description with AI" button on the listing wizard's
description step — English and Bangla drafts the owner can edit, plus the price
comparison.

Findings:

1. **The price comparison needs a minimum sample.** `docs/AI_LAYER.md` says no
   estimate below 5 comparables. The code compares against any `sample_size`
   above 0, so one other listing becomes "the area average" (today the whole
   site has 13 active listings). Return `area_avg_price_per_sqft: null` below the
   threshold; the prompt already handles null.
2. The comparison uses the exact `area_id`, so it ignores a parent's sub-areas
   (§1c).
3. **No per-user daily quota**, as §1 requires: any signed-in user can spend model
   calls up to the throttle. See finding 3 under §1b.

---

## 2. Auth tokens in httpOnly cookies (web)

**Today:** on web, `src/services/tokenStorage.ts` keeps the access and refresh
tokens in `localStorage`, which any script running on the page can read. The CSP
(`vercel.json`) limits which scripts can run, but it can't protect a token that
has already been read. Native builds use the OS keychain and aren't affected.

### What the API needs to do

1. **Set tokens as cookies** on `POST /v1/auth/login`, `/register` and `/refresh`:
   - `Set-Cookie: hn_access=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=<access TTL>`
   - `Set-Cookie: hn_refresh=…; HttpOnly; Secure; SameSite=Strict; Path=/v1/auth/refresh; Max-Age=<refresh TTL>`
   - Keep returning tokens in the JSON body for native clients (they send `Authorization: Bearer`).
2. **Read the access token from the cookie** when there's no `Authorization` header.
3. **`POST /v1/auth/logout`** clears both cookies (`Max-Age=0`).
4. **CSRF protection** for cookie-authenticated, state-changing requests. For example, a double-submit token: a readable `hn_csrf` cookie that the client echoes in an `X-CSRF-Token` header.
5. **CORS:** `Access-Control-Allow-Credentials: true` with an explicit origin allow-list. A wildcard `*` origin isn't allowed with credentials.

### Blocker: the API must be same-site with the web app

The API is currently served from `homenet-api.vercel.app`, which is a different
site from the web app. Browsers treat cookies set by a cross-site API as
third-party cookies, and increasingly block them. Before cookies can work, pick
one of these:

- Serve the API from a subdomain of the web app's domain (e.g. `api.<domain>`), or
- Proxy it through the web app's origin with a Vercel rewrite (`/api/:path*` → `https://homenet-api.vercel.app/:path*`).

### Frontend follow-up (after the API ships)

- `apiClient`: `withCredentials: true` on web, and send the CSRF header.
- `tokenStorage.ts`: on web, stop writing tokens and have `getAccessToken()` return `null`.
- Delete the old `homenet.access_token` / `homenet.refresh_token` keys from `localStorage` on first load.

---

## 3. Future — AI valuation and recommendation on the property page

`PropertyDetailScreen` has two cards that never render because no API field
feeds them (`aiValuation` and `aiRecommendation` are hard-coded `null`, with a
comment). To switch them on, `GET /v1/properties/:id` would add:

| Field | Type | Notes |
|---|---|---|
| `ai_valuation.estimated_value` | string | Formatted amount. The card appends the listing's price period (`/mo` for rentals, nothing for sale). |
| `ai_valuation.comparison_text` | string | One sentence comparing the asking price with the estimate. |
| `ai_valuation.trend` | string | Short trend label, e.g. "+4% in 6 months". |
| `ai_recommendation` | string | One or two sentences for buyers. |

Both should be `null` until the model has enough comparable listings. Say
where the numbers come from, and never present them as an appraisal.

---

## 4. Bug — unfiltered GET /v1/properties returns 500

Observed on 2026-09-27 against `https://homenet-api.vercel.app`:

| Request | Status |
|---|---|
| `GET /v1/properties` | **500** "An unexpected internal server error occurred" |
| `GET /v1/properties?page=1&limit=20` | **500** |
| `GET /v1/properties?page=1&limit=1` | 200 |
| `GET /v1/properties?status=active&sort_by=view_count_desc&page=1&limit=10` | 200 |
| `GET /v1/properties?listing_type=sale&page=1&limit=20` | 200 |
| `GET /v1/properties?listing_type=rent&page=1&limit=20` | 200 |

Whether the request fails depends on which rows it returns, not on which
parameters it sends. So one or more records most likely fail serialization, for
example a listing whose `listing_type` is neither `sale` nor `rent`, or one with
a missing relation. Filtered queries skip the bad record(s). The app's Buy, Rent,
home and similar-listing queries all filter, so users don't hit this today. But
any unfiltered call, or a filter that happens to include the bad record, will
fail. Find the record in the server logs, fix the data, and make the list
endpoint skip or repair a bad row rather than fail the whole page.

## 5. Status checks the frontend can't make

- **§1 `POST /v1/ai/parse-property`:** a `GET` returns 404 "Cannot GET", but
  that is also what a `POST`-only route returns, so the route's existence
  can't be confirmed from outside. Until it responds, the app shows "Quick
  listing isn't available right now" and offers the step-by-step form.
- **§1b `POST /v1/properties/smart-search`:** built on the `grok_api_key`
  branch, not yet deployed. The finder hides its "describe it" box until the web
  build sets `EXPO_PUBLIC_AI_SEARCH_ENABLED`.
- **`/v1/guides`** returns 404. The app has `GUIDES_API_ENABLED` off and uses
  its curated guides, validated with the same schema the API response will be.


---

> **Status of §6–§9 (2026-10-12): built on the backend branch
> `feat/maps-link-resolver-reverse-geocode-area-centres`, not yet merged or deployed.**
> The shipped contract is in the backend's `apps/api/docs/maps-api.md`. Where it differs
> from what is written below, **it wins**; the differences are called out in each section.

## 6. Custom subtypes

The listing wizard lets an owner type a subtype that is not in the list (**Other**) for residential, commercial and land. The API already accepts any text there, which is what the app relies on. Three small asks:

1. **Cap and tidy `subtype` in `UpsertPropertyDto`.** It is a bare `@IsString()` today, so a client can send megabytes. The app sends at most 40 characters, single-spaced, with no angle brackets. Suggested: `@MaxLength(50)` and the same `trim` transform `title` has.
2. **Parking stays restricted** to `covered`, `open` and `garage` (`property.rules.ts`). The app does not offer Other for parking. If you want custom parking subtypes later, relax that rule and tell the app, which has a one-line flag per category (`allowsCustomSubtype`).
3. **Optional: list the subtypes in use.** `GET /v1/properties?subtype=` matches one value, and Browse has no subtype filter yet (only categories), so a custom subtype is found under its category. When Browse gets a subtype filter, a `GET /v1/properties/subtypes?type=` returning the distinct values in use would let it offer the custom ones too.

---

## 7. Validate `location_lat` / `location_lng` ranges

`UpsertPropertyDto` accepts any number for both (`@IsOptional() @IsNumber()`, nothing else), so the API stores a longitude of 912 without complaint. The listing wizard now rejects it before sending, but the API is the last line of defence and other clients exist.

- `location_lat`: `@Min(-90) @Max(90)`.
- `location_lng`: `@Min(-180) @Max(180)`.

Related: `submitForVerification` rejects a listing when `!property.location_lat` or `!property.location_lng`, which also treats a valid `0` as missing. Harmless for Bangladesh, but `== null` is the precise check.

For the product, exact coordinates are what make the radius search and the map trustworthy, so they are required to submit for verification (not to save a draft). Owners never see or type coordinates: the wizard takes them from a map pin, the device location, or a pasted Google Maps link (see §8).

---

## 8. 🔒 POST /v1/maps/resolve-link — follow a short Google Maps link

**Built.** Verified against real Google links. One finding changes what the form can
promise: a link to a **named place** (a shop, a restaurant) redirects to
`google.com/maps?q=<name>&ftid=…` with **no coordinates**, and the page behind it
centres on where the request came from, not on the place. The API therefore answers
**422 / 1701** for those, and only links that carry a point resolve: a place Google
knows by area or address, and a **dropped pin**. The form's "This link names a place
but not its exact spot…" message is correct and stays. Errors: 400 / 1700 not a short
link, 422 / 1701 no exact spot, 502 / 1702 Google didn't answer, 429 over 10 a minute
per user.

Owners paste a Google Maps link to say where their property is. A long link
(`google.com/maps/…@23.81,90.41…`) is read in the app. But **the Share button in
the Google Maps phone app copies a short link** (`https://maps.app.goo.gl/AbC…`),
which only redirects to the long one. A browser can't follow that redirect (it is
cross-origin and unreadable), so the API has to. The app already calls this route
(`src/services/mapApi.ts`); until it exists the form tells the owner to paste the
full address from the browser's address bar, or tap the map.

### Request

```json
{ "url": "https://maps.app.goo.gl/AbCdEf123" }
```

`url`: string, at most 500 characters.

### Success — 200

```json
{ "success": true, "message": "OK", "data": { "lat": 23.7931, "lng": 90.4065 } }
```

### Errors

| Status | When |
|---|---|
| 400 | The host isn't on the allow-list below, or the URL is malformed. |
| 422 | The link was followed but holds no coordinates (e.g. it names a place only). |
| 429 | Per-user rate limit. |
| 502 | Google didn't answer in time. |

### Server requirements — this fetches a URL on a user's behalf, so it must not become an open proxy (SSRF)

- **Allow-list the *starting* host:** `maps.app.goo.gl`, and `goo.gl` with a path starting `/maps`. Reject everything else with 400. Never fetch a user-supplied host outside that list.
- **Follow redirects yourself**, at most 5 hops, and only to `google.<tld>` hosts (match `(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$`). Refuse any redirect to another host, to an IP address, to `localhost` or to a private range.
- Total timeout of about 5 s; send no cookies or user headers; read no response body, the final URL is enough.
- Take the coordinates from the final URL in this order: `!3d<lat>!4d<lng>` (the place's pin), then `@<lat>,<lng>`, then a `q` / `ll` / `query` parameter. Validate lat −90…90 and lng −180…180.
- Rate-limit per user (a few dozen a day is plenty) and cache by URL for 24 hours.
- Log the host and outcome, not the full URL.

---

## 9. 🔒 GET /v1/maps/reverse — what is at a pin (address and area)

**Built, with these differences from the text below:** the response uses snake_case,
`{ address, area: { id, name, city, parent_area_id } | null, area_source: "name" |
"nearest" | null }`. There is no `boundary` source: no polygon data exists yet, only
**centres**, so an area is chosen by the neighbourhood names around the pin, else the
nearest top-level area within 2 km. `Area` gained nullable `center_lat` / `center_lng`
(returned by `GET /v1/areas`), backfilled for the 12 listed neighbourhoods; sub-areas
have none and use their parent's. When the address lookup is down the route still
answers with the nearest area and `address: null`. The app can now drop the hard-coded
`areaCenters.ts` and `https://nominatim.openstreetmap.org` in `connect-src`.

Owners pin their property on a map or paste a Google Maps link, and the listing
form then fills in the **address** and **area** from that pin so they have
nothing else to enter (`WizardLocationStep.tsx`). Today the browser asks
OpenStreetMap's public Nominatim directly (`src/services/geocodeApi.ts`) and then
matches the answer to HomeNet's areas with a name match plus a hard-coded table
of neighbourhood centres (`areaCenters.ts`). That is fine for a pilot and wrong
for scale:

- every owner's browser makes the request, and Nominatim limits by IP and bans heavy users;
- nothing is cached across owners (the same Gulshan road is looked up again and again);
- the area decision lives in the app, guessed from names and about-1 km centres.

### Request / response

`GET /v1/maps/reverse?lat=23.7931&lng=90.4065`

```json
{
  "success": true, "message": "OK",
  "data": {
    "address": "Enamul Haque Chowdhury Road, Road 10, Korail, Gulshan, Dhaka",
    "area": { "id": "gulshan-dhaka", "name": "Gulshan", "city": "Dhaka" },
    "areaSource": "boundary"
  }
}
```

`address` and `area` are each `null` when unknown. `areaSource` is `boundary`
(the pin is inside the area's polygon), `nearest` (outside every polygon, within
2 km of an area's centre) or `name` (matched from the geocoder's neighbourhood
names). The app shows "set from your pin" for the first and "nearest listed area"
for the other two, and lets the owner change it.

### Server requirements

- Call the geocoder from the API with an identifying `User-Agent`, a global limit of 1 request a second, and a 30-day cache keyed by the coordinates rounded to 4 decimals (about 10 m).
- Use only neighbourhood-level fields (`neighbourhood`, `quarter`, `suburb`, `residential`, `city_district`) to name an area. **Never** shop, amenity or building names: a pin in Gulshan next to a shop called "Luxury Lifestyle (Banani)" came back with that name first.
- Add `center_lat`, `center_lng` and, better, a boundary polygon (GeoJSON) to `Area`, and decide the area by containment. This replaces the app's hard-coded centres. OpenStreetMap's administrative boundaries for Dhaka can seed it.
- Validate lat/lng ranges (see §7). Rate-limit per user.

When this exists, the app swaps `reverseGeocode` for this call and drops
`https://nominatim.openstreetmap.org` from `connect-src` in `vercel.json`.

---

## 10. Deleting an account must delete the uploaded files too

`DELETE /v1/users/:id` removes the user row, and the database cascades remove the
auth identities, roles, refresh tokens, the user's properties (and their
`PropertyMedia` rows), saved properties, notifications and `UserAsset` rows. It does
**not** delete the files at Cloudinary: the avatar (`UserAsset.asset_id`) and every
listing photo or video (`PropertyMedia.public_id`) stay there, reachable by URL, with no
database row left pointing at them.

Google Play's account-deletion policy expects the data tied to an account to be
deleted with it, and the privacy page currently has to say that files may remain until
we erase them by hand.

**Ask:** before deleting the user, read `UserAsset.asset_id` and the
`PropertyMedia.public_id` of that user's properties, delete each from Cloudinary
(best effort: log a failure, do not block the deletion), then delete the user. The
same applies to a hard delete of a single property. When this ships, change the
"Photos and videos are stored with our media provider..." paragraphs in
`src/content/legal.ts` (Privacy Policy, *How long we keep it*, and the Delete account
page, *What may remain*) and remove the "may stay with the provider" test in
`src/content/__tests__/legal.test.ts`.
