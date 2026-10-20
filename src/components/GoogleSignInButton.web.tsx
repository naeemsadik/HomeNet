import { useEffect, useRef } from "react";

import type { GoogleSignInButtonProps } from "@/components/GoogleSignInButton";
import { GOOGLE_CLIENT_ID } from "@/lib/features";

// The slice of Google Identity Services this file uses.
// https://developers.google.com/identity/gsi/web/reference/js-reference
interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode: "popup";
    auto_select: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      shape: "pill";
      text: "signin_with" | "signup_with";
      logo_alignment: "left";
      width: number;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";
/** Google draws the button between these widths. */
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

let scriptPromise: Promise<GoogleAccountsId> | null = null;

/** Loads Google's script once. A failed load (blocked, offline) can be retried. */
function loadGoogle(): Promise<GoogleAccountsId> {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => {
      const api = window.google?.accounts?.id;
      if (api) resolve(api);
      else reject(new Error("Google sign-in did not load"));
    };
    script.onerror = () => reject(new Error("Google sign-in could not be reached"));
    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = null;
    document.querySelector(`script[src="${GIS_SRC}"]`)?.remove();
    throw error;
  });
  return scriptPromise;
}

// Google's initialize() belongs to the page, not to a component, and warns if it
// is called again. It is called once; whichever button is on screen is the
// current receiver of the credential.
let initialized = false;
let receiver: ((idToken: string) => void) | null = null;

function initializeOnce(api: GoogleAccountsId, clientId: string) {
  if (initialized) return;
  api.initialize({
    client_id: clientId,
    callback: ({ credential }) => {
      if (credential) receiver?.(credential);
    },
    ux_mode: "popup",
    auto_select: false,
  });
  initialized = true;
}

/**
 * Google's own "Sign in with Google" button. It is Google's rendering on
 * purpose: Google requires its branding, and this is the flow that hands us an
 * ID token the API can verify. If Google's script is blocked or fails, nothing
 * is drawn and the email form below still works.
 */
export function GoogleSignInButton({ mode, onCredential, disabled }: GoogleSignInButtonProps) {
  const slot = useRef<HTMLDivElement | null>(null);
  // The latest handler, without redrawing Google's button when it changes.
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  useEffect(() => {
    const element = slot.current;
    const clientId = GOOGLE_CLIENT_ID;
    if (!element || !clientId) return;
    let cancelled = false;
    const send = (idToken: string) => onCredentialRef.current(idToken);

    loadGoogle()
      .then((api) => {
        if (cancelled) return;
        initializeOnce(api, clientId);
        receiver = send;
        const available = element.parentElement?.clientWidth ?? MAX_WIDTH;
        element.replaceChildren();
        api.renderButton(element, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: mode === "signup" ? "signup_with" : "signin_with",
          logo_alignment: "left",
          width: Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, available))),
        });
      })
      .catch(() => {
        // Nothing to show: the email form is still there.
      });

    return () => {
      cancelled = true;
      if (receiver === send) receiver = null;
    };
  }, [mode]);

  return (
    <div
      ref={slot}
      data-testid="google-sign-in"
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        minHeight: 44,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    />
  );
}
