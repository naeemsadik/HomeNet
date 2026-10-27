import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { DrawerLanguageDropdown } from "@/components/DrawerLanguageDropdown";
import { useLanguageStore } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  ChevronDown: (props: any) => "ChevronDown",
}));

describe("DrawerLanguageDropdown (Bproperty style)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    useLanguageStore.getState().setLanguage("en");
  });

  it("renders closed trigger with ENG and UK flag initially", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<DrawerLanguageDropdown />);
    });

    expect(container.textContent).toContain("ENG");
    expect(container.textContent).toContain("ChevronDown");
    // UK flag accessible label
    expect(container.querySelector('[aria-label="UK flag"]')).toBeTruthy();
    // Dropdown list should NOT be visible
    expect(container.querySelector('[aria-label="English"]')).toBeFalsy();

    await act(async () => {
      root.unmount();
    });
  });

  it("toggles dropdown list when trigger is pressed", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<DrawerLanguageDropdown />);
    });

    const trigger = container.querySelector('[aria-label="Language selector: ENG"]');
    expect(trigger).toBeTruthy();

    // Tap trigger to expand
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Options should now be visible
    expect(container.querySelector('[aria-label="English"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Bengali"]')).toBeTruthy();
    expect(container.textContent).toContain("BEN");

    // Tap trigger again to collapse
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector('[aria-label="English"]')).toBeFalsy();

    await act(async () => {
      root.unmount();
    });
  });

  it("selects BEN, updates language immediately and collapses dropdown", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<DrawerLanguageDropdown />);
    });

    const trigger = container.querySelector('[aria-label="Language selector: ENG"]');

    // Open dropdown
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const bengaliOption = container.querySelector('[aria-label="Bengali"]');
    expect(bengaliOption).toBeTruthy();

    // Select Bengali
    await act(async () => {
      bengaliOption?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Language store should be updated to "bn"
    expect(useLanguageStore.getState().language).toBe("bn");

    // Dropdown should be collapsed
    expect(container.querySelector('[aria-label="Bengali"]')).toBeFalsy();

    // Trigger should now show BEN and Bangladesh flag
    expect(container.textContent).toContain("BEN");
    expect(container.querySelector('[aria-label="Bangladesh flag"]')).toBeTruthy();

    await act(async () => {
      root.unmount();
    });
  });

  it("renders BEN trigger and BD flag when language is Bengali", async () => {
    useLanguageStore.getState().setLanguage("bn");
    const root = createRoot(container);

    await act(async () => {
      root.render(<DrawerLanguageDropdown />);
    });

    expect(container.textContent).toContain("BEN");
    expect(container.querySelector('[aria-label="Bangladesh flag"]')).toBeTruthy();

    await act(async () => {
      root.unmount();
    });
  });
});
