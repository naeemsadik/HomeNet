import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import { ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { openExternalUrl } from "@/lib/safeUrl";
import { contactLister } from "../../api/messApi";
import { isWhatsAppUrl, withWhatsAppText } from "../../hooks/useContactLister";
import { ContactChannelBar } from "../ContactChannelBar";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/features/property/components/WhatsAppIcon", () => ({ WhatsAppIcon: () => null }));
jest.mock("../../api/messApi", () => ({ contactLister: jest.fn() }));
jest.mock("@/lib/safeUrl", () => ({ openExternalUrl: jest.fn(() => true) }));

const reveal = contactLister as jest.Mock;
const LISTING = { id: "m1", title: "Seat in Badda" };

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

const button = (label: string) => container.querySelector(`[aria-label="${label}"]`) as HTMLElement;

async function render(channels: ("phone" | "whatsapp" | "in_app")[] = ["phone", "whatsapp"], verifiedOnly = false) {
  await act(async () => root.render(<ContactChannelBar listing={LISTING} channels={channels} verifiedOnly={verifiedOnly} campusName="UIU" />));
}

function signIn() {
  useAuthStore.setState({ user: { id: "u1", full_name: "Seeker", email: "s@example.com", avatar_url: null, email_verified: true } });
}

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({ user: null });
  useAuthModalStore.getState().close();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("ContactChannelBar", () => {
  it("shows the lister's channels in their order and skips in-app chat (P1)", async () => {
    await render(["whatsapp", "in_app", "phone"]);
    const labels = [...container.querySelectorAll('[role="button"]')].map((el) => el.getAttribute("aria-label"));
    expect(labels).toEqual(["WhatsApp", "Call"]);
  });

  it("asks a signed-out visitor to sign in, then reveals once they are in", async () => {
    reveal.mockResolvedValueOnce({ phone: "+8801700000001" });
    await render();
    expect(container.textContent).toContain("Free. Sign in to see the number.");
    await act(async () => button("Call").click());
    expect(reveal).not.toHaveBeenCalled();
    expect(useAuthModalStore.getState().visible).toBe(true);

    await act(async () => {
      signIn();
      useAuthModalStore.getState().onSuccess?.();
    });
    expect(reveal).toHaveBeenCalledWith("m1", "phone");
    expect(container.textContent).toContain("+8801700000001");
  });

  it("explains the rate limit and the verified-only rule", async () => {
    signIn();
    reveal.mockRejectedValueOnce(new ApiError("Too many", 429));
    await render();
    await act(async () => button("Call").click());
    expect(container.textContent).toContain("You have opened several numbers in the last hour.");

    reveal.mockRejectedValueOnce(new ApiError("Forbidden", 403));
    await act(async () => button("Call").click());
    expect(container.textContent).toContain("only takes contact from accounts with a verified email");
  });

  it("opens WhatsApp with a message naming the listing and the seeker's campus", async () => {
    signIn();
    reveal.mockResolvedValueOnce({ whatsapp_url: "https://wa.me/8801700000001" });
    await render(["whatsapp"]);
    await act(async () => button("WhatsApp").click());
    const url = (openExternalUrl as jest.Mock).mock.calls[0][0] as string;
    expect(url.startsWith("https://wa.me/8801700000001?text=")).toBe(true);
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Seat in Badda");
    expect(text).toContain("https://www.homenetbd.com/mess/m1");
    expect(text).toContain("I study at UIU.");
  });

  it("never opens a link that is not WhatsApp's", async () => {
    signIn();
    reveal.mockResolvedValueOnce({ whatsapp_url: "https://evil.example/wa.me/880" });
    await render(["whatsapp"]);
    await act(async () => button("WhatsApp").click());
    expect(openExternalUrl).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Could not get the number.");
  });
});

describe("WhatsApp link helpers", () => {
  it("accepts only https WhatsApp hosts", () => {
    expect(isWhatsAppUrl("https://wa.me/880170")).toBe(true);
    expect(isWhatsAppUrl("https://api.whatsapp.com/send?phone=880")).toBe(true);
    expect(isWhatsAppUrl("http://wa.me/880")).toBe(false);
    expect(isWhatsAppUrl("javascript:alert(1)")).toBe(false);
  });

  it("keeps a message the server already wrote", () => {
    expect(withWhatsAppText("https://wa.me/1?text=hi", "other")).toBe("https://wa.me/1?text=hi");
    expect(withWhatsAppText("https://wa.me/1", "a b")).toBe("https://wa.me/1?text=a%20b");
  });
});
