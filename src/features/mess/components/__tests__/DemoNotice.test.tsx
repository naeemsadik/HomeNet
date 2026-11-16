import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { Linking } from "react-native";
import { useLanguageStore } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { openExternalUrl } from "@/lib/safeUrl";
import { contactLister } from "../../api/messApi";
import { ContactChannelBar } from "../ContactChannelBar";
import { DemoNotice } from "../DemoNotice";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/features/property/components/WhatsAppIcon", () => ({ WhatsAppIcon: () => null }));
jest.mock("../../api/messApi", () => ({ contactLister: jest.fn() }));
jest.mock("@/lib/safeUrl", () => ({ openExternalUrl: jest.fn(() => true) }));
// The mess pages are running on the sample listings.
jest.mock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), MESS_ENABLED: true, MESS_DEMO: true }));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };
const button = (label: string) => container.querySelector(`[aria-label="${label}"]`) as HTMLElement;

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({ user: { id: "u1", full_name: "Seeker", email: "s@example.com", avatar_url: null, email_verified: true } });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Mess & Seat Share on sample listings", () => {
  it("tells the visitor the listings are samples and that nothing posted is kept", async () => {
    await act(async () => root.render(<DemoNotice />));
    expect(container.textContent).toContain("Sample listings");
    expect(container.textContent).toContain("samples, not real");
    expect(container.textContent).toContain("nothing you post here is saved");
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it("says it in Bangla too", async () => {
    useLanguageStore.getState().setLanguage("bn");
    await act(async () => root.render(<DemoNotice />));
    expect(container.textContent).toContain("নমুনা লিস্টিং");
  });

  it.each(["Call", "WhatsApp"])("%s dials and messages nobody: there is no real person behind a sample", async (label) => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    await act(async () =>
      root.render(<ContactChannelBar listing={{ id: "m1", title: "Seat" }} channels={["phone", "whatsapp"]} verifiedOnly={false} campusName="UIU" />),
    );
    await act(async () => button(label).click());

    expect(contactLister).not.toHaveBeenCalled();
    expect(openExternalUrl).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
    expect(container.textContent).toContain("no real number to call");
    openURL.mockRestore();
  });
});
