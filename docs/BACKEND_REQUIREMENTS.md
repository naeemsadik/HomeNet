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

## 1b. POST /v1/ai/parse-search — AI search

Turns a seeker's plain-words query into **search filters**. Used by the AI
Finder's "describe it" box (`src/components/AiDescribeSearch.tsx` →
`src/services/aiApi.ts`). The model only produces filters: the listings
themselves come from the normal `GET /v1/properties` with those filters, so the
AI never invents or ranks a listing. This is `parseSearchQuery` in
`docs/AI_LAYER.md` (FR-08).

**Auth:** optional. Seekers search before they sign in, so the route should be
`@Public()`; if a token is sent, use it for the quota. Rate-limit per user, and
per IP when anonymous (a daily quota → 429).

### Request

```json
{ "query": "3 bedroom flat for sale in Gulshan under 3 crore, near the metro" }
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `query` | string | Yes | The client sends 3–500 characters (`maxLength` on the box). Validate and cap server-side. |

The client allows a 20 s timeout.

### Success — 200

`data` holds any subset of these fields. **Omit what the query didn't say;
never guess.** These are exactly the filters `GET /v1/properties` can apply.

| Field | Type | Notes |
|---|---|---|
| `listingType` | `sale` · `rent` | |
| `type` | `residential` · `commercial` · `land` · `parking` | A flat, apartment or house is `residential`. |
| `minPrice`, `maxPrice` | number, BDT | "under 2 crore" → `maxPrice: 20000000`. 1 crore = 10,000,000; 1 lakh = 100,000. |
| `minArea`, `maxArea` | number, **sq ft** | Convert katha / bigha / sqm. See the open question below. |
| `bedrooms`, `bathrooms` | integer | Treated as a minimum ("3+"). |
| `areaName` | string | The place as the seeker said it ("Gulshan 2"). The app matches it to an area; send the name, not an id. |
| `city` | string | Only if a city is named. |
| `unmatched` | string[] | Parts of the query no filter can express ("near the metro", "south facing"). Shown to the seeker as "not applied". |
| `summary` | string | One plain sentence of what was understood. |
| `confidence` | `{ [field]: "high" \| "medium" \| "low" }` | Keyed by the field names above. `low` shows a "check this" flag. |

The client validates each field on its own (zod, `aiApi.ts`) and drops only the
ones that fail. Returning `{}` is valid: the app tells the seeker nothing was
understood and does **not** list everything.

**Example:** `"3 bhk flat rent Dhanmondi max 40k"` →

```json
{
  "listingType": "rent", "type": "residential", "bedrooms": 3,
  "maxPrice": 40000, "areaName": "Dhanmondi", "city": "Dhaka",
  "summary": "A 3 bedroom flat to rent in Dhanmondi, up to ৳ 40,000.",
  "confidence": { "bedrooms": "medium", "maxPrice": "high" }
}
```

### Errors — same mapping as §1

| Status | When | What the seeker sees |
|---|---|---|
| 401 | Only if the route is not public | "Please log in to use AI search." |
| 429 | Quota used | Limit message + "Answer guided questions" button |
| 400 / 422 | Empty, too long or unparseable | "We couldn't make sense of that…" with an example |
| 404 / 5xx | Not deployed, or every provider down | "AI search isn't available right now" + "Answer guided questions" button |

### Server requirements

- Same as §1: key in server env only, validate the model output against the
  table above, never echo a vendor error, don't log full queries at info level.
- Accept Bangla and Banglish queries ("৩ বেডরুম ফ্ল্যাট গুলশানে"), not only English.
- Cache by normalised query for ~5 minutes (`docs/AI_LAYER.md`).

### Turning it on

The finder shows the box only when the web build has
`EXPO_PUBLIC_AI_SEARCH_ENABLED=true` (`src/lib/features.ts`). Until then it
shows the guided questions alone. Once this route is live in production, set
the variable in the web project's environment and redeploy — the web build is
static, so it is fixed at build time.

### Open questions for the API team

1. Does `min_area` / `max_area` on `GET /v1/properties` compare against
   `area_size` as stored, or in square feet? The client passes square feet.
2. Is `bedrooms` an exact match or a minimum? The Browse screen and the finder
   both treat it as a minimum ("3+").

---

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
- **§1b `POST /v1/ai/parse-search`:** same situation. The finder hides its
  "describe it" box until the web build sets `EXPO_PUBLIC_AI_SEARCH_ENABLED`.
- **`/v1/guides`** returns 404. The app has `GUIDES_API_ENABLED` off and uses
  its curated guides, validated with the same schema the API response will be.
