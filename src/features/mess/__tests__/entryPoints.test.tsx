import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { router } from "expo-router";
import { useLanguageStore } from "@/i18n";
import { isPrivatePath } from "@/lib/seo";
import { SearchTabs } from "@/components/SearchTabs";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The entry points appear only with the module switched on.
jest.mock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), MESS_ENABLED: true }));
jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/components/AreaPicker", () => ({ AreaPicker: () => null }));
jest.mock("@/components/AdvancedFiltersModal", () => ({ AdvancedFiltersModal: () => null }));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Mess & Seats entry points (MESS_ENABLED on)", () => {
  it("adds the tab after the property searches", async () => {
    await act(async () => root.render(<SearchTabs activeTab="buy" onChange={jest.fn()} />));
    const tabs = [...container.querySelectorAll('[role="tab"]')].map((tab) => tab.textContent);
    expect(tabs[tabs.length - 1]).toBe("Mess & Seats");
  });

  it("opens /mess from the hero tab instead of changing the search's intent", async () => {
    await act(async () => root.render(<HeroSearchWidget />));
    const tab = [...container.querySelectorAll('[role="tab"]')].find((el) => el.textContent === "Mess & Seats") as HTMLElement;
    await act(async () => tab.click());
    expect(router.push).toHaveBeenCalledWith("/mess");
  });

  it("keeps the wizard and the dashboard out of search results, not the search or listings", () => {
    expect(isPrivatePath("/mess/create")).toBe(true);
    expect(isPrivatePath("/mess/edit")).toBe(true);
    expect(isPrivatePath("/mess/my")).toBe(true);
    expect(isPrivatePath("/mess")).toBe(false);
    expect(isPrivatePath("/mess/abc123")).toBe(false);
  });
});
