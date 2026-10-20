# Releasing HomeNet on Google Play

The code is prepared. These are the steps that remain, in order. Anything marked
**you** needs an account, a decision or a phone that only you have.

Package name: `com.homenet.app`. **It can never be changed after the first upload.**
Confirm it is the one you want before step 3.

## 0. Before every release

```bash
npm run check
```

That runs the typecheck, lint, the web tests, the Android-runtime tests (every route
loaded as a release build, the footer and sign-up form rendered as on a phone) and
`npm run check:android`, which checks icons, permissions, cleartext traffic, the API
address a production build will use, store graphics and the legal pages.

A green run does not replace step 5. Nothing here has run on a real Android device.

## 1. One-time setup (you)

1. **Google Play developer account**: https://play.google.com/console ($25, one time).
   A personal account may be required to run a *closed test* (12 testers, 14 days at
   the time of writing: check the Console) before production access. An organisation
   account is not held to that but needs a D-U-N-S number.
2. **Expo account**: https://expo.dev/signup, then:
   ```bash
   npm install -g eas-cli
   eas login
   eas init            # writes extra.eas.projectId (and owner) into app.json
   ```
   Commit that change to `app.json`.
3. **Let EAS create the upload keystore** the first time you build for production.
   It asks; say yes. Then **download a backup**: `eas credentials`, Android, production,
   download the keystore. Store it somewhere safe (password manager plus an offline
   copy). Play App Signing holds the real signing key; this is only the *upload* key,
   and losing it means a support request to Google.

## 2. Make the website pages live (you)

Play needs the privacy policy and account-deletion pages on the public internet
*before* you submit. They are part of the web build:

- `/privacy`, `/terms`, `/delete-account`

Merge this work and let Vercel deploy, then open
`https://www.homenetbd.com/privacy` in a private window and check it loads. If the
domain is not `www.homenetbd.com`, fix the URLs in `store/listing.md`.

## 3. Build

A phone-installable test build (an APK, not for the store):

```bash
npm run android:apk        # eas build --platform android --profile preview
```

EAS gives a link. Open it on the phone and install.

The store build (an app bundle, `.aab`):

```bash
npm run android:aab        # eas build --platform android --profile production
```

`versionCode` goes up by itself on every production build (`appVersionSource: remote`,
`autoIncrement`). `version` (the 1.0.0 people see) is in `app.json`: raise it for
each release you announce.

The production profile points the app at `https://api.homenetbd.com`. A debug-signed
local build (`cd android && ./gradlew bundleRelease`) is useful to prove the code
compiles, but **Play rejects it**: upload only an EAS build.

## 4. Backend things the app needs (you / the backend team)

| Needed | Why | Where |
|---|---|---|
| Deploy the backend branch `feat/maps-link-resolver-reverse-geocode-area-centres` | Pasting a short Google Maps link, and the address and area from a pin. Without it the app shows "We can't open short links yet" and everything else works. | backend repo |
| **Delete Cloudinary files when an account is deleted** | Deleting an account removes the database rows (listings, saved items, sessions) but **not the photos stored at Cloudinary**. The privacy policy says so honestly; Play expects deletion to remove user data. | `docs/BACKEND_REQUIREMENTS.md` §10 |
| A **reviewer account** with a few listings | Play's reviewer must sign in. Put its email and password in *App content → App access*. | you |
| Social sign-in routes | The Google and Facebook buttons are hidden in the Android app until these exist (`EXPO_PUBLIC_SOCIAL_LOGIN_ENABLED=true` shows them). | backend |

## 5. Test the build on a phone (you)

Install the APK from step 3 on a real Android phone. **Ideally two: an older one
(Android 11 or 12) and a recent one (13 or newer).** Go through this:

- [ ] Opens to the home screen with no crash (the release-only startup crash is fixed;
      confirm it)
- [ ] Browse, search, filter; open a listing; photo gallery; save and unsave
- [ ] Create an account (the terms line is under **Create Account**), sign out, sign in
- [ ] **Create a listing with photos**: tap add photos, pick from the gallery. This
      must work on Android 11/12 *and* 13+, with **no permission prompt**
