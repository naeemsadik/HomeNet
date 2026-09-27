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

## 4. Bug — GET /v1/properties returns 500 when `limit` is missing

Observed on 2026-09-27 against `https://homenet-api.vercel.app`:

| Request | Status |
|---|---|
| `GET /v1/properties` | **500** "An unexpected internal server error occurred" |
| `GET /v1/properties?page=1` | **500** |
| `GET /v1/properties?limit=1` | 200 |
| `GET /v1/properties?page=1&limit=1` | 200 |

Every call in the app passes `limit`, so users don't hit this today. But a
missing optional query parameter must never cause a 500. Default `limit` (the
app uses 10–20) and `page` (1) in the DTO, and return 400 with a validation
message for values that are invalid (non-numeric, ≤ 0, above a maximum).

## 5. Status checks the frontend can't make

- **§1 `POST /v1/ai/parse-property`:** a `GET` returns 404 "Cannot GET", but
  that is also what a `POST`-only route returns, so the route's existence
  can't be confirmed from outside. Until it responds, the app shows "Quick
  listing isn't available right now" and offers the step-by-step form.
- **`/v1/guides`** returns 404. The app has `GUIDES_API_ENABLED` off and uses
  its curated guides, validated with the same schema the API response will be.
