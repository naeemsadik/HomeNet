# HomeNet

HomeNet is a universal Expo application built with React Native and Expo Router. The same route and component tree runs on Android, iOS, and the web.

## Run the project

```bash
npm install
npm start
```

From the Expo terminal:

- Press `w` to open the web app.
- Press `a` to open Android.
- Press `i` to open iOS on macOS.
- Scan the QR code with Expo Go to run on a physical device.

The Expo server can keep the native app and web app running at the same time.

## Other commands

```bash
npm run web
npm run android
npm run ios
npm run typecheck
npm run export:web
npm run check            # typecheck, lint, tests, Android-runtime tests, release preflight
```

The production web export is written to `dist/`.

## Releasing the Android app

See [RELEASE_ANDROID.md](./RELEASE_ANDROID.md): build, test on a phone, and the Google Play steps. The store listing text and graphics are in [store/](./store).
