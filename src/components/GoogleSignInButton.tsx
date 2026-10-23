export interface GoogleSignInButtonProps {
  /** Which form the button sits in: it only changes the button's wording. */
  mode: "signin" | "signup";
  /** Called with the ID token (the "credential") Google returns. */
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}

/**
 * Google sign-in is a website feature for now (see GOOGLE_SIGN_IN_AVAILABLE in
 * src/lib/features.ts); the Android app has no Google client id yet. The real
 * button is GoogleSignInButton.web.tsx, which Metro picks for the web build.
 */
export function GoogleSignInButton(_props: GoogleSignInButtonProps) {
  return null;
}
