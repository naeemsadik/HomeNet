import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { InstantValuationScreen } from "@/features/valuation/screens/InstantValuationScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mockParams: Record<string, string> = {};
let mockPickArea: ((area: { id: string; name: string } | null) => void) | undefined;

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
// The page chrome, the steps and the picker are not what this is about.
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/JsonLd", () => ({ JsonLd: () => null }));
jest.mock("@/components/icons", () => ({
  ArrowRight: () => null,
  ChevronDown: () => null,
  MapPin: () => null,
}));
jest.mock("@/features/valuation/components/InstantValuationWizard", () => ({
  InstantValuationWizard: () => <div data-testid="wizard" />,
}));
jest.mock("@/components/AreaPicker", () => ({
  AreaPicker: ({ onSelect }: { onSelect: (area: { id: string; name: string } | null) => void }) => {
    mockPickArea = onSelect;
    return null;
  },
}));

describe("the valuation page", () => {
  let container: HTMLDivElement;
  let root: { render: (node: React.ReactNode) => void; unmount: () => void };

  beforeEach(() => {
    mockParams = {};
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  const render = () => act(async () => root.render(<InstantValuationScreen />));
  const button = (label: string) =>
    Array.from(container.querySelectorAll('[role="button"]')).find((el) => el.textContent?.trim() === label) as HTMLElement;
  const click = (el: HTMLElement) => act(async () => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  const wizard = () => container.querySelector('[data-testid="wizard"]');

  it("asks for the area first, and Next without one says so instead of starting", async () => {
    await render();
    expect(container.textContent).toContain("Where is your property?");
    await click(button("Next"));
    expect(container.textContent).toContain("Choose the area first.");
    expect(wizard()).toBeNull();
  });

  it("opens the steps in place of the question once an area is chosen", async () => {
    await render();
    await act(async () => mockPickArea!({ id: "a1", name: "Mirpur" }));
    expect(container.textContent).toContain("Mirpur");
    await click(button("Next"));
    expect(wizard()).not.toBeNull();
    expect(container.textContent).not.toContain("Where is your property?");
  });

  it("goes straight to the steps from a link that already carries the area", async () => {
    mockParams = { area: "Gulshan" };
    await render();
    expect(wizard()).not.toBeNull();
  });

  it("keeps every FAQ answer on the web page while closed, so the FAQ markup matches the page", async () => {
    await render();
    expect(container.textContent).toContain("One katha is 720 square feet");
  });
});
