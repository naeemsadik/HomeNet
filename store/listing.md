# Google Play listing: HomeNet

Draft text for the Play Console, written only from what the app does and from
`PRODUCT.md`. **Nothing here has been approved by the business.** Read each claim
against the live product before pasting it. Two are marked ⚠.

## Main store listing

**App name** (30 characters max)

```
HomeNet
```

**Short description** (80 max)

```
Find and list property in Bangladesh, directly with owners.
```

**Full description** (4000 max)

```
HomeNet is a property marketplace for Bangladesh. Owners list their own property directly, and people looking for a home contact owners directly.

FOR PEOPLE LOOKING FOR A HOME
• Browse flats, houses, land, commercial space and parking to buy or rent, mostly across Dhaka
• Search and filter by area, category and price
• See full details: photos, location on a map, size, rooms and amenities
• Save the listings you like
• Contact the owner directly

FOR OWNERS
• List your property yourself, step by step
• Listing is free
• Add photos and pin the exact location
• Listings are reviewed before they are published ⚠

IN YOUR LANGUAGE
• English and বাংলা, switch any time

YOUR DATA
• Delete your account and listings inside the app
• No ads. No tracking.

Questions: hello@homenet.com.bd
```

⚠ *"Listings are reviewed before they are published"*: true only if the review step
is actually staffed at launch. If it is not, remove the line (`PRODUCT.md` makes
verification the core promise, so do not leave it in unless it holds).
⚠ *"No ads. No tracking."*: true today (no ad or analytics SDK). If analytics are
added, change this and the Data safety form.

**Not used on purpose:** "first", "best", "#1", any number of users, listings or
transactions (none can be backed up pre-launch), and the disabled
`MARKET_POSITION_CLAIM`.

## Graphics (already in this folder)

| Play field | File | Size |
|---|---|---|
| App icon | `play-icon-512.png` | 512 × 512 |
| Feature graphic | `feature-graphic-1024x500.png` | 1024 × 500 |
| Phone screenshots (2 to 8) | **you capture these** | see `RELEASE_ANDROID.md` |

## Category and contact

- **Category:** House & Home
- **Email:** hello@homenet.com.bd (confirm it is read: Play shows it publicly, and Google writes to it)
- **Website:** https://www.homenetbd.com (confirm the domain)
- **Privacy policy URL:** https://www.homenetbd.com/privacy

## App content (Play Console → Policy → App content)

| Question | Answer | Why |
|---|---|---|
| Privacy policy | `https://www.homenetbd.com/privacy` | Page exists in the app's web build. Deploy before submitting. |
| App access | **Restricted**: give a test account | Listing and saving need sign-in. Create a dedicated reviewer account and give its email and password in the form. |
| Ads | **No ads** | No ad SDK. |
| Target audience | **18 and over** | Property marketplace; keeps you out of the Families policy. |
| News app | No | |
| COVID-19 contact tracing / status | No | |
| Data safety | See below | |
| Government app | No | |
| Financial features | None | The app does not handle payments or loans. |
| Health | None | |

### Content rating questionnaire (IARC)

Category: *Utility / Reference or Social*, whichever fits the form's wording. Answer
honestly: **users can post content that others see** (listings, photos), **no**
violence, sexual content, profanity, gambling, drugs or user-to-user messaging
inside the app. Expect a low rating (Everyone / 3+ / PEGI 3 with the
"users interact" note).

### User-generated content (UGC) policy

Play requires: terms users accept before posting, a way to report content, and
moderation. All three exist:

- Terms and privacy are linked under **Create Account** in the app.
- **Report this listing** is on every listing page.
- Listings are reviewed before publishing (⚠ see above), and the Terms allow removal.

### Account deletion

- In the app: Profile → Account security → Permanently delete account.
- Web link for the form: `https://www.homenetbd.com/delete-account`.

## Data safety form

Collected, all **required to use the app unless marked optional**. Encrypted in
transit: **yes (HTTPS)**. Users can ask for deletion: **yes (in the app and at the
web link above)**.

| Data type | Collected | Shared | Purpose | Optional? |
|---|---|---|---|---|
| Name | Yes | No | Account management | Required |
| Email address | Yes | No | Account management, support | Required |
| Address (the listing's address and map pin) | Yes | No | App functionality | Optional (owners only) |
| Photos | Yes | No | App functionality (profile photo, listing photos) | Optional |
| Videos | Yes | No | App functionality (listing videos) | Optional |
| Other user-generated content (listing text) | Yes | No | App functionality | Optional |
| Approximate or precise location (device) | **No** | | | |
| Contacts, calendar, messages, files | **No** | | | |
| Device or other IDs, advertising ID | **No** | | | |
| App activity, web browsing, crashes, diagnostics | **No** | | | |
| Financial or health data | **No** | | | |

"Shared: No" is right when the only recipients are service providers acting for
HomeNet (the host and Cloudinary, which stores photos). Play does not count that as
sharing. If a recipient ever uses the data for its own purposes, change this.

## What a reviewer needs from you

1. A **test account** (email + password) that is not a real person's, with a few
   listings, so they can see the app populated.
2. The **privacy page live** at the URL above before you submit.
3. The **backend deployed** with the Maps endpoints (pasting a short Google Maps
   link depends on it).
