# Google sign-in

The website's sign-in and sign-up forms show Google's own "Sign in with Google"
button. The API side is `POST /v1/auth/google` (backend branch
`feat/google-sign-in`, `apps/api/docs/google-sign-in.md`).

## How it works

1. `GoogleSignInButton.web.tsx` loads Google's script and draws Google's button.
2. The person picks an account in Google's popup. Google returns an **ID token**
   (`credential`).
3. `authStore.googleLogin` sends it to `POST /v1/auth/google`. The API checks it
   against Google and this app's client id, then answers with the same session
   body as email login. Tokens are stored exactly as for email login.

The Google **client secret is not used** and must not be added anywhere in this
project. Only the public client id is needed.

## To switch it on (you)

1. In Google Cloud, the web OAuth client needs **Authorized JavaScript origins**:
   `https://www.homenetbd.com` (and `http://localhost:8081` for local testing).
2. In the website's Vercel project, set **`EXPO_PUBLIC_GOOGLE_CLIENT_ID`** to the
   client id (`<digits>-<letters>.apps.googleusercontent.com`) and redeploy: the web
   build is static, so it is fixed at build time. Without it there is no Google
   button; nothing else changes.
3. Set **`GOOGLE_CLIENT_IDS`** (the same id) in the backend's environment and deploy
   the backend branch. Until then the API answers 503 and the form shows an error
   if someone taps the button.
4. In Google Cloud, **publish the consent screen** (it is in *Testing* mode, which
   only admits listed test users). Google asks for the privacy policy:
   `https://www.homenetbd.com/privacy`.

## What changed on the website

| Change | Why |
|---|---|
| Google button on sign in / sign up, only when the client id is set | the button was a stub that said "coming soon" |
| **Facebook button removed** | the API has no Facebook route; a button that cannot work is worse than none |
| `vercel.json`: `Cross-Origin-Opener-Policy: same-origin-allow-popups` (was `same-origin`) | `same-origin` cuts the sign-in popup off from the page, so Google's popup cannot report back. `same-origin-allow-popups` is what Google documents. The page is still isolated from other windows that open *it* |
| `vercel.json` CSP: `accounts.google.com/gsi/` added to `script-src`, `style-src`, `connect-src`, `frame-src` | Google's script, button styles, popup frame and token request. Nothing else is allowed from Google |

## Behaviour to know about

- **An email that already has a password account cannot use Google.** The API answers
  409 and the form shows its message ("…Sign in with your email and password
  instead"). Accounts are never merged: password accounts do not verify their email,
  so merging would let the first person to register an address take over its
  owner's Google sign-in.
- **A Google-only account has no password.** "Change password" answers that this
  account signs in with Google.
- If Google's script is blocked (ad blocker, offline) nothing is drawn and the email
  form still works.

## Android

`GoogleSignInButton.android.tsx` opens the phone's own account picker
(`@react-native-google-signin/google-signin`) and sends the ID token to the same
`POST /v1/auth/google`.

- The app passes the **web** client id as `webClientId`, so the token's audience is
  the one the API already checks. The backend needs no new client id.
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is fixed at build time: EAS builds read it from
  `eas.json`, local builds from `.env` / `.env.local`.
- In the same Google Cloud project, create an **Android** OAuth client (package
  `com.homenetbd.app`) for **each** signing certificate's SHA-1: the Play app signing
  key (Play Console), the EAS upload key (`npx eas-cli credentials -p android`) and,
  for local builds, the debug key. Android client ids are not put in the code.
- A build whose certificate is not registered shows "We couldn't sign you in with
  Google" after the account is picked.
- Needs a new native build; it does not work in Expo Go.
- Before release, check that the Play data safety form and the privacy policy cover
  Google sign-in in the app.