- [ ] Profile: change name, change photo, change password
- [ ] Switch to বাংলা, **close the app completely and reopen**: it should still be Bangla
- [ ] **Report this listing** opens your mail app with the listing named
- [ ] Profile → Account security → Permanently delete account (use a throwaway account)
- [ ] Back button works on every screen and never closes the app unexpectedly
- [ ] Keyboard never hides the field you are typing in
- [ ] Nothing is hidden behind the status bar or the bottom navigation bar (Android 15
      and newer draw apps edge to edge, and this build targets Android 16)
- [ ] Airplane mode: friendly errors, no blank screen
- [ ] Open `homenet://` links
- [ ] Paste a Google Maps link when adding a listing (needs the backend from step 4)

## 6. Screenshots (you)

Play wants 2 to 8 phone screenshots. Capture them **from the phone or an emulator**
(they must show the real app): home, search results, a listing, the listing form, the
Bangla view. Take them on a phone with content in it, not an empty account. 16:9 or 9:16,
between 320 px and 3840 px on each side. Do not add text overlays that make claims
you cannot back.

## 7. Upload

1. Play Console → **Create app** → name *HomeNet*, default language English,
   *App*, *Free*.
2. Fill **Policy → App content** and the **Data safety** form from `store/listing.md`
   (every answer is there with its reason).
3. **Main store listing**: text from `store/listing.md`, graphics from `store/`, your
   screenshots.
4. **Testing → Internal testing** → create a release → upload the `.aab` → add your
   email as a tester → roll out. Install from the Play link and repeat step 5's list
   once more: this is the exact file users will get.
5. When it is good: **Closed testing** if Google requires it for your account, then
   **Production**.

First reviews usually take a few days. A rejection comes with a reason: fix and resubmit.

## What was changed to get here

Fixed (each has a test):

- **The app crashed on startup in every release build.** `productionConsole.ts` called
  `window.addEventListener`, which does not exist on a phone. Hidden in development
  (it returns early in dev builds). Found by running the code in the Android runtime.
- **Photo upload was blocked on Android 11 and 12.** The code asked for the storage
  permission before opening the photo picker; that request can never be granted
  there. The picker needs no permission, so the five requests were removed.
- **The chosen language was forgotten on Android.** It was saved only in the browser's
  storage. It is now kept on the phone too.
- **The Android app showed a "Get it on Google Play" badge and a "download the app"
  card inside itself**, plus social icons and about a dozen links that all went to
  `/about`. It now has a small footer: Privacy, Terms, Delete account, Contact.
- **Dependencies were off Expo SDK 57's tested versions** (AsyncStorage a whole major
  version ahead, plus patch drift in Expo and React Native). Aligned.
- `app.json` had an invalid key (`usesCleartextTraffic`) that `expo doctor` rejected.

Added:

- Launcher icon, adaptive and themed icons, splash screen (from the existing brand mark).
- Privacy Policy, Terms of Use and Delete-account pages, linked from the app.
- The terms and privacy line under Create Account.
- **Report this listing** on every listing.
- `eas.json` (production builds an app bundle with automatic version codes), and a
  permission clean-up: the release build declares only INTERNET, VIBRATE and
  ACCESS_NETWORK_STATE (none show a prompt), and blocks the camera, microphone, storage,
  photo and fingerprint permissions that its libraries would otherwise add.
- `npm run check:android` and tests that break if any of this regresses.

Hidden or removed so a reviewer does not read it as broken:

- Google and Facebook buttons: Android app only, until the backend supports them.
- Phone and agency boxes on the profile pages: they showed made-up values
  ("+880 1700-000000", "Homenet Verified Partner") and **Save never sent them**.

## Decisions for you

- **Unfinished screens a user can still reach.** *Verification → upload documents*
  says "Coming soon". *Insights* (`/market`) says it will stay empty until there is
  enough data (an honest page, but a main menu item with no content). The admin
  *Settings* card says "coming soon". Reviewers sometimes treat these as an
  incomplete app. Hide them for the first release, or accept the risk.
- **Package name** `com.homenet.app` (see the top).
- **Legal text** was drafted from what the app does. Have someone qualified read the
  Privacy Policy and Terms of Use before launch, particularly the Terms' limits of
  liability. There is no "governing law" clause because that is a legal choice.
- **Forgot password** has no flow: the app tells people to write to hello@homenet.com.bd.
  That is allowed, but check the mailbox is monitored.
- **Contact email domain.** The app's existing contact is `hello@homenet.com.bd`, but the
  website and API are on `homenetbd.com`. Make sure the mailbox exists and is read.
