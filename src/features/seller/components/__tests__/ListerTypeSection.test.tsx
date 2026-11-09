import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getUser, updateUser } from "@/services/userApi";
import { ListerTypeSection } from "../ListerTypeSection";

// The icon package ships ES modules Jest does not transform; every icon renders nothing here.
jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock("@/lib/alert", () => ({ notify: jest.fn(), confirmAction: jest.fn() }));
jest.mock("@/services/userApi", () => ({
  getUser: jest.fn(),
  updateUser: jest.fn(),
  uploadCompanyLogo: jest.fn(),
  deleteCompanyLogo: jest.fn(),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ListerTypeSection: two choices, company fields on demand, Save only when changed", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(async () => {
    (getUser as jest.Mock).mockResolvedValue({
      data: { id: "u1", account_type: "individual", company_name: null, company_logo_url: null },
    });
    (updateUser as jest.Mock).mockReset().mockResolvedValue({});
    useAuthStore.setState({ user: { id: "u1", full_name: "Rahim", email: "r@example.com", avatar_url: null } });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <ListerTypeSection />
        </QueryClientProvider>,
      );
    });
    // Wait until the saved profile has arrived (the choices unlock), as a person would.
    for (let i = 0; i < 50 && radio("Individual")?.getAttribute("aria-disabled") === "true"; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    useAuthStore.setState({ user: null });
  });

  const radio = (name: string) => container.querySelector(`[role="radio"][aria-label^="${name}"]`) as HTMLElement;
  const saveButton = () =>
    Array.from(container.querySelectorAll('[role="button"]')).find((el) => el.textContent === "Save changes");

  it("shows no Save button and no company fields while nothing has changed", () => {
    expect(radio("Individual").getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector('input[aria-label="Company name"]')).toBeNull();
    expect(saveButton()).toBeUndefined();
  });

  it("reveals the company fields and Save once Company is picked", async () => {
    await act(async () => radio("Company").click());

    expect(radio("Company").getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector('input[aria-label="Company name"]')).not.toBeNull();
    expect(saveButton()).toBeDefined();
  });

  it("does not save a company without a name", async () => {
    await act(async () => radio("Company").click());
    await act(async () => (saveButton() as HTMLElement).click());

    expect(updateUser).not.toHaveBeenCalled();
  });
});
