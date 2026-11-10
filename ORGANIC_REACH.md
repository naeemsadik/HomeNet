# Organic reach playbook

How HomeNet earns visits without paying for ads. It follows the seven tactics in the
"Core things to dominate Google's organic" video (EMD, parasite ranking, backlinks,
local citations, Web 2.0, social profiles, Reddit profiles), says what the code already
does for each, and what a person has to do by hand, because most of it happens on other
people's websites.

**Rule for all of it:** every post, profile and link must be real, useful and honest about
who is behind it. Fake accounts, spun articles and bought links get removed or penalised,
and they put the main site's ranking at risk. The "safe version" column is the one we do.

| Tactic | What it means | Risk if done the spammy way | The safe version we do | Status |
|---|---|---|---|---|
| **EMD** (exact-match domain) | A domain that is the search phrase, like `flatrentdhaka.com` | It no longer gives a ranking boost, and splitting content over domains splits authority | One domain, `www.homenetbd.com`. If we ever buy others, 301-redirect them to it | Done: one canonical domain. Nothing to buy |
| **Parasite ranking** | Publishing on high-authority sites (LinkedIn, Medium, Quora) so the post ranks | Google's "site reputation abuse" rules target thin third-party content made only to rank | Post real, useful articles there (guides, price explainers) with one link to the matching HomeNet guide | By hand, see below |
| **Backlinks, mostly free** | Other sites linking to ours | Bought links and link networks cause penalties | Earn them: guides worth citing, partnerships, press, directories | Guides exist, outreach by hand |
| **Local citations** | HomeNet's name, address and phone listed the same way across the web | Different details in different places confuse search engines | One exact name/address/phone, published everywhere and in our structured data | Needs the owner's details, see TODO |
| **Web 2.0** | Free blog platforms (Blogger, WordPress.com, Medium, Substack) | Spun or duplicated posts get deindexed | One original post per guide, written for readers, linking to the guide | By hand |
| **Social profiles** | Official accounts that point at the site | Fake or empty accounts look like spam | Same name, logo and description on every profile; the site links to them and lists them in `sameAs` | Facebook, LinkedIn, YouTube done. X, Instagram, TikTok need creating |
| **Reddit profiles** | Taking part in communities such as r/bangladesh and r/dhaka | Self-promotion and multiple accounts get banned fast | One real account that says it's from HomeNet; answer renting and buying questions first, link only when it truly helps | By hand |

## What the code does (this branch)

- `src/content/socialProfiles.ts` is the one list of official profiles. The mobile and
  desktop footers link to them (in a new tab) and the site's
  structured data publishes them as `sameAs`, which is how search engines connect those
  accounts to the site. A network set to `null` is not shown anywhere, so no icon goes to
  a page that doesn't exist. (The desktop footer's icons used to link nowhere.)
- Sharing a listing or guide from the phone app now includes the page's address. It used
  to share the title only, so a share from the app carried no link back. The link is tagged
  `utm_source=homenet_app&utm_medium=share` so those visits show up as their own source.
  The property page's WhatsApp "book a visit" message includes the link as well.
- `absoluteUrl(path)` in `src/lib/seo.ts` builds a public address from a path, so there is
  one place that decides what a page's address is.

## To do by hand

### Owner details (unblocks local citations)
Fill the `null`s in `src/lib/schema/brand.ts`: `telephone`, `address` and `geo`. They are
left out of the markup until they are real. Whatever goes there is the exact name, address
and phone to use everywhere below.

### Profiles
1. Create X, Instagram and TikTok accounts, then paste each URL into `socialProfiles.ts`.
2. Same name ("HomeNet BD"), logo (`public/logo.png`) and one-line description on all of them.
3. Put `https://www.homenetbd.com` as the website on every profile.

### Local citations
Claim or create, using the exact same name, address and phone:
Google Business Profile, Bing Places, Apple Business Connect, the Facebook Page, the
LinkedIn company page, and any Bangladeshi business or property directories you trust.
Skip any directory that asks for money to list you without showing real traffic.

### Content that earns links
- Turn each guide in `/guides` into one original post on a free blog platform and one
  LinkedIn article. Write it fresh, add something the guide doesn't have, and link to the
  guide with a plain link. Don't copy the guide word for word.
- Offer the area price and rent data, or a guide, to property bloggers, journalists and
  Facebook groups, as something they can quote.
- Ask partner developers and agencies to link to HomeNet from their own sites.

### Reddit and communities
Use one real account that says it works at HomeNet. Spend most of your time answering
questions (deposits, namjari, rent rules) with no link at all. Share a guide only when it
is the best answer. Read each community's rules before posting.

## Measuring it
- **Google Search Console:** impressions, clicks and the pages that earn them. Check
  weekly, and request indexing for each new guide.
- **Analytics:** filter on `utm_source=homenet_app` to see visits from shares in the app.
  Use the same idea (`utm_source=reddit`, `utm_source=linkedin`) on links you post yourself.
- **Backlinks:** Search Console, Links report, lists who links to the site. Note new ones
  monthly and thank or follow up with the good ones.

## Not worth doing
Buying links, link networks, auto-generated or spun articles, many fake social or Reddit
accounts, and stuffing keywords. They give short-term spikes and long-term penalties.
