import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import MessEditRoute from "../../../../app/mess/edit";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * /mess/edit is exported with no query string. What it renders before the
 * session and the id are known is what the exported HTML shows, and it must
 * not be "Page not found" (that was every lister's first paint of Edit).
 */
jest.mock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), MESS_ENABLED: true }));
jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/screens/NotFoundScreen", () => ({ NotFoundScreen: () => <p>Page not found</p> }));
jest.mock("@/features/mess/screens/MessListingWizard", () => ({
  MessListingWizard: ({ editId }: { editId: string }) => <p>{`wizard for ${editId}`}</p>,
}));
let mockParams: { id?: string } = {};
jest.mock("expo-router", () => ({ useLocalSearchParams: () => mockParams, router: { push: jest.fn(), replace: jest.fn() } }));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  useAuthStore.setState({ hydrated: false, user: null });
});

const signedIn = () =>
  useAuthStore.setState({ hydrated: true, user: { id: "u1", full_name: "Rafi", email: "r@example.com", avatar_url: null } });

describe("/mess/edit", () => {
  it("shows the sign-in check's loading state, not Page not found, before the session is known (the exported HTML)", async () => {
    mockParams = {};
    useAuthStore.setState({ hydrated: false, user: null });
    await act(async () => root.render(<MessEditRoute />));
    expect(container.textContent).not.toContain("Page not found");
  });

  it("opens the wizard for the listing in ?id once signed in", async () => {
    mockParams = { id: "m1" };
    signedIn();
    await act(async () => root.render(<MessEditRoute />));
    expect(container.textContent).toContain("wizard for m1");
  });

  it("is not found for a signed-in lister with no id", async () => {
    mockParams = {};
    signedIn();
    await act(async () => root.render(<MessEditRoute />));
    expect(container.textContent).toContain("Page not found");
  });
});
