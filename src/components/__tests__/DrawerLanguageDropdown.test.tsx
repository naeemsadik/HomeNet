import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { DrawerLanguageDropdown } from "@/components/DrawerLanguageDropdown";
import { useLanguageStore } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  ChevronDown: () => "ChevronDown",
  Globe: () => "Globe",
}));

describe("DrawerLanguageDropdown", () => {
  let container: HTMLDivElement;

  const mount = async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<DrawerLanguageDropdown />);
    });
    return root;
  };
  const click = (el: Element | null | undefined) =>
    act(async () => {
      el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    useLanguageStore.getState().setLanguage("en");
  });

  it("names the current language in full and shows no flag or three-letter code", async () => {
    const root = await mount();
    expect(container.textContent).toContain("English");
    expect(container.textContent).not.toMatch(/\bENG\b|\bBEN\b/);
    expect(container.querySelector('[aria-label*="flag"]')).toBeNull();
    // The list is closed until the trigger is pressed.
    expect(container.querySelector('[aria-label="বাংলা"]')).toBeNull();
    await act(async () => root.unmount());
  });

  it("offers only the other language, in its own script, and not the one already in use", async () => {
    const root = await mount();
    await click(container.querySelector('[aria-label="Language selector: English"]'));

    expect(container.querySelector('[aria-label="বাংলা"]')?.getAttribute("role")).toBe("button");
    // "English" appears once, on the trigger, and is not repeated in the list.
    expect(container.textContent?.match(/English/g)).toHaveLength(1);
    await act(async () => root.unmount());
  });

  it("switches language at once and closes the list", async () => {
    const root = await mount();
    await click(container.querySelector('[aria-label="Language selector: English"]'));
    await click(container.querySelector('[aria-label="বাংলা"]'));

    expect(useLanguageStore.getState().language).toBe("bn");
    expect(container.querySelector('[aria-label="English"]')).toBeNull();
    expect(container.textContent).toContain("বাংলা");
    await act(async () => root.unmount());
  });

  it("is findable in either language: the names do not change, and the other one is offered", async () => {
    useLanguageStore.getState().setLanguage("bn");
    const root = await mount();
    expect(container.textContent).toContain("বাংলা");
    await click(container.querySelector('[aria-expanded]'));
    expect(container.querySelector('[aria-label="English"]')).not.toBeNull();
    expect(container.textContent?.match(/বাংলা/g)).toHaveLength(1);
    await act(async () => root.unmount());
  });
});
