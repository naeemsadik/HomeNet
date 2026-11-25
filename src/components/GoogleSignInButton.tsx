export interface GoogleSignInButtonProps {
  /** Which form the button sits in: it only changes the button's wording. */
  mode: "signin" | "signup";
  /** Called with the ID token (the "credential") Google returns. */
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}

/**
 * Metro picks GoogleSignInButton.web.tsx for the website and
 * GoogleSignInButton.android.tsx for the Android app. This one is what other
 * platforms get: no button (see GOOGLE_SIGN_IN_AVAILABLE in src/lib/features.ts).
 */
export function GoogleSignInButton(_props: GoogleSignInButtonProps) {
  return null;
}
