import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { DrawerLanguageDropdown } from "@/components/DrawerLanguageDropdown";
import { useLanguageStore } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  ChevronDown: () => "ChevronDown",
  Globe: () => "Globe",
  Check: () => "Check",
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
    expect(container.querySelector('[role="radio"]')).toBeNull();
    await act(async () => root.unmount());
  });

  it("opens a list of both languages, each in its own script, with the current one marked", async () => {
    const root = await mount();
    await click(container.querySelector('[aria-label="Language selector: English"]'));

    const options = Array.from(container.querySelectorAll('[role="radio"]'));
    expect(options.map((o) => o.getAttribute("aria-label"))).toEqual(["English", "বাংলা"]);
    expect(options.map((o) => o.getAttribute("aria-checked"))).toEqual(["true", "false"]);
    await act(async () => root.unmount());
  });

  it("switches language at once and closes the list", async () => {
    const root = await mount();
    await click(container.querySelector('[aria-label="Language selector: English"]'));
    await click(container.querySelector('[aria-label="বাংলা"]'));

    expect(useLanguageStore.getState().language).toBe("bn");
    expect(container.querySelector('[role="radio"]')).toBeNull();
    expect(container.textContent).toContain("বাংলা");
    await act(async () => root.unmount());
  });

  it("is findable in either language: the names do not change with the language", async () => {
    useLanguageStore.getState().setLanguage("bn");
    const root = await mount();
    await click(container.querySelector('[role="button"]'));
    const labels = Array.from(container.querySelectorAll('[role="radio"]')).map((o) => o.getAttribute("aria-label"));
    expect(labels).toEqual(["English", "বাংলা"]);
    await act(async () => root.unmount());
  });
});
